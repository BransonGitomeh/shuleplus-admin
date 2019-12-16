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

class BasicTable extends React.Component {
  state = {
    students: [],
    routes: [],
    parents: []
  };
  componentDidMount() {
    const students = Data.students.list();
    const routes = Data.routes.list();
    const parents = Data.parents.list();
    this.setState({ students, filteredStudents: students, routes, parents });

    Data.students.subscribe(({ students }) => {
      this.setState({ students, filteredStudents: students });
    });
    Data.routes.subscribe(({ routes }) => {
      this.setState({ routes });
    });
    Data.parents.subscribe(({ parents }) => {
      this.setState({ parents });
    });
  }

  onSearch = e => {
    const { students } = this.state
    const filteredStudents = students.filter(student => student.names.toLowerCase().match(e.target.value.toLowerCase()))
    this.setState({ filteredStudents })
  }

  onClickHandler(student) {
    window.location = `#/student/${student.id}`
  }

  render() {
    const { edit, remove } = this.state;
    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            <AddModal routes={this.state.routes} save={async student =>{ 
              await Data.students.create(student)
              const students = Data.students.list();

              this.setState({ students })
            }} />
            <UploadModal save={student => Data.students.create(student)} />
            <DeleteModal
              remove={remove}
              save={student => Data.students.delete(student)}
            />
            <EditModal
              routes={this.state.routes}
              parents={this.state.parents}
              edit={edit}
              save={student => Data.students.update(student)}
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
                    label: "Student Names",
                    key: "names"
                  },
                  {
                    label: "Registration",
                    key: "registration"
                  },
                  {
                    label: "Class",
                    key: "class_name"
                  },
                  {
                    label: "Route",
                    key: "route_name"
                  },
                  {
                    label: "Gender",
                    key: "gender"
                  },
                  {
                    label: "Parent",
                    key: "parent_name"
                  },
                  {
                    label: "Second Parent",
                    key: "parent2_name"
                  }
                ]}
                data={this.state.filteredStudents}
                edit={student => {
                  this.setState({ edit: student }, () => {
                    editModalInstance.show();
                  });
                }}
                delete={student => {
                  this.setState({ remove: student }, () => {
                    deleteModalInstance.show();
                  });
                }}
                onClick={this.onClickHandler}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicTable;
