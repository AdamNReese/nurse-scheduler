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
    
    // Track nurse assignments across all shifts
    const nurseAssignments = {};
    this.nurses.forEach(nurse => {
      nurseAssignments[nurse.name] = 0;
    });
    
    this._assignNightShifts(nightShifts, nurseAssignments);
    this._assignDayShifts(dayShifts, nurseAssignments);
  }

  _assignNightShifts(nightShifts, nurseAssignments) {
    nightShifts.forEach(slot => {
      this._assignNursesToShift(slot, Shift.NIGHT, nurseAssignments);
    });
  }

  _assignDayShifts(dayShifts, nurseAssignments) {
    dayShifts.forEach(slot => {
      this._assignNursesToShift(slot, Shift.DAY, nurseAssignments);
    });
  }

  _assignNursesToShift(slot, shiftType, nurseAssignments) {
    const targetNurses = Math.min(
      this.maxNursesPerShift,
      Math.max(this.minNursesPerShift, Math.floor(this.nurses.length / 2))
    );

    const assignedNurses = [];
    
    // Get preference-based sorted nurses for this shift
    const preferenceOrder = this._getSortedNursesByPreference(shiftType, slot.isWeekend);
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

  _getSortedNursesByPreference(shiftType, isWeekend) {
    return [...this.nurses].sort((a, b) => {
      // Get preferences for the specific shift type
      const aShiftPref = shiftType === Shift.DAY ? a.dayShiftPreference : a.nightShiftPreference;
      const bShiftPref = shiftType === Shift.DAY ? b.dayShiftPreference : b.nightShiftPreference;
      
      // Consider weekend preference for weekend shifts
      const aWeekendPref = isWeekend ? a.weekendPreference : PreferenceLevel.NEUTRAL;
      const bWeekendPref = isWeekend ? b.weekendPreference : PreferenceLevel.NEUTRAL;
      
      // Calculate preference scores (lower is better)
      const getPreferenceScore = (shiftPref, weekendPref) => {
        let score = 0;
        
        // Shift preference (most important)
        if (shiftPref === PreferenceLevel.PREFER) score -= 10;
        else if (shiftPref === PreferenceLevel.AVOID) score += 10;
        
        // Weekend preference (less important)
        if (weekendPref === PreferenceLevel.PREFER) score -= 3;
        else if (weekendPref === PreferenceLevel.AVOID) score += 5; // Penalize avoiding weekends more
        
        return score;
      };
      
      const aScore = getPreferenceScore(aShiftPref, aWeekendPref);
      const bScore = getPreferenceScore(bShiftPref, bWeekendPref);
      
      // First sort by preference score
      if (aScore !== bScore) {
        return aScore - bScore;
      }
      
      // If preferences are equal, sort by seniority (lower seniority/newer nurses first)
      return a.seniorityYears - b.seniorityYears;
    });
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