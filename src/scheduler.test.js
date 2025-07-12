import { Nurse, NurseScheduler, PreferenceLevel, Shift } from './scheduler';

describe('NurseScheduler', () => {
  let nurses;
  let scheduler;

  beforeEach(() => {
    // Create test nurses with different preferences and seniority levels
    nurses = [
      new Nurse('Alice Senior', '2018-01-01', PreferenceLevel.PREFER, PreferenceLevel.AVOID, PreferenceLevel.NEUTRAL),
      new Nurse('Bob Junior', '2023-01-01', PreferenceLevel.AVOID, PreferenceLevel.PREFER, PreferenceLevel.PREFER),
      new Nurse('Carol Mid', '2020-01-01', PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL, PreferenceLevel.AVOID),
      new Nurse('Dave Newest', '2024-01-01', PreferenceLevel.PREFER, PreferenceLevel.AVOID, PreferenceLevel.PREFER),
      new Nurse('Eve Senior2', '2019-01-01', PreferenceLevel.AVOID, PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL)
    ];
    scheduler = new NurseScheduler(nurses);
  });

  describe('Nurse class', () => {
    test('should calculate seniority correctly', () => {
      const nurse = new Nurse('Test', '2020-01-01', PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL);
      expect(nurse.seniorityYears).toBeGreaterThan(4);
      expect(nurse.seniorityYears).toBeLessThan(6);
    });

    test('should throw error for future hire date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      expect(() => {
        new Nurse('Test', futureDate.toISOString().split('T')[0], PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL);
      }).toThrow('Hire date cannot be in the future');
    });
  });

  describe('Schedule generation', () => {
    test('should generate correct number of slots', () => {
      const schedule = scheduler.generateSchedule(new Date('2024-01-01'), 7);
      expect(schedule).toHaveLength(14); // 7 days * 2 shifts per day
    });

    test('should create day and night shifts for each day', () => {
      const schedule = scheduler.generateSchedule(new Date('2024-01-01'), 3);
      
      const dayShifts = schedule.filter(slot => slot.shift === Shift.DAY);
      const nightShifts = schedule.filter(slot => slot.shift === Shift.NIGHT);
      
      expect(dayShifts).toHaveLength(3);
      expect(nightShifts).toHaveLength(3);
    });

    test('should assign nurses to all shifts', () => {
      const schedule = scheduler.generateSchedule(new Date('2024-01-01'), 7);
      
      schedule.forEach(slot => {
        expect(slot.nurses.length).toBeGreaterThanOrEqual(scheduler.minNursesPerShift);
        expect(slot.nurses.length).toBeLessThanOrEqual(scheduler.maxNursesPerShift);
      });
    });
  });

  describe('Preference-based assignment', () => {
    test('should prioritize nurses who prefer day shifts for day shifts', () => {
      const schedule = scheduler.generateSchedule(new Date('2024-01-01'), 7);
      const dayShifts = schedule.filter(slot => slot.shift === Shift.DAY);
      
      // Count assignments for nurses who prefer day shifts
      const dayPreferenceNurses = nurses.filter(n => n.dayShiftPreference === PreferenceLevel.PREFER);
      const dayAvoidanceNurses = nurses.filter(n => n.dayShiftPreference === PreferenceLevel.AVOID);
      
      let preferenceAssignments = 0;
      let avoidanceAssignments = 0;
      
      dayShifts.forEach(slot => {
        slot.nurses.forEach(nurse => {
          if (dayPreferenceNurses.some(n => n.name === nurse.name)) {
            preferenceAssignments++;
          }
          if (dayAvoidanceNurses.some(n => n.name === nurse.name)) {
            avoidanceAssignments++;
          }
        });
      });
      
      // Nurses who prefer day shifts should get more day shift assignments
      expect(preferenceAssignments).toBeGreaterThan(avoidanceAssignments);
    });

    test('should prioritize nurses who prefer night shifts for night shifts', () => {
      const schedule = scheduler.generateSchedule(new Date('2024-01-01'), 7);
      const nightShifts = schedule.filter(slot => slot.shift === Shift.NIGHT);
      
      // Count assignments for nurses who prefer night shifts
      const nightPreferenceNurses = nurses.filter(n => n.nightShiftPreference === PreferenceLevel.PREFER);
      const nightAvoidanceNurses = nurses.filter(n => n.nightShiftPreference === PreferenceLevel.AVOID);
      
      let preferenceAssignments = 0;
      let avoidanceAssignments = 0;
      
      nightShifts.forEach(slot => {
        slot.nurses.forEach(nurse => {
          if (nightPreferenceNurses.some(n => n.name === nurse.name)) {
            preferenceAssignments++;
          }
          if (nightAvoidanceNurses.some(n => n.name === nurse.name)) {
            avoidanceAssignments++;
          }
        });
      });
      
      // Nurses who prefer night shifts should get more night shift assignments
      expect(preferenceAssignments).toBeGreaterThan(avoidanceAssignments);
    });

    test('should consider weekend preferences for weekend shifts', () => {
      // Generate schedule starting on a Saturday
      const saturdayDate = new Date(2024, 0, 13); // This is a Saturday
      const schedule = scheduler.generateSchedule(saturdayDate, 2); // Saturday and Sunday
      
      const weekendShifts = schedule.filter(slot => slot.isWeekend);
      const weekendPreferenceNurses = nurses.filter(n => n.weekendPreference === PreferenceLevel.PREFER);
      
      let weekendPreferenceAssignments = 0;
      
      weekendShifts.forEach(slot => {
        slot.nurses.forEach(nurse => {
          if (weekendPreferenceNurses.some(n => n.name === nurse.name)) {
            weekendPreferenceAssignments++;
          }
        });
      });
      
      // Should have some weekend preference assignments
      expect(weekendPreferenceAssignments).toBeGreaterThan(0);
    });
  });

  describe('Seniority-based assignment after preferences', () => {
    test('should use seniority as tiebreaker when preferences are equal', () => {
      // Create nurses with same preferences but different seniority
      const equalPreferenceNurses = [
        new Nurse('Senior Same', '2018-01-01', PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL),
        new Nurse('Junior Same', '2023-01-01', PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL),
        new Nurse('Mid Same', '2020-01-01', PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL)
      ];
      
      const equalScheduler = new NurseScheduler(equalPreferenceNurses);
      const schedule = equalScheduler.generateSchedule(new Date('2024-01-01'), 3);
      
      const dayShifts = schedule.filter(slot => slot.shift === Shift.DAY);
      
      // Count assignments for each nurse
      const assignments = {};
      equalPreferenceNurses.forEach(nurse => {
        assignments[nurse.name] = 0;
      });
      
      dayShifts.forEach(slot => {
        slot.nurses.forEach(nurse => {
          assignments[nurse.name]++;
        });
      });
      
      // Junior (lower seniority) should get more assignments when preferences are equal
      expect(assignments['Junior Same']).toBeGreaterThanOrEqual(assignments['Senior Same']);
    });
  });

  describe('Assignment distribution', () => {
    test('should distribute assignments fairly among nurses', () => {
      const schedule = scheduler.generateSchedule(new Date('2024-01-01'), 14); // 2 weeks
      
      // Count total assignments per nurse
      const assignments = {};
      nurses.forEach(nurse => {
        assignments[nurse.name] = 0;
      });
      
      schedule.forEach(slot => {
        slot.nurses.forEach(nurse => {
          assignments[nurse.name]++;
        });
      });
      
      const assignmentCounts = Object.values(assignments);
      const maxAssignments = Math.max(...assignmentCounts);
      const minAssignments = Math.min(...assignmentCounts);
      
      // Difference should not be too large (reasonable fairness)
      expect(maxAssignments - minAssignments).toBeLessThanOrEqual(3);
    });

    test('should not assign same nurse to multiple shifts on same day when possible', () => {
      // Create scheduler with enough nurses to avoid conflicts
      const manyNurses = [
        new Nurse('Nurse1', '2020-01-01', PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL),
        new Nurse('Nurse2', '2020-01-01', PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL),
        new Nurse('Nurse3', '2020-01-01', PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL),
        new Nurse('Nurse4', '2020-01-01', PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL),
        new Nurse('Nurse5', '2020-01-01', PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER),
        new Nurse('Nurse6', '2020-01-01', PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER),
        new Nurse('Nurse7', '2020-01-01', PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL),
        new Nurse('Nurse8', '2020-01-01', PreferenceLevel.NEUTRAL, PreferenceLevel.PREFER, PreferenceLevel.NEUTRAL)
      ];
      const manyScheduler = new NurseScheduler(manyNurses);
      const schedule = manyScheduler.generateSchedule(new Date(2024, 0, 1), 3);
      
      // Group by date
      const scheduleByDate = {};
      schedule.forEach(slot => {
        const dateKey = slot.date.toDateString();
        if (!scheduleByDate[dateKey]) {
          scheduleByDate[dateKey] = [];
        }
        scheduleByDate[dateKey].push(slot);
      });
      
      // Check each day for duplicates when we have enough nurses
      Object.values(scheduleByDate).forEach(daySlots => {
        const allNursesForDay = [];
        daySlots.forEach(slot => {
          slot.nurses.forEach(nurse => {
            allNursesForDay.push(nurse.name);
          });
        });
        
        // With enough nurses, there should be no duplicates
        const uniqueNurses = new Set(allNursesForDay);
        expect(uniqueNurses.size).toBe(allNursesForDay.length);
      });
    });
  });

  describe('Edge cases', () => {
    test('should handle minimum number of nurses', () => {
      const minNurses = [
        new Nurse('Only One', '2020-01-01', PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL)
      ];
      const minScheduler = new NurseScheduler(minNurses);
      const schedule = minScheduler.generateSchedule(new Date('2024-01-01'), 1);
      
      // Should still create schedule even with only one nurse
      expect(schedule).toHaveLength(2);
      schedule.forEach(slot => {
        expect(slot.nurses.length).toBeGreaterThan(0);
      });
    });

    test('should handle nurses with all avoid preferences', () => {
      const avoidAllNurses = [
        new Nurse('Avoid Day', '2020-01-01', PreferenceLevel.AVOID, PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL),
        new Nurse('Avoid Night', '2020-01-01', PreferenceLevel.NEUTRAL, PreferenceLevel.AVOID, PreferenceLevel.NEUTRAL),
        new Nurse('Avoid Weekend', '2020-01-01', PreferenceLevel.NEUTRAL, PreferenceLevel.NEUTRAL, PreferenceLevel.AVOID)
      ];
      
      const avoidScheduler = new NurseScheduler(avoidAllNurses);
      const schedule = avoidScheduler.generateSchedule(new Date('2024-01-06'), 2); // Weekend
      
      // Should still assign nurses despite preferences
      schedule.forEach(slot => {
        expect(slot.nurses.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Weekend detection', () => {
    test('should correctly identify weekend days', () => {
      const saturday = new Date(2024, 0, 13); // Saturday Jan 13, 2024 (using local time)
      const sunday = new Date(2024, 0, 14); // Sunday
      const monday = new Date(2024, 0, 15); // Monday
      
      const schedule = scheduler.generateSchedule(saturday, 3);
      
      const saturdaySlots = schedule.filter(slot => slot.date.toDateString() === saturday.toDateString());
      const sundaySlots = schedule.filter(slot => slot.date.toDateString() === sunday.toDateString());
      const mondaySlots = schedule.filter(slot => slot.date.toDateString() === monday.toDateString());
      
      saturdaySlots.forEach(slot => expect(slot.isWeekend).toBe(true));
      sundaySlots.forEach(slot => expect(slot.isWeekend).toBe(true));
      mondaySlots.forEach(slot => expect(slot.isWeekend).toBe(false));
    });
  });
});