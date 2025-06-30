import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MaintenanceItem from '../components/MaintenanceItem';
import MaintenanceForm from '../components/MaintenanceForm';
import './MaintenancePage.css';

const statusMapping = {
  'scheduled': 'Upcoming',
  'in_progress': 'Ongoing', 
  'completed': 'Past',
  'cancelled': 'Past'
};

const reverseStatusMapping = {
  'Upcoming': 'scheduled',
  'Ongoing': 'in_progress',
  'Past': 'completed'
};

const groupByStatus = (tasks) => {
  return {
    Ongoing: tasks.filter(t => t.status === 'Ongoing'),
    Upcoming: tasks.filter(t => t.status === 'Upcoming'),
    Past: tasks.filter(t => t.status === 'Past'),
  };
};

const MaintenancePage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/maintenance');
      const transformedTasks = response.data.map(task => ({
        id: task.id,
        pipeId: task.entity_id,
        date: task.scheduled_date.split('T')[0], // Convert to YYYY-MM-DD format
        description: task.notes || 'No description',
        status: statusMapping[task.status] || 'Upcoming',
        originalTask: task // Keep reference to original data
      }));
      setTasks(transformedTasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
      setLoading(false);
    }
  };

  const handleCreate = async (task) => {
    try {
      const newTask = {
        entity_type: 'pipe',
        entity_id: task.pipeId,
        scheduled_date: new Date(task.date).toISOString(),
        notes: task.description,
        status: reverseStatusMapping[task.status] || 'scheduled',
        maintenance_type: 'inspection',
        technician: 'System User'
      };

      await axios.post('/maintenance', newTask);
      await fetchTasks(); // Refresh the list
      setShowForm(false);
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      alert('Failed to create maintenance task');
    }
  };

  const handleEdit = (task) => {
    setEditTask({
      id: task.id,
      pipeId: task.pipeId,
      date: task.date,
      description: task.description,
      status: task.status
    });
    setShowForm(true);
  };

  const handleUpdate = async (task) => {
    try {
      const updateData = {
        scheduled_date: new Date(task.date).toISOString(),
        notes: task.description,
        status: reverseStatusMapping[task.status] || 'scheduled'
      };

      await axios.put(`/maintenance/${task.id}`, updateData);
      await fetchTasks(); // Refresh the list
      setEditTask(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating maintenance task:', error);
      alert('Failed to update maintenance task');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this maintenance task?')) {
      return;
    }

    try {
      await axios.delete(`/maintenance/${id}`);
      await fetchTasks(); // Refresh the list
    } catch (error) {
      console.error('Error deleting maintenance task:', error);
      alert('Failed to delete maintenance task');
    }
  };

  if (loading) {
    return (
      <div className="maintenance-page">
        <h2 className="maintenance-title">Maintenance Tasks</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading maintenance tasks...</div>
      </div>
    );
  }

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