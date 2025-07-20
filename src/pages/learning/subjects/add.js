import React from "react";
import ErrorMessage from "../components/error-toast";
import Data from "../../../utils/data";

const IErrorMessage = new ErrorMessage();

const $ = window.$;
let selectedGrade = null; // This variable seems to be related to a parent component's interaction. Keeping it for now.

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    subject: {
      name: "",
      grade: "", // Assuming grade is still relevant or passed down
      teacherId: "", // New state for selected teacher ID
    },
    teachers: [], // New state to hold the list of available teachers
    uploadedImages: [], // New state to hold base64 image data
  };

  // Fetch teachers when the component mounts
  async componentDidMount() {
    const _this = this;

    // Fetch teachers (Assuming you have an API endpoint for this)
    // Replace '/api/teachers' with your actual endpoint
     console.log("Fetching teachers...");
     try {
          const teachers = Data.teachers.list();
              this.setState({ teachers, filteredTeachers: teachers });
          
              Data.teachers.subscribe(({ teachers }) => {
                this.setState({ teachers, filteredTeachers: teachers });
              });
        } catch (error) {
          console.error("Error fetching teachers:", error);
          IErrorMessage.show({ message: "Could not load teachers. Please try again." });
        }

    this.validator = $("#" + modalNumber + "form").validate({
      errorClass: "invalid-feedback",
      errorElement: "div",

      highlight: function (element) {
        $(element).addClass("is-invalid");
      },
      unhighlight: function (element) {
        $(element).removeClass("is-invalid");
      },

      // Add validation rules for new fields
      rules: {
        name: {
          required: true,
          minlength: 2,
        },
        teacher: { // Assuming the select element has name="teacher"
          required: true,
        },
        // You might want to add validation for images if there's a minimum requirement
      },
      messages: {
        name: {
          required: "Subject name is required.",
          minlength: "Subject name must be at least 2 characters long.",
        },
        teacher: {
          required: "Please select a teacher.",
        },
      },

      async submitHandler(form, event) {
        event.preventDefault();
        // Re-validate the form before submitting to ensure all rules pass
        if (!_this.validator.form()) {
          return; // If validation fails, stop submission
        }

        try {
          _this.setState({ loading: true });
          const data = {};
          Object.assign(data, {
            name: _this.state.subject.name,
            grade: _this.state.subject.grade,
            teacherId: _this.state.subject.teacherId, // Include the selected teacher ID
            topicalImages: _this.state.uploadedImages, // Include the uploaded images
          });
          const id = await _this.props.save(data);
          data.id = id;
          // _this.props.onCreate(data); // If you have an onCreate prop
          _this.hide();
          _this.setState({
            loading: false,
            subject: { name: "", grade: "", teacherId: "" }, // Reset form
            uploadedImages: [], // Clear uploaded images
          });
        } catch (error) {
          _this.setState({ loading: false });
          if (error) {
            const { message } = error;
            return IErrorMessage.show({ message });
          }
          IErrorMessage.show();
        }
      }
    });
  }

  componentDidUpdate(prevProps) {
    const _this = this;
    // This part seems to be handling an external 'grade' prop.
    // If 'grade' is meant to be set on initial open, this might need adjustment.
    // For now, keeping it to ensure state updates based on prop changes.
    if (_this.props.grade !== prevProps.grade && _this.props.grade !== selectedGrade) {
      selectedGrade = _this.props.grade;
      _this.setState(prevState => ({
        subject: {
          ...prevState.subject,
          grade: _this.props.grade
        }
      }));
    }
  }

  show() {
    $("#" + modalNumber).modal({
      show: true,
      backdrop: "static",
      keyboard: false
    });
  }

  hide() {
    $("#" + modalNumber).modal("hide");
    // Reset state when hiding the modal to ensure a clean slate for next opening
    this.setState({
      loading: false,
      subject: { name: "", grade: "", teacherId: "" },
      uploadedImages: [],
    });
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      subject: {
        ...prevState.subject,
        [name]: value,
      }
    }));
  };

  handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const readerPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ name: file.name, dataUrl: e.target.result });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readerPromises)
      .then(imagesData => {
        this.setState(prevState => ({
          uploadedImages: [...prevState.uploadedImages, ...imagesData],
        }));
      })
      .catch(error => {
        console.error("Error reading files:", error);
        IErrorMessage.show({ message: "Error uploading images." });
      });

    // Clear the file input so the same file can be uploaded again if needed
    event.target.value = null;
  };

  handleRemoveImage = (indexToRemove) => {
    this.setState(prevState => ({
      uploadedImages: prevState.uploadedImages.filter((_, index) => index !== indexToRemove),
    }));
  };

  render() {
    const { teachers, subject, uploadedImages } = this.state;

    return (
      <div>
        <div
          className="modal fade" // Added 'fade' class for smoother transition
          id={modalNumber}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="subjectModalLabel" // Changed aria-labelledby to be more specific
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg"> {/* Added modal-lg for more space */}
            <div className="modal-content">
              <form
                id={modalNumber + "form"}
                className="kt-form kt-form--label-right"
              >
                <div className="modal-header">
                  <h5 className="modal-title" id="subjectModalLabel">Create new subject</h5> {/* Added ID */}
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span> {/* Corrected close symbol */}
                  </button>
                </div>
                <div className="modal-body">
                  <div className="kt-portlet__body">
                    <div className="form-group row">
                      <div className="col-lg-6"> {/* Split layout for better organization */}
                        <label>Subject name:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name" // Keep ID for validator targeting
                          name="name" // Use 'name' for input handling
                          value={subject.name}
                          onChange={this.handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-lg-6">
                        <label>Select Teacher:</label>
                        <select
                          className="form-control"
                          id="teacher" // ID for validation
                          name="teacherId" // Name for state update
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

                    {/* Image Upload Section */}
                    <div className="form-group row mt-4">
                      <div className="col-lg-12">
                        <label>Topical Section Images:</label>
                        <div className="custom-file">
                          <input
                            type="file"
                            className="custom-file-input"
                            id="customFile"
                            multiple // Allow multiple file selection
                            accept="image/*" // Accept only image files
                            onChange={this.handleImageUpload}
                          />
                          <label className="custom-file-label" htmlFor="customFile">Choose files</label>
                        </div>
                        <div className="mt-2 d-flex flex-wrap">
                          {uploadedImages.map((img, index) => (
                            <div key={index} className="image-thumbnail-container mr-2 mb-2 position-relative">
                              <img
                                src={img.dataUrl}
                                alt={`Topical Section ${index + 1}`}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #ccc' }}
                                className="img-thumbnail"
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle" // Bootstrap 5 positioning
                                onClick={() => this.handleRemoveImage(index)}
                                style={{ top: '-10px', right: '-10px', zIndex: 1 }} // Adjust if not using Bootstrap 5 classes
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        {uploadedImages.length > 0 && (
                           <small className="form-text text-muted">Upload up to 5 images for topical sections.</small> // Example guidance
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="submit" // Changed to type="submit" to trigger the validator
                    className="btn btn-brand" // Changed to btn-brand for consistency
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? (
                      <span
                        className="spinner-border spinner-border-sm mr-2" // Added mr-2 for spacing
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    type="button" // Ensure type is button to not submit form
                    className="btn btn-outline-brand"
                    data-dismiss="modal"
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