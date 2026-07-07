"""
Kadevecer.online scraper — nightlife events + artists.

The site is server-rendered and embeds schema.org JSON-LD on every event
page, so scraping is: sitemap -> event pages -> JSON-LD -> performer pages.
Scrapes politely (1 request/second, honest User-Agent) and links every
record back to its kadevecer.online source URL.
"""

import html
import json
import re
import time
from datetime import datetime, timezone

import requests

# ============================================
# CONFIGURATION
# ============================================

BASE_URL = "https://www.kadevecer.online"
SITEMAP_URL = f"{BASE_URL}/sitemap.xml"
BACKEND_SYNC_URL = "http://localhost:8080/api/kadevecer/sync"

RATE_LIMIT_SECONDS = 1.0  # be polite — 1 request per second

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) EventAppScraper/1.0 (student project)"
}

# The site's own social accounts appear on every page — never
# attribute them to an artist.
SITE_OWN_SOCIALS = ("kadevecer", "kadeveceronline", "UC_SADhgfP7rt1knEkLu53oA")

# Placeholder "artist" pages that aren't real performers
GENERIC_ARTIST_NAMES = {
    "live concert", "cabaret show", "live music", "live dj",
    "standup", "фестивал", "festival", "dj", "band",
}

_last_request_at = 0.0


def polite_get(url):
    """GET with a global 1 req/s rate limit."""
    global _last_request_at
    wait = RATE_LIMIT_SECONDS - (time.time() - _last_request_at)
    if wait > 0:
        time.sleep(wait)
    _last_request_at = time.time()
    return requests.get(url, headers=HEADERS, timeout=20)


# ============================================
# STEP 1 — Discover event URLs from the sitemap
# ============================================

def discover_event_urls():
    response = polite_get(SITEMAP_URL)
    urls = re.findall(r"<loc>\s*(.*?)\s*</loc>", response.text)
    event_urls = [u for u in urls if "/events/" in u]
    print(f"🗺  Sitemap: {len(event_urls)} event pages found")
    return event_urls


# ============================================
# STEP 2 — Parse the JSON-LD block on an event page
# ============================================

def extract_event_json_ld(page_html):
    for block in re.findall(
        r'<script type="application/ld\+json">(.*?)</script>',
        page_html,
        re.DOTALL,
    ):
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        candidates = data if isinstance(data, list) else [data]
        for item in candidates:
            if isinstance(item, dict) and item.get("@type") == "Event":
                return item
    return None


def parse_event(url):
    response = polite_get(url)
    ld = extract_event_json_ld(response.text)
    if not ld:
        print(f"   ⚠️  No JSON-LD on {url}")
        return None

    start_date = ld.get("startDate")
    images = ld.get("image") or []
    performers = ld.get("performer") or []
    if isinstance(performers, dict):
        performers = [performers]

    location = ld.get("location") or {}
    venue = location.get("name") or (ld.get("organizer") or {}).get("name")

    # Address can be a plain string or a schema.org PostalAddress object
    address = location.get("address")
    if isinstance(address, dict):
        address = address.get("streetAddress") or address.get("name")

    return {
        "bar": venue,
        "post_url": url,
        "caption": html.unescape(ld.get("description") or ld.get("name") or ""),
        "image_url": images[0] if images else None,
        "event_date": start_date,
        "address": html.unescape(address) if address else None,
        "artist_urls": [p.get("url") for p in performers if p.get("url")],
    }


# ============================================
# STEP 3 — Scrape an artist page (name, role, photo, socials)
# ============================================

def meta_content(page_html, prop):
    match = re.search(
        rf'(?:property|name)="{re.escape(prop)}" content="([^"]*)"', page_html
    ) or re.search(
        rf'content="([^"]*)" (?:property|name)="{re.escape(prop)}"', page_html
    )
    return html.unescape(match.group(1)) if match else None


def first_social(page_html, domain):
    for url in re.findall(rf'href="(https://(?:www\.)?{domain}[^"]*)"', page_html):
        if not any(own in url for own in SITE_OWN_SOCIALS):
            return url
    return None


def scrape_artist(url):
    slug = url.rstrip("/").split("/artists/")[-1]
    response = polite_get(url)
    page = response.text

    # og:title looks like: "Antonia Gigovska | Пејач/ка for Skopje Nightlife & Events"
    og_title = meta_content(page, "og:title") or ""
    name, role = None, None
    if "|" in og_title:
        name = og_title.split("|")[0].strip()
        role_part = og_title.split("|", 1)[1]
        role = role_part.split(" for ")[0].strip() or None
    if not name:
        name = slug.replace("-", " ").title()

    # Prefer the profile image over generic og:image
    img_match = re.search(r'class="client-profile-img[^"]*" src="([^"]+)"', page)
    image_url = img_match.group(1) if img_match else meta_content(page, "og:image")
    # The site's branded og:image means "no real photo" — drop it so the
    # frontend can show its own fallback instead
    if image_url and "/assets/ogimage" in image_url:
        image_url = None

    return {
        "slug": slug,
        "name": name,
        "role": role,
        "image_url": image_url,
        "instagram": first_social(page, "instagram.com"),
        "facebook": first_social(page, "facebook.com"),
        "youtube": first_social(page, "youtube.com"),
        "kadevecer_url": url,
    }


# ============================================
# MAIN — scrape everything, keep upcoming events
# ============================================

def parse_iso(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def run_scraper():
    events = []
    artists_by_url = {}
    now = datetime.now(timezone.utc)

    for url in discover_event_urls():
        event = parse_event(url)
        if not event:
            continue

        # Keep only upcoming events (or ones with no parseable date)
        starts = parse_iso(event["event_date"])
        if starts and starts < now:
            print(f"   🗓  Past event, skipping: {url.split('/events/')[-1]}")
            continue

        # Resolve performers, deduplicated across events
        slugs = []
        for artist_url in event.pop("artist_urls"):
            if artist_url not in artists_by_url:
                artist = scrape_artist(artist_url)
                # Skip placeholder pages like "Live Music" / "Cabaret show"
                if artist["name"].lower() in GENERIC_ARTIST_NAMES:
                    artists_by_url[artist_url] = None
                else:
                    artists_by_url[artist_url] = artist
                    print(f"   🎤 Artist: {artist['name']}")
            if artists_by_url[artist_url]:
                slugs.append(artists_by_url[artist_url]["slug"])
        event["artist_slugs"] = slugs

        events.append(event)
        print(f"   ✅ {event['bar']}: {event['caption'][:60]}...")

    return events, [a for a in artists_by_url.values() if a]


if __name__ == "__main__":
    print("🌃 Kadevecer scraper starting...\n")
    events, artists = run_scraper()
    print(f"\n✅ Done! {len(events)} upcoming events, {len(artists)} artists.")

    payload = {"events": events, "artists": artists}
    with open("kadevecer_data.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print("💾 Saved to kadevecer_data.json")

    try:
        response = requests.post(BACKEND_SYNC_URL, json=payload, timeout=30)
        if response.status_code in (200, 201):
            print(f"🚀 Synced {len(events)} events + {len(artists)} artists to the backend")
        else:
            print(f"Failed! Status Code: {response.status_code}, Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("⚠️  Backend not reachable at localhost:8080 — data saved to file only.")
