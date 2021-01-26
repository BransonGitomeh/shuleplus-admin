import React from "react";

import Table from "./components/table";
import Data from "../../utils/data";

const $ = window.$;

export default class BasicTable extends React.Component {
  state = {
    invitations: [],
    filteredInvitations: [],
  };
  componentDidMount() {
    const invitations = Data.invitations.list();
    this.setState({ invitations, filteredInvitations: invitations });

    Data.invitations.subscribe(({ invitations }) => {
      this.setState({ invitations, filteredInvitations: invitations });
    });
  }

  onSearch = e => {
    const { invitations } = this.state
    const filteredInvitations = invitations.filter(invitation => invitation.message.toLowerCase().match(e.target.value.toLowerCase()))
    this.setState({ filteredInvitations })
  }

  render() {
    const { edit, remove, routes, buses, drivers } = this.state;
    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            <div className="kt-portlet__body">
              {/*begin: Search Form */}
              <div className="kt-form kt-fork--label-right kt-margin-t-20 kt-margin-b-10">
                <div className="row align-items-center">
                  <div className="col-xl-8 order-2 order-xl-1">
                    <div className="row align-items-center">
                      <div className="col-md-4 kt-margin-b-20-tablet-and-mobile">
                        <div className="kt-input-icon kt-input-icon--left">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            onChange={this.onSearch}
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
            <div className="kt-portlet__body" style={{ minHeight: "500px" }}>
              <Table
                headers={[
                  {
                    label: "User",
                    key: "user"
                  },
                  {
                    label: "Message",
                    key: "message"
                  },
                  {
                    label: "Phone",
                    key: "phone"
                  },
                  {
                    label: "Email",
                    key: "email"
                  }
                ]}
                data={this.state.filteredInvitations}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}