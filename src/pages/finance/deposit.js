import React from "react";
import ErrorMessage from "./components/error-toast";
import "./spinner.css"; // Ensure this has .spinner-border styles

import Data from "../../utils/data";

const IErrorMessage = new ErrorMessage();
const $ = window.$; // Assuming jQuery for modal control is required

const modalId = `mpesa-modal-${Math.random().toString(36).substring(2, 9)}`;

// --- UI Component for Status Display ---
const StatusDisplay = ({ status, message }) => {
  const statusConfig = {
    // Initial state or after reset
    IDLE: {
      icon: 'fas fa-info-circle',
      color: '#0c5460',
      bgColor: '#d1ecf1',
      borderColor: '#bee5eb',
      defaultMessage: 'Enter details to start your payment.',
    },
    // Waiting for init mutation
    INITIATING: {
      icon: 'spinner',
      color: '#004085',
      bgColor: '#cce5ff',
      borderColor: '#b8daff',
      defaultMessage: 'Connecting to M-Pesa...',
    },
    // Waiting for user to enter PIN on their phone
    AWAITING_USER_ACTION: {
      icon: 'fas fa-mobile-alt',
      color: '#004085',
      bgColor: '#cce5ff',
      borderColor: '#b8daff',
      defaultMessage: 'A prompt has been sent to your phone. Please enter your M-Pesa PIN to authorize.',
    },
    // Polling getPaymentStatus query
    VERIFYING: {
      icon: 'spinner',
      color: '#0c5460',
      bgColor: '#d1ecf1',
      borderColor: '#bee5eb',
      defaultMessage: 'Verifying payment, please wait...',
    },
    // Terminal success state
    SUCCESS: {
      icon: 'fas fa-check-circle',
      color: '#155724',
      bgColor: '#d4edda',
      borderColor: '#c3e6cb',
      defaultMessage: 'Payment was successful! Redirecting...',
    },
    // Terminal error state
    ERROR: {
      icon: 'fas fa-times-circle',
      color: '#721c24',
      bgColor: '#f8d7da',
      borderColor: '#f5c6cb',
      defaultMessage: 'An error occurred. Please try again.',
    },
  };

  const currentStatus = statusConfig[status];
  if (!currentStatus) return null;

  const displayMessage = message || currentStatus.defaultMessage;
  
  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
    marginTop: '1.5rem',
    borderRadius: '0.25rem',
    border: `1px solid ${currentStatus.borderColor}`,
    color: currentStatus.color,
    backgroundColor: currentStatus.bgColor,
    textAlign: 'center',
    minHeight: '60px',
    transition: 'all 0.3s ease-in-out',
  };

  return (
    <div style={style}>
      {currentStatus.icon === 'spinner' ? (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
      ) : (
        <i className={currentStatus.icon} style={{ fontSize: '1.2rem' }} />
      )}
      <span>{displayMessage}</span>
    </div>
  );
};

// --- Main Modal Component ---
class MpesaPaymentModalV2 extends React.Component {
  state = {
    // Single status string to manage the entire flow
    status: 'IDLE', // IDLE | INITIATING | AWAITING_USER_ACTION | VERIFYING | SUCCESS | ERROR
    message: '',      // User-facing message from the API or for guidance
    transactionId: null, // The ID we get from our backend to poll with
    form: {
      phone: '',
      amount: '',
    },
  };

  _isMounted = false;
  pollingInterval = null;

