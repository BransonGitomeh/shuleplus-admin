import React, { useCallback, useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';

// --- Item Type for D&D ---
const RichListItemType = 'GENERIC_RICH_LIST_ITEM';

// --- STYLES (Your existing styles are here) ---
const genericRichListStyles = `
  .generic-rich-list-wrapper {
    background-color: #fff;
    border-radius: 8px;
    padding: 0;
  }

  .generic-list-items-container {
    display: flex;
    flex-direction: column;
    gap: 8px; /* Space between items */
    max-height: 70vh; /* Or any desired height */
    overflow-y: auto;
    padding: 4px; /* Padding around the list items */
  }
  
  .generic-list-items-container::-webkit-scrollbar { width: 5px; }
  .generic-list-items-container::-webkit-scrollbar-track { background: #f8fafc; } /* Tailwind gray-50 */
  .generic-list-items-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; } /* Tailwind slate-200 */
  .generic-list-items-container::-webkit-scrollbar-thumb:hover { background: #cbd5e1; } /* Tailwind slate-300 */

  .draggable-generic-list-item {
    background-color: #ffffff;
    border-radius: 6px;
    border: 1px solid #e2e8f0; /* Slate 200 */
    padding: 10px 12px;
    cursor: default; /* Default cursor, will change to pointer if selectable */
    transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
    display: flex;
    align-items: center;
    gap: 10px; /* Space between handle, content, actions */
  }
  
  .draggable-generic-list-item.selectable:hover {
    border-color: #93c5fd; /* Blue 300 */
    background-color: #f7faff; /* Lighter blue for hover */
    cursor: pointer;
  }

  .draggable-generic-list-item.selected {
    border-color: #6366f1 !important; /* Indigo 500 */
    background-color: #eef2ff !important; /* Indigo 100 */
    /* box-shadow: 0 0 0 1px #6366f1; */ /* Optional focus ring style */
  }

  /* Styling for item being dragged */
  .draggable-generic-list-item.dragging-item {
    opacity: 0.8;
    transform: scale(1.01); 
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-color: transparent; /* Or a subtle color */
    background-color: #fdfdff; /* Slightly off-white */
  }
  
  /* Visual feedback for drop target position */
  .draggable-generic-list-item.drop-target-top {
    box-shadow: inset 0 2px 0 0 #6366f1; /* Indigo 500 top border */
  }
  .draggable-generic-list-item.drop-target-bottom {
    box-shadow: inset 0 -2px 0 0 #6366f1; /* Indigo 500 bottom border */
  }

  .list-item-drag-handle {
    color: #94a3b8; /* Slate 400 */
    cursor: grab;
    flex-shrink: 0;
    padding: 2px 0; /* Better click area */
  }
  .list-item-drag-handle:active { cursor: grabbing; }
  .list-item-drag-handle svg { width: 16px; height: 16px; display: block; }

  .list-item-main-content {
    flex-grow: 1;
    min-width: 0; /* Important for text truncation within flex items */
    display: flex;
    flex-direction: column;
    gap: 6px; /* Space between primary text and media previews */
  }

  .list-item-primary-text {
    font-size: 0.9rem;
    color: #1e293b; /* Slate 800 */
    font-weight: 500;
    line-height: 1.4;
    word-break: break-word; /* Allow long words to break */
  }
  /* Basic styling for HTML content within primary text */
  .list-item-primary-text img { max-width: 100%; height: auto; border-radius: 3px; margin: 4px 0; }
  .list-item-primary-text h1, .list-item-primary-text h2, .list-item-primary-text h3, 
  .list-item-primary-text h4, .list-item-primary-text h5, .list-item-primary-text h6 {
    font-size: 1em; /* Keep relative to item text */
    margin-bottom: 0.25em;
    font-weight: 500; /* Match item text weight */
  }
  .list-item-primary-text p { margin-bottom: 0.25em; font-weight: 400; color: #334155; /* Slate 700 */ }
  .list-item-primary-text ul, .list-item-primary-text ol { margin-left: 15px; margin-bottom: 0.25em; padding-left: 0;}

  .list-item-media-previews {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .list-item-media-previews iframe { /* Video preview */
    /* width: 80px;  */ /* Let aspect ratio control width based on height */
    height: 50px; /* Example height */
    aspect-ratio: 16 / 9;
    border-radius: 3px;
    border: 1px solid #e2e8f0; /* Slate 200 */
  }
  .list-item-media-previews img { /* Image preview */
    width: 32px; 
    height: 32px;
    object-fit: cover;
    border-radius: 3px;
    border: 1px solid #e2e8f0; /* Slate 200 */
  }
  .list-item-media-previews .attachment-link { /* Attachment preview */
    font-size: 0.7rem; color: #4f46e5; /* Indigo 600 */ background-color: #eef2ff; /* Indigo 100 */
    padding: 2px 6px; border-radius: 10px; display: inline-flex;
    align-items: center; gap: 3px; text-decoration: none;
    border: 1px solid #c7d2fe; /* Indigo 300 */
  }
  .list-item-media-previews .attachment-link .icon { font-size: 0.85em; }
  .list-item-media-previews .attachment-link span {
     white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
    max-width: 80px; /* Limit filename length shown */
  }

  .list-item-actions-panel {
    display: flex;
    gap: 4px; 
    flex-shrink: 0;
    align-items: center; 
  }
  .list-item-action-btn {
    background: none; border: none; color: #94a3b8; /* Slate 400 */
    cursor: pointer; padding: 4px; border-radius: 50%; 
    line-height: 1; /* Ensure icon is centered */ width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
  }
  .list-item-action-btn:hover { background-color: #f1f5f9; /* Slate 100 */ color: #6366f1; /* Indigo 500 */ }
  .list-item-action-btn svg { width: 14px; height: 14px; /* Adjust icon size */ }

  .list-view-no-items-message {
    text-align: center; padding: 20px 15px; color: #64748b; /* Slate 500 */
    font-style: italic; font-size: 0.85rem;
  }
`;

// --- DraggableListItem (Internal component for the new Table) ---
const DraggableListItem = ({
  item,
  index,
  listId,
  onMoveItem,
  onShowItem,
  onEditItem, // Changed from edit
  onDeleteItem, // Changed from delete
  isSelected,
  isSelectable,
  primaryDisplayKey,
  options,
}) => {
  const ref = useRef(null);
  const { id, name, videos, images, attachments } = item; 

  const [{ handlerId, isOverCurrent, currentOffset }, drop] = useDrop({ 
    accept: RichListItemType,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      currentOffset: monitor.getClientOffset(), 
    }),
    hover: (draggedItemInfo, monitor) => {
      if (!ref.current || !onMoveItem || !options?.reorderable) return;
      if (draggedItemInfo.id === id || (draggedItemInfo.listId && draggedItemInfo.listId !== listId)) return;

      const dragIndex = draggedItemInfo.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return; 
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      onMoveItem(dragIndex, hoverIndex, listId);
      draggedItemInfo.index = hoverIndex; 
    },
    canDrop: (draggedItemInfo) => !draggedItemInfo.listId || draggedItemInfo.listId === listId,
  });

  const [{ isDragging, draggedItemData }, drag, preview] = useDrag({
    type: RichListItemType,
    item: () => ({ id, index, listId, itemData: item }), 
    canDrag: () => options?.reorderable === true && typeof onMoveItem === 'function',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      draggedItemData: monitor.getItem(),
    }),
  });

  if (options?.reorderable && typeof onMoveItem === 'function') {
    preview(drop(ref)); 
  } else {
    drop(ref); 
  }

  const handleItemClick = (e) => {
    if (!isSelectable || !onShowItem) return;
    if (e.target.closest('.list-item-actions-panel button, .list-item-primary-text a, .list-item-primary-text iframe, .list-item-drag-handle, .list-item-media-previews a, .list-item-media-previews iframe')) {
      return;
    }
    onShowItem(item);
  };

  let itemClasses = "draggable-generic-list-item";
  if (isSelectable && options?.linkable !== false) itemClasses += " selectable";
  if (isSelected) itemClasses += " selected";
  if (isDragging && draggedItemData?.id === id) itemClasses += " dragging-item";

  if (isOverCurrent && currentOffset && draggedItemData && draggedItemData.id !== id && (!draggedItemData.listId || draggedItemData.listId === listId) ) { 
    const hoverBoundingRect = ref.current?.getBoundingClientRect();
    if (hoverBoundingRect) { 
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = currentOffset.y - hoverBoundingRect.top;
      if (hoverClientY < hoverMiddleY) itemClasses += " drop-target-top";
      else itemClasses += " drop-target-bottom";
    }
  }
  
  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeImages = Array.isArray(images) ? images : [];
  const safeAttachments = Array.isArray(attachments) ? attachments : [];
  
  const mainTextContent = item[primaryDisplayKey] || item.name || `Item ${item.id !== undefined ? item.id : index}`;
  const isHTML = typeof mainTextContent === 'string' && (mainTextContent.includes('<') && mainTextContent.includes('>'));

  return (
    <div ref={ref} className={itemClasses} onClick={handleItemClick} data-handler-id={handlerId}>
      {options?.reorderable && typeof onMoveItem === 'function' && (
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
              <div key={`vid-${item.id}-${i}`} className="list-item-media-item">
              <iframe src={videoUrl} title="Video Preview" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ height: '16vh', width: 'auto' }}></iframe>
              </div>
          ))}
          {safeImages.slice(0, 3).map((imageUrl, i) => imageUrl && (
              <div key={`img-${item.id}-${i}`} className="list-item-media-item">
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title="View image">
                  <img src={imageUrl} alt={`Preview ${i+1}`} />
              </a>
              </div>
          ))}
          {safeAttachments.slice(0, 2).map((fileUrl, i) => fileUrl && (
               <a href={fileUrl} target="_blank" rel="noopener noreferrer" download onClick={e => e.stopPropagation()} key={`att-${item.id}-${i}`} className="attachment-link" title={fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'Attachment'}>
                  <span className="icon">📎</span>
                  <span>{(fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'File').substring(0,10)}</span>
               </a>
          ))}
          </div>
        )}
      </div>

      <div className="list-item-actions-panel">
            {options?.editable && typeof onEditItem === 'function' && (
            <button className="list-item-action-btn" onClick={(e) => { e.stopPropagation(); onEditItem(item); }} title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                </svg>
            </button>
            )}
            {options?.deleteable && typeof onDeleteItem === 'function' && (
            <button className="list-item-action-btn" onClick={(e) => { e.stopPropagation(); onDeleteItem(item); }} title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
            )}
        </div>
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
  headers,
  data = [],
  options = { reorderable: false, linkable: true, editable: true, deleteable: true },
  show,
  edit, // Will be mapped to onEditItem
  delete :deleteItemProp, // Will be mapped to onDeleteItem
  listId = 'single-rich-list',
  onOrderChange,
  selectedItemId,
  className = "",
  noItemsText = "No items to display.",
  isItemSelectable = () => true,
}) => {
  // No need for internalItems state if data is always passed from parent
  // useEffect(() => {
  //   setInternalItems(data);
  // }, [data]);

  // console.log({data})

  const handleMoveItem = useCallback((dragIndex, hoverIndex, LId) => {
    if (!options.reorderable || !onOrderChange) return;

    const newItems = [...data]; // Use current data prop
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    onOrderChange(newItems, LId); 
                                      
  }, [data, onOrderChange, options.reorderable]);


  const primaryDisplayKey = headers && headers.length > 0 && headers[0].key ? headers[0].key : 'name';

  // Inject styles once
  useEffect(() => {
    const styleId = 'generic-rich-list-styles';
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.type = "text/css";
      styleSheet.innerText = genericRichListStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);


  return (
    <DndProvider backend={HTML5Backend}>
      {/* <style>{genericRichListStyles}</style> Removed: Styles injected into head now */}
      <div className={`generic-rich-list-wrapper ${className}`}>
        <div className="generic-list-items-container">
          {data && data.length > 0 ? (
            data.map((item, index) => {
              if (item.id === undefined) {
                console.warn("Table item is missing an 'id' property. D&D and selection may not work correctly.", item, "List ID:", listId);
                // Potentially provide a fallback key if id is missing, though id is crucial
              }
              return (
                <DraggableListItem
                  key={item.id || `item-${index}-${listId}`} // Fallback key, but ID is preferred
                  item={item}
                  index={index}
                  listId={listId} // Crucial for D&D context
                  onMoveItem={options.reorderable && typeof onOrderChange === 'function' ? handleMoveItem : undefined}
                  onShowItem={options.linkable !== false ? show : undefined}
                  onEditItem={options.editable !== false ? edit : undefined} // Pass 'edit' as 'onEditItem'
                  onDeleteItem={options.deleteable !== false ? deleteItemProp : undefined} // Pass 'deleteItemProp' as 'onDeleteItem'
                  isSelected={selectedItemId === item.id}
                  isSelectable={options.linkable !== false && isItemSelectable(item)}
                  primaryDisplayKey={primaryDisplayKey}
                  options={options}
                />
              );
            })
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
  deleteItemProp: PropTypes.func, 
  listId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // listId is now required
  onOrderChange: PropTypes.func,
  selectedItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  noItemsText: PropTypes.string,
  isItemSelectable: PropTypes.func,
};

export default Table;