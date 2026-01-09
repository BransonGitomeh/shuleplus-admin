import React from 'react';

const Table = ({ headers, data, onDelete, onClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-5 text-center text-muted bg-white rounded shadow-sm">
        <i className="fas fa-folder-open fa-3x mb-3 text-light-gray"></i>
        <h5>No Data Available</h5>
      </div>
    );
  }

  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <table className="table table-hover mb-0 align-middle">
        <thead className="bg-light text-muted text-uppercase small">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="py-3 font-weight-bold border-top-0">
                {h.label}
              </th>
            ))}
            {onDelete && <th className="py-3 text-right border-top-0">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={row.id || index} 
              style={{ cursor: onClick ? 'pointer' : 'default' }}
              onClick={() => onClick && onClick(row)}
            >
              {headers.map((h, i) => (
                <td key={i} className="py-3">
                  {/* If 'component' (function) is passed, use it, else display raw 'key' value */}
                  {h.component ? h.component(row) : (row[h.key] || '-')}
                </td>
              ))}
              
              {onDelete && (
                <td className="text-right py-3" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="btn btn-icon btn-light-danger btn-sm rounded-circle"
                    onClick={() => onDelete(row)}
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;