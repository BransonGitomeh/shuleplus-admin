import React from "react";
import ErrorMessage from "./components/error-toast";

import AddDriverModal from "../drivers/add";

import Select from 'react-select';
import Data from "../../utils/data";

const IErrorMessage = new ErrorMessage();


const addDriverModal = new AddDriverModal();

const $ = window.$;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

var options = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' }
];

function logChange(val) {
  console.log("Selected: " + val);
}

class Modal extends React.Component {
  state = {
    loading: false,
    make: "",
    size: 14,
    plate: ""
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
          _this.state.setDriver = undefined
          await _this.props.save(_this.state);
          _this.hide();
          _this.setState({
            loading: false,
            make: "",
            size: "",
            plate: ""
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
        <AddDriverModal save={drivers => Data.drivers.create(drivers)} />
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
                  <h5 className="modal-title">Create bus</h5>
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
                        <label>Bus Make:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="busmake"
                          name="busmake"
                          minLength="2"
                          required
                          value={this.state.make}
                          onChange={(e) => this.setState({
                            make: e.target.value
                          })}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label>Plate Number:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="plate"
                          name="plate"
                          required
                          value={this.state.plate}
                          onChange={(e) => this.setState({
                            plate: e.target.value
                          })}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label>Capacity:</label>
                        <input
                          type="number"
                          className="form-control"
                          id="plate"
                          name="plate"
                          min="14"
                          required
                          value={this.state.size}
                          onChange={(e) => this.setState({
                            size: Number(e.target.value)
                          })}
                        />
                      </div>
                      <div className="col-lg-6">
                        


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
