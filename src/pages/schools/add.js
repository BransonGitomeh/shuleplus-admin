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
    error: "",
    name: "",
    phone: "",
    email: "",
    address: "",
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
          _this.setState({ loading: true, error: '' });
          _this.state.loading = undefined;
          const data = {};
          Object.assign(data, {
            name: _this.state.name,
            email: _this.state.email,
            phone: _this.state.phone,
            address: _this.state.address,
          });
          await _this.props.save(data);
          _this.hide();
          _this.setState({
            loading: false,
            username: "",
            phone: "",
            email: ""
          });
        } catch (error) {
          _this.setState({error: error.message})
          _this.setState({ loading: false });
          IErrorMessage.show({ message: error.message, header: "Create School Error" });
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form
                id={modalNumber + "form"}
                className="kt-form kt-form--label-right"
              >
                <div className="modal-header">
                  <h5 className="modal-title">Create School</h5>
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
                      <div className="col-lg-12">
                        <label>Names:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          value={this.state.name}
                          onChange={(e) => this.setState({
                            name: e.target.value
                          })}
                          required
                        />
                      </div>
                      <div className="col-lg-12">
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
                      <div className="col-lg-12">
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
                      <div className="col-lg-12">
                        <label>Address:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          value={this.state.address}
                          onChange={(e) => this.setState({
                            address: e.target.value
                          })}
                          required
                        />
                      </div>
                    </div>
                      {this.state.error ? <div class="alert alert-danger" role="alert">
                        {this.state.error}
                      </div> : ''}
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
