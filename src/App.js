import React, { useState, useEffect, useCallback } from 'react';
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
  const [scheduleHasChanges, setScheduleHasChanges] = useState(false);

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
    if (!currentTenant) {
      console.log('No current tenant, skipping nurse loading');
      return;
    }
    
    console.log('Loading nurses for tenant:', currentTenant);
    setLoading(true);
    try {
      const loadedNurses = await databaseService.getAllNurses();
      console.log('Loaded nurses:', loadedNurses);
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
    setScheduleHasChanges(false); // Initial schedule has no changes
  };

  const handleTenantSelected = useCallback((tenant) => {
    console.log('Tenant selected:', tenant);
    setCurrentTenant(tenant);
    if (!tenant) {
      setNurses([]);
      setSchedule([]);
      setScheduleHasChanges(false);
    }
  }, []);

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
    setScheduleHasChanges(false); // Reset changes when generating new schedule
  };

  const handleScheduleChange = (updatedSchedule) => {
    setSchedule(updatedSchedule);
    setScheduleHasChanges(true); // Mark as changed when user edits
  };

  const saveSchedule = async () => {
    if (!schedule || schedule.length === 0) {
      alert('No schedule to save.');
      return;
    }

    try {
      console.log('Attempting to save schedule:', schedule);
      
      const scheduleData = {
        slots: schedule,
        startDate: schedule[0]?.date?.toISOString() || new Date().toISOString(),
        numDays: Math.ceil(schedule.length / 2) // Assuming 2 shifts per day
      };

      console.log('Schedule data prepared for saving:', scheduleData);

      const savedSchedule = await databaseService.saveSchedule(scheduleData);
      console.log('Schedule saved successfully:', savedSchedule);
      setScheduleHasChanges(false); // Reset changes after successful save
      alert('Schedule saved successfully!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(`Failed to save schedule: ${error.message}`);
    }
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
              <ScheduleDisplay 
                schedule={schedule} 
                allNurses={nurses}
                onScheduleChange={handleScheduleChange}
                onSaveSchedule={saveSchedule}
                hasChanges={scheduleHasChanges}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;