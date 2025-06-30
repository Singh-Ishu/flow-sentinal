import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SearchablePipeList.css';

const SearchablePipeList = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [pipes, setPipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipes = async () => {
      try {
        const response = await axios.get('/pipes');
        setPipes(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pipes:', error);
        setLoading(false);
      }
    };

    fetchPipes();
  }, []);

  const getStatusDisplay = (pipe) => {
    if (pipe.status === 'operational') return 'ok';
    if (pipe.status === 'maintenance') return 'offline';
    if (pipe.status === 'damaged') return 'offline';
    return pipe.status;
  };

  const filtered = pipes.filter(pipe =>
    pipe.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="pipe-list">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading pipes...</div>
      </div>
    );
  }

  return (
    <div className="pipe-list">
      <input
        className="pipe-search"
        placeholder="Search Pipes"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="pipe-list-items">
        {filtered.length === 0 ? (
          <div className="no-pipes">No pipes found</div>
        ) : (
          filtered.map(pipe => (
            <button key={pipe.id} className="pipe-list-item" onClick={() => onSelect(pipe.id)}>
              <span>{pipe.id}</span> 
              <span className={`pipe-status ${getStatusDisplay(pipe)}`}>
                {getStatusDisplay(pipe)}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchablePipeList;