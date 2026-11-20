// Design tokens, in a light and a dark version.
//
// `theme` is one shared object: applyPalette() swaps its values, and the root layout
// re-mounts the screens so every component re-reads them. Components read theme.x while
// rendering, so never copy a theme value into a module-level constant (wrap it in a function).
//
// Palette: lime + black (the original RevZone look), in a light and a dark version.
// Lime fills buttons, pills and badges in both versions, always with black text on it.
// On white, lime is too light for text, so small accent text/icons use a dark olive (accentDeep).

const shared = {
    onInk: "#FFFFFF",      // text and icons on dark headers, highlight cards and photos
    onInkMuted: "#A1A1AA", // secondary text on those dark areas
    star: "#F5A524",       // ratings
    accent: "#D4F34A",     // lime: buttons, active tab, selections, badges
    accentLight: "#D4F34A", // accent placed on the dark headers and highlight cards
    onAccent: "#0E0E10",   // text on lime
    onAccentMuted: "#4A5418",
    // Status colors are the same in both versions
    danger: "#FF5D5D",
    warning: "#F59E0B",
    success: "#16A34A",
    info: "#3B82F6",
};

export const palettes = {
    light: {
        ...shared,
        canvas: "#F0F0F2",     // screen background (light gray, like the reference)
        paper: "#FFFFFF",      // cards, sheets, inputs
        surface: "#FFFFFF",    // cards on the canvas
        surface2: "#E8E8EC",   // chips, icon circles, skeletons
        surface3: "#D9D9DF",   // handles, empty stars, strong dividers
        line: "#E3E3E8",       // borders
        faint: "#C2C2C9",      // disabled text (past calendar days)

        accentSoft: "#F1FBCB", // pale lime behind accent icons/badges
        accentDeep: "#4F6B00", // readable olive for small accent text/icons on white
        iconBg: "#0E0E10",     // round icon backgrounds (menu rows, specs, empty states)
        iconFg: "#D4F34A",     // icon drawn on iconBg

        ink: "#0E0E10",        // dark headers, tab bar and highlight cards
        inkSoft: "#26262B",    // raised elements on those dark areas

        text: "#0E0E10",
        textSoft: "#4A4A52",
        muted: "#8B8B93",
        warningText: "#B45309", // warning label text on a pale warning background
    },
    dark: {
        ...shared,
        canvas: "#0E0E10",
        paper: "#1A1A1D",
        surface: "#1A1A1D",
        surface2: "#26262B",
        surface3: "#34343A",
        line: "#2E2E34",
        faint: "#47474E",

        accentSoft: "#2A3013",
        accentDeep: "#D4F34A", // lime reads well as text on dark
        iconBg: "#2A3013",
        iconFg: "#D4F34A",

        ink: "#1F1F23",
        inkSoft: "#2E2E34",

        text: "#F5F5F7",
        textSoft: "#B9B9C0",
        muted: "#8B8B93",
        warningText: "#FBBF24",
    },
};

export const theme = { ...palettes.light, mode: 'light' };

/** Switch every theme value to the light or dark palette. */
export const applyPalette = (mode) => {
    Object.assign(theme, palettes[mode] || palettes.light, { mode: mode === 'dark' ? 'dark' : 'light' });
};

/** Status bar icon style for screens drawn on the canvas. */
export const statusBarStyle = () => (theme.mode === 'dark' ? 'light' : 'dark');

export const fonts = {
    regular: "PlusJakartaSans-Regular",
    medium: "PlusJakartaSans-Medium",
    semibold: "PlusJakartaSans-SemiBold",
    bold: "PlusJakartaSans-Bold",
    extrabold: "PlusJakartaSans-ExtraBold",
};

export const springs = {
    press: { damping: 15, stiffness: 300, mass: 0.6 },
    gentle: { damping: 18, stiffness: 160 },
};

// Floating tab bar height + bottom margin: screens pad their content by this much
export const TAB_BAR_SPACE = 110;
