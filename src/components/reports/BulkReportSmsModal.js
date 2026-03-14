import React, { useState, useMemo, useEffect } from 'react';
import Data from '../../utils/data';

/**
 * BulkReportSmsModal
 * 
 * A shared component for reviewing and editing a batch of SMS messages before sending.
 * Used for both Results Matrix and Fees Management.
 * 
 * Props:
 * - show: boolean
 * - onClose: function
 * - title: string (e.g., "Bulk Results SMS")
 * - recipients: Array<{ id, name, phone, message, studentNames }>
 * - onSend: function(finalMessages)
 */

const BulkReportSmsModal = ({ show, onClose, title, recipients = [], onSend }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [edits, setEdits] = useState({}); // { id: overridenMessage }
    const [schoolBalance, setSchoolBalance] = useState(0);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const unsub = Data.schools.subscribe(({ selectedSchool }) => {
            if (selectedSchool?.financial) {
                setSchoolBalance(selectedSchool.financial.balance || 0);
            }
        });
        return () => unsub();
    }, []);

    const filteredRecipients = useMemo(() => {
        if (!searchTerm) return recipients;
        return recipients.filter(r => 
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (r.studentNames && r.studentNames.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [recipients, searchTerm]);

    const activeRecipient = filteredRecipients[selectedIndex] || filteredRecipients[0];

    const getMessage = (recipient) => {
        return edits[recipient.id] !== undefined ? edits[recipient.id] : recipient.message;
    };

    const handleMessageChange = (id, newMessage) => {
        setEdits(prev => ({ ...prev, [id]: newMessage }));
    };

    // Calculations
    const COST_PER_SMS = 2.0;
    const CHARS_PER_SEGMENT = 160;

    const campaignStats = useMemo(() => {
        let totalSegments = 0;
        recipients.forEach(r => {
            const msg = getMessage(r);
            const segments = Math.ceil((msg.length || 1) / CHARS_PER_SEGMENT);
            totalSegments += segments;
        });
        const totalCost = totalSegments * COST_PER_SMS;
        return { totalSegments, totalCost };
    }, [recipients, edits]);

    const handleConfirmSend = async () => {
        const finalMessages = recipients.map(r => ({
            id: r.id,
            phone: r.phone,
            message: getMessage(r)
        }));
        
        setIsSending(true);
        try {
            await onSend(finalMessages);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSending(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', height: '80vh' }}>
                    
                    {/* Header */}
                    <div className="modal-header bg-white px-8 py-5 border-bottom">
                        <div className="d-flex align-items-center">
                            <div className="symbol symbol-40 symbol-light-primary mr-4">
                                <span className="symbol-label"><i className="flaticon2-sms text-primary"></i></span>
                            </div>
                            <div>
                                <h5 className="modal-title font-weight-bolder text-dark">{title || 'Bulk Message Review'}</h5>
                                <span className="text-muted font-weight-bold font-size-sm">Review and edit {recipients.length} messages</span>
                            </div>
                        </div>
                        <button type="button" className="close" onClick={onClose}>
                            <i className="ki ki-close"></i>
                        </button>
                    </div>

                    <div className="modal-body p-0 d-flex flex-grow-1 overflow-hidden">
                        
                        {/* Sidebar */}
                        <div className="col-3 bg-light border-right h-100 d-flex flex-column p-0">
                            <div className="p-4 bg-white border-bottom">
                                <div className="input-icon input-icon-right">
                                    <input 
                                        type="text" 
                                        className="form-control form-control-sm border-0 bg-light" 
                                        placeholder="Search parent/student..." 
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <span><i className="flaticon2-search-1 icon-sm text-muted"></i></span>
                                </div>
                            </div>
                            <div className="flex-grow-1 overflow-auto custom-scroll">
                                {filteredRecipients.map((r, idx) => (
                                    <div 
                                        key={r.id}
                                        className={`px-6 py-4 border-bottom cursor-pointer transition-all ${activeRecipient?.id === r.id ? 'bg-white border-left-4 border-left-primary shadow-sm' : 'hover-bg-white'}`}
                                        onClick={() => setSelectedIndex(idx)}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div style={{ minWidth: 0 }}>
                                                <div className="font-weight-bolder text-dark-75 text-truncate" style={{ fontSize: '0.9rem' }}>{r.name}</div>
                                                <div className="text-muted font-size-xs text-truncate">Child: {r.studentNames}</div>
                                            </div>
                                            {edits[r.id] !== undefined && (
                                                <span className="label label-xs label-light-warning label-inline">Edited</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {filteredRecipients.length === 0 && (
                                    <div className="p-8 text-center text-muted small">No recipients found</div>
                                )}
                            </div>
                        </div>

                        {/* Main Editor */}
                        <div className="col-9 h-100 d-flex flex-column bg-white p-8">
                            {activeRecipient ? (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-6">
                                        <div>
                                            <h4 className="font-weight-bolder text-dark mb-1">{activeRecipient.name}</h4>
                                            <div className="text-primary font-weight-bold">{activeRecipient.phone}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-muted font-size-sm mb-1">Character Count</div>
                                            <div className="font-weight-bolder h4 m-0">{getMessage(activeRecipient).length}</div>
                                        </div>
                                    </div>

                                    <div className="form-group flex-grow-1 d-flex flex-column m-0">
                                        <label className="font-weight-bold text-muted small text-uppercase mb-3">Message Content</label>
                                        <textarea 
                                            className="form-control border-0 bg-light p-6 flex-grow-1" 
                                            style={{ resize: 'none', borderRadius: '12px', fontSize: '1.1rem', lineHeight: '1.6' }}
                                            value={getMessage(activeRecipient)}
                                            onChange={(e) => handleMessageChange(activeRecipient.id, e.target.value)}
                                            placeholder="Type message here..."
                                        ></textarea>
                                        <div className="mt-4 d-flex align-items-center justify-content-between bg-light-warning px-4 py-2 rounded">
                                            <span className="text-warning-75 font-size-sm font-weight-bold">
                                                <i className="flaticon-info text-warning mr-2"></i>
                                                This message will use {Math.ceil(getMessage(activeRecipient).length / 160)} SMS segment(s).
                                            </span>
                                            {edits[activeRecipient.id] !== undefined && (
                                                <button className="btn btn-xs btn-text-warning hover-btn-warning font-weight-bold" onClick={() => {
                                                    const newEdits = { ...edits };
                                                    delete newEdits[activeRecipient.id];
                                                    setEdits(newEdits);
                                                }}>Reset to Default</button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                                    <i className="flaticon2-group icon-4x opacity-20 mb-4"></i>
                                    <p>Select a recipient from the sidebar to review their message</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer bg-light px-8 py-4 border-top d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div className="d-flex flex-column mr-8">
                                <span className="text-muted font-size-sm font-weight-bold">Total Recipients</span>
                                <span className="font-weight-bolder font-size-h6">{recipients.length}</span>
                            </div>
                            <div className="d-flex flex-column mr-8">
                                <span className="text-muted font-size-sm font-weight-bold">Total Segments</span>
                                <span className="font-weight-bolder font-size-h6">{campaignStats.totalSegments}</span>
                            </div>
                            <div className="d-flex flex-column mr-8">
                                <span className="text-muted font-size-sm font-weight-bold">Estimated Cost</span>
                                <span className="font-weight-bolder font-size-h6 text-primary">KES {campaignStats.totalCost.toFixed(2)}</span>
                            </div>
                            <div className={`d-flex flex-column px-4 py-1 rounded ${schoolBalance < campaignStats.totalCost ? 'bg-light-danger' : 'bg-light-success'}`}>
                                <span className={`${schoolBalance < campaignStats.totalCost ? 'text-danger' : 'text-success'} font-size-sm font-weight-bold`}>Balance</span>
                                <span className={`font-weight-bolder font-size-sm ${schoolBalance < campaignStats.totalCost ? 'text-danger' : 'text-success'}`}>KES {schoolBalance.toFixed(2)}</span>
                            </div>
                        </div>

                        <div>
                            <button type="button" className="btn btn-light-danger font-weight-bold mr-3" onClick={onClose} disabled={isSending}>Cancel</button>
                            <button 
                                type="button" 
                                className={`btn btn-primary font-weight-bold px-10 ${isSending ? 'spinner spinner-white spinner-right' : ''}`}
                                onClick={handleConfirmSend}
                                disabled={isSending || recipients.length === 0}
                            >
                                {isSending ? 'Sending...' : `Send to ${recipients.length} Parents`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #e4e6ef; border-radius: 4px; }
                .hover-bg-white:hover { background: #ffffff !important; }
                .border-left-4 { border-left-width: 4px !important; }
            `}</style>
        </div>
    );
};

export default BulkReportSmsModal;
