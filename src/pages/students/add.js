import React from "react";
import ErrorMessage from "./components/error-toast";
import AddParentModal from "./add_parent";
const IErrorMessage = new ErrorMessage();

const $ = window.$;
const addParentModalInstance = new AddParentModal();

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
    parent: "",
    parent2: "",
    parents: [],
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

          // cleanup
          _this.state.loading = undefined;

          // reassign
          _this.state.parents = undefined;
          _this.state.routes = undefined;

          await _this.props.save(_this.state);
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
                      <div className="col-lg-3">
                        
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-lg-3">
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
                      <div className="col-lg-3">
                        <label>Registration Number:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          required
                          value={this.state.registration}
                          onChange={(e) => this.setState({
                            registration: e.target.value
                          })}
                        />
                      </div>
                      <div className="col-lg-3">
                        <label for="exampleSelect1">Route:</label>
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
                        </select>
                      </div>
                      <div className="col-lg-3">
                        <label for="exampleSelect1">Gender:</label>
                        <select
                          name="gender"
                          class="form-control"
                          id="exampleSelect1"
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
                      <div className="col-lg-4">
                        <label for="exampleSelect1">Parent:</label>
                        <select
                          name="parent"
                          class="form-control"
                          required
                          value={this.state.parent}
                          onChange={(e) => this.setState({
                            parent: e.target.value
                          })}
                        >
                          <option value="">Select parent</option>
                          {this.props.parents.map(parent => (
                            <option value={parent.id}>{parent.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-lg-4">
                        <label for="exampleSelect1">Alternative Parent:</label>
                        <select
                          name="parent2"
                          class="form-control"
                          value={this.state.parent2}
                          onChange={(e) => this.setState({
                            parent2: e.target.value
                          })}
                        >
                          <option value="">Select parent</option>
                          {this.props.parents.map(parent => (
                            <option value={parent.id}>{parent.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-lg-4">
                        <button type="button" className="btn btn-outline-brand mt-4" onClick={addParentModalInstance.show}>Add Parent</button>
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
