export const Shift = {
  DAY: 'day',
  NIGHT: 'night'
};

export const PreferenceLevel = {
  PREFER: 'prefer',
  NEUTRAL: 'neutral',
  AVOID: 'avoid'
};

export class Nurse {
  constructor(name, hireDate, dayShiftPreference, nightShiftPreference, weekendPreference) {
    this.name = name;
    this.hireDate = new Date(hireDate);
    this.dayShiftPreference = dayShiftPreference;
    this.nightShiftPreference = nightShiftPreference;
    this.weekendPreference = weekendPreference;
    
    if (this.hireDate > new Date()) {
      throw new Error('Hire date cannot be in the future');
    }
  }

  get seniorityYears() {
    const today = new Date();
    const diffTime = today - this.hireDate;
    return diffTime / (1000 * 60 * 60 * 24 * 365.25);
  }
}

export class ScheduleSlot {
  constructor(date, shift, nurses = []) {
    this.date = new Date(date);
    this.shift = shift;
    this.nurses = nurses;
  }

  get isWeekend() {
    return this.date.getDay() === 0 || this.date.getDay() === 6; // Sunday = 0, Saturday = 6
  }
}

export class NurseScheduler {
  constructor(nurses) {
    this.nurses = nurses;
    this.minNursesPerShift = 3;
    this.maxNursesPerShift = 5;
  }

  generateSchedule(startDate, numDays) {
    const schedule = [];
    
    // Create all schedule slots
    for (let day = 0; day < numDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      schedule.push(new ScheduleSlot(currentDate, Shift.DAY));
      schedule.push(new ScheduleSlot(currentDate, Shift.NIGHT));
    }
    
    // Assign nurses to shifts
    this._assignShifts(schedule);
    
    return schedule;
  }

  _assignShifts(schedule) {
    const nightShifts = schedule.filter(slot => slot.shift === Shift.NIGHT);
    const dayShifts = schedule.filter(slot => slot.shift === Shift.DAY);
    
    this._assignNightShifts(nightShifts);
    this._assignDayShifts(dayShifts);
  }

  _assignNightShifts(nightShifts) {
    // Sort nurses by night shift preference (prefer first), then by seniority (newest first)
    const nightPreferenceOrder = [...this.nurses].sort((a, b) => {
      if (a.nightShiftPreference === PreferenceLevel.PREFER && b.nightShiftPreference !== PreferenceLevel.PREFER) return -1;
      if (b.nightShiftPreference === PreferenceLevel.PREFER && a.nightShiftPreference !== PreferenceLevel.PREFER) return 1;
      if (a.nightShiftPreference === PreferenceLevel.AVOID && b.nightShiftPreference !== PreferenceLevel.AVOID) return 1;
      if (b.nightShiftPreference === PreferenceLevel.AVOID && a.nightShiftPreference !== PreferenceLevel.AVOID) return -1;
      return a.seniorityYears - b.seniorityYears; // Lower seniority (newer) first
    });

    // Track nurse assignments across all shifts
    const nurseAssignments = {};
    this.nurses.forEach(nurse => {
      nurseAssignments[nurse.name] = 0;
    });

    nightShifts.forEach(slot => {
      this._assignNursesToShift(slot, nightPreferenceOrder, nurseAssignments);
    });
  }

  _assignDayShifts(dayShifts) {
    const dayPreferenceOrder = [...this.nurses].sort((a, b) => {
      if (a.dayShiftPreference === PreferenceLevel.PREFER && b.dayShiftPreference !== PreferenceLevel.PREFER) return -1;
      if (b.dayShiftPreference === PreferenceLevel.PREFER && a.dayShiftPreference !== PreferenceLevel.PREFER) return 1;
      if (a.dayShiftPreference === PreferenceLevel.AVOID && b.dayShiftPreference !== PreferenceLevel.AVOID) return 1;
      if (b.dayShiftPreference === PreferenceLevel.AVOID && a.dayShiftPreference !== PreferenceLevel.AVOID) return -1;
      return a.seniorityYears - b.seniorityYears; // Lower seniority (newer) first
    });

    // Track nurse assignments across all shifts
    const nurseAssignments = {};
    this.nurses.forEach(nurse => {
      nurseAssignments[nurse.name] = 0;
    });

    dayShifts.forEach(slot => {
      this._assignNursesToShift(slot, dayPreferenceOrder, nurseAssignments);
    });
  }

  _assignNursesToShift(slot, preferenceOrder, nurseAssignments) {
    const targetNurses = Math.min(
      this.maxNursesPerShift,
      Math.max(this.minNursesPerShift, Math.floor(this.nurses.length / 2))
    );

    const assignedNurses = [];
    const availableNurses = [...preferenceOrder];

    while (assignedNurses.length < targetNurses && availableNurses.length > 0) {
      const nurse = this._findBestNurseForSlot(slot, availableNurses, nurseAssignments);
      if (nurse) {
        assignedNurses.push(nurse);
        nurseAssignments[nurse.name]++;
        // Remove nurse from available list to prevent double assignment to same shift
        const index = availableNurses.indexOf(nurse);
        availableNurses.splice(index, 1);
      } else {
        break;
      }
    }

    slot.nurses = assignedNurses;
  }

  _findBestNurseForSlot(slot, preferenceOrder, nurseAssignments) {
    // Sort by current assignment count (fewer assignments first) and then by preference order
    const sortedNurses = [...preferenceOrder].sort((a, b) => {
      const aAssignments = nurseAssignments[a.name] || 0;
      const bAssignments = nurseAssignments[b.name] || 0;
      if (aAssignments !== bAssignments) {
        return aAssignments - bAssignments;
      }
      return preferenceOrder.indexOf(a) - preferenceOrder.indexOf(b);
    });

    for (const nurse of sortedNurses) {
      if (this._isNurseAvailable(nurse, slot)) {
        if (slot.isWeekend && nurse.weekendPreference === PreferenceLevel.AVOID) {
          continue;
        }
        return nurse;
      }
    }
    return null;
  }

  _isNurseAvailable(nurse, slot) {
    // Check if nurse is already assigned to this slot
    if (slot.nurses.includes(nurse)) {
      return false;
    }
    return true;
  }
}