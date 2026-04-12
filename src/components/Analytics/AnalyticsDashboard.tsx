import React from 'react';
import styles from './AnalyticsDashboard.module.css';

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Project Analytics</h1>
        <p style={{color: 'rgba(255,255,255,0.6)'}}>Track your interactive presentation performance</p>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Sessions</span>
          <span className={styles.metricValue}>1,402</span>
          <span className={styles.metricTrend}>↑ 12% vs last week</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Avg. View Time</span>
          <span className={styles.metricValue}>04:12</span>
          <span className={styles.metricTrend}>↑ 5% vs last week</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Interactions</span>
          <span className={styles.metricValue}>853</span>
          <span className={styles.metricTrend} style={{color: '#fed6e3'}}>↓ 2% vs last week</span>
        </div>
      </div>

      <div className={styles.chartPlaceholder} style={{display: 'flex', alignItems: 'flex-end', padding: '2rem', gap: '0.5rem'}}>
        {[40, 70, 45, 90, 65, 80, 55, 95, 40, 60, 85, 75].map((h, i) => (
          <div 
            key={i} 
            style={{
              flex: 1, 
              height: `${h}%`, 
              background: 'linear-gradient(to top, #667eea, #764ba2)', 
              borderRadius: '4px 4px 0 0',
              animation: `grow 1s ease-out ${i * 0.1}s forwards`,
              opacity: 0,
              transform: 'scaleY(0)',
              transformOrigin: 'bottom'
            }}
          ></div>
        ))}
        <style jsx>{`
          @keyframes grow {
            to { opacity: 1; transform: scaleY(1); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
