import React from "react";

import Table from "./components/table";
import Search from './components/search';
import Map from "./components/map"
import TripDetails from "./components/trip-details";
import DeleteModal from "./delete";
import Data from "../../utils/data";
import Stat from "../home/components/stat";

import SuccessMessage from "./components/success-toast";

import AddGradeModal from "./grades/add";
import EditGradeModal from "./grades/edit";
import DeleteGradeModal from "./grades/delete";

import AddSubjectModal from "./subjects/add";
import EditSubjectModal from "./subjects/edit";
import DeleteSubjectModal from "./subjects/delete";

import AddTopicModal from "./topics/add";
import EditTopicModal from "./topics/edit";
import DeleteTopicModal from "./topics/delete";

import AddSubtopicModal from "./subtopics/add";
import EditSubtopicModal from "./subtopics/edit";
import DeleteSubtopicModal from "./subtopics/delete";

import AddQuestionModal from "./questions/add";
import EditQuestionModal from "./questions/edit";
import DeleteQuestionModal from "./questions/delete";

import AddOptionModal from "./options/add";
import EditOptionModal from "./options/edit";
import DeleteOptionModal from "./options/delete";

import "./scrolling.css";

const ISuccessMessage = new SuccessMessage();

//const $ = window.$;
const deleteModalInstance = new DeleteModal();

// Grade CRUD
const addGradeModalInstance = new AddGradeModal();
const editGradeModalInstance = new EditGradeModal();
const deleteGradeModalInstance = new DeleteGradeModal();

// Subject CRUD
const addSubjectModalInstance = new AddSubjectModal();
const editSubjectModalInstance = new EditSubjectModal();
const deleteSubjectModalInstance = new DeleteSubjectModal();

// Topic CRUD
const addTopicModalInstance = new AddTopicModal();
const editTopicModalInstance = new EditTopicModal();
const deleteTopicModalInstance = new DeleteTopicModal();

// Subtopic CRUD
const addSubtopicModalInstance = new AddSubtopicModal();
const editSubtopicModalInstance = new EditSubtopicModal();
const deleteSubtopicModalInstance = new DeleteSubtopicModal();

// Question CRUD
const addQuestionModalInstance = new AddQuestionModal();
const editQuestionModalInstance = new EditQuestionModal();
const deleteQuestionModalInstance = new DeleteQuestionModal();

// Option CRUD
const addOptionModalInstance = new AddOptionModal();
const editOptionModalInstance = new EditOptionModal();
const deleteOptionModalInstance = new DeleteOptionModal();

class BasicTable extends React.Component {
  state = {
    grades: [],
    gradeToDelete: {},
    gradeToEdit: {},
    selectedGrade: null,

    subjects: [],
    filteredSubjects: [],
    subjectToEdit: {},
    subjectToDelete: {},
    selectedSubject: null,
    
    topics: [],
    filteredTopics: [],
    topicToEdit: {},
    topicToDelete: {},
    selectedTopic: {},
    
    subtopics: [],
    filteredSubtopics: [],
    subtopicToEdit: {},
    subtopicToDelete: {},
    selectedSubtopic: null,
    
    questions: [],
    filteredQuestions: [],
    questionToEdit: {},
    questionToDelete: {},
    selectedQuestion: null,
    
    options: [],
    filteredOptions: [],
    optionToEdit: {},
    optionToDelete: {},
    
    trip: {},
    events: null,
    students: []
  };

  // Subject alerts
  onSubjectCreated = subject => {
    ISuccessMessage.show({ message: 'Subject has been CREATED successfuly!', heading: 'Create subject' });
    subject.topics = [];
    const subjects = [...this.state.subjects, subject];
    
    this.setState({subjects});
    
    const grade = this.state.grades.filter(grade => {
      return grade.id == subject.grade;
    });
    if(grade.length){
      grade[0].subjects.push(subject);
    }
  }

  onSubjectUpdated = subject => {
    ISuccessMessage.show({ message: 'Subject has been UPDATED successfuly!', heading: 'Edit subject' });
    const subjects = this.state.subjects.map(sub => {
      if (sub.id == subject.id) {
        subject.topics = sub.topics;
        return subject;
      }
      return sub;
    });
    this.setState({subjects});
    
    const grade = this.state.grades.filter(grade => {
      return grade.id == subject.grade;
    });
    
    if(grade.length){
      grade[0].subjects = grade[0].subjects.map(sub => {
        if (sub.id == subject.id) {
          subject.topics = sub.topics;
          return subject;
        }
        return sub;
      });
    }
  }

