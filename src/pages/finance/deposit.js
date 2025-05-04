import React from "react";
import ErrorMessage from "./components/error-toast";
import "./spinner.css"; // Assuming this contains spinner styles

import Data from "../../utils/data";
// Removed: import { withRouter } from "react-router"; // Not used

const IErrorMessage = new ErrorMessage();

const $ = window.$; // Assuming jQuery is globally available

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

// --- Inline Styles ---
const styles = {
  modalBody: {
    padding: '2rem', // More padding
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  logo: {
    maxWidth: '150px', // Control logo size better
    height: 'auto',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column', // Stack form rows
    gap: '1.5rem', // Space between form rows
  },
  inputRow: {
    display: 'flex',
    alignItems: 'flex-end', // Align items based on their bottom edge
    gap: '1rem', // Space between inputs and button
    flexWrap: 'wrap', // Allow wrapping on smaller screens
  },
  inputGroup: {
    flex: '1 1 auto', // Allow input groups to grow/shrink
    minWidth: '150px', // Minimum width for inputs before wrapping
  },
  buttonGroup: {
    flexShrink: 0, // Prevent button from shrinking
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#595d6e',
  },
  statusArea: {
    marginTop: '1.5rem',
    padding: '1rem',
    border: '1px solid transparent', // Base border
    borderRadius: '0.25rem',
    textAlign: 'center',
    minHeight: '50px', // Prevent layout jumps
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  // Status-specific styles (could also use alert classes directly)
  statusInfo: {
    borderColor: '#bee5eb',
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
  },
  statusSuccess: {
    borderColor: '#c3e6cb',
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusError: {
    borderColor: '#f5c6cb',
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  spinnerIcon: {
      marginRight: '8px', // Space between spinner and text
      width: '1em',       // Match font size
      height: '1em',
  }
};
// --- End Styles ---

class MpesaPaymentModal extends React.Component {
  state = {
    started: false,     // Has the charge process begun?
    loading: false,     // Is an async operation (charge/verify) in progress?
    verifying: false,   // Specifically verifying? (Subset of loading)
    success: null,      // Was the final outcome successful (true/false)? null initially
    message: "",        // Status/result message from API
    errorOccurred: false, // Separate flag for internal/network errors
    edit: {
      phone: "",
      ammount: "",
    },
    school: null,       // Added to store school data if needed
     // Store verification IDs
    CheckoutRequestID: null,
    MerchantRequestID: null,
  };

  // Use _isMounted to prevent state updates after unmounting
  _isMounted = false;

  show = () => { // Use arrow functions for methods called by event handlers/instances
    // Reset state when showing
    this.setState({
      started: false,
      loading: false,
      verifying: false,
      success: null,
      message: "",
      errorOccurred: false,
      edit: {
          // Reset amount, but keep phone number from props if available?
          // phone: this.props.edit?.phone || this.state.edit.phone || "",
          ammount: "",
      },
      CheckoutRequestID: null,
      MerchantRequestID: null,
    });
    $("#" + modalNumber).modal({
      show: true,
      backdrop: "static",
      keyboard: false,
    });
  };

  hide = () => {
    $("#" + modalNumber).modal("hide");
  };

  componentDidMount() {
    this._isMounted = true;

    // Load initial school data if needed (though not directly used in this modal's render)
    const school = Data.schools.getSelected();
    if (school) {
      this.setState({ school, edit: { ...this.state.edit, phone: school.phone || "" } }); // Pre-fill phone
    }

    Data.schools.subscribe(({ schools }) => {
      if (this._isMounted) {
        const currentSelected = Data.schools.getSelected();
        // Only update if needed and selected school changes
        if (currentSelected && currentSelected.id !== this.state.school?.id) {
             this.setState({ school: currentSelected, edit: { ...this.state.edit, phone: currentSelected.phone || "" } });
        }
      }
    });

    // Keep jQuery Validate setup if required, but ensure it doesn't conflict
    const _this = this;
    this.validator = $("#" + modalNumber + "form").validate({
        // ... (highlight/unhighlight options as before) ...
        errorClass: "invalid-feedback",
        errorElement: "div",
        highlight: (element) => $(element).addClass("is-invalid"),
        unhighlight: (element) => $(element).removeClass("is-invalid"),
        // We are not using submitHandler here as the main action is the 'Start Payment' button
        // submitHandler: async (form, event) => { ... }
    });
  }

   componentWillUnmount() {
       this._isMounted = false;
       // If Data.schools.subscribe returns an unsubscribe function:
       // if (this.unsubscribeSchool) this.unsubscribeSchool();
       // Destroy validator if needed:
       // if (this.validator) this.validator.destroy();
   }


  // Use functional setState to avoid direct mutation
  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      edit: {
        ...prevState.edit,
        [name]: value,
      },
    }));
  };

  verifyTx = async (CheckoutRequestID, MerchantRequestID) => { // Use arrow function
    if (!this._isMounted) return; // Prevent execution if unmounted

    this.setState({ verifying: true, loading: true, message: "Checking transaction status..." });

    try {
      const { payments, errors } = await Data.schools.verifyTx({ CheckoutRequestID, MerchantRequestID });

      if (!this._isMounted) return; // Check again after await

      if (errors) {
        console.error("Verification API Error:", errors);
        this.setState({
            verifying: false,
            loading: false,
            success: false,
            errorOccurred: true, // Indicate an error happened
            message: "Error checking transaction status. Please try again later." });
        IErrorMessage.show({ message: "Verification failed" }); // Show toast
        return;
      }

      // Simplify response handling - check ResultCode and ResultDesc
      const resultCode = payments?.confirm?.Body?.stkCallback?.ResultCode;
      const resultDesc = payments?.confirm?.Body?.stkCallback?.ResultDesc || "Processing...";

      if (resultCode === undefined || resultCode === null) {
        // Still processing or unexpected response format, schedule another check
         console.log("Verification pending, retrying...");
         setTimeout(() => this.verifyTx(CheckoutRequestID, MerchantRequestID), 5000); // Retry after 5s
         // Keep verifying state true, update message if needed
         this.setState({ message: resultDesc });
         return;
      }

      // We have a final ResultCode
      const isSuccess = resultCode === 0; // Mpesa success code is 0

      this.setState({
        verifying: false,
        loading: false,
        success: isSuccess,
        message: resultDesc, // Use Mpesa's description
      });

      if (isSuccess) {
         // Optional: Delay redirect slightly to show success message
         setTimeout(() => {
             // Consider redirecting via props callback or router history instead of hard reload
             // Example: this.props.onPaymentSuccess(); this.hide();
             window.document.location.href = "/home"; // Or target route
             // window.location.reload(); // Avoid if possible
         }, 1500);
      }

    } catch (error) {
        console.error("Verification Network/Logic Error:", error);
         if (this._isMounted) {
             this.setState({
                 verifying: false,
                 loading: false,
                 success: false,
                 errorOccurred: true,
                 message: "An unexpected error occurred during verification." });
              IErrorMessage.show({ message: "Verification error" });
         }
    }
  };

  charge = async () => { // Use arrow function
    const { phone, ammount } = this.state.edit;

    // Basic frontend validation
    if (!phone || !ammount || isNaN(Number(ammount)) || Number(ammount) <= 0) {
        IErrorMessage.show({ message: "Please enter a valid phone number and amount." });
        return;
    }

    this.setState({ started: true, loading: true, verifying: false, success: null, message: "Initiating payment..." });

    try {
      const { payments, errors } = await Data.schools.charge(phone, ammount.toString());

       if (!this._isMounted) return;

      if (errors || !payments?.init?.CheckoutRequestID) {
         console.error("Charge API Error:", errors);
         const errorMessage = errors?.[0]?.message || "Failed to initiate payment.";
         this.setState({ loading: false, started: false, success: false, errorOccurred: true, message: errorMessage });
         IErrorMessage.show({ message: errorMessage });
         return;
      }

      const { CheckoutRequestID, MerchantRequestID } = payments.init;

      if (CheckoutRequestID && MerchantRequestID) {
        this.setState({
            CheckoutRequestID,
            MerchantRequestID,
            loading: false, // Initial charge request done, now waiting for phone & verification
            message: "Please check your phone to authorize the payment."
        });
        // Start polling for verification
        this.verifyTx(CheckoutRequestID, MerchantRequestID);
      } else {
          // Handle case where IDs are missing unexpectedly
          this.setState({ loading: false, started: false, success: false, errorOccurred: true, message: "Failed to get transaction details." });
      }

    } catch (error) {
       console.error("Charge Network/Logic Error:", error);
        if (this._isMounted) {
            this.setState({ loading: false, started: false, success: false, errorOccurred: true, message: "An unexpected error occurred." });
            IErrorMessage.show({ message: "Payment initiation failed" });
        }
    }
  };

  // Helper to determine current status display
  renderStatus = () => {
    const { started, loading, verifying, success, message, errorOccurred } = this.state;

    let statusStyle = {};
    let statusIcon = null;
    let statusMessage = "";

    if (success === false || errorOccurred) {
        statusStyle = styles.statusError;
        statusIcon = <i className="fas fa-times-circle" />; // Example Font Awesome icon
        statusMessage = message || "An error occurred.";
    } else if (success === true) {
        statusStyle = styles.statusSuccess;
        statusIcon = <i className="fas fa-check-circle" />;
        statusMessage = message || "Payment Successful!";
    } else if (verifying) {
        statusStyle = styles.statusInfo;
        statusIcon = <span className="spinner-border spinner-border-sm" style={styles.spinnerIcon} role="status" aria-hidden="true" />;
        statusMessage = message || "Checking transaction status...";
    } else if (loading) { // Loading but not verifying (e.g., initial charge call)
        statusStyle = styles.statusInfo;
        statusIcon = <span className="spinner-border spinner-border-sm" style={styles.spinnerIcon} role="status" aria-hidden="true" />;
        statusMessage = message || "Processing...";
    } else if (started) { // Started but not loading/verifying (e.g., waiting for phone prompt)
        statusStyle = styles.statusInfo;
        statusIcon = <i className="fas fa-mobile-alt" />;
        statusMessage = message || "Please check your phone to authorize payment.";
    } else {
        // Initial state - no status box or a default message
        // return null; // Or return a default waiting message
         statusStyle = styles.statusInfo;
         statusIcon = <i className="fas fa-info-circle" />;
         statusMessage = "Enter phone number and amount to start.";
    }

    return (
        <div style={{ ...styles.statusArea, ...statusStyle }}>
            {statusIcon}
            <span>{statusMessage}</span>
        </div>
    );

  }

  render() {
    const { loading, verifying } = this.state;
    const isBusy = loading || verifying; // Combine flags for disabling elements

    return (
      <div>
        <div
          className="modal"
          id={modalNumber}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="mpesaPaymentModalLabel" // Added label
          aria-hidden="true"
        >
          {/* Adjusted size to large, XL might be too big */}
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              {/* Use onSubmit for form if needed, but primary action is button click */}
              <form id={modalNumber + "form"} className="kt-form" onSubmit={e => e.preventDefault()}>
                <div className="modal-header">
                  <h5 className="modal-title" id="mpesaPaymentModalLabel">Make Mpesa Payment</h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal" // Bootstrap's dismiss attribute
                    aria-label="Close"
                    onClick={this.hide} // Also call our hide method if needed
                  >
                    <span aria-hidden="true">×</span> {/* Use × for 'x' */}
                  </button>
                </div>

                <div className="modal-body" style={styles.modalBody}>
                  <div style={styles.logoContainer}>
                    <img style={styles.logo} src={"/img/lipa-na-mpesa.svg"} alt="Lipa na M-Pesa" />
                  </div>

                  <div style={styles.formContainer}>
                     {/* Input Row */}
                     <div style={styles.inputRow}>
                        <div style={styles.inputGroup}>
                           <label htmlFor="phone" style={styles.label}>Mpesa Phone Number:</label>
                           <input
                             type="tel" // Use tel type for phone numbers
                             className="form-control"
                             id="phone"
                             name="phone" // Name matches state key
                             placeholder="e.g., 2547XXXXXXXX"
                             required
                             value={this.state.edit.phone}
                             onChange={this.handleInputChange}
                             disabled={isBusy} // Disable when loading/verifying
                           />
                        </div>
                        <div style={styles.inputGroup}>
                           <label htmlFor="ammount" style={styles.label}>Amount (KES):</label>
                           <input
                             type="number" // Use number type for amount
                             className="form-control"
                             id="ammount"
                             name="ammount" // Name matches state key
                             placeholder="e.g., 100"
                             min="1" // Minimum amount
                             required
                             value={this.state.edit.ammount}
                             onChange={this.handleInputChange}
                             disabled={isBusy} // Disable when loading/verifying
                           />
                        </div>
                        <div style={styles.buttonGroup}>
                           {/* Add empty label or adjust alignment if needed */}
                           <label style={{...styles.label, visibility: 'hidden'}}>Action</label>
                           <button
                             type="button" // Explicitly type="button"
                             className="btn btn-success btn-block" // btn-block for responsiveness if needed
                             disabled={isBusy} // Disable button too
                             onClick={this.charge}
                           >
                             {isBusy ? (
                               <>
                                 <span className="spinner-border spinner-border-sm" style={{marginRight: '8px'}} role="status" aria-hidden="true"/>
                                 Processing...
                               </>
                             ) : (
                                 "Start Payment"
                               )}
                           </button>
                        </div>
                     </div>

                     {/* Status Area Row */}
                      <div>
                          {this.renderStatus()}
                      </div>

                  </div>
                </div> {/* End modal-body */}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary" // More standard secondary button
                    data-dismiss="modal"
                    onClick={this.hide}
                    disabled={verifying && this.state.success === null} // Maybe disable cancel during crucial verification? Optional.
                  >
                    Cancel
                  </button>
                  {/* Optionally add a "Close" button if success/fail state reached */}
                   {this.state.success !== null && (
                       <button
                           type="button"
                           className="btn btn-primary"
                           onClick={this.hide}
                       >
                           Close
                       </button>
                   )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Removed withRouter export wrapper as it wasn't used
export default MpesaPaymentModal; // Changed class name