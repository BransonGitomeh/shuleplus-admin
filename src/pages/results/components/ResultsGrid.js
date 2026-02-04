import React, { memo } from 'react';

const ResultsGrid = ({ students, subjects, assessments, rubrics, updates, onScoreChange }) => {
    
    // Helper to get score for a cell (either from updates or original data)
    const getScore = (studentId, subjectId) => {
        // 1. Check pending updates first
        const updateKey = `${studentId}-${subjectId}`;
        if (updates && updates.hasOwnProperty(updateKey)) {
            return updates[updateKey];
        }

        // 2. Check existing assessments
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

    return (
        <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover table-sm">
                <thead className="thead-light">
                    <tr>
                        <th style={{ minWidth: '200px', position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#f8f9fa' }}>
                            Student Name
                        </th>
                        {subjects && subjects.map(subj => (
                            <th key={subj?.id} className="text-center" style={{ minWidth: '120px' }}>
                                {(subj?.name || "Unknown").substring(0, 15)}
                            </th>
                        ))}
                        <th className="text-center">Total Points</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => {
                        let totalPoints = 0;
                        let count = 0;
                        
                        return (
                            <tr key={student.id}>
                            <td className="font-weight-bold" style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#fff' }}>
                                 {student?.names || student?.id || "Unnamed Student"}
                            </td>
                            {(subjects || []).map(subj => {
                                const val = getScore(student.id, subj.id);
                                const rubric = getRubric(val);
                                
                                if (rubric && rubric.points) {
                                    totalPoints += parseFloat(rubric.points);
                                    count++;
                                }

                                const isUpdated = updates && updates.hasOwnProperty(`${student.id}-${subj.id}`);

                                return (
                                    <td key={`${student.id}-${subj.id}`} className="p-1">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <input
                                                type="number"
                                                className={`form-control form-control-sm text-center ${isUpdated ? 'bg-light-warning' : ''}`}
                                                value={val}
                                                style={{ border: 'none', background: isUpdated ? '#fff8dd' : 'transparent', width: '60px' }}
                                                onChange={(e) => onScoreChange(student.id, subj.id, e.target.value)}
                                                placeholder="-"
                                            />
                                            {rubric && (
                                                <span className="badge badge-light-primary" style={{ fontSize: '0.7rem' }}>
                                                    {rubric.label} {rubric.points ? `(${rubric.points} pts)` : ''}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                            <td className="text-center font-weight-bold bg-light" style={{ fontSize: '1.1rem' }}>
                                {totalPoints > 0 ? totalPoints : '-'}
                            </td>
                        </tr>
                    );
                })}
                {(!students || students.length === 0) && (
                    <tr>
                        <td colSpan={(subjects?.length || 0) + 2} className="text-center text-muted p-5">
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
