import React from "react";

import Table from "./components/table";
import Map from "./components/map"
import PaymentDetails from "./components/payment-details";
import SchoolDetails from "./components/school-details";
import DeleteModal from "./delete";
import Data from "../../../utils/data";
import Stat from "../../home/components/stat";

//const $ = window.$;
const deleteModalInstance = new DeleteModal();

class BasicTable extends React.Component {
  render() {
    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">

            <div className="kt-portlet__body" style={{ minHeight: "500px" }}>
              <div className="row">
                <div className="col-md-6">

                  <SchoolDetails />

                  <PaymentDetails />

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicTable;



