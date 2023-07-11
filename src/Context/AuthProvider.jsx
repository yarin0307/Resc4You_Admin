import React from "react";
import { createContext, useState } from "react";

export const AuthContext = createContext();
export default function AuthProvider(props) {
  const [user, setUser] = useState({});
  const [type, setType] = useState("");
  return (
    <AuthContext.Provider value={{ user, setUser, type, setType }}>
      {props.children}
    </AuthContext.Provider>
  );
}
