import React, { useEffect, useState } from "react";
import PipelineGraph from "../components/PipelineGraph";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import styles from "./HomePage.css";

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
            <div className={styles.loadingWrapper}>
                <div className={styles.loader}></div>
            </div>
        );
    }

    return (
        <div className={styles.homeGrid}>
            <div className={styles.sidebarCol}>
                <Sidebar />
            </div>
            <div className={styles.graphCol}>
                <h1 className={styles.pageTitle}>Pipeline Network</h1>
                <PipelineGraph data={graphData} />
            </div>
        </div>
    );
};

export default HomePage;
