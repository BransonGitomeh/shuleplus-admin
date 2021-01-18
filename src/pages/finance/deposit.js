import React from "react";
import ErrorMessage from "./components/error-toast";
import "./spinner.css"

import Data from "../../utils/data";
import { withRouter } from "react-router";


const IErrorMessage = new ErrorMessage();


const $ = window.$;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    started: false,
    loading: false,
    verifying: false,
    verified: false,
    edit: {
      phone: "",
      ammount: "",
    },
    success: false,
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
  async verifyTx(CheckoutRequestID, MerchantRequestID) {
    this.setState({ verifying: true, loading: true });

    const {
      payments,
      errors
    } = await Data.schools.verifyTx({ CheckoutRequestID, MerchantRequestID })

    if (errors) {
      this.setState({ verifying: false, loading: false });
      return;
    }

    const { confirm: { success, message } = {} } = payments

    if (!message) {
      return this.verifyTx(CheckoutRequestID, MerchantRequestID)
    }

    if (success == true) {
      this.props.history.push({
        pathname:"/finance/topup"
      })
      window.location.reload()
      return this.setState({ verifying: false, loading: false, success: true, message });
    }
    this.setState({ verifying: false, loading: false, error: true, success: false, message });
  }
  async charge(ammount) {
    this.setState({ started: true, loading: true });
    const { payments, errors } = await Data.schools.charge(this.state.edit.phone, ammount.toString())

    if (errors) {
      return
    }
    const { init: { CheckoutRequestID, MerchantRequestID } = {} } = {} = payments

    if (CheckoutRequestID && MerchantRequestID) {
      this.setState({ CheckoutRequestID, MerchantRequestID, loading: false });

      this.verifyTx(CheckoutRequestID, MerchantRequestID)
    }
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
                        {/* <label>Mpesa Number:</label> */}
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
                      <div className="col-lg-2">
                        {/* <label>Mpesa Number:</label> */}
                        <input
                          type="text"
                          className="form-control"
                          id="ammount"
                          name="ammount"
                          minLength="1"
                          required
                          value={this.state.edit.ammount}
                          onChange={(e) => this.setState(Object.assign(this.state.edit, {
                            ammount: e.target.value
                          }))}
                        />
                      </div>

                      <div className="col-lg-4">
                        <button
                          type="button"
                          className="btn btn-success"
                          type="button"
                          disabled={this.state.loading}
                          onClick={() => this.charge(this.state.edit.ammount)}
                        >
                          {this.state.loading ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                              "Start Payment"
                            )}
                        </button>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-lg-6">

                        {
                          this.state.started ? "" :
                            <div class="alert alert-info" role="alert">
                              Waiting to start transaction...
                            </div>
                        }


                        {
                          this.state.verifying
                            ? <div class="alert alert-info" role="alert">
                              Checking transaction status ...
                              </div>
                            : ""
                        }

                        {
                          this.state.success
                            ? <div class="alert alert-success" role="alert">
                              {this.state.message}
                            </div>
                            : ""
                        }

                        {
                          this.state.loading ?
                            <div class="alert alert-info" role="alert">
                              Please check your phone...
                          </div>
                            : ""}

                        {
                          !this.state.success && this.state.message
                            ? <div class="alert alert-danger" role="alert">
                              {this.state.message}
                            </div>
                            : ""}

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

export default withRouter(Modal);
