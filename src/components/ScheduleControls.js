import React, { useState } from 'react';

const ScheduleControls = ({ onGenerateSchedule }) => {
  const [startDate, setStartDate] = useState('');
  const [numDays, setNumDays] = useState(7);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startDate) {
      onGenerateSchedule(new Date(startDate), numDays);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="schedule-controls">
      <h3>Generate Schedule</h3>
      
      <div className="form-group">
        <label htmlFor="startDate">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="numDays">Number of Days:</label>
        <input
          type="number"
          id="numDays"
          min="1"
          max="30"
          value={numDays}
          onChange={(e) => setNumDays(parseInt(e.target.value))}
          required
        />
      </div>

      <button type="submit">Generate Schedule</button>
    </form>
  );
};

export default ScheduleControls;