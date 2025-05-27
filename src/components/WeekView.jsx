import React from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, parseISO, isSameDay, setHours, setMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { useDroppable } from '@dnd-kit/core';
import { EventItem } from './EventItem';

export const WeekView = ({ currentDate, events, onEventClick, onDateChange, onDayClick }) => {
  // Get the start of the week
  const weekStart = startOfWeek(currentDate);
  
  // Generate array of 7 days
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Generate time slots (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const handlePrevWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(currentDate, 1);
    onDateChange(newDate);
  };

  // Get events for a specific day
  const getEventsForDay = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return events[dateKey] || [];
  };

  // Get events for a specific hour on a specific day
  const getEventsForHour = (day, hour) => {
    return getEventsForDay(day).filter(event => {
      const eventDate = parseISO(event.datetime);
      return eventDate.getHours() === hour;
    });
  };

  const handleHourClick = (date, hour) => {
    const selectedDateTime = setMinutes(setHours(date, hour), 0);
    onDayClick(selectedDateTime);
  };

  return (
    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b dark:border-dark-border">
        <div className="p-2 border-r dark:border-dark-border flex items-center justify-between">
          <Button
            onClick={handlePrevWeek}
            variant="ghost"
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-600 dark:text-white rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleNextWeek}
            variant="ghost"
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-600 dark:text-white rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        {days.map((day, index) => (
          <div
            key={index}
            className={`p-2 text-center border-r dark:border-dark-border last:border-r-0 ${
              isSameDay(day, currentDate) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-dark-primary">
              {format(day, 'EEE')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {format(day, 'MMM d')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-8 h-[calc(100vh-200px)] overflow-y-auto">
        {/* Time labels */}
        <div className="border-r dark:border-dark-border">
          {timeSlots.map((hour) => (
            <div
              key={hour}
              className="h-24 border-b dark:border-dark-border last:border-b-0 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center"
            >
              {format(new Date().setHours(hour), 'HH:00')}
            </div>
          ))}
        </div>

        {/* Days columns */}
        {days.map((day, dayIndex) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          
          return (
            <div key={dayIndex} className="relative border-r dark:border-dark-border last:border-r-0">
              {timeSlots.map((hour) => {
                const hourEvents = getEventsForHour(day, hour);
                const { setNodeRef } = useDroppable({
                  id: `droppable-${dateKey}-${hour}`,
                  data: {
                    dateKey,
                    hour
                  },
                });

                return (
                  <div
                    key={hour}
                    ref={setNodeRef}
                    onClick={() => handleHourClick(day, hour)}
                    className="h-24 border-b dark:border-dark-border last:border-b-0 px-1 relative hover:bg-gray-50 dark:hover:bg-dark-hover/50 cursor-pointer"
                  >
                    <div className="flex flex-col gap-1 w-full">
                      {hourEvents.map((event) => (
                        <div key={event.id} className="w-full" onClick={(e) => e.stopPropagation()}>
                          <EventItem
                            event={event}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event.id, dateKey);
                            }}
                            dateKey={dateKey}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 