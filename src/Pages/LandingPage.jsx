import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LandingPage = () => {
  const { user, isLoading } = useAuth();

// Show a loading state while authentication is being checked
if (isLoading) {
  return <div>Loading...</div>;
}


if (user) {
  if (user.role === 'User') {
    return <Navigate to="/userDashboard" replace />;
  } else if (user.role === 'TruckDriver') {
    return <Navigate to="/truckDriverDashboard" replace />;
  } else {
    // Assume any other role (e.g., Manager, Admin) goes to managerDashboard
    return <Navigate to="/managerDashboard" replace />;
  }
}

// If not logged in, show the landing page content
return (
  <Navigate to="/userDashboard2" replace />
);
};

export default LandingPage;