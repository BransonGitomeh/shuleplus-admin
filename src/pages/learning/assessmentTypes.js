import React, { Component } from 'react';
import Navbar from "../../components/navbar";
import Subheader from "../../components/subheader";
import Data from "../../utils/data";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
            const sorted = (assessmentTypes || []).sort((a,b) => (a.order||0) - (b.order||0));
            this.setState({ assessmentTypes: sorted });
        });
    }

    componentWillUnmount() {
        if(this.unsubscribe) this.unsubscribe();
    }

    fetchData = () => {
        const assessmentTypes = Data.assessmentTypes.list() || [];
        const sorted = [...assessmentTypes].sort((a,b) => (a.order||0) - (b.order||0));
        this.setState({ assessmentTypes: sorted, loading: false });
    }

    handleAdd = async () => {
        const { typeName, percentage } = this.state;
        if (!typeName) return alert("Please enter a name");
        if (!percentage) return alert("Please enter a percentage");

        this.setState({ processing: true });
        try {
            const newOrder = this.state.assessmentTypes.length;
            await Data.assessmentTypes.create({ 
                name: typeName, 
                percentage: parseFloat(percentage),
                order: newOrder,
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
                order: selectedType.order,
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

    onDragEnd = async (result) => {
        if (!result.destination) return;
        
        const items = Array.from(this.state.assessmentTypes);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local state immediately for smooth UI
        const updatedItems = items.map((item, index) => ({ ...item, order: index }));
        this.setState({ assessmentTypes: updatedItems });

        // Build order payload
        const ordersPayload = updatedItems.map(item => ({ id: item.id, order: item.order }));

        try {
            await Data.assessmentTypes.updateOrder(ordersPayload);
            if (window.toastr) window.toastr.success("Order updated");
        } catch (e) {
            console.error(e);
            if (window.toastr) window.toastr.error("Failed to save order");
            // Revert on failure
            this.fetchData();
        }
    };

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
                                                    <th style={{width: '50px'}}></th>
                                                    <th>Name</th>
                                                    <th>Percentage (%)</th>
                                                    <th style={{width: '150px'}}>Actions</th>
                                                </tr>
                                            </thead>
                                            <DragDropContext onDragEnd={this.onDragEnd}>
                                                <Droppable droppableId="droppable-types">
                                                    {(provided) => (
                                                        <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                                            {assessmentTypes.map((item, index) => (
                                                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <tr
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            style={{
                                                                                ...provided.draggableProps.style,
                                                                                background: snapshot.isDragging ? '#f3f6f9' : 'white',
                                                                                display: snapshot.isDragging ? 'table' : '',
                                                                            }}
                                                                        >
                                                                            <td {...provided.dragHandleProps} style={{ cursor: 'grab', verticalAlign: 'middle', textAlign: 'center' }}>
                                                                                <i className="flaticon2-line"></i>
                                                                            </td>
                                                                            <td style={{ verticalAlign: 'middle' }}>{item.name}</td>
                                                                            <td style={{ verticalAlign: 'middle' }}>{item.percentage}%</td>
                                                                            <td style={{ verticalAlign: 'middle' }}>
                                                                                <button className="btn btn-sm btn-light-primary mr-2" onClick={() => this.openEditModal(item)}>
                                                                                    <i className="flaticon2-edit"></i>
                                                                                </button>
                                                                                <button className="btn btn-sm btn-light-danger" onClick={() => this.handleDelete(item)}>
                                                                                    <i className="flaticon2-trash"></i>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                            {assessmentTypes.length === 0 && <tr><td colSpan="4" className="text-center">No assessment types found.</td></tr>}
                                                        </tbody>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
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
