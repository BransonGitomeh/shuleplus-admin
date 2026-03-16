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

    useEffect(() => {
        if (student.id) {
            Data.assessments.getForStudent(student.id);
        }
    }, [student.id]);

    // Cross-Term Performance Matrix Data
    const crossTermMatrix = useMemo(() => {
        const sortedTerms = [...(allTerms || [])].sort((a,b) => (a.order || 0) - (b.order || 0));
        return sortedTerms.map(term => {
            const termAss = studentAll.filter(a => (a.term === term.id || a.term?.id === term.id));
            const subjectScores = subjects.map(subj => {
                const a = termAss.find(a => (a.subject === subj.id || a.subject?.id === subj.id));
                return a ? parseFloat(a.score) : null;
            });
            const termAvg = subjectScores.filter(s => s !== null).length > 0 
                ? (subjectScores.reduce((sum, s) => sum + (s || 0), 0) / subjectScores.filter(s => s !== null).length) 
                : 0;
            return { term, subjectScores, termAvg };
        }).filter(d => d.subjectScores.some(s => s !== null)); // Only show terms with data
    }, [allTerms, studentAll, subjects]);

    return (
        <div style={{ padding: '20px 24px', background: '#f9fafc', borderTop: '3px solid #3699ff' }}>
            <div className="row">

                {/* === LEFT PANEL === */}
                <div className="col-lg-6 pr-lg-6">

                    {/* Subject Performance Bar Chart */}
                    <div className="card card-custom card-shadowless bg-white mb-4" style={{ borderRadius: '8px', border: '1px solid #ebedf3' }}>
                        <div className="card-body p-5">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b5b5c3', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Subject Performance (%)
                                </div>
                                <span className="label label-inline label-light-primary font-weight-bold font-size-xs">
                                    Current Term
                                </span>
                            </div>
                            {revisionInsights.currentBars.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {revisionInsights.currentBars.map((bar, i) => {
                                        const rubric = (rubrics || []).find(r => bar.score >= r.minScore && bar.score <= r.maxScore);
                                        const colorMap = { 'EE': '#10b981', 'ME': '#3699ff', 'AE': '#f6c23e', 'BE': '#e74c3c' };
                                        const color = rubric ? (colorMap[rubric.label] || '#6c757d') : '#d1d5db';
                                        return (
                                            <div key={i}>
                                                <div className="d-flex align-items-center justify-content-between mb-1">
                                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3f4254', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {bar.name}
                                                    </span>
                                                    <div className="d-flex align-items-center">
                                                        {rubric && (
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: color, marginRight: '8px' }}>
                                                                {rubric.label}
                                                            </span>
                                                        )}
                                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3f4254' }}>
                                                            {bar.score}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ height: '8px', background: '#f3f6f9', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${bar.score}%`, height: '100%', background: color, borderRadius: '10px', transition: 'width 0.6s ease' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-muted small p-4 text-center bg-light rounded">No scores recorded this term.</div>
                            )}
                        </div>
                    </div>

                    {/* Progress Trend Chart */}
                    <div className="card card-custom card-shadowless bg-white" style={{ borderRadius: '8px', border: '1px solid #ebedf3' }}>
                        <div className="card-body p-5">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b5b5c3', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Progress Trend
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="text-muted font-weight-bold font-size-xs mr-2">Prev:</span>
                                    <span className="text-dark-75 font-weight-boldest font-size-sm mr-4">{Math.round(trendData[trendData.length-2]?.avg || 0)}%</span>
                                    <span className="text-muted font-weight-bold font-size-xs mr-2">Current:</span>
                                    <span className="text-primary font-weight-boldest font-size-sm">{Math.round(trendData[trendData.length-1]?.avg || 0)}%</span>
                                </div>
                            </div>
                            {renderTrendChart()}
                        </div>
                    </div>

                </div>

                {/* === RIGHT PANEL === */}
                <div className="col-lg-6 pl-lg-6">

                    {/* Mobile Revision Stats */}
                    <div className="card card-custom card-shadowless bg-white mb-4" style={{ borderRadius: '8px', border: '1px solid #ebedf3' }}>
                        <div className="card-body p-5">
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b5b5c3', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                                Mobile Revision
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <div className="d-flex flex-column bg-light-primary p-4 rounded" style={{ borderLeft: '3px solid #3699ff' }}>
                                        <span className="text-primary font-weight-boldest font-size-h3">{revisionInsights.totalAttempts}</span>
                                        <span className="text-muted font-weight-bold font-size-xs text-uppercase">Attempts</span>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-flex flex-column bg-light-success p-4 rounded" style={{ borderLeft: '3px solid #10b981' }}>
                                        <span className="text-success font-weight-boldest font-size-h3">{revisionInsights.revisionAvg}%</span>
                                        <span className="text-muted font-weight-bold font-size-xs text-uppercase">Avg Score</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Insights (Strengths / Weaknesses) */}
                    <div className="card card-custom card-shadowless bg-white mb-4" style={{ borderRadius: '8px', border: '1px solid #ebedf3' }}>
                        <div className="card-body p-5">
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b5b5c3', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                                Performance Insights
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="flaticon2-check-mark text-success mr-2" style={{ fontSize: '0.8rem' }}></i>
                                        <span className="font-weight-boldest text-dark-75 font-size-xs text-uppercase">Strengths</span>
                                    </div>
                                    <div className="d-flex flex-wrap" style={{ gap: '4px' }}>
                                        {revisionInsights.strengths.length > 0 ? revisionInsights.strengths.map((s, i) => (
                                            <span key={i} className="label label-inline label-light-success font-weight-bold" style={{ fontSize: '0.65rem' }}>{s}</span>
                                        )) : <span className="text-muted font-size-xs">N/A</span>}
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="flaticon2-warning text-danger mr-2" style={{ fontSize: '0.8rem' }}></i>
                                        <span className="font-weight-boldest text-dark-75 font-size-xs text-uppercase">Focus Areas</span>
                                    </div>
                                    <div className="d-flex flex-wrap" style={{ gap: '4px' }}>
                                        {revisionInsights.weaknesses.length > 0 ? revisionInsights.weaknesses.map((s, i) => (
                                            <span key={i} className="label label-inline label-light-danger font-weight-bold" style={{ fontSize: '0.65rem' }}>{s}</span>
                                        )) : <span className="text-muted font-size-xs">N/A</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cross-Term Sub-Matrix Table */}
                    <div className="card card-custom card-shadowless bg-white" style={{ borderRadius: '8px', border: '1px solid #ebedf3' }}>
                        <div className="card-body p-5">
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b5b5c3', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                                Cross-Term Comparison
                            </div>
                            <div className="table-responsive">
                                <table className="table table-borderless table-vertical-center mb-0">
                                    <thead>
                                        <tr>
                                            <th className="p-0" style={{ minWidth: '80px' }}>Term</th>
                                            {subjects.map(s => (
                                                <th key={s.id} className="p-0 text-center" style={{ minWidth: '40px' }}>
                                                    <span className="text-muted font-weight-bold font-size-xs d-block">{s.name.slice(0,3)}</span>
                                                </th>
                                            ))}
                                            <th className="p-0 text-right" style={{ minWidth: '40px' }}>Avg</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {crossTermMatrix.map((row, i) => (
                                            <tr key={i} style={{ borderBottom: i === crossTermMatrix.length - 1 ? 'none' : '1px solid #f3f6f9' }}>
                                                <td className="pl-0 py-2">
                                                    <span className="text-dark-75 font-weight-bolder d-block font-size-xs">{row.term.name}</span>
                                                </td>
                                                {row.subjectScores.map((score, j) => (
                                                    <td key={j} className="text-center py-2">
                                                        <span className={`font-weight-bold font-size-xs ${score === null ? 'text-muted opacity-30' : 'text-dark-75'}`}>
                                                            {score !== null ? Math.round(score) : '-'}
                                                        </span>
                                                    </td>
                                                ))}
                                                <td className="pr-0 py-2 text-right text-primary font-weight-boldest font-size-xs">
                                                    {Math.round(row.termAvg)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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

const ResultsGrid = ({ students, subjects, assessments, allAssessments, allTerms, assessmentTypes, rubrics, updates, onScoreChange, onRemarkChange, onCommentChange, onBlur, onPrintSingle, onSendSms, loading, lessonAttempts = [], attemptEvents = [] }) => {
    const [expandedStudents, setExpandedStudents] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;

    const toggleStudent = useCallback((studentId) => {
        setExpandedStudents(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    }, []);


    // Helper to get score for a cell
    const getScore = (studentId, subjectId, typeId) => {
        const updateKey = `${studentId}-${subjectId}-${typeId}-score`;
        if (updates && updates.hasOwnProperty(updateKey)) {
            return updates[updateKey];
        }
        const assessment = assessments.find(a =>
            (a.student === studentId || a.student?.id === studentId) &&
            (a.subject === subjectId || a.subject?.id === subjectId) &&
            (a.assessmentType === typeId || a.assessmentType?.id === typeId || a.type === typeId || a.type?.id === typeId)
        );
        return assessment ? assessment.score : "";
    };

    const getRemark = (studentId, subjectId, typeId) => {
        const updateKey = `${studentId}-${subjectId}-${typeId}-remark`;
        if (updates && updates.hasOwnProperty(updateKey)) {
            return updates[updateKey];
        }
        const assessment = assessments.find(a =>
            (a.student === studentId || a.student?.id === studentId) &&
            (a.subject === subjectId || a.subject?.id === subjectId) &&
            (a.assessmentType === typeId || a.assessmentType?.id === typeId || a.type === typeId || a.type?.id === typeId)
        );
        return assessment ? (assessment.remarks || assessment.remark || "") : "";
    };

    const getComment = (studentId, subjectId, typeId) => {
        const updateKey = `${studentId}-${subjectId}-${typeId}-comment`;
        if (updates && updates.hasOwnProperty(updateKey)) {
            return updates[updateKey];
        }
        const assessment = assessments.find(a =>
            (a.student === studentId || a.student?.id === studentId) &&
            (a.subject === subjectId || a.subject?.id === subjectId) &&
            (a.assessmentType === typeId || a.assessmentType?.id === typeId || a.type === typeId || a.type?.id === typeId)
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
                                <th key={subj.id} className="text-center" style={{ minWidth: '150px' }}>{subj.name}</th>
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
                                            return (
                                                <td key={subj.id} className="text-center py-4">
                                                    <div className="d-flex flex-row justify-content-center align-items-start" style={{ gap: '10px' }}>
                                                        {assessmentTypes?.map(type => {
                                                            const val = getScore(student.id, subj.id, type.id);
                                                            const rubric = getRubric(val);
                                                            if (rubric?.points) totalPoints += parseFloat(rubric.points);
                                                            const isUpdated = updates?.hasOwnProperty(`${student.id}-${subj.id}-${type.id}-score`);
                                                            const color = getRubricColor(rubric);

                                                            return (
                                                                <div key={type.id} className="d-flex flex-column align-items-center">
                                                                    <div className="text-muted font-weight-bold font-size-xs mb-1" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '60px' }} title={type.name}>{type.name}</div>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm text-center font-weight-boldest px-1"
                                                                        value={val}
                                                                        onBlur={onBlur ? () => onBlur() : undefined}
                                                                        onChange={(e) => onScoreChange(student.id, subj.id, type.id, e.target.value)}
                                                                        style={{ 
                                                                            width: '60px', 
                                                                            height: '35px', 
                                                                            fontSize: '1.1rem',
                                                                            borderRadius: '8px',
                                                                            border: isUpdated ? '2px solid #f6c23e' : '1px solid #ebedf3',
                                                                            background: isUpdated ? '#fff8dd' : '#f8f9fb',
                                                                            marginBottom: '4px'
                                                                        }}
                                                                    />
                                                                    {rubric && (
                                                                        <div className="d-flex flex-column align-items-center">
                                                                            <div 
                                                                                className="label label-inline font-weight-boldest mb-1" 
                                                                                style={{ 
                                                                                    backgroundColor: `${color}15`, 
                                                                                    color: color,
                                                                                    fontSize: '10px',
                                                                                    padding: '2px 6px',
                                                                                    borderRadius: '4px',
                                                                                    border: `1px solid ${color}`
                                                                                }}
                                                                            >
                                                                                {rubric.label}
                                                                            </div>
                                                                            {rubric.teachersComment && (
                                                                                <div className="text-muted font-weight-bold text-center px-1 mt-1" style={{ fontSize: '9px', lineHeight: '1.2', maxWidth: '80px', pointerEvents: 'none' }}>
                                                                                    {rubric.teachersComment}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="text-center align-middle">
                                            <span className="text-dark-75 font-weight-bolder font-size-h6">
                                                {totalPoints || '-'}
                                            </span>
                                        </td>
                                        <td className="text-right pr-0">
                                            <button 
                                                className="btn btn-icon btn-light-primary btn-sm mx-1" 
                                                onClick={() => toggleStudent(student.id)}
                                                title="View Details"
                                            >
                                                <i className={`flaticon2-${isExpanded ? 'up' : 'down'}`}></i>
                                            </button>
                                            <button 
                                                className="btn btn-icon btn-light-success btn-sm mx-1" 
                                                onClick={() => onPrintSingle?.(student)}
                                                title="Print Statement"
                                            >
                                                <i className="fa fa-print text-dark"></i>
                                            </button>
                                            <button 
                                                className="btn btn-icon btn-light-info btn-sm mx-1" 
                                                onClick={() => onSendSms?.(student)}
                                                title="Send SMS balance"
                                            >
                                                <i className="flaticon2-paper-plane"></i>
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
