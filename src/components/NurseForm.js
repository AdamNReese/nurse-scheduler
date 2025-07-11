import React, { useState } from 'react';
import { PreferenceLevel } from '../scheduler';

const NurseForm = ({ onAddNurse }) => {
  const [formData, setFormData] = useState({
    name: '',
    hireDate: '',
    dayShiftPreference: PreferenceLevel.NEUTRAL,
    nightShiftPreference: PreferenceLevel.NEUTRAL,
    weekendPreference: PreferenceLevel.NEUTRAL
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.hireDate) {
      onAddNurse(formData);
      setFormData({
        name: '',
        hireDate: '',
        dayShiftPreference: PreferenceLevel.NEUTRAL,
        nightShiftPreference: PreferenceLevel.NEUTRAL,
        weekendPreference: PreferenceLevel.NEUTRAL
      });
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
    <form onSubmit={handleSubmit} className="nurse-form">
      <h3>Add New Nurse</h3>
      
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

      <button type="submit">Add Nurse</button>
    </form>
  );
};

export default NurseForm;