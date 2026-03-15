import React from "react";
import Navbar from "../../components/navbar";
import Subheader from "../../components/subheader";
// 1. Import the CurriculumManagerV5 component
import CurriculumManagerV5 from "./list"; 
import Footer from "../../components/footer";
import ProfilePanel from "../../components/profile-panel";

class App extends React.Component {
  render() {
    return (
      <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
        <div
          className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper"
          id="kt_wrapper"
        >
          <Navbar />
          <Navbar />

          <div
            // Note: The height style here might constrain the layout. 
            // It's often better to let content define the height.
            className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
            id="kt_content"
          >
            {/* The kt-container class provides horizontal padding. 
                The CSS inside CurriculumManagerV5 is designed to counteract this for a full-width effect. */}
            <div className="kt-container  kt-grid__item kt-grid__item--fluid">
              
              {/* 2. Replace the old "List" component with the new manager component */}
              <CurriculumManagerV5 id={this.props.match.params.id} />

            </div>
          </div>
          <Footer />
        </div>
        <ProfilePanel />
      </div>
    );
  }
}

export default App;