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
      this.paymentSubscription.unsubscribe(); // Adjust based on actual API
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
    depositModalInstance.show({
        ammount: 2, // Default amount or fetch from state if needed
        phone: this.state.school?.phone || ''
    });
  }

  render() {
    // Use filteredPayments for the table
    const { filteredPayments, searchTerm, school } = this.state;

    return (
      // Modal content root. Add padding if the modal doesn't provide it.
      // Use p-4 or similar utility classes if using Bootstrap/Tailwind.
      <div className="p-4"> {/* Example padding */}

        {/* Configure the modal instance - assuming this doesn't render UI directly */}
        <DepositModal edit={{ ammount: 2, phone: school?.phone }} />

        {/* Header: Search and Actions */}
        {/* Using flexbox for better alignment and responsiveness */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          {/* Search Input */}
          <div className="flex-grow-1 me-3 mb-2 mb-md-0" style={{ minWidth: '200px' }}> {/* Allow search to grow, add right margin */}
            <div className="input-group"> {/* Using input-group for icon */}
              <span className="input-group-text">
                <i className="la la-search" /> {/* Assuming la icons */}
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search Payments..."
                value={searchTerm}
                onChange={this.onSearch}
                aria-label="Search Payments"
                id="paymentSearch" // Use a more specific ID
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0"> {/* Prevent button from shrinking */}
            <button
              type="button" // Use type="button" for non-submitting buttons
              className="btn btn-success btn-sm btn-bold btn-upper"
              onClick={this.handleShowDepositModal}
            >
              Make Mpesa Deposit
            </button>
          </div>
        </div>

        {/* Body: Table */}
        {/* The Table component should handle its own scrolling/responsiveness */}
        {/* Add a container with overflow if the Table component doesn't */}
        <div style={{ minHeight: "400px", overflowX: 'auto' }}> {/* Ensure table can scroll horizontally on small screens */}
          <Table
            headers={[
              { label: "Type", key: "type" },
              { label: "Mpesa Receipt", key: "ref" }, // Shortened label
              { label: "Time", key: "time" },         // Shortened label
              { label: "Phone", key: "phone" },       // Shortened label
              { label: "Amount", key: "ammount" }
            ]}
            data={filteredPayments} // Pass filtered data
            // Pass delete/edit handlers if needed
            // delete={item => {
            //   this.setState({ remove: item }, () => {
            //     deleteModalInstance.show(); // Assuming similar instance pattern
            //   });
            // }}
            // edit={item => { ... }}
          />
          {filteredPayments.length === 0 && searchTerm && (
              <p className="text-center mt-3">No payments found matching your search.</p>
          )}
          {filteredPayments.length === 0 && !searchTerm && (
              <p className="text-center mt-3">No payment data available.</p>
          )}
        </div>
      </div>
    );
  }
}

// Wrap with withRouter if you need access to history/location/match
export default withRouter(PaymentsView); // Renamed component for clarity