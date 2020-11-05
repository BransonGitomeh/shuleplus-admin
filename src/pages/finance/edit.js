import React from "react";
import ErrorMessage from "./components/error-toast";
const IErrorMessage = new ErrorMessage();

const $ = window.$;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    edit: {
      names: "",
      route: "",
      gender: "",
      class:"",
      class_name:"",
      reg: "",
      parent: "",
      parents: [],
      routes: []
    }
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
  componentDidMount() {
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

          // replace the names with the selected values with ids
          await _this.props.save(_this.state.edit);
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
  static getDerivedStateFromProps(props, state) {
    if (props.edit)
      if (props.edit.id !== state.edit.id) {
        return {
          edit: props.edit
        };
      }
    return null;
  }
  render() {
    const {
      edit: { names, route = {}, parent = {}, gender } = {}
    } = this.state;
    return (
      <div>
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
                  <h5 className="modal-title">Edit Student</h5>
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
                          value={this.state.edit.names}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            names: e.target.value
                          }))}
                        />
                      </div>
                      <div className="col-lg-4">
                        <label>Registration Number:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="registration"
                          name="registration"
                          minLength="2"
                          required
                          value={this.state.edit.registration}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            registration: e.target.value
                          }))}
                        />
                      </div>
                      <div className="col-lg-4">
                        <label>Class:</label>
                        <select
                          type="text"
                          className="form-control"
                          id="class"
                          name="class"
                          required
                          value={this.state.edit.class_name}
                          onChange={(e) => this.setState({ edit : Object.assign(this.state.edit, {
                            class: this.props.classes.filter(Iclass => Iclass.name == e.target.value)[0],
                            class_name: e.target.value
                          }) })}
                        >
                          <option value="">Select class</option>
                          {this.props.classes.map(Iclass => (
                            <option value={Iclass.name}>{Iclass.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <label for="exampleSelect1">Route:</label>
                        <select
                          name="route"
                          class="form-control"
                          required
                          value={this.state.edit.route_name}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            route: this.props.routes.filter(route => route.name == e.target.value)[0],
                            route_name: e.target.value
                          }))}
                        >
                          <option value="">Select route</option>
                          {this.props.routes.map(route => (
                            <option value={route.name}>{route.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <label for="exampleSelect1">Gender:</label>
                        <select
                          name="gender"
                          class="form-control"
                          id="exampleSelect1"
                          required
                          value={this.state.edit.gender}
                          onChange={(e) => {
                            this.setState(Object.assign(this.state.edit, {
                              gender: e.target.value
                            }))
                          }}
                        >
                          <option value="">Select gender</option>
                          {["MALE", "FEMALE"].map(gender => {
                            return <option value={gender}>{gender}</option>
                          })}
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <label for="exampleSelect1">Parent:</label>
                        <select
                          name="parent"
                          class="form-control"
                          required
                          value={this.state.edit.parent_name}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            parent: this.props.parents.filter(parent => parent.name == e.target.value)[0],
                            parent_name: e.target.value
                          }))}
                        >
                          <option value="">Select parent</option>
                          {this.props.parents.map(parent => (
                            <option value={parent.name}>{parent.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <label for="exampleSelect1">Alternative Parent:</label>
                        <select
                          name="parent2"
                          class="form-control"
                          value={this.state.edit.parent2_name}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            parent2: this.props.parents.filter(parent => parent.name == e.target.value)[0],
                            parent2_name: e.target.value
                          }))}
                        >
                          <option value="">Select parent</option>
                          {this.props.parents.map(parent => (
                            <option value={parent.name}>{parent.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
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
