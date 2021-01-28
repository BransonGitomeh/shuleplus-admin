import React from "react";
import Row from "./table-row";

export default props => {
  if (!props.headers || !props.data) return null;
  const { options = { deleteable: true, editable: true } } = props;
  return (
    <div className="kt_datatable kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded">
      <table
        className="kt-datatable__table"
      >
        <thead className="kt-datatable__head">
          <tr className="kt-datatable__row">
            <th style={{ width: "30px" }} className="kt-datatable__cell"></th>
            {props.headers.map(header => {
              return <th style={{ width: "150px" }} className="kt-datatable__cell">{header.label}</th>;
            })}
            <th style={{ width: "110px" }} className="kt-datatable__cell"></th>
          </tr>
        </thead>
        <tbody className="kt-datatable__body">
          {props.data.map(row => {
            return (
              <Row
                key={Math.random().toString()}
                headers={props.headers}
                data={row}
                edit={() => props.edit(row)}
                invite={() => props.invite(row)}
                delete={() => props.delete(row)}
                options={options}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
