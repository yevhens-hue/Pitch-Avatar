import React, { useEffect, useState } from 'react';
import styles from './CoachAnalyticsDashboard.module.css';
import { TrainingAnalytics } from '@/types/coach';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CoachAnalyticsDashboardProps {
  projectId: string;
}

const CoachAnalyticsDashboard: React.FC<CoachAnalyticsDashboardProps> = ({ projectId }) => {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<TrainingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/coach/analytics?projectId=${projectId}`);
        const data = await res.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [projectId]);

  if (loading) return <div className={styles.container}>Loading analytics...</div>;

  if (!analytics) return <div className={styles.container}>No training data available yet. Complete some sessions!</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <button style={{background:'transparent', border:'none', color:'#fff', cursor:'pointer'}} onClick={() => router.push(`/coach/${projectId}`)}>
            <ChevronLeft size={24} />
          </button>
          <h1 className={styles.title}>Training Analytics</h1>
        </div>
        <div className={styles.subtitle}>Performance overview across all training sessions for this project.</div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Sessions</div>
          <div className={styles.metricValue}>{analytics.totalSessionsCompleted}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Average Score</div>
          <div className={styles.metricValue}>{analytics.averageScore}%</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Questions</div>
          <div className={styles.metricValue}>{analytics.totalQuestionsAnswered}</div>
        </div>
      </div>

      <div className={styles.scoreGrid}>
        <div className={styles.scoreCard}>
          <div className={styles.scoreTitle}>Skill Breakdown</div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div className={styles.barLabel}>
              <span>Product Knowledge</span>
              <span>{analytics.skillsBreakdown.productKnowledge}%</span>
            </div>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: `${analytics.skillsBreakdown.productKnowledge}%` }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div className={styles.barLabel}>
              <span>Objection Handling</span>
              <span>{analytics.skillsBreakdown.objectionHandling}%</span>
            </div>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: `${analytics.skillsBreakdown.objectionHandling}%`, background: '#8b5cf6' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div className={styles.barLabel}>
              <span>Needs Identification</span>
              <span>{analytics.skillsBreakdown.needsIdentification}%</span>
            </div>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: `${analytics.skillsBreakdown.needsIdentification}%`, background: '#f59e0b' }} />
            </div>
          </div>
        </div>

        <div className={styles.scoreCard}>
          <div className={styles.scoreTitle}>Common Weaknesses</div>
          <ul style={{ paddingLeft: '1.5rem', color: '#cbd5e1', lineHeight: '1.8' }}>
            {analytics.commonWeaknesses.length > 0 ? (
              analytics.commonWeaknesses.map((weakness, i) => <li key={i}>{weakness}</li>)
            ) : (
              <li>No common weaknesses identified yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CoachAnalyticsDashboard;
