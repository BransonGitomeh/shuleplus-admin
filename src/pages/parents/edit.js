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
      route: {
        name: ""
      },
      gender: "",
      parent: {
        name: ""
      }
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
          const data = {}
          Object.assign(data, _this.state.edit, {
            students: undefined
          })
          await _this.props.save(data);
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
                  <h5 className="modal-title">Edit Parent</h5>
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
                      <div className="col-lg-6">
                        <label>Full Name:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          value={this.state.edit.name}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            name: e.target.value
                          }))}
                          required
                        />
                      </div>
                      <div className="col-lg-3">
                        <label>Phone Number:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="phone"
                          name="phone"
                          minLength="10"
                          value={this.state.edit.phone}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            phone: e.target.value
                          }))}
                          required
                        />
                      </div>
                      <div className="col-lg-3">
                        <label>Email:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="eail"
                          name="email"
                          minLength="2"
                          value={this.state.edit.email}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            email: e.target.value
                          }))}
                          required
                        />
                      </div>
                      <div className="col-lg-3">
                        <label for="exampleSelect1">Gender:</label>
                        <select
                          name="route"
                          class="form-control"
                          required
                          value={this.state.gender}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            gender: e.target.value
                          }))}
                        >
                          <option value="">Select gender</option>
                          {["MALE", "FEMALE"].map(gender => (
                            <option value={gender}>{gender}</option>
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
