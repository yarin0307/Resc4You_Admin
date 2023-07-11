import React from 'react'
import notFound from '../assets/notFound.PNG';


export default function NotFoundPage() {
  return (
    <div className='row'>
      <div className='col-12' style={{display:"flex", justifyContent:"center",marginTop:"2%"}}>
        <img style={{ height: "100%", width:"60%" }} src={notFound} />
      </div>
    </div>
  );
};
