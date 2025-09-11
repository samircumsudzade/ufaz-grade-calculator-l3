import React, { useState } from 'react';
import { Menu as MenuIcon, RotateCcw } from 'lucide-react';

interface MenuProps {
  onReset: () => void;
}

export function Menu({ onReset }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);

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
        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Menu"
      >
        <MenuIcon className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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