# ============================================================
# 🧠 VoiceMemo AI - Colab版（公開用）
# ============================================================

# ---- 【重要】実行前に設定してください ----
MICROCMS_SERVICE_ID = "your-service-id"      # 例: "voicememo"
MICROCMS_API_KEY = "YOUR_MICROCMS_API_KEY"   # microCMS管理画面で取得
NGROK_AUTH_TOKEN = "YOUR_NGROK_AUTH_TOKEN"   # https://dashboard.ngrok.com/

# ---- パッケージインストール ----
print("📦 セットアップ中...")
!pip install -q flask flask-cors pyngrok transformers sentence-transformers torch soundfile librosa requests faster-whisper

# ---- インポート ----
import os, torch, time, json, requests, threading
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyngrok import ngrok
from faster_whisper import WhisperModel
from transformers import AutoTokenizer, AutoModelForCausalLM
from sentence_transformers import SentenceTransformer
import warnings
warnings.filterwarnings('ignore')

print(f"🔥 GPU利用可能: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"💻 デバイス: {torch.cuda.get_device_name(0)}")

# ---- モデル読み込み ----
print("\n🎙️ Kotoba Whisper (v2.2-faster, CPU版) 読み込み中...")
asr_model = WhisperModel("RoachLin/kotoba-whisper-v2.2-faster", device="cpu", compute_type="int8")

print("🧠 rinna GPT2-small 読み込み中...")
tokenizer = AutoTokenizer.from_pretrained("rinna/japanese-gpt2-small")
llm_model = AutoModelForCausalLM.from_pretrained("rinna/japanese-gpt2-small")

print("📥 埋め込みモデル読み込み中...")
embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

print("✅ 全モデル準備完了")

# ============================================================
# 処理関数
# ============================================================

def summarize_text(text):
    """要約生成"""
    prompt = f"以下の文を短く要約してください。\n{text}\n要約："
    inputs = tokenizer.encode(prompt, return_tensors="pt", max_length=512, truncation=True)
    
    with torch.no_grad():
        outputs = llm_model.generate(inputs, max_new_tokens=60, do_sample=True, temperature=0.7)
    
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    summary = result.split("要約：")[-1].strip()
    
    return summary if summary else text[:100]

def generate_tags(text):
    """タグ生成（簡易）"""
    tags = []
    if "会議" in text: tags.append("#会議")
    if "予定" in text or "明日" in text: tags.append("#予定")
    if "TODO" in text or "やること" in text: tags.append("#TODO")
    if "アイデア" in text: tags.append("#アイデア")
    if not tags: tags = ["#メモ"]
    return tags

def upload_to_microcms(user_id, audio_url, transcript, summary, tags, filename, embedding):
    """microCMS送信"""
    post_data = {
        "user_id": user_id,
        "audio_url": audio_url,
        "transcript": transcript,
        "summary": summary,
        "tags": tags,
        "processed_at": datetime.now().isoformat(),
        "audio_filename": filename,
        "duration_seconds": 0,
        "embedding_vector": json.dumps(embedding.tolist())
    }
    
    headers = {
        "X-MICROCMS-API-KEY": MICROCMS_API_KEY,
        "Content-Type": "application/json"
    }
    
    endpoint = f"https://{MICROCMS_SERVICE_ID}.microcms.io/api/v1/memos"
    print(f"📤 microCMS送信中... (User: {user_id})")
    
    try:
        res = requests.post(endpoint, headers=headers, json=post_data, timeout=30)
        
        print(f"📤 microCMS status: {res.status_code}")
        
        if res.status_code == 201:
            result_data = res.json()
            print(f"✅ microCMS保存成功: {result_data.get('id')}")
            return {"success": True, "content_id": result_data.get('id')}
        else:
            print(f"❌ microCMS保存エラー: {res.text}")
            return {"success": False, "error": f"Status {res.status_code}"}
    except Exception as e:
        print(f"❌ microCMS接続エラー: {e}")
        return {"success": False, "error": str(e)}

def process_audio_file(filepath, user_id):
    """音声ファイル処理"""
    filename = os.path.basename(filepath)
    print(f"🎧 音声処理開始: {filename} (User: {user_id})")
    
    try:
        print("🎤 文字起こし中...")
        segments, info = asr_model.transcribe(filepath, language="ja")
        transcript = " ".join([seg.text for seg in segments])
        
        print(f"📝 文字起こし: {transcript[:100]}...")
        
        return process_text_input(transcript, filename, user_id)
    
    except Exception as e:
        print(f"❌ 音声処理エラー: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}

def process_text_input(text, filename, user_id):
    """テキスト処理メイン関数"""
    try:
        print(f"💭 要約・タグ生成中... (User: {user_id})")
        
        summary = summarize_text(text)
        tags = generate_tags(text)
        
        print(f"✅ 要約: {summary[:50]}...")
        print(f"✅ タグ: {tags}")
        
        embedding = embedding_model.encode(summary)
        print(f"✅ 埋め込み生成完了")
        
        audio_url = f"pending://{filename}"
        
        upload_result = upload_to_microcms(
            user_id, audio_url, text, summary, tags, filename, embedding
        )
        
        return {
            "success": upload_result.get("success", False),
            "content_id": upload_result.get("content_id"),
            "transcript": text,
            "summary": summary,
            "tags": tags
        }
        
    except Exception as e:
        print(f"❌ 処理エラー: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}

# ============================================================
# Flask API
# ============================================================

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models_loaded": True})

@app.route("/process", methods=["POST", "OPTIONS"])
def process():
    if request.method == "OPTIONS":
        return '', 204
    
    try:
        # 音声ファイルの場合
        if "audio" in request.files:
            audio_file = request.files["audio"]
            user_id = request.form.get("user_id")
            
            if not user_id:
                return jsonify({"success": False, "error": "user_idが必要です"}), 400
            
            filename = audio_file.filename
            filepath = f"/tmp/{filename}"
            audio_file.save(filepath)
            
            print(f"\n{'='*60}")
            print(f"📁 音声ファイル受信: {filename}")
            print(f"👤 User: {user_id}")
            print('='*60)
            
            result = process_audio_file(filepath, user_id)
            
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify(result), 200 if result.get("success") else 500
        
        # テキストの場合
        data = request.get_json()
        
        if not data or "user_id" not in data or "text" not in data:
            return jsonify({"success": False, "error": "user_idとtextが必要です"}), 400
        
        user_id = data["user_id"]
        text = data["text"]
        filename = f"memo_{int(time.time())}.txt"
        
        print(f"\n{'='*60}")
        print(f"📁 テキスト受信 (User: {user_id})")
        print('='*60)
        
        result = process_text_input(text, filename, user_id)
        
        return jsonify(result), 200 if result.get("success") else 500
    
    except Exception as e:
        print(f"❌ API エラー: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================
# ngrok 公開
# ============================================================

print("\n" + "="*60)
print("🌐 ngrokで公開中...")
print("="*60)

ngrok.set_auth_token(NGROK_AUTH_TOKEN)

try:
    ngrok.kill()
except:
    pass

tunnel = ngrok.connect(5050)
public_url = str(tunnel.public_url)

print(f"\n✅ 公開URL: {public_url}")
print(f"\nNext.jsの .env.local に追加:")
print(f"COLAB_API_URL={public_url}")
print("\n" + "="*60)

def run_server():
    app.run(host='0.0.0.0', port=5050, debug=False, use_reloader=False)

server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()

print("\n🎉 APIサーバー起動完了！")
print(f"\nエンドポイント: {public_url}/process")
print("⚠️  このセルは実行したまま保持してください")

try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    print("\n🛑 サーバー停止")
