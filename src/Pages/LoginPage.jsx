import React from "react";
import "../Styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthProvider";
import { ToastContainer, toast } from "react-toastify";

export default function LoginPage() {
  const { user, setUser, type, setType } = useContext(AuthContext);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const apiLogin = "LoginWorker";
  const navigate = useNavigate();

  // useEffect(() => {
  //   const checkToken = async () => {
  //     try {
  //       const token = await localStorage.getItem("Token");
  //       const type = await localStorage.getItem("Type");
  //       const phone = await localStorage.getItem("Phone");

  //       if (token !== null) {
  //         if (type === "A") navigate("/dashboard");
  //         else navigate("/requests");
  //       }
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   };
  //   checkToken();
  // }, []);

  const handleLogin = () => {
    const worker = {
      Phone: phone,
      FName: "",
      LName: "",
      Password: password,
      Email: "",
      PersonType: "W",
      Expo_push_token: "",
      workerType: "",
    };
    axios
      .post(apiLogin, worker)
      .then((res) => {
        console.log("here");
        if (res.data?.message) {
          toast.error(res.data.message);
          return;
        }
        const { Token } = res.data;
        let obj = {
          Phone: phone,
          FName: res.data.FName,
          LName: res.data.LName,
          Email: res.data.Email,
          WorkerType: res.data.WorkerType,
          IsActive: res.data.IsActive,
        };

        setUser(obj);
        setType(obj.WorkerType);
        //עדכון סוג המשתמש לאחר החיבור על מנת לרנדר את הסרגל הנכון לאחר התנתקות והתחברות למשתמש מסוג אחר
        //עדכון הטייפ יביא לרינדור מחדש של דף app.jsx
        saveToken(Token, obj.WorkerType, phone);
        if (obj.WorkerType == "A") {
          navigate("/dashboard");
        } else {
          if (obj.IsActive == true) navigate("/requests");
          else {
            toast.error("Your account is not active please contact admin");
          }
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const saveToken = async (token, type, phone) => {
    try {
      await localStorage.setItem("Token", token);
      await localStorage.setItem("Type", type);
      await localStorage.setItem("Phone", phone);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="maincontainer">
      <div className="container-fluid">
        <div className="row no-gutter">
          <div className="col-md-6 d-none d-md-flex bg-image"></div>

          <div className="col-md-6 bg-light">
            <div className="login d-flex align-items-center py-5">
              <div className="container">
                <div className="row">
                  <div className="col-lg-10 col-xl-7 mx-auto">
                    <h3 className="display-4">Resc4You</h3>
                    <form>
                      <div className="form-group mb-3">
                        <input
                          type="text"
                          placeholder="phone number"
                          required
                          className="form-control rounded-pill border-0 shadow-sm px-4"
                          onChange={(e) => setPhone(e.target.value)}
                          value={phone}
                        />
                      </div>
                      <div className="form-group mb-3">
                        <input
                          type="password"
                          placeholder="Password"
                          required
                          className="form-control rounded-pill border-0 shadow-sm px-4 text-primary"
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                        />
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-block text-uppercase mb-2 rounded-pill shadow-sm"
                        onClick={handleLogin}
                      >
                        Sign in
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
