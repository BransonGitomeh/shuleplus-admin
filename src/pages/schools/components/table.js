import React from "react";

// --- Styles Adjusted ---

const tableWrapperStyle = {
  display: "block",         // Allows overflow control
  width: "100%",            // *** IMPORTANT: Wrapper MUST take full width to know when content overflows ***
  overflowX: "auto",        // Enable horizontal scrolling ONLY when content overflows
  WebkitOverflowScrolling: "touch",
  // border: "1px solid #e9ecef", // --- REMOVED BORDER ---
  borderRadius: "0.25rem",     // Keep subtle rounding if desired (often invisible without border/background)
  marginBottom: "1rem",
};

const tableStyle = {
  // *** ENSURE NO width: '100%' here ***
  borderCollapse: "collapse",
  fontSize: "0.9rem",
  backgroundColor: "#ffffff", // Keep or remove background as desired
  // If the table STILL seems too wide, it might be due to wide content (long text, many columns)
  // or CSS from external stylesheets targeting 'table' or '.table'.
};

// ... (Keep other styles: thStyle, tdStyle, actionsCellStyle, etc., as they were)
const thStyle = {
  backgroundColor: "#f8f9fa",
  fontWeight: "500",
  padding: "0.65rem 0.9rem",
  textAlign: "left",
  borderBottom: "1px solid #dee2e6", // Keep header bottom border for structure
  whiteSpace: "nowrap",
  color: "#495057",
};

const tdStyle = {
  padding: "0.65rem 0.9rem",
  borderBottom: "1px solid #e9ecef", // Keep row separator border
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  color: '#343a40',
};

const actionsCellStyle = {
  ...tdStyle,
  textAlign: "right",
};

const actionsContainerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "0.5rem",
};

const iconButtonStyle = {
  background: "none",
  border: "none",
  padding: "0.25rem",
  cursor: "pointer",
  lineHeight: 1,
  color: '#6c757d',
};

const editIconStyle = {
  color: "#17a2b8",
  fontSize: "1.1rem",
};

const deleteIconStyle = {
  color: "#dc3545",
  fontSize: "1.1rem",
};

const textButtonStyle = {
    padding: '0.2rem 0.5rem',
    fontSize: '0.8rem',
    lineHeight: '1.5',
    borderRadius: '0.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
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
    // The wrapper div takes full width to manage scrolling correctly.
    // The table *inside* sizes to its content due to lack of width: 100% and white-space: nowrap.
    <div style={tableWrapperStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {props.headers.map(header => (
              <th key={header.key} style={thStyle} title={header.label}>
                {header.label}
              </th>
            ))}
            {showActionsColumn && (
               <th style={{...thStyle, textAlign: 'right', paddingRight: '0.9rem'}}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {props.data.length === 0 ? (
            <tr>
              <td
                 colSpan={props.headers.length + (showActionsColumn ? 1 : 0)}
                 style={{...tdStyle, textAlign: 'center', fontStyle: 'italic', color: '#6c757d', padding: '1rem'}}
              >
                No data available.
              </td>
            </tr>
          ) : (
            props.data.map((row, index) => {
               const rowKey = row.id || `row-${index}`;

               return (
                <tr key={rowKey}> {/* Removed hover style for cleaner example */}
                  {props.headers.map(header => (
                    <td key={`${rowKey}-${header.key}`} style={tdStyle}>
                      {row[header.key] !== undefined && row[header.key] !== null ? String(row[header.key]) : <span style={{color: '#adb5bd'}}>-</span>}
                    </td>
                  ))}

                  {showActionsColumn && (
                     <td style={actionsCellStyle}>
                       <div style={actionsContainerStyle}>
                          {options.editable && props.edit && (
                            <button
                              title="Edit details"
                              type="button"
                              className="btn btn-sm btn-clean btn-icon btn-icon-md"
                              style={iconButtonStyle}
                              onClick={() => props.edit(row)}
                            >
                              <i style={editIconStyle} className="la la-edit" />
                            </button>
                          )}
                          {options.deleteable && props.delete && (
                            <button
                              title="Delete"
                              type="button"
                              className="btn btn-sm btn-clean btn-icon btn-icon-md"
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
                              className="btn btn-sm btn-outline-primary"
                              style={textButtonStyle}
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
                              className="btn btn-sm btn-outline-danger"
                              style={textButtonStyle}
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