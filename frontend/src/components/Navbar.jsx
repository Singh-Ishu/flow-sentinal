import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.css";

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>Flow-Sentinel</div>
            <ul className={styles.navLinks}>
                <li>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            isActive ? styles.active : undefined
                        }
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/maintenance"
                        className={({ isActive }) =>
                            isActive ? styles.active : undefined
                        }
                    >
                        Maintenance
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/leak-prevention"
                        className={({ isActive }) =>
                            isActive ? styles.active : undefined
                        }
                    >
                        Leak Prevention
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
