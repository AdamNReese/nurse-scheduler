import React, { useState } from 'react';

const NurseReplacementSelector = ({ 
  isOpen, 
  currentNurse, 
  allNurses, 
  assignedNurses, 
  slotInfo,
  onReplace, 
  onCancel 
}) => {
  const [selectedNurse, setSelectedNurse] = useState(null);

  if (!isOpen) return null;

  // Filter out nurses already assigned to this shift
  const availableNurses = allNurses.filter(nurse => 
    !assignedNurses.some(assigned => assigned.name === nurse.name)
  );

  // Add current nurse back to the list (they can stay assigned)
  const selectableNurses = [currentNurse, ...availableNurses];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleReplace = () => {
    if (selectedNurse) {
      onReplace(selectedNurse);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="nurse-replacement-overlay" onClick={handleOverlayClick}>
      <div className="nurse-replacement-modal">
        <div className="replacement-header">
          <h3>Replace Nurse</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <div className="replacement-body">
          <div className="shift-info">
            <h4>Shift Details</h4>
            <p><strong>Date:</strong> {formatDate(slotInfo.date)}</p>
            <p><strong>Shift:</strong> {slotInfo.shift === 'day' ? 'Day Shift (7:00 AM - 7:00 PM)' : 'Night Shift (7:00 PM - 7:00 AM)'}</p>
            <p><strong>Current Nurse:</strong> {currentNurse.name}</p>
          </div>

          <div className="nurse-selection">
            <h4>Select Replacement</h4>
            <div className="nurse-options">
              {selectableNurses.map((nurse, index) => (
                <div
                  key={index}
                  className={`nurse-option ${selectedNurse?.name === nurse.name ? 'selected' : ''} ${nurse.name === currentNurse.name ? 'current' : ''}`}
                  onClick={() => setSelectedNurse(nurse)}
                >
                  <div className="nurse-info">
                    <div className="nurse-name">
                      {nurse.name}
                      {nurse.name === currentNurse.name && <span className="current-label">(Current)</span>}
                    </div>
                    <div className="nurse-details">
                      <span>Seniority: {nurse.seniorityYears.toFixed(1)} years</span>
                      <span>Day: {nurse.dayShiftPreference}</span>
                      <span>Night: {nurse.nightShiftPreference}</span>
                      <span>Weekend: {nurse.weekendPreference}</span>
                    </div>
                  </div>
                  {selectedNurse?.name === nurse.name && (
                    <div className="selection-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {availableNurses.length === 0 && (
            <div className="no-nurses">
              <p>No other nurses are available for this shift.</p>
            </div>
          )}
        </div>
        
        <div className="replacement-actions">
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={handleReplace} 
            className="replace-btn"
            disabled={!selectedNurse}
          >
            {selectedNurse?.name === currentNurse.name ? 'Keep Current' : 'Replace'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NurseReplacementSelector;