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
      make: "",
      size: "",
      plate: "",
      driver:""
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
      edit: { names, route = {}, bus = {}, gender } = {}
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
                  <h5 className="modal-title">Edit bus</h5>
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
                  <div className="form-group row">
                    <div className="col-lg-6">
                      <label>Bus Make:</label>
                      <input
                        type="text"
                        className="form-control"
                        id="busmake"
                        name="busmake"
                        minLength="2"
                        required
                        value={this.state.edit.make}
                        onChange={(e) => this.setState(Object.assign(this.state.edit, {
                          make: e.target.value
                        }))}
                      />
                    </div>
                    <div className="col-lg-3">
                      <label>Plate Number:</label>
                      <input
                        type="text"
                        className="form-control"
                        id="plate"
                        name="plate"
                        required
                        value={this.state.edit.plate}
                        onChange={(e) => this.setState(Object.assign(this.state.edit, {
                          plate: e.target.value
                        }))}
                      />
                    </div>
                    <div className="col-lg-3">
                      <label for="exampleSelect1">Capacity:</label>
                      <select
                        name="seats"
                        class="form-control"
                        required
                        value={this.state.edit.size}
                        onChange={(e) => this.setState(Object.assign(this.state.edit, {
                          size: Number(e.target.value)
                        }))}
                      >
                        <option value="">Number of Seats</option>
                        {["14", "28", "42", "65"].map(
                          seats => (
                            <option key={seats} value={seats}>{seats}</option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="col-lg-3">
                        <label for="exampleSelect1">Drivers:</label>
                        <select
                          name="seats"
                          type="text"
                          class="form-control"
                          required
                          value={this.state.driver}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            driver: e.target.value
                          }))}
                        >
                          <option value="">Select driver</option>
                          {this.props.drivers.map(
                            driver => (
                              <option key={driver.id} value={driver.id}>{driver.username}</option>
                            )
                          )}
                        </select>
                      </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="submit"
                    className="btn btn-outline-brand"
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
