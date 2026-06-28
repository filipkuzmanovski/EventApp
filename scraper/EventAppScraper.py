import os
import re

import requests
import json
import time
from dotenv import load_dotenv
from datetime import datetime, timedelta

# ============================================
# CONFIGURATION
# ============================================

load_dotenv()
API_KEY  = os.getenv("RAPIDAPI_KEY")
API_HOST = "instagram-scraper-stable-api.p.rapidapi.com"

BARS_TO_TRACK = [
    "https://www.instagram.com/club.pure.skopje/",
    "https://www.instagram.com/makka.bar/",
    "https://www.instagram.com/havana.summer.club/?hl=en",
    "https://www.instagram.com/franz.freewifi/"
]

# Posts older than this many days are ignored
MAX_POST_AGE_DAYS = 14

DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


EVENT_KEYWORDS = [
    "party", "event", "live", "dj", "nastap", "zabava",
    "vikend", "weekend", "rezervacija", "rezervacii",
    "ticket", "ulaz", "entry", "open bar", "ladies night",
    "this friday", "this saturday", "agenda",
    "резервации", "резервација",
]

# Headers are the same for every single request
HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded",
    "x-rapidapi-host": API_HOST,
    "x-rapidapi-key": API_KEY
}

# ============================================
# STEP 1 — Get list of recent posts from a bar
# Uses the "User Posts" endpoint we just found
# ============================================

def get_user_posts(instagram_url, amount=12):

    url = f"https://{API_HOST}/get_ig_user_posts.php"

    payload = {
        "username_or_url": instagram_url,
        "amount": str(amount),
        "pagination_token": ""
    }

    response = requests.post(url, headers=HEADERS, data=payload)
    data = response.json()

    print("RAW RESPONSE: ",json.dumps(data, indent=2))

    posts = []
    try:
        # FIXED: it's data["posts"] not data["data"]["edges"]
        edges = data["posts"]
        for edge in edges:
            node = edge["node"]
            code = node.get("code")
            caption = None
            date = None

            unix_date = None
            if node.get("caption"):
                caption = node["caption"].get("text")
                unix_date = node["caption"].get("created_at")
            # Fall back to the post-level timestamp if the caption had none
            if unix_date is None:
                unix_date = node.get("taken_at")
            if unix_date:
                date = datetime.fromtimestamp(unix_date)

            if code:
                posts.append({
                    "code": code,
                    "caption": caption,
                    "date": date
                })
    except (KeyError, TypeError) as e:
        print(f"  ⚠️  Could not parse posts for {instagram_url} — {e}")

    return posts

# ============================================
# STEP 2A — Get caption from a regular post
# Uses "Detailed Media Data v2" endpoint
# ============================================

def get_post_caption(media_code):
    """
    Sends a GET request using the media_code (e.g. DLUWkieNc0u).
    Returns the caption text or None if not found.
    """
    url = f"https://{API_HOST}/get_media_data_v2.php"

    params = {"media_code": media_code}

    response = requests.get(url, headers=HEADERS, params=params)
    data = response.json()

    try:
        return data["data"]["caption"]["text"]
    except (KeyError, TypeError):
        return None


# ============================================
# STEP 2B — Get caption from a Reel
# Uses "Get Reel Title/Description" endpoint
# ============================================

def get_reel_caption(media_code):
    """
    Sends a GET request using the full Instagram post URL.
    Returns the caption text or None if not found.
    """
    url = f"https://{API_HOST}/get_reel_title.php"

    params = {
        "reel_post_code_or_url": f"https://www.instagram.com/p/{media_code}/",
        "type": "reel"
    }

    response = requests.get(url, headers=HEADERS, params=params)
    data = response.json()

    try:
        return data["title"]
    except (KeyError, TypeError):
        return None


# ============================================
# STEP 3 — Check if caption mentions an event
# ============================================

def is_event_post(caption):
    if not caption:
        return False

    caption_lower = caption.lower()

    # Check regular keywords
    if any(keyword in caption_lower for keyword in EVENT_KEYWORDS):
        return True

    # Check for day names (catches "SATURDAY 21.03", "FRIDAY 20.03")
    if any(day in caption_lower for day in DAY_NAMES):
        return True

    # Check for date pattern like 21.03 or 21.03.2026
    if re.search(r'\d{1,2}\.\d{2}', caption):
        return True

    return False
# ============================================
# MAIN SCRAPER — ties everything together
# ============================================

def run_scraper():
    all_events = []
    cutoff = datetime.now() - timedelta(days=MAX_POST_AGE_DAYS)

    for bar_url in BARS_TO_TRACK:
        # Strip trailing slash and any query string (e.g. "?hl=en")
        bar_name = bar_url.split("instagram.com/")[1].split("?")[0].strip("/")
        print(f"\n📍 Scraping @{bar_name}...")

        posts = get_user_posts(bar_url, amount=12)
        print(f"   Found {len(posts)} recent posts")

        for post in posts:
            code = post["code"]
            # Use caption already in the response — no extra API call needed!
            caption = post["caption"]
            date = post["date"]

            # Only call the reel endpoint if caption is missing
            if not caption:
                caption = get_reel_caption(code)

            # Skip anything older than the cutoff (keep posts with unknown dates)
            if date and date < cutoff:
                print(f"   🗓  Older than {MAX_POST_AGE_DAYS} days, skipping")
                continue

            if is_event_post(caption):
                event = {
                    "bar": bar_name,
                    "post_url": f"https://www.instagram.com/p/{code}/",
                    "caption": caption,
                    "date": date.isoformat() if date else None
                }
                all_events.append(event)
                print(f"   ✅ Event: {caption[:80]}...")
            else:
                print(f"   ⏭  Not an event, skipping")

            time.sleep(0.5)

    return all_events

# ============================================
# RUN IT
# ============================================

if __name__ == "__main__":
    print("🎉 Skopje Events Scraper starting...\n")

    events = run_scraper()
    print(f"\n✅ Done! Found {len(events)} events from the last {MAX_POST_AGE_DAYS} days.")

    # Overwrite events.json with the fresh scrape
    with open("events.json", "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
    print("💾 Saved to events.json")

    url = "http://localhost:8080/api/events"
    try:
        response = requests.post(url, json=events)
        if response.status_code in (200, 201):
            print(f"Successfully sent {len(events)} events to the database")
        else:
            print(f"Failed! Status Code: {response.status_code}, Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("⚠️  Could not reach the backend at localhost:8080 — events saved to file only.")