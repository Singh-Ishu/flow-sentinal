import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UniversalComponentList.css';

const UniversalComponentList = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);
        
        // Fetch both pipes and nodes
        const [pipesResponse, nodesResponse] = await Promise.all([
          axios.get('/pipes'),
          axios.get('/nodes')
        ]);

        // Combine and format all components
        const allComponents = [
          ...pipesResponse.data.map(pipe => ({
            id: pipe.id,
            name: pipe.id,
            type: 'pipe',
            status: pipe.status,
            material: pipe.material,
            length: pipe.length,
            diameter: pipe.diameter,
            current_flow: pipe.current_flow,
            flow_capacity: pipe.flow_capacity,
            installation_date: pipe.installation_date,
            last_inspection: pipe.last_inspection,
            source_node_id: pipe.source_node_id,
            target_node_id: pipe.target_node_id,
            pressure_loss: pipe.pressure_loss,
            componentType: 'pipe'
          })),
          ...nodesResponse.data.map(node => ({
            id: node.id,
            name: node.name,
            type: node.type,
            status: node.status,
            pressure: node.pressure,
            max_pressure: node.max_pressure,
            flow_rate: node.flow_rate,
            latitude: node.latitude,
            longitude: node.longitude,
            last_updated: node.last_updated,
            componentType: 'node'
          }))
        ];

        setComponents(allComponents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching components:', error);
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  const getStatusDisplay = (component) => {
    if (component.status === 'operational' || component.status === 'active') return 'ok';
    if (component.status === 'maintenance') return 'maintenance';
    if (component.status === 'damaged' || component.status === 'offline') return 'offline';
    if (component.status === 'demand') return 'demand';
    if (component.status === 'leak') return 'leak';
    if (component.status === 'unreported') return 'unreported';
    return component.status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return '#22c55e';
      case 'maintenance': return '#ff9800';
      case 'offline': return '#ef4444';
      case 'demand': return '#2563eb';
      case 'leak': return '#dc2626';
      case 'unreported': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pipe': return '🔧';
      case 'pump': return '⚡';
      case 'valve': return '🔄';
      case 'sensor': return '📡';
      case 'junction': return '🔗';
      default: return '📦';
    }
  };

  const filtered = components.filter(component => {
    const matchesSearch = 
      component.id.toLowerCase().includes(search.toLowerCase()) ||
      component.name.toLowerCase().includes(search.toLowerCase()) ||
      component.type.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pipes' && component.componentType === 'pipe') ||
      (filter === 'nodes' && component.componentType === 'node') ||
      (filter === component.type);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="component-list">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading components...</div>
      </div>
    );
  }

  return (
    <div className="component-list">
      <div className="search-controls">
        <input
          className="component-search"
          placeholder="Search components by ID, name, or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <select 
          className="component-filter"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Components</option>
          <option value="pipes">Pipes Only</option>
          <option value="nodes">Nodes Only</option>
          <option value="pump">Pumps</option>
          <option value="valve">Valves</option>
          <option value="sensor">Sensors</option>
          <option value="junction">Junctions</option>
        </select>
      </div>

      <div className="component-stats">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{filtered.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pipes:</span>
          <span className="stat-value">{filtered.filter(c => c.componentType === 'pipe').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Nodes:</span>
          <span className="stat-value">{filtered.filter(c => c.componentType === 'node').length}</span>
        </div>
      </div>
      
      <div className="component-list-items">
        {filtered.length === 0 ? (
          <div className="no-components">No components found</div>
        ) : (
          filtered.map(component => (
            <button 
              key={`${component.componentType}-${component.id}`} 
              className="component-list-item" 
              onClick={() => onSelect(component)}
            >
              <div className="component-info">
                <div className="component-header">
                  <span className="component-icon">{getTypeIcon(component.type)}</span>
                  <span className="component-id">{component.id}</span>
                  <span className="component-type-badge">{component.type}</span>
                </div>
                <div className="component-name">{component.name}</div>
                {component.componentType === 'pipe' && (
                  <div className="component-details">
                    {component.material} • {component.length}m • ⌀{component.diameter}mm
                  </div>
                )}
                {component.componentType === 'node' && component.pressure && (
                  <div className="component-details">
                    Pressure: {component.pressure.toFixed(1)} bar
                  </div>
                )}
              </div>
              <div className="component-status">
                <span 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(getStatusDisplay(component)) }}
                ></span>
                <span className="status-text">
                  {getStatusDisplay(component)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default UniversalComponentList;