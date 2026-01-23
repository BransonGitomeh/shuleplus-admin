import React from "react";
import Navbar from "../../components/navbar";
import Subheader from "../../components/subheader";
// import Footer from "../../components/footer";
import ResultsMatrix from "./matrix";

class ResultsIndex extends React.Component {
  render() {
    return (
      <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
        <div
          className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper"
          id="kt_wrapper"
        >
          <Navbar />
          <Subheader links={["Results", "Management"]} />

          <div
            className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
            style={{ minHeight: "100vh" }}
            id="kt_content"
          >
            <div className="kt-container  kt-grid__item kt-grid__item--fluid">
              <ResultsMatrix />
            </div>
          </div>
          {/* <Footer /> */}
        </div>
      </div>
    );
  }
}

export default ResultsIndex;
