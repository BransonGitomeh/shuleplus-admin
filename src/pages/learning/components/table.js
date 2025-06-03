import React, { useCallback, useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';

// --- Item Type for D&D ---
const RichListItemType = 'GENERIC_RICH_LIST_ITEM';

// --- STYLES (These are crucial for the "beautiful rich list" look) ---
// (These are adapted from the previous richListStyles, renamed for clarity within this component)
const genericRichListStyles = `
  .generic-rich-list-wrapper {
    background-color: #fff; /* Or a very light contextual background */
    border-radius: 8px;
    /* box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03); */
    /* No shadow for a cleaner look, parent container might have shadow */
    padding: 0; /* Wrapper itself has no padding, list inside will */
  }

  .generic-list-items-container {
    display: flex;
    flex-direction: column;
    gap: 8px; /* Space between list items */
    max-height: 60vh; /* Adjust as needed, or make it a prop */
    overflow-y: auto;
    padding: 4px; /* Small padding around the items */
  }
  
  .generic-list-items-container::-webkit-scrollbar { width: 5px; }
  .generic-list-items-container::-webkit-scrollbar-track { background: #f8fafc; }
  .generic-list-items-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  .generic-list-items-container::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

  .draggable-generic-list-item {
    background-color: #ffffff;
    border-radius: 6px;
    border: 1px solid #e2e8f0; /* Slate 200 */
    padding: 10px 12px;
    cursor: default; 
    transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
    display: flex;
    align-items: center; /* Vertically align handle, content, actions */
    gap: 10px;
  }
  
  .draggable-generic-list-item.selectable:hover {
    border-color: #93c5fd; /* Blue 300 */
    background-color: #f7faff; 
    /* box-shadow: 0 1px 2px rgba(0,0,0,0.05); */
  }

  .draggable-generic-list-item.selected {
    border-color: #6366f1 !important; /* Indigo 500 */
    background-color: #eef2ff !important; /* Lighter Indigo */
    /* box-shadow: 0 0 0 1px #6366f1 inset; */
  }

  .draggable-generic-list-item.dragging-item {
    opacity: 0.8;
    transform: scale(1.01); 
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-color: transparent;
    background-color: #fdfdff;
  }
  
  .draggable-generic-list-item.drop-target-top {
    box-shadow: inset 0 2px 0 0 #6366f1; 
  }
  .draggable-generic-list-item.drop-target-bottom {
    box-shadow: inset 0 -2px 0 0 #6366f1;
  }

  .list-item-drag-handle {
    color: #94a3b8; /* Slate 400 */
    cursor: grab;
    flex-shrink: 0;
    padding: 2px 0; /* Align better with text */
  }
  .list-item-drag-handle:active { cursor: grabbing; }
  .list-item-drag-handle svg { width: 16px; height: 16px; display: block; }

  .list-item-main-content {
    flex-grow: 1;
    min-width: 0; 
    display: flex;
    flex-direction: column; /* Allow primary text and media previews to stack */
    gap: 6px; /* Space between primary text and media */
  }

  .list-item-primary-text {
    font-size: 0.9rem;
    color: #1e293b; /* Slate 800 */
    font-weight: 500;
    line-height: 1.4;
    word-break: break-word; 
  }
  /* Styling for HTML content if 'name' contains it */
  .list-item-primary-text img { max-width: 100%; height: auto; border-radius: 3px; margin: 4px 0; }
  .list-item-primary-text h1, .list-item-primary-text h2, .list-item-primary-text h3, 
  .list-item-primary-text h4, .list-item-primary-text h5, .list-item-primary-text h6 {
    font-size: 1em; 
    margin-bottom: 0.25em;
    font-weight: 500; 
  }
  .list-item-primary-text p { margin-bottom: 0.25em; font-weight: 400; color: #334155; }
  .list-item-primary-text ul, .list-item-primary-text ol { margin-left: 15px; margin-bottom: 0.25em; padding-left: 0;}


  .list-item-media-previews {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .list-item-media-previews iframe { /* Video preview */
    width: 80px; 
    height: 50px; 
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }
  .list-item-media-previews img { /* Image preview */
    width: 32px; 
    height: 32px;
    object-fit: cover;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }
  .list-item-media-previews .attachment-link { /* Attachment preview */
    font-size: 0.7rem; color: #4f46e5; background-color: #eef2ff; 
    padding: 2px 6px; border-radius: 10px; display: inline-flex;
    align-items: center; gap: 3px; text-decoration: none;
    border: 1px solid #c7d2fe;
  }
  .list-item-media-previews .attachment-link .icon { font-size: 0.85em; }
  .list-item-media-previews .attachment-link span {
    max-width: 70px; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }

  .list-item-actions-panel {
    display: flex;
    gap: 4px; 
    flex-shrink: 0;
    align-items: center; 
  }
  .list-item-action-btn {
    background: none; border: none; color: #94a3b8; 
    cursor: pointer; padding: 4px; border-radius: 50%; 
    line-height: 1; width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
  }
  .list-item-action-btn:hover { background-color: #f1f5f9; color: #6366f1; }
  .list-item-action-btn i { font-size: 0.9rem; /* Requires icon font */ }

  .list-view-no-items-message {
    text-align: center; padding: 20px 15px; color: #64748b; 
    font-style: italic; font-size: 0.85rem;
  }
`;

// --- DraggableListItem (Internal component for the new Table) ---
const DraggableListItem = ({
  item,
  index,
  listId,
  onMoveItem,
  onShowItem, // Renamed from onSelectItem for clarity, aligns with 'show' prop
  onEditItem,
  onDeleteItem,
  isSelected,
  isSelectable,
  primaryDisplayKey, // Key for the main text display (e.g., 'name' or 'value')
  options, // Pass down table options
}) => {
  const ref = useRef(null);
  const { id, name, videos, images, attachments } = item;

  const [{ handlerId, isOverCurrent }, drop] = useDrop({
    accept: RichListItemType,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
    hover: (draggedItemInfo, monitor) => {
      if (!ref.current || !onMoveItem || draggedItemInfo.id === id || draggedItemInfo.listId !== listId) return;
      const dragIndex = draggedItemInfo.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if ((dragIndex < hoverIndex && hoverClientY < hoverMiddleY) || (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)) {
        // No action
      } else {
        onMoveItem(dragIndex, hoverIndex, listId);
        draggedItemInfo.index = hoverIndex;
      }
    },
    canDrop: (draggedItemInfo) => draggedItemInfo.listId === listId,
  });

  const [{ isDragging, draggedItemData }, drag, preview] = useDrag({
    type: RichListItemType,
    item: () => ({ id, index, listId, itemData: item }),
    canDrag: () => options?.reorderable === true && typeof onMoveItem === 'function', // Only draggable if reorderable
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      draggedItemData: monitor.getItem(),
    }),
  });

  if (options?.reorderable) {
    preview(drop(ref)); // Item is drop target and preview
  } else {
    drop(ref); // Item is only drop target (though won't accept if not reorderable globally)
  }


  const handleItemClick = (e) => {
    if (!isSelectable || !onShowItem) return;
    if (e.target.closest('.list-item-actions-panel button, .list-item-primary-text a, .list-item-primary-text iframe, .list-item-drag-handle, .list-item-media-previews a')) {
      return;
    }
    onShowItem(item); // Call the 'show' callback
  };

  let itemClasses = "draggable-generic-list-item";
  if (isSelectable && options?.linkable !== false) itemClasses += " selectable"; // linkable from options
  if (isSelected) itemClasses += " selected";
  if (isDragging && draggedItemData?.id === id) itemClasses += " dragging-item";

  if (isOverCurrent && draggedItemData && draggedItemData.id !== id && draggedItemData.listId === listId) {
    const hoverBoundingRect = ref.current?.getBoundingClientRect();
    const clientOffset = drop.monitor.getClientOffset();
    if (hoverBoundingRect && clientOffset) {
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (hoverClientY < hoverMiddleY) itemClasses += " drop-target-top";
      else itemClasses += " drop-target-bottom";
    }
  }
  
  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeImages = Array.isArray(images) ? images : [];
  const safeAttachments = Array.isArray(attachments) ? attachments : [];
  
  // Use primaryDisplayKey for the main text, fallback to 'name', then 'id'
  const mainTextContent = item[primaryDisplayKey] || item.name || `Item ${id}`;
  // Check if mainTextContent is likely HTML
  const isHTML = typeof mainTextContent === 'string' && (mainTextContent.includes('<') && mainTextContent.includes('>'));

  return (
    <div ref={ref} className={itemClasses} onClick={handleItemClick} data-handler-id={handlerId}>
      {options?.reorderable && (
        <div ref={drag} className="list-item-drag-handle" title="Drag to reorder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6a2 2 0 11-4 0 2 2 0 014 0zm0 8a2 2 0 11-4 0 2 2 0 014 0zm0 8a2 2 0 11-4 0 2 2 0 014 0zm8-16a2 2 0 11-4 0 2 2 0 014 0zm0 8a2 2 0 11-4 0 2 2 0 014 0zm0 8a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
      )}

      <div className="list-item-main-content">
        {isHTML ? (
            <div className="list-item-primary-text" dangerouslySetInnerHTML={{ __html: mainTextContent }} />
        ) : (
            <div className="list-item-primary-text">{mainTextContent}</div>
        )}
        
        {(safeVideos.length > 0 || safeImages.length > 0 || safeAttachments.length > 0) && (
            <div className="list-item-media-previews">
            {safeVideos.slice(0, 1).map((videoUrl, i) => videoUrl && (
                <div key={`vid-${id}-${i}`} className="list-item-media-item">
                <iframe src={videoUrl} title="Video Preview" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: '120%', height: 'auto' }}></iframe>
                </div>
            ))}
            {safeImages.slice(0, 3).map((imageUrl, i) => imageUrl && (
                <div key={`img-${id}-${i}`} className="list-item-media-item">
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title="View image">
                    <img src={imageUrl} alt={`Preview ${i+1}`} />
                </a>
                </div>
            ))}
            {safeAttachments.slice(0, 2).map((fileUrl, i) => fileUrl && (
                 <a href={fileUrl} target="_blank" rel="noopener noreferrer" download onClick={e => e.stopPropagation()} key={`att-${id}-${i}`} className="attachment-link" title={fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'Attachment'}>
                    <span className="icon">📎</span>
                    <span>{(fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'File').substring(0,10)}</span>
                 </a>
            ))}
            </div>
        )}
      </div>

      {(options?.editable || options?.deleteable) && (
        <div className="list-item-actions-panel">
            {options?.editable && typeof onEditItem === 'function' && (
            <button className="list-item-action-btn" onClick={(e) => { e.stopPropagation(); onEditItem(item); }} title="Edit">
                <i className="la la-edit" /> {/* Placeholder icon */}
            </button>
            )}
            {options?.deleteable && typeof onDeleteItem === 'function' && (
            <button className="list-item-action-btn" onClick={(e) => { e.stopPropagation(); onDeleteItem(item); }} title="Delete">
                <i className="la la-trash" /> {/* Placeholder icon */}
            </button>
            )}
        </div>
      )}
    </div>
  );
};

DraggableListItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  listId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onMoveItem: PropTypes.func,
  onShowItem: PropTypes.func,
  onEditItem: PropTypes.func,
  onDeleteItem: PropTypes.func,
  isSelected: PropTypes.bool,
  isSelectable: PropTypes.bool,
  primaryDisplayKey: PropTypes.string,
  options: PropTypes.object,
};

// --- "Table" Component (New Rich List View) ---
const Table = ({
  // Props from your original Table usage
  headers, // Expected: [{ label: "Name", key: "name" }] or similar for primary display
  data = [], // The array of items to display
  options = { reorderable: false, linkable: true, editable: true, deleteable: true }, // Default options
  show,    // Callback when an item is clicked/selected (if linkable)
  edit,    // Callback for edit action
  delete: deleteItemProp, // Callback for delete action (renamed from 'delete')
  
  // New Props for this component
  listId = 'single-rich-list', // Unique ID for D&D context if multiple lists on page
  onOrderChange, // Callback: (newOrderedItems, listId) => {} - for drag and drop reordering
  selectedItemId, // ID of the currently selected item for highlighting
  className = "",   // Custom class for the wrapper
  noItemsText = "No items to display.",
  isItemSelectable = () => true, // By default, all items can trigger 'show'
}) => {
  const [internalItems, setInternalItems] = useState(data);

  useEffect(() => {
    setInternalItems(data);
  }, [data]);

  const handleMoveItem = useCallback((dragIndex, hoverIndex) => {
    if (!options.reorderable || !onOrderChange) return; // Check if reordering is enabled

    const newItems = [...internalItems];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    setInternalItems(newItems); // Optimistic update
    onOrderChange(newItems, listId);
  }, [internalItems, onOrderChange, listId, options.reorderable]);

  // Determine the primary display key from the first header, fallback to 'name'
  const primaryDisplayKey = headers && headers.length > 0 ? headers[0].key : 'name';

  // Note: DndProvider should be at a higher level if multiple "Table" instances
  // that need to interact via D&D are on the same page.
  // For a single list, or lists that don't interact, this is fine.
  return (
    <DndProvider backend={HTML5Backend}>
      <style>{genericRichListStyles}</style>
      <div className={`generic-rich-list-wrapper ${className}`}>
        <div className="generic-list-items-container">
          {internalItems && internalItems.length > 0 ? (
            internalItems.map((item, index) => (
              <DraggableListItem
                key={item.id || `item-${index}-${listId}`} // Ensure unique key
                item={item}
                index={index}
                listId={listId}
                onMoveItem={options.reorderable ? handleMoveItem : undefined}
                onShowItem={options.linkable !== false ? show : undefined} // Use 'show' prop
                onEditItem={options.editable ? edit : undefined}
                onDeleteItem={options.deleteable ? deleteItemProp : undefined}
                isSelected={selectedItemId === item.id}
                isSelectable={options.linkable !== false && isItemSelectable(item)}
                primaryDisplayKey={primaryDisplayKey}
                options={options}
              />
            ))
          ) : (
            <p className="list-view-no-items-message">{noItemsText}</p>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

Table.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
  })),
  data: PropTypes.arrayOf(PropTypes.object),
  options: PropTypes.shape({
    reorderable: PropTypes.bool,
    linkable: PropTypes.bool,
    editable: PropTypes.bool,
    deleteable: PropTypes.bool,
  }),
  show: PropTypes.func,
  edit: PropTypes.func,
  delete: PropTypes.func,
  listId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onOrderChange: PropTypes.func,
  selectedItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  noItemsText: PropTypes.string,
  isItemSelectable: PropTypes.func,
};

export default Table; // Export the new Table component