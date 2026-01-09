import React from "react";

const $ = window.$; // Assuming jQuery is available globally as per your setup

class DeleteModal extends React.Component {
  state = {
    loading: false
  };

  componentDidUpdate(prevProps) {
    // If the 'remove' prop changes from null to an object, show the modal
    if (this.props.remove && !prevProps.remove) {
      this.show();
    }
  }

  show() {
    $("#deleteModal").modal("show");
  }

  hide() {
    $("#deleteModal").modal("hide");
  }

  handleDelete = async () => {
    if (!this.props.remove) return;

    this.setState({ loading: true });
    try {
      await this.props.save(this.props.remove);
      this.setState({ loading: false });
      this.hide();
    } catch (e) {
      console.error(e);
      this.setState({ loading: false });
      alert("Failed to delete item.");
    }
  };

  render() {
    const item = this.props.remove;
    const name = item ? (item.name || item.names || "this item") : "this item";

    return (
      <div className="modal fade" id="deleteModal" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title font-weight-bold">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Confirm Deletion
              </h5>
              <button type="button" className="close text-white" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body p-4 text-center">
              <p className="mb-0 text-muted" style={{ fontSize: '1.1rem' }}>
                Are you sure you want to delete <strong>{name}</strong>?
              </p>
              <small className="text-danger d-block mt-2">This action cannot be undone.</small>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                className="btn btn-danger shadow-sm" 
                onClick={this.handleDelete}
                disabled={this.state.loading}
              >
                {this.state.loading ? (
                   <span><i className="fas fa-spinner fa-spin mr-1"></i> Deleting...</span>
                ) : (
                   "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DeleteModal;