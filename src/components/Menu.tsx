import React, { useState } from 'react';
import { Menu as MenuIcon, RotateCcw, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

interface MenuProps {
  onReset: () => void;
}

export function Menu({ onReset }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleDarkMode } = useDarkMode();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all grades? This action cannot be undone.')) {
      onReset();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Menu"
      >
        <MenuIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-20">
            <div className="py-1">
              <button
                onClick={() => {
                  toggleDarkMode();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Grades
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}