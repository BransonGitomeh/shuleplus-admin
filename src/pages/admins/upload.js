import React from "react";
import DeleteModal from "./deleteUploadRow";
import readXlsx from "read-excel-file"

// import "jquery-validation";
// import $ from "jquery";

import Table from "./components/table";

const IDeleteModal = new DeleteModal();

// window.jQuery = window.$ = $;
const $ = window.$;

const modalNumber = Math.random()
  .toString()
  .split(".")[1];

class Modal extends React.Component {
  state = {
    loading: false,
    admins:[]
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
    this.validator = $("#" + modalNumber + "form").validate({
      errorClass: "invalid-feedback",
      errorElement: "div",

      highlight: function(element) {
        $(element).addClass("is-invalid");
      },
      unhighlight: function(element) {
        $(element).removeClass("is-invalid");
      },

      async submitHandler(form, event) {
        event.preventDefault();
        try {
          _this.setState({ loading: true });
          await _this.props.save(_this.state.admins);
          _this.hide();
          _this.setState({ loading: false });
        } catch (err) {
          _this.setState({ error: err.message });
          _this.setState({ loading: false });
        }
      }
    });
  }

  onChange = e => {
    readXlsx(e.target.files[0]).then(rows => {
      const admins = rows.map(([
        username,
        phone,
        email,
        licence_number,
        license_expiry,
        home,
        experience,
        password
      ]) => ({
        username,
        phone: `${phone}`,
        email,
        licence_number: `${licence_number}`,
        license_expiry: `${license_expiry}`,
        home,
        experience: `${experience}`,
        password
      }))

      this.setState({ admins })
    })
  }
  render() {
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
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <DeleteModal
                remove={this.state.remove}
                save={() => {
                  // remove from state
                }}
              />
              <form
                id={modalNumber + "form"}
                className="kt-form kt-form--label-right"
              >
                <div className="modal-header">
                  <h5 className="modal-title">Upload Admins</h5>
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
                    <div
                      className="alert alert-light alert-elevate fade show"
                      role="alert"
                    >
                      <div className="alert-icon">
                        <i className="flaticon-warning kt-font-brand" />
                      </div>
                      <div className="alert-text">
                        Please upload an Excell sheet with the following
                        collumns in the following order
                        {/* <br/> */}
                        <code>admin_names, admin_phone, admin_email etc</code>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-lg-12">
                        <label>Excel File:</label>
                        <input
                          className="form-control"
                          id="fullname"
                          name="excell-file"
                          type="file"
                          required
                          onChange={this.onChange}
                        />
                      </div>
                    </div>
                    {/*begin: Datatable */}
                    <Table
                      headers={[
                        {
                          label: "Admins Names",
                          key: "username"
                        },
                        {
                          label: "Email",
                          key: "email"
                        },
                        {
                          label: "Phone",
                          key: "phone"
                        }
                      ]}
                      options={{
                        deleteable: true,
                        editable: false
                      }}
                      data={this.state.admins}
                      delete={admin => {
                        this.setState({ remove: admin }, () => {
                          IDeleteModal.show();
                        });

                        // rm from state to not send to server
                        // this.setState(admins:[...admins])
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
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
