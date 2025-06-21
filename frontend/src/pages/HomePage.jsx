import React, { useEffect, useState } from "react";
import PipelineGraph from "../components/PipelineGraph";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "./HomePage.css";

const HomePage = () => {
    const [graphData, setGraphData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([axios.get("/graph"), axios.get("/stats")]).then(
            ([graphRes, statsRes]) => {
                setGraphData(graphRes.data);
                setStats(statsRes.data);
                setLoading(false);
            }
        );
    }, []);

    if (loading) {
        return (
            <div className="loadingWrapper">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="homeGrid">
            <div className="sidebarCol">
                <Sidebar />
            </div>
            <div className="graphCol">
                {/* <h1 className="pageTitle">Pipeline Network</h1> */}
                <PipelineGraph data={graphData} />
            </div>
        </div>
    );
};

export default HomePage;
