import React from "react";
import Data from "../../utils/data";
import ReportCard from "./components/ReportCard";

class ResultsMatrix extends React.Component {
  state = {
    classes: [],
    terms: [],
    subjects: [],
    grades: [],
    students: [],
    assessments: [], // Full list (or filtered list from getForClass)

    selectedClass: "",
    selectedTerm: "",
    selectedAssessmentType: "",
    
    assessmentTypes: [],
    assessmentRubrics: [],
    
    // Grid View State
    edits: {}, // { "studentId-subjectId": score }
    
    loading: true,
    saving: false,
    sendingSms: false,
    showPrintView: false,
    schoolInfo: null,
    fetchingAssessments: false,
    showBulkModal: false,
  };

  componentDidMount() {
    // Configure Toastr options to match project style
    if (window.toastr) {
        window.toastr.options = {
            closeButton: true,
            debug: false,
            newestOnTop: false,
            progressBar: false,
            positionClass: "toast-bottom-right",
            preventDuplicates: false,
            onclick: null,
            showDuration: "300",
            hideDuration: "1000",
            timeOut: "5000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
        };
    }

    // 1. Subscribe to necessary data
    this.unsubClasses = Data.classes.subscribe(({ classes }) => this.setState({ classes }));
    this.unsubTerms = Data.terms?.subscribe(({ terms }) => this.setState({ terms }));
    this.unsubGrades = Data.grades?.subscribe(({ grades }) => this.setState({ grades }));
    this.unsubSubjects = Data.subjects?.subscribe(({ subjects }) => this.setState({ subjects }));
    this.unsubStudents = Data.students.subscribe(({ students }) => this.setState({ students }));
    this.unsubAssessments = Data.assessments.subscribe(({ assessments }) => this.setState({ assessments }));
    this.unsubAssessmentTypes = Data.assessmentTypes.subscribe(({ assessmentTypes }) => {
        this.setState({ assessmentTypes });
        if (assessmentTypes && assessmentTypes.length > 0 && !this.state.selectedAssessmentType) {
            this.setState({ selectedAssessmentType: assessmentTypes[0].id });
        }
    });
    this.unsubAssessmentRubrics = Data.assessmentRubrics.subscribe(({ assessmentRubrics }) => this.setState({ assessmentRubrics }));

    // Get school info for reports
    const schoolInfo = Data.schools.getSelected();
    this.setState({ schoolInfo });

    setTimeout(() => this.setState({ loading: false }), 2000);
  }
  
  componentDidUpdate(prevProps, prevState) {
      // Fetch assessments when class or term changes
      if (
          (this.state.selectedClass && this.state.selectedTerm) &&
          (this.state.selectedClass !== prevState.selectedClass || this.state.selectedTerm !== prevState.selectedTerm)
      ) {
          this.fetchAssessments();
      }
  }

  componentWillUnmount() {
      if (this.unsubClasses) this.unsubClasses();
      if (this.unsubTerms) this.unsubTerms();
      if (this.unsubGrades) this.unsubGrades();
      if (this.unsubSubjects) this.unsubSubjects();
      if (this.unsubStudents) this.unsubStudents();
      if (this.unsubAssessments) this.unsubAssessments();
      if (this.unsubAssessmentTypes) this.unsubAssessmentTypes();
      if (this.unsubAssessmentRubrics) this.unsubAssessmentRubrics();
  }

  fetchAssessments = async () => {
      const { selectedClass } = this.state;
      if (!selectedClass) return;

      this.setState({ fetchingAssessments: true });
      try {
          // Fetch ALL terms to support history/trends
           if (Data.assessments.getForClass) { 
               await Data.assessments.getForClass(selectedClass, null);
           } else {
               console.warn("getForClass method missing on Data.assessments");
           }
      } catch (e) {
          console.error("Error fetching assessments:", e);
          if (window.toastr) window.toastr.error("Failed to load scores");
      } finally {
          this.setState({ fetchingAssessments: false });
      }
  };

  // ...


  getFilteredStudents = () => {
    const { students, selectedClass } = this.state;
    if (!selectedClass) return [];
    return students.filter(s => s.class?.id === selectedClass || s.class === selectedClass);
  };

  // Called by grid when a cell is edited
  handleScoreChange = (studentId, subjectId, val) => {
      this.setState(prev => ({
          edits: {
              ...prev.edits,
              [`${studentId}-${subjectId}`]: val
          }
      }));
  };
  
