# 🎤 Voice Memo AI

**Voice Memo AI** は、音声録音・ファイルアップロード・テキスト入力から自動で文字起こし・要約・タグ生成を行い、microCMSに保存するNext.jsアプリケーションです。

Firebase認証によるユーザー管理、Google Colab GPUでのAI処理、Google Driveバックアップ機能を搭載しています。

---

## ✨ 主な機能

### 🎙️ 音声入力
- **ブラウザ録音**: MediaRecorder APIでマイクから直接録音
- **ファイルアップロード**: MP3, WAV, M4A, OGGなどの音声ファイルに対応
- **テキスト入力**: 手動でメモを入力

### 🤖 AI処理（Google Colab GPU）
- **文字起こし**: Kotoba Whisper v2.2による高精度な日本語文字起こし
- **自動要約**: rinna GPT2-smallで3文以内に要約
- **タグ生成**: 内容から関連タグを自動抽出（#会議、#TODO、#予定など）
- **埋め込みベクトル**: 類似メモ検索用のベクトル生成

### 📝 メモ管理
- **一覧表示**: ユーザーごとのメモをカード形式で表示
- **詳細閲覧**: 要約、文字起こし全文、タグの確認
- **編集・削除**: メモの編集および削除機能
- **検索**: タグやキーワードでメモを検索（実装予定）

### 💾 バックアップ
- **Google Drive連携**: OAuth 2.0でGoogle Driveに音声ファイルをバックアップ
- **オプション**: チェックボックスでバックアップのON/OFF切り替え可能

### 🔐 認証
- **Firebase Authentication**: メール/パスワード認証
- **ユーザーごとのデータ分離**: user_idでデータを管理

---

## ��️ 技術スタック

### フロントエンド
- **Next.js 14** (App Router, TypeScript)
- **React 18** (Hooks: useState, useEffect, useRef)
- **CSS Modules** + globals.css（Tailwind不使用）
- **next-auth** (Google OAuth)

### バックエンド・API
- **Next.js API Routes** (microCMS連携、Colab連携)
- **Firebase Authentication** (ユーザー認証)
- **Google Drive API** (音声ファイルバックアップ)

### AI処理（Google Colab）
- **Kotoba Whisper v2.2** (faster-whisper, CPU版)
- **rinna GPT2-small** (日本語要約モデル)
- **sentence-transformers** (paraphrase-multilingual-MiniLM-L12-v2)
- **Flask** (Colab APIサーバー)
- **ngrok** (Colab公開用トンネル)

### データ管理
- **microCMS** (メモデータ、ユーザー設定)
- **Google Drive** (音声ファイルバックアップ、オプション)

### デプロイ
- **Vercel** (Next.jsアプリ本番環境)
- **Google Colab** (AI処理サーバー)

---

## 📋 必要な準備

### 1. Firebase プロジェクト
1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. **Authentication** → メール/パスワード認証を有効化
3. ウェブアプリを追加して設定情報を取得

