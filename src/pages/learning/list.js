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

// --- HIGH-FIDELITY SKELETON LOADER (Unchanged) ---
const SkeletonLoader = () => {
  const SkeletonColumn = ({ rows = 8, widthClass = "col-md-3" }) => (
    <div className={widthClass} style={{ flexShrink: 0 }}>
      <div className="skeleton-portlet-header">
        <div className="skeleton-placeholder skeleton-title"></div>
        <div className="skeleton-placeholder skeleton-icon-placeholder"></div>
      </div>
      <div className="skeleton-portlet-body">
        <div className="skeleton-placeholder skeleton-search"></div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div className="skeleton-placeholder skeleton-list-item" key={rowIndex}>
            <div className="skeleton-item-icon"></div>
            <div className="skeleton-item-text"></div>
            <div className="skeleton-item-actions">
              <div className="skeleton-action-icon"></div>
              <div className="skeleton-action-icon"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const skeletonStyles = `
    @keyframes skeleton-pulse {
      0% { background-color: #f7f8fa; }
      50% { background-color: #e9ecf2; }
      100% { background-color: #f7f8fa; }
    }
    .skeleton-placeholder {
      animation: skeleton-pulse 1.8s infinite ease-in-out;
      background-color: #f7f8fa;
      border-radius: 4px;
    }
    .skeleton-portlet-header { display: flex; justify-content: space-between; align-items: center; padding: 0 10px 20px 25px; }
    .skeleton-title { height: 18px; width: 55%; }
    .skeleton-icon-placeholder { height: 28px; width: 28px; border-radius: 50%; }
    .skeleton-portlet-body { padding: 0 25px; }
    .skeleton-search { height: 40px; width: 100%; margin-bottom: 25px; }
    .skeleton-list-item { height: 50px; width: 100%; margin-bottom: 15px; display: flex; align-items: center; padding: 0 15px; gap: 15px; }
    .skeleton-item-icon { height: 16px; width: 12px; flex-shrink: 0; }
    .skeleton-item-text { height: 14px; width: 70%; }
    .skeleton-item-actions { margin-left: auto; display: flex; gap: 10px; flex-shrink: 0; }
    .skeleton-action-icon { height: 16px; width: 16px; }
    .skeleton-tab-container { flex-shrink: 0; white-space: normal; padding-top: 15px; }
    .skeleton-tab-header { display: flex; margin-left: 25px; margin-bottom: 25px; }
    .skeleton-tab { height: 22px; width: 90px; margin-right: 25px; }
    .skeleton-tab.active { border-bottom: 2px solid #e9ecf2; }
    .skeleton-tab-content-wrapper { display: flex; flex-wrap: nowrap; overflow-x: hidden; gap: 30px; }
  `;

  return (
    <>
      <style>{skeletonStyles}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <button className="btn btn-sm btn-icon btn-clean btn-icon-md" disabled><i className="la la-angle-left"></i></button>
        <div className="scrolling-wrapper" style={{ flexGrow: 1, minHeight: "calc(70vh + 100px)", gap: '30px' }}>
          <SkeletonColumn rows={9} widthClass="col-md-2" />
          <SkeletonColumn rows={2} widthClass="col-md-3" />
          <div className="col-md-7 skeleton-tab-container">
            <div className="skeleton-tab-header">
              <div className="skeleton-placeholder skeleton-tab active"></div>
              <div className="skeleton-placeholder skeleton-tab"></div>
            </div>
            <div className="skeleton-tab-content-wrapper">
              <div style={{ flex: '1 1 45%' }}><SkeletonColumn rows={5} widthClass="w-100" /></div>
              <div style={{ flex: '1 1 35%' }}><SkeletonColumn rows={6} widthClass="w-100" /></div>
            </div>
          </div>
        </div>
        <button className="btn btn-sm btn-icon btn-clean btn-icon-md" disabled><i className="la la-angle-right"></i></button>
      </div>
    </>
  );
};

// Access toastr from the window object
const toastr = window.toastr;

// MOCKED DATA for student responses remains for demonstration
const MockResponses = { getBySubject: (subjectId) => { const todayDateStr = new Date().toISOString().split('T')[0]; return [{ id: 'resp-001', studentId: 'stud-101', studentName: 'Alice Johnson', subjectId, topicId: 'topic-1', subtopicId: 'subtopic-1-A', questionId: 'q-1', submissionDate: '2023-10-27T09:15:00Z', type: 'text', content: 'The formula for velocity is distance over time.' }, { id: 'resp-004', studentId: 'stud-103', studentName: 'Charlie Brown', subjectId, topicId: 'topic-1', subtopicId: 'subtopic-1-A', questionId: 'q-1', submissionDate: `${todayDateStr}T14:00:00Z`, type: 'text', content: 'My answer for today is different, I got 3.14.' },]; } };

class BasicTable extends React.Component {
  scrollContainerRef = React.createRef();
  _schoolSubscription = null;
  styleTag = null;

  // Modal Refs (Unchanged)
  addGradeModalRef = React.createRef(); editGradeModalRef = React.createRef(); deleteGradeModalRef = React.createRef();
  addSubjectModalRef = React.createRef(); editSubjectModalRef = React.createRef(); deleteSubjectModalRef = React.createRef();
  addTopicModalRef = React.createRef(); editTopicModalRef = React.createRef(); deleteTopicModalRef = React.createRef();
  addSubtopicModalRef = React.createRef(); editSubtopicModalRef = React.createRef(); deleteSubtopicModalRef = React.createRef();
  addQuestionModalRef = React.createRef(); editQuestionModalRef = React.createRef(); deleteQuestionModalRef = React.createRef();
  addOptionModalRef = React.createRef(); editOptionModalRef = React.createRef(); deleteOptionModalRef = React.createRef();


  state = {
    // Flag to control the initial skeleton loader.
    isLoading: true,
    // Holds the complete school object, our single source of truth from the data service.
    school: null,
    // Holds the complete, unsorted, and unfiltered list of grades for the school.
    _masterGradesList: [],

    // Filtered and displayed lists
    grades: [],
    filteredSubjects: [],
    filteredTopics: [],
    filteredSubtopics: [],
    filteredQuestions: [],
    filteredOptions: [],

    // Selected item IDs
    selectedGrade: null,
    selectedSubject: null,
    selectedTopic: null,
    selectedSubtopic: null,
    selectedQuestion: null,

    // Items for modals
    gradeToEdit: {}, gradeToDelete: {},
    subjectToEdit: {}, subjectToDelete: {},
    topicToEdit: {}, topicToDelete: {},
    subtopicToEdit: {}, subtopicToDelete: {},
    questionToEdit: {}, questionToDelete: {},
    optionToEdit: {}, optionToDelete: {},

    // Search terms
    gradeSearchTerm: '', subjectSearchTerm: '', topicSearchTerm: '',
    subtopicSearchTerm: '', questionSearchTerm: '', optionSearchTerm: '',

    // Tab state and mock data state
    activeTab: 'content',
    subjectResponses: [],
    responsesStudyDate: new Date().toISOString().split('T')[0],
    studentsForDate: [],
    selectedStudentId: null,
  };

  // --- LIFECYCLE & DATA HANDLING ---

  componentDidMount() {
    // Inject component-specific styles
    const customStyles = `
      .nav-tabs .nav-link { cursor: pointer; } .nav-tabs .nav-link.active { font-weight: bold; border-color: #dee2e6 #dee2e6 #fff; border-bottom: 2px solid #5867dd !important; color: #5867dd; } .student-timeline-item { cursor: pointer; padding: 10px; border-radius: 4px; margin-bottom: 5px; border: 1px solid #ebedf2; } .student-timeline-item.active { background-color: #f7f8fa; border-left: 3px solid #5867dd; } .response-card { border: 1px solid #ebedf2; padding: 15px; margin-bottom: 15px; border-radius: 4px; background: #fff; } .response-card-breadcrumbs { font-size: 0.8rem; color: #a7abc3; margin-bottom: 10px; } .response-card-content img, .response-card-content video { max-width: 100%; height: auto; border-radius: 4px; } .scrolling-wrapper { display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; } .scrolling-wrapper > .col-md-3, .scrolling-wrapper > .col-md-7, .scrolling-wrapper > .col-md-9, .scrolling-wrapper > .col-md-12 { flex: 0 0 auto; }
    `;
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customStyles;
    document.head.appendChild(styleTag);
    this.styleTag = styleTag;

    // Attach a reliable handler to save state before the page unloads
    window.addEventListener('beforeunload', this.saveStateToLocalStorage);

    // --- REVISED & CORRECTED SUBSCRIPTION LOGIC ---
    // The ONLY subscription we need. `data.js` ensures this fires on ANY relevant data change.
    this._schoolSubscription = Data.schools.subscribe(this.processDataUpdate);

    // Also run the process function with the initially available data in case it's already cached.
    const initialData = { schools: Data.schools.list() };
    this.processDataUpdate(initialData);
  }

  componentWillUnmount() {
    // Clean up subscriptions and listeners
    if (this._schoolSubscription) this._schoolSubscription();
    if (this.styleTag) this.styleTag.remove();
    window.removeEventListener('beforeunload', this.saveStateToLocalStorage);
  }

  /**
   * [REVISED] This is the single entry point for all data updates from the data service.
   * It now validates the current state against the new data on EVERY update.
   */
  processDataUpdate = ({ schools }) => {
    const activeSchool = schools.find(school => school.id === localStorage.getItem("school"));

    if (!activeSchool || !activeSchool.grades) {
      this.setState({ isLoading: true, school: activeSchool });
      return;
    }

    const masterGradesList = activeSchool.grades || [];

    // Determine the source of truth for the state we need to validate.
    // On first load, it's localStorage. On subsequent updates, it's the component's current state.
    const stateSource = this.state.isLoading ? JSON.parse(localStorage.getItem("learningState") || '{}') : this.state;

    // Validate the selections from the source against the new master list.
    const validatedState = this.getValidatedState(stateSource, masterGradesList);

    this.setState({
      ...validatedState,
      school: activeSchool,
      _masterGradesList: masterGradesList,
      isLoading: false, // Turn off skeleton loader
    }, () => {
      // After state is set, refresh all filtered lists based on the now-validated state.
      this.refreshCurrentSelectionsAndFilters();
      // If a subject is still selected after validation, fetch its response data.
      if (this.state.selectedSubject) {
        this.fetchAndSetResponses(this.state.selectedSubject);
      }
    });
  }

  /**
   * [REVISED] Validates a given state object against the master data list.
   * This prevents errors if data was deleted since the state was last set.
   */
  getValidatedState = (sourceState, masterGradesList) => {
    const validated = {
      selectedGrade: null, selectedSubject: null, selectedTopic: null,
      selectedSubtopic: null, selectedQuestion: null,
      gradeSearchTerm: sourceState.gradeSearchTerm || '',
      subjectSearchTerm: sourceState.subjectSearchTerm || '',
      topicSearchTerm: sourceState.topicSearchTerm || '',
      subtopicSearchTerm: sourceState.subtopicSearchTerm || '',
      questionSearchTerm: sourceState.questionSearchTerm || '',
      optionSearchTerm: sourceState.optionSearchTerm || '',
      activeTab: sourceState.activeTab || 'content',
    };

    try {
      if (!sourceState) return validated;

      // --- Validation Cascade ---
      const grade = masterGradesList.find(g => g.id === sourceState.selectedGrade);
      if (!grade) return validated; // If saved grade is gone, reset everything.
      validated.selectedGrade = grade.id;

      const subject = (grade.subjects || []).find(s => s.id === sourceState.selectedSubject);
      if (!subject) return validated;
      validated.selectedSubject = subject.id;

      const topic = (subject.topics || []).find(t => t.id === sourceState.selectedTopic);
      if (!topic) return validated;
      validated.selectedTopic = topic.id;

      const subtopic = (topic.subtopics || []).find(st => st.id === sourceState.selectedSubtopic);
      if (!subtopic) return validated;
      validated.selectedSubtopic = subtopic.id;

      const question = (subtopic.questions || []).find(q => q.id === sourceState.selectedQuestion);
      if (question) {
        validated.selectedQuestion = question.id;
      }

    } catch (error) {
      console.error("Failed to parse or validate state:", error);
      return validated; // Return defaults on error
    }
    return validated;
  }

  saveStateToLocalStorage = () => {
    // Only save state if we are not in the initial loading phase.
    if (this.state.isLoading || !this.state.school) {
      return;
    }
    const {
      selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion,
      gradeSearchTerm, subjectSearchTerm, topicSearchTerm, subtopicSearchTerm, questionSearchTerm,
      optionSearchTerm, activeTab
    } = this.state;

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
  };

  componentDidUpdate(prevProps, prevState) {
    // When any selection or search term changes, persist it to localStorage.
    const persistedStateKeys = [
      'selectedGrade', 'selectedSubject', 'selectedTopic', 'selectedSubtopic', 'selectedQuestion',
      'gradeSearchTerm', 'subjectSearchTerm', 'topicSearchTerm', 'subtopicSearchTerm', 'questionSearchTerm', 'optionSearchTerm',
      'activeTab'
    ];
    const hasPersistedStateChanged = persistedStateKeys.some(key => JSON.stringify(prevState[key]) !== JSON.stringify(this.state[key]));

    // We save on every meaningful state change. The beforeunload listener is a final backup.
    if (hasPersistedStateChanged) {
      this.saveStateToLocalStorage();
    }
  }

  // --- UTILITY, REFRESH, & NAVIGATION FUNCTIONS ---

  _applyFilter = (list, term, key = 'name') => {
    if (!list) return [];
    const searchTerm = term.toLowerCase().trim();
    if (!searchTerm) return list;
    return list.filter(item => item && item[key] && String(item[key]).toLowerCase().includes(searchTerm));
  };

  _sortListByOrderArray = (list, orderArray) => {
    if (!list || !Array.isArray(list)) return [];
    if (!orderArray || !Array.isArray(orderArray)) return list; // Return original if no order is specified
    const orderMap = new Map(orderArray.map((id, index) => [id, index]));
    return [...list].sort((a, b) => {
      const posA = orderMap.get(a.id) ?? Infinity;
      const posB = orderMap.get(b.id) ?? Infinity;
      return posA - posB;
    });
  }

  refreshCurrentSelectionsAndFilters = () => {
    const {
      _masterGradesList, school,
      selectedGrade, gradeSearchTerm,
      selectedSubject, subjectSearchTerm,
      selectedTopic, topicSearchTerm,
      selectedSubtopic, subtopicSearchTerm,
      selectedQuestion, questionSearchTerm,
      optionSearchTerm
    } = this.state;
    if (this.state.isLoading) return;

    let newState = {};
    const gradesList = this._sortListByOrderArray(_masterGradesList, school?.gradeOrder);
    newState.grades = this._applyFilter(gradesList, gradeSearchTerm, 'name');

    const currentGradeObj = selectedGrade ? _masterGradesList.find(g => g.id === selectedGrade) : null;
    const subjectsList = this._sortListByOrderArray(currentGradeObj?.subjects, currentGradeObj?.subjectsOrder);
    newState.filteredSubjects = this._applyFilter(subjectsList, subjectSearchTerm, 'name');

    const currentSubjectObj = selectedSubject ? (currentGradeObj?.subjects || []).find(s => s.id === selectedSubject) : null;
    const topicsList = this._sortListByOrderArray(currentSubjectObj?.topics, currentSubjectObj?.topicsOrder);
    newState.filteredTopics = this._applyFilter(topicsList, topicSearchTerm, 'name');

    const currentTopicObj = selectedTopic ? (currentSubjectObj?.topics || []).find(t => t.id === selectedTopic) : null;
    const subtopicsList = this._sortListByOrderArray(currentTopicObj?.subtopics, currentTopicObj?.subtopicOrder);
    newState.filteredSubtopics = this._applyFilter(subtopicsList, subtopicSearchTerm, 'name');

    const currentSubtopicObj = selectedSubtopic ? (currentTopicObj?.subtopics || []).find(st => st.id === selectedSubtopic) : null;
    const questionsList = this._sortListByOrderArray(currentSubtopicObj?.questions, currentSubtopicObj?.questionsOrder);
    newState.filteredQuestions = this._applyFilter(questionsList, questionSearchTerm, 'name');

    const currentQuestionObj = selectedQuestion ? (currentSubtopicObj?.questions || []).find(q => q.id === selectedQuestion) : null;
    const optionsList = this._sortListByOrderArray(currentQuestionObj?.options, currentQuestionObj?.optionsOrder);
    newState.filteredOptions = this._applyFilter(optionsList, optionSearchTerm, 'value');

    this.setState(newState);
  };

  /**
   * [FIXED] Correctly clears selections and downstream data without removing the current list.
   */
  clearSelectionsAndDataFromLevel = (levelName) => {
    const newState = {};
    const levels = ['grade', 'subject', 'topic', 'subtopic', 'question', 'option'];
    const startIndex = levels.indexOf(levelName);

    if (startIndex === -1) return {};

    // When clearing from subject level up, reset the content tab
    if (startIndex <= 1) {
      newState.activeTab = 'content';
      newState.subjectResponses = [];
      newState.studentsForDate = [];
      newState.selectedStudentId = null;
    }

    // Loop from the specified level downwards
    for (let i = startIndex; i < levels.length; i++) {
      const level = levels[i];
      const capitalizedLevel = level.charAt(0).toUpperCase() + level.slice(1);

      // 1. Nullify the selection for the current level
      newState[`selected${capitalizedLevel}`] = null;

      // 2. Clear the *FILTERED LIST* for the level BELOW the current one.
      // e.g., if we clear 'subject' (i=1), we must clear 'filteredTopics' (from levels[2]).
      const childIndex = i + 1;
      if (childIndex < levels.length) {
        const childLevel = levels[childIndex];
        const capitalizedChildLevel = childLevel.charAt(0).toUpperCase() + childLevel.slice(1);
        newState[`filtered${capitalizedChildLevel}s`] = [];
      }
    }
    return newState;
  };


  // --- UI EVENT HANDLERS ---

  onEntityCreated = (entityName) => { toastr.success(`${entityName} has been CREATED successfully!`, `Create ${entityName}`); }
  onEntityUpdated = (entityName) => { toastr.success(`${entityName} has been UPDATED successfully!`, `Edit ${entityName}`); }
  onEntityDeleted = (entityName) => { toastr.success(`${entityName} has been DELETED successfully!`, `Delete ${entityName}`); }
  onGradeSearch = e => { const term = e.target.value; this.setState({ gradeSearchTerm: term }, () => this.refreshCurrentSelectionsAndFilters()); }
  onSubjectSearch = e => { this.setState({ subjectSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters()); }
  onTopicSearch = e => { this.setState({ topicSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters()); }
  onSubtopicSearch = e => { this.setState({ subtopicSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters()); }
  onQuestionSearch = e => { this.setState({ questionSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters()); }
  onOptionSearch = e => { this.setState({ optionSearchTerm: e.target.value }, () => this.refreshCurrentSelectionsAndFilters()); }

  handleGradeSelect = (grade) => { this.setState(this.clearSelectionsAndDataFromLevel('subject'), () => { this.setState({ selectedGrade: grade.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
  handleSubjectSelect = (subject) => { this.fetchAndSetResponses(subject.id); this.setState(this.clearSelectionsAndDataFromLevel('topic'), () => { this.setState({ selectedSubject: subject.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
  handleTopicSelect = (topic) => { this.setState(this.clearSelectionsAndDataFromLevel('subtopic'), () => { this.setState({ selectedTopic: topic.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
  handleSubtopicSelect = (subtopic) => { this.setState(this.clearSelectionsAndDataFromLevel('question'), () => { this.setState({ selectedSubtopic: subtopic.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
  handleQuestionSelect = (question) => { this.setState(this.clearSelectionsAndDataFromLevel('option'), () => { this.setState({ selectedQuestion: question.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(400); }); }); };

  // Handlers for mocked data tab
  fetchAndSetResponses = (subjectId) => { const responses = MockResponses.getBySubject(subjectId); this.setState({ subjectResponses: responses }, () => { this.filterStudentsByDate(this.state.responsesStudyDate); }); }
  handleTabChange = (tabName) => { this.setState({ activeTab: tabName }); }
  handleStudyDateChange = (e) => { const newDate = e.target.value; this.setState({ responsesStudyDate: newDate, selectedStudentId: null }, () => this.filterStudentsByDate(newDate)); }
  filterStudentsByDate = (dateString) => { const { subjectResponses } = this.state; if (!dateString || !subjectResponses) { this.setState({ studentsForDate: [] }); return; } const responsesOnDate = subjectResponses.filter(r => r.submissionDate.startsWith(dateString)); const studentMap = new Map(); responsesOnDate.forEach(r => { if (!studentMap.has(r.studentId)) { studentMap.set(r.studentId, { id: r.studentId, name: r.studentName }); } }); this.setState({ studentsForDate: Array.from(studentMap.values()) }); }
  handleStudentSelect = (studentId) => { this.setState({ selectedStudentId: studentId }); }
  findContentBreadcrumbs = (response) => { const { selectedGrade, _masterGradesList } = this.state; const grade = _masterGradesList.find(g => g.id === selectedGrade); if (!grade) return "Path not found"; const subject = (grade.subjects || []).find(s => s.id === response.subjectId); const topic = (subject?.topics || []).find(t => t.id === 'topic-1'); /* MOCK */ const subtopic = (topic?.subtopics || []).find(st => st.id === 'subtopic-1-A'); /* MOCK */ const question = (subtopic?.questions || []).find(q => q.id === 'q-1'); /* MOCK */ if (topic && subtopic && question) { return `${topic.name} > ${subtopic.name} > ${question.name}`; } return "Unknown Mock Location"; }

  // --- [REFACTORED] Data Mutation Handlers ---

  handleCreate = async (entity, data, parentId, parentKey) => {
    try {
      const payload = parentId ? { ...data, [parentKey]: parentId } : data;
      const createResponse = await Data[entity].create(payload);
      this.onEntityCreated(entity.slice(0, -1));
      this.refreshCurrentSelectionsAndFilters();
      return createResponse;
    }
    catch (err) {
      console.error(err);
      toastr.error(`Failed to create ${entity.slice(0, -1)}`);
    }
  };

  /**
   * [REFACTORED] A generic, simplified update handler.
   * The caller in the render method is responsible for building the correct payload.
   */
  handleUpdate = async (entity, payload) => {
    try {
      await Data[entity].update(payload);
      this.onEntityUpdated(entity.slice(0, -1));
    } catch (err) {
      console.error(`Failed to update ${entity.slice(0, -1)}:`, err);
      toastr.error(`Failed to update ${entity.slice(0, -1)}`);
    }
  };

  /**
   * [SIMPLIFIED] The delete handler now provides immediate feedback by clearing downstream state correctly.
   * The subsequent subscription update from the data service will handle refreshing the list itself.
   */
  handleDelete = (entity, item, parentId, parentKey) => async () => {
    try {
      const payload = parentId ? { id: item.id, [parentKey]: parentId } : { id: item.id };
      await Data[entity].delete(payload);
      this.onEntityDeleted(entity.slice(0, -1));

      // If the deleted item was the currently selected one, clear the selections to prevent a broken UI state.
      const singularEntity = entity.slice(0, -1);
      const capitalizedEntity = singularEntity.charAt(0).toUpperCase() + singularEntity.slice(1);
      if (this.state[`selected${capitalizedEntity}`] === item.id) {
        const clearedState = this.clearSelectionsAndDataFromLevel(singularEntity);
        this.setState(clearedState, this.refreshCurrentSelectionsAndFilters);
      }
    } catch (err) {
      console.error(err);
      toastr.error(`Failed to delete ${entity.slice(0, -1)}`);
    }
  };

  scrollBy = (amount) => { if (this.scrollContainerRef.current) { this.scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' }); } }

  /**
   * [REFACTORED & FIXED] Handles reordering of items within a list.
   * It now correctly identifies the parent entity to update and sends the correct payload.
   */
  _handleReorder = async (entityType, reorderedList) => {
    const { school, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion } = this.state;
    const originalStateUpdater = () => this.refreshCurrentSelectionsAndFilters();

    try {
      const ids = reorderedList.map(item => item.id);
      let entityToUpdate;
      let payload;

      switch (entityType) {
        case 'grades':
          this.setState({ grades: reorderedList }); // Optimistic UI update
          entityToUpdate = 'schools';
          payload = { id: school.id, gradeOrder: ids };
          break;
        case 'subjects':
          this.setState({ filteredSubjects: reorderedList });
          entityToUpdate = 'grades';
          payload = { id: selectedGrade, subjectsOrder: ids };
          break;
        case 'topics':
          this.setState({ filteredTopics: reorderedList });
          entityToUpdate = 'subjects';
          payload = { id: selectedSubject, topicsOrder: ids, grade: selectedGrade };
          break;
        case 'subtopics':
          this.setState({ filteredSubtopics: reorderedList });
          entityToUpdate = 'topics';
          payload = { id: selectedTopic, subtopicOrder: ids, subject: selectedSubject };
          break;
        case 'questions':
          this.setState({ filteredQuestions: reorderedList });
          entityToUpdate = 'subtopics';
          payload = { id: selectedSubtopic, questionsOrder: ids, topic: selectedTopic };
          break;
        case 'options':
          this.setState({ filteredOptions: reorderedList });
          entityToUpdate = 'questions';
          payload = { id: selectedQuestion, optionsOrder: ids, subtopic: selectedSubtopic };
          break;
        default:
          throw new Error(`Reorder not implemented for: ${entityType}`);
      }

      await this.handleUpdate(entityToUpdate, payload);

    } catch (error) {
      console.error(`Error during reorder of ${entityType}:`, error);
      toastr.error(`Failed to update order for ${entityType}. Reverting.`);
      originalStateUpdater(); // Revert on failure
    }
  };


  render() {
    const {
      isLoading,
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

    if (isLoading && (!this.state.school || !this.state.grades || !this.state.grades.length)) { // Only show full skeleton on very first load
      return (
        <div className="kt-portlet kt-portlet--mobile">
          <div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Student Learning</h3></div></div>
          <div className="kt-portlet__body"><SkeletonLoader /></div>
        </div>
      )
    }

    // --- [NEW] Derive full objects from state IDs for safe rendering ---
    const selectedGradeObj = selectedGrade ? this.state._masterGradesList.find(g => g.id === selectedGrade) : null;
    const selectedSubjectObj = selectedGradeObj ? (selectedGradeObj.subjects || []).find(s => s.id === selectedSubject) : null;
    const selectedTopicObj = selectedSubjectObj ? (selectedSubjectObj.topics || []).find(t => t.id === selectedTopic) : null;
    const selectedSubtopicObj = selectedTopicObj ? (selectedTopicObj.subtopics || []).find(st => st.id === selectedSubtopic) : null;

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

              {/* Tabbed Container for remaining columns */}
              {selectedSubject && (
                <div className="col-md-7" style={{ whiteSpace: 'normal' }}>
                  <div className="kt-portlet kt-portlet--tabs">
                    <div className="kt-portlet__head">
                      <div className="kt-portlet__head-toolbar">
                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-line-info" role="tablist">
                          <li className="nav-item"> <a className={`nav-link ${activeTab === 'content' ? 'active' : ''}`} onClick={() => this.handleTabChange('content')} role="tab"> <i className="la la-list"></i> Content </a> </li>
                          <li className="nav-item"> <a className={`nav-link ${activeTab === 'responses' ? 'active' : ''}`} onClick={() => this.handleTabChange('responses')} role="tab"> <i className="la la-comments"></i> Responses </a> </li>
                        </ul>
                      </div>
                    </div>
                    <div className="kt-portlet__body">
                      <div className="tab-content">
                        {/* Content Tab with scrolling inner columns */}
                        <div className={`tab-pane ${activeTab === 'content' ? 'active' : ''}`} role="tabpanel">
                          <div className="d-flex flex-row flex-nowrap">
                            {/* All subsequent columns go here */}
                            <div className="col-md-6 col-lg-6 col-sm-12 col-xl-6 col-xs-12"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Strands</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addTopicModalRef.current.show()} title="Add Topic"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="topics" onSearch={this.onTopicSearch} value={topicSearchTerm} /><Table listId={`topics-list-${selectedSubject}`} headers={[{ label: "Name", key: "name" }]} data={filteredTopics} options={tableOptions} selectedItemId={selectedTopic} show={this.handleTopicSelect} edit={topic => this.setState({ topicToEdit: topic }, () => this.editTopicModalRef.current.show())} delete={topic => this.setState({ topicToDelete: topic }, () => this.deleteTopicModalRef.current.show())} onOrderChange={(list) => this._handleReorder('topics', list)} /></div></div>
                            {selectedTopic && <div className="col-md-6 col-lg-6 col-sm-12 col-xl-6 col-xs-12"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Sub Strands</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addSubtopicModalRef.current.show()} title="Add Subtopic"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="subtopics" onSearch={this.onSubtopicSearch} value={subtopicSearchTerm} /><Table listId={`subtopics-list-${selectedTopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubtopics} options={tableOptions} selectedItemId={selectedSubtopic} show={this.handleSubtopicSelect} edit={subtopic => this.setState({ subtopicToEdit: subtopic }, () => this.editSubtopicModalRef.current.show())} delete={subtopic => this.setState({ subtopicToDelete: subtopic }, () => this.deleteSubtopicModalRef.current.show())} onOrderChange={(list) => this._handleReorder('subtopics', list)} /></div></div>}
                            {selectedSubtopic && <div className="col-md-9 col-lg-9 col-sm-12 col-xl-6 col-xs-12"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Questions</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addQuestionModalRef.current.show()} title="Add Question"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="questions" onSearch={this.onQuestionSearch} value={questionSearchTerm} /><Table listId={`questions-list-${selectedSubtopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredQuestions} options={tableOptions} selectedItemId={selectedQuestion} show={this.handleQuestionSelect} edit={question => this.setState({ questionToEdit: question }, () => this.editQuestionModalRef.current.show())} delete={question => this.setState({ questionToDelete: question }, () => this.deleteQuestionModalRef.current.show())} onOrderChange={(list) => this._handleReorder('questions', list)} /></div></div>}
                            {selectedQuestion && <div className="col-md-6 col-lg-6 col-sm-12 col-xl-6 col-xs-12"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><div className="kt-portlet__head-title">Options</div></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addOptionModalRef.current.show()} title="Add Option"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="options" onSearch={this.onOptionSearch} value={optionSearchTerm} /><Table listId={`options-list-${selectedQuestion}`} headers={[{ label: "Answer", key: "value" }]} data={filteredOptions} options={{ ...tableOptions, linkable: false }} edit={option => this.setState({ optionToEdit: option }, () => this.editOptionModalRef.current.show())} delete={option => this.setState({ optionToDelete: option }, () => this.deleteOptionModalRef.current.show())} onOrderChange={(list) => this._handleReorder('options', list)} correctItemIds={correctOptionIds} /></div></div>}
                          </div>
                        </div>
                        {/* Responses Tab Pane */}
                        <div className={`tab-pane ${activeTab === 'responses' ? 'active' : ''}`} role="tabpanel">
                          <div className="row">
                            <div className="col-md-4"><h5 className="mb-3">Filter by Date</h5><input type="date" className="form-control mb-4" value={responsesStudyDate} onChange={this.handleStudyDateChange} /><h6>Student Submissions</h6><div className="student-timeline" style={{ maxHeight: '60vh', overflowY: 'auto' }}>{studentsForDate.length > 0 ? studentsForDate.map(student => (<div key={student.id} className={`student-timeline-item ${selectedStudentId === student.id ? 'active' : ''}`} onClick={() => this.handleStudentSelect(student.id)}> {student.name} </div>)) : <p className="text-muted">No submissions on this date.</p>}</div></div>
                            <div className="col-md-8"><h6>{selectedStudentId ? `${studentsForDate.find(s => s.id === selectedStudentId)?.name || ''}'s Responses` : 'Select a Student'}</h6><div className="responses-view" style={{ maxHeight: '65vh', overflowY: 'auto', background: '#f7f8fa', padding: '15px', borderRadius: '4px' }}>{selectedStudentId && selectedStudentResponses.length > 0 ? selectedStudentResponses.map(response => (<div key={response.id} className="response-card"> <div className="response-card-breadcrumbs"><i className="la la-folder-open"></i> {this.findContentBreadcrumbs(response)}</div> <div className="response-card-content"> {response.type === 'text' && <p>{response.content}</p>} {response.type === 'image' && <img src={response.content} alt="Student submission" />} {response.type === 'video' && <video controls src={response.content} width="100%" />} </div> <div className="text-muted small mt-2 text-right">Submitted at {new Date(response.submissionDate).toLocaleTimeString()}</div> </div>)) : (selectedStudentId ? <p>No responses found for this student on the selected date.</p> : <p className="text-muted">Select a date and a student to view responses.</p>)}</div></div>
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

        {/* --- [REFACTORED] All Modals with corrected props and handlers --- */}
        {this.state.school && <AddGradeModal ref={this.addGradeModalRef} save={(data) => this.handleCreate('grades', { ...data, school: this.state.school.id })} />}
        {gradeToEdit.id && <EditGradeModal ref={this.editGradeModalRef} grade={gradeToEdit} edit={(data) => this.handleUpdate('grades', { ...data, id: gradeToEdit.id })} />}
        {gradeToDelete.id && <DeleteGradeModal ref={this.deleteGradeModalRef} grade={gradeToDelete} delete={this.handleDelete('grades', gradeToDelete)} />}

        {selectedGrade && <AddSubjectModal ref={this.addSubjectModalRef} save={(data) => this.handleCreate('subjects', data, selectedGrade, 'grade')} />}
        {selectedSubject && <EditSubjectModal ref={this.editSubjectModalRef} subject={subjectToEdit} edit={(data) => this.handleUpdate('subjects', { ...data, id: subjectToEdit.id, grade: selectedGrade })} />}
        {selectedSubject && <DeleteSubjectModal ref={this.deleteSubjectModalRef} subject={subjectToDelete} delete={this.handleDelete('subjects', subjectToDelete, selectedGrade, 'grade')} />}

        {selectedSubject && <AddTopicModal ref={this.addTopicModalRef} save={(data) => this.handleCreate('topics', data, selectedSubject, 'subject')} />}
        {selectedSubject && <EditTopicModal ref={this.editTopicModalRef} topic={topicToEdit} edit={(data) => this.handleUpdate('topics', { ...data, id: topicToEdit.id, subject: selectedSubject })} />}
        {selectedSubject && <DeleteTopicModal ref={this.deleteTopicModalRef} topic={topicToDelete} delete={this.handleDelete('topics', topicToDelete, selectedSubject, 'subject')} />}

        {selectedTopic && <AddSubtopicModal ref={this.addSubtopicModalRef} save={(data) => this.handleCreate('subtopics', data, selectedTopic, 'topic')} />}
        {selectedTopic && <EditSubtopicModal ref={this.editSubtopicModalRef} subtopic={subtopicToEdit} topic={selectedTopicObj} subject={selectedSubjectObj} grade={selectedGradeObj} grades={this.state._masterGradesList} edit={(data) => this.handleUpdate('subtopics', { ...data, id: subtopicToEdit.id, topic: selectedTopic })} />}
        {selectedTopic && <DeleteSubtopicModal ref={this.deleteSubtopicModalRef} subtopic={subtopicToDelete} delete={this.handleDelete('subtopics', subtopicToDelete, selectedTopic, 'topic')} />}

        {<AddQuestionModal subtopicId={selectedSubtopic} ref={this.addQuestionModalRef} save={(data) => this.handleCreate('questions', data, selectedSubtopic, 'subtopic')} />}
        {
          // --- And add the `onClose` prop like this ---
          <EditQuestionModal
            ref={this.editQuestionModalRef}
            question={questionToEdit}
            subtopic={selectedSubtopic}
            edit={(data) => this.handleUpdate('questions', { ...data, id: questionToEdit.id, subtopic: selectedSubtopic })}
            onClose={() => this.setState({ questionToEdit: {} })}
          />}
        {<DeleteQuestionModal ref={this.deleteQuestionModalRef} question={questionToDelete} subtopic={selectedSubtopic} delete={this.handleDelete('questions', questionToDelete, selectedSubtopicObj, 'subtopic')} />}

        {<AddOptionModal ref={this.addOptionModalRef} question={selectedQuestion} save={(data) => this.handleCreate('options', data, selectedQuestion, 'question')} />}
        {<EditOptionModal ref={this.editOptionModalRef} question={selectedQuestion} option={optionToEdit} edit={(data) => this.handleUpdate('options', { ...data, id: optionToEdit.id, question: selectedQuestion })} />}
        {<DeleteOptionModal ref={this.deleteOptionModalRef} question={selectedQuestion} option={optionToDelete} delete={this.handleDelete('options', optionToDelete, selectedQuestion, 'question')} />}
      </div>
    );
  }
}

export default BasicTable;