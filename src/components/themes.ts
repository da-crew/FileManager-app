import { StatusBarStyle } from "react-native";

export function invertHexColor(hex: string): string {
    // Remove the '#' if it exists
    hex = hex.replace('#', '');

    // Parse the hex color to an integer
    const intColor = parseInt(hex, 16);

    // Invert the color by XORing with 0xFFFFFF
    const invertedColor = 0xFFFFFF ^ intColor;

    // Convert the inverted color back to hex and pad with leading zeros if necessary
    return `#${invertedColor.toString(16).padStart(6, '0')}`;
}

export type ThemeConfig = {
    statusBarStyle: StatusBarStyle | null | undefined;
    background: string,               // Main background
    text: string,                     // Primary text color
    textSecondary: string,            // Secondary text color (for less important text)
    primary: string,                  // Primary color (for buttons or highlights)
    card: string,                     // Card background color (used in cards, buttons)
    border: string,                   // Border color
    barStyle: string,            // Status bar style ('dark-content' or 'light-content')
    iconColor: string,                // Icon color in light theme
    buttonBackground: string,         // Button background color
    buttonText: string,               // Button text color
    inputBackground: string,          // Input field background color
    inputText: string,                // Input text color
    toolbarColor: string,
}

export enum ThemeName {
    LIGHT,
    DARK
}



export const LIGHT_THEME: ThemeConfig = {
    background: "#F2F2F7", // Main background
    text: "#000000", // Primary text color
    textSecondary: "#8E8E93", // Secondary text color (for less important text)
    primary: "#1C1C1E", // Primary color (for buttons or highlights)
    card: "#FFFFFF", // Card background color (used in cards, buttons)
    border: "#24242a", // Border color
    barStyle: "#1C1C1E", // Status bar style ('dark-content' or 'light-content')
    iconColor: "#1C1C1E", // Icon color in light theme
    buttonBackground: "#007AFF", // Button background color
    buttonText: "#FFFFFF", // Button text color
    inputBackground: "#FFFFFF", // Input field background color
    inputText: "#000000", // Input text color
    toolbarColor: "#d9d9d9",
    statusBarStyle: undefined
};


export const DARK_THEME: ThemeConfig = {
    background: "#1C1C1E", // Main background
    text: "#FFFFFF", // Primary text color
    textSecondary: "#F2F2F7", // Secondary text color (for less important text)
    primary: "#F2F2F7", // Primary color (for buttons or highlights)
    card: "#2C2C2E", // Card background color (used in cards, buttons)
    border: "#E5E5EA", // Border color
    barStyle: "#F2F2F7", // Status bar style ('dark-content' or 'light-content')
    iconColor: "#F2F2F7", // Icon color in dark theme
    buttonBackground: "#24242A", // Button background color
    buttonText: "#FFFFFF", // Button text color
    inputBackground: "#2C2C2E", // Input field background color
    inputText: "#FFFFFF", // Input text color
    toolbarColor: "#4D4D4D",
    statusBarStyle: undefined
};

export const GLOBAL_THEME: Map<ThemeName, ThemeConfig> = new Map([
    [ThemeName.LIGHT, LIGHT_THEME],
    [ThemeName.DARK, DARK_THEME],
]);