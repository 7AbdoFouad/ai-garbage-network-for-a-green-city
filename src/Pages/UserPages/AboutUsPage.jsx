import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const AboutUs = () => {
    return (
        <div className="container py-5">
            <div className="row align-items-center">
                {/* Text Section */}
                <div className="col-lg-6 text-center text-lg-start">
                    <h1 className="fw-bold">
                        Helping businesses <span className="text-primary">succeed</span> through the power of video.
                    </h1>
                    <p className="text-muted">
                        Video is the future of business in this digital-focused world. 
                        We help organizations of all sizes humanize their communications 
                        and personalize their customer experiences.
                    </p>
                    <button className="btn btn-success btn-lg mt-3">Sign Up for Free</button>
                </div>

                {/* Image Section */}
                <div className="col-lg-6 text-center">
                    <img src="/src/Pages/UserPages/1.jpg" alt="About Us" className="img-fluid rounded" />
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
