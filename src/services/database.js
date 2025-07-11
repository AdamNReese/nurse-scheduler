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
      }
    ];

    await this.saveTenantData(tenantId, { nurses: initialNurses });
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
      return data ? JSON.parse(data) : { nurses: [] };
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

      await this.saveTenantData(tenantId, { nurses: nurseData });
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