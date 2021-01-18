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
    topic: {
      name: "",
      subject: "",
    },
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
      _this.setState(Object.assign(_this.state.topic, {
          subject: _this.props.subject
      }));
    }
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
          delete _this.state.topic.id;
          await _this.props.save(_this.state.topic);
          _this.hide();
          _this.setState({
            loading: false,
            grade: "",
          });
          selectedGrade = null;
          selectedSubject = null;
          _this.setState(Object.assign(_this.state.topic, {
              name: ""
          }));
          // _this.setState(Object.assign(_this.state.topic, {
          //     subject: ""
          // }));
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
                  <h5 className="modal-title">Create new topic</h5>
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
                          value={this.state.topic.name}
                          onChange={(e) => this.setState(Object.assign(this.state.topic, {
                            name: e.target.value
                          }))}
                          required
                        />
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
