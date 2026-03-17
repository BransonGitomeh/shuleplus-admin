import React from "react";
import Data from "../../../utils/data";

const Modal = ({ show, onClose, currentGradeId, onSubjectsAdded }) => {
    const [subjects, setSubjects] = React.useState([]);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (show) {
            // Fetch all subjects in the school
            const allSubjects = Data.subjects.list();
            // Filter out subjects already in this grade
            const filtered = allSubjects.filter(s => String(s.grade?.id || s.grade) !== String(currentGradeId));
            setSubjects(filtered);
            setSelectedIds([]);
        }
    }, [show, currentGradeId]);

    const toggleSubject = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (selectedIds.length === 0) return;
        setLoading(true);
        try {
            for (const id of selectedIds) {
                await Data.subjects.update({ id, grade: currentGradeId });
            }
            if (window.toastr) window.toastr.success(`Added ${selectedIds.length} subjects to the matrix.`);
            onSubjectsAdded();
            onClose();
        } catch (e) {
            console.error("Failed to link subjects:", e);
            if (window.toastr) window.toastr.error("Failed to add subjects.");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                    <div className="modal-header border-0 bg-light-primary" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                        <h5 className="modal-title font-weight-bold">Select Existing Subjects</h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body p-8">
                        <p className="text-muted mb-6">Choose subjects to add to the current matrix (Grade {currentGradeId}). Only subjects not already assigned to this grade are shown.</p>
                        
                        <div className="row">
                            {subjects.length > 0 ? subjects.map(s => (
                                <div key={s.id} className="col-md-6 mb-4">
                                    <div 
                                        className={`p-4 rounded border cursor-pointer d-flex align-items-center justify-content-between transition-all ${selectedIds.includes(s.id) ? 'bg-light-primary border-primary' : 'bg-white border-light'}`}
                                        onClick={() => toggleSubject(s.id)}
                                        style={{ transition: 'all 0.2s ease' }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className={`symbol symbol-40 mr-4 ${selectedIds.includes(s.id) ? 'symbol-primary' : 'symbol-light'}`}>
                                                <span className="symbol-label font-weight-bolder">
                                                    {s.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-weight-bold text-dark">{s.name}</div>
                                                <div className="text-muted font-size-xs">Prev Grade ID: {s.grade?.id || s.grade || 'None'}</div>
                                            </div>
                                        </div>
                                        <div className={`checkbox checkbox-sm checkbox-primary ${selectedIds.includes(s.id) ? 'checkbox-checked' : ''}`}>
                                            <input type="checkbox" checked={selectedIds.includes(s.id)} readOnly style={{ pointerEvents: 'none' }} />
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-12 text-center py-10">
                                    <div className="text-muted">No other subjects found to add.</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer border-0">
                        <button className="btn btn-light-danger font-weight-bold px-8" onClick={onClose}>Cancel</button>
                        <button 
                            className={`btn btn-primary font-weight-bold px-10 ${loading ? 'spinner spinner-white spinner-right' : ''}`} 
                            onClick={handleSave} 
                            disabled={loading || selectedIds.length === 0}
                        >
                            {loading ? 'Adding...' : `Add ${selectedIds.length} Subjects`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
