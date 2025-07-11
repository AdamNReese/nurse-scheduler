import React, { useState, useEffect } from 'react';
import './App.css';
import NurseForm from './components/NurseForm';
import NurseList from './components/NurseList';
import ScheduleControls from './components/ScheduleControls';
import ScheduleDisplay from './components/ScheduleDisplay';
import TenantSelector from './components/TenantSelector';
import { Nurse, NurseScheduler } from './scheduler';
import { databaseService } from './services/database';

function App() {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load nurses when tenant is selected
  useEffect(() => {
    if (currentTenant) {
      loadNurses();
    }
  }, [currentTenant]);

  // Generate initial schedule when nurses are loaded
  useEffect(() => {
    if (nurses.length > 0) {
      generateInitialSchedule();
    }
  }, [nurses]);

  const loadNurses = async () => {
    if (!currentTenant) return;
    
    setLoading(true);
    try {
      const loadedNurses = await databaseService.getAllNurses();
      setNurses(loadedNurses);
    } catch (error) {
      console.error('Error loading nurses:', error);
      alert('Failed to load nurses');
    } finally {
      setLoading(false);
    }
  };

  const generateInitialSchedule = () => {
    if (nurses.length === 0) return;
    
    const scheduler = new NurseScheduler(nurses);
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const initialSchedule = scheduler.generateSchedule(startDate, 7);
    setSchedule(initialSchedule);
  };

  const handleTenantSelected = (tenant) => {
    setCurrentTenant(tenant);
    if (!tenant) {
      setNurses([]);
      setSchedule([]);
    }
  };

  const addNurse = async (nurseData) => {
    try {
      await databaseService.addNurse(nurseData);
      await loadNurses(); // Reload nurses from database
    } catch (error) {
      console.error('Error adding nurse:', error);
      alert('Failed to add nurse');
    }
  };

  const removeNurse = async (index) => {
    try {
      await databaseService.deleteNurse(index);
      await loadNurses(); // Reload nurses from database
    } catch (error) {
      console.error('Error removing nurse:', error);
      alert('Failed to remove nurse');
    }
  };

  const editNurse = async (index, updatedNurseData) => {
    try {
      await databaseService.updateNurse(index, updatedNurseData);
      await loadNurses(); // Reload nurses from database
    } catch (error) {
      console.error('Error updating nurse:', error);
      alert('Failed to update nurse');
    }
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

  if (!currentTenant) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Nurse Scheduling System</h1>
        </header>
        <main>
          <div className="section">
            <TenantSelector onTenantSelected={handleTenantSelected} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Nurse Scheduling System</h1>
        <div className="tenant-info">
          <TenantSelector onTenantSelected={handleTenantSelected} />
        </div>
      </header>

      <main>
        {loading ? (
          <div className="loading">Loading nurses...</div>
        ) : (
          <>
            <div className="section">
              <NurseForm onAddNurse={addNurse} />
            </div>

            <div className="section">
              <NurseList nurses={nurses} onRemoveNurse={removeNurse} onEditNurse={editNurse} />
            </div>

            <div className="section">
              <ScheduleControls onGenerateSchedule={generateSchedule} />
            </div>

            <div className="section">
              <ScheduleDisplay schedule={schedule} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;