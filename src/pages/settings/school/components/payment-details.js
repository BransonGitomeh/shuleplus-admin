import React from 'react';

import { calculateTripDuration, calculateScheduleDuration } from "../../../../utils/time"
// src/pages/trip/components/trip-details.js
import Stat from "./stat";
import EditPaymentsModal from "./edit_payment_details.js";
import EditSchoolModal from "./edit_school_details.js";
const editPaymentsModalInstance = new EditPaymentsModal();
const editSchoolModalInstance = new EditSchoolModal();

export default ({ trip, stats }) => {
  let { driver = {}, bus = {}, schedule = { route: {} }, completedAt, startedAt } = trip

  if (!driver)
    driver = {}

  return (
    <>
      <EditPaymentsModal
        // remove={remove}
        // save={trip => Data.trips.delete(trip)
      />
      <div class="kt-portlet__head">
        <div class="kt-portlet__head-label">
          <h3 class="kt-portlet__head-title">Payments Information</h3>
        </div>
      </div>

      <h5>The MPESA number to be billed is: 0711657108</h5>

      <button
        type="submit"
        className="btn btn-outline-brand"
        onClick={() => editPaymentsModalInstance.show()}
      // disabled={this.state.loading}
      >
            Change payments details
      </button>
    </>
  )
}