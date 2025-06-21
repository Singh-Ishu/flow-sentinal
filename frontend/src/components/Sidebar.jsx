import "./Sidebar.css";

function Sidebar() {
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
                      </tbody>
                  </table>
                </section>
                <section aria-label="Flow Statistics">
                  <h2 className="visually-hidden">Flow Statistics</h2>
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
                </section>
                <section aria-label="Leak and Sensor Statistics">
                  <h2 className="visually-hidden">Leak and Sensor Statistics</h2>
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
                </section>
            </div>
        </aside>
    );
}

export default Sidebar;

// Add this to your global CSS for accessibility
// .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
