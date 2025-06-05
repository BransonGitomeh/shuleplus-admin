import React from "react";

import Table from "./components/table"; // Your new rich list Table
import Search from './components/search';
import Data from "../../utils/data"; // Assuming this is your data service
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

import "./scrolling.css"; // Ensure this file exists and styles scrolling-wrapper

// Removed draft-js imports as they weren't used in the provided BasicTable snippet
// import { ContentState } from 'draft-js';
// import {stateToHTML} from 'draft-js-export-html';

const ISuccessMessage = new SuccessMessage();

// Modal instances (consider managing their visibility via state if they are complex)
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
  _gradeSubscription = null;

  state = {
    grades: [], 
    _masterGradesList: [], 

    gradeToDelete: {}, gradeToEdit: {}, selectedGrade: null, gradeSearchTerm: '',
    // subjects, topics, etc. are now derived in refreshCurrentSelectionsAndFilters
    // and their filtered versions are stored directly for the Table component.
    filteredSubjects: [], subjectToEdit: {}, subjectToDelete: {}, selectedSubject: null, subjectSearchTerm: '',
    filteredTopics: [], topicToEdit: {}, topicToDelete: {}, selectedTopic: null, topicSearchTerm: '',
    filteredSubtopics: [], subtopicToEdit: {}, subtopicToDelete: {}, selectedSubtopic: null, subtopicSearchTerm: '',
    filteredQuestions: [], questionToEdit: {}, questionToDelete: {}, selectedQuestion: null, questionSearchTerm: '',
    filteredOptions: [], optionToEdit: {}, optionToDelete: {}, selectedOption: null, optionSearchTerm: '', // Added selectedOption
  };

  _applyFilter = (list, term, key = 'name') => {
    if (!list) return [];
    const searchTerm = term.toLowerCase().trim();
    if (!searchTerm) return list;
    return list.filter(item => item && item[key] && String(item[key]).toLowerCase().includes(searchTerm));
  };

  // --- CRUD Success Handlers (Optional - can be inlined with .then()) ---
  // These are fine if you prefer named handlers for clarity.
  onEntityCreated = (entityName) => { 
    ISuccessMessage.show({ message: `${entityName} has been CREATED successfully!`, heading: `Create ${entityName}` });
  }
  onEntityUpdated = (entityName) => { 
    ISuccessMessage.show({ message: `${entityName} has been UPDATED successfully!`, heading: `Edit ${entityName}` });
  }
  onEntityDeleted = (entityName) => { 
    ISuccessMessage.show({ message: `${entityName} has been DELETED successfully!`, heading: `Delete ${entityName}` });
  }
  
  // --- Search Handlers ---
  onGradeSearch = e => {
    const term = e.target.value;
    this.setState({ 
        gradeSearchTerm: term,
        // The 'grades' in state is now the display list. Filtering happens on _masterGradesList.
        grades: this._applyFilter(this.state._masterGradesList, term, 'name') 
    }, () => this.refreshCurrentSelectionsAndFilters(false)); 
  }
  // For child entities, searching filters the currently visible list.
  onSubjectSearch = e => { this.setState({ subjectSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onTopicSearch = e => { this.setState({ topicSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onSubtopicSearch = e => { this.setState({ subtopicSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onQuestionSearch = e => { this.setState({ questionSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onOptionSearch = e => { this.setState({ optionSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }


  // --- Lifecycle Methods ---
  async componentDidMount() {
    const masterGrades = Data.grades.list(); 
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
                    selectedOption: savedState.selectedOption || null, // Restore selectedOption
                    gradeSearchTerm: savedState.gradeSearchTerm || '',
                    subjectSearchTerm: savedState.subjectSearchTerm || '',
                    topicSearchTerm: savedState.topicSearchTerm || '',
                    subtopicSearchTerm: savedState.subtopicSearchTerm || '',
                    questionSearchTerm: savedState.questionSearchTerm || '',
                    optionSearchTerm: savedState.optionSearchTerm || '',
                }, () => {
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
            this.refreshCurrentSelectionsAndFilters(false); // Proceed with defaults
        }
    });

    this._gradeSubscription = Data.grades.subscribe(({ grades: updatedMasterGradesTree }) => {
        console.log("BasicTable: Data.grades.subscribe fired. New master tree:", updatedMasterGradesTree);
        const newMasterList = updatedMasterGradesTree || [];
        // Ensure IDs are present, especially if Data service might not guarantee them
        const newMasterListWithIds = newMasterList.map((g, index) => ({ ...g, id: g.id || `grade-${Date.now()}-${index}`}));

        this.setState({
            _masterGradesList: newMasterListWithIds, 
            grades: this._applyFilter(newMasterListWithIds, this.state.gradeSearchTerm, 'name')
        }, () => this.refreshCurrentSelectionsAndFilters(true)); // Refresh and potentially scroll
    });
  }

  componentWillUnmount() {
    if (this._gradeSubscription) {
      this._gradeSubscription(); 
      this._gradeSubscription = null;
    }
    const {
        selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion, selectedOption,
        gradeSearchTerm, subjectSearchTerm, topicSearchTerm, subtopicSearchTerm, questionSearchTerm, optionSearchTerm
    } = this.state;

    const stateToSave = {
        selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion, selectedOption,
        gradeSearchTerm, subjectSearchTerm, topicSearchTerm, subtopicSearchTerm, questionSearchTerm, optionSearchTerm
    };
    try {
        localStorage.setItem("learningState", JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Failed to save state to localStorage:", error);
    }
  }
  
  clearSelectionsAndDataFromLevel = (levelName, includeSelf = false) => {
    const newState = {};
    const levels = ['grade', 'subject', 'topic', 'subtopic', 'question', 'option'];
    const startIndex = levels.indexOf(levelName);

    if (startIndex === -1) return {};

    for (let i = startIndex; i < levels.length; i++) {
        const currentLevel = levels[i];
        if (i === startIndex && !includeSelf) continue;

        newState[`selected${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}`] = null;
        // Store filtered lists directly now
        newState[`filtered${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}s`] = [];
        if (currentLevel === 'grade') newState.grades = this._applyFilter(this.state._masterGradesList, this.state.gradeSearchTerm, 'name'); // Keep grades filtered
        // Option is singular
        if (currentLevel === 'option') newState.filteredOptions = [];

    }
    return newState;
  };

  refreshCurrentSelectionsAndFilters = (doScroll = true) => {
    const { 
        _masterGradesList, // Always use master list to find current selections
        selectedGrade, gradeSearchTerm, // grades (display list) is already filtered
        selectedSubject, subjectSearchTerm,
        selectedTopic, topicSearchTerm,
        selectedSubtopic, subtopicSearchTerm,
        selectedQuestion, questionSearchTerm,
        optionSearchTerm // selectedOption is handled directly if needed, options are listed under question
    } = this.state;

    let newLocalState = {};

    // Apply grade filter to the master list to get current displayable grades
    const currentDisplayGrades = this._applyFilter(_masterGradesList, gradeSearchTerm, 'name');
    newLocalState.grades = currentDisplayGrades;

    const currentGradeObj = selectedGrade ? _masterGradesList.find(g => g.id === selectedGrade) : null;
    
    if (selectedGrade && !currentGradeObj) {
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('grade', true) };
        this.setState(newLocalState, () => { if(doScroll) this.scrollToEnd(true); });
        return;
    }
    
    const subjectsList = currentGradeObj ? (currentGradeObj.subjects || []).map((s, i) => ({...s, id: s.id || `${currentGradeObj.id}-subject-${i}`})) : [];
    newLocalState.filteredSubjects = this._applyFilter(subjectsList, subjectSearchTerm, 'name');

    const currentSubjectObj = selectedSubject ? subjectsList.find(s => s.id === selectedSubject) : null;
    if (selectedSubject && !currentSubjectObj) {
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('subject', true) };
         // Keep grades as they are
        newLocalState.grades = currentDisplayGrades;
        this.setState(newLocalState, () => { if(doScroll) this.scrollToEnd(true); });
        return;
    }

    const topicsList = currentSubjectObj ? (currentSubjectObj.topics || []).map((t, i) => ({...t, id: t.id || `${currentSubjectObj.id}-topic-${i}`})) : [];
    newLocalState.filteredTopics = this._applyFilter(topicsList, topicSearchTerm, 'name');

    const currentTopicObj = selectedTopic ? topicsList.find(t => t.id === selectedTopic) : null;
    if (selectedTopic && !currentTopicObj) {
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('topic', true) };
        newLocalState.grades = currentDisplayGrades;
        newLocalState.filteredSubjects = this._applyFilter(subjectsList, subjectSearchTerm, 'name');
        this.setState(newLocalState, () => { if(doScroll) this.scrollToEnd(true); });
        return;
    }

    const subtopicsList = currentTopicObj ? (currentTopicObj.subtopics || []).map((st, i) => ({...st, id: st.id || `${currentTopicObj.id}-subtopic-${i}`})) : [];
    newLocalState.filteredSubtopics = this._applyFilter(subtopicsList, subtopicSearchTerm, 'name');
    
    const currentSubtopicObj = selectedSubtopic ? subtopicsList.find(st => st.id === selectedSubtopic) : null;
    if (selectedSubtopic && !currentSubtopicObj) {
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('subtopic', true) };
        newLocalState.grades = currentDisplayGrades;
        newLocalState.filteredSubjects = this._applyFilter(subjectsList, subjectSearchTerm, 'name');
        newLocalState.filteredTopics = this._applyFilter(topicsList, topicSearchTerm, 'name');
        this.setState(newLocalState, () => { if(doScroll) this.scrollToEnd(true); });
        return;
    }

    const questionsList = currentSubtopicObj ? (currentSubtopicObj.questions || []).map((q, i) => ({...q, id: q.id || `${currentSubtopicObj.id}-question-${i}`})) : [];
    newLocalState.filteredQuestions = this._applyFilter(questionsList, questionSearchTerm, 'name'); // Assuming questions have a 'name' for filtering

    const currentQuestionObj = selectedQuestion ? questionsList.find(q => q.id === selectedQuestion) : null;
    if (selectedQuestion && !currentQuestionObj) {
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('question', true) };
        // Preserve upper levels
        newLocalState.grades = currentDisplayGrades;
        newLocalState.filteredSubjects = this._applyFilter(subjectsList, subjectSearchTerm, 'name');
        newLocalState.filteredTopics = this._applyFilter(topicsList, topicSearchTerm, 'name');
        newLocalState.filteredSubtopics = this._applyFilter(subtopicsList, subtopicSearchTerm, 'name');
        this.setState(newLocalState, () => { if(doScroll) this.scrollToEnd(true); });
        return;
    }
    
    const optionsList = currentQuestionObj ? (currentQuestionObj.options || []).map((o, i) => ({...o, id: o.id || `${currentQuestionObj.id}-option-${i}`})) : [];
    newLocalState.filteredOptions = this._applyFilter(optionsList, optionSearchTerm, 'value'); // Options filtered by 'value'
    
    this.setState(newLocalState, () => {
        if (doScroll) {
            // Determine which column was last interacted with to scroll it into view
            if (selectedQuestion && !this.state.selectedQuestion) this.scrollToEnd();
            else if (selectedSubtopic && !this.state.selectedSubtopic) this.scrollToEnd();
            // ... and so on for other levels if needed, or just a general scrollToEnd
        }
    });
  };

  componentDidUpdate(prevProps, prevState) { 
    const selectionChanged = 
        (prevState.selectedGrade !== this.state.selectedGrade) ||
        (prevState.selectedSubject !== this.state.selectedSubject) ||
        (prevState.selectedTopic !== this.state.selectedTopic) ||
        (prevState.selectedSubtopic !== this.state.selectedSubtopic) ||
        (prevState.selectedQuestion !== this.state.selectedQuestion);

    if (selectionChanged) {
        // Scroll to make newly opened column visible if it's off-screen
        // This logic might need refinement based on which column is newest
        this.scrollToEnd(); 
    }
  }

  scrollBy = (amount) => {
    if (this.scrollContainerRef.current) {
        this.scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }

  scrollToEnd = (instant = false) => { 
    if (this.scrollContainerRef.current) {
      this.scrollContainerRef.current.scrollTo({
        left: this.scrollContainerRef.current.scrollWidth,
        behavior: instant ? 'auto' : 'smooth' 
      });
    }
  }
  
  // --- Selection Handlers ---
  handleGradeSelect = (grade) => { 
    this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('subject', true),
      selectedGrade: grade.id,
    }), () => this.refreshCurrentSelectionsAndFilters());
  }
  handleSubjectSelect = (subject) => { 
    this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('topic', true),
      selectedSubject: subject.id,
    }), () => this.refreshCurrentSelectionsAndFilters());
  }
  handleTopicSelect = (topic) => { 
     this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('subtopic', true),
      selectedTopic: topic.id,
    }), () => this.refreshCurrentSelectionsAndFilters());
  }
  handleSubtopicSelect = (subtopic) => { 
    this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('question', true),
      selectedSubtopic: subtopic.id,
    }), () => this.refreshCurrentSelectionsAndFilters());
  }
  handleQuestionSelect = (question) => { 
    this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('option', true),
      selectedQuestion: question.id,
    }), () => this.refreshCurrentSelectionsAndFilters());
  }
  // handleOptionSelect - if options are selectable, not just editable/deletable
  // handleOptionSelect = (option) => {
  //   this.setState({ selectedOption: option.id });
  // }


  // --- D&D Order Change Handlers ---
  // These assume your Data service can handle reordering by updating the parent.
  // Example: Data.grades.update(gradeWithReorderedSubjects)
  // Or Data.subjects.reorder(gradeId, newSubjectOrder)

  _handleReorder = async (entityType, newOrderedItems, ...parentIds) => {
    // A generic reorder handler, you'll need to adapt it based on your Data service API
    // For simplicity, this example assumes updating the parent entity's child list
    const { _masterGradesList } = this.state;
    let success = false;

    try {
        if (entityType === 'grade') {
            // Data.grades.reorder(newOrderedItems) or similar
            // This might require a specific Data.grades.setOrder(newOrderedItemIds)
            // For now, let's assume direct update of _masterGradesList for reordering grades
            // and then calling a generic update if your Data service supports it.
            // This is complex because Data.grades.update usually takes one grade.
            // A specific Data.grades.reorder(arrayOfGradeIdsOrObjects) is better.
            // For this example, we'll simulate if Data.grades.update can take the whole list.
            // This is NOT typical. Usually, there's a specific reorder endpoint/method.
            console.warn("Reordering top-level grades needs a specific Data.grades.reorder() method. Simulating locally for now.");
            Data.grades.setAll(newOrderedItems); // Assumes Data.grades has a way to set the whole list
            success = true;
        } else {
            const parentGrade = _masterGradesList.find(g => g.id === parentIds[0]);
            if (!parentGrade) return;

            let updatedParent = { ...parentGrade };

            if (entityType === 'subject') {
                updatedParent.subjects = newOrderedItems;
                await Data.grades.update(updatedParent); // Update the grade with reordered subjects
                success = true;
            } else if (entityType === 'topic' && parentIds[1]) { // parentIds[1] is subjectId
                const parentSubject = updatedParent.subjects.find(s => s.id === parentIds[1]);
                if (!parentSubject) return;
                const updatedSubject = { ...parentSubject, topics: newOrderedItems };
                updatedParent.subjects = updatedParent.subjects.map(s => s.id === parentIds[1] ? updatedSubject : s);
                await Data.grades.update(updatedParent);
                success = true;
            } else if (entityType === 'subtopic' && parentIds[1] && parentIds[2]) { // subjectId, topicId
                const parentSubject = updatedParent.subjects.find(s => s.id === parentIds[1]);
                if (!parentSubject) return;
                const parentTopic = parentSubject.topics.find(t => t.id === parentIds[2]);
                if (!parentTopic) return;
                const updatedTopic = { ...parentTopic, subtopics: newOrderedItems };
                const updatedSubjectTopics = parentSubject.topics.map(t => t.id === parentIds[2] ? updatedTopic : t);
                const updatedSubject = { ...parentSubject, topics: updatedSubjectTopics };
                updatedParent.subjects = updatedParent.subjects.map(s => s.id === parentIds[1] ? updatedSubject : s);
                await Data.grades.update(updatedParent);
                success = true;
            } else if (entityType === 'question' && parentIds[1] && parentIds[2] && parentIds[3]) { // subjectId, topicId, subtopicId
                // ... similar logic for questions ...
                const parentSubject = updatedParent.subjects.find(s => s.id === parentIds[1]);
                // ... (drill down)
                const parentSubtopic = parentSubject?.topics?.find(t => t.id === parentIds[2])?.subtopics?.find(st => st.id === parentIds[3]);
                if (!parentSubtopic) return;
                const updatedSubtopic = { ...parentSubtopic, questions: newOrderedItems };
                // ... (reconstruct back up) ... then Data.grades.update(updatedParent)
                // This becomes very verbose. A better Data service API is helpful here.
                // e.g., Data.questions.reorder(subtopicId, newQuestionOrder)
                // For now, we'll assume Data.grades.update handles the deep update.
                // This part needs to be robust based on your Data service.
                // Simplified for brevity - this part is complex without a good Data API for deep reorders.
                 Data.subtopics.update({ ...parentSubtopic, questions: newOrderedItems, parentTopicId: parentIds[2], parentSubjectId: parentIds[1], parentGradeId: parentIds[0] }); // Example
                success = true;

            } else if (entityType === 'option' && parentIds[1] && parentIds[2] && parentIds[3] && parentIds[4]) { // ..., questionId
                // ... similar logic for options ...
                Data.questions.update({ id: parentIds[4], options: newOrderedItems, parentSubtopicId:parentIds[3] /* ... other parent ids */ }); // Example
                success = true;
            }
        }
        if (success) {
            ISuccessMessage.show({ message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} order updated!`, heading: 'Reorder' });
            // Data subscription will refresh the UI.
        }
    } catch (error) {
        console.error(`Error reordering ${entityType}:`, error);
        ISuccessMessage.show({ message: `Failed to reorder ${entityType}.`, heading: 'Error', type: 'error' });
    }
  };

  render() { 
    const { 
        grades, gradeSearchTerm,
        filteredSubjects, subjectSearchTerm,
        filteredTopics, topicSearchTerm,
        filteredSubtopics, subtopicSearchTerm,
        filteredQuestions, questionSearchTerm,
        filteredOptions, optionSearchTerm,
        selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion
    } = this.state;
    
    // Get full selected objects for display names (from _masterGradesList to ensure data integrity)
    const selectedGradeObj = selectedGrade ? this.state._masterGradesList.find(g => g.id === selectedGrade) : null;
    const selectedSubjectObj = selectedGradeObj && selectedSubject ? (selectedGradeObj.subjects || []).find(s => s.id === selectedSubject) : null;
    const selectedTopicObj = selectedSubjectObj && selectedTopic ? (selectedSubjectObj.topics || []).find(t => t.id === selectedTopic) : null;
    const selectedSubtopicObj = selectedTopicObj && selectedSubtopic ? (selectedTopicObj.subtopics || []).find(st => st.id === selectedSubtopic) : null;
    // selectedQuestionObj is not strictly needed for display name in current layout but good for consistency
    const selectedQuestionObj = selectedSubtopicObj && selectedQuestion ? (selectedSubtopicObj.questions || []).find(q => q.id === selectedQuestion) : null;

    const tableOptions = { reorderable: true, linkable: true, editable: true, deleteable: true };

    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">

            {/* Modals: Ensure 'save', 'edit', 'delete' props correctly call Data service methods */}
            {/* Example: Data.grades.create(gradeData) should update the main tree and trigger subscription */}
            <AddGradeModal save={grade => Data.grades.create(grade).then(() => this.onEntityCreated('Grade'))} />
            <EditGradeModal grade={this.state.gradeToEdit} edit={grade => Data.grades.update(grade).then(() => this.onEntityUpdated('Grade'))} />
            <DeleteGradeModal grade={this.state.gradeToDelete} delete={grade => Data.grades.delete(grade.id).then(() => this.onEntityDeleted('Grade'))} />

            {/* For child entities, ensure parent IDs are passed to Data service methods */}
            <AddSubjectModal grade={selectedGrade} save={subject => Data.subjects.create({ ...subject, gradeId: selectedGrade }).then(() => this.onEntityCreated('Subject'))} />
            <EditSubjectModal grade={selectedGrade} subject={this.state.subjectToEdit} edit={subject => Data.subjects.update({ ...subject, gradeId: selectedGrade }).then(() => this.onEntityUpdated('Subject'))} />
            <DeleteSubjectModal subject={this.state.subjectToDelete} delete={subject => Data.subjects.delete(subject.id, selectedGrade).then(() => this.onEntityDeleted('Subject'))} />

            <AddTopicModal subject={selectedSubject} save={topic => Data.topics.create({ ...topic, subjectId: selectedSubject, gradeId: selectedGrade }).then(() => this.onEntityCreated('Topic'))} />
            <EditTopicModal subject={selectedSubject} topic={this.state.topicToEdit} edit={topic => Data.topics.update({ ...topic, subjectId: selectedSubject, gradeId: selectedGrade }).then(() => this.onEntityUpdated('Topic'))} />
            <DeleteTopicModal topic={this.state.topicToDelete} delete={topic => Data.topics.delete(topic.id, selectedSubject, selectedGrade).then(() => this.onEntityDeleted('Topic'))} />
            
            {/* ... and so on for Subtopic, Question, Option modals ... */}
            <AddSubtopicModal topic={selectedTopic} save={subtopic => Data.subtopics.create({ ...subtopic, topicId: selectedTopic, subjectId: selectedSubject, gradeId: selectedGrade }).then(() => this.onEntityCreated('Subtopic'))} />
            <EditSubtopicModal topic={selectedTopic} subtopic={this.state.subtopicToEdit} edit={subtopic => Data.subtopics.update({...subtopic, topicId: selectedTopic, subjectId:selectedSubject, gradeId: selectedGrade}).then(() => this.onEntityUpdated('Subtopic'))} />
            <DeleteSubtopicModal subtopic={this.state.subtopicToDelete} delete={subtopic => Data.subtopics.delete(subtopic.id, selectedTopic, selectedSubject, selectedGrade).then(() => this.onEntityDeleted('Subtopic'))} />

            <AddQuestionModal subtopic={selectedSubtopic} save={question => Data.questions.create({...question, subtopicId: selectedSubtopic, topicId: selectedTopic, subjectId:selectedSubject, gradeId: selectedGrade}).then(() => this.onEntityCreated('Question'))} />
            <EditQuestionModal 
    question={this.state.questionToEdit} // The selected question
    subtopic={selectedSubtopic} // Current subtopic context
    edit={async (dataToEdit) => { // The 'edit' prop for the modal
        // Call your Data.questions.update or similar
        // This function needs to handle the structured 'dataToEdit'
        // and make the API call.
        console.log("Data to send for edit:", dataToEdit);
        // Example: return Data.questions.update(dataToEdit.id, dataToEdit);
        await Data.questions.update(dataToEdit.id, dataToEdit); // Make sure Data.questions.update can handle the new data structure
    }}
/>            <DeleteQuestionModal question={this.state.questionToDelete} delete={question => Data.questions.delete(question.id, selectedSubtopic, selectedTopic, selectedSubject, selectedGrade).then(() => this.onEntityDeleted('Question'))} />
            
            <AddOptionModal question={selectedQuestion} save={option => Data.options.create({...option, questionId: selectedQuestion, subtopicId:selectedSubtopic, topicId:selectedTopic, subjectId:selectedSubject, gradeId:selectedGrade}).then(() => this.onEntityCreated('Option'))} />
            <EditOptionModal question={selectedQuestion} option={this.state.optionToEdit} edit={option => Data.options.update({...option, questionId: selectedQuestion, /* other parent ids */}).then(() => this.onEntityUpdated('Option'))} />
            <DeleteOptionModal option={this.state.optionToDelete} delete={option => Data.options.delete(option.id, selectedQuestion, /* other parent ids */).then(() => this.onEntityDeleted('Option'))} />


            <div className="kt-portlet__head">
              <div className="kt-portlet__head-label">
                <h3 className="kt-portlet__head-title">Student Learning</h3>
              </div>
            </div>
            <div className="kt-portlet__body">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={() => this.scrollBy(-300)} className="btn btn-sm btn-icon btn-light mr-2" title="Scroll Left">
                    <i className="la la-angle-left"></i>
                </button>
                <div ref={this.scrollContainerRef} style={{
                  minHeight: "calc(70vh + 100px)", // Accommodate table max-height + search/header
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  flexGrow: 1,
                  display: 'flex', // To make children (columns) align
                }} className="scrolling-wrapper flex-row flex-nowrap pb-4">
                    {/* Column structure */}
                    <div className="col-md-3 col-lg-2"> {/* Adjusted column size for better fit */}
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Grades</h3></div>
                        <div style={{ paddingTop: 10 }}>
                        <button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addGradeModalInstance.show()} title="Add Grade">
                            <i className="la la-plus-circle"></i>
                        </button>
                        </div>
                    </div>
                    <div className="kt-portlet__body">
                        <Search title="grades" onSearch={this.onGradeSearch} value={gradeSearchTerm} />
                        <Table
                        listId="grades-list"
                        headers={[{ label: "Name", key: "name" }]}
                        data={grades} 
                        options={tableOptions}
                        selectedItemId={selectedGrade}
                        show={this.handleGradeSelect}
                        edit={grade => this.setState({ gradeToEdit: grade }, () => editGradeModalInstance.show())}
                        deleteItemProp={grade => this.setState({ gradeToDelete: grade }, () => deleteGradeModalInstance.show())}
                        onOrderChange={(newOrderedGrades) => this._handleReorder('grade', newOrderedGrades)}
                        />
                    </div>
                    </div>

                    {selectedGrade && (
                    <div className="col-md-3 col-lg-2">
                        <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedGradeObj?.name) || '...'} Subjects</h3></div>
                        <div style={{ paddingTop: 10 }}>
                            <button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addSubjectModalInstance.show()} title="Add Subject">
                            <i className="la la-plus-circle"></i>
                            </button>
                        </div>
                        </div>
                        <div className="kt-portlet__body">
                        <Search title="subjects" onSearch={this.onSubjectSearch} value={subjectSearchTerm} />
                        <Table
                            listId={`subjects-list-${selectedGrade}`}
                            headers={[{ label: "Name", key: "name" }]}
                            data={filteredSubjects}
                            options={tableOptions}
                            selectedItemId={selectedSubject}
                            show={this.handleSubjectSelect}
                            edit={subject => this.setState({ subjectToEdit: subject }, () => editSubjectModalInstance.show())}
                            deleteItemProp={subject => this.setState({ subjectToDelete: subject }, () => deleteSubjectModalInstance.show())}
                            onOrderChange={(newOrderedSubjects) => this._handleReorder('subject', newOrderedSubjects, selectedGrade)}
                        />
                        </div>
                    </div>
                    )}

                    {selectedSubject && (
                    <div className="col-md-3 col-lg-2">
                        <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedSubjectObj?.name) || '...'} Topics</h3></div>
                        <div style={{ paddingTop: 10 }}>
                            <button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addTopicModalInstance.show()} title="Add Topic">
                            <i className="la la-plus-circle"></i>
                            </button>
                        </div>
                        </div>
                        <div className="kt-portlet__body">
                        <Search title="topics" onSearch={this.onTopicSearch} value={topicSearchTerm} />
                        <Table
                            listId={`topics-list-${selectedSubject}`}
                            headers={[{ label: "Name", key: "name" }]}
                            data={filteredTopics}
                            options={tableOptions}
                            selectedItemId={selectedTopic}
                            show={this.handleTopicSelect}
                            edit={topic => this.setState({ topicToEdit: topic }, () => editTopicModalInstance.show())}
                            deleteItemProp={topic => this.setState({ topicToDelete: topic }, () => deleteTopicModalInstance.show())}
                            onOrderChange={(newOrderedTopics) => this._handleReorder('topic', newOrderedTopics, selectedGrade, selectedSubject)}
                        />
                        </div>
                    </div>
                    )}

                    {selectedTopic && (
                    <div className="col-md-3 col-lg-2">
                        <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedTopicObj?.name) || '...'} Subtopics</h3></div>
                        <div style={{ paddingTop: 10 }}>
                            <button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addSubtopicModalInstance.show()} title="Add Subtopic">
                            <i className="la la-plus-circle"></i>
                            </button>
                        </div>
                        </div>
                        <div className="kt-portlet__body">
                        <Search title="subtopics" onSearch={this.onSubtopicSearch} value={subtopicSearchTerm}/>
                        <Table
                            listId={`subtopics-list-${selectedTopic}`}
                            headers={[{ label: "Name", key: "name" }]}
                            data={filteredSubtopics}  
                            options={tableOptions}
                            selectedItemId={selectedSubtopic}
                            show={this.handleSubtopicSelect}
                            edit={subtopic => this.setState({ subtopicToEdit: subtopic }, () => editSubtopicModalInstance.show())}
                            deleteItemProp={subtopic => this.setState({ subtopicToDelete: subtopic }, () => deleteSubtopicModalInstance.show())}
                            onOrderChange={(newOrderedSubtopics) => this._handleReorder('subtopic', newOrderedSubtopics, selectedGrade, selectedSubject, selectedTopic)}
                        />
                        </div>
                    </div>
                    )}

                    {selectedSubtopic && (
                    <div className="col-md-4 col-lg-3"> {/* Content/Questions column can be wider */}
                        <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedSubtopicObj?.name) || '...'} Content</h3></div>
                        <div style={{ paddingTop: 10 }}>
                            <button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addQuestionModalInstance.show()} title="Add Question">
                            <i className="la la-plus-circle"></i>
                            </button>
                        </div>
                        </div>
                        <div className="kt-portlet__body">
                        <Search title="content" onSearch={this.onQuestionSearch} value={questionSearchTerm}/>
                        <Table
                            listId={`questions-list-${selectedSubtopic}`}
                            headers={[{ label: "Name", key: "name" }]} // Assuming question has a 'name' or similar primary display
                            data={filteredQuestions}
                            options={tableOptions}
                            selectedItemId={selectedQuestion}
                            show={this.handleQuestionSelect}
                            edit={question => this.setState({ questionToEdit: question }, () => editQuestionModalInstance.show(question))}
                            deleteItemProp={question => this.setState({ questionToDelete: question }, () => deleteQuestionModalInstance.show())}
                            onOrderChange={(newOrderedQuestions) => this._handleReorder('question', newOrderedQuestions, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic)}
                        />
                        </div>
                    </div>
                    )}

                    {selectedQuestion && (
                    <div className="col-md-3 col-lg-2">
                        <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label"><div className="kt-portlet__head-title">Responses</div></div>
                        <div style={{ paddingTop: 10 }}>
                            <button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addOptionModalInstance.show()} title="Add Option">
                            <i className="la la-plus-circle"></i>
                            </button>
                        </div>
                        </div>
                        <div className="kt-portlet__body">
                        <Search title="answers" onSearch={this.onOptionSearch} value={optionSearchTerm}/>
                        <Table
                            listId={`options-list-${selectedQuestion}`}
                            headers={[{ label: "Answer", key: "value" }]} // Options displayed by 'value'
                            data={filteredOptions}
                            options={{ ...tableOptions, linkable: false }} // Options might not be 'selectable' in the same way
                            // selectedItemId={this.state.selectedOption} // If options themselves can be selected
                            // show={this.handleOptionSelect} // If selecting an option does something
                            edit={option => this.setState({ optionToEdit: option }, () => editOptionModalInstance.show())}
                            deleteItemProp={option => this.setState({ optionToDelete: option }, () => deleteOptionModalInstance.show())}
                            onOrderChange={(newOrderedOptions) => this._handleReorder('option', newOrderedOptions, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion)}
                        />
                        </div>
                    </div>
                    )}
                </div> {/* End Scrolling Wrapper */}
                <button onClick={() => this.scrollBy(300)} className="btn btn-sm btn-icon btn-light ml-2" title="Scroll Right">
                    <i className="la la-angle-right"></i>
                </button>
              </div>
            </div> 
          </div> 
        </div> 
      </div> 
    );
  }
}

export default BasicTable;