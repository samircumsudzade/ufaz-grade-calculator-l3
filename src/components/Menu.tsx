import React, { useState } from 'react';
import { Menu as MenuIcon, RotateCcw, ChevronRight, ChevronDown } from 'lucide-react';
import { ResetModal } from './ResetModal';

interface MenuProps {
  onReset: () => void;
}

export function Menu({ onReset }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSemesterSubmenu, setShowSemesterSubmenu] = useState(false);

  const handleReset = () => {
    setShowResetModal(true);
    setIsOpen(false);
  };

  const handleConfirmReset = () => {
    onReset();
  };

  return (
    <>
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
                onClick={() => {
                  setShowSemesterSubmenu(!showSemesterSubmenu);
                }}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>Semester</span>
                {showSemesterSubmenu ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {showSemesterSubmenu && (
                <div className="ml-4 border-l border-gray-200">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                    L3S1 (Current)
                  </button>
                  <button 
                    disabled
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                  >
                    L3S2 (Coming Soon)
                  </button>
                </div>
              )}
              
              <div className="border-t border-gray-200 mt-1 pt-1">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Grades
              </button>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
      
      <ResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
      />
    </>
  );
}