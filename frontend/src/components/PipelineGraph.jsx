import React, { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import cose from 'cytoscape-cose';
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './PipelineGraph.css';

// Register extensions
cytoscape.use(cose);
cytoscape.use(popper);

const PipelineGraph = ({ data }) => {
  const cyRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);

  // Convert lat/lng to graph coordinates
  const convertCoordinates = (lat, lng) => {
    // Scale factor to spread nodes appropriately
    const scale = 1000;
    return {
      x: (lng - 77.2090) * scale, // Center around Delhi longitude
      y: (lat - 28.6139) * scale  // Center around Delhi latitude
    };
  };

  // Get node color based on status and maintenance needs
  const getNodeColor = (node) => {
    switch (node.status) {
      case 'active': return '#22c55e';      // Green - healthy
      case 'demand': return '#ff9800';      // Orange - needs attention
      case 'offline': return '#6b7280';     // Gray - offline
      case 'leak': return '#ef4444';        // Red - critical
      case 'unreported': return '#8b5cf6';  // Purple - no data
      default: return '#22c55e';
    }
  };

  // Get edge color based on flow status
  const getEdgeColor = (edge) => {
    const utilization = edge.current_flow / edge.flow_capacity;
    if (utilization > 0.9) return '#ef4444';  // Red - over capacity
    if (utilization > 0.7) return '#ff9800';  // Orange - high usage
    if (utilization > 0.5) return '#22c55e';  // Green - normal
    return '#6b7280';  // Gray - low usage
  };

  // Get edge width based on diameter
  const getEdgeWidth = (diameter) => {
    return Math.max(2, Math.min(8, diameter / 50));
  };

  // Prepare cytoscape elements
  const elements = React.useMemo(() => {
    if (!data || !data.nodes || !data.edges) return [];

    const nodes = data.nodes.map(node => {
      const coords = convertCoordinates(node.position.y / 100, node.position.x / 100);
      return {
        data: {
          id: node.id,
          label: node.name,
          type: node.type,
          pressure: node.pressure,
          status: node.status,
          ...node
        },
        position: coords,
        classes: `node-${node.type} status-${node.status}`
      };
    });

    const edges = data.edges.map(edge => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        length: edge.length,
        current_flow: edge.current_flow,
        flow_capacity: edge.flow_capacity,
        status: edge.status,
        ...edge
      },
      classes: `edge-${edge.status}`
    }));

    return [...nodes, ...edges];
  }, [data]);

  // Cytoscape stylesheet
  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': (ele) => getNodeColor(ele.data()),
        'border-width': 2,
        'border-color': '#fff',
        'width': (ele) => {
          const type = ele.data('type');
          switch (type) {
            case 'pump': return 40;
            case 'junction': return 35;
            case 'valve': return 30;
            case 'sensor': return 25;
            default: return 30;
          }
        },
        'height': (ele) => {
          const type = ele.data('type');
          switch (type) {
            case 'pump': return 40;
            case 'junction': return 35;
            case 'valve': return 30;
            case 'sensor': return 25;
            default: return 30;
          }
        },
        'label': 'data(label)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': '12px',
        'font-weight': 'bold',
        'text-outline-width': 2,
        'text-outline-color': '#fff',
        'color': '#333',
        'shape': (ele) => {
          const type = ele.data('type');
          switch (type) {
            case 'pump': return 'diamond';
            case 'junction': return 'octagon';
            case 'valve': return 'triangle';
            case 'sensor': return 'circle';
            default: return 'ellipse';
          }
        }
      }
    },
    {
      selector: 'node:hover',
      style: {
        'border-width': 4,
        'border-color': '#ff9800',
        'z-index': 999
      }
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 4,
        'border-color': '#2563eb',
        'z-index': 999
      }
    },
    {
      selector: 'edge',
      style: {
        'width': (ele) => getEdgeWidth(ele.data('diameter') || 200),
        'line-color': (ele) => getEdgeColor(ele.data()),
        'target-arrow-color': (ele) => getEdgeColor(ele.data()),
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'opacity': 0.8
      }
    },
    {
      selector: 'edge:hover',
      style: {
        'opacity': 1,
        'width': (ele) => getEdgeWidth(ele.data('diameter') || 200) + 2,
        'z-index': 999
      }
    },
    {
      selector: 'edge:selected',
      style: {
        'opacity': 1,
        'line-color': '#2563eb',
        'target-arrow-color': '#2563eb',
        'width': (ele) => getEdgeWidth(ele.data('diameter') || 200) + 2,
        'z-index': 999
      }
    }
  ];

  // Layout configuration
  const layout = {
    name: 'preset',
    fit: true,
    padding: 50
  };

  // Handle element selection
  const handleElementSelect = (event) => {
    const element = event.target;
    const renderedPosition = element.renderedPosition();
    
    setSelectedElement(element.data());
    setModalPosition({
      x: renderedPosition.x,
      y: renderedPosition.y
    });
    setShowModal(true);
  };

  // Setup event listeners
  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;

      // Click events
      cy.on('tap', 'node', handleElementSelect);
      cy.on('tap', 'edge', handleElementSelect);
      
      // Close modal when clicking on background
      cy.on('tap', (event) => {
        if (event.target === cy) {
          setShowModal(false);
          setSelectedElement(null);
        }
      });

      // Hover tooltips
      cy.nodes().forEach(node => {
        const ref = node.popperRef();
        const tip = tippy(ref, {
          content: () => {
            const data = node.data();
            return `
              <div style="text-align: left;">
                <strong>${data.label}</strong><br/>
                Type: ${data.type}<br/>
                Status: ${data.status}<br/>
                ${data.pressure ? `Pressure: ${data.pressure} bar` : ''}
              </div>
            `;
          },
          allowHTML: true,
          trigger: 'manual',
          hideOnClick: false,
          placement: 'top'
        });

        node.on('mouseover', () => tip.show());
        node.on('mouseout', () => tip.hide());
      });

      cy.edges().forEach(edge => {
        const ref = edge.popperRef();
        const tip = tippy(ref, {
          content: () => {
            const data = edge.data();
            const utilization = ((data.current_flow / data.flow_capacity) * 100).toFixed(1);
            return `
              <div style="text-align: left;">
                <strong>Pipe ${data.id}</strong><br/>
                Length: ${data.length?.toLocaleString()} m<br/>
                Flow: ${data.current_flow?.toLocaleString()} / ${data.flow_capacity?.toLocaleString()} L/min<br/>
                Utilization: ${utilization}%
              </div>
            `;
          },
          allowHTML: true,
          trigger: 'manual',
          hideOnClick: false,
          placement: 'top'
        });

        edge.on('mouseover', () => tip.show());
        edge.on('mouseout', () => tip.hide());
      });

      return () => {
        cy.removeAllListeners();
      };
    }
  }, [elements]);

  const formatValue = (value, unit = '') => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString() + (unit ? ` ${unit}` : '');
    }
    return value;
  };

  return (
    <div className="pipeline-graph-container">
      <div className="graph-controls">
        <div className="legend">
          <h4>Node Types</h4>
          <div className="legend-item">
            <div className="legend-symbol diamond pump"></div>
            <span>Pump</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol octagon junction"></div>
            <span>Junction</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol triangle valve"></div>
            <span>Valve</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol circle sensor"></div>
            <span>Sensor</span>
          </div>
          
          <h4 style={{ marginTop: '1rem' }}>Status</h4>
          <div className="legend-item">
            <div className="legend-symbol circle" style={{ backgroundColor: '#22c55e' }}></div>
            <span>Active</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol circle" style={{ backgroundColor: '#ff9800' }}></div>
            <span>Needs Attention</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol circle" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Critical/Leak</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol circle" style={{ backgroundColor: '#6b7280' }}></div>
            <span>Offline</span>
          </div>
        </div>
      </div>

      <div className="graph-wrapper">
        <CytoscapeComponent
          elements={elements}
          style={{ width: '100%', height: '600px' }}
          stylesheet={stylesheet}
          layout={layout}
          cy={(cy) => { cyRef.current = cy; }}
          wheelSensitivity={0.2}
          minZoom={0.1}
          maxZoom={3}
        />
      </div>

      {showModal && selectedElement && (
        <div 
          className="element-modal"
          style={{
            position: 'absolute',
            left: modalPosition.x + 20,
            top: modalPosition.y - 100,
            zIndex: 1000
          }}
        >
          <div className="modal-content">
            <button 
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            
            <h3>{selectedElement.label || selectedElement.id}</h3>
            
            {selectedElement.type ? (
              // Node details
              <div className="modal-details">
                <div><strong>Type:</strong> {selectedElement.type}</div>
                <div><strong>Status:</strong> {selectedElement.status}</div>
                {selectedElement.pressure && (
                  <div><strong>Pressure:</strong> {formatValue(selectedElement.pressure, 'bar')}</div>
                )}
                {selectedElement.flow_rate && (
                  <div><strong>Flow Rate:</strong> {formatValue(selectedElement.flow_rate, 'L/min')}</div>
                )}
                {selectedElement.max_pressure && (
                  <div><strong>Max Pressure:</strong> {formatValue(selectedElement.max_pressure, 'bar')}</div>
                )}
              </div>
            ) : (
              // Edge details
              <div className="modal-details">
                <div><strong>Length:</strong> {formatValue(selectedElement.length, 'm')}</div>
                <div><strong>Current Flow:</strong> {formatValue(selectedElement.current_flow, 'L/min')}</div>
                <div><strong>Capacity:</strong> {formatValue(selectedElement.flow_capacity, 'L/min')}</div>
                {selectedElement.current_flow && selectedElement.flow_capacity && (
                  <div><strong>Utilization:</strong> {((selectedElement.current_flow / selectedElement.flow_capacity) * 100).toFixed(1)}%</div>
                )}
                <div><strong>Source:</strong> {selectedElement.source}</div>
                <div><strong>Target:</strong> {selectedElement.target}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineGraph;