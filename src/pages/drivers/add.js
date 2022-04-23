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
    names: "",
    // password: "",
    phone: "",
    email: "",
    license_expiry: "",
    licence_number: "",
    home: ""
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
          _this.state.loading = undefined
          await _this.props.save(_this.state);
          _this.hide();
          _this.setState({
            loading: false,
            username: "",
            phone: "",
            email: ""
          });
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
                  <h5 className="modal-title">Create Driver</h5>
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
                        <label>Names:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          value={this.state.names}
                          onChange={(e) => this.setState({
                            names: e.target.value
                          })}
                          required
                        />
                      </div>
                      <div className="col-lg-4">
                        <label>Email:</label>
                        <input
                          type="email"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          value={this.state.email}
                          onChange={(e) => this.setState({
                            email: e.target.value
                          })}
                          required
                        />
                      </div>
                      <div className="col-lg-4">
                        <label>Phone Number:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="phone"
                          name="phone"
                          minLength="10"
                          value={this.state.phone}
                          onChange={(e) => this.setState({
                            phone: e.target.value
                          })}
                          required
                        />
                      </div>
                      <div className="col-lg-4">
                        <label>Licence Number:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          value={this.state.licence_number}
                          onChange={(e) => this.setState({
                            licence_number: e.target.value
                          })}
                          required
                        />
                      </div>
                      <div className="col-lg-4">
                        <label>Licence Expiry Date:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          value={this.state.license_expiry}
                          onChange={(e) => this.setState({
                            license_expiry: e.target.value
                          })}
                          required
                        />
                      </div>
                      <div className="col-lg-4">
                        <label>Home Area:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          value={this.state.home}
                          onChange={(e) => this.setState({
                            home: e.target.value
                          })}
                          required
                        />
                      </div>
                      {/* <div className="col-lg-4">
                        <label>Password:</label>
                        <input
                          type="password"
                          className="form-control"
                          id="phone"
                          name="password"
                          minLength="5"
                          value={this.state.password}
                          onChange={(e) => this.setState({
                            password: e.target.value
                          })}
                          required
                        />
                      </div> */}
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
