import seed from '../data/deals.json';

type Deal = typeof seed.deals[number];
function money(n:number,c='TWD'){return new Intl.NumberFormat('zh-TW',{style:'currency',currency:c,maximumFractionDigits:0}).format(n)}
function separateTotal(d:Deal){return (d as any).separateTotalPrice ?? d.comboPrice}
function bundled(d:Deal){return (d as any).bundledPrice ?? null}
function ratio(d:Deal){const b=bundled(d); return b? b/separateTotal(d) : d.comboPrice/d.basePrice}
function score(d:Deal){const r=ratio(d); if(r<=1.08)return 92; if(r<=1.15)return 82; if(r<=1.25)return 68; if(r<=1.6)return 45; return 25}
function badge(c:string){return c==='high'?'接近同價':c==='medium'?'值得查證':c==='watch'?'偏貴觀察':'不便宜'}
function verdict(d:Deal){const b=bundled(d); if(!b)return '待查證：已算出分開買總價，還缺一起買價格'; const r=ratio(d); if(r<=.75)return '強烈異常：一起買省很多'; if(r<=.9)return '值得買：一起買明顯便宜'; if(r<=1.03)return '接近同價：可查證'; return '一起買沒有優勢'}
export default function Page(){const deals=[...seed.deals].sort((a,b)=>score(b)-score(a));return <main>
 <section className="hero"><div className="kicker">Fare Anomaly Radar · 四腳機票情報</div><h1>快速看到<br/>哪些機票值得買</h1><p>低頻掃描台灣出發的候選航線，找出兩組航程「分開買」多少錢，和「一起買 / 多城市買」多少錢，差距是否異常。目前使用本地低頻 Google Flights scraper 產生候選；不是官方 API，購買前必須人工查證。</p><div className="stats"><div><b>{deals.length}</b><span>本輪候選</span></div><div><b>{seed.scanScope.threshold}</b><span>異常門檻</span></div><div><b>{seed.scanScope.origins.join(' / ')}</b><span>出發地</span></div><div><b>{seed.scanScope.regions.join(' / ')}</b><span>區域</span></div></div></section>
 <section className="notice"><b>怎麼看：</b>每張卡的正確基準是：① 單獨買兩組來回的總價；② 一起買 / 多城市購買的總價。若 ② 明顯低於 ①，才是真正便宜。目前 scanner 已能算 ①；② 需要 Google Flights 多城市查價，尚在接入中。<br/><b>資料狀態：</b>{seed.scannerNote}</section>
 <section className="toolbar"><a href="https://www.google.com/travel/flights" target="_blank">打開 Google Flights 查證</a><span>已加入：高雄 KHH、東南亞、澳洲；目前顯示所有候選；真正便宜要看「一起買」是否低於「分開買」。</span></section>
 {deals.length===0?<section className="notice"><b>本輪沒有命中四角異常。</b> Scanner 已正常執行，但沒有找到 combo/base 接近門檻的候選；請擴大日期或目的地池。</section>:null}<section className="deals">{deals.map(d=><article className={`deal ${d.confidence}`} key={d.id}><div className="dealTop"><span className="region">{d.region}</span><span className="conf">{badge(d.confidence)}</span></div><h2>{d.comboRoute}</h2><p className="base">比較基準：單獨買 <b>{d.baseRoute}</b> 加上第二趟，各自出票總共多少；再和一起買 / 多城市價比較。</p><div className="verdict">{verdict(d)}</div><div className="priceGrid"><div><span>① 第一組來回</span><b>{money(d.basePrice,d.currency)}</b></div><div><span>② 分開買兩組總價</span><b>{money(separateTotal(d),d.currency)}</b></div><div><span>③ 一起買 / 多城市</span><b>{bundled(d)?money(bundled(d),d.currency):'待查'}</b></div><div><span>③ / ② 省錢倍率</span><b>{bundled(d)?ratio(d).toFixed(2)+'x':'待查'}</b></div></div><div className="meter"><i style={{width:`${score(d)}%`}}/><em>{score(d)} 異常分</em></div><p className="why">{d.why}</p><div className="meta"><span>{d.origin}</span><span>{d.dates}</span><span>{d.airlines.join(' / ')}</span></div><details><summary>購買前風險檢查</summary><ul>{d.risks.map(r=><li key={r}>{r}</li>)}</ul></details><a className="cta" href={d.verifyUrl} target="_blank">查證這張票</a></article>)}</section>
 <section className="how"><div><span>How it works</span><h2>它會怎麼幫你找票？</h2></div><ol><li>掃描 TPE / TSA / KHH 出發的熱門目的地。</li><li>先查第一組與第二組來回各自多少錢。</li><li>加總成「分開買總價」。</li><li>再查同日期的多城市 / 一起買價格。</li><li>比較一起買 / 分開買；低於 0.90x 才算真正便宜。</li><li>只把候選拿來提示，最後仍回 Google Flights 或航司官網查證。</li></ol></section>
 <footer>不出票、不保證價格；這是便宜機票情報雷達。接入合法航班 API 後才會顯示 live deal。</footer>
 </main>}
