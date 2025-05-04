import React from 'react';

// Removed unused imports: calculateTripDuration, calculateScheduleDuration, Stat, EditSchoolModal

import EditPaymentsModal from "./edit_payment_details.js"; // Assuming this is the correct modal
import Data from "../../../../utils/data";

// Instantiate modal - consider state-based visibility management as an alternative
const editPaymentsModalInstance = new EditPaymentsModal();

// --- Inline Styles (Similar structure to SchoolDetails for consistency) ---
const styles = {
  portletBody: {
    padding: '25px',
  },
  detailsContainer: {
    marginBottom: '1.5rem', // Space below details before buttons
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center', // Vertically align label and value if they wrap differently
    marginBottom: '0.5rem', // Less margin needed for single item
    fontSize: '1rem',
  },
  label: {
    fontWeight: '600',
    color: '#595d6e',
    // width: '180px', // May not need fixed width for one item, but can add if desired
    marginRight: '10px',
    flexShrink: 0,
  },
  value: {
    color: '#212529',
    fontWeight: '500', // Make the number slightly bolder perhaps
    wordBreak: 'break-word',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '1rem', // Adjusted space above button
  },
  editButton: {
    // Using Bootstrap classes mostly
  },
};
// --- End Styles ---

export default class PaymentDetails extends React.Component {
  state = {
    school: null, // Initialize with null
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    const school = Data.schools.getSelected();
    if (school) {
      this.setState({ school });
    }

    // Subscribe and update state safely
    Data.schools.subscribe(({ schools }) => {
      if (this._isMounted) {
        const currentSelected = Data.schools.getSelected();
        // Avoid unnecessary re-renders
        if (currentSelected?.id !== this.state.school?.id) {
            this.setState({ school: currentSelected });
        }
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    // Consider unsubscribing if possible
  }

  // Note: This save function currently updates general school details.
  // If it should ONLY update payment-related fields, its logic needs adjustment.
  savePaymentDetail = () => { // Use arrow function for correct 'this' binding if needed elsewhere
    const { id, name, phone, email, address } = this.state.school || {}; // Add fallback for safety

    if (id) { // Only update if we have an ID
        console.log("Saving general school details from PaymentDetails section...");
        Data.schools.update({
          id,
          name,
          phone,
          email,
          address
        });
    } else {
        console.warn("Cannot save payment details, school ID is missing.");
    }
  }

  render() {
    const { school } = this.state;

    // Loading state or placeholder
    if (!school) {
      return (
        <div className="kt-portlet">
          <div className="kt-portlet__head">
            <div className="kt-portlet__head-label">
              <h3 className="kt-portlet__head-title">Payments Information</h3>
            </div>
          </div>
          <div className="kt-portlet__body" style={styles.portletBody}>
            Loading payment details...
          </div>
        </div>
      );
    }

    return (
      <div className="kt-portlet kt-portlet--height-fluid">
         {/* Pass current data to the modal */}
        <EditPaymentsModal schoolToEdit={school} save={this.savePaymentDetail} />

        <div className="kt-portlet__head">
          <div className="kt-portlet__head-label">
            <h3 className="kt-portlet__head-title">Payments Information</h3>
          </div>
        </div>

        <div className="kt-portlet__body" style={styles.portletBody}>

          {/* Structured Details */}
          <div style={styles.detailsContainer}>
            <div style={styles.detailItem}>
              <span style={styles.label}>MPESA Billing Number:</span>
              <span style={styles.value}>{school.phone || 'N/A'}</span>
            </div>
            {/* Add more payment-related details here if they exist */}
            {/* Example:
            <div style={styles.detailItem}>
              <span style={styles.label}>Account Status:</span>
              <span style={styles.value}>{school.paymentStatus || 'N/A'}</span>
            </div>
            */}
          </div>

          {/* Buttons Container */}
          <div style={styles.buttonContainer}>
            <button
              type="button" // Correct button type
              className="btn btn-outline-brand"
              style={styles.editButton}
              onClick={() => editPaymentsModalInstance.show()}
              // disabled={this.state.loading} // Add loading state if edits are async
            >
              Change Payment Details
            </button>
          </div>

        </div>
      </div>
    );
  }
}