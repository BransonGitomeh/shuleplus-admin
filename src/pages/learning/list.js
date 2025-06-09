import React from "react";
import Data from "../../utils/data"; // Import the real data service

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

const Search = () => {
  return (
    <div className="kt-form kt-fork--label-right kt-margin-t-20">
      <div className="row align-items-center">
        <div className="col-sm-12 col-md-12 col-xl-12 order-2 order-xl-1">
          <div className="form-group">
            <div className="kt-input-icon kt-input-icon--left">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                onChange={(e) => Data.search(e.target.value)}
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
        return dummyResponses.map(r => r.id === 'resp-004' ? {...r, submissionDate: `${todayDateStr}T14:00:00Z`} : r);
    }
};
// #endregion

class BasicTable extends React.Component {
  scrollContainerRef = React.createRef();
  _gradeSubscription = null;
  styleTag = null;
  
  // Create refs for all modals to call their .show() method
  addGradeModalRef = React.createRef(); editGradeModalRef = React.createRef(); deleteGradeModalRef = React.createRef();
  addSubjectModalRef = React.createRef(); editSubjectModalRef = React.createRef(); deleteSubjectModalRef = React.createRef();
  addTopicModalRef = React.createRef(); editTopicModalRef = React.createRef(); deleteTopicModalRef = React.createRef();
  addSubtopicModalRef = React.createRef(); editSubtopicModalRef = React.createRef(); deleteSubtopicModalRef = React.createRef();
  addQuestionModalRef = React.createRef(); editQuestionModalRef = React.createRef(); deleteQuestionModalRef = React.createRef();
  addOptionModalRef = React.createRef(); editOptionModalRef = React.createRef(); deleteOptionModalRef = React.createRef();


  state = {
    // --- Existing State ---
    grades: [], _masterGradesList: [],
    gradeToEdit: {}, gradeToDelete: {}, selectedGrade: null, gradeSearchTerm: '',
    filteredSubjects: [], subjectToEdit: {}, subjectToDelete: {}, selectedSubject: null, subjectSearchTerm: '',
    filteredTopics: [], topicToEdit: {}, topicToDelete: {}, selectedTopic: null, topicSearchTerm: '',
    filteredSubtopics: [], subtopicToEdit: {}, subtopicToDelete: {}, selectedSubtopic: null, subtopicSearchTerm: '',
    filteredQuestions: [], questionToEdit: {}, questionToDelete: {}, selectedQuestion: null, questionSearchTerm: '',
    filteredOptions: [], optionToEdit: {}, optionToDelete: {}, selectedOption: null, optionSearchTerm: '',

    // --- New State for Response Management (using mock) ---
    activeTab: 'content',
    subjectResponses: [],
    responsesStudyDate: new Date().toISOString().split('T')[0],
    studentsForDate: [],
    selectedStudentId: null,
  };
  
  _applyFilter = (list, term, key = 'name') => {
    if (!list) return [];
    const searchTerm = term.toLowerCase().trim();
    if (!searchTerm) return list;
    return list.filter(item => item && item[key] && String(item[key]).toLowerCase().includes(searchTerm));
  };
  
  // --- Notification Handlers using Toastr ---
  onEntityCreated = (entityName) => { toastr.success(`${entityName} has been CREATED successfully!`, `Create ${entityName}`); }
  onEntityUpdated = (entityName) => { toastr.success(`${entityName} has been UPDATED successfully!`, `Edit ${entityName}`); }
  onEntityDeleted = (entityName) => { toastr.success(`${entityName} has been DELETED successfully!`, `Delete ${entityName}`); }

