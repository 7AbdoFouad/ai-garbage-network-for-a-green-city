// src/Components/withAuthorization.jsx
import React from "react";
import { Navigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function withAuthorization(Component, allowedRoles = []) {
  return function Wrapped(props) {
    const { user } = useAuth();
    const { id } = useParams();

    // If not logged in, send to /login
    // if (!user) return <Navigate to="/login"  />;

    // If allowedRoles is empty, allow all logged-in users
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {
      // forbidden
      return <Navigate to="*" replace />;
    }

    // all good
    return <Component {...props} />;
  };
}