  onSubjectDeleted = subject => {
    console.log(subject);
    ISuccessMessage.show({ message: 'Subject has been DELETED successfuly!', heading: 'Delete subject' });
    const subjects = this.state.subjects.filter(sub => {
      return sub.id != subject.id;
    });
    this.setState({subjects});
    
    const grade = this.state.grades.filter(grade => {
      return grade.id == this.state.selectedGrade;
    });
    
    if(grade.length){
      grade[0].subjects = grade[0].subjects.filter(sub => {
        return sub.id != subject.id;
      });
    }
  }

  onGradeSearch = e => {
    const grades = Data.grades.list();
    const a = e.target.value;
    if (a == null || a == "" || a.length == 0 || a.trim().length == 0) {
      if(grades.length != this.state.grades.length){
        this.setState({ grades });
      }
      return;
    }

    const filteredGrades = grades.filter(grade => 
      grade.name.toLowerCase().match(e.target.value.toLowerCase())
    );
    this.setState({ grades: filteredGrades });
  }

  onSubjectSearch = e => {
    if(!this.state.selectedGrade){
      return;
    }

    const subjects = this.state.subjects;
    const a = e.target.value;
    if (a == null || a == "" || a.length == 0 || a.trim().length == 0) {
      this.setState({ filteredSubjects: subjects });
      return;
    }

    const filteredSubjects = subjects.filter(subject => 
      subject.name.toLowerCase().match(e.target.value.toLowerCase())
    );
    this.setState({ filteredSubjects });
  }

  onTopicSearch = e => {
    if(!this.state.selectedSubject){
      return;
    }

    const topics = this.state.topics;
    const a = e.target.value;
    if (a == null || a == "" || a.length == 0 || a.trim().length == 0) {
      this.setState({ filteredTopics: topics });
      return;
    }

    const filteredTopics = topics.filter(topic => 
      topic.name.toLowerCase().match(e.target.value.toLowerCase())
    );
    this.setState({ filteredTopics });
  }

  onSubtopicSearch = e => {
    if(!this.state.selectedTopic){
      return;
    }

    const subtopics = this.state.subtopics;
    const a = e.target.value;
    if (a == null || a == "" || a.length == 0 || a.trim().length == 0) {
      this.setState({ filteredSubtopics: subtopics });
      return;
    }

    const filteredSubtopics = subtopics.filter(subtopic => 
      subtopic.name.toLowerCase().match(e.target.value.toLowerCase())
    );
    this.setState({ filteredSubtopics });
  }

  onQuestionSearch = e => {
    if(!this.state.selectedSubtopic){
      return;
    }

    const questions = this.state.questions;
    const a = e.target.value;
    if (a == null || a == "" || a.length == 0 || a.trim().length == 0) {
      this.setState({ filteredQuestions: questions });
      return;
    }

    const filteredQuestions = questions.filter(question => 
      question.name.toLowerCase().match(e.target.value.toLowerCase())
    );
    this.setState({ filteredQuestions });
  }

  onOptionSearch = e => {
    if(!this.state.selectedQuestion){
      return;
    }

    const options = this.state.options;
    const a = e.target.value;
    if (a == null || a == "" || a.length == 0 || a.trim().length == 0) {
      this.setState({ filteredOptions: options });
      return;
    }

    const filteredOptions = options.filter(option => 
      option.value.toLowerCase().match(e.target.value.toLowerCase())
    );
    this.setState({ filteredOptions });
  }

  onPageChanged = data => {
    const { grades } = this.state;
    const { currentPage, totalPages, pageLimit } = data;
    const offset = (currentPage - 1) * pageLimit;
    const currentGrades = grades.slice(offset, offset + pageLimit);

    this.setState({ grades: currentGrades });
  }

  componentDidMount() {
    const grades = Data.grades.list();
    this.setState({ grades });

    Data.grades.subscribe(({ grades }) => {
      console.log({ grades })
      this.setState({ grades });
    });

  }

