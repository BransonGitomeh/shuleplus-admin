import React from "react";

import Table from "./components/table";
import Map from "./components/map"
import TripDetails from "./components/trip-details";
import DeleteModal from "./delete";
import Data from "../../utils/data";
import Stat from "../home/components/stat";

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

import "./scrolling.css"

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
    subjects: null,
    subjectToEdit: {},
    subjectToDelete: {},
    selectedSubject: null,
    topics: null,
    topicToEdit: {},
    topicToDelete: {},
    selectedTopic: {},
    subtopics: null,
    subtopicToEdit: {},
    subtopicToDelete: {},
    selectedSubtopic: null,
    questions: null,
    questionToEdit: {},
    questionToDelete: {},
    selectedQuestion: null,
    options: null,
    optionToEdit: {},
    optionToDelete: {},
    trip: {},
    events: null,
    students: []
  };

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
            <EditGradeModal grade={gradeToEdit} edit={grade => Data.grades.update(grade)} />
            <DeleteGradeModal grade={gradeToDelete} delete={grade => Data.grades.delete(grade)} />

            <AddSubjectModal grade={this.state.selectedGrade} grades={this.state.grades} save={subject => Data.subjects.create(subject)} />
            <EditSubjectModal grade={this.state.selectedGrade} grades={this.state.grades} subject={subjectToEdit} edit={subject => Data.subjects.update(subject)} />
            <DeleteSubjectModal grades={this.state.grades} subject={subjectToDelete} delete={subject => Data.subjects.delete(subject)} />

            <AddTopicModal subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} save={topic => Data.topics.create(topic)} />

            <AddSubtopicModal topic={this.state.selectedTopic} subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} save={subtopic => Data.subtopics.create(subtopic)} />
            
            <AddQuestionModal subtopic={this.state.selectedSubtopic} topic={this.state.selectedTopic} subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} save={question => Data.questions.create(question)} />

            <AddOptionModal question={this.state.selectedQuestion} subtopic={this.state.selectedSubtopic} topic={this.state.selectedTopic} subject={this.state.selectedSubject} grade={this.state.selectedGrade} grades={this.state.grades} save={option => Data.options.create(option)} />

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
                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "name"
                      },
                    ]}
                    data={this.state.grades}
                    show={ grade => this.setState({ subjects: grade.subjects || [], selectedGrade: grade.id }) }
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

                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "name"
                      },
                    ]}
                    data={this.state.subjects}
                    show={ subject => this.setState({ topics: subject.topics || [], selectedSubject: subject.id }) }
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

                {!this.state.topics ? "" : <div className="col-md-4">

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

                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "name"
                      },
                    ]}
                    data={this.state.topics}
                    show={ topic => this.setState({ subtopics: topic.subtopics|| [], selectedTopic: topic.id }) }
                    edit={topic => {
                      this.setState({ topicToEdit: topic }, () => {
                        editSubjectModalInstance.show();
                      });
                    }}
                    delete={topic => {
                      this.setState({ topicToDelete: topic }, () => {
                        deleteSubjectModalInstance.show();
                      });
                    }}
                  />
                </div>}

                {!this.state.subtopics ? "" :<div className="col-md-4">
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
                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "name"
                      },
                    ]}
                    data={this.state.subtopics}
                    show={ subtopic => this.setState({ questions: subtopic.questions|| [], selectedSubtopic: subtopic.id }) }
                    edit={topic => {
                      this.setState({ subtopicToEdit: topic }, () => {
                        editSubjectModalInstance.show();
                      });
                    }}
                    delete={topic => {
                      this.setState({ subtopicToDelete: topic }, () => {
                        deleteSubjectModalInstance.show();
                      });
                    }}
                  />
                </div>}

                {!this.state.questions ? "" : <div className="col-md-4">

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
                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "name"
                      },
                    ]}
                    data={this.state.questions}
                    show={ question => this.setState({ options: question.options|| [], selectedQuestion: question.id }) }
                    edit={question => {
                      this.setState({ questionToEdit: question }, () => {
                        editSubjectModalInstance.show();
                      });
                    }}
                    delete={question => {
                      this.setState({ questionToDelete: question }, () => {
                        deleteSubjectModalInstance.show();
                      });
                    }}
                  />
                </div>}

                {!this.state.options ? "" :<div className="col-md-4">

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
                  <Table
                    headers={[
                      {
                        label: "Name",
                        key: "value"
                      },
                    ]}
                    options={{linkable: false, editable: true, deleteable: true}}
                    data={this.state.options}
                    edit={question => {
                      this.setState({ questionToEdit: question }, () => {
                        editSubjectModalInstance.show();
                      });
                    }}
                    delete={question => {
                      this.setState({ questionToDelete: question }, () => {
                        deleteSubjectModalInstance.show();
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



