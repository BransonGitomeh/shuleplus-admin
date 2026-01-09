import React from "react";

const Stat = ({ label, number, icon = "chart-bar", color = "primary" }) => {
  // Map bootstrap colors to hex for background tint if needed, 
  // or just use bootstrap utility classes.
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body p-3 d-flex align-items-center">
        {/* Icon Container */}
        <div 
          className={`rounded-circle d-flex align-items-center justify-content-center mr-3 bg-light-${color} text-${color}`}
          style={{ width: '50px', height: '50px', fontSize: '20px' }}
        >
          <i className={`fas fa-${icon}`}></i>
        </div>

        {/* Text Container */}
        <div>
          <div className="text-muted text-uppercase small font-weight-bold" style={{ letterSpacing: '0.5px' }}>
            {label}
          </div>
          <h3 className="mb-0 font-weight-bold text-dark">
            {number}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Stat;