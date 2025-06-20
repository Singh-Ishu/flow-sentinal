import React, { useState } from 'react';
import './MaintenanceForm.css';

const statusOptions = ['Ongoing', 'Upcoming', 'Past'];

const MaintenanceForm = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initialData || {
    pipeId: '',
    date: '',
    description: '',
    status: 'Upcoming',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="maintenance-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Pipe ID</label>
        <input name="pipeId" value={form.pipeId} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Date</label>
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <input name="description" value={form.description} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div className="form-actions">
        <button type="submit">{initialData ? 'Update' : 'Create'}</button>
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>
    </form>
  );
};

export default MaintenanceForm; 