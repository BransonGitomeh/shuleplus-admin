import React from "react";

export default props => {
  if (!props.headers || !props.data) return null;
  const { options = { deleteable: true, editable: true, linkable: true } } = props;
  return (props.data && props.data.length > 0 &&
    <table
      className="table table-striped table-bordered table-hover table-sm"
    // width="100%"
      style={{
        "overflowX": "auto",
        "whiteSpace": "nowrap"
      }}
    >
      <thead>
        <tr>
          <th title="Field #0">Name</th>
          <th title="Field #0">Actions</th>
        </tr> 
      </thead>
      <tbody>
        {props.data && props.data.map(row => {
          return (
            <tr key={Math.random().toString()}>
              {props.headers.map(header => {
                return <td>{row[header.key]}</td>;
              })}

              <td
                data-field="Actions"
                data-autohide-disabled="false"
                className="kt-datatable__cell"
              >
                <span
                  style={{
                    overflow: "visible",
                    position: "relative",
                    width: "110px"
                  }}
                >
                  {options.editable === true ? (
                    <button
                      title="Edit details"
                      type="button"
                      className="btn btn-sm btn-clean btn-icon btn-icon-md"
                      onClick={() => {
                        props.edit(row);
                      }}
                    >
                      <i style={{color: "#5867dd"}} className="la la-edit" />
                    </button>
                  ) : null}
                  {options.deleteable === true ? (
                    <button
                      title="Delete"
                      type="button"
                      className="btn btn-sm btn-clean btn-icon btn-icon-md"
                      onClick={() => {
                        props.delete(row);
                      }}
                    >
                      <i style={{color: "#fd397a"}} className="la la-trash" />
                    </button>
                  ) : null}
                  {options.linkable === true ? (
                    <button
                      title="Delete"
                      type="button"
                      className="btn btn-sm btn-clean btn-icon btn-icon-md"
                      onClick={() => {
                        props.show(row);
                      }}
                    >
                      <i style={{color: "#1dc9b7"}} className="la la-eye" />
                    </button>
                  ) : null}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
