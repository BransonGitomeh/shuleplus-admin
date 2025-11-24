import React from "react";
import { withRouter } from "react-router";
import Table from "./components/table"; 
import MpesaPaymentModal from "./deposit"; // Import the file above
import Data from "../../utils/data"; 

class PaymentsView extends React.Component {
  constructor(props) {
    super(props);
    // 1. Create a Ref to access the modal component instance
    this.modalRef = React.createRef();
    
    this.state = {
      payments: [],
      filteredPayments: [], 
      school: {},
      searchTerm: "",
    };
  }

  componentDidMount() {
    this.fetchDataAndSubscribe();
    this.checkUrlParams();
  }

  componentWillUnmount() {
    if (this.paymentSubscription) {
      // Assuming your Data service supports unsubscribing like this
      // If it returns a function, call it: this.paymentSubscription();
      // If it returns an object with unsubscribe: this.paymentSubscription.unsubscribe();
      if (typeof this.paymentSubscription === 'function') this.paymentSubscription();
      else if (this.paymentSubscription.unsubscribe) this.paymentSubscription.unsubscribe();
    }
  }

  fetchDataAndSubscribe = () => {
    // Initial Load
    const payments = Data.payments.list() || [];
    const school = Data.schools.getSelected();

    this.setState({
      payments,
      filteredPayments: this.filterPayments(payments, this.state.searchTerm),
      school
    });

    // Subscribe to updates
    this.paymentSubscription = Data.payments.subscribe(this.handleDataUpdate);
  };

  handleDataUpdate = (data) => {
    // Handle structure of data returned by subscription
    const payments = data.payments || [];
    
    this.setState((prevState) => ({
      payments,
      filteredPayments: this.filterPayments(payments, prevState.searchTerm),
      school: Data.schools.getSelected()
    }));
  };

  // Called by the Modal when payment is successful
  handlePaymentSuccess = () => {
    // Force a refetch from the server to ensure the new payment appears in the table immediately
    // Assuming Data has a method like `refetch` or `getAll`
    if (Data.payments.refetch) {
        Data.payments.refetch();
    } else if (Data.schools.refetch) {
        // Often refetching the school refetches related lists
        Data.schools.refetch(); 
    }
  };

  checkUrlParams = () => {
    const search = this.props.history.location.search;
    const params = new URLSearchParams(search);
    if (params.get('popup') === 'deposit') {
      this.handleShowDepositModal();
    }
  }

  filterPayments = (payments, term) => {
    if (!term) return payments;
    const lowerTerm = term.toLowerCase();
    return payments.filter(p => 
      (p.type || '').toLowerCase().includes(lowerTerm) ||
      (p.ref || '').toLowerCase().includes(lowerTerm) ||
      (p.phone || '').toLowerCase().includes(lowerTerm) ||
      String(p.ammount || '').includes(lowerTerm)
    );
  };

  onSearch = e => {
    const searchTerm = e.target.value;
    this.setState({ 
      searchTerm, 
      filteredPayments: this.filterPayments(this.state.payments, searchTerm) 
    });
  }

  handleShowDepositModal = () => {
    // 2. Use the Ref to call the show method on the modal instance
    if (this.modalRef.current) {
      this.modalRef.current.show({
        amount: 100, // Optional default
        phone: this.state.school?.phone || ''
      });
    }
  }

  render() {
    const { filteredPayments, searchTerm } = this.state;

    return (
      <div className="kt-quick-panel--right kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            
            <div className="kt-portlet__head">
              <div className="kt-portlet__head-label">
                <h3 className="kt-portlet__head-title">Payments</h3>
              </div>
            </div>

            <div className="kt-portlet__body">
              
              {/* 3. Render the Modal here with the Ref */}
              <MpesaPaymentModal 
                ref={this.modalRef} 
                onPaymentSuccess={this.handlePaymentSuccess}
              />

              {/* Search & Action Bar */}
              <div className="kt-form kt-margin-t-20 kt-margin-b-10">
                <div className="row align-items-center">
                  <div className="col-xl-8 order-2 order-xl-1">
                    <div className="kt-input-icon kt-input-icon--left">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search payments..."
                        onChange={this.onSearch}
                        value={searchTerm}
                      />
                      <span className="kt-input-icon__icon kt-input-icon__icon--left">
                        <span><i className="la la-search" /></span>
                      </span>
                    </div>
                  </div>
                  <div className="col-xl-4 order-2 order-xl-1">
                    <button
                      type="button"
                      className="btn btn-success btn-sm btn-bold float-right"
                      onClick={this.handleShowDepositModal}
                    >
                      <i className="fa fa-plus"></i> Make Mpesa Deposit
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="kt-portlet__body kt-portlet__body--fit" style={{ minHeight: "500px" }}>
                <Table
                  headers={[
                    { label: "Type", key: "type" },
                    { label: "Mpesa Ref", key: "ref" },
                    { label: "Time", key: "time" },
                    { label: "Phone", key: "phone" },
                    { label: "Amount", key: "ammount" } // Note: Check if backend sends 'amount' or 'ammount'
                  ]}
                  data={filteredPayments}
                />
                {filteredPayments.length === 0 && (
                  <p className="text-center mt-4 text-muted">No payments found.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(PaymentsView);