  render() {
    const { gradeToDelete, gradeToEdit, subjectToEdit, subjectToDelete, trip, remove } = this.state;
    const events = trip.events ? trip.events.map(ev => ({ ...ev, name: ev.student ? ev.student.name : '' })) : []
    const students = trip.schedule && trip.schedule.route && trip.schedule.route.students

    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            
            <AddGradeModal save={grade => Data.grades.create(grade)} />
            <EditGradeModal grade={this.state.gradeToEdit} edit={grade => Data.grades.update(grade)} />
            <DeleteGradeModal grade={this.state.gradeToDelete} delete={grade => Data.grades.delete(grade)} />

            <AddSubjectModal onCreate={this.onSubjectCreated} grade={this.state.selectedGrade} grades={this.state.grades} save={subject => Data.subjects.create(subject)} />
            <EditSubjectModal onUpdate={this.onSubjectUpdated} grade={this.state.selectedGrade} grades={this.state.grades} subject={this.state.subjectToEdit} edit={subject => Data.subjects.update(subject)} />
            <DeleteSubjectModal onDelete={this.onSubjectDeleted} grades={this.state.grades} subject={this.state.subjectToDelete} delete={subject => Data.subjects.delete(subject)} />

            <AddTopicModal subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} save={topic => Data.topics.create(topic)} />
            <EditTopicModal topic={this.state.topicToEdit} subjects={this.state.subjects} subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} edit={topic => Data.topics.update(topic)} />
            <DeleteTopicModal topic={this.state.topicToDelete} delete={topic => Data.topics.delete(topic)} />

            <AddSubtopicModal topic={this.state.selectedTopic} subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} save={subtopic => Data.subtopics.create(subtopic)} />
            <EditSubtopicModal subtopic={this.state.subtopicToEdit} topic={this.state.selectedTopic} subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} edit={subtopic => Data.subtopics.update(subtopic)} />
            <DeleteSubtopicModal subtopic={this.state.subtopicToDelete} delete={option => Data.subtopics.delete(option)} />

            <AddQuestionModal subtopic={this.state.selectedSubtopic} topic={this.state.selectedTopic} subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} save={question => Data.questions.create(question)} />
            <EditQuestionModal question={this.state.questionToEdit} subtopic={this.state.selectedSubtopic} topic={this.state.selectedTopic} subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} edit={question => Data.questions.update(question)} />
            <DeleteQuestionModal question={this.state.questionToDelete} delete={question => Data.questions.delete(question)} />

            <AddOptionModal question={this.state.selectedQuestion} subtopic={this.state.selectedSubtopic} topic={this.state.selectedTopic} subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} save={option => Data.options.create(option)} />
            <EditOptionModal option={this.state.optionToEdit} question={this.state.selectedQuestion} subtopic={this.state.selectedSubtopic} topic={this.state.selectedTopic} subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} edit={option => Data.options.update(option)} />
            <DeleteOptionModal option={this.state.optionToDelete} delete={option => Data.options.delete(option)} />

            <div class="kt-portlet__head">
              <div class="kt-portlet__head-label">
                <h3 class="kt-portlet__head-title">Student Learning</h3>
              </div>
            </div>
            <div className="kt-portlet__body">
              <div style={{ minHeight: "500px" }} className="row scrolling-wrapper flex-row flex-nowrap mt-4 pb-4">
                <div className="col-md-4">
                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Grades</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right" onClick={() => addGradeModalInstance.show()}>
                        <i class="la la-plus-circle"></i> Add
                      </button>
                    </div>

                  </div>
                  <br></br>
                  <Search title="grades" onSearch={this.onGradeSearch}/>
                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "name"
                      },
                    ]}
                    data={this.state.grades}
                    show={ grade => this.setState({ subjects: grade.subjects, filteredSubjects: grade.subjects,  selectedGrade: grade.id, topics: [], subtopics: [], questions: [], options: [] }) }
                    edit={grade => {
                      this.setState({ gradeToEdit: grade }, () => {
                        editGradeModalInstance.show();
                      });
                    }}
                    delete={grade => {
                      this.setState({ gradeToDelete: grade }, () => {
                        deleteGradeModalInstance.show();
                      });
                    }}
                  />
                </div>

                {!this.state.subjects ? "" : <div className="col-md-4">
                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Subjects</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right" onClick={() => addSubjectModalInstance.show()}>
                        <i class="la la-plus-circle"></i> Add
                      </button>
                    </div>
                  </div>
                  <br></br>
                  {this.state.subjects.length ? <Search title="subjects" onSearch={this.onSubjectSearch}/>: ""}
                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "name"
                      },
                    ]}
                    data={this.state.filteredSubjects}
                    show={ subject => this.setState({ filteredTopics: subject.topics, topics: subject.topics, selectedSubject: subject.id, subtopics: [], questions: [], options: [] }) }
                    edit={subject => {
                      this.setState({ subjectToEdit: subject }, () => {
                        editSubjectModalInstance.show();
                      });
                    }}
                    delete={subject => {
                      this.setState({ subjectToDelete: subject }, () => {
                        deleteSubjectModalInstance.show();
                      });
                    }}
                  />
                </div>}

                {!this.state.filteredTopics ? "" : <div className="col-md-4">

                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Topics</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right" onClick={() => addTopicModalInstance.show()}>
                        <i class="la la-plus-circle"></i> Add
                      </button>
                    </div>
                  </div>
                  <br></br>
                  {this.state.topics.length ? <Search title="topics" onSearch={this.onTopicSearch}/>: ""}
                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "name"
                      },
                    ]}
                    data={this.state.filteredTopics}
                    show={ topic => this.setState({ filteredSubtopics: topic.subtopics, subtopics: topic.subtopics, selectedTopic: topic.id, questions: [], options: [] }) }
                    edit={topic => {
                      this.setState({ topicToEdit: topic }, () => {
                        editTopicModalInstance.show();
                      });
                    }}
                    delete={topic => {
                      this.setState({ topicToDelete: topic }, () => {
                        deleteTopicModalInstance.show();
                      });
                    }}
                  />
                </div>}

                {!this.state.filteredSubtopics ? "" :<div className="col-md-4">
                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Subtopics</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right" onClick={() => addSubtopicModalInstance.show()}>
                        <i class="la la-plus-circle"></i> Add
                      </button>
                    </div>
                  </div>
                  <br></br>
                  {this.state.subtopics.length ? <Search title="subtopics" onSearch={this.onSubtopicSearch}/>: ""}
                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "name"
                      },
                    ]}
                    data={this.state.filteredSubtopics}
                    show={ subtopic => this.setState({ filteredQuestions: subtopic.questions, questions: subtopic.questions, selectedSubtopic: subtopic.id, options: [] }) }
                    edit={subtopic => {
                      this.setState({ subtopicToEdit: subtopic }, () => {
                        editSubtopicModalInstance.show();
                      });
                    }}
                    delete={subtopic => {
                      this.setState({ subtopicToDelete: subtopic }, () => {
                        deleteSubtopicModalInstance.show();
                      });
                    }}
                  />
                </div>}

                {!this.state.filteredQuestions ? "" : <div className="col-md-4">

                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Question</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right" onClick={() => addQuestionModalInstance.show()}>
                        <i class="la la-plus-circle"></i> Add
                      </button>
                    </div>
                  </div>
                  <br></br>
                  {this.state.questions.length ? <Search title="questions" onSearch={this.onQuestionSearch}/>: ""}
                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "name"
                      },
                    ]}
                    data={this.state.filteredQuestions}
                    show={ question => this.setState({ filteredOptions: question.options, options: question.options, selectedQuestion: question.id  }) }
                    edit={question => {
                      this.setState({ questionToEdit: question }, () => {
                        editQuestionModalInstance.show();
                      });
                    }}
                    delete={question => {
                      this.setState({ questionToDelete: question }, () => {
                        deleteQuestionModalInstance.show();
                      });
                    }}
                  />
                </div>}

                {!this.state.filteredOptions ? "" :<div className="col-md-4">

                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Posible Answers</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right" onClick={() => addOptionModalInstance.show()}>
                        <i class="la la-plus-circle"></i> Add
                      </button>
                    </div>
                  </div>
                  <br></br>
                  {this.state.options.length ? <Search title="options" onSearch={this.onOptionSearch}/>: ""}
                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "value"
                      },
                    ]}
                    options={{linkable: false, editable: true, deleteable: true}}
                    data={this.state.filteredOptions}
                    edit={option => {
                      this.setState({ optionToEdit: option }, () => {
                        editOptionModalInstance.show();
                      });
                    }}
                    delete={option => {
                      this.setState({ optionToDelete: option }, () => {
                        deleteOptionModalInstance.show();
                      });
                    }}
                  />
                </div>}

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicTable;



