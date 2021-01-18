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
    route: "",
    driver: "",
    days: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY"
    ],
    selectedDays: [
      "MONDAY"
    ]
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

          _this.state.time = $('#timepicker_start').data("timepicker").getTime()
          _this.state.end_time = $('#timepicker_end').data("timepicker").getTime()

          await _this.props.save(Object.assign({}, _this.state, {
            selectedDays: undefined,
            days: _this.state.selectedDays
          }));
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

    $('#timepicker_start').timepicker();
    $('#timepicker_end').timepicker();
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
                  <h5 className="modal-title">Schedule a trip</h5>
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
                        <label>Trip name:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          minLength="2"
                          required
                          value={this.state.name}
                          onChange={(e) => this.setState({
                            name: e.target.value
                          })}
                        />
                      </div>
                      <div className="col-lg-3">
                        <label>Start Time</label>
                        <input
                          type="text"
                          className="form-control"
                          id="timepicker_start"
                          name="start"
                          required
                          // value={this.state.time}
                          onChange={(e) => this.setState({
                            time: e.target.value
                          })}
                        />
                      </div>
                      <div className="col-lg-3">
                        <label>End Time</label>
                        <input
                          type="text"
                          className="form-control"
                          id="timepicker_end"
                          name="end"
                          required
                          // value={this.state.end_time}
                          onChange={(e) => this.setState({
                            end_time: e.target.value
                          })}
                        />
                      </div>
                      <div className="col-lg-3">
                        <label for="exampleSelect1">Route:</label>
                        <select
                          name="seats"
                          class="form-control"
                          required
                          value={this.state.route}
                          onChange={(e) => this.setState({
                            route: e.target.value
                          })}
                        >
                          <option value="">Select Route</option>
                          {this.props.routes.map(
                            route => (
                              <option key={route.id} value={route.id}>{route.name}</option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="col-lg-3">
                        <label for="exampleSelect1">Bus:</label>
                        <select
                          name="bus"
                          class="form-control"
                          required
                          value={this.state.bus}
                          onChange={(e) => this.setState({
                            bus: e.target.value
                          })}
                        >
                          <option value="">Select Bus</option>
                          {this.props.buses.map(
                            bus => (
                              <option key={bus.id} value={bus.id}>{bus.plate}</option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <br />
                        <label for="exampleSelect1">Select Days the route is taken</label>
                        <div className="kt-checkbox-list">
                          {this.state.days.map(day => {
                            return (<label className="kt-checkbox">
                              <input
                                type="checkbox"
                                checked={this.state.selectedDays.includes(day)}
                                onChange={() => {
                                  if (this.state.selectedDays.includes(day)) {
                                    return this.setState({
                                      selectedDays: this.state.selectedDays.filter(eday => eday !== day)
                                    })
                                  }
                                  this.setState({
                                    selectedDays: [...this.state.selectedDays, day]
                                  })
                                }} /> {day}
                              <span />
                            </label>)
                          })}
                        </div>
                      </div>
                      <div className="col-lg-3">
                        <label for="exampleSelect1">Driver:</label>
                        <select
                          name="seats"
                          type="text"
                          class="form-control"
                          value={this.state.driver}
                          onChange={(e) => this.setState({
                            driver: e.target.value
                          })}
                        >
                          <option value="">Select driver</option>
                          {this.props.drivers.map(
                            driver => (
                              <option key={driver.id} value={driver.id}>{driver.username}</option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="col-lg-12">
                        <label>Schedule message:</label>
                        <textarea
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          minLength="2"
                          required
                          value={this.state.message}
                          onChange={(e) => this.setState({
                            message: e.target.value
                          })}
                        />
                      </div>
                      <div className="col-lg-12">
                        <code>{`You can use the following placeholders {{student_name}} {{parent_name}} {{school_name}} {{time}}`}</code>
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
