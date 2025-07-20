import React from "react";
import ErrorMessage from "../components/error-toast";
import Data from "../../../utils/data";

const IErrorMessage = new ErrorMessage();

const $ = window.$;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    subject: {
      id: null, // Ensure ID is present for edit
      name: "",
      grade: "",
      teacherId: null, // New state for selected teacher ID
      // Assuming you might have existing topicalImages that could be displayed/managed
      topicalImages: [], // Existing images
    },
    teachers: [], // New state to hold the list of available teachers
    uploadedImages: [], // New state to hold newly uploaded images for this edit
    deletedImageIds: [], // Track IDs of images to be deleted
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
        gradename: { // ID of the input for subject name
          required: true,
          minlength: 2,
        },
        teacher: { // Assuming the select element has name="teacher"
          required: true,
        },
      },
      messages: {
        gradename: {
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
            id: _this.state.subject.id,
            name: _this.state.subject.name,
            grade: _this.state.subject.grade, // Keep grade if it's editable or relevant for edit
            teacherId: _this.state.subject.teacherId, // Include the selected teacher ID
            // Handle images: send new uploads and deleted IDs
            addedTopicalImages: _this.state.uploadedImages, // Newly uploaded images
            deletedTopicalImageIds: _this.state.deletedImageIds, // IDs of images to remove
          });
          await _this.props.edit(data);
          // _this.props.onUpdate(data); // If you have an onUpdate prop
          _this.hide();
          _this.setState({
            loading: false,
            uploadedImages: [], // Clear new uploads
            deletedImageIds: [], // Clear deleted IDs
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

  static getDerivedStateFromProps(props, state) {
    // When the subject prop changes, update the state to populate the form
    if (props.subject && props.subject.id !== state.subject.id) {
      return {
        subject: {
          ...props.subject,
          teacherId: props.subject.teacherId || "", // Ensure teacherId is a string for select
          // Ensure topicalImages is an array, even if empty
          topicalImages: props.subject.topicalImages || [],
        },
        // Resetting uploadedImages and deletedImageIds when a new subject is loaded
        uploadedImages: [],
        deletedImageIds: [],
      };
    }
    return null;
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
      subject: { id: null, name: "", grade: "", teacherId: "", topicalImages: [] },
      uploadedImages: [],
      deletedImageIds: [],
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

  handleRemoveImage = (indexToRemove, isExistingImage = false) => {
    if (isExistingImage) {
      // It's an existing image, mark it for deletion
      const imageId = this.state.subject.topicalImages[indexToRemove].id;
      this.setState(prevState => ({
        subject: {
          ...prevState.subject,
          topicalImages: prevState.subject.topicalImages.filter((_, index) => index !== indexToRemove),
        },
        deletedImageIds: [...prevState.deletedImageIds, imageId],
      }));
    } else {
      // It's a newly uploaded image, just remove it from uploadedImages
      this.setState(prevState => ({
        uploadedImages: prevState.uploadedImages.filter((_, index) => index !== indexToRemove),
      }));
    }
  };

  render() {
    const { teachers, subject, uploadedImages } = this.state;

    // To avoid the "state.grade is not a function" error in the original code
    // this.state.grade = this.props.subject.grade ? this.props.subject.grade : null;
    // Instead, directly use this.state.subject.grade or handle it when setting state.
    // The getDerivedStateFromProps handles setting the grade correctly.

    return (
      <div>
        <div
          className="modal fade" // Added 'fade' class for smoother transition
          id={modalNumber}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="subjectEditModalLabel" // Changed aria-labelledby to be more specific
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg"> {/* Added modal-lg for more space */}
            <div className="modal-content">
              <form
                id={modalNumber + "form"}
                className="kt-form kt-form--label-right"
              >
                <div className="modal-header">
                  <h5 className="modal-title" id="subjectEditModalLabel">Edit subject</h5> {/* Added ID */}
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
                          id="gradename" // Original ID, keeping for validator compatibility
                          name="name" // Name for state update
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
                          value={subject.teacherId || ""} // Ensure value is string for select
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

                    {/* Image Upload/Management Section */}
                    <div className="form-group row mt-4">
                      <div className="col-lg-12">
                        <label>Topical Section Images:</label>
                        <div className="custom-file mb-3">
                          <input
                            type="file"
                            className="custom-file-input"
                            id="customFileEdit"
                            multiple
                            accept="image/*"
                            onChange={this.handleImageUpload}
                          />
                          <label className="custom-file-label" htmlFor="customFileEdit">Choose files to add</label>
                        </div>
                        <div className="mt-2 d-flex flex-wrap">
                          {/* Existing Images */}
                          {subject.topicalImages.map((img, index) => (
                            <div key={img.id} className="image-thumbnail-container mr-2 mb-2 position-relative">
                              <img
                                src={img.dataUrl || img.url} // Assuming 'url' is the property for existing images' source
                                alt={`Topical Section ${index + 1}`}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #ccc' }}
                                className="img-thumbnail"
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle"
                                onClick={() => this.handleRemoveImage(index, true)} // Mark as existing
                                style={{ top: '-10px', right: '-10px', zIndex: 1 }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {/* Newly Uploaded Images */}
                          {uploadedImages.map((img, index) => (
                            <div key={`new-${index}`} className="image-thumbnail-container mr-2 mb-2 position-relative">
                              <img
                                src={img.dataUrl}
                                alt={`New Topical Section ${index + 1}`}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #ccc' }}
                                className="img-thumbnail"
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle"
                                onClick={() => this.handleRemoveImage(index, false)} // Mark as new
                                style={{ top: '-10px', right: '-10px', zIndex: 1 }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        {subject.topicalImages.length + uploadedImages.length > 0 && (
                          <small className="form-text text-muted">Existing images can be removed. Uploaded images will be added.</small>
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