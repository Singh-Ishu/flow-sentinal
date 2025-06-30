import React, { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './PipelineGraph.css';

// Custom node component - simplified to circles only
const CustomNode = ({ data, selected }) => {
  const getNodeStyle = () => {
    const baseStyle = {
      width: data.size || 30,
      height: data.size || 30,
      background: data.color || '#22c55e',
      border: `3px solid ${selected ? '#2563eb' : '#fff'}`,
      borderRadius: '50%', // Always circular
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold',
      color: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    };

    return baseStyle;
  };

  return (
    <div style={getNodeStyle()}>
      <div className="node-label">
        {data.label}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const PipelineGraph = ({ data }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);

  // Convert lat/lng to graph coordinates with better scaling
  const convertCoordinates = (lat, lng) => {
    if (!lat || !lng) return { x: 0, y: 0 };
    
    // Use a larger scale factor to spread nodes out more
    const scale = 5000;
    const centerLat = 28.6139;
    const centerLng = 77.2090;
    
    return {
      x: (lng - centerLng) * scale,
      y: (lat - centerLat) * scale * -1, // Invert Y to match map orientation
    };
  };

  // Get node color based on status
  const getNodeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#22c55e';
      case 'demand': return '#ff9800';
      case 'offline': return '#6b7280';
      case 'leak': return '#ef4444';
      case 'unreported': return '#8b5cf6';
      case 'maintenance': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  // Get node size based on type
  const getNodeSize = (type, pressure) => {
    let baseSize = 25;
    
    // Slightly larger for different types
    switch (type?.toLowerCase()) {
      case 'pump': baseSize = 35; break;
      case 'junction': baseSize = 30; break;
      case 'valve': baseSize = 25; break;
      case 'sensor': baseSize = 20; break;
      default: baseSize = 25;
    }
    
    // Scale slightly based on pressure if available
    if (pressure && pressure > 0) {
      baseSize += Math.min(10, pressure * 2);
    }
    
    return baseSize;
  };

  // Get edge color based on flow utilization
  const getEdgeColor = (edge) => {
    if (!edge.current_flow || !edge.flow_capacity) return '#6b7280';
    
    const utilization = edge.current_flow / edge.flow_capacity;
    if (utilization > 0.9) return '#ef4444';
    if (utilization > 0.7) return '#ff9800';
    if (utilization > 0.5) return '#22c55e';
    return '#6b7280';
  };

  // Get edge width based on diameter
  const getEdgeWidth = (diameter) => {
    if (!diameter) return 3;
    return Math.max(2, Math.min(8, diameter / 50));
  };

  // Prepare nodes and edges for React Flow
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!data || !data.nodes || !data.edges) {
      return { nodes: [], edges: [] };
    }

    console.log('Processing nodes:', data.nodes.length);
    console.log('Processing edges:', data.edges.length);

    const nodes = data.nodes.map(node => {
      // Handle different coordinate formats
      let lat, lng;
      if (node.position) {
        lat = node.position.y / 100;
        lng = node.position.x / 100;
      } else if (node.latitude && node.longitude) {
        lat = node.latitude;
        lng = node.longitude;
      } else {
        // Fallback to random position
        lat = 28.6139 + (Math.random() - 0.5) * 0.1;
        lng = 77.2090 + (Math.random() - 0.5) * 0.1;
      }

      const coords = convertCoordinates(lat, lng);
      
      return {
        id: node.id,
        type: 'custom',
        position: coords,
        data: {
          label: node.name || node.id,
          type: node.type,
          color: getNodeColor(node.status),
          size: getNodeSize(node.type, node.pressure),
          pressure: node.pressure,
          status: node.status,
          ...node,
        },
        draggable: true,
      };
    });

    const edges = data.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      style: {
        stroke: getEdgeColor(edge),
        strokeWidth: getEdgeWidth(edge.diameter || 200),
      },
      data: {
        length: edge.length,
        current_flow: edge.current_flow,
        flow_capacity: edge.flow_capacity,
        status: edge.status,
        ...edge,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: getEdgeColor(edge),
      },
    }));

    console.log('Processed nodes:', nodes.length);
    console.log('Processed edges:', edges.length);

    return { nodes, edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node click with proper modal positioning
  const onNodeClick = useCallback((event, node) => {
    const rect = event.currentTarget.closest('.react-flow').getBoundingClientRect();
    const nodeRect = event.currentTarget.getBoundingClientRect();
    
    // Calculate position relative to the React Flow container
    const x = nodeRect.left - rect.left + nodeRect.width / 2;
    const y = nodeRect.top - rect.top + nodeRect.height / 2;
    
    // Ensure modal stays within bounds
    const modalWidth = 300;
    const modalHeight = 200;
    
    let finalX = x + 20;
    let finalY = y - modalHeight / 2;
    
    // Adjust if modal would go outside container
    if (finalX + modalWidth > rect.width) {
      finalX = x - modalWidth - 20;
    }
    if (finalY < 0) {
      finalY = 10;
    }
    if (finalY + modalHeight > rect.height) {
      finalY = rect.height - modalHeight - 10;
    }
    
    setSelectedElement(node.data);
    setModalPosition({ x: finalX, y: finalY });
    setShowModal(true);
  }, []);

  // Handle edge click with proper modal positioning
  const onEdgeClick = useCallback((event, edge) => {
    const rect = event.currentTarget.closest('.react-flow').getBoundingClientRect();
    
    // Position modal at click location
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const modalWidth = 300;
    const modalHeight = 200;
    
    let finalX = x + 20;
    let finalY = y - modalHeight / 2;
    
    // Adjust if modal would go outside container
    if (finalX + modalWidth > rect.width) {
      finalX = x - modalWidth - 20;
    }
    if (finalY < 0) {
      finalY = 10;
    }
    if (finalY + modalHeight > rect.height) {
      finalY = rect.height - modalHeight - 10;
    }
    
    setSelectedElement(edge.data);
    setModalPosition({ x: finalX, y: finalY });
    setShowModal(true);
  }, []);

  // Handle pane click (close modal)
  const onPaneClick = useCallback(() => {
    setShowModal(false);
    setSelectedElement(null);
  }, []);

  const formatValue = (value, unit = '') => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString() + (unit ? ` ${unit}` : '');
    }
    return value;
  };

  if (!data || !data.nodes || !data.edges) {
    return (
      <div className="pipeline-graph-container">
        <div className="graph-loading">
          Loading pipeline data...
        </div>
      </div>
    );
  }

  return (
    <div className="pipeline-graph-container">
      <div className="graph-controls">
        <div className="legend">
          <h4>Node Types</h4>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
            <span>Pump</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
            <span>Junction</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
            <span>Valve</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
            <span>Sensor</span>
          </div>
          
          <h4 style={{ marginTop: '1rem' }}>Status</h4>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
            <span>Active</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#ff9800', borderRadius: '50%' }}></div>
            <span>Needs Attention</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
            <span>Critical/Leak</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#6b7280', borderRadius: '50%' }}></div>
            <span>Offline</span>
          </div>

          <h4 style={{ marginTop: '1rem' }}>Flow Status</h4>
          <div className="legend-item">
            <div style={{ width: '16px', height: '3px', backgroundColor: '#22c55e' }}></div>
            <span>Normal Flow</span>
          </div>
          <div className="legend-item">
            <div style={{ width: '16px', height: '3px', backgroundColor: '#ff9800' }}></div>
            <span>High Usage</span>
          </div>
          <div className="legend-item">
            <div style={{ width: '16px', height: '3px', backgroundColor: '#ef4444' }}></div>
            <span>Over Capacity</span>
          </div>
          <div className="legend-item">
            <div style={{ width: '16px', height: '3px', backgroundColor: '#6b7280' }}></div>
            <span>Low Usage</span>
          </div>
        </div>
      </div>

      <div className="graph-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.1,
            maxZoom: 1.5,
          }}
          minZoom={0.05}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap 
            nodeColor={(node) => node.data.color}
            nodeStrokeWidth={3}
            zoomable
            pannable
            style={{
              height: 120,
              width: 200,
            }}
          />
          <Background variant="dots" gap={20} size={1} />
          
          <Panel position="top-right">
            <div style={{ 
              background: 'var(--color-bg)', 
              padding: '8px 12px', 
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              fontSize: '0.85rem',
              color: 'var(--color-text)'
            }}>
              <strong>Pipeline Network</strong><br />
              {data.nodes.length} nodes, {data.edges.length} pipes
            </div>
          </Panel>
        </ReactFlow>

        {showModal && selectedElement && (
          <div 
            className="element-modal"
            style={{
              left: modalPosition.x,
              top: modalPosition.y,
              position: 'absolute',
              zIndex: 1000,
            }}
          >
            <div className="modal-content">
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
              
              <h3>{selectedElement.label || selectedElement.name || selectedElement.id}</h3>
              
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
    </div>
  );
};

export default PipelineGraph;