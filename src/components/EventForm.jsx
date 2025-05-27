import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import { format, addMonths, startOfMonth } from 'date-fns';
import { Modal } from './ui/Modal';

const MonthTabs = ({ selectedDate, onSelectMonth }) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = addMonths(startOfMonth(selectedDate), i - 6);
    return {
      label: format(date, 'MMM yyyy'),
      value: format(date, 'yyyy-MM-dd'),
      date
    };
  });

  return (
    <div className="flex space-x-2">
      {months.map((month) => (
        <button
          key={month.value}
          onClick={() => onSelectMonth(month.date)}
          className={`
            px-3 py-1 text-sm rounded-md whitespace-nowrap
            ${format(selectedDate, 'MMM yyyy') === month.label
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

export const generateRecurringDates = (startDate, endDate, recurrence, options) => {
  const dates = [];
  const current = new Date(startDate);
  const until = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addDateIfValid = (date) => {
    const newDate = new Date(date.getTime());
    if (newDate >= today && newDate <= until) {
      dates.push(newDate);
      return true;
    }
    return false;
  };

  switch (recurrence) {
    case 'daily':
      while (current <= until) {
        addDateIfValid(current);
        current.setDate(current.getDate() + 1);
      }
      break;

    case 'weekly':
      const selectedDays = options.weeklyDays || [];
      let currentDate = new Date(current.getTime());
      
      while (currentDate <= until) {
        if (selectedDays.includes(currentDate.getDay())) {
          addDateIfValid(currentDate);
          currentDate = new Date(currentDate.getTime());
          currentDate.setDate(currentDate.getDate() + 7);
        } else {
          currentDate = new Date(currentDate.getTime());
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      break;

    case 'monthly':
      let currentMonthDate = new Date(current.getTime());
      const targetDay = options.monthlyDay || current.getDate();
      
      while (currentMonthDate <= until) {
        const monthInstance = new Date(currentMonthDate.getTime());
        monthInstance.setDate(targetDay);
        
        if (monthInstance.getMonth() === currentMonthDate.getMonth() && monthInstance <= until) {
          addDateIfValid(monthInstance);
        }
        
        currentMonthDate.setDate(1);
        currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
      }
      break;

    case 'custom':
      let currentCustomDate = new Date(current.getTime());
      const interval = Number(options.customInterval) || 1;
      const unit = options.customUnit || 'days';
      
      while (currentCustomDate <= until) {
        addDateIfValid(currentCustomDate);
        
        currentCustomDate = new Date(currentCustomDate.getTime());
        
        switch (unit) {
          case 'days':
            currentCustomDate.setDate(currentCustomDate.getDate() + interval);
            break;
          case 'weeks':
            currentCustomDate.setDate(currentCustomDate.getDate() + (interval * 7));
            break;
          case 'months':
            const targetDate = currentCustomDate.getDate();
            currentCustomDate.setMonth(currentCustomDate.getMonth() + interval);
            if (currentCustomDate.getDate() !== targetDate) {
              currentCustomDate.setDate(0);
            }
            break;
        }
      }
      break;

    default:
      break;
  }

  return dates;
};

// Helper function to check conflicts for recurring events
const checkRecurringConflicts = (eventData, recurringDates, hasConflictFn, excludeId) => {
  const conflicts = [];
  recurringDates.forEach((date, index) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const conflictData = {
      ...eventData,
      date: dateKey,
      time: eventData.time,
      endTime: eventData.endTime
    };
    // Use the correct id for each instance to avoid self-conflict
    if (hasConflictFn && hasConflictFn(conflictData, excludeId)) {
      conflicts.push({
        date: dateKey,
        formattedDate: format(date, 'PPP'),
        time: eventData.time,
        endTime: eventData.endTime,
        index
      });
    }
  });
  return conflicts;
};

export const EventForm = ({
  initialDate,
  event,
  onSubmit,
  onDelete,
  onCancel,
  hasConflict,
}) => {
  const [recurrenceType, setRecurrenceType] = useState(
    event?.recurrence || 'none'
  );
  const [showWeeklyOptions, setShowWeeklyOptions] = useState(recurrenceType === 'weekly');
  const [showMonthlyOptions, setShowMonthlyOptions] = useState(recurrenceType === 'monthly');
  const [showCustomOptions, setShowCustomOptions] = useState(recurrenceType === 'custom');
  const [selectedDate, setSelectedDate] = useState(new Date(event?.date || initialDate || new Date()));
  
  // Conflict handling state
  const [conflictDetails, setConflictDetails] = useState({
    conflicts: [],
    eventData: null,
    recurringDates: []
  });

  // Dialog state for conflict warning
  const [conflictWarning, setConflictWarning] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: event ? {
      ...event,
      date: event.date,
      time: event.time,
      endTime: event.endTime || '',
      weeklyDays: event.weeklyDays || [],
      monthlyDay: event.monthlyDay || new Date(event.date || initialDate).getDate(),
      customInterval: event.customInterval || 1,
      customUnit: event.customUnit || 'days',
      repeatUntil: event?.repeatUntil || '',
    } : {
      title: '',
      date: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      endTime: '',
      description: '',
      recurrence: 'none',
      color: 'blue',
      weeklyDays: [],
      monthlyDay: initialDate ? initialDate.getDate() : new Date().getDate(),
      customInterval: 1,
      customUnit: 'days',
    }
  });
  
  const watchedValues = watch();
  
  useEffect(() => {
    if (recurrenceType !== 'weekly') {
      setShowWeeklyOptions(false);
    } else {
      setShowWeeklyOptions(true);
    }
    
    if (recurrenceType !== 'monthly') {
      setShowMonthlyOptions(false);
    } else {
      setShowMonthlyOptions(true);
    }
    
    if (recurrenceType !== 'custom') {
      setShowCustomOptions(false);
    } else {
      setShowCustomOptions(true);
    }
    
    setValue('recurrence', recurrenceType);
  }, [recurrenceType, setValue]);
  
  const onFormSubmit = (data) => {
    const datetime = new Date(`${data.date}T${data.time}`).toISOString();
    const endDatetime = data.endTime ? new Date(`${data.date}T${data.endTime}`).toISOString() : null;
    const finalData = {
      ...data,
      id: event?.id || Date.now().toString(),
      datetime,
      endDatetime,
      recurrence: recurrenceType,
      repeatUntil: data.repeatUntil || null,
      weeklyDays: recurrenceType === 'weekly' ? (Array.isArray(data.weeklyDays) ? data.weeklyDays.map(Number) : []) : undefined,
      monthlyDay: recurrenceType === 'monthly' ? Number(data.monthlyDay) : undefined,
      customInterval: recurrenceType === 'custom' ? Number(data.customInterval) : undefined,
      customUnit: recurrenceType === 'custom' ? data.customUnit : undefined,
    };

    // Check for conflicts
    if (recurrenceType !== 'none' && data.repeatUntil) {
      // Generate recurring dates for conflict checking
      const recurringDates = generateRecurringDates(
        datetime,
        data.repeatUntil,
        recurrenceType,
        {
          weeklyDays: finalData.weeklyDays,
          monthlyDay: finalData.monthlyDay,
          customUnit: finalData.customUnit,
          customInterval: finalData.customInterval,
        }
      );

      // Check for conflicts across all recurring dates
      const conflicts = checkRecurringConflicts(finalData, recurringDates, hasConflict, event?.id);
      
      if (conflicts.length > 0) {
        setConflictWarning({
          count: conflicts.length,
          time: finalData.time,
          endTime: finalData.endTime,
          dates: conflicts.map(c => c.formattedDate)
        });
        return;
      }
    } else {
      // Check single event conflict
      if (hasConflict && hasConflict(finalData, event?.id)) {

        setConflictWarning({
          count: 1,
          time: finalData.time,
          endTime: finalData.endTime,
          dates: [format(new Date(finalData.date), 'PPP')]
        });
        return;
      }
    }

    // Clean up undefined fields and submit
    submitEvent(finalData);
  };

  const submitEvent = (eventData) => {
    // Clean up undefined fields
    Object.keys(eventData).forEach(key => {
      if (eventData[key] === undefined) {
        delete eventData[key];
      }
    });
    
    onSubmit(eventData);
  };

  // FIXED: This is where the main issue was - the function wasn't properly handling the recurring events
  const handleConflictConfirm = () => {
    const { eventData } = conflictDetails;
    
    if (!eventData) {
      console.error('No event data available for conflict confirmation');
      return;
    }

    // For recurring events, we need to let the EventProvider handle the creation
    // by calling onSubmit with the original event data, not individual instances
    submitEvent(eventData);
  };

  // Handle weekly days checkbox changes
  const handleWeeklyDayChange = (dayIndex, checked) => {
    const currentDays = watch('weeklyDays') || [];
    let newDays;
    
    if (checked) {
      newDays = [...currentDays, dayIndex].sort((a, b) => a - b);
    } else {
      newDays = currentDays.filter(day => day !== dayIndex);
    }
    
    setValue('weeklyDays', newDays);
  };
  
  const handleMonthSelect = (date) => {
    const newDate = format(date, 'yyyy-MM-dd');
    setValue('date', newDate);
    setSelectedDate(date);
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onCancel}
        title={event ? 'Edit Event' : 'Create Event'}
        footer={
          <MonthTabs
            selectedDate={selectedDate}
            onSelectMonth={handleMonthSelect}
          />
        }
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
              Event Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Meeting with team"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
            )}
          </div>
          
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
                Date *
              </label>
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
                Start Time *
              </label>
              <input
                type="time"
                {...register('time', { required: 'Start time is required' })}
                className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
                End Time *
              </label>
              <input
                type="time"
                {...register('endTime', {
                  required: 'End time is required',
                  validate: value => {
                    const start = watch('time');
                    return !start || !value || value > start || 'End time must be after start time';
                  }
                })}
                className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endTime.message}</p>
              )}
            </div>
          </div>
          
          {/* Event Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
              Event Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {['blue', 'purple', 'emerald', 'amber', 'rose', 'slate'].map((color) => (
                <label 
                  key={color}
                  className={`
                    relative flex items-center justify-center h-8 rounded-md cursor-pointer
                    ${color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : ''}
                    ${color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700' : ''}
                    ${color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' : ''}
                    ${color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700' : ''}
                    ${color === 'rose' ? 'bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700' : ''}
                    ${color === 'slate' ? 'bg-slate-100 dark:bg-slate-900/30 border-slate-300 dark:border-slate-700' : ''}
                    ${watch('color') === color ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-dark-secondary' : 'border dark:border-dark-border'}
                  `}
                >
                  <input
                    type="radio"
                    value={color}
                    {...register('color')}
                    className="sr-only"
                  />
                  <span className="w-4 h-4 rounded-full bg-current"
                    style={{ 
                      backgroundColor: 
                        color === 'blue' ? '#3b82f6' : 
                        color === 'purple' ? '#8b5cf6' :
                        color === 'emerald' ? '#10b981' :
                        color === 'amber' ? '#f59e0b' :
                        color === 'rose' ? '#f43f5e' : '#64748b'
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event details..."
            />
          </div>
          
          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
              Recurrence
            </label>
            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
              className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            {recurrenceType !== 'none' && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
                  Repeat Until *
                </label>
                <input
                  type="date"
                  {...register('repeatUntil', {
                    required: 'Please provide an end date for the recurrence',
                  })}
                  className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.repeatUntil && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.repeatUntil.message}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Weekly recurrence options */}
          {showWeeklyOptions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
                Repeat on:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={watch('weeklyDays')?.includes(index)}
                      onChange={(e) => handleWeeklyDayChange(index, e.target.checked)}
                      className="form-checkbox text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-border rounded"
                    />
                    <span className="text-gray-700 dark:text-dark-primary">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Monthly recurrence options */}
          {showMonthlyOptions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
                Day of the Month
              </label>
              <input
                type="number"
                {...register('monthlyDay', { min: 1, max: 31 })}
                className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.monthlyDay && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Please enter a valid day (1-31)
                </p>
              )}
            </div>
          )}

          {/* Custom recurrence options */}
          {showCustomOptions && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
                  Every
                </label>
                <input
                  type="number"
                  {...register('customInterval', { min: 1 })}
                  className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-primary mb-1">
                  Unit
                </label>
                <select
                  {...register('customUnit')}
                  className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex space-x-2">
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                {event ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-dark-hover dark:text-dark-primary dark:hover:bg-dark-hover/80"
              >
                Cancel
              </Button>
            </div>
            {event && (
              <Button
                type="button"
                onClick={onDelete}
                className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </Button>
            )}
          </div>
        </form>
      </Modal>
      {/* Conflict Warning Dialog */}
      {conflictWarning && (
        <Modal
          isOpen={!!conflictWarning}
          onClose={() => setConflictWarning(null)}
          title={null}
          footer={
            <Button onClick={() => setConflictWarning(null)} className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-md px-6 py-2 rounded-md">OK</Button>
          }
        >
          <div className="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-xl shadow-lg">
            <div className="flex items-center mb-3">
              {/* Warning Icon */}
              <svg className="w-8 h-8 text-yellow-500 dark:text-yellow-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14c1.05 0 1.67-1.13 1.13-2.05l-7.07-12.2a1.25 1.25 0 00-2.2 0l-7.07 12.2c-.54.92.08 2.05 1.13 2.05z" />
              </svg>
              <span className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Event Conflict</span>
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-100 mb-2 text-center">
              There {conflictWarning.count === 1 ? 'is' : 'are'} <span className="font-bold text-yellow-700 dark:text-yellow-300">{conflictWarning.count}</span> conflict{conflictWarning.count === 1 ? '' : 's'} with existing event{conflictWarning.count === 1 ? '' : 's'}.
            </div>
            <div className="w-full max-h-40 overflow-y-auto mb-2">
              <ul className="space-y-1">
                {conflictWarning.dates.map((date, idx) => (
                  <li key={idx} className="flex items-center bg-white dark:bg-yellow-900/60 border border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100 px-3 py-1 rounded-md shadow-sm">
                    <svg className="w-4 h-4 text-yellow-400 dark:text-yellow-200 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.591c.75 1.334-.213 2.985-1.742 2.985H3.48c-1.53 0-2.492-1.651-1.742-2.985L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" /></svg>
                    <span className="font-medium">{date}</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">
                      from {conflictWarning.time} to {conflictWarning.endTime || conflictWarning.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200 text-center">
              Please change the time or recurrence to avoid conflicts.
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};