
import React, { Component } from 'react';
import Navbar from "../../components/navbar";
import Subheader from "../../components/subheader";
import Data from "../../utils/data";

class AssessmentTypes extends Component {
    state = {
        assessmentTypes: [],
        loading: true,
        showAddModal: false,
        showEditModal: false,
        selectedType: null,
        
        // Form states
        typeName: '',
        percentage: '',
        processing: false
    };

    componentDidMount() {
        this.fetchData();
        this.unsubscribe = Data.assessmentTypes.subscribe(({ assessmentTypes }) => {
            this.setState({ assessmentTypes: assessmentTypes || [] });
        });
    }

    componentWillUnmount() {
        if(this.unsubscribe) this.unsubscribe();
    }

    fetchData = () => {
        const assessmentTypes = Data.assessmentTypes.list() || [];
        this.setState({ assessmentTypes, loading: false });
    }

    handleAdd = async () => {
        const { typeName, percentage } = this.state;
        if (!typeName) return alert("Please enter a name");
        if (!percentage) return alert("Please enter a percentage");

        this.setState({ processing: true });
        try {
            await Data.assessmentTypes.create({ 
                name: typeName, 
                percentage: parseFloat(percentage),
                school: localStorage.getItem('school')
            });
            if(window.toastr) window.toastr.success("Assessment type created successfully");
            this.closeModals();
        } catch (e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to create assessment type");
        } finally {
            this.setState({ processing: false });
        }
    }

    handleEdit = async () => {
        const { selectedType, typeName, percentage } = this.state;
        if (!selectedType) return;

        this.setState({ processing: true });
        try {
            await Data.assessmentTypes.update({ 
                id: selectedType.id, 
                name: typeName, 
                percentage: parseFloat(percentage),
                school: localStorage.getItem('school')
            });
            if(window.toastr) window.toastr.success("Assessment type updated successfully");
            this.closeModals();
        } catch (e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to update assessment type");
        } finally {
            this.setState({ processing: false });
        }
    }

    handleDelete = async (item) => {
        if(!window.confirm(`Are you sure you want to delete ${item.name}?`)) return;
        try {
            await Data.assessmentTypes.delete(item);
            if(window.toastr) window.toastr.success("Assessment type deleted");
        } catch(e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to delete assessment type");
        }
    }

    openAddModal = () => {
        this.setState({ 
            showAddModal: true, 
            typeName: '', percentage: '', selectedType: null 
        });
    }

    openEditModal = (item) => {
        this.setState({ 
            showEditModal: true, 
            selectedType: item,
            typeName: item.name,
            percentage: item.percentage
        });
    }

    closeModals = () => {
        this.setState({ showAddModal: false, showEditModal: false });
    }

    render() {
        const { assessmentTypes, showAddModal, showEditModal, processing, typeName, percentage } = this.state;

        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
                <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper" id="kt_wrapper">
                    <Navbar />
                    <Subheader links={["Manage Data", "Assessment Types"]} />

                    <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" style={{ height: "100vh" }} id="kt_content">
                        <div className="kt-container  kt-grid__item kt-grid__item--fluid">
                            <div className="card card-custom">
                                <div className="card-header">
                                    <h3 className="card-title">Assessment Types</h3>
                                    <div className="card-toolbar">
                                        <button className="btn btn-primary" onClick={this.openAddModal}>
                                            <i className="flaticon2-plus"></i> Add New Type
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Percentage (%)</th>
                                                    <th style={{width: '150px'}}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assessmentTypes.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.name}</td>
                                                        <td>{item.percentage}%</td>
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
                                                {assessmentTypes.length === 0 && <tr><td colSpan="3" className="text-center">No assessment types found.</td></tr>}
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
                                    <h5 className="modal-title">{showAddModal ? "New Assessment Type" : "Edit Assessment Type"}</h5>
                                    <button type="button" className="close" onClick={this.closeModals}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={typeName}
                                            onChange={e => this.setState({ typeName: e.target.value })}
                                            placeholder="e.g. CAT 1, Main Exam"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Percentage (%)</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={percentage}
                                            onChange={e => this.setState({ percentage: e.target.value })}
                                            placeholder="e.g. 30"
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

export default AssessmentTypes;
