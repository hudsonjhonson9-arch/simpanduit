#!/usr/bin/env python3
"""Ubah kolom tanggal (deadline/jadwal/jadwal_rekrutmen) di Google Sheets menjadi dd-mm-yyyy.

Jalankan sekali setelah pull update backend GAS ter-deploy.
Butuh admin login (sama seperti import script).
"""

import json
import time
import urllib.request
import urllib.parse
from datetime import datetime

GAS_URL = "https://script.google.com/macros/s/AKfycby629A7YABrZj-GHlPdHRANhDnohdkd8eBZDHclgxv6tbd6jbRgZ0Sxnd-E89bTwrC-xg/exec"

DATE_FIELDS = {
    "KarirHub": ["deadline"],
    "InfoPelatihan": ["jadwal"],
    "AKAD": ["jadwal_rekrutmen"],
}

def call(params):
    url = f"{GAS_URL}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read())

def fmt_date(v):
    s = str(v or "").strip()
    if not s or s == "-":
        return s
    try:
        d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        return d.strftime("%d-%m-%Y")
    except ValueError:
        return s

def main():
    token = call({"action": "login", "username": "admin", "password": "admin123"})["token"]
    total_updates = 0
    for module, fields in DATE_FIELDS.items():
        res = call({"action": "read", "module": module, "token": token})
        if not res.get("success"):
            print(f"{module}: gagal baca ({res.get('error')})")
            continue
        rows = res.get("data", [])
        print(f"{module}: {len(rows)} baris")
        for r in rows:
            changed = {f: fmt_date(r.get(f)) for f in fields}
            changed = {k: v for k, v in changed.items() if v != str(r.get(k) or "").strip() and v != ""}
            if not changed or not r.get("id"):
                continue
            upd = call({"action": "update", "module": module, "token": token, "id": r["id"], "data": json.dumps(changed, ensure_ascii=False)})
            if upd.get("success"):
                total_updates += 1
                print(f"  updated {r['id'][:8]}: {changed}")
            else:
                print(f"  FAIL {r['id'][:8]}: {upd.get('error')}")
            time.sleep(0.1)
    print(f"\nSelesai. {total_updates} baris diubah ke dd-mm-yyyy.")

if __name__ == "__main__":
    main()