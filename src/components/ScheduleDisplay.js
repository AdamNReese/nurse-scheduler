import React from 'react';
import { Shift } from '../scheduler';

const ScheduleDisplay = ({ schedule }) => {
  if (!schedule || schedule.length === 0) {
    return <div className="schedule-display">No schedule generated yet.</div>;
  }

  const groupedSchedule = {};
  schedule.forEach(slot => {
    const dateKey = slot.date.toDateString();
    if (!groupedSchedule[dateKey]) {
      groupedSchedule[dateKey] = [];
    }
    groupedSchedule[dateKey].push(slot);
  });

  return (
    <div className="schedule-display">
      <h3>Generated Schedule</h3>
      {Object.entries(groupedSchedule).map(([date, slots]) => (
        <div key={date} className="schedule-day">
          <h4>{date}</h4>
          <div className="shifts">
            {slots.map((slot, index) => (
              <div key={index} className={`shift ${slot.shift}`}>
                <span className="shift-type">
                  {slot.shift === Shift.DAY ? 'Day Shift (7:00 AM - 7:00 PM)' : 'Night Shift (7:00 PM - 7:00 AM)'}
                </span>
                <div className="assigned-nurses">
                  {slot.nurses && slot.nurses.length > 0 ? (
                    slot.nurses.map((nurse, nurseIndex) => (
                      <span key={nurseIndex} className="nurse-name">
                        {nurse.name}
                      </span>
                    ))
                  ) : (
                    <span className="unassigned">UNASSIGNED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleDisplay;