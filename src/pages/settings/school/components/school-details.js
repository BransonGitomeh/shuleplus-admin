import React from 'react';

import { calculateTripDuration, calculateScheduleDuration } from "../../../../utils/time"
// src/pages/trip/components/trip-details.js
import Stat from "./stat";
import EditSchoolModal from "./edit_school_details.js";
const editSchoolModalInstance = new EditSchoolModal();

export default ({ trip, stats }) => {
  let { driver = {}, bus = {}, schedule = { route: {} }, completedAt, startedAt } = trip

  if (!driver)
    driver = {}

  return (
    <>
      <EditSchoolModal />
      <div class="kt-portlet__head">
        <div class="kt-portlet__head-label">
          <h3 class="kt-portlet__head-title">School Information</h3>
        </div>
      </div>

      <h5>School Name:  School name one</h5>
      <h5>School Phone:  School name one</h5>
      <h5>School Email: School@gmail.com</h5>
      <h5>School Address: address @ somewhere</h5>

      <button
        type="submit"
        className="btn btn-outline-brand"
        // disabled={this.state.loading}
        onClick={() => editSchoolModalInstance.show()}
      >
        Change school details
      </button>
    </>
  )
}