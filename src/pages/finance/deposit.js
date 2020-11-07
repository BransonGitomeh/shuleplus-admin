import React from "react";
import ErrorMessage from "./components/error-toast";

import Data from "../../utils/data";


const IErrorMessage = new ErrorMessage();


const $ = window.$;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    edit: {
      phone: "",
    },
    error: false,
    message: false
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
    const school = Data.schools.getSelected();

    this.setState({ school });

    Data.schools.subscribe(({ schools }) => {
      const school = Data.schools.getSelected();

      console.log({ school })
      this.setState({ school });
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

          // replace the names with the selected values with ids
          // await _this.props.save(_this.state.edit);


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
      if (props.edit.phone !== state.edit.phone) {
        return {
          edit: props.edit
        };
      }
    return null;
  }
  charge(){
    return Data.schools.charge()
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
                  <h5 className="modal-title">Make Mpesa Payment</h5>
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
                  <div className="kt-portlet__body" style={{ "flex": 1, justifyContent: "center" }}>
                    <div className="form-group row">
                      <img style={{ "width": "20%" }} src={"/img/lipa-na-mpesa.svg"} alt="Logo" />
                    </div>
                    <div className="form-group row">
                      <div className="col-lg-4">
                        <label>Mpesa Number:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="registration"
                          name="registration"
                          minLength="2"
                          required
                          value={this.state.edit.phone}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            phone: e.target.value
                          }))}
                        />
                      </div>

                    </div>
                    <div className="form-group row">
                      <h3>Instructions to Pay</h3>
                      <ul>
                        <li><button
                          type="button"
                          className="btn btn-success"
                          type="button"
                          disabled={this.state.loading}
                          onClick={() => this.charge()}
                        >
                          {this.state.loading ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                              "Start Transaction"
                            )}
                        </button></li>
                        <li><h4>2. Check a payment popup on your phone</h4></li>
                        <li><h4>3. Input Mpesa Pin and click OK</h4></li>
                      </ul>
                    </div>
                    <div className="form-group row">
                      <div className={"alert alert-" + this.state.error ? "danger" : "success"} role="alert">
                        {this.state.error ? this.state.error : this.state.message}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">

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
      </div >
    );
  }
}

export default Modal;
