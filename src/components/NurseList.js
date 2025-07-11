import React from 'react';

const NurseList = ({ nurses, onRemoveNurse }) => {
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
                  <button onClick={() => onRemoveNurse(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NurseList;