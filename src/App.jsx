import React, { useState } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import {
  Route,
  Outlet,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom"; 

import NavBar from "./Components/Navbar";
// Public pages
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Registeration from "./Pages/Registeration";
import NotFound from "./Pages/NotFound";

// Manager pages
import HomePageForManagers from "./Pages/ManagerPages/HomePageForManagers";

// User pages
import HomePageForUsers from "./Pages/UserPages/HomePageForUsers";

// TruckDriver pages
import HomePageForTruckDrivers from "./Pages/TruckDriversPages/HomePageForTruckDrivers";


// Importing the toastify css
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

//Authintication 
import  AuthProvider  from "./Components/AuthContext";
import withAuthorization from "./Components/Hoc";

const App = () => {
 
  const Layout = () => {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition:Bounce
        />
        <ToastContainer />

        <NavBar />
        <Outlet />
      </>
    );
  };
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
         <Route
          path="/"
          element={ <LandingPage/> }
        />
        {/* <Route path="/TodoListPage" element={<TodoListPage />} />        */}
        {/* <Route path="/TodoListPage/:id" element={<ProtectedTodoListPage />} />     
        <Route path="/edit/:id" element={<Edit />} /> */}


        <Route path="/login" element={<Login />} />
        <Route path="/registeration" element={<Registeration />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );
  return (
    <div>

      <AuthProvider>
      <RouterProvider router={router} />
      </AuthProvider>
    </div>
  );
};

export default App;
