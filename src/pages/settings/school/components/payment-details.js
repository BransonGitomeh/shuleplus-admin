import React from 'react';

import { calculateTripDuration, calculateScheduleDuration } from "../../../../utils/time"
// src/pages/trip/components/trip-details.js
import Stat from "./stat";
import EditPaymentsModal from "./edit_payment_details.js";
import EditSchoolModal from "./edit_school_details.js";
import Data from "../../../../utils/data";

const editPaymentsModalInstance = new EditPaymentsModal();
const editSchoolModalInstance = new EditSchoolModal();

export default class PaymentDetails extends React.Component {
  componentDidMount() {
    if (Data.schools.getSelected()) {
      const school = Data.schools.getSelected();
      this.setState({ school });
    }

    Data.schools.subscribe(({ schools }) => {
      const school = Data.schools.getSelected();
      this.setState({ schools, school });
    });
  }
  async savePaymentDetail(school) {
    const {
      id,
      name,
      phone,
      email,
      address
    } = this.state.school

    Data.schools.update({
      id,
      name,
      phone,
      email,
      address
    })
  }
  state = {
    school: {}
  }
  render() {
    return (
      <>
        <EditPaymentsModal edit={this.state.school} save={() => this.savePaymentDetail()} />

        <div class="kt-portlet__head">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">Payments Information</h3>
          </div>
        </div>

        <h5>The MPESA number to be billed is: {this.state.school.phone}</h5>

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
}