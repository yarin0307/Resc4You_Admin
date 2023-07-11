import { useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import { NavLink } from "react-router-dom";
import "../Styles/SideBar.css";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useContext } from 'react';
import { AuthContext } from "../Context/AuthProvider";
function SidebarAdmin() {
  const [expanded, setExpanded] = useState(false);
  const { user, setUser} = useContext(AuthContext);

  const navigate = useNavigate();

  const handleNavClick = () => {
    setExpanded(false);
  };

  const handleLogout = () => {
    // Handle the logout logic here
    setUser({});
    localStorage.removeItem("Token");
    localStorage.removeItem("Type");
    localStorage.removeItem("Phone");
    navigate("/");
  };

  return (
    <>
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        className="mb-3 custom-navbar"
      >
        <Container fluid>
          <Navbar.Brand className="custom-brand">
            <strong>RESC4YOU</strong>
            <img
              src={logo}
              alt="My App Logo"
              width="30"
              height="30"
              className="d-inline-block align-text-top me-2"
              style={{
                backgroundColor: "white",
                borderRadius: "50%",
                marginLeft: "10px",
              }}
            />
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls="offcanvasNavbar"
            onClick={() => setExpanded((prevExpanded) => !prevExpanded)}
            className="me-auto"
          />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            show={expanded}
            onHide={() => setExpanded(false)}
            placement="start"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Resc4You</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <NavLink
                  to="/dashboard"
                  className="nav-link"
                  activeclassname="active"
                  onClick={handleNavClick}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/requests"
                  className="nav-link"
                  activeclassname="active"
                  onClick={handleNavClick}
                >
                  Requests
                </NavLink>
                <NavLink
                  to="/volunteers"
                  className="nav-link"
                  activeclassname="active"
                  onClick={handleNavClick}
                >
                  Volunteers
                </NavLink>
                <NavLink
                  to="/workers"
                  className="nav-link"
                  activeclassname="active"
                  onClick={handleNavClick}
                >
                  Representatives
                </NavLink>
                <NavLink
                  to="/update-list"
                  className="nav-link"
                  activeclassname="active"
                  onClick={handleNavClick}
                >
                  Update Lists
                </NavLink>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
}

export default SidebarAdmin;
