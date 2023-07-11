import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';


const ProtectedRoutes = () => {
  let token = localStorage.getItem("Token");
  let auth;

  if (token !== null) {
    auth = true;
  }
  else {
    auth = false;
  }

  return auth ? <Outlet /> : <Navigate to="/" />;

};


export default ProtectedRoutes;
