import React from "react";

class TableRow extends React.Component {
  state = {
    direction: "right"
  };

  render() {
    return (
      <>
        <tr data-row="0" className="kt-datatable__row kt-datatable__row--hover">
          {this.props.headers.map(header => {
            return (
              <td style={{ width: "150px" }} className="kt-datatable__cell">
                <span>{this.props.data[header.key]}</span>
              </td>
            );
          })}
          <td
            data-field="Actions"
            data-autohide-disabled="false"
            className="kt-datatable__cell"
            style={{ width: "110px" }}
          >
            <span
              style={{
                overflow: "visible",
                position: "relative",
                width: "110px"
              }}
            >
              {this.props.options.editable === true ? (
                <button
                  title="Edit details"
                  type="button"
                  className="btn btn-sm btn-clean btn-icon btn-icon-md"
                  onClick={() => {
                    this.props.edit(this.props.data);
                  }}
                >
                  <i style={{color: "#1dc9b7"}} className="la la-edit" />
                </button>
              ) : null}
              {this.props.options.deleteable === true ? (
                <button
                  title="Delete"
                  type="button"
                  className="btn btn-sm btn-clean btn-icon btn-icon-md"
                  onClick={() => {
                    this.props.delete(this.props.data);
                  }}
                >
                  <i style={{color: "#fd397a"}} className="la la-trash" />
                </button>
              ) : null}
            </span>
          </td>
        </tr>
      </>
    );
  }
}

export default TableRow;
