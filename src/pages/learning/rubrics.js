
import React, { Component } from 'react';
import Navbar from "../../components/navbar";
import Subheader from "../../components/subheader";
import Data from "../../utils/data";

class RubricsManagement extends Component {
    state = {
        assessmentRubrics: [],
        loading: true,
        showAddModal: false,
        showEditModal: false,
        selectedRubric: null,
        
        // Form states
        label: '',
        minScore: '',
        maxScore: '',
        points: '',
        teachersComment: '',
        processing: false
    };

    componentDidMount() {
        this.fetchData();
        this.unsubscribe = Data.assessmentRubrics.subscribe(({ assessmentRubrics }) => {
            this.setState({ assessmentRubrics: assessmentRubrics || [] });
        });
    }

    componentWillUnmount() {
        if(this.unsubscribe) this.unsubscribe();
    }

    fetchData = () => {
        const assessmentRubrics = Data.assessmentRubrics.list() || [];
        this.setState({ assessmentRubrics, loading: false });
    }

    handleAdd = async () => {
        const { label, minScore, maxScore, points, teachersComment } = this.state;
        if (!label || minScore === '' || maxScore === '') return alert("Please fill all fields");

        this.setState({ processing: true });
        try {
            await Data.assessmentRubrics.create({ 
                label, 
                minScore: parseFloat(minScore),
                maxScore: parseFloat(maxScore),
                points: parseFloat(points || 0),
                teachersComment,
                school: localStorage.getItem('school')
            });
            if(window.toastr) window.toastr.success("Rubric created successfully");
            this.closeModals();
        } catch (e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to create rubric");
        } finally {
            this.setState({ processing: false });
        }
    }

    handleEdit = async () => {
        const { selectedRubric, label, minScore, maxScore, points, teachersComment } = this.state;
        if (!selectedRubric) return;

        this.setState({ processing: true });
        try {
            await Data.assessmentRubrics.update({ 
                id: selectedRubric.id, 
                label, 
                minScore: parseFloat(minScore),
                maxScore: parseFloat(maxScore),
                points: parseFloat(points || 0),
                teachersComment,
                school: localStorage.getItem('school')
            });
            if(window.toastr) window.toastr.success("Rubric updated successfully");
            this.closeModals();
        } catch (e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to update rubric");
        } finally {
            this.setState({ processing: false });
        }
    }

    handleDelete = async (item) => {
        if(!window.confirm(`Are you sure you want to delete ${item.label}?`)) return;
        try {
            await Data.assessmentRubrics.delete(item);
            if(window.toastr) window.toastr.success("Rubric deleted");
        } catch(e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to delete rubric");
        }
    }

    openAddModal = () => {
        this.setState({ 
            showAddModal: true, 
            label: '', minScore: '', maxScore: '', points: '', teachersComment: '', selectedRubric: null 
        });
    }

    openEditModal = (item) => {
        this.setState({ 
            showEditModal: true, 
            selectedRubric: item,
            label: item.label,
            minScore: item.minScore,
            maxScore: item.maxScore,
            points: item.points || '',
            teachersComment: item.teachersComment || ''
        });
    }

    closeModals = () => {
        this.setState({ showAddModal: false, showEditModal: false });
    }

    render() {
        const { assessmentRubrics, showAddModal, showEditModal, processing, label, minScore, maxScore, points, teachersComment } = this.state;

        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
                <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper" id="kt_wrapper">
                    <Navbar />
                    <Subheader links={["Manage Data", "Assessment Rubrics"]} />

                    <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" style={{ height: "100vh" }} id="kt_content">
                        <div className="kt-container  kt-grid__item kt-grid__item--fluid">
                            <div className="card card-custom">
                                <div className="card-header">
                                    <h3 className="card-title">Assessment Rubrics</h3>
                                    <div className="card-toolbar">
                                        <button className="btn btn-primary" onClick={this.openAddModal}>
                                            <i className="flaticon2-plus"></i> Add New Rubric
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Label</th>
                                                    <th>Min Score (%)</th>
                                                    <th>Max Score (%)</th>
                                                    <th>Points</th>
                                                    <th>Comment</th>
                                                    <th style={{width: '150px'}}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assessmentRubrics.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.label}</td>
                                                        <td>{item.minScore}%</td>
                                                        <td>{item.maxScore}%</td>
                                                        <td>{item.points || 0}</td>
                                                        <td>{item.teachersComment || '-'}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-light-primary mr-2" onClick={() => this.openEditModal(item)}>
                                                                <i className="flaticon2-edit"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-light-danger" onClick={() => this.handleDelete(item)}>
                                                                <i className="flaticon2-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {assessmentRubrics.length === 0 && <tr><td colSpan="6" className="text-center">No rubrics found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {(showAddModal || showEditModal) && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{showAddModal ? "New Rubric" : "Edit Rubric"}</h5>
                                    <button type="button" className="close" onClick={this.closeModals}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Label</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={label}
                                            onChange={e => this.setState({ label: e.target.value })}
                                            placeholder="e.g. E.E, M.E"
                                        />
                                    </div>
                                    <div className="form-group row">
                                        <div className="col-md-6">
                                            <label>Min Score (%)</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={minScore}
                                                onChange={e => this.setState({ minScore: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label>Max Score (%)</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={maxScore}
                                                onChange={e => this.setState({ maxScore: e.target.value })}
                                                placeholder="100"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Points</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={points}
                                            onChange={e => this.setState({ points: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Default Teacher Comment</label>
                                        <textarea 
                                            className="form-control" 
                                            value={teachersComment}
                                            onChange={e => this.setState({ teachersComment: e.target.value })}
                                            placeholder="Standard comment for this rubric level..."
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={this.closeModals}>Cancel</button>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={showAddModal ? this.handleAdd : this.handleEdit}
                                        disabled={processing}
                                    >
                                        {processing ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default RubricsManagement;
