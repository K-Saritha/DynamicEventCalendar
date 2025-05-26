import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  format,
  isSameDay,
  parse,
  getDay,
  setHours,
  setMinutes,
  parseISO,
  isSameMonth
} from 'date-fns';

// Generate days for the calendar view
export const getCalendarDays = (date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = [];
  let currentDay = calendarStart;
  
  while (currentDay <= calendarEnd) {
    days.push(currentDay);
    currentDay = addDays(currentDay, 1);
  }
  
  return days;
};

// Format a date to YYYY-MM-DD
export const formatDateToYYYYMMDD = (date) => {
  return format(date, 'yyyy-MM-dd');
};

// Parse a YYYY-MM-DD string to a Date
export const parseYYYYMMDD = (dateString) => {
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

// Get events for a specific day
export const getEventsForDay = (date, allEvents) => {
  const dateKey = formatDateToYYYYMMDD(date);
  const events = allEvents[dateKey] || [];
  
  // Add recurring events
  const recurringEvents = getRecurringEventsForDay(date, allEvents);
  return [...events, ...recurringEvents];
};

// Get recurring events for a specific day
export const getRecurringEventsForDay = (date, allEvents) => {
  const result = [];
  
  // Collect all recurring events
  Object.values(allEvents)
    .flat()
    .filter(event => event.recurrence !== 'none')
    .forEach(event => {
      const eventDate = parseISO(event.datetime);
      
      // Skip if the event is already scheduled for this specific day
      if (isSameDay(date, eventDate)) {
        return;
      }
      
      const shouldShow = checkRecurringEventVisibility(event, date, eventDate);
      if (shouldShow) {
        // Create a copy of the event with the updated date
        const eventCopy = { 
          ...event,
          datetime: setTimeFromEvent(date, event)
        };
        result.push(eventCopy);
      }
    });
  
  return result;
};

// Set time from an event to a date
export const setTimeFromEvent = (date, event) => {
  const eventTime = new Date(event.datetime);
  const newDate = new Date(date);
  newDate.setHours(eventTime.getHours());
  newDate.setMinutes(eventTime.getMinutes());
  return newDate.toISOString();
};

// Check if a recurring event should be visible on a given date
const checkRecurringEventVisibility = (event, targetDate, eventDate) => {
  if (eventDate > targetDate) return false;
  
  switch (event.recurrence) {
    case 'daily':
      return true;
      
    case 'weekly': {
      const targetDayOfWeek = getDay(targetDate);
      if (!event.weeklyDays || !Array.isArray(event.weeklyDays)) return false;
      const selectedDays = event.weeklyDays.map(day => 
        typeof day === 'string' ? parseInt(day) : day
      );
      return selectedDays.includes(targetDayOfWeek);
    }
    
    case 'monthly': {
      return eventDate.getDate() === targetDate.getDate();
    }
    
    case 'custom': {
      if (!event.customInterval || !event.customUnit) return false;
      
      const diffInDays = Math.floor(
        (targetDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const intervalInDays = event.customUnit === 'days' ? event.customInterval :
                            event.customUnit === 'weeks' ? event.customInterval * 7 :
                            event.customUnit === 'months' ? event.customInterval * 30 : 0;
      
      return intervalInDays > 0 && diffInDays % intervalInDays === 0;
    }
    
    default:
      return false;
  }
};

// Check if two events conflict
export const checkEventConflict = (event1, event2) => {
  const date1 = new Date(event1.datetime);
  const date2 = new Date(event2.datetime);
  return isSameDay(date1, date2) && 
         date1.getHours() === date2.getHours() && 
         date1.getMinutes() === date2.getMinutes();
};

// Get date key for a specific month and day
export const getDateKeyForMonthDay = (monthIndex, day, year = new Date().getFullYear()) => {
  const date = new Date(year, monthIndex, day);
  return formatDateToYYYYMMDD(date);
};

// Check if a date is within the current month view
export const isDateInCurrentMonth = (date, currentMonth) => {
  return isSameMonth(date, currentMonth);
};

// Utility function for combining class names
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}