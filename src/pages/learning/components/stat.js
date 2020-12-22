import React from "react";

export default props => (
  <div className="kt-portlet kt-portlet--height-fluid">
    <div className="kt-portlet__head kt-portlet__head--noborder">
      <div className="kt-portlet__head-label">
        <h3 className="kt-portlet__head-title">{props.label}</h3>
      </div>
    </div>
    <div className="kt-portlet__body kt-portlet__body--fluid">
      <div className="kt-widget-19">
        <div className="kt-widget-19__title">
          <div className="kt-widget-19__label">
            <small />
            {props.number}
          </div>
          <img
            className="kt-widget-19__bg"
            src="./assets/media/misc/iconbox_bg.png"
            alt="bg"
          />
        </div>
      </div>
    </div>
  </div>
);
