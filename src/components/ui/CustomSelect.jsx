import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const CustomSelect = ({ options, value, onChange, placeholder = "Select...", disabled = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative h-full ${className}`} ref={containerRef}>
      <div 
        className={`w-full h-full min-h-[42px] px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-xl shadow-sm flex items-center justify-between transition-all ${disabled ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800' : 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500'} ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500 dark:border-blue-500' : 'border-slate-200 dark:border-slate-800'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
           if(e.key === 'Enter' || e.key === ' ') {
               e.preventDefault();
               !disabled && setIsOpen(!isOpen);
           }
        }}
      >
        <span className={`block truncate text-sm ${selectedOption ? 'font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg py-1.5 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">No options available</div>
          ) : (
            options.map((opt) => (
              <div 
                key={opt.value}
                className={`px-4 py-2 text-sm transition-colors ${opt.disabled ? 'opacity-40 cursor-not-allowed text-slate-500' : 'cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'} ${opt.value === value ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium' : ''}`}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
