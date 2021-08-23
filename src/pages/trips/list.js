import React from "react";
import moment from "moment";

import Table from "./components/table";
import DeleteModal from "./delete";
import Data from "../../utils/data";
import filters from './filters'

import Stat from "../home/components/stat";

//const $ = window.$;
const deleteModalInstance = new DeleteModal();

class BasicTable extends React.Component {
  state = {
    trips: [],
    filter: 'all',
    trips: [],
    schedules: [],
    complaints: [],
    students: 0
  };

  static getDerivedStateFromProps(props, state) {
    return {
      ...state,
      filter: props.filter
    }
  }

  componentDidMount() {
    const trips = Data.trips.list();
    this.setState({
      trips: trips.map(trip => {
        return {
          ...trip,
          inBus: trip.events.filter(event => event.type === 'CHECKEDON').length || 0,
          offBus: trip.events.filter(event => event.type === 'CHECKEDOFF').length || 0,
          name: trip.schedule ? trip.schedule.name : '',
          startedAt: moment(trip.startedAt).format('MMMM Do YYYY, h:mm:ss a'),
          completedAt: moment(trip.completedAt).format('MMMM Do YYYY, h:mm:ss a')
        }
      })
    });

    Data.trips.subscribe(({ trips }) => {
      this.setState({
        trips: trips.map(trip => {
          return {
            ...trip,
            inBus: trip.events.filter(event => event.type === 'CHECKEDON').length || 0,
            offBus: trip.events.filter(event => event.type === 'CHECKEDOFF').length || 0,
            name: trip.schedule ? trip.schedule.name : '',
            startedAt: moment(trip.startedAt).format('MMMM Do YYYY, h:mm:ss a'),
            completedAt: trip.completedAt ? moment(trip.completedAt).format('MMMM Do YYYY, h:mm:ss a') : ''
          }
        })
      });
    });

    const complaints = Data.complaints.list();
    this.setState({ complaints });

    const schedules = Data.schedules.list();
    this.setState({ schedules });

    Data.schedules.subscribe(schedules => {
      this.setState(schedules);
    });
  }

  onClickHandler(trip) {
    window.location = `#/trip/${trip.id}`
  }

  render() {
    const { remove, trips, filter } = this.state;


    let filteredTrips = []
    if (this.state.trips.length > 0) {
      filteredTrips = trips
    }

    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="row">
            <div className="col-lg-2 col-xl-2">
              <Stat label="All trips" number={this.state.trips.length} />
            </div>
            <div className="col-lg-2 col-xl-2">
              <Stat
                label="Running Trips"
                number={
                  this.state.trips.filter(
                    trip => !trip.completedAt && !trip.isCancelled
                  ).length
                }
              />
            </div>
            <div className="col-lg-2 col-xl-2">
              <Stat
                label="Scheduled trips"
                number={this.state.schedules.length}
              />
            </div>
            <div className="col-lg-2 col-xl-2">
              <Stat
                label="Complete trips"
                number={
                  this.state.trips.filter(trip => trip.completedAt).length
                }
              />
            </div>
            <div className="col-lg-2 col-xl-2">
              <Stat
                label="Cancelled trips"
                number={
                  this.state.trips.filter(trip => trip.isCancelled).length
                }
              />
            </div>
            <div className="col-lg-2 col-xl-2">
              <Stat label="Students In Bus" number={this.state.students} />
            </div>
          </div>
          <div className="kt-portlet kt-portlet--mobile">
            <DeleteModal
              remove={remove}
              save={trip => Data.trips.delete(trip)}
            />
            <div className="kt-portlet__body">
              {/*begin: Search Form */}
              <div className="kt-form kt-fork--label-right kt-margin-t-20 kt-margin-b-10">
                <div className="row align-items-center">
                  <div className="col-xl-8 order-2 order-xl-1">
                    <div className="row align-items-center">
                      <div className="col-md-4 kt-margin-b-20-tablet-and-mobile">
                        <div class="dropdown dropdown-inline">
                          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Filter
							          </button>
                          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <a class="dropdown-item" href="#/trips/all">All</a>
                            <a class="dropdown-item" href="#/trips/running">Running</a>
                            <a class="dropdown-item" href="#/schedules">Scheduled</a>
                            <a class="dropdown-item" href="#/trips/complete">Completed</a>
                            <a class="dropdown-item" href="#/trips/cancelled">Cancelled</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*end: Search Form */}
            </div>
            <div className="kt-portlet__body" style={{ minHeight: "500px" }}>
              <Table
                headers={[
                  {
                    label: "Trip / Route",
                    component: (row) => (<td>
                      <i style={{ color: "green" }} class="fas fa-wave-square"></i> {row.schedule ? row.schedule.route.name : ''}
                      <br></br>
                      <i class="fas fa-user-tie"></i> {row.driver ? row.driver.username : ''}
                    </td>)
                  },
                  {
                    label: "Vehicle",
                    component: (row) => (<td>
                      {row.bus ? row.bus.make : ''}
                      <br></br>
                      ({row.bus ? row.bus.plate : ''})
                    </td>)
                  },
                  {
                    label: "Start/End",
                    component: (row) => (<td>
                      <i style={{ color: "green" }} class="fas fa-play"></i> {row.startedAt}
                      <br></br>
                      <i style={{ color: "red" }} class="fas fa-stop"></i> {row.completedAt}
                    </td>)
                  },
                  {
                    label: "On-Board",
                    component: (row) => (<td style={{ 'font-size': "23px", color: "red" }}>
                      <i class="fas fa-level-up-alt"></i> {row.inBus}
                    </td>)
                  },
                  {
                    label: "Off-Board",
                    component: (row) => (<td style={{ 'font-size': "23px", color: "blue" }}>
                      <i class="fas fa-level-down-alt"></i> {row.offBus}
                    </td>)
                  },
                  {
                    label: "In-Bus",
                    component: (row) => {
                      if (!row.schedule)
                        return (<td style={{ 'font-size': "23px", color: "red" }}>
                          <i class="fas fa-bus-alt"></i> {0}
                        </td>)

                      return (<td style={{ 'font-size': "23px", color: "red" }}>
                        <i class="fas fa-bus-alt"></i> {row.schedule.route.students.length}
                      </td>)
                    }
                  },
                ]}
                data={filteredTrips}
                delete={trip => {
                  this.setState({ remove: trip }, () => {
                    deleteModalInstance.show();
                  });
                }}
                onClick={this.onClickHandler}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicTable;



