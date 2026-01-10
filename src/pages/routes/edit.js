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
    id: null, 
    name: "",
    description: "",
    
    // Student Selection Logic
    allStudents: [],      
    selectedStudentIds: [], 
    searchTerm: "",       
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

    // 2. Load Initial Data
    const initialStudents = Data.students.list();
    this.setState({ allStudents: initialStudents });

    // 3. Subscribe to Student Data (Live Updates)
    this.unsubscribe = Data.students.subscribe(({ students }) => {
      this.setState((prevState) => {
        // If we are currently editing (prevState.id exists) AND 
        // we currently have 0 selected students, it might be because 
        // the student data hadn't loaded when the modal opened. 
        // Let's try to populate selections now that data arrived.
        let updatedSelection = prevState.selectedStudentIds;

        if (prevState.id && prevState.selectedStudentIds.length === 0) {
           const studentsInThisRoute = students
             .filter(s => s.route && s.route.id === prevState.id)
             .map(s => s.id);
           
           if (studentsInThisRoute.length > 0) {
             updatedSelection = studentsInThisRoute;
           }
        }

        return { 
          allStudents: students,
          selectedStudentIds: updatedSelection
        };
      });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  // --- LOGIC FIX HERE ---
  static getDerivedStateFromProps(props, state) {
    // If we are opening the modal in "Edit" mode (props.edit exists) 
    // AND the ID is different from what is currently in state...
    if (props.edit && props.edit.id !== state.id) {
      
      let existingStudentIds = [];

      // Strategy 1: Check if the Route object itself has the students list
      if (Array.isArray(props.edit.students) && props.edit.students.length > 0) {
         existingStudentIds = props.edit.students.map(s => (typeof s === 'object' ? s.id : s));
      }

      // Strategy 2: If Strategy 1 failed (empty or undefined), look through the 
      // allStudents list in state to find students pointing to this route.
      if (existingStudentIds.length === 0 && state.allStudents.length > 0) {
        existingStudentIds = state.allStudents
          .filter(student => student.route && student.route.id === props.edit.id)
          .map(student => student.id);
      }

      return {
        id: props.edit.id,
        name: props.edit.name || "",
        description: props.edit.description || "",
        selectedStudentIds: existingStudentIds, // Apply the found IDs
        searchTerm: "" 
      };
    }
    
    // If switching to Add Mode (props.edit is null), reset state
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
    // Filter displayed list based on search term
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
                          />
                        </div>
                        
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
                                placeholder="Search student..." 
                                value={this.state.searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>

                        {/* List */}
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
                                                    {/* Show if student is in another route currently */}
                                                    {!isChecked && student.route && student.route.id !== this.state.id ? 
                                                        <span className="text-danger ml-1">(In {student.route.name})</span> : ''}
                                                </small>
                                            </div>
                                            
                                            <label className="kt-checkbox kt-checkbox--brand mb-0">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isChecked} 
                                                    readOnly 
                                                /> 
                                                <span></span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <small className="form-text text-muted">
                            Click on a row to assign/unassign the student.
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
                    {this.state.loading ? "Saving..." : "Save Route"}
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