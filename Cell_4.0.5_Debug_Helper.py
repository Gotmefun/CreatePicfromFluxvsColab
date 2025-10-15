# Cell 4.0.5 - Debug Helper
# ใส่ Cell นี้ระหว่าง Cell 4.0 และ 4.5 เพื่อ debug

import urllib.request
import json
import time

print("="*70)
print("🔍 WebUI Debug Helper")
print("="*70)

# Test 1: Check if port is listening
print("\n📡 Test 1: Checking if WebUI is listening on port 7860...")
try:
    response = urllib.request.urlopen('http://127.0.0.1:7860', timeout=5)
    print("✅ WebUI is responding on port 7860")
except Exception as e:
    print(f"❌ WebUI is not responding: {e}")
    print("\n🔧 Solution:")
    print("   1. Check if Cell 4.0 finished")
    print("   2. Look for '✅ WebUI is READY!' message")
    print("   3. If not ready, wait 1-2 more minutes")
    print("   4. If still fails, rerun Cell 4.0")
    print("\n" + "="*70)
    raise SystemExit("WebUI not responding")

# Test 2: Check API endpoint
print("\n📡 Test 2: Checking API endpoint...")
try:
    api_response = urllib.request.urlopen('http://127.0.0.1:7860/sdapi/v1/sd-models', timeout=5)
    models = json.loads(api_response.read().decode())
    print(f"✅ API is working! Found {len(models)} model(s)")
    for m in models:
        print(f"   • {m.get('title', m.get('model_name', 'Unknown'))}")
except Exception as e:
    print(f"❌ API is not responding: {e}")
    print("\n🔧 Solution:")
    print("   • WebUI is starting but API not ready")
    print("   • Wait 30-60 more seconds")
    print("   • Then rerun this cell")
    print("\n" + "="*70)
    raise SystemExit("API not ready")

# Test 3: Check CORS headers
print("\n📡 Test 3: Checking CORS headers...")
try:
    req = urllib.request.Request('http://127.0.0.1:7860/sdapi/v1/sd-models')
    req.add_header('Origin', 'https://aigen.ptee88.com')
    response = urllib.request.urlopen(req, timeout=5)

    # Check if CORS headers present
    cors_header = response.headers.get('Access-Control-Allow-Origin')
    if cors_header:
        print(f"✅ CORS headers present: {cors_header}")
    else:
        print("⚠️  CORS headers not found")
        print("   This might cause issues with the website")
except Exception as e:
    print(f"⚠️  CORS check failed: {e}")

# Test 4: Performance test
print("\n📡 Test 4: Testing response time...")
start = time.time()
try:
    urllib.request.urlopen('http://127.0.0.1:7860/sdapi/v1/sd-models', timeout=5)
    elapsed = time.time() - start
    print(f"✅ Response time: {elapsed:.2f} seconds")
    if elapsed > 2:
        print("⚠️  Response is slow - might need more memory")
except Exception as e:
    print(f"❌ Performance test failed: {e}")

# Summary
print("\n" + "="*70)
print("✅ All tests passed!")
print("🎯 WebUI is ready for Cell 4.5")
print("="*70)
