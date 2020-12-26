import React from "react";
import ErrorMessage from "../components/error-toast";

const IErrorMessage = new ErrorMessage();

const $ = window.$;

const types = ['SINGLECHOICE', 'MULTICHOICE'];

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    question: {
      name: "",
      subtopic: "",
      type: "",
    },
    grade: "",
    subject: "",
    subjects: [],
    topic: "",
    topics: [],
    subtopics: [],
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
  
  setTopics(id){
    const subject = this.state.subjects.filter(subject => {
      return subject.id == id;
    });
    if(subject.length){
      this.setState({topics: subject[0].topics});
    }
  }
  
  setSubtopics(id){
    const topic = this.state.topics.filter(topic => {
      return topic.id == id;
    });
    if(topic.length){
      this.setState({subtopics: topic[0].subtopics});
    }
  }

  componentDidMount() {
    if(this.props.grade){
      this.setState({grade: this.props.grade});
      this.setSubjects(this.props.grade);
    }
    if(this.props.subject){
      this.setState({subject: this.props.subject});
    }
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
          delete _this.state.question.id;
          await _this.props.save(_this.state.question);
          _this.hide();
          _this.setState({
            loading: false,
            grade: "",
            subject: "",
            subjects: [],
            topic: "",
            topics: [],
            subtopics: [],
          });
          _this.setState(Object.assign(_this.state.question, {
              name: ""
          }));
          _this.setState(Object.assign(_this.state.question, {
              subtopic: ""
          }));
          _this.setState(Object.assign(_this.state.question, {
              type: ""
          }));
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
                  <h5 className="modal-title">Create new question</h5>
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
                        <label>Question name:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          minLength="2"
                          value={this.state.question.name}
                          onChange={(e) => this.setState(Object.assign(this.state.question, {
                            name: e.target.value
                          }))}
                          required
                        />
                      </div>
                      <div className="col-lg-12 mt-4">
                        <label for="exampleSelect1">Type:</label>
                        <select
                          name="grades"
                          type="text"
                          class="form-control"
                          required
                          value={this.state.question.type}
                          onChange={(e) => this.setState(Object.assign(this.state.question, {
                            type: e.target.value
                          }))}
                        >
                          <option value="">Select type</option>
                          {types.map(
                            type => (
                              <option key={type} value={type}>{type}</option>
                            )
                          )}
                        </select>
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
                          }, this.setTopics(e.target.value))}
                        >
                          <option value="">Select subject</option>
                          {this.state.subjects.map(
                            subject => (
                              <option key={subject.id} value={subject.id}>{subject.name}</option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="col-lg-12 mt-4">
                        <label for="exampleSelect2">Topics:</label>
                        <select
                          name="subjects"
                          type="text"
                          class="form-control"
                          required
                          value={this.state.topic}
                          onChange={(e) => this.setState({
                            topic: e.target.value
                          },  this.setSubtopics(e.target.value))}
                        >
                          <option value="">Select topic</option>
                          {this.state.topics.map(
                            topic => (
                              <option key={topic.id} value={topic.id}>{topic.name}</option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="col-lg-12 mt-4">
                        <label for="exampleSelect2">Subtopics:</label>
                        <select
                          name="subjects"
                          type="text"
                          class="form-control"
                          required
                          value={this.state.question.subtopic}
                          onChange={(e) => this.setState(Object.assign(this.state.question, {
                            subtopic: e.target.value
                          }))}
                        >
                          <option value="">Select subtopic</option>
                          {this.state.subtopics.map(
                            subtopic => (
                              <option key={subtopic.id} value={subtopic.id}>{subtopic.name}</option>
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
