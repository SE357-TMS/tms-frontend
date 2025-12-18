import React, { useState, useMemo } from 'react';
import './DatePicker.css';

export default function DatePicker({ 
  selectedDate, 
  availableDates = [], 
  onSelect, 
  onClose 
}) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  // Get array of available date strings for comparison
  const availableDateStrings = useMemo(() => {
    return availableDates.map(d => {
      if (typeof d === 'string') return d;
      if (d instanceof Date) return d.toISOString().split('T')[0];
      return '';
    });
  }, [availableDates]);

  // Get month data
  const monthData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();
    
    // Previous month days to fill
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      currentMonthDays.push({
        day: i,
        isCurrentMonth: true,
        date,
        isAvailable: availableDateStrings.includes(dateStr),
        isSelected: selectedDate && dateStr === selectedDate.toISOString().split('T')[0],
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }
    
    // Next month days to fill (to complete 6 rows)
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const nextMonthDays = [];
    const remainingDays = 42 - totalDays; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return {
      year,
      month,
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long' }),
      days: [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
    };
  }, [currentMonth, availableDateStrings, selectedDate]);

  // Navigate months
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Handle day click
  const handleDayClick = (dayData) => {
    if (dayData.isCurrentMonth && dayData.isAvailable) {
      onSelect(dayData.date);
    }
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="date-picker-overlay" onClick={onClose}>
      <div className="date-picker" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="date-picker-header">
          <button className="nav-btn" onClick={goToPrevMonth}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="month-year">
            {monthData.monthName} {monthData.year}
          </span>
          <button className="nav-btn" onClick={goToNextMonth}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* Week Days */}
        <div className="weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="calendar-days">
          {monthData.days.map((dayData, index) => (
            <button
              key={index}
              className={`calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${dayData.isAvailable ? 'available' : ''} ${dayData.isSelected ? 'selected' : ''} ${dayData.isToday ? 'today' : ''}`}
              onClick={() => handleDayClick(dayData)}
              disabled={!dayData.isCurrentMonth || !dayData.isAvailable}
            >
              {dayData.day}
            </button>
          ))}
        </div>
        
        {/* Legend */}
        <div className="date-picker-legend">
          <div className="legend-item">
            <span className="legend-dot available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot unavailable"></span>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
