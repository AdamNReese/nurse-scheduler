import React, { useState, useEffect } from 'react';
import './App.css';
import NurseForm from './components/NurseForm';
import NurseList from './components/NurseList';
import ScheduleControls from './components/ScheduleControls';
import ScheduleDisplay from './components/ScheduleDisplay';
import { Nurse, NurseScheduler, PreferenceLevel } from './scheduler';

// Initial sample nurses
const initialNurses = [
  new Nurse('Sarah Johnson', '2018-03-15', PreferenceLevel.PREFER, PreferenceLevel.AVOID, PreferenceLevel.NEUTRAL),
  new Nurse('Michael Chen', '2019-07-22', PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER, PreferenceLevel.AVOID),
  new Nurse('Emily Rodriguez', '2020-01-10', PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER),
  new Nurse('David Thompson', '2021-05-18', PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL),
  new Nurse('Jessica Williams', '2021-09-03', PreferenceLevel.AVOID, PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER),
  new Nurse('Robert Martinez', '2022-02-14', PreferenceLevel.PREFER, PreferenceLevel.AVOID, PreferenceLevel.NEUTRAL),
  new Nurse('Amanda Davis', '2022-08-30', PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER, PreferenceLevel.AVOID),
  new Nurse('Christopher Lee', '2023-01-12', PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL),
  new Nurse('Lisa Anderson', '2023-06-25', PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER),
  new Nurse('Kevin Brown', '2024-01-08', PreferenceLevel.AVOID, PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL)
];

function App() {
  const [nurses, setNurses] = useState(initialNurses);
  const [schedule, setSchedule] = useState([]);

  // Generate initial schedule on component mount
  useEffect(() => {
    const scheduler = new NurseScheduler(initialNurses);
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const initialSchedule = scheduler.generateSchedule(startDate, 7);
    setSchedule(initialSchedule);
  }, []);

  const addNurse = (nurseData) => {
    const nurse = new Nurse(
      nurseData.name,
      nurseData.hireDate,
      nurseData.dayShiftPreference,
      nurseData.nightShiftPreference,
      nurseData.weekendPreference
    );
    setNurses(prev => [...prev, nurse]);
  };

  const removeNurse = (index) => {
    setNurses(prev => prev.filter((_, i) => i !== index));
  };

  const generateSchedule = (startDate, numDays) => {
    if (nurses.length === 0) {
      alert('Please add at least one nurse before generating a schedule.');
      return;
    }

    const scheduler = new NurseScheduler(nurses);
    const newSchedule = scheduler.generateSchedule(startDate, numDays);
    setSchedule(newSchedule);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Nurse Scheduling System</h1>
      </header>

      <main>
        <div className="section">
          <NurseForm onAddNurse={addNurse} />
        </div>

        <div className="section">
          <NurseList nurses={nurses} onRemoveNurse={removeNurse} />
        </div>

        <div className="section">
          <ScheduleControls onGenerateSchedule={generateSchedule} />
        </div>

        <div className="section">
          <ScheduleDisplay schedule={schedule} />
        </div>
      </main>
    </div>
  );
}

export default App;