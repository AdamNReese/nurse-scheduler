import React, { useState, useEffect, useCallback, useRef } from 'react';
import { databaseService } from '../services/database';

const TenantSelector = ({ onTenantSelected }) => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const onTenantSelectedRef = useRef(onTenantSelected);

  // Keep ref up to date
  useEffect(() => {
    onTenantSelectedRef.current = onTenantSelected;
  }, [onTenantSelected]);

  const loadTenants = useCallback(() => {
    const allTenants = databaseService.getAllTenants();
    setTenants(allTenants);
    return allTenants;
  }, []);

  // Initialize component and check for existing tenant
  useEffect(() => {
    const allTenants = loadTenants();
    const currentTenantId = databaseService.getCurrentTenant();
    
    if (currentTenantId && allTenants.length > 0) {
      const tenant = allTenants.find(t => t.id === currentTenantId);
      if (tenant) {
        setSelectedTenant(tenant);
        onTenantSelectedRef.current(tenant);
      }
    }
    
    setInitialized(true);
  }, [loadTenants]); // Removed onTenantSelected dependency

  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
    databaseService.setCurrentTenant(tenant.id);
    onTenantSelected(tenant);
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    setLoading(true);
    try {
      const newTenant = await databaseService.createTenant(newTenantName.trim());
      loadTenants(); // Reload all tenants
      setNewTenantName('');
      setShowCreateForm(false);
      handleTenantSelect(newTenant);
    } catch (error) {
      console.error('Error creating tenant:', error);
      alert('Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId, tenantName) => {
    if (window.confirm(`Are you sure you want to delete "${tenantName}" and all its data?`)) {
      try {
        await databaseService.deleteTenant(tenantId);
        loadTenants(); // Reload all tenants
        
        if (selectedTenant?.id === tenantId) {
          setSelectedTenant(null);
          onTenantSelected(null);
        }
      } catch (error) {
        console.error('Error deleting tenant:', error);
        alert('Failed to delete tenant');
      }
    }
  };

  if (selectedTenant) {
    return (
      <div className="tenant-selector">
        <div className="current-tenant">
          <h3>Current Organization: {selectedTenant.name}</h3>
          <button onClick={() => setSelectedTenant(null)}>Switch Organization</button>
        </div>
      </div>
    );
  }

  // Show loading while checking for existing tenant
  if (!initialized) {
    return (
      <div className="tenant-selector">
        <div className="loading">Checking for existing organization...</div>
      </div>
    );
  }

  return (
    <div className="tenant-selector">
      <h2>Select or Create an Organization</h2>
      
      {tenants.length > 0 && (
        <div className="existing-tenants">
          <h3>Existing Organizations</h3>
          <div className="tenant-list">
            {tenants.map(tenant => (
              <div key={tenant.id} className="tenant-item">
                <div className="tenant-info">
                  <h4>{tenant.name}</h4>
                  <p>Created: {new Date(tenant.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="tenant-actions">
                  <button onClick={() => handleTenantSelect(tenant)}>Select</button>
                  <button 
                    onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="create-tenant-section">
        {!showCreateForm ? (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="create-tenant-btn"
          >
            Create New Organization
          </button>
        ) : (
          <form onSubmit={handleCreateTenant} className="create-tenant-form">
            <h3>Create New Organization</h3>
            <div className="form-group">
              <label htmlFor="tenantName">Organization Name:</label>
              <input
                type="text"
                id="tenantName"
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTenantName('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TenantSelector;