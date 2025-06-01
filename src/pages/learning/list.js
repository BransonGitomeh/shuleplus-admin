import React from "react";

import Table from "./components/table";
import Search from './components/search';
import Data from "../../utils/data";
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

import { ContentState } from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
const ISuccessMessage = new SuccessMessage();

const addGradeModalInstance = new AddGradeModal();
const editGradeModalInstance = new EditGradeModal();
const deleteGradeModalInstance = new DeleteGradeModal();
const addSubjectModalInstance = new AddSubjectModal();
const editSubjectModalInstance = new EditSubjectModal();
const deleteSubjectModalInstance = new DeleteSubjectModal();
const addTopicModalInstance = new AddTopicModal();
const editTopicModalInstance = new EditTopicModal();
const deleteTopicModalInstance = new DeleteTopicModal();
const addSubtopicModalInstance = new AddSubtopicModal();
const editSubtopicModalInstance = new EditSubtopicModal();
const deleteSubtopicModalInstance = new DeleteSubtopicModal();
const addQuestionModalInstance = new AddQuestionModal();
const editQuestionModalInstance = new EditQuestionModal();
const deleteQuestionModalInstance = new DeleteQuestionModal();
const addOptionModalInstance = new AddOptionModal();
const editOptionModalInstance = new EditOptionModal();
const deleteOptionModalInstance = new DeleteOptionModal();

class BasicTable extends React.Component {
  scrollContainerRef = React.createRef();
  _gradeSubscription = null; // Store the unsubscribe function

  state = {
    // grades will be the full tree, filtered for display by gradeSearchTerm
    grades: [], 
    // these _master lists are for reference if needed, but primary data comes from this.state.grades
    _masterGradesList: [], 

    gradeToDelete: {}, gradeToEdit: {}, selectedGrade: null, gradeSearchTerm: '',
    subjects: [], filteredSubjects: [], subjectToEdit: {}, subjectToDelete: {}, selectedSubject: null, subjectSearchTerm: '',
    topics: [], filteredTopics: [], topicToEdit: {}, topicToDelete: {}, selectedTopic: null, topicSearchTerm: '',
    subtopics: [], filteredSubtopics: [], subtopicToEdit: {}, subtopicToDelete: {}, selectedSubtopic: null, subtopicSearchTerm: '',
    questions: [], filteredQuestions: [], questionToEdit: {}, questionToDelete: {}, selectedQuestion: null, questionSearchTerm: '',
    options: [], filteredOptions: [], optionToEdit: {}, optionToDelete: {}, optionSearchTerm: '',
  };

  _applyFilter = (list, term, key = 'name') => {
    if (!list) return [];
    const searchTerm = term.toLowerCase().trim();
    if (!searchTerm) return list;
    return list.filter(item => item && item[key] && String(item[key]).toLowerCase().includes(searchTerm));
  };

  // No need for specific _sanitizeGradesData in BasicTable if Data.js handles it.

  // --- CRUD Handlers (Simplified) ---
  // These methods now just call the Data layer. The UI will update via subscription.
  // The `on<Entity>Created/Updated/Deleted` callbacks passed to modals will still be useful
  // for showing success messages.
  
  // Example for Subject, others follow:
  onSubjectCreated = (newSubject) => { 
    ISuccessMessage.show({ message: 'Subject has been CREATED successfully!', heading: 'Create subject' });
    // UI will update via Data.grades.subscribe
  }
  onSubjectUpdated = (updatedSubject) => { 
    ISuccessMessage.show({ message: 'Subject has been UPDATED successfully!', heading: 'Edit subject' });
  }
  onSubjectDeleted = (deletedSubject) => { 
    ISuccessMessage.show({ message: 'Subject has been DELETED successfully!', heading: 'Delete subject' });
  }
  // ... similar for Topic, Subtopic, Question, Option