  // Called by "Save Changes" button
  saveAllChanges = async () => {
      const { edits, selectedTerm, selectedAssessmentType, assessments } = this.state;
      const editKeys = Object.keys(edits);
      
      if (editKeys.length === 0) {
          if (window.toastr) window.toastr.info("No changes to save.");
          return;
      }
      
      this.setState({ saving: true });
      let successCount = 0;
      let failCount = 0;

      // Process sequentially or parallel? Parallel might be faster but could hit rate limits if many.
      // Let's do parallel chunks or just all.
      
      const payloadBase = {
          school: localStorage.getItem('school'),
          term: selectedTerm,
          assessmentType: selectedAssessmentType,
          outOf: 100
      };

      try {
          const promises = editKeys.map(async (key) => {
              const [studentId, subjectId] = key.split('-');
              const scoreVal = edits[key];
              
              if (scoreVal === "" || scoreVal === null) return; // Skip empty? Or maybe delete?

              // Check if exists
              const existing = assessments.find(a => 
                (a.student === studentId || a.student?.id === studentId) &&
                (a.subject === subjectId || a.subject?.id === subjectId) &&
                (a.term === selectedTerm || a.term?.id === selectedTerm)
              );

              const payload = {
                  ...payloadBase,
                  student: studentId,
                  subject: subjectId,
                  score: parseFloat(scoreVal),
              };

              try {
                  if (existing) {
                      await Data.assessments.update({ ...payload, id: existing.id });
                  } else {
                      await Data.assessments.create(payload);
                  }
                  successCount++;
              } catch (e) {
                  console.error(e);
                  failCount++;
              }
          });

          await Promise.all(promises);

          if (window.toastr) {
              if (failCount === 0) window.toastr.success(`Saved ${successCount} scores successfully.`);
              else window.toastr.warning(`Saved ${successCount}, Failed ${failCount}.`);
          }
          
          // Clear edits on success
          this.setState({ edits: {} });

      } catch (e) {
          console.error(e);
          if (window.toastr) window.toastr.error("Error saving changes.");
      } finally {
          this.setState({ saving: false });
      }
  };

  handleBulkSend = async (template) => {
      const { assessments, selectedTerm, terms } = this.state;
      const students = this.getFilteredStudents();
      const currentTerm = (terms || []).find(t => t.id === selectedTerm);
      const termName = currentTerm ? currentTerm.name : "Term";

      if (window.toastr) window.toastr.info(`Sending SMS to ${(students || []).length} parents...`);

      let sentCount = 0;
      let failCount = 0;

      // Process in sequence to limit rate
      for (const student of (students || [])) {
          if (!student?.parent?.phone) continue;

           // Calc mean
           const studentScores = (assessments || []).filter(a => 
            (a.student === student.id || a.student?.id === student.id) &&
            (a.term === selectedTerm || a.term?.id === selectedTerm)
           );
           
           let total=0, count=0;
           studentScores.forEach(s => {
               const v = parseInt(s?.score,10);
               if(!isNaN(v)) { total+=v; count++; }
           });
           const mean = count>0 ? Math.round(total/count) : 0;
           
           let grade = 'E';
           if (mean >= 80) grade = 'A';
           else if (mean >= 70) grade = 'B';
           else if (mean >= 60) grade = 'C';
           else if (mean >= 50) grade = 'D';
           
           const studentFirstName = student.names ? student.names.split(' ')[0] : 'Student';
           const msg = template
                .replace(/\[Name\]/g, studentFirstName)
                .replace(/\[Mean\]/g, mean)
                .replace(/\[Grade\]/g, grade)
                .replace(/\[Term\]/g, termName);
            
            try {
                await Data.communication.sms.create({
                    phone: student.parent.phone,
                    message: msg
                });
                sentCount++;
            } catch(e) {
                console.error(e);
                failCount++;
            }
      }
      
      if(window.toastr) window.toastr.success(`Sent: ${sentCount}, Failed: ${failCount}`);
      this.setState({ showBulkModal: false });
  };

  sendResultsSMS = async (student) => {
      // ... (existing implementation) ...
      // Keeping this as is, though Bulk is preferred.
      // Re-implement if needed for bulk.
  };

  togglePrintView = () => {
      this.setState(prev => ({ showPrintView: !prev.showPrintView }));
  };

  handlePrint = () => {
      window.print();
  };

