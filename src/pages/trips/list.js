import React from "react";
import moment from "moment";
import { Modal, ProgressBar } from "react-bootstrap"; // Assuming bootstrap is available based on classNames
import Data from "../../utils/data";
import DeleteModal from "./delete";

// Icons (FontAwesome 5 assumed based on previous code)
const Icon = ({ name, color, size }) => <i className={`fas fa-${name}`} style={{ color, fontSize: size || 'inherit' }}></i>;

const deleteModalInstance = new DeleteModal();

class DashboardV2 extends React.Component {
  state = {
    trips: [],
    schedules: [],
    recentDropOffs: [], // New Insight Data
    studentsOnBusCount: 0,
    loading: true,
    selectedTrip: null, // For the Manifest Modal
    filter: 'all'
  };

  componentDidMount() {
    this.initData();
  }

  initData = () => {
    // Initial Fetch
    this.processTrips(Data.trips.list());
    this.setState({ schedules: Data.schedules.list() });

    // Subscriptions
    this.tripSub = Data.trips.subscribe(({ trips }) => this.processTrips(trips));
    this.schedSub = Data.schedules.subscribe(schedules => this.setState({ schedules }));
  };

  componentWillUnmount() {
    if (this.tripSub) this.tripSub();
    if (this.schedSub) this.schedSub();
  }

  processTrips = (rawTrips) => {
    let globalStudentCount = 0;
    let allDropOffEvents = [];

    const processedTrips = rawTrips.map(trip => {
      // Analyze Events
      const onBoardEvents = trip.events?.filter(e => e.type === 'CHECKEDON') || [];
      const dropOffEvents = trip.events?.filter(e => e.type === 'CHECKEDOFF') || [];
      
      // Calculate current load
      const currentLoad = onBoardEvents.length - dropOffEvents.length;
      globalStudentCount += (currentLoad > 0 ? currentLoad : 0);

      // Collect Drop-off insights
      dropOffEvents.forEach(evt => {
        allDropOffEvents.push({
            id: evt.time + evt.student?.id, // Unique key
            studentName: evt.student?.names || "Unknown Student",
            busPlate: trip.bus?.plate || "Unknown Bus",
            busMake: trip.bus?.make,
            route: trip.schedule?.route?.name,
            time: evt.time,
            tripId: trip.id
        });
      });

      return {
        ...trip,
        busName: trip.bus ? `${trip.bus.make} (${trip.bus.plate})` : 'Unassigned',
        driverName: trip.driver ? trip.driver.names : 'Unassigned',
        routeName: trip.schedule?.route?.name || 'No Route',
        progress: this.calculateProgress(trip),
        stats: {
          total: trip.schedule?.route?.students?.length || 0,
          dropped: dropOffEvents.length,
          pending: (trip.schedule?.route?.students?.length || 0) - dropOffEvents.length
        }
      };
    });

    // Sort Drop-offs by most recent
    allDropOffEvents.sort((a, b) => new Date(b.time) - new Date(a.time));

    this.setState({
      trips: processedTrips,
      studentsOnBusCount: globalStudentCount,
      recentDropOffs: allDropOffEvents.slice(0, 10), // Top 10 most recent
      loading: false
    });
  };

  calculateProgress = (trip) => {
    const total = trip.schedule?.route?.students?.length || 1;
    const dropped = trip.events?.filter(e => e.type === 'CHECKEDOFF').length || 0;
    return Math.round((dropped / total) * 100);
  };

  openManifest = (trip) => {
    this.setState({ selectedTrip: trip });
  };

  render() {
    const { trips, recentDropOffs, selectedTrip } = this.state;

    // Filtering
    const displayedTrips = trips.filter(t => {
        if (window.location.hash.includes('running')) return !t.completedAt && !t.isCancelled;
        if (window.location.hash.includes('complete')) return t.completedAt;
        if (window.location.hash.includes('cancelled')) return t.isCancelled;
        return true;
    });

    return (
      <div className="container-fluid p-4" style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
        
        {/* --- Top Stats Row --- */}
        <div className="row mb-4">
            <StatCard icon="bus" color="#5d78ff" label="Running Trips" value={trips.filter(t => !t.completedAt && !t.isCancelled).length} />
            <StatCard icon="check-circle" color="#0abb87" label="Completed" value={trips.filter(t => t.completedAt).length} />
            <StatCard icon="users" color="#fd3995" label="Students On-board" value={this.state.studentsOnBusCount} />
            <StatCard icon="exclamation-triangle" color="#ffb822" label="Cancelled" value={trips.filter(t => t.isCancelled).length} />
        </div>

        <div className="row">
            {/* --- Left Column: Active Trips Table --- */}
            <div className="col-lg-8">
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 font-weight-bold text-dark">Trip Management</h5>
                        <div className="dropdown">
                            <button className="btn btn-sm btn-light dropdown-toggle" data-toggle="dropdown">Filter Status</button>
                            <div className="dropdown-menu dropdown-menu-right">
                                <a className="dropdown-item" href="#/trips/all">All Trips</a>
                                <a className="dropdown-item" href="#/trips/running">Running</a>
                                <a className="dropdown-item" href="#/trips/complete">Completed</a>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0 table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-muted">
                                <tr>
                                    <th className="pl-4">Route / Bus</th>
                                    <th>Driver</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedTrips.map(trip => (
                                    <tr key={trip.id} style={{ cursor: 'pointer' }} onClick={() => this.openManifest(trip)}>
                                        <td className="pl-4">
                                            <div className="d-flex align-items-center">
                                                <div className="symbol symbol-40 flex-shrink-0 mr-3">
                                                    <div className="symbol-label bg-light-primary"><Icon name="route" color="#5d78ff"/></div>
                                                </div>
                                                <div>
                                                    <div className="font-weight-bold text-dark">{trip.routeName}</div>
                                                    <div className="text-muted small">{trip.busName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="symbol symbol-30 flex-shrink-0 mr-2">
                                                    <div className="symbol-label bg-light-info text-info font-weight-bold">
                                                        {trip.driverName.charAt(0)}
                                                    </div>
                                                </div>
                                                <span className="text-dark font-weight-500">{trip.driverName}</span>
                                            </div>
                                        </td>
                                        <td style={{ minWidth: '120px' }}>
                                            <div className="d-flex flex-column">
                                                <span className="text-muted small mb-1">
                                                    {trip.stats.dropped} / {trip.stats.total} Dropped
                                                </span>
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div 
                                                        className={`progress-bar ${trip.isCancelled ? 'bg-danger' : trip.completedAt ? 'bg-success' : 'bg-primary'}`} 
                                                        role="progressbar" 
                                                        style={{ width: `${trip.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {trip.isCancelled ? <span className="badge badge-light-danger">Cancelled</span> :
                                             trip.completedAt ? <span className="badge badge-light-success">Completed</span> :
                                             <span className="badge badge-light-primary">Running</span>}
                                        </td>
                                        <td>
                                            <button className="btn btn-icon btn-light-primary btn-sm mr-2">
                                                <Icon name="eye" size="12px" />
                                            </button>
                                            <button className="btn btn-icon btn-light-danger btn-sm" onClick={(e) => { e.stopPropagation(); this.setState({remove: trip}, () => deleteModalInstance.show())}}>
                                                <Icon name="trash" size="12px" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {displayedTrips.length === 0 && (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">No trips found matching filter.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- Right Column: Live Drop-off Insights --- */}
            <div className="col-lg-4">
                <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 font-weight-bold text-dark">
                            <Icon name="satellite-dish" color="#ffb822" className="mr-2"/>
                            Live Drop-off Feed
                        </h5>
                        <small className="text-muted">Real-time student drop-offs</small>
                    </div>
                    <div className="card-body p-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {recentDropOffs.length === 0 ? (
                             <div className="text-center p-4 text-muted">Waiting for activity...</div>
                        ) : (
                            <div className="timeline timeline-3 p-4">
                                {recentDropOffs.map(event => (
                                    <div className="timeline-item d-flex mb-4" key={event.id}>
                                        <div className="timeline-badge bg-success flex-shrink-0 mt-1" style={{ width: '10px', height: '10px', borderRadius: '50%' }}></div>
                                        <div className="timeline-content ml-3 border-left pl-3" style={{ borderColor: '#ebedf2' }}>
                                            <div className="d-flex align-items-center justify-content-between mb-1">
                                                <span className="font-weight-bold text-dark">{event.studentName}</span>
                                                <span className="text-muted small">{moment(event.time).fromNow()}</span>
                                            </div>
                                            <p className="mb-0 text-muted small">
                                                Dropped by <span className="text-primary font-weight-bold">{event.busPlate}</span>
                                            </p>
                                            <span className="badge badge-light-secondary mt-1" style={{ fontSize: '0.7rem' }}>{event.route}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* --- Modal: Trip Manifest & Insights --- */}
        {selectedTrip && (
            <ManifestModal 
                trip={selectedTrip} 
                onClose={() => this.setState({ selectedTrip: null })} 
            />
        )}
        
        <DeleteModal remove={this.state.remove} save={trip => Data.trips.delete(trip)} />
      </div>
    );
  }
}

// --- Helper Components ---

const StatCard = ({ icon, color, label, value }) => (
    <div className="col-6 col-md-3 mb-3">
        <div className="card shadow-sm border-0 h-100 p-3 d-flex flex-row align-items-center">
            <div className="d-flex align-items-center justify-content-center rounded mr-3" style={{ width: 50, height: 50, backgroundColor: `${color}20` }}>
                <Icon name={icon} color={color} size="20px" />
            </div>
            <div>
                <h3 className="font-weight-bold mb-0 text-dark">{value}</h3>
                <span className="text-muted small text-uppercase font-weight-bold">{label}</span>
            </div>
        </div>
    </div>
);

// --- The Insight Modal ---
const ManifestModal = ({ trip, onClose }) => {
    // Re-process events specifically for this modal
    const allStudents = trip.schedule?.route?.students || [];
    const dropOffs = trip.events?.filter(e => e.type === 'CHECKEDOFF') || [];
    const droppedIds = new Set(dropOffs.map(e => e.student?.id));

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content shadow-lg">
                    <div className="modal-header border-0 pb-0">
                        <div>
                            <h5 className="modal-title font-weight-bold">Trip Manifest</h5>
                            <p className="text-muted mb-0">
                                {trip.routeName} • {trip.busName} • {moment(trip.startedAt).format('h:mm A')}
                            </p>
                        </div>
                        <button className="close" onClick={onClose}>×</button>
                    </div>
                    <div className="modal-body">
                        <div className="row mb-3">
                            <div className="col-12">
                                <div className="alert alert-light-primary d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <strong>Bus Insight:</strong> {dropOffs.length} out of {allStudents.length} students dropped off.
                                    </div>
                                    <div className="font-weight-bold h4 mb-0 text-primary">
                                        {Math.round((dropOffs.length / allStudents.length) * 100)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="table table-borderless table-striped">
                                <thead className="bg-light text-uppercase small text-muted">
                                    <tr>
                                        <th>Student</th>
                                        <th>Registration</th>
                                        <th>Status</th>
                                        <th>Drop-off Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allStudents.map(student => {
                                        const isDropped = droppedIds.has(student.id);
                                        const event = dropOffs.find(e => e.student?.id === student.id);
                                        
                                        return (
                                            <tr key={student.id}>
                                                <td className="font-weight-bold">{student.names}</td>
                                                <td className="text-muted">{student.registration}</td>
                                                <td>
                                                    {isDropped ? 
                                                        <span className="badge badge-success">Dropped Off</span> : 
                                                        <span className="badge badge-secondary">Pending</span>
                                                    }
                                                </td>
                                                <td className="text-muted small">
                                                    {isDropped ? moment(event.time).format('h:mm:ss A') : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="modal-footer border-0 pt-0">
                        <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardV2;