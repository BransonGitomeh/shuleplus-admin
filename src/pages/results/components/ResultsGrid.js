import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';

/** 
 * DetailedPerformanceAnalytics
 * A premium SVG-based analytics component showing cross-term trends 
 * and assessment type performance.
 */
const DetailedPerformanceAnalytics = ({ student, subjects, currentAssessments, allAssessments, allTerms, assessmentTypes, rubrics, lessonAttempts = [], attemptEvents = [], themeColor = '#3699ff' }) => {
    
    // 1. Data Processing
    const studentAll = useMemo(() => {
        return (allAssessments || []).filter(a => (a.student === student.id || a.student?.id === student.id));
    }, [allAssessments, student.id]);

    const studentLessons = useMemo(() => {
        return (lessonAttempts || []).filter(l => l.userId === student.id || l.student === student.id || l.student?.id === student.id);
    }, [lessonAttempts, student.id]);

    // Revision Summary
    const revisionInsights = useMemo(() => {
        const completed = studentLessons.filter(l => l.status === 'COMPLETED');
        const avgScore = completed.length > 0 ? (completed.reduce((sum, l) => sum + (l.finalScore || 0), 0) / completed.length) : 0;
        
        // Current bars for relative strengths (calculated on the fly for insights)
        const currentBars = subjects.map(subj => {
            const a = currentAssessments.find(a => (a.subject === subj.id || a.subject?.id === subj.id) && (a.student === student.id || a.student?.id === student.id));
            const score = a ? (parseFloat(a.score) || 0) : 0;
            return { name: subj.name, score };
        }).filter(b => b.score > 0);

        const sortedScores = [...currentBars].sort((a,b) => b.score - a.score);
        const strengths = sortedScores.slice(0, 2).map(s => s.name);
        const weaknesses = sortedScores.slice(-2).reverse().map(s => s.name);

        return {
            totalAttempts: studentLessons.length,
            completedCount: completed.length,
            revisionAvg: Math.round(avgScore),
            strengths,
            weaknesses,
            currentBars
        };
    }, [studentLessons, subjects, currentAssessments, student.id, rubrics]);

    // Cross-Term Trends (Line Chart Data)
    const trendData = useMemo(() => {
        const sortedTerms = (allTerms || []).sort((a,b) => new Date(a.startDate) - new Date(b.startDate));
        return sortedTerms.map(term => {
            const termAssessments = studentAll.filter(a => (a.term === term.id || a.term?.id === term.id));
            const total = termAssessments.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0);
            const avg = termAssessments.length > 0 ? (total / termAssessments.length) : 0;
            
            // Shorten name: "Term 1 2024" -> "T1 '24"
            const parts = term.name.split(' ');
            let shortName = term.name;
            if (parts.length >= 3) shortName = `${parts[0][0]}${parts[1]} '${parts[parts.length-1].slice(-2)}`;
            else if (parts.length === 2) shortName = `${parts[0][0]}${parts[1]}`;
            
            return { term: shortName, avg, fullTerm: term.name };
        }).filter(d => d.avg > 0);
    }, [allTerms, studentAll]);

    // 2. Chart Rendering (Line Chart SVG)
    const renderTrendChart = () => {
        if (trendData.length < 2) return <div className="text-muted small p-4 bg-light rounded text-center">Insufficient historical data for trend analysis.</div>;
        
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
                    <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#f3f4f6" />
                    <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#f3f4f6" />
                    <path d={areaD} fill="url(#trendGradient)" opacity="0.1" />
                    <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={themeColor} />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <path d={pathD} fill="none" stroke={themeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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

    return (
        <div style={{ padding: '24px', background: '#fdfdfd', borderTop: '1px solid #ebedf3' }}>
            <div className="row">
                {/* Column 1: Subject Performance Mix */}
                <div className="col-lg-3 border-right">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#959cb6', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                        Performance Mix
                    </div>
                    {revisionInsights.currentBars.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {revisionInsights.currentBars.map((bar, i) => {
                                const rubric = (rubrics || []).find(r => bar.score >= r.minScore && bar.score <= r.maxScore);
                                const color = rubric ? (rubric.label === 'EE' ? '#10b981' : rubric.label === 'ME' ? '#3699ff' : rubric.label === 'AE' ? '#f6c23e' : '#e74c3c') : '#e5e7eb';
                                return (
                                    <div key={i} className="d-flex align-items-center">
                                        <div style={{ width: '80px', fontSize: '0.75rem', fontWeight: 600, color: '#3f4254', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {bar.name}
                                        </div>
                                        <div className="flex-grow-1 mx-2" style={{ height: '10px', background: '#f3f6f9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ width: `${bar.score}%`, height: '100%', background: color, transition: 'width 0.5s ease' }} />
                                        </div>
                                        <div style={{ width: '30px', textAlign: 'right', fontWeight: 800, fontSize: '0.75rem', color: color }}>{bar.score}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-muted small p-4 text-center bg-light rounded">No scores found.</div>
                    )}
                </div>

                {/* Column 2: Historical Trend */}
                <div className="col-lg-4 border-right pl-lg-8">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#959cb6', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                        Progress Trend
                    </div>
                    {renderTrendChart()}
                    <div className="mt-4 p-4 bg-light rounded">
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="text-muted font-weight-bold font-size-xs">Term Avg</span>
                            <span className="text-dark-75 font-weight-bolder">{Math.round(trendData[trendData.length-1]?.avg || 0)}%</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-1">
                            <span className="text-muted font-weight-bold font-size-xs">Prev Avg</span>
                            <span className="text-dark-75 font-weight-bolder">{Math.round(trendData[trendData.length-2]?.avg || 0)}%</span>
                        </div>
                    </div>
                </div>

                {/* Column 3: Mobile Revision Insights */}
                <div className="col-lg-5 pl-lg-8">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#959cb6', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                        Mobile Revision Insights
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <div className="d-flex flex-column bg-light-primary p-4 rounded mb-4 shadow-sm" style={{ borderLeft: '4px solid #3699ff' }}>
                                <span className="text-primary font-weight-boldest font-size-h3">{revisionInsights.totalAttempts}</span>
                                <span className="text-muted font-weight-bold font-size-xs text-uppercase">Lesson Attempts</span>
                            </div>
                            <div className="d-flex flex-column bg-light-success p-4 rounded shadow-sm" style={{ borderLeft: '4px solid #10b981' }}>
                                <span className="text-success font-weight-boldest font-size-h3">{revisionInsights.revisionAvg}%</span>
                                <span className="text-muted font-weight-bold font-size-xs text-uppercase">Avg Revision Score</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="mb-4">
                                <div className="text-muted font-weight-bold font-size-xs mb-1">TOP STRENGTHS</div>
                                {revisionInsights.strengths.length > 0 ? revisionInsights.strengths.map((s, i) => (
                                    <div key={i} className="label label-inline label-light-success font-weight-bold mb-1 mr-1">{s}</div>
                                )) : <span className="text-muted font-size-xs italic">N/A</span>}
                            </div>
                            <div>
                                <div className="text-muted font-weight-bold font-size-xs mb-1">REVISION AREAS</div>
                                {revisionInsights.weaknesses.length > 0 ? revisionInsights.weaknesses.map((s, i) => (
                                    <div key={i} className="label label-inline label-light-danger font-weight-bold mb-1 mr-1">{s}</div>
                                )) : <span className="text-muted font-size-xs italic">N/A</span>}
                            </div>
                        </div>
                    </div>
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

const ResultsGrid = ({ students, subjects, assessments, allAssessments, allTerms, assessmentTypes, rubrics, updates, onScoreChange, onRemarkChange, onCommentChange, onPrintSingle, onSendSms, loading, lessonAttempts = [], attemptEvents = [] }) => {
    const [expandedStudents, setExpandedStudents] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;

    const toggleStudent = useCallback((studentId) => {
        setExpandedStudents(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    }, []);


    // Helper to get score for a cell
    const getScore = (studentId, subjectId) => {
        const updateKey = `${studentId}-${subjectId}-score`;
        if (updates && updates.hasOwnProperty(updateKey)) {
            return updates[updateKey];
        }
        const assessment = assessments.find(a =>
            (a.student === studentId || a.student?.id === studentId) &&
            (a.subject === subjectId || a.subject?.id === subjectId)
        );
        return assessment ? assessment.score : "";
    };

    const getRemark = (studentId, subjectId) => {
        const updateKey = `${studentId}-${subjectId}-remark`;
        if (updates && updates.hasOwnProperty(updateKey)) {
            return updates[updateKey];
        }
        const assessment = assessments.find(a =>
            (a.student === studentId || a.student?.id === studentId) &&
            (a.subject === subjectId || a.subject?.id === subjectId)
        );
        return assessment ? (assessment.remarks || assessment.remark || "") : "";
    };

    const getComment = (studentId, subjectId) => {
        const updateKey = `${studentId}-${subjectId}-comment`;
        if (updates && updates.hasOwnProperty(updateKey)) {
            return updates[updateKey];
        }
        const assessment = assessments.find(a =>
            (a.student === studentId || a.student?.id === studentId) &&
            (a.subject === subjectId || a.subject?.id === subjectId)
        );
        return assessment ? (assessment.teachersComment || "") : "";
    };

    const getRubric = (score) => {
        if (score === "" || score === null || isNaN(score)) return null;
        const s = parseFloat(score);
        return (rubrics || []).find(r => s >= r.minScore && s <= r.maxScore);
    };

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        const lowerSearch = searchTerm.toLowerCase();
        return (students || []).filter(s => 
            (s.names || '').toLowerCase().includes(lowerSearch) || 
            (s.admNo || '').toLowerCase().includes(lowerSearch) ||
            (s.registration || '').toLowerCase().includes(lowerSearch) ||
            (s.parent?.name || '').toLowerCase().includes(lowerSearch) ||
            (s.parent?.phone || '').includes(lowerSearch)
        );
    }, [students, searchTerm]);

    const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
                    {loading ? 'Updating results...' : `Showing ${paginatedStudents.length} students`}
                </div>
            </div>

            <div className="table-responsive flex-grow-1">
                <table className="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
                    <thead>
                        <tr className="text-left text-uppercase">
                            <th style={{ width: '10px' }} className="pl-0"></th>
                            <th style={{ minWidth: '200px' }}>Details</th>
                            {subjects?.map(subj => (
                                <th key={subj.id} className="text-center" style={{ minWidth: '120px' }}>{subj.name}</th>
                            ))}
                            <th className="text-center" style={{ minWidth: '80px' }}>Total Pts</th>
                            <th className="text-right" style={{ minWidth: '120px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedStudents.map(student => {
                            let totalPoints = 0;
                            const firstSubjectId = subjects?.[0]?.id;
                            const isExpanded = !!expandedStudents[student.id];

                            return (
                                <React.Fragment key={student.id}>
                                    {/* STUDENT ROW (TOP LEVEL INPUTS) */}
                                    <tr className={`bg-white border-bottom ${isExpanded ? 'bg-light-primary' : ''}`}>
                                        <td className="pl-4 py-3">
                                            <div className="symbol symbol-35 symbol-light-success">
                                                <span className="symbol-label font-size-h6 font-weight-bold">{student.names?.[0] || 'S'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex flex-column">
                                                <span className="text-dark-75 font-weight-bolder font-size-sm">{student.names}</span>
                                                <div className="d-flex align-items-center mt-1">
                                                    <span className="text-muted font-weight-bold font-size-xs">{student.admNo || student.registration}</span>
                                                    <span className="label label-dot label-secondary ml-2 mr-2"></span>
                                                    <span className="text-muted font-weight-bold font-size-xs text-uppercase">{student.parent?.name || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {subjects?.map(subj => {
                                            const val = getScore(student.id, subj.id);
                                            const rubric = getRubric(val);
                                            if (rubric?.points) totalPoints += parseFloat(rubric.points);
                                            const isUpdated = updates?.hasOwnProperty(`${student.id}-${subj.id}-score`);
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
                                                                width: '65px', 
                                                                height: '32px', 
                                                                fontSize: '0.95rem',
                                                                borderRadius: '6px',
                                                                border: isUpdated ? '2px solid #f6c23e' : '1px solid #ebedf3',
                                                                background: isUpdated ? '#fff8dd' : '#f8f9fb'
                                                            }}
                                                        />
                                                        {rubric && (
                                                            <div className="d-flex flex-column align-items-center mt-1">
                                                                <span className="font-weight-boldest" style={{ color, fontSize: '10px' }}>
                                                                    {rubric.label} ({rubric.points || 0} pts)
                                                                </span>
                                                                {rubric.comment && (
                                                                    <span className="text-muted italic" style={{ fontSize: '9px', lineHeight: '1.2', maxWidth: '100px' }}>
                                                                        {rubric.comment}
                                                                    </span>
                                                                )}
                                                            </div>
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
                                            <button 
                                                className={`btn btn-icon btn-light-info btn-sm mr-1 ${isExpanded ? 'active' : ''}`}
                                                onClick={() => toggleStudent(student.id)}
                                                title="View Insights"
                                            >
                                                <i className={`ki ki-bold-more-hor icon-xs ${isExpanded ? 'text-white' : ''}`}></i>
                                            </button>
                                            <button className="btn btn-icon btn-light-primary btn-sm mr-1" onClick={() => onPrintSingle?.(student)}>
                                                <i className="fa fa-print"></i>
                                            </button>
                                            <button className="btn btn-icon btn-light-success btn-sm" onClick={() => onSendSms?.(student)}>
                                                <i className="fa fa-sms"></i>
                                            </button>
                                        </td>
                                    </tr>

                                    {/* EXPANDED ANALYTICS */}
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={(subjects?.length || 0) + 4} className="p-0 border-0">
                                                <DetailedPerformanceAnalytics 
                                                    student={student}
                                                    subjects={subjects}
                                                    currentAssessments={assessments}
                                                    allAssessments={allAssessments}
                                                    allTerms={allTerms}
                                                    assessmentTypes={assessmentTypes}
                                                    rubrics={rubrics}
                                                    lessonAttempts={lessonAttempts}
                                                    attemptEvents={attemptEvents}
                                                />
                                            </td>
                                        </tr>
                                    )}
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
