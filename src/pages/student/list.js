import React, { useState, useMemo } from "react";

// Helper function to get a value from a nested object property string like 'user.name'
const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

/**
 * A full-featured, Material Design 3 inspired data table for professional dashboards.
 * Includes a stats panel, live search, advanced pagination, sorting, and duplicate row highlighting.
 */
export default function DataTable({
  headers,
  data = [],
  duplicateCheckKey,
  options = { editable: false, deleteable: false, create: false, upload: false },
  onEdit,
  onDelete,
  onCreate,
  onUpload,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState(null);

  // Memoized calculation to find duplicate rows efficiently.
  const duplicateIds = useMemo(() => {
    if (!duplicateCheckKey || !data) return new Set();
    const valueCounts = new Map();
    data.forEach(row => {
      const value = String(getNestedValue(row, duplicateCheckKey)).trim().toLowerCase();
      if (value) {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
      }
    });

    const duplicateValues = new Set();
    for (const [value, count] of valueCounts.entries()) {
      if (count > 1) duplicateValues.add(value);
    }

    const ids = new Set();
    data.forEach(row => {
      const value = String(getNestedValue(row, duplicateCheckKey)).trim().toLowerCase();
      if (duplicateValues.has(value)) ids.add(row.id);
    });

    return ids;
  }, [data, duplicateCheckKey]);

  // Memoized data processing pipeline: filter -> sort
  const processedData = useMemo(() => {
    let filteredData = [...data];

    if (searchTerm) {
      filteredData = filteredData.filter(row =>
        headers.some(header => {
          const cellValue = getNestedValue(row, header.key);
          return String(cellValue).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        const valA = getNestedValue(a, sortConfig.key);
        const valB = getNestedValue(b, sortConfig.key);
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    
    return filteredData.reverse();
  }, [data, searchTerm, sortConfig, headers]);

  // Apply pagination to the already processed data
  const paginatedData = useMemo(() => {
      const startIndex = (currentPage - 1) * rowsPerPage;
      return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  if (!headers) return null;

  return (
    <div className="md-datatable-container">
      {/* Self-contained CSS for the component */}
      <style>{`
        :root {
          --md-primary-color: #6750A4;
          --md-surface-color: #FEF7FF;
          --md-surface-container-color: #F3EDF7;
          --md-on-surface-color: #1D1B20;
          --md-on-surface-variant-color: #49454F;
          --md-outline-color: #79747E;
          --md-error-container-color: #F9DEDC;
          --md-on-error-container-color: #410E0B;
        }
        .md-datatable-container {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          background-color: var(--md-surface-color);
          border: 1px solid var(--md-surface-container-color);
          border-radius: 12px;
          overflow: hidden;
        }
        /* Stats Panel */
        .md-stats-panel {
          display: flex;
          justify-content: space-around;
          padding: 1rem 1.5rem;
          background-color: var(--md-surface-container-color);
          border-bottom: 1px solid #E7E0EC;
        }
        .md-stat-item { text-align: center; }
        .md-stat-value {
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--md-primary-color);
        }
        .md-stat-label {
          font-size: 0.875rem;
          color: var(--md-on-surface-variant-color);
        }
        /* Toolbar */
        .md-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
        }
        .md-search-container {
          position: relative;
          color: var(--md-on-surface-variant-color);
        }
        .md-search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
        }
        .md-search-input {
          background-color: #fff;
          border: 1px solid var(--md-outline-color);
          border-radius: 20px;
          padding: 0.6rem 1rem 0.6rem 2.5rem;
          min-width: 300px;
          font-size: 1rem;
          transition: box-shadow 0.2s;
        }
        .md-search-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--md-primary-color);
        }
        .md-actions-group button {
          margin-left: 0.75rem;
          padding: 0.6rem 1.2rem;
          border-radius: 20px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .md-create-btn {
          background-color: var(--md-primary-color);
          color: #fff;
          border: none;
        }
        .md-create-btn:hover { background-color: #5A4592; }
        .md-upload-btn {
          background-color: transparent;
          color: var(--md-primary-color);
          border: 1px solid var(--md-outline-color);
        }
        .md-upload-btn:hover { background-color: var(--md-surface-container-color); }
        /* Table */
        .md-table-wrapper { overflow-x: auto; }
        .md-table { width: 100%; border-collapse: collapse; }
        .md-table th, .md-table td {
          padding: 1rem 1.5rem;
          text-align: left;
          border-bottom: 1px solid #E7E0EC;
          white-space: nowrap;
        }
        .md-table th {
          font-weight: 500;
          color: var(--md-on-surface-variant-color);
          cursor: pointer;
          user-select: none;
          text-transform: uppercase;
          font-size: 0.875rem;
        }
        .md-table th:hover { background-color: var(--md-surface-container-color); }
        .md-table tbody tr.duplicate-row { background-color: var(--md-error-container-color); color: var(--md-on-error-container-color); }
        .md-table tbody tr.duplicate-row:hover { background-color: #F7D0CC; }
        .md-table tbody tr:hover { background-color: #F3EDF7; }
        .md-table-actions { width: 110px; text-align: right; }
        .md-table-actions button {
          background: none; border: none; cursor: pointer; padding: 0.5rem;
          color: var(--md-on-surface-variant-color); font-size: 1.25rem;
        }
        .md-table-actions button.edit-icon:hover { color: #357960; }
        .md-table-actions button.delete-icon:hover { color: #B3261E; }
        /* Pagination */
        .md-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.5rem;
          color: var(--md-on-surface-variant-color);
        }
        .md-pagination-controls { display: flex; align-items: center; gap: 1rem; }
        .md-pagination-rows-select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--md-outline-color);
        }
        .md-pagination-nav button {
          background: none; border: none; cursor: pointer;
          color: var(--md-on-surface-variant-color); font-size: 1.5rem;
        }
        .md-pagination-nav button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="md-stats-panel">
        <div className="md-stat-item">
          <div className="md-stat-value">{data.length}</div>
          <div className="md-stat-label">Total Records</div>
        </div>
        <div className="md-stat-item">
          <div className="md-stat-value">{duplicateIds.size}</div>
          <div className="md-stat-label">Duplicates Found</div>
        </div>
        <div className="md-stat-item">
          <div className="md-stat-value">{processedData.length}</div>
          <div className="md-stat-label">Displaying</div>
        </div>
      </div>
      
      <div className="md-toolbar">
        <div className="md-search-container">
          <span className="md-search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
          </span>
          <input
            type="text"
            className="md-search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="md-actions-group">
            {options.create && <button className="md-create-btn" onClick={onCreate}>CREATE</button>}
            {options.upload && <button className="md-upload-btn" onClick={onUpload}>UPLOAD</button>}
        </div>
      </div>

      <div className="md-table-wrapper">
        <table className="md-table">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header.key} onClick={() => requestSort(header.key)}>
                  {header.label}
                  {sortConfig?.key === header.key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
              {(options.editable || options.deleteable) && <th className="md-table-actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map(row => (
                <tr key={row.id} className={duplicateIds.has(row.id) ? 'duplicate-row' : ''}>
                  {headers.map(header => (
                    <td key={header.key}>{header.view(row)}</td>
                  ))}
                  {(options.editable || options.deleteable) && (
                    <td className="md-table-actions">
                        {options.editable && (
                          <button title="Edit" className="md-table-actions-button edit-icon" onClick={() => onEdit(row)}>
                            <i className="la la-edit" />
                          </button>
                        )}
                        {options.deleteable && (
                          <button title="Delete" className="md-table-actions-button delete-icon" onClick={() => onDelete(row)}>
                            <i className="la la-trash" />
                          </button>
                        )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length + 1} style={{ textAlign: 'center', padding: '3rem' }}>
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 0 && (
        <div className="md-pagination">
          <div className="md-pagination-controls">
              <span>Rows per page:</span>
              <select 
                className="md-pagination-rows-select"
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
              </select>
          </div>
          <div className="md-pagination-controls">
            <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, processedData.length)} of ${processedData.length}`}</span>
            <div className="md-pagination-nav">
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                    <i className="la la-angle-left" />
                </button>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                    <i className="la la-angle-right" />
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}