import React, { useState, useEffect, useMemo } from 'react';
import Handlebars from 'handlebars';

const STYLES = `
  .report-card {
    border: 1px solid #ebedf2;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    background: #fff;
    transition: all 0.2s;
  }
  .report-card:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .report-card.selected {
    border-color: #fca5a5; /* Light red border */
    background-color: #fff5f5; /* Very light red bg */
  }
  .msg-preview-bubble {
    background-color: #f3f6f9;
    border-radius: 6px;
    padding: 10px;
    font-size: 0.9rem;
    color: #595d6e;
    border-left: 3px solid #d1d5db;
    margin-top: 8px;
    font-style: italic;
  }
  .error-badge {
    display: inline-flex;
    align-items: center;
    color: #fd397a;
    font-weight: 600;
    font-size: 0.85rem;
    margin-top: 8px;
  }
`;

const DeliveryReportModal = ({ 
    isOpen, 
    onClose, 
    isLoading, 
    reportData, 
    onRetry,
    recipientMap, 
    messageTemplate 
}) => {
    const [retrySelection, setRetrySelection] = useState(new Set());
    
    // BUG FIX: State to hold failures that were NOT selected for retry, 
    // so they are merged back in when the new result arrives.
    const [ignoredFailures, setIgnoredFailures] = useState([]);

    // 1. Reset everything when modal opens/closes cleanly
    useEffect(() => {
        if (!isOpen) {
            setRetrySelection(new Set());
            setIgnoredFailures([]);
        }
    }, [isOpen]);

    // 2. Combine current report failures with previously ignored failures
    const displayFailures = useMemo(() => {
        if (!reportData) return [];
        
        // Start with new failures from the latest API call
        const currentFailures = reportData.failedSends || [];
        
        // Merge with ignored failures (prevent duplicates just in case)
        const combined = [...currentFailures];
        
        ignoredFailures.forEach(oldFail => {
            if (!combined.find(f => f.parentId === oldFail.parentId)) {
                combined.push(oldFail);
            }
        });

        return combined;
    }, [reportData, ignoredFailures]);

    // 3. Auto-select ONLY the *new* failures when data arrives (optional UX choice)
    // Or we can just select all. Let's select all displayed failures for convenience.
    useEffect(() => {
        if (displayFailures.length > 0) {
            // Logic: If we just finished loading, re-select all failures
            if (!isLoading) {
                 setRetrySelection(new Set(displayFailures.map(f => f.parentId)));
            }
        }
    }, [displayFailures.length, isLoading]); // Dependency on length ensures it runs when list changes

    // --- HANDLERS ---

    const toggleRetryItem = (id) => {
        const newSet = new Set(retrySelection);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setRetrySelection(newSet);
    };

    const handleRetryClick = () => {
        // 1. Identify which failures are currently on screen but NOT selected
        const unselected = displayFailures.filter(f => !retrySelection.has(f.parentId));
        
        // 2. Store them so they reappear after the API call finishes
        setIgnoredFailures(unselected);

        // 3. Trigger the retry action
        onRetry(Array.from(retrySelection));
    };

    // --- HELPERS ---

    const getMessageContent = (id) => {
        const recipient = recipientMap.get(id);
        if (!recipient) return '...';
        try {
            const template = Handlebars.compile(messageTemplate || '');
            const context = {
                recipient: recipient,
                parent: recipient,
                student: recipient.students?.[0] || { names: 'Student' }
            };
            return template(context);
        } catch (e) { return 'Error generating preview'; }
    };

    const getName = (id) => {
        const user = recipientMap.get(id);
        return user ? user.name : 'Unknown';
    };

    // Calculate totals for the summary view
    const totalSuccess = (reportData?.successfulSends?.length || 0); 
    // Note: totalSuccess resets on every retry because the API returns only the latest batch results. 
    // Use this as "Successes in this batch".

    if (!isOpen) return null;

    return (
        <>
            <style>{STYLES}</style>
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        
                        {/* Header */}
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title font-weight-bold">
                                {isLoading ? 'Sending Messages...' : 'Delivery Report'}
                            </h5>
                            {!isLoading && (
                                <button type="button" className="close" onClick={onClose}>
                                    <span>&times;</span>
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="modal-body bg-light" style={{ minHeight: '300px' }}>
                            
                            {isLoading ? (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5">
                                    <div className="kt-spinner kt-spinner--v2 kt-spinner--lg kt-spinner--brand"></div>
                                    <h6 className="mt-4 text-muted font-weight-bold">Dispatching to provider...</h6>
                                    <p className="text-muted small">Please wait while we process the queue.</p>
                                </div>
                            ) : (
                                <div className="report-content">
                                    
                                    {/* 1. Summary Section */}
                                    <div className="row mb-4">
                                        <div className="col-6">
                                            <div className="bg-white rounded p-3 border border-success d-flex align-items-center shadow-sm">
                                                <span className="kt-badge kt-badge--success kt-badge--lg mr-3">
                                                    <i className="la la-check font-weight-bold" style={{fontSize: '1.2rem'}}></i>
                                                </span>
                                                <div>
                                                    <h3 className="m-0 font-weight-bold text-success">{totalSuccess}</h3>
                                                    <small className="text-muted text-uppercase font-weight-bold">Sent Successfully</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className={`bg-white rounded p-3 border d-flex align-items-center shadow-sm ${displayFailures.length > 0 ? 'border-danger' : 'border-secondary'}`}>
                                                <span className={`kt-badge kt-badge--lg mr-3 ${displayFailures.length > 0 ? 'kt-badge--danger' : 'kt-badge--secondary'}`}>
                                                    <i className="la la-exclamation-triangle font-weight-bold" style={{fontSize: '1.2rem'}}></i>
                                                </span>
                                                <div>
                                                    <h3 className={`m-0 font-weight-bold ${displayFailures.length > 0 ? 'text-danger' : 'text-muted'}`}>{displayFailures.length}</h3>
                                                    <small className="text-muted text-uppercase font-weight-bold">Failed Deliveries</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Failure List Section */}
                                    {displayFailures.length > 0 ? (
                                        <div className="fade-in">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="text-dark font-weight-bold m-0">
                                                    Review Failed Messages
                                                </h6>
                                                <label className="kt-checkbox kt-checkbox--brand mb-0 small">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={retrySelection.size > 0 && retrySelection.size === displayFailures.length}
                                                        onChange={(e) => {
                                                            if(e.target.checked) setRetrySelection(new Set(displayFailures.map(f => f.parentId)));
                                                            else setRetrySelection(new Set());
                                                        }}
                                                    />
                                                    Select All for Retry
                                                    <span></span>
                                                </label>
                                            </div>

                                            <div className="pr-1" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                                {displayFailures.map((fail, idx) => (
                                                    <div 
                                                        key={`${fail.parentId}_${idx}`} 
                                                        className={`report-card ${retrySelection.has(fail.parentId) ? 'selected' : ''}`}
                                                        onClick={() => toggleRetryItem(fail.parentId)}
                                                        style={{cursor: 'pointer'}}
                                                    >
                                                        <div className="d-flex align-items-start">
                                                            {/* Checkbox */}
                                                            <div className="mr-3 mt-1">
                                                                <label className="kt-checkbox kt-checkbox--danger">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={retrySelection.has(fail.parentId)} 
                                                                        readOnly 
                                                                    />
                                                                    <span></span>
                                                                </label>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between">
                                                                    <div>
                                                                        <span className="font-weight-bold text-dark">{getName(fail.parentId)}</span>
                                                                        <span className="text-muted small ml-2 font-monospace">{fail.phone}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Message Bubble */}
                                                                <div className="msg-preview-bubble">
                                                                    "{getMessageContent(fail.parentId)}"
                                                                </div>

                                                                {/* Error Text */}
                                                                <div className="error-badge">
                                                                    <i className="la la-times-circle mr-1"></i>
                                                                    {fail.error}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5 bg-white rounded shadow-sm border border-light">
                                            <div className="mb-3">
                                                <span className="kt-badge kt-badge--success kt-badge--inline kt-badge--pill kt-badge--unified-success" style={{height: '60px', width: '60px'}}>
                                                     <i className="la la-check" style={{fontSize: '2.5rem'}}></i>
                                                </span>
                                            </div>
                                            <h5 className="text-dark font-weight-bold">Great Job!</h5>
                                            <p className="text-muted">All messages in this batch have been processed successfully.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {!isLoading && (
                            <div className="modal-footer border-top-0 pt-0 bg-light pb-3 pr-4">
                                <button type="button" className="btn btn-secondary btn-wide" onClick={onClose}>
                                    Close
                                </button>
                                {displayFailures.length > 0 && (
                                    <button 
                                        type="button" 
                                        className="btn btn-danger btn-elevate btn-wide font-weight-bold" 
                                        onClick={(e) => { e.stopPropagation(); handleRetryClick(); }}
                                        disabled={retrySelection.size === 0}
                                    >
                                        <i className="la la-refresh"></i> 
                                        Retry Selected ({retrySelection.size})
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeliveryReportModal;