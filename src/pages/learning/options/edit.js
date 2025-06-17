import React from "react";
import PropTypes from "prop-types";
import ErrorMessage from "../components/error-toast";

// Assuming you are now using toastr directly as in your other components
const toastr = window.toastr;
const IErrorMessage = new ErrorMessage();
const $ = window.$;

// Create a unique ID for this modal instance to avoid conflicts.
const modalId = `modal-edit-option-${Math.random().toString().split(".")[1]}`;

class EditOptionModal extends React.Component {
  // 1. State now reflects the structure of an 'option'
  state = {
    loading: false,
    option: {
      id: null,
      value: "",
      correct: false,
    },
  };

  // 2. A ref to get a direct reference to the <form> DOM element for jQuery
  formRef = React.createRef();

  // Public methods to be called via ref from the parent
  show = () => {
    $(`#${modalId}`).modal({
      show: true,
      backdrop: "static",
      keyboard: false,
    });
  };

  hide = () => {
    $(`#${modalId}`).modal("hide");
  };

  componentDidMount() {
    // 3. Initialize the validator, but WITHOUT a submitHandler.
    // We will trigger validation and submission ourselves.
    $(this.formRef.current).validate({
      errorClass: "invalid-feedback",
      errorElement: "div",
      highlight: (element) => $(element).addClass("is-invalid"),
      unhighlight: (element) => $(element).removeClass("is-invalid"),
    });
  }

  // 4. Use componentDidUpdate to safely sync props to state.
  // This is clearer than getDerivedStateFromProps.
  componentDidUpdate(prevProps) {
    // If the parent passes a new `option` prop, update our state.
    if (this.props.option && this.props.option.id !== prevProps.option?.id) {
      this.setState({
        option: { ...this.props.option }, // Copy the prop to state
      });
      // Also reset any validation errors from the previous item
      if ($(this.formRef.current).data('validator')) {
        $(this.formRef.current).data('validator').resetForm();
      }
    }
  }

  componentWillUnmount() {
    // Clean up jQuery plugin to prevent memory leaks
    if ($(this.formRef.current).data('validator')) {
      $(this.formRef.current).data('validator').destroy();
    }
    this.hide();
  }

  // 5. This is now a standard React event handler. It's clean and predictable.
  handleSubmit = async (event) => {
    event.preventDefault();

    // Manually check if the form is valid using the plugin's API.
    if (!$(this.formRef.current).valid()) {
      return; // If not valid, stop. The plugin has shown the errors.
    }

    this.setState({ loading: true });

    try {
      const { edit } = this.props;
      const payload = { ...this.state.option }; // Send the complete option object from state

      await edit(payload);

      this.hide();
      toastr.success("Option has been updated successfully!", "Option Updated");
    } catch (error) {
      const message = error?.message || "An unexpected error occurred.";
      IErrorMessage.show({ message });
    } finally {
      this.setState({ loading: false });
    }
  };

  // 6. Correct, IMMUTABLE state update for the text input.
  handleInputChange = (e) => {
    const { value, name } = e.target;
    this.setState((prevState) => ({
      option: {
        ...prevState.option, // Keep other properties like 'id' and 'correct'
        [name]: value,
      },
    }));
  };

  // 7. Correct, IMMUTABLE state update for the checkbox.
  handleCheckboxChange = (e) => {
    const { checked, name } = e.target;
    this.setState((prevState) => ({
      option: {
        ...prevState.option, // Keep other properties like 'id' and 'value'
        [name]: checked,
      },
    }));
  };

  render() {
    const { loading, option } = this.state;

    return (
      <div className="modal" id={modalId} tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {/* 8. Use the ref and React's onSubmit here */}
            <form ref={this.formRef} onSubmit={this.handleSubmit} className="kt-form kt-form--label-right">
              <div className="modal-header">
                <h5 className="modal-title">Edit Option</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group row">
                  <div className="col-lg-12 mb-3">
                    <label htmlFor="option-value">Option Text:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="option-value"
                      name="value" // Matches state key: option.value
                      minLength="2"
                      required
                      value={option.value}
                      onChange={this.handleInputChange}
                    />
                  </div>
                  <div className="col-lg-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="option-correct"
                          name="correct" // Matches state key: option.correct
                          checked={option.correct}
                          onChange={this.handleCheckboxChange}
                        />
                        <label className="form-check-label" htmlFor="option-correct">
                          Is this the correct option?
                        </label>
                      </div>
                    </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-brand" // Use primary color for main action
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  type="button"
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
    );
  }
}

// 9. Define the props this component expects
EditOptionModal.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    value: PropTypes.string,
    correct: PropTypes.bool,
  }).isRequired,
  edit: PropTypes.func.isRequired,
};

export default EditOptionModal;