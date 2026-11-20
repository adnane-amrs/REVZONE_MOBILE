// App-wide labels and options shared by several screens

export const CURRENCY = "DH";

export const formatMoney = (amount) => {
    const n = Number(amount) || 0;
    const rounded = Number.isInteger(n) ? n : Math.round(n * 100) / 100;
    return `${rounded.toLocaleString("en-US")} ${CURRENCY}`;
};

export const CITIES = [
    "Casablanca", "Rabat", "Marrakech", "Tangier", "Fes", "Agadir", "Beni Mellal", "Meknes", "Oujda", "Essaouira"
];

export const TRANSMISSIONS = [
    { value: "automatic", label: "Automatic", icon: "git-compare-outline" },
    { value: "manual", label: "Manual", icon: "options-outline" },
];

export const FUEL_TYPES = [
    { value: "petrol", label: "Petrol", icon: "flame-outline" },
    { value: "diesel", label: "Diesel", icon: "water-outline" },
    { value: "hybrid", label: "Hybrid", icon: "leaf-outline" },
    { value: "electric", label: "Electric", icon: "flash-outline" },
];

export const FEATURES = [
    { value: "ac", label: "Air conditioning", icon: "snow-outline" },
    { value: "gps", label: "GPS", icon: "navigate-outline" },
    { value: "bluetooth", label: "Bluetooth", icon: "bluetooth-outline" },
    { value: "usb", label: "USB charging", icon: "battery-charging-outline" },
    { value: "backup_camera", label: "Backup camera", icon: "videocam-outline" },
    { value: "sunroof", label: "Sunroof", icon: "sunny-outline" },
    { value: "child_seat", label: "Child seat", icon: "happy-outline" },
    { value: "cruise_control", label: "Cruise control", icon: "speedometer-outline" },
    { value: "apple_carplay", label: "Apple CarPlay", icon: "logo-apple" },
    { value: "android_auto", label: "Android Auto", icon: "logo-android" },
    { value: "heated_seats", label: "Heated seats", icon: "thermometer-outline" },
    { value: "keyless_entry", label: "Keyless entry", icon: "key-outline" },
];

export const SORTS = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
    { value: "rating", label: "Top rated" },
];

export const labelOf = (list, value) => list.find(i => i.value === value)?.label || value;
export const iconOf = (list, value) => list.find(i => i.value === value)?.icon || "ellipse-outline";

export const BOOKING_STATUS = {
    pending: { label: "Pending", color: "#F59E0B", icon: "time-outline" },
    accepted: { label: "Confirmed", color: "#0EA5E9", icon: "checkmark-circle-outline" },
    active: { label: "On trip", color: "#65A30D", icon: "car-sport-outline" },
    completed: { label: "Completed", color: "#16A34A", icon: "flag-outline" },
    declined: { label: "Declined", color: "#E5484D", icon: "close-circle-outline" },
    cancelled: { label: "Cancelled", color: "#879195", icon: "ban-outline" },
};
