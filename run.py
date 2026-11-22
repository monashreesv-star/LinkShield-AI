import uvicorn
import webbrowser
import threading
import time

def open_browser():
    time.sleep(1.5)
    print("\n[+] Opening LinkedShield AI Dashboard in browser: http://127.0.0.1:8000 ...")
    webbrowser.open("http://127.0.0.1:8000")

if __name__ == "__main__":
    print("=" * 70)
    print("  LINKEDSHIELD AI — CYBER FRAUD & PHISHING INVESTIGATION PLATFORM")
    print("  Rajasthan Police Hackathon | Problem Statement PS01")
    print("=" * 70)
    print("\n[*] Starting FastAPI Server on http://127.0.0.1:8000 ...")
    
    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
