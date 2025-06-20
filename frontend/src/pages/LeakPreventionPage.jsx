import React, { useState } from 'react';
import SearchablePipeList from '../components/SearchablePipeList';
import PipeDetailsPanel from '../components/PipeDetailsPanel';
import './LeakPreventionPage.css';

const LeakPreventionPage = () => {
  const [selectedPipe, setSelectedPipe] = useState(null);

  return (
    <div className="leak-prevention-grid">
      <div className="pipe-list-col">
        <div className="pipe-list-panel">
          <h2 className="pipe-list-title">Pipes</h2>
          <SearchablePipeList onSelect={setSelectedPipe} />
        </div>
      </div>
      <div className="pipe-details-col">
        <PipeDetailsPanel pipeId={selectedPipe} />
      </div>
    </div>
  );
};

export default LeakPreventionPage; 