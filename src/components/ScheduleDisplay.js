import React, { useState } from 'react';
import { Shift } from '../scheduler';
import NurseReplacementSelector from './NurseReplacementSelector';

const ScheduleDisplay = ({ schedule, allNurses, onScheduleChange, onSaveSchedule, hasChanges }) => {
  const [showReplacement, setShowReplacement] = useState(false);
  const [replacementData, setReplacementData] = useState(null);
  if (!schedule || schedule.length === 0) {
    return <div className="schedule-display">No schedule generated yet.</div>;
  }

  const handleNurseClick = (nurse, slot, nurseIndex) => {
    setReplacementData({
      currentNurse: nurse,
      slot: slot,
      nurseIndex: nurseIndex,
      slotInfo: {
        date: slot.date,
        shift: slot.shift
      }
    });
    setShowReplacement(true);
  };

  const handleReplaceNurse = (newNurse) => {
    if (replacementData && onScheduleChange) {
      const updatedSchedule = [...schedule];
      const slotIndex = updatedSchedule.findIndex(s => 
        s.date.getTime() === replacementData.slot.date.getTime() && 
        s.shift === replacementData.slot.shift
      );
      
      if (slotIndex >= 0) {
        updatedSchedule[slotIndex].nurses[replacementData.nurseIndex] = newNurse;
        onScheduleChange(updatedSchedule);
      }
    }
    setShowReplacement(false);
    setReplacementData(null);
  };

  const handleCancelReplacement = () => {
    setShowReplacement(false);
    setReplacementData(null);
  };

  const handleSaveSchedule = () => {
    if (onSaveSchedule) {
      onSaveSchedule();
    }
  };

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
      <div className="schedule-header">
        <h3>Generated Schedule</h3>
        {hasChanges && (
          <button onClick={handleSaveSchedule} className="save-schedule-btn">
            Save Schedule
          </button>
        )}
      </div>
      
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
                      <span 
                        key={nurseIndex} 
                        className="nurse-name clickable"
                        onClick={() => handleNurseClick(nurse, slot, nurseIndex)}
                        title="Click to replace this nurse"
                      >
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

      {showReplacement && replacementData && (
        <NurseReplacementSelector
          isOpen={showReplacement}
          currentNurse={replacementData.currentNurse}
          allNurses={allNurses || []}
          assignedNurses={replacementData.slot.nurses || []}
          slotInfo={replacementData.slotInfo}
          onReplace={handleReplaceNurse}
          onCancel={handleCancelReplacement}
        />
      )}
    </div>
  );
};

export default ScheduleDisplay;