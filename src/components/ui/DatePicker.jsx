import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const DatePicker = ({ selected, onChange, onBlur, minDate, maxDate }) => {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      onBlur={onBlur}
      minDate={minDate}
      maxDate={maxDate}
      dateFormat="yyyy-MM-dd"
      inline
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
    />
  );
};
