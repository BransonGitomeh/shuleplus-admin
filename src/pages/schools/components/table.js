import React from "react";

export default props => {
  if (!props.headers || !props.data) return null;
  const { options = { deleteable: true, editable: true } } = props;
  return (
    <table
      className="table"
      // width="100%"
      style={{
        "display": "block",
        "overflow-x": "auto",
        "white-space": "nowrap"
      }}
    >
      <thead>
        <tr>
          {props.headers.map(header => {
            return <th title="Field #0">{header.label}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {props.data.map(row => {
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
                      <i style={{color: "#1dc9b7"}} className="la la-edit" />
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
                  <button
                    title="Send"
                    type="button"
                    className="btn btn-sm btn-outline-primary mx-2"
                    onClick={() => {
                      props.invite(row);
                    }}
                  >
                    <i className="la la-envelope" />
                    <strong>Invite</strong>
                  </button>
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
