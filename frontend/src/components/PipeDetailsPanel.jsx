import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PipeDetailsPanel.css';

const PipeDetailsPanel = ({ pipeId }) => {
  const [pipe, setPipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pipeId) {
      setPipe(null);
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

    fetchPipeDetails();
  }, [pipeId]);

  if (!pipeId) {
    return (
      <div className="pipe-details-panel">
        <div className="select-pipe">Select a pipe to view details</div>
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return '#22c55e';
      case 'maintenance': return '#ff9800';
      case 'damaged': return '#ef4444';
      default: return '#888';
    }
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