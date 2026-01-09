import React from "react";
import moment from "moment";
import Map from "./components/map"; // Assuming this accepts { locations }
import Data from "../../utils/data";
import DeleteModal from "./delete";

// Helper Icon Component
const Icon = ({ name, color }) => <i className={`fas fa-${name} mr-2`} style={{ color }}></i>;

class TripDetailsV2 extends React.Component {
  state = {
    trip: null,
    loading: true,
    remove: null
  };

  componentDidMount() {
    this.loadData();

    // Subscribe to live updates
    this.tripSub = Data.trips.subscribe(({ trips }) => {
      const updatedTrip = trips.find(t => t.id === this.props.id);
      if (updatedTrip) this.processTripData(updatedTrip);
    });
  }

  componentWillUnmount() {
    if (this.tripSub && typeof this.tripSub === 'function') this.tripSub();
  }

  loadData = () => {
    const trips = Data.trips.list();
    const trip = trips.find(t => t.id === this.props.id);
    if (trip) this.processTripData(trip);
  };

  processTripData = (trip) => {
    // 1. Identify Students assigned to this route
    const assignedStudents = trip.schedule?.route?.students || [];

    // 2. Map events to students for O(1) lookup
    const studentStatusMap = {};
    
    // Sort events: CHECKEDON first, then CHECKEDOFF to handle flow
    const sortedEvents = (trip.events || []).sort((a, b) => new Date(a.time) - new Date(b.time));

    sortedEvents.forEach(ev => {
        if(ev.student && ev.student.id) {
            if (!studentStatusMap[ev.student.id]) studentStatusMap[ev.student.id] = {};
            
            if (ev.type === 'CHECKEDON') {
                studentStatusMap[ev.student.id].onBoardTime = ev.time;
                studentStatusMap[ev.student.id].status = 'ON_BOARD';
            } else if (ev.type === 'CHECKEDOFF') {
                studentStatusMap[ev.student.id].dropOffTime = ev.time;
                studentStatusMap[ev.student.id].status = 'DROPPED';
            }
        }
    });

    // 3. Calculate Stats
    const total = assignedStudents.length;
    const dropped = Object.values(studentStatusMap).filter(s => s.status === 'DROPPED').length;
    const onBoard = Object.values(studentStatusMap).filter(s => s.status === 'ON_BOARD').length;

    this.setState({
      trip: {
        ...trip,
        assignedStudents,
        studentStatusMap,
        stats: { total, dropped, onBoard, pending: total - dropped - onBoard },
        sortedEvents: sortedEvents.reverse() // Newest first for timeline
      },
      loading: false
    });
  };

  getStatusBadge = (status) => {
    switch (status) {
      case 'DROPPED': return <span className="badge badge-success">Dropped Off</span>;
      case 'ON_BOARD': return <span className="badge badge-primary">On Bus</span>;
      default: return <span className="badge badge-secondary">Pending</span>;
    }
  };

