import React from 'react';
import ReportHeader from '../../../components/reports/ReportHeader';
import ReportFooter from '../../../components/reports/ReportFooter';

const ReportCard = ({ student, term, assessments, subjects, rubrics, assessmentTypes, school }) => {
    const themeColor = school?.themeColor || '#1a1a1a';
    
    // Helper to find score for a specific subject and assessment type
    const getScore = (subjectId, typeId) => {
        const a = assessments.find(a => 
            (a.student === student.id || a.student?.id === student.id) &&
            (a.subject === subjectId || a.subject?.id === subjectId) &&
            (a.term === term.id || a.term?.id === term.id) &&
            (a.assessmentType === typeId || a.assessmentType?.id === typeId)
        );
        return a ? parseFloat(a.score) : null;
    };

    const getRubric = (score) => {
        if (score === "" || score === null || isNaN(score)) return null;
        const s = parseFloat(score);
        return (rubrics || []).find(r => s >= r.minScore && s <= r.maxScore);
    };

    // Calculate totals and averages
    const subjectRows = subjects.map(subject => {
        let subjectPoints = 0;
        const typeScores = (assessmentTypes || []).map(type => {
            const score = getScore(subject.id, type.id);
            const rubric = getRubric(score);
            if (rubric && rubric.points) {
                subjectPoints += parseFloat(rubric.points);
            }
            return { type, score, rubric };
        });

        // Collect rubric comments from all assessment types for this subject
        const rubricComments = typeScores
            .filter(ts => ts.rubric?.teachersComment)
            .map(ts => ts.rubric.teachersComment);
        // Deduplicate
        const uniqueComments = [...new Set(rubricComments)];

        return {
            subject,
            typeScores,
            totalPoints: subjectPoints,
            teachersComment: uniqueComments.length > 0 ? uniqueComments.join(' ') : '-'
        };
    });

    const totalOverallPoints = subjectRows.reduce((sum, row) => sum + row.totalPoints, 0);

    return (
        <div className="report-card-container" style={{ 
            padding: '1.2cm 2.0cm', 
            backgroundColor: 'white', 
            minHeight: '28cm', 
            height: 'auto', 
            width: '21cm', 
            margin: '0 auto', 
            pageBreakAfter: 'auto',
            position: 'relative',
            fontFamily: "'Inter', 'Roboto', sans-serif",
            color: '#1f2937', 
            boxSizing: 'border-box',
            overflow: 'visible'
        }}>
            {/* Header */}
            <ReportHeader school={school} title="Student Progress Report" themeColor={themeColor} />

            {/* Student Details Block (Replica of Statement Parent Block) */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '15px', 
                backgroundColor: '#ffffff', 
                padding: '20px', 
                borderRadius: '16px', 
                marginBottom: '1cm',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '10px' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>Student Name</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{student.names}</div>
                </div>
                <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '10px' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>Class / Reg No.</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{student.class?.name || student.class_name || 'N/A'} {student.registration ? `(${student.registration})` : ''}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>Term / Date</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{term?.name || '---'} | {new Date().toLocaleDateString('en-GB')}</div>
                </div>
            </div>

            {/* Results Table (Styled like Statement Summary Table) */}
            <div style={{ marginBottom: '1.0cm', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: themeColor }}>
                            <th style={{ padding: '14px 18px', textAlign: 'left', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', width: '35%' }}>Learning Area</th>
                            {assessmentTypes?.map(type => (
                                <th key={type.id} style={{ padding: '14px 10px', textAlign: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{type.name}</th>
                            ))}
                            <th style={{ padding: '14px 10px', textAlign: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Points</th>
                            <th style={{ padding: '14px 18px', textAlign: 'left', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjectRows.map((row, idx) => (
                            <tr key={idx} style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '14px 18px', fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
                                    {row.subject.name}
                                </td>
                                {row.typeScores.map((ts, tIdx) => (
                                    <td key={tIdx} style={{ padding: '14px 10px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>{ts.score !== null ? ts.score : '-'}</span>
                                            {ts.rubric && (
                                                <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 900, textTransform: 'uppercase' }}>
                                                    {ts.rubric.label}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                ))}
                                <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 900, fontSize: '1.2rem', color: themeColor }}>
                                    {row.totalPoints}
                                </td>
                                <td style={{ padding: '14px 18px', color: '#6b7280', fontSize: '0.8rem', fontStyle: 'italic', maxWidth: '200px' }}>
                                    {row.teachersComment}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <td style={{ padding: '18px 18px', fontWeight: 900, fontSize: '1.0rem', color: '#111827' }} colSpan={1 + (assessmentTypes?.length || 0)}>
                                AGGREGATE SUMMARY
                            </td>
                            <td style={{ padding: '18px 10px', textAlign: 'center', fontWeight: 900, fontSize: '1.4rem', color: themeColor }}>
                                {totalOverallPoints}
                            </td>
                            <td style={{ padding: '18px 18px', fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>
                                Total Points Earned
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Remarks Block (Replica of Statement Instructions Block) */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '1.5cm' }}>
                <div style={{ flex: 1, border: '2px solid #f3f4f6', padding: '20px', borderRadius: '16px', backgroundColor: '#ffffff' }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Performance Analysis
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
                        Student <strong>{student.names}</strong> has achieved an aggregate score of <strong>{totalOverallPoints} points</strong> across <strong>{subjects.length} learning areas</strong>. 
                        This reflects a steady commitment to academic progress. We encourage continued focus on areas of growth to ensure consistent mastery of the curriculum.
                    </p>
                </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', marginBottom: '2.5cm', padding: '0 10px' }}>
                <div style={{ width: '220px', textAlign: 'center' }}>
                    <div style={{ height: '40px' }}></div>
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '0.85rem', textTransform: 'uppercase' }}>Class Teacher</p>
                    </div>
                </div>
                <div style={{ width: '220px', textAlign: 'center' }}>
                    <div style={{ height: '40px' }}></div>
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '0.85rem', textTransform: 'uppercase' }}>Principal's Stamp</p>
                    </div>
                </div>
            </div>

            {/* Premium Pinned Footer */}
            <div style={{ position: 'absolute', bottom: '1.2cm', left: '2.0cm', right: '2.0cm' }}>
                <ReportFooter themeColor={themeColor} validationStatus="Authentic Academic Record" />
            </div>
        </div>
    );
};

export default ReportCard;
