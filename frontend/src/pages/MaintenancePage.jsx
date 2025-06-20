import React, { useState } from 'react';
import MaintenanceItem from '../components/MaintenanceItem';
import MaintenanceForm from '../components/MaintenanceForm';
import './MaintenancePage.css';

const dummyTasks = [
  { id: 1, pipeId: 'Pipe-001', date: '2024-06-01', description: 'Routine check', status: 'Ongoing' },
  { id: 2, pipeId: 'Pipe-002', date: '2024-06-10', description: 'Valve replacement', status: 'Upcoming' },
  { id: 3, pipeId: 'Pipe-003', date: '2024-05-20', description: 'Leak repair', status: 'Past' },
];

const groupByStatus = (tasks) => {
  return {
    Ongoing: tasks.filter(t => t.status === 'Ongoing'),
    Upcoming: tasks.filter(t => t.status === 'Upcoming'),
    Past: tasks.filter(t => t.status === 'Past'),
  };
};

const MaintenancePage = () => {
  const [tasks, setTasks] = useState(dummyTasks);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const handleCreate = (task) => {
    setTasks([...tasks, { ...task, id: Date.now() }]);
    setShowForm(false);
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleUpdate = (task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
    setEditTask(null);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const grouped = groupByStatus(tasks);

  return (
    <div className="maintenance-page">
      <h2 className="maintenance-title">Maintenance Tasks</h2>
      <button className="add-btn" onClick={() => { setShowForm(true); setEditTask(null); }}>
        Add Maintenance Task
      </button>
      {showForm && (
        <MaintenanceForm
          initialData={editTask}
          onSubmit={editTask ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditTask(null); }}
        />
      )}
      <div className="maintenance-list">
        {['Ongoing', 'Upcoming', 'Past'].map(status => (
          <div key={status} className="status-group">
            <h3 className="status-title">{status}</h3>
            {grouped[status].length === 0 ? (
              <div className="no-tasks">No tasks</div>
            ) : (
              grouped[status].map(task => (
                <MaintenanceItem
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenancePage; 