import React, { useState } from "react";
import "./PipelineGraph.css";

const dummyGraph = {
    nodes: [
        { id: "Pipe-001", label: "Pipe-001", status: "ok" },
        { id: "Pipe-002", label: "Pipe-002", status: "demand" },
        { id: "Pipe-003", label: "Pipe-003", status: "offline" },
    ],
    edges: [
        { id: "e1", source: "Pipe-001", target: "Pipe-002", status: "safe" },
        { id: "e2", source: "Pipe-002", target: "Pipe-003", status: "risk" },
    ],
};

const nodeColor = (status) => {
    if (status === "ok") return "#43a047"; // green
    if (status === "demand") return "#ffb300"; // yellow
    if (status === "offline") return "#222"; // black
    return "#90caf9";
};
const edgeColor = (status) => {
    if (status === "safe") return "#43a047"; // green
    if (status === "prone") return "#ffb300"; // yellow
    if (status === "risk") return "#e53935"; // red
    if (status === "leak") return "#9c27b0"; // purple
    return "#90caf9";
};

const PipelineGraph = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const data = dummyGraph;

    // Simple SVG rendering for demo
    return (
        <div className="graphWrapper">
            <svg width="100%" height="400" viewBox="0 0 600 400">
                {/* Render edges */}
                <line
                    x1="100"
                    y1="200"
                    x2="300"
                    y2="200"
                    stroke={edgeColor(data.edges[0].status)}
                    strokeWidth="6"
                />
                <line
                    x1="300"
                    y1="200"
                    x2="500"
                    y2="200"
                    stroke={edgeColor(data.edges[1].status)}
                    strokeWidth="6"
                />
                {/* Render nodes */}
                <circle
                    cx="100"
                    cy="200"
                    r="32"
                    fill={nodeColor(data.nodes[0].status)}
                    stroke="#ff9800"
                    strokeWidth="4"
                    onClick={() => {
                        setModalData(data.nodes[0]);
                        setModalOpen(true);
                    }}
                />
                <circle
                    cx="300"
                    cy="200"
                    r="32"
                    fill={nodeColor(data.nodes[1].status)}
                    stroke="#ff9800"
                    strokeWidth="4"
                    onClick={() => {
                        setModalData(data.nodes[1]);
                        setModalOpen(true);
                    }}
                />
                <circle
                    cx="500"
                    cy="200"
                    r="32"
                    fill={nodeColor(data.nodes[2].status)}
                    stroke="#ff9800"
                    strokeWidth="4"
                    onClick={() => {
                        setModalData(data.nodes[2]);
                        setModalOpen(true);
                    }}
                />
                {/* Node labels */}
                <text
                    x="100"
                    y="200"
                    textAnchor="middle"
                    dy=".3em"
                    fill="#fff"
                    fontSize="16"
                >
                    {data.nodes[0].label}
                </text>
                <text
                    x="300"
                    y="200"
                    textAnchor="middle"
                    dy=".3em"
                    fill="#fff"
                    fontSize="16"
                >
                    {data.nodes[1].label}
                </text>
                <text
                    x="500"
                    y="200"
                    textAnchor="middle"
                    dy=".3em"
                    fill="#fff"
                    fontSize="16"
                >
                    {data.nodes[2].label}
                </text>
            </svg>
            {modalOpen && (
                <div
                    className="modalOverlay"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="modalContent"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="closeBtn"
                            onClick={() => setModalOpen(false)}
                        >
                            &times;
                        </button>
                        <h3 className="modalTitle">
                            {modalData?.label || modalData?.id}
                        </h3>
                        <pre className="modalPre">
                            {JSON.stringify(modalData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PipelineGraph;
