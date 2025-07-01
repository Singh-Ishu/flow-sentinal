import React, { useEffect, useState } from "react";
import PipelineGraph from "../components/PipelineGraph";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "./HomePage.css";

const HomePage = () => {
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const graphResponse = await axios.get("/graph");
                setGraphData(graphResponse.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(
                    "Failed to load pipeline data. Make sure the backend server is running."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Refresh data every 5 minutes
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="loadingWrapper">
                <div className="loader"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="homeGrid">
                <div className="sidebarCol">
                    <Sidebar />
                </div>
                <div className="graphCol">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "2rem",
                            background: "#fff",
                            borderRadius: "8px",
                            color: "#ef4444",
                        }}
                    >
                        <h2>Connection Error</h2>
                        <p>{error}</p>
                        <p>
                            Please ensure the backend server is running on
                            http://localhost:8000
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="homeGrid">
            <div className="sidebarCol">
                <Sidebar />
            </div>
            <div className="graphCol">
                <PipelineGraph data={graphData} />
            </div>
        </div>
    );
};

export default HomePage;
