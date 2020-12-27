import React from "react";
import ErrorMessage from "../components/error-toast";

const IErrorMessage = new ErrorMessage();

const $ = window.$;

let selectedGrade = null;
let selectedSubject = null;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    id: null,
    name: "",
    subject: "",
    grade: "",
    subjects: [],
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
  
  setSubjects(id){
    const grade = this.props.grades.filter(grade => {
      return grade.id == id;
    });
    if(grade.length){
      this.setState({subjects: grade[0].subjects});
    }
  }

  componentDidUpdate(){
    const _this = this;
    if(_this.props.grade != selectedGrade){
      selectedGrade = _this.props.grade;
      _this.setState({grade: _this.props.grade});
      let subjects = [];
      _this.props.grades.forEach(grade => {
        if(grade.id == selectedGrade){
           _this.setState({subjects: grade.subjects}); 
        }
      });
    }
    
    if(_this.props.subject != selectedSubject){
      selectedSubject = _this.props.subject;
      _this.setState({subject: _this.props.subject});
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.topic)
      if (props.topic.id !== state.id) {
        return {
          id: props.topic.id,
          name: props.topic.name,
          subject: props.topic.subject
        };
      }
    return null;
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
          _this.state.loading = undefined;
          const data = {};
          Object.assign(data, {
            id: _this.state.id,
            name: _this.state.name,
            subject: _this.state.subject,
          });
          await _this.props.edit(data);
          _this.hide();
          _this.setState({
            loading: false,
            grade: "",
          });
          selectedGrade = null;
          selectedSubject = null;
          _this.setState({name: ""});
          _this.setState({id: ""});
          // _this.setState({subject: ""});
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form
                id={modalNumber + "form"}
                className="kt-form kt-form--label-right"
              >
                <div className="modal-header">
                  <h5 className="modal-title">Edit topic</h5>
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
                        <label>Topic name:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          minLength="2"
                          value={this.state.name}
                          onChange={(e) => this.setState({
                            name: e.target.value
                          })}
                          required
                        />
                      </div>
                      <div className="col-lg-12 mt-4">
                        <label for="exampleSelect1">Grades:</label>
                        <select
                          name="grades"
                          type="text"
                          class="form-control"
                          required
                          value={this.state.grade}
                          onChange={(e) => this.setState({
                            grade: e.target.value
                          }, this.setSubjects(e.target.value))}
                        >
                          <option value="">Select grade</option>
                          {this.props.grades.map(
                            grade => (
                              <option key={grade.id} value={grade.id}>{grade.name}</option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="col-lg-12 mt-4">
                        <label for="exampleSelect2">Subjects:</label>
                        <select
                          name="subjects"
                          type="text"
                          class="form-control"
                          required
                          value={this.state.subject}
                          onChange={(e) => this.setState({
                            subject: e.target.value
                          })}
                        >
                          <option value="">Select subject</option>
                          {this.state.subjects.map(
                            subject => (
                              <option key={subject.id} value={subject.id}>{subject.name}</option>
                            )
                          )}
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
