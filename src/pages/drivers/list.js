import React from "react";

import Table from "./components/table";
import AddModal from "./add";
import UploadModal from "./upload";
import EditModal from "./edit";
import DeleteModal from "./delete";
import TransferModal from "./transfer";
import InviteModal from "./invite";
import Data from "../../utils/data";
import SuccessMessage from "./components/success-toast";

const $ = window.$;
const addModalInstance = new AddModal();
const uploadModalInstance = new UploadModal();
const editModalInstance = new EditModal();
const deleteModalInstance = new DeleteModal();
const ISuccessMessage = new SuccessMessage();
const transferModalInstance = new TransferModal();
const inviteModalInstance = new InviteModal();

const school = localStorage.getItem("school");

class BasicTable extends React.Component {
  state = {
    selectedDriver: {},
    admin: false,
    driverToInvite: "",
    driverToTransfer: {},
    drivers: [],
    schools: [],
    filteredDrivers:[]
  };
  componentDidMount() {
    let user = localStorage.getItem('user');
    user = JSON.parse(user);
    if(user?.admin?.user === 'Super Admin'){
      this.setState({ admin: true });
    }

    const drivers = Data.drivers.list();
    this.setState({ drivers, filteredDrivers: drivers });

    const schools = Data.schools.list();
    this.setState({ schools });

    Data.drivers.subscribe(({ drivers }) => {
      this.setState({ drivers, filteredDrivers: drivers });
    });
  }

  onSearch = e => {
    const { drivers } = this.state
    const filteredDrivers = drivers.filter(driver => driver.names.toLowerCase().match(e.target.value.toLowerCase()))
    this.setState({ filteredDrivers })
  }

  sendInvite = async() => {
    try {
      const data = {};
      Object.assign(data, {
        school,
        user: this.state.driverToInvite,
      });

      await Data.drivers.invite(data);
      ISuccessMessage.show();   
    } catch (error) {
    }
  }

  getAllSchools = async() => {
    try {
      const schools = await Data.schools.list();
      this.setState({schools});   
    } catch (error) {
    }
  }

  render() {
    const { edit, remove, selectedDriver, schools, driverToTransfer, admin } = this.state;
    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            <AddModal save={drivers => Data.drivers.create(drivers)} />
            <UploadModal driver={this.driver} save={drivers => drivers.forEach(driver => Data.drivers.create(driver))} />
            <DeleteModal
              remove={remove}
              save={driver => Data.drivers.delete(driver)}
            />
            <InviteModal driver={selectedDriver} invite={() => this.sendInvite()}/>
            <EditModal
              edit={edit}
              save={driver => Data.drivers.update(driver)}
            />
            <TransferModal schools={schools} driver={driverToTransfer} transfer={driver => Data.drivers.transfer(driver)} />
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
                  <div className="col-xl-4 order-2 order-xl-1">
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
                  </div>
                </div>
              </div>
              {/*end: Search Form */}
            </div>
            <div className="kt-portlet__body" style={{ minHeight: "500px" }}>
              <Table
                headers={[
                  {
                    label: "Drivers Names",
                    key: "names"
                  },
                  {
                    label: "Phone",
                    key: "phone"
                  },
                  {
                    label: "Licence No.",
                    key: "licence_number"
                  },
                  {
                    label: "Licence Expiry",
                    key: "license_expiry"
                  },
                  {
                    label: "Home Area",
                    key: "home"
                  }
                ]}
                options={{ deleteable: true, editable: true, adminable: admin === true }}
                data={this.state.filteredDrivers}
                edit={driver => {
                  this.setState({ edit: driver }, () => {
                    editModalInstance.show();
                  });
                }}
                delete={driver => {
                  this.setState({ remove: driver }, () => {
                    deleteModalInstance.show();
                  });
                }}
                invite={driver => {
                  this.setState({ driverToInvite: driver.id, selectedDriver: driver }, () => {
                    inviteModalInstance.show();
                  })
                }}
                transfer={driver => {
                  this.setState({ driverToTransfer: driver }, () => {
                    transferModalInstance.show();
                  })
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicTable;
