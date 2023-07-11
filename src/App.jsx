import React, { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import SidebarAdmin from "./Components/SideBarAdmin";
import { AuthContext } from "./Context/AuthProvider";
import { useState, useContext } from "react";
import RequestsPage from "./Pages/RequestsPage";
import VolunteersPage from "./Pages/VolunteersPage";
import UpdateListPage from "./Pages/UpdateListPage";
import LoginPage from "./Pages/LoginPage";
import NewRequestPage from "./Pages/NewRequestPage";
import axios from "axios";
import EditRequestPage from "./Pages/EditRequestPage";
import RegisterVolunteerPage from "./Pages/RegisterVolunteerPage";
import UpdateDetailsVolunteerPage from "./Pages/UpdateDetailsVolunteerPage";
import WorkersPage from "./Pages/WorkersPage";
import RegisterWorkerPage from "./Pages/RegisterWorkerPage";
import UpdateDetailsWorkerPage from "./Pages/UpdateDetailsWorkerPage";
import SidebarWorker from "./Components/SideBarWorker";
import DashboardPage from "./Pages/DashboardPage";
import { KMContext } from "./Context/KMProvider";
import ProtectedRoutes from "./ProtectedRoutes";
import NotFoundPage from "./Pages/NotFoundPage";

axios.defaults.baseURL = "https://proj.ruppin.ac.il/cgroup49/prod/";

function App() {
  const { user, setUser, type, setType } = useContext(AuthContext);
  const { km, setKm } = useContext(KMContext);
  const apiKm = "api/KMs";

  useEffect(() => {
    const typeFrom = localStorage.getItem("Type");
    setType(typeFrom);
    axios
      .get(apiKm)
      .then((response) => {
        console.log(response.data);
        setKm(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const location = useLocation();
  if (type === "A") {
    return (
      <div className="container-fluid">
        {location.pathname !== "/" && <SidebarAdmin />}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/volunteers" element={<VolunteersPage />} />
            <Route path="/update-list" element={<UpdateListPage />} />
            <Route path="/new-request" element={<NewRequestPage />} />
            <Route path="/editRequest" element={<EditRequestPage />} />
            <Route
              path="/registerVolunteer"
              element={<RegisterVolunteerPage />}
            />
            <Route
              path="/updateDetailsVolunteer"
              element={<UpdateDetailsVolunteerPage />}
            />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/registerWorker" element={<RegisterWorkerPage />} />
            <Route
              path="/updateDetailsWorker"
              element={<UpdateDetailsWorkerPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </div>
    );
  } else {
    return (
      <div className="container-fluid">
        {location.pathname !== "/" && <SidebarWorker />}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/new-request" element={<NewRequestPage />} />
            <Route path="/editRequest" element={<EditRequestPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </div>
    );
  }
}

export default App;
