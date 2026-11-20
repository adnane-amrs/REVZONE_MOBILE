// Rental dates are whole days handled as "YYYY-MM-DD" keys (same format as the API).

const pad = (n) => String(n).padStart(2, '0');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Local calendar day as a key (what the user sees on their phone). */
export const keyOf = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayKey = () => keyOf(new Date());

/** Key -> local Date at noon (noon avoids daylight-saving edge cases). */
export const dateOf = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d, 12);
};

export const addDays = (key, n) => {
    const d = dateOf(key);
    d.setDate(d.getDate() + n);
    return keyOf(d);
};

/** Days in a range, both ends included. */
export const daysBetween = (startKey, endKey) =>
    Math.round((dateOf(endKey) - dateOf(startKey)) / 86400000) + 1;

export const eachDayKey = (startKey, endKey) => {
    const keys = [];
    for (let k = startKey; k <= endKey; k = addDays(k, 1)) keys.push(k);
    return keys;
};

/** "12 Nov" */
export const shortDate = (key) => {
    if (!key) return '';
    const d = dateOf(key);
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** "12 – 15 Nov" or "28 Nov – 2 Dec" */
export const rangeLabel = (startKey, endKey) => {
    if (!startKey) return '';
    if (!endKey || startKey === endKey) return shortDate(startKey);
    const s = dateOf(startKey);
    const e = dateOf(endKey);
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
        return `${s.getDate()} – ${e.getDate()} ${MONTHS[e.getMonth()]}`;
    }
    return `${shortDate(startKey)} – ${shortDate(endKey)}`;
};

/** Weeks of a month for the calendar grid (Monday first). Empty cells are null. */
export const monthGrid = (year, month) => {
    const first = new Date(year, month, 1, 12);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(keyOf(new Date(year, month, d, 12)));
    while (cells.length % 7) cells.push(null);
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
};

/** Every day covered by a list of { start, end } ranges, as a Set of keys. */
export const expandRanges = (ranges = []) => {
    const set = new Set();
    ranges.forEach(r => eachDayKey(r.start, r.end).forEach(k => set.add(k)));
    return set;
};

/** "2 min ago", "3 h ago", "Yesterday", "12 Nov" */
export const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
    if (diff < 172800) return 'Yesterday';
    return shortDate(keyOf(new Date(iso)));
};

/** "14:05" */
export const clockTime = (iso) => {
    const d = new Date(iso);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** "Member since March 2025" */
export const memberSince = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
};
