import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  className = '', 
  name, 
  placeholder = 'Select an option' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find the selected option to display its label
  // options can be an array of strings or an array of objects like { label, value }
  const selectedOption = options.find(o => (typeof o === 'string' ? o : o.value) === value);
  const displayLabel = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label) 
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div 
        className="flex h-full w-full cursor-pointer items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-4">{displayLabel}</span>
        <span 
          className="material-symbols-outlined text-secondary transition-transform duration-200 shrink-0" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </div>
      
      {name && <input type="hidden" name={name} value={value || ''} />}

      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-[fade-in_0.15s_ease-out]">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt, idx) => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const isSelected = value === optValue;
              
              return (
                <div
                  key={`${optValue}-${idx}`}
                  className={`cursor-pointer px-5 py-3 transition-colors hover:bg-primary/5 ${
                    isSelected ? 'bg-primary/10 font-bold text-primary' : 'text-on-surface'
                  }`}
                  onClick={() => {
                    if (onChange) {
                      // Pass a mock event object to mimic native select behavior
                      onChange({ target: { value: optValue, name } });
                    }
                    setIsOpen(false);
                  }}
                >
                  {optLabel}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
