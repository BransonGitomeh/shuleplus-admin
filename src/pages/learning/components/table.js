import React from 'react';

const tableStyles = `
  .enhanced-table-wrapper {
    overflow-x: auto;
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .enhanced-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: auto;
    font-size: 0.9rem;
  }
  .enhanced-table th,
  .enhanced-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e9ecef;
    vertical-align: middle;
    text-align: left;
  }
  .enhanced-table td {
    white-space: normal; /* Allow HTML content to wrap by default */
  }
  .enhanced-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
    text-transform: capitalize; /* Retained, but HTML content might override */
    white-space: normal; /* Allow HTML headers to wrap if needed */
  }
  .enhanced-table thead tr:first-child th:first-child {
    border-top-left-radius: 8px;
  }
  .enhanced-table thead tr:first-child th:last-child {
    border-top-right-radius: 8px;
  }
  .enhanced-table tbody tr:last-child td:first-child {
    border-bottom-left-radius: 8px;
  }
  .enhanced-table tbody tr:last-child td:last-child {
    border-bottom-right-radius: 8px;
  }
   .enhanced-table tbody tr:last-child td {
    border-bottom: none;
  }
  .enhanced-table tbody tr {
    transition: background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; /* Added box-shadow transition */
  }
  .enhanced-table tbody tr.selectable-row:hover {
    background-color: #f1f3f5;
    cursor: pointer;
  }
  .enhanced-table tbody tr.selected-row {
    background-color: #e6f7ff; /* Light blue background */
    font-weight: 500;        /* Slightly bolder text */
    /* Optional: Add a more distinct left border for selection */
    /* box-shadow: inset 4px 0 0px #007bff; */
  }
  .enhanced-table tbody tr.selected-row td {
    /* Optional: Change text color for selected row cells if needed */
    /* color: #0056b3; */
  }
  .enhanced-table .action-cell {
    text-align: right;
    width: 1%;
    white-space: nowrap;
    padding-right: 10px;
  }
  .enhanced-table .action-buttons-container {
    display: inline-flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .enhanced-table .action-button {
    margin: 0;
    padding: 6px;
    line-height: 1;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }
  .enhanced-table .action-button:hover {
    background-color: #e9ecef;
  }
  .enhanced-table .action-button i {
     font-size: 1.1rem;
  }
  .enhanced-table .html-content-cell p:last-child,
  .enhanced-table .html-content-cell div:last-child,
  .enhanced-table .html-content-cell span:last-child,
  .enhanced-table th p:last-child, /* Apply to headers as well */
  .enhanced-table th div:last-child,
  .enhanced-table th span:last-child {
    margin-bottom: 0;
  }
  .enhanced-table .no-data-cell {
    text-align: center;
    white-space: normal;
    padding: 30px 15px;
    color: #6c757d;
    font-style: italic;
  }
`;

const EnhancedTable = props => {
  const {
    headers, // Array of { key: string, label: string (can be HTML) }
    data,
    options: rawOptions,
    show,
    edit,
    delete: deleteItem,
    selectedId,
  } = props;

  const options = {
    deleteable: true,
    editable: true,
    linkable: true,
    ...rawOptions,
  };

  if (!headers || !Array.isArray(headers) || !data || !Array.isArray(data)) {
    console.warn("EnhancedTable: 'headers' and 'data' arrays are required.");
    return null;
  }
   if (data.length > 0 && typeof data[0]?.id === 'undefined') {
       console.warn("EnhancedTable: Data items should have a unique 'id' property for stable keys and selection handling.");
   }

  const handleRowClick = (e, row) => {
    if (options.linkable && typeof show === 'function') {
      if (!e.target.closest('.action-buttons-container')) {
         show(row);
      }
    }
  };

  const handleActionClick = (e, actionFn, row) => {
    e.stopPropagation();
    if (typeof actionFn === 'function') {
      actionFn(row);
    }
  };

  const hasActions = options.editable || options.deleteable;
  const totalColumns = headers.length + (hasActions ? 1 : 0);

  return (
    <>
      <style>{tableStyles}</style>
      <div className="enhanced-table-wrapper">
        <table className="enhanced-table">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header.key || header.label}>
                  {/* Render header label as HTML */}
                  <span dangerouslySetInnerHTML={{ __html: String(header.label || '') }} />
                </th>
              ))}
              {hasActions && (
                <th key="actions-header" className="action-cell"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={totalColumns} className="no-data-cell">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowId = row.id !== undefined && row.id !== null ? row.id : `row-${index}`;
                // Ensure selectedId is also treated as a string for comparison if rowId is stringified
                const isSelected = options.linkable && selectedId !== null && selectedId !== undefined && String(rowId) === String(selectedId);
                const rowClasses = [
                    options.linkable ? 'selectable-row' : '',
                    isSelected ? 'selected-row' : ''
                ].filter(Boolean).join(' ');

                return (
                  <tr
                    key={rowId}
                    className={rowClasses}
                    onClick={(e) => handleRowClick(e, row)}
                  >
                    {headers.map(header => (
                      <td
                        key={`${rowId}-${header.key}`}
                        className="html-content-cell"
                      >
                        <span dangerouslySetInnerHTML={{ __html: String(row[header.key] || '') }} />
                      </td>
                    ))}

                    {hasActions && (
                      <td className="action-cell">
                        <span className="action-buttons-container">
                          {options.editable && typeof edit === 'function' && (
                            <button title="Edit details" type="button" className="btn btn-sm btn-clean btn-icon btn-icon-md action-button" onClick={(e) => handleActionClick(e, edit, row)}>
                              <i style={{ color: "#5867dd" }} className="la la-edit" />
                            </button>
                          )}
                          {options.deleteable && typeof deleteItem === 'function' && (
                            <button title="Delete" type="button" className="btn btn-sm btn-clean btn-icon btn-icon-md action-button" onClick={(e) => handleActionClick(e, deleteItem, row)}>
                              <i style={{ color: "#fd397a" }} className="la la-trash" />
                            </button>
                          )}
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

export default EnhancedTable;