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
    },
  };

  // Fetch teachers when the component mounts
  async componentDidMount() {
    const _this = this;
    try {
      this.validator = $("#" + modalNumber + "form").validate({
        errorClass: "invalid-feedback",
        errorElement: "div",

        highlight: function (element) {
          $(element).addClass("is-invalid");
        },
        unhighlight: function (element) {
          $(element).removeClass("is-invalid");
        },

        rules: {
          gradename: { // ID of the input for subject name
            required: true,
            minlength: 2,
          },
        },
        messages: {
          gradename: {
            required: "Subject name is required.",
            minlength: "Subject name must be at least 2 characters long.",
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
            const data = {
              id: _this.state.subject.id,
              name: _this.state.subject.name,
            };
            await _this.props.edit(data);
            _this.hide();
            _this.setState({
              loading: false,
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
    } catch (error) {
      console.error("Error fetching teachers:", error);
      IErrorMessage.show({ message: "Could not load teachers. Please try again." });
    }
  }

  static getDerivedStateFromProps(props, state) {
    // When the subject prop changes, update the state to populate the form
    if (props.subject && props.subject.id !== state.subject.id) {
      return {
        subject: {
          ...props.subject,
        },
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
      subject: { id: null, name: "" },
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

  render() {
    const { subject } = this.state;

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