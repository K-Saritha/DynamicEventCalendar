import React from 'react';
import { format } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { EventItem } from './EventItem';

export const DayCell = ({ day, onClick, onEventClick }) => {
  const { date, isCurrentMonth, isToday, events = [] } = day;
  const dateKey = format(date, 'yyyy-MM-dd');

  const { setNodeRef } = useDroppable({
    id: `droppable-${dateKey}`,
    data: {
      dateKey,
    },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onClick(date)}
      className={`
        relative h-full min-h-[100px] p-1 border-b border-r dark:border-dark-border transition-colors duration-200
        ${isCurrentMonth ? 'bg-white dark:bg-dark-secondary' : 'bg-gray-50 dark:bg-dark-primary/50'}
        ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer
      `}
    >
      <div className={`
        text-sm font-medium mb-1
        ${isCurrentMonth ? 'text-gray-900 dark:text-dark-primary' : 'text-gray-400 dark:text-gray-500'}
        ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}
      `}>
        {format(date, 'd')}
      </div>
      <div className="space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
        {events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event.id, dateKey);
            }}
            dateKey={dateKey}
          />
        ))}
      </div>
    </div>
  );
};