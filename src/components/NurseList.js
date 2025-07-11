import React, { useState } from 'react';
import NurseEditForm from './NurseEditForm';
import ConfirmationDialog from './ConfirmationDialog';

const NurseList = ({ nurses, onRemoveNurse, onEditNurse }) => {
  const [editingNurse, setEditingNurse] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [nurseToDelete, setNurseToDelete] = useState(null);

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

  const handleRemoveClick = (nurse, index) => {
    setNurseToDelete({ nurse, index });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (nurseToDelete) {
      onRemoveNurse(nurseToDelete.index);
      setShowDeleteConfirm(false);
      setNurseToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setNurseToDelete(null);
  };
  return (
    <div className="nurse-list">
      <h3>Current Nurses</h3>
      {nurses.length === 0 ? (
        <p>No nurses added yet.</p>
      ) : (
        <div className="table-container">
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
                  <td data-label="Name">{nurse.name}</td>
                  <td data-label="Hire Date">{nurse.hireDate.toLocaleDateString()}</td>
                  <td data-label="Seniority">{nurse.seniorityYears.toFixed(1)} years</td>
                  <td data-label="Day Shift">{nurse.dayShiftPreference}</td>
                  <td data-label="Night Shift">{nurse.nightShiftPreference}</td>
                  <td data-label="Weekends">{nurse.weekendPreference}</td>
                  <td data-label="Actions">
                    <button onClick={() => handleEditClick(nurse, index)}>Edit</button>
                    <button onClick={() => handleRemoveClick(nurse, index)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {editingNurse && (
        <NurseEditForm
          nurse={editingNurse}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Remove Nurse"
        message={`Are you sure you want to remove ${nurseToDelete?.nurse?.name}? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    </div>
  );
};

export default NurseList;