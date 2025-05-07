import React from "react";

// --- Refined Styles for Subtlety and Auto-Width ---

const tableWrapperStyle = {
  display: "block",         // Allows overflow control
  width: "100%",            // Wrapper takes available width
  overflowX: "auto",        // Enable horizontal scrolling ONLY when content overflows
  WebkitOverflowScrolling: "touch", // Smoother scrolling on iOS
  border: "1px solid #e9ecef",  // Lighter border for the scroll container
  borderRadius: "0.25rem",     // Subtle rounding
  marginBottom: "1rem",       // Space below the table container
};

const tableStyle = {
  // REMOVED width: '100%' - Table now sizes to content
  borderCollapse: "collapse",   // Cleaner borders
  fontSize: "0.9rem",           // Keep font size reasonable
  backgroundColor: "#ffffff",   // White background
  // Optional: Add a minWidth if you NEVER want it narrower than a certain size
  // minWidth: '400px',
};

const thStyle = {
  backgroundColor: "#f8f9fa", // Very light grey header background
  fontWeight: "500",         // Slightly less bold header text
  padding: "0.65rem 0.9rem", // Adjusted padding
  textAlign: "left",
  borderBottom: "1px solid #dee2e6", // Standard subtle border below header
  whiteSpace: "nowrap",      // Essential for horizontal scrolling behavior
  color: "#495057",
  // textTransform: 'uppercase', // Removed for subtlety
  // letterSpacing: '0.5px',  // Removed for subtlety
};

const tdStyle = {
  padding: "0.65rem 0.9rem",   // Match header padding
  borderBottom: "1px solid #e9ecef", // Lighter border between rows
  verticalAlign: "middle",
  whiteSpace: "nowrap",      // Essential for horizontal scrolling behavior
  color: '#343a40',           // Slightly softer text color
};

const actionsCellStyle = {
  ...tdStyle,               // Inherit base td styles
  textAlign: "right",
};

const actionsContainerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "0.5rem",            // Consistent gap
};

const iconButtonStyle = {
  background: "none",
  border: "none",
  padding: "0.25rem",
  cursor: "pointer",
  lineHeight: 1,
  color: '#6c757d', // Softer default icon color
};

const editIconStyle = {
  color: "#17a2b8", // Slightly softer teal/info color
  fontSize: "1.1rem", // Slightly smaller icons
};

const deleteIconStyle = {
  color: "#dc3545", // Standard danger red
  fontSize: "1.1rem", // Slightly smaller icons
};

const textButtonStyle = { // Style for Invite/Transfer buttons
    padding: '0.2rem 0.5rem',
    fontSize: '0.8rem',
    lineHeight: '1.5',
    borderRadius: '0.2rem',
    display: 'inline-flex', // Align icon and text
    alignItems: 'center',
    gap: '4px', // Space between icon and text in button
};

// Functional Component
export default props => {
  // --- Input Validation ---
  if (!props.headers || !props.data) {
    console.warn("Table component requires 'headers' and 'data' props.");
    return null;
  }
  if (!Array.isArray(props.headers) || !Array.isArray(props.data)) {
     console.warn("'headers' and 'data' props must be arrays.");
     return null;
  }

  // --- Options Destructuring with Defaults ---
  const defaultOptions = { deleteable: true, editable: true, adminable: false, inviteable: true };
  const options = { ...defaultOptions, ...props.options };

  // Calculate if actions column is needed
  const showActionsColumn = options.editable || options.deleteable || options.inviteable || options.adminable;

  // --- Rendering ---
  return (
    <div style={tableWrapperStyle}> {/* Scroll wrapper */}
      <table style={tableStyle}>
        <thead>
          <tr>
            {props.headers.map(header => (
              <th key={header.key} style={thStyle} title={header.label}>
                {header.label}
              </th>
            ))}
            {/* Add Actions Header conditionally */}
            {showActionsColumn && (
               <th style={{...thStyle, textAlign: 'right', paddingRight: '0.9rem'}}>Actions</th> // Match padding
            )}
          </tr>
        </thead>
        <tbody>
          {props.data.length === 0 ? (
            <tr>
              <td
                 colSpan={props.headers.length + (showActionsColumn ? 1 : 0)}
                 style={{...tdStyle, textAlign: 'center', fontStyle: 'italic', color: '#6c757d', padding: '1rem'}} // More padding for empty message
              >
                No data available.
              </td>
            </tr>
          ) : (
            props.data.map((row, index) => {
               const rowKey = row.id || `row-${index}`;

               return (
                <tr key={rowKey} style={{ ':hover': { backgroundColor: '#f8f9fa' }}}> {/* Subtle hover effect can be added via CSS classes */}
                  {props.headers.map(header => (
                    <td key={`${rowKey}-${header.key}`} style={tdStyle}>
                      {row[header.key] !== undefined && row[header.key] !== null ? String(row[header.key]) : <span style={{color: '#adb5bd'}}>-</span>} {/* Lighter dash */}
                    </td>
                  ))}

                  {/* --- Actions Cell (Conditional) --- */}
                  {showActionsColumn && (
                     <td style={actionsCellStyle}>
                       <div style={actionsContainerStyle}>
                          {options.editable && props.edit && (
                            <button
                              title="Edit details"
                              type="button"
                              className="btn btn-sm btn-clean btn-icon btn-icon-md" // Keep if needed
                              style={{...iconButtonStyle, /* Specific hover if desired */}}
                              onClick={() => props.edit(row)}
                            >
                              <i style={editIconStyle} className="la la-edit" />
                            </button>
                          )}
                          {options.deleteable && props.delete && (
                            <button
                              title="Delete"
                              type="button"
                              className="btn btn-sm btn-clean btn-icon btn-icon-md" // Keep if needed
                              style={iconButtonStyle}
                              onClick={() => props.delete(row)}
                            >
                              <i style={deleteIconStyle} className="la la-trash" />
                            </button>
                          )}
                          {options.inviteable && props.invite && (
                            <button
                              title="Invite User"
                              type="button"
                              className="btn btn-sm btn-outline-primary" // Bootstrap class
                              style={textButtonStyle} // Apply consistent text button style
                              onClick={() => props.invite(row)}
                            >
                              <i className="la la-envelope" />
                              <span>Invite</span>
                            </button>
                          )}
                           {options.adminable && props.transfer && (
                            <button
                              title="Transfer Ownership"
                              type="button"
                              className="btn btn-sm btn-outline-danger" // Bootstrap class
                              style={textButtonStyle} // Apply consistent text button style
                              onClick={() => props.transfer(row)}
                            >
                              <i className="la la-random" />
                              <span>Transfer</span>
                            </button>
                          )}
                       </div>
                     </td>
                   )}
                </tr>
              );
            })
           )}
        </tbody>
      </table>
    </div>
  );
};