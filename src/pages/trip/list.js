import React from "react";
import moment from "moment";
import Map from "./components/map";
import Data from "../../utils/data";
import DeleteModal from "./delete";

// Helper Icon Component
const Icon = ({ name, color }) => <i className={`fas fa-${name} mr-2`} style={{ color }}></i>;

class TripDetailsV3 extends React.Component {
  state = {
    trip: null,
    allStudentsCache: [], // Store full student list here
    loading: true,
    remove: null,
    searchTerm: ""
  };

  componentDidMount() {
    // 1. Get the full list of students (contains names, classes, etc.)
    const allStudents = Data.students.list();
    this.setState({ allStudentsCache: allStudents }, () => {
        this.loadTripData();
    });

    // 2. Subscribe to Student updates (in case data loads late)
    this.studentSub = Data.students.subscribe(({ students }) => {
        this.setState({ allStudentsCache: students }, () => {
            // Re-process trip data when students arrive to fill in the blanks
            if (this.state.trip) {
                this.processTripData(this.state.trip, students);
            }
        });
    });

    // 3. Subscribe to Trip updates (Live GPS/Events)
    this.tripSub = Data.trips.subscribe(({ trips }) => {
      const updatedTrip = trips.find(t => t.id === this.props.id);
      if (updatedTrip) {
          this.processTripData(updatedTrip, this.state.allStudentsCache);
      }
    });
  }

  componentWillUnmount() {
    if (this.tripSub) this.tripSub();
    if (this.studentSub) this.studentSub();
  }

  loadTripData = () => {
    const trips = Data.trips.list();
    const trip = trips.find(t => t.id === this.props.id);
    if (trip) this.processTripData(trip, this.state.allStudentsCache);
  };

  processTripData = (trip, allStudentsList) => {
    // 1. Get the list of student IDs attached to the route
    const rawRouteStudents = trip.schedule?.route?.students || [];

    // 2. HYDRATION STEP: Map IDs to full Student Objects
    const enrichedStudents = rawRouteStudents.map(partialStudent => {
        const fullDetails = allStudentsList.find(s => s.id === partialStudent.id);
        
        if (fullDetails) {
            return fullDetails;
        } else {
            return { 
                ...partialStudent, 
                names: "Loading Name...", 
                registration: "...", 
                parent_name: "..." 
            };
        }
    });

    // 3. Map events to specific students
    const studentStatusMap = {};
    const sortedEvents = (trip.events || []).sort((a, b) => new Date(a.time) - new Date(b.time));

    sortedEvents.forEach(ev => {
        const studentId = ev.student?.id || ev.student; 
        if (studentId) {
            if (!studentStatusMap[studentId]) studentStatusMap[studentId] = {};
            
            if (ev.type === 'CHECKEDON') {
                studentStatusMap[studentId].onBoardTime = ev.time;
                studentStatusMap[studentId].status = 'ON_BOARD';
            } else if (ev.type === 'CHECKEDOFF') {
                studentStatusMap[studentId].dropOffTime = ev.time;
                studentStatusMap[studentId].status = 'DROPPED';
            }
        }
    });

    // 4. Calculate Stats
    const total = enrichedStudents.length;
    const dropped = Object.values(studentStatusMap).filter(s => s.status === 'DROPPED').length;
    const onBoard = Object.values(studentStatusMap).filter(s => s.status === 'ON_BOARD').length;

    this.setState({
      trip: {
        ...trip,
        assignedStudents: enrichedStudents,
        studentStatusMap,
        stats: { total, dropped, onBoard, pending: total - dropped - onBoard },
        sortedEvents: sortedEvents.reverse()
      },
      loading: false
    });
  };

  getStatusBadge = (status) => {
    switch (status) {
      case 'DROPPED': return <span className="badge badge-success px-3 py-2">Dropped Off</span>;
      case 'ON_BOARD': return <span className="badge badge-primary px-3 py-2">On Bus</span>;
      default: return <span className="badge badge-light-secondary px-3 py-2 text-muted">Pending</span>;
    }
  };