  // --- Search Handlers (Unchanged) ---
  onGradeSearch = e => { const term = e.target.value; this.setState({ gradeSearchTerm: term, grades: this._applyFilter(this.state._masterGradesList, term, 'name') }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onSubjectSearch = e => { this.setState({ subjectSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onTopicSearch = e => { this.setState({ topicSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onSubtopicSearch = e => { this.setState({ subtopicSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onQuestionSearch = e => { this.setState({ questionSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onOptionSearch = e => { this.setState({ optionSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }

  // --- Lifecycle Methods (Unchanged from previous refactor) ---
  async componentDidMount() {
    const customStyles = `
      .nav-tabs .nav-link { cursor: pointer; } .nav-tabs .nav-link.active { font-weight: bold; border-color: #dee2e6 #dee2e6 #fff; border-bottom: 2px solid #5867dd !important; color: #5867dd; } .student-timeline-item { cursor: pointer; padding: 10px; border-radius: 4px; margin-bottom: 5px; border: 1px solid #ebedf2; } .student-timeline-item.active { background-color: #f7f8fa; border-left: 3px solid #5867dd; } .response-card { border: 1px solid #ebedf2; padding: 15px; margin-bottom: 15px; border-radius: 4px; background: #fff; } .response-card-breadcrumbs { font-size: 0.8rem; color: #a7abc3; margin-bottom: 10px; } .response-card-content img, .response-card-content video { max-width: 100%; height: auto; border-radius: 4px; } .scrolling-wrapper { display: flex; flex-wrap: nowrap; overflow-x: auto; } .scrolling-wrapper > .col-md-3, .scrolling-wrapper > .col-md-9, .scrolling-wrapper > .col-md-12 { flex: 0 0 auto; }
    `;
    const styleTag = document.createElement("style"); styleTag.innerHTML = customStyles; document.head.appendChild(styleTag); this.styleTag = styleTag;

    this._gradeSubscription = Data.grades.subscribe(({ grades: updatedMasterGradesTree }) => {
        const newMasterList = updatedMasterGradesTree || [];
        this.setState({
            _masterGradesList: newMasterList, 
            grades: this._applyFilter(newMasterList, this.state.gradeSearchTerm, 'name')
        }, () => this.refreshCurrentSelectionsAndFilters(true));
    });

    try {
        const stateString = await localStorage.getItem("learningState");
        if (stateString) {
            const savedState = JSON.parse(stateString);
            this.setState({ ...savedState }, () => {
                if (this.state.selectedSubject) { this.fetchAndSetResponses(this.state.selectedSubject); }
                if (this.state.gradeSearchTerm) {
                    this.setState({ grades: this._applyFilter(this.state._masterGradesList, this.state.gradeSearchTerm, 'name') }, 
                        () => this.refreshCurrentSelectionsAndFilters(false));
                } else {
                    this.refreshCurrentSelectionsAndFilters(false);
                }
            });
        }
    } catch (error) {
        console.error("Failed to load state from localStorage:", error);
    }
  }

  componentWillUnmount() {
    if (this._gradeSubscription) this._gradeSubscription();
    if (this.styleTag) this.styleTag.remove();

    const stateToSave = {
        selectedGrade: this.state.selectedGrade, selectedSubject: this.state.selectedSubject, selectedTopic: this.state.selectedTopic, selectedSubtopic: this.state.selectedSubtopic, selectedQuestion: this.state.selectedQuestion,
        gradeSearchTerm: this.state.gradeSearchTerm, subjectSearchTerm: this.state.subjectSearchTerm, topicSearchTerm: this.state.topicSearchTerm, subtopicSearchTerm: this.state.subtopicSearchTerm, questionSearchTerm: this.state.questionSearchTerm, optionSearchTerm: this.state.optionSearchTerm,
        activeTab: this.state.activeTab,
    };
    try { localStorage.setItem("learningState", JSON.stringify(stateToSave)); } catch (error) { console.error("Failed to save state to localStorage:", error); }
  }

  // --- All other methods remain unchanged from the previous refactor ---
  refreshCurrentSelectionsAndFilters = (doScroll = true) => {
    const { 
        _masterGradesList,
        selectedGrade, gradeSearchTerm,
        selectedSubject, subjectSearchTerm,
        selectedTopic, topicSearchTerm,
        selectedSubtopic, subtopicSearchTerm,
        selectedQuestion, questionSearchTerm,
        optionSearchTerm
    } = this.state;

    let newState = {};
    const currentDisplayGrades = this._applyFilter(_masterGradesList, gradeSearchTerm, 'name');
    newState.grades = currentDisplayGrades;

    const currentGradeObj = selectedGrade ? _masterGradesList.find(g => g.id === selectedGrade) : null;
    if (selectedGrade && !currentGradeObj) { this.setState(this.clearSelectionsAndDataFromLevel('grade', true)); return; }
    const subjectsList = currentGradeObj ? (currentGradeObj.subjects || []) : [];
    newState.filteredSubjects = this._applyFilter(subjectsList, subjectSearchTerm, 'name');
    
    const currentSubjectObj = selectedSubject ? subjectsList.find(s => s.id === selectedSubject) : null;
     if (selectedSubject && !currentSubjectObj) { this.setState(this.clearSelectionsAndDataFromLevel('subject', true)); return; }
    const topicsList = currentSubjectObj ? (currentSubjectObj.topics || []) : [];
    newState.filteredTopics = this._applyFilter(topicsList, topicSearchTerm, 'name');

    const currentTopicObj = selectedTopic ? topicsList.find(t => t.id === selectedTopic) : null;
    if (selectedTopic && !currentTopicObj) { this.setState(this.clearSelectionsAndDataFromLevel('topic', true)); return; }
    const subtopicsList = currentTopicObj ? (currentTopicObj.subtopics || []) : [];
    newState.filteredSubtopics = this._applyFilter(subtopicsList, subtopicSearchTerm, 'name');

    const currentSubtopicObj = selectedSubtopic ? subtopicsList.find(st => st.id === selectedSubtopic) : null;
    if (selectedSubtopic && !currentSubtopicObj) { this.setState(this.clearSelectionsAndDataFromLevel('subtopic', true)); return; }
    const questionsList = currentSubtopicObj ? (currentSubtopicObj.questions || []) : [];
    newState.filteredQuestions = this._applyFilter(questionsList, questionSearchTerm, 'name');
    
    const currentQuestionObj = selectedQuestion ? questionsList.find(q => q.id === selectedQuestion) : null;
     if (selectedQuestion && !currentQuestionObj) { this.setState(this.clearSelectionsAndDataFromLevel('question', true)); return; }
    const optionsList = currentQuestionObj ? (currentQuestionObj.options || []) : [];
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
        if (currentLevel === 'grade') newState.grades = this._applyFilter(this.state._masterGradesList, this.state.gradeSearchTerm, 'name');
    }
    return newState;
  };

  handleGradeSelect = (grade) => { this.setState(prevState => ({ ...this.clearSelectionsAndDataFromLevel('subject', true), selectedGrade: grade.id, }), () => this.refreshCurrentSelectionsAndFilters()); }
  handleSubjectSelect = (subject) => { 
    this.fetchAndSetResponses(subject.id);
    this.setState(prevState => ({ ...this.clearSelectionsAndDataFromLevel('topic', true), selectedSubject: subject.id, activeTab: 'content', selectedStudentId: null, }), () => this.refreshCurrentSelectionsAndFilters());
  }
  handleTopicSelect = (topic) => { this.setState(prevState => ({...this.clearSelectionsAndDataFromLevel('subtopic', true), selectedTopic: topic.id,}), () => this.refreshCurrentSelectionsAndFilters()); }
  handleSubtopicSelect = (subtopic) => { this.setState(prevState => ({...this.clearSelectionsAndDataFromLevel('question', true), selectedSubtopic: subtopic.id,}), () => this.refreshCurrentSelectionsAndFilters()); }
  handleQuestionSelect = (question) => { this.setState(prevState => ({...this.clearSelectionsAndDataFromLevel('option', true), selectedQuestion: question.id,}), () => this.refreshCurrentSelectionsAndFilters()); }
  
  fetchAndSetResponses = (subjectId) => {
    const responses = MockResponses.getBySubject(subjectId);
    this.setState({ subjectResponses: responses }, () => { this.filterStudentsByDate(this.state.responsesStudyDate); });
  }
  handleTabChange = (tabName) => { this.setState({ activeTab: tabName }); }
  handleStudyDateChange = (e) => {
    const newDate = e.target.value;
    this.setState({ responsesStudyDate: newDate, selectedStudentId: null }, () => this.filterStudentsByDate(newDate));
  }
  filterStudentsByDate = (dateString) => {
    const { subjectResponses } = this.state;
    if (!dateString || !subjectResponses) { this.setState({ studentsForDate: [] }); return; }
    const responsesOnDate = subjectResponses.filter(r => r.submissionDate.startsWith(dateString));
    const studentMap = new Map();
    responsesOnDate.forEach(r => {
        if (!studentMap.has(r.studentId)) { studentMap.set(r.studentId, { id: r.studentId, name: r.studentName }); }
    });
    this.setState({ studentsForDate: Array.from(studentMap.values()) });
  }
  handleStudentSelect = (studentId) => { this.setState({ selectedStudentId: studentId }); }
  findContentBreadcrumbs = (response) => {
    const { selectedGrade, _masterGradesList } = this.state;
    const grade = _masterGradesList.find(g => g.id === selectedGrade);
    if (!grade) return "Path not found";
    const subject = (grade.subjects || []).find(s => s.id === response.subjectId);
    const topic = (subject?.topics || []).find(t => t.id === response.topicId);
    const subtopic = (topic?.subtopics || []).find(st => st.id === response.subtopicId);
    const question = (subtopic?.questions || []).find(q => q.id === response.questionId);
    if (question && subtopic && topic) { return `${topic.name} > ${subtopic.name} > ${question.name}`; }
    return "Unknown Content Location";
  }

  handleCreate = (entity, data, parentId, parentKey) => async () => {
    const payload = parentId ? { ...data, [parentKey]: parentId } : data;
    await Data[entity].create(payload);
    this.onEntityCreated(entity.slice(0, -1));
  }
  handleUpdate = (entity, data) => async () => {
    await Data[entity].update(data);
    this.onEntityUpdated(entity.slice(0, -1));
  }
  handleDelete = (entity, item, parentId, parentKey) => async () => {
    const payload = parentId ? { id: item.id, [parentKey]: parentId } : { id: item.id };
    await Data[entity].delete(payload);
    this.onEntityDeleted(entity.slice(0, -1));
  }

  scrollBy = (amount) => { if (this.scrollContainerRef.current) { this.scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' }); } }
  _handleReorder = () => { console.log("Reorder triggered (mocked)."); }
  
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
    const selectedSubjectObj = selectedGradeObj && selectedSubject ? (selectedGradeObj.subjects || []).find(s => s.id === selectedSubject) : null;
    const selectedTopicObj = selectedSubjectObj && selectedTopic ? (selectedSubjectObj.topics || []).find(t => t.id === selectedTopic) : null;
    const selectedSubtopicObj = selectedTopicObj && selectedSubtopic ? (selectedTopicObj.subtopics || []).find(st => st.id === selectedSubtopic) : null;
    
    const selectedStudentResponses = selectedStudentId 
        ? this.state.subjectResponses.filter(r => r.studentId === selectedStudentId && r.submissionDate.startsWith(responsesStudyDate))
        : [];
    
    const tableOptions = { reorderable: true, linkable: true, editable: true, deleteable: true };

    return (
      <div className="kt-portlet kt-portlet--mobile">
        {/* The entire JSX structure remains the same as the previous refactor. */}
        {/* I am omitting it for brevity as no lines inside the return() statement have changed. */}
        {/* The only functional change was replacing ISuccessMessage with toastr, which happened in the class methods above. */}
        <div className="kt-portlet__head">
          <div className="kt-portlet__head-label">
            <h3 className="kt-portlet__head-title">Student Learning</h3>
          </div>
        </div>
        <div className="kt-portlet__body">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <button onClick={() => this.scrollBy(-300)} className="btn btn-sm btn-icon btn-light mr-2" title="Scroll Left"><i className="la la-angle-left"></i></button>
            <div ref={this.scrollContainerRef} className="scrolling-wrapper" style={{ flexGrow: 1, minHeight: "calc(70vh + 100px)" }}>
                {/* Column 1: Grades */}
                <div className="col-md-2">
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Grades</h3></div>
                        <div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addGradeModalRef.current.show()} title="Add Grade"><i className="la la-plus-circle"></i></button></div>
                    </div>
                    <div className="kt-portlet__body">
                        <Search title="grades" onSearch={this.onGradeSearch} value={gradeSearchTerm} />
                        <Table listId="grades-list" headers={[{ label: "Name", key: "name" }]} data={grades} options={tableOptions} selectedItemId={selectedGrade} show={this.handleGradeSelect} edit={grade => this.setState({ gradeToEdit: grade }, () => this.editGradeModalRef.current.show())} deleteItemProp={grade => this.setState({ gradeToDelete: grade }, () => this.deleteGradeModalRef.current.show())} onOrderChange={() => this._handleReorder('grade')} />
                    </div>
                </div>

                {/* Column 2: Subjects */}
                {selectedGrade && (
                <div className="col-md-2">
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedGradeObj?.name) || '...'} Subjects</h3></div>
                        <div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addSubjectModalRef.current.show()} title="Add Subject"><i className="la la-plus-circle"></i></button></div>
                    </div>
                    <div className="kt-portlet__body">
                        <Search title="subjects" onSearch={this.onSubjectSearch} value={subjectSearchTerm} />
                        <Table listId={`subjects-list-${selectedGrade}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubjects} options={tableOptions} selectedItemId={selectedSubject} show={this.handleSubjectSelect} edit={subject => this.setState({ subjectToEdit: subject }, () => this.editSubjectModalRef.current.show())} deleteItemProp={subject => this.setState({ subjectToDelete: subject }, () => this.deleteSubjectModalRef.current.show())} onOrderChange={() => this._handleReorder('subject')} />
                    </div>
                </div>
                )}

                {/* Columns 3+: Tabs for Content/Responses */}
                {selectedSubject && (
                    <div className="col-md-9" style={{ whiteSpace: 'normal' }}>
                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-line-info" role="tablist">
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'content' ? 'active' : ''}`} onClick={() => this.handleTabChange('content')}  role="tab">
                                    <i className="la la-list"></i> Content
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'responses' ? 'active' : ''}`} onClick={() => this.handleTabChange('responses')}  role="tab">
                                    <i className="la la-comments"></i> Responses
                                </a>
                            </li>
                        </ul>
                        <div className="tab-content mt-5">
                            <div className={`tab-pane ${activeTab === 'content' ? 'active' : ''}`} role="tabpanel">
                                <div className="d-flex flex-row flex-nowrap" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                    {/* Topic Column */}
                                    <div className="col-md-3"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedSubjectObj?.name) || '...'} Topics</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addTopicModalRef.current.show()} title="Add Topic"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="topics" onSearch={this.onTopicSearch} value={topicSearchTerm} /><Table listId={`topics-list-${selectedSubject}`} headers={[{ label: "Name", key: "name" }]} data={filteredTopics} options={tableOptions} selectedItemId={selectedTopic} show={this.handleTopicSelect} edit={topic => this.setState({ topicToEdit: topic }, () => this.editTopicModalRef.current.show())} deleteItemProp={topic => this.setState({ topicToDelete: topic }, () => this.deleteTopicModalRef.current.show())} onOrderChange={() => this._handleReorder('topic')} /></div></div>
                                    {/* Subtopic Column */}
                                    {selectedTopic && <div className="col-md-3"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedTopicObj?.name) || '...'} Subtopics</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addSubtopicModalRef.current.show()} title="Add Subtopic"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="subtopics" onSearch={this.onSubtopicSearch} value={subtopicSearchTerm}/><Table listId={`subtopics-list-${selectedTopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubtopics}  options={tableOptions} selectedItemId={selectedSubtopic} show={this.handleSubtopicSelect} edit={subtopic => this.setState({ subtopicToEdit: subtopic }, () => this.editSubtopicModalRef.current.show())} deleteItemProp={subtopic => this.setState({ subtopicToDelete: subtopic }, () => this.deleteSubtopicModalRef.current.show())} onOrderChange={() => this._handleReorder('subtopic')} /></div></div>}
                                    {/* Question Column */}
                                    {selectedSubtopic && <div className="col-md-4"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedSubtopicObj?.name) || '...'} Content</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addQuestionModalRef.current.show()} title="Add Question"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="content" onSearch={this.onQuestionSearch} value={questionSearchTerm}/><Table listId={`questions-list-${selectedSubtopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredQuestions} options={tableOptions} selectedItemId={selectedQuestion} show={this.handleQuestionSelect} edit={question => this.setState({ questionToEdit: question }, () => this.editQuestionModalRef.current.show())} deleteItemProp={question => this.setState({ questionToDelete: question }, () => this.deleteQuestionModalRef.current.show())} onOrderChange={() => this._handleReorder('question')} /></div></div>}
                                    {/* Option Column */}
                                    {selectedQuestion && <div className="col-md-2"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><div className="kt-portlet__head-title">Responses</div></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addOptionModalRef.current.show()} title="Add Option"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="answers" onSearch={this.onOptionSearch} value={optionSearchTerm}/><Table listId={`options-list-${selectedQuestion}`} headers={[{ label: "Answer", key: "value" }]} data={filteredOptions} options={{ ...tableOptions, linkable: false }} edit={option => this.setState({ optionToEdit: option }, () => this.editOptionModalRef.current.show())} deleteItemProp={option => this.setState({ optionToDelete: option }, () => this.deleteOptionModalRef.current.show())} onOrderChange={() => this._handleReorder('option')} /></div></div>}
                                </div>
                            </div>
                            {/* Response Tab Pane (Unchanged, uses mock) */}
                            <div className={`tab-pane ${activeTab === 'responses' ? 'active' : ''}`} role="tabpanel">
                                <div className="row">
                                    <div className="col-md-3">
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
                                    <div className="col-md-6">
                                        <h5>{selectedStudentId ? `${studentsForDate.find(s => s.id === selectedStudentId)?.name || ''}'s Responses` : 'Select a Student'}</h5>
                                        <div className="responses-view" style={{ maxHeight: '65vh', overflowY: 'auto', background: '#f7f8fa', padding: '15px', borderRadius: '4px' }}>
                                            {selectedStudentId && selectedStudentResponses.length > 0 ? selectedStudentResponses.map(response => (
                                                <div key={response.id} className="response-card">
                                                    <div className="response-card-breadcrumbs"><i className="la la-folder-open"></i> {this.findContentBreadcrumbs(response)}</div>
                                                    <div className="response-card-content">
                                                        {response.type === 'text' && <p>{response.content}</p>}
                                                        {response.type === 'image' && <img src={response.content} alt="Student submission" />}
                                                        {response.type === 'video' && <video controls src={response.content} width="100%"/>}
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
                )}
            </div>
            <button onClick={() => this.scrollBy(300)} className="btn btn-sm btn-icon btn-light ml-2" title="Scroll Right"><i className="la la-angle-right"></i></button>
          </div>
        </div>

        {/* --- Render all modals here to pass them props and refs --- */}
        {/* Grades */}
        <AddGradeModal ref={this.addGradeModalRef} save={(data) => this.handleCreate('grades', data)()} />
        <EditGradeModal ref={this.editGradeModalRef} grade={gradeToEdit} save={(data) => this.handleUpdate('grades', data)()} />
        <DeleteGradeModal ref={this.deleteGradeModalRef} grade={gradeToDelete} save={() => this.handleDelete('grades', gradeToDelete)()} />
        
        {/* Subjects */}
        <AddSubjectModal ref={this.addSubjectModalRef} save={(data) => this.handleCreate('subjects', data, selectedGrade, 'grade')()} />
        <EditSubjectModal ref={this.editSubjectModalRef} subject={subjectToEdit} save={(data) => this.handleUpdate('subjects', data)()} />
        <DeleteSubjectModal ref={this.deleteSubjectModalRef} subject={subjectToDelete} save={() => this.handleDelete('subjects', subjectToDelete, selectedGrade, 'gradeId')()} />
        
        {/* Topics */}
        <AddTopicModal ref={this.addTopicModalRef} save={(data) => this.handleCreate('topics', data, selectedSubject, 'subject')()} />
        <EditTopicModal ref={this.editTopicModalRef} topic={topicToEdit} save={(data) => this.handleUpdate('topics', data)()} />
        <DeleteTopicModal ref={this.deleteTopicModalRef} topic={topicToDelete} save={() => this.handleDelete('topics', topicToDelete, selectedSubject, 'subjectId')()} />
        
        {/* Subtopics */}
        <AddSubtopicModal ref={this.addSubtopicModalRef} save={(data) => this.handleCreate('subtopics', data, selectedTopic, 'topic')()} />
        <EditSubtopicModal ref={this.editSubtopicModalRef} subtopic={subtopicToEdit} save={(data) => this.handleUpdate('subtopics', data)()} />
        <DeleteSubtopicModal ref={this.deleteSubtopicModalRef} subtopic={subtopicToDelete} save={() => this.handleDelete('subtopics', subtopicToDelete, selectedTopic, 'topicId')()} />

        {/* Questions */}
        <AddQuestionModal ref={this.addQuestionModalRef} save={(data) => this.handleCreate('questions', data, selectedSubtopic, 'subtopic')()} />
        <EditQuestionModal ref={this.editQuestionModalRef} question={questionToEdit} save={(data) => this.handleUpdate('questions', data)()} />
        <DeleteQuestionModal ref={this.deleteQuestionModalRef} question={questionToDelete} save={() => this.handleDelete('questions', questionToDelete, selectedSubtopic, 'subtopicId')()} />
        
        {/* Options */}
        <AddOptionModal ref={this.addOptionModalRef} save={(data) => this.handleCreate('options', data, selectedQuestion, 'question')()} />
        <EditOptionModal ref={this.editOptionModalRef} option={optionToEdit} save={(data) => this.handleUpdate('options', data)()} />
        <DeleteOptionModal ref={this.deleteOptionModalRef} option={optionToDelete} save={() => this.handleDelete('options', optionToDelete, selectedQuestion, 'questionId')()} />
      </div> 
    );
  }
}

export default BasicTable;