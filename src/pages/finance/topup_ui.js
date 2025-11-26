import React, { useState } from "react";
import { withRouter } from "react-router";
import MpesaPaymentModal from "./deposit"; 
import Data from "../../utils/data"; 
import moment from "moment";

// --- SUB-COMPONENT: Status Badge ---
const PaymentStatusBadge = ({ status }) => {
  const config = {
    COMPLETED: { color: 'success', icon: 'fa-check', label: 'Paid', bg: '#e8fff3', text: '#155724' },
    PENDING: { color: 'primary', icon: 'fa-spinner fa-spin', label: 'Processing', bg: '#eaf4ff', text: '#004085' },
    FAILED: { color: 'danger', icon: 'fa-times', label: 'Failed', bg: '#fff5f5', text: '#721c24' },
    CANCELLED: { color: 'warning', icon: 'fa-ban', label: 'Cancelled', bg: '#fff9e6', text: '#856404' },
    FLAGGED_AMOUNT_MISMATCH: { color: 'danger', icon: 'fa-exclamation-triangle', label: 'Fraud Flag', bg: '#fff5f5', text: '#721c24' }
  };

  const current = config[status] || { color: 'secondary', icon: 'fa-question', label: status, bg: '#f0f0f0', text: '#333' };

  return (
    <span className={`badge`} style={{
        backgroundColor: current.bg, 
        color: current.text, 
        border: `1px solid ${current.bg}`,
        padding: '6px 10px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
    }}>
      <i className={`fa ${current.icon}`} style={{fontSize: '0.8rem'}}></i> {current.label}
    </span>
  );
};

// --- SUB-COMPONENT: Timeline Visualizer ---
const TransactionTimeline = ({ payment }) => {
  const metadata = payment.metadata || {};
  const isCompleted = payment.status === 'COMPLETED';
  const isFlagged = payment.status === 'FLAGGED_AMOUNT_MISMATCH';
  const isFailed = ['FAILED', 'CANCELLED', 'FAILED_ON_INITIATION'].includes(payment.status);

  // Helper to draw the line
  const Step = ({ title, desc, time, icon, color, isLast }) => (
    <div style={{display: 'flex', gap: '15px', position: 'relative', paddingBottom: isLast ? '0' : '20px'}}>
        {/* Line */}
        {!isLast && <div style={{position: 'absolute', left: '14px', top: '28px', bottom: '0', width: '2px', background: '#e0e0e0'}}></div>}
        
        {/* Icon */}
        <div style={{
            width: '30px', height: '30px', borderRadius: '50%', 
            background: color === 'success' ? '#1dc9b7' : color === 'danger' ? '#fd3995' : '#5d78ff',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1, flexShrink: 0
        }}>
            <i className={`fa ${icon}`} style={{fontSize: '0.8rem'}}></i>
        </div>

        {/* Content */}
        <div>
            <div style={{display:'flex', alignItems:'center', gap: '10px'}}>
                <span style={{fontWeight: '600', fontSize: '0.9rem'}}>{title}</span>
                {time && <span className="text-muted" style={{fontSize: '0.75rem'}}>{time}</span>}
            </div>
            <div className="text-muted" style={{fontSize: '0.85rem', marginTop: '2px'}}>{desc}</div>
        </div>
    </div>
  );

  return (
    <div className="p-3" style={{background: '#f9f9fc', borderRadius: '8px'}}>
        {/* Step 1: Init */}
        <Step 
            title="Request Initiated"
            desc={`System requested KES ${payment.amount} from ${payment.phone}`}
            time={moment(payment.createdAt).format('HH:mm:ss')}
            icon="fa-mobile-alt"
            color="primary"
            isLast={!payment.checkoutRequestID}
        />

        {/* Step 2: STK Push */}
        {payment.checkoutRequestID && (
            <Step 
                title="Sent to Safaricom"
                desc={
                    <span>
                        STK Push delivered to phone. <br/>
                        <span style={{fontSize:'0.75rem', opacity: 0.8}}>Req ID: {payment.checkoutRequestID}</span>
                    </span>
                }
                time={moment(payment.createdAt).add(2, 'seconds').format('ss') + 's later'}
                icon="fa-wifi"
                color="primary"
                isLast={!payment.resultCode && !isCompleted && !isFailed && !isFlagged}
            />
        )}

        {/* Step 3: Result */}
        {(payment.resultCode || isCompleted || isFailed || isFlagged) && (
            <Step 
                title={isCompleted ? "Payment Confirmed" : "Callback Received"}
                desc={
                    <div>
                        {isCompleted && <span className="text-success font-weight-bold">✓ Validated Amount: KES {payment.amount}</span>}
                        {isFailed && <span className="text-danger">{payment.resultDesc || payment.errorMessage}</span>}
                        {isFlagged && <span className="text-danger font-weight-bold">⚠ Fraud Alert: {payment.errorMessage}</span>}
                        <div style={{fontSize:'0.75rem', marginTop: '4px'}}>
                            Ref: {payment.mpesaReceiptNumber || payment.ref || 'N/A'}
                        </div>
                    </div>
                }
                time={payment.updatedAt ? moment(payment.updatedAt).format('HH:mm:ss') : '...'}
                icon={isCompleted ? "fa-check" : "fa-times"}
                color={isCompleted ? "success" : "danger"}
                isLast={true}
            />
        )}
    </div>
  );
};


