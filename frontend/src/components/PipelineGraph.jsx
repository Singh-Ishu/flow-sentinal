import React, { useState } from "react";
import "./PipelineGraph.css";

const PipelineGraph = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const data = 0;

    // Simple SVG rendering for demo
    return (
        <div className="graphWrapper">
            <img src="/latitude-and-longitude-map-of-india.jpg" />
        </div>
    );
};

export default PipelineGraph;
