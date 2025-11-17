import Link from 'next/link';
import { Memo } from '@/lib/microcms';
import styles from './MemoCard.module.css';

type Props = {
  memo: Memo;
};

export default function MemoCard({ memo }: Props) {
  const formattedDate = new Date(memo.processed_at).toLocaleDateString('ja-JP');

  return (
    <Link href={`/dashboard/${memo.id}`} className={styles.card}>
      <div className={styles.header}>
        <span className={styles.date}>{formattedDate}</span>
        <span className={styles.duration}>{memo.duration_seconds}秒</span>
      </div>

      <p className={styles.summary}>{memo.summary}</p>

      <div className={styles.tags}>
        {memo.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      <p className={styles.transcript}>{memo.transcript.slice(0, 100)}...</p>
    </Link>
  );
}