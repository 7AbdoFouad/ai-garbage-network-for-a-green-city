// import React, { useState, useEffect } from "react";
// import { Link, NavLink } from "react-router-dom";

// const NavBar = () => {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => { // useEffect is a hook that runs after the first render and after every update
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 290);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => {  // cleanup function
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);
 
//   return (  
//     <div>
//       <nav className="navbar navbar-expand-lg bg-body-secondary">
//         <div className="container-fluid">
//         <div  className="m-5 fw-bold  w-100 text-center" style={{color:`#dc3545`,fontSize:`50px`}}>Note List</div>
//           <ul
//             className={`navbar-nav d-flex w-100 ${
//               isMobile
//                 ? "flex-column justify-content-start align-items-center"
//                 : "flex-row justify-content-around align-items-center"
//             }`}
//           >
//             <li className="nav-item">
//               <NavLink
//                 to="/"
//                 className={({ isActive }) =>
//                   isActive
//                     ? "link-danger text-decoration-none fs-5 "
//                     : "link-dark text-decoration-none fs-5"
//                 }
//                 //onfocus remove outline
//                 onFocus={(e) => e.target.blur()}
//               >
//                 Home
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink
//                 to="/login"
//                 className={({ isActive }) =>
//                   isActive
//                     ? "link-danger text-decoration-none fs-5"
//                     : "link-dark text-decoration-none fs-5"
//                 }
//               >
//                 Login
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink
//                 to="/registeration"
//                 className={({ isActive }) =>
//                   isActive
//                     ? "link-danger text-decoration-none fs-5"
//                     : "link-dark text-decoration-none fs-5"
//                 }
//               >
//                 Registration
//               </NavLink>
//             </li>
//           </ul>
//         </div>
//       </nav>
//     </div>
//   );
// };

// export default NavBar;

// import React, { useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import { FaBars, FaTimes } from 'react-icons/fa';
// import './Navbar.css'; // Create this file for styling

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleNavbar = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <nav className="navbar">
//       <div className="navbar-container">
//         {/* Icon on the left */}
//         <NavLink to="/" className="navbar-logo">
//           <img src="/src//Components/13215309.png" alt="Logo" /> {/* Replace with your logo */}
//         </NavLink>

//         {/* Styled Title "Green City" */}
//         <div className="navbar-title">
//           Green City
//         </div>

//         {/* Hamburger menu for mobile */}
//         <div className="menu-icon" onClick={toggleNavbar}>
//           {isOpen ? <FaTimes /> : <FaBars />}
//         </div>

//         {/* NavLinks */}
//         <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
//           <li className="nav-item">
//             <NavLink to="/" className="nav-links" onClick={toggleNavbar}>
//               Home
//             </NavLink>
//           </li>
//           <li className="nav-item">
//             <NavLink to="/about" className="nav-links" onClick={toggleNavbar}>
//               About
//             </NavLink>
//           </li>
//           <li className="nav-item">
//             <NavLink to="/services" className="nav-links" onClick={toggleNavbar}>
//               Services
//             </NavLink>
//           </li>
//         </ul>
//       </div>
//     </nav>
//   );
// };
import React from "react";
import { NavLink } from "react-router-dom";
import { FaLeaf } from "react-icons/fa";
import "./Navbar.css";

const CustomNavbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container custom-container">
        {/* Left: Logo & Title */}
        <a className="navbar-brand d-flex align-items-center" href="/">
          <FaLeaf className="logo-icon" />
          <span className="navbar-title">Green City</span>
        </a>

        {/* Navigation Links */}
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/registeration" className="nav-link">
              Registration
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default CustomNavbar;
