import seed from '../data/deals.json';

type Deal = typeof seed.deals[number];
function money(n:number,c='TWD'){return new Intl.NumberFormat('zh-TW',{style:'currency',currency:c,maximumFractionDigits:0}).format(n)}
function ratio(d:Deal){return d.comboPrice/d.basePrice}
function score(d:Deal){const r=ratio(d); if(r<=1.08)return 92; if(r<=1.15)return 82; if(r<=1.18)return 70; return 55}
function badge(c:string){return c==='high'?'高信心':c==='medium'?'待查證':'觀察中'}
export default function Page(){const deals=[...seed.deals].sort((a,b)=>score(b)-score(a));return <main>
 <section className="hero"><div className="kicker">Fare Anomaly Radar · 四腳機票情報</div><h1>快速看到<br/>哪些機票值得買</h1><p>低頻掃描台灣出發的候選航線，找出「四腳 / 兩組來回」接近一組來回價的異常票價。目前使用本地低頻 Google Flights scraper 產生候選；不是官方 API，購買前必須人工查證。</p><div className="stats"><div><b>{deals.length}</b><span>本輪候選</span></div><div><b>{seed.scanScope.threshold}</b><span>異常門檻</span></div><div><b>{seed.scanScope.origins.join(' / ')}</b><span>出發地</span></div></div></section>
 <section className="notice"><b>資料狀態：</b>{seed.scannerNote}</section>
 <section className="toolbar"><a href="https://www.google.com/travel/flights" target="_blank">打開 Google Flights 查證</a><span>掃描區域：{seed.scanScope.regions.join('、')}</span></section>
 {deals.length===0?<section className="notice"><b>本輪沒有命中四角異常。</b> Scanner 已正常執行，但沒有找到 combo/base 接近門檻的候選；請擴大日期或目的地池。</section>:null}<section className="deals">{deals.map(d=><article className={`deal ${d.confidence}`} key={d.id}><div className="dealTop"><span className="region">{d.region}</span><span className="conf">{badge(d.confidence)}</span></div><h2>{d.comboRoute}</h2><p className="base">基準：{d.baseRoute}</p><div className="priceGrid"><div><span>基準來回</span><b>{money(d.basePrice,d.currency)}</b></div><div><span>四腳組合</span><b>{money(d.comboPrice,d.currency)}</b></div><div><span>只多</span><b>{money(d.comboPrice-d.basePrice,d.currency)}</b></div><div><span>倍率</span><b>{ratio(d).toFixed(2)}x</b></div></div><div className="meter"><i style={{width:`${score(d)}%`}}/><em>{score(d)} 異常分</em></div><p className="why">{d.why}</p><div className="meta"><span>{d.origin}</span><span>{d.dates}</span><span>{d.airlines.join(' / ')}</span></div><details><summary>購買前風險檢查</summary><ul>{d.risks.map(r=><li key={r}>{r}</li>)}</ul></details><a className="cta" href={d.verifyUrl} target="_blank">查證這張票</a></article>)}</section>
 <section className="how"><div><span>How it works</span><h2>它會怎麼幫你找票？</h2></div><ol><li>掃描 TPE / TSA / KHH 出發的熱門目的地。</li><li>比較「單一來回」與「兩組來回 / 四腳組合」。</li><li>若組合價接近單一來回，就產生情報卡。</li><li>你只看高信心卡，回 Google Flights 或航司官網查證。</li></ol></section>
 <footer>不出票、不保證價格；這是便宜機票情報雷達。接入合法航班 API 後才會顯示 live deal。</footer>
 </main>}
