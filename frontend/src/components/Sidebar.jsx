import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Sidebar.css";

function Sidebar() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("/stats");
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setLoading(false);
            }
        };

        fetchStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <aside className="sidebar-main" aria-label="System Statistics Sidebar">
                <h1>System Statistics</h1>
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            </aside>
        );
    }

    if (!stats) {
        return (
            <aside className="sidebar-main" aria-label="System Statistics Sidebar">
                <h1>System Statistics</h1>
                <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                    Error loading statistics
                </div>
            </aside>
        );
    }

    return (
        <aside className="sidebar-main" aria-label="System Statistics Sidebar">
            <h1>System Statistics</h1>
            <div className="table-component" role="region" tabIndex="0">
                <section aria-label="Node Statistics">
                    <h2 className="visually-hidden">Node Statistics</h2>
                    <table>
                        <tbody>
                            <tr>
                                <td>Total Nodes</td>
                                <td>{stats.total_nodes}</td>
                            </tr>
                            <tr>
                                <td>Active Nodes</td>
                                <td>{stats.active_nodes}</td>
                            </tr>
                            <tr>
                                <td>Down Nodes</td>
                                <td>{stats.down_nodes}</td>
                            </tr>
                            <tr>
                                <td>Unreported Nodes</td>
                                <td>{stats.unreported_nodes}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <section aria-label="Flow Statistics">
                    <h2 className="visually-hidden">Flow Statistics</h2>
                    <table>
                        <tbody>
                            <tr>
                                <td>Total Flow</td>
                                <td>{Math.round(stats.total_flow)} L/min</td>
                            </tr>
                            <tr>
                                <td>Ideal Flow</td>
                                <td>{Math.round(stats.ideal_flow)} L/min</td>
                            </tr>
                            <tr>
                                <td>Flow Difference</td>
                                <td>{Math.round(stats.flow_difference)} L/min</td>
                            </tr>
                            <tr>
                                <td>Avg Pressure</td>
                                <td>{stats.avg_pressure.toFixed(1)} bar</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <section aria-label="Leak and Sensor Statistics">
                    <h2 className="visually-hidden">Leak and Sensor Statistics</h2>
                    <table>
                        <tbody>
                            <tr>
                                <td>Current Leak Locations</td>
                                <td>{stats.current_leaks}</td>
                            </tr>
                            <tr>
                                <td>Most Vulnerable Pipe</td>
                                <td>{stats.most_vulnerable_pipe}</td>
                            </tr>
                            <tr>
                                <td>% of Sensors Reporting</td>
                                <td>{Math.round(stats.sensor_reporting_percentage)}%</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
        </aside>
    );
}

export default Sidebar;