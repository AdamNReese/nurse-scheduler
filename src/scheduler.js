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
    this.maxHoursPerWeek = 40;
    this.hoursPerShift = 12;
    this.maxShiftsPerWeek = Math.floor(this.maxHoursPerWeek / this.hoursPerShift); // 3 shifts = 36 hours
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
    // Track nurse assignments across all shifts
    const nurseAssignments = {};
    this.nurses.forEach(nurse => {
      nurseAssignments[nurse.name] = 0;
    });
    
    // Track weekly hours for each nurse
    const weeklyHours = {};
    this.nurses.forEach(nurse => {
      weeklyHours[nurse.name] = {};
    });
    
    // Calculate optimal nurses per shift to ensure all shifts are covered
    const totalShifts = schedule.length;
    const maxPossibleShiftsPerNurse = Math.floor(this.maxHoursPerWeek / this.hoursPerShift);
    const totalAvailableShifts = this.nurses.length * maxPossibleShiftsPerNurse;
    
    // Calculate target nurses per shift to ensure coverage
    // If we have plenty of nurses, use min+1 to leave room for redistribution
    // If we're tight on nurses, use a calculated value
    const baseTarget = Math.floor(totalAvailableShifts / totalShifts);
    const optimalNursesPerShift = Math.min(
      this.maxNursesPerShift,
      Math.max(
        this.minNursesPerShift,
        baseTarget >= this.minNursesPerShift + 1 ? this.minNursesPerShift + 1 : baseTarget
      )
    );
    
    // Group shifts by date to prevent double assignments on same day
    const scheduleByDate = {};
    schedule.forEach(slot => {
      const dateKey = slot.date.toDateString();
      if (!scheduleByDate[dateKey]) {
        scheduleByDate[dateKey] = { day: null, night: null };
      }
      scheduleByDate[dateKey][slot.shift] = slot;
    });
    
    // Assign shifts day by day to prevent conflicts
    Object.values(scheduleByDate).forEach(dayShifts => {
      this._assignDayShifts(dayShifts, nurseAssignments, weeklyHours, optimalNursesPerShift);
    });
    
    // Post-processing: ensure all shifts have at least minimum coverage
    this._ensureAllShiftsCovered(schedule, nurseAssignments, weeklyHours);
  }

  _assignDayShifts(dayShifts, nurseAssignments, weeklyHours, optimalNursesPerShift) {
    const daySlot = dayShifts.day;
    const nightSlot = dayShifts.night;
    const dailyAssignedNurses = new Set();
    
    // Assign night shift first (typically has fewer willing nurses)
    if (nightSlot) {
      this._assignNursesToShift(nightSlot, Shift.NIGHT, nurseAssignments, dailyAssignedNurses, weeklyHours, optimalNursesPerShift);
    }
    
    // Then assign day shift
    if (daySlot) {
      this._assignNursesToShift(daySlot, Shift.DAY, nurseAssignments, dailyAssignedNurses, weeklyHours, optimalNursesPerShift);
    }
  }

  _assignNursesToShift(slot, shiftType, nurseAssignments, dailyAssignedNurses = new Set(), weeklyHours = {}, optimalNursesPerShift = null) {
    const targetNurses = optimalNursesPerShift || Math.min(
      this.maxNursesPerShift,
      Math.max(this.minNursesPerShift, Math.floor(this.nurses.length / 2))
    );

    const assignedNurses = [];
    
    // Get preference-based sorted nurses for this shift
    const preferenceOrder = this._getSortedNursesByPreference(shiftType, slot.isWeekend);
    const availableNurses = [...preferenceOrder];

    while (assignedNurses.length < targetNurses && availableNurses.length > 0) {
      const nurse = this._findBestNurseForSlot(slot, availableNurses, nurseAssignments, dailyAssignedNurses, weeklyHours);
      if (nurse) {
        assignedNurses.push(nurse);
        nurseAssignments[nurse.name]++;
        dailyAssignedNurses.add(nurse.name);
        
        // Track weekly hours
        const weekKey = this._getWeekKey(slot.date);
        if (!weeklyHours[nurse.name][weekKey]) {
          weeklyHours[nurse.name][weekKey] = 0;
        }
        weeklyHours[nurse.name][weekKey] += this.hoursPerShift;
        
        // Remove nurse from available list to prevent double assignment to same shift
        const index = availableNurses.indexOf(nurse);
        availableNurses.splice(index, 1);
      } else {
        break;
      }
    }
    
    // Fallback: if we don't have enough nurses and minNursesPerShift requirement isn't met,
    // first try with hour limits, then without if necessary for coverage
    if (assignedNurses.length < this.minNursesPerShift) {
      const remainingNeeded = this.minNursesPerShift - assignedNurses.length;
      
      // First try: respect hour limits
      let fallbackOrder = this._getSortedNursesByPreference(shiftType, slot.isWeekend)
        .filter(nurse => !assignedNurses.includes(nurse))
        .filter(nurse => this._canWorkMoreHours(nurse, slot.date, weeklyHours))
        .sort((a, b) => (nurseAssignments[a.name] || 0) - (nurseAssignments[b.name] || 0));
      
      for (let i = 0; i < Math.min(remainingNeeded, fallbackOrder.length); i++) {
        const nurse = fallbackOrder[i];
        assignedNurses.push(nurse);
        nurseAssignments[nurse.name]++;
        
        // Track weekly hours for fallback assignments
        const weekKey = this._getWeekKey(slot.date);
        if (!weeklyHours[nurse.name][weekKey]) {
          weeklyHours[nurse.name][weekKey] = 0;
        }
        weeklyHours[nurse.name][weekKey] += this.hoursPerShift;
      }
      
      // Second try: if still not enough nurses, ignore hour limits for critical coverage
      const stillNeeded = this.minNursesPerShift - assignedNurses.length;
      if (stillNeeded > 0 && this.nurses.length < this.minNursesPerShift * 2) {
        const emergencyOrder = this._getSortedNursesByPreference(shiftType, slot.isWeekend)
          .filter(nurse => !assignedNurses.includes(nurse))
          .sort((a, b) => (nurseAssignments[a.name] || 0) - (nurseAssignments[b.name] || 0));
        
        for (let i = 0; i < Math.min(stillNeeded, emergencyOrder.length); i++) {
          const nurse = emergencyOrder[i];
          assignedNurses.push(nurse);
          nurseAssignments[nurse.name]++;
          
          // Track weekly hours even for emergency assignments
          const weekKey = this._getWeekKey(slot.date);
          if (!weeklyHours[nurse.name][weekKey]) {
            weeklyHours[nurse.name][weekKey] = 0;
          }
          weeklyHours[nurse.name][weekKey] += this.hoursPerShift;
        }
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

  _findBestNurseForSlot(slot, preferenceOrder, nurseAssignments, dailyAssignedNurses = new Set(), weeklyHours = {}) {
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
      if (this._isNurseAvailable(nurse, slot, dailyAssignedNurses, weeklyHours)) {
        return nurse;
      }
    }
    return null;
  }

  _isNurseAvailable(nurse, slot, dailyAssignedNurses = new Set(), weeklyHours = {}) {
    // Check if nurse is already assigned to this slot
    if (slot.nurses.includes(nurse)) {
      return false;
    }
    
    // Check if nurse is already assigned to another shift on the same day
    if (dailyAssignedNurses.has(nurse.name)) {
      return false;
    }
    
    // Check if nurse would exceed weekly hour limit
    if (!this._canWorkMoreHours(nurse, slot.date, weeklyHours)) {
      return false;
    }
    
    return true;
  }

  _getWeekKey(date) {
    // Get the week starting Monday for this date
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  _canWorkMoreHours(nurse, date, weeklyHours) {
    const weekKey = this._getWeekKey(date);
    const currentWeeklyHours = weeklyHours[nurse.name] && weeklyHours[nurse.name][weekKey] || 0;
    return currentWeeklyHours + this.hoursPerShift <= this.maxHoursPerWeek;
  }

  _ensureAllShiftsCovered(schedule, nurseAssignments, weeklyHours) {
    // Find shifts with insufficient coverage
    const uncoveredShifts = schedule.filter(slot => slot.nurses.length === 0);
    const undercoveredShifts = schedule.filter(slot => slot.nurses.length > 0 && slot.nurses.length < this.minNursesPerShift);
    
    if (uncoveredShifts.length === 0 && undercoveredShifts.length === 0) {
      return; // All shifts are adequately covered
    }
    
    // Try to redistribute nurses from over-staffed shifts
    const overstaffedShifts = schedule.filter(slot => slot.nurses.length > this.minNursesPerShift);
    
    // Sort problem shifts by priority (uncovered first, then undercovered)
    const problemShifts = [...uncoveredShifts, ...undercoveredShifts].sort((a, b) => {
      if (a.nurses.length === 0 && b.nurses.length > 0) return -1;
      if (b.nurses.length === 0 && a.nurses.length > 0) return 1;
      return a.nurses.length - b.nurses.length;
    });
    
    for (const problemShift of problemShifts) {
      // Try to find nurses from overstaffed shifts on different days
      for (const overstaffedShift of overstaffedShifts) {
        if (overstaffedShift.date.toDateString() === problemShift.date.toDateString()) {
          continue; // Can't move nurses within the same day
        }
        
        if (overstaffedShift.nurses.length <= this.minNursesPerShift) {
          continue; // This shift is no longer overstaffed
        }
        
        // Find a nurse who can be moved
        const candidateNurse = overstaffedShift.nurses.find(nurse => 
          this._canWorkMoreHours(nurse, problemShift.date, weeklyHours)
        );
        
        if (candidateNurse) {
          // Move the nurse
          const nurseIndex = overstaffedShift.nurses.indexOf(candidateNurse);
          overstaffedShift.nurses.splice(nurseIndex, 1);
          problemShift.nurses.push(candidateNurse);
          
          // Update weekly hours tracking
          const weekKey = this._getWeekKey(problemShift.date);
          if (!weeklyHours[candidateNurse.name][weekKey]) {
            weeklyHours[candidateNurse.name][weekKey] = 0;
          }
          weeklyHours[candidateNurse.name][weekKey] += this.hoursPerShift;
          
          // If this shift now has minimum coverage, move to next problem shift
          if (problemShift.nurses.length >= this.minNursesPerShift) {
            break;
          }
        }
      }
      
      // If still uncovered, try emergency assignment ignoring hour limits
      if (problemShift.nurses.length === 0) {
        const allAvailableNurses = this._getSortedNursesByPreference(problemShift.shift, problemShift.isWeekend)
          .filter(nurse => {
            // Check if nurse is already working this day
            const sameDay = schedule.filter(slot => 
              slot.date.toDateString() === problemShift.date.toDateString() && 
              slot !== problemShift
            );
            return !sameDay.some(slot => slot.nurses.includes(nurse));
          })
          .sort((a, b) => (nurseAssignments[a.name] || 0) - (nurseAssignments[b.name] || 0));
        
        // Assign at least one nurse for emergency coverage
        if (allAvailableNurses.length > 0) {
          const emergencyNurse = allAvailableNurses[0];
          problemShift.nurses.push(emergencyNurse);
          nurseAssignments[emergencyNurse.name]++;
          
          // Track hours even for emergency assignments
          const weekKey = this._getWeekKey(problemShift.date);
          if (!weeklyHours[emergencyNurse.name][weekKey]) {
            weeklyHours[emergencyNurse.name][weekKey] = 0;
          }
          weeklyHours[emergencyNurse.name][weekKey] += this.hoursPerShift;
        }
      }
    }
  }
}