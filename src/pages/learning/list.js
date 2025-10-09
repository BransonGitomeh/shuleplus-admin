import React from "react";
import Data from "../../utils/data";

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

// Import supporting components
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
                                value={value || ''}
                                onChange={onSearch}
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
    @keyframes skeleton-pulse { 0% { background-color: #f7f8fa; } 50% { background-color: #e9ecf2; } 100% { background-color: #f7f8fa; } }
    .skeleton-placeholder { animation: skeleton-pulse 1.8s infinite ease-in-out; background-color: #f7f8fa; border-radius: 4px; }
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

const toastr = window.toastr;

class BasicTable extends React.Component {
    scrollContainerRef = React.createRef();
    _schoolSubscription = null;
    styleTag = null;

    addGradeModalRef = React.createRef(); editGradeModalRef = React.createRef(); deleteGradeModalRef = React.createRef();
    addSubjectModalRef = React.createRef(); editSubjectModalRef = React.createRef(); deleteSubjectModalRef = React.createRef();
    addTopicModalRef = React.createRef(); editTopicModalRef = React.createRef(); deleteTopicModalRef = React.createRef();
    addSubtopicModalRef = React.createRef(); editSubtopicModalRef = React.createRef(); deleteSubtopicModalRef = React.createRef();
    addQuestionModalRef = React.createRef(); editQuestionModalRef = React.createRef(); deleteQuestionModalRef = React.createRef();
    addOptionModalRef = React.createRef(); editOptionModalRef = React.createRef(); deleteOptionModalRef = React.createRef();

    state = {
        isLoading: true,
        school: null,
        _masterGradesList: [],
        grades: [],
        filteredSubjects: [],
        filteredTopics: [],
        filteredSubtopics: [],
        filteredQuestions: [],
        filteredOptions: [],
        selectedGrade: null,
        selectedSubject: null,
        selectedTopic: null,
        selectedSubtopic: null,
        selectedQuestion: null,
        gradeToEdit: {}, gradeToDelete: {},
        subjectToEdit: {}, subjectToDelete: {},
        topicToEdit: {}, topicToDelete: {},
        subtopicToEdit: {}, subtopicToDelete: {},
        questionToEdit: {}, questionToDelete: {},
        optionToEdit: {}, optionToDelete: {},
        gradeSearchTerm: '', subjectSearchTerm: '', topicSearchTerm: '',
        subtopicSearchTerm: '', questionSearchTerm: '', optionSearchTerm: '',
        activeTab: 'content',
        // --- STATE for lesson attempts ---
        subjectLessonAttempts: [],
        studentsWithAttempts: [],
        selectedStudentId: null,
        selectedAttemptId: null,
    };

    componentDidMount() {
        const customStyles = `
            .nav-tabs .nav-link { cursor: pointer; } .nav-tabs .nav-link.active { font-weight: bold; border-color: #dee2e6 #dee2e6 #fff; border-bottom: 2px solid #5867dd !important; color: #5867dd; }
            .list-group-item { cursor: pointer; border-left: 3px solid transparent; } .list-group-item.active { background-color: #f7f8fa; border-left: 3px solid #5867dd; font-weight: 500; }
            .scrolling-wrapper { display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .scrolling-wrapper > .col-md-3, .scrolling-wrapper > .col-md-7, .scrolling-wrapper > .col-md-9, .scrolling-wrapper > .col-md-12 { flex: 0 0 auto; }
            /* --- TIMELINE STYLES --- */
            .timeline { position: relative; padding-left: 30px; }
            .timeline::before { content: ''; position: absolute; left: 10px; top: 0; bottom: 0; width: 2px; background: #e9ecf2; }
            .timeline-item { position: relative; margin-bottom: 25px; }
            .timeline-icon { position: absolute; left: -24px; top: 0; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #fff; border: 2px solid #e9ecf2; }
            .timeline-icon.correct { border-color: #1dc9b7; color: #1dc9b7; }
            .timeline-icon.incorrect { border-color: #fd397a; color: #fd397a; }
            .timeline-content { background: #fff; padding: 15px; border-radius: 4px; border: 1px solid #ebedf2; }
            .timeline-breadcrumbs { font-size: 0.8rem; color: #a7abc3; margin-bottom: 8px; }
            .timeline-question { font-weight: 500; margin-bottom: 10px; }
            .timeline-answer img { max-width: 200px; height: auto; border-radius: 4px; margin-top: 10px; border: 1px solid #ebedf2; cursor: pointer; }
        `;
        const styleTag = document.createElement("style");
        styleTag.innerHTML = customStyles;
        document.head.appendChild(styleTag);
        this.styleTag = styleTag;
        window.addEventListener('beforeunload', this.saveStateToLocalStorage);
        this._schoolSubscription = Data.schools.subscribe(this.processDataUpdate);
        const initialData = { schools: Data.schools.list() };
        this.processDataUpdate(initialData);
    }

    componentWillUnmount() {
        if (this._schoolSubscription) this._schoolSubscription();
        if (this.styleTag) this.styleTag.remove();
        window.removeEventListener('beforeunload', this.saveStateToLocalStorage);
    }

    processDataUpdate = ({ schools }) => {
        const activeSchool = schools.find(school => school.id === localStorage.getItem("school"));
        if (!activeSchool || !activeSchool.grades) {
            this.setState({ isLoading: true, school: activeSchool });
            return;
        }
        const masterGradesList = activeSchool.grades || [];
        const stateSource = this.state.isLoading ? JSON.parse(localStorage.getItem("learningState") || '{}') : this.state;
        const validatedState = this.getValidatedState(stateSource, masterGradesList);
        this.setState({
            ...validatedState,
            school: activeSchool,
            _masterGradesList: masterGradesList,
            isLoading: false,
        }, () => {
            this.refreshCurrentSelectionsAndFilters();
            if (this.state.selectedSubject) {
                // When data updates, re-process the attempts for the currently selected subject
                this.processLessonAttemptsForSubject(this.state.selectedSubject);
            }
        });
    }

    getValidatedState = (sourceState, masterGradesList) => {
        const validated = {
            selectedGrade: null, selectedSubject: null, selectedTopic: null,
            selectedSubtopic: null, selectedQuestion: null,
            gradeSearchTerm: sourceState.gradeSearchTerm || '', subjectSearchTerm: sourceState.subjectSearchTerm || '',
            topicSearchTerm: sourceState.topicSearchTerm || '', subtopicSearchTerm: sourceState.subtopicSearchTerm || '',
            questionSearchTerm: sourceState.questionSearchTerm || '', optionSearchTerm: sourceState.optionSearchTerm || '',
            activeTab: sourceState.activeTab || 'content',
        };
        try {
            if (!sourceState) return validated;
            const grade = masterGradesList.find(g => g.id === sourceState.selectedGrade);
            if (!grade) return validated;
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
            if (question) validated.selectedQuestion = question.id;
        } catch (error) {
            console.error("Failed to parse or validate state:", error);
        }
        return validated;
    }

    saveStateToLocalStorage = () => {
        if (this.state.isLoading || !this.state.school) return;
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
        localStorage.setItem("learningState", JSON.stringify(stateToSave));
    };

    componentDidUpdate(prevProps, prevState) {
        const persistedStateKeys = ['selectedGrade', 'selectedSubject', 'selectedTopic', 'selectedSubtopic', 'selectedQuestion', 'gradeSearchTerm', 'subjectSearchTerm', 'topicSearchTerm', 'subtopicSearchTerm', 'questionSearchTerm', 'optionSearchTerm', 'activeTab'];
        const hasPersistedStateChanged = persistedStateKeys.some(key => JSON.stringify(prevState[key]) !== JSON.stringify(this.state[key]));
        if (hasPersistedStateChanged) {
            this.saveStateToLocalStorage();
        }
    }

    _applyFilter = (list, term, key = 'name') => {
        if (!list) return [];
        const searchTerm = term.toLowerCase().trim();
        if (!searchTerm) return list;
        return list.filter(item => item && item[key] && String(item[key]).toLowerCase().includes(searchTerm));
    };

    _sortListByOrderArray = (list, orderArray) => {
        if (!list || !Array.isArray(list)) return [];
        if (!orderArray || !Array.isArray(orderArray)) return list;
        const orderMap = new Map(orderArray.map((id, index) => [id, index]));
        return [...list].sort((a, b) => {
            const posA = orderMap.get(a.id) ?? Infinity;
            const posB = orderMap.get(b.id) ?? Infinity;
            return posA - posB;
        });
    }

    refreshCurrentSelectionsAndFilters = () => {
        const { _masterGradesList, school, selectedGrade, gradeSearchTerm, selectedSubject, subjectSearchTerm, selectedTopic, topicSearchTerm, selectedSubtopic, subtopicSearchTerm, selectedQuestion, questionSearchTerm, optionSearchTerm } = this.state;
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

    clearSelectionsAndDataFromLevel = (levelName) => {
        const newState = {};
        const levels = ['grade', 'subject', 'topic', 'subtopic', 'question', 'option'];
        const startIndex = levels.indexOf(levelName);
        if (startIndex === -1) return {};
        if (startIndex <= 1) {
            newState.activeTab = 'content';
            newState.subjectLessonAttempts = [];
            newState.studentsWithAttempts = [];
            newState.selectedStudentId = null;
            newState.selectedAttemptId = null;
        }
        for (let i = startIndex; i < levels.length; i++) {
            const level = levels[i];
            const capitalizedLevel = level.charAt(0).toUpperCase() + level.slice(1);
            newState[`selected${capitalizedLevel}`] = null;
            const childIndex = i + 1;
            if (childIndex < levels.length) {
                const childLevel = levels[childIndex];
                const capitalizedChildLevel = childLevel.charAt(0).toUpperCase() + childLevel.slice(1);
                newState[`filtered${capitalizedChildLevel}s`] = [];
            }
        }
        return newState;
    };

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
    handleSubjectSelect = (subject) => { this.setState(this.clearSelectionsAndDataFromLevel('topic'), () => { this.setState({ selectedSubject: subject.id }, () => { this.processLessonAttemptsForSubject(subject.id); this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
    handleTopicSelect = (topic) => { this.setState(this.clearSelectionsAndDataFromLevel('subtopic'), () => { this.setState({ selectedTopic: topic.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
    handleSubtopicSelect = (subtopic) => { this.setState(this.clearSelectionsAndDataFromLevel('question'), () => { this.setState({ selectedSubtopic: subtopic.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(300); }); }); };
    handleQuestionSelect = (question) => { this.setState(this.clearSelectionsAndDataFromLevel('option'), () => { this.setState({ selectedQuestion: question.id }, () => { this.refreshCurrentSelectionsAndFilters(); this.scrollBy(400); }); }); };
    
    // --- REVISED LOGIC WITH ADDED LOGGING ---
    processLessonAttemptsForSubject = (subjectId) => {
        console.log(`[Attempts] Processing attempts for Subject ID: ${subjectId}`);
        const { _masterGradesList, selectedGrade } = this.state;
        const grade = _masterGradesList.find(g => g.id === selectedGrade);
        const subject = (grade?.subjects || []).find(s => s.id === subjectId);
        if (!subject) {
            console.warn('[Attempts] Could not find subject object in state.');
            return;
        }

        const subtopicIds = (subject.topics || []).flatMap(t => t.subtopics || []).map(st => st.id);
        console.log(`[Attempts] Found ${subtopicIds.length} subtopic(s) for this subject:`, subtopicIds);

        const allAttempts = Data.lessonAttempts.list();
        console.log(`[Attempts] Total cached lesson attempts from DataService: ${allAttempts.length}`);

        const attemptsForSubject = allAttempts.filter(attempt => subtopicIds.includes(attempt.lessonId));
        console.log(`[Attempts] Found ${attemptsForSubject.length} attempts matching the subtopic IDs.`);

        const studentMap = new Map();
        attemptsForSubject.forEach(attempt => {
            if (!studentMap.has(attempt.userId)) {
                const student = Data.students.getOne(attempt.userId);
                studentMap.set(attempt.userId, { id: attempt.userId, name: student ? student.names : `User ID: ${attempt.userId}` });
            }
        });

        console.log(`[Attempts] Found ${studentMap.size} unique students with attempts.`);
        this.setState({
            subjectLessonAttempts: attemptsForSubject,
            studentsWithAttempts: Array.from(studentMap.values()),
            selectedStudentId: null,
            selectedAttemptId: null
        });
    }

    handleTabChange = (tabName) => { this.setState({ activeTab: tabName }); }
    handleStudentSelect = (studentId) => { this.setState({ selectedStudentId: studentId, selectedAttemptId: null }); }
    handleAttemptSelect = (attemptId) => { this.setState({ selectedAttemptId: attemptId }); }

    findQuestionDetails = (questionId) => {
        for (const grade of this.state._masterGradesList) {
            for (const subject of grade.subjects || []) {
                for (const topic of subject.topics || []) {
                    for (const subtopic of topic.subtopics || []) {
                        const question = (subtopic.questions || []).find(q => q.id === questionId);
                        if (question) {
                            return { question, breadcrumbs: `${grade.name} > ${subject.name} > ${topic.name} > ${subtopic.name}` };
                        }
                    }
                }
            }
        }
        return { question: null, breadcrumbs: 'Unknown Location' };
    };

    renderAnswerContent = (answerString) => {
        try {
            const answer = JSON.parse(answerString);
            if (answer.imageData && answer.imageData.startsWith('data:image')) {
                return <img src={answer.imageData} alt="Student submission" className="timeline-answer-image" onClick={() => window.open(answer.imageData, '_blank')} />;
            }
            if (answer.inputText) return <p className="mb-0"><strong>Answer:</strong> {answer.inputText}</p>;
            if (answer.selectedOptionId) {
                return <p className="mb-0"><strong>Selected Option ID:</strong> {answer.selectedOptionId}</p>;
            }
            if (answer.selectedOptionIds) {
                return <p className="mb-0"><strong>Selected Option IDs:</strong> {answer.selectedOptionIds.join(', ')}</p>;
            }
        } catch (e) {
            // This is a fallback for older data that might not be a JSON string.
            return <p className="mb-0"><strong>Answer:</strong> {answerString}</p>;
        }
        return <p className="text-muted font-italic">No valid answer recorded.</p>;
    };

    handleCreate = async (entity, data, parentId, parentKey) => { try { const payload = parentId ? { ...data, [parentKey]: parentId } : data; await Data[entity].create(payload); this.onEntityCreated(entity.slice(0, -1)); } catch (err) { toastr.error(`Failed to create ${entity.slice(0, -1)}`); } };
    handleUpdate = async (entity, payload) => { try { await Data[entity].update(payload); this.onEntityUpdated(entity.slice(0, -1)); } catch (err) { toastr.error(`Failed to update ${entity.slice(0, -1)}`); } };
    handleDelete = (entity, item) => async () => { try { await Data[entity].delete({ id: item.id }); this.onEntityDeleted(entity.slice(0, -1)); const singularEntity = entity.slice(0, -1); const capitalizedEntity = singularEntity.charAt(0).toUpperCase() + singularEntity.slice(1); if (this.state[`selected${capitalizedEntity}`] === item.id) { this.setState(this.clearSelectionsAndDataFromLevel(singularEntity), this.refreshCurrentSelectionsAndFilters); } } catch (err) { toastr.error(`Failed to delete ${entity.slice(0, -1)}`); } };
    scrollBy = (amount) => { if (this.scrollContainerRef.current) { this.scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' }); } }
    _handleReorder = async (entityType, reorderedList) => {
        const { school, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion } = this.state;
        const ids = reorderedList.map(item => item.id);
        let entityToUpdate, payload;
        switch (entityType) {
            case 'grades': this.setState({ grades: reorderedList }); entityToUpdate = 'schools'; payload = { id: school.id, gradeOrder: ids }; break;
            case 'subjects': this.setState({ filteredSubjects: reorderedList }); entityToUpdate = 'grades'; payload = { id: selectedGrade, subjectsOrder: ids }; break;
            case 'topics': this.setState({ filteredTopics: reorderedList }); entityToUpdate = 'subjects'; payload = { id: selectedSubject, topicsOrder: ids, grade: selectedGrade }; break;
            case 'subtopics': this.setState({ filteredSubtopics: reorderedList }); entityToUpdate = 'topics'; payload = { id: selectedTopic, subtopicOrder: ids, subject: selectedSubject }; break;
            case 'questions': this.setState({ filteredQuestions: reorderedList }); entityToUpdate = 'subtopics'; payload = { id: selectedSubtopic, questionsOrder: ids, topic: selectedTopic }; break;
            case 'options': this.setState({ filteredOptions: reorderedList }); entityToUpdate = 'questions'; payload = { id: selectedQuestion, optionsOrder: ids, subtopic: selectedSubtopic }; break;
            default: return;
        }
        try { await this.handleUpdate(entityToUpdate, payload); } catch (error) { toastr.error(`Failed to update order for ${entityType}. Reverting.`); this.refreshCurrentSelectionsAndFilters(); }
    };

    render() {
        const { isLoading, grades, gradeSearchTerm, filteredSubjects, subjectSearchTerm, filteredTopics, topicSearchTerm, filteredSubtopics, subtopicSearchTerm, filteredQuestions, questionSearchTerm, filteredOptions, optionSearchTerm, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, selectedQuestion, gradeToEdit, gradeToDelete, subjectToEdit, subjectToDelete, topicToEdit, topicToDelete, subtopicToEdit, subtopicToDelete, questionToEdit, questionToDelete, optionToEdit, optionToDelete, activeTab, studentsWithAttempts, selectedStudentId, selectedAttemptId, subjectLessonAttempts } = this.state;

        if (isLoading && (!this.state.school || !this.state.grades || !this.state.grades.length)) {
            return (<div className="kt-portlet kt-portlet--mobile"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Student Learning</h3></div></div><div className="kt-portlet__body"><SkeletonLoader /></div></div>)
        }

        const selectedGradeObj = selectedGrade ? this.state._masterGradesList.find(g => g.id === selectedGrade) : null;
        const tableOptions = { reorderable: true, linkable: true, editable: true, deleteable: true };
        const correctOptionIds = filteredOptions.filter(o => o.correct).map(o => o.id);

        const selectedStudentName = selectedStudentId ? studentsWithAttempts.find(s => s.id === selectedStudentId)?.name : null;
        const attemptsForSelectedStudent = selectedStudentId ? subjectLessonAttempts.filter(a => a.userId === selectedStudentId) : [];
        const selectedAttempt = selectedAttemptId ? subjectLessonAttempts.find(a => a.id === selectedAttemptId) : null;

        return (
            <div className="kt-portlet kt-portlet--mobile">
                <div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Student Learning</h3></div></div>
                <div className="kt-portlet__body">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <button onClick={() => this.scrollBy(-400)} className="btn btn-sm btn-icon btn-light mr-2" title="Scroll Left"><i className="la la-angle-left"></i></button>
                        <div ref={this.scrollContainerRef} className="scrolling-wrapper" style={{ flexGrow: 1, minHeight: "calc(70vh + 100px)" }}>
                            <div className="col-md-3 col-sm-12 col-xs-12"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Grades</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addGradeModalRef.current.show()} title="Add Grade"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="grades" onSearch={this.onGradeSearch} value={gradeSearchTerm} /><Table listId="grades-list" headers={[{ label: "Name", key: "name" }]} data={grades} selectedItemId={selectedGrade} show={this.handleGradeSelect} edit={grade => this.setState({ gradeToEdit: grade }, () => this.editGradeModalRef.current.show())} delete={grade => this.setState({ gradeToDelete: grade }, () => this.deleteGradeModalRef.current.show())} onOrderChange={(list) => this._handleReorder('grades', list)} options={tableOptions} /></div></div>
                            {selectedGrade && (<div className="col-md-3 col-sm-12 col-xs-12"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">{(selectedGradeObj?.name) || '...'} Subjects</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addSubjectModalRef.current.show()} title="Add Subject"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="subjects" onSearch={this.onSubjectSearch} value={subjectSearchTerm} /><Table listId={`subjects-list-${selectedGrade}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubjects} options={tableOptions} selectedItemId={selectedSubject} show={this.handleSubjectSelect} edit={subject => this.setState({ subjectToEdit: subject }, () => this.editSubjectModalRef.current.show())} delete={subject => this.setState({ subjectToDelete: subject }, () => this.deleteSubjectModalRef.current.show())} onOrderChange={(list) => this._handleReorder('subjects', list)} /></div></div>)}
                            {selectedSubject && (<div className="col-md-7" style={{ whiteSpace: 'normal' }}><div className="kt-portlet kt-portlet--tabs"><div className="kt-portlet__head"><div className="kt-portlet__head-toolbar"><ul className="nav nav-tabs nav-tabs-line nav-tabs-line-info" role="tablist"><li className="nav-item"><a className={`nav-link ${activeTab === 'content' ? 'active' : ''}`} onClick={() => this.handleTabChange('content')} role="tab"><i className="la la-list"></i> Content </a></li><li className="nav-item"><a className={`nav-link ${activeTab === 'responses' ? 'active' : ''}`} onClick={() => this.handleTabChange('responses')} role="tab"><i className="la la-graduation-cap"></i> Student Attempts </a></li></ul></div></div><div className="kt-portlet__body"><div className="tab-content">
                                <div className={`tab-pane ${activeTab === 'content' ? 'active' : ''}`} role="tabpanel"><div className="d-flex flex-row flex-nowrap">{selectedSubject && <div className="col-md-6 col-lg-6 col-sm-12 col-xl-6 col-xs-12"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Strands</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addTopicModalRef.current.show()} title="Add Topic"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="topics" onSearch={this.onTopicSearch} value={topicSearchTerm} /><Table listId={`topics-list-${selectedSubject}`} headers={[{ label: "Name", key: "name" }]} data={filteredTopics} options={tableOptions} selectedItemId={selectedTopic} show={this.handleTopicSelect} edit={topic => this.setState({ topicToEdit: topic }, () => this.editTopicModalRef.current.show())} delete={topic => this.setState({ topicToDelete: topic }, () => this.deleteTopicModalRef.current.show())} onOrderChange={(list) => this._handleReorder('topics', list)} /></div></div>}{selectedTopic && <div className="col-md-6 col-lg-6 col-sm-12 col-xl-6 col-xs-12"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Sub Strands</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addSubtopicModalRef.current.show()} title="Add Subtopic"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="subtopics" onSearch={this.onSubtopicSearch} value={subtopicSearchTerm} /><Table listId={`subtopics-list-${selectedTopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredSubtopics} options={tableOptions} selectedItemId={selectedSubtopic} show={this.handleSubtopicSelect} edit={subtopic => this.setState({ subtopicToEdit: subtopic }, () => this.editSubtopicModalRef.current.show())} delete={subtopic => this.setState({ subtopicToDelete: subtopic }, () => this.deleteSubtopicModalRef.current.show())} onOrderChange={(list) => this._handleReorder('subtopics', list)} /></div></div>}{selectedSubtopic && <div className="col-md-9 col-lg-9 col-sm-12 col-xl-6 col-xs-12"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Questions</h3></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addQuestionModalRef.current.show()} title="Add Question"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="questions" onSearch={this.onQuestionSearch} value={questionSearchTerm} /><Table listId={`questions-list-${selectedSubtopic}`} headers={[{ label: "Name", key: "name" }]} data={filteredQuestions} options={tableOptions} selectedItemId={selectedQuestion} show={this.handleQuestionSelect} edit={question => this.setState({ questionToEdit: question }, () => this.editQuestionModalRef.current.show())} delete={question => this.setState({ questionToDelete: question }, () => this.deleteQuestionModalRef.current.show())} onOrderChange={(list) => this._handleReorder('questions', list)} /></div></div>}{selectedQuestion && <div className="col-md-6 col-lg-6 col-sm-12 col-xl-6 col-xs-12"><div className="kt-portlet__head"><div className="kt-portlet__head-label"><div className="kt-portlet__head-title">Options</div></div><div style={{ paddingTop: 10 }}><button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addOptionModalRef.current.show()} title="Add Option"><i className="la la-plus-circle"></i></button></div></div><div className="kt-portlet__body"><Search title="options" onSearch={this.onOptionSearch} value={optionSearchTerm} /><Table listId={`options-list-${selectedQuestion}`} headers={[{ label: "Answer", key: "value" }]} data={filteredOptions} options={{ ...tableOptions, linkable: false }} edit={option => this.setState({ optionToEdit: option }, () => this.editOptionModalRef.current.show())} delete={option => this.setState({ optionToDelete: option }, () => this.deleteOptionModalRef.current.show())} onOrderChange={(list) => this._handleReorder('options', list)} correctItemIds={correctOptionIds} /></div></div>}</div></div>
                                <div className={`tab-pane ${activeTab === 'responses' ? 'active' : ''}`} role="tabpanel">
                                    <div className="row">
                                        <div className="col-md-3"><h6 className="mb-3">Students</h6><div className="list-group" style={{ maxHeight: '60vh', overflowY: 'auto' }}>{studentsWithAttempts.length > 0 ? studentsWithAttempts.map(student => (<a key={student.id} className={`list-group-item list-group-item-action ${selectedStudentId === student.id ? 'active' : ''}`} onClick={() => this.handleStudentSelect(student.id)}>{student.name}</a>)) : <p className="text-muted p-2">No student attempts for this subject yet.</p>}</div></div>
                                        <div className="col-md-3"><h6 className="mb-3">{selectedStudentName ? `${selectedStudentName}'s Attempts` : 'Select a Student'}</h6>{selectedStudentId && (<div className="list-group" style={{ maxHeight: '60vh', overflowY: 'auto' }}>{attemptsForSelectedStudent.length > 0 ? attemptsForSelectedStudent.map((attempt, index) => (<a key={attempt.id} className={`list-group-item list-group-item-action ${selectedAttemptId === attempt.id ? 'active' : ''}`} onClick={() => this.handleAttemptSelect(attempt.id)}><div>Attempt {index + 1} - <span className="font-weight-bold">Score: {attempt.finalScore}</span></div><small className="text-muted">{new Date(attempt.startedAt).toLocaleString()}</small></a>)) : <p className="text-muted p-2">No attempts found.</p>}</div>)}</div>
                                        <div className="col-md-6"><h6 className="mb-3">{selectedAttempt ? `Attempt Timeline` : 'Select an Attempt'}</h6>{selectedAttempt && (<div style={{ maxHeight: '60vh', overflowY: 'auto', background: '#f7f8fa', padding: '15px', borderRadius: '4px' }}><div className="timeline">{(selectedAttempt.attemptEvents || []).map(event => { const { question, breadcrumbs } = this.findQuestionDetails(event.questionId); return (<div key={event.id} className="timeline-item"><div className={`timeline-icon ${event.isCorrect ? 'correct' : 'incorrect'}`}><i className={`la ${event.isCorrect ? 'la-check' : 'la-times'}`}></i></div><div className="timeline-content"><div className="timeline-breadcrumbs"><i className="la la-folder-open"></i> {breadcrumbs}</div><div className="timeline-question">{question ? question.name : 'Question not found'}</div><div className="timeline-answer">{this.renderAnswerContent(event.userAnswer)}</div><div className="text-muted small mt-2 text-right">{new Date(event.eventTimestamp).toLocaleTimeString()}</div></div></div>); })}</div></div>)}</div>
                                    </div>
                                </div>
                            </div></div></div></div>)}
                        </div>
                        <button onClick={() => this.scrollBy(400)} className="btn btn-sm btn-icon btn-light ml-2" title="Scroll Right"><i className="la la-angle-right"></i></button>
                    </div>
                </div>

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

export default BasicTable;