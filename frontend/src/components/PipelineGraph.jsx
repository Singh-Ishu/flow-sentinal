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
  const [hoveredElement, setHoveredElement] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [showHover, setShowHover] = useState(false);

  // Convert lat/lng to graph coordinates with better scaling
  const convertCoordinates = (lat, lng) => {
    if (!lat || !lng) {
      // Generate random position if no coordinates
      return { 
        x: (Math.random() - 0.5) * 2000, 
        y: (Math.random() - 0.5) * 2000 
      };
    }
    
    // Use a larger scale factor to spread nodes out more
    const scale = 8000;
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

    console.log('Raw data nodes:', data.nodes.length);
    console.log('Sample node:', data.nodes[0]);

    const nodes = data.nodes.map((node, index) => {
      // Handle different coordinate formats more robustly
      let lat, lng;
      
      // Try different coordinate sources
      if (node.latitude && node.longitude) {
        lat = node.latitude;
        lng = node.longitude;
      } else if (node.position && node.position.y && node.position.x) {
        lat = node.position.y / 100;
        lng = node.position.x / 100;
      } else {
        // Fallback to distributed positions
        const angle = (index / data.nodes.length) * 2 * Math.PI;
        const radius = 500 + (index % 3) * 200;
        lat = 28.6139 + Math.cos(angle) * 0.01 * radius / 100;
        lng = 77.2090 + Math.sin(angle) * 0.01 * radius / 100;
      }

      const coords = convertCoordinates(lat, lng);
      
      console.log(`Node ${node.id}: lat=${lat}, lng=${lng}, coords=`, coords);
      
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
          max_pressure: node.max_pressure,
          flow_rate: node.flow_rate,
          latitude: lat,
          longitude: lng,
          last_updated: node.last_updated,
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
    console.log('Node positions:', nodes.map(n => ({ id: n.id, pos: n.position })));

    return { nodes, edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node hover
  const onNodeMouseEnter = useCallback((event, node) => {
    const rect = event.currentTarget.closest('.react-flow').getBoundingClientRect();
    const nodeRect = event.currentTarget.getBoundingClientRect();
    
    const x = nodeRect.left - rect.left + nodeRect.width / 2;
    const y = nodeRect.top - rect.top - 10; // Position above node
    
    setHoveredElement(node.data);
    setHoverPosition({ x, y });
    setShowHover(true);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setShowHover(false);
    setHoveredElement(null);
  }, []);

  // Handle node click with detailed modal
  const onNodeClick = useCallback((event, node) => {
    const rect = event.currentTarget.closest('.react-flow').getBoundingClientRect();
    const nodeRect = event.currentTarget.getBoundingClientRect();
    
    // Calculate position relative to the React Flow container
    const x = nodeRect.left - rect.left + nodeRect.width / 2;
    const y = nodeRect.top - rect.top + nodeRect.height / 2;
    
    // Ensure modal stays within bounds
    const modalWidth = 400;
    const modalHeight = 300;
    
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
    setShowHover(false); // Hide hover when showing detailed modal
  }, []);

  // Handle edge click with proper modal positioning
  const onEdgeClick = useCallback((event, edge) => {
    const rect = event.currentTarget.closest('.react-flow').getBoundingClientRect();
    
    // Position modal at click location
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const modalWidth = 350;
    const modalHeight = 250;
    
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
    setShowHover(false);
    setHoveredElement(null);
  }, []);

  const formatValue = (value, unit = '') => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString() + (unit ? ` ${unit}` : '');
    }
    return value;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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

          <h4 style={{ marginTop: '1rem' }}>Interactions</h4>
          <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
            <div>• <strong>Hover:</strong> Quick info</div>
            <div>• <strong>Click:</strong> Detailed view</div>
            <div>• <strong>Drag:</strong> Move nodes</div>
            <div>• <strong>Scroll:</strong> Zoom in/out</div>
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
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
            minZoom: 0.1,
            maxZoom: 1.5,
          }}
          minZoom={0.05}
          maxZoom={3}
          defaultViewport={{ x: 0, y: 0, zoom: 0.3 }}
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

        {/* Hover tooltip - simple info */}
        {showHover && hoveredElement && (
          <div 
            className="hover-tooltip"
            style={{
              position: 'absolute',
              left: hoverPosition.x - 75,
              top: hoverPosition.y - 60,
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              pointerEvents: 'none',
              zIndex: 1001,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <div><strong>{hoveredElement.label || hoveredElement.name || hoveredElement.id}</strong></div>
            <div>Type: {hoveredElement.type}</div>
            <div>Status: {hoveredElement.status}</div>
            {hoveredElement.pressure && (
              <div>Pressure: {formatValue(hoveredElement.pressure, 'bar')}</div>
            )}
          </div>
        )}

        {/* Detailed click modal */}
        {showModal && selectedElement && (
          <div 
            className="element-modal"
            style={{
              left: modalPosition.x,
              top: modalPosition.y,
              position: 'absolute',
              zIndex: 1000,
              minWidth: '350px',
              maxHeight: '400px',
              overflowY: 'auto',
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
                // Node details - comprehensive
                <div className="modal-details">
                  <div><strong>ID:</strong> {selectedElement.id}</div>
                  <div><strong>Type:</strong> {selectedElement.type}</div>
                  <div><strong>Status:</strong> 
                    <span style={{ 
                      color: getNodeColor(selectedElement.status), 
                      fontWeight: 'bold',
                      marginLeft: '8px',
                      textTransform: 'capitalize'
                    }}>
                      {selectedElement.status}
                    </span>
                  </div>
                  
                  {selectedElement.pressure && (
                    <div><strong>Current Pressure:</strong> {formatValue(selectedElement.pressure, 'bar')}</div>
                  )}
                  {selectedElement.max_pressure && (
                    <div><strong>Max Pressure:</strong> {formatValue(selectedElement.max_pressure, 'bar')}</div>
                  )}
                  {selectedElement.flow_rate && (
                    <div><strong>Flow Rate:</strong> {formatValue(selectedElement.flow_rate, 'L/min')}</div>
                  )}
                  
                  {selectedElement.latitude && selectedElement.longitude && (
                    <>
                      <div><strong>Latitude:</strong> {selectedElement.latitude.toFixed(6)}</div>
                      <div><strong>Longitude:</strong> {selectedElement.longitude.toFixed(6)}</div>
                    </>
                  )}
                  
                  {selectedElement.last_updated && (
                    <div><strong>Last Updated:</strong> {formatDate(selectedElement.last_updated)}</div>
                  )}

                  {/* Pressure utilization bar */}
                  {selectedElement.pressure && selectedElement.max_pressure && (
                    <div style={{ marginTop: '12px' }}>
                      <strong>Pressure Utilization:</strong>
                      <div style={{ 
                        background: '#f0f0f0', 
                        borderRadius: '4px', 
                        overflow: 'hidden',
                        height: '20px',
                        marginTop: '4px'
                      }}>
                        <div style={{
                          background: selectedElement.pressure / selectedElement.max_pressure > 0.8 ? '#ef4444' : 
                                   selectedElement.pressure / selectedElement.max_pressure > 0.6 ? '#ff9800' : '#22c55e',
                          height: '100%',
                          width: `${Math.min(100, (selectedElement.pressure / selectedElement.max_pressure) * 100)}%`,
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                        {Math.round((selectedElement.pressure / selectedElement.max_pressure) * 100)}% of maximum
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Edge details - comprehensive
                <div className="modal-details">
                  <div><strong>Pipe ID:</strong> {selectedElement.id}</div>
                  <div><strong>Length:</strong> {formatValue(selectedElement.length, 'm')}</div>
                  <div><strong>Current Flow:</strong> {formatValue(selectedElement.current_flow, 'L/min')}</div>
                  <div><strong>Flow Capacity:</strong> {formatValue(selectedElement.flow_capacity, 'L/min')}</div>
                  
                  {selectedElement.current_flow && selectedElement.flow_capacity && (
                    <>
                      <div><strong>Utilization:</strong> {((selectedElement.current_flow / selectedElement.flow_capacity) * 100).toFixed(1)}%</div>
                      
                      {/* Flow utilization bar */}
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ 
                          background: '#f0f0f0', 
                          borderRadius: '4px', 
                          overflow: 'hidden',
                          height: '20px'
                        }}>
                          <div style={{
                            background: getEdgeColor(selectedElement),
                            height: '100%',
                            width: `${Math.min(100, (selectedElement.current_flow / selectedElement.flow_capacity) * 100)}%`,
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div><strong>Source Node:</strong> {selectedElement.source}</div>
                  <div><strong>Target Node:</strong> {selectedElement.target}</div>
                  
                  {selectedElement.diameter && (
                    <div><strong>Diameter:</strong> {formatValue(selectedElement.diameter, 'mm')}</div>
                  )}
                  {selectedElement.material && (
                    <div><strong>Material:</strong> {selectedElement.material}</div>
                  )}
                  {selectedElement.pressure_loss && (
                    <div><strong>Pressure Loss:</strong> {formatValue(selectedElement.pressure_loss, 'bar')}</div>
                  )}
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