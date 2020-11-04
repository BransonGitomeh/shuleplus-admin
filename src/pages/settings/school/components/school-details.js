import React from 'react';

import { calculateTripDuration, calculateScheduleDuration } from "../../../../utils/time"
// src/pages/trip/components/trip-details.js
import Stat from "./stat";
import EditSchoolModal from "./edit_school_details.js";
import Data from "../../../../utils/data";


const editSchoolModalInstance = new EditSchoolModal();

export default class SchoolDetails extends React.Component {
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
  state = {
    school: {}
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
  render() {
    return (
      <>
        <EditSchoolModal edit={this.state.school} save={() => this.savePaymentDetail()} />
        <div class="kt-portlet__head">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">School Information</h3>
          </div>
        </div>

        <h5>School Name:  {this.state.school.name}</h5>
        <h5>School Phone:  {this.state.school.phone}</h5>
        <h5>School Email: {this.state.school.email}</h5>
        <h5>School Address: {this.state.school.address}</h5>

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
}