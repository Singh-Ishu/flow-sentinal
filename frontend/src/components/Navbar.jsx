import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">Flow-Sentinel</div>
            <ul className="navLinks">
                <li>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            isActive ? "active" : undefined
                        }
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/maintenance"
                        className={({ isActive }) =>
                            isActive ? "active" : undefined
                        }
                    >
                        Maintenance
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/leak-prevention"
                        className={({ isActive }) =>
                            isActive ? "active" : undefined
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
