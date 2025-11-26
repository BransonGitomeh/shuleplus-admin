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

class PaymentsDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.modalRef = React.createRef();
    this.state = {
      payments: [],
      filteredPayments: [], 
      expandedId: null, // Tracks which row is expanded
      searchTerm: "",
    };
  }

  componentDidMount() {
    this.fetchData();
    this.interval = setInterval(this.fetchData, 5000);
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);
  }

  fetchData = () => {
    const payments = Data.payments.list() || [];
    // Sort: Newest first
    payments.sort((a, b) => new Date(b.createdAt || b.time) - new Date(a.createdAt || a.time));
    
    this.setState(prevState => ({
      payments,
      filteredPayments: this.filterPayments(payments, prevState.searchTerm)
    }));
  };

  filterPayments = (list, term) => {
    if (!term) return list;
    const lower = term.toLowerCase();
    return list.filter(p => 
      (p.phone || '').includes(lower) ||
      (p.mpesaReceiptNumber || p.ref || '').toLowerCase().includes(lower)
    );
  };

  onSearch = e => {
    const searchTerm = e.target.value;
    this.setState({ 
      searchTerm, 
      filteredPayments: this.filterPayments(this.state.payments, searchTerm) 
    });
  };

  toggleRow = (id) => {
    this.setState(prev => ({
      expandedId: prev.expandedId === id ? null : id
    }));
  };

  // Helper to get border color based on status
  getStatusColor = (status) => {
    if (status === 'COMPLETED') return '#1dc9b7'; // Success Green
    if (status === 'PENDING') return '#5d78ff';   // Brand Blue
    if (status === 'FLAGGED_AMOUNT_MISMATCH') return '#fd3995'; // Danger Red
    return '#c5cbe3'; // Grey
  }

  render() {
    const { filteredPayments, expandedId, searchTerm } = this.state;

    return (
      <div className="kt-portlet kt-portlet--mobile">
        {/* HEADER */}
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand flaticon2-line-chart"></i>
            </span>
            <h3 className="kt-portlet__head-title">
              Transactions Feed
              <small>Real-time M-Pesa activity</small>
            </h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="kt-portlet__head-actions">
                <button 
                    className="btn btn-brand btn-elevate btn-icon-sm"
                    onClick={() => this.modalRef.current.show()}
                >
                  <i className="la la-plus"></i> New Request
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="kt-portlet__body">
          {/* SEARCH */}
          <div className="kt-form kt-form--label-right kt-margin-b-20">
            <div className="row align-items-center">
              <div className="col-xl-8 order-2 order-xl-1">
                <div className="row align-items-center">
                  <div className="col-md-4 kt-margin-b-20-tablet-and-mobile">
                    <div className="kt-input-icon kt-input-icon--left">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search..." 
                        id="generalSearch" 
                        onChange={this.onSearch}
                        value={searchTerm}
                      />
                      <span className="kt-input-icon__icon kt-input-icon__icon--left">
                        <span><i className="la la-search" /></span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CREATIVE LIST */}
          <div className="kt-section">
             <div className="kt-section__content">
                {filteredPayments.map(payment => {
                    const isExpanded = expandedId === payment.id;
                    const borderColor = this.getStatusColor(payment.status);

                    return (
                        <div key={payment.id} className="card mb-3 shadow-sm" style={{border: 'none', borderLeft: `5px solid ${borderColor}`}}>
                            {/* MAIN ROW - ALWAYS VISIBLE */}
                            <div 
                                className="card-body p-4" 
                                onClick={() => this.toggleRow(payment.id)}
                                style={{cursor: 'pointer', background: isExpanded ? '#f9f9fc' : '#fff'}}
                            >
                                <div className="d-flex align-items-center justify-content-between flex-wrap">
                                    
                                    {/* Column 1: Amount & Status */}
                                    <div className="d-flex align-items-center mr-5 mb-2">
                                        <div className="symbol symbol-40 mr-3">
                                            <span className="symbol-label" style={{background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                <i className="flaticon-coins text-dark-50"></i>
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-weight-bolder font-size-lg text-dark">
                                                KES {payment.amount}
                                            </div>
                                            <div className="text-muted font-size-sm">
                                                <PaymentStatusBadge status={payment.status} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Payer Info */}
                                    <div className="d-flex flex-column mr-5 mb-2" style={{minWidth: '150px'}}>
                                        <span className="text-dark-75 font-weight-bold">
                                            {payment.phone}
                                        </span>
                                        <span className="text-muted font-size-sm">
                                            {payment.checkoutRequestID ? 'Automated Prompt' : 'Manual Pay'}
                                        </span>
                                    </div>

                                    {/* Column 3: Reference & Time */}
                                    <div className="d-flex flex-column mr-5 mb-2 text-right">
                                        <span className="text-dark-75 font-weight-bold font-size-h6">
                                            {payment.mpesaReceiptNumber || payment.ref || "---"}
                                        </span>
                                        <span className="text-muted font-size-sm">
                                            {moment(payment.createdAt || payment.time).fromNow()}
                                        </span>
                                    </div>

                                    {/* Column 4: Chevron */}
                                    <div className="d-flex align-items-center">
                                        <button className={`btn btn-icon btn-sm btn-clean ${isExpanded ? 'active' : ''}`}>
                                            <i className={`la ${isExpanded ? 'la-angle-up' : 'la-angle-down'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* EXPANDED DETAILS - SLIDES DOWN */}
                            {isExpanded && (
                                <div className="card-footer bg-white p-0 animated fadeIn" style={{borderTop: '1px dashed #ebedf2'}}>
                                    <div className="row no-gutters">
                                        {/* Left Side: Timeline */}
                                        <div className="col-lg-7 p-4 border-right">
                                            <h6 className="text-uppercase text-muted mb-3 font-size-xs font-weight-bolder">Transaction Journey</h6>
                                            <TransactionTimeline payment={payment} />
                                        </div>
                                        
                                        {/* Right Side: Metadata / Tech Info */}
                                        <div className="col-lg-5 p-4 bg-light">
                                            <h6 className="text-uppercase text-muted mb-3 font-size-xs font-weight-bolder">Technical Details</h6>
                                            
                                            <div className="table-responsive">
                                                <table className="table table-sm table-borderless text-muted font-size-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td className="font-weight-bold">Internal ID:</td>
                                                            <td className="text-right text-monospace">{payment.id}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-weight-bold">Merchant Req ID:</td>
                                                            <td className="text-right text-monospace">{payment.merchantRequestID || 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-weight-bold">Checkout ID:</td>
                                                            <td className="text-right text-monospace">{payment.checkoutRequestID || 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-weight-bold">Result Code:</td>
                                                            <td className="text-right">
                                                                <span className={`badge badge-${payment.resultCode === '0' ? 'success' : 'light'}`}>
                                                                    {payment.resultCode || 'Pending'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Raw Data Toggle */}
                                            <div className="mt-4">
                                                <details>
                                                    <summary className="btn btn-xs btn-outline-secondary">View Raw Metadata</summary>
                                                    <div className="mt-2 p-2 bg-white border rounded text-monospace text-dark-50" style={{fontSize: '0.75rem', maxHeight:'150px', overflowY:'auto'}}>
                                                        {JSON.stringify(payment.metadata || {}, null, 2)}
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredPayments.length === 0 && (
                    <div className="alert alert-light alert-elevate text-center p-5">
                        <div className="alert-text">
                            No transactions found. <br/>
                            <button className="btn btn-link btn-sm" onClick={() => this.modalRef.current.show()}>Start a new one?</button>
                        </div>
                    </div>
                )}
             </div>
          </div>
        </div>

        <MpesaPaymentModal 
            ref={this.modalRef} 
            onPaymentSuccess={this.fetchData}
        />
      </div>
    );
  }
}

export default withRouter(PaymentsDashboard);