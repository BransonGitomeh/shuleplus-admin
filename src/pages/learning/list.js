import React from "react";
import Data from "../../utils/data";
// Import the real data service

// Import all the real modal components
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

// Import supporting components (assuming they exist)
import Table from "./components/table";

const Search = ({ onSearch, value, title }) => {
  return (
    <div className="kt-form kt-fork--label-right kt-margin-t-20">
      <div className="row align-items-center">
        <div className="col-sm-12 col-md-12 col-xl-12 order-2 order-xl-1">
          <div className="form-group">
            <div className="kt-input-icon kt-input-icon--left">
              <input
                type="text"
                className="form-control"
                placeholder={`Search ${title}...`}
                value={value || ''} // Use the value from state
                onChange={onSearch} // Use the handler from props
              />
              <span className="kt-input-icon__icon kt-input-icon__icon--left">
                <span>
                  <i className="la la-search" />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Access toastr from the window object
const toastr = window.toastr;

// #region --- MOCKED DATA FOR STUDENT RESPONSES (As requested) ---
const MockResponses = {
  getBySubject: (subjectId) => {
    const todayDateStr = new Date().toISOString().split('T')[0];
    const dummyResponses = [
      { id: 'resp-001', studentId: 'stud-101', studentName: 'Alice Johnson', subjectId: 'grade-1-subject-0', topicId: 'grade-1-subject-0-topic-0', subtopicId: 'grade-1-subject-0-topic-0-subtopic-0', questionId: 'grade-1-subject-0-topic-0-subtopic-0-question-0', submissionDate: '2023-10-27T09:15:00Z', type: 'text', content: 'I think the answer is 4. The formula for velocity is distance over time.' },
      { id: 'resp-002', studentId: 'stud-102', studentName: 'Bob Williams', subjectId: 'grade-1-subject-0', topicId: 'grade-1-subject-0-topic-0', subtopicId: 'grade-1-subject-0-topic-0-subtopic-0', questionId: 'grade-1-subject-0-topic-0-subtopic-0-question-1', submissionDate: '2023-10-27T10:30:00Z', type: 'image', content: 'https://via.placeholder.com/400x300.png?text=My+Diagram' },
      { id: 'resp-003', studentId: 'stud-101', studentName: 'Alice Johnson', subjectId: 'grade-1-subject-0', topicId: 'grade-1-subject-0-topic-1', subtopicId: 'grade-1-subject-0-topic-1-subtopic-0', questionId: 'grade-1-subject-0-topic-1-subtopic-0-question-0', submissionDate: '2023-10-27T11:05:00Z', type: 'video', content: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'resp-004', studentId: 'stud-103', studentName: 'Charlie Brown', subjectId: 'grade-1-subject-0', topicId: 'grade-1-subject-0-topic-0', subtopicId: 'grade-1-subject-0-topic-0-subtopic-0', questionId: 'grade-1-subject-0-topic-0-subtopic-0-question-0', submissionDate: `${todayDateStr}T14:00:00Z`, type: 'text', content: 'My answer for today is different, I got 3.14.' },
    ];
    // Ensure one response is always for "today" for the demo
    return dummyResponses.map(r => r.id === 'resp-004' ? { ...r, submissionDate: `${todayDateStr}T14:00:00Z` } : r);
  }
};
// #endregion

class BasicTable extends React.Component {
  scrollContainerRef = React.createRef();
  _gradeSubscription = null;
  _schoolSubscription = null;
  styleTag = null;

  // Create refs for all modals
  addGradeModalRef = React.createRef(); editGradeModalRef = React.createRef(); deleteGradeModalRef = React.createRef();
  addSubjectModalRef = React.createRef(); editSubjectModalRef = React.createRef(); deleteSubjectModalRef = React.createRef();
  addTopicModalRef = React.createRef(); editTopicModalRef = React.createRef(); deleteTopicModalRef = React.createRef();
  addSubtopicModalRef = React.createRef(); editSubtopicModalRef = React.createRef(); deleteSubtopicModalRef = React.createRef();
  addQuestionModalRef = React.createRef(); editQuestionModalRef = React.createRef(); deleteQuestionModalRef = React.createRef();
  addOptionModalRef = React.createRef(); editOptionModalRef = React.createRef(); deleteOptionModalRef = React.createRef();


  state = {
    // State properties...
    school: null,
    grades: [], _masterGradesList: [],
    gradeToEdit: {}, gradeToDelete: {}, selectedGrade: null, gradeSearchTerm: '',
    filteredSubjects: [], subjectToEdit: {}, subjectToDelete: {}, selectedSubject: null, subjectSearchTerm: '',
    filteredTopics: [], topicToEdit: {}, topicToDelete: {}, selectedTopic: null, topicSearchTerm: '',
    filteredSubtopics: [], subtopicToEdit: {}, subtopicToDelete: {}, selectedSubtopic: null, subtopicSearchTerm: '',
    filteredQuestions: [], questionToEdit: {}, questionToDelete: {}, selectedQuestion: null, questionSearchTerm: '',
    filteredOptions: [], optionToEdit: {}, optionToDelete: {}, selectedOption: null, optionSearchTerm: '',
    activeTab: 'content',
    subjectResponses: [],
    responsesStudyDate: new Date().toISOString().split('T')[0],
    studentsForDate: [],
    selectedStudentId: null,
  };

  // --- LIFECYCLE & STATE MANAGEMENT ---

  componentDidMount() {
    const customStyles = `
      .nav-tabs .nav-link { cursor: pointer; } .nav-tabs .nav-link.active { font-weight: bold; border-color: #dee2e6 #dee2e6 #fff; border-bottom: 2px solid #5867dd !important; color: #5867dd; } .student-timeline-item { cursor: pointer; padding: 10px; border-radius: 4px; margin-bottom: 5px; border: 1px solid #ebedf2; } .student-timeline-item.active { background-color: #f7f8fa; border-left: 3px solid #5867dd; } .response-card { border: 1px solid #ebedf2; padding: 15px; margin-bottom: 15px; border-radius: 4px; background: #fff; } .response-card-breadcrumbs { font-size: 0.8rem; color: #a7abc3; margin-bottom: 10px; } .response-card-content img, .response-card-content video { max-width: 100%; height: auto; border-radius: 4px; } .scrolling-wrapper { display: flex; flex-wrap: nowrap; overflow-x: auto; } .scrolling-wrapper > .col-md-3, .scrolling-wrapper > .col-md-9, .scrolling-wrapper > .col-md-12 { flex: 0 0 auto; }
    `;
    const styleTag = document.createElement("style"); styleTag.innerHTML = customStyles; document.head.appendChild(styleTag); this.styleTag = styleTag;
    
    // --- FIX 1: Add event listener for saving state before page unloads ---
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    this._schoolSubscription = Data.schools.subscribe(schools => {
      const selectedSchool = Data.schools.getSelected();
      this.setState({ school: selectedSchool });
    });

    this._gradeSubscription = Data.grades.subscribe(({ grades: masterTree }) => {
      const newMasterList = masterTree || [];
      const stateString = localStorage.getItem("learningState");
      const school = Data.schools.getSelected();
      
      if (stateString) {
        const savedState = JSON.parse(stateString);
        this.setState({
          _masterGradesList: newMasterList,
          school,
          ...savedState,
        }, () => {
          this.refreshCurrentSelectionsAndFilters(false);
          if (this.state.selectedSubject) {
            this.fetchAndSetResponses(this.state.selectedSubject);
          }
        });
        // --- FIX 2: Do NOT remove the item from localStorage. Let it be overwritten. ---
        // localStorage.removeItem("learningState"); 
      } else {
        this.setState({
          _masterGradesList: newMasterList,
          school,
        }, () => this.refreshCurrentSelectionsAndFilters(true));
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const persistedStateKeys = [
      'selectedGrade', 'selectedSubject', 'selectedTopic', 'selectedSubtopic', 'selectedQuestion',
      'gradeSearchTerm', 'subjectSearchTerm', 'topicSearchTerm', 'subtopicSearchTerm', 'questionSearchTerm', 'optionSearchTerm',
      'activeTab'
    ];
    const hasPersistedStateChanged = persistedStateKeys.some(key => JSON.stringify(prevState[key]) !== JSON.stringify(this.state[key]));
    if (hasPersistedStateChanged) {
      this.saveStateToLocalStorage();
    }
  }

  componentWillUnmount() {
    // if (this._gradeSubscription) this._gradeSubscription();
    // if (this._schoolSubscription) this._schoolSubscription();
    if (this.styleTag) this.styleTag.remove();
    
    // --- FIX 1 (cont.): Remove the event listener on cleanup ---
    window.removeEventListener('beforeunload', this.handleBeforeUnload);

    // --- FIX 1 (cont.): DO NOT save state here anymore. It's unreliable. ---
    // this.saveStateToLocalStorage();
  }
    
  // --- FIX 1 (cont.): This is the new, reliable save handler for page reloads. ---
  handleBeforeUnload = () => {
    this.saveStateToLocalStorage();
  }

  saveStateToLocalStorage = () => {
    const { selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion, 
      gradeSearchTerm, subjectSearchTerm, topicSearchTerm, subtopicSearchTerm, questionSearchTerm, 
      optionSearchTerm, activeTab } = this.state;
    if (selectedGrade === null) return;
    const stateToSave = {
      selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion,
      gradeSearchTerm, subjectSearchTerm, topicSearchTerm, subtopicSearchTerm, questionSearchTerm, 
      optionSearchTerm, activeTab,
    };
    try {
      localStorage.setItem("learningState", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }
  
  // --- UTILITY & FILTERING FUNCTIONS (Unchanged) ---
  _applyFilter = (list, term, key = 'name') => {
    if (!list) return [];
    const searchTerm = term.toLowerCase().trim();
    if (!searchTerm) return list;
    return list.filter(item => item && item[key] && String(item[key]).toLowerCase().includes(searchTerm));
  };
    
  _sortListByOrderArray = (list, orderArray) => {
    if (!list || !Array.isArray(list) || !orderArray || !Array.isArray(orderArray)) {
        return list || [];
    }
    const orderMap = new Map(orderArray.map((id, index) => [id, index]));
    return [...list].sort((a, b) => {
        const posA = orderMap.get(a.id) ?? Infinity;
        const posB = orderMap.get(b.id) ?? Infinity;
        return posA - posB;
    });
  }

  // --- DATA REFRESH & NAVIGATION (Unchanged) ---
  refreshCurrentSelectionsAndFilters = (doScroll = true) => {
    const {
      _masterGradesList, school,
      selectedGrade, gradeSearchTerm,
      selectedSubject, subjectSearchTerm,
      selectedTopic, topicSearchTerm,
      selectedSubtopic, subtopicSearchTerm,
      selectedQuestion, questionSearchTerm,
      optionSearchTerm
    } = this.state;

    let newState = {};

    const gradesList = this._sortListByOrderArray(_masterGradesList, school?.gradeOrder);
    newState.grades = this._applyFilter(gradesList, gradeSearchTerm, 'name');

    const currentGradeObj = selectedGrade ? _masterGradesList.find(g => g.id === selectedGrade) : null;
    if (selectedGrade && !currentGradeObj) { this.setState(this.clearSelectionsAndDataFromLevel('grade', true)); return; }
    
    const subjectsList = this._sortListByOrderArray(currentGradeObj?.subjects, currentGradeObj?.subjectsOrder);
    newState.filteredSubjects = this._applyFilter(subjectsList, subjectSearchTerm, 'name');

    const currentSubjectObj = selectedSubject ? subjectsList.find(s => s.id === selectedSubject) : null;
    if (selectedSubject && !currentSubjectObj) { this.setState(this.clearSelectionsAndDataFromLevel('subject', true)); return; }

    const topicsList = this._sortListByOrderArray(currentSubjectObj?.topics, currentSubjectObj?.topicOrder);
    newState.filteredTopics = this._applyFilter(topicsList, topicSearchTerm, 'name');

    const currentTopicObj = selectedTopic ? topicsList.find(t => t.id === selectedTopic) : null;
    if (selectedTopic && !currentTopicObj) { this.setState(this.clearSelectionsAndDataFromLevel('topic', true)); return; }

    const subtopicsList = this._sortListByOrderArray(currentTopicObj?.subtopics, currentTopicObj?.subtopicOrder);
    newState.filteredSubtopics = this._applyFilter(subtopicsList, subtopicSearchTerm, 'name');

    const currentSubtopicObj = selectedSubtopic ? subtopicsList.find(st => st.id === selectedSubtopic) : null;
    if (selectedSubtopic && !currentSubtopicObj) { this.setState(this.clearSelectionsAndDataFromLevel('subtopic', true)); return; }

    const questionsList = this._sortListByOrderArray(currentSubtopicObj?.questions, currentSubtopicObj?.questionsOrder);
    newState.filteredQuestions = this._applyFilter(questionsList, questionSearchTerm, 'name');

    const currentQuestionObj = selectedQuestion ? questionsList.find(q => q.id === selectedQuestion) : null;
    if (selectedQuestion && !currentQuestionObj) { this.setState(this.clearSelectionsAndDataFromLevel('question', true)); return; }

    const optionsList = this._sortListByOrderArray(currentQuestionObj?.options, currentQuestionObj?.optionsOrder);
    newState.filteredOptions = this._applyFilter(optionsList, optionSearchTerm, 'value');

    this.setState(newState);
  };

  clearSelectionsAndDataFromLevel = (levelName, includeSelf = false) => {
    const newState = {};
    const levels = ['grade', 'subject', 'topic', 'subtopic', 'question', 'option'];
    const startIndex = levels.indexOf(levelName);
    if (startIndex === -1) return {};
    if (startIndex <= 1) { newState.activeTab = 'content'; newState.subjectResponses = []; newState.studentsForDate = []; newState.selectedStudentId = null; }
    for (let i = startIndex; i < levels.length; i++) {
      const currentLevel = levels[i];
      if (i === startIndex && !includeSelf) continue;
      newState[`selected${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}`] = null;
      newState[`filtered${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}s`] = [];
      if (currentLevel === 'grade') {
         const gradesList = this._sortListByOrderArray(this.state._masterGradesList, this.state.school?.gradeOrder);
         newState.grades = this._applyFilter(gradesList, this.state.gradeSearchTerm, 'name');
      }
    }
    return newState;
  };
  
  // --- EVENT HANDLERS (Unchanged) ---
  onEntityCreated = (entityName) => { toastr.success(`${entityName} has been CREATED successfully!`, `Create ${entityName}`); }
  onEntityUpdated = (entityName) => { toastr.success(`${entityName} has been UPDATED successfully!`, `Edit ${entityName}`); }
  onEntityDeleted = (entityName) => { toastr.success(`${entityName} has been DELETED successfully!`, `Delete ${entityName}`); }

  onGradeSearch = e => { const term = e.target.value; this.setState({ gradeSearchTerm: term }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onSubjectSearch = e => { this.setState({ subjectSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onTopicSearch = e => { this.setState({ topicSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onSubtopicSearch = e => { this.setState({ subtopicSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onQuestionSearch = e => { this.setState({ questionSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onOptionSearch = e => { this.setState({ optionSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }

  handleGradeSelect = (grade) => { this.setState(prevState => ({ ...this.clearSelectionsAndDataFromLevel('subject', true), selectedGrade: grade.id }), () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }
  handleSubjectSelect = (subject) => { this.fetchAndSetResponses(subject.id); this.setState(prevState => ({ ...this.clearSelectionsAndDataFromLevel('topic', true), selectedSubject: subject.id, activeTab: 'content', selectedStudentId: null, }), () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }
  handleTopicSelect = (topic) => { this.setState(prevState => ({ ...this.clearSelectionsAndDataFromLevel('subtopic', true), selectedTopic: topic.id, }), () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }
  handleSubtopicSelect = (subtopic) => { this.setState(prevState => ({ ...this.clearSelectionsAndDataFromLevel('question', true), selectedSubtopic: subtopic.id, }), () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }
  handleQuestionSelect = (question) => { this.setState(prevState => ({ ...this.clearSelectionsAndDataFromLevel('option', true), selectedQuestion: question.id, }), () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(400); }); }
  fetchAndSetResponses = (subjectId) => { const responses = MockResponses.getBySubject(subjectId); this.setState({ subjectResponses: responses }, () => { this.filterStudentsByDate(this.state.responsesStudyDate); }); }
  handleTabChange = (tabName) => { this.setState({ activeTab: tabName }); }
  handleStudyDateChange = (e) => { const newDate = e.target.value; this.setState({ responsesStudyDate: newDate, selectedStudentId: null }, () => this.filterStudentsByDate(newDate)); }
  filterStudentsByDate = (dateString) => { const { subjectResponses } = this.state; if (!dateString || !subjectResponses) { this.setState({ studentsForDate: [] }); return; } const responsesOnDate = subjectResponses.filter(r => r.submissionDate.startsWith(dateString)); const studentMap = new Map(); responsesOnDate.forEach(r => { if (!studentMap.has(r.studentId)) { studentMap.set(r.studentId, { id: r.studentId, name: r.studentName }); } }); this.setState({ studentsForDate: Array.from(studentMap.values()) }); }
  handleStudentSelect = (studentId) => { this.setState({ selectedStudentId: studentId }); }
  findContentBreadcrumbs = (response) => { const { selectedGrade, _masterGradesList } = this.state; const grade = _masterGradesList.find(g => g.id === selectedGrade); if (!grade) return "Path not found"; const subject = (grade.subjects || []).find(s => s.id === response.subjectId); const topic = (subject?.topics || []).find(t => t.id === response.topicId); const subtopic = (topic?.subtopics || []).find(st => st.id === response.subtopicId); const question = (subtopic?.questions || []).find(q => q.id === response.questionId); if (question && subtopic && topic) { return `${topic.name} > ${subtopic.name} > ${question.name}`; } return "Unknown Content Location"; }
  handleCreate = async (entity, data, parentId, parentKey) => { const payload = parentId ? { ...data, [parentKey]: parentId } : data; this.onEntityCreated(entity.slice(0, -1)); return Data[entity].create(payload); }
  handleUpdate = (entity, data) => async () => { await Data[entity].update(data); this.onEntityUpdated(entity.slice(0, -1)); }
  handleDelete = (entity, item, parentId, parentKey) => async () => { const payload = parentId ? { id: item.id, [parentKey]: parentId } : { id: item.id }; await Data[entity].delete(payload); this.onEntityDeleted(entity.slice(0, -1)); }
  scrollBy = (amount) => { if (this.scrollContainerRef.current) { this.scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' }); } }
  _handleReorder = async (entityType, reorderedList) => { const { _masterGradesList, school, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion } = this.state; const findItem = (id, list) => list.find(item => item.id === id); const revertUI = () => this.refreshCurrentSelectionsAndFilters(); try { const ids = reorderedList.map(item => item.id); switch (entityType) { case 'grades': this.setState({ grades: reorderedList }); if (!school) throw new Error("School not loaded, cannot reorder grades."); const updatedSchool = { id: school.id, gradeOrder: ids }; this.handleUpdate('schools', updatedSchool)(); break; case 'subjects': this.setState({ filteredSubjects: reorderedList }); const parentGrade = findItem(selectedGrade, _masterGradesList); if (!parentGrade) throw new Error("Parent grade not found."); const updatedGrade = { id: parentGrade.id, subjectsOrder: ids }; this.handleUpdate('grades', updatedGrade)(); break; case 'topics': this.setState({ filteredTopics: reorderedList }); const gradeForTopic = findItem(selectedGrade, _masterGradesList); const parentSubject = findItem(selectedSubject, gradeForTopic?.subjects || []); if (!parentSubject) throw new Error("Parent subject not found."); const updatedSubject = { id: parentSubject.id, topicOrder: ids }; this.handleUpdate('subjects', { ...updatedSubject, grade: selectedGrade })(); break; case 'subtopics': this.setState({ filteredSubtopics: reorderedList }); const gradeForSubtopic = findItem(selectedGrade, _masterGradesList); const subjectForSubtopic = findItem(selectedSubject, gradeForSubtopic?.subjects || []); const parentTopic = findItem(selectedTopic, subjectForSubtopic?.topics || []); if (!parentTopic) throw new Error("Parent topic not found."); const updatedTopic = { id: parentTopic.id, subtopicOrder: ids }; this.handleUpdate('topics', { ...updatedTopic, subject: selectedSubject })(); break; case 'questions': this.setState({ filteredQuestions: reorderedList }); const gradeForQuestion = findItem(selectedGrade, _masterGradesList); const subjectForQuestion = findItem(selectedSubject, gradeForQuestion?.subjects || []); const topicForQuestion = findItem(selectedTopic, subjectForQuestion?.topics || []); const parentSubtopic = findItem(selectedSubtopic, topicForQuestion?.subtopics || []); if (!parentSubtopic) throw new Error("Parent subtopic not found."); const updatedSubtopic = { id: parentSubtopic.id, questionsOrder: ids }; this.handleUpdate('subtopics', { ...updatedSubtopic, topic: selectedTopic })(); break; case 'options': this.setState({ filteredOptions: reorderedList }); const gradeForOption = findItem(selectedGrade, _masterGradesList); const subjectForOption = findItem(selectedSubject, gradeForOption?.subjects || []); const topicForOption = findItem(selectedTopic, subjectForOption?.topics || []); const subtopicForOption = findItem(selectedSubtopic, topicForOption?.subtopics || []); const parentQuestion = findItem(selectedQuestion, subtopicForOption?.questions || []); if (!parentQuestion) throw new Error("Parent question not found."); const updatedQuestion = { id: parentQuestion.id, optionsOrder: ids }; this.handleUpdate('questions', { ...updatedQuestion, subtopic: selectedSubtopic })(); break; default: console.warn(`Reorder handler not implemented for: ${entityType}`); return; } } catch (error) { console.error(`Error during reorder of ${entityType}:`, error); toastr.error(`Failed to update order for ${entityType}. Reverting.`); revertUI(); } };

  // --- RENDER (Unchanged) ---

  render() {
    const {
      grades, gradeSearchTerm,
      filteredSubjects, subjectSearchTerm,
      filteredTopics, topicSearchTerm,
      filteredSubtopics, subtopicSearchTerm,
      filteredQuestions, questionSearchTerm,
      filteredOptions, optionSearchTerm,
      selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion,
      gradeToEdit, gradeToDelete, subjectToEdit, subjectToDelete, topicToEdit, topicToDelete,
      subtopicToEdit, subtopicToDelete, questionToEdit, questionToDelete, optionToEdit, optionToDelete,
      activeTab, responsesStudyDate, studentsForDate, selectedStudentId
    } = this.state;

    const selectedGradeObj = selectedGrade ? this.state._masterGradesList.find(g => g.id === selectedGrade) : null;
    
    const selectedStudentResponses = selectedStudentId
      ? this.state.subjectResponses.filter(r => r.studentId === selectedStudentId && r.submissionDate.startsWith(responsesStudyDate))
      : [];

    const tableOptions = { reorderable: true, linkable: true, editable: true, deleteable: true };

    const correctOptionIds = filteredOptions.filter(o => o.correct).map(o => o.id);
    
    return (
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head">
          <div className="kt-portlet__head-label">
            <h3 className="kt-portlet__head-title">Student Learning</h3>
          </div>
        </div>
        
        <div className="kt-portlet__body">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <button onClick={() => this.scrollBy(-400)} className="btn btn-sm btn-icon btn-light mr-2" title="Scroll Left"><i className="la la-angle-left"></i></button>
            <div ref={this.scrollContainerRef} className="scrolling-wrapper" style={{ flexGrow: 1, minHeight: "calc(70vh + 100px)" }}>
              {/* Column 1: Grades */}
              <div className="col-md-3 col-sm-12 col-xs-12" style={{ marginBottom: '1rem' }}>
                <div className="kt-portlet__head">
                  <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Grades</h3></div>
                  <div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addGradeModalRef.current.show()} title="Add Grade"><i className="la la-plus-circle"></i></button></div>
                </div>
                <div className="kt-portlet__body">
                  <Search title="grades" onSearch={this.onGradeSearch} value={gradeSearchTerm} />
                  <Table listId="grades-list" headers={[{ label: "Name", key: "name" }]} data={grades} selectedItemId={selectedGrade} show={this.handleGradeSelect} edit={grade => this.setState({ gradeToEdit: grade }, () => this.editGradeModalRef.current.show())} delete={grade => this.setState({ gradeToDelete: grade }, () => this.deleteGradeModalRef.current.show())} onOrderChange={(list) => this._handleReorder('grades', list)} options={tableOptions} />
                </div>
              </div>

              {/* Column 2: Subjects */}
              {selectedGrade && (
                <div className="col-md-3 col-sm-12 col-xs-12">
                  <div className="kt-portlet__head">
                    <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedGradeObj?.name) || '...'} Subjects</h3></div>
                    <div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addSubjectModalRef.current.show()} title="Add Subject"><i className="la la-plus-circle"></i></button></div>
                  </div>
                  <div className="kt-portlet__body">
                    <Search title="subjects" onSearch={this.onSubjectSearch} value={subjectSearchTerm} />
                    <Table listId={`subjects-list-${selectedGrade}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubjects} options={tableOptions} selectedItemId={selectedSubject} show={this.handleSubjectSelect} edit={subject => this.setState({ subjectToEdit: subject }, () => this.editSubjectModalRef.current.show())} delete={subject => this.setState({ subjectToDelete: subject }, () => this.deleteSubjectModalRef.current.show())} onOrderChange={(list) => this._handleReorder('subjects', list)} />
                  </div>
                </div>
              )}

              {/* --- NEW VISUALLY GROUPED CONTAINER FOR TABS (no inner scroll) --- */}
              {selectedSubject && (
                <div className="col-md-9" style={{ whiteSpace: 'normal' }}>
                  <div className="kt-portlet kt-portlet--tabs">
                    <div className="kt-portlet__head">
                      <div className="kt-portlet__head-toolbar">
                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-line-info" role="tablist">
                          <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'content' ? 'active' : ''}`} onClick={() => this.handleTabChange('content')} role="tab">
                              <i className="la la-list"></i> Content
                            </a>
                          </li>
                          <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'responses' ? 'active' : ''}`} onClick={() => this.handleTabChange('responses')} role="tab">
                              <i className="la la-comments"></i> Responses
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="kt-portlet__body">
                      <div className="tab-content">
                        {/* Content Tab Pane with Horizontal Columns */}
                        <div className={`tab-pane ${activeTab === 'content' ? 'active' : ''}`} role="tabpanel">
                          <div className="d-flex flex-row flex-nowrap">
                            {/* Topic Column */}
                            <div className="col-md-6 col-lg-6 col-sm-12 col-xl-4 col-xs-12">
                              <div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Strands</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addTopicModalRef.current.show()} title="Add Topic"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="strands" onSearch={this.onTopicSearch} value={topicSearchTerm} /><Table listId={`topics-list-${selectedSubject}`} headers={[{ label: "Name", key: "name" }]} data={filteredTopics} options={tableOptions} selectedItemId={selectedTopic} show={this.handleTopicSelect} edit={topic => this.setState({ topicToEdit: topic }, () => this.editTopicModalRef.current.show())} delete={topic => this.setState({ topicToDelete: topic }, () => this.deleteTopicModalRef.current.show())} onOrderChange={(list) => this._handleReorder('topics', list)} /></div></div>
                            
                            {/* Subtopic Column */}
                            {selectedTopic &&
                             <div className="col-md-6 col-lg-6 col-sm-12 col-xl-4 col-xs-12">
                              <div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Sub Strands</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addSubtopicModalRef.current.show()} title="Add Subtopic"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="subtopics" onSearch={this.onSubtopicSearch} value={subtopicSearchTerm} /><Table listId={`subtopics-list-${selectedTopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubtopics} options={tableOptions} selectedItemId={selectedSubtopic} show={this.handleSubtopicSelect} edit={subtopic => this.setState({ subtopicToEdit: subtopic }, () => this.editSubtopicModalRef.current.show())} delete={subtopic => this.setState({ subtopicToDelete: subtopic }, () => this.deleteSubtopicModalRef.current.show())} onOrderChange={(list) => this._handleReorder('subtopics', list)} /></div></div>}
                            
                            {/* Question Column */}
                            {selectedSubtopic && 
                            <div className="col-md-6 col-lg-6 col-sm-12 col-xl-6 col-xs-12">
                              <div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Content</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addQuestionModalRef.current.show()} title="Add Question"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="content" onSearch={this.onQuestionSearch} value={questionSearchTerm} />
                              <Table 
                                listId={`questions-list-${selectedSubtopic}`} 
                                headers={[{ label: "Name", key: "name" }]} 
                                data={filteredQuestions} 
                                options={tableOptions} 
                                selectedItemId={selectedQuestion} 
                                show={this.handleQuestionSelect}
                                edit={question => this.setState({ questionToEdit: question }, () => this.editQuestionModalRef.current.show())} 
                                delete={question => this.setState({ questionToDelete: question }, () => this.deleteQuestionModalRef.current.show())} 
                                onOrderChange={(list) => this._handleReorder('questions', list)} 
                              />
                            </div></div>}
                            
                            {/* Option Column */}
                            {selectedQuestion &&
                             <div className="col-md-3 col-lg-3 col-sm-12 col-xl-3 col-xs-12">
                              <div className="kt-portlet__head"><div className="kt-portlet__head-label"><div className="kt-portlet__head-title">Responses</div></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addOptionModalRef.current.show()} title="Add Option"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="answers" onSearch={this.onOptionSearch} value={optionSearchTerm} />
                              <Table 
                                listId={`options-list-${selectedQuestion}`} 
                                headers={[{ label: "Answer", key: "value" }]} 
                                data={filteredOptions} 
                                options={{ ...tableOptions, linkable: false }} 
                                edit={option => this.setState({ optionToEdit: option }, () => this.editOptionModalRef.current.show())} 
                                delete={option => this.setState({ optionToDelete: option }, () => this.deleteOptionModalRef.current.show())} 
                                onOrderChange={(list) => this._handleReorder('options', list)} 
                                correctItemIds={correctOptionIds}
                              />
                            </div></div>}
                          </div>
                        </div>
                        {/* Responses Tab Pane */}
                        <div className={`tab-pane ${activeTab === 'responses' ? 'active' : ''}`} role="tabpanel">
                          <div className="row">
                            <div className="col-md-4">
                              <h5>Filter by Study Date</h5>
                              <input type="date" className="form-control mb-4" value={responsesStudyDate} onChange={this.handleStudyDateChange} />
                              <h6>Student Submissions</h6>
                              <div className="student-timeline" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {studentsForDate.length > 0 ? studentsForDate.map(student => (
                                  <div key={student.id} className={`student-timeline-item ${selectedStudentId === student.id ? 'active' : ''}`} onClick={() => this.handleStudentSelect(student.id)}>
                                    {student.name}
                                  </div>
                                )) : <p className="text-muted">No submissions on this date.</p>}
                              </div>
                            </div>
                            <div className="col-md-8">
                              <h5>{selectedStudentId ? `${studentsForDate.find(s => s.id === selectedStudentId)?.name || ''}'s Responses` : 'Select a Student'}</h5>
                              <div className="responses-view" style={{ maxHeight: '65vh', overflowY: 'auto', background: '#f7f8fa', padding: '15px', borderRadius: '4px' }}>
                                {selectedStudentId && selectedStudentResponses.length > 0 ? selectedStudentResponses.map(response => (
                                  <div key={response.id} className="response-card">
                                    <div className="response-card-breadcrumbs"><i className="la la-folder-open"></i> {this.findContentBreadcrumbs(response)}</div>
                                    <div className="response-card-content">
                                      {response.type === 'text' && <p>{response.content}</p>}
                                      {response.type === 'image' && <img src={response.content} alt="Student submission" />}
                                      {response.type === 'video' && <video controls src={response.content} width="100%" />}
                                    </div>
                                    <div className="text-muted small mt-2 text-right">Submitted at {new Date(response.submissionDate).toLocaleTimeString()}</div>
                                  </div>
                                )) : (selectedStudentId ? <p>No responses found for this student on the selected date.</p> : <p className="text-muted">Select a date and a student to view responses.</p>)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => this.scrollBy(400)} className="btn btn-sm btn-icon btn-light ml-2" title="Scroll Right"><i className="la la-angle-right"></i></button>
          </div>
        </div>

        {/* --- All Modals --- */}
        {this.state.school && <AddGradeModal ref={this.addGradeModalRef} save={(data) => this.handleCreate('grades', { ...data, school: this.state.school.id })()} />}
        {gradeToEdit && <EditGradeModal ref={this.editGradeModalRef} grade={gradeToEdit} edit={(data) => this.handleUpdate('grades', data)()} />}
        {gradeToDelete && <DeleteGradeModal ref={this.deleteGradeModalRef} grade={gradeToDelete} delete={() => this.handleDelete('grades', gradeToDelete)()} />}
        {selectedGrade && <AddSubjectModal ref={this.addSubjectModalRef} save={(data) => this.handleCreate('subjects', data, selectedGrade, 'grade')} />}
        {subjectToEdit && <EditSubjectModal ref={this.editSubjectModalRef} subject={subjectToEdit} edit={(data) => this.handleUpdate('subjects', {...data, grade: selectedGrade})()} />}
        {subjectToDelete && <DeleteSubjectModal ref={this.deleteSubjectModalRef} subject={subjectToDelete} delete={() => this.handleDelete('subjects', subjectToDelete, selectedGrade, 'gradeId')()} />}
        {selectedSubject && <AddTopicModal ref={this.addTopicModalRef} topic={selectedTopic} save={(data) => this.handleCreate('topics', data, selectedSubject, 'subject')} />}
        {topicToEdit && <EditTopicModal ref={this.editTopicModalRef} topic={topicToEdit} edit={(data) => this.handleUpdate('topics', {...data, subject: selectedSubject})()} />}
        {topicToDelete && <DeleteTopicModal ref={this.deleteTopicModalRef} topic={topicToDelete} delete={() => this.handleDelete('topics', topicToDelete, selectedSubject, 'subject')()} />}
        {selectedTopic && <AddSubtopicModal ref={this.addSubtopicModalRef} topic={selectedTopic} save={(data) => this.handleCreate('subtopics', data, selectedTopic, 'topic')} />}
        {subtopicToEdit && <EditSubtopicModal ref={this.editSubtopicModalRef} subtopic={subtopicToEdit} edit={(data) => this.handleUpdate('subtopics', {...data, topic: selectedTopic})()} />}
        {subtopicToDelete && <DeleteSubtopicModal ref={this.deleteSubtopicModalRef} subtopic={subtopicToDelete} delete={() => this.handleDelete('subtopics', subtopicToDelete, selectedTopic, 'topic')()} />}
        {selectedSubtopic && <AddQuestionModal ref={this.addQuestionModalRef} save={(data) => this.handleCreate('questions', data, selectedSubtopic, 'subtopic')} subtopic={selectedSubtopic} filteredOptions={filteredOptions} />}
        {questionToEdit && <EditQuestionModal ref={this.editQuestionModalRef} question={questionToEdit} subtopic={selectedSubtopic} edit={(data) => this.handleUpdate('questions', {...data, subtopic: selectedSubtopic})()} />}
        {questionToDelete && <DeleteQuestionModal ref={this.deleteQuestionModalRef} question={questionToDelete} delete={() => this.handleDelete('questions', questionToDelete, selectedSubtopic, 'subtopic')()} />}
        {selectedQuestion && (<AddOptionModal ref={this.addOptionModalRef} question={selectedQuestion} save={(data) => this.handleCreate('options', data, selectedQuestion, 'question')} />)}
        {optionToEdit && <EditOptionModal ref={this.editOptionModalRef} option={optionToEdit} edit={(data) => this.handleUpdate('options', {...data, question: selectedQuestion})()} question={selectedQuestion}/>}
        {optionToDelete && <DeleteOptionModal ref={this.deleteOptionModalRef} option={optionToDelete} delete={() => this.handleDelete('options', optionToDelete, selectedQuestion, 'question')()} />}
      </div>
    );
  }
}

export default BasicTable;