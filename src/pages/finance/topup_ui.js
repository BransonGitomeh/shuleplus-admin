import React, { useState } from "react";
import { withRouter } from "react-router";
import MpesaPaymentModal from "./deposit"; 
import Data from "../../utils/data"; 
import moment from "moment";

// --- HELPER: Get effective date ---
const getTxTime = (payment) => {
    return payment.createdAt || payment.metadata?.initiatedAt || payment.time || new Date();
};

const getCompletionTime = (payment) => {
    return payment.updatedAt || payment.metadata?.updatedAt || payment.time;
};

// --- COMPONENT: Status Badge ---
const StatusBadge = ({ status }) => {
  const map = {
    COMPLETED: { css: 'success', label: 'Paid', icon: 'check' },
    PENDING: { css: 'primary', label: 'Processing', icon: 'spinner fa-spin' },
    FAILED: { css: 'danger', label: 'Failed', icon: 'times' },
    FAILED_ON_CALLBACK: { css: 'danger', label: 'Failed', icon: 'times' },
    CANCELLED: { css: 'warning', label: 'Cancelled', icon: 'ban' },
    FLAGGED_AMOUNT_MISMATCH: { css: 'danger', label: 'Mismatch', icon: 'exclamation-triangle' },
    FAILED_ON_INITIATION: { css: 'danger', label: 'Net Error', icon: 'wifi' }
  };
  
  const cur = map[status] || { css: 'secondary', label: status || 'Unknown', icon: 'question' };
  
  return (
    <span className={`badge badge-light-${cur.css} badge-pill font-weight-bolder px-3 py-2`}>
        <i className={`fa fa-${cur.icon} mr-1`}></i> {cur.label}
    </span>
  );
};

// --- COMPONENT: Loading Skeleton ---
const TableSkeleton = () => (
    <tr className="animated fadeIn">
        <td colSpan="7">
            <div className="d-flex align-items-center py-3">
                <div className="mr-3">
                    <div className="skeleton-box" style={{width: '35px', height: '35px', borderRadius: '50%', background: '#f3f6f9'}}></div>
                </div>
                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                        <div className="skeleton-box mb-1" style={{width: '30%', height: '12px', background: '#f3f6f9', borderRadius: '4px'}}></div>
                        <div className="skeleton-box" style={{width: '15%', height: '12px', background: '#f3f6f9', borderRadius: '4px'}}></div>
                    </div>
                    <div className="skeleton-box" style={{width: '20%', height: '8px', background: '#f8f9fb', borderRadius: '4px'}}></div>
                </div>
            </div>
        </td>
    </tr>
);

