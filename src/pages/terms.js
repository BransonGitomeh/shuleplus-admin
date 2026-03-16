
import React, { Component } from 'react';
import Navbar from "../components/navbar";
import Subheader from "../components/subheader";
import Data from "../utils/data";
import { Modal } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DragHandle } from './learning/assessmentTypes'; // Reusing the icon if possible or defining here

const $ = window.$;

class TermsManagement extends Component {
    state = {
        terms: [],
        loading: true,
        showAddModal: false,
        showEditModal: false,
        selectedTerm: null,
        
        // Form states
        termName: '',
        startDate: '',
        endDate: '',
        processing: false
    };

    componentDidMount() {
        this.fetchTerms();
        this.unsubscribe = Data.terms.subscribe(({ terms }) => {
            const sortedTerms = [...(terms || [])].sort((a,b) => (a.order || 0) - (b.order || 0));
            this.setState({ terms: sortedTerms });
        });
    }

    componentWillUnmount() {
        if(this.unsubscribe) this.unsubscribe();
    }

    fetchTerms = () => {
        const terms = [...(Data.terms.list() || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
        this.setState({ terms, loading: false });
    }

    onDragEnd = async (result) => {
        if (!result.destination) return;

        const { terms } = this.state;
        const reorderedTerms = Array.from(terms);
        const [removed] = reorderedTerms.splice(result.source.index, 1);
        reorderedTerms.splice(result.destination.index, 0, removed);

        // Assign new order values based on index
        const updatedTerms = reorderedTerms.map((term, index) => ({
            ...term,
            order: index
        }));

        const previousTerms = terms;
        this.setState({ terms: updatedTerms });

        try {
            const orders = updatedTerms.map(t => ({ id: t.id, order: t.order }));
            await Data.terms.updateOrder(orders);
            if (window.toastr) window.toastr.success("Term order updated");
        } catch (e) {
            console.error(e);
            this.setState({ terms: previousTerms });
            if (window.toastr) window.toastr.error("Failed to update order");
        }
    }

    handleAdd = async () => {
        const { termName, startDate, endDate } = this.state;
        if (!termName) return alert("Please enter a term name");

        this.setState({ processing: true });
        try {
            await Data.terms.create({ 
                name: termName, 
                startDate, 
                endDate 
            });
            if(window.toastr) window.toastr.success("Term created successfully");
            this.closeModals();
        } catch (e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to create term");
        } finally {
            this.setState({ processing: false });
        }
    }

    handleEdit = async () => {
        const { selectedTerm, termName, startDate, endDate } = this.state;
        if (!selectedTerm) return;

        this.setState({ processing: true });
        try {
            await Data.terms.update({ 
                id: selectedTerm.id, 
                name: termName, 
                startDate, 
                endDate 
            });
            if(window.toastr) window.toastr.success("Term updated successfully");
            this.closeModals();
        } catch (e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to update term");
        } finally {
            this.setState({ processing: false });
        }
    }

    handleDelete = async (term) => {
        if(!window.confirm(`Are you sure you want to delete ${term.name}?`)) return;
        try {
            await Data.terms.delete(term); // Assuming archive/delete works
            if(window.toastr) window.toastr.success("Term deleted");
        } catch(e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to delete term");
        }
    }

    openAddModal = () => {
        this.setState({ 
            showAddModal: true, 
            termName: '', startDate: '', endDate: '', selectedTerm: null 
        });
    }

    openEditModal = (term) => {
        this.setState({ 
            showEditModal: true, 
            selectedTerm: term,
            termName: term.name,
            startDate: term.startDate ? term.startDate.split('T')[0] : '', // Format for date input
            endDate: term.endDate ? term.endDate.split('T')[0] : ''
        });
    }

    closeModals = () => {
        this.setState({ showAddModal: false, showEditModal: false });
    }

    render() {
        const { terms, showAddModal, showEditModal, processing, termName, startDate, endDate } = this.state;

        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
                <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper" id="kt_wrapper">
                    <Navbar />
                    <Subheader links={["Manage Data", "Terms"]} />

                    <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" style={{ height: "100vh" }} id="kt_content">
                        <div className="kt-container  kt-grid__item kt-grid__item--fluid">
                            <div className="card card-custom">
                                <div className="card-header">
                                    <h3 className="card-title">Terms Management</h3>
                                    <div className="card-toolbar">
                                        <button className="btn btn-primary" onClick={this.openAddModal}>
                                            <i className="flaticon2-plus"></i> Add New Term
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <DragDropContext onDragEnd={this.onDragEnd}>
                                            <table className="table table-bordered table-striped">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '40px' }}></th>
                                                        <th>Term Name</th>
                                                        <th>Start Date</th>
                                                        <th>End Date</th>
                                                        <th style={{width: '150px'}}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <Droppable droppableId="terms-list">
                                                    {(provided) => (
                                                        <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                                            {terms.map((term, index) => (
                                                                <Draggable key={term.id} draggableId={term.id} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <tr 
                                                                            ref={provided.innerRef} 
                                                                            {...provided.draggableProps}
                                                                            style={{
                                                                                ...provided.draggableProps.style,
                                                                                backgroundColor: snapshot.isDragging ? '#f4f6fa' : 'transparent'
                                                                            }}
                                                                        >
                                                                            <td {...provided.dragHandleProps} className="text-center" style={{ verticalAlign: 'middle' }}>
                                                                                <i className="flaticon2-menu-1 text-muted" style={{ cursor: 'grab' }}></i>
                                                                            </td>
                                                                            <td>{term.name}</td>
                                                                            <td>{term.startDate ? new Date(term.startDate).toLocaleDateString() : '-'}</td>
                                                                            <td>{term.endDate ? new Date(term.endDate).toLocaleDateString() : '-'}</td>
                                                                            <td>
                                                                                <button className="btn btn-sm btn-light-primary mr-2" onClick={() => this.openEditModal(term)}>
                                                                                    <i className="flaticon2-edit"></i>
                                                                                </button>
                                                                                <button className="btn btn-sm btn-light-danger" onClick={() => this.handleDelete(term)}>
                                                                                    <i className="flaticon2-trash"></i>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                            {terms.length === 0 && <tr><td colSpan="5" className="text-center">No terms found.</td></tr>}
                                                        </tbody>
                                                    )}
                                                </Droppable>
                                            </table>
                                        </DragDropContext>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Modal (Simplified reuse) */}
                {(showAddModal || showEditModal) && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{showAddModal ? "New Term" : "Edit Term"}</h5>
                                    <button type="button" className="close" onClick={this.closeModals}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Term Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={termName}
                                            onChange={e => this.setState({ termName: e.target.value })}
                                            placeholder="e.g. Term 1 2024"
                                        />
                                    </div>
                                    <div className="form-group row">
                                        <div className="col-md-6">
                                            <label>Start Date</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                value={startDate}
                                                onChange={e => this.setState({ startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label>End Date</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                value={endDate}
                                                onChange={e => this.setState({ endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={this.closeModals}>Cancel</button>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={showAddModal ? this.handleAdd : this.handleEdit}
                                        disabled={processing}
                                    >
                                        {processing ? "Saving..." : "Save Term"}
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

export default TermsManagement;
