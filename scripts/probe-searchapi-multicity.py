#!/usr/bin/env python3
"""Probe SearchApi Google Flights multi-city bundled fares.
Usage: SEARCHAPI_API_KEY=... python scripts/probe-searchapi-multicity.py
Consumes one SearchApi request per probe.
"""
import json, os, urllib.parse, urllib.request
KEY=os.environ.get('SEARCHAPI_API_KEY')
if not KEY: raise SystemExit('Set SEARCHAPI_API_KEY')
legs=[
 {"departure_id":"TPE","arrival_id":"NRT","outbound_date":"2026-09-15"},
 {"departure_id":"NRT","arrival_id":"TPE","outbound_date":"2026-09-20"},
 {"departure_id":"TPE","arrival_id":"KIX","outbound_date":"2026-10-15"},
 {"departure_id":"KIX","arrival_id":"TPE","outbound_date":"2026-10-20"},
]
params={"engine":"google_flights","api_key":KEY,"flight_type":"multi_city","multi_city_json":json.dumps(legs,separators=(',',':')),"currency":"TWD","hl":"zh-tw"}
url='https://www.searchapi.io/api/v1/search?'+urllib.parse.urlencode(params)
with urllib.request.urlopen(url,timeout=90) as r: data=json.loads(r.read().decode())
flights=(data.get('best_flights') or [])+(data.get('other_flights') or [])
print(json.dumps({
 'status': data.get('search_metadata',{}).get('status'),
 'request_time': data.get('search_metadata',{}).get('request_time_taken'),
 'count': len(flights),
 'cheapest': min((f.get('price') for f in flights if f.get('price')), default=None),
 'sample': flights[:2],
}, ensure_ascii=False, indent=2))
