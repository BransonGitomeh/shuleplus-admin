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
    selectedAdmin: {},
    admin: false,
    adminToInvite: "",
    adminToTransfer: {},
    admins: [],
    schools: [],
    filteredAdmins:[]
  };
  componentDidMount() {
    let user = localStorage.getItem('user');
    user = JSON.parse(user);
    if(user?.admin?.user === 'Super Admin'){
      this.setState({ admin: true });
    }

    const admins = Data.admins.list();
    this.setState({ admins, filteredAdmins: admins });

    console.log({admins})

    const schools = Data.schools.list();
    this.setState({ schools });

    Data.admins.subscribe(({ admins }) => {
      this.setState({ admins, filteredAdmins: admins });
    });
  }

  onSearch = e => {
    const { admins } = this.state
    const filteredAdmins = admins.filter(admin => admin.username.toLowerCase().match(e.target.value.toLowerCase()))
    this.setState({ filteredAdmins })
  }

  sendInvite = async() => {
    try {
      const data = {};
      Object.assign(data, {
        school,
        user: this.state.adminToInvite,
      });

      await Data.admins.invite(data);
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
    const { edit, remove, selectedAdmin, schools, adminToTransfer, admin } = this.state;
    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            <AddModal save={admins => Data.admins.create(admins)} />
            <UploadModal admin={this.admin} save={admins => admins.forEach(admin => Data.admins.create(admin))} />
            <DeleteModal
              remove={remove}
              save={admin => Data.admins.delete(admin)}
            />
            <InviteModal admin={selectedAdmin} invite={() => this.sendInvite()}/>
            <EditModal
              edit={edit}
              save={admin => Data.admins.update(admin)}
            />
            <TransferModal schools={schools} admin={adminToTransfer} transfer={admin => Data.admins.transfer(admin)} />
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
                    label: "Admins Names",
                    key: "names"
                  },
                  {
                    label: "Email",
                    key: "email"
                  },
                  {
                    label: "Phone",
                    key: "phone"
                  }
                ]}
                options={{ deleteable: true, editable: true, adminable: admin === true }}
                data={this.state.filteredAdmins}
                edit={admin => {
                  this.setState({ edit: admin }, () => {
                    editModalInstance.show();
                  });
                }}
                delete={admin => {
                  this.setState({ remove: admin }, () => {
                    deleteModalInstance.show();
                  });
                }}
                invite={admin => {
                  this.setState({ adminToInvite: admin.id, selectedAdmin: admin }, () => {
                    inviteModalInstance.show();
                  })
                }}
                transfer={admin => {
                  this.setState({ adminToTransfer: admin }, () => {
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
