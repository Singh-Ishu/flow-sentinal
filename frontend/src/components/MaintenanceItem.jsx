import React from 'react';
import './MaintenanceItem.css';

const statusColor = status => {
  if (status === 'Ongoing') return 'status-ongoing';
  if (status === 'Upcoming') return 'status-upcoming';
  if (status === 'Past') return 'status-past';
  return '';
};

const MaintenanceItem = ({ task, onEdit, onDelete }) => (
  <div className={`maintenance-item ${statusColor(task.status)}`}>
    <div className="item-details">
      <div className="item-title">{task.pipeId}</div>
      <div className="item-date">{task.date}</div>
      <div className="item-desc">{task.description}</div>
    </div>
    <div className="item-actions">
      <button onClick={() => onEdit(task)} className="edit-btn">Edit</button>
      <button onClick={() => onDelete(task.id)} className="delete-btn">Delete</button>
    </div>
  </div>
);

export default MaintenanceItem; 