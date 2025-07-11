import React, { useState } from 'react';
import { PreferenceLevel } from '../scheduler';

const NurseEditForm = ({ nurse, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: nurse.name,
    hireDate: nurse.hireDate.toISOString().split('T')[0], // Format for date input
    dayShiftPreference: nurse.dayShiftPreference,
    nightShiftPreference: nurse.nightShiftPreference,
    weekendPreference: nurse.weekendPreference
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.hireDate) {
      onSave(formData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="nurse-edit-overlay">
      <div className="nurse-edit-modal">
        <form onSubmit={handleSubmit} className="nurse-edit-form">
          <h3>Edit Nurse</h3>
          
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hireDate">Hire Date:</label>
            <input
              type="date"
              id="hireDate"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dayShiftPreference">Day Shift Preference:</label>
            <select
              id="dayShiftPreference"
              name="dayShiftPreference"
              value={formData.dayShiftPreference}
              onChange={handleInputChange}
            >
              <option value={PreferenceLevel.PREFER}>Prefer</option>
              <option value={PreferenceLevel.NEUTRAL}>Neutral</option>
              <option value={PreferenceLevel.AVOID}>Avoid</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nightShiftPreference">Night Shift Preference:</label>
            <select
              id="nightShiftPreference"
              name="nightShiftPreference"
              value={formData.nightShiftPreference}
              onChange={handleInputChange}
            >
              <option value={PreferenceLevel.PREFER}>Prefer</option>
              <option value={PreferenceLevel.NEUTRAL}>Neutral</option>
              <option value={PreferenceLevel.AVOID}>Avoid</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="weekendPreference">Weekend Preference:</label>
            <select
              id="weekendPreference"
              name="weekendPreference"
              value={formData.weekendPreference}
              onChange={handleInputChange}
            >
              <option value={PreferenceLevel.PREFER}>Prefer</option>
              <option value={PreferenceLevel.NEUTRAL}>Neutral</option>
              <option value={PreferenceLevel.AVOID}>Avoid</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NurseEditForm;