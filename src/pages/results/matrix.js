import React from "react";
import Data from "../../utils/data";
import ReportCard from "./components/ReportCard";
import ResultsGrid from "./components/ResultsGrid";
import BulkReportSmsModal from "../../components/reports/BulkReportSmsModal";

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

    // Single Report Actions
    printingStudentId: null,
    showSingleSmsModal: false,
    selectedStudentForSms: null,
    smsMessage: "",
    bulkSmsRecipients: [],
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
    
    // Load persisted state or defaults
    const persistedClass = localStorage.getItem('matrix_selectedClass');
    const persistedTerm = localStorage.getItem('matrix_selectedTerm');
    const persistedType = localStorage.getItem('matrix_selectedAssessmentType');

    this.setState({ 
        schoolInfo,
        selectedClass: persistedClass || "",
        selectedTerm: persistedTerm || "",
        selectedAssessmentType: persistedType || ""
    });

    setTimeout(() => {
        const { selectedClass, selectedTerm, selectedAssessmentType, classes, terms, assessmentTypes } = this.state;
        
        let updates = {};
        if (!selectedClass && classes?.length > 0) updates.selectedClass = classes[0].id;
        if (!selectedTerm && terms?.length > 0) updates.selectedTerm = terms[0].id;
        if (!selectedAssessmentType && assessmentTypes?.length > 0) updates.selectedAssessmentType = assessmentTypes[0].id;

        if (Object.keys(updates).length > 0) {
            this.setState(updates);
        }
        this.setState({ loading: false });
    }, 2000);
  }
  
  componentDidUpdate(prevProps, prevState) {
      // Persist changes
      if (this.state.selectedClass !== prevState.selectedClass) localStorage.setItem('matrix_selectedClass', this.state.selectedClass);
      if (this.state.selectedTerm !== prevState.selectedTerm) localStorage.setItem('matrix_selectedTerm', this.state.selectedTerm);
      if (this.state.selectedAssessmentType !== prevState.selectedAssessmentType) localStorage.setItem('matrix_selectedAssessmentType', this.state.selectedAssessmentType);

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
      const { selectedClass, selectedTerm } = this.state;
      if (!selectedClass || !selectedTerm) return;

      this.setState({ fetchingAssessments: true });
      try {
           if (Data.assessments.getForClass) { 
               // Pass termId to specifically catch current data faster
               await Data.assessments.getForClass(selectedClass, selectedTerm);
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
      let newEdits = { ...edits };

      const payloadBase = {
          school: localStorage.getItem('school'),
          term: selectedTerm,
          assessmentType: selectedAssessmentType,
          outOf: 100
      };

      try {
          // Process sequentially to be safe and avoid race conditions or overwhelming the server
          for (const key of editKeys) {
              const [studentId, subjectId] = key.split('-');
              const scoreVal = edits[key];
              
              if (scoreVal === "" || scoreVal === null) {
                  delete newEdits[key];
                  continue; 
              }

              // Check if exists
              const existing = assessments.find(a => 
                (a.student === studentId || a.student?.id === studentId) &&
                (a.subject === subjectId || a.subject?.id === subjectId) &&
                (a.term === selectedTerm || a.term?.id === selectedTerm) &&
                (a.assessmentType === selectedAssessmentType || a.assessmentType?.id === selectedAssessmentType)
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
                  delete newEdits[key]; // Success, remove from items to edit
              } catch (e) {
                  console.error(`Failed to save ${key}:`, e);
                  failCount++;
                  // Keep in newEdits so user doesn't lose data and can retry
              }
          }

          if (window.toastr) {
              if (failCount === 0) window.toastr.success(`Saved ${successCount} scores successfully.`);
              else window.toastr.warning(`Saved ${successCount}, Failed ${failCount}. Please check the fields that didn't save.`);
          }
          
          this.setState({ edits: newEdits });

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

  initiateBulkResultsSms = () => {
      const { assessments, selectedTerm, terms, subjects, assessmentRubrics, assessmentTypes } = this.state;
      const students = this.getFilteredStudents();
      const currentTerm = (terms || []).find(t => t.id === selectedTerm) || { name: 'Term' };

      if (!students.length) {
          if (window.toastr) window.toastr.warning("No students found in this class.");
          return;
      }

      const recipients = students.map(student => {
          // Filter assessments for this student and term
          const studentAss = (assessments || []).filter(a =>
              (a.student === student.id || a.student?.id === student.id) &&
              (a.term === selectedTerm || a.term?.id === selectedTerm)
          );

          // Build a comprehensive per-subject breakdown (matching ReportCard)
          let subjectLines = [];
          let totalPoints = 0;

          subjects.forEach(subj => {
              // Collect scores across all assessment types for this subject
              const typeScores = (assessmentTypes || []).map(type => {
                  const a = studentAss.find(a =>
                      (a.subject === subj.id || a.subject?.id === subj.id) &&
                      (a.assessmentType === type.id || a.assessmentType?.id === type.id)
                  );
                  const score = a ? parseFloat(a.score) : null;
                  const rubric = score !== null ? (assessmentRubrics || []).find(r => score >= r.minScore && score <= r.maxScore) : null;
                  if (rubric?.points) totalPoints += parseFloat(rubric.points);
                  return { type, score, rubric };
              });

              // Check for teacher's comment
              const withComment = studentAss.find(a =>
                  (a.subject === subj.id || a.subject?.id === subj.id) && a.teachersComment
              );
              const comment = withComment?.teachersComment;

              // Build subject score string: "Math: 85(EE) 90(ME)"
              const scoresStr = typeScores
                  .filter(ts => ts.score !== null)
                  .map(ts => `${ts.score}${ts.rubric?.label ? '(' + ts.rubric.label + ')' : ''}`)
                  .join('/');
              
              if (scoresStr) {
                  subjectLines.push(`${subj.name}: ${scoresStr}${comment ? ' - ' + comment : ''}`);
              }
          });

          const studentName = student.names || 'Student';
          const className = student.class?.name || '';
          let message = `--- PROGRESS REPORT ---\n`;
          message += `Student: ${studentName}${className ? ` (${className})` : ''}\n`;
          message += `Term: ${currentTerm.name}\n\n`;
          if (subjectLines.length > 0) {
              message += subjectLines.join('\n') + '\n\n';
          } else {
              message += `No scores recorded yet.\n\n`;
          }
          message += `Total Points: ${totalPoints}\n`;
          message += `For the full report, please contact the school.`;

          return {
              id: student.id,
              parentId: student.parent?.id,
              name: student.parent?.name || 'Parent',
              phone: student.parent?.phone || '',
              studentNames: student.names,
              message
          };
      });

      this.setState({
          showBulkModal: true,
          bulkSmsRecipients: recipients
      });
  };

  handleBulkSmsSend = async (finalMessages) => {
      let sentCount = 0;
      let failCount = 0;

      for (const msgObj of finalMessages) {
          try {
              await Data.communication.sms.create({
                  phone: msgObj.phone,
                  message: msgObj.message
              });
              sentCount++;
          } catch (e) {
              console.error(`Failed to send SMS to ${msgObj.phone}:`, e);
              failCount++;
          }
      }

      if (window.toastr) {
          if (failCount === 0) window.toastr.success(`Successfully sent ${sentCount} messages.`);
          else window.toastr.warning(`Sent ${sentCount}, Failed ${failCount}.`);
      }
  };

  handleSaveParentPhone = async (parentId, newPhone) => {
      if (!parentId || !newPhone) return;
      await Data.parents.update({ id: parentId, phone: newPhone });
  };

  sendResultsSMS = async (student) => {
      // ... (existing implementation) ...
      // Keeping this as is, though Bulk is preferred.
      // Re-implement if needed for bulk.
  };

  togglePrintView = () => {
      this.setState(prev => ({ 
          showPrintView: !prev.showPrintView,
          printingStudentId: !prev.showPrintView ? prev.printingStudentId : null // Reset if closing
      }));
  };

  handlePrintSingle = (student) => {
      this.setState({
          printingStudentId: student.id,
          showPrintView: true
      });
  };

  handleSmsClick = (student) => {
      const { assessments, selectedTerm, terms, subjects, assessmentRubrics } = this.state;
      const currentTerm = terms?.find(t => t.id === selectedTerm) || { name: 'Term' };
      
      // Filter assessments for this student and term
      const studentAss = (assessments || []).filter(a => 
          (a.student === student.id || a.student?.id === student.id) &&
          (a.term === selectedTerm || a.term?.id === selectedTerm)
      );

      // Build report string
      let reportParts = [];
      let totalPoints = 0;

      subjects.forEach(subj => {
          const matched = studentAss.find(a => (a.subject === subj.id || a.subject?.id === subj.id));
          if (matched) {
              const score = parseFloat(matched.score);
              const rubric = (assessmentRubrics || []).find(r => score >= r.minScore && score <= r.maxScore);
              if (rubric) {
                  reportParts.push(`${subj.name}: ${score}${rubric.label ? '('+rubric.label+')' : ''}`);
                  if (rubric.points) totalPoints += parseFloat(rubric.points);
              } else {
                  reportParts.push(`${subj.name}: ${score}`);
              }
          }
      });

      const studentFirstName = student.names ? student.names.split(' ')[0] : 'Student';
      const fullMessage = `Results for ${studentFirstName} (${currentTerm.name}): ${reportParts.join(', ')}. Total: ${totalPoints} pts.`;

      this.setState({
          selectedStudentForSms: student,
          smsMessage: fullMessage,
          showSingleSmsModal: true
      });
  };

  sendSingleSms = async () => {
      const { selectedStudentForSms, smsMessage } = this.state;
      if (!selectedStudentForSms?.parent?.phone || !smsMessage) return;

      this.setState({ sendingSms: true });
      try {
          await Data.communication.sms.create({
              phone: selectedStudentForSms.parent.phone,
              message: smsMessage
          });
          if (window.toastr) window.toastr.success(`SMS sent to ${selectedStudentForSms.names}'s parent`);
          this.setState({ showSingleSmsModal: false });
      } catch (e) {
          console.error(e);
          if (window.toastr) window.toastr.error("Failed to send SMS");
      } finally {
          this.setState({ sendingSms: false });
      }
  };

  handlePrint = () => {
      window.print();
  };

  render() {
    const { 
        classes, terms, subjects, grades, assessmentTypes, assessmentRubrics, 
        selectedClass, selectedTerm, selectedAssessmentType, assessments, 
        showPrintView, schoolInfo, edits, loading, fetchingAssessments, saving, 
        showBulkModal, printingStudentId 
    } = this.state;
    const students = this.getFilteredStudents();
    const currentTerm = terms?.find(t => t.id === selectedTerm) || { name: 'Term' };
    const printingStudent = printingStudentId ? students.find(s => s.id === printingStudentId) : null;

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
                        <h4 className="d-inline-block mr-4">
                            {printingStudent ? `Report for ${printingStudent.names}` : `Previewing ${students.length} Reports`}
                        </h4>
                        <button className="btn btn-primary" onClick={this.handlePrint}>
                            <i className="fa fa-print"></i> {printingStudent ? 'Print Report' : 'Print All'}
                        </button>
                    </div>
                </div>
                <div id="print-area">
                    {students.filter(s => !printingStudentId || s.id === printingStudentId).map(student => (
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
                    className="btn btn-success font-weight-bold mr-2"
                    onClick={this.togglePrintView}
                    disabled={!selectedClass || !selectedTerm}
                >
                    <i className="fa fa-print"></i> Print Reports
                </button>

                <button 
                    className="btn btn-primary font-weight-bold"
                    onClick={this.initiateBulkResultsSms}
                    disabled={!selectedClass || !selectedTerm}
                >
                    <i className="fa fa-sms"></i> Bulk SMS Report
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
                            onPrintSingle={this.handlePrintSingle}
                            onSendSms={this.handleSmsClick}
                        />
                    )}
                </div>
            )}
            
            {/* MODALS */}
            {showBulkModal && (
                <BulkReportSmsModal
                    show={showBulkModal}
                    title="Bulk Results Summary SMS"
                    onClose={() => this.setState({ showBulkModal: false })}
                    recipients={this.state.bulkSmsRecipients}
                    onSend={this.handleBulkSmsSend}
                    onSavePhone={this.handleSaveParentPhone}
                />
            )}

            {/* SINGLE SMS MODAL */}
            {this.state.showSingleSmsModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content shadow-lg border-0" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title font-weight-bold" style={{ fontSize: '1.2rem' }}>Send Student Report</h5>
                                <button type="button" className="close" onClick={() => this.setState({ showSingleSmsModal: false })}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body pt-4">
                                <div className="form-group">
                                    <label className="font-weight-bold text-muted small text-uppercase">Recipient</label>
                                    <div className="bg-light p-3 rounded d-flex justify-content-between align-items-center">
                                        <span className="font-weight-bold">{this.state.selectedStudentForSms?.parent?.name || 'Parent'}</span>
                                        <span className="text-primary font-weight-bold">{this.state.selectedStudentForSms?.parent?.phone || 'No Phone'}</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="font-weight-bold text-muted small text-uppercase">Message Content</label>
                                    <textarea 
                                        className="form-control border-0 bg-light" 
                                        rows="6" 
                                        value={this.state.smsMessage}
                                        onChange={(e) => this.setState({ smsMessage: e.target.value })}
                                        style={{ resize: 'none', borderRadius: '10px', fontSize: '0.9rem' }}
                                    ></textarea>
                                    <div className="mt-2 text-right small text-muted">
                                        {this.state.smsMessage.length} characters
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 d-flex justify-content-between">
                                <button type="button" className="btn btn-light-danger font-weight-bold" onClick={() => this.setState({ showSingleSmsModal: false })}>Cancel</button>
                                <button 
                                    type="button" 
                                    className={`btn btn-primary font-weight-bold px-8 ${this.state.sendingSms ? 'spinner spinner-white spinner-right' : ''}`}
                                    onClick={this.sendSingleSms}
                                    disabled={this.state.sendingSms || !this.state.selectedStudentForSms?.parent?.phone}
                                >
                                    Send Report via SMS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  }
}

export default ResultsMatrix;
