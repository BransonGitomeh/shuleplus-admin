import React from "react";
import ErrorMessage from "./components/error-toast";
import Data from "../../utils/data";

const IErrorMessage = new ErrorMessage();
const $ = window.$;

// Generate a unique ID for this modal instance
const modalNumber = "route_modal_" + Math.random().toString().split(".")[1];

class RouteModal extends React.Component {
  state = {
    loading: false,
    // Form Data
    id: null, // If present, we are editing
    name: "",
    description: "",
    
    // Student Selection Logic
    allStudents: [],      // The full list from Data.students.list()
    selectedStudentIds: [], // Array of strings (IDs) representing checked students
    searchTerm: "",       // For filtering the UI list
  };

  componentDidMount() {
    const _this = this;
    
    // 1. Initialize jQuery Validation
    this.validator = $("#" + modalNumber + "form").validate({
      errorClass: "invalid-feedback",
      errorElement: "div",
      highlight: (element) => $(element).addClass("is-invalid"),
      unhighlight: (element) => $(element).removeClass("is-invalid"),
      submitHandler: async (form, event) => {
        event.preventDefault();
        await _this.handleSubmit();
      }
    });

    // 2. Subscribe to Student Data
    // Initial Load
    this.setState({ allStudents: Data.students.list() });
    
    // Live Updates
    this.unsubscribe = Data.students.subscribe(({ students }) => {
      this.setState({ allStudents: students });
    });
  }

  componentWillUnmount() {
    // Clean up subscription to prevent memory leaks
    if (this.unsubscribe) this.unsubscribe();
  }

  // Detect when the parent passes "edit" props to switch modes
  static getDerivedStateFromProps(props, state) {
    // If we are opening the modal in "Edit" mode and haven't synced state yet
    if (props.edit && props.edit.id !== state.id) {
      // Extract IDs from the student objects provided in props.edit.students
      // Check if props.edit.students exists and is an array, otherwise empty array
      const existingStudentIds = Array.isArray(props.edit.students) 
        ? props.edit.students.map(s => s.id) 
        : [];

      return {
        id: props.edit.id,
        name: props.edit.name || "",
        description: props.edit.description || "",
        selectedStudentIds: existingStudentIds,
        searchTerm: "" // Reset search on new open
      };
    }
    
    // If props.edit is null (Add mode), but state has an ID, reset state
    if (!props.edit && state.id !== null) {
      return {
        id: null,
        name: "",
        description: "",
        selectedStudentIds: [],
        searchTerm: ""
      };
    }

    return null;
  }

  show() {
    $("#" + modalNumber).modal({
      show: true,
      backdrop: "static",
      keyboard: false
    });
  }

  hide() {
    $("#" + modalNumber).modal("hide");
    // specific reset if needed, though getDerivedStateFromProps handles most
  }

  handleSubmit = async () => {
    try {
      this.setState({ loading: true });

      const payload = {
        name: this.state.name,
        description: this.state.description,
        students: this.state.selectedStudentIds // Send array of IDs
      };

      // If editing, include the ID
      if (this.state.id) {
        payload.id = this.state.id;
      }

      await this.props.save(payload);
      
      this.hide();
      this.setState({ 
        loading: false, 
        name: "", 
        description: "", 
        selectedStudentIds: [],
        id: null 
      });
      
    } catch (error) {
      this.setState({ loading: false });
      const message = error ? error.message : undefined;
      IErrorMessage.show({ message });
    }
  };

  // Toggle selection of a student
  toggleStudent = (studentId) => {
    this.setState((prevState) => {
      const isSelected = prevState.selectedStudentIds.includes(studentId);
      if (isSelected) {
        return { selectedStudentIds: prevState.selectedStudentIds.filter(id => id !== studentId) };
      } else {
        return { selectedStudentIds: [...prevState.selectedStudentIds, studentId] };
      }
    });
  };

  render() {
    // FILTERING LOGIC
    // 1. Filter by search term
    // 2. Sort so Selected items appear at the top (optional, but good UX)
    const filteredStudents = this.state.allStudents.filter(student => {
      const term = this.state.searchTerm.toLowerCase();
      const name = (student.names || "").toLowerCase();
      const reg = (student.registration || "").toLowerCase();
      return name.includes(term) || reg.includes(term);
    });

    return (
      <div>
        <div
          className="modal fade"
          id={modalNumber}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="routeModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <form id={modalNumber + "form"} className="kt-form kt-form--label-right">
                
                {/* Header */}
                <div className="modal-header">
                  <h5 className="modal-title">
                    {this.state.id ? "Edit Route" : "Create New Route"}
                  </h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <div className="kt-portlet__body">
                    <div className="row">
                      
                      {/* Left Column: Route Details */}
                      <div className="col-lg-5">
                        <div className="form-group">
                          <label>Route Name:</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            minLength="2"
                            required
                            value={this.state.name}
                            onChange={(e) => this.setState({ name: e.target.value })}
                            placeholder="e.g. Westlands Bus"
                          />
                        </div>
                        <div className="form-group">
                          <label>Description:</label>
                          <textarea
                            className="form-control"
                            name="description"
                            rows="6"
                            value={this.state.description}
                            onChange={(e) => this.setState({ description: e.target.value })}
                            placeholder="Details about the route path..."
                          />
                        </div>
                        
                        {/* Stats Summary */}
                        <div className="alert alert-secondary mt-3">
                            <strong>Selected Students:</strong> {this.state.selectedStudentIds.length}
                        </div>
                      </div>

                      {/* Right Column: Student Selection */}
                      <div className="col-lg-7">
                        <label>Assign Students:</label>
                        
                        {/* Search Bar */}
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text"><i className="fa fa-search"></i></span>
                            </div>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search by name or registration..." 
                                value={this.state.searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>

                        {/* Scrollable List Container */}
                        <div 
                            className="border rounded p-2" 
                            style={{ 
                                maxHeight: "400px", 
                                overflowY: "auto", 
                                backgroundColor: "#f9f9f9" 
                            }}
                        >
                            {filteredStudents.length === 0 && (
                                <div className="text-center p-3 text-muted">No students found.</div>
                            )}

                            <ul className="list-group list-group-flush">
                                {filteredStudents.map((student) => {
                                    const isChecked = this.state.selectedStudentIds.includes(student.id);
                                    
                                    return (
                                        <li 
                                            key={student.id} 
                                            className={`list-group-item d-flex justify-content-between align-items-center ${isChecked ? 'bg-light' : ''}`}
                                            onClick={() => this.toggleStudent(student.id)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div style={{flex: 1}}>
                                                <span className="font-weight-bold">{student.names}</span>
                                                <br/>
                                                <small className="text-muted">
                                                    {student.registration ? `Reg: ${student.registration}` : ''} 
                                                    {student.class_name ? ` | Class: ${student.class_name}` : ''}
                                                </small>
                                            </div>
                                            
                                            <label className="kt-checkbox kt-checkbox--brand mb-0">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isChecked} 
                                                    readOnly // handled by li onClick
                                                /> 
                                                <span></span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <small className="form-text text-muted">
                            Click on a row to select/deselect the student.
                        </small>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />
                        Saving...
                      </>
                    ) : (
                      "Save Route"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-dismiss="modal"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RouteModal;