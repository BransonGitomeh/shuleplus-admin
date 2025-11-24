import React, { useState, useEffect, useRef } from 'react';
import Handlebars from 'handlebars';

// --- STYLES: Modern "Campaign Manager" UI ---
const MODERN_STYLES = `
  /* Custom Scrollbar */
  .custom-scroll::-webkit-scrollbar { width: 6px; }
  .custom-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
  .custom-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
  .custom-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

  /* Contact Card */
  .contact-card {
    transition: all 0.2s ease;
    border: 1px solid #ebedf2;
    border-radius: 8px;
    background: white;
    margin-bottom: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .contact-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: #d1d5db;
  }
  .contact-card.selected {
    border-color: #5d78ff;
    background-color: #f7f9ff;
  }
  .contact-card.selected::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: #5d78ff;
  }

  /* Variable Chips */
  .var-chip {
    display: inline-block;
    padding: 4px 10px;
    margin: 0 5px 5px 0;
    background: #eef2ff;
    color: #5d78ff;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
  }
  .var-chip:hover {
    background: #5d78ff;
    color: white;
    border-color: #5d78ff;
  }

  /* Load More Button */
  .load-more-container {
    padding: 15px 0;
    text-align: center;
    border-top: 1px dashed #ebedf2;
    margin-top: 5px;
  }
  .btn-load-more {
    font-size: 0.85rem;
    font-weight: 600;
    padding: 10px 24px;
    border-radius: 30px;
    background: #f0f2f5;
    color: #5e6278;
    border: none;
    transition: all 0.2s;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
  .btn-load-more:hover {
    background: #e4e6ef;
    color: #5d78ff;
    transform: translateY(-1px);
  }
  .btn-load-more:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Phone Preview Simulator */
  .phone-mockup {
    background: #fff;
    border: 12px solid #2d3436;
    border-radius: 30px;
    height: 480px;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
  }
  .phone-header {
    background: #f7f7f7;
    padding: 15px;
    border-bottom: 1px solid #eee;
    text-align: center;
    font-size: 0.8rem;
    color: #888;
    font-weight: 600;
  }
  .phone-body {
    background: #e5e5f7;
    flex-grow: 1;
    padding: 15px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .msg-bubble {
    background: #fff;
    padding: 12px 16px;
    border-radius: 18px 18px 18px 4px;
    font-size: 0.9rem;
    line-height: 1.4;
    color: #333;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    max-width: 90%;
    margin-bottom: 10px;
    white-space: pre-wrap;
  }
  .msg-meta {
    font-size: 0.7rem;
    color: #999;
    margin-top: 4px;
    display: block;
    text-align: right;
  }
`;

// --- HELPER: Mask Phone (0711***107) ---
const maskPhone = (phone) => {
  if (!phone) return '';
  const p = phone.toString().replace(/\D/g, '');
  if (p.length < 7) return p;
  return `${p.slice(0, 4)}***${p.slice(-3)}`;
};

const MessageView = (props) => {
  const {
    activeTab, onTabChange, subFilterId, onSubFilterIdChange, searchTerm, onSearchChange,
    classes, routes, 
    // Pagination Props
    displayList, totalCount, isLoading, hasMore, onLoadMore,
    // Selection Props
    selectedIds, onSelectAll, onSelectOne,
    // Message Props
    messageTemplate, onMessageChange, messageType, onMessageTypeChange,
    onSend, isSending, previewRecipient,
  } = props;

  const [preview, setPreview] = useState('');
  const textareaRef = useRef(null);

  // Logic: Auto-select first option if filter list exists but none selected
  useEffect(() => {
    if (activeTab === 'classes' && !subFilterId && classes.length > 0) {
      onSubFilterIdChange({ target: { value: classes[0].id } });
    }
    if (activeTab === 'routes' && !subFilterId && routes.length > 0) {
      onSubFilterIdChange({ target: { value: routes[0].id } });
    }
  }, [activeTab, classes, routes, subFilterId, onSubFilterIdChange]);

  // Logic: Generate Live Preview
  useEffect(() => {
    if (previewRecipient) {
      try {
        const template = Handlebars.compile(messageTemplate || ' ');
        const context = {
          recipient: previewRecipient,
          parent: previewRecipient,
          student: previewRecipient.students?.[0] || { names: 'Student' }
        };
        setPreview(template(context));
      } catch (error) { setPreview("Template Error"); }
    } else {
      setPreview("Select a recipient to see preview.");
    }
  }, [messageTemplate, previewRecipient]);

  // Helper: Insert Variable Tag
  const insertVariable = (varCode) => {
    const field = textareaRef.current;
    if (field) {
      const startPos = field.selectionStart;
      const endPos = field.selectionEnd;
      const text = messageTemplate;
      const newText = text.substring(0, startPos) + varCode + text.substring(endPos);
      
      onMessageChange({ target: { value: newText } });
      
      setTimeout(() => {
        field.focus();
        field.setSelectionRange(startPos + varCode.length, startPos + varCode.length);
      }, 0);
    }
  };

  const getInitials = (name = '') => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  
  // "Select All" check state based on currently loaded items
  const allOnPageSelected = displayList.length > 0 && 
                            displayList.every(item => selectedIds.has(item.id));

  return (
    <>
      <style>{MODERN_STYLES}</style>
      <div className="row h-100">
        
        {/* ======================= LEFT COLUMN: Audience Manager ======================= */}
        <div className="col-lg-5 col-xl-4 d-flex flex-column" style={{maxHeight: '85vh'}}>
          <div className="kt-portlet kt-portlet--height-fluid flex-grow-1 d-flex flex-column mb-0">
            
            {/* 1. Header & Tabs */}
            <div className="kt-portlet__head kt-portlet__head--noborder pb-0">
              <div className="kt-portlet__head-label">
                <h3 className="kt-portlet__head-title text-dark">Select Audience</h3>
              </div>
            </div>
            
            <div className="px-4 pb-2">
               {/* Segmented Control */}
               <div className="btn-group btn-group-sm w-100 mb-3" role="group">
                  {[
                    { id: 'parents', label: 'All Parents' },
                    { id: 'classes', label: 'By Class' },
                    { id: 'routes', label: 'By Route' },
                    { id: 'staff', label: 'Staff' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      type="button" 
                      className={`btn ${activeTab === tab.id ? 'btn-brand' : 'btn-outline-secondary'}`}
                      onClick={() => onTabChange(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
               </div>

               {/* Dropdowns for Sub-Filters */}
               {activeTab === 'classes' && (
                 <select className="form-control form-control-sm mb-3" style={{background:'#f7f9ff', borderColor:'#5d78ff', color:'#5d78ff', fontWeight:'600'}} value={subFilterId} onChange={onSubFilterIdChange}>
                   {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               )}
               {activeTab === 'routes' && (
                 <select className="form-control form-control-sm mb-3" style={{background:'#f7f9ff', borderColor:'#5d78ff', color:'#5d78ff', fontWeight:'600'}} value={subFilterId} onChange={onSubFilterIdChange}>
                   {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                 </select>
               )}

               {/* Search Bar */}
               <div className="kt-input-icon kt-input-icon--right">
                  <input type="text" className="form-control" placeholder="Search loaded contacts..." value={searchTerm} onChange={onSearchChange} />
                  <span className="kt-input-icon__icon kt-input-icon__icon--right"><span><i className="la la-search"></i></span></span>
               </div>
            </div>

            {/* 2. Recipient List */}
            <div className="kt-portlet__body flex-grow-1 d-flex flex-column pt-2" style={{overflow:'hidden'}}>
               <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="kt-checkbox kt-checkbox--brand mb-0 font-weight-bold text-muted small">
                      <input type="checkbox" checked={allOnPageSelected} onChange={e => onSelectAll(e.target.checked)} disabled={displayList.length === 0} />
                      SELECT ALL
                      <span></span>
                  </label>
                  <span className="badge badge-light text-muted">
                    {displayList.length} {activeTab === 'parents' ? `of ${totalCount}` : ''} Loaded
                  </span>
               </div>

               <div className="custom-scroll flex-grow-1 pr-2" style={{overflowY: 'auto'}}>
                  {displayList.map(item => {
                    const isSelected = selectedIds.has(item.id);
                    const studentNames = item.students?.map(s => s.names).join(', ');

                    return (
                      <div 
                        key={item.id} 
                        className={`contact-card p-3 ${isSelected ? 'selected' : ''}`}
                        onClick={() => onSelectOne(item.id, !isSelected)}
                      >
                        <div className="d-flex align-items-start">
                          <div className="kt-user-card-v2__pic mr-3">
                              <span className={`kt-badge kt-badge--lg ${isSelected ? 'kt-badge--brand' : 'kt-badge--secondary'}`}>
                                {getInitials(item.name)}
                              </span>
                          </div>
                          <div className="flex-grow-1" style={{minWidth: 0}}>
                              <div className="d-flex justify-content-between">
                                <h6 className={`mb-1 ${isSelected ? 'text-primary' : 'text-dark'}`} style={{fontSize: '0.95rem', fontWeight: 600}}>
                                  {item.name}
                                </h6>
                                <label className="kt-checkbox kt-checkbox--single kt-checkbox--brand mb-0">
                                    <input type="checkbox" checked={isSelected} readOnly/>
                                    <span></span>
                                </label>
                              </div>
                              
                              {/* Display Child Names */}
                              {studentNames && (
                                <div className="text-muted small mb-1 text-truncate">
                                  <i className="la la-child mr-1" style={{opacity: 0.7}}></i>
                                  {studentNames}
                                </div>
                              )}
                              
                              {/* Display Masked Phone */}
                              <div className="small font-weight-bold d-flex align-items-center" style={{color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '0.5px'}}>
                                <i className="la la-mobile mr-1"></i>
                                {maskPhone(item.phone)}
                              </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Pagination / Load More UI */}
                  {isLoading && (
                     <div className="text-center py-3">
                        <div className="kt-spinner kt-spinner--brand kt-spinner--sm"></div>
                        <span className="ml-2 small text-muted">Loading contacts...</span>
                     </div>
                  )}

                  {!isLoading && hasMore && !searchTerm && (
                    <div className="load-more-container">
                       <button className="btn-load-more" onClick={onLoadMore}>
                         Load Next Batch <i className="la la-arrow-down ml-1"></i>
                       </button>
                    </div>
                  )}

                  {!isLoading && displayList.length === 0 && (
                    <div className="text-center p-5 text-muted">
                      <div className="mb-3"><i className="la la-search" style={{fontSize: '3rem', opacity: 0.3}}></i></div>
                      No recipients found.
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* ======================= RIGHT COLUMN: Composer & Preview ======================= */}
        <div className="col-lg-7 col-xl-8 d-flex flex-column">
          <div className="kt-portlet kt-portlet--height-fluid mb-0">
            <div className="kt-portlet__body h-100 d-flex flex-column">
              
              {/* 1. Composer Tools */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                 <h3 className="kt-portlet__head-title text-dark m-0">Compose Message</h3>
                 <div className="btn-group">
                    <button onClick={() => onMessageTypeChange('sms')} className={`btn btn-sm btn-bold ${messageType === 'sms' ? 'btn-label-brand' : 'btn-secondary'}`}>
                      <i className="la la-comment"></i> SMS
                    </button>
                    <button onClick={() => onMessageTypeChange('email')} className={`btn btn-sm btn-bold ${messageType === 'email' ? 'btn-label-brand' : 'btn-secondary'}`}>
                      <i className="la la-envelope"></i> Email
                    </button>
                 </div>
              </div>

              <div className="row flex-grow-1">
                {/* Editor Area */}
                <div className="col-md-7 d-flex flex-column">
                   <div className="form-group flex-grow-1 d-flex flex-column">
                      <div className="mb-2">
                        <span className="text-muted small text-uppercase font-weight-bold mr-2">Quick Variables:</span>
                        <span className="var-chip" onClick={() => insertVariable('{{recipient.name}}')}>Parent Name</span>
                        <span className="var-chip" onClick={() => insertVariable("{{fallback student.names 'your child'}}")}>Student Name</span>
                      </div>
                      
                      <textarea 
                        ref={textareaRef}
                        className="form-control flex-grow-1 p-3" 
                        style={{border: '1px solid #ebedf2', resize: 'none', borderRadius: '8px', fontSize: '1rem', lineHeight: '1.5'}}
                        placeholder="Type your message here..."
                        value={messageTemplate}
                        onChange={onMessageChange}
                      ></textarea>
                      
                      <div className="d-flex justify-content-between mt-2 text-muted small">
                        <span>{messageTemplate.length} characters</span>
                        {messageType === 'sms' && <span>approx {Math.ceil(messageTemplate.length / 160)} SMS parts</span>}
                      </div>
                   </div>
                   
                   <div className="mt-auto pt-3 border-top">
                      <button 
                        type="button" 
                        className={`btn btn-brand btn-block btn-lg btn-elevate ${isSending ? 'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light' : ''}`} 
                        onClick={onSend} 
                        disabled={selectedIds.size === 0 || isSending}
                        style={{fontWeight: 600, letterSpacing: '0.5px'}}
                      >
                        SEND TO {selectedIds.size} RECIPIENT(S)
                      </button>
                   </div>
                </div>

                {/* Live Preview Area */}
                <div className="col-md-5 d-flex align-items-center justify-content-center border-left">
                    <div className="phone-mockup">
                       <div className="phone-header">
                         <i className="la la-signal mr-2"></i>
                         {previewRecipient ? maskPhone(previewRecipient.phone) : 'Unknown'}
                       </div>
                       <div className="phone-body custom-scroll">
                          <div className="text-center small text-muted mb-3">
                             Today {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div className="msg-bubble">
                             {preview}
                             <span className="msg-meta">Now</span>
                          </div>
                       </div>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default MessageView;