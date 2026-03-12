import React, { Component } from 'react';
import Data from "../../../utils/data";

class Edit extends Component {
    state = {
        name: this.props.item.name || "",
        description: this.props.item.description || "",
        amount: this.props.item.amount || "",
        loading: false
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { name, description, amount } = this.state;
        const { item } = this.props;

        if (!name || !amount) {
            if(window.toastr) window.toastr.error("Name and Amount are required.");
            return;
        }

        this.setState({ loading: true });
        try {
            await Data.chargeTypes.update({
                id: item.id,
                name,
                description,
                amount: parseFloat(amount)
            });
            if(window.toastr) window.toastr.success("Charge Type updated successfully!");
            this.props.close();
        } catch (error) {
            console.error(error);
            if(window.toastr) window.toastr.error("Failed to update Charge Type.");
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const { name, description, amount, loading } = this.state;
        return (
            <div className="modal-content border-0">
                <div className="modal-header">
                    <h5 className="modal-title">Edit Charge Type</h5>
                    <button type="button" className="close" onClick={this.props.close}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group row">
                            <label className="col-3 col-form-label">Name *</label>
                            <div className="col-9">
                                <input className="form-control" type="text" name="name" value={name} onChange={this.handleChange} required />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-3 col-form-label">Amount (KES) *</label>
                            <div className="col-9">
                                <input className="form-control" type="number" name="amount" value={amount} onChange={this.handleChange} required min="0" />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-3 col-form-label">Description</label>
                            <div className="col-9">
                                <textarea className="form-control" name="description" value={description} onChange={this.handleChange} rows="3" />
                            </div>
                        </div>
                        <div className="kt-portlet__foot mt-4">
                            <div className="kt-form__actions text-right">
                                <button type="button" onClick={this.props.close} className="btn btn-secondary mr-2">Cancel</button>
                                <button type="submit" className={`btn btn-brand ${loading ? 'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light' : ''}`} disabled={loading}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default Edit;
