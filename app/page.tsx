'use client';
import { useMemo, useState } from 'react';

type Case = { baseRoute:string; comboRoute:string; basePrice:number; comboPrice:number; notes:string };
const samples: Case[] = [
  {baseRoute:'TPE ↔ NRT', comboRoute:'TPE ↔ NRT + TPE ↔ KIX', basePrice:18000, comboPrice:19500, notes:'兩組日本來回只比東京來回多 8%。'},
  {baseRoute:'TPE ↔ ICN', comboRoute:'TPE ↔ ICN + TPE ↔ PUS', basePrice:10500, comboPrice:11900, notes:'韓國雙城週中票，可能是促銷艙等。'},
  {baseRoute:'TPE ↔ BKK', comboRoute:'TPE ↔ BKK + TPE ↔ HKG', basePrice:15500, comboPrice:17100, notes:'東南亞 + 香港組合接近一張熱門來回。'},
];
function score(base:number, combo:number){ const ratio=combo/base; const premium=(ratio-1)*100; let level='普通'; let tone='ok'; let s=30; if(ratio<=1){level='反常便宜';tone='hot';s=96}else if(ratio<=1.08){level='高度異常';tone='hot';s=90}else if(ratio<=1.18){level='值得查證';tone='warn';s=74}else if(ratio<=1.35){level='有點接近';tone='watch';s=55}else{s=25;level='不特別';tone='calm'} return {ratio,premium,level,tone,s}; }
export default function Page(){
 const [baseRoute,setBaseRoute]=useState('TPE ↔ NRT'); const [comboRoute,setComboRoute]=useState('TPE ↔ NRT + TPE ↔ KIX'); const [basePrice,setBasePrice]=useState(18000); const [comboPrice,setComboPrice]=useState(19500); const [notes,setNotes]=useState('同樣出發地，兩組來回 / 四段組合只比一組來回貴一點。');
 const result=useMemo(()=>score(basePrice||1,comboPrice||0),[basePrice,comboPrice]);
 const diff=comboPrice-basePrice;
 function load(c:Case){setBaseRoute(c.baseRoute);setComboRoute(c.comboRoute);setBasePrice(c.basePrice);setComboPrice(c.comboPrice);setNotes(c.notes)}
 return <main><section className="hero"><div className="badge">Fare intelligence · 手動查價版</div><h1>四腳機票雷達</h1><p>不是訂票站，也不替你下單。這是一個給新手用的票價異常判讀工具：把「一組來回」和「四腳 / 兩組來回」價格放進來，看它是不是接近同價、值得人工查證。</p><div className="heroGrid"><div><b>{result.ratio.toFixed(2)}x</b><span>組合 / 基準倍率</span></div><div><b>{result.s}</b><span>異常分數</span></div><div><b>{result.level}</b><span>目前判讀</span></div></div></section>
 <section className="app"><div className="panel input"><div className="sectionHead"><span>Step 1</span><h2>輸入你查到的票價</h2></div><label>基準來回行程<input value={baseRoute} onChange={e=>setBaseRoute(e.target.value)}/></label><label>基準來回價格（TWD）<input type="number" value={basePrice} onChange={e=>setBasePrice(Number(e.target.value))}/></label><label>四腳 / 兩組來回組合<input value={comboRoute} onChange={e=>setComboRoute(e.target.value)}/></label><label>組合總價（TWD）<input type="number" value={comboPrice} onChange={e=>setComboPrice(Number(e.target.value))}/></label><label>備註<textarea value={notes} onChange={e=>setNotes(e.target.value)}/></label></div>
 <div className={`panel result ${result.tone}`}><div className="sectionHead"><span>Step 2</span><h2>判讀結果</h2></div><div className="score"><span>{result.s}</span><i style={{width:`${result.s}%`}}/></div><h3>{result.level}</h3><p className="big">組合票價是基準票價的 <b>{result.ratio.toFixed(2)} 倍</b>，多出 <b>{diff.toLocaleString()} 元</b>（{result.premium>=0?'+':''}{result.premium.toFixed(1)}%）。</p><div className="explain">{explain(result.ratio)}</div><a className="cta" href="https://www.google.com/travel/flights" target="_blank">去 Google Flights 人工查證</a></div></section>
 <section className="samples"><div className="sectionHead"><span>Templates</span><h2>新手直接套範例</h2></div>{samples.map(c=><button key={c.comboRoute} onClick={()=>load(c)}><b>{c.baseRoute}</b><span>{c.comboRoute}</span><small>{c.notes}</small></button>)}</section>
 <section className="risks"><Risk title="分開票風險" body="兩張票分開買時，前段延誤可能不會保護後段，轉機時間要自己保守估。"/><Risk title="行李與航變" body="行李可能不能直掛；航班取消或改時，航空公司不一定幫你接好另一張票。"/><Risk title="No-show 風險" body="不要任意跳過同一張票上的前段航班，後續航段可能被取消。"/><Risk title="價格會變動" body="這裡只做判讀，不保證票價。下單前請回官方或可信 OTA 重新查證。"/></section>
 <footer>Fare Anomaly Radar · Prototype by MS4 + Yui · 不提供訂票、不提供法律或旅遊保證。</footer></main>}
function explain(r:number){ if(r<=1)return '四腳組合比基準來回還便宜，這非常反常：請立刻確認日期、幣別、行李、是否同航司與是否可正常出票。'; if(r<=1.08)return '只貴 8% 以內，屬於高價值異常：可能是促銷艙、停留規則或熱門單一路線過貴。'; if(r<=1.18)return '接近同價，值得開 Google Flights 或航空公司官網再查一次。'; if(r<=1.35)return '有點接近，但不一定值得為了省錢承擔分開票麻煩。'; return '組合價已明顯拉開，除非你本來就需要兩趟旅行，否則情報價值較低。'}
function Risk({title,body}:{title:string;body:string}){return <article><b>{title}</b><p>{body}</p></article>}
