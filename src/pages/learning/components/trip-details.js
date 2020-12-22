import React from 'react';

import { calculateTripDuration, calculateScheduleDuration } from "../../../utils/time"
// src/pages/trip/components/trip-details.js
import Stat from "./stat";

export default ({ trip, stats }) => {
  let { driver = {}, bus = {}, schedule = { route: {} }, completedAt, startedAt } = trip

  if (!driver)
    driver = {}

  return (
    <>
      <div class="kt-portlet__head">
        <div class="kt-portlet__head-label">
          <h3 class="kt-portlet__head-title">Trip Information</h3>
        </div>
      </div>
      <table class="table table-head-noborder">
        <tbody>
          <tr>
            <th noWrap={true} scope="row"><i class="fas fa-wave-square"></i></th>
            <td noWrap={true}>{schedule.route.name}</td>
            <td rowSpan={5} style={{ width: '300px' }}>Note: </td>
          </tr>
          <tr>
            <th scope="row"><i class="fas fa-address-card"></i> </th>
            <td >{driver.username}</td>
          </tr>
          <tr>
            <th scope="row"><i class="fas fa-bus-alt"></i> </th>
            <td>{bus.plate}</td>
          </tr>
          <tr>
            <th scope="row"><i class="fas fa-tachometer-alt"></i></th>
            <td>{completedAt != "" ? "Completed" : "Not Completed"}</td>
          </tr>
          {/* <tr>
            <th scope="row"><i class="fas fa-business-time"></i></th>
            <td>0.57m delayed</td>
          </tr> */}
        </tbody>
      </table>

      <table class="table table-bordered m-table">
        <thead>
          <tr>
            <th></th>
            <th>Expected</th>
            <th>Actual</th>
            {/* <th>Summary</th> */}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Start</th>
            <td>{schedule.time}</td>
            <td>{startedAt != "" ? new Date(startedAt).toLocaleTimeString() : "~"}</td>
            {/* <td>{trip.startedAt ? '~' : moment.utc(moment(new Date(trip.startedAt).toLocaleTimeString(), "DD/MM/YYYY HH:mm:ss").diff(moment(new Date(trip.schedule.time).toLocaleTimeString(), "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss")}</td> */}
          </tr>
          <tr>
            <th scope="row">End</th>
            <td>{schedule.end_time}</td>
            <td>{completedAt != "" ? new Date(completedAt).toLocaleTimeString() : "~"}</td>
            {/* <td>{trip.completedAt ? '~' : moment.utc(moment(new Date(trip.completedAt).toLocaleTimeString(), "DD/MM/YYYY HH:mm:ss").diff(moment(new Date(trip.schedule.end_time).toLocaleTimeString(), "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss")}</td> */}
          </tr>
          <tr>
            <th scope="row">Trip Time</th>
            <td>{calculateScheduleDuration({ start: schedule.time, end: schedule.end_time })}</td>
            <td>{calculateTripDuration({start: startedAt, end: completedAt})}</td>
            {/* <td>0h 32m less</td> */}
          </tr>
        </tbody>
      </table>
    </>
  )
}