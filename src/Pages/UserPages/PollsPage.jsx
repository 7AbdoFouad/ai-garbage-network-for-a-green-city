import React from 'react';
import useUser from "../../hooks/useUser";
import styles from './PollsPage.module.css';

export default function PollsPage() {
  const { Polls } = useUser();

  return (
    <div className={styles.container}>
      <h2>🗳️ استطلاعات الرأي 🗳️</h2>
      <div className={styles.pollGrid}>
        {Polls.map((poll, index) => (
          <div key={index} className={styles.pollCard}>
            {/* Poll Image */}
            <img src={`/src/Pages/UserPages/${index+12}.jpg`} alt={poll.pollName} className={styles.pollImage} />

            <div className={styles.pollContent}>
              <h3 className={styles.pollTitle}>{poll.pollName}</h3>
              <p className={styles.pollDescription}>{poll.pollDesc}</p>

              {/* Poll End Date */}
              <p className={styles.pollDate}>🗓️ <strong>تاريخ انتهاء الاستطلاع:</strong> {poll.pollEndDate}</p>

              {/* Vote Button */}
              <button className={styles.pollButton}>🎯 استطلاع الآن</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
