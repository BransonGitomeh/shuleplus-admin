import React from "react";
import PropTypes from "prop-types";
import ErrorMessage from "../components/error-toast";

const IErrorMessage = new ErrorMessage();
const $ = window.$;
const toastr = window.toastr;

const modalId = `modal-${Math.random().toString().split(".")[1]}`;

class OptionModal extends React.Component {
  // State is simplified. We don't need to store the `question` prop in state.
  state = {
    loading: false,
    option: {
      value: "",
      correct: false,
    },
  };

  formRef = React.createRef();

  componentDidMount() {
    $(this.formRef.current).validate({
      errorClass: "invalid-feedback",
      errorElement: "div",
      highlight: (element) => $(element).addClass("is-invalid"),
      unhighlight: (element) => $(element).removeClass("is-invalid"),
    });
    // We no longer need to set state from props here.
  }

  componentWillUnmount() {
    if ($(this.formRef.current).data('validator')) {
      $(this.formRef.current).data('validator').destroy();
    }
    this.hide();
  }

  // Public methods
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

  // Uncommented and functional resetForm
  resetForm = () => {
    this.setState({
      loading: false,
      option: { value: "", correct: false },
    });
    if ($(this.formRef.current).data('validator')) {
      $(this.formRef.current).data('validator').resetForm();
      // Also clear invalid classes that resetForm might miss
      $(this.formRef.current).find('.is-invalid').removeClass('is-invalid');
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    if (!$(this.formRef.current).valid()) {
      return;
    }

    this.setState({ loading: true });

    try {
      // Read `question` directly from props. It's always up-to-date.
      const { save, question } = this.props;
      const { option } = this.state;
      
      const payload = {
        value: option.value,
        correct: option.correct,
        question: question, // <-- Read from props
      };

      await save(payload);

      this.hide();
      // toastr.success("Option has been created successfully!", "Option Created");
      this.resetForm();
    } catch (error) {
      this.setState({ loading: false });
      const message = error?.message || "An unexpected error occurred.";
      IErrorMessage.show({ message });
    }
  };
  
  // FIXED: This now correctly preserves the other properties in the `option` state object.
  handleInputChange = (e) => {
    const { value, name } = e.target;
    this.setState((prevState) => ({
      option: {
        ...prevState.option, // Preserve `correct` property
        [name]: value,
      },
    }));
    console.log(this.state);
  };

  // This one was already correct, but it's good to see the consistent pattern.
  handleCheckboxChange = (e) => {
    const { checked, name } = e.target;
    this.setState((prevState) => ({
      option: {
        ...prevState.option, // Preserve `value` property
        [name]: checked,
      },
    }));
    console.log(this.state);
  };

  render() {
    const { loading, option } = this.state;
    console.log(this.props);
    console.log(this.state);
    return (
      <div className="modal" id={modalId} tabIndex={-1} role="dialog">
         <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form ref={this.formRef} onSubmit={this.handleSubmit} className="kt-form kt-form--label-right">
              <div className="modal-header">
                <h5 className="modal-title">Create New Option</h5>
                <button type="button" className="close" aria-label="Close" onClick={this.resetForm}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="kt-portlet__body">
                  <div className="form-group row">
                    <div className="col-lg-12 mb-3">
                      <label htmlFor="value">Option Text:</label>
                      <input
                        type="text"
                        className="form-control"
                        id="value"
                        // FIXED: The name attribute should match the state property key
                        name="value" 
                        minLength="2"
                        value={option.value}
                        onChange={this.handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-lg-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="correct"
                          name="correct"
                          checked={option.correct}
                          onChange={this.handleCheckboxChange}
                        />
                        <label className="form-check-label" htmlFor="correct">
                          Is this the correct option?
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-brand"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-brand"
                  data-dismiss="modal"
                  onClick={this.resetForm} // Also good to reset on cancel
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

OptionModal.propTypes = {
  question: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired,
};

export default OptionModal;