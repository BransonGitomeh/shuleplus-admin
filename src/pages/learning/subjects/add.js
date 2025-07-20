// src/components/modal/Modal.js (or wherever your Modal component is)

import React from "react";
// Assuming ErrorMessage and Data utilities are correctly placed and imported
import ErrorMessage from "../components/error-toast"; // Adjust path if necessary
import Data from "../../../utils/data"; // Adjust path if necessary

const IErrorMessage = new ErrorMessage();

const $ = window.$; // For jQuery interactions
let selectedGrade = null; // Might be related to parent context

// Unique ID for modal and form to avoid conflicts
const modalInstanceId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

// --- Constants for AI prompt generation ---
const AI_QUESTION_GENERATION_PROMPT_TEMPLATE = `
    Generate **between 4 and 5 unique multiple-choice questions** for the following specific lesson. This quantity is CRITICAL.

    Lesson Details:
    Title: "{LESSON_TITLE}"
    Subject: "{SUBJECT_NAME}"
    Grade: "{FORM_NAME}"
    Duration: "{LESSON_DURATION}"

    Each question must adhere to these rules:
      - A clear question text (for the "name" field).
      - **HTML formatted content** for explanations or context. This HTML can include text formatting (bolding, italics), lists, and emojis, but should **not** contain full markdown like code blocks or images unless they are inline SVGs.
      - Approximately **3 to 4 options**.
      - Exactly **ONE correct option**.
      - **Subtle hints** about the correct answer within the options themselves. For example, if the answer is "photosynthesis", one option might read "Process of energy conversion (e.g., photosynthesis)" while others are clearly incorrect.

    Ensure the language and complexity of the questions and explanations are appropriate for a {FORM_NAME} student.

    Return the result ONLY as a raw JSON object, without any markdown formatting or explanations.

    The JSON structure MUST be exactly as follows:
    {
      "questions": [
        {
          "name": "The question text (e.g., 'What is a property of magnets?')",
          "content": "<b>Brief context or explanation using HTML.</b> For example, this process is vital for life on Earth. 🌱",
          "options": [
            { "value": "Option A text", "correct": false },
            { "value": "Option B text (with a subtle hint)", "correct": true },
            { "value": "Option C text", "correct": false }
          ]
        }
        // ... repeat for a total of 4 to 5 questions for this lesson. ENSURE YOU GENERATE AT LEAST 4.
      ]
    }

    **Do not include any 'id' fields in your response.**
`;

class Modal extends React.Component {
  state = {
    loading: false, // General form submission loading
    aiGenerating: false, // Specific state for AI generation
    subject: {
      name: "",
      grade: "", // Will be set by prop 'grade'
      teacherId: "",
    },
    teachers: [], // List of available teachers
    // --- NEW STATES FOR MANUAL AI INPUT ---
    manualAiInput: "", // User's pasted text for curriculum outline
    generatedAiPrompt: "", // Prompt to copy for user to paste into AI
    aiJsonResponse: "", // User's pasted JSON response from AI
    // --- END NEW STATES ---
    uploadedImages: [], // Array of { name: string, dataUrl: string }
    errorMessage: null, // For displaying specific errors (AI, upload, etc.)
  };

  validator = null; // jQuery Validation instance

