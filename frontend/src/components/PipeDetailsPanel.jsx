import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PipeDetailsPanel.css';

const PipeDetailsPanel = ({ pipeId }) => {
  const [pipe, setPipe] = useState(null);
  const [maintenancePrediction, setMaintenancePrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pipeId) {
      setPipe(null);
      setMaintenancePrediction(null);
      return;
    }

    const fetchPipeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/pipes/${pipeId}`);
        setPipe(response.data);
      } catch (error) {
        console.error('Error fetching pipe details:', error);
        setError('Failed to load pipe details');
      } finally {
        setLoading(false);
      }
    };

    const fetchMaintenancePrediction = async () => {
      setPredictionLoading(true);
      try {
        const response = await axios.get(`/pipes/${pipeId}/maintenance-prediction`);
        setMaintenancePrediction(response.data);
      } catch (error) {
        console.error('Error fetching maintenance prediction:', error);
        setMaintenancePrediction(null);
      } finally {
        setPredictionLoading(false);
      }
    };

    fetchPipeDetails();
    fetchMaintenancePrediction();
  }, [pipeId]);

  if (!pipeId) {
    return (
      <div className="pipe-details-panel">
        <div className="select-pipe">Select a pipe to view details and AI maintenance predictions</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pipe-details-panel">
        <div className="select-pipe">Loading pipe details...</div>
      </div>
    );
  }

  if (error || !pipe) {
    return (
      <div className="pipe-details-panel">
        <div className="select-pipe">{error || 'Pipe not found'}</div>
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return '#22c55e';
      case 'maintenance': return '#ff9800';
      case 'damaged': return '#ef4444';
      default: return '#888';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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
      'replacement_assessment': 'Replacement Assessment'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="pipe-details-panel">
      <h3 className="pipe-details-title">Pipe Details</h3>
      <div><b>ID:</b> {pipe.id}</div>
      <div><b>Length:</b> {pipe.length.toLocaleString()} meters</div>
      <div><b>Diameter:</b> {pipe.diameter} mm</div>
      <div><b>Material:</b> {pipe.material}</div>
      <div><b>Current Flow:</b> {pipe.current_flow.toLocaleString()} L/min</div>
      <div><b>Flow Capacity:</b> {pipe.flow_capacity.toLocaleString()} L/min</div>
      <div><b>Pressure Loss:</b> {pipe.pressure_loss} bar</div>
      <div>
        <b>Status:</b> 
        <span style={{ 
          color: getStatusColor(pipe.status), 
          fontWeight: 'bold',
          marginLeft: '8px',
          textTransform: 'capitalize'
        }}>
          {pipe.status}
        </span>
      </div>
      <div><b>Installation Date:</b> {formatDate(pipe.installation_date)}</div>
      <div><b>Last Inspection:</b> {formatDate(pipe.last_inspection)}</div>
      
      <div className="leak-history">
        <b>Flow Utilization:</b>
        <div style={{ marginTop: '8px' }}>
          {pipe.flow_capacity > 0 ? (
            <div>
              <div style={{ 
                background: '#f0f0f0', 
                borderRadius: '4px', 
                overflow: 'hidden',
                height: '20px',
                marginBottom: '4px'
              }}>
                <div style={{
                  background: pipe.current_flow / pipe.flow_capacity > 0.8 ? '#ef4444' : 
                           pipe.current_flow / pipe.flow_capacity > 0.6 ? '#ff9800' : '#22c55e',
                  height: '100%',
                  width: `${Math.min(100, (pipe.current_flow / pipe.flow_capacity) * 100)}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                {Math.round((pipe.current_flow / pipe.flow_capacity) * 100)}% capacity utilized
              </div>
            </div>
          ) : (
            <div style={{ color: '#888' }}>No flow data available</div>
          )}
        </div>
      </div>

      {/* AI Maintenance Prediction Section */}
      <div className="maintenance-prediction" style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          color: '#ff9800', 
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🤖 AI Maintenance Prediction
        </h4>
        
        {predictionLoading ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            Analyzing pipe data with AI model...
          </div>
        ) : maintenancePrediction ? (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <b>Next Maintenance Date:</b>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                color: getPriorityColor(maintenancePrediction.priority),
                marginTop: '4px'
              }}>
                {formatDate(maintenancePrediction.next_maintenance_date)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                ({maintenancePrediction.days_until_maintenance} days from now)
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <b>Priority:</b>
              <span style={{ 
                color: getPriorityColor(maintenancePrediction.priority),
                fontWeight: 'bold',
                marginLeft: '8px',
                textTransform: 'capitalize'
              }}>
                {maintenancePrediction.priority}
              </span>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <b>Maintenance Type:</b> {getMaintenanceTypeDisplay(maintenancePrediction.maintenance_type)}
            </div>

            <div style={{ marginBottom: '8px' }}>
              <b>Estimated Cost:</b> ${maintenancePrediction.estimated_cost?.toLocaleString()}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <b>Confidence:</b> {Math.round(maintenancePrediction.confidence * 100)}%
              <div style={{ 
                background: '#e9ecef', 
                borderRadius: '4px', 
                overflow: 'hidden',
                height: '6px',
                marginTop: '4px'
              }}>
                <div style={{
                  background: maintenancePrediction.confidence > 0.8 ? '#22c55e' : 
                           maintenancePrediction.confidence > 0.6 ? '#ff9800' : '#ef4444',
                  height: '100%',
                  width: `${maintenancePrediction.confidence * 100}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <b>Key Factors:</b>
              <ul style={{ margin: '4px 0 0 16px', fontSize: '0.9rem' }}>
                {maintenancePrediction.factors?.map((factor, index) => (
                  <li key={index} style={{ marginBottom: '2px' }}>{factor}</li>
                ))}
              </ul>
            </div>

            <div style={{ 
              fontSize: '0.8rem', 
              color: '#666', 
              fontStyle: 'italic',
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '1px solid #dee2e6'
            }}>
              Prediction source: {maintenancePrediction.prediction_source === 'ai_model' ? 
                '🧠 Machine Learning Model' : '📋 Rule-based System'}
            </div>
          </div>
        ) : (
          <div style={{ color: '#ef4444', fontStyle: 'italic' }}>
            Unable to generate maintenance prediction
          </div>
        )}
      </div>

      <div className="pressure-history">
        <b>Connected Nodes:</b>
        <div style={{ marginTop: '8px', fontSize: '0.95rem' }}>
          <div>Source: {pipe.source_node_id}</div>
          <div>Target: {pipe.target_node_id}</div>
        </div>
      </div>
    </div>
  );
};

export default PipeDetailsPanel;