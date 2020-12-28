import React from 'react';

export default props => {
  return (
    <div className="kt-portlet__body">
      {/*begin: Search Form */}
      <div className="kt-form kt-fork--label-right kt-margin-t-1 kt-margin-b-5">
        <div className="row align-items-center">
          <div className="col-xl-12 order-2 order-xl-1">
            <div className="row align-items-center">
              <div className="col-md-12 kt-margin-b-20-tablet-and-mobile">
                <div className="kt-input-icon kt-input-icon--left">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Search ${props.title}...`}
                    onChange={props.onSearch}
                    id="generalSearch"
                  />
                  <span className="kt-input-icon__icon kt-input-icon__icon--left">
                    <span>
                      <i className="la la-search" />
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*end: Search Form */}
    </div>
  )
}