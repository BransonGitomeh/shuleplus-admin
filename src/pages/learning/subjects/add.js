import React from "react";
// Assuming ErrorMessage and Data utilities are correctly placed and imported
import ErrorMessage from "../components/error-toast"; // Adjust path if necessary
import Data from "../../../utils/data"; // Adjust path if necessary

const IErrorMessage = new ErrorMessage();

const $ = window.$; // For jQuery interactions
let selectedGrade = null; // Might be related to parent context

// Unique ID for modal and form to avoid conflicts
const modalInstanceId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

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
    uploadedImages: [], // Array of { name: string, dataUrl: string }
    errorMessage: null, // For displaying specific errors (AI, upload, etc.)
  };

  validator = null; // jQuery Validation instance

  async componentDidMount() {
    const _this = this;

    // Fetch teachers
    console.log("Fetching teachers...");
    try {
      const teachers = Data.teachers.list(); // Assuming Data.teachers.list() returns an array of teacher objects
      this.setState({ teachers });

      // Subscribe for real-time updates if Data.teachers supports it
      if (Data.teachers.subscribe) {
        Data.teachers.subscribe(({ teachers }) => {
          this.setState({ teachers });
        });
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      IErrorMessage.show({ message: "Could not load teachers. Please try again." });
    }

    // Initialize Metronic/jQuery Validation
    this.validator = $("#" + modalInstanceId + "form").validate({
      errorClass: "invalid-feedback", // Standard Bootstrap/Metronic class for error messages
      errorElement: "div",
      highlight: function (element) {
        $(element).addClass("is-invalid"); // Metronic/Bootstrap class for invalid input
      },
      unhighlight: function (element) {
        $(element).removeClass("is-invalid");
      },
      rules: {
        name: {
          required: true,
          minlength: 2,
        },
        teacherId: { // Ensure 'name' attribute matches 'teacherId'
          required: true,
        },
        // Image validation handled by UI state and submit button logic, not direct validator rules
      },
      messages: {
        name: {
          required: "Subject name is required.",
          minlength: "Subject name must be at least 2 characters long.",
        },
        teacherId: {
          required: "Please select a teacher.",
        },
      },
      // Submit handler for form submission
      submitHandler: async function (form, event) {
        event.preventDefault(); // Prevent default form submission

        if (_this.state.aiGenerating) {
          IErrorMessage.show({ message: "AI generation is in progress. Please wait." });
          return;
        }

        try {
          _this.setState({ loading: true, errorMessage: null }); // Reset loading and specific errors

          const subjectDataForAPI = {
            name: _this.state.subject.name,
            grade: _this.state.subject.grade, // This should be set by props
            teacher: _this.state.subject.teacherId,
            topicalImages: _this.state.uploadedImages,
          };

          // Call the parent's save function which handles AI generation and DB persistence
          const result = await _this.props.save(subjectDataForAPI);

          if (result && result.id) { // Assuming 'save' returns the created subject object
            _this.hide();
            if (_this.props.onCreate) {
              _this.props.onCreate(result); // Notify parent to refresh lists
            }
            // Reset form state and clear images
            _this.setState({
              subject: { name: "", grade: _this.props.grade || "", teacherId: "" },
              uploadedImages: [],
              loading: false,
              aiGenerating: false,
              errorMessage: null,
            });
            // Success feedback (assuming IErrorMessage can show success messages)
            IErrorMessage.show({ message: `${subjectDataForAPI.name} created successfully!`, type: 'success' });
          } else {
            // Handle cases where 'save' might fail without throwing an explicit error
            _this.setState({ loading: false });
            IErrorMessage.show({ message: "Failed to create subject. Please try again." });
          }
        } catch (error) {
          _this.setState({ loading: false });
          // Display error from AI or other caught errors
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
      subject: { name: "", grade: this.props.grade || "", teacherId: "" }, // Reset subject, keeping grade from props
      uploadedImages: [],
      errorMessage: null,
    });
    // Clear previous validation messages
    if (this.validator) {
      this.validator.resetForm();
    }

    // Use Bootstrap's modal show method
    $("#" + modalInstanceId).modal({
      show: true,
      backdrop: "static",
      keyboard: false
    });
  }

  // Hide the modal and reset state
  hide() {
    $("#" + modalInstanceId).modal("hide");
    this.setState({
      loading: false,
      aiGenerating: false,
      subject: { name: "", grade: this.props.grade || "", teacherId: "" },
      uploadedImages: [],
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

  // Handle file uploads
  handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const MAX_FILES = 5; // Limit to 5 images
    if (this.state.uploadedImages.length + files.length > MAX_FILES) {
      IErrorMessage.show({ message: `You can upload a maximum of ${MAX_FILES} images.` });
      return;
    }

    this.setState({ errorMessage: null }); // Clear previous errors

    const readerPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          reject(new Error(`${file.name} is not a valid image file.`));
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => resolve({ name: file.name, dataUrl: e.target.result });
        reader.onerror = (e) => reject(new Error(`Error reading file: ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    try {
      const imagesData = await Promise.all(readerPromises);
      this.setState(prevState => ({
        uploadedImages: [...prevState.uploadedImages, ...imagesData],
      }));
    } catch (error) {
      console.error("Error reading files:", error);
      IErrorMessage.show({ message: error.message });
    }

    // event.target.value = null; // Clear the input to allow re-uploading the same file
  };

  // Remove an uploaded image
  handleRemoveImage = (indexToRemove) => {
    this.setState(prevState => ({
      uploadedImages: prevState.uploadedImages.filter((_, index) => index !== indexToRemove),
    }));
  };

  render() {
    const { teachers, subject, uploadedImages, loading, aiGenerating, errorMessage } = this.state;
    // Basic validation check to enable the submit button
    const isFormValid = subject.name && subject.teacherId && uploadedImages.length > 0;

    return (
      <div>
        <div
          className="modal fade" // Bootstrap modal classes
          id={modalInstanceId}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="subjectModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg"> {/* Metronic often uses modal-lg */}
            <div className="modal-content">
              {/* Metronic Form Structure */}
              <form
                id={modalInstanceId + "form"}
                className="kt-form kt-form--label-right" // Metronic form styling
              >
                <div className="modal-header">
                  <h5 className="modal-title" id="subjectModalLabel">Create New Subject</h5> {/* Bootstrap modal title */}
                  <button
                    type="button"
                    className="close" // Bootstrap close button
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span> {/* Standard close icon */}
                  </button>
                </div>
                <div className="modal-body">

                  {/* AI Usage Notification - Metronic Style */}
                  <div className="alert alert-custom alert-light-info fade show mb-5" role="alert">
                    <div className="alert-icon"><i className="flaticon-information icon-lg"></i></div> {/* Metronic icon for info */}
                    <div className="alert-text">
                      <strong>AI-Powered Content Generation</strong>: Upload images of your Table of Contents, and we'll use AI to create the subject's topics, lessons, and learning questions. This process may take a few moments.
                    </div>
                    <div className="alert-close">
                      <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true"><i className="ki ki-close"></i></span> {/* Metronic close icon */}
                      </button>
                    </div>
                  </div>

                  {/* Display specific errors (e.g., from AI or upload) - Metronic Style */}
                  {errorMessage && (
                    <div className="alert alert-custom alert-light-danger fade show mb-5" role="alert">
                      <div className="alert-icon"><i className="flaticon-warning icon-lg"></i></div> {/* Metronic icon for warning */}
                      <div className="alert-text">{errorMessage}</div>
                      <div className="alert-close">
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                          <span aria-hidden="true"><i className="ki ki-close"></i></span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="kt-portlet__body"> {/* Metronic section for body content */}
                    <div className="form-group row">
                      {/* Subject Name Input */}
                      <div className="col-lg-6 mb-5"> {/* Added mb-5 for margin */}
                        <label>Subject Name:</label>
                        <input
                          type="text"
                          className="form-control form-control-solid" // Metronic input styling
                          id="name"
                          name="name"
                          value={subject.name}
                          onChange={this.handleInputChange}
                          required
                          aria-describedby="nameHelp"
                          placeholder="Enter subject name"
                        />
                        <small id="nameHelp" className="form-text text-muted">e.g., Physics, Algebra I</small>
                      </div>
                      {/* Teacher Selection */}
                      <div className="col-lg-6 mb-5">
                        <label>Select Teacher:</label>
                        <select
                          className="form-control form-control-solid" // Metronic select styling
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

                    {/* Image Upload Section - Metronic Style */}
                    <div className="form-group row mt-4">
                      <div className="col-lg-12">
                        <label>Table of Contents Images:</label>
                        {/* Custom file upload for Metronic */}
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
                        {/* Display uploaded images */}
                        <div className="mt-3 d-flex flex-wrap">
                          {uploadedImages.map((img, index) => (
                            <div key={index} className="mr-2 mb-2 position-relative image-thumbnail-wrapper" style={{ width: '80px', height: '80px' }}>
                              <img
                                src={img.dataUrl}
                                alt={`Topical Section ${index + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', border: '1px solid #ccc' }}
                                className="img-fluid img-thumbnail" // Metronic image classes
                              />
                              {/* Remove button */}
                              <button
                                type="button"
                                className="btn btn-icon btn-sm btn-danger position-absolute" // Metronic button styling
                                onClick={() => this.handleRemoveImage(index)}
                                style={{ top: '-10px', right: '-10px', zIndex: 1, borderRadius: '50%', padding: '0.1rem 0.3rem', fontSize: '0.75rem' }}
                              >
                                <i className="ki ki-close icon-xs"></i> {/* Metronic close icon */}
                              </button>
                            </div>
                          ))}
                        </div>
                        {/* Optional guidance */}
                        {uploadedImages.length < 5 && (
                          <small className="form-text text-muted mt-2">Upload up to 5 images for the Table of Contents.</small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {/* Save Button */}
                  <button
                    type="submit"
                    className="btn btn-brand btn-block" // Metronic primary button
                    disabled={loading || aiGenerating || !isFormValid}
                  >
                    {/* Spinner for loading/AI generation */}
                    {(loading || aiGenerating) && (
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    )}
                    {aiGenerating ? 'Generating Content...' : (loading ? 'Saving...' : 'Create Subject')}
                  </button>
                  {/* Cancel Button */}
                  <button
                    type="button"
                    className="btn btn-outline-brand btn-block" // Metronic secondary button
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