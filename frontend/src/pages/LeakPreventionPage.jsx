import React, { useState } from 'react';
import UniversalComponentList from '../components/UniversalComponentList';
import UniversalComponentDetails from '../components/UniversalComponentDetails';
import './LeakPreventionPage.css';

const LeakPreventionPage = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);

  return (
    <div className="leak-prevention-page">
      <div className="page-header">
        <h2 className="page-title">🔍 Component Analysis & Leak Prevention</h2>
        <p className="page-description">
          Search and analyze any component in the pipeline system. Get AI-powered maintenance predictions 
          for pipes, pumps, valves, sensors, and junctions.
        </p>
      </div>
      
      <div className="leak-prevention-grid">
        <div className="component-list-col">
          <div className="component-list-panel">
            <h3 className="panel-title">
              📋 System Components
            </h3>
            <UniversalComponentList onSelect={setSelectedComponent} />
          </div>
        </div>
        
        <div className="component-details-col">
          <UniversalComponentDetails component={selectedComponent} />
        </div>
      </div>
    </div>
  );
};

export default LeakPreventionPage;