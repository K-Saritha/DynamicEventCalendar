import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "./Button";

export const ViewSelector = ({ currentView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const views = [
    { id: "month", label: "Month View" },
    { id: "week", label: "Week View" },
    { id: "day", label: "Day View" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewSelect = (viewId) => {
    onViewChange(viewId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center space-x-2 bg-white dark:bg-dark-secondary text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-dark-hover"
      >
        <Calendar className="w-4 h-4" />
        <span className="capitalize">{currentView} View</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-dark-secondary ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => handleViewSelect(view.id)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  currentView === view.id
                    ? "bg-gray-100 dark:bg-dark-hover text-gray-900 dark:text-dark-primary"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover"
                }`}
                role="menuitem"
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