  // --- Search Handlers ---
  onGradeSearch = e => {
    const term = e.target.value;
    // Filter from the master list obtained from Data.js, not this.state.grades directly
    // as this.state.grades is already the *display* (potentially filtered) list.
    this.setState({ 
        gradeSearchTerm: term,
        grades: this._applyFilter(this.state._masterGradesList, term, 'name') 
    }, this.refreshCurrentSelectionsAndFilters); // Refresh to ensure selections are valid with new filter
  }
  // Other search handlers remain the same, operating on their respective `this.state.<entity>s` lists
  onSubjectSearch = e => { /* ... */ this.setState({ subjectSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }
  onTopicSearch = e => { /* ... */ this.setState({ topicSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }
  onSubtopicSearch = e => { /* ... */ this.setState({ subtopicSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }
  onQuestionSearch = e => { /* ... */ this.setState({ questionSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }
  onOptionSearch = e => { /* ... */ this.setState({ optionSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }


  // --- Lifecycle Methods ---
  async componentDidMount() {
    // Get initial full list and store it as a master reference
    const masterGrades = Data.grades.list(); // Assumes Data.js already sanitized
    this.setState({ _masterGradesList: masterGrades, grades: masterGrades }, async () => {
        try {
            const stateString = await localStorage.getItem("learningState");
            if (stateString) {
                const savedState = JSON.parse(stateString);
                this.setState({
                    selectedGrade: savedState.selectedGrade || null,
                    selectedSubject: savedState.selectedSubject || null,
                    selectedTopic: savedState.selectedTopic || null,
                    selectedSubtopic: savedState.selectedSubtopic || null,
                    selectedQuestion: savedState.selectedQuestion || null,
                    gradeSearchTerm: savedState.gradeSearchTerm || '',
                    subjectSearchTerm: savedState.subjectSearchTerm || '',
                    topicSearchTerm: savedState.topicSearchTerm || '',
                    subtopicSearchTerm: savedState.subtopicSearchTerm || '',
                    questionSearchTerm: savedState.questionSearchTerm || '',
                    optionSearchTerm: savedState.optionSearchTerm || '',
                }, () => {
                    // Apply grade filter if a search term was restored
                    if (this.state.gradeSearchTerm) {
                        this.setState({ 
                            grades: this._applyFilter(this.state._masterGradesList, this.state.gradeSearchTerm, 'name') 
                        }, () => this.refreshCurrentSelectionsAndFilters(false)); 
                    } else {
                        this.refreshCurrentSelectionsAndFilters(false);
                    }
                });
            } else {
                this.refreshCurrentSelectionsAndFilters(false);
            }
        } catch (error) {
            console.error("Failed to load state from localStorage:", error);
            this.refreshCurrentSelectionsAndFilters(false);
        }
    });

    // Subscribe ONLY to Data.grades. This is now the single source of truth for the tree.
    this._gradeSubscription = Data.grades.subscribe(({ grades: updatedMasterGradesTree }) => {
        console.log("BasicTable: Data.grades.subscribe fired. New master tree:", updatedMasterGradesTree);
        const newMasterList = updatedMasterGradesTree || [];
        this.setState({
            _masterGradesList: newMasterList, // Update master list
            grades: this._applyFilter(newMasterList, this.state.gradeSearchTerm, 'name') // Apply current filter
        }, this.refreshCurrentSelectionsAndFilters); // Refresh selections and dependent lists
    });
  }

  componentWillUnmount() {
    if (this._gradeSubscription) {
      this._gradeSubscription(); // Unsubscribe
      this._gradeSubscription = null;
    }
    // Save state to localStorage (same as before)
    const stateToSave = { /* ... */ };
    localStorage.setItem("learningState", JSON.stringify(stateToSave));
  }
  
  clearSelectionsAndDataFromLevel = (levelName, includeSelf = false) => {
    // ... (same as before)
    const newState = {};
    const levels = ['grade', 'subject', 'topic', 'subtopic', 'question', 'option'];
    const startIndex = levels.indexOf(levelName);

    if (startIndex === -1) return {};

    for (let i = startIndex; i < levels.length; i++) {
        const currentLevel = levels[i];
        if (i === startIndex && !includeSelf) continue;

        newState[`selected${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}`] = null;
        if (currentLevel !== 'option' && currentLevel !== 'grade') { 
            newState[`${currentLevel}s`] = [];
            newState[`filtered${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}s`] = [];
        } else if (currentLevel === 'option') {
            newState.options = [];
            newState.filteredOptions = [];
        }
    }
    return newState;
  };

  refreshCurrentSelectionsAndFilters = (doScroll = true) => {
    // This function now derives its data primarily from `this.state.grades` (display list)
    // and `this.state._masterGradesList` (for full grade object lookups if needed, though
    // `this.state.grades` should contain the selected grade if the filter logic is correct).

    const { 
        grades, _masterGradesList, // Use _masterGradesList to find the full grade object if grades is filtered
        selectedGrade, 
        selectedSubject, subjectSearchTerm,
        selectedTopic, topicSearchTerm,
        selectedSubtopic, subtopicSearchTerm,
        selectedQuestion, optionSearchTerm, questionSearchTerm // Added questionSearchTerm
    } = this.state;

    let newLocalState = {};

    // Find the selected grade object from the *master list* to ensure we get all its children,
    // as `this.state.grades` might be a filtered list of top-level grades.
    // OR, if `this.state.grades` correctly reflects the filtered result but still contains full objects,
    // then finding in `this.state.grades` is okay.
    // Let's assume `this.state.grades` contains the full objects, just a subset of them.
    const currentGradeObj = selectedGrade ? grades.find(g => g.id === selectedGrade) : null;
    
    if (selectedGrade && !currentGradeObj) {
        // If selectedGrade ID exists but not found in current `grades` (display list),
        // it means it was filtered out or deleted. Clear down.
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('grade', true) };
        this.setState(newLocalState, () => { if(doScroll) this.scrollToEnd(true); });
        return;
    }
    
    const subjectsList = currentGradeObj ? (currentGradeObj.subjects || []) : [];
    newLocalState.subjects = subjectsList; // Unfiltered list for the selected grade
    newLocalState.filteredSubjects = this._applyFilter(subjectsList, subjectSearchTerm, 'name');

    const currentSubjectObj = selectedSubject ? subjectsList.find(s => s.id === selectedSubject) : null;
    if (selectedSubject && !currentSubjectObj) {
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('subject', true) };
        this.setState(newLocalState, () => { if(doScroll) this.scrollToEnd(true); });
        return;
    }

    const topicsList = currentSubjectObj ? (currentSubjectObj.topics || []) : [];
    newLocalState.topics = topicsList;
    newLocalState.filteredTopics = this._applyFilter(topicsList, topicSearchTerm, 'name');

    const currentTopicObj = selectedTopic ? topicsList.find(t => t.id === selectedTopic) : null;
    if (selectedTopic && !currentTopicObj) {
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('topic', true) };
        this.setState(newLocalState, () => { if(doScroll) this.scrollToEnd(true); });
        return;
    }

    const subtopicsList = currentTopicObj ? (currentTopicObj.subtopics || []) : [];
    newLocalState.subtopics = subtopicsList;
    newLocalState.filteredSubtopics = this._applyFilter(subtopicsList, subtopicSearchTerm, 'name');
    
    const currentSubtopicObj = selectedSubtopic ? subtopicsList.find(st => st.id === selectedSubtopic) : null;
    if (selectedSubtopic && !currentSubtopicObj) {
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('subtopic', true) };
        this.setState(newLocalState, () => { if(doScroll) this.scrollToEnd(true); });
        return;
    }

    const questionsList = currentSubtopicObj ? (currentSubtopicObj.questions || []) : [];
    newLocalState.questions = questionsList;
    newLocalState.filteredQuestions = this._applyFilter(questionsList, questionSearchTerm, 'name');

    const currentQuestionObj = selectedQuestion ? questionsList.find(q => q.id === selectedQuestion) : null;
    if (selectedQuestion && !currentQuestionObj) {
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('question', true) };
        this.setState(newLocalState, () => { if(doScroll) this.scrollToEnd(true); });
        return;
    }
    
    const optionsList = currentQuestionObj ? (currentQuestionObj.options || []) : [];
    newLocalState.options = optionsList;
    newLocalState.filteredOptions = this._applyFilter(optionsList, optionSearchTerm, 'value');
    
    this.setState(newLocalState);
  };

  componentDidUpdate(prevProps, prevState) { /* ... (same as before for scrolling) ... */ 
    const selectionChanged = 
        (prevState.selectedGrade !== this.state.selectedGrade) ||
        (prevState.selectedSubject !== this.state.selectedSubject) ||
        (prevState.selectedTopic !== this.state.selectedTopic) ||
        (prevState.selectedSubtopic !== this.state.selectedSubtopic) ||
        (prevState.selectedQuestion !== this.state.selectedQuestion);

    if (selectionChanged) {
        if (this.state.selectedGrade && !prevState.selectedGrade) this.scrollToEnd();
        else if (this.state.selectedSubject && !prevState.selectedSubject) this.scrollToEnd();
        else if (this.state.selectedTopic && !prevState.selectedTopic) this.scrollToEnd();
        else if (this.state.selectedSubtopic && !prevState.selectedSubtopic) this.scrollToEnd();
        else if (this.state.selectedQuestion && !prevState.selectedQuestion) this.scrollToEnd();
    }
  }
  scrollToEnd = (instant = false) => { /* ... (same as before) ... */ 
    if (this.scrollContainerRef.current) {
      this.scrollContainerRef.current.scrollTo({
        left: this.scrollContainerRef.current.scrollWidth,
        behavior: instant ? 'auto' : 'smooth' 
      });
    }
  }
  handleGradeSelect = (grade) => { /* ... (same, calls refresh) ... */ 
    this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('subject', true),
      selectedGrade: grade.id,
    }), this.refreshCurrentSelectionsAndFilters);
  }
  handleSubjectSelect = (subject) => { /* ... (same, calls refresh) ... */ 
    this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('topic', true),
      selectedSubject: subject.id,
    }), this.refreshCurrentSelectionsAndFilters);
  }
  handleTopicSelect = (topic) => { /* ... (same, calls refresh) ... */ 
     this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('subtopic', true),
      selectedTopic: topic.id,
    }), this.refreshCurrentSelectionsAndFilters);
  }
  handleSubtopicSelect = (subtopic) => { /* ... (same, calls refresh) ... */ 
    this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('question', true),
      selectedSubtopic: subtopic.id,
    }), this.refreshCurrentSelectionsAndFilters);
  }
  handleQuestionSelect = (question) => { /* ... (same, calls refresh) ... */ 
    this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('option', true),
      selectedQuestion: question.id,
    }), this.refreshCurrentSelectionsAndFilters);
  }

  render() { /* ... (Render method should largely remain the same, using the state variables) ... */ 
    const { 
        grades, gradeSearchTerm,
        filteredSubjects, subjectSearchTerm,
        filteredTopics, topicSearchTerm,
        filteredSubtopics, subtopicSearchTerm,
        filteredQuestions, questionSearchTerm,
        filteredOptions, optionSearchTerm,
        selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion
    } = this.state;
    
    const selectedGradeObj = selectedGrade && this.state.grades ? this.state.grades.find(g => g.id === selectedGrade) : null;
    const subjectsForSelectedGrade = selectedGradeObj ? (selectedGradeObj.subjects || []) : [];
    const selectedSubjectObj = selectedSubject ? subjectsForSelectedGrade.find(s => s.id === selectedSubject) : null;
    const topicsForSelectedSubject = selectedSubjectObj ? (selectedSubjectObj.topics || []) : [];
    const selectedTopicObj = selectedTopic ? topicsForSelectedSubject.find(t => t.id === selectedTopic) : null;
    const subtopicsForSelectedTopic = selectedTopicObj ? (selectedTopicObj.subtopics || []) : [];
    const selectedSubtopicObj = selectedSubtopic ? subtopicsForSelectedTopic.find(st => st.id === selectedSubtopic) : null;
    const questionsForSelectedSubtopic = selectedSubtopicObj ? (selectedSubtopicObj.questions || []) : [];
    const selectedQuestionObj = selectedQuestion ? questionsForSelectedSubtopic.find(q => q.id === selectedQuestion) : null;

    // Pass the relevant onCreate/Update/Delete handlers to modals for success messages
    // The actual data update is now handled by Data.js and reflected via subscription.
    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">

            <AddGradeModal save={grade => Data.grades.create(grade).then(() => ISuccessMessage.show({ message: 'Grade CREATED', heading: 'Success' }))} />
            <EditGradeModal grade={this.state.gradeToEdit} edit={grade => Data.grades.update(grade).then(() => ISuccessMessage.show({ message: 'Grade UPDATED', heading: 'Success' }))} />
            <DeleteGradeModal grade={this.state.gradeToDelete} delete={grade => Data.grades.delete(grade).then(() => ISuccessMessage.show({ message: 'Grade DELETED', heading: 'Success' }))} />

            <AddSubjectModal onCreate={this.onSubjectCreated} grade={selectedGrade} grades={this.state.grades} save={subject => Data.subjects.create(subject)} />
            <EditSubjectModal onUpdate={this.onSubjectUpdated} grade={selectedGrade} grades={this.state.grades} subject={this.state.subjectToEdit} edit={subject => Data.subjects.update(subject)} />
            <DeleteSubjectModal onDelete={this.onSubjectDeleted} grades={this.state.grades} subject={this.state.subjectToDelete} delete={subject => Data.subjects.delete(subject)} />

            {/* ... Other modals similarly call Data.entity.crudOp and can use .then() for success messages if desired, or use the onCreate/Update/Delete props for that */}
            <AddTopicModal onCreate={(t) => ISuccessMessage.show({ message: 'Topic CREATED', heading: 'Success' })} subject={selectedSubject} save={topic => Data.topics.create(topic)} />
            <EditTopicModal onUpdate={(t) => ISuccessMessage.show({ message: 'Topic UPDATED', heading: 'Success' })} topic={this.state.topicToEdit} subject={selectedSubject} edit={topic => Data.topics.update(topic)} />
            <DeleteTopicModal onDelete={(t) => ISuccessMessage.show({ message: 'Topic DELETED', heading: 'Success' })} topic={this.state.topicToDelete} delete={topic => Data.topics.delete(topic)} />

            <AddSubtopicModal onCreate={(st) => ISuccessMessage.show({ message: 'Subtopic CREATED', heading: 'Success' })} topic={selectedTopic} save={subtopic => Data.subtopics.create(subtopic)} />
            <EditSubtopicModal onUpdate={(st) => ISuccessMessage.show({ message: 'Subtopic UPDATED', heading: 'Success' })} subtopic={this.state.subtopicToEdit} topic={selectedTopic} edit={subtopic => Data.subtopics.update(subtopic)} />
            <DeleteSubtopicModal onDelete={(st) => ISuccessMessage.show({ message: 'Subtopic DELETED', heading: 'Success' })} subtopic={this.state.subtopicToDelete} delete={subtopic => Data.subtopics.delete(subtopic)} />

            <AddQuestionModal onCreate={(q) => ISuccessMessage.show({ message: 'Question CREATED', heading: 'Success' })} subtopic={selectedSubtopic} save={question => Data.questions.create(question)} />
            <EditQuestionModal onUpdate={(q) => ISuccessMessage.show({ message: 'Question UPDATED', heading: 'Success' })} question={this.state.questionToEdit} subtopic={selectedSubtopic} edit={question => Data.questions.update(question)} />
            <DeleteQuestionModal onDelete={(q) => ISuccessMessage.show({ message: 'Question DELETED', heading: 'Success' })} question={this.state.questionToDelete} delete={question => Data.questions.delete(question)} />
            
            <AddOptionModal onCreate={(o) => ISuccessMessage.show({ message: 'Option CREATED', heading: 'Success' })} question={selectedQuestion} save={option => Data.options.create(option)} />
            <EditOptionModal onUpdate={(o) => ISuccessMessage.show({ message: 'Option UPDATED', heading: 'Success' })} option={this.state.optionToEdit} question={selectedQuestion} edit={option => Data.options.update(option)} />
            <DeleteOptionModal onDelete={(o) => ISuccessMessage.show({ message: 'Option DELETED', heading: 'Success' })} option={this.state.optionToDelete} delete={option => Data.options.delete(option)} />


            <div className="kt-portlet__head">
              <div className="kt-portlet__head-label">
                <h3 className="kt-portlet__head-title">Student Learning</h3>
              </div>
            </div>
            <div className="kt-portlet__body">
              <div ref={this.scrollContainerRef} style={{
                minHeight: "800px", 
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }} className="row scrolling-wrapper flex-row flex-nowrap mt-4 pb-4">
                <div className="col-md-4">
                  <div className="kt-portlet__head">
                    <div className="kt-portlet__head-label">
                      <h3 className="kt-portlet__head-title">Grades</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" className="btn btn-primary pull-right" onClick={() => addGradeModalInstance.show()}>
                        <i className="la la-plus-circle"></i>
                      </button>
                    </div>
                  </div>
                  <div className="kt-portlet__body">
                    <Search title="grades" onSearch={this.onGradeSearch} value={gradeSearchTerm} />
                    <Table
                      headers={[{ label: "Name", key: "name" }]}
                      data={this.state.grades} 
                      options={{ reorderable: true }}
                      show={(grade) => this.handleGradeSelect(grade)}
                      edit={grade => this.setState({ gradeToEdit: grade }, () => editGradeModalInstance.show())}
                      delete={grade => this.setState({ gradeToDelete: grade }, () => deleteGradeModalInstance.show())}
                    />
                  </div>
                </div>

                {selectedGrade && (
                  <div className="col-md-4">
                    <div className="kt-portlet__head">
                      <div className="kt-portlet__head-label">
                        <h3 className="kt-portlet__head-title">
                           {(selectedGradeObj?.name) || '...'} Subjects
                        </h3>
                      </div>
                      <div style={{ paddingTop: 10 }}>
                        <button type="button" className="btn btn-primary pull-right" onClick={() => addSubjectModalInstance.show()}>
                          <i className="la la-plus-circle"></i>
                        </button>
                      </div>
                    </div>
                    <div className="kt-portlet__body">
                      <Search title="subjects" onSearch={this.onSubjectSearch} value={subjectSearchTerm} />
                      <Table
                        headers={[{ label: "Name", key: "name" }]}
                        data={filteredSubjects}
                        options={{ reorderable: true }}
                        show={(subject) => this.handleSubjectSelect(subject)}
                        edit={subject => this.setState({ subjectToEdit: subject }, () => editSubjectModalInstance.show())}
                        delete={subject => this.setState({ subjectToDelete: subject }, () => deleteSubjectModalInstance.show())}
                      />
                    </div>
                  </div>
                )}

                {selectedSubject && (
                  <div className="col-md-4">
                    <div className="kt-portlet__head">
                      <div className="kt-portlet__head-label">
                        <h3 className="kt-portlet__head-title">
                          {(selectedSubjectObj?.name) || '...'} Topics
                        </h3>
                      </div>
                      <div style={{ paddingTop: 10 }}>
                        <button type="button" className="btn btn-primary pull-right" onClick={() => addTopicModalInstance.show()}>
                          <i className="la la-plus-circle"></i>
                        </button>
                      </div>
                    </div>
                    <div className="kt-portlet__body">
                      {(this.state.topics || []).length > 0 && <Search title="topics" onSearch={this.onTopicSearch} value={topicSearchTerm} />}
                      <Table
                        headers={[{ label: "Name", key: "name" }]}
                        data={filteredTopics}
                        options={{ reorderable: true }}
                        show={(topic) => this.handleTopicSelect(topic)}
                        edit={topic => this.setState({ topicToEdit: topic }, () => editTopicModalInstance.show())}
                        delete={topic => this.setState({ topicToDelete: topic }, () => deleteTopicModalInstance.show())}
                      />
                    </div>
                  </div>
                )}

                {selectedTopic && (
                  <div className="col-md-4">
                    <div className="kt-portlet__head">
                      <div className="kt-portlet__head-label">
                        <h3 className="kt-portlet__head-title">
                          {(selectedTopicObj?.name) || '...'} Subtopics
                        </h3>
                      </div>
                      <div style={{ paddingTop: 10 }}>
                        <button type="button" className="btn btn-primary pull-right" onClick={() => addSubtopicModalInstance.show()}>
                          <i className="la la-plus-circle"></i>
                        </button>
                      </div>
                    </div>
                    <div className="kt-portlet__body">
                      {(this.state.subtopics || []).length > 0 && <Search title="subtopics" onSearch={this.onSubtopicSearch} value={subtopicSearchTerm}/>}
                      <Table
                        headers={[{ label: "Name", key: "name" }]}
                        data={filteredSubtopics}  
                        options={{ reorderable: true }}
                        show={(subtopic) => this.handleSubtopicSelect(subtopic)}
                        edit={subtopic => this.setState({ subtopicToEdit: subtopic }, () => editSubtopicModalInstance.show())}
                        delete={subtopic => this.setState({ subtopicToDelete: subtopic }, () => deleteSubtopicModalInstance.show())}
                      />
                    </div>
                  </div>
                )}

                {selectedSubtopic && (
                  <div className="col-md-4">
                    <div className="kt-portlet__head">
                      <div className="kt-portlet__head-label">
                        <h3 className="kt-portlet__head-title">
                          {(selectedSubtopicObj?.name) || '...'} Content
                        </h3>
                      </div>
                      <div style={{ paddingTop: 10 }}>
                        <button type="button" className="btn btn-primary pull-right" onClick={() => addQuestionModalInstance.show()}>
                          <i className="la la-plus-circle"></i>
                        </button>
                      </div>
                    </div>
                    <div className="kt-portlet__body">
                      {(this.state.questions || []).length > 0 && <Search title="content" onSearch={this.onQuestionSearch} value={questionSearchTerm}/>}
                      <Table
                        headers={[{ label: "Name", key: "name" }]}
                        data={filteredQuestions.map(question => {
                            try {
                                const contentState = ContentState.createFromBlockArray(
                                    JSON.parse(question.name).blocks,
                                    JSON.parse(question.name).entityMap
                                );
                                const contentStateWithKeys = contentState.getBlockMap().map(block => block.set('key', `question-${question.id}-${block.getKey()}`));
                                const html = stateToHTML(contentStateWithKeys);
                                return { ...question, name: html };
                            } catch (e) {
                                console.log('Error parsing question name', e);
                                return { ...question, name: question.name };
                            }
                        })}
                        options={{ reorderable: true }}
                        show={(question) => {
                          console.log('show question', question);
                          this.handleQuestionSelect(question);
                        }}
                        edit={question => {
                          console.log('edit question', question);
                          this.setState({ questionToEdit: question }, () => editQuestionModalInstance.show());
                        }}
                        delete={question => {
                          console.log('delete question', question);
                          this.setState({ questionToDelete: question }, () => deleteQuestionModalInstance.show());
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedQuestion && (
                  <div className="col-md-4">
                    <div className="kt-portlet__head">
                      <div className="kt-portlet__head-label">
                        <div className="kt-portlet__head-title">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: (selectedQuestionObj?.name) || '...'
                            }}
                          />
                          Answers
                        </div>
                      </div>
                      <div style={{ paddingTop: 10 }}>
                        <button type="button" className="btn btn-primary pull-right" onClick={() => addOptionModalInstance.show()}>
                          <i className="la la-plus-circle"></i>
                        </button>
                      </div>
                    </div>
                    <div className="kt-portlet__body">
                      {(this.state.options || []).length > 0 && <Search title="answers" onSearch={this.onOptionSearch} value={optionSearchTerm}/>}
                      <Table
                        headers={[{ label: "Answer", key: "value" }]}
                        options={{ reorderable: true }}
                        data={filteredOptions}
                        edit={option => this.setState({ optionToEdit: option }, () => editOptionModalInstance.show())}
                        delete={option => this.setState({ optionToDelete: option }, () => deleteOptionModalInstance.show())}
                      />
                    </div>
                  </div>
                )}
              </div> 
            </div> 
          </div> 
        </div> 
      </div> 
    );
  }
}

export default BasicTable;