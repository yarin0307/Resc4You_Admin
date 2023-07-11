import React from "react";

const Rating = ({ rating }) => {
  const numStars = 5; // total number of stars
  const fullStars = Math.floor(rating); // number of full stars
  const emptyStars = numStars - fullStars; // number of empty stars

  // array to hold the stars
  const stars = [];

  // push full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<i className="fa fa-star" key={i}></i>);
  }

  // push empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<i className="fa fa-star-o" key={fullStars + i}></i>);
  }

  // set the color of the stars based on the rating
  const starStyle = {
    color:
      rating === 0
        ? "rgba(255, 165, 0, 0.25)"
        : `rgba(255, 215, 0, ${rating / numStars})`,
  };

  return (
    <div
      className="card col-md-5 mb-3"
      style={{
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        marginTop: "1%",
        marginBottom: "1%",
      }}
    >
      <h3>Average Rating</h3>
      <div style={{ fontSize: "2rem" }}>
        {stars.map((star) => (
          <span key={star.key} style={starStyle}>
            {star}
          </span>
        ))}
      </div>
      {/* <h4>{rating}</h4> */}
    </div>
  );
};

export default Rating;
