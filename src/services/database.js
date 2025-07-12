import { Nurse, PreferenceLevel } from '../scheduler';

// Multi-tenant database service using localStorage for persistence
// Each tenant has isolated data storage

const STORAGE_PREFIX = 'nurse_scheduler_';
const TENANT_LIST_KEY = 'nurse_scheduler_tenants';

export class DatabaseService {
  constructor() {
    this.currentTenant = null;
    this.initializeTenantSystem();
  }

  // Initialize tenant system
  initializeTenantSystem() {
    const existingTenants = localStorage.getItem(TENANT_LIST_KEY);
    if (!existingTenants) {
      localStorage.setItem(TENANT_LIST_KEY, JSON.stringify([]));
    }
  }

  // Generate unique tenant ID
  generateTenantId() {
    return 'tenant_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get storage key for a tenant
  getTenantStorageKey(tenantId) {
    return STORAGE_PREFIX + tenantId;
  }

  // Get all tenants
  getAllTenants() {
    try {
      const tenants = localStorage.getItem(TENANT_LIST_KEY);
      return tenants ? JSON.parse(tenants) : [];
    } catch (error) {
      console.error('Error getting tenants:', error);
      return [];
    }
  }

  // Create a new tenant
  async createTenant(tenantName) {
    try {
      const tenantId = this.generateTenantId();
      const tenant = {
        id: tenantId,
        name: tenantName,
        createdAt: new Date().toISOString()
      };

      // Add to tenant list
      const tenants = this.getAllTenants();
      tenants.push(tenant);
      localStorage.setItem(TENANT_LIST_KEY, JSON.stringify(tenants));

      // Initialize tenant with sample data
      await this.initializeTenantData(tenantId);

      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  // Initialize tenant with sample nurse data
  async initializeTenantData(tenantId) {
    const initialNurses = [
      {
        name: 'Sarah Johnson',
        hireDate: '2018-03-15',
        dayShiftPreference: PreferenceLevel.PREFER,
        nightShiftPreference: PreferenceLevel.AVOID,
        weekendPreference: PreferenceLevel.NEUTRAL
      },
      {
        name: 'Michael Chen',
        hireDate: '2019-07-22',
        dayShiftPreference: PreferenceLevel.NEUTRAL,
        nightShiftPreference: PreferenceLevel.PREFER,
        weekendPreference: PreferenceLevel.AVOID
      },
      {
        name: 'Emily Rodriguez',
        hireDate: '2020-01-10',
        dayShiftPreference: PreferenceLevel.PREFER,
        nightShiftPreference: PreferenceLevel.NEUTRAL,
        weekendPreference: PreferenceLevel.PREFER
      },
      {
        name: 'David Thompson',
        hireDate: '2021-05-18',
        dayShiftPreference: PreferenceLevel.NEUTRAL,
        nightShiftPreference: PreferenceLevel.PREFER,
        weekendPreference: PreferenceLevel.NEUTRAL
      },
      {
        name: 'Jessica Williams',
        hireDate: '2021-09-03',
        dayShiftPreference: PreferenceLevel.AVOID,
        nightShiftPreference: PreferenceLevel.NEUTRAL,
        weekendPreference: PreferenceLevel.PREFER
      },
      {
        name: 'Robert Martinez',
        hireDate: '2022-02-14',
        dayShiftPreference: PreferenceLevel.PREFER,
        nightShiftPreference: PreferenceLevel.AVOID,
        weekendPreference: PreferenceLevel.NEUTRAL
      },
      {
        name: 'Amanda Davis',
        hireDate: '2022-08-30',
        dayShiftPreference: PreferenceLevel.NEUTRAL,
        nightShiftPreference: PreferenceLevel.PREFER,
        weekendPreference: PreferenceLevel.AVOID
      },
      {
        name: 'Christopher Lee',
        hireDate: '2023-01-12',
        dayShiftPreference: PreferenceLevel.NEUTRAL,
        nightShiftPreference: PreferenceLevel.PREFER,
        weekendPreference: PreferenceLevel.NEUTRAL
      },
      {
        name: 'Lisa Anderson',
        hireDate: '2023-06-25',
        dayShiftPreference: PreferenceLevel.PREFER,
        nightShiftPreference: PreferenceLevel.NEUTRAL,
        weekendPreference: PreferenceLevel.PREFER
      },
      {
        name: 'Kevin Brown',
        hireDate: '2024-01-08',
        dayShiftPreference: PreferenceLevel.AVOID,
        nightShiftPreference: PreferenceLevel.PREFER,
        weekendPreference: PreferenceLevel.NEUTRAL
      },
      {
        name: 'Maria Gonzalez',
        hireDate: '2024-03-22',
        dayShiftPreference: PreferenceLevel.PREFER,
        nightShiftPreference: PreferenceLevel.AVOID,
        weekendPreference: PreferenceLevel.PREFER
      },
      {
        name: 'James Wilson',
        hireDate: '2024-04-15',
        dayShiftPreference: PreferenceLevel.NEUTRAL,
        nightShiftPreference: PreferenceLevel.NEUTRAL,
        weekendPreference: PreferenceLevel.AVOID
      },
      {
        name: 'Patricia Taylor',
        hireDate: '2024-05-10',
        dayShiftPreference: PreferenceLevel.AVOID,
        nightShiftPreference: PreferenceLevel.PREFER,
        weekendPreference: PreferenceLevel.NEUTRAL
      },
      {
        name: 'Thomas Garcia',
        hireDate: '2024-06-18',
        dayShiftPreference: PreferenceLevel.PREFER,
        nightShiftPreference: PreferenceLevel.NEUTRAL,
        weekendPreference: PreferenceLevel.PREFER
      },
      {
        name: 'Jennifer Moore',
        hireDate: '2024-07-05',
        dayShiftPreference: PreferenceLevel.NEUTRAL,
        nightShiftPreference: PreferenceLevel.PREFER,
        weekendPreference: PreferenceLevel.AVOID
      }
    ];

    await this.saveTenantData(tenantId, { nurses: initialNurses, schedules: [] });
  }

  // Set current tenant
  setCurrentTenant(tenantId) {
    this.currentTenant = tenantId;
    localStorage.setItem('current_tenant', tenantId);
  }

  // Get current tenant
  getCurrentTenant() {
    if (!this.currentTenant) {
      this.currentTenant = localStorage.getItem('current_tenant');
    }
    return this.currentTenant;
  }

  // Save data for a specific tenant
  async saveTenantData(tenantId, data) {
    try {
      const storageKey = this.getTenantStorageKey(tenantId);
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving tenant data:', error);
      throw error;
    }
  }

  // Load data for a specific tenant
  async loadTenantData(tenantId) {
    try {
      const storageKey = this.getTenantStorageKey(tenantId);
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : { nurses: [], schedules: [] };
    } catch (error) {
      console.error('Error loading tenant data:', error);
      throw error;
    }
  }

  // Get all nurses for current tenant
  async getAllNurses() {
    try {
      const tenantId = this.getCurrentTenant();
      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      const data = await this.loadTenantData(tenantId);
      return data.nurses.map(nurseData => new Nurse(
        nurseData.name,
        nurseData.hireDate,
        nurseData.dayShiftPreference,
        nurseData.nightShiftPreference,
        nurseData.weekendPreference
      ));
    } catch (error) {
      console.error('Error getting nurses:', error);
      throw error;
    }
  }

  // Save all nurses for current tenant
  async saveAllNurses(nurses) {
    try {
      const tenantId = this.getCurrentTenant();
      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      const nurseData = nurses.map(nurse => ({
        name: nurse.name,
        hireDate: nurse.hireDate.toISOString().split('T')[0],
        dayShiftPreference: nurse.dayShiftPreference,
        nightShiftPreference: nurse.nightShiftPreference,
        weekendPreference: nurse.weekendPreference
      }));

      const currentData = await this.loadTenantData(tenantId);
      currentData.nurses = nurseData;
      await this.saveTenantData(tenantId, currentData);
      return true;
    } catch (error) {
      console.error('Error saving nurses:', error);
      throw error;
    }
  }

  // Add a new nurse for current tenant
  async addNurse(nurseData) {
    try {
      const tenantId = this.getCurrentTenant();
      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      const data = await this.loadTenantData(tenantId);
      const newNurse = {
        name: nurseData.name,
        hireDate: nurseData.hireDate,
        dayShiftPreference: nurseData.dayShiftPreference,
        nightShiftPreference: nurseData.nightShiftPreference,
        weekendPreference: nurseData.weekendPreference
      };

      data.nurses.push(newNurse);
      await this.saveTenantData(tenantId, data);
      
      return new Nurse(
        newNurse.name,
        newNurse.hireDate,
        newNurse.dayShiftPreference,
        newNurse.nightShiftPreference,
        newNurse.weekendPreference
      );
    } catch (error) {
      console.error('Error adding nurse:', error);
      throw error;
    }
  }

  // Update a nurse for current tenant
  async updateNurse(index, nurseData) {
    try {
      const tenantId = this.getCurrentTenant();
      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      const data = await this.loadTenantData(tenantId);
      
      if (index >= 0 && index < data.nurses.length) {
        data.nurses[index] = {
          name: nurseData.name,
          hireDate: nurseData.hireDate,
          dayShiftPreference: nurseData.dayShiftPreference,
          nightShiftPreference: nurseData.nightShiftPreference,
          weekendPreference: nurseData.weekendPreference
        };

        await this.saveTenantData(tenantId, data);
        
        return new Nurse(
          nurseData.name,
          nurseData.hireDate,
          nurseData.dayShiftPreference,
          nurseData.nightShiftPreference,
          nurseData.weekendPreference
        );
      } else {
        throw new Error('Invalid nurse index');
      }
    } catch (error) {
      console.error('Error updating nurse:', error);
      throw error;
    }
  }

  // Delete a nurse for current tenant
  async deleteNurse(index) {
    try {
      const tenantId = this.getCurrentTenant();
      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      const data = await this.loadTenantData(tenantId);
      
      if (index >= 0 && index < data.nurses.length) {
        data.nurses.splice(index, 1);
        await this.saveTenantData(tenantId, data);
        return true;
      } else {
        throw new Error('Invalid nurse index');
      }
    } catch (error) {
      console.error('Error deleting nurse:', error);
      throw error;
    }
  }

  // Delete a tenant and all its data
  async deleteTenant(tenantId) {
    try {
      // Remove from tenant list
      const tenants = this.getAllTenants();
      const filteredTenants = tenants.filter(t => t.id !== tenantId);
      localStorage.setItem(TENANT_LIST_KEY, JSON.stringify(filteredTenants));

      // Remove tenant data
      const storageKey = this.getTenantStorageKey(tenantId);
      localStorage.removeItem(storageKey);

      // If this was the current tenant, clear it
      if (this.getCurrentTenant() === tenantId) {
        this.currentTenant = null;
        localStorage.removeItem('current_tenant');
      }

      return true;
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  // Save schedule for current tenant
  async saveSchedule(scheduleData) {
    try {
      console.log('Saving schedule data:', scheduleData);
      
      const tenantId = this.getCurrentTenant();
      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      const data = await this.loadTenantData(tenantId);
      
      // Validate schedule data
      if (!scheduleData || !scheduleData.slots || !Array.isArray(scheduleData.slots)) {
        throw new Error('Invalid schedule data: missing or invalid slots');
      }

      // Convert schedule to serializable format
      const serializedSchedule = {
        id: scheduleData.id || Date.now().toString(),
        name: scheduleData.name || `Schedule ${new Date().toLocaleDateString()}`,
        startDate: scheduleData.startDate,
        numDays: scheduleData.numDays,
        createdAt: new Date().toISOString(),
        slots: scheduleData.slots.map((slot, index) => {
          try {
            return {
              date: slot.date instanceof Date ? slot.date.toISOString() : new Date(slot.date).toISOString(),
              shift: slot.shift,
              nurses: (slot.nurses || []).map(nurse => {
                if (!nurse || !nurse.name) {
                  console.warn('Invalid nurse data at slot', index, nurse);
                  return null;
                }
                return {
                  name: nurse.name,
                  hireDate: nurse.hireDate instanceof Date ? nurse.hireDate.toISOString().split('T')[0] : nurse.hireDate,
                  dayShiftPreference: nurse.dayShiftPreference,
                  nightShiftPreference: nurse.nightShiftPreference,
                  weekendPreference: nurse.weekendPreference
                };
              }).filter(nurse => nurse !== null)
            };
          } catch (slotError) {
            console.error('Error processing slot at index', index, slotError);
            throw new Error(`Error processing slot ${index}: ${slotError.message}`);
          }
        })
      };

      // Ensure schedules array exists
      if (!data.schedules) {
        data.schedules = [];
      }

      // Replace existing schedule or add new one
      const existingIndex = data.schedules.findIndex(s => s.id === serializedSchedule.id);
      if (existingIndex >= 0) {
        data.schedules[existingIndex] = serializedSchedule;
      } else {
        data.schedules.push(serializedSchedule);
      }

      await this.saveTenantData(tenantId, data);
      console.log('Schedule saved successfully:', serializedSchedule.id);
      return serializedSchedule;
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  }

  // Get all schedules for current tenant
  async getAllSchedules() {
    try {
      const tenantId = this.getCurrentTenant();
      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      const data = await this.loadTenantData(tenantId);
      return data.schedules || [];
    } catch (error) {
      console.error('Error getting schedules:', error);
      throw error;
    }
  }

  // Delete a schedule
  async deleteSchedule(scheduleId) {
    try {
      const tenantId = this.getCurrentTenant();
      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      const data = await this.loadTenantData(tenantId);
      data.schedules = data.schedules.filter(s => s.id !== scheduleId);
      
      await this.saveTenantData(tenantId, data);
      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  // Clear all data (for testing purposes)
  async clearAllData() {
    try {
      const tenants = this.getAllTenants();
      for (const tenant of tenants) {
        const storageKey = this.getTenantStorageKey(tenant.id);
        localStorage.removeItem(storageKey);
      }
      localStorage.removeItem(TENANT_LIST_KEY);
      localStorage.removeItem('current_tenant');
      this.currentTenant = null;
      this.initializeTenantSystem();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const databaseService = new DatabaseService();