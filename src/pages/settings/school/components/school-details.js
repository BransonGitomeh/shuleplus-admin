import React from 'react';
// Removed unused imports: calculateTripDuration, calculateScheduleDuration, Stat

import EditSchoolModal from "./edit_school_details.js";
import DeleteSchoolModal from "./delete.js";
import Data from "../../../../utils/data";

// Instantiate modals outside the class or ensure they are handled correctly if needed elsewhere
// It's often better to manage modal visibility via state within the parent component,
// but we'll keep your instance approach for now.
const editSchoolModalInstance = new EditSchoolModal();
const deleteSchoolModalInstance = new DeleteSchoolModal();

// --- Inline Styles ---
const styles = {
  portletBody: {
    padding: '25px', // Standard portlet padding
  },
  detailsContainer: {
    marginBottom: '2rem', // Space below details before buttons
  },
  detailItem: {
    display: 'flex', // Align label and value
    marginBottom: '0.8rem', // Space between detail rows
    fontSize: '1rem', // Readable font size
  },
  label: {
    fontWeight: '600', // Make label bold
    color: '#595d6e', // Standard label color (adjust if needed)
    width: '140px', // Fixed width for alignment
    flexShrink: 0, // Prevent label from shrinking
    marginRight: '10px',
  },
  value: {
    color: '#212529', // Standard text color
    wordBreak: 'break-word', // Prevent long values from overflowing badly
  },
  buttonContainer: {
    display: 'flex', // Align buttons horizontally
    gap: '10px', // Space between buttons
    marginTop: '1.5rem', // Space above buttons if detailsContainer margin isn't enough
    // justifyContent: 'flex-end', // Optional: Align buttons to the right
  },
  editButton: {
    // Using Bootstrap classes mostly, but can add overrides
  },
  archiveButton: {
    // Using Bootstrap classes mostly, but can add overrides
  }
};
// --- End Styles ---

export default class SchoolDetails extends React.Component {
  state = {
    school: null, // Initialize with null or empty object
    // Add loading state if async operations need feedback
    // loading: false,
  };

  // Use _isMounted to prevent state updates after unmounting
  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    const school = Data.schools.getSelected();
    if (school) {
      this.setState({ school });
    }

    // Subscribe and update state only if component is still mounted
    Data.schools.subscribe(({ schools }) => {
      if (this._isMounted) {
        const currentSelected = Data.schools.getSelected();
        // Avoid unnecessary re-renders if the selected school hasn't changed
        if (currentSelected?.id !== this.state.school?.id) {
            this.setState({ school: currentSelected });
        }
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    // Consider unsubscribing here if the Data utility provides a way
    // Data.schools.unsubscribe(this.handleSchoolUpdate); // Example
  }

  // Simplified save handler - assumes modal gets data and passes it to save
  // Or, if the modal updates the Data store directly, this might not be needed
  async saveSchoolDetails() {
    // Logic might be handled within the EditSchoolModal or the Data utility
    // If this component needs to trigger the save based on modal interaction,
    // the modal's `save` prop might need to pass data back.
    console.log("Triggering save (logic might be in modal/Data store)");
    // Example if Data.schools.update needs explicit data from this component's state:
    // const { id, name, phone, email, address, inviteSmsText } = this.state.school;
    // if (id) {
    //   Data.schools.update({ id, name, phone, email, address, inviteSmsText });
    // }
  }

  async archiveSchool() {
    console.log("Triggering archive");
    Data.schools.archive(); // Assumes this archives the currently selected school
  }

  render() {
    const { school } = this.state;

    // Display a loading state or placeholder if school data isn't available yet
    if (!school) {
      return (
        <div className="kt-portlet">
          <div className="kt-portlet__head">
            <div className="kt-portlet__head-label">
              <h3 className="kt-portlet__head-title">School Information</h3>
            </div>
          </div>
          <div className="kt-portlet__body" style={styles.portletBody}>
            Loading school details...
          </div>
        </div>
      );
    }

    return (
      // Assuming kt-portlet is the main container structure you want
      <div className="kt-portlet kt-portlet--height-fluid">
        {/* Modals can usually be rendered anywhere, they position themselves */}
        {/* Pass the currently loaded school data to the modals */}
        <DeleteSchoolModal save={this.archiveSchool} schoolToDelete={school} />
        <EditSchoolModal save={this.saveSchoolDetails} schoolToEdit={school} />

        <div className="kt-portlet__head">
          <div className="kt-portlet__head-label">
            <h3 className="kt-portlet__head-title">School Information</h3>
          </div>
          {/* Optional: Add head tools/actions here if needed */}
        </div>

        {/* Use Portlet Body for consistent padding */}
        <div className="kt-portlet__body" style={styles.portletBody}>

          {/* Structured Details */}
          <div style={styles.detailsContainer}>
            <div style={styles.detailItem}>
              <span style={styles.label}>School Name:</span>
              <span style={styles.value}>{school.name || 'N/A'}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Phone:</span>
              <span style={styles.value}>{school.phone || 'N/A'}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{school.email || 'N/A'}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Address:</span>
              <span style={styles.value}>{school.address || 'N/A'}</span>
            </div>
             {/* Add other fields like inviteSmsText if needed */}
             {/*
             <div style={styles.detailItem}>
               <span style={styles.label}>Invite SMS:</span>
               <span style={styles.value}>{school.inviteSmsText || 'N/A'}</span>
             </div>
             */}
          </div>

          {/* Buttons Container */}
          <div style={styles.buttonContainer}>
            <button
              type="button" // Use type="button" for non-submitting buttons
              className="btn btn-outline-brand" // Keep existing Bootstrap class
              style={styles.editButton}
              onClick={() => editSchoolModalInstance.show()} // Consider managing modal visibility via state instead
            >
              Edit Details
            </button>

            <button
              type="button" // Use type="button"
              className="btn btn-danger" // Keep existing Bootstrap class
              style={styles.archiveButton}
              onClick={() => deleteSchoolModalInstance.show()} // Consider managing modal visibility via state instead
            >
              Archive School
            </button>
          </div>
        </div>
      </div>
    );
  }
}