import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { toast } from "react-toastify";

function withAuthorization(Component, requiredRole) {
  return function AuthRoute(props) {
    const { isLoggedIn, user, islogoutyet, setIslogoutyet } = useAuth();
    const location = useLocation();

    // Store last active page before redirection
    useEffect(() => {
      if (isLoggedIn) {
        sessionStorage.setItem("lastActivePath", location.pathname);
      }
    }, [location.pathname, isLoggedIn]);

    if (islogoutyet) {
      setIslogoutyet(false);
      toast.error("Logout successfully");
      return <Navigate to="/login" replace />;
    }

    if (!isLoggedIn) {
      toast.error("You need to login to view this page");
      return <Navigate to="/login" replace />;
    }
    // [1, 2, 3].includes(2) => true
    if (
      requiredRole &&
      !requiredRole.some((role) => user.Permissions.includes(role))
    ) {
      toast.error("You are not authorized to view this page");

      // Retrieve the last active page (before unauthorized attempt)
      const lastActivePath = sessionStorage.getItem("lastActivePath") || "/";

      return <Navigate to={lastActivePath} replace />;
    }

    return <Component {...props} />;
  };
}

export default withAuthorization;
