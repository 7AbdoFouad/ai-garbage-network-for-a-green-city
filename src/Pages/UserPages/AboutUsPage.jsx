import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheckCircle } from "react-icons/fa";
import "./about.css";

const teamMembers = [
    { name: "Abdulrahman Muhammad Fouad Muhammad", role: "Project Manager,Frontend Developer" },
    { name: "Moataz Muhammad Mustafa Youssef Abdul Hadi", role: "Frontend Developer" },
    { name: "Khaled Gamal Rashad Bahlol", role: "Mobile App Developer" },
    { name: "Omar Al Sayed Sheikh Al Arab", role: "Team Leader,Backend Designer" },
    { name: "Youssef Ihab Ali Salama", role: "Backend Developer" },
    { name: "Amr Muhammad Youssef Ibrahim", role: "Mobile App Developer" },
    { name: "Ahmed Muhammad Mahmoud Ali Abdulrahman", role: "Mobile App Developer" },
    { name: "Essam Abdul Badawi Abdo Saleh", role: "UI,UX Designer" }
]; 

const getImage = (idx) => {
    return idx === 0 ? "/src/Pages/UserPages/2.jpg" : `https://i.pravatar.cc/150?img=${idx + 55}`;
};

const AboutUs = () => {
    return (
        <div className="container py-5"
            style={{
                background: "#e0f7fa",
                borderRadius: "20px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                padding: "50px",
                animation: "fadeIn 1s ease-in-out"
            }}
        >
            <div className="row align-items-center">
                {/* Text Section */}
                <div className="col-lg-6 text-center text-lg-start">
                    <h2 className="fw-bold text-success mb-4" style={{ fontSize: "2.5rem", textShadow: "1px 2px 5px rgba(0,0,0,0.1)" }}>
                        🌱 About the System
                    </h2>

                    {/* Project Goal */}
                    <h4 className="fw-semibold text-dark">🎯 Project Goal:</h4>
                    <p className="text-muted fs-5">
                        Enhancing waste management efficiency in Ismailia city through smart technology.
                    </p>

                    {/* Technologies Used */}
                    <h4 className="fw-semibold text-dark mt-4">🔧 Technologies Used:</h4>
                    <ul className="list-unstyled text-muted fs-5 tech-list">

    <li className="d-flex align-items-center">
        <FaCheckCircle className="text-success me-2 flex-shrink-0" />
        <strong>.NET</strong> - Backend development
    </li>
    <li className="d-flex align-items-center">
        <FaCheckCircle className="text-success me-2 flex-shrink-0" />
        <strong>React</strong> - Frontend development
    </li>
    <li className="d-flex align-items-center">
        <FaCheckCircle className="text-success me-2 flex-shrink-0" />
        <strong>Flutter</strong> - Mobile application
    </li>
</ul>

                </div>

                {/* Image Section */}
                <div className="col-lg-5 text-center hover">
                    <img
                        src="/src/Pages/UserPages/1.jpg"
                        alt="About Us"
                        className="img-fluid rounded shadow-lg hover-scale"
                    />
                </div>
            </div>

            {/* Team Section */}
            <div className="container py-5">
                <h2 className="text-center fw-bold text-success mb-4" style={{ fontSize: "2.5rem", textShadow: "1px 2px 5px rgba(0,0,0,0.1)" }}>
                    🌟 Meet Our Team
                </h2>
                <p className="text-center text-muted fs-5 mb-5">
                    A passionate team working together to make <strong>CleanCity</strong> a reality!
                </p>

                {/* Team Grid */}
                <div className="row g-4">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="col-md-6 col-lg-4 d-flex">
                            <div
                                className="team-card d-flex flex-column align-items-center text-center p-4 rounded w-100 hover-scale"
                            >
                                {/* Avatar */}
                                <div className="mb-3">
                                    <img
                                        src={getImage(index)}
                                        alt={member.name}
                                        className="rounded-circle border team-image"
                                    />
                                </div>

                                {/* Member Info */}
                                <h4 className="fw-bold text-dark">{member.name}</h4>
                                <p className="text-primary fw-semibold">{member.role}</p>

                                {/* Spacer to ensure equal height */}
                                <div className="mt-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
