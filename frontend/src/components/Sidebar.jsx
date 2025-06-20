function Sidebar() {
    return (
        <div className="sidebar-main">
            <h1>System Statistics</h1>
            <div className="table_component" role="region" tabIndex="0">
                <table>
                    <tbody>
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
                        {/* <tr>
                            <td>Demand Unmet Nodes</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Demand Met Nodes</td>
                            <td></td>
                        </tr> */}
                    </tbody>
                </table>

                <table>
                    <tbody>
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
                    </tbody>
                </table>

                <table>
                    <tbody>
                        <tr>
                            <td>Current Leak Locations</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Most Vulnerable Pipe</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>% of Sensors Reporting</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Sidebar;
