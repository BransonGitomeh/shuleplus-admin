import React from "react";

import Table from "./components/table";
import AddModal from "./add";
import UploadModal from "./upload";
import EditModal from "./edit";
import DeleteModal from "./delete";
import Data from "../../utils/data";
import SuccessMessage from "./components/success-toast";

const $ = window.$;
const addModalInstance = new AddModal();
const uploadModalInstance = new UploadModal();
const editModalInstance = new EditModal();
const deleteModalInstance = new DeleteModal();
const ISuccessMessage = new SuccessMessage();

const school = localStorage.getItem("school");

class BasicTable extends React.Component {
  state = {
    parentToInvite: '',
    parents: [],
    filteredParents:[]
  };
  componentDidMount() {
    const parents = Data.parents.list();
    this.setState({ parents, filteredParents: parents });

    Data.parents.subscribe(({ parents }) => {
      this.setState({ parents, filteredParents: parents });
    });
  }

  onSearch = e => {
    const { parents } = this.state
    const filteredParents = parents.filter(parent => parent.name.toLowerCase().match(e.target.value.toLowerCase()))
    this.setState({ filteredParents })
  }

  sendInvite = async() => {
    try {
      const data = {};
      Object.assign(data, {
        school,
        user: this.state.parentToInvite,
      });

      await Data.parents.invite(data);
      ISuccessMessage.show();   
    } catch (error) {
    }
  }

  render() {
    const { edit, remove } = this.state;
    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            <AddModal save={parents => Data.parents.create(parents)} />
            <UploadModal save={parents => parents.forEach(parent => Data.parents.create(parent))} />
            <DeleteModal
              remove={remove}
              save={parent => Data.parents.delete(parent)}
            />
            <EditModal
              edit={edit}
              save={parent => Data.parents.update(parent)}
            />
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
                    label: "Parent Names",
                    key: "name"
                  },
                  {
                    label: "ID Number",
                    key: "national_id"
                  },
                  {
                    label: "Gender",
                    key: "gender"
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
                data={this.state.filteredParents}
                edit={parent => {
                  this.setState({ edit: parent }, () => {
                    editModalInstance.show();
                  });
                }}
                delete={parent => {
                  this.setState({ remove: parent }, () => {
                    deleteModalInstance.show();
                  });
                }}
                invite={parent => {
                  this.setState({ parentToInvite: parent.id }, () => {
                    this.sendInvite();
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
