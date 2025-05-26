import { useState, useCallback, useMemo } from 'react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  format,
  isToday,
  isSameMonth
} from 'date-fns';
import { getCalendarDays } from '../utils/dateUtils';
import { useEvents } from '../context/EventContext';

export const useCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { events } = useEvents();
    
  // Go to previous month
  const prevMonth = useCallback(() => {
    setCurrentMonth(prevDate => subMonths(prevDate, 1));
  }, []);
    
  // Go to next month
  const nextMonth = useCallback(() => {
    setCurrentMonth(prevDate => addMonths(prevDate, 1));
  }, []);
    
  // Go to today
  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);
    
  // Get formatted month and year
  const monthYearString = useMemo(() => {
    return format(currentMonth, 'MMMM yyyy');
  }, [currentMonth]);
    
  // Calculate days with events for the current month view
  const daysWithEvents = useMemo(() => {
    const calendarDays = getCalendarDays(currentMonth);
        
    return calendarDays.map(date => {
      // Format date to string for lookup in events map
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayEvents = events[dateStr] || [];
            
      // Check for recurring events for this day
      // (This is handled by the getEventsForDay utility)
            
      return {
        date,
        isCurrentMonth: isSameMonth(date, currentMonth),
        isToday: isToday(date),
        events: dayEvents
      };
    });
  }, [currentMonth, events]);
    
  // Chunk days into weeks for grid display
  const weeks = useMemo(() => {
    const result = [];
    const days = [...daysWithEvents];
        
    while (days.length > 0) {
      result.push(days.splice(0, 7));
    }
        
    return result;
  }, [daysWithEvents]);
    
  return {
    currentMonth,
    weeks,
    daysWithEvents,
    monthYearString,
    prevMonth,
    nextMonth,
    goToToday
  };
};