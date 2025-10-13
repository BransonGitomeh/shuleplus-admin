import React from "react";
import Data from "../../utils/data";
import moment from "moment"; // Moment.js for "time ago" functionality

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

// Import the rich-media Table component
import Table from "./components/table";

// --- Helper Components ---
const Search = ({ onSearch, value, title }) => (
    <div className="cm-search-wrapper">
        <i className="la la-search search-icon"></i>
        <input type="text" className="form-control cm-search-input" placeholder={`Search ${title}...`} value={value || ''} onChange={onSearch} />
    </div>
);

const SkeletonLoader = () => {
    // Skeleton loader remains the same, no changes needed here.
    const SkeletonColumn = ({ rows = 8, widthClass = "col-md-3" }) => ( <div className={widthClass} style={{ flexShrink: 0 }}> <div className="skeleton-portlet-header"> <div className="skeleton-placeholder skeleton-title"></div> <div className="skeleton-placeholder skeleton-icon-placeholder"></div> </div> <div className="skeleton-portlet-body"> <div className="skeleton-placeholder skeleton-search"></div> {Array.from({ length: rows }).map((_, rowIndex) => ( <div className="skeleton-placeholder skeleton-list-item" key={rowIndex}> <div className="skeleton-item-icon"></div> <div className="skeleton-item-text"></div> <div className="skeleton-item-actions"> <div className="skeleton-action-icon"></div> <div className="skeleton-action-icon"></div> </div> </div> ))} </div> </div> );
    const skeletonStyles = ` @keyframes skeleton-pulse { 0% { background-color: #f7f8fa; } 50% { background-color: #e9ecf2; } 100% { background-color: #f7f8fa; } } .skeleton-placeholder { animation: skeleton-pulse 1.8s infinite ease-in-out; background-color: #f7f8fa; border-radius: 4px; } .skeleton-portlet-header { display: flex; justify-content: space-between; align-items: center; padding: 0 10px 20px 25px; } .skeleton-title { height: 18px; width: 55%; } .skeleton-icon-placeholder { height: 28px; width: 28px; border-radius: 50%; } .skeleton-portlet-body { padding: 0 25px; } .skeleton-search { height: 40px; width: 100%; margin-bottom: 25px; } .skeleton-list-item { height: 50px; width: 100%; margin-bottom: 15px; display: flex; align-items: center; padding: 0 15px; gap: 15px; } .skeleton-item-icon { height: 16px; width: 12px; flex-shrink: 0; } .skeleton-item-text { height: 14px; width: 70%; } .skeleton-item-actions { margin-left: auto; display: flex; gap: 10px; flex-shrink: 0; } .skeleton-action-icon { height: 16px; width: 16px; } .skeleton-tab-container { flex-shrink: 0; white-space: normal; padding-top: 15px; } .skeleton-tab-header { display: flex; margin-left: 25px; margin-bottom: 25px; } .skeleton-tab { height: 22px; width: 90px; margin-right: 25px; } .skeleton-tab.active { border-bottom: 2px solid #e9ecf2; } .skeleton-tab-content-wrapper { display: flex; flex-wrap: nowrap; overflow-x: hidden; gap: 30px; } `;
    return ( <><style>{skeletonStyles}</style><div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem' }}><button className="btn btn-sm btn-icon btn-clean btn-icon-md" disabled><i className="la la-angle-left"></i></button><div className="scrolling-wrapper" style={{ flexGrow: 1, minHeight: "calc(70vh + 100px)", gap: '30px' }}><SkeletonColumn rows={9} widthClass="col-md-2" /><SkeletonColumn rows={2} widthClass="col-md-3" /><div className="col-md-7 skeleton-tab-container"><div className="skeleton-tab-header"><div className="skeleton-placeholder skeleton-tab active"></div><div className="skeleton-placeholder skeleton-tab"></div></div><div className="skeleton-tab-content-wrapper"><div style={{ flex: '1 1 45%' }}><SkeletonColumn rows={5} widthClass="w-100" /></div><div style={{ flex: '1 1 35%' }}><SkeletonColumn rows={6} widthClass="w-100" /></div></div></div></div><button className="btn btn-sm btn-icon btn-clean btn-icon-md" disabled><i className="la la-angle-right"></i></button></div></> );
};

const toastr = window.toastr;

class CurriculumManagerV5 extends React.Component {
    scrollContainerRef = React.createRef();
    _schoolSubscription = null;
    _attemptsSubscription = null; 
    styleTag = null;

    // --- Refs for Modals ---
    addGradeModalRef = React.createRef(); editGradeModalRef = React.createRef(); deleteGradeModalRef = React.createRef();
    addSubjectModalRef = React.createRef(); editSubjectModalRef = React.createRef(); deleteSubjectModalRef = React.createRef();
    addTopicModalRef = React.createRef(); editTopicModalRef = React.createRef(); deleteTopicModalRef = React.createRef();
    addSubtopicModalRef = React.createRef(); editSubtopicModalRef = React.createRef(); deleteSubtopicModalRef = React.createRef();
    addQuestionModalRef = React.createRef(); editQuestionModalRef = React.createRef(); deleteQuestionModalRef = React.createRef();
    addOptionModalRef = React.createRef(); editOptionModalRef = React.createRef(); deleteOptionModalRef = React.createRef();

    state = {
        isLoading: true, school: null, _masterGradesList: [], grades: [],
        filteredSubjects: [], filteredTopics: [], filteredSubtopics: [], filteredQuestions: [], filteredOptions: [],
        selectedGrade: null, selectedSubject: null, selectedTopic: null, selectedSubtopic: null, selectedQuestion: null,
        gradeToEdit: {}, gradeToDelete: {}, subjectToEdit: {}, subjectToDelete: {}, topicToEdit: {}, topicToDelete: {},
        subtopicToEdit: {}, subtopicToDelete: {}, questionToEdit: {}, questionToDelete: {}, optionToEdit: {}, optionToDelete: {},
        gradeSearchTerm: '', subjectSearchTerm: '', topicSearchTerm: '', subtopicSearchTerm: '', questionSearchTerm: '', optionSearchTerm: '',
        activeTab: 'content', allLessonAttempts: [], subjectLessonAttempts: [], usersWithAttempts: [],
        selectedUserId: null, selectedAttemptId: null,
    };

    componentDidMount() {
        const customStyles = `
            :root { --cm-primary-color: #5867dd; --cm-primary-bg-light: #f0f3ff; --cm-border-color: #e2e8f0; --cm-text-main: #1e293b; --cm-text-secondary: #64748b; --cm-bg-main: #f7f8fa; --cm-danger-color: #ef4444; }
            
            .cm-container {
                background-color: var(--cm-bg-main);
                padding: 1.5rem;
                width: 100vw;
                margin-left: calc(50% - 50vw);
                box-sizing: border-box;
            }

            .cm-header-main { margin-bottom: 1rem; }
            .cm-header-main h3 { font-weight: 600; font-size: 1.5rem; color: var(--cm-text-main); }
            .scrolling-wrapper { display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; gap: 1.5rem; padding-bottom: 1rem; width:100% }
            .scrolling-wrapper::-webkit-scrollbar { height: 8px; }
            .scrolling-wrapper::-webkit-scrollbar-track { background: #e2e8f0; }
            .scrolling-wrapper::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
            .cm-column { flex: 0 0 24%; min-width: 300px; background: #fff; border: 1px solid var(--cm-border-color); border-radius: 8px; display: flex; flex-direction: column; }
            .cm-column.cm-column-large { flex: 0 0 65%; min-width: 700px; } /* Wider column for tabs */
            .cm-column-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; }
            .cm-column-header h5 { margin: 0; font-size: 1rem; font-weight: 600; color: #334155; }
            .cm-add-btn { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 5px; }
            .cm-add-btn:hover { color: var(--cm-primary-color); }
            .cm-add-btn i { font-size: 1.2rem; }
            .cm-column-body { padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; }
            .cm-search-wrapper { position: relative; margin-bottom: 1rem; }
            .cm-search-input { padding-left: 2.2rem; border-radius: 6px; }
            .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
            .cm-tab-header { display: flex; gap: 1.5rem; padding: 0 1.25rem; border-bottom: 1px solid var(--cm-border-color); }
            .cm-tab-btn { background: none; border: none; padding: 1rem 0.25rem; cursor: pointer; color: var(--cm-text-secondary); font-weight: 600; position: relative; font-size: 0.9rem; }
            .cm-tab-btn.active { color: var(--cm-primary-color); }
            .cm-tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background-color: var(--cm-primary-color); }
            .tab-pane { display: none; }
            .tab-pane.active { display: block; }
            .tab-inner-scroller { display: flex; flex-wrap: nowrap; gap: 1.5rem; }
            .draggable-generic-list-item.selected { border-color: var(--cm-primary-color) !important; background-color: var(--cm-primary-bg-light) !important; box-shadow: 0 0 0 1px var(--cm-primary-color); }
            
            /* Student Attempts Tab Styles */
            .attempts-grid { display: grid; grid-template-columns: 2fr 3fr 7fr; gap: 1.5rem; }
            .attempts-column .list-group { border: none; padding: 0; max-height: 70vh; overflow-y: auto; }
            .attempts-column .list-group-item { border: 1px solid transparent; border-radius: 6px; margin-bottom: 5px; transition: all 0.2s ease; }
            .attempts-column .list-group-item:hover { background-color: #f8fafc; border-color: #f1f5f9; }
            .attempts-column .list-group-item.active { background-color: var(--cm-primary-bg-light); border-color: var(--cm-primary-color); color: var(--cm-text-main); }
            .attempts-column h6 { font-weight: 600; margin-bottom: 1rem; padding: 0 0.5rem; }
            .user-list-item.active { border-left: 3px solid var(--cm-primary-color); background-color: #f7f8fa; font-weight: 600; }
            .student-sub-item { padding-left: 1.75rem; font-size: 0.85rem; color: #475569; position: relative; }
            .student-sub-item::before { content: '└'; position: absolute; left: 0.75rem; top: 0.5rem; }
            
            .attempt-list-item-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
            .attempt-list-item-header { font-weight: 500; }
            .attempt-list-item-meta { font-size: 0.75rem; color: var(--cm-text-secondary); }
            .attempt-score-badge { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; color: #fff; }
            .attempt-score-badge.low-score { background-color: #fb7185; } /* Rose 400 */
            .attempt-score-badge.high-score { background-color: #4ade80; } /* Green 400 */
            .btn-delete-attempt { opacity: 0; transition: opacity 0.2s; padding: 4px; color: var(--cm-text-secondary); }
            .list-group-item:hover .btn-delete-attempt { opacity: 1; }
            .btn-delete-attempt:hover { color: var(--cm-danger-color); }

            .attempt-details-container { max-height: 70vh; overflow-y: auto; padding: 4px; }
            .attempt-details-card { margin-bottom: 1rem; border: 1px solid var(--cm-border-color); border-radius: 8px; background: #fff; }
            .attempt-details-card .draggable-generic-list-item { border: none !important; background: transparent !important; } /* Override table styles */
            .attempt-events-timeline { padding: 0 1.25rem 1rem; border-top: 1px solid #f1f5f9; }
            .attempt-event-item { display: flex; gap: 1rem; padding: 0.75rem 0; }
            .attempt-event-icon { flex-shrink: 0; width: 24px; text-align: center; color: var(--cm-text-secondary); }
            .attempt-event-icon .la { font-size: 1.2rem; }
            .attempt-event-icon.correct { color: #22c55e; }
            .attempt-event-icon.incorrect { color: var(--cm-danger-color); }
            .attempt-event-details { flex-grow: 1; }
            .attempt-event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
            .attempt-event-title { font-weight: 500; font-size: 0.9rem; color: #334155; }
            .attempt-event-meta { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; color: var(--cm-text-secondary); }
            .attempt-event-points { display: flex; align-items: center; gap: 4px; }
            .attempt-event-body .answer-details { margin-top: 0.5rem; }
            .attempt-event-body .answer-details img { max-width: 250px; border-radius: 6px; border: 1px solid var(--cm-border-color); cursor: pointer; }
            .skipped-question { padding: 1rem 1.25rem; font-style: italic; color: var(--cm-text-secondary); text-align: center; }
        `;
        const styleTag = document.createElement("style");
        styleTag.innerHTML = customStyles;
        document.head.appendChild(styleTag);
        this.styleTag = styleTag;

        window.addEventListener('beforeunload', this.saveStateToLocalStorage);
        this._schoolSubscription = Data.schools.subscribe(this.processDataUpdate);
        
        if (Data.lessonAttempts && typeof Data.lessonAttempts.subscribe === 'function') {
            this._attemptsSubscription = Data.lessonAttempts.subscribe(({ lessonAttempts }) => {
                this.setState({ allLessonAttempts: lessonAttempts }, () => {
                    if (this.state.selectedSubject) {
                        this.processLessonAttemptsForSubject(this.state.selectedSubject);
                    }
                });
            });
        }
        const initialData = { schools: Data.schools.list() };
        this.processDataUpdate(initialData);
    }

    componentWillUnmount() {
        if (this._schoolSubscription) this._schoolSubscription();
        if (this._attemptsSubscription) this._attemptsSubscription();
        if (this.styleTag) this.styleTag.remove();
        window.removeEventListener('beforeunload', this.saveStateToLocalStorage);
    }
    
    // --- Data Processing & State Management (largely unchanged) ---
    processDataUpdate = ({ schools }) => {
        const activeSchool = schools.find(school => school.id === localStorage.getItem("school"));
        if (!activeSchool) { this.setState({ isLoading: false, school: null, _masterGradesList: [] }); return; }
        const masterGradesList = activeSchool.grades || [];
        const stateSource = this.state.isLoading ? JSON.parse(localStorage.getItem("learningState") || '{}') : this.state;
        const validatedState = this.getValidatedState(stateSource, masterGradesList);
        this.setState({ ...validatedState, school: activeSchool, _masterGradesList: masterGradesList, isLoading: false, }, () => {
            this.refreshCurrentSelectionsAndFilters();
            if (this.state.selectedSubject) this.processLessonAttemptsForSubject(this.state.selectedSubject);
        });
    }

    getValidatedState = (sourceState, masterGradesList) => {
        const validated = { selectedGrade: null, selectedSubject: null, selectedTopic: null, selectedSubtopic: null, selectedQuestion: null, gradeSearchTerm: sourceState.gradeSearchTerm || '', subjectSearchTerm: sourceState.subjectSearchTerm || '', topicSearchTerm: sourceState.topicSearchTerm || '', subtopicSearchTerm: sourceState.subtopicSearchTerm || '', questionSearchTerm: sourceState.questionSearchTerm || '', optionSearchTerm: sourceState.optionSearchTerm || '', activeTab: sourceState.activeTab || 'content', };
        try { if (!sourceState) return validated; const grade = masterGradesList.find(g => g.id === sourceState.selectedGrade); if (!grade) return validated; validated.selectedGrade = grade.id; const subject = (grade.subjects || []).find(s => s.id === sourceState.selectedSubject); if (!subject) return validated; validated.selectedSubject = subject.id; const topic = (subject.topics || []).find(t => t.id === sourceState.selectedTopic); if (!topic) return validated; validated.selectedTopic = topic.id; const subtopic = (topic.subtopics || []).find(st => st.id === sourceState.selectedSubtopic); if (!subtopic) return validated; validated.selectedSubtopic = subtopic.id; const question = (subtopic.questions || []).find(q => q.id === sourceState.selectedQuestion); if (question) validated.selectedQuestion = question.id; } catch (error) { console.error("Failed to parse or validate state:", error); }
        return validated;
    }

    saveStateToLocalStorage = () => { if (this.state.isLoading || !this.state.school) return; const { selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion, gradeSearchTerm, subjectSearchTerm, topicSearchTerm, subtopicSearchTerm, questionSearchTerm, optionSearchTerm, activeTab } = this.state; localStorage.setItem("learningState", JSON.stringify({ selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion, gradeSearchTerm, subjectSearchTerm, topicSearchTerm, subtopicSearchTerm, questionSearchTerm, optionSearchTerm, activeTab })); };
    componentDidUpdate(prevProps, prevState) { const persistedStateKeys = ['selectedGrade', 'selectedSubject', 'selectedTopic', 'selectedSubtopic', 'selectedQuestion', 'gradeSearchTerm', 'subjectSearchTerm', 'topicSearchTerm', 'subtopicSearchTerm', 'questionSearchTerm', 'optionSearchTerm', 'activeTab']; const hasPersistedStateChanged = persistedStateKeys.some(key => JSON.stringify(prevState[key]) !== JSON.stringify(this.state[key])); if (hasPersistedStateChanged) { this.saveStateToLocalStorage(); } if (prevState.selectedSubject !== this.state.selectedSubject && this.state.selectedSubject) { this.processLessonAttemptsForSubject(this.state.selectedSubject); } }
    refreshCurrentSelectionsAndFilters = () => { if (this.state.isLoading) return; const { _masterGradesList, school, selectedGrade, gradeSearchTerm, selectedSubject, subjectSearchTerm, selectedTopic, topicSearchTerm, selectedSubtopic, subtopicSearchTerm, selectedQuestion, questionSearchTerm, optionSearchTerm } = this.state; let newState = {}; const gradesList = this._sortListByOrderArray(_masterGradesList, school?.gradeOrder); newState.grades = this._applyFilter(gradesList, gradeSearchTerm, 'name'); const currentGradeObj = selectedGrade ? _masterGradesList.find(g => g.id === selectedGrade) : null; const subjectsList = this._sortListByOrderArray(currentGradeObj?.subjects, currentGradeObj?.subjectsOrder); newState.filteredSubjects = this._applyFilter(subjectsList, subjectSearchTerm, 'name'); const currentSubjectObj = selectedSubject ? (currentGradeObj?.subjects || []).find(s => s.id === selectedSubject) : null; const topicsList = this._sortListByOrderArray(currentSubjectObj?.topics, currentSubjectObj?.topicsOrder); newState.filteredTopics = this._applyFilter(topicsList, topicSearchTerm, 'name'); const currentTopicObj = selectedTopic ? (currentSubjectObj?.topics || []).find(t => t.id === selectedTopic) : null; const subtopicsList = this._sortListByOrderArray(currentTopicObj?.subtopics, currentTopicObj?.subtopicOrder); newState.filteredSubtopics = this._applyFilter(subtopicsList, subtopicSearchTerm, 'name'); const currentSubtopicObj = selectedSubtopic ? (currentTopicObj?.subtopics || []).find(st => st.id === selectedSubtopic) : null; const questionsList = this._sortListByOrderArray(currentSubtopicObj?.questions, currentSubtopicObj?.questionsOrder); newState.filteredQuestions = this._applyFilter(questionsList, questionSearchTerm, 'name'); const currentQuestionObj = selectedQuestion ? (currentSubtopicObj?.questions || []).find(q => q.id === selectedQuestion) : null; const optionsList = this._sortListByOrderArray(currentQuestionObj?.options, currentQuestionObj?.optionsOrder); newState.filteredOptions = this._applyFilter(optionsList, optionSearchTerm, 'value'); this.setState(newState); };
    clearSelectionsAndDataFromLevel = (levelName) => { const newState = {}; const levels = ['grade', 'subject', 'topic', 'subtopic', 'question', 'option']; const startIndex = levels.indexOf(levelName); if (startIndex === -1) return {}; if (startIndex <= 1) { newState.activeTab = 'content'; newState.selectedUserId = null; newState.selectedAttemptId = null; } for (let i = startIndex; i < levels.length; i++) { const level = levels[i]; const capitalizedLevel = level.charAt(0).toUpperCase() + level.slice(1); newState[`selected${capitalizedLevel}`] = null; const childIndex = i + 1; if (childIndex < levels.length) { const childLevel = levels[childIndex]; const capitalizedChildLevel = childLevel.charAt(0).toUpperCase() + childLevel.slice(1); newState[`filtered${capitalizedChildLevel}s`] = []; } } return newState; };
    
    // --- Event Handlers (CRUD, Select, Search) ---
    onEntityCreated = (entityName) => { toastr.success(`${entityName} CREATED successfully!`); }
    onEntityUpdated = (entityName) => { toastr.success(`${entityName} UPDATED successfully!`); }
    onEntityDeleted = (entityName) => { toastr.success(`${entityName} DELETED successfully!`); }
    onGradeSearch = e => { this.setState({ gradeSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }
    onSubjectSearch = e => { this.setState({ subjectSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }
    onTopicSearch = e => { this.setState({ topicSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }
    onSubtopicSearch = e => { this.setState({ subtopicSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }
    onQuestionSearch = e => { this.setState({ questionSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }
    onOptionSearch = e => { this.setState({ optionSearchTerm: e.target.value }, this.refreshCurrentSelectionsAndFilters); }
    handleGradeSelect = (grade) => { this.setState(this.clearSelectionsAndDataFromLevel('subject'), () => { this.setState({ selectedGrade: grade.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
    handleSubjectSelect = (subject) => { this.setState(this.clearSelectionsAndDataFromLevel('topic'), () => { this.setState({ selectedSubject: subject.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
    handleTopicSelect = (topic) => { this.setState(this.clearSelectionsAndDataFromLevel('subtopic'), () => { this.setState({ selectedTopic: topic.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
    handleSubtopicSelect = (subtopic) => { this.setState(this.clearSelectionsAndDataFromLevel('question'), () => { this.setState({ selectedSubtopic: subtopic.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
    handleQuestionSelect = (question) => { this.setState(this.clearSelectionsAndDataFromLevel('option'), () => { this.setState({ selectedQuestion: question.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(400); }); }); };
    
    // --- Attempts Tab Logic ---
    processLessonAttemptsForSubject = (subjectId) => {
        const { _masterGradesList, selectedGrade, allLessonAttempts } = this.state;
        const grade = _masterGradesList.find(g => g.id === selectedGrade);
        const subject = (grade?.subjects || []).find(s => s.id === subjectId);
        if (!subject) { this.setState({ subjectLessonAttempts: [], usersWithAttempts: [] }); return; }
        const subtopicIdsInSubject = new Set((subject.topics || []).flatMap(t => (t.subtopics || []).map(st => st.id)));
        const attemptsForSubject = allLessonAttempts.filter(attempt => subtopicIdsInSubject.has(attempt.lessonId));
        const parentMap = new Map();
        const users = Data.parents.list();
        attemptsForSubject.forEach(attempt => { if (!parentMap.has(attempt.userId)) { const user = users.find(p => p.id === attempt.userId); if (user) { parentMap.set(user.id, { id: user.id, name: user.name || `User ${user.id.substring(0, 5)}`, students: user.students || [], }); } } });
        this.setState({ subjectLessonAttempts: attemptsForSubject, usersWithAttempts: Array.from(parentMap.values()), selectedUserId: null, selectedAttemptId: null });
    }

    handleDeleteAttempt = async (attempt) => { if (!window.confirm(`Are you sure you want to delete this attempt? This action cannot be undone.`)) return; try { await Data.lessonAttempts.delete({ id: attempt.id }); toastr.success("Session deleted successfully!"); if (this.state.selectedAttemptId === attempt.id) { this.setState({ selectedAttemptId: null }); } } catch (e) { toastr.error("Failed to delete attempt."); console.error("Delete attempt error:", e); } };
    handleTabChange = (tabName) => { this.setState({ activeTab: tabName }); }
    handleUserSelect = (userId) => { this.setState({ selectedUserId: userId, selectedAttemptId: null }); }
    handleAttemptSelect = (attemptId) => { this.setState({ selectedAttemptId: attemptId }); }
    
    // --- Utilities & Generic Handlers ---
    findLessonById = (lessonId) => { for (const grade of this.state._masterGradesList) { for (const subject of grade.subjects || []) { for (const topic of subject.topics || []) { const subtopic = (topic.subtopics || []).find(st => st.id === lessonId); if (subtopic) return subtopic; } } } return null; }
    _applyFilter = (list, term, key = 'name') => { if (!list) return []; const searchTerm = term.toLowerCase().trim(); if (!searchTerm) return list; return list.filter(item => item && item[key] && String(item[key]).toLowerCase().includes(searchTerm)); };
    _sortListByOrderArray = (list, orderArray) => { if (!list || !Array.isArray(list)) return []; if (!orderArray || !Array.isArray(orderArray)) return list; const orderMap = new Map(orderArray.map((id, index) => [id, index])); return [...list].sort((a, b) => (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity)); };
    handleCreate = async (entity, data, parentId, parentKey) => { try { const payload = parentId ? { ...data, [parentKey]: parentId } : data; await Data[entity].create(payload); this.onEntityCreated(entity.slice(0, -1)); } catch (err) { toastr.error(`Failed to create ${entity.slice(0, -1)}`); } };
    handleUpdate = async (entity, payload) => { try { await Data[entity].update(payload); this.onEntityUpdated(entity.slice(0, -1)); } catch (err) { toastr.error(`Failed to update ${entity.slice(0, -1)}`); } };
    handleDelete = (entity, item) => async () => { try { await Data[entity].delete({ id: item.id }); this.onEntityDeleted(entity.slice(0, -1)); const singularEntity = entity.slice(0, -1); const capitalizedEntity = singularEntity.charAt(0).toUpperCase() + singularEntity.slice(1); if (this.state[`selected${capitalizedEntity}`] === item.id) { this.setState(this.clearSelectionsAndDataFromLevel(singularEntity), this.refreshCurrentSelectionsAndFilters); } } catch (err) { toastr.error(`Failed to delete ${entity.slice(0, -1)}`); } };
    scrollBy = (amount) => { if (this.scrollContainerRef.current) { this.scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' }); } }
    _handleReorder = async (entityType, reorderedList) => { const { school, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion } = this.state; const ids = reorderedList.map(item => item.id); let entityToUpdate, payload; switch (entityType) { case 'grades': this.setState({ grades: reorderedList }); entityToUpdate = 'schools'; payload = { id: school.id, gradeOrder: ids }; break; case 'subjects': this.setState({ filteredSubjects: reorderedList }); entityToUpdate = 'grades'; payload = { id: selectedGrade, subjectsOrder: ids }; break; case 'topics': this.setState({ filteredTopics: reorderedList }); entityToUpdate = 'subjects'; payload = { id: selectedSubject, topicsOrder: ids, grade: selectedGrade }; break; case 'subtopics': this.setState({ filteredSubtopics: reorderedList }); entityToUpdate = 'topics'; payload = { id: selectedTopic, subtopicOrder: ids, subject: selectedSubject }; break; case 'questions': this.setState({ filteredQuestions: reorderedList }); entityToUpdate = 'subtopics'; payload = { id: selectedSubtopic, questionsOrder: ids, topic: selectedTopic }; break; case 'options': this.setState({ filteredOptions: reorderedList }); entityToUpdate = 'questions'; payload = { id: selectedQuestion, optionsOrder: ids, subtopic: selectedSubtopic }; break; default: return; } try { await this.handleUpdate(entityToUpdate, payload); } catch (error) { toastr.error(`Failed to update order for ${entityType}. Reverting.`); this.refreshCurrentSelectionsAndFilters(); } };
    
    // --- Render Methods ---

    renderAnswerDetails = (question, event) => {
        if (!event || !event.userAnswer) return null;
        let answer;
        try { answer = JSON.parse(event.userAnswer); } catch(e) { return <div className="text-danger">Error parsing answer data.</div> }
        switch (question.type) {
            case 'SINGLECHOICE': case 'MULTICHOICE':
                const selectedIds = new Set(answer.selectedOptionIds || [answer.selectedOptionId].filter(Boolean));
                return ( <div className="answer-details"> {(question.options || []).map(option => { const isSelected = selectedIds.has(option.id); const isCorrect = option.correct; let className = 'option-display'; let icon = 'la-circle-thin'; if (isCorrect && isSelected) { className += ' selected-correct'; icon = 'la-check-circle'; } else if (isCorrect) { className += ' correct'; icon = 'la-check-circle-o'; } else if (isSelected && !isCorrect) { className += ' selected-incorrect'; icon = 'la-times-circle'; } return (<div key={option.id} className={className}><i className={`la ${icon}`}></i> {option.value}</div>); })} </div> );
            case 'TEXT': return (<div className="answer-details text-answer"><p><strong>Student's Answer:</strong> {answer.inputText || 'N/A'}</p></div>);
            case 'CAMERA': return ( <div className="answer-details image-answer"> <p><strong>Student's Submission:</strong></p> {answer.imageData ? <img src={answer.imageData} alt="Student submission" onClick={() => window.open(answer.imageData, '_blank')} /> : <p>No image submitted.</p> } </div> );
            default: return <div className="answer-details"><p className="text-muted">Answer display not implemented for type: {question.type}</p></div>;
        }
    }
    
    renderEventsForQuestion = (question, events) => {
        if (!events || events.length === 0) return <div className="skipped-question">Question was skipped.</div>;
        const maxPoints = question.points || 5; 
        return ( <div className="attempt-events-timeline"> {events.map(event => { const eventTime = moment(event.eventTimestamp); if (event.eventType === 'check_attempt') { const isCorrect = event.isCorrect; const pointsEarned = typeof event.pointsEarned === 'number' ? event.pointsEarned : (isCorrect ? maxPoints : 0); return ( <div key={event.id} className="attempt-event-item"> <div className={`attempt-event-icon ${isCorrect ? 'correct' : 'incorrect'}`}><i className={`la ${isCorrect ? 'la-check' : 'la-times'}`}></i></div> <div className="attempt-event-details"> <div className="attempt-event-header"> <span className="attempt-event-title">Answer Checked</span> <div className="attempt-event-meta"> <span className="attempt-event-points" title={`Earned ${pointsEarned} of ${maxPoints} points`}><i className="la la-diamond"></i> {pointsEarned}/{maxPoints}</span> <span title={eventTime.format('lll')}>{eventTime.fromNow()}</span> </div> </div> <div className="attempt-event-body">{this.renderAnswerDetails(question, event)}</div> </div> </div> ); } if (event.eventType === 'question_viewed') { return ( <div key={event.id} className="attempt-event-item"> <div className="attempt-event-icon"><i className="la la-eye"></i></div> <div className="attempt-event-details" style={{paddingTop: '2px'}}> <div className="attempt-event-header"> <span className="attempt-event-title">Question Viewed</span> <div className="attempt-event-meta"><span title={eventTime.format('lll')}>{eventTime.fromNow()}</span></div> </div> </div> </div> ); } return null; })} </div> );
    }

    renderContentColumns() {
        const { grades, gradeSearchTerm, filteredSubjects, subjectSearchTerm, selectedGrade, selectedSubject } = this.state;
        const tableOptions = { reorderable: true, linkable: true, editable: true, deleteable: true };
        const selectedGradeObj = selectedGrade ? this.state._masterGradesList.find(g => g.id === selectedGrade) : null;

        return <>
            <div className="cm-column">
                <div className="cm-column-header"><h5>Grades</h5><button type="button" className="cm-add-btn" onClick={() => this.addGradeModalRef.current.show()} title="Add Grade"><i className="la la-plus"></i></button></div>
                <div className="cm-column-body">
                    <Search title="grades" onSearch={this.onGradeSearch} value={gradeSearchTerm} />
                    <Table listId="grades-list" headers={[{ label: "Name", key: "name" }]} data={grades} selectedItemId={selectedGrade} show={this.handleGradeSelect} edit={grade => this.setState({ gradeToEdit: grade }, () => this.editGradeModalRef.current.show())} delete={grade => this.setState({ gradeToDelete: grade }, () => this.deleteGradeModalRef.current.show())} onOrderChange={(list) => this._handleReorder('grades', list)} options={tableOptions} noItemsText="No grades found." />
                </div>
            </div>
            {selectedGrade && (
                <div className="cm-column">
                    <div className="cm-column-header"><h5>{selectedGradeObj?.name || '...'} Subjects</h5><button type="button" className="cm-add-btn" onClick={() => this.addSubjectModalRef.current.show()} title="Add Subject"><i className="la la-plus"></i></button></div>
                    <div className="cm-column-body">
                        <Search title="subjects" onSearch={this.onSubjectSearch} value={subjectSearchTerm} />
                        <Table listId={`subjects-list-${selectedGrade}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubjects} options={tableOptions} selectedItemId={selectedSubject} show={this.handleSubjectSelect} edit={subject => this.setState({ subjectToEdit: subject }, () => this.editSubjectModalRef.current.show())} delete={subject => this.setState({ subjectToDelete: subject }, () => this.deleteSubjectModalRef.current.show())} onOrderChange={(list) => this._handleReorder('subjects', list)} />
                    </div>
                </div>
            )}
            {selectedSubject && this.renderMainContentArea()}
        </>;
    }

    renderMainContentArea() {
        const { activeTab, topicSearchTerm, filteredTopics, selectedTopic, subtopicSearchTerm, filteredSubtopics, selectedSubtopic, questionSearchTerm, filteredQuestions, selectedQuestion, optionSearchTerm, filteredOptions, selectedSubject } = this.state;
        const tableOptions = { reorderable: true, linkable: true, editable: true, deleteable: true };
        const correctOptionIds = filteredOptions.filter(o => o.correct).map(o => o.id);
        
        return (
            <div className="cm-column cm-column-large">
                <div className="cm-tab-header">
                    <button className={`cm-tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => this.handleTabChange('content')}>Content</button>
                    <button className={`cm-tab-btn ${activeTab === 'responses' ? 'active' : ''}`} onClick={() => this.handleTabChange('responses')}>Student Attempts</button>
                </div>
                <div className="cm-column-body" style={{ padding: '0' }}>
                    <div className="tab-content">
                        <div className={`tab-pane ${activeTab === 'content' ? 'active' : ''}`}>
                            <div className="tab-inner-scroller">
                                <div className="cm-column" style={{border: 'none', borderRadius: '0'}}><div className="cm-column-header"><h5>Strands</h5><button type="button" className="cm-add-btn" onClick={() => this.addTopicModalRef.current.show()} title="Add Strand"><i className="la la-plus"></i></button></div><div className="cm-column-body"><Search title="strands" onSearch={this.onTopicSearch} value={topicSearchTerm} /><Table listId={`topics-list-${selectedSubject}`} headers={[{ label: "Name", key: "name" }]} data={filteredTopics} options={tableOptions} selectedItemId={selectedTopic} show={this.handleTopicSelect} edit={topic => this.setState({ topicToEdit: topic }, () => this.editTopicModalRef.current.show())} delete={topic => this.setState({ topicToDelete: topic }, () => this.deleteTopicModalRef.current.show())} onOrderChange={(list) => this._handleReorder('topics', list)} /></div></div>
                                {selectedTopic && <div className="cm-column" style={{border: 'none', borderRadius: '0'}}><div className="cm-column-header"><h5>Sub Strands</h5><button type="button" className="cm-add-btn" onClick={() => this.addSubtopicModalRef.current.show()} title="Add Sub Strand"><i className="la la-plus"></i></button></div><div className="cm-column-body"><Search title="sub-strands" onSearch={this.onSubtopicSearch} value={subtopicSearchTerm} /><Table listId={`subtopics-list-${selectedTopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubtopics} options={tableOptions} selectedItemId={selectedSubtopic} show={this.handleSubtopicSelect} edit={subtopic => this.setState({ subtopicToEdit: subtopic }, () => this.editSubtopicModalRef.current.show())} delete={subtopic => this.setState({ subtopicToDelete: subtopic }, () => this.deleteSubtopicModalRef.current.show())} onOrderChange={(list) => this._handleReorder('subtopics', list)} /></div></div>}
                                {selectedSubtopic && <div className="cm-column cm-column-large" style={{border: 'none', borderRadius: '0'}}><div className="cm-column-header"><h5>Questions</h5><button type="button" className="cm-add-btn" onClick={() => this.addQuestionModalRef.current.show()} title="Add Question"><i className="la la-plus"></i></button></div><div className="cm-column-body"><Search title="questions" onSearch={this.onQuestionSearch} value={questionSearchTerm} /><Table listId={`questions-list-${selectedSubtopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredQuestions} options={tableOptions} selectedItemId={selectedQuestion} show={this.handleQuestionSelect} edit={question => this.setState({ questionToEdit: question }, () => this.editQuestionModalRef.current.show())} delete={question => this.setState({ questionToDelete: question }, () => this.deleteQuestionModalRef.current.show())} onOrderChange={(list) => this._handleReorder('questions', list)} /></div></div>}
                                {selectedQuestion && <div className="cm-column" style={{border: 'none', borderRadius: '0'}}><div className="cm-column-header"><h5>Options</h5><button type="button" className="cm-add-btn" onClick={() => this.addOptionModalRef.current.show()} title="Add Option"><i className="la la-plus"></i></button></div><div className="cm-column-body"><Search title="options" onSearch={this.onOptionSearch} value={optionSearchTerm} /><Table listId={`options-list-${selectedQuestion}`} headers={[{ label: "Answer", key: "value" }]} data={filteredOptions} options={{ ...tableOptions, linkable: false }} edit={option => this.setState({ optionToEdit: option }, () => this.editOptionModalRef.current.show())} delete={option => this.setState({ optionToDelete: option }, () => this.deleteOptionModalRef.current.show())} onOrderChange={(list) => this._handleReorder('options', list)} correctItemIds={correctOptionIds} /></div></div>}
                            </div>
                        </div>
                        <div className={`tab-pane ${activeTab === 'responses' ? 'active' : ''}`} style={{ padding: '1rem' }}>
                            {this.renderStudentAttemptsTab()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    renderStudentAttemptsTab() {
        const { usersWithAttempts, selectedUserId, subjectLessonAttempts, selectedAttemptId } = this.state;
        const selectedUserName = selectedUserId ? usersWithAttempts.find(u => u.id === selectedUserId)?.name : null;
        const attemptsForSelectedUser = selectedUserId ? subjectLessonAttempts.filter(a => a.userId === selectedUserId) : [];
        const selectedAttempt = selectedAttemptId ? subjectLessonAttempts.find(a => a.id === selectedAttemptId) : null;
        
        let originalLesson, sortedOriginalQuestions, attemptEventsByQuestionId;
        if (selectedAttempt) {
            originalLesson = this.findLessonById(selectedAttempt.lessonId);
            if (originalLesson) {
                sortedOriginalQuestions = this._sortListByOrderArray(originalLesson.questions, originalLesson.questionsOrder);
                attemptEventsByQuestionId = (selectedAttempt.attemptEvents || []).reduce((acc, event) => {
                    if (!acc.has(event.questionId)) acc.set(event.questionId, []);
                    acc.get(event.questionId).push(event);
                    return acc;
                }, new Map());
            }
        }
    
        return (
            <div className="attempts-grid">
                <div className="attempts-column">
                    <h6>Users ({usersWithAttempts.length})</h6>
                    <div className="list-group">{usersWithAttempts.length > 0 ? usersWithAttempts.map(user => (
                        <div key={user.id} className={`list-group-item user-list-item ${selectedUserId === user.id ? 'active' : ''}`} onClick={() => this.handleUserSelect(user.id)}>
                            {user.name}
                            {user.students && user.students.map(student => (<div key={student.id} className="student-sub-item">{student.names}</div>))}
                        </div>)) : (<div className="text-center p-4 text-muted"><i className="la la-users" style={{fontSize: '2rem'}}></i><br/>No attempts found.</div>)
                    }</div>
                </div>
                <div className="attempts-column">
                    <h6>{selectedUserName ? `${selectedUserName}'s Attempts` : 'Select a User'}</h6>
                    {selectedUserId && (<div className="list-group">{attemptsForSelectedUser.length > 0 ? attemptsForSelectedUser.map((attempt, index) => (
                        <a key={attempt.id} className={`list-group-item list-group-item-action ${selectedAttemptId === attempt.id ? 'active' : ''}`} onClick={() => this.handleAttemptSelect(attempt.id)}>
                            <div className="attempt-list-item-content">
                                <div>
                                    <div className="attempt-list-item-header">Session {index + 1}</div>
                                    <div className="attempt-list-item-meta">{moment(attempt.startedAt).format('MMM D, YYYY')}</div>
                                    <div className="attempt-list-item-meta">Lesson: {this.findLessonById(attempt.lessonId)?.name || 'Unknown'}</div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className={`attempt-score-badge ${attempt.finalScore >= 50 ? 'high-score' : 'low-score'} mr-2`}>{attempt.finalScore}%</span>
                                    <button type="button" className="btn btn-sm btn-icon btn-delete-attempt" onClick={(e) => { e.stopPropagation(); this.handleDeleteAttempt(attempt); }} title="Delete Session"><i className="la la-trash"></i></button>
                                </div>
                            </div>
                        </a>)) : <p className="text-muted p-2 text-center">No attempts by this user.</p>}
                    </div>)}
                </div>
                <div className="attempts-column">
                    <h6>{selectedAttempt ? `Session Details` : 'Select a Session'}</h6>
                    {selectedAttempt ? (
                        <div className="attempt-details-container">
                            {originalLesson && sortedOriginalQuestions ? sortedOriginalQuestions.map(q => (
                                <div key={q.id} className="attempt-details-card">
                                    <Table data={[q]} headers={[{key: 'name'}]} options={{reorderable: false, linkable: false, editable: false, deleteable: false}} listId={`q-disp-${q.id}`} />
                                    {this.renderEventsForQuestion(q, attemptEventsByQuestionId.get(q.id))}
                                </div>
                            )) : <div className="alert alert-warning">Could not load original lesson questions.</div>}
                        </div>
                    ) : (usersWithAttempts.length > 0 && !selectedUserId ? <div className="text-center p-5 text-muted"><i className="la la-user" style={{fontSize: '3rem'}}></i><br/>Select a user to view attempts.</div> : null)}
                </div>
            </div>
        );
    }

    render() {
        const { isLoading, gradeToEdit, gradeToDelete, subjectToEdit, subjectToDelete, topicToEdit, topicToDelete, subtopicToEdit, subtopicToDelete, questionToEdit, questionToDelete, optionToEdit, optionToDelete, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion } = this.state;

        if (isLoading) {
            return (<div className="cm-container"><div className="cm-header-main"></div><SkeletonLoader /></div>);
        }

        return (
            <div className="cm-container">
                <div className="cm-header-main"></div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <button onClick={() => this.scrollBy(-400)} className="btn btn-sm btn-icon btn-light mr-2" title="Scroll Left"><i className="la la-angle-left"></i></button>
                    <div ref={this.scrollContainerRef} className="scrolling-wrapper">
                        {this.renderContentColumns()}
                    </div>
                    <button onClick={() => this.scrollBy(400)} className="btn btn-sm btn-icon btn-light ml-2" title="Scroll Right"><i className="la la-angle-right"></i></button>
                </div>

                {/* --- Modals --- */}
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
                {selectedTopic && <EditSubtopicModal ref={this.editSubtopicModalRef} subtopic={subtopicToEdit} edit={(data) => this.handleUpdate('subtopics', { ...data, id: subtopicToEdit.id, topic: selectedTopic })} />}
                {selectedTopic && <DeleteSubtopicModal ref={this.deleteSubtopicModalRef} subtopic={subtopicToDelete} delete={this.handleDelete('subtopics', subtopicToDelete, selectedTopic, 'topic')} />}
                {selectedSubtopic && <AddQuestionModal ref={this.addQuestionModalRef} save={(data) => this.handleCreate('questions', data, selectedSubtopic, 'subtopic')} />}
                {selectedSubtopic && <EditQuestionModal ref={this.editQuestionModalRef} question={questionToEdit} edit={(data) => this.handleUpdate('questions', { ...data, id: questionToEdit.id, subtopic: selectedSubtopic })} />}
                {selectedSubtopic && <DeleteQuestionModal ref={this.deleteQuestionModalRef} question={questionToDelete} delete={this.handleDelete('questions', questionToDelete)} />}
                {selectedQuestion && <AddOptionModal ref={this.addOptionModalRef} save={(data) => this.handleCreate('options', data, selectedQuestion, 'question')} />}
                {selectedQuestion && <EditOptionModal ref={this.editOptionModalRef} option={optionToEdit} edit={(data) => this.handleUpdate('options', { ...data, id: optionToEdit.id, question: selectedQuestion })} />}
                {selectedQuestion && <DeleteOptionModal ref={this.deleteOptionModalRef} option={optionToDelete} delete={this.handleDelete('options', optionToDelete)} />}
            </div>
        );
    }
}

export default CurriculumManagerV5;