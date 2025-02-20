import React, { createContext, useState, useContext, useEffect } from "react";
import PropTypes from 'prop-types';
// import Cookies from 'js-cookie';
import { useCookies } from "react-cookie";


// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider to wrap the app
export default function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [user, setUser] = useState(null); // Store user info if needed
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);  // Save user details (including "role")
    setCookie("user", userData, { path: "/", expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    // localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    removeCookie("user", { path: "/" });
    // localStorage.removeItem("user");
  };
  // Sync auth state with cookies
  useEffect(() => {
    if (cookies.user) {
      try {
        const userData = cookies.user; 
        setIsLoggedIn(true);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse user cookie:", error);
      }
    }
  }, [cookies.user]); // Re-run when cookies change

  // useEffect(() => {
  //   // Retrieve user data from cookies
  //   const userData = Cookies.get('user');
  //   if (userData) {
  //     setIsLoggedIn(true);
  //     setUser(JSON.parse(userData)); // Assuming user data is stored as a JSON string
  //   }
  // }, []);

  // const login = (userData) => {
  //   setIsLoggedIn(true);
  //   setUser(userData);
  //   // Store user data in cookies
  //   Cookies.set('user', JSON.stringify(userData), { expires: 7 }); // Expires in 7 days
  // };

  // const logout = () => {
  //   setIsLoggedIn(false);
  //   setUser(null);
  //   // Remove user data from cookies
  //   Cookies.remove('user');
  // };

 return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout}}> 
      {children}
    </AuthContext.Provider>)
}



AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
// Custom hook for accessing AuthContext
// export function useAuth() {
//   return useContext(AuthContext);
// }
