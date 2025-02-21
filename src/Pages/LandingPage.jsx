import React from 'react';
import { Link } from 'react-router-dom';
import  useAuth  from '../hooks/useAuth';
const LandingPage = () => {
  const { isLoggedIn } = useAuth();
  const handleclick = () => {
   if(isLoggedIn){
     console.log('logged in')
  }
  else{
    console.log('not logged in')
  }
  }
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="row align-items-center px-4 px-md-0 justify-content-center">
        <div className="col-lg-6 order-2  text-center text-lg-start">
          <h1 className="display-3 mb-4">Welcome to our website</h1>
          <p className="lead mb-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
            voluptatum, quibusdam, quidem, eaque quod quae nemo voluptate
            voluptatem quos dolores.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg">
            Login
          </Link>
        </div>
        <div className="col-lg-6 mb-4 mb-lg-0 d-flex justify-content-center   ">
          <img
            src="https://cdn-icons-png.freepik.com/512/14829/14829169.png"
            alt="placeholder"
            className="img-fluid rounded-3 shadow-lg mt-5"
          />
        </div>
      </div>
      {/* <div><button onClick={handleclick}>lolooooooooooooooooooo</button></div> */}
    </div>
  );
};

export default LandingPage;