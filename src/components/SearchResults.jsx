import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

export const SearchResults = ({ results, onEventClick, onClose }) => {
  if (results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-secondary border dark:border-dark-border rounded-md shadow-lg max-h-[300px] overflow-y-auto z-50">
      {results.length === 0 ? (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          No events found
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-dark-border">
          {results.map((event) => (
            <li 
              key={event.id}
              className="p-3 hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer"
              onClick={() => {
                onEventClick(event.id, event.date);
                onClose();
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                  event.color === 'blue' ? 'bg-blue-500' :
                  event.color === 'purple' ? 'bg-purple-500' :
                  event.color === 'emerald' ? 'bg-emerald-500' :
                  event.color === 'amber' ? 'bg-amber-500' :
                  event.color === 'rose' ? 'bg-rose-500' :
                  'bg-slate-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-primary truncate">
                    {event.title}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarIcon size={12} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(event.datetime), 'MMM d, yyyy - h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 