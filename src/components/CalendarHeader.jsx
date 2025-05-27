import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Search, X } from 'lucide-react';
import { Button } from './ui/Button';
import { SearchResults } from './SearchResults';
import { ViewSelector } from './ui/ViewSelector';
import { format, parse } from 'date-fns';
import { DatePicker } from './ui/DatePicker';

export const CalendarHeader = ({
  monthYearString,
  onPrevMonth,
  onNextMonth,
  onAddEvent,
  onSearch,
  onShowAgenda,
  currentView,
  onViewChange,
  searchResults = [],
  onEventClick,
  currentDate,
  onDateSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch?.('');
    setIsSearchFocused(false);
  };

  const handleDatePickerChange = (date) => {
    onDateSelect(date);
    setIsDatePickerOpen(false);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center space-x-2">
            <Button
              onClick={() => setIsDatePickerOpen((open) => !open)}
              variant="ghost"
              className="p-1 hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-600 dark:text-white rounded-full"
              aria-label="Pick a date"
            >
              <Calendar className="w-5 h-5" />
            </Button>
            {isDatePickerOpen && (
              <div className="absolute z-50 mt-2 left-0">
                <DatePicker
                  selected={currentDate}
                  onChange={handleDatePickerChange}
                  onBlur={() => setIsDatePickerOpen(false)}
                />
              </div>
            )}
            <h2
              className="text-xl font-semibold text-gray-900 dark:text-dark-primary select-none"
            >
              {monthYearString}
            </h2>
          </div>
          {currentView === 'month' && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={onPrevMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-600 dark:text-white rounded-full"
                variant="ghost"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={onNextMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-600 dark:text-white rounded-full"
                variant="ghost"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search events..."
                className="w-64 pl-10 pr-8 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {isSearchFocused && searchResults.length > 0 && (
              <SearchResults
                results={searchResults}
                onEventClick={onEventClick}
                onClose={() => setIsSearchFocused(false)}
              />
            )}
          </div>

          <ViewSelector 
            currentView={currentView} 
            onViewChange={onViewChange} 
            className="ml-2"
          />

          <Button
            onClick={onShowAgenda}
            variant="outline"
            className="flex items-center space-x-2 bg-white dark:bg-dark-primary text-gray-700 dark:text-white border border-gray-300 dark:border-dark-border shadow-sm hover:bg-blue-100 dark:hover:bg-blue-800/60 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda</span>
          </Button>

          <Button
            onClick={onAddEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg fixed bottom-6 right-6 z-10"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};