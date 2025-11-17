'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';

type Memo = {
  id: string;
  user_id: string;
  audio_url: string;
  transcript: string;
  summary: string;
  tags: string[];
  processed_at: string;
  audio_filename: string;
  duration_seconds: number;
};

export default function MemoDetail() {
  const [memo, setMemo] = useState<Memo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [editedTranscript, setEditedTranscript] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchMemo();
  }, [id, user, router]);

  const fetchMemo = async () => {
    try {
      const res = await fetch(`/api/memos/${id}`);
      if (!res.ok) {
        throw new Error('メモの取得に失敗しました');
      }
      const data = await res.json();
      setMemo(data);
      setEditedSummary(data.summary);
      setEditedTranscript(data.transcript);
      setLoading(false);
    } catch (error) {
      console.error('メモ取得エラー:', error);
      alert('メモが見つかりません');
      router.push('/dashboard');
    }
  };

  const handleDelete = async () => {
    if (!confirm('このメモを削除しますか？')) return;

    try {
      const res = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ メモを削除しました');
        router.push('/dashboard');
      } else {
        throw new Error('削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('❌ 削除に失敗しました');
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/memos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: editedSummary,
          transcript: editedTranscript,
        }),
      });

      if (res.ok) {
        alert('✅ メモを更新しました');
        setIsEditing(false);
        fetchMemo();
      } else {
        throw new Error('更新に失敗しました');
      }
    } catch (error) {
      console.error('更新エラー:', error);
      alert('❌ 更新に失敗しました');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>読み込み中...</div>;
  }

  if (!memo) {
    return <div style={{ padding: '2rem' }}>メモが見つかりません</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ color: '#667eea', fontSize: '0.9rem' }}>
          ← ダッシュボードに戻る
        </Link>
      </div>

      {/* メモ情報 */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '1rem',
        padding: '2rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>メモ詳細</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  ✏️ 編集
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  🗑️ 削除
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  💾 保存
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedSummary(memo.summary);
                    setEditedTranscript(memo.transcript);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  ✖️ キャンセル
                </button>
              </>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem' }}>
          作成日時: {new Date(memo.processed_at).toLocaleString('ja-JP')}
        </p>

        {/* タグ */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>🏷️ タグ</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {memo.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 要約 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>📋 要約</h2>
          {isEditing ? (
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '0.75rem',
                border: '2px solid #3b82f6',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <p style={{ lineHeight: '1.6', color: '#333' }}>{memo.summary}</p>
          )}
        </div>

        {/* 文字起こし */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>📝 文字起こし</h2>
          {isEditing ? (
            <textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '0.75rem',
                border: '2px solid #3b82f6',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <p style={{ lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap' }}>{memo.transcript}</p>
          )}
        </div>

        {/* 音声ファイル情報 */}
        <div style={{
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>🎵 音声情報</h2>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>ファイル名: {memo.audio_filename}</p>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>保存先: {memo.audio_url}</p>
        </div>
      </div>
    </div>
  );
}