  render() {
    const { classes, terms, subjects, grades, assessmentTypes, assessmentRubrics, selectedClass, selectedTerm, selectedAssessmentType, assessments, showPrintView, schoolInfo, edits, loading, fetchingAssessments, saving, showBulkModal } = this.state;
    const students = this.getFilteredStudents();
    const currentTerm = terms?.find(t => t.id === selectedTerm) || { name: 'Term' };

    // Find the linked grade for the selected class to filter subjects
    const cls = classes.find(c => c.id === selectedClass);
    let filteredSubjectsList = subjects;
    if (cls && cls.grade) {
        const linkedGrade = grades.find(g => g.id === cls.grade);
        if (linkedGrade && linkedGrade.subjects) {
            // Get the list of subject IDs linked to that grade
            const gradeSubjectIds = new Set(linkedGrade.subjects.map(s => s.id));
            filteredSubjectsList = subjects.filter(s => gradeSubjectIds.has(s.id));
        }
    }

    // Filter assessments for the current view (important if we have mixed data)
    // Actually ResultsGrid handles lookup, passing full assessments array is fine if performance allows.
    // Optimization: Filter passed assessments to only relevant ones for faster lookup.
    const currentViewAssessments = (assessments || []).filter(a => 
        (a.term === selectedTerm || a.term?.id === selectedTerm) &&
        (a.assessmentType === selectedAssessmentType || a.assessmentType?.id === selectedAssessmentType)
    );

    if (showPrintView) {
        return (
            <div className="bg-white">
                <div className="d-print-none p-4 border-bottom mb-4 d-flex justify-content-between align-items-center">
                    <button className="btn btn-secondary" onClick={this.togglePrintView}>
                        <i className="fa fa-arrow-left"></i> Back to Editing
                    </button>
                    <div>
                        <h4 className="d-inline-block mr-4">Previewing {students.length} Reports</h4>
                        <button className="btn btn-primary" onClick={this.handlePrint}>
                            <i className="fa fa-print"></i> Print All
                        </button>
                    </div>
                </div>
                <div id="print-area">
                    {students.map(student => (
                        <ReportCard 
                            key={student.id}
                            student={student}
                            term={currentTerm}
                            assessments={assessments}
                            subjects={filteredSubjectsList}
                            rubrics={assessmentRubrics}
                            assessmentTypes={assessmentTypes}
                            school={schoolInfo}
                        />
                    ))}
                    {students.length === 0 && <div className="p-5 text-center">No students found in this class.</div>}
                </div>
                <style>{`
                    @media print {
                        .d-print-none, .kt-header, .kt-aside, .kt-footer, .kt-subheader { display: none !important; }
                        body, .kt-content, .kt-container { background: white !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
                        #kt_wrapper { padding: 0 !important; margin: 0 !important; }
                        .report-card-container { page-break-after: always; width: 100% !important; height: 100vh; }
                    }
                `}</style>
            </div>
        );
    }
    
    // Dynamically import ResultsGrid here or at top. At top is better. 
    // Assuming imported at top.
    const ResultsGrid = require('./components/ResultsGrid').default;
    const BulkMessageModal = require('./components/BulkMessageModal').default;

    return (
      <div className="card card-custom">
        <div className="card-header">
            <h3 className="card-title">Results Management</h3>
            <div className="card-toolbar">
                 {/* SAVE BUTTON */}
                {Object.keys(edits).length > 0 && (
                    <button 
                        className={`btn btn-primary font-weight-bold mr-2 ${saving ? 'spinner spinner-white spinner-right' : ''}`}
                        onClick={this.saveAllChanges}
                        disabled={saving}
                    >
                        <i className="fa fa-save"></i> Save Changes ({Object.keys(edits).length})
                    </button>
                )}
                
                <button 
                    className="btn btn-success font-weight-bold"
                    onClick={this.togglePrintView}
                    disabled={!selectedClass || !selectedTerm}
                >
                    <i className="fa fa-print"></i> Print Reports
                </button>
            </div>
        </div>
        <div className="card-body">
            {/* --- FILTERS --- */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <label>Term</label>
                    <select className="form-control" value={selectedTerm} onChange={e => this.setState({ selectedTerm: e.target.value })}>
                        <option value="">Select Term...</option>
                        {terms && terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div className="col-md-3">
                    <label>Class</label>
                    <select className="form-control" value={selectedClass} onChange={e => this.setState({ selectedClass: e.target.value })}>
                        <option value="">Select Class...</option>
                        {(classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="col-md-3">
                    <label>Assessment Type</label>
                    <select className="form-control" value={selectedAssessmentType} onChange={e => this.setState({ selectedAssessmentType: e.target.value })}>
                        <option value="">Select Type...</option>
                        {assessmentTypes && assessmentTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.percentage}%)</option>)}
                    </select>
                </div>
                <div className="col-md-3">
                   <label className="text-muted">Mode: Grid View</label>
                </div>
            </div>

            {/* --- DATA GRID --- */}
            {(!selectedClass || !selectedTerm) && (
                <div className="alert alert-light-primary text-center">
                    Please select a Term and Class to load the score sheet.
                </div>
            )}

            {selectedClass && selectedTerm && (
                <div>
                    {fetchingAssessments && <div className="text-center p-3"><span className="spinner spinner-primary mr-3"></span>Loading scores...</div>}
                    
                    {!fetchingAssessments && (
                        <ResultsGrid
                            students={students}
                            subjects={filteredSubjectsList}
                            assessments={currentViewAssessments}
                            rubrics={assessmentRubrics}
                            updates={edits}
                            onScoreChange={this.handleScoreChange}
                        />
                    )}
                </div>
            )}
            
            {/* MODALS */}
            {showBulkModal && (
                <BulkMessageModal
                    show={showBulkModal}
                    onClose={() => this.setState({ showBulkModal: false })}
                    students={students}
                    term={currentTerm}
                    assessments={assessments}
                    subjects={subjects}
                    onSend={this.handleBulkSend}
                />
            )}
        </div>
      </div>
    );
  }
}

export default ResultsMatrix;
