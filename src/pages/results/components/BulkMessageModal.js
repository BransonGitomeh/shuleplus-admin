import React, { useState } from 'react';

const BulkMessageModal = ({ show, onClose, onSend, students, term, assessments, subjects }) => {
    const defaultTemplate = "Dear Parent, [Name] has a mean score of [Mean] ([Grade]) in [Term]. Please check the portal for full details.";
    const [message, setMessage] = useState(defaultTemplate);
    const [isSending, setIsSending] = useState(false);

    if (!show) return null;

    // Helper to calculate student data
    const getStudentData = (student) => {
        const studentScores = assessments.filter(a => 
            (a.student === student.id || a.student?.id === student.id) &&
            (a.term === term.id || a.term?.id === term.id)
        );

        let total = 0;
        let count = 0;
        studentScores.forEach(s => {
            const val = parseInt(s.score, 10);
            if (!isNaN(val)) {
                total += val;
                count++;
            }
        });

        const mean = count > 0 ? Math.round(total / count) : 0;
        
        // Simple grade logic (sync with ReportCard if possible)
        let grade = 'E';
        if (mean >= 80) grade = 'A';
        else if (mean >= 70) grade = 'B';
        else if (mean >= 60) grade = 'C';
        else if (mean >= 50) grade = 'D';

        return { mean, grade, name: student.names.split(' ')[0] };
    };

    const generatePreview = (student) => {
        const data = getStudentData(student);
        return message
            .replace('[Name]', data.name)
            .replace('[Mean]', data.mean)
            .replace('[Grade]', data.grade)
            .replace('[Term]', term.name);
    };

    const handleSend = async () => {
        setIsSending(true);
        // Prepare data for parent component to handle actual sending
        // We pass the template and let the parent/logic handle the iteration to enable better progress tracking or batching
        await onSend(message);
        setIsSending(false);
        onClose();
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Send Bulk Results SMS</h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Message Template</label>
                            <textarea 
                                className="form-control" 
                                rows="3" 
                                value={message} 
                                onChange={e => setMessage(e.target.value)}
                            />
                            <small className="form-text text-muted">
                                Available placeholders: [Name], [Mean], [Grade], [Term]
                            </small>
                        </div>

                        <h6>Preview (First 3 Students)</h6>
                        <ul className="list-group mb-3">
                            {students.slice(0, 3).map(student => (
                                <li key={student.id} className="list-group-item">
                                    <strong>{student.names}:</strong> {generatePreview(student)}
                                </li>
                            ))}
                        </ul>
                        
                        <div className="alert alert-info">
                            Will send to {students.length} students. Ensure your SMS balance is sufficient.
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSending}>Close</button>
                        <button type="button" className="btn btn-primary" onClick={handleSend} disabled={isSending}>
                            {isSending ? <span className="spinner-border spinner-border-sm mr-2"></span> : <i className="fa fa-paper-plane mr-2"></i>}
                            Send Messages
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkMessageModal;
