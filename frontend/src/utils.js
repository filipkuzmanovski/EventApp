// Shared helpers for event display

// Map any stored bar name (old handles like "club.pure.skopje"
// or new clean names like "Pure") to a clean display name.
export function cleanBarName(name) {
    if (!name) return "";
    const n = name.toLowerCase();
    if (n.includes("pure")) return "Pure";
    if (n.includes("makka")) return "Makka";
    if (n.includes("havana")) return "Havana";
    if (n.includes("franz")) return "Franz";
    // Unknown club: strip dots and capitalize as a fallback
    return name
        .replace(/\./g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Deterministic placeholder pick (1–5) so a card always
// shows the same image across renders and page changes.
export function placeholderFor(key) {
    let hash = 0;
    const s = key || "";
    for (let i = 0; i < s.length; i++) {
        hash = (hash * 31 + s.charCodeAt(i)) | 0;
    }
    return `/images/club_image_${(Math.abs(hash) % 5) + 1}.jpg`;
}

// "2026-07-04T21:00:00Z" -> "сабота, 04.07 • 23:00"
// (manual formatting — not every browser ships Macedonian locale data)
const MK_DAYS = ["недела", "понеделник", "вторник", "среда", "четврток", "петок", "сабота"];

export function formatEventDate(iso) {
    if (!iso) return null;
    const date = new Date(iso);
    if (isNaN(date)) return null;
    const pad = (n) => String(n).padStart(2, "0");
    return `${MK_DAYS[date.getDay()]}, ${pad(date.getDate())}.${pad(date.getMonth() + 1)} • ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
