import React from "react";

import Table from "./components/table";
import AddModal from "./add";
import UploadModal from "./upload";
import EditModal from "./edit";
import DeleteModal from "./delete";
import Data from "../../utils/data";

const $ = window.$;
const addModalInstance = new AddModal();
const uploadModalInstance = new UploadModal();
const editModalInstance = new EditModal();
const deleteModalInstance = new DeleteModal();


function truncate(str, n){
  return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
};

export default class BasicTable extends React.Component {
  state = {
    schedules: [],
    filteredSchedules: [],
    routes: [],
    buses: [],
    drivers: []
  };
  componentDidMount() {
    const charges = Data.charges.list();

    console.log("stored", { charges })
    this.setState({ charges });

    Data.charges.subscribe(({ charges }) => {
      this.setState({ charges });
    });
  }

  onSearch = e => {
    const { schedules } = this.state
    const filteredSchedules = schedules.filter(schedule => schedule.name.toLowerCase().match(e.target.value.toLowerCase()))
    this.setState({ filteredSchedules })
  }

  render() {
    const { edit, remove, routes, buses, drivers } = this.state;
    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            {/* <AddModal
              routes={routes}
              buses={buses}
              drivers={drivers}
              save={schedule => Data.schedules.create(schedule)}
            />
            <UploadModal save={schedules => schedules.forEach(schedule => Data.schedules.create(schedule))} />
            <DeleteModal
              remove={remove}
              save={schedule => Data.schedules.delete(schedule)}
            />
            <EditModal
              edit={edit}
              routes={routes}
              buses={buses}
              drivers={drivers}
              save={schedule => Data.schedules.update(schedule)}
            /> */}
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
                  {/* <div className="col-xl-4 order-2 order-xl-1">
                    <button
                      href="#"
                      className="btn btn-default btn-sm btn-bold btn-upper float-right"
                      onClick={() => uploadModalInstance.show()}
                    >
                      Upload
                    </button>
                    <button
                      href="#"
                      className="btn btn-default btn-sm btn-bold btn-upper float-right"
                      onClick={() => addModalInstance.show()}
                    >
                      Create
                    </button>
                  </div> */}
                </div>
              </div>
              {/*end: Search Form */}
            </div>
            <div className="kt-portlet__body" style={{ minHeight: "500px" }}>
              <Table
                headers={[
                  {
                    label: "Ref",
                    key: "id"
                  },
                  {
                    label: "Ammount",
                    key: "ammount"
                  },
                  {
                    label: "Reason",
                    key: "reason"
                  },
                  {
                    label: "Time",
                    key: "time"
                  }
                ]}
                data={this.state.charges}
                // delete={schedule => {
                //   this.setState({ remove: schedule }, () => {
                //     deleteModalInstance.show();
                //   });
                // }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}