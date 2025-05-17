import React from "react";

class Footer extends React.Component {
  render() {
    const footerStyle = {
      position: "fixed",
      left: 0,
      bottom: 0,
      width: "100%",
      backgroundColor: "#333",
      color: "white",
      textAlign: "center",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 15px",
    };

    return (
      <div style={footerStyle}>
        <div>ShulePlus</div>
        <div>
          v1.3.1 (Staging)
        </div>
      </div>
    );
  }
}

export default Footer;
