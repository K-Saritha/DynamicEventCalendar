import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { Modal } from './ui/Modal';
import { EventForm } from './EventForm';
import { useCalendar } from '../hooks/useCalendar';
import { useEvents } from '../context/EventContext';
import { Dialog } from './ui/Dialog';
import { 
  DndContext, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { EventItem } from './EventItem';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';
import AgendaView from './AgendaView';

export const Calendar = () => {
  const { 
    currentMonth, 
    weeks, 
    monthYearString, 
    prevMonth, 
    nextMonth, 
    goToToday,
    setCurrentMonth,
  } = useCalendar();
  
  const { 
    events, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    findEventById, 
    hasConflicts,
    moveEvent,
  } = useEvents();
  
  // View state
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Dialog state
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });
  
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  
  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    })
  );
  
  // Get all events as a flat array for searching
  const getAllEvents = React.useCallback(() => {
    const allEvents = [];
    Object.entries(events).forEach(([date, dateEvents]) => {
      dateEvents.forEach(event => {
        allEvents.push({
          ...event,
          date // Add the date to each event for reference
        });
      });
    });
    return allEvents;
  }, [events]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const allEvents = getAllEvents();
    const filtered = allEvents.filter(event => 
      event.title?.toLowerCase().includes(term.toLowerCase()) ||
      event.description?.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };
  
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };
  
  const handleEventClick = (eventId, date) => {
    const event = findEventById(eventId);
    if (event) {
      setSelectedEvent(event);
      setSelectedDate(null);
      setIsModalOpen(true);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedEvent(null);
  };
  
  const handleSubmit = (data) => {
    const isEditing = Boolean(selectedEvent);
    
    // Close modal immediately
    setIsModalOpen(false);
    
    if (isEditing && selectedEvent.isRecurring) {
      // For recurring events, show dialog for update choice
      setDialogConfig({
        isOpen: true,
        title: 'Update Recurring Event',
        message: 'Would you like to update this event and all future events in the series, or just this single event?',
        type: 'warning',
        confirmText: 'Update All Future',
        cancelText: 'Update Only This',
        onConfirm: () => {
          // Update this and all future events
          updateEvent(data, {
            updateMode: 'future',
            originalEvent: selectedEvent
          });
        },
        onCancel: () => {
          // Update only this instance
          const singleEventData = {
            ...data,
            recurrence: 'none',
            parentId: null,
            isRecurring: false
          };
          updateEvent(singleEventData, {
            updateMode: 'single',
            originalEvent: selectedEvent
          });
        }
      });
    } else {
      // Non-recurring event update or new event
      setTimeout(() => {
        if (isEditing) {
          updateEvent(data, {
            updateMode: 'single',
            originalEvent: selectedEvent
          });
        } else {
          addEvent(data);
        }
      }, 0);
    }
  };
  
  const handleDelete = () => {
    if (selectedEvent) {
      setDialogConfig({
        isOpen: true,
        title: 'Delete Event',
        message: 'Are you sure you want to delete this event?',
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: () => {
          deleteEvent(selectedEvent.id, selectedEvent.date);
          handleCloseDialog();
          handleCloseModal();
        },
        onCancel: () => {
          handleCloseDialog();
        }
      });
    }
  };
  
  const handleCloseDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
  };
  
  const handleDragStart = (event) => {
    const { active } = event;
    const { eventId } = active.data.current;
    
    const draggedEvent = findEventById(eventId);
    if (draggedEvent) {
      setDraggedEvent(draggedEvent);
    }
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setDraggedEvent(null);
    
    if (!over) return;
    
    const { eventId, fromDate } = active.data.current;
    const { dateKey, hour } = over.data.current;
    
    if (fromDate !== dateKey || hour !== undefined) {
      const draggedEvent = findEventById(eventId);
      if (!draggedEvent) return;

      // If we're dropping into a specific hour slot (day view)
      if (hour !== undefined) {
        const eventDate = new Date(dateKey);
        eventDate.setHours(hour);
        eventDate.setMinutes(0);
        
        const updatedEvent = {
          ...draggedEvent,
          date: dateKey,
          datetime: eventDate.toISOString(),
          time: format(eventDate, 'HH:mm')
        };
        
        moveEvent(eventId, fromDate, dateKey, updatedEvent);
      } else {
        // Regular date-to-date move (month view)
        moveEvent(eventId, fromDate, dateKey);
      }
    }
  };
  
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
    setCurrentMonth(newDate);
  };

  const renderCalendarView = () => {
    switch (currentView) {
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onDateChange={handleDateChange}
            onDayClick={handleDayClick}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onDateChange={handleDateChange}
            onDayClick={handleDayClick}
          />
        );
      case 'month':
      default:
        return (
          <CalendarGrid
            weeks={weeks}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            currentMonth={currentMonth}
            onMonthSelect={(date) => {
              setCurrentMonth(date);
              setCurrentDate(date);
            }}
          />
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CalendarHeader
          monthYearString={monthYearString}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onToday={goToToday}
          onAddEvent={() => {
            setSelectedDate(new Date());
            setSelectedEvent(null);
            setIsModalOpen(true);
          }}
          onSearch={handleSearch}
          searchResults={searchResults}
          onEventClick={handleEventClick}
          onShowAgenda={() => setIsAgendaOpen(true)}
          currentView={currentView}
          onViewChange={handleViewChange}
          currentDate={currentDate}
          onDateSelect={handleDateChange}
        />
        
        {renderCalendarView()}
        
        <DragOverlay>
          {draggedEvent && (
            <EventItem
              event={draggedEvent}
              onClick={() => {}}
              dateKey={draggedEvent.date}
            />
          )}
        </DragOverlay>
      </DndContext>
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedEvent ? 'Edit Event' : 'Add Event'}
      >
        <EventForm
          initialDate={selectedDate || undefined}
          event={selectedEvent || undefined}
          onSubmit={handleSubmit}
          onDelete={selectedEvent ? handleDelete : undefined}
          onCancel={handleCloseModal}
          hasConflict={(data) => hasConflicts(data, selectedEvent?.id)}
        />
      </Modal>

      {isAgendaOpen && (
        <AgendaView
          events={getAllEvents()}
          onClose={() => setIsAgendaOpen(false)}
          onEventClick={(event) => {
            handleEventClick(event.id, event.date);
            setIsAgendaOpen(false);
          }}
        />
      )}

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
    </div>
  );
};