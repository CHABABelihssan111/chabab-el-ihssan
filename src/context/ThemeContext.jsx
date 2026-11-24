import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme || 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Transition douce entre clair et sombre + éclat doré discret en passant au sombre.
    const toggleTheme = () => {
        const root = window.document.documentElement;
        const next = theme === 'light' ? 'dark' : 'light';
        if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            root.classList.add('theme-anim');
            setTimeout(() => root.classList.remove('theme-anim'), 800);
            if (next === 'dark') {
                const f = document.createElement('div');
                f.className = 'theme-flash';
                f.addEventListener('animationend', () => f.remove());
                document.body.appendChild(f);
            }
        }
        setTheme(next);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
