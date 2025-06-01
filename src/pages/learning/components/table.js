import React, { useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Define an item type for dnd
const ItemTypes = {
  ROW: 'row',
};

const tableStyles = `
  /* ... Your existing tableStyles string ... */
  .enhanced-table-wrapper {
    overflow-x: auto;
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    background-color: #fff;
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
    white-space: normal;
  }
  .enhanced-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
    text-transform: capitalize;
    white-space: normal;
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
    transition: background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, opacity 0.2s ease-out;
  }
  .enhanced-table tbody tr.selectable-row:hover:not(.dragging) {
    background-color: #f1f3f5;
    cursor: pointer;
  }
  .enhanced-table tbody tr.selected-row:not(.dragging) {
    background-color: #e6f7ff;
    font-weight: 500;
  }
  .enhanced-table tbody tr.dragging {
    opacity: 0.4 !important;
  }
  .enhanced-table tbody tr.drag-over-top {
    border-top: 3px solid #0d6efd;
  }
  .enhanced-table tbody tr.drag-over-bottom {
    border-bottom: 3px solid #0d6efd;
  }
  .enhanced-table .action-cell {
    text-align: right;
    width: auto;
    min-width: 80px;
    white-space: nowrap;
    padding-right: 16px;
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
    border: none;
    background: none;
    cursor: pointer;
    color: #495057;
  }
  .enhanced-table .action-button:hover {
    background-color: #e9ecef;
  }
  .enhanced-table .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .enhanced-table .action-button i {
     font-size: 1.1rem;
     vertical-align: middle;
  }
  .enhanced-table .html-content-cell > *:last-child,
  .enhanced-table th > *:last-child {
    margin-bottom: 0;
  }
  .enhanced-table .no-data-cell {
    text-align: center;
    white-space: normal;
    padding: 30px 15px;
    color: #6c757d;
    font-style: italic;
  }
  .enhanced-table .drag-handle-cell {
    width: 40px;
    text-align: center;
    cursor: grab;
    padding-left: 12px;
    padding-right: 8px;
    vertical-align: middle;
  }
  .enhanced-table .drag-handle-cell:active {
    cursor: grabbing;
  }
  .enhanced-table .drag-handle-icon {
    display: inline-block;
    vertical-align: middle;
    width: 20px;
    height: 20px;
    color: #6c757d;
  }
`;

// Internal Draggable Table Row Component
const DraggableTableRow = ({
  row,
  index,
  headers,
  // options prop is still passed for other things like linkable, editable, etc.
  options,
  selectedId,
  show,
  edit,
  deleteItem,
  moveRow, // Will always be provided by EnhancedTable now
  hasActions,
}) => {
  const ref = useRef(null);
  const dragHandleRef = useRef(null);

  const [{ handlerId, isOver, clientOffset, draggedItem }, drop] = useDrop({
    accept: ItemTypes.ROW,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      isOver: monitor.isOver({ shallow: true }),
      clientOffset: monitor.getClientOffset(),
      draggedItem: monitor.getItem(),
    }),
    hover: (item, monitor) => {
      if (!ref.current) return;
      // moveRow is assumed to be a function here
      // No need to check typeof moveRow === 'function' if it's always passed

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const currentClientOffset = monitor.getClientOffset();
      const hoverClientY = currentClientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.ROW,
    item: () => ({ id: row.id, index }),
    // canDrag is now always true if moveRow (and thus onOrderChange) is present.
    // We can even remove canDrag if we strictly enforce onOrderChange must be provided.
    // For robustness, let's keep a check that moveRow is callable.
    canDrag: () => typeof moveRow === 'function',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Always apply drag and drop refs as we assume reorderable
  drag(dragHandleRef);
  drop(preview(ref));

  const handleRowClickInternal = (e) => {
    if (options.linkable && typeof show === 'function') {
      if (!e.target.closest('.action-buttons-container') && !e.target.closest('.drag-handle-cell')) {
        show(row);
      }
    }
  };

  const handleActionClickInternal = (e, actionFn, item) => {
    e.stopPropagation();
    if (typeof actionFn === 'function') {
      actionFn(item);
    }
  };

  const rowIdStr = String(row.id);
  const isSelected = options.linkable && selectedId !== null && selectedId !== undefined && String(selectedId) === rowIdStr;

  let rowClasses = [];
  if (options.linkable) rowClasses.push('selectable-row');
  if (isSelected) rowClasses.push('selected-row');
  if (isDragging) rowClasses.push('dragging');

  // isOver check is still relevant for visual feedback
  if (isOver && clientOffset && draggedItem && draggedItem.id !== row.id) {
    const hoverBoundingRect = ref.current?.getBoundingClientRect();
    if (hoverBoundingRect) {
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (hoverClientY < hoverMiddleY) {
        rowClasses.push('drag-over-top');
      } else {
        rowClasses.push('drag-over-bottom');
      }
    }
  }

  return (
    <tr
      ref={ref} // Always attach ref
      className={rowClasses.filter(Boolean).join(' ')}
      onClick={handleRowClickInternal}
      data-handler-id={handlerId} // Always attach handlerId
    >
      {/* Drag handle cell is always rendered */}
      <td ref={dragHandleRef} className="drag-handle-cell">
        <svg className="drag-handle-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 6C11 5.44772 10.5523 5 10 5C9.44772 5 9 5.44772 9 6C9 6.55228 9.44772 7 10 7C10.5523 7 11 6.55228 11 6ZM11 12C11 11.4477 10.5523 11 10 11C9.44772 11 9 11.4477 9 12C9 12.5523 9.44772 13 10 13C10.5523 13 11 12.5523 11 12ZM10 19C10.5523 19 11 18.5523 11 18C11 17.4477 10.5523 17 10 17C9.44772 17 9 17.4477 9 18C9 18.5523 9.44772 19 10 19ZM15 6C15 5.44772 14.5523 5 14 5C13.4477 5 13 5.44772 13 6C13 6.55228 13.4477 7 14 7C14.5523 7 15 6.55228 15 6ZM15 12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12C13 12.5523 13.4477 13 14 13C14.5523 13 15 12.5523 15 12ZM14 19C14.5523 19 15 18.5523 15 18C15 17.4477 14.5523 17 14 17C13.4477 17 13 17.4477 13 18C13 18.5523 13.4477 19 14 19Z"/>
        </svg>
      </td>
      {headers.map(header => (
        <td key={`${rowIdStr}-${header.key}`} className="html-content-cell">
          <span dangerouslySetInnerHTML={{ __html: String(row[header.key] || '') }} />
        </td>
      ))}
      {hasActions && (
        <td className="action-cell">
          <span className="action-buttons-container">
            {options.editable && typeof edit === 'function' && (
              <button
                title="Edit details"
                type="button"
                className="action-button"
                onClick={(e) => handleActionClickInternal(e, edit, row)}
              >
                <i style={{ color: "#5867dd" }} className="la la-edit" />
              </button>
            )}
            {options.deleteable && typeof deleteItem === 'function' && (
              <button
                title="Delete"
                type="button"
                className="action-button"
                onClick={(e) => handleActionClickInternal(e, deleteItem, row)}
              >
                <i style={{ color: "#fd397a" }} className="la la-trash" />
              </button>
            )}
          </span>
        </td>
      )}
    </tr>
  );
};

// Main EnhancedTable Component
const EnhancedTable = props => {
  const {
    headers,
    data,
    // rawOptions can still be used for deleteable, editable, linkable
    options: rawOptions, 
    show,
    edit,
    delete: deleteItem,
    onOrderChange, // This is now ESSENTIAL for reordering
    selectedId,
  } = props;

  // moveRow is defined at the top, unconditionally.
  const moveRow = useCallback((dragIndex, hoverIndex) => {
    if (typeof onOrderChange !== 'function') {
      console.warn("EnhancedTable: 'onOrderChange' callback is NOT provided. Reordering will not persist.");
      return;
    }
    if (!data) {
        console.warn("EnhancedTable: moveRow called but data is undefined.");
        return;
    }
    if (dragIndex < 0 || dragIndex >= data.length || hoverIndex < 0 || hoverIndex >= data.length) {
        console.warn("EnhancedTable: Invalid drag or hover index.", { dragIndex, hoverIndex, dataLength: data.length });
        return;
    }

    const dragRow = data[dragIndex];
    const newData = [...data];
    newData.splice(dragIndex, 1);
    newData.splice(hoverIndex, 0, dragRow);
    
    onOrderChange(newData);
  }, [data, onOrderChange]); // Dependencies for useCallback

  // Merge with default options, reorderable is no longer part of this default
  // as we assume it's always on if this component is used for DnD.
  const options = {
    deleteable: true,
    editable: true,
    linkable: true,
    // reorderable: false, // Removed from here, as it's implicitly true for DnD
    ...rawOptions,
  };


  if (!headers || !Array.isArray(headers) || !data || !Array.isArray(data)) {
    console.warn("EnhancedTable: 'headers' and 'data' arrays are required.");
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="enhanced-table-wrapper">
            <style>{tableStyles}</style>
            <p style={{padding: '20px', textAlign: 'center'}}>Error: Table headers or data missing.</p>
        </div>
      </DndProvider>
    );
  }
  
  if (data.length > 0 && data.some(item => typeof item?.id === 'undefined' || item.id === null)) {
    console.warn("EnhancedTable: All data items must have a unique, non-null 'id' property.");
  }
  
  const hasActions = options.editable || options.deleteable;
  // The drag handle column is now always counted.
  const totalColumns = headers.length + (hasActions ? 1 : 0) + 1; 

  return (
    <DndProvider backend={HTML5Backend}>
      <style>{tableStyles}</style>
      <div className="enhanced-table-wrapper">
        <table className="enhanced-table">
          <thead>
            <tr>
              {/* Drag handle header is always rendered */}
              <th key="drag-handle-header" className="drag-handle-cell" style={{width: '40px'}}></th>
              {headers.map(header => (
                <th key={header.key || header.label}>
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
              data.map((row, index) => (
                <DraggableTableRow
                  key={row.id}
                  index={index}
                  row={row}
                  headers={headers}
                  options={options} // Pass other options
                  selectedId={selectedId}
                  show={show}
                  edit={edit}
                  deleteItem={deleteItem}
                  moveRow={moveRow} // Always pass moveRow
                  hasActions={hasActions}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </DndProvider>
  );
};

export default EnhancedTable;