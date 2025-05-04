import React from 'react';

import Stat from "../../trip/components/stat";

export default ({ student }) => {
  const { route } = student
  return (
    <>
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">Student Information</h3>
        </div>
      </div>
      <table className="table table-head-noborder">
        <tbody>
          <tr>
            <th noWrap={true} scope="row"><i className="fas fa-user"></i></th>
            <td noWrap={true}>{student.names}</td>
          </tr>
          <tr>
            <th scope="row"><i className="fas fa-address-card"></i> </th>
            <td >{student.registration}</td>
          </tr>
          <tr>
            <th scope="row"><i className="fas fa-venus-mars"></i> </th>
            <td>{student.gender}</td>
          </tr>
          <tr>
            <th scope="row"><i className="fas fa-chalkboard-teacher"></i> </th>
            <td>{student.class_name}</td>
          </tr>
          {route && <tr>
            <th scope="row"><i className="fas fa-route"></i></th>
            <td>{route.name}</td>
          </tr>}
        </tbody>
      </table>
    </>
  )
}