// --- COMPONENT: Accordion Details ---
const TransactionDetails = ({ payment }) => {
    const isCompleted = payment.status === 'COMPLETED';
    const metadata = payment.metadata || {};
    const stkResponse = metadata.stkPushResponse || {};
    const resultMessage = payment.resultDesc || stkResponse.ResponseDescription || payment.errorMessage;

    return (
        <div className="row p-3">
            {/* LEFT: Audit Trail */}
            <div className="col-md-7 border-right">
                <h6 className="text-uppercase text-muted font-size-xs font-weight-bold mb-4">Transaction Lifecycle</h6>
                <div className="timeline-minimal">
                    {/* 1. Initiated */}
                    <div className="d-flex mb-4">
                        <div className="symbol symbol-35 symbol-light-primary mr-3">
                            <span className="symbol-label font-weight-bold">1</span>
                        </div>
                        <div>
                            <div className="text-dark-75 font-weight-bold">Request Initiated</div>
                            <div className="text-muted font-size-sm">System requested KES {payment.amount} from {payment.phone}.</div>
                            <div className="text-muted font-size-xs mt-1">{moment(getTxTime(payment)).format("DD MMM, hh:mm:ss A")}</div>
                        </div>
                    </div>

                    {/* 2. STK Push */}
                    {payment.checkoutRequestID && (
                        <div className="d-flex mb-4">
                            <div className="symbol symbol-35 symbol-light-info mr-3">
                                <span className="symbol-label font-weight-bold">2</span>
                            </div>
                            <div>
                                <div className="text-dark-75 font-weight-bold">Sent to Safaricom</div>
                                <div className="text-muted font-size-sm">{metadata.stkPushResponse?.CustomerMessage || "Prompt sent to user."}</div>
                            </div>
                        </div>
                    )}

                    {/* 3. Outcome */}
                    <div className="d-flex">
                        <div className={`symbol symbol-35 symbol-light-${isCompleted ? 'success' : 'danger'} mr-3`}>
                            <span className="symbol-label font-weight-bold">3</span>
                        </div>
                        <div>
                            <div className="text-dark-75 font-weight-bold">{isCompleted ? 'Payment Confirmed' : 'Callback Received'}</div>
                            <div className={`font-size-sm ${isCompleted ? 'text-success' : 'text-danger'}`}>
                                {resultMessage || (isCompleted ? "Transaction completed successfully." : "Transaction failed.")}
                            </div>
                            <div className="text-muted font-size-xs mt-1">
                                {getCompletionTime(payment) ? moment(getCompletionTime(payment)).format("hh:mm:ss A") : 'Pending...'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Technical Metadata */}
            <div className="col-md-5 pl-md-4 mt-3 mt-md-0">
                <h6 className="text-uppercase text-muted font-size-xs font-weight-bold mb-4">Technical Details</h6>
                <table className="table table-sm table-borderless text-muted font-size-sm">
                    <tbody>
                        <tr><td>M-Pesa Ref:</td><td className="text-right text-dark font-weight-bold text-monospace">{payment.mpesaReceiptNumber || payment.ref || "---"}</td></tr>
                        <tr><td>Checkout ID:</td><td className="text-right text-monospace text-truncate" style={{maxWidth: '150px'}} title={payment.checkoutRequestID}>{payment.checkoutRequestID || 'N/A'}</td></tr>
                        <tr><td>Merchant ID:</td><td className="text-right text-monospace text-truncate" style={{maxWidth: '150px'}} title={payment.merchantRequestID}>{payment.merchantRequestID || 'N/A'}</td></tr>
                        <tr><td>Result Code:</td><td className="text-right"><code>{stkResponse.ResponseCode || payment.resultCode || '...'}</code></td></tr>
                    </tbody>
                </table>
                <div className="mt-3 bg-light rounded p-2">
                    <details>
                        <summary className="text-primary font-size-xs font-weight-bold cursor-pointer">View Raw JSON</summary>
                        <pre className="mt-2 text-muted" style={{fontSize: '10px', maxHeight: '100px', overflow: 'auto'}}>{JSON.stringify(metadata, null, 2)}</pre>
                    </details>
                </div>
            </div>
        </div>
    );
};

class PaymentsDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.modalRef = React.createRef();
    this.state = {
      payments: [],
      filteredPayments: [], 
      expandedId: null,
      searchTerm: "",
      isLoading: true
    };
  }

  componentDidMount() {
    this.unsubscribe = Data.payments.subscribe(this.handleDataUpdate);
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  handleDataUpdate = (data) => {
    const rawPayments = data.payments || [];
    
    // SMART LOADING CHECK:
    // If we have 0 payments, verify if we have loaded schools yet.
    // If Schools list is also empty, it means Data.js is still initializing.
    const isActuallyLoading = rawPayments.length === 0 && Data.schools.list().length === 0;

    const sortedPayments = [...rawPayments].sort((a, b) => {
        const timeA = new Date(getTxTime(a));
        const timeB = new Date(getTxTime(b));
        return timeB - timeA;
    });

    this.setState(prevState => ({
      payments: sortedPayments,
      filteredPayments: this.filterPayments(sortedPayments, prevState.searchTerm),
      isLoading: isActuallyLoading
    }));
  };

  filterPayments = (list, term) => {
    if (!term) return list;
    const lower = term.toLowerCase();
    return list.filter(p => 
      (p.phone || '').includes(lower) ||
      (p.mpesaReceiptNumber || p.ref || '').toLowerCase().includes(lower) ||
      (p.status || '').toLowerCase().includes(lower)
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

  handlePaymentSuccess = () => {
    // Force refresh logic if needed
  }

  render() {
    const { filteredPayments, expandedId, searchTerm, isLoading } = this.state;

    return (
      <div className="kt-portlet kt-portlet--mobile shadow-sm">
        {/* HEADER */}
        <div className="kt-portlet__head border-bottom-0 pt-4">
          <div className="kt-portlet__head-label">
            <h3 className="kt-portlet__head-title font-weight-bolder text-dark">
              Transactions
              <small className="text-muted ml-2">Live Feed</small>
            </h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <button className="btn btn-primary btn-sm font-weight-bold" onClick={() => this.modalRef.current.show()}>
              <i className="fa fa-plus-circle mr-1"></i> New Deposit
            </button>
          </div>
        </div>

        <div className="kt-portlet__body pt-2">
          {/* SEARCH */}
          <div className="mb-4 d-flex align-items-center">
            <div className="input-icon input-icon-right" style={{width: '300px'}}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search phone, ref..." 
                value={searchTerm}
                onChange={this.onSearch}
                style={{background: '#f3f6f9', border: 'none'}}
              />
              <span className="input-icon__icon input-icon__icon--right">
                <span><i className="la la-search"></i></span>
              </span>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-hover table-vertical-center">
              <thead className="thead-light">
                <tr className="text-uppercase text-muted font-size-sm letter-spacing-1">
                  <th style={{width: '50px'}}>#</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Payer</th>
                  <th>Reference</th>
                  <th className="text-right">Time</th>
                  <th style={{width: '50px'}}></th>
                </tr>
              </thead>
              <tbody>
                
                {isLoading && (
                    <>
                       <TableSkeleton />
                       <TableSkeleton />
                       <TableSkeleton />
                    </>
                )}

                {!isLoading && filteredPayments.map((payment, index) => {
                    const isExpanded = expandedId === payment.id;
                    const isFraud = payment.status === 'FLAGGED_AMOUNT_MISMATCH';
                    const txTime = getTxTime(payment);
                    
                    return (
                        <React.Fragment key={payment.id}>
                            <tr 
                                onClick={() => this.toggleRow(payment.id)} 
                                style={{
                                    cursor: 'pointer', 
                                    backgroundColor: isExpanded ? '#f8f9fb' : 'transparent', 
                                    borderLeft: isFraud ? '4px solid #fd3995' : 'none'
                                }}
                            >
                                <td className="text-muted font-size-xs">{index + 1}</td>
                                <td><StatusBadge status={payment.status} /></td>
                                <td>
                                    <span className="text-dark font-weight-bolder font-size-lg">
                                        KES {payment.amount}
                                    </span>
                                </td>
                                <td>
                                    <span className="text-dark-75 font-weight-bold d-block">{payment.phone}</span>
                                    <span className="text-muted font-size-xs">
                                        {payment.checkoutRequestID ? 'Automated' : 'Manual'}
                                    </span>
                                </td>
                                <td>
                                    <span className="text-dark-50 font-weight-bold font-monospace">
                                        {payment.mpesaReceiptNumber || payment.ref || '---'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <span className="text-muted font-weight-bold font-size-sm">
                                        {moment(txTime).fromNow()}
                                    </span>
                                </td>
                                <td className="text-center text-muted">
                                    <i className={`fa fa-chevron-${isExpanded ? 'up' : 'down'} font-size-xs`}></i>
                                </td>
                            </tr>

                            {isExpanded && (
                                <tr className="animated fadeIn">
                                    <td colSpan="7" className="p-0 bg-white" style={{borderTop: 'none', borderBottom: '2px solid #f0f3ff'}}>
                                        <TransactionDetails payment={payment} />
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}

                {!isLoading && filteredPayments.length === 0 && (
                    <tr>
                        <td colSpan="7" className="text-center text-muted py-5">
                            <span className="d-block font-size-lg">No transactions found</span>
                            <span className="font-size-sm">Try adjusting your search or create a new deposit.</span>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <MpesaPaymentModal 
            ref={this.modalRef} 
            onPaymentSuccess={this.handlePaymentSuccess}
        />
      </div>
    );
  }
}

export default withRouter(PaymentsDashboard);