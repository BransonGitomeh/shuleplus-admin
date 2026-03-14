import React, { useState, useMemo, useEffect, useRef } from 'react';
import Data from '../../utils/data';
import MpesaPaymentModal from '../../pages/finance/deposit';

/**
 * BulkReportSmsModal
 * 
 * Props:
 * - show: boolean
 * - onClose: function
 * - title: string
 * - recipients: Array<{ id, name, phone, message, studentNames, parentId }>
 * - onSend: function(finalMessages)
 * - onSavePhone: optional function(parentId, newPhone) => Promise — if provided, save button appears
 */

const BulkReportSmsModal = ({ show, onClose, title, recipients = [], onSend, onSavePhone }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [edits, setEdits] = useState({});         // { id: overrideMessage }
    const [phoneEdits, setPhoneEdits] = useState({}); // { id: phone }
    const [savingPhone, setSavingPhone] = useState(null); // id of recipient being saved
    const [schoolBalance, setSchoolBalance] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const topUpModalRef = useRef(null);

    useEffect(() => {
        const unsub = Data.schools.subscribe(({ selectedSchool }) => {
            if (selectedSchool?.financial) {
                setSchoolBalance(selectedSchool.financial.balance || 0);
            }
        });
        return () => unsub();
    }, []);

    // Reset selection when modal opens
    useEffect(() => {
        if (show) {
            setSelectedIndex(0);
            setSearchTerm('');
        }
    }, [show]);

    const filteredRecipients = useMemo(() => {
        if (!searchTerm) return recipients;
        const lower = searchTerm.toLowerCase();
        return recipients.filter(r =>
            r.name.toLowerCase().includes(lower) ||
            (r.studentNames && r.studentNames.toLowerCase().includes(lower)) ||
            (r.phone && r.phone.includes(searchTerm))
        );
    }, [recipients, searchTerm]);

    const activeRecipient = filteredRecipients[selectedIndex] || filteredRecipients[0];

    const getPhone = (recipient) => {
        if (phoneEdits[recipient.id] !== undefined) return phoneEdits[recipient.id];
        return recipient.phone || '';
    };

    const getMessage = (recipient) => {
        return edits[recipient.id] !== undefined ? edits[recipient.id] : recipient.message;
    };

    const handleMessageChange = (id, newMessage) => {
        setEdits(prev => ({ ...prev, [id]: newMessage }));
    };

    const handlePhoneChange = (id, newPhone) => {
        setPhoneEdits(prev => ({ ...prev, [id]: newPhone }));
    };

    const handleSavePhone = async (recipient) => {
        const newPhone = getPhone(recipient);
        if (!onSavePhone || !newPhone) return;
        setSavingPhone(recipient.id);
        try {
            await onSavePhone(recipient.parentId || recipient.id, newPhone);
            if (window.toastr) window.toastr.success('Phone number saved!');
        } catch (e) {
            console.error(e);
            if (window.toastr) window.toastr.error('Failed to save phone number.');
        } finally {
            setSavingPhone(null);
        }
    };

    const COST_PER_SMS = 2.0;
    const CHARS_PER_SEGMENT = 160;

    // Only count recipients that have a phone for cost/sending
    const sendableRecipients = recipients.filter(r => getPhone(r));

    const campaignStats = useMemo(() => {
        let totalSegments = 0;
        sendableRecipients.forEach(r => {
            const msg = getMessage(r);
            const segments = Math.ceil((msg.length || 1) / CHARS_PER_SEGMENT);
            totalSegments += segments;
        });
        const totalCost = totalSegments * COST_PER_SMS;
        return { totalSegments, totalCost };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipients, edits, phoneEdits]);

    const handleConfirmSend = async () => {
        const finalMessages = sendableRecipients.map(r => ({
            id: r.id,
            phone: getPhone(r),
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

    const missingPhoneCount = recipients.filter(r => !getPhone(r)).length;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', height: '85vh', display: 'flex', flexDirection: 'column' }}>

                    {/* Header */}
                    <div className="modal-header bg-white px-8 py-5 border-bottom flex-shrink-0">
                        <div className="d-flex align-items-center">
                            <div className="symbol symbol-40 symbol-light-primary mr-4">
                                <span className="symbol-label"><i className="flaticon2-sms text-primary"></i></span>
                            </div>
                            <div>
                                <h5 className="modal-title font-weight-bolder text-dark">{title || 'Bulk Message Review'}</h5>
                                <span className="text-muted font-weight-bold font-size-sm">
                                    {recipients.length} recipients
                                    {missingPhoneCount > 0 && (
                                        <span className="text-warning ml-2">
                                            <i className="flaticon-warning text-warning mr-1"></i>
                                            {missingPhoneCount} missing phone
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                        <button type="button" className="close" onClick={onClose}>
                            <i className="ki ki-close"></i>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-0 d-flex overflow-hidden flex-grow-1" style={{ minHeight: 0 }}>

                        {/* Sidebar */}
                        <div style={{ width: '300px', flexShrink: 0 }} className="bg-light border-right h-100 d-flex flex-column">
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
                                {filteredRecipients.map((r, idx) => {
                                    const hasPhone = !!getPhone(r);
                                    const isActive = activeRecipient?.id === r.id;
                                    return (
                                        <div
                                            key={r.id}
                                            className={`px-5 py-4 border-bottom cursor-pointer ${isActive ? 'bg-white shadow-sm' : 'hover-bg-white'}`}
                                            style={{ borderLeft: isActive ? '4px solid #3699ff' : '4px solid transparent' }}
                                            onClick={() => setSelectedIndex(idx)}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div className="font-weight-bolder text-dark-75 text-truncate" style={{ fontSize: '0.9rem' }}>{r.name}</div>
                                                    <div className="text-muted font-size-xs text-truncate">{r.studentNames}</div>
                                                    {!hasPhone ? (
                                                        <span className="label label-xs label-light-danger label-inline mt-1">
                                                            <i className="flaticon-warning icon-xs mr-1"></i> No Phone
                                                        </span>
                                                    ) : (
                                                        <div className="text-muted font-size-xs">{getPhone(r)}</div>
                                                    )}
                                                </div>
                                                {edits[r.id] !== undefined && (
                                                    <span className="label label-xs label-light-warning label-inline ml-2">Edited</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredRecipients.length === 0 && (
                                    <div className="p-8 text-center text-muted small">No recipients found</div>
                                )}
                            </div>
                        </div>

                        {/* Main Editor */}
                        <div className="flex-grow-1 h-100 d-flex flex-column bg-white overflow-auto" style={{ padding: '24px', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
                            {activeRecipient ? (
                                <>
                                    {/* Recipient Info & Phone Edit */}
                                    <div className="d-flex justify-content-between align-items-start mb-6">
                                        <div className="flex-grow-1 mr-6">
                                            <h4 className="font-weight-bolder text-dark mb-3">{activeRecipient.name}</h4>
                                            <label className="font-weight-bold text-muted small text-uppercase mb-2 d-block">Parent Phone Number</label>
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="tel"
                                                    className={`form-control form-control-sm mr-3 ${!getPhone(activeRecipient) ? 'border-danger' : 'border-success'}`}
                                                    style={{ maxWidth: '200px', borderWidth: '2px' }}
                                                    value={getPhone(activeRecipient)}
                                                    onChange={e => handlePhoneChange(activeRecipient.id, e.target.value)}
                                                    placeholder="e.g. 0712345678"
                                                />
                                                {(phoneEdits[activeRecipient.id] !== undefined || !activeRecipient.phone) && (
                                                    <button
                                                        className={`btn btn-sm btn-primary font-weight-bold ${savingPhone === activeRecipient.id ? 'spinner spinner-white spinner-right' : ''}`}
                                                        disabled={savingPhone === activeRecipient.id || !getPhone(activeRecipient)}
                                                        onClick={() => handleSavePhone(activeRecipient)}
                                                    >
                                                        Save Phone
                                                    </button>
                                                )}
                                                {getPhone(activeRecipient) && !phoneEdits[activeRecipient.id] && (
                                                    <span className="text-success font-weight-bold ml-2 font-size-sm">
                                                        <i className="flaticon2-check-mark text-success mr-1"></i>Ready to send
                                                    </span>
                                                )}
                                                {!getPhone(activeRecipient) && (
                                                    <span className="text-danger font-weight-bold ml-2 font-size-sm">
                                                        <i className="flaticon-warning text-danger mr-1"></i>SMS will be skipped
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-muted font-size-sm mb-1">Characters</div>
                                            <div className="font-weight-bolder h4 m-0">{getMessage(activeRecipient).length}</div>
                                        </div>
                                    </div>

                                    {/* Message Editor */}
                                    <div className="form-group flex-grow-1 d-flex flex-column m-0" style={{ minHeight: 0 }}>
                                        <label className="font-weight-bold text-muted small text-uppercase mb-3">Message Content</label>
                                        <textarea
                                            className="form-control border-0 bg-light p-4 flex-grow-1"
                                            style={{ resize: 'none', borderRadius: '12px', fontSize: '0.95rem', lineHeight: '1.6', minHeight: '180px' }}
                                            value={getMessage(activeRecipient)}
                                            onChange={(e) => handleMessageChange(activeRecipient.id, e.target.value)}
                                            placeholder="Type message here..."
                                        ></textarea>
                                        <div className="mt-4 d-flex align-items-center justify-content-between bg-light-warning px-4 py-2 rounded">
                                            <span className="text-warning-75 font-size-sm font-weight-bold">
                                                <i className="flaticon-info text-warning mr-2"></i>
                                                {Math.ceil(getMessage(activeRecipient).length / 160)} SMS segment(s)
                                            </span>
                                            {edits[activeRecipient.id] !== undefined && (
                                                <button
                                                    className="btn btn-xs btn-text-warning hover-btn-warning font-weight-bold"
                                                    onClick={() => {
                                                        const newEdits = { ...edits };
                                                        delete newEdits[activeRecipient.id];
                                                        setEdits(newEdits);
                                                    }}
                                                >Reset to Default</button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                                    <i className="flaticon2-group icon-4x opacity-20 mb-4"></i>
                                    <p>Select a recipient from the sidebar</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer bg-light px-8 py-4 border-top d-flex justify-content-between align-items-center flex-shrink-0">
                        <div className="d-flex align-items-center flex-wrap">
                            <div className="d-flex flex-column mr-8">
                                <span className="text-muted font-size-sm font-weight-bold">Total Recipients</span>
                                <span className="font-weight-bolder font-size-h6">{recipients.length}</span>
                            </div>
                            <div className="d-flex flex-column mr-8">
                                <span className="text-muted font-size-sm font-weight-bold">Will Send</span>
                                <span className="font-weight-bolder font-size-h6 text-success">{sendableRecipients.length}</span>
                            </div>
                            <div className="d-flex flex-column mr-8">
                                <span className="text-muted font-size-sm font-weight-bold">SMS Segments</span>
                                <span className="font-weight-bolder font-size-h6">{campaignStats.totalSegments}</span>
                            </div>
                            <div className="d-flex flex-column mr-8">
                                <span className="text-muted font-size-sm font-weight-bold">Est. Cost</span>
                                <span className="font-weight-bolder font-size-h6 text-primary">KES {campaignStats.totalCost.toFixed(2)}</span>
                            </div>
                            <div className={`d-flex flex-column px-4 py-1 rounded ${schoolBalance < campaignStats.totalCost ? 'bg-light-danger' : 'bg-light-success'}`}>
                                <span className={`${schoolBalance < campaignStats.totalCost ? 'text-danger' : 'text-success'} font-size-sm font-weight-bold`}>Balance</span>
                                <span className={`font-weight-bolder font-size-sm ${schoolBalance < campaignStats.totalCost ? 'text-danger' : 'text-success'}`}>KES {schoolBalance.toFixed(2)}</span>
                            </div>
                            <button
                                type="button"
                                className="btn btn-warning font-weight-bolder px-5 ml-4 d-flex align-items-center"
                                style={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(255, 152, 0, 0.2)' }}
                                onClick={() => topUpModalRef.current?.show?.()}
                            >
                                <i className="fa fa-wallet mr-2"></i> Top Up
                            </button>
                        </div>

                        <div>
                            <button type="button" className="btn btn-light-danger font-weight-bold mr-3" onClick={onClose} disabled={isSending}>Cancel</button>
                            {schoolBalance < campaignStats.totalCost && schoolBalance >= 0 ? (
                                <button
                                    type="button"
                                    className="btn btn-danger font-weight-bold px-8"
                                    disabled
                                    title={`Balance KES ${schoolBalance.toFixed(2)} is less than estimated cost KES ${campaignStats.totalCost.toFixed(2)}`}
                                >
                                    <i className="fa fa-exclamation-triangle mr-2"></i>
                                    Insufficient Balance — Top Up First
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={`btn btn-primary font-weight-bold px-10 ${isSending ? 'spinner spinner-white spinner-right' : ''}`}
                                    onClick={handleConfirmSend}
                                    disabled={isSending || sendableRecipients.length === 0}
                                >
                                    {isSending ? 'Sending...' : `Send to ${sendableRecipients.length} Parent${sendableRecipients.length !== 1 ? 's' : ''}`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #e4e6ef; border-radius: 4px; }
                .hover-bg-white:hover { background: #ffffff !important; }
            `}</style>

            {/* Render Top Up Modal inside a higher zIndex context if needed, but append to body handles it usually */}
            <MpesaPaymentModal ref={topUpModalRef} />
        </div>
    );
};

export default BulkReportSmsModal;
