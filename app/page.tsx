// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{ textAlign: 'center', color: 'white', maxWidth: '1200px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: '800' }}>
          🎤 ボイスメモAI
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '3rem', opacity: 0.9 }}>
          音声を録音するだけで、AIが自動で文字起こし・要約・タグ生成
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📝</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>自動文字起こし</h3>
            <p>Whisper.cppによる高精度変換</p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🤖</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>AI要約</h3>
            <p>ELYZA-7Bで日本語要約</p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>類似検索</h3>
            <p>意味ベクトルで関連メモ発見</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            background: 'white',
            color: '#667eea',
            transition: 'transform 0.2s',
          }}>
            ログイン
          </Link>
          <Link href="/signup" style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            background: 'transparent',
            border: '2px solid white',
            color: 'white',
            transition: 'transform 0.2s',
          }}>
            新規登録
          </Link>
        </div>
      </div>
    </main>
  );
}
