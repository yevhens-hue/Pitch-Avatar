import React from 'react';
import styles from './EvaluationCard.module.css';
import { CoachEvaluation } from '@/types/coach';

interface EvaluationCardProps {
  evaluation: CoachEvaluation;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ evaluation }) => {
  let badgeClass = styles.badgeIncorrect;
  if (evaluation.result === 'Correct') badgeClass = styles.badgeCorrect;
  else if (evaluation.result === 'Partially Correct') badgeClass = styles.badgePartial;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Evaluation Result</div>
        <div className={`${styles.badge} ${badgeClass}`}>
          {evaluation.result}
        </div>
      </div>

      <div className={styles.scoreRow}>
        <div className={styles.scoreLabel}>Overall Score</div>
        <div className={styles.scoreValue}>{evaluation.score}%</div>
      </div>

      <div className={styles.feedback}>
        {evaluation.feedback}
      </div>

      {evaluation.recommendations && evaluation.recommendations.length > 0 && (
        <div className={styles.recommendations}>
          <div className={styles.recTitle}>Recommendations</div>
          <ul className={styles.recList}>
            {evaluation.recommendations.map((rec, idx) => (
              <li key={idx} className={styles.recItem}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EvaluationCard;
