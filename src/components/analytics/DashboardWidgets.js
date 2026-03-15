import React from 'react';

/**
 * Premium Stat Card with icon and badge
 */
export const StatCard = ({ title, value, subtext, icon, color = '#3699ff', trend }) => (
    <div className="card card-custom gutter-b" style={{ height: '140px', borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <div className="card-body d-flex flex-column p-8">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <span className={`symbol symbol-45 symbol-light-${color === '#3699ff' ? 'primary' : 'success'}`}>
                    <span className="symbol-label">
                        <i className={`text-${color === '#3699ff' ? 'primary' : 'success'} ${icon}`} style={{ fontSize: '1.2rem' }}></i>
                    </span>
                </span>
                {trend && (
                    <span className={`label label-light-${trend > 0 ? 'success' : 'danger'} label-inline font-weight-bold`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div className="d-flex flex-column">
                <span className="text-dark-75 font-weight-bolder font-size-h3">{value}</span>
                <span className="text-muted font-weight-bold font-size-sm">{title}</span>
                {subtext && <span className="text-muted font-size-xs mt-1">{subtext}</span>}
            </div>
        </div>
    </div>
);

/**
 * SVG Donut Distribution Chart
 */
export const DistributionChart = ({ data, title, height = 200 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="card card-custom gutter-b" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <div className="card-header border-0 pt-5">
                <h3 className="card-title align-items-start flex-column">
                    <span className="card-label font-weight-bolder text-dark">{title}</span>
                </h3>
            </div>
            <div className="card-body pt-2 d-flex align-items-center flex-wrap">
                <div style={{ position: 'relative', width: '150px', height: '150px', marginRight: '30px' }}>
                    <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        {data.map((item, i) => {
                            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                            cumulativePercent += item.value / (total || 1);
                            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                            const largeArcFlag = item.value / (total || 1) > 0.5 ? 1 : 0;
                            const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
                            return <path key={i} d={pathData} fill={item.color} />;
                        })}
                        <circle cx="0" cy="0" r="0.65" fill="#fff" />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3f4254' }}>{total}</div>
                        <div style={{ fontSize: '0.6rem', color: '#b5b5c3', textTransform: 'uppercase' }}>Total</div>
                    </div>
                </div>
                <div className="d-flex flex-column" style={{ flex: 1, minWidth: '120px' }}>
                    {data.map((item, i) => (
                        <div key={i} className="d-flex align-items-center mb-2">
                            <span className="bullet bullet-sm mr-2" style={{ backgroundColor: item.color }}></span>
                            <span className="text-muted font-weight-bold font-size-sm flex-grow-1">{item.label}</span>
                            <span className="text-dark-75 font-weight-bolder font-size-sm">{Math.round((item.value / (total || 1)) * 100)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * SVG Performance Trend Bar Chart
 */
export const TrendBarChart = ({ data, title, height = 250 }) => {
    const maxVal = Math.max(...data.map(d => d.value), 10);
    const chartHeight = height - 100;
    const padding = 20;

    return (
        <div className="card card-custom gutter-b" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <div className="card-header border-0 pt-5">
                <h3 className="card-title align-items-start flex-column">
                    <span className="card-label font-weight-bolder text-dark">{title}</span>
                </h3>
            </div>
            <div className="card-body pt-0" style={{ height: `${height}px` }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: `${chartHeight}px`, gap: '15px', padding: `0 ${padding}px` }}>
                    {data.map((d, i) => {
                        const barHeight = (d.value / maxVal) * chartHeight;
                        return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '100%', 
                                    height: `${barHeight}px`, 
                                    background: d.color || '#3699ff', 
                                    borderRadius: '6px 6px 0 0',
                                    position: 'relative',
                                    transition: 'height 0.4s ease'
                                }}>
                                    <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '10px', fontWeight: 800, color: '#3f4254' }}>
                                        {Math.round(d.value)}
                                    </div>
                                </div>
                                <div style={{ marginTop: '10px', fontSize: '10px', fontWeight: 700, color: '#b5b5c3', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                                    {d.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default { StatCard, DistributionChart, TrendBarChart };
