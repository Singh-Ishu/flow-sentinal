import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UniversalComponentDetails.css';

const UniversalComponentDetails = ({ component }) => {
  const [maintenancePrediction, setMaintenancePrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  useEffect(() => {
    if (!component) {
      setMaintenancePrediction(null);
      return;
    }

    const fetchMaintenancePrediction = async () => {
      setPredictionLoading(true);
      try {
        let endpoint;
        if (component.componentType === 'pipe') {
          // Use GET method for pipes
          endpoint = `/pipes/${component.id}/maintenance-prediction`;
          const response = await axios.get(endpoint);
          setMaintenancePrediction(response.data);
        } else {
          // Use GET method for nodes
          endpoint = `/nodes/${component.id}/maintenance-prediction`;
          const response = await axios.get(endpoint);
          setMaintenancePrediction(response.data);
        }
      } catch (error) {
        console.error('Error fetching maintenance prediction:', error);
        setMaintenancePrediction(null);
      } finally {
        setPredictionLoading(false);
      }
    };

    fetchMaintenancePrediction();
  }, [component]);

  if (!component) {
    return (
      <div className="component-details-panel">
        <div className="select-component">
          <div className="select-icon">🔍</div>
          <h3>Select a Component</h3>
          <p>Choose any pipe, pump, valve, sensor, or junction from the list to view detailed information and AI-powered maintenance predictions.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not available';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'operational':
      case 'active': return '#22c55e';
      case 'maintenance': return '#ff9800';
      case 'damaged':
      case 'offline': return '#ef4444';
      case 'demand': return '#2563eb';
      case 'leak': return '#dc2626';
      case 'unreported': return '#8b5cf6';
      default: return '#888';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#ff9800';
      case 'low': return '#22c55e';
      default: return '#888';
    }
  };

  const getMaintenanceTypeDisplay = (type) => {
    const typeMap = {
      'routine_inspection': 'Routine Inspection',
      'urgent_inspection': 'Urgent Inspection',
      'repair': 'Repair',
      'replacement': 'Replacement',
      'replacement_assessment': 'Replacement Assessment',
      'calibration': 'Calibration',
      'cleaning': 'Cleaning'
    };
    return typeMap[type] || type;
  };

  const getComponentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pipe': return '🔧';
      case 'pump': return '⚡';
      case 'valve': return '🔄';
      case 'sensor': return '📡';
      case 'junction': return '🔗';
      default: return '📦';
    }
  };

  return (
    <div className="component-details-panel">
      <div className="component-header">
        <div className="component-title">
          <span className="component-icon-large">{getComponentIcon(component.type)}</span>
          <div>
            <h3>{component.name || component.id}</h3>
            <div className="component-subtitle">
              <span className="component-type">{component.type}</span>
              <span 
                className="component-status"
                style={{ color: getStatusColor(component.status) }}
              >
                {component.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="component-details-content">
        {/* Basic Information */}
        <div className="details-section">
          <h4>Basic Information</h4>
          <div className="details-grid">
            <div><strong>ID:</strong> {component.id}</div>
            <div><strong>Type:</strong> {component.type}</div>
            <div><strong>Status:</strong> 
              <span style={{ 
                color: getStatusColor(component.status), 
                fontWeight: 'bold',
                marginLeft: '8px',
                textTransform: 'capitalize'
              }}>
                {component.status}
              </span>
            </div>
          </div>
        </div>

        {/* Component-specific details */}
        {component.componentType === 'pipe' ? (
          <div className="details-section">
            <h4>Pipe Specifications</h4>
            <div className="details-grid">
              <div><strong>Length:</strong> {component.length?.toLocaleString()} meters</div>
              <div><strong>Diameter:</strong> {component.diameter} mm</div>
              <div><strong>Material:</strong> {component.material}</div>
              <div><strong>Current Flow:</strong> {component.current_flow?.toLocaleString()} L/min</div>
              <div><strong>Flow Capacity:</strong> {component.flow_capacity?.toLocaleString()} L/min</div>
              <div><strong>Pressure Loss:</strong> {component.pressure_loss} bar</div>
              <div><strong>Source Node:</strong> {component.source_node_id}</div>
              <div><strong>Target Node:</strong> {component.target_node_id}</div>
              <div><strong>Installation Date:</strong> {formatDate(component.installation_date)}</div>
              <div><strong>Last Inspection:</strong> {formatDate(component.last_inspection)}</div>
            </div>

            {/* Flow Utilization */}
            {component.flow_capacity > 0 && (
              <div className="utilization-section">
                <strong>Flow Utilization:</strong>
                <div className="utilization-bar">
                  <div 
                    className="utilization-fill"
                    style={{
                      width: `${Math.min(100, (component.current_flow / component.flow_capacity) * 100)}%`,
                      backgroundColor: component.current_flow / component.flow_capacity > 0.8 ? '#ef4444' : 
                                     component.current_flow / component.flow_capacity > 0.6 ? '#ff9800' : '#22c55e'
                    }}
                  ></div>
                </div>
                <div className="utilization-text">
                  {Math.round((component.current_flow / component.flow_capacity) * 100)}% capacity utilized
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="details-section">
            <h4>Node Specifications</h4>
            <div className="details-grid">
              {component.pressure && (
                <div><strong>Current Pressure:</strong> {component.pressure.toFixed(2)} bar</div>
              )}
              {component.max_pressure && (
                <div><strong>Max Pressure:</strong> {component.max_pressure.toFixed(2)} bar</div>
              )}
              {component.flow_rate && (
                <div><strong>Flow Rate:</strong> {component.flow_rate.toLocaleString()} L/min</div>
              )}
              {component.latitude && (
                <div><strong>Latitude:</strong> {component.latitude.toFixed(6)}</div>
              )}
              {component.longitude && (
                <div><strong>Longitude:</strong> {component.longitude.toFixed(6)}</div>
              )}
              <div><strong>Last Updated:</strong> {formatDateTime(component.last_updated)}</div>
            </div>

            {/* Pressure Utilization for nodes */}
            {component.pressure && component.max_pressure && (
              <div className="utilization-section">
                <strong>Pressure Utilization:</strong>
                <div className="utilization-bar">
                  <div 
                    className="utilization-fill"
                    style={{
                      width: `${Math.min(100, (component.pressure / component.max_pressure) * 100)}%`,
                      backgroundColor: component.pressure / component.max_pressure > 0.8 ? '#ef4444' : 
                                     component.pressure / component.max_pressure > 0.6 ? '#ff9800' : '#22c55e'
                    }}
                  ></div>
                </div>
                <div className="utilization-text">
                  {Math.round((component.pressure / component.max_pressure) * 100)}% of maximum pressure
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Maintenance Prediction Section */}
        <div className="details-section ai-prediction-section">
          <h4>
            🤖 AI Maintenance Prediction
          </h4>
          
          {predictionLoading ? (
            <div className="prediction-loading">
              <div className="loading-spinner"></div>
              <span>Analyzing component data with AI model...</span>
            </div>
          ) : maintenancePrediction ? (
            <div className="prediction-content">
              <div className="prediction-main">
                <div className="prediction-date">
                  <strong>Next Maintenance Date:</strong>
                  <div className="date-display" style={{ color: getPriorityColor(maintenancePrediction.priority) }}>
                    {formatDate(maintenancePrediction.next_maintenance_date)}
                  </div>
                  <div className="days-until">
                    ({maintenancePrediction.days_until_maintenance} days from now)
                  </div>
                </div>

                <div className="prediction-priority">
                  <strong>Priority:</strong>
                  <span 
                    className="priority-badge"
                    style={{ 
                      backgroundColor: getPriorityColor(maintenancePrediction.priority),
                      color: 'white'
                    }}
                  >
                    {maintenancePrediction.priority}
                  </span>
                </div>
              </div>

              <div className="prediction-details">
                <div><strong>Maintenance Type:</strong> {getMaintenanceTypeDisplay(maintenancePrediction.maintenance_type)}</div>
                
                {maintenancePrediction.estimated_cost && (
                  <div><strong>Estimated Cost:</strong> {formatCurrency(maintenancePrediction.estimated_cost)}</div>
                )}

                {maintenancePrediction.confidence && (
                  <div className="confidence-section">
                    <strong>Confidence:</strong> {Math.round(maintenancePrediction.confidence * 100)}%
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill"
                        style={{
                          width: `${maintenancePrediction.confidence * 100}%`,
                          backgroundColor: maintenancePrediction.confidence > 0.8 ? '#22c55e' : 
                                         maintenancePrediction.confidence > 0.6 ? '#ff9800' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {maintenancePrediction.factors && maintenancePrediction.factors.length > 0 && (
                  <div className="factors-section">
                    <strong>Key Factors:</strong>
                    <ul className="factors-list">
                      {maintenancePrediction.factors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="prediction-source">
                Prediction source: {maintenancePrediction.prediction_source === 'ai_model' ? 
                  '🧠 Machine Learning Model' : '📋 Rule-based System'}
              </div>

              {/* Explanation Section */}
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: '#f8f9fa', 
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#666'
              }}>
                <strong>How predictions are calculated:</strong>
                <ul style={{ margin: '8px 0 0 16px', lineHeight: '1.4' }}>
                  <li><strong>Cost:</strong> Based on component type, size, urgency, and material complexity</li>
                  <li><strong>Confidence:</strong> Determined by data completeness, prediction reasonableness, and component predictability</li>
                  <li><strong>Priority:</strong> Calculated from days until maintenance (High: &lt;30 days, Medium: 30-90 days, Low: &gt;90 days)</li>
                  <li><strong>Factors:</strong> Key variables influencing the prediction including age, utilization, and inspection history</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="prediction-error">
              Unable to generate maintenance prediction for this component
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalComponentDetails;