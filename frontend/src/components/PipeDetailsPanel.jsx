import React from 'react';
import './PipeDetailsPanel.css';

const dummyPipes = {
  'Pipe-001': {
    id: 'Pipe-001',
    currentPressure: '2.1 bar',
    lastMaintenance: '2024-05-01',
    nextMaintenance: '2024-07-01',
    leakHistory: [
      { time: '2024-04-10', description: 'Minor leak at joint' },
    ],
    pressureHistory: [
      { time: '10:00', value: 2.0 },
      { time: '11:00', value: 2.1 },
      { time: '12:00', value: 2.2 },
    ],
  },
  'Pipe-002': {
    id: 'Pipe-002',
    currentPressure: '1.8 bar',
    lastMaintenance: '2024-04-15',
    nextMaintenance: '2024-06-15',
    leakHistory: [],
    pressureHistory: [
      { time: '10:00', value: 1.7 },
      { time: '11:00', value: 1.8 },
      { time: '12:00', value: 1.8 },
    ],
  },
};

const PipeDetailsPanel = ({ pipeId }) => {
  const pipe = dummyPipes[pipeId];

  if (!pipeId) {
    return <div className="pipe-details-panel"><div className="select-pipe">Select a pipe to view details</div></div>;
  }
  if (!pipe) {
    return <div className="pipe-details-panel"><div className="select-pipe">Pipe not found</div></div>;
  }

  return (
    <div className="pipe-details-panel">
      <h3 className="pipe-details-title">Pipe Details</h3>
      <div><b>ID:</b> {pipe.id}</div>
      <div><b>Current Pressure:</b> {pipe.currentPressure}</div>
      <div><b>Last Maintenance:</b> {pipe.lastMaintenance}</div>
      <div><b>Next Maintenance:</b> {pipe.nextMaintenance}</div>
      <div className="leak-history">
        <b>Leak History:</b>
        {pipe.leakHistory.length === 0 ? (
          <div className="no-leaks">No leaks recorded</div>
        ) : (
          <ul>
            {pipe.leakHistory.map((leak, idx) => (
              <li key={idx}>{leak.time} - {leak.description}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="pressure-history">
        <b>Pressure Over Time:</b>
        <ul>
          {pipe.pressureHistory.map((p, idx) => (
            <li key={idx}>{p.time}: {p.value} bar</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PipeDetailsPanel; 