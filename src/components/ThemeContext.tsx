import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_THEME, DARK_THEME, ThemeConfig } from './themes';

export interface ThemeContextType {
    isDarkMode: boolean;
    changeTheme: (darkmode: boolean) => void;
    theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('isDarkMode');
                if (storedTheme !== null) {
                    setIsDarkMode(JSON.parse(storedTheme));
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };
        loadTheme();
    }, []);

    const changeTheme = async (darkmode: boolean) => {
        try {
            setIsDarkMode(darkmode);
            await AsyncStorage.setItem('isDarkMode', JSON.stringify(darkmode));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, changeTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};