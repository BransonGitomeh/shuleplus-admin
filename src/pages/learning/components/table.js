import React from 'react';

// Define styles directly within the component file
const tableStyles = `
  .enhanced-table-wrapper {
    overflow-x: auto; /* Enable horizontal scroll ONLY if the table content exceeds the wrapper */
    width: 100%;
  }
  .enhanced-table {
    width: 100%; /* Make table try to take full width */
    border-collapse: collapse;
    table-layout: auto; /* Let browser decide column widths initially */
  }
  .enhanced-table th,
  .enhanced-table td {
    padding: 10px 15px; /* Adjust padding as needed */
    border: 1px solid #eee; /* Lighter borders */
    white-space: nowrap; /* Prevent text wrapping in data cells */
    vertical-align: middle; /* Align content vertically */
    text-align: left; /* Default text alignment */
  }
  .enhanced-table th {
    background-color: #f8f9fa; /* Slight background for headers */
    font-weight: 600; /* Make headers bolder */
  }
  .enhanced-table tbody tr {
    transition: background-color 0.15s ease-in-out;
  }
  /* Style for selectable rows */
  .enhanced-table tbody tr.selectable-row:hover {
    background-color: #f5f5f5; /* Hover effect only if selectable */
    cursor: pointer;
  }
  .enhanced-table tbody tr.selected-row {
    background-color: #e8f0fe; /* Highlight selected row (light blue) */
    /* font-weight: bold; */ /* Optional: make text bold */
  }
  /* --- Action Cell Styling --- */
  .enhanced-table .action-cell {
    text-align: right; /* Align content (the span) to the right */
    width: 1%; /* Make the cell itself as narrow as possible */
    white-space: nowrap; /* Ensure actions don't wrap */
    padding-right: 10px; /* Add some padding to the right edge */
  }
  /* Span containing the action buttons */
  .enhanced-table .action-buttons-container {
    display: inline-flex; /* Align buttons in a row */
    gap: 5px; /* Space between buttons */
    justify-content: flex-end; /* Push buttons to the end of the flex container (span) */
  }
  .enhanced-table .action-button {
    /* Resetting some potential overrides if needed */
    margin: 0;
    padding: 5px;
    line-height: 1;
    /* Ensure buttons don't prevent row selection unless clicked directly */
    /* pointer-events: auto; */ /* Buttons should always be clickable */
  }
  .enhanced-table .action-button i {
     font-size: 1.2rem; /* Slightly larger icons */
  }
`;

// The Component (using original export style)
export default props => {
  const {
    headers,
    data,
    options: rawOptions, // Rename to avoid conflict with internal 'options' variable
    show, // Used for selection/viewing
    edit,
    delete: deleteItem, // Rename 'delete' as it's a reserved keyword
    selectedId, // <<< ADDED: New optional prop to indicate the ID of the selected row
  } = props;

  // --- Default Options ---
  // We assume 'linkable' corresponds to making the row "selectable" via the 'show' prop
  const options = {
    deleteable: true,
    editable: true,
    linkable: true, // If true, rows are selectable via click, and eye icon is shown
    ...rawOptions, // Allow user options to override defaults
  };

  // --- Basic Validation ---
  if (!headers || !Array.isArray(headers) || !data || !Array.isArray(data)) {
    console.warn("Table component requires 'headers' and 'data' arrays.");
    return null; // Render nothing if essential props are missing
  }
   // Check if data items have an 'id'. Needed for keys and selection.
   if (data.length > 0 && typeof data[0]?.id === 'undefined') {
       console.warn("Table data items should have a unique 'id' property for stable keys and selection handling.");
   }

  // --- Handlers ---
  const handleRowClick = (e, row) => {
    // Only trigger 'show' (select) if 'linkable' is true and the click wasn't directly on an action button/icon
    if (options.linkable && typeof show === 'function') {
      // Check if the click originated from within the action cell's button container
      if (!e.target.closest('.action-buttons-container')) {
         show(row); // Trigger the selection/show action passed from parent
      }
    }
  };

  const handleActionClick = (e, actionFn, row) => {
    e.stopPropagation(); // IMPORTANT: Prevent the row's onClick from firing
    if (typeof actionFn === 'function') {
      actionFn(row);
    }
  };

  // --- Render Logic ---
  const hasActions = options.editable || options.deleteable || options.linkable;
  const totalColumns = headers.length + (hasActions ? 1 : 0); // Calculate total columns for colspan

  return (
    <>
      {/* Inject styles into the document head (or wherever appropriate in your setup) */}
      <style>{tableStyles}</style>

      {/* Wrapper div helps control overflow if needed, though parent might handle it */}
      <div className="enhanced-table-wrapper">
        <table className="enhanced-table">
          <thead>
            <tr>
              {headers.map(header => (
                // Use header key or label for the key
                <th key={header.key || header.label}>{header.label}</th>
              ))}
              {/* Add a header for the actions column ONLY if actions exist */}
              {/* {hasActions && (
                <th key="actions-header" className="action-cell">Actions</th>
              )} */}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={totalColumns} style={{ textAlign: 'center', whiteSpace: 'normal', padding: '20px' }}>
                  No data available.
                </td>
              </tr>
            ) : (
              data.map(row => {
                // Use row.id if available, otherwise fall back (though ID is preferred)
                const rowId = row.id !== undefined && row.id !== null ? row.id : Math.random().toString();
                const isSelected = options.linkable && selectedId !== null && selectedId !== undefined && rowId === selectedId;
                const rowClasses = [
                    options.linkable ? 'selectable-row' : '', // Add class if rows can be selected
                    isSelected ? 'selected-row' : ''      // Add class if *this* row is selected
                ].filter(Boolean).join(' '); // Filter out empty strings and join

                return (
                  <tr
                    key={rowId}
                    className={rowClasses}
                    onClick={(e) => handleRowClick(e, row)}
                  >
                    {/* Data Cells */}
                    {headers.map(header => (
                      <td key={`${rowId}-${header.key}`}>{row[header.key]}</td>
                    ))}

                    {/* Action Cell - Render only if any action is enabled */}
                    {hasActions && (
                      <td className="action-cell">
                        {/* Container for buttons - helps with alignment and click handling */}
                        <span className="action-buttons-container">
                          {options.editable && typeof edit === 'function' ? (
                            <button
                              title="Edit details"
                              type="button"
                              className="btn btn-sm btn-clean btn-icon btn-icon-md action-button"
                              onClick={(e) => handleActionClick(e, edit, row)}
                            >
                              <i style={{ color: "#5867dd" }} className="la la-edit" />
                            </button>
                          ) : null}
                          {options.deleteable && typeof deleteItem === 'function' ? (
                            <button
                              title="Delete"
                              type="button"
                              className="btn btn-sm btn-clean btn-icon btn-icon-md action-button"
                              onClick={(e) => handleActionClick(e, deleteItem, row)}
                            >
                              <i style={{ color: "#fd397a" }} className="la la-trash" />
                            </button>
                          ) : null}
                          {/* Eye icon also uses the 'show' prop, but doesn't trigger selection itself */}
                          {options.linkable && typeof show === 'function' ? (
                            <button
                              title="View Details" // Title clarifies it's not just selection
                              type="button"
                              className="btn btn-sm btn-clean btn-icon btn-icon-md action-button"
                              onClick={(e) => handleActionClick(e, show, row)} // Still uses show, but stops propagation
                            >
                              <i style={{ color: "#1dc9b7" }} className="la la-eye" />
                            </button>
                          ) : null}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};