  render() {
    const { trip, loading, searchTerm } = this.state;

    if (loading || !trip) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '50vh'}}>
            <div className="spinner-border text-primary" role="status"></div>
            <span className="ml-3">Loading Trip Data...</span>
        </div>
    );

    const { schedule, bus, driver, assignedStudents, studentStatusMap, sortedEvents } = trip;

    // Filter logic for the table search
    const filteredStudents = assignedStudents.filter(s => 
        (s.names || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.registration || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="container-fluid p-4" style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
        
        {/* --- Header Section --- */}
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <span className="badge badge-light-primary mb-2">Trip ID: {trip.id.substring(0, 8)}...</span>
                        <h3 className="font-weight-bold mb-1 text-dark">
                            {schedule?.route?.name || "Unknown Route"}
                        </h3>
                        <div className="d-flex flex-wrap mt-2">
                            <div className="mr-4 text-muted"><Icon name="bus" color="#5d78ff" /> {bus?.make} <strong className="text-dark">({bus?.plate})</strong></div>
                            <div className="mr-4 text-muted"><Icon name="user-tie" color="#5d78ff" /> {driver?.names || "No Driver"}</div>
                            <div className="text-muted"><Icon name="clock" color="#5d78ff" /> {moment(trip.startedAt).format('MMM Do, h:mm A')}</div>
                        </div>
                    </div>
                    <div className="text-right">
                         <div className={`p-2 rounded ${trip.isCancelled ? 'bg-light-danger text-danger' : trip.completedAt ? 'bg-light-success text-success' : 'bg-light-primary text-primary'}`}>
                             <h5 className="font-weight-bold mb-0 text-uppercase">
                                {trip.isCancelled ? 'Cancelled' : trip.completedAt ? 'Completed' : 'Running'}
                             </h5>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="row">
            {/* --- Left Column: Student Manifest --- */}
            <div className="col-lg-8">
                <div className="card shadow-sm border-0 mb-4 h-100">
                    <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 font-weight-bold">Student Manifest</h5>
                        
                        {/* Search Bar */}
                        <div className="input-group input-group-sm" style={{width: '200px'}}>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-light border-0"><i className="fas fa-search"></i></span>
                            </div>
                            <input 
                                type="text" 
                                className="form-control bg-light border-0" 
                                placeholder="Search student..."
                                value={searchTerm}
                                onChange={(e) => this.setState({searchTerm: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light text-muted text-uppercase small">
                                <tr>
                                    <th className="pl-4">Student Details</th>
                                    <th>Class</th>
                                    <th>Activity</th>
                                    <th className="text-center">Current Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => {
                                    const info = studentStatusMap[student.id] || {};
                                    return (
                                        <tr key={student.id}>
                                            <td className="pl-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="symbol symbol-40 symbol-light-info mr-3 rounded-circle d-flex align-items-center justify-content-center" style={{width:40, height:40, backgroundColor: '#e1f0ff'}}>
                                                        <span className="text-info font-weight-bold">{student.names ? student.names.charAt(0) : "?"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-dark font-weight-bold d-block">{student.names}</span>
                                                        <span className="text-muted small">{student.registration || "No Reg"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-light-secondary">{student.class?.name || "N/A"}</span>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column small">
                                                    {info.onBoardTime && (
                                                        <span className="text-primary mb-1">
                                                            <i className="fas fa-arrow-up mr-1"></i> {moment(info.onBoardTime).format('h:mm A')}
                                                        </span>
                                                    )}
                                                    {info.dropOffTime && (
                                                        <span className="text-success">
                                                            <i className="fas fa-arrow-down mr-1"></i> {moment(info.dropOffTime).format('h:mm A')}
                                                        </span>
                                                    )}
                                                    {!info.onBoardTime && !info.dropOffTime && <span className="text-muted">-</span>}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {this.getStatusBadge(info.status)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <tr><td colSpan="4" className="text-center py-5 text-muted">No students found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- Right Column: Map & Timeline --- */}
            <div className="col-lg-4">
                
                {/* Statistics Overview */}
                <div className="row mb-3">
                    <div className="col-4 pr-1">
                        <div className="card bg-white border-0 shadow-sm p-3 text-center">
                            <h3 className="mb-0 font-weight-bold text-primary">{trip.stats.onBoard}</h3>
                            <small className="text-muted font-weight-bold text-uppercase" style={{fontSize:'0.7rem'}}>On Bus</small>
                        </div>
                    </div>
                    <div className="col-4 px-1">
                        <div className="card bg-white border-0 shadow-sm p-3 text-center">
                            <h3 className="mb-0 font-weight-bold text-success">{trip.stats.dropped}</h3>
                            <small className="text-muted font-weight-bold text-uppercase" style={{fontSize:'0.7rem'}}>Dropped</small>
                        </div>
                    </div>
                    <div className="col-4 pl-1">
                        <div className="card bg-white border-0 shadow-sm p-3 text-center">
                            <h3 className="mb-0 font-weight-bold text-secondary">{trip.stats.pending}</h3>
                            <small className="text-muted font-weight-bold text-uppercase" style={{fontSize:'0.7rem'}}>Pending</small>
                        </div>
                    </div>
                </div>

                {/* Map Component */}
                <div className="card shadow-sm border-0 mb-4" style={{ height: '350px', overflow: 'hidden' }}>
                    {trip.locReports && trip.locReports.length > 0 ? (
                        <Map locations={trip.locReports} />
                    ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                            <div className="text-center">
                                <i className="fas fa-map-marked-alt fa-3x mb-3 text-secondary"></i>
                                <p className="mb-0">Waiting for GPS Data...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity Timeline */}
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 font-weight-bold">Live Activity Feed</h5>
                    </div>
                    <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {sortedEvents.length > 0 ? (
                            <ul className="list-group list-group-flush">
                                {sortedEvents.map((ev, index) => {
                                    // Try to resolve student name for the event timeline too
                                    const studentId = ev.student?.id || ev.student;
                                    const studentDetails = this.state.allStudentsCache.find(s => s.id === studentId);
                                    const studentName = studentDetails ? studentDetails.names : "Loading Name...";

                                    return (
                                        <li className="list-group-item" key={index}>
                                            <div className="d-flex align-items-center">
                                                <div className={`mr-3 rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm`} 
                                                     style={{ 
                                                         width: 35, 
                                                         height: 35, 
                                                         backgroundColor: ev.type === 'CHECKEDOFF' ? '#1dc9b7' : '#5d78ff' 
                                                     }}>
                                                    <i className={`fas fa-${ev.type === 'CHECKEDOFF' ? 'arrow-down' : 'arrow-up'}`}></i>
                                                </div>
                                                <div style={{flex: 1}}>
                                                    <div className="font-weight-bold text-dark">{studentName}</div>
                                                    <div className="small text-muted">
                                                        {ev.type === 'CHECKEDOFF' ? 'Dropped Off' : 'Boarded Bus'}
                                                    </div>
                                                </div>
                                                <div className="small font-weight-bold text-muted">
                                                    {moment(ev.time).format('h:mm A')}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-muted">
                                No scan events recorded yet.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
        
        <DeleteModal 
            remove={this.state.remove} 
            save={tripToDelete => Data.trips.delete(tripToDelete)} 
        />
      </div>
    );
  }
}

export default TripDetailsV3;