import React, { useState } from 'react';
import './SearchablePipeList.css';

const dummyPipes = [
  { id: 'Pipe-001', status: 'ok' },
  { id: 'Pipe-002', status: 'offline' },
  { id: 'Pipe-003', status: 'demand' },
];

const SearchablePipeList = ({ onSelect }) => {
  const [search, setSearch] = useState('');

  const filtered = dummyPipes.filter(pipe =>
    pipe.id.toLowerCase().includes(search.toLowerCase())
  );

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
              <span>{pipe.id}</span> <span className={`pipe-status ${pipe.status}`}>{pipe.status}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchablePipeList; 