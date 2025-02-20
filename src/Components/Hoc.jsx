import React from "react";
import { Navigate } from "react-router-dom";
import  useAuth  from "../hooks/useAuth";
// import Cookies from 'js-cookie';

function withAuthorization(Component) {
  return function AuthRoute(props) {
    const { isLoggedIn } = useAuth(); // Get login state from context
    // const userData = Cookies.get('user');
    // const isLoggedIn = userData ? true : false;

    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      return <Navigate to="/login" replace />;
    }

    // Render the wrapped component if logged in
    return <Component {...props} />;
  };
}

export default withAuthorization;
