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

const ResultsGrid = ({ students, subjects, assessments, allAssessments, allTerms, assessmentTypes, rubrics, updates, onScoreChange, onPrintSingle, onSendSms }) => {
    const [expandedStudents, setExpandedStudents] = useState({});

    const toggleExpand = useCallback((studentId) => {
        setExpandedStudents(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    }, []);

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
    const rowsPerPage = 20;

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students || [];
        const lowerSearch = searchTerm.toLowerCase();
        return (students || []).filter(s => 
            (s.names || '').toLowerCase().includes(lowerSearch) || 
            (s.id || '').toLowerCase().includes(lowerSearch) ||
            (s.admNo || '').toLowerCase().includes(lowerSearch)
        );
    }, [students, searchTerm]);

    const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, students]);

    const getRubricColor = (rubric) => {
        if (!rubric) return '#3699ff';
        if (rubric.label === 'EE') return '#10b981';
        if (rubric.label === 'ME') return '#3699ff';
        if (rubric.label === 'AE') return '#f6c23e';
        return '#e74c3c';
    };

    return (
        <div className="d-flex flex-column" style={{ minHeight: '400px' }}>
            {/* Search Bar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div style={{ width: '300px' }}>
                    <div className="input-icon input-icon-right">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search student name or admission no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span><i className="flaticon2-search-1 icon-sm text-muted"></i></span>
                    </div>
                </div>
                <div className="text-muted font-size-sm">
                    Showing {paginatedStudents.length} of {filteredStudents.length} students
                </div>
            </div>

            <div className="table-responsive flex-grow-1">
                <table className="table table-bordered table-hover table-sm mb-0" style={{ tableLayout: 'auto' }}>
                    <thead className="thead-light">
                        <tr>
                        <th style={{ minWidth: '40px', width: '40px' }}></th>
                        <th style={{ minWidth: '200px', position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#f8f9fa' }}>
                            Student Name
                        </th>
                        {subjects && subjects.map(subj => (
                            <th key={subj?.id} className="text-center" style={{ minWidth: '120px' }}>
                                {(subj?.name || "Unknown").substring(0, 15)}
                            </th>
                        ))}
                        <th className="text-center" style={{ minWidth: '80px' }}>Total Pts</th>
                        <th className="text-center" style={{ minWidth: '130px', position: 'sticky', right: 0, zIndex: 10, backgroundColor: '#f8f9fa' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedStudents.map(student => {
                        let totalPoints = 0;
                        const isExpanded = !!expandedStudents[student.id];

                        const cells = (subjects || []).map(subj => {
                            const val = getScore(student.id, subj.id);
                            const rubric = getRubric(val);

                            if (rubric && rubric.points) {
                                totalPoints += parseFloat(rubric.points);
                            }

                            const isUpdated = updates && updates.hasOwnProperty(`${student.id}-${subj.id}`);
                            const rubricColor = getRubricColor(rubric);

                            return (
                                <td key={`${student.id}-${subj.id}`} className="p-1">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={val}
                                            style={{
                                                border: isUpdated ? `2px solid #f6c23e` : '1px solid #e5e7eb',
                                                background: isUpdated ? '#fff8dd' : '#f9fafb',
                                                width: '80px',
                                                fontWeight: '700',
                                                fontSize: '1.1rem',
                                                height: '40px'
                                            }}
                                            onChange={(e) => onScoreChange(student.id, subj.id, e.target.value)}
                                            placeholder="-"
                                        />
                                        {rubric && (
                                            <>
                                                <span
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: '900',
                                                        padding: '3px 10px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        borderRadius: '12px',
                                                        background: rubricColor + '22',
                                                        color: rubricColor
                                                    }}
                                                >
                                                    {rubric.label} {rubric.points ? `(${rubric.points})` : ''}
                                                </span>
                                                {rubric.teachersComment && (
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic', textAlign: 'center', lineHeight: '1.2', maxWidth: '110px', marginTop: '2px' }}>
                                                        {rubric.teachersComment}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            );
                        });

                        return (
                            <React.Fragment key={student.id}>
                                <tr style={{ cursor: 'pointer' }}>
                                    {/* Expand toggle */}
                                    <td
                                        className="text-center align-middle"
                                        onClick={() => toggleExpand(student.id)}
                                        style={{ cursor: 'pointer', userSelect: 'none', color: '#9ca3af' }}
                                    >
                                        <i className={`fa fa-chevron-${isExpanded ? 'down' : 'right'}`} style={{ fontSize: '0.75rem' }}></i>
                                    </td>
                                    <td
                                        className="font-weight-bold align-middle"
                                        style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#fff', cursor: 'pointer' }}
                                        onClick={() => toggleExpand(student.id)}
                                    >
                                        {student?.names || student?.id || "Unnamed Student"}
                                    </td>
                                    {cells}
                                    <td className="text-center font-weight-bold bg-light align-middle" style={{ fontSize: '1.2rem', color: '#111827' }}>
                                        {totalPoints > 0 ? totalPoints : '-'}
                                    </td>
                                    <td className="text-center align-middle" style={{ position: 'sticky', right: 0, zIndex: 10, backgroundColor: '#fff', borderLeft: '1px solid #e5e7eb' }}>
                                        <div className="d-flex justify-content-center">
                                            <button
                                                className="btn btn-sm btn-icon btn-light-primary mr-2"
                                                title="Print Single Report"
                                                onClick={() => onPrintSingle && onPrintSingle(student)}
                                            >
                                                <i className="fa fa-print"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-icon btn-light-success"
                                                title="Send Results via SMS"
                                                onClick={() => onSendSms && onSendSms(student)}
                                            >
                                                <i className="fa fa-sms"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Expandable Chart Row */}
                                {isExpanded && (
                                    <tr>
                                        <td colSpan={(subjects?.length || 0) + 4} style={{ padding: 0, background: 'transparent' }}>
                                            <DetailedPerformanceAnalytics
                                                student={student}
                                                subjects={subjects}
                                                currentAssessments={assessments}
                                                allAssessments={allAssessments}
                                                allTerms={allTerms}
                                                assessmentTypes={assessmentTypes}
                                                rubrics={rubrics}
                                                updates={updates}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    {paginatedStudents.length === 0 && (
                        <tr>
                            <td colSpan={(subjects?.length || 0) + 4} className="text-center text-muted p-5">
                                No students found matching your search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <div className="text-muted font-size-sm">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="d-flex">
                    <button 
                        className="btn btn-sm btn-icon btn-light-primary mr-2" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                        <i className="ki ki-bold-arrow-back icon-xs"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                        .map((page, i, arr) => (
                            <React.Fragment key={page}>
                                {i > 0 && arr[i - 1] !== page - 1 && (
                                    <span className="btn btn-sm btn-icon btn-text-muted disabled mr-2">...</span>
                                )}
                                <button 
                                    className={`btn btn-sm btn-icon mr-2 ${currentPage === page ? 'btn-primary' : 'btn-light-primary'}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        ))
                    }
                    <button 
                        className="btn btn-sm btn-icon btn-light-primary" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                        <i className="ki ki-bold-arrow-next icon-xs"></i>
                    </button>
                </div>
            </div>
        )}
        </div>
    );
};

export default memo(ResultsGrid);
