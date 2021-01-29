import React from "react";

export default props => {
  if (!props.headers || !props.data) return null;
  const { options = { deleteable: true, addable: true } } = props;
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
                  {options.addable === true ? (
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        props.add(row);
                      }}
                    >
                      <i class="la la-plus-circle"></i> Add
                    </button>
                  ) : null}
                  {options.deleteable === true ? (
                    <button 
                      type="button" 
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        props.remove(row);
                      }}
                    >
                      <i class="la la-minus-circle"></i> Remove
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
