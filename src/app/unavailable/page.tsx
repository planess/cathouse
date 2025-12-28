import React from 'react';

import styles from './page.module.scss';

export default function UnavailablePage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Сайт буде доступний скоро</h1>
        <p className={styles.paragraph}>
          Зараз ми проводимо технічне обслуговування. Будь ласка, зайдіть пізніше.
        </p>
      </div>
    </div>
  );
}
