import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import { format, addMonths, startOfMonth } from 'date-fns';
import { Dialog } from './ui/Dialog';
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
  // Set today to start of day for proper comparison
  today.setHours(0, 0, 0, 0);

  console.log('Recurrence Setup:');
  console.log('Start Date:', current);
  console.log('End Date:', until);
  console.log('Today:', today);

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
      
      console.log('Weekly Recurrence Debug:');
      console.log('Selected Days:', selectedDays);
      
      while (currentDate <= until) {
        if (selectedDays.includes(currentDate.getDay())) {
          addDateIfValid(currentDate);
          // Move to next week after finding a matching day
          currentDate = new Date(currentDate.getTime());
          currentDate.setDate(currentDate.getDate() + 7);
        } else {
          // Move to next day if current day is not selected
          currentDate = new Date(currentDate.getTime());
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      break;

    case 'monthly':
      let currentMonthDate = new Date(current.getTime());
      const targetDay = options.monthlyDay || current.getDate();
      
      console.log('Monthly Recurrence Debug:');
      console.log('Target Day:', targetDay);
      
      while (currentMonthDate <= until) {
        // Create a new date for this month's instance
        const monthInstance = new Date(currentMonthDate.getTime());
        monthInstance.setDate(targetDay);
        
        // Check if this month's instance is valid and within range
        if (monthInstance.getMonth() === currentMonthDate.getMonth() && monthInstance <= until) {
          addDateIfValid(monthInstance);
        }
        
        // Move to first day of next month to avoid skipping months with invalid dates
        currentMonthDate.setDate(1);
        currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
      }
      break;

    case 'custom':
      let currentCustomDate = new Date(current.getTime());
      const interval = Number(options.customInterval) || 1;
      const unit = options.customUnit || 'days';
      
      console.log('Custom Recurrence Debug:');
      console.log('Interval:', interval);
      console.log('Unit:', unit);
      
      while (currentCustomDate <= until) {
        addDateIfValid(currentCustomDate);
        
        // Create a new date for the next instance
        currentCustomDate = new Date(currentCustomDate.getTime());
        
        switch (unit) {
          case 'days':
            currentCustomDate.setDate(currentCustomDate.getDate() + interval);
            break;
          case 'weeks':
            currentCustomDate.setDate(currentCustomDate.getDate() + (interval * 7));
            break;
          case 'months':
            // Store the target day before changing month
            const targetDate = currentCustomDate.getDate();
            // Move to the next month(s)
            currentCustomDate.setMonth(currentCustomDate.getMonth() + interval);
            // Try to maintain the same day of month
            if (currentCustomDate.getDate() !== targetDate) {
              // If we couldn't maintain the day (e.g., 31st in a 30-day month),
              // go to the last day of the target month
              currentCustomDate.setDate(0);
            }
            break;
        }
      }
      break;

    default:
      break;
  }

  console.log('Generated dates:', dates);
  return dates;
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
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(event?.date || initialDate || new Date()));

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: event ? {
      ...event,
      date: event.date,
      time: event.time,
      weeklyDays: event.weeklyDays || [],
      monthlyDay: event.monthlyDay || new Date(event.date || initialDate).getDate(),
      customInterval: event.customInterval || 1,
      customUnit: event.customUnit || 'days',
      repeatUntil: event?.repeatUntil || '', // can be stored as a date string

    } : {
      title: '',
      date: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      description: '',
      recurrence: 'none',
      color: 'blue',
      weeklyDays: [],
      monthlyDay: initialDate ? initialDate.getDate() : new Date().getDate(),
      customInterval: 1,
      customUnit: 'days',
    }
  });
  
  // Watch for form changes to check conflicts
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
  
  useEffect(() => {
    // Check for conflicts when date or time changes
    if (hasConflict) {
      const hasEventConflict = hasConflict({
        ...watchedValues,
        id: event?.id,
      });
      
      setShowConflictWarning(hasEventConflict);
    }
  }, [watchedValues.date, watchedValues.time, hasConflict, event?.id, watchedValues]);
  
  const onFormSubmit = (data) => {
    // If there's a conflict, ask for confirmation
    if (showConflictWarning) {
      const confirmed = window.confirm('This event conflicts with another event at the same time. Do you want to schedule it anyway?');
      if (!confirmed) return;
    }
    
    // Create datetime ISO string for proper storage
    const datetime = new Date(`${data.date}T${data.time}`).toISOString();
    
    const finalData = {
  ...data,
  id: event?.id || Date.now().toString(),
  datetime,
  recurrence: recurrenceType,
  repeatUntil: data.repeatUntil || null,
  weeklyDays: recurrenceType === 'weekly' ? (Array.isArray(data.weeklyDays) ? data.weeklyDays.map(Number) : []) : undefined,
  monthlyDay: recurrenceType === 'monthly' ? Number(data.monthlyDay) : undefined,
  customInterval: recurrenceType === 'custom' ? Number(data.customInterval) : undefined,
  customUnit: recurrenceType === 'custom' ? data.customUnit : undefined,
};

    if (recurrenceType !== 'none' && data.repeatUntil) {
  const recurrenceDates = generateRecurringDates(
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

  // Remove the first date (start date), since we already saved it once
  const otherInstances = recurrenceDates.slice(1).map(date => ({
    ...finalData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // generate unique id
    datetime: date.toISOString(), // or formatted as needed
  }));

  // Save the rest (e.g., to your database or state)
  otherInstances.forEach(instance => {
    // e.g. call API or update local state
    console.log('Saving instance:', instance);
    // await saveEvent(instance);
  });
}

    // Remove undefined fields
    Object.keys(finalData).forEach(key => {
      if (finalData[key] === undefined) {
        delete finalData[key];
      }
    });
    
    console.log('Submitting event data:', finalData); // Debug log
    onSubmit(finalData);
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
  
  // Add this function before the EventForm component
  function testWeeklyRecurrence() {
    // Test case: Event created on Monday (2024-01-15) to recur on Wednesdays until 2024-02-15
    const startDate = new Date('2024-01-15T10:00:00'); // A Monday
    const endDate = new Date('2024-02-15T10:00:00');
    const selectedDays = [3]; // Wednesday (0 = Sunday, 3 = Wednesday)
    
    console.log('=== Testing Weekly Recurrence ===');
    const dates = generateRecurringDates(startDate, endDate, 'weekly', {
      weeklyDays: selectedDays
    });
    
    console.log('Generated dates:');
    dates.forEach(date => {
      console.log(`${date.toISOString()} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]})`);
    });
    console.log('=== End Test ===');
  }

  // Call the test function when the component mounts
  useEffect(() => {
    testWeeklyRecurrence();
  }, []);
  
  const handleMonthSelect = (date) => {
    const newDate = format(date, 'yyyy-MM-dd');
    setValue('date', newDate);
    setSelectedDate(date);
  };

  return (
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
              Time *
            </label>
            <input
              type="time"
              {...register('time', { required: 'Time is required' })}
              className="w-full px-3 py-2 border dark:border-dark-border rounded-md bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.time && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time.message}</p>
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
            <div>
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

        {/* Conflict Warning */}
        {showConflictWarning && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded-md">
            This event conflicts with another event at the same time.
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
  );
};


