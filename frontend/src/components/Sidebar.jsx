function Sidebar() {
    return (
        <div className="sidebar-main">
            <div className="table_component" role="region" tabIndex="0">
                <table>
                    <thead>
                        <tr>
                            <th colSpan="2">System Statistics</th>
                        </tr>
                    </thead>
                    <tbody>
                        <section className="sidebar-stats-section">
                            <tr>
                                <td>Total Nodes</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Active Nodes</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Down Nodes</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Unreported Nodes</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Demand Unmet Nodes</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Demand Met Nodes</td>
                                <td></td>
                            </tr>
                        </section>
                        <section className="sidebar-stats-section">
                            <tr>
                                <td>Total Flow</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Ideal Flow</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Flow Difference</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Pressure Stats</td>
                                <td></td>
                            </tr>
                        </section>
                        <section className="sidebar-stats-section">
                            <tr>
                                <td>Current Leak Locations</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Most Vulnerable pipe</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>% of Sensors reporting</td>
                                <td></td>
                            </tr>
                        </section>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Sidebar;
