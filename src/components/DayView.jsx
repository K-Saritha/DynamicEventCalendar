import React from 'react';
import { format, addDays, subDays, parseISO, isSameHour, setHours, setMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { useDroppable } from '@dnd-kit/core';
import { EventItem } from './EventItem';

export const DayView = ({ currentDate, events, onEventClick, onDateChange, onDayClick }) => {
  // Generate time slots (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const dateKey = format(currentDate, 'yyyy-MM-dd');

  const handlePrevDay = () => {
    const newDate = subDays(currentDate, 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = addDays(currentDate, 1);
    onDateChange(newDate);
  };

  const handleHourClick = (hour) => {
    const selectedDateTime = setMinutes(setHours(currentDate, hour), 0);
    onDayClick(selectedDateTime);
  };

  // Get events for the current day
  const getEventsForDay = () => {
    return events[dateKey] || [];
  };

  // Get events for a specific hour
  const getEventsForHour = (hour) => {
    return getEventsForDay().filter(event => {
      const eventDate = parseISO(event.datetime);
      return eventDate.getHours() === hour;
    });
  };

  return (
    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow overflow-hidden">
      {/* Header with current day */}
      <div className="border-b dark:border-dark-border p-4">
        <div className="flex items-center justify-between mb-2">
          <Button
            onClick={handlePrevDay}
            variant="ghost"
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-600 dark:text-white rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <div className="font-medium text-xl text-gray-900 dark:text-dark-primary">
              {format(currentDate, 'EEEE')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {format(currentDate, 'MMMM d, yyyy')}
            </div>
          </div>
          <Button
            onClick={handleNextDay}
            variant="ghost"
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-600 dark:text-white rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[80px_1fr] h-[calc(100vh-200px)] overflow-y-auto">
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

        {/* Events column */}
        <div className="relative">
          {timeSlots.map((hour) => {
            const hourEvents = getEventsForHour(hour);
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
                onClick={() => handleHourClick(hour)}
                className="h-24 border-b dark:border-dark-border last:border-b-0 pl-2 pr-2 relative hover:bg-gray-50 dark:hover:bg-dark-hover/50 cursor-pointer"
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
      </div>
    </div>
  );
}; 