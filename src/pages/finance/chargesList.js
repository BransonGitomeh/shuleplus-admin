import React, { useState, useMemo } from "react";
import { withRouter } from "react-router";
import Data from "../../utils/data";
import moment from "moment";

// --- HELPER: Statistics Calculation ---
const calculateStats = (logs) => {
    const totalBatches = logs.length;
    const totalMessages = logs.reduce((acc, log) => acc + (log.recipientCount || 0), 0);
    const totalFailures = logs.reduce((acc, log) => acc + (log.failureCount || 0), 0);
    const successRate = totalMessages > 0 ? Math.round(((totalMessages - totalFailures) / totalMessages) * 100) : 0;
    
    return { totalBatches, totalMessages, successRate };
};

// --- COMPONENT: Stat Card ---
const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className="col-md-4">
        <div className="card card-custom bg-white border-0 shadow-sm mb-4" style={{height: '100%'}}>
            <div className="card-body d-flex align-items-center">
                <div className={`symbol symbol-50 symbol-light-${color} mr-4`}>
                    <span className="symbol-label">
                        <i className={`fa fa-${icon} text-${color} icon-lg`}></i>
                    </span>
                </div>
                <div>
                    <div className="text-dark font-weight-bolder font-size-h5">{value}</div>
                    <div className="text-muted font-weight-bold font-size-sm">{title}</div>
                    {subtext && <div className={`text-${color} font-size-xs mt-1`}>{subtext}</div>}
                </div>
            </div>
        </div>
    </div>
);

// --- COMPONENT: Interactive Log Details (The "Smart Accordion") ---
const LogDetails = ({ log }) => {
    const [tab, setTab] = useState('ALL'); // ALL, SUCCESS, FAILED
    const [innerSearch, setInnerSearch] = useState('');

    const details = log.details || (log.logs || []); // Handle both data structures (flat or nested)
    
    // Filter logic
    const filteredDetails = useMemo(() => {
        let data = details;
        
        // 1. Filter by Tab
        if (tab === 'SUCCESS') data = data.filter(d => d.status === 'DELIVERED');
        if (tab === 'FAILED') data = data.filter(d => d.status !== 'DELIVERED');

        // 2. Filter by Search
        if (innerSearch) {
            const lower = innerSearch.toLowerCase();
            data = data.filter(d => 
                (d.recipientName || d.name || '').toLowerCase().includes(lower) || 
                (d.recipientPhone || d.phone || '').includes(lower)
            );
        }
        return data;
    }, [details, tab, innerSearch]);

    const successCount = log.successCount;
    const failureCount = log.failureCount;

    return (
        <div className="row no-gutters bg-light rounded overflow-hidden mt-3">
            {/* LEFT: Context & Message */}
            <div className="col-lg-4 bg-white border-right p-4">
                <h6 className="font-weight-bold text-uppercase text-muted font-size-xs mb-3">Message Content</h6>
                <div className="p-3 bg-light-primary rounded text-dark-75 font-size-sm mb-4" style={{borderLeft: '4px solid #3699ff', fontStyle: 'italic'}}>
                    "{log.messageTemplate || log.message}"
                </div>

                <h6 className="font-weight-bold text-uppercase text-muted font-size-xs mb-3">Timestamps</h6>
                <div className="d-flex align-items-center mb-2">
                    <i className="fa fa-clock text-muted mr-2"></i>
                    <span className="text-dark-75 font-size-sm">Sent: {moment(log.createdAt || log.time).format("DD MMM YYYY, hh:mm A")}</span>
                </div>
                {failureCount > 0 && (
                    <button className="btn btn-light-danger btn-sm font-weight-bold mt-3 btn-block" onClick={() => alert("Resend logic here")}>
                        <i className="fa fa-redo mr-1"></i> Retry {failureCount} Failed
                    </button>
                )}
            </div>

            {/* RIGHT: Interactive Lists */}
            <div className="col-lg-8 p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    {/* Tabs */}
                    <div className="btn-group btn-group-sm">
                        <button className={`btn ${tab === 'ALL' ? 'btn-primary' : 'btn-light'}`} onClick={() => setTab('ALL')}>
                            All <span className="badge badge-light ml-1" style={{opacity: 0.7}}>{log.recipientCount}</span>
                        </button>
                        <button className={`btn ${tab === 'SUCCESS' ? 'btn-success' : 'btn-light'}`} onClick={() => setTab('SUCCESS')}>
                            Success <span className="badge badge-light ml-1" style={{opacity: 0.7}}>{successCount}</span>
                        </button>
                        <button className={`btn ${tab === 'FAILED' ? 'btn-danger' : 'btn-light'}`} onClick={() => setTab('FAILED')}>
                            Failed <span className="badge badge-light ml-1" style={{opacity: 0.7}}>{failureCount}</span>
                        </button>
                    </div>

                    {/* Mini Search */}
                    <div className="input-icon input-icon-sm input-icon-right" style={{width: '200px'}}>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Find name or phone..." 
                            value={innerSearch}
                            onChange={(e) => setInnerSearch(e.target.value)}
                        />
                        <span><i className="fa fa-search text-muted"></i></span>
                    </div>
                </div>

                {/* The List */}
                <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto', border: '1px solid #ebedf2', borderRadius: '4px', background: 'white'}}>
                    <table className="table table-head-custom table-vertical-center mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="pl-4">Recipient</th>
                                <th>Status</th>
                                <th>Tech Info</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDetails.map((rec, i) => {
                                const isErr = (rec.status !== 'DELIVERED');
                                const name = rec.recipientName || rec.name || 'Unknown';
                                const phone = rec.recipientPhone || rec.phone;
                                const error = rec.error;
                                const raw = rec.providerResponse;

                                return (
                                    <tr key={i}>
                                        <td className="pl-4">
                                            <div className="font-weight-bold text-dark-75">{name}</div>
                                            <div className="text-muted font-size-xs">{phone}</div>
                                        </td>
                                        <td>
                                            {isErr ? (
                                                <span className="label label-inline label-light-danger font-weight-bold">
                                                    {error || 'Failed'}
                                                </span>
                                            ) : (
                                                <span className="label label-inline label-light-success font-weight-bold">Delivered</span>
                                            )}
                                        </td>
                                        <td>
                                            {raw ? (
                                                <details>
                                                    <summary className="btn btn-xs btn-link font-size-xs p-0 text-muted">View Response</summary>
                                                    <div className="position-absolute bg-dark p-3 rounded shadow-lg" style={{zIndex: 10, width: '250px', right: '20px'}}>
                                                        <pre className="text-white m-0" style={{fontSize: '10px', maxHeight: '150px', overflow: 'auto'}}>
                                                            {JSON.stringify(raw, null, 2)}
                                                        </pre>
                                                    </div>
                                                </details>
                                            ) : <span className="text-muted font-size-xs">-</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredDetails.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-4 text-muted">
                                        No recipients found matching filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: Main Dashboard ---
class SmsHistoryDashboard extends React.Component {
    state = {
        logs: [],
        filteredLogs: [],
        expandedId: null,
        searchTerm: "",
        isLoading: true
    };

    componentDidMount() {
        this.unsubscribe = Data.smsEvents.subscribe(this.handleDataUpdate);
        
        // Fallback for flat structure if you haven't fully migrated to smsEvents yet
        if (!Data.smsEvents.list().length) {
             this.unsubscribeLogs = Data.smsLogs?.subscribe(this.handleDataUpdate);
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
        if (this.unsubscribeLogs) this.unsubscribeLogs();
    }

    handleDataUpdate = () => {
        // Prefer smsEvents (relational), fallback to smsLogs (flat)
        let rawData = Data.smsEvents.list() || [];
        if (rawData.length === 0 && Data.smsLogs) {
            rawData = Data.smsLogs.list() || [];
        }

        // Sort: Newest First
        const sorted = [...rawData].sort((a, b) => new Date(b.createdAt || b.time) - new Date(a.createdAt || a.time));

        this.setState(prev => ({
            logs: sorted,
            filteredLogs: this.filterLogs(sorted, prev.searchTerm),
            isLoading: false
        }));
    };

    filterLogs = (list, term) => {
        if (!term) return list;
        const lower = term.toLowerCase();
        return list.filter(log => 
            (log.messageTemplate || log.message || '').toLowerCase().includes(lower) || 
            (log.createdAt || log.time || '').includes(lower)
        );
    };

    onSearch = e => {
        const searchTerm = e.target.value;
        this.setState({ 
            searchTerm, 
            filteredLogs: this.filterLogs(this.state.logs, searchTerm) 
        });
    };

    toggleRow = (id) => {
        this.setState(prev => ({ expandedId: prev.expandedId === id ? null : id }));
    };

    render() {
        const { filteredLogs, expandedId, searchTerm, isLoading, logs } = this.state;
        const stats = calculateStats(logs);

        return (
            <div className="d-flex flex-column">
                
                {/* 1. TOP STATS ROW */}
                <div className="row mb-2">
                    <StatCard 
                        title="Campaigns Sent" 
                        value={stats.totalBatches} 
                        icon="paper-plane" 
                        color="primary" 
                    />
                    <StatCard 
                        title="Total Messages" 
                        value={stats.totalMessages} 
                        icon="envelope-open-text" 
                        color="info" 
                        subtext={`${stats.totalMessages * 2} Credits est.`} // Assuming 2 credits per SMS
                    />
                    <StatCard 
                        title="Overall Success" 
                        value={`${stats.successRate}%`} 
                        icon={stats.successRate > 90 ? "check-circle" : "exclamation-triangle"} 
                        color={stats.successRate > 90 ? "success" : "warning"} 
                    />
                </div>

                {/* 2. MAIN CARD */}
                <div className="kt-portlet kt-portlet--mobile shadow-sm">
                    <div className="kt-portlet__head pt-4 border-bottom-0">
                        <div className="kt-portlet__head-label">
                            <h3 className="kt-portlet__head-title font-weight-bolder text-dark">
                                Activity Feed
                                <small className="text-muted ml-2">Recent Bulk SMS Batches</small>
                            </h3>
                        </div>
                        <div className="kt-portlet__head-toolbar">
                            <div className="input-icon input-icon-sm input-icon-right" style={{width: '250px'}}>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search logs..." 
                                    value={searchTerm}
                                    onChange={this.onSearch}
                                    style={{background: '#f3f6f9', border: 'none'}}
                                />
                                <span><i className="la la-search"></i></span>
                            </div>
                        </div>
                    </div>

                    <div className="kt-portlet__body">
                        <div className="table-responsive">
                            <table className="table table-hover table-vertical-center">
                                <thead>
                                    <tr className="text-uppercase text-muted font-size-xs letter-spacing-1">
                                        <th style={{width: '60px'}}>Type</th>
                                        <th>Details</th>
                                        <th className="text-center">Progress</th>
                                        <th className="text-right">Date</th>
                                        <th style={{width: '50px'}}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map(log => {
                                        const isExpanded = expandedId === log.id;
                                        const total = log.recipientCount || 0;
                                        const success = log.successCount || 0;
                                        const rate = total > 0 ? Math.round((success/total)*100) : 0;
                                        const hasFailures = (log.failureCount > 0);

                                        return (
                                            <React.Fragment key={log.id}>
                                                <tr 
                                                    onClick={() => this.toggleRow(log.id)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        backgroundColor: isExpanded ? '#f8f9fb' : 'transparent',
                                                        borderLeft: hasFailures ? '4px solid #f64e60' : '4px solid transparent'
                                                    }}
                                                >
                                                    <td>
                                                        <div className={`symbol symbol-40 symbol-light-${hasFailures ? 'warning' : 'success'}`}>
                                                            <span className="symbol-label">
                                                                <i className={`fa fa-${hasFailures ? 'exclamation' : 'check'} icon-md align-self-center`}></i>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="text-dark-75 font-weight-bold font-size-lg mb-1">
                                                            Bulk Campaign
                                                        </div>
                                                        <span className="text-muted font-size-sm d-block text-truncate" style={{maxWidth: '250px'}}>
                                                            {log.messageTemplate || log.message}
                                                        </span>
                                                    </td>
                                                    <td className="text-center" style={{minWidth: '150px'}}>
                                                        <div className="d-flex flex-column w-100">
                                                            <div className="d-flex justify-content-between font-size-xs mb-1">
                                                                <span className="text-dark-75 font-weight-bold">{success}/{total}</span>
                                                                <span className={`font-weight-bold text-${rate === 100 ? 'success' : 'warning'}`}>{rate}%</span>
                                                            </div>
                                                            <div className="progress" style={{height: '6px'}}>
                                                                <div className={`progress-bar bg-${rate === 100 ? 'success' : 'warning'}`} role="progressbar" style={{width: `${rate}%`}}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-right">
                                                        <span className="text-dark-75 font-weight-bolder d-block font-size-sm">
                                                            {moment(log.createdAt || log.time).format("HH:mm")}
                                                        </span>
                                                        <span className="text-muted font-size-xs">
                                                            {moment(log.createdAt || log.time).fromNow()}
                                                        </span>
                                                    </td>
                                                    <td className="text-right pr-4">
                                                        <i className={`fa fa-chevron-${isExpanded ? 'up' : 'down'} text-muted font-size-xs`}></i>
                                                    </td>
                                                </tr>
                                                
                                                {/* EXPANDED CONTENT */}
                                                {isExpanded && (
                                                    <tr className="animated fadeIn">
                                                        <td colSpan="5" className="p-0 border-top-0">
                                                            <div className="p-4 bg-white" style={{borderBottom: '4px solid #f0f3ff'}}>
                                                                <LogDetails log={log} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}

                                    {!isLoading && filteredLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                <div className="d-flex flex-column align-items-center">
                                                    <i className="flaticon2-open-text-book icon-4x text-light-primary mb-3"></i>
                                                    No SMS history found.
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(SmsHistoryDashboard);