  render() {
    const { trip, loading } = this.state;

    if (loading || !trip) return <div className="p-5 text-center">Loading Trip Details...</div>;

    const { schedule, bus, driver, assignedStudents, studentStatusMap, sortedEvents } = trip;

    return (
      <div className="container-fluid p-4" style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
        
        {/* --- Header Section --- */}
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h3 className="font-weight-bold mb-1">
                        {schedule?.route?.name || "Unknown Route"}
                    </h3>
                    <div className="text-muted">
                        <span className="mr-3"><Icon name="bus" color="#5d78ff" /> {bus?.make} ({bus?.plate})</span>
                        <span className="mr-3"><Icon name="user-tie" color="#5d78ff" /> {driver?.names}</span>
                        <span><Icon name="clock" color="#5d78ff" /> Started: {moment(trip.startedAt).format('h:mm A, MMM Do')}</span>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className={`font-weight-bold mb-0 ${trip.isCancelled ? 'text-danger' : trip.completedAt ? 'text-success' : 'text-primary'}`}>
                        {trip.isCancelled ? 'CANCELLED' : trip.completedAt ? 'COMPLETED' : 'LIVE'}
                    </h1>
                    <small className="text-muted">Trip Status</small>
                </div>
            </div>
        </div>

        <div className="row">
            {/* --- Left Column: Student Manifest --- */}
            <div className="col-lg-7">
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-header bg-white py-3 border-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 font-weight-bold">Student Manifest</h5>
                            <span className="badge badge-light-info font-size-lg">{assignedStudents.length} Students</span>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light text-muted text-uppercase small">
                                <tr>
                                    <th className="pl-4">Student Name</th>
                                    <th>Pick Up</th>
                                    <th>Drop Off</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedStudents.map(student => {
                                    const info = studentStatusMap[student.id] || {};
                                    return (
                                        <tr key={student.id}>
                                            <td className="pl-4 font-weight-bold text-dark">
                                                {student.names}
                                                <div className="small text-muted">{student.registration}</div>
                                            </td>
                                            <td>
                                                {info.onBoardTime ? (
                                                    <span className="text-dark">
                                                        <Icon name="check" color="green" />
                                                        {moment(info.onBoardTime).format('h:mm A')}
                                                    </span>
                                                ) : <span className="text-muted">-</span>}
                                            </td>
                                            <td>
                                                {info.dropOffTime ? (
                                                    <span className="text-dark">
                                                        <Icon name="map-marker-alt" color="red" />
                                                        {moment(info.dropOffTime).format('h:mm A')}
                                                    </span>
                                                ) : <span className="text-muted">-</span>}
                                            </td>
                                            <td>{this.getStatusBadge(info.status)}</td>
                                        </tr>
                                    );
                                })}
                                {assignedStudents.length === 0 && (
                                    <tr><td colSpan="4" className="text-center py-4">No students assigned to this route.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- Right Column: Map & Insights --- */}
            <div className="col-lg-5">
                
                {/* 1. Statistics Cards */}
                <div className="row mb-3">
                    <div className="col-4">
                        <div className="card bg-primary text-white p-3 text-center">
                            <h2 className="mb-0 font-weight-bold">{trip.stats.onBoard}</h2>
                            <small>On Bus</small>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card bg-success text-white p-3 text-center">
                            <h2 className="mb-0 font-weight-bold">{trip.stats.dropped}</h2>
                            <small>Dropped</small>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card bg-secondary text-white p-3 text-center">
                            <h2 className="mb-0 font-weight-bold">{trip.stats.pending}</h2>
                            <small>Pending</small>
                        </div>
                    </div>
                </div>

                {/* 2. Map Component */}
                <div className="card shadow-sm border-0 mb-4" style={{ height: '300px', overflow: 'hidden' }}>
                    {trip.locReports && trip.locReports.length > 0 ? (
                        <Map locations={trip.locReports} />
                    ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                            <div className="text-center">
                                <Icon name="map-marked-alt" color="#ccc" />
                                <p className="mt-2">No GPS Data Available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Recent Activity Timeline */}
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 font-weight-bold">Recent Activity</h5>
                    </div>
                    <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {sortedEvents.length > 0 ? (
                            <ul className="list-group list-group-flush">
                                {sortedEvents.map((ev, index) => (
                                    <li className="list-group-item" key={index}>
                                        <div className="d-flex align-items-center">
                                            <div className={`mr-3 rounded-circle d-flex align-items-center justify-content-center text-white`} 
                                                 style={{ 
                                                     width: 35, 
                                                     height: 35, 
                                                     backgroundColor: ev.type === 'CHECKEDOFF' ? '#1dc9b7' : '#5d78ff' 
                                                 }}>
                                                <i className={`fas fa-${ev.type === 'CHECKEDOFF' ? 'arrow-down' : 'arrow-up'}`}></i>
                                            </div>
                                            <div>
                                                <div className="font-weight-bold text-dark">{ev.student?.names || 'Unknown Student'}</div>
                                                <div className="small text-muted">
                                                    {ev.type === 'CHECKEDOFF' ? 'Dropped Off' : 'Boarded Bus'} • {moment(ev.time).fromNow()}
                                                </div>
                                            </div>
                                            <div className="ml-auto small font-weight-bold text-muted">
                                                {moment(ev.time).format('h:mm A')}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-muted">No events recorded yet.</div>
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

export default TripDetailsV2;