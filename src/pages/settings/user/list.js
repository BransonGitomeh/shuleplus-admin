import React from "react";

import Table from "./components/table";
import Map from "./components/map"
import TripDetails from "./components/trip-details";
import DeleteModal from "./delete";
import Data from "../../../utils/data";
import Stat from "../../home/components/stat";

import EditUserModal from "./components/edit_user_details.js";

const editUserModalInstance = new EditUserModal();

//const $ = window.$;
const deleteModalInstance = new DeleteModal();

class BasicTable extends React.Component {
  state = {
    trip: {},
    events: [],
    students: []
  };

  componentDidMount() {
    const students = Data.students.list();
    this.setState({ students });

    Data.students.subscribe(({ students }) => {
      this.setState({ students });
    });

    const trips = Data.trips.list();
    const trip = trips.find(t => t.id === this.props.id)
    trip && trip.schedule && this.setState({
      trip: {
        ...trip,
        name: trip.schedule.name,
        scheduledCompleteTime: trip.schedule.end_time,
        inBus: trip.events.filter(event => event.type === 'CHECKEDON').length || 0,
        offBus: trip.events.filter(event => event.type === 'CHECKEDOFF').length || 0,
      }
    });

    Data.trips.subscribe(({ trips }) => {
      const trip = trips.find(trip => trip.id === this.props.id)

      if (trip)
        this.setState({
          trip: {
            ...trip,
            name: trip.schedule ? trip.schedule.name : '',
            inBus: trip.events.filter(event => event.type === 'CHECKEDON').length || 0,
            offBus: trip.events.filter(event => event.type === 'CHECKEDOFF').length || 0,
          }
        });
    });



    /*const drivers = Data.drivers.list();
    this.setState({ drivers });*/
  }

  render() {

    const { remove, trip } = this.state;
    const events = trip.events ? trip.events.map(ev => ({ ...ev, name: ev.student ? ev.student.name : '' })) : []
    const students = trip.schedule && trip.schedule.route && trip.schedule.route.students

    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            {/* <DeleteModal
              remove={remove}
              save={trip => Data.trips.delete(trip)}
            /> */}

            <div className="kt-portlet__body" style={{ minHeight: "500px" }}>
              <div className="row">
                <div className="col-md-6">
                  <>
                    <div class="kt-portlet__head">
                      <div class="kt-portlet__head-label">
                        <h3 class="kt-portlet__head-title">Your Information</h3>
                      </div>
                    </div>
                    <h5>Your Username is : username1</h5>
                    <h5>Your Email : username1@gmail.com</h5>
                    <h5>Your Phone : 0711657108</h5>

                    <button
                      type="submit"
                      className="btn btn-outline-brand"
                      // disabled={this.state.loading}
                      onClick={() => editUserModalInstance.show()}
                    >
                      Change user details
                    </button>
                  </>


                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicTable;



