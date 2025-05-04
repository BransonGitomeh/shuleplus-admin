import React from "react";
import ErrorMessage from "../components/error-toast";

// --- Draft.js and react-draft-wysiwyg Imports ---
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import { stateToHTML } from 'draft-js-export-html'; // To convert EditorState to HTML for saving
import htmlToDraft from 'html-to-draftjs'; // Only needed if loading existing HTML content
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"; // Import editor styles
// --- End Imports ---

const IErrorMessage = new ErrorMessage();

const $ = window.$;

// Keep existing variables and logic
const types = ['SINGLECHOICE', 'MULTICHOICE'];
let selectedGrade = null;
let selectedSubject = null;
let selectedTopic = null;
let selectedSubtopic = null;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  // --- Updated State ---
  state = {
    loading: false,
    // question.name will still hold the final HTML output for submission
    question: {
      name: "", // HTML content derived from editorState
      subtopic: "",
      type: "",
    },
    // Add editorState for react-draft-wysiwyg
    editorState: EditorState.createEmpty(), // Initialize editor state
    grade: "",
    subject: "",
    subjects: [],
    topic: "",
    topics: [],
    subtopics: [],
  };
  // --- End Updated State ---


  // --- NEW: Editor State Handler ---
  onEditorStateChange = (editorState) => {
    this.setState({
      editorState, // Update the editor state
    });
    // Convert the new editor state to HTML and update the question.name state
    // This keeps the submission logic compatible with expecting HTML in question.name
    const htmlContent = stateToHTML(editorState.getCurrentContent());
    this.setState(prevState => ({
        question: {
            ...prevState.question,
            name: htmlContent
        }
    }));
  };
  // --- End Editor State Handler ---

  // Keep existing methods (setSubjects, setTopics, setSubtopics) exactly as they are
  show() {
    // Reset editor state when showing the modal for a new question
    this.setState({ editorState: EditorState.createEmpty(), question: { name: "", subtopic: this.state.question.subtopic, type: this.state.question.type } });
    $("#" + modalNumber).modal({
      show: true,
      backdrop: "static",
      keyboard: false
    });
  }

  hide() {
    $("#" + modalNumber).modal("hide");
    // Optionally reset state fully on hide as well, though submit/show handles it
    // this.resetState();
  }

  // Helper to reset state (used in submit and potentially hide/show)
  resetState = () => {
    this.setState({
        loading: false,
        question: { name: "", subtopic: "", type: "" },
        editorState: EditorState.createEmpty(), // Reset editor state
        grade: "",
        subject: "",
        subjects: [],
        topic: "",
        topics: [],
        subtopics: [],
      });
      selectedGrade = null;
      selectedSubject = null;
      selectedTopic = null;
      selectedSubtopic = null;
  }

  setSubjects(id) {
    const grade = this.props.grades.filter(grade => grade.id == id);
    if (grade.length) {
      this.setState({
        subject: "",
        subjects: grade[0].subjects,
        topic: "",
        topics: [],
        subtopic: "", // Reset subtopic selection derived from state
        subtopics: [],
         // Also reset question.subtopic if it's tied directly
        question: { ...this.state.question, subtopic: "" }
      });
    }
  }

  setTopics(id) {
    const subject = this.state.subjects.filter(subject => subject.id == id);
    if (subject.length) {
      this.setState({
        topic: "",
        topics: subject[0].topics,
        subtopics: [],
         // Reset question.subtopic when topic changes
        question: { ...this.state.question, subtopic: "" }
      });
    }
  }

  setSubtopics(id) {
    const topic = this.state.topics.filter(topic => topic.id == id);
    if (topic.length) {
      this.setState({ subtopics: topic[0].subtopics });
       // Reset question.subtopic when subtopic list changes before selection
       this.setState(prevState => ({
         question: { ...prevState.question, subtopic: "" }
       }));
    }
  }

  // Keep existing componentDidUpdate exactly as it is (it updates dropdown data)
  // It implicitly relies on dropdown changes resetting lower levels.
  // Note: If props could set an *initial* subtopic for editing, we might need
  // to handle that differently now that question.subtopic is directly bound.
   componentDidUpdate(prevProps) {
    const _this = this;
    // Grade change
    if (_this.props.grade !== prevProps.grade && _this.props.grade !== selectedGrade) {
      selectedGrade = _this.props.grade;
      const selectedGradeData = _this.props.grades.find(grade => grade.id == selectedGrade);
      _this.setState({
        grade: selectedGrade || "",
        subjects: selectedGradeData ? selectedGradeData.subjects : [],
        subject: "", // Reset lower levels
        topics: [],
        topic: "",
        subtopics: [],
        question: { ..._this.state.question, subtopic: "" } // Reset question subtopic
      });
      selectedSubject = null; // Ensure lower level trackers are reset
      selectedTopic = null;
      selectedSubtopic = null;
    }

    // Subject change (based on state.subjects having been updated)
    if (_this.props.subject !== prevProps.subject && _this.props.subject !== selectedSubject) {
      selectedSubject = _this.props.subject;
      const selectedSubjectData = _this.state.subjects.find(subject => subject.id == selectedSubject);
      _this.setState({
        subject: selectedSubject || "",
        topics: selectedSubjectData ? selectedSubjectData.topics : [],
        topic: "", // Reset lower levels
        subtopics: [],
        question: { ..._this.state.question, subtopic: "" } // Reset question subtopic
      });
       selectedTopic = null; // Ensure lower level trackers are reset
       selectedSubtopic = null;
    }

    // Topic change (based on state.topics having been updated)
    if (_this.props.topic !== prevProps.topic && _this.props.topic !== selectedTopic) {
      selectedTopic = _this.props.topic;
      const selectedTopicData = _this.state.topics.find(topic => topic.id == selectedTopic);
       _this.setState({
        topic: selectedTopic || "",
        subtopics: selectedTopicData ? selectedTopicData.subtopics : [],
        question: { ..._this.state.question, subtopic: "" } // Reset question subtopic
      });
      selectedSubtopic = null; // Ensure lower level tracker is reset
    }

    // Subtopic change (selected via props, perhaps for default selection?)
     if (_this.props.subtopic !== prevProps.subtopic && _this.props.subtopic !== selectedSubtopic) {
       selectedSubtopic = _this.props.subtopic;
       // Update question.subtopic if the prop changes (might be for setting default)
       _this.setState(prevState => ({
           question: { ...prevState.question, subtopic: selectedSubtopic || "" }
       }));
     }
  }

  // Keep existing componentDidMount (including validation setup) exactly as it is
  componentDidMount() {
    const _this = this;
    this.validator = $("#" + modalNumber + "form").validate({
      errorClass: "invalid-feedback",
      errorElement: "div",

      highlight: function (element) {
        // Avoid highlighting the editor wrapper/toolbar etc.
        if (!$(element).closest('.rdw-editor-wrapper').length) {
            $(element).addClass("is-invalid");
        }
      },
      unhighlight: function (element) {
         if (!$(element).closest('.rdw-editor-wrapper').length) {
            $(element).removeClass("is-invalid");
        }
      },
      // Ignore the editor wrapper for validation focusing, rely on manual check
       ignore: ".rdw-editor-wrapper *, .wysiwyg-content",

      // --- Updated submitHandler ---
      async submitHandler(form, event) {
        event.preventDefault();

         // --- Manual check for empty editor content using EditorState ---
         const contentState = _this.state.editorState.getCurrentContent();
         if (!contentState.hasText() && contentState.getBlockMap().first().getType() !== 'atomic') {
             // Only show error if there's no text and no 'atomic' blocks (like images/media)
             IErrorMessage.show({ message: "Question content cannot be empty." });
             // Optionally focus the editor
             // _this.editorReference.focus(); // Requires setting a ref on the Editor component
             return; // Prevent submission if empty
         }
         // --- End Manual Check ---

        try {
          _this.setState({ loading: true });

          // Prepare the question data (name already has HTML from onEditorStateChange)
          const questionToSave = { ..._this.state.question };
          delete questionToSave.id; // Ensure no ID is sent for creation

          await _this.props.save(questionToSave); // Pass the question state
          _this.hide();
          _this.resetState(); // Use the reset helper

        } catch (error) {
          _this.setState({ loading: false });
          if (error) {
            const message = error.message || "An unexpected error occurred saving the question.";
            return IErrorMessage.show({ message });
          }
          IErrorMessage.show({ message: "An error occurred." }); // Generic fallback
        }
      }
      // --- End Updated submitHandler ---
    });
  }

  // ========================================================================
  // ===== ONLY RENDER METHOD IS MODIFIED FOR JSX/STYLING CHANGES =========
  // ========================================================================
  render() {
    return (
      <div>
        <div
          className="modal"
          id={modalNumber}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="myLargeModalLabel"
          aria-hidden="true"
        >
          {/* Increased modal size using bootstrap class */}
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form
                id={modalNumber + "form"}
                className="kt-form kt-form--label-right"
                onSubmit={e => e.preventDefault()} // Prevent default HTML submission
                noValidate // Disable browser validation, rely on jquery-validate + manual check
              >
                <div className="modal-header">
                  <h5 className="modal-title">New Content</h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={this.hide}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="kt-portlet__body">
                    <div className="form-group row">
                      <div className="col-lg-12">
                        {/* --- react-draft-wysiwyg EDITOR --- */}
                        <div style={{ border: '1px solid #ced4da', borderRadius: '.25rem', minHeight: '250px' }}>
                          <Editor
                            editorState={this.state.editorState}
                            onEditorStateChange={this.onEditorStateChange}
                            wrapperClassName="wrapper-class" // Optional: for styling wrapper
                            editorClassName="editor-class"   // Optional: for styling editor area
                            toolbarClassName="toolbar-class" // Optional: for styling toolbar
                             // Set a reference if you need to focus it programmatically
                            // ref={(ref) => this.editorReference = ref}
                            toolbar={{
                                // Customize toolbar options if needed
                                options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'link', 'emoji', 'image', 'history'],
                                inline: { options: ['bold', 'italic', 'underline', 'strikethrough'] },
                                // Basic image upload (requires configuration on backend/props) - This is a placeholder
                                image: {
                                    // uploadCallback: uploadImageCallBack, // You'd need to define this function
                                    alt: { present: true, mandatory: false },
                                    previewImage: true,
                                    inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                                    // Add other image options if needed
                                },
                                // Add more toolbar customizations here
                            }}
                            // Style the editor area directly if needed (often better with CSS classes)
                            editorStyle={{
                                minHeight: '200px', // Ensure editor itself has height
                                padding: '0 10px' // Add some padding inside the editor
                            }}
                          />
                        </div>
                        {/* --- END EDITOR --- */}

                        {/* --- DUMMY ATTACHMENT BUTTONS (kept for example, but WYSIWYG toolbar handles image/video etc.) --- */}
                        {/* These are now less relevant if using the editor's toolbar for attachments */}
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                           {/* Dummy Image Button (Consider removing if using toolbar's image button) */}
                           {/* <button
                              type="button" // Important: prevent form submission
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => alert('Use the toolbar image button. Custom logic needed for other uploads.')} // Placeholder action
                              style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                           >
                             <i className="fas fa-image" style={{ marginRight: '5px' }}></i>
                             Attach Image (Toolbar)
                           </button> */}

                           {/* Dummy Video Button (react-draft-wysiwyg doesn't have built-in video, requires custom blocks/plugins) */}
                           <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => alert('Video attachment requires custom implementation.')}
                              style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                           >
                             <i className="fas fa-video" style={{ marginRight: '5px' }}></i> {/* Example using Font Awesome */}
                             Attach Video (N/A)
                           </button>

                           {/* Dummy File Button (Requires custom implementation) */}
                           <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => alert('File attachment requires custom implementation.')}
                              style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                           >
                             <i className="fas fa-paperclip" style={{ marginRight: '5px' }}></i> {/* Example using Font Awesome */}
                             Attach File (Custom)
                           </button>
                        </div>
                         {/* --- END DUMMY BUTTONS --- */}

                         {/* Hidden div for potential jquery-validate error placement (less useful now) */}
                         <div className="wysiwyg-content" style={{ display: 'none' }}></div>

                      </div>
                    </div>
                     
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="submit" // Triggers the submitHandler via jquery-validate
                    className="btn btn-outline-brand"
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                        "Save"
                      )}
                  </button>
                  <button
                    data-dismiss="modal"
                    type="button"
                    className="btn btn-outline-brand"
                    onClick={this.hide}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ========================================================================
  // ================= END OF MODIFIED RENDER METHOD ======================
  // ========================================================================
}

export default Modal;