  async componentDidMount() {
    const _this = this;

    // Fetch teachers
    console.log("Fetching teachers...");
    try {
      const teachers = Data.teachers.list();
      this.setState({ teachers });
      if (Data.teachers.subscribe) {
        Data.teachers.subscribe(({ teachers }) => {
          this.setState({ teachers });
        });
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      IErrorMessage.show({ message: "Could not load teachers. Please try again." });
    }

    this.validator = $("#" + modalInstanceId + "form").validate({
      errorClass: "invalid-feedback",
      errorElement: "div",
      highlight: function (element) { $(element).addClass("is-invalid"); },
      unhighlight: function (element) { $(element).removeClass("is-invalid"); },
      rules: {
        name: { required: true, minlength: 2 },
        teacherId: { required: true },
        // Manual AI input rules
        manualAiInput: { required: false }, // Make it optional if not using AI directly
      },
      messages: {
        name: { required: "Subject name is required.", minlength: "Subject name must be at least 2 characters long." },
        teacherId: { required: "Please select a teacher." },
      },
      submitHandler: async function (form, event) {
        event.preventDefault();

        if (_this.state.aiGenerating) {
          IErrorMessage.show({ message: "AI generation is in progress. Please wait." });
          return;
        }

        // --- NEW: Handle AI JSON Input ---
        if (!_this.state.aiJsonResponse) {
            // If AI JSON is missing, it means manual input or upload wasn't used.
            // If AI is enabled and no JSON is provided, it's an error.
            // However, if AI is OFF, we still might need to save.
            // Let's assume AI is optional. If AI is OFF, and we have a subject name + teacher, it's valid.
            if (_this.state.manualAiInput || _this.state.uploadedImages.length > 0) {
                // If AI was intended but not provided, show error
                _this.setState({ errorMessage: "AI generated content is required if AI input is used." });
                return;
            }
            // If no AI input, but form is otherwise valid, proceed with manual save
        }
        // --- END NEW ---

        try {
          _this.setState({ loading: true, errorMessage: null });

          let parsedAiData = null;
          if (_this.state.aiJsonResponse) {
            try {
              parsedAiData = JSON.parse(_this.state.aiJsonResponse);
            } catch (parseError) {
              _this.setState({ loading: false, errorMessage: "Invalid JSON format provided for AI content." });
              IErrorMessage.show({ message: "Invalid JSON format provided for AI content." });
              return;
            }
          }

          const subjectDataForAPI = {
            name: _this.state.subject.name,
            grade: _this.state.subject.grade,
            teacher: _this.state.subject.teacherId,
            // Use AI data if available, otherwise use images
            topicalImages: parsedAiData ? undefined : _this.state.uploadedImages, // If JSON provided, don't send images
            aiGeneratedCurriculum: parsedAiData ? parsedAiData : undefined, // Pass the parsed AI data
          };

          // Call the parent's save function
          const result = await _this.props.save(subjectDataForAPI);

          if (result && result.id) {
            _this.hide();
            if (_this.props.onCreate) {
              _this.props.onCreate(result);
            }
            _this.setState({
              subject: { name: "", grade: _this.props.grade || "", teacherId: "" },
              uploadedImages: [],
              manualAiInput: "",
              generatedAiPrompt: "",
              aiJsonResponse: "",
              loading: false,
              aiGenerating: false,
              errorMessage: null,
            });
            IErrorMessage.show({ message: `${subjectDataForAPI.name} created successfully!`, type: 'success' });
          } else {
            _this.setState({ loading: false });
            IErrorMessage.show({ message: "Failed to create subject. Please try again." });
          }
        } catch (error) {
          _this.setState({ loading: false });
          if (error.message) {
            IErrorMessage.show({ message: error.message });
          } else {
            IErrorMessage.show({ message: "An unexpected error occurred during creation." });
          }
        }
      }
    });
  }

  // Update subject grade if the prop changes
  componentDidUpdate(prevProps) {
    if (this.props.grade !== prevProps.grade && this.props.grade) {
      if (this.state.subject.grade !== this.props.grade) {
        this.setState(prevState => ({
          subject: {
            ...prevState.subject,
            grade: this.props.grade
          }
        }));
      }
    }
  }

  // Show the modal and reset state
  show() {
    this.setState({
      loading: false,
      aiGenerating: false,
      subject: { name: "", grade: this.props.grade || "", teacherId: "" },
      uploadedImages: [],
      manualAiInput: "", // Reset manual input
      generatedAiPrompt: "", // Reset generated prompt
      aiJsonResponse: "", // Reset AI JSON response
      errorMessage: null,
    });
    if (this.validator) {
      this.validator.resetForm();
    }

    $("#" + modalInstanceId).modal({
      show: true,
      backdrop: "static",
      keyboard: false
    });
  }

  // Hide the modal and reset state
  hide() {
    $("#" + modalInstanceId).modal("hide");
    // Reset state when hiding, as the modal might be shown again later with old data
    this.setState({
      loading: false,
      aiGenerating: false,
      subject: { name: "", grade: this.props.grade || "", teacherId: "" },
      uploadedImages: [],
      manualAiInput: "",
      generatedAiPrompt: "",
      aiJsonResponse: "",
      errorMessage: null,
    });
  }

  // Handle input changes for subject name and teacher selection
  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      subject: {
        ...prevState.subject,
        [name]: value,
      }
    }));
  };

  // Handle manual input for AI curriculum outline
  handleManualAiInputChange = (event) => {
    this.setState({ manualAiInput: event.target.value, errorMessage: null });
  };

  // Handle AI JSON response pasting
  handleAiJsonResponseChange = (event) => {
    this.setState({ aiJsonResponse: event.target.value, errorMessage: null });
  };

  // Generate the prompt for the user to copy
  handleGeneratePrompt = () => {
    if (!this.state.manualAiInput) {
      this.setState({ errorMessage: "Please paste the curriculum outline first." });
      return;
    }

    // Basic prompt construction. You might want to make this more sophisticated.
    // For now, we'll embed the pasted content directly.
    const promptForAI = `
        Your task is to generate structured JSON data for a curriculum.
        Based on the following curriculum outline, create topics, lessons, and for each lesson, generate between 4 and 5 unique multiple-choice questions.

        Curriculum Outline:
        """
        ${this.state.manualAiInput}
        """

        Specific Rules for Output:
          - Each topic needs a title and a suitable icon name (e.g., 'magnet', 'ruler-square'). If no icon is clear, use 'file-certificate'.
          - Each lesson needs a title and duration (default to '~ 10 mins' if not specified).
          - For EACH lesson, generate **between 4 and 5** multiple-choice questions. This quantity is CRITICAL.
          - Each question must have:
            - A clear question text (for "name").
            - **HTML formatted content** for explanations or context. This HTML can include text formatting (bolding, italics), lists, and emojis, but should **not** contain full markdown like code blocks or images unless they are inline SVGs.
            - Approximately **3 to 4 options**.
            - Exactly **ONE correct option**.
            - **Subtle hints** about the correct answer within the options themselves.
          - Ensure the language and complexity are appropriate for a ${this.state.subject.grade || 'student'}.

        Return the result ONLY as a raw JSON object, without any markdown formatting or explanations.

        The JSON structure MUST be exactly as follows:
        {
          "topics": [
            {
              "title": "The full title of the topic (e.g., '1. Magnetism')",
              "icon": "A descriptive icon name, e.g., 'magnet' or 'file-certificate' if not inferrable",
              "lessons": [
                {
                  "title": "The full title of the lesson",
                  "duration": "The lesson's duration if visible (e.g., '~ 8 mins'), otherwise default to '~ 10 mins'",
                  "questions": [
                    {
                      "name": "The question text (e.g., 'What is a property of magnets?')",
                      "content": "<b>Brief context or explanation using HTML.</b> For example, this process is vital for life on Earth. 🌱",
                      "options": [
                        { "value": "Option A text", "correct": false },
                        { "value": "Option B text (with a subtle hint)", "correct": true },
                        { "value": "Option C text", "correct": false }
                      ]
                    }
                    // ... repeat for a total of 4 to 5 questions for this lesson. ENSURE YOU GENERATE AT LEAST 4.
                  ]
                }
                // ... more lessons for this topic
              ]
            }
            // ... more topics
          ]
        }
        **Do not include any 'id' fields in your response.**
    `;

    this.setState({ generatedAiPrompt: promptForAI });
  };

  // Copy the generated prompt to clipboard
  handleCopyPrompt = () => {
    navigator.clipboard.writeText(this.state.generatedAiPrompt).then(() => {
      IErrorMessage.show({ message: "Prompt copied to clipboard!", type: 'success' });
    }).catch(err => {
      console.error("Failed to copy prompt: ", err);
      IErrorMessage.show({ message: "Failed to copy prompt." });
    });
  };

  render() {
    const { teachers, subject, uploadedImages, manualAiInput, generatedAiPrompt, aiJsonResponse, loading, aiGenerating, errorMessage } = this.state;
    const isFormValidManually = subject.name && subject.teacherId && uploadedImages.length > 0;
    const isAiInputProvided = subject.name && subject.teacherId && manualAiInput && generatedAiPrompt && aiJsonResponse;
    // Consider the form valid if manual inputs are good OR if AI inputs are good
    const isFormSubmittable = (isFormValidManually && !this.state.manualAiInput) || isAiInputProvided;


    return (
      <div>
        <div
          className="modal fade"
          id={modalInstanceId}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="subjectModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form
                id={modalInstanceId + "form"}
                className="kt-form kt-form--label-right"
              >
                <div className="modal-header">
                  <h5 className="modal-title" id="subjectModalLabel">Create New Subject</h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">

                  {/* Metronic General Info Alert */}
                  <div className="alert alert-custom alert-light-info fade show mb-5" role="alert">
                    <div className="alert-icon"><i className="flaticon-information icon-lg"></i></div>
                    <div className="alert-text">
                      <strong>Content Creation Options</strong>: You can either upload images of your Table of Contents for AI processing, OR paste a curriculum outline and use the generated prompt to get AI-generated content via another tool, then paste the AI's JSON output here.
                    </div>
                    <div className="alert-close">
                      <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true"><i className="ki ki-close"></i></span>
                      </button>
                    </div>
                  </div>

                  {/* Display specific errors */}
                  {errorMessage && (
                    <div className="alert alert-custom alert-light-danger fade show mb-5" role="alert">
                      <div className="alert-icon"><i className="flaticon-warning icon-lg"></i></div>
                      <div className="alert-text">{errorMessage}</div>
                      <div className="alert-close">
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                          <span aria-hidden="true"><i className="ki ki-close"></i></span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="kt-portlet__body">
                    <div className="form-group row">
                      <div className="col-lg-6 mb-5">
                        <label>Subject Name:</label>
                        <input
                          type="text"
                          className="form-control form-control-solid"
                          id="name"
                          name="name"
                          value={subject.name}
                          onChange={this.handleInputChange}
                          required
                          placeholder="Enter subject name"
                        />
                      </div>
                      <div className="col-lg-6 mb-5">
                        <label>Select Teacher:</label>
                        <select
                          className="form-control form-control-solid"
                          id="teacherId"
                          name="teacherId"
                          value={subject.teacherId}
                          onChange={this.handleInputChange}
                          required
                        >
                          <option value="">-- Select Teacher --</option>
                          {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* --- NEW: AI Content Generation Section --- */}
                    <div className="mt-5 pt-5 border-top"> {/* Metronic styling for separation */}
                      <h5 className="mb-4">AI Content Generation (Optional)</h5>

                      <div className="form-group row align-items-center">
                        <div className="col-lg-8">
                          <label>Curriculum Outline (Paste Text Here):</label>
                          <textarea
                            className="form-control form-control-solid"
                            rows="5"
                            placeholder="Paste your Table of Contents or curriculum outline here..."
                            value={manualAiInput}
                            onChange={this.handleManualAiInputChange}
                          ></textarea>
                        </div>
                        <div className="col-lg-4 text-center">
                          <button
                            type="button"
                            className="btn btn-primary btn-block mb-2" // Metronic button styling
                            onClick={this.handleGeneratePrompt}
                            disabled={!manualAiInput || aiGenerating}
                          >
                            {aiGenerating && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>}
                            Generate Prompt
                          </button>
                          {generatedAiPrompt && (
                            <>
                              <button
                                type="button"
                                className="btn btn-secondary btn-block mb-2"
                                onClick={this.handleCopyPrompt}
                                disabled={!generatedAiPrompt}
                              >
                                Copy Prompt
                              </button>
                              <p className="text-muted font-weight-bold">Paste the generated prompt into your AI tool.</p>
                            </>
                          )}
                        </div>
                      </div>

                      {generatedAiPrompt && (
                        <div className="form-group row mt-4">
                          <div className="col-lg-12">
                            <label>AI Generated JSON Response:</label>
                            <textarea
                              className="form-control form-control-solid"
                              rows="8"
                              placeholder="Paste the JSON output from your AI tool here..."
                              value={aiJsonResponse}
                              onChange={this.handleAiJsonResponseChange}
                            ></textarea>
                            <small className="form-text text-muted">Ensure the JSON structure is correct as per the prompt.</small>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* --- END NEW AI Section --- */}

                    {/* Image Upload Section (only show if not using manual AI input) */}
                    {!manualAiInput && (
                      <div className="form-group row mt-4">
                        <div className="col-lg-12">
                          <label>Table of Contents Images:</label>
                          <div className="custom-file">
                            <input
                              type="file"
                              className="custom-file-input"
                              id="customFile"
                              multiple
                              accept="image/*"
                              onChange={this.handleImageUpload}
                            />
                            <label className="custom-file-label" htmlFor="customFile">
                              {uploadedImages.length === 0
                                ? "Choose files (max 5 images)"
                                : `${uploadedImages.length} file(s) selected`}
                            </label>
                          </div>
                          <div className="mt-3 d-flex flex-wrap">
                            {uploadedImages.map((img, index) => (
                              <div key={index} className="mr-2 mb-2 position-relative image-thumbnail-wrapper" style={{ width: '80px', height: '80px' }}>
                                <img
                                  src={img.dataUrl}
                                  alt={`Topical Section ${index + 1}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', border: '1px solid #ccc' }}
                                  className="img-fluid img-thumbnail"
                                />
                                <button
                                  type="button"
                                  className="btn btn-icon btn-sm btn-danger position-absolute"
                                  onClick={() => this.handleRemoveImage(index)}
                                  style={{ top: '-10px', right: '-10px', zIndex: 1, borderRadius: '50%', padding: '0.1rem 0.3rem', fontSize: '0.75rem' }}
                                >
                                  <i className="ki ki-close icon-xs"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                          {uploadedImages.length < 5 && (
                            <small className="form-text text-muted mt-2">Upload up to 5 images for the Table of Contents.</small>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="submit"
                    className="btn btn-brand btn-block"
                    // Modify submit validation logic to check if AI JSON is present if manual input is used
                    disabled={loading || aiGenerating || (!isFormValidManually && !isAiInputProvided)}
                  >
                    {(loading || aiGenerating) && (
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    )}
                    {aiGenerating ? 'Generating Content...' : (loading ? 'Saving...' : 'Create Subject')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-brand btn-block"
                    data-dismiss="modal"
                    disabled={loading || aiGenerating}
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
}

export default Modal;