#!/usr/bin/env python3
"""Bulk import PencariKerja from JSON via GAS API."""
import json, urllib.request, sys, time

GAS_URL = 'https://script.google.com/macros/s/AKfycby629A7YABrZj-GHlPdHRANhDnohdkd8eBZDHclgxv6tbd6jbRgZ0Sxnd-E89bTwrC-xg/exec'
JSON_PATH = r'D:\Code\simpan-duit\scripts\pencarikerja_import.json'

# Login
login_body = json.dumps({'action': 'login', 'username': 'admin', 'password': 'admin123'}).encode()
req = urllib.request.Request(GAS_URL, data=login_body, headers={'Content-Type': 'text/plain'})
resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
token = resp.get('token', '')
if not token:
    print('Login failed:', resp)
    sys.exit(1)
print(f'Logged in, token: {token[:15]}...')

# Load records
with open(JSON_PATH) as f:
    records = json.load(f)
print(f'Loaded {len(records)} records')

ok = 0
fail = 0
t0 = time.time()
for i, rec in enumerate(records):
    body = json.dumps({'action': 'create', 'module': 'PencariKerja', 'data': rec, 'token': token}).encode()
    req = urllib.request.Request(GAS_URL, data=body, headers={'Content-Type': 'text/plain'})
    try:
        res = json.loads(urllib.request.urlopen(req, timeout=60).read())
        if res.get('success'):
            ok += 1
        else:
            fail += 1
            print(f'  [{i+1}] Fail: {rec["nama"]} - {res.get("error")}')
    except Exception as e:
        fail += 1
        print(f'  [{i+1}] Error: {rec["nama"]} - {e}')
    
    if (i + 1) % 10 == 0:
        elapsed = time.time() - t0
        print(f'  Progress: {i+1}/{len(records)} ({ok} ok, {fail} fail) [{elapsed:.0f}s]')

elapsed = time.time() - t0
print(f'\nDone: {ok} success, {fail} failed ({elapsed:.0f}s)')
