#!/usr/bin/env python3
import json, time, sys
from datetime import datetime
try:
    from fast_flights import FlightQuery, Passengers, create_query, get_flights
except Exception as e:
    print(json.dumps({"error":"missing_fast_flights","detail":str(e)}), file=sys.stderr)
    raise

CURRENCY='TWD'
LANG='zh-TW'
ORIGIN='TPE'
OUT='2026-09-15'
RET='2026-09-20'
DESTS={
  'NRT':'東京 NRT', 'KIX':'大阪 KIX', 'ICN':'首爾 ICN', 'PUS':'釜山 PUS', 'HKG':'香港 HKG', 'BKK':'曼谷 BKK'
}
COMBOS=[('NRT','KIX','日本雙城'),('ICN','PUS','韓國雙城'),('BKK','HKG','東南亞+香港')]

def cheapest_oneway(frm,to,date):
    q=create_query(flights=[FlightQuery(date=date,from_airport=frm,to_airport=to,max_stops=1)], trip='one-way', seat='economy', passengers=Passengers(adults=1), language=LANG, currency=CURRENCY, max_stops=1)
    r=get_flights(q)
    if not r: return None
    f=min(r, key=lambda x: x.price)
    leg=f.flights[0] if f.flights else None
    return {"price": int(f.price), "airlines": f.airlines, "type": f.type, "from": frm, "to": to, "date": date, "departure": getattr(leg,'departure',None).date if leg else None}

def roundtrip(dest):
    a=cheapest_oneway(ORIGIN,dest,OUT); time.sleep(1.2)
    b=cheapest_oneway(dest,ORIGIN,RET); time.sleep(1.2)
    if not a or not b: return None
    return {"dest":dest,"label":DESTS[dest],"price":a['price']+b['price'],"legs":[a,b],"airlines":sorted(set(a['airlines']+b['airlines']))}

def confidence(ratio):
    if ratio<=1.08: return 'high'
    if ratio<=1.18: return 'medium'
    return 'watch'

def main():
    rts={}
    for d in DESTS:
        try:
            rts[d]=roundtrip(d)
            print('scanned',d,rts[d]['price'] if rts[d] else None, file=sys.stderr)
        except Exception as e:
            print('scan_error',d,repr(e),file=sys.stderr)
            rts[d]=None
    deals=[]
    for a,b,region in COMBOS:
        if not rts.get(a) or not rts.get(b): continue
        base=rts[a]
        combo_price=rts[a]['price']+rts[b]['price']
        ratio=combo_price/base['price'] if base['price'] else 99
        deals.append({
            "id": f"gflights-{a.lower()}-{b.lower()}-{OUT}",
            "region": region,
            "confidence": confidence(ratio),
            "origin": ORIGIN,
            "baseRoute": f"台北 {ORIGIN} ↔ {DESTS[a]}",
            "comboRoute": f"台北 {ORIGIN} ↔ {DESTS[a]} + 台北 {ORIGIN} ↔ {DESTS[b]}",
            "dates": f"{OUT} 出發 / {RET} 回程（one-way legs summed）",
            "basePrice": base['price'],
            "comboPrice": combo_price,
            "currency": CURRENCY,
            "airlines": sorted(set(rts[a]['airlines']+rts[b]['airlines']))[:6],
            "why": f"低頻 Google Flights scraper 估算：第二組來回讓總價變成 {ratio:.2f}x。這是 one-way legs 加總，需回 Google Flights 查證實際來回/多城市票價。",
            "risks": ["這是低頻 scraper 估算，不保證可出票", "one-way 加總可能不同於實際來回票價", "分開票行李與航變保護較弱"],
            "verifyUrl": "https://www.google.com/travel/flights"
        })
    out={
        "generatedAt": datetime.now().astimezone().isoformat(timespec='seconds'),
        "sourceStatus": "live-google-flights-scraper-low-frequency",
        "scannerNote": "使用 fast-flights 低頻查 Google Flights one-way 價格並加總估算；不是官方 API，僅作情報候選，購買前必須人工查證。",
        "scanScope": {"origins":[ORIGIN],"regions":["日本","韓國","香港/東南亞"],"threshold":"combo / base <= 1.18x","tripLengths":[5],"dates":[OUT,RET]},
        "roundtrips": rts,
        "deals": sorted(deals, key=lambda d:d['comboPrice']/d['basePrice'])
    }
    print(json.dumps(out,ensure_ascii=False,indent=2))
if __name__=='__main__': main()
