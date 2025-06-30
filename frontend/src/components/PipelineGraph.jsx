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

// Custom node component
const CustomNode = ({ data, selected }) => {
  const getNodeStyle = () => {
    const baseStyle = {
      width: data.size || 30,
      height: data.size || 30,
      background: data.color || '#22c55e',
      border: `2px solid ${selected ? '#2563eb' : '#fff'}`,
      borderRadius: data.type === 'sensor' ? '50%' : '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold',
      color: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
    };

    // Apply shape based on type
    switch (data.type) {
      case 'pump':
        baseStyle.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
        break;
      case 'junction':
        baseStyle.clipPath = 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';
        break;
      case 'valve':
        baseStyle.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        break;
      case 'sensor':
        baseStyle.borderRadius = '50%';
        break;
      default:
        baseStyle.borderRadius = '50%';
    }

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

  // Convert lat/lng to graph coordinates
  const convertCoordinates = (lat, lng) => {
    const scale = 1000;
    return {
      x: (lng - 77.2090) * scale,
      y: (lat - 28.6139) * scale,
    };
  };

  // Get node color based on status
  const getNodeColor = (status) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'demand': return '#ff9800';
      case 'offline': return '#6b7280';
      case 'leak': return '#ef4444';
      case 'unreported': return '#8b5cf6';
      default: return '#22c55e';
    }
  };

  // Get node size based on type
  const getNodeSize = (type) => {
    switch (type) {
      case 'pump': return 40;
      case 'junction': return 35;
      case 'valve': return 30;
      case 'sensor': return 25;
      default: return 30;
    }
  };

  // Get edge color based on flow utilization
  const getEdgeColor = (edge) => {
    const utilization = edge.current_flow / edge.flow_capacity;
    if (utilization > 0.9) return '#ef4444';
    if (utilization > 0.7) return '#ff9800';
    if (utilization > 0.5) return '#22c55e';
    return '#6b7280';
  };

  // Get edge width based on diameter
  const getEdgeWidth = (diameter) => {
    return Math.max(2, Math.min(8, diameter / 50));
  };

  // Prepare nodes and edges for React Flow
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!data || !data.nodes || !data.edges) {
      return { nodes: [], edges: [] };
    }

    const nodes = data.nodes.map(node => {
      const coords = convertCoordinates(node.position.y / 100, node.position.x / 100);
      return {
        id: node.id,
        type: 'custom',
        position: coords,
        data: {
          label: node.name,
          type: node.type,
          color: getNodeColor(node.status),
          size: getNodeSize(node.type),
          pressure: node.pressure,
          status: node.status,
          ...node,
        },
        draggable: false,
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

    return { nodes, edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedElement(node.data);
    setModalPosition({
      x: event.clientX - event.currentTarget.getBoundingClientRect().left,
      y: event.clientY - event.currentTarget.getBoundingClientRect().top,
    });
    setShowModal(true);
  }, []);

  // Handle edge click
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedElement(edge.data);
    setModalPosition({
      x: event.clientX - event.currentTarget.getBoundingClientRect().left,
      y: event.clientY - event.currentTarget.getBoundingClientRect().top,
    });
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
            <div className="legend-symbol pump"></div>
            <span>Pump</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol junction"></div>
            <span>Junction</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol valve"></div>
            <span>Valve</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol sensor"></div>
            <span>Sensor</span>
          </div>
          
          <h4 style={{ marginTop: '1rem' }}>Status</h4>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#22c55e' }}></div>
            <span>Active</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#ff9800' }}></div>
            <span>Needs Attention</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Critical/Leak</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol" style={{ backgroundColor: '#6b7280' }}></div>
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
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap 
            nodeColor={(node) => node.data.color}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          <Background variant="dots" gap={12} size={1} />
          
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
              left: modalPosition.x + 20,
              top: modalPosition.y - 100,
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