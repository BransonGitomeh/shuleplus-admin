import React from "react";

class TableRow extends React.Component {
  state = {
    direction: "right"
  };

  render() {
    return (
      <>
        <tr data-row="0" className="kt-datatable__row kt-datatable__row--hover">
          <td style={{ width: "30px" }} className="kt-datatable__cell">
            <a
              href="javascript:void(0);"
              className="kt-datatable__toggle-detail"
              onClick={() => {
                if (this.state.direction === "right") {
                  return this.setState({ direction: "down" });
                }

                return this.setState({ direction: "right" });
              }}
            >
              <i className={`fa fa-caret-${this.state.direction}`}></i>
            </a>
          </td>
          {this.props.headers.map(header => {
            return (
              <td style={{ width: "130px" }} className="kt-datatable__cell">
                <span>{this.props.data[header.key]}</span>
              </td>
            );
          })}
        </tr>

        {this.state.direction === "right" ? null : (
          <tr className="kt-datatable__row-subtable kt-datatable__row-subtable--even">
            <td className="kt-datatable__subtable" colspan="9">
              <div
                id="child_data_local_1"
                className="kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--scroll kt-datatable--loaded"
              >
                <table
                  className="kt-datatable__table"
                  style={({ display: " block" }, { " max-height": " 300px;" })}
                >
                  <thead className="kt-datatable__head">
                    <tr className="kt-datatable__row">
                      <th
                        data-field="OrderID"
                        className="kt-datatable__cell kt-datatable__cell--sort"
                      >
                        <span style={{ width: " 165px;" }}>Student name</span>
                      </th>
                      <th
                        data-field="OrderID"
                        className="kt-datatable__cell kt-datatable__cell--sort"
                      >
                        <span style={{ width: " 165px;" }}>Gender</span>
                      </th>
                      <th
                        data-field="OrderID"
                        className="kt-datatable__cell kt-datatable__cell--sort"
                      >
                        <span style={{ width: " 165px;" }}>Route</span>
                      </th>
                    </tr>
                    
                  </thead>
                  <tbody
                    className="kt-datatable__body ps ps--active-y"
                    style={{ "max-height": "246px;" }}
                  >
                    <tr data-row="0" className="kt-datatable__row">
                      <td data-field="OrderID" className="kt-datatable__cell">
                        <span>
                          <span>Test student</span>
                        </span>
                      </td>
                      <td data-field="OrderID" className="kt-datatable__cell">
                        <span>
                          <span>Male</span>
                        </span>
                      </td>
                      <td data-field="OrderID" className="kt-datatable__cell">
                        <span>
                          <span>Route 1</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="kt-datatable__pager kt-datatable--paging-loaded"></div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }
}

export default TableRow;