### 2. microCMS
1. [microCMS](https://microcms.io/) でアカウント作成
2. サービス作成（例: `voicememo`）
3. **API作成**: `memos`（リスト形式）
4. スキーマ設定:
   - `user_id` (テキスト、必須)
   - `audio_url` (テキスト、必須)
   - `transcript` (テキストエリア、必須)
   - `summary` (テキストエリア)
   - `tags` (複数選択)
   - `embedding_vector` (テキストエリア)
   - `processed_at` (日時)
   - `audio_filename` (テキスト)
   - `duration_seconds` (数値)
5. **API作成**: `user-settings`（リスト形式）
   - `user_id` (テキスト、必須)
   - `enable_gdrive_backup` (真偽値)
6. APIキーを取得

### 3. Google Cloud Console（Google Drive連携用）
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. **Google Drive API** を有効化
3. **OAuth 2.0 認証情報** を作成:
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みのリダイレクトURI: `http://localhost:3000/api/auth/callback/google`
   - クライアントIDとシークレットをコピー

### 4. ngrok アカウント
1. [ngrok](https://dashboard.ngrok.com/) でアカウント作成
2. 認証トークンを取得

---

## 🚀 セットアップ

### 1. リポジトリクローン
```bash
git clone https://github.com/your-username/voice-memo-ai.git
cd voice-memo-ai
```

### 2. 依存関係インストール
```bash
npm install
```

### 3. 環境変数設定

`.env.local` ファイルを作成:
```env
# microCMS
MICROCMS_SERVICE_ID=voicememo
MICROCMS_API_KEY=your-microcms-api-key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google OAuth (Google Drive連携用)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-32-chars-min

# Colab API（後でngrok URLに置き換え）
COLAB_API_URL=https://your-ngrok-url.ngrok.io
```

### 4. 開発サーバー起動
```bash
npm run dev
```

http://localhost:3000 にアクセス

---

## 🧪 Google Colab設定

### 1. Colabノートブック作成
1. [Google Colab](https://colab.research.google.com/) にアクセス
2. 新規ノートブック作成

### 2. GPU有効化
- **ランタイム** → **ランタイムのタイプを変更** → **T4 GPU** を選択

### 3. Colabコード実行
プロジェクトの `Colab_VoiceMemo_Complete_Final.py` をコピペして実行

### 4. 設定値を更新
```python
MICROCMS_SERVICE_ID = "voicememo"
MICROCMS_API_KEY = "your-api-key"
NGROK_AUTH_TOKEN = "your-ngrok-token"
```

### 5. ngrok URLを取得
実行後に表示される公開URLをコピー:
```
✅ 公開URL: https://xxxx.ngrok.io
```

### 6. Next.js側の .env.local を更新
```bash
echo "COLAB_API_URL=https://xxxx.ngrok.io" >> .env.local
```

### 7. Next.js再起動
```bash
npm run dev
```

---

## 📁 ディレクトリ構成
```
voice-memo-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # ログインページ
│   │   └── signup/page.tsx         # 新規登録ページ
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth (Google OAuth)
│   │   ├── colab/route.ts          # Colab API連携
│   │   ├── memos/
│   │   │   ├── route.ts            # メモ一覧取得
│   │   │   └── [id]/route.ts       # メモ詳細・編集・削除
│   │   ├── settings/route.ts       # ユーザー設定（バックアップON/OFF）
│   │   └── gdrive/
│   │       └── upload/route.ts     # Google Driveアップロード
│   ├── dashboard/
│   │   ├── page.tsx                # メモ一覧・録音UI
│   │   ├── new/page.tsx            # テキスト入力ページ
│   │   └── [id]/page.tsx           # メモ詳細ページ
│   ├── layout.tsx                  # ルートレイアウト
│   ├── page.tsx                    # トップページ（LP）
│   └── globals.css                 # グローバルスタイル
├── components/
│   ├── AudioRecorder.tsx           # 録音コンポーネント
│   ├── MemoCard.tsx                # メモカード
│   └── MemoCard.module.css         # CSS Modules
├── lib/
│   ├── firebase.ts                 # Firebase設定
│   ├── microcms.ts                 # microCMS API
│   ├── googleDrive.ts              # Google Drive API
│   └── contexts/
│       └── AuthContext.tsx         # Firebase Auth Context
├── styles/
├── public/
├── .env.local                      # 環境変数（Gitignore）
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔄 データフロー
```
[ユーザー] → 音声録音/ファイルアップロード/テキスト入力
    ↓
[Next.js Dashboard]
    ↓ FormData(audio, user_id)
[Next.js API /api/colab]
    ↓ POST
[Google Colab Flask Server]
    ↓ Whisper文字起こし
    ↓ rinna要約・タグ生成
    ↓ sentence-transformers埋め込み
    ↓ POST
[microCMS API /memos]
    ↓
[Next.js Dashboard] ← メモ取得・表示
    ↓
[オプション] Google Drive API → 音声ファイルバックアップ
```

---

## 📊 microCMS スキーマ

### memos API

| フィールドID | 種類 | 必須 | 説明 |
|------------|------|------|------|
| user_id | テキスト | ✅ | Firebase UID |
| audio_url | テキスト | ✅ | 音声ファイルURL（Google Drive or pending://） |
| transcript | テキストエリア | ✅ | 文字起こし全文 |
| summary | テキストエリア | - | AI生成要約 |
| tags | 複数選択 | - | 自動生成タグ |
| embedding_vector | テキストエリア | - | ベクトル（JSON文字列） |
| processed_at | 日時 | - | 処理日時 |
| audio_filename | テキスト | - | 元のファイル名 |
| duration_seconds | 数値 | - | 音声時間（秒） |

### user-settings API

| フィールドID | 種類 | 必須 | 説明 |
|------------|------|------|------|
| user_id | テキスト | ✅ | Firebase UID |
| enable_gdrive_backup | 真偽値 | - | Google Driveバックアップ有効/無効 |

---

## 🎯 使い方

### 1. ログイン
- http://localhost:3000/login でログイン
- または新規登録: http://localhost:3000/signup

### 2. Google Drive連携（オプション）
- ダッシュボードで「Google Driveと連携」ボタンをクリック
- Google認証画面で許可
- チェックボックスでバックアップON/OFF

### 3. メモ作成
- **録音**: 「🔴 録音開始」→ 話す → 「⏹️ 停止」→ 「🚀 音声を処理」
- **ファイル**: 音声ファイルを選択 → 「🚀 音声を処理」
- **テキスト**: 「➕ テキスト入力」からテキストを入力

### 4. 処理完了
- Colab側で30秒〜2分処理
- 完了後、ダッシュボードに自動表示

### 5. メモ管理
- メモカードをクリック → 詳細表示
- 「✏️ 編集」で要約・文字起こしを編集
- 「🗑️ 削除」でメモを削除

---

## 🐛 トラブルシューティング

### Q1: Colabとの接続エラー
```bash
# .env.local のCOLAB_API_URLを確認
cat .env.local | grep COLAB_API_URL

# Colabのngrok URLが正しいか確認
# Colabセルを再実行して新しいURLを取得
```

### Q2: microCMS保存エラー
```bash
# embedding_vectorのデータ型エラー
# → Colab側で json.dumps(embedding.tolist()) を確認
```

### Q3: Google Drive認証エラー
```bash
# Google Cloud ConsoleでリダイレクトURI確認
# http://localhost:3000/api/auth/callback/google
```

### Q4: Firebase認証エラー
```bash
# Firebase Consoleで認証方法が有効化されているか確認
```

## ⚠️ セキュリティ注意事項

以下の情報は**絶対にGitHubに公開しないでください**：

### 公開NG
- ❌ microCMS APIキー
- ❌ Firebase API設定値（一部は公開OK、詳細は後述）
- ❌ ngrok 認証トークン
- ❌ Google OAuth クライアントシークレット
- ❌ NextAuth シークレットキー

### 公開OK
- ✅ Firebase プロジェクトID
- ✅ Firebase Auth Domain
- ✅ microCMS サービスID（voicememoなど）
- ✅ コード本体（APIキーを変数化したもの）

### 安全な管理方法

#### 1. .gitignore に追加済み
```gitignore
.env.local
.env*.local
```

#### 2. 環境変数テンプレート作成
```.env.example
# microCMS
MICROCMS_SERVICE_ID=your-service-id
MICROCMS_API_KEY=your-api-key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain

# (以下略)
```

#### 3. Colab実行時の注意
- コードに直接APIキーを書かない
- 実行時に手動で設定する
- または Google Colabの「シークレット」機能を使用

---

## 📝 今後の拡張予定

- [ ] 類似メモ検索（埋め込みベクトルを使用）
- [ ] タグフィルタ機能
- [ ] メモのエクスポート（Markdown/PDF）
- [ ] カレンダー連携（予定の自動抽出）
- [ ] 通知・リマインダー機能
- [ ] 音声再生機能（Google Drive URLから）
- [ ] ダークモード対応

---

## 🤝 コントリビューション

プルリクエスト歓迎です！

1. Fork
2. Feature branchを作成 (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Pull Request作成

---

## 📄 ライセンス

MIT License

---

## 🙏 謝辞

- [Kotoba Whisper](https://huggingface.co/kotoba-tech/kotoba-whisper-v2.2) - 高精度日本語文字起こし
- [rinna](https://huggingface.co/rinna/japanese-gpt2-small) - 日本語言語モデル
- [sentence-transformers](https://www.sbert.net/) - 埋め込みモデル
- [microCMS](https://microcms.io/) - Headless CMS
- [Firebase](https://firebase.google.com/) - 認証・データベース
- [Next.js](https://nextjs.org/) - Reactフレームワーク

---

## 📧 お問い合わせ

質問・バグ報告は [Issues](https://github.com/itc-s24022/voice-memo-ai/issues) へ

---

## 🔗 関連リンク

- **本番サイト**: https://voice-memo-ai-dusky.vercel.app/
- **GitHub**: https://github.com/itc-s24022/voice-memo-ai
- **開発者**: [@itc-s24022](https://github.com/itc-s24022)