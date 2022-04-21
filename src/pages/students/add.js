import React from "react";
import ErrorMessage from "./components/error-toast";
import AddParentModal from "../parents/add";
import AddParentModal2 from "../parents/add";
import AddClassModal from "../classes/add"
import AddRouteModal from "../routes/add"

import Select from 'react-select';

import Data from "../../utils/data"
const IErrorMessage = new ErrorMessage();

const $ = window.$;
const addParentModal = new AddParentModal();
const addParentModal2 = new AddParentModal2();
const addClassModal = new AddClassModal();
const addRouteModal = new AddRouteModal();

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    names: "",
    route: "",
    gender: "",
    registration: "",
    class: "",
    parent: "",
    parent2: "",
    parents: [],
    classes: [],
    selectedParents: [],
    filteredParents: [],
    routes: []
  };

  show() {
    $("#" + modalNumber).modal({
      show: true,
      backdrop: "static",
      keyboard: false
    });
  }
  hide() {
    $("#" + modalNumber).modal("hide");
  }

  onParentChange = e => {
    this.setState({
      selectedParents: Object.assign(this.state.selectedParents, [e.target.value]),
      [e.target.name]: e.target.value
    })
  }

  async componentDidMount() {
    const classes = Data.classes.list();
    this.setState({ classes, filteredClasses: classes });

    Data.classes.subscribe(({ classes }) => {
      this.setState({ classes, filteredClasses: classes });
    });

    const teachers = Data.teachers.list();
    this.setState({ teachers });

    Data.teachers.subscribe(({ teachers }) => {
      this.setState({ teachers });
    });

    const students = Data.students.list();
    this.setState({ students });

    Data.students.subscribe(({ students }) => {
      this.setState({ students });
    });

    const routes = Data.routes.list();
    this.setState({ routes });

    Data.routes.subscribe(({ routes }) => {
      this.setState({ routes });
    });

    const parents = Data.parents.list();
    this.setState({ parents, filteredParents: parents });

    Data.parents.subscribe(({ parents }) => {
      console.log({ parents })
      this.setState({ parents, filteredParents: parents });
    });

    const _this = this;
    this.validator = $("#" + modalNumber + "form").validate({
      errorClass: "invalid-feedback",
      errorElement: "div",

      highlight: function (element) {
        $(element).addClass("is-invalid");
      },
      unhighlight: function (element) {
        $(element).removeClass("is-invalid");
      },

      async submitHandler(form, event) {
        event.preventDefault();
        try {
          _this.setState({ loading: true });

          // cleanup
          // _this.state.loading = undefined;

          // reassign
          // _this.state.parents = undefined;
          // _this.state.routes = undefined;
          // _this.state.filteredParents = undefined
          // _this.state.selectedParents = undefined

          const { names, route, gender, registration, class: className, parent, parent2 } = _this.state

          await _this.props.save({ names, route, gender, registration, class: className, parent, parent2 });
          _this.hide();
          _this.setState({ loading: false });
        } catch (error) {
          _this.setState({ loading: false });
          if (error) {
            const { message } = error;
            return IErrorMessage.show({ message });
          }
          IErrorMessage.show();
        }
      }
    });
  }
  render() {
    return (
      <div>
        <AddParentModal save={parent => Data.parents.create(parent)} />
        <AddParentModal2 save={parent => Data.parents.create(parent)} />
        <AddClassModal save={classData => Data.classes.create(classData)} teachers={this.state.teachers} />
        <AddRouteModal students={this.state.students}  save={route => Data.routes.create(route)}/>
        <div
          className="modal"
          id={modalNumber}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="myLargeModalLabel"
          aria-hidden="true"
        >

          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <form
                id={modalNumber + "form"}
                className="kt-form kt-form--label-right"
              >
                <div className="modal-header">
                  <h5 className="modal-title">Create Student</h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="kt-portlet__body">

                    <div className="form-group row">
                      <div className="col-lg-4">
                        <label>Full Name:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          required
                          value={this.state.names}
                          onChange={(e) => this.setState({
                            names: e.target.value
                          })}
                        />
                      </div>
                      <div className="col-lg-4">
                        <label>Registration Number:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="reg-no"
                          name="registration"
                          minLength="2"
                          required
                          value={this.state.registration}
                          onChange={(e) => this.setState({
                            registration: e.target.value
                          })}
                        />
                      </div>
                      <div className="col-lg-4">
                        <label for="gender">Gender:</label>
                        <select
                          name="gender"
                          class="form-control"
                          id="gender"
                          required
                          value={this.state.gender}
                          onChange={(e) => this.setState({
                            gender: e.target.value
                          })}
                        >
                          <option value="">Select gender</option>
                          {["MALE", "FEMALE"].map(gender => {
                            return <option value={gender}>{gender}</option>
                          })}
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-8">
                            <label for="exampleSelect1">Class:</label>
                            <Select
                              name="classes"
                              value={this.state.setClass}
                              options={this.state.classes?.map(({ id: value, name: label }) => ({ value, label }))}
                              onChange={({ value, label }) => this.setState({
                                class: value,
                                setClass: { value, label }
                              })}
                            />
                          </div>
                          <div className="col-lg-4">
                            <label for="exampleSelect1">↓</label>
                            <br></br>
                            <button
                              className="btn btn-outline-brand"
                              type="button"
                              onClick={() => {
                                console.log("adding")
                                this.hide()
                                addClassModal.show()
                              }}
                            >
                              Add a Class
                            </button>
                          </div>
                        </div>

                        {/*                         
                        <label for="exampleSelect1">Class:</label>
                        <select
                          name="class"
                          class="form-control"
                          required
                          value={this.state.class}
                          onChange={(e) => this.setState({
                            class: e.target.value
                          })}
                        >
                          <option value="">Select class</option>
                          {this.state.classes.map(Iclass => (
                            <option value={Iclass.id}>{Iclass.name}</option>
                          ))}
                        </select> */}
                      </div>
                      <div className="col-lg-6">
                      <div className="row">
                          <div className="col-lg-8">
                            <label for="exampleSelect1">Route:</label>
                            <Select
                              name="classes"
                              value={this.state.setRoute}
                              options={this.state.routes?.map(({ id: value, name: label }) => ({ value, label }))}
                              onChange={({ value, label }) => this.setState({
                                route: value,
                                setRoute: { value, label }
                              })}
                            />
                          </div>
                          <div className="col-lg-4">
                            <label for="exampleSelect1">↓</label>
                            <br></br>
                            <button
                              className="btn btn-outline-brand"
                              type="button"
                              onClick={() => {
                                console.log("adding")
                                this.hide()
                                addRouteModal.show()
                              }}
                            >
                              Add a Route
                            </button>
                          </div>
                        </div>
                        {/* <label for="exampleSelect1">Route:</label>
                        <select
                          name="route"
                          class="form-control"
                          required
                          value={this.state.route}
                          onChange={(e) => this.setState({
                            route: e.target.value
                          })}
                        >
                          <option value="">Select route</option>
                          {this.props.routes.map(route => (
                            <option value={route.id}>{route.name}</option>
                          ))}
                        </select> */}
                      </div>
                      
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-8">
                            <label for="exampleSelect1">Parent:</label>
                            <Select
                              name="driver"
                              value={this.state.setParent}
                              options={this.state.parents?.map(({ id: value, name: label }) => ({ value, label }))}
                              onChange={({ value, label }) => this.setState({
                                driver: value,
                                setParent: { value, label }
                              })}
                            />
                          </div>
                          <div className="col-lg-4">
                            <label for="exampleSelect1">↓</label>
                            <br></br>
                            <button
                              className="btn btn-outline-brand"
                              type="button"
                              onClick={() => {
                                console.log("adding")
                                this.hide()
                                addParentModal.show()
                              }}
                            >
                              Add a Parent
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-8">
                            <label for="exampleSelect1">Second Parent:</label>
                            <Select
                              name="driver"
                              value={this.state.setParent2}
                              options={this.state.parents?.map(({ id: value, name: label }) => ({ value, label }))}
                              onChange={({ value, label }) => this.setState({
                                parent2: value,
                                setParent2: { value, label }
                              })}
                            />
                          </div>
                          
                        </div>

                      </div>


                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-outline-brand"
                    type="submit"
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    data-dismiss="modal"
                    type="button"
                    className="btn btn-outline-brand"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
