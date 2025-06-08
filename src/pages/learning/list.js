import React from "react";
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

// #region --- MOCKED DATA AND SERVICES (For Standalone Demo) ---
// This section simulates your external files like `data.js`, `table.js`, etc.

// --- Dummy Child Components ---
const Table = ({ listId, data, headers, selectedItemId, show, edit, deleteItemProp, onOrderChange, options }) => (
  <div style={{ border: '1px solid #eee', padding: '10px', minHeight: '300px', maxHeight: '60vh', overflowY: 'auto' }}>
    {data.length > 0 ? data.map((item, index) => (
      <div
        key={item.id || index}
        onClick={() => show && options.linkable && show(item)}
        style={{
          padding: '8px',
          margin: '4px 0',
          cursor: options.linkable ? 'pointer' : 'default',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: selectedItemId === item.id ? '#eef2ff' : '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>{item[headers[0].key]}</span>
        {options.editable && options.deleteable && (
          <div>
            <button onClick={(e) => { e.stopPropagation(); edit(item); }} className="btn btn-sm btn-icon btn-clean"><i className="la la-edit"></i></button>
            <button onClick={(e) => { e.stopPropagation(); deleteItemProp(item); }} className="btn btn-sm btn-icon btn-clean"><i className="la la-trash"></i></button>
          </div>
        )}
      </div>
    )) : <p className="text-muted">No items to display.</p>}
  </div>
);

const Search = ({ title, onSearch, value }) => (
  <input
    type="search"
    className="form-control form-control-sm mb-3"
    placeholder={`Search ${title}...`}
    value={value}
    onChange={onSearch}
  />
);

// --- Dummy Modal Components ---
// In a real app, these would have forms and state. Here, they just provide the .show() method.
class MockModal {
  show() { alert(`${this.constructor.name} opened! (This is a mock UI)`); }
}


// --- Dummy Success Message Component ---
const SuccessMessage = class {
  show({ message, heading, type = 'success' }) {
    console.log(`[${type.toUpperCase()}] ${heading}: ${message}`);
    // In a real app, this would trigger a toast notification.
  }
};


// --- The Mock Data Service ---
const Data = (() => {
    let _grades = [
        {
            id: 'grade-1', name: 'Grade 10', subjects: [
                { id: 'grade-1-subject-0', name: 'Mathematics', topics: [
                    { id: 'grade-1-subject-0-topic-0', name: 'Algebra', subtopics: [
                        { id: 'grade-1-subject-0-topic-0-subtopic-0', name: 'Linear Equations', questions: [
                            { id: 'grade-1-subject-0-topic-0-subtopic-0-question-0', name: 'What is 2x = 8?', options: [{ id: 'q0-opt0', value: 'x=4', isCorrect: true }] },
                            { id: 'grade-1-subject-0-topic-0-subtopic-0-question-1', name: 'Solve for y: y + 5 = 10', options: [{ id: 'q1-opt0', value: 'y=5', isCorrect: true }] },
                        ]},
                    ]},
                    { id: 'grade-1-subject-0-topic-1', name: 'Geometry', subtopics: [
                       { id: 'grade-1-subject-0-topic-1-subtopic-0', name: 'Pythagorean Theorem', questions: [
                            { id: 'grade-1-subject-0-topic-1-subtopic-0-question-0', name: 'What is a² + b²?', options: [{id: 'q2-opt0', value: 'c²', isCorrect: true}]}
                       ]}
                    ]},
                ]},
                { id: 'grade-1-subject-1', name: 'Science', topics: [] },
            ]
        },
        { id: 'grade-2', name: 'Grade 11', subjects: [] }
    ];
    
    const _dummyResponses = [
        { id: 'resp-001', studentId: 'stud-101', studentName: 'Alice Johnson', subjectId: 'grade-1-subject-0', topicId: 'grade-1-subject-0-topic-0', subtopicId: 'grade-1-subject-0-topic-0-subtopic-0', questionId: 'grade-1-subject-0-topic-0-subtopic-0-question-0', submissionDate: '2023-10-27T09:15:00Z', type: 'text', content: 'I think the answer is 4. The formula for velocity is distance over time.' },
        { id: 'resp-002', studentId: 'stud-102', studentName: 'Bob Williams', subjectId: 'grade-1-subject-0', topicId: 'grade-1-subject-0-topic-0', subtopicId: 'grade-1-subject-0-topic-0-subtopic-0', questionId: 'grade-1-subject-0-topic-0-subtopic-0-question-1', submissionDate: '2023-10-27T10:30:00Z', type: 'image', content: 'https://via.placeholder.com/400x300.png?text=My+Diagram' },
        { id: 'resp-003', studentId: 'stud-101', studentName: 'Alice Johnson', subjectId: 'grade-1-subject-0', topicId: 'grade-1-subject-0-topic-1', subtopicId: 'grade-1-subject-0-topic-1-subtopic-0', questionId: 'grade-1-subject-0-topic-1-subtopic-0-question-0', submissionDate: '2023-10-27T11:05:00Z', type: 'video', content: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 'resp-004', studentId: 'stud-103', studentName: 'Charlie Brown', subjectId: 'grade-1-subject-0', topicId: 'grade-1-subject-0-topic-0', subtopicId: 'grade-1-subject-0-topic-0-subtopic-0', questionId: 'grade-1-subject-0-topic-0-subtopic-0-question-0', submissionDate: `${new Date().toISOString().split('T')[0]}T14:00:00Z`, type: 'text', content: 'My answer for today is different, I got 3.14.' },
    ];

    let _subscribers = [];

    const _notify = () => {
        _subscribers.forEach(cb => cb({ grades: _grades }));
    };

    const findParent = (gradeId, subjectId, topicId, subtopicId) => {
        const grade = _grades.find(g => g.id === gradeId);
        if (!grade) return null;
        if (!subjectId) return { parent: _grades, childList: _grades };

        const subject = grade.subjects.find(s => s.id === subjectId);
        if (!subject) return { parent: grade, childList: grade.subjects };
        if (!topicId) return { parent: grade, childList: grade.subjects };

        const topic = subject.topics.find(t => t.id === topicId);
        if (!topic) return { parent: subject, childList: subject.topics };
        if (!subtopicId) return { parent: subject, childList: subject.topics };
        
        // ... continue for other levels
        return null; // Fallback
    }

    return {
        grades: {
            list: () => JSON.parse(JSON.stringify(_grades)),
            subscribe: (callback) => {
                _subscribers.push(callback);
                // Return an unsubscribe function
                return () => { _subscribers = _subscribers.filter(cb => cb !== callback); };
            },
            create: async (grade) => {
                _grades.push({ ...grade, id: `grade-${Date.now()}`, subjects: [] });
                _notify();
            },
            update: async (updatedGrade) => {
                _grades = _grades.map(g => g.id === updatedGrade.id ? updatedGrade : g);
                _notify();
            },
            delete: async (gradeId) => {
                _grades = _grades.filter(g => g.id !== gradeId);
                _notify();
            },
        },
        subjects: {
            create: async (subject) => {
                const grade = _grades.find(g => g.id === subject.gradeId);
                if (grade) {
                    grade.subjects.push({ ...subject, id: `subject-${Date.now()}`, topics: [] });
                    _notify();
                }
            },
            // Simplified update/delete for brevity
        },
        // ... Mock other services (topics, subtopics, etc.) in a similar fashion
        topics: { create: async (d) => { /* ... */ } },
        subtopics: { create: async (d) => { /* ... */ } },
        questions: { create: async (d) => { /* ... */ }, update: async (d) => { /* ... */ } },
        options: { create: async (d) => { /* ... */ } },
        responses: {
            getBySubject: (subjectId) => {
                const todayDateStr = new Date().toISOString().split('T')[0];
                return _dummyResponses
                  .filter(r => r.subjectId === subjectId)
                  .map(r => r.id === 'resp-004' ? {...r, submissionDate: `${todayDateStr}T14:00:00Z`} : r); // ensure one response is for "today"
            }
        }
    };
})();
// #endregion

const ISuccessMessage = new SuccessMessage();

// Modal instances
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


// --- Main Component ---
class BasicTable extends React.Component {
  scrollContainerRef = React.createRef();
  _gradeSubscription = null;
  styleTag = null;

  state = {
    // --- Existing State ---
    grades: [], 
    _masterGradesList: [], 
    gradeToDelete: {}, gradeToEdit: {}, selectedGrade: null, gradeSearchTerm: '',
    filteredSubjects: [], subjectToEdit: {}, subjectToDelete: {}, selectedSubject: null, subjectSearchTerm: '',
    filteredTopics: [], topicToEdit: {}, topicToDelete: {}, selectedTopic: null, topicSearchTerm: '',
    filteredSubtopics: [], subtopicToEdit: {}, subtopicToDelete: {}, selectedSubtopic: null, subtopicSearchTerm: '',
    filteredQuestions: [], questionToEdit: {}, questionToDelete: {}, selectedQuestion: null, questionSearchTerm: '',
    filteredOptions: [], optionToEdit: {}, optionToDelete: {}, selectedOption: null, optionSearchTerm: '',

    // --- New State for Response Management ---
    activeTab: 'content', // 'content' or 'responses'
    subjectResponses: [], // All responses for the selected subject
    responsesStudyDate: new Date().toISOString().split('T')[0], // Default to today, format YYYY-MM-DD
    studentsForDate: [], // Unique students who submitted on the selected date
    selectedStudentId: null,
  };
  
  // ... (unchanged helper methods like _applyFilter, onEntityCreated...)
  _applyFilter = (list, term, key = 'name') => {
    if (!list) return [];
    const searchTerm = term.toLowerCase().trim();
    if (!searchTerm) return list;
    return list.filter(item => item && item[key] && String(item[key]).toLowerCase().includes(searchTerm));
  };
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
  onGradeSearch = e => { const term = e.target.value; this.setState({ gradeSearchTerm: term, grades: this._applyFilter(this.state._masterGradesList, term, 'name') }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onSubjectSearch = e => { this.setState({ subjectSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onTopicSearch = e => { this.setState({ topicSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onSubtopicSearch = e => { this.setState({ subtopicSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onQuestionSearch = e => { this.setState({ questionSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }
  onOptionSearch = e => { this.setState({ optionSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters(false)); }

  // --- Lifecycle Methods ---
  async componentDidMount() {
    // Add custom styles to the head
    const customStyles = `
      .nav-tabs .nav-link { cursor: pointer; }
      .nav-tabs .nav-link.active { font-weight: bold; border-color: #dee2e6 #dee2e6 #fff; border-bottom: 2px solid #5867dd !important; color: #5867dd; }
      .student-timeline-item { cursor: pointer; padding: 10px; border-radius: 4px; margin-bottom: 5px; border: 1px solid #ebedf2; }
      .student-timeline-item.active { background-color: #f7f8fa; border-left: 3px solid #5867dd; }
      .response-card { border: 1px solid #ebedf2; padding: 15px; margin-bottom: 15px; border-radius: 4px; background: #fff; }
      .response-card-breadcrumbs { font-size: 0.8rem; color: #a7abc3; margin-bottom: 10px; }
      .response-card-content img, .response-card-content video { max-width: 100%; height: auto; border-radius: 4px; }
      .scrolling-wrapper { display: flex; flex-wrap: nowrap; overflow-x: auto; }
      .scrolling-wrapper > .col-md-3, .scrolling-wrapper > .col-md-9, .scrolling-wrapper > .col-md-12 { flex: 0 0 auto; }
    `;
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customStyles;
    document.head.appendChild(styleTag);
    this.styleTag = styleTag;

    const masterGrades = Data.grades.list();
    this.setState({ _masterGradesList: masterGrades, grades: masterGrades }, async () => {
        try {
            const stateString = await localStorage.getItem("learningState");
            if (stateString) {
                const savedState = JSON.parse(stateString);
                this.setState({
                    ...savedState, // Restore all saved state
                }, () => {
                    if (this.state.selectedSubject) {
                        this.fetchAndSetResponses(this.state.selectedSubject);
                    }
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

    this._gradeSubscription = Data.grades.subscribe(({ grades: updatedMasterGradesTree }) => {
        const newMasterList = updatedMasterGradesTree || [];
        this.setState({
            _masterGradesList: newMasterList, 
            grades: this._applyFilter(newMasterList, this.state.gradeSearchTerm, 'name')
        }, () => this.refreshCurrentSelectionsAndFilters(true));
    });
  }

  componentWillUnmount() {
    if (this._gradeSubscription) this._gradeSubscription();
    if (this.styleTag) this.styleTag.remove();

    const stateToSave = {
        selectedGrade: this.state.selectedGrade,
        selectedSubject: this.state.selectedSubject,
        selectedTopic: this.state.selectedTopic,
        selectedSubtopic: this.state.selectedSubtopic,
        selectedQuestion: this.state.selectedQuestion,
        gradeSearchTerm: this.state.gradeSearchTerm,
        subjectSearchTerm: this.state.subjectSearchTerm,
        topicSearchTerm: this.state.topicSearchTerm,
        subtopicSearchTerm: this.state.subtopicSearchTerm,
        questionSearchTerm: this.state.questionSearchTerm,
        optionSearchTerm: this.state.optionSearchTerm,
        activeTab: this.state.activeTab,
    };
    try {
        localStorage.setItem("learningState", JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Failed to save state to localStorage:", error);
    }
  }

  // ... (refreshCurrentSelectionsAndFilters is unchanged)
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

    let newLocalState = {};
    const currentDisplayGrades = this._applyFilter(_masterGradesList, gradeSearchTerm, 'name');
    newLocalState.grades = currentDisplayGrades;

    const currentGradeObj = selectedGrade ? _masterGradesList.find(g => g.id === selectedGrade) : null;
    if (selectedGrade && !currentGradeObj) {
        newLocalState = { ...newLocalState, ...this.clearSelectionsAndDataFromLevel('grade', true) };
        this.setState(newLocalState);
        return;
    }
    
    const subjectsList = currentGradeObj ? (currentGradeObj.subjects || []) : [];
    newLocalState.filteredSubjects = this._applyFilter(subjectsList, subjectSearchTerm, 'name');
    
    // ... continue validation and filtering for all levels
    this.setState(newLocalState);
  };
  
  clearSelectionsAndDataFromLevel = (levelName, includeSelf = false) => {
    const newState = {};
    const levels = ['grade', 'subject', 'topic', 'subtopic', 'question', 'option'];
    const startIndex = levels.indexOf(levelName);

    if (startIndex === -1) return {};
    
    // If we are clearing 'subject' or above, clear response data
    if (startIndex <= 1) {
        newState.activeTab = 'content';
        newState.subjectResponses = [];
        newState.studentsForDate = [];
        newState.selectedStudentId = null;
    }

    for (let i = startIndex; i < levels.length; i++) {
        const currentLevel = levels[i];
        if (i === startIndex && !includeSelf) continue;
        newState[`selected${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}`] = null;
        newState[`filtered${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}s`] = [];
        if (currentLevel === 'grade') newState.grades = this._applyFilter(this.state._masterGradesList, this.state.gradeSearchTerm, 'name');
    }
    return newState;
  };

  // --- Selection Handlers ---
  handleGradeSelect = (grade) => { this.setState(prevState => ({ ...this.clearSelectionsAndDataFromLevel('subject', true), selectedGrade: grade.id, }), () => this.refreshCurrentSelectionsAndFilters()); }

  fetchAndSetResponses = (subjectId) => {
    const responses = Data.responses.getBySubject(subjectId);
    this.setState({ subjectResponses: responses }, () => {
        this.filterStudentsByDate(this.state.responsesStudyDate);
    });
  }

  handleSubjectSelect = (subject) => { 
    this.fetchAndSetResponses(subject.id);
    this.setState(prevState => ({
      ...this.clearSelectionsAndDataFromLevel('topic', true),
      selectedSubject: subject.id,
      activeTab: 'content',
      selectedStudentId: null,
    }), () => this.refreshCurrentSelectionsAndFilters());
  }

  handleTopicSelect = (topic) => { this.setState(prevState => ({...this.clearSelectionsAndDataFromLevel('subtopic', true), selectedTopic: topic.id,}), () => this.refreshCurrentSelectionsAndFilters()); }
  handleSubtopicSelect = (subtopic) => { this.setState(prevState => ({...this.clearSelectionsAndDataFromLevel('question', true), selectedSubtopic: subtopic.id,}), () => this.refreshCurrentSelectionsAndFilters()); }
  handleQuestionSelect = (question) => { this.setState(prevState => ({...this.clearSelectionsAndDataFromLevel('option', true), selectedQuestion: question.id,}), () => this.refreshCurrentSelectionsAndFilters()); }
  
  // --- NEW: Handlers for Response Tab ---
  handleTabChange = (tabName) => { this.setState({ activeTab: tabName }); }

  handleStudyDateChange = (e) => {
    const newDate = e.target.value;
    this.setState({ responsesStudyDate: newDate, selectedStudentId: null }, () => this.filterStudentsByDate(newDate));
  }

  filterStudentsByDate = (dateString) => {
    const { subjectResponses } = this.state;
    if (!dateString || !subjectResponses) {
        this.setState({ studentsForDate: [] });
        return;
    }
    const responsesOnDate = subjectResponses.filter(r => r.submissionDate.startsWith(dateString));
    const studentMap = new Map();
    responsesOnDate.forEach(r => {
        if (!studentMap.has(r.studentId)) {
            studentMap.set(r.studentId, { id: r.studentId, name: r.studentName });
        }
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

    if (question && subtopic && topic) {
        return `${topic.name} > ${subtopic.name} > ${question.name}`;
    }
    return "Unknown Content Location";
  }

  // ... (scroll methods and _handleReorder are unchanged)
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
            <div ref={this.scrollContainerRef} className="scrolling-wrapper" style={{ flexGrow: 1, minHeight: "calc(70vh + 100px)" }}>
                {/* Column 1: Grades */}
                <div className="col-md-3">
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Grades</h3></div>
                        <div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addGradeModalInstance.show()} title="Add Grade"><i className="la la-plus-circle"></i></button></div>
                    </div>
                    <div className="kt-portlet__body">
                        <Search title="grades" onSearch={this.onGradeSearch} value={gradeSearchTerm} />
                        <Table listId="grades-list" headers={[{ label: "Name", key: "name" }]} data={grades} options={tableOptions} selectedItemId={selectedGrade} show={this.handleGradeSelect} edit={grade => this.setState({ gradeToEdit: grade }, () => editGradeModalInstance.show())} deleteItemProp={grade => this.setState({ gradeToDelete: grade }, () => deleteGradeModalInstance.show())} onOrderChange={(newOrderedGrades) => this._handleReorder('grade', newOrderedGrades)} />
                    </div>
                </div>

                {/* Column 2: Subjects */}
                {selectedGrade && (
                <div className="col-md-3">
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedGradeObj?.name) || '...'} Subjects</h3></div>
                        <div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addSubjectModalInstance.show()} title="Add Subject"><i className="la la-plus-circle"></i></button></div>
                    </div>
                    <div className="kt-portlet__body">
                        <Search title="subjects" onSearch={this.onSubjectSearch} value={subjectSearchTerm} />
                        <Table listId={`subjects-list-${selectedGrade}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubjects} options={tableOptions} selectedItemId={selectedSubject} show={this.handleSubjectSelect} edit={subject => this.setState({ subjectToEdit: subject }, () => editSubjectModalInstance.show())} deleteItemProp={subject => this.setState({ subjectToDelete: subject }, () => deleteSubjectModalInstance.show())} onOrderChange={(newOrderedSubjects) => this._handleReorder('subject', newOrderedSubjects, selectedGrade)} />
                    </div>
                </div>
                )}

                {/* Columns 3+: Tabs for Content/Responses */}
                {selectedSubject && (
                    <div className="col-md-9" style={{ whiteSpace: 'normal' }}>
                        <ul className="nav nav-tabs nav-tabs-line" role="tablist">
                            <li className="nav-item"><a className={`nav-link ${activeTab === 'content' ? 'active' : ''}`} onClick={() => this.handleTabChange('content')}  role="tab">Content Management</a></li>
                            <li className="nav-item"><a className={`nav-link ${activeTab === 'responses' ? 'active' : ''}`} onClick={() => this.handleTabChange('responses')}  role="tab">Student Responses</a></li>
                        </ul>
                        <div className="tab-content mt-5">
                            <div className={`tab-pane ${activeTab === 'content' ? 'active' : ''}`} role="tabpanel">
                                <div className="d-flex flex-row flex-nowrap" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                    {/* Topic Column */}
                                    <div className="col-md-4"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedSubjectObj?.name) || '...'} Topics</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addTopicModalInstance.show()} title="Add Topic"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="topics" onSearch={this.onTopicSearch} value={topicSearchTerm} /><Table listId={`topics-list-${selectedSubject}`} headers={[{ label: "Name", key: "name" }]} data={filteredTopics} options={tableOptions} selectedItemId={selectedTopic} show={this.handleTopicSelect} edit={topic => this.setState({ topicToEdit: topic }, () => editTopicModalInstance.show())} deleteItemProp={topic => this.setState({ topicToDelete: topic }, () => deleteTopicModalInstance.show())} onOrderChange={(newOrderedTopics) => this._handleReorder('topic', newOrderedTopics, selectedGrade, selectedSubject)} /></div></div>
                                    {/* Subtopic Column */}
                                    {selectedTopic && <div className="col-md-4"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedTopicObj?.name) || '...'} Subtopics</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addSubtopicModalInstance.show()} title="Add Subtopic"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="subtopics" onSearch={this.onSubtopicSearch} value={subtopicSearchTerm}/><Table listId={`subtopics-list-${selectedTopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubtopics}  options={tableOptions} selectedItemId={selectedSubtopic} show={this.handleSubtopicSelect} edit={subtopic => this.setState({ subtopicToEdit: subtopic }, () => editSubtopicModalInstance.show())} deleteItemProp={subtopic => this.setState({ subtopicToDelete: subtopic }, () => deleteSubtopicModalInstance.show())} onOrderChange={(newOrderedSubtopics) => this._handleReorder('subtopic', newOrderedSubtopics, selectedGrade, selectedSubject, selectedTopic)} /></div></div>}
                                    {/* Question Column */}
                                    {selectedSubtopic && <div className="col-md-4"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedSubtopicObj?.name) || '...'} Content</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addQuestionModalInstance.show()} title="Add Question"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="content" onSearch={this.onQuestionSearch} value={questionSearchTerm}/><Table listId={`questions-list-${selectedSubtopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredQuestions} options={tableOptions} selectedItemId={selectedQuestion} show={this.handleQuestionSelect} edit={question => this.setState({ questionToEdit: question }, () => editQuestionModalInstance.show())} deleteItemProp={question => this.setState({ questionToDelete: question }, () => deleteQuestionModalInstance.show())} onOrderChange={(newOrderedQuestions) => this._handleReorder('question', newOrderedQuestions, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic)} /></div></div>}
                                    {/* Option Column */}
                                    {selectedQuestion && <div className="col-md-4"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><div className="kt-portlet__head-title">Responses</div></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => addOptionModalInstance.show()} title="Add Option"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="answers" onSearch={this.onOptionSearch} value={optionSearchTerm}/><Table listId={`options-list-${selectedQuestion}`} headers={[{ label: "Answer", key: "value" }]} data={filteredOptions} options={{ ...tableOptions, linkable: false }} edit={option => this.setState({ optionToEdit: option }, () => editOptionModalInstance.show())} deleteItemProp={option => this.setState({ optionToDelete: option }, () => deleteOptionModalInstance.show())} onOrderChange={(newOrderedOptions) => this._handleReorder('option', newOrderedOptions, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion)} /></div></div>}
                                </div>
                            </div>
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
            <button onClick={() => this.scrollBy(300)} className="btn btn-sm btn-icon btn-light ml-2" title="Scroll Right">
                <i className="la la-angle-right"></i>
            </button>
          </div>
        </div> 
      </div> 
    );
  }
}

export default BasicTable;