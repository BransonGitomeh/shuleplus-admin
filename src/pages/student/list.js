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
    student && this.setState({ student: { ...student, parents: [ student.parent, student.parent2 ]} })

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
              save={student => Data.student.delete(student)}
            />
            <div className="kt-portlet__body">

            </div>
            <div className="kt-portlet__body" style={{ minHeight: "500px" }}>
              <div className="row">
                <StudentDetails
                  student={student}
                />
                <div className="kt-portlet__head">
                  <div className="kt-portlet__head-label">
                    <h3 className="kt-portlet__head-title">Parent Details</h3>
                  </div>
                </div>
                <br></br>
                <Table
                  headers={[
                    {
                      label: "Name",
                      view: row => row?.name
                    },
                    {
                      label: "National ID",
                      view: row => row?.national_id
                    }
                  ]}
                  data={[this.state.student.parent, this.state.student.parent2]}
                  delete={student => {
                    this.setState({ remove: student }, () => {
                      deleteModalInstance.show();
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicTable;



