import React from 'react';

// Import the components to be displayed
import PaymentDetails from "./components/payment-details";
import SchoolDetails from "./components/school-details";

// Removed unused imports: Table, Map, DeleteModal, Data, Stat
// Removed unused instance: deleteModalInstance

// Consider renaming this component if it's no longer just a "BasicTable"
// Maybe SchoolDashboardLayout or SchoolInfoPanel?
class SchoolInfoLayout extends React.Component {
  render() {
    // Keep the outer Keen theme wrapper classes if they are essential for the overall page layout
    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        {/* Main content grid */}
        <div className="kt-grid kt-grid--hor kt-grid--root">
          {/* Using a portlet as the main container */}
          <div className="kt-portlet kt-portlet--mobile">

            {/* Portlet body provides padding and a container */}
            {/* <div className="kt-portlet__body" style={{ minHeight: "500px" }}> */}

              {/* Bootstrap Row: This holds the columns */}
              <div className="row">

                {/* Column 1: Takes up half the width on medium screens and larger */}
                <div className="col-md-6">
                  {/* School Details Component */}
                  {/* Added margin-bottom for spacing when stacked on small screens */}
                  <div className="mb-4 mb-md-0"> {/* mb-md-0 removes margin on medium+ */}
                     <SchoolDetails />
                  </div>
                </div>

                {/* Spacer between columns */}
                <div className="col-md-2 d-none d-md-block"></div>

                {/* Column 2: Takes up the other half on medium screens and larger */}
                <div className="col-md-5">
                  {/* Payment Details Component */}
                  <PaymentDetails />
                </div>

              </div> {/* End of .row */}

            {/* </div> */}
          </div> {/* End of .kt-portlet */}
        </div> {/* End of .kt-grid */}
      </div> // End of outer wrapper
    );
  }
}

// Make sure to export the correct component name if you renamed it
export default SchoolInfoLayout; // Or export default BasicTable; if you kept the old name