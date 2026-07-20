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
ORIGINS={'TPE':'台北桃園 TPE','KHH':'高雄 KHH'}
OUT='2026-09-15'
RET='2026-09-20'
DESTS={
  'NRT':'東京 NRT', 'KIX':'大阪 KIX', 'FUK':'福岡 FUK', 'OKA':'沖繩 OKA',
  'ICN':'首爾 ICN', 'PUS':'釜山 PUS',
  'HKG':'香港 HKG', 'BKK':'曼谷 BKK', 'SIN':'新加坡 SIN', 'KUL':'吉隆坡 KUL', 'SGN':'胡志明 SGN', 'DAD':'峴港 DAD',
  'SYD':'雪梨 SYD', 'MEL':'墨爾本 MEL', 'BNE':'布里斯本 BNE', 'PER':'伯斯 PER'
}
COMBOS=[('NRT','KIX','日本雙城'),('FUK','OKA','日本短程'),('ICN','PUS','韓國雙城'),('BKK','HKG','東南亞+香港'),('SIN','KUL','星馬雙城'),('SGN','DAD','越南雙城'),('SYD','MEL','澳洲雙城'),('BNE','PER','澳洲長線')]
SCAN_DESTS=['NRT','KIX','FUK','OKA','ICN','PUS','HKG','BKK','SIN','KUL','SGN','DAD','SYD','MEL','BNE','PER']

def cheapest_oneway(frm,to,date):
    q=create_query(flights=[FlightQuery(date=date,from_airport=frm,to_airport=to,max_stops=1)], trip='one-way', seat='economy', passengers=Passengers(adults=1), language=LANG, currency=CURRENCY, max_stops=1)
    r=get_flights(q)
    if not r: return None
    f=min(r, key=lambda x: x.price)
    leg=f.flights[0] if f.flights else None
    return {"price": int(f.price), "airlines": f.airlines, "type": f.type, "from": frm, "to": to, "date": date, "departure": getattr(leg,'departure',None).date if leg else None}

def roundtrip(origin,dest):
    a=cheapest_oneway(origin,dest,OUT); time.sleep(1.0)
    b=cheapest_oneway(dest,origin,RET); time.sleep(1.0)
    if not a or not b: return None
    return {"origin":origin,"dest":dest,"label":DESTS[dest],"price":a['price']+b['price'],"legs":[a,b],"airlines":sorted(set(a['airlines']+b['airlines']))}

def confidence(ratio):
    if ratio<=1.08: return 'high'
    if ratio<=1.18: return 'medium'
    return 'watch'

def main():
    all_deals=[]
    all_roundtrips={}
    for origin in ORIGINS:
        rts={}
        for d in SCAN_DESTS:
            try:
                rts[d]=roundtrip(origin,d)
                print('scanned',origin,d,rts[d]['price'] if rts[d] else None, file=sys.stderr)
            except Exception as e:
                print('scan_error',origin,d,repr(e),file=sys.stderr)
                rts[d]=None
        all_roundtrips[origin]=rts
        for a,b,region in COMBOS:
            if not rts.get(a) or not rts.get(b): continue
            base=rts[a]
            combo_price=rts[a]['price']+rts[b]['price']
            ratio=combo_price/base['price'] if base['price'] else 99
            all_deals.append({
                "id": f"gflights-{origin.lower()}-{a.lower()}-{b.lower()}-{OUT}",
                "region": region,
                "confidence": confidence(ratio),
                "origin": origin,
                "baseRoute": f"{ORIGINS[origin]} ↔ {DESTS[a]}",
                "comboRoute": f"{ORIGINS[origin]} ↔ {DESTS[a]} + {ORIGINS[origin]} ↔ {DESTS[b]}",
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
        "sourceStatus": "live-google-flights-scraper-low-frequency-expanded",
        "scannerNote": "使用 fast-flights 低頻查 Google Flights one-way 價格並加總估算；不是官方 API，僅作情報候選，購買前必須人工查證。本輪加入高雄、東南亞與澳洲。",
        "scanScope": {"origins":list(ORIGINS.keys()),"regions":["日本","韓國","香港/東南亞","澳洲"],"threshold":"combo / base <= 1.25x preferred","tripLengths":[5],"dates":[OUT,RET],"destinations":SCAN_DESTS},
        "roundtrips": all_roundtrips,
        "deals": sorted(all_deals, key=lambda d:d['comboPrice']/d['basePrice'])
    }
    print(json.dumps(out,ensure_ascii=False,indent=2))
if __name__=='__main__': main()
