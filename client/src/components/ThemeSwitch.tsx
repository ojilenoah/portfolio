import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';

export default function ThemeSwitch() {
  // Default to dark theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // On component mount, check for saved theme or set dark as default
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply theme to document and state
    applyTheme(savedTheme as 'dark' | 'light');
    setTheme(savedTheme as 'dark' | 'light');
  }, []);

  // Apply theme to document and optionally save to localStorage
  const applyTheme = (newTheme: 'dark' | 'light', saveToStorage = true) => {
    // Set the data-theme attribute on html element
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save to localStorage if needed
    if (saveToStorage) {
      localStorage.setItem('theme', newTheme);
    }
    
    // Force body to update its styles
    document.body.className = newTheme === 'dark' 
      ? 'bg-dark text-white' 
      : 'bg-light text-dark-gray';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
    
    // Force a redraw of the page
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  };

  return (
    <button 
      onClick={toggleTheme}
      className={`
        w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-md theme-switcher-glow
        ${theme === 'dark' 
          ? 'border border-white/10 bg-black/40 hover:border-accent/40' 
          : 'border border-accent-light/20 bg-white/40 hover:border-accent-light/40'
        }
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <SunIcon size={18} className="text-accent animate-glow" />
      ) : (
        <MoonIcon size={18} className="text-accent-light" />
      )}
    </button>
  );
}