import React, { useState } from 'react';
import NurseEditForm from './NurseEditForm';

const NurseList = ({ nurses, onRemoveNurse, onEditNurse }) => {
  const [editingNurse, setEditingNurse] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleEditClick = (nurse, index) => {
    setEditingNurse(nurse);
    setEditingIndex(index);
  };

  const handleSaveEdit = (updatedNurseData) => {
    onEditNurse(editingIndex, updatedNurseData);
    setEditingNurse(null);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingNurse(null);
    setEditingIndex(null);
  };
  return (
    <div className="nurse-list">
      <h3>Current Nurses</h3>
      {nurses.length === 0 ? (
        <p>No nurses added yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Hire Date</th>
              <th>Seniority</th>
              <th>Day Shift</th>
              <th>Night Shift</th>
              <th>Weekends</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {nurses.map((nurse, index) => (
              <tr key={index}>
                <td>{nurse.name}</td>
                <td>{nurse.hireDate.toLocaleDateString()}</td>
                <td>{nurse.seniorityYears.toFixed(1)} years</td>
                <td>{nurse.dayShiftPreference}</td>
                <td>{nurse.nightShiftPreference}</td>
                <td>{nurse.weekendPreference}</td>
                <td>
                  <button onClick={() => handleEditClick(nurse, index)}>Edit</button>
                  <button onClick={() => onRemoveNurse(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {editingNurse && (
        <NurseEditForm
          nurse={editingNurse}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default NurseList;