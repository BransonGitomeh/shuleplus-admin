import React from "react";
import Data from "../../../utils/data";

const $ = window.$;
const modalId = "add-term-modal-" + Math.random().toString(36).substr(2, 9);

class AddTermModal extends React.Component {
    state = {
        loading: false,
        name: "",
        startDate: "",
        endDate: "",
        order: 0
    };

    show() {
        $("#" + modalId).modal({
            show: true,
            backdrop: "static",
            keyboard: false
        });
    }

    hide() {
        $("#" + modalId).modal("hide");
        if (this.props.onClose) this.props.onClose();
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        this.setState({ loading: true });
        try {
            const payload = {
                name: this.state.name,
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                order: Number(this.state.order) || 0,
                school: localStorage.getItem("school")
            };
            await Data.terms.create(payload);
            this.hide();
            this.setState({ name: "", startDate: "", endDate: "", order: 0, loading: false });
        } catch (error) {
            console.error("Failed to create term:", error);
            this.setState({ loading: false });
            if (window.toastr) window.toastr.error("Failed to create term");
        }
    };

    render() {
        return (
            <div className="modal fade" id={modalId} tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                        <div className="modal-header border-0">
                            <h5 className="modal-title font-weight-bold">Add Academic Term</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={this.handleSubmit}>
                            <div className="modal-body pt-0">
                                <div className="form-group font-weight-bold text-muted small text-uppercase mb-1">Term Name</div>
                                <input 
                                    type="text" 
                                    className="form-control form-control-solid mb-4" 
                                    placeholder="e.g. Term 1 2024" 
                                    value={this.state.name} 
                                    onChange={e => this.setState({ name: e.target.value })} 
                                    required 
                                />

                                <div className="row">
                                    <div className="col-6">
                                        <div className="form-group font-weight-bold text-muted small text-uppercase mb-1">Start Date</div>
                                        <input 
                                            type="date" 
                                            className="form-control form-control-solid mb-4" 
                                            value={this.state.startDate} 
                                            onChange={e => this.setState({ startDate: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group font-weight-bold text-muted small text-uppercase mb-1">End Date</div>
                                        <input 
                                            type="date" 
                                            className="form-control form-control-solid mb-4" 
                                            value={this.state.endDate} 
                                            onChange={e => this.setState({ endDate: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="form-group font-weight-bold text-muted small text-uppercase mb-1">Sort Order</div>
                                <input 
                                    type="number" 
                                    className="form-control form-control-solid" 
                                    placeholder="Numerical order (1, 2, 3...)" 
                                    value={this.state.order} 
                                    onChange={e => this.setState({ order: e.target.value })} 
                                />
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-light-primary font-weight-bold" data-dismiss="modal">Cancel</button>
                                <button type="submit" className={`btn btn-primary font-weight-bold px-10 ${this.state.loading ? 'spinner spinner-white spinner-right' : ''}`} disabled={this.state.loading}>
                                    Save Term
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddTermModal;