// --- SUB-COMPONENT: The Expandable Row ---
const PaymentRow = ({ payment }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Styling helpers
  const isCompleted = payment.status === 'COMPLETED';
  const amountClass = isCompleted ? 'text-success' : 'text-dark';
  
  return (
    <div className="card-spacer" style={{marginBottom: '10px'}}>
        {/* Main Card */}
        <div 
            onClick={toggleOpen}
            style={{
                background: 'white',
                borderRadius: isOpen ? '8px 8px 0 0' : '8px',
                padding: '15px 20px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                border: '1px solid #ebedf2',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
            }}
            className="hover-elevate"
        >
            {/* 1. Icon Box */}
            <div style={{
                width: '45px', height: '45px', borderRadius: '8px',
                background: isCompleted ? '#e8fff3' : '#f0f3ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isCompleted ? '#1dc9b7' : '#5d78ff',
                fontSize: '1.2rem'
            }}>
                <i className={`fa ${isCompleted ? 'fa-wallet' : 'fa-mobile-alt'}`}></i>
            </div>

            {/* 2. Phone & Time */}
            <div style={{flex: 1, minWidth: '150px'}}>
                <div style={{fontWeight: '600', fontSize: '1rem', color: '#3f4254'}}>
                    {payment.phone}
                </div>
                <div style={{color: '#B5B5C3', fontSize: '0.85rem'}}>
                    {moment(payment.createdAt || payment.time).fromNow()}
                </div>
            </div>

            {/* 3. Reference Code */}
            <div className="d-none d-md-block" style={{width: '180px'}}>
                <div style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color:'#7E8299', fontWeight: '500'}}>
                    MPESA Ref
                </div>
                <div style={{fontWeight: '600', color: '#3f4254'}}>
                    {payment.mpesaReceiptNumber || payment.ref || '---'}
                </div>
            </div>

            {/* 4. Amount */}
            <div style={{minWidth: '100px', textAlign: 'right'}}>
                <div className={amountClass} style={{fontWeight: '700', fontSize: '1.1rem'}}>
                    KES {payment.amount}
                </div>
            </div>

            {/* 5. Status Badge */}
            <div style={{minWidth: '100px', textAlign: 'right'}}>
                <PaymentStatusBadge status={payment.status} />
            </div>

            {/* 6. Chevron */}
            <div style={{marginLeft: '10px', color: '#B5B5C3', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s'}}>
                <i className="fa fa-chevron-down"></i>
            </div>
        </div>

        {/* Collapsible Details */}
        {isOpen && (
            <div style={{
                background: 'white',
                border: '1px solid #ebedf2',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                padding: '20px',
                animation: 'fadeIn 0.3s ease'
            }}>
                <div className="row">
                    {/* Left: Timeline */}
                    <div className="col-md-7">
                        <h6 className="text-muted text-uppercase mb-3 font-size-sm font-weight-bold">Transaction Flow</h6>
                        <TransactionTimeline payment={payment} />
                    </div>

                    {/* Right: Technical Details */}
                    <div className="col-md-5 mt-4 mt-md-0">
                        <h6 className="text-muted text-uppercase mb-3 font-size-sm font-weight-bold">Technical Details</h6>
                        <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '6px', fontSize: '0.85rem'}}>
                           
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Checkout Request ID:</span>
                                <span className="font-weight-bold">{payment.checkoutRequestID || 'N/A'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Merchant Request ID:</span>
                                <span>{payment.merchantRequestID || 'N/A'}</span>
                            </div>
                            <hr style={{margin: '10px 0', borderColor: '#e0e0e0'}}/>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Result Code:</span>
                                <code>{payment.resultCode ?? '...'}</code>
                            </div>
                             <div className="d-flex justify-content-between">
                                <span className="text-muted">Callback Time:</span>
                                <span>{payment.updatedAt ? moment(payment.updatedAt).format('DD MMM, HH:mm:ss') : '-'}</span>
                            </div>

                             {/* Raw JSON Toggle */}
                            <div className="mt-3 text-right">
                                <details>
                                    <summary style={{cursor:'pointer', color: '#5d78ff', fontSize:'0.8rem'}}>View Raw Payload</summary>
                                    <pre style={{textAlign:'left', marginTop:'10px', maxHeight:'150px', overflow:'auto', fontSize:'10px'}}>
                                        {JSON.stringify(payment.metadata, null, 2)}
                                    </pre>
                                </details>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}


// --- MAIN COMPONENT ---
class PaymentsDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.modalRef = React.createRef();
    this.state = {
      payments: [],
      filteredPayments: [], 
      searchTerm: "",
    };
  }

  componentDidMount() {
    this.fetchData();
    // Poll every 5 seconds for that "Real Time" feel
    this.interval = setInterval(this.fetchData, 5000);
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);
  }

  fetchData = () => {
    const payments = Data.payments.list() || [];
    // Sort by Newest First
    payments.sort((a, b) => new Date(b.createdAt || b.time) - new Date(a.createdAt || a.time));
    
    this.setState(prevState => ({
      payments,
      filteredPayments: this.filterPayments(payments, prevState.searchTerm),
    }));
  };

  filterPayments = (list, term) => {
    if (!term) return list;
    const lower = term.toLowerCase();
    return list.filter(p => 
      (p.phone || '').includes(lower) ||
      (p.mpesaReceiptNumber || p.ref || '').toLowerCase().includes(lower) ||
      (String(p.amount) || '').includes(lower)
    );
  };

  onSearch = e => {
    const searchTerm = e.target.value;
    this.setState({ 
      searchTerm, 
      filteredPayments: this.filterPayments(this.state.payments, searchTerm) 
    });
  };

  render() {
    const { filteredPayments, searchTerm } = this.state;

    return (
      <div className="container-fluid" style={{padding: '20px'}}>
        
        {/* Header Section */}
        <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
                <h3 className="text-dark font-weight-bold mb-0">Transactions</h3>
                <span className="text-muted font-size-sm">Monitor incoming M-Pesa payments in real-time</span>
            </div>
            <button className="btn btn-success font-weight-bold shadow-sm" onClick={() => this.modalRef.current.show()}>
                <i className="fa fa-plus-circle"></i> New Payment
            </button>
        </div>

        {/* Search Bar */}
        <div className="card shadow-sm border-0 mb-4" style={{borderRadius: '10px'}}>
            <div className="card-body p-3">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text bg-transparent border-0">
                            <i className="la la-search text-muted"></i>
                        </span>
                    </div>
                    <input 
                        type="text" 
                        className="form-control border-0 font-weight-bold" 
                        placeholder="Search by Phone, Ref Code, or Amount..." 
                        value={searchTerm}
                        onChange={this.onSearch}
                        style={{boxShadow: 'none', background: 'transparent'}}
                    />
                </div>
            </div>
        </div>

        {/* The List */}
        <div style={{minHeight: '400px'}}>
            {filteredPayments.map(payment => (
                <PaymentRow key={payment.id} payment={payment} />
            ))}
            
            {filteredPayments.length === 0 && (
                <div className="text-center p-5 text-muted">
                    <i className="la la-inbox" style={{fontSize: '3rem', opacity: 0.5}}></i>
                    <p className="mt-3">No transactions found.</p>
                </div>
            )}
        </div>

        {/* Hidden Modal */}
        <MpesaPaymentModal 
            ref={this.modalRef} 
            onPaymentSuccess={this.fetchData}
        />

        {/* Simple animation styles */}
        <style>{`
            .hover-elevate:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
      </div>
    );
  }
}

export default withRouter(PaymentsDashboard);