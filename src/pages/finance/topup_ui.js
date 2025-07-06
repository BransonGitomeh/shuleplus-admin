import React from "react";
import { withRouter } from "react-router";
import Table from "./components/table"; // Assuming Table is responsive
import DepositModal from "./deposit";
import Data from "../../utils/data"; // Assuming Data handles data fetching/subscriptions

// Assuming DepositModal creates/manages a singleton modal (like Bootstrap/jQuery modal)
// If DepositModal itself needs to be rendered conditionally via React state,
// this instance approach needs rethinking.
const depositModalInstance = new DepositModal();

class PaymentsView extends React.Component {
  state = {
    payments: [],
    filteredPayments: [], // Store filtered results separately
    school: {},
    searchTerm: "", // Store the search term
    // remove: null, // Keep if delete functionality is needed later
    // edit: null,   // Keep if edit functionality is needed later
  };

  componentDidMount() {
    this.fetchDataAndSubscribe();
    this.checkUrlParams();
  }

  componentWillUnmount() {
    // Important: Unsubscribe from data changes to prevent memory leaks
    // Assuming Data.payments provides an unsubscribe method
    if (this.paymentSubscription) {
      // this.paymentSubscription.unsubscribe(); // Adjust based on actual API
    }
    // Or if it's a simple callback array:
    // Data.payments.unsubscribe(this.handleDataUpdate);
  }

  fetchDataAndSubscribe = () => {
    const payments = Data.payments.list();
    const school = Data.schools.getSelected();

    this.setState({
      payments,
      filteredPayments: payments, // Initialize filtered list
      school
    });

    // Store subscription to unsubscribe later
    // Assuming subscribe returns a subscription object or requires the callback for unsubscribing
    this.paymentSubscription = Data.payments.subscribe(this.handleDataUpdate);
  };

  handleDataUpdate = ({ payments }) => {
    // Re-apply search filter when data updates
    const school = Data.schools.getSelected();
    const { searchTerm } = this.state;
    const filteredPayments = this.filterPayments(payments, searchTerm);
    this.setState({ payments, filteredPayments, school });
  };

  checkUrlParams = () => {
    const search = this.props.history.location.search;
    const params = new URLSearchParams(search);
    const popup = params.get('popup');

    if (popup === 'deposit') { // Make the popup param more specific if needed
      // Pass necessary data when showing the modal if the instance supports it
      depositModalInstance.show({
        ammount: 2, // Or a default/dynamic value
        phone: this.state.school?.phone || ''
      });
      // Optional: Clear the param from URL after showing
      // this.props.history.replace(this.props.history.location.pathname);
    }
  }

  filterPayments = (payments, term) => {
    const lowerCaseTerm = term.toLowerCase();
    if (!lowerCaseTerm) {
      return payments; // No filter applied
    }
    return payments.filter(payment => {
      // Search across relevant fields (adjust as needed)
      return (
        payment.type?.toLowerCase().includes(lowerCaseTerm) ||
        payment.ref?.toLowerCase().includes(lowerCaseTerm) ||
        payment.phone?.toLowerCase().includes(lowerCaseTerm) ||
        payment.ammount?.toString().toLowerCase().includes(lowerCaseTerm)
      );
    });
  };

  onSearch = e => {
    const searchTerm = e.target.value;
    const { payments } = this.state;
    const filteredPayments = this.filterPayments(payments, searchTerm);
    this.setState({ searchTerm, filteredPayments });
  }

  handleShowDepositModal = () => {
    // Pass data needed by the modal when showing it
    depositModalInstance.show();
  }

  render() {
    // Use filteredPayments for the table
    const { filteredPayments, searchTerm, school } = this.state;

    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            <div className="kt-portlet__head">
              <div className="kt-portlet__head-label">
                <h3 className="kt-portlet__head-title">
                  Payments
                </h3>
              </div>
            </div>
            <div className="kt-portlet__body">
              {/*begin: Search Form */}
              <DepositModal/>
              <div className="kt-form kt-fork--label-right kt-margin-t-20 kt-margin-b-10">
                <div className="row align-items-center">
                  <div className="col-xl-8 order-2 order-xl-1">
                    <div className="row align-items-center">
                      <div className="col-md-4 kt-margin-b-20-tablet-and-mobile">
                        <div className="kt-input-icon kt-input-icon--left">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            onChange={this.onSearch}
                            id="generalSearch"
                          />
                          <span className="kt-input-icon__icon kt-input-icon__icon--left">
                            <span>
                              <i className="la la-search" />
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 order-2 order-xl-1">
                    <button
                      type="button"
                      className="btn btn-success btn-sm btn-bold btn-upper float-right"
                      onClick={() => this.handleShowDepositModal()}
                    >
                      Make Mpesa Deposit
                    </button>
                  </div>
                </div>
              </div>
              {/*end: Search Form */}
              <div className="kt-portlet__body kt-portlet__body--fit" style={{ minHeight: "500px" }}>
                <Table
                  headers={[
                    { label: "Type", key: "type" },
                    { label: "Mpesa Receipt", key: "ref" }, // Shortened label
                    { label: "Time", key: "time" },         // Shortened label
                    { label: "Phone", key: "phone" },       // Shortened label
                    { label: "Amount", key: "ammount" }
                  ]}
                  data={filteredPayments} // Pass filtered data
                />
                {filteredPayments?.length === 0 && searchTerm && (
                  <p className="text-center mt-3">No payments found matching your search.</p>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Wrap with withRouter if you need access to history/location/match
export default withRouter(PaymentsView); // Renamed component for clarity