import React from 'react';
import { cn } from '../utils/dateUtils';
import { useDraggable } from '@dnd-kit/core';
import { Repeat } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const getEventColorClass = (color) => {
  const colorMap = {
    blue: 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400',
    purple: 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-400',
    emerald: 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400',
    amber: 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400',
    rose: 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400',
    slate: 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-900/30 dark:border-slate-700 dark:text-slate-400',
  };
    
  return colorMap[color] || colorMap.blue;
};

export const EventItem = ({
  event,
  onClick,
  dateKey
}) => {
  // Setup dragging for the event
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `draggable-${event.id}-${dateKey}`,
    data: {
      eventId: event.id,
      fromDate: dateKey,
    },
  });
    
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 20,
  } : undefined;

  const eventTime = event.datetime ? format(parseISO(event.datetime), 'HH:mm') : event.time;
  const eventEndTime = event.endTime ? event.endTime : null;
    
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "w-full px-2 py-1 text-xs rounded border cursor-pointer transition-all",
        "hover:ring-2 hover:ring-offset-1 dark:hover:ring-offset-dark-secondary",
        getEventColorClass(event.color),
        transform && "opacity-80"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-1 w-full">
        <span className="flex-shrink-0 font-medium">
          {eventTime}
          {eventEndTime && (
            <>
              {' - '}
              {eventEndTime}
            </>
          )}
        </span>
        {event.isRecurring && (
          <Repeat size={10} className="flex-shrink-0" />
        )}
        <span className="truncate flex-1">{event.title}</span>
      </div>
    </div>
  );
};