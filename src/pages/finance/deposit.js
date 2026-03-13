import React from "react";
import ErrorMessage from "./components/error-toast"; // Adjust path as needed
import Data from "../../utils/data";

const IErrorMessage = new ErrorMessage();
const $ = window.$; 

// Generate a unique ID so we don't conflict if multiple modals exist
const modalId = `mpesa-modal-${Math.random().toString(36).substring(2, 9)}`;

const StatusDisplay = ({ status, message }) => {
  const statusConfig = {
    IDLE: {
      icon: 'fas fa-info-circle',
      color: '#0c5460',
      bgColor: '#d1ecf1',
      borderColor: '#bee5eb',
      title: 'Ready',
    },
    INITIATING: {
      icon: 'spinner',
      color: '#004085',
      bgColor: '#cce5ff',
      borderColor: '#b8daff',
      title: 'Connecting...',
    },
    AWAITING_USER_ACTION: {
      icon: 'fas fa-mobile-alt',
      color: '#856404', // Yellow/Gold for attention
      bgColor: '#fff3cd',
      borderColor: '#ffeeba',
      title: 'Check your Phone',
    },
    VERIFYING: {
      icon: 'spinner',
      color: '#0c5460',
      bgColor: '#d1ecf1',
      borderColor: '#bee5eb',
      title: 'Verifying...',
    },
    SUCCESS: {
      icon: 'fas fa-check-circle',
      color: '#155724',
      bgColor: '#d4edda',
      borderColor: '#c3e6cb',
      title: 'Success',
    },
    ERROR: {
      icon: 'fas fa-exclamation-circle',
      color: '#721c24',
      bgColor: '#f8d7da',
      borderColor: '#f5c6cb',
      title: 'Payment Failed',
    },
  };

  const current = statusConfig[status] || statusConfig.IDLE;
  
  // Allow message to be a string or a React component/element
  const content = message || current.defaultMessage;

  return (
    <div style={{
      display: 'flex', 
      alignItems: 'flex-start', // Align to top for multi-line errors
      justifyContent: 'flex-start', 
      gap: '15px',
      padding: '15px', 
      marginTop: '20px', 
      borderRadius: '6px',
      border: `1px solid ${current.borderColor}`, 
      color: current.color, 
      backgroundColor: current.bgColor,
      textAlign: 'left'
    }}>
      <div style={{ marginTop: '2px' }}>
        {(status === 'INITIATING' || status === 'VERIFYING') ? (
          <span className="spinner-border spinner-border-sm" />
        ) : (
          <i className={current.icon} style={{ fontSize: '1.4rem' }} />
        )}
      </div>
      <div>
        {/* If we have a custom Error Object (JSX), render it, else render standard text */}
        {typeof content === 'object' ? content : (
            <>
                <strong style={{display: 'block', marginBottom: '4px'}}>{current.title}</strong>
                <span>{content}</span>
            </>
        )}
      </div>
    </div>
  );
};

class MpesaPaymentModal extends React.Component {
  state = {
    status: 'IDLE', 
    message: '',
    transactionId: null, 
    form: { phone: '', amount: '' },
  };

  _isMounted = false;
  pollingInterval = null;

  componentDidMount() {
    this._isMounted = true;
    // Pre-fill phone if available in school data
    const school = Data.schools.getSelected();
    if (school?.phone) {
      this.setState(prev => ({ form: { ...prev.form, phone: school.phone } }));
    }
    
    // Support pre-filling from props (e.g. QuickTopUp)
    if (this.props.forcedSchoolId) {
        // We might fetching public school details to get the phone?
        // Or we just rely on user input.
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.stopPolling();
  }

  // --- Public Methods called via Ref ---
  show = (prefillData = {}) => {
    this.resetState();
    if (prefillData.amount) this.setState(prev => ({ form: { ...prev.form, amount: prefillData.amount }}));
    if (prefillData.phone) this.setState(prev => ({ form: { ...prev.form, phone: prefillData.phone }}));
    
    $(`#${modalId}`).modal({ show: true, backdrop: 'static', keyboard: false });
  };

  hide = () => {
    this.stopPolling();
    $(`#${modalId}`).modal('hide');
  };
  // ------------------------------------

  resetState = () => {
    this.stopPolling();
    if (this._isMounted) {
      this.setState({ status: 'IDLE', message: '', transactionId: null });
    }
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState(prev => ({ form: { ...prev.form, [name]: value } }));
  };

  initiatePayment = async () => {
    const { phone, amount } = this.state.form;
    if (!phone || !amount) return IErrorMessage.show({ message: 'Invalid details.' });

    this.setState({ status: 'INITIATING', message: '' });

    try {
      // 1. Initiate STK Push
      // If forcedSchoolId is provided, we use a public/unauth-friendly method or pass the arg
      const { forcedSchoolId } = this.props;
      let result;
      
      if (forcedSchoolId) {
          result = await Data.schools.charge(phone, amount, { type: 'bulksms' }, forcedSchoolId);
      } else {
          result = await Data.schools.charge(phone, amount, { type: 'bulksms' });
      }
      
      if (!this._isMounted) return;
      if (result.errors || !result?.payments?.init) {
        throw new Error(result.errors?.[0]?.message || 'Failed to init payment.');
      }

      const { id, CheckoutRequestID, MerchantRequestID } = result.payments.init;
      
      this.setState({
        transactionId: id,
        status: 'AWAITING_USER_ACTION',
        message: `Request sent to ${phone}. Enter PIN now.`
      });

      // 2. Start Polling
      this.startPolling(MerchantRequestID, CheckoutRequestID);

    } catch (error) {
      console.error(error);
      if (this._isMounted) this.setState({ status: 'ERROR', message: error.message });
    }
  };

  startPolling = (MerchantRequestID, CheckoutRequestID) => {
    this.stopPolling();
    // Poll every 5 seconds
    this.pollingInterval = setInterval(() => {
      this.checkStatus(MerchantRequestID, CheckoutRequestID);
    }, 5000);
  };

  stopPolling = () => {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  };

  checkStatus = async (MerchantRequestID, CheckoutRequestID) => {
    // Only show "Verifying" if we aren't already in a failure/success state
    if (this.state.status !== 'AWAITING_USER_ACTION' && this.state.status !== 'ERROR') {
        this.setState({ status: 'VERIFYING' });
    }

    try {
      const { forcedSchoolId } = this.props;
      const result = await Data.schools.verifyTx({ 
          MerchantRequestID, 
          CheckoutRequestID,
          schoolId: forcedSchoolId 
      });
      
      if (!this._isMounted) return;
      if (!result?.payments?.confirm) return; // Still pending

      const { status, message, amount, phone, ref } = result.payments.confirm;

      if (status === 'COMPLETED') {
        this.stopPolling();
        this.setState({ 
            status: 'SUCCESS', 
            message: (
                <div>
                    <strong>Payment Received!</strong>
                    <div style={{fontSize: '0.9em', marginTop: '4px'}}>
                        Ref: <b>{ref}</b><br/>
                        Amount: KES {amount}
                    </div>
                </div>
            )
        });
        
        if (this.props.onPaymentSuccess) this.props.onPaymentSuccess();
        setTimeout(() => { this.hide(); }, 4000);

      } else if (status.includes('FAILED') || status.includes('FLAGGED')) {
        this.stopPolling();
        
        // Construct a nice error view using the data from the API
        const errorView = (
            <div>
                <strong>Transaction Failed</strong>
                <div style={{fontSize: '0.95em', marginTop: '5px', marginBottom: '5px'}}>
                    {message}
                </div>
                <div style={{fontSize: '0.85em', opacity: 0.8, borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '5px'}}>
                    KES {amount} • {phone}
                </div>
            </div>
        );

        this.setState({ 
            status: 'ERROR', 
            message: errorView 
        });
      }
    } catch (e) {
      console.error("Poll Error", e);
    }
  };

  render() {
    const { status, form } = this.state;
    const isBusy = ['INITIATING', 'AWAITING_USER_ACTION', 'VERIFYING', 'SUCCESS'].includes(status);

    return (
      <div className="modal fade" id={modalId} tabIndex={-1} role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">M-Pesa Express</h5>
              <button type="button" className="close" onClick={this.hide} disabled={isBusy}><span>×</span></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" className="form-control" name="phone" value={form.phone} onChange={this.handleInputChange} disabled={isBusy} placeholder="2547..." />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" className="form-control" name="amount" value={form.amount} onChange={this.handleInputChange} disabled={isBusy} />
              </div>
              <StatusDisplay status={status} message={this.state.message} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={this.hide} disabled={isBusy}>Close</button>
              {!isBusy && status !== 'ERROR' && (
                <button type="button" className="btn btn-success" onClick={this.initiatePayment}>Send Prompt</button>
              )}
              {status === 'ERROR' && (
                <button type="button" className="btn btn-warning" onClick={this.resetState}>Retry</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MpesaPaymentModal;