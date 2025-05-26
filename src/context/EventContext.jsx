import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';
import { generateRecurringDates } from '../components/EventForm';
import { Dialog } from '../components/ui/Dialog';

const EventContext = createContext(undefined);

const STORAGE_KEY = 'calendar_events';

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    return savedEvents ? JSON.parse(savedEvents) : {};
  });

  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const addEvent = (eventData) => {
    const id = generateId();
    const startDateTime = new Date(`${eventData.date}T${eventData.time}`);
    const isRecurring = eventData.recurrence !== 'none';
    const recurrence = eventData.recurrence;
    const parentId = isRecurring ? id : null;

    const recurrenceEnd = isRecurring && eventData.repeatUntil
      ? new Date(`${eventData.repeatUntil}T23:59:59`)
      : null;

    const eventsToAdd = [];

    if (isRecurring && recurrenceEnd) {
      const recurrenceDates = generateRecurringDates(
        startDateTime,
        recurrenceEnd,
        recurrence,
        {
          weeklyDays: eventData.weeklyDays,
          monthlyDay: eventData.monthlyDay,
          customUnit: eventData.customUnit,
          customInterval: eventData.customInterval,
        }
      );

      recurrenceDates.forEach((date, index) => {
        const instance = {
          ...eventData,
          id: index === 0 ? id : generateId(),
          parentId: parentId,
          datetime: date.toISOString(),
          date: formatDateToYYYYMMDD(date),
          isRecurring: true,
        };
        eventsToAdd.push(instance);
      });
    } else {
      eventsToAdd.push({
        ...eventData,
        id,
        parentId: null,
        datetime: startDateTime.toISOString(),
        date: formatDateToYYYYMMDD(startDateTime),
        isRecurring: false,
      });
    }

    setEvents(prevEvents => {
      const updated = { ...prevEvents };
      eventsToAdd.forEach(ev => {
        const key = ev.date;
        if (!updated[key]) updated[key] = [];
        updated[key].push(ev);
      });
      return updated;
    });

    return id;
  };

  const updateEvent = (eventData, options = {}) => {
    const { updateMode = 'single', originalEvent } = options;
    
    setEvents(prevEvents => {
      const newEvents = { ...prevEvents };
      
      // Remove the original event
      if (originalEvent) {
        const originalDateKey = originalEvent.date;
        if (newEvents[originalDateKey]) {
          newEvents[originalDateKey] = newEvents[originalDateKey].filter(
            e => e.id !== originalEvent.id
          );
          
          if (newEvents[originalDateKey].length === 0) {
            delete newEvents[originalDateKey];
          }
        }
      }
      
      // Handle recurring event updates
      if (updateMode === 'future' && originalEvent?.isRecurring) {
        // Remove all future instances of this recurring event
        Object.keys(newEvents).forEach(dateKey => {
          if (dateKey >= originalEvent.date) {
            newEvents[dateKey] = newEvents[dateKey].filter(
              e => e.parentId !== originalEvent.parentId
            );
            
            if (newEvents[dateKey].length === 0) {
              delete newEvents[dateKey];
            }
          }
        });
        
        // Add new recurring events
        if (eventData.recurrence !== 'none' && eventData.repeatUntil) {
          const startDateTime = new Date(`${eventData.date}T${eventData.time}`);
          const recurrenceEnd = new Date(`${eventData.repeatUntil}T23:59:59`);
          
          const recurrenceDates = generateRecurringDates(
            startDateTime,
            recurrenceEnd,
            eventData.recurrence,
            {
              weeklyDays: eventData.weeklyDays,
              monthlyDay: eventData.monthlyDay,
              customUnit: eventData.customUnit,
              customInterval: eventData.customInterval,
            }
          );
          
          const parentId = generateId();
          
          recurrenceDates.forEach(date => {
            const dateKey = formatDateToYYYYMMDD(date);
            const instance = {
              ...eventData,
              id: generateId(),
              parentId,
              datetime: date.toISOString(),
              date: dateKey,
              isRecurring: true,
            };
            
            if (!newEvents[dateKey]) {
              newEvents[dateKey] = [];
            }
            newEvents[dateKey].push(instance);
          });
        }
      } else {
        const updatedDateObj = new Date(`${eventData.date}T${eventData.time}`);
        const updatedEvent = {
          ...eventData,
          datetime: updatedDateObj.toISOString(),
          isRecurring: false,
          parentId: null
        };
        
        const updatedDateKey = formatDateToYYYYMMDD(updatedDateObj);
        if (!newEvents[updatedDateKey]) {
          newEvents[updatedDateKey] = [];
        }
        newEvents[updatedDateKey].push(updatedEvent);
      }

      return newEvents;
    });
  };

  const deleteEvent = (id, date) => {
    setEvents(prevEvents => {
      const newEvents = { ...prevEvents };
      
      if (newEvents[date]) {
        newEvents[date] = newEvents[date].filter(e => e.id !== id);
        
        if (newEvents[date].length === 0) {
          delete newEvents[date];
        }
      }
      
      return newEvents;
    });
  };

  const findEventById = (id) => {
    for (const dateKey in events) {
      const found = events[dateKey].find(e => e.id === id);
      if (found) return found;
    }
    return undefined;
  };

  const hasConflicts = (eventData, excludeId) => {
    const dateKey = eventData.date;
    const eventsOnDay = events[dateKey] || [];
    
    return eventsOnDay.some(existingEvent => {
      if (excludeId && existingEvent.id === excludeId) return false;
      return existingEvent.time === eventData.time;
    });
  };

  const handleCloseDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
  };

  const moveEvent = (id, fromDate, toDate) => {
    const event = findEventById(id);
    if (!event) return;
    
    const newEvents = { ...events };
    const [hours, minutes] = event.time.split(':');
    const targetDate = new Date(toDate);
    targetDate.setHours(parseInt(hours), parseInt(minutes));
    
    const movedEvent = {
      ...event,
      date: toDate,
      datetime: targetDate.toISOString(),
    };
    
    const hasEventConflict = hasConflicts(movedEvent, id);
    
    if (hasEventConflict) {
      setDialogConfig({
        isOpen: true,
        title: 'Time Conflict',
        message: 'There is already an event scheduled at this time. Would you like to move it anyway?',
        type: 'warning',
        confirmText: 'Move Anyway',
        cancelText: 'Cancel',
        onConfirm: () => {
          moveEventToDate(newEvents, event, fromDate, toDate);
          handleCloseDialog();
        },
        onCancel: handleCloseDialog,
      });
    } else {
      moveEventToDate(newEvents, event, fromDate, toDate);
    }
  };

  const moveEventToDate = (newEvents, event, fromDate, toDate) => {
    newEvents[fromDate] = newEvents[fromDate].filter(e => e.id !== event.id);
    if (newEvents[fromDate].length === 0) {
      delete newEvents[fromDate];
    }

    if (!newEvents[toDate]) {
      newEvents[toDate] = [];
    }
    newEvents[toDate].push({
      ...event,
      date: toDate
    });
    
    setEvents(newEvents);
  };

  const value = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    findEventById,
    hasConflicts,
    moveEvent
  };

  return (
    <EventContext.Provider value={value}>
      {children}
      <Dialog
        isOpen={dialogConfig.isOpen}
        onClose={handleCloseDialog}
        onConfirm={() => {
          dialogConfig.onConfirm?.();
          handleCloseDialog();
        }}
        onCancel={() => {
          dialogConfig.onCancel?.();
          handleCloseDialog();
        }}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        type={dialogConfig.type}
      />
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};