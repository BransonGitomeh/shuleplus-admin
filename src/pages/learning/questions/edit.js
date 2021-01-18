import React from "react";
import ErrorMessage from "../components/error-toast";

const IErrorMessage = new ErrorMessage();

const $ = window.$;

const types = ['SINGLECHOICE', 'MULTICHOICE'];
let selectedGrade = null;
let selectedSubject = null;
let selectedTopic = null;
let selectedSubtopic = null;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    id: "",
    name: "",
    subtopic: "",
    type: "",
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
      this.setState({
        subject: "",
        subjects: grade[0].subjects,
        topic: "",
        topics: [],
        subtopic: "",
        subtopics: [],
      });
    }
  }
  
  setTopics(id){
    const subject = this.state.subjects.filter(subject => {
      return subject.id == id;
    });
    if(subject.length){
      this.setState({
        topic: "",
        topics: subject[0].topics,
        subtopics: [],
      });
      this.setState({subtopic: ""});
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

  componentDidUpdate(){
    const _this = this;
    if(_this.props.grade != selectedGrade){
      selectedGrade = _this.props.grade;
      _this.setState({grade: _this.props.grade});
      let subjects = [];
      _this.props.grades.forEach(grade => {
        if(grade.id == selectedGrade){
          subjects = grade.subjects;
        }
      });

      subjects = [...subjects];
      _this.setState({subjects});
    }

    if(_this.props.subject != selectedSubject){
      selectedSubject = _this.props.subject;
      this.setState({subject: _this.props.subject});
      let topics = [];
      _this.state.subjects.forEach(subject => {
        if(subject.id == selectedSubject){
          _this.setState({topics: subject.topics}); 
        }
      });
    }

    if(_this.props.topic != selectedTopic){
      selectedTopic = _this.props.topic;
      this.setState({topic: _this.props.topic});
      let subtopics = [];
      _this.state.topics.forEach(topic => {
        if(topic.id == selectedTopic){
          _this.setState({subtopics: topic.subtopics});
        }
      });
    }

    if(_this.props.subtopic != selectedSubtopic){
      selectedSubtopic = _this.props.subtopic;
      _this.setState({subtopic: _this.props.subtopic});
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
          const data = {};
          Object.assign(data, {
            id: _this.state.id,
            name: _this.state.name,
            subtopic: _this.state.subtopic,
            type: _this.state.type,
          });
          await _this.props.edit(data);
          _this.hide();
          _this.setState({
            loading: false,
            grade: "",
            subject: "",
            topic: "",
          });
          selectedGrade = null;
          selectedSubject = null;
          selectedTopic = null;
          selectedSubtopic = null;
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
    if (props.question)
      if (props.question.id !== state.id) {
        return {
          id: props.question.id,
          name: props.question.name,
          type: props.question.type
        };
      }
    return null;
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
                  <h5 className="modal-title">Edit question</h5>
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
                          value={this.state.name}
                          onChange={(e) => this.setState({
                            name: e.target.value
                          })}
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
