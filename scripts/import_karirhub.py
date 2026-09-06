#!/usr/bin/env python3
"""Bulk import KarirHub data from karirhub_import.json into Google Sheets via GAS API."""

import json
import time
import urllib.request
import urllib.parse
import sys
import os

GAS_URL = "https://script.google.com/macros/s/AKfycby629A7YABrZj-GHlPdHRANhDnohdkd8eBZDHclgxv6tbd6jbRgZ0Sxnd-E89bTwrC-xg/exec"
JSON_PATH = os.path.join(os.path.dirname(__file__), "karirhub_import.json")

def login(username="admin", password="admin123"):
    params = urllib.parse.urlencode({
        "action": "login",
        "username": username,
        "password": password
    })
    url = f"{GAS_URL}?{params}"
    with urllib.request.urlopen(url) as resp:
        data = json.loads(resp.read())
    if data.get("success"):
        print(f"Login OK. Token: {data['token'][:20]}...")
        return data["token"]
    else:
        raise Exception(f"Login failed: {data}")

def create_record(token, record):
    params = urllib.parse.urlencode({
        "action": "create",
        "module": "KarirHub",
        "token": token,
        "data": json.dumps(record, ensure_ascii=False)
    })
    url = f"{GAS_URL}?{params}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read())

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        jobs = json.load(f)

    print(f"Loaded {len(jobs)} records from {JSON_PATH}")

    token = login()

    success = 0
    failed = 0
    for i, job in enumerate(jobs):
        # Remove id and created_at — GAS will generate them
        payload = {k: v for k, v in job.items() if k not in ("id", "created_at")}
        try:
            res = create_record(token, payload)
            if res.get("success"):
                success += 1
                print(f"  [{i+1}/{len(jobs)}] OK: {job['perusahaan']} - {job['judul_lowongan']}")
            else:
                failed += 1
                print(f"  [{i+1}/{len(jobs)}] FAIL: {res.get('error', 'unknown')}")
        except Exception as e:
            failed += 1
            print(f"  [{i+1}/{len(jobs)}] ERROR: {e}")
        time.sleep(0.3)  # rate limit

    print(f"\nDone. Success: {success}, Failed: {failed}")

if __name__ == "__main__":
    main()
