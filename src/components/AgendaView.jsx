import React from 'react';
import { format, isAfter, startOfDay, parseISO } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from './ui/Button';

const AgendaView = ({ events = [], onClose, onEventClick }) => {
  // Filter future events and sort them by date
  const today = startOfDay(new Date());
  const futureEvents = events
    .filter(event => {
      const eventDate = event.datetime ? parseISO(event.datetime) : parseISO(event.start);
      return isAfter(eventDate, today);
    })
    .sort((a, b) => {
      const dateA = a.datetime ? parseISO(a.datetime) : parseISO(a.start);
      const dateB = b.datetime ? parseISO(b.datetime) : parseISO(b.start);
      return dateA.getTime() - dateB.getTime();
    });

  const formatEventDate = (event) => {
    const eventDate = event.datetime ? parseISO(event.datetime) : parseISO(event.start);
    return {
      date: format(eventDate, 'MMM d, yyyy'),
      time: format(eventDate, 'h:mm a')
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-primary rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-200 dark:border-dark-border">
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-secondary">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-hover dark:text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)] bg-white dark:bg-dark-primary">
          {futureEvents.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No upcoming events scheduled</p>
          ) : (
            <div className="space-y-4">
              {futureEvents.map((event) => {
                const { date, time } = formatEventDate(event);
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="flex items-start space-x-4 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border"
                  >
                    <div className="w-24 flex-shrink-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {date}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {time}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </div>
                      {event.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaView;