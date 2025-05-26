import React from 'react';
import { format, addMonths, startOfMonth } from 'date-fns';
import { DayCell } from './DayCell';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MonthTabs = ({ currentMonth, onMonthSelect }) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = addMonths(startOfMonth(currentMonth), i - 6);
    return {
      label: format(date, 'MMM yyyy'),
      value: format(date, 'yyyy-MM-dd'),
      date
    };
  });

  return (
    <div className="flex space-x-1 overflow-x-auto py-2 px-1 bg-gray-50 dark:bg-dark-primary border-t dark:border-dark-border">
      {months.map((month) => (
        <button
          key={month.value}
          onClick={() => onMonthSelect(month.date)}
          className={`
            px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors
            ${format(currentMonth, 'MMM yyyy') === month.label
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'}
          `}
        >
          {month.label}
        </button>
      ))}
    </div>
  );
};

export const CalendarGrid = ({
  weeks,
  onDayClick,
  onEventClick,
  currentMonth,
  onMonthSelect
}) => {
  return (
    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow overflow-hidden transition-colors duration-200 flex flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b dark:border-dark-border">
        {WEEKDAYS.map((day) => (
          <div 
            key={day}
            className="py-2 text-center text-sm font-medium text-gray-700 dark:text-dark-primary"
          >
            {day}
          </div>
        ))}
      </div>
            
      {/* Calendar grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day) => (
              <DayCell
                key={format(day.date, 'yyyy-MM-dd')}
                day={day}
                onClick={() => onDayClick(day.date)}
                onEventClick={onEventClick}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Month tabs */}
      <MonthTabs currentMonth={currentMonth} onMonthSelect={onMonthSelect} />
    </div>
  );
};