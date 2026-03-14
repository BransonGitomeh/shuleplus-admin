import React, { memo, useState, useCallback } from 'react';

/** Simple inline bar chart for a student's subject scores */
const StudentChart = ({ student, subjects, assessments, rubrics, updates, themeColor = '#3699ff' }) => {
    const getScore = (studentId, subjectId) => {
        const key = `${studentId}-${subjectId}`;
        if (updates && updates.hasOwnProperty(key)) return parseFloat(updates[key]) || 0;
        const a = assessments.find(a =>
            (a.student === studentId || a.student?.id === studentId) &&
            (a.subject === subjectId || a.subject?.id === subjectId)
        );
        return a ? (parseFloat(a.score) || 0) : 0;
    };

    const getRubric = (score) => {
        if (!score || isNaN(score)) return null;
        return (rubrics || []).find(r => score >= r.minScore && score <= r.maxScore);
    };

    const bars = subjects.map(subj => {
        const score = getScore(student.id, subj.id);
        const rubric = getRubric(score);
        const color = rubric
            ? (rubric.label === 'EE' ? '#10b981' : rubric.label === 'ME' ? '#3699ff' : rubric.label === 'AE' ? '#f6c23e' : '#e74c3c')
            : '#e5e7eb';
        return { name: subj.name, score, color, rubric };
    }).filter(b => b.score > 0);

    const getComments = () => {
        return (subjects || []).map(subj => {
            const score = getScore(student.id, subj.id);
            const rubric = score !== '' && score !== null ? getRubric(score) : null;
            return rubric?.teachersComment ? { subject: subj.name, comment: rubric.teachersComment } : null;
        }).filter(Boolean);
    };

    const comments = getComments();
    const maxScore = 100;

    return (
        <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #f8f9fc, #ffffff)', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Bar Chart */}
                {bars.length > 0 ? (
                    <div style={{ flex: 2, minWidth: '300px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                            Subject Performance
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {bars.map((bar, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '100px', fontSize: '0.78rem', fontWeight: 600, color: '#374151', flexShrink: 0, textAlign: 'right', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {bar.name}
                                    </div>
                                    <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '20px', height: '18px', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${(bar.score / maxScore) * 100}%`,
                                            height: '100%',
                                            background: bar.color,
                                            borderRadius: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingRight: '8px',
                                            justifyContent: 'flex-end',
                                            transition: 'width 0.4s ease',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            color: 'white'
                                        }}>
                                            {bar.score > 10 ? bar.score : ''}
                                        </div>
                                    </div>
                                    {bar.rubric && (
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: 900,
                                            background: bar.color + '22',
                                            color: bar.color,
                                            flexShrink: 0
                                        }}>
                                            {bar.rubric.label}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 2, color: '#9ca3af', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                        No scores recorded for this student.
                    </div>
                )}

                {/* Teacher Comments */}
                {comments.length > 0 && (
                    <div style={{ flex: 1, minWidth: '200px', borderLeft: '1px solid #e5e7eb', paddingLeft: '20px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                            Teacher Comments
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {comments.map((c, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>{c.subject}</div>
                                    <div style={{ fontSize: '0.82rem', color: '#374151', fontStyle: 'italic', lineHeight: '1.4' }}>{c.comment}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ResultsGrid = ({ students, subjects, assessments, rubrics, updates, onScoreChange, onPrintSingle, onSendSms }) => {
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

    const getRubricColor = (rubric) => {
        if (!rubric) return '#3699ff';
        if (rubric.label === 'EE') return '#10b981';
        if (rubric.label === 'ME') return '#3699ff';
        if (rubric.label === 'AE') return '#f6c23e';
        return '#e74c3c';
    };

    return (
        <div className="table-responsive">
            <table className="table table-bordered table-hover table-sm" style={{ tableLayout: 'auto' }}>
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
                        <th style={{ minWidth: '200px' }}>Teacher Comment</th>
                        <th className="text-center" style={{ minWidth: '130px', position: 'sticky', right: 0, zIndex: 10, backgroundColor: '#f8f9fa' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => {
                        let totalPoints = 0;
                        const isExpanded = !!expandedStudents[student.id];

                        // Inline teacher comment: collect rubric comments per subject, deduplicated
                        const teacherComment = (() => {
                            const parts = (subjects || []).map(subj => {
                                const val = getScore(student.id, subj.id);
                                const rubric = val !== '' && val !== null ? getRubric(val) : null;
                                return rubric?.teachersComment ? `${subj.name}: ${rubric.teachersComment}` : null;
                            }).filter(Boolean);
                            return parts.join(' | ');
                        })();

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
                                    <td className="align-middle" style={{ fontSize: '0.82rem', color: '#6b7280', fontStyle: 'italic', lineHeight: '1.4' }}>
                                        {teacherComment || <span className="text-muted" style={{ fontSize: '0.75rem' }}>—</span>}
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
                                            <StudentChart
                                                student={student}
                                                subjects={subjects}
                                                assessments={assessments}
                                                rubrics={rubrics}
                                                updates={updates}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    {(!students || students.length === 0) && (
                        <tr>
                            <td colSpan={(subjects?.length || 0) + 4} className="text-center text-muted p-5">
                                No students found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default memo(ResultsGrid);
