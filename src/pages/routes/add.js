import React from "react";
import ErrorMessage from "./components/error-toast";
import Data from "../../utils/data"

const IErrorMessage = new ErrorMessage();

const $ = window.$;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    name: "",
    description: "",
    students:[],
    studentList:[]
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

      highlight: function(element) {
        $(element).addClass("is-invalid");
      },
      unhighlight: function(element) {
        $(element).removeClass("is-invalid");
      },

      async submitHandler(form, event) {
        event.preventDefault();
        try {
          _this.setState({ loading: true });
          _this.state.loading = undefined;
          _this.state.studentList = undefined
          await _this.props.save(_this.state);
          _this.hide();
          _this.setState({ loading: false, name: "" });
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

    const studentList = Data.students.list()
    this.setState({ studentList })

    Data.students.subscribe(({ students: studentList }) => {
      this.setState({ studentList })
    })
  }

  onSelect = (student) => {
    this.setState((prevState, props) => {
      const { students } = prevState
      const filteredSelected = students.includes(student.id) ? students.filter(p => p !== student.id) : [...students, student.id]
      return { students: filteredSelected }
    })
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
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <form
                id={modalNumber + "form"}
                className="kt-form kt-form--label-right"
              >
                <div className="modal-header">
                  <h5 className="modal-title">Create route</h5>
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
                        <label>Name:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          required
                          value={this.state.name}
                          onChange={e =>
                            this.setState({
                              name: e.target.value
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-lg-6">
                        <label>Description:</label>
                        <textarea
                          type="text"
                          className="form-control"
                          id="fullname"
                          name="fullname"
                          minLength="2"
                          rows="6"
                          required
                          value={this.state.description}
                          onChange={e =>
                            this.setState({
                              description: e.target.value
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-4 col-lg-4 col-sm-12">
                      <ul className="list-group list-group-flush">
                        {this.state.studentList?.map(student => {
                            return <li
                            key={student.id}
                              className="list-group-item"
                              style={{ cursor: 'pointer' }}>
                                <label className="kt-checkbox">
                                  <input onChange={() => this.onSelect(student)} type="checkbox" checked={this.state.students.includes(student.id)} /> {student.names}<span></span>
                                </label>
                            </li>
                        })}
                      </ul>
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
