import React from "react";
import ErrorMessage from "./components/error-toast";
const IErrorMessage = new ErrorMessage();

const $ = window.$;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    edit: {
      id: "",
      names: "",
      registration: "",
      gender: "",
      class: "",   // Object {id, name}
      route: "",   // Object {id, name}
      parent: "",  // Object {id, name, national_id}
      parent2: ""  // Object {id, name, national_id}
    }
  };

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

  componentDidMount() {
    const _this = this;
    // Initialize jQuery validation
    this.validator = $("#" + modalNumber + "form").validate({
      errorClass: "invalid-feedback",
      errorElement: "div",

      highlight: function (element) {
        $(element).addClass("is-invalid");
      },
      unhighlight: function (element) {
        $(element).removeClass("is-invalid");
      },

      async submitHandler(form, event) {
        event.preventDefault();
        try {
          _this.setState({ loading: true });

          // --- PREPARE PAYLOAD FOR GRAPHQL (Ustudent) ---
          // The schema expects IDs for relations, not objects.
          const payload = {
            id: _this.state.edit.id,
            names: _this.state.edit.names,
            registration: _this.state.edit.registration,
            gender: _this.state.edit.gender,
            // Extract IDs safely. If null, send null or undefined.
            class: _this.state.edit.class?.id || null,
            route: _this.state.edit.route?.id || null,
            parent: _this.state.edit.parent?.id || null,
            parent2: _this.state.edit.parent2?.id || null
          };

          await _this.props.save(payload);
          
          _this.hide();
          _this.setState({ loading: false });
        } catch (error) {
          _this.setState({ loading: false });
          if (error) {
            const { message } = error;
            return IErrorMessage.show({ message });
          }
          IErrorMessage.show();
        }
      }
    });
  }

  static getDerivedStateFromProps(props, state) {
    // This ensures data is preloaded when you click "Edit" on a different student
    if (props.edit && props.edit.id !== state.edit.id) {
      return {
        edit: {
          ...props.edit,
          // Ensure these are null if undefined in the prop, to prevent controlled/uncontrolled errors
          class: props.edit.class || null,
          route: props.edit.route || null,
          parent: props.edit.parent || null,
          parent2: props.edit.parent2 || null,
          gender: props.edit.gender || ""
        }
      };
    }
    return null;
  }

  render() {
    const { edit } = this.state;
    
    console.log(edit)
    console.log(this.props)
    return (
      <div>
        <div
          className="modal"
          id={modalNumber}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="myLargeModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <form
                id={modalNumber + "form"}
                className="kt-form kt-form--label-right"
              >
                <div className="modal-header">
                  <h5 className="modal-title">Edit Student</h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <div className="modal-body">
                  <div className="kt-portlet__body">
                    <div className="form-group row">
                      
                      {/* FULL NAME */}
                      <div className="col-lg-4">
                        <label>Full Name:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="names"
                          minLength="2"
                          required
                          value={edit.names || ""}
                          onChange={(e) => this.setState({ 
                            edit: { ...edit, names: e.target.value } 
                          })}
                        />
                      </div>

                      {/* REGISTRATION */}
                      <div className="col-lg-4">
                        <label>Registration Number:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="registration"
                          minLength="2"
                          required
                          value={edit.registration || ""}
                          onChange={(e) => this.setState({ 
                            edit: { ...edit, registration: e.target.value } 
                          })}
                        />
                      </div>

                      {/* CLASS DROPDOWN */}
                      <div className="col-lg-4">
                        <label>Class:</label>
                        <select
                          className="form-control"
                          name="class"
                          required
                          // Value is the ID of the nested object
                          value={edit.class?.id || ""}
                          onChange={(e) => {
                            // Find the full object from props to keep state consistent
                            const selectedObj = this.props.classes.find(c => c.id === e.target.value);
                            this.setState({ edit: { ...edit, class: selectedObj } });
                          }}
                        >
                          <option value="">Select class</option>
                          {this.props.classes.map(Iclass => (
                            <option key={Iclass.id} value={Iclass.id}>{Iclass.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* ROUTE DROPDOWN */}
                      <div className="col-lg-6">
                        <label>Route:</label>
                        <select
                          name="route"
                          className="form-control"
                          required
                          value={edit.route?.id || ""}
                          onChange={(e) => {
                            const selectedObj = this.props.routes.find(r => r.id === e.target.value);
                            this.setState({ edit: { ...edit, route: selectedObj } });
                          }}
                        >
                          <option value="">Select route</option>
                          {this.props.routes.map(route => (
                            <option key={route.id} value={route.id}>{route.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* GENDER DROPDOWN */}
                      <div className="col-lg-6">
                        <label>Gender:</label>
                        <select
                          name="gender"
                          className="form-control"
                          required
                          value={edit.gender || ""}
                          onChange={(e) => this.setState({ 
                            edit: { ...edit, gender: e.target.value } 
                          })}
                        >
                          <option value="">Select gender</option>
                          {["MALE", "FEMALE"].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      {/* PARENT 1 DROPDOWN */}
                      <div className="col-lg-6">
                        <label>Parent:</label>
                        <select
                          name="parent"
                          className="form-control"
                          required
                          value={edit.parent?.id || ""}
                          onChange={(e) => {
                            const selectedObj = this.props.parents.find(p => p.id === e.target.value);
                            this.setState({ edit: { ...edit, parent: selectedObj } });
                          }}
                        >
                          <option value="">Select parent</option>
                          {this.props.parents.map(parent => (
                            <option key={parent.id} value={parent.id}>
                              {parent.name} ({parent.national_id})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* PARENT 2 DROPDOWN */}
                      <div className="col-lg-6">
                        <label>Alternative Parent:</label>
                        <select
                          name="parent2"
                          className="form-control"
                          value={edit.parent2?.id || ""}
                          onChange={(e) => {
                            const selectedObj = this.props.parents.find(p => p.id === e.target.value);
                            this.setState({ edit: { ...edit, parent2: selectedObj } });
                          }}
                        >
                          <option value="">Select parent (Optional)</option>
                          {this.props.parents.map(parent => (
                            <option key={parent.id} value={parent.id}>
                              {parent.name} ({parent.national_id})
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-outline-brand"
                    type="submit"
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    data-dismiss="modal"
                    type="button"
                    className="btn btn-outline-brand"
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

export default Modal;