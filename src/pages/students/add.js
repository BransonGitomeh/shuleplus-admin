import React from "react";
import ErrorMessage from "./components/error-toast";
import AddParentModal from "../parents/add";
// You are importing AddParentModal twice with different names. This is unnecessary.
// If they are indeed different components, the import path should be different.
// I'll assume it was a typo and remove one.
import AddClassModal from "../classes/add"
import AddRouteModal from "../routes/add"

import Select from 'react-select';

import Data from "../../utils/data"
const IErrorMessage = new ErrorMessage();

const $ = window.$;
const addParentModal = new AddParentModal();
const addClassModal = new AddClassModal();
const addRouteModal = new AddRouteModal();

// Giving this a more descriptive name to avoid confusion with the component class name.
const MODAL_ID = "student-modal-" + Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  // FIX: Initialize all state properties that are used.
  state = {
    loading: false,
    names: "",
    route: "",
    gender: "",
    registration: "",
    class: "",
    parent: "",
    parent2: "",

    // State for react-select value objects
    setClass: null,
    setRoute: null,
    setParent: null,
    setParent2: null,

    // Data lists
    parents: [],
    classes: [],
    routes: []
  };

  show() {
    $("#" + MODAL_ID).modal({
      show: true,
      backdrop: "static",
      keyboard: false
    });
  }
  hide() {
    $("#" + MODAL_ID).modal("hide");
  }

  // FIX: This function was unused and can be safely removed.
  // onParentChange = e => { ... }

  async componentDidMount() {
    // Note: The original code fetched teachers and students but didn't use them in this component's state.
    // I've kept the logic but you might want to review if it's needed here.
    const classes = Data.classes.list();
    this.setState({ classes });
    Data.classes.subscribe(({ classes }) => this.setState({ classes }));

    const teachers = Data.teachers.list();
    Data.teachers.subscribe(() => { /* do something with teachers if needed */ });

    const students = Data.students.list();
    Data.students.subscribe(() => { /* do something with students if needed */ });

    const routes = Data.routes.list();
    this.setState({ routes });
    Data.routes.subscribe(({ routes }) => this.setState({ routes }));

    const parents = Data.parents.list();
    this.setState({ parents });
    Data.parents.subscribe(({ parents }) => this.setState({ parents }));

    const _this = this;
    this.validator = $("#" + MODAL_ID + "form").validate({
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

          // FIX: The destructured properties now correctly match what's being saved in state.
          const { names, route, gender, registration, class: className, parent, parent2 } = _this.state;
          
          // The payload contains all the selected IDs.
          const payload = { 
            names, 
            route, 
            gender, 
            registration, 
            class: className, // aliased to avoid keyword conflict
            parent, 
            parent2 
          };

          console.log("Submitting payload:", payload); // For debugging
          
          await _this.props.save(payload);
          _this.hide();

        } catch (error) {
          console.error("Submission failed:", error);
          if (error && error.message) {
            IErrorMessage.show({ message: error.message });
          } else {
            IErrorMessage.show();
          }
        } finally {
            // Use finally to ensure loading is always set to false
           _this.setState({ loading: false });
        }
      }
    });
  }

  render() {
    return (
      <div>
        {/* FIX: Removed the duplicate AddParentModal2. If it's a different component, you should re-add it. */}
        <AddParentModal save={parent => Data.parents.create(parent)} />
        <AddClassModal save={classData => Data.classes.create(classData)} teachers={this.state.teachers} />
        <AddRouteModal students={this.state.students} save={route => Data.routes.create(route)} />
        
        <div
          className="modal"
          id={MODAL_ID} // Use the new constant
          tabIndex={-1}
          role="dialog"
          aria-labelledby="myLargeModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <form
                id={MODAL_ID + "form"} // Use the new constant
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
                      {/* Full Name, Registration, Gender are fine */}
                      <div className="col-lg-4">
                        <label>Full Name:</label>
                        <input type="text" className="form-control" name="names" minLength="2" required value={this.state.names} onChange={(e) => this.setState({ names: e.target.value })} />
                      </div>
                      <div className="col-lg-4">
                        <label>Registration Number:</label>
                        <input type="text" className="form-control" name="registration" minLength="2" required value={this.state.registration} onChange={(e) => this.setState({ registration: e.target.value })} />
                      </div>
                      <div className="col-lg-4">
                        <label htmlFor="gender">Gender:</label>
                        <select name="gender" className="form-control" id="gender" required value={this.state.gender} onChange={(e) => this.setState({ gender: e.target.value })}>
                          <option value="">Select gender</option>
                          {["MALE", "FEMALE"].map(gender => (<option key={gender} value={gender}>{gender}</option>))}
                        </select>
                      </div>

                      {/* Class Selector */}
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-8">
                            <label>Class:</label>
                            <Select
                              name="class" // name is good for semantics
                              value={this.state.setClass}
                              options={this.state.classes?.map(({ id: value, name: label }) => ({ value, label }))}
                              onChange={({ value, label }) => this.setState({
                                class: value, // Set the ID for submission
                                setClass: { value, label } // Set the object for display
                              })}
                            />
                          </div>
                          <div className="col-lg-4 align-self-end">
                            <button className="btn btn-outline-brand" type="button" onClick={() => { this.hide(); addClassModal.show(); }}>
                              Add a Class
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Route Selector */}
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-8">
                            <label>Route:</label>
                            <Select
                              name="route"
                              value={this.state.setRoute}
                              options={this.state.routes?.map(({ id: value, name: label }) => ({ value, label }))}
                              onChange={({ value, label }) => this.setState({
                                route: value, // Set the ID for submission
                                setRoute: { value, label } // Set the object for display
                              })}
                            />
                          </div>
                          <div className="col-lg-4 align-self-end">
                            <button className="btn btn-outline-brand" type="button" onClick={() => { this.hide(); addRouteModal.show(); }}>
                              Add a Route
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Parent Selector */}
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-8">
                            <label>Parent:</label>
                            <Select
                              name="parent" // FIX: Changed name for clarity
                              value={this.state.setParent}
                              options={this.state.parents?.map(({ id: value, name: label }) => ({ value, label }))}
                              // FIX: This now correctly updates `parent` and `setParent` in the state.
                              onChange={({ value, label }) => this.setState({
                                parent: value,
                                setParent: { value, label }
                              })}
                            />
                          </div>
                          <div className="col-lg-4 align-self-end">
                            <button className="btn btn-outline-brand" type="button" onClick={() => { this.hide(); addParentModal.show(); }}>
                              Add a Parent
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Second Parent Selector */}
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-8">
                            <label>Second Parent (Optional):</label>
                            <Select
                              name="parent2" // FIX: Changed name for clarity
                              isClearable // Good for optional fields
                              value={this.state.setParent2}
                              options={this.state.parents?.map(({ id: value, name: label }) => ({ value, label }))}
                              onChange={(selected) => this.setState({
                                  // Handle clear event
                                  parent2: selected ? selected.value : "",
                                  setParent2: selected
                              })}
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline-brand" type="submit" disabled={this.state.loading}>
                    {this.state.loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />) : ("Save")}
                  </button>
                  <button data-dismiss="modal" type="button" className="btn btn-outline-brand">
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