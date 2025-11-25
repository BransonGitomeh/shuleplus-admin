import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Handlebars from 'handlebars';
import Data from '../../../utils/data';

// --- HANDLEBARS HELPERS ---
Handlebars.registerHelper("fallback", (value, fallback) => {
    return value ? new Handlebars.SafeString(value) : fallback;
});

// --- STYLES ---
const STYLES = `
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

  /* Phone Preview Simulator */
  .phone-mockup {
    background: #fff;
    border: 12px solid #2d3436;
    border-radius: 30px;
    height: 520px;
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
  }
  .phone-header {
    background: #f7f7f7;
    padding: 12px;
    border-bottom: 1px solid #eee;
    text-align: center;
    font-size: 0.8rem;
    color: #888;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .phone-body {
    background: #e5e5f7;
    flex-grow: 1;
    padding: 15px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* Items start from top */
  }
  .msg-bubble-container {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .msg-recipient-label {
    font-size: 0.65rem;
    color: #888;
    margin-bottom: 2px;
    margin-right: 4px;
    font-weight: 600;
  }
  .msg-bubble {
    background: #fff;
    padding: 10px 14px;
    border-radius: 18px 18px 4px 18px;
    font-size: 0.85rem;
    line-height: 1.4;
    color: #333;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    max-width: 100%;
    white-space: pre-wrap;
    text-align: left;
  }
`;

// --- HELPER: Mask Phone ---
const maskPhone = (phone) => {
  if (!phone) return '';
  const p = phone.toString().replace(/\D/g, '');
  if (p.length < 7) return p;
  return `${p.slice(0, 4)}***${p.slice(-3)}`;
};

// --- COMPONENT: Delivery Report Modal ---
const DeliveryReportModal = ({ isOpen, onClose, isLoading, reportData, onRetry, recipientMap }) => {
    const [retrySelection, setRetrySelection] = useState(new Set());

    useEffect(() => {
        if (reportData && reportData.failedSends) {
            setRetrySelection(new Set(reportData.failedSends.map(f => f.parentId)));
        }
    }, [reportData]);

    if (!isOpen) return null;

    const toggleRetryItem = (id) => {
        const newSet = new Set(retrySelection);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setRetrySelection(newSet);
    };

    const getName = (id) => {
        const user = recipientMap.get(id);
        return user ? user.name : 'Unknown';
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{isLoading ? 'Sending Messages...' : 'Delivery Report'}</h5>
                        {!isLoading && <button type="button" className="close" onClick={onClose}><span>&times;</span></button>}
                    </div>
                    <div className="modal-body" style={{ minHeight: '200px' }}>
                        {isLoading ? (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5">
                                <div className="kt-spinner kt-spinner--v2 kt-spinner--lg kt-spinner--brand"></div>
                                <h6 className="mt-4 text-muted">Dispatching to provider...</h6>
                            </div>
                        ) : (
                            <div className="report-content">
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <div className="alert alert-solid-success alert-bold mb-0">
                                            <div className="alert-text">
                                                <h6 className="mb-0">Successful</h6>
                                                <span className="display-4 font-weight-bold">{reportData.successfulSends.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className={`alert alert-solid-${reportData.failedSends.length > 0 ? 'danger' : 'secondary'} alert-bold mb-0`}>
                                            <div className="alert-text">
                                                <h6 className="mb-0">Failed</h6>
                                                <span className="display-4 font-weight-bold">{reportData.failedSends.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {reportData.failedSends.length > 0 ? (
                                    <div>
                                        <h6 className="text-danger font-weight-bold mb-3 border-bottom pb-2">Failed Deliveries ({reportData.failedSends.length})</h6>
                                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <table className="table table-head-bg-brand table-hover">
                                                <thead>
                                                    <tr>
                                                        <th style={{width: '50px'}}>
                                                            <label className="kt-checkbox kt-checkbox--single kt-checkbox--solid">
                                                                <input type="checkbox" checked={retrySelection.size === reportData.failedSends.length}
                                                                    onChange={(e) => setRetrySelection(e.target.checked ? new Set(reportData.failedSends.map(f => f.parentId)) : new Set())} />
                                                                <span></span>
                                                            </label>
                                                        </th>
                                                        <th>Recipient</th>
                                                        <th>Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.failedSends.map((fail, idx) => (
                                                        <tr key={idx} className={retrySelection.has(fail.parentId) ? 'bg-light-danger' : ''}>
                                                            <td>
                                                                <label className="kt-checkbox kt-checkbox--single kt-checkbox--danger">
                                                                    <input type="checkbox" checked={retrySelection.has(fail.parentId)} onChange={() => toggleRetryItem(fail.parentId)} />
                                                                    <span></span>
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <div className="font-weight-bold">{getName(fail.parentId)}</div>
                                                                <div className="small text-muted monospace">{fail.phone}</div>
                                                            </td>
                                                            <td className="text-danger small">{fail.error}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="la la-check-circle text-success" style={{fontSize: '4rem'}}></i>
                                        <h5 className="mt-3 text-success">All Sent Successfully!</h5>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {!isLoading && (
                        <div className="modal-footer bg-light">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                            {reportData.failedSends.length > 0 && (
                                <button type="button" className="btn btn-danger btn-elevate" onClick={() => onRetry(Array.from(retrySelection))} disabled={retrySelection.size === 0}>
                                    <i className="la la-refresh"></i> Retry ({retrySelection.size})
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: Message View (Presenter) ---
const MessageView = (props) => {
  const {
    activeTab, onTabChange, subFilterId, onSubFilterIdChange, searchTerm, onSearchChange,
    classes, routes, displayList, totalCount, isLoading, hasMore, onLoadMore,
    selectedIds, onSelectAll, onSelectOne,
    messageTemplate, onMessageChange, messageType, onMessageTypeChange,
    onSend,
  } = props;

  const textareaRef = useRef(null);
  const [previewMessages, setPreviewMessages] = useState([]);

  // Logic: Auto-select first option for subfilters
  useEffect(() => {
    if (activeTab === 'classes' && !subFilterId && classes.length > 0) onSubFilterIdChange({ target: { value: classes[0].id } });
    if (activeTab === 'routes' && !subFilterId && routes.length > 0) onSubFilterIdChange({ target: { value: routes[0].id } });
  }, [activeTab, classes, routes, subFilterId, onSubFilterIdChange]);

  // Logic: Generate All Previews based on Selection
  useEffect(() => {
    if (selectedIds.size === 0) {
        setPreviewMessages([]);
        return;
    }

    try {
        const template = Handlebars.compile(messageTemplate || ' ');
        // Filter the displayList to find the full objects of selected IDs
        const selectedRecipients = displayList.filter(item => selectedIds.has(item.id));
        
        const previews = selectedRecipients.map(recipient => {
            const context = {
                recipient: recipient,
                parent: recipient, // alias
                student: recipient.students?.[0] || { names: 'Student' }
            };
            return {
                id: recipient.id,
                name: recipient.name,
                phone: recipient.phone,
                text: template(context)
            };
        });
        setPreviewMessages(previews);
    } catch (error) {
        setPreviewMessages([{ id: 'err', text: "Template Error" }]);
    }
  }, [messageTemplate, selectedIds, displayList]);

  const insertVariable = (varCode) => {
    const field = textareaRef.current;
    if (field) {
      const startPos = field.selectionStart;
      const endPos = field.selectionEnd;
      const text = messageTemplate;
      const newText = text.substring(0, startPos) + varCode + text.substring(endPos);
      onMessageChange({ target: { value: newText } });
      setTimeout(() => { field.focus(); field.setSelectionRange(startPos + varCode.length, startPos + varCode.length); }, 0);
    }
  };

  const getInitials = (name = '') => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const allOnPageSelected = displayList.length > 0 && displayList.every(item => selectedIds.has(item.id));

  return (
    <>
      <style>{STYLES}</style>
      <div className="row h-100">
        
        {/* === LEFT COLUMN: Audience === */}
        <div className="col-lg-5 col-xl-4 d-flex flex-column" style={{maxHeight: '85vh'}}>
          <div className="kt-portlet kt-portlet--height-fluid flex-grow-1 d-flex flex-column mb-0">
            <div className="kt-portlet__head kt-portlet__head--noborder pb-0">
              <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title text-dark">Select Audience</h3></div>
            </div>
            
            <div className="px-4 pb-2">
               <div className="btn-group btn-group-sm w-100 mb-3" role="group">
                  {[{ id: 'parents', label: 'All Parents' }, { id: 'classes', label: 'By Class' }, { id: 'routes', label: 'By Route' }, { id: 'staff', label: 'Staff' }].map(tab => (
                    <button key={tab.id} type="button" className={`btn ${activeTab === tab.id ? 'btn-brand' : 'btn-outline-secondary'}`} onClick={() => onTabChange(tab.id)}>{tab.label}</button>
                  ))}
               </div>
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
               <div className="kt-input-icon kt-input-icon--right">
                  <input type="text" className="form-control" placeholder="Search..." value={searchTerm} onChange={onSearchChange} />
                  <span className="kt-input-icon__icon kt-input-icon__icon--right"><span><i className="la la-search"></i></span></span>
               </div>
            </div>

            <div className="kt-portlet__body flex-grow-1 d-flex flex-column pt-2" style={{overflow:'hidden'}}>
               <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="kt-checkbox kt-checkbox--brand mb-0 font-weight-bold text-muted small">
                      <input type="checkbox" checked={allOnPageSelected} onChange={e => onSelectAll(e.target.checked)} disabled={displayList.length === 0} />
                      SELECT ALL
                      <span></span>
                  </label>
                  <span className="badge badge-light text-muted">{displayList.length} {activeTab === 'parents' ? `of ${totalCount}` : ''} Loaded</span>
               </div>

               <div className="custom-scroll flex-grow-1 pr-2" style={{overflowY: 'auto'}}>
                  {displayList.map(item => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <div key={item.id} className={`contact-card p-3 ${isSelected ? 'selected' : ''}`} onClick={() => onSelectOne(item.id, !isSelected)}>
                        <div className="d-flex align-items-start">
                          <div className="kt-user-card-v2__pic mr-3">
                              <span className={`kt-badge kt-badge--lg ${isSelected ? 'kt-badge--brand' : 'kt-badge--secondary'}`}>{getInitials(item.name)}</span>
                          </div>
                          <div className="flex-grow-1" style={{minWidth: 0}}>
                              <div className="d-flex justify-content-between">
                                <h6 className={`mb-1 ${isSelected ? 'text-primary' : 'text-dark'}`} style={{fontSize: '0.95rem', fontWeight: 600}}>{item.name}</h6>
                                <label className="kt-checkbox kt-checkbox--single kt-checkbox--brand mb-0"><input type="checkbox" checked={isSelected} readOnly/><span></span></label>
                              </div>
                              <div className="small font-weight-bold d-flex align-items-center" style={{color: '#9CA3AF', fontFamily: 'monospace'}}>{maskPhone(item.phone)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && <div className="text-center py-3"><div className="kt-spinner kt-spinner--brand kt-spinner--sm"></div></div>}
                  {!isLoading && hasMore && !searchTerm && (
                    <div className="load-more-container">
                       <button className="btn-load-more" onClick={onLoadMore}>Load Next Batch</button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: Composer & Multi-Preview === */}
        <div className="col-lg-7 col-xl-8 d-flex flex-column">
          <div className="kt-portlet kt-portlet--height-fluid mb-0">
            <div className="kt-portlet__body h-100 d-flex flex-column">
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                 <h3 className="kt-portlet__head-title text-dark m-0">Compose Message</h3>
                 <div className="btn-group">
                    <button onClick={() => onMessageTypeChange('sms')} className={`btn btn-sm btn-bold ${messageType === 'sms' ? 'btn-label-brand' : 'btn-secondary'}`}>SMS</button>
                    <button onClick={() => onMessageTypeChange('email')} className={`btn btn-sm btn-bold ${messageType === 'email' ? 'btn-label-brand' : 'btn-secondary'}`}>Email</button>
                 </div>
              </div>

              <div className="row flex-grow-1">
                {/* Editor */}
                <div className="col-md-7 d-flex flex-column">
                   <div className="form-group flex-grow-1 d-flex flex-column">
                      <div className="mb-2">
                        <span className="text-muted small text-uppercase font-weight-bold mr-2">Variables:</span>
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
                        <span>{messageTemplate.length} chars</span>
                        {messageType === 'sms' && <span>~{Math.ceil(messageTemplate.length / 160)} SMS parts</span>}
                      </div>
                   </div>
                   <div className="mt-auto pt-3 border-top">
                      <button type="button" className="btn btn-brand btn-block btn-lg btn-elevate" 
                        onClick={onSend} disabled={selectedIds.size === 0} style={{fontWeight: 600}}>
                        SEND TO {selectedIds.size} RECIPIENT(S)
                      </button>
                   </div>
                </div>

                {/* Multi-Preview Scrollable Phone */}
                <div className="col-md-5 d-flex align-items-center justify-content-center border-left">
                    <div className="phone-mockup">
                       <div className="phone-header">
                         <span><i className="la la-signal mr-1"></i> Preview</span>
                         <span className="badge badge-secondary">{previewMessages.length} Msgs</span>
                       </div>
                       <div className="phone-body custom-scroll">
                          {previewMessages.length === 0 ? (
                              <div className="text-center text-muted mt-5">
                                  <i className="la la-user-plus" style={{fontSize: '2rem', opacity: 0.5}}></i>
                                  <p className="small mt-2">Select recipients to see message preview</p>
                              </div>
                          ) : (
                              previewMessages.map((msg) => (
                                  <div key={msg.id} className="msg-bubble-container">
                                      <div className="msg-recipient-label">{msg.name} ({maskPhone(msg.phone)})</div>
                                      <div className="msg-bubble">
                                          {msg.text}
                                      </div>
                                  </div>
                              ))
                          )}
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

// --- MAIN CONTAINER ---
export default function MessageComposer() {
  // Core Data
  const [classes, setClasses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // Recipient List State
  const [displayList, setDisplayList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const ROWS_PER_PAGE = 50;
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState('parents'); 
  const [subFilterId, setSubFilterId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Message State
  const [messageTemplate, setMessageTemplate] = useState("Hello {{recipient.name}},\n\nThis is a message regarding {{fallback student.names 'your child'}}.");
  const [messageType, setMessageType] = useState('sms');

  // Modal State
  const [isSending, setIsSending] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const unsubClasses = Data.classes.subscribe(({ classes }) => { if(classes) setClasses(classes); });
    const unsubRoutes = Data.routes.subscribe(({ routes }) => { if(routes) setRoutes(routes); });
    const unsubTeachers = Data.teachers.subscribe(({ teachers }) => { if(teachers) setTeachers(teachers); });
    return () => { if(unsubClasses) unsubClasses(); if(unsubRoutes) unsubRoutes(); if(unsubTeachers) unsubTeachers(); };
  }, []);

  const fetchRecipients = useCallback(async (isLoadMore = false) => {
    setIsLoadingList(true);
    let newList = [];
    let newTotal = 0;
    try {
      if (activeTab === 'parents') {
        const result = await Data.parents.getPage({ page: isLoadMore ? page + 1 : 1, limit: ROWS_PER_PAGE });
        newList = result.parents;
        newTotal = result.totalCount;
        if (isLoadMore) {
          setDisplayList(prev => [...prev, ...newList]);
          setPage(prev => prev + 1);
        } else {
          setDisplayList(newList);
          setPage(1);
        }
        setHasMore((isLoadMore ? displayList.length + newList.length : newList.length) < newTotal);
        setTotalCount(newTotal);

      } else if (activeTab === 'classes' && subFilterId) {
        const targetClass = classes.find(c => c.id === subFilterId);
        if (targetClass && targetClass.students) {
           const uniqueParents = new Map();
           targetClass.students.forEach(student => {
              if (student.parent) uniqueParents.set(student.parent.id, { ...student.parent, students: [student] });
           });
           newList = Array.from(uniqueParents.values());
        }
        setDisplayList(newList);
        setHasMore(false);
        setTotalCount(newList.length);

      } else if (activeTab === 'routes' && subFilterId) {
        const targetRoute = routes.find(r => r.id === subFilterId);
        if (targetRoute && targetRoute.students) {
            const uniqueParents = new Map();
            targetRoute.students.forEach(student => {
                 if (student.parent) uniqueParents.set(student.parent.id, { ...student.parent, students: [student] });
            });
            newList = Array.from(uniqueParents.values());
        }
        setDisplayList(newList);
        setHasMore(false);
        setTotalCount(newList.length);

      } else if (activeTab === 'staff') {
        setDisplayList(teachers);
        setHasMore(false);
        setTotalCount(teachers.length);
      } else {
        setDisplayList([]);
        setHasMore(false);
      }
    } catch (e) { console.error("Error fetching recipients", e); } finally { setIsLoadingList(false); }
  }, [activeTab, subFilterId, page, classes, routes, teachers, displayList.length]);

  useEffect(() => {
    setSelectedIds(new Set());
    setPage(1);
    fetchRecipients(false); 
  }, [activeTab, subFilterId, classes, routes]); 

  const filteredList = useMemo(() => {
    if (!searchTerm) return displayList;
    return displayList.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.phone && item.phone.includes(searchTerm)));
  }, [displayList, searchTerm]);

  // Recipient Map for Modal to resolve IDs to Names
  const recipientMap = useMemo(() => {
    const map = new Map();
    displayList.forEach(item => map.set(item.id, item));
    return map;
  }, [displayList]);

  // Handlers
  const handleLoadMore = () => fetchRecipients(true);

  const handleSelectAll = (isChecked) => {
    if (isChecked) setSelectedIds(new Set(filteredList.map(item => item.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectOne = (itemId, isChecked) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      isChecked ? newSet.add(itemId) : newSet.delete(itemId);
      return newSet;
    });
  };

  const performSend = async (idsToProcess) => {
    setIsSending(true);
    setReportData(null);
    try {
      const payload = {
        school: localStorage.getItem("school"),
        message: messageTemplate,
        parents: idsToProcess
      };
      const result = await Data.communication.sms.create(payload);
      setReportData(result.sms.send);
      setIsSending(false);
      // Only clear main selection if clean run (no failures) and not a retry subset
      if (result.sms.send.failedCount === 0 && idsToProcess.length === selectedIds.size) {
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error("Failed to send:", error);
      setIsSending(false);
      setReportData({
          success: false,
          successfulSends: [],
          failedSends: idsToProcess.map(id => ({ parentId: id, phone: 'Unknown', error: error.message || 'System Error' }))
      });
    }
  };

  const handleSend = () => {
    if (selectedIds.size === 0) return alert("Please select recipients.");
    setShowReportModal(true);
    performSend(Array.from(selectedIds));
  };

  const handleRetry = (failedIds) => {
      performSend(failedIds);
  };

  return (
    <>
      <MessageView
        activeTab={activeTab}
        onTabChange={tab => { setActiveTab(tab); setSubFilterId(''); setSearchTerm(''); }}
        subFilterId={subFilterId}
        onSubFilterIdChange={e => setSubFilterId(e.target.value)}
        searchTerm={searchTerm}
        onSearchChange={e => setSearchTerm(e.target.value)}
        classes={classes}
        routes={routes}
        displayList={filteredList}
        totalCount={totalCount}
        isLoading={isLoadingList}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        messageTemplate={messageTemplate}
        onMessageChange={e => setMessageTemplate(e.target.value)}
        messageType={messageType}
        onMessageTypeChange={setMessageType}
        onSend={handleSend}
      />
      <DeliveryReportModal 
        isOpen={showReportModal}
        onClose={() => { setShowReportModal(false); setReportData(null); }}
        isLoading={isSending}
        reportData={reportData}
        onRetry={handleRetry}
        recipientMap={recipientMap}
        messageTemplate={messageTemplate} 
      />
    </>
  );
}