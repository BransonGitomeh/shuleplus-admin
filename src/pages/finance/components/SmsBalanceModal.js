import React, { useState } from 'react';

const SmsBalanceModal = ({ show, onClose, onSend, group }) => {
    const defaultTemplate = `Dear Parent, your ShulePlus fee balance for ${group?.students?.map(s => s.names.split(' ')[0]).join(', ')} is KES ${group?.totalBalance?.toLocaleString()}. Please pay to avoid interruptions.`;
    const [message, setMessage] = useState(defaultTemplate);
    const [isSending, setIsSending] = useState(false);

    if (!show || !group) return null;

    const handleSend = async () => {
        setIsSending(true);
        await onSend(message);
        setIsSending(false);
        onClose();
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Send SMS Balance Reminder</h5>
                        <button type="button" className="close" onClick={onClose} disabled={isSending}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group mb-4">
                            <label className="font-weight-bold">Parent</label>
                            <input className="form-control" type="text" value={`${group.parent.name} (${group.parent.phone})`} disabled />
                        </div>
                        <div className="form-group">
                            <label className="font-weight-bold">Message Content</label>
                            <textarea 
                                className="form-control" 
                                rows="4" 
                                value={message} 
                                onChange={e => setMessage(e.target.value)}
                            />
                            <small className="form-text text-muted mt-2">
                                You can edit the message above before sending. Ensure your SMS balance is sufficient.
                            </small>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSending}>Cancel</button>
                        <button type="button" className="btn btn-primary" onClick={handleSend} disabled={isSending}>
                            {isSending ? <span className="spinner-border spinner-border-sm mr-2"></span> : <i className="fa fa-paper-plane mr-2"></i>}
                            Send Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmsBalanceModal;
