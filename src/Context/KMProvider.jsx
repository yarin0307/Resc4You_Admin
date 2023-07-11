import React from "react";
import { createContext, useState } from "react";

export const KMContext = createContext();
export default function KMProvider(props) {
 const[km,setKm]=useState("");
  return (
    <KMContext.Provider value={{ km,setKm}}>
      {props.children}
    </KMContext.Provider>
  );
}
