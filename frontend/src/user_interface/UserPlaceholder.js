import React from "react";

const UserPlaceholder = ({ title, message }) => {
  return (
    <div className="col-md-9 userProfile-main">
      <div className="container">
        <h2>{title}</h2>
        <div className="card text-center my-5">
          <div className="card-body">
            <p className="card-text mb-0">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPlaceholder;