  componentDidMount() {
    this._isMounted = true;
    const school = Data.schools.getSelected();
    if (school?.phone) {
      this.setState({ form: { ...this.state.form, phone: school.phone } });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.stopPolling(); // Ensure no intervals are left running
  }

  show = () => {
    this.resetState();
    $(`#${modalId}`).modal({ show: true, backdrop: 'static', keyboard: false });
  };

  hide = () => {
    this.stopPolling();
    $(`#${modalId}`).modal('hide');
  };

  resetState = () => {
    this.stopPolling();
    if (this._isMounted) {
      this.setState({
        status: 'IDLE',
        message: '',
        transactionId: null,
        // Don't reset the form fields, user might want to retry with same details
      });
    }
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      form: { ...prevState.form, [name]: value },
    }));
  };

  initiatePayment = async () => {
    const { phone, amount } = this.state.form;

    if (!phone || !amount || Number(amount) <= 0) {
      IErrorMessage.show({ message: 'Please enter a valid phone number and amount.' });
      return;
    }

    this.setState({ status: 'INITIATING', message: '' });

    try {
      // Assuming Data.schools.initiatePayment maps to your `init` mutation
      const result = await Data.schools.charge(phone, amount);

      console.log(result)
      if (!this._isMounted) return;

      if (result.errors || !result?.payments?.init) {
        const errorMessage = result.errors?.[0]?.message || 'Failed to start payment process.';
        this.setState({ status: 'ERROR', message: errorMessage });
        return;
      }
      
      const { id, CheckoutRequestID, MerchantRequestID } = result.payments.init;
      this.setState({
        transactionId: id,
        status: 'AWAITING_USER_ACTION',
        message: `Your payment request has been sent. CheckoutRequestID: ${CheckoutRequestID}, MerchantRequestID: ${MerchantRequestID}`,
      });

      // Start polling for the result
      this.startPolling(id);

    } catch (error) {
      console.error("Initiation Error:", error);
      if (this._isMounted) {
        this.setState({ status: 'ERROR', message: 'A network error occurred. Please try again.' });
      }
    }
  };

  startPolling = (transactionId) => {
    this.stopPolling(); // Ensure no multiple polls are running

    // Immediately check status, then set interval
    this.checkPaymentStatus(transactionId);

    this.pollingInterval = setInterval(() => {
      this.checkPaymentStatus(transactionId);
    }, 5000); // Poll every 5 seconds
  };
  
  stopPolling = () => {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  };

  checkPaymentStatus = async ({ MerchantRequestID, CheckoutRequestID }) => {
    // If we've already reached a terminal state, don't continue polling
    if (['SUCCESS', 'ERROR'].includes(this.state.status)) {
        this.stopPolling();
        return;
    }
    
    // Set verifying status for better UX, unless we're still waiting for user PIN
    if (this.state.status !== 'AWAITING_USER_ACTION') {
      this.setState({ status: 'VERIFYING' });
    }

    try {
      // Assumes Data.schools.verifyTx maps to your `getPaymentStatus` query
      const {payments:paymentData} = await Data.schools.verifyTx({ MerchantRequestID, CheckoutRequestID });

      console.log(paymentData)
      if (!this._isMounted) return;

      if (paymentData.errors || !paymentData?.confirm) {
        // Don't stop polling on a single failed check, could be a network blip.
        // After several failures, you might want to stop and show an error.
        console.warn('Polling check failed, will retry.');
        return;
      }

      const { status, errorMessage, ref } = paymentData.confirm;

      if (status === 'COMPLETED') {
        this.stopPolling();
        this.setState({ status: 'SUCCESS', message: `Payment successful! Receipt: ${ref}` });
        // setTimeout(() => {
        //   // this.hide();
        //   window.location.reload(); // Or redirect
        // }, 2000);

      } else if (status.startsWith('FAILED') || status.startsWith('FLAGGED')) {
        this.stopPolling();
        this.setState({ status: 'ERROR', message: errorMessage || 'The payment could not be completed.' });
      
      } // If status is 'PENDING', do nothing and let the interval poll again.

    } catch (error) {
        console.error("Polling Error:", error);
        // To avoid infinite loops on persistent network errors, you might add a retry counter
        // For now, we'll let it continue trying.
    }
  };
  
  renderForm = () => {
    const { status, form } = this.state;
    const isBusy = ['INITIATING', 'AWAITING_USER_ACTION', 'VERIFYING', 'SUCCESS'].includes(status);

    return (
      <>
        <div className="form-group">
          <label htmlFor={`${modalId}-phone`}>M-Pesa Phone Number</label>
          <input
            id={`${modalId}-phone`}
            type="tel"
            className="form-control form-control-lg"
            name="phone"
            placeholder="2547XXXXXXXX"
            value={form.phone}
            onChange={this.handleInputChange}
            disabled={isBusy}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${modalId}-amount`}>Amount (KES)</label>
          <input
            id={`${modalId}-amount`}
            type="number"
            className="form-control form-control-lg"
            name="amount"
            placeholder="100"
            min="1"
            value={form.amount}
            onChange={this.handleInputChange}
            disabled={isBusy}
          />
        </div>
      </>
    );
  };
  
  renderActions = () => {
    const { status } = this.state;

    if (status === 'ERROR') {
      return (
        <button type="button" className="btn btn-warning btn-lg btn-block" onClick={this.resetState}>
          <i className="fas fa-redo" style={{ marginRight: '8px' }} />
          Try Again
        </button>
      );
    }

    const isBusy = !['IDLE', 'ERROR'].includes(status);

    return (
      <button
        type="button"
        className="btn btn-success btn-lg btn-block"
        onClick={this.initiatePayment}
        disabled={isBusy}
      >
        {isBusy ? (
          <>
            <span className="spinner-border spinner-border-sm" style={{marginRight: '8px'}} role="status" aria-hidden="true"/>
            Processing...
          </>
        ) : (
          'Pay Securely'
        )}
      </button>
    );
  };

  render() {
    return (
      <div>
        <div className="modal fade" id={modalId} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">M-Pesa Express Payment</h5>
                <button type="button" className="close" onClick={this.hide}>
                  <span>×</span>
                </button>
              </div>
              <div className="modal-body" style={{ padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <img src="/img/lipa-na-mpesa.svg" alt="Lipa na M-Pesa" style={{ maxWidth: '150px' }} />
                </div>
                
                {this.renderForm()}
                
                <StatusDisplay status={this.state.status} message={this.state.message} />
                
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <button type="button" className="btn btn-link" onClick={this.hide}>
                    Cancel
                 </button>
                 <div style={{ width: '60%' }}>
                    {this.renderActions()}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MpesaPaymentModalV2;