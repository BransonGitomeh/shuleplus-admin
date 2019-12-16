import React from "react";

import Table from "./components/table";
import StudentDetails from "./components/student-details";
import DeleteModal from "./delete";
import Data from "../../utils/data";
import Stat from "../home/components/stat";

//const $ = window.$;
const deleteModalInstance = new DeleteModal();

class BasicTable extends React.Component {
  state = {
    student: {},
    remove:{}
  };

  componentDidMount() {
    const students = Data.students.list();
    const student = students.find(s => s.id === this.props.id)
    student && this.setState({ student })

    Data.students.subscribe(({ students }) => {
      const student = students.find(s => s.id === this.props.id)
      student && this.setState({ student })
    });
  }

  render() {

    const { remove, student } = this.state;

    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            <DeleteModal
              remove={remove}
              save={student => Data.trips.delete(student)}
            />
            <div className="kt-portlet__body">

            </div>
            <div className="kt-portlet__body" style={{ minHeight: "500px" }}>
              <div className="row">
                <div className="col-md-6">
                  <StudentDetails
                    student={student}
                  />

                  <div class="kt-portlet__head">
                    <div class="kt-portlet__head-label">
                      <h3 class="kt-portlet__head-title">Student Details</h3>
                    </div>
                  </div>

                  <br></br>

                  {/* <Table
                    headers={[
                      {
                        label: "Student",
                        view: (row) => {
                          return row.student.names
                        }
                      },
                      {
                        label: "Event",
                        view: (row) => {
                          return row.type
                        }
                      },
                      {
                        label: "Time",
                        view: (row) => row.time
                      },

                    ]}
                    data={events}
                    delete={trip => {
                      this.setState({ remove: trip }, () => {
                        deleteModalInstance.show();
                      });
                    }}
                  /> */}
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



