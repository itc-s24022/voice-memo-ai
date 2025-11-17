# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, time, threading
from pyngrok import ngrok
from datetime import datetime
import requests

MICROCMS_SERVICE_ID = "voicememo"
MICROCMS_API_KEY = "OvdfuEJhKSrRPH29FbNOeEX8MRpekVP3msvWy"
MICROCMS_ENDPOINT = f"https://{MICROCMS_SERVICE_ID}.microcms.io/api/v1/memos"

GDRIVE_FOLDER_PATH = "./content/drive/MyDrive/VoiceMemos"
os.makedirs(GDRIVE_FOLDER_PATH, exist_ok=True)

app = Flask(__name__)
CORS(app)

@app.route("/api/voice", methods=["POST"])
def upload_voice():
    if "audio" not in request.files:
        return jsonify({"success": False, "error": "audioファイルがありません"}), 400

    audio_file = request.files["audio"]
    filename = f"memo_{int(time.time())}.webm"
    file_path = os.path.join(GDRIVE_FOLDER_PATH, filename)
    audio_file.save(file_path)

    # ここで文字起こし・要約・タグ生成を行う
    # 仮にダミーとして filename を summary として返す
    summary = f"音声ファイル {filename} を処理しました"
    tags = ["#メモ", "#音声"]

    post_data = {
        "text_url": f"gdrive://{filename}",
        "original_text": summary,
        "summary": summary,
        "tags": tags,
        "processed_at": datetime.now().isoformat(),
        "text_filename": filename
    }
    headers = {"X-MICROCMS-API-KEY": MICROCMS_API_KEY, "Content-Type": "application/json"}
    r = requests.post(MICROCMS_ENDPOINT, headers=headers, json=post_data)

    return jsonify({"success": True, "status": r.status_code, "summary": summary, "tags": tags})

# ngrok 起動
NGROK_AUTH_TOKEN = "35K1rOHFsrWSUE1UpSRrmin8bh2_2c2TByzqeaEjMR2t8PaZZ"
ngrok.set_auth_token(NGROK_AUTH_TOKEN)
public_url = ngrok.connect(5000)
print(f"✅ 公開URL: {public_url}")

def run():
    app.run(port=5000, debug=False)

threading.Thread(target=run, daemon=True).start()
