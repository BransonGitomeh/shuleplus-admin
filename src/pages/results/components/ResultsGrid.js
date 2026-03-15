import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';

/** 
 * DetailedPerformanceAnalytics
 * A premium SVG-based analytics component showing cross-term trends 
 * and assessment type performance.
 */
const DetailedPerformanceAnalytics = ({ student, subjects, currentAssessments, allAssessments, allTerms, assessmentTypes, rubrics, updates, themeColor = '#3699ff' }) => {
    
    // 1. Data Processing
    const studentAll = useMemo(() => {
        return (allAssessments || []).filter(a => (a.student === student.id || a.student?.id === student.id));
    }, [allAssessments, student.id]);

    const getRubric = (score) => {
        if (score === undefined || score === null || isNaN(score)) return null;
        return (rubrics || []).find(r => score >= r.minScore && score <= r.maxScore);
    };

    // Current Subject Performance (Bars)
    const currentBars = useMemo(() => {
        return subjects.map(subj => {
            const a = currentAssessments.find(a => (a.subject === subj.id || a.subject?.id === subj.id) && (a.student === student.id || a.student?.id === student.id));
            const score = a ? (parseFloat(a.score) || 0) : 0;
            const rubric = getRubric(score);
            const color = rubric
                ? (rubric.label === 'EE' ? '#10b981' : rubric.label === 'ME' ? '#3699ff' : rubric.label === 'AE' ? '#f6c23e' : '#e74c3c')
                : '#e5e7eb';
            return { name: subj.name, score, color, rubric };
        }).filter(b => b.score > 0);
    }, [subjects, currentAssessments, student.id, rubrics]);

    // Cross-Term Trends (Line Chart Data)
    const trendData = useMemo(() => {
        const sortedTerms = (allTerms || []).sort((a,b) => new Date(a.startDate) - new Date(b.startDate));
        return sortedTerms.map(term => {
            const termAssessments = studentAll.filter(a => (a.term === term.id || a.term?.id === term.id));
            const total = termAssessments.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0);
            const avg = termAssessments.length > 0 ? (total / termAssessments.length) : 0;
            
            // Shorten name: "Term 1 2024" -> "T1 '24" or "First Term" -> "First..."
            const parts = term.name.split(' ');
            let shortName = term.name;
            if (parts.length >= 3) shortName = `${parts[0][0]}${parts[1]} '${parts[parts.length-1].slice(-2)}`;
            else if (parts.length === 2) shortName = `${parts[0][0]}${parts[1]}`;
            
            return { term: shortName, avg, fullTerm: term.name };
        }).filter(d => d.avg > 0);
    }, [allTerms, studentAll]);

    // Assessment Type Comparison (Bar Chart Data)
    const comparisonData = useMemo(() => {
        return (assessmentTypes || []).map(type => {
            const typeAssessments = studentAll.filter(a => (a.assessmentType === type.id || a.assessmentType?.id === type.id));
            const total = typeAssessments.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0);
            const avg = typeAssessments.length > 0 ? (total / typeAssessments.length) : 0;
            return { type: type.name, avg };
        }).filter(d => d.avg > 0);
    }, [assessmentTypes, studentAll]);

    // 2. Chart Rendering (Line Chart SVG)
    const renderTrendChart = () => {
        if (trendData.length < 2) return <div className="text-muted small">Insufficient historical data for trend analysis.</div>;
        
        const width = 320;
        const height = 120;
        const padding = 25;
        const maxAvg = 100;
        
        const points = trendData.map((d, i) => {
            const x = padding + (i * (width - 2 * padding) / (trendData.length - 1));
            const y = height - padding - (d.avg / maxAvg * (height - 2 * padding));
            return { x, y, avg: d.avg, term: d.term };
        });

        const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
        const areaD = `${pathD} L ${points[points.length-1].x} ${height-padding} L ${points[0].x} ${height-padding} Z`;

        return (
            <div style={{ position: 'relative' }}>
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    {/* Grid lines */}
                    <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#f3f4f6" />
                    <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#f3f4f6" />
                    
                    {/* Area fill */}
                    <path d={areaD} fill="url(#trendGradient)" opacity="0.1" />
                    <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={themeColor} />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>

                    {/* Path line */}
                    <path d={pathD} fill="none" stroke={themeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Data Points */}
                    {points.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={themeColor} strokeWidth="2" />
                            <text x={p.x} y={height - 5} fontSize="9" fill="#9ca3af" textAnchor="middle">{p.term}</text>
                            <text x={p.x} y={p.y - 8} fontSize="10" fontWeight="700" fill={themeColor} textAnchor="middle">{Math.round(p.avg)}%</text>
                        </g>
                    ))}
                </svg>
            </div>
        );
    };

    // 3. Chart Rendering (Comparison Bar SVG)
    const renderComparisonChart = () => {
        if (comparisonData.length === 0) return <div className="text-muted small">No assessment type data available.</div>;
        
        const width = 200;
        const height = 120;
        const padding = 20;
        const barWidth = 35;
        const maxAvg = 100;

        return (
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {comparisonData.map((d, i) => {
                    const barHeight = (d.avg / maxAvg) * (height - 2 * padding);
                    const x = padding + i * (width - 2 * padding) / (comparisonData.length > 1 ? comparisonData.length - 1 : 1) - (comparisonData.length > 1 ? barWidth / 2 : width/2 - padding);
                    const safeX = comparisonData.length === 1 ? (width/2 - barWidth/2) : (padding + i * (width - 2*padding) / (comparisonData.length - 1) - barWidth/2);
                    
                    return (
                        <g key={i}>
                            <rect 
                                x={safeX} 
                                y={height - padding - barHeight} 
                                width={barWidth} 
                                height={barHeight} 
                                fill={i === comparisonData.length - 1 ? '#3699ff' : '#e4e6ef'} 
                                rx="4"
                            />
                            <text x={safeX + barWidth/2} y={height - 5} fontSize="9" fill="#9ca3af" textAnchor="middle">{d.type.substring(0,6)}</text>
                            <text x={safeX + barWidth/2} y={height - padding - barHeight - 5} fontSize="10" fontWeight="700" fill="#3f4254" textAnchor="middle">{Math.round(d.avg)}%</text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    return (
        <div style={{ padding: '24px', background: '#fdfdfd', borderTop: '1px solid #ebedf3' }}>
            <div className="row">
                {/* Column 1: Subject Performance (The original bars) */}
                <div className="col-lg-4 border-right">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#959cb6', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                        Subject Breakdown
                    </div>
                    {currentBars.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {currentBars.map((bar, i) => (
                                <div key={i} className="d-flex align-items-center">
                                    <div style={{ width: '90px', fontSize: '0.8rem', fontWeight: 600, color: '#3f4254', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {bar.name}
                                    </div>
                                    <div className="flex-grow-1 mx-3" style={{ height: '14px', background: '#f3f6f9', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${bar.score}%`, height: '100%', background: bar.color, transition: 'width 0.5s ease' }} />
                                    </div>
                                    <div style={{ width: '35px', textAlign: 'right', fontWeight: 800, fontSize: '0.8rem', color: bar.color }}>{bar.score}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-muted small p-4 text-center bg-light rounded">No scores for this student.</div>
                    )}
                </div>

                {/* Column 2: Historical Trend */}
                <div className="col-lg-5 border-right pl-lg-8">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#959cb6', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                        Performance Trend (Terms)
                    </div>
                    {renderTrendChart()}
                </div>

                {/* Column 3: Assessment Comparison */}
                <div className="col-lg-3 pl-lg-8">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#959cb6', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                        Exam Type Mix
                    </div>
                    {renderComparisonChart()}
                </div>
            </div>
        </div>
    );
};

const SkeletonRow = ({ subjectsCount }) => (
    <tr className="skeleton-row">
        <td className="text-center"><div className="skeleton-placeholder" style={{ width: '20px', height: '20px', borderRadius: '50%' }}></div></td>
        <td style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#fff' }}>
            <div className="skeleton-placeholder" style={{ width: '150px', height: '20px' }}></div>
        </td>
        {Array.from({ length: subjectsCount }).map((_, i) => (
            <td key={i} className="p-4">
                <div className="d-flex flex-column align-items-center">
                    <div className="skeleton-placeholder mb-2" style={{ width: '60px', height: '35px' }}></div>
                    <div className="skeleton-placeholder" style={{ width: '40px', height: '15px' }}></div>
                </div>
            </td>
        ))}
        <td className="bg-light"><div className="skeleton-placeholder mx-auto" style={{ width: '40px', height: '25px' }}></div></td>
        <td style={{ position: 'sticky', right: 0, zIndex: 10, backgroundColor: '#fff' }}>
            <div className="d-flex justify-content-center">
                <div className="skeleton-placeholder mr-2" style={{ width: '30px', height: '30px' }}></div>
                <div className="skeleton-placeholder" style={{ width: '30px', height: '30px' }}></div>
            </div>
        </td>
        <style>{`
            .skeleton-row .skeleton-placeholder {
                background: #f3f6f9;
                border-radius: 4px;
                animation: pulse 1.5s infinite;
            }
            @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
            .results-table-container { transition: opacity 0.3s ease; }
        `}</style>
    </tr>
);

const ResultsGrid = ({ students, subjects, assessments, allAssessments, allTerms, assessmentTypes, rubrics, updates, onScoreChange, onPrintSingle, onSendSms, loading }) => {
    const [expandedParents, setExpandedParents] = useState({});

    const toggleParent = useCallback((parentId) => {
        setExpandedParents(prev => ({ ...prev, [parentId]: !prev[parentId] }));
    }, []);

    // 1. Group Students by Parent
    const parentGroups = useMemo(() => {
        const groups = {};
        (students || []).forEach(student => {
            const parent = student.parent || { id: 'unknown', name: 'Unknown Parent', phone: '-' };
            if (!groups[parent.id]) {
                groups[parent.id] = {
                    parent: parent,
                    students: []
                };
            }
            groups[parent.id].students.push(student);
        });
        return Object.values(groups).sort((a, b) => (a.parent.name || '').localeCompare(b.parent.name || ''));
    }, [students]);

    // Helper to get score for a cell
    const getScore = (studentId, subjectId) => {
        const updateKey = `${studentId}-${subjectId}`;
        if (updates && updates.hasOwnProperty(updateKey)) {
            return updates[updateKey];
        }
        const assessment = assessments.find(a =>
            (a.student === studentId || a.student?.id === studentId) &&
            (a.subject === subjectId || a.subject?.id === subjectId)
        );
        return assessment ? assessment.score : "";
    };

    const getRubric = (score) => {
        if (score === "" || score === null || isNaN(score)) return null;
        const s = parseFloat(score);
        return (rubrics || []).find(r => s >= r.minScore && s <= r.maxScore);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;

    const filteredGroups = useMemo(() => {
        if (!searchTerm) return parentGroups;
        const lowerSearch = searchTerm.toLowerCase();
        return parentGroups.filter(g => 
            (g.parent.name || '').toLowerCase().includes(lowerSearch) || 
            (g.parent.phone || '').includes(lowerSearch) ||
            g.students.some(s => (s.names || '').toLowerCase().includes(lowerSearch) || (s.admNo || '').toLowerCase().includes(lowerSearch))
        );
    }, [parentGroups, searchTerm]);

    const totalPages = Math.ceil(filteredGroups.length / rowsPerPage);
    const paginatedGroups = filteredGroups.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getRubricColor = (rubric) => {
        if (!rubric) return '#3699ff';
        const colors = { 'EE': '#10b981', 'ME': '#3699ff', 'AE': '#f6c23e', 'BE': '#e74c3c' };
        return colors[rubric.label] || '#3699ff';
    };

    return (
        <div className={`d-flex flex-column results-table-container ${loading ? 'opacity-70' : ''}`} style={{ minHeight: '400px' }}>
            {/* Search Bar */}
            <div className="d-flex justify-content-between align-items-center mb-6">
                <div style={{ width: '400px' }}>
                    <div className="input-icon input-icon-right">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search Parent, Student, or ADM No..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span><i className="flaticon2-search-1 icon-md text-muted"></i></span>
                    </div>
                </div>
                <div className="text-muted font-weight-bold">
                    {loading ? 'Updating results...' : `Showing ${paginatedGroups.length} families`}
                </div>
            </div>

            <div className="table-responsive flex-grow-1">
                <table className="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
                    <thead>
                        <tr className="text-left text-uppercase">
                            <th style={{ width: '10px' }} className="pl-0"></th>
                            <th style={{ minWidth: '250px' }}>Details</th>
                            {subjects?.map(subj => (
                                <th key={subj.id} className="text-center" style={{ minWidth: '130px' }}>{subj.name}</th>
                            ))}
                            <th className="text-center" style={{ minWidth: '100px' }}>Total Pts</th>
                            <th className="text-right" style={{ minWidth: '120px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedGroups.map(group => {
                            const isExpanded = !!expandedParents[group.parent.id];
                            return (
                                <React.Fragment key={group.parent.id}>
                                    {/* PARENT ROW */}
                                    <tr className={isExpanded ? 'bg-light-primary' : ''}>
                                        <td className="pl-0 py-4">
                                            <div className="symbol symbol-40 symbol-light-success">
                                                <span className="symbol-label font-size-h5 font-weight-bold">{group.parent.name?.[0] || 'P'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="d-flex flex-column">
                                                <span className="text-dark-75 font-weight-bolder font-size-lg">{group.parent.name}</span>
                                                <span className="text-muted font-weight-bold">{group.parent.phone}</span>
                                                <span className="label label-inline label-light-primary font-weight-bold mt-1" style={{ width: 'fit-content' }}>
                                                    {group.students.length} Student(s)
                                                </span>
                                            </div>
                                        </td>
                                        <td colSpan={subjects?.length || 0} className="py-4">
                                            <div className="d-flex align-items-center">
                                                <span className="text-muted font-weight-bold font-size-sm">
                                                    {group.students.map(s => s.names).join(', ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-center py-4">
                                            <span className="text-dark-75 font-weight-bolder font-size-lg">
                                                {/* Parent level total could be shown here if needed */}
                                                -
                                            </span>
                                        </td>
                                        <td className="text-right py-4">
                                            <button 
                                                className={`btn btn-icon btn-light-primary btn-sm ${isExpanded ? 'active' : ''}`}
                                                onClick={() => toggleParent(group.parent.id)}
                                            >
                                                <i className={`flaticon2-${isExpanded ? 'up' : 'down'}`}></i>
                                            </button>
                                        </td>
                                    </tr>

                                    {/* STUDENT ROWS (TREE) */}
                                    {isExpanded && group.students.map(student => {
                                        let totalPoints = 0;
                                        return (
                                            <React.Fragment key={student.id}>
                                            <tr className="bg-white">
                                                <td className="pl-10 mr-0" style={{ borderLeft: '3px solid #3699ff' }}>
                                                    <i className="fa fa-level-up-alt text-muted fa-rotate-90"></i>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="text-dark-75 font-weight-bolder font-size-sm">{student.names}</span>
                                                        <span className="text-muted font-weight-bold font-size-xs">{student.admNo || student.registration}</span>
                                                    </div>
                                                </td>
                                                {subjects?.map(subj => {
                                                    const val = getScore(student.id, subj.id);
                                                    const rubric = getRubric(val);
                                                    if (rubric?.points) totalPoints += parseFloat(rubric.points);
                                                    const isUpdated = updates?.hasOwnProperty(`${student.id}-${subj.id}`);
                                                    const color = getRubricColor(rubric);

                                                    return (
                                                        <td key={subj.id} className="text-center py-2">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <input
                                                                    type="number"
                                                                    className="form-control form-control-sm text-center font-weight-boldest"
                                                                    value={val}
                                                                    onChange={(e) => onScoreChange(student.id, subj.id, e.target.value)}
                                                                    style={{ 
                                                                        width: '70px', 
                                                                        height: '35px', 
                                                                        fontSize: '1rem',
                                                                        border: isUpdated ? '2px solid #f6c23e' : '1px solid #ebedf3',
                                                                        background: isUpdated ? '#fff8dd' : '#fcfcfc'
                                                                    }}
                                                                />
                                                                {rubric && (
                                                                    <span className="mt-1 font-weight-boldest font-size-xs" style={{ color }}>
                                                                        {rubric.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                                <td className="text-center align-middle">
                                                    <span className="text-dark-75 font-weight-bolder font-size-h6">
                                                        {totalPoints || '-'}
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <button className="btn btn-icon btn-light-primary btn-sm mr-1" onClick={() => onPrintSingle?.(student)}>
                                                        <i className="fa fa-print"></i>
                                                    </button>
                                                    <button className="btn btn-icon btn-light-success btn-sm" onClick={() => onSendSms?.(student)}>
                                                        <i className="fa fa-sms"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-6 pt-4 border-top">
                    <span className="text-muted font-weight-bold">Page {currentPage} of {totalPages}</span>
                    <div className="d-flex">
                        <button className="btn btn-sm btn-icon btn-light-primary mr-2" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>
                            <i className="ki ki-bold-arrow-back icon-xs"></i>
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i} 
                                className={`btn btn-sm btn-icon mr-2 ${currentPage === i + 1 ? 'btn-primary' : 'btn-light-primary'}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button className="btn btn-sm btn-icon btn-light-primary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>
                            <i className="ki ki-bold-arrow-next icon-xs"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default memo(ResultsGrid);
