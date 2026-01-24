import React from "react";
import ErrorMessage from "./components/error-toast";
import AddTeacherModal from "../teachers/add"
import Select from 'react-select';
import Data from "../../utils/data";

const IErrorMessage = new ErrorMessage();

const addTeacherModal = new AddTeacherModal()
const $ = window.$;
const school = localStorage.getItem("school");

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    name: "",
    teacher: "",
    feeAmount: 0,
    grade: "",
    grades: []
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
    this.unsub = Data.grades.subscribe(({ grades }) => this.setState({ grades }));
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

          _this.state.loading = undefined;
          _this.state.setTeacher = undefined;
          await _this.props.save(_this.state);
          _this.hide();
          _this.setState({
            loading: false,
            name: "",
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
        <AddTeacherModal school={school} save={teacher => Data.teachers.create(teacher)} />
        <div
          className="modal"
          id={modalNumber}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="myLargeModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <form
                id={modalNumber + "form"}
                className="kt-form kt-form--label-right"
              >
                <div className="modal-header">
                  <h5 className="modal-title">Create Class</h5>
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
                        <label>Class Name:</label>
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
                      <div className="col-lg-6">
                        <label>Fee Amount:</label>
                        <input
                          type="number"
                          className="form-control"
                          name="feeAmount"
                          value={this.state.feeAmount}
                          onChange={(e) => this.setState({
                            feeAmount: e.target.value
                          })}
                          required
                        />
                      </div>
                      <div className="col-lg-6 mt-3">

                        <div className="row">
                          <div className="col-lg-8">
                            <label htmlFor="exampleSelect1">Teacher:</label>
                            <Select
                              name="driver"
                              value={this.state.setTeacher}
                              options={this.props.teachers?.map(({ id: value, name: label }) => ({ value, label }))}
                              onChange={({ value, label }) => this.setState({
                                teacher: value,
                                setTeacher: { value, label }
                              })}
                            />
                          </div>
                          <div className="col-lg-4">
                            <label htmlFor="exampleSelect1">↓</label>
                            <br></br>
                            <button
                              className="btn btn-outline-brand"
                              type="button"
                              onClick={() => {
                                console.log("adding")
                                this.hide()
                                addTeacherModal.show()
                              }}
                            >
                              Add a Teacher
                            </button>
                          </div>
                        </div>


                      </div>
                      <div className="col-lg-6 mt-3">
                        <label>Grade Association:</label>
                        <select
                          name="grade"
                          className="form-control"
                          value={this.state.grade}
                          onChange={(e) => this.setState({
                            grade: e.target.value
                          })}
                          required
                        >
                          <option value="">Select Grade (Linking to Curriculum)</option>
                          {this.state.grades.map(grade => (
                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                          ))}
                        </select>
                        <p className="text-muted small mt-1">This links the class to a specific level in the learning module to show the correct subjects/results.</p>
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
