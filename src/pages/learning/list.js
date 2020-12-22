import React from "react";

import Table from "./components/table";
import Map from "./components/map"
import TripDetails from "./components/trip-details";
import DeleteModal from "./delete";
import Data from "../../utils/data";
import Stat from "../home/components/stat";

import "./scrolling.css"

//const $ = window.$;
const deleteModalInstance = new DeleteModal();

class BasicTable extends React.Component {
  state = {
    trip: {},
    events: [],
    students: []
  };

  componentDidMount() {
    const grades = Data.grades.list();
    this.setState({ grades });

    Data.grades.subscribe(({ grades }) => {
      console.log({ grades })
      this.setState({ grades });
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
            <DeleteModal
              remove={remove}
              save={trip => Data.trips.delete(trip)}
            />
            <div class="kt-portlet__head">
              <div class="kt-portlet__head-label">
                <h3 class="kt-portlet__head-title">Student Learning</h3>
              </div>
            </div>
            <div className="kt-portlet__body">
              <div style={{ minHeight: "500px" }} className="row scrolling-wrapper flex-row flex-nowrap mt-4 pb-4">
                <div className="col-md-4">
                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Grades</h3>

                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right">Add</button>
                    </div>

                  </div>
                  <br></br>

                  <ul className="list-group">
                    <li className="list-group-item disabled">
                      Grade One
                      <button type="button" class="btn btn-outline-primary btn-sm pull-right">edit</button>
                    </li>
                  </ul>




                </div>

                <div className="col-md-4">
                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Subjects</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right">Add</button>
                    </div>
                  </div>
                  <br></br>

                  <ul className="list-group">
                    <li className="list-group-item disabled">
                      Subject One
                      <button type="button" class="btn btn-primary pull-right">Primary</button>
                    </li>
                  </ul>
                </div>

                <div className="col-md-4">

                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Topics</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right">Add</button>
                    </div>
                  </div>
                  <br></br>

                  <ul className="list-group">
                    <li className="list-group-item disabled">
                      Topic One
                      <button type="button" class="btn btn-primary pull-right">Primary</button>
                    </li>
                  </ul>
                </div>

                <div className="col-md-4">

                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Subtopics</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right">Add</button>
                    </div>
                  </div>
                  <br></br>

                  <ul className="list-group">
                    <li className="list-group-item disabled">
                      Subtopic One
                      <button type="button" class="btn btn-primary pull-right">Primary</button>
                    </li>
                  </ul>
                </div>

                <div className="col-md-4">

                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Question</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right">Add</button>
                    </div>
                  </div>
                  <br></br>

                  <ul className="list-group">
                    <li className="list-group-item disabled">
                      Question One
                      <button type="button" class="btn btn-primary pull-right">Primary</button>
                    </li>
                  </ul>
                </div>

                <div className="col-md-4">

                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Posible Answers</h3>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <button type="button" class="btn btn-primary pull-right">Add</button>
                    </div>
                  </div>
                  <br></br>

                  <ul className="list-group">
                    <li className="list-group-item disabled">
                      Answer One
                      <button type="button" class="btn btn-primary pull-right">Primary</button>
                    </li>
                  </ul>
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



