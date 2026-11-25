(function(){'use strict';
var $=function(i){return document.getElementById(i)},DAY=864e5,nf=new Intl.NumberFormat('en-US');
var DAYS={},TODAY='',N=30,CODE='',STILL=false,ALLROWS=false,SHOW={vis:true,vw:true},TICK=null;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var PAL=['#f2b705','#c8102e','#5b86ff','#34d3a5','#a78bfa','#f97316','#64748b'];
var SN={facebook:'فيسبوك',instagram:'إنستغرام',whatsapp:'واتساب',tiktok:'تيك توك',youtube:'يوتيوب',twitter:'X / تويتر',telegram:'تيليغرام',snapchat:'سناب شات',linkedin:'لينكدإن',pinterest:'بنترست',messenger:'ماسنجر',google:'قوقل',bing:'بينغ',yahoo:'ياهو',duckduckgo:'DuckDuckGo',yandex:'ياندكس',reddit:'ريديت',threads:'Threads',direct:'مباشر'};
var DV={mobile:'هاتف',desktop:'حاسوب',tablet:'لوحي'},LG={ar:'العربية',fr:'Français',en:'English',xx:'غير معروف'};
var WD=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],WORDER=[6,0,1,2,3,4,5];
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lab(m,k){if(m==='src'){return SN[k]||(k.indexOf('site:')===0?k.slice(5):k)}if(m==='dev')return DV[k]||k;if(m==='lang')return LG[k]||k.toUpperCase();return k}
var TZC={'Africa/Algiers':'الجزائر','Europe/Paris':'فرنسا','Europe/Brussels':'بلجيكا','Europe/Berlin':'ألمانيا','Europe/Madrid':'إسبانيا','Europe/Rome':'إيطاليا','Europe/London':'بريطانيا','Europe/Zurich':'سويسرا','Europe/Amsterdam':'هولندا','Europe/Istanbul':'تركيا','Africa/Tunis':'تونس','Africa/Casablanca':'المغرب','Africa/Tripoli':'ليبيا','Africa/Cairo':'مصر','Asia/Riyadh':'السعودية','Asia/Dubai':'الإمارات','Asia/Qatar':'قطر','Asia/Kuwait':'الكويت','Asia/Beirut':'لبنان','Asia/Amman':'الأردن','Asia/Baghdad':'العراق','Asia/Damascus':'سوريا','Asia/Muscat':'عُمان','Asia/Bahrain':'البحرين','Africa/Nouakchott':'موريتانيا','Africa/Khartoum':'السودان','America/Toronto':'كندا','America/Montreal':'كندا','America/Vancouver':'كندا','America/New_York':'أمريكا','America/Chicago':'أمريكا','America/Los_Angeles':'أمريكا','America/Denver':'أمريكا'};
function tzc(k){return TZC[k]||k}
function sd(k){var p=k.split('|');return lab('src',p[0])+' · '+lab('dev',p[1]||'')}
/* ───── thème ───── */
try{var th=localStorage.getItem('cei_st_theme');if(th)document.documentElement.dataset.theme=th}catch(e){}
$('thm').addEventListener('click',function(){var t=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=t;try{localStorage.setItem('cei_st_theme',t)}catch(e){}draw(false)});
/* ───── données ───── */
function load(code){return fetch('/stats/data.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'code='+encodeURIComponent(code)}).then(function(r){if(!r.ok)throw 0;return r.json()})}
function apply(j){DAYS=j.days||{};TODAY=j.today||new Date().toISOString().slice(0,10);var d=new Date();$('upd').textContent='آخر تحديث '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function unlock(code){load(code).then(function(j){CODE=code;try{sessionStorage.setItem('cei_st',code)}catch(e){}apply(j);$('gate').hidden=true;$('app').hidden=false;draw(true);
 clearInterval(TICK);TICK=setInterval(function(){if(!document.hidden)refresh(true)},60000)}).catch(function(){$('err').textContent='الكود غير صحيح أو الخدمة غير متاحة'})}
function refresh(quiet){var b=$('ref');b.classList.add('spin');load(CODE).then(function(j){apply(j);draw(false)}).catch(function(){}).then(function(){setTimeout(function(){b.classList.remove('spin')},500)})}
$('ref').addEventListener('click',function(){refresh()});
$('go').addEventListener('click',function(){unlock($('code').value)});$('code').addEventListener('keydown',function(e){if(e.key==='Enter')unlock(this.value)});
$('tabs').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;N=+b.dataset.n;ALLROWS=false;[].forEach.call(this.children,function(x){x.classList.toggle('on',x===b)});draw(true)});
/* ───── calculs ───── */
function dkey(t){return new Date(t).toISOString().slice(0,10)}
function t0(){return Date.parse(TODAY+'T00:00:00Z')}
function span(){if(N>0)return N;var ks=Object.keys(DAYS).sort();return ks.length?Math.max(1,Math.round((t0()-Date.parse(ks[0]+'T00:00:00Z'))/DAY)+1):1}
function rng(n,off){var end=t0()-off*DAY,a=[];for(var i=n-1;i>=0;i--){var k=dkey(end-i*DAY);a.push({k:k,v:DAYS[k]||{}})}return a}
function sum(rows){var s={vis:0,vw:0,dur:0,durn:0,nw:0,rt:0};rows.forEach(function(r){var v=r.v;s.vis+=v.visits||0;s.vw+=v.views||0;s.dur+=v.dur||0;s.durn+=v.durn||0;s.nw+=(v.new||{}).n||0;s.rt+=(v.ret||{}).n||0});return s}
function agg(rows,m){var o={};rows.forEach(function(r){var x=r.v[m]||{};for(var k in x)o[k]=(o[k]||0)+x[k]});return o}
function top(o,n){return Object.keys(o).sort(function(a,b){return o[b]-o[a]}).slice(0,n||99)}
function pct(a,b){return b>0?(a-b)/b*100:null}
function dur(s){s=Math.round(s);return s>=60?Math.floor(s/60)+'د '+(s%60)+'ث':s+'ث'}
function f1(x){return (Math.round(x*10)/10).toFixed(1)}
function count(el,to,fn){fn=fn||function(x){return nf.format(Math.round(x))};if(RM||STILL||!to){el.textContent=fn(to);return}var s=performance.now();(function st(t){var p=Math.min(1,(t-s)/950),e=1-Math.pow(1-p,3);el.textContent=fn(to*e);if(p<1)requestAnimationFrame(st)})(s)}
function dl(p,cls){if(p===null||p===undefined||!isFinite(p))return'';var r=Math.round(p);return'<span class="dl '+(r>0?'up':r<0?'dn':'eq')+'">'+(r>0?'▲ ':r<0?'▼ ':'● ')+Math.abs(r)+'% '+'</span>'}
function spark(a){var n=a.length;if(n<2)return'';var mx=Math.max.apply(null,a),mn=Math.min.apply(null,a),r=(mx-mn)||1,d=a.map(function(v,i){return(i?'L':'M')+(i*76/(n-1)).toFixed(1)+' '+(26-(v-mn)/r*24).toFixed(1)}).join(' ');return'<svg class="spk" viewBox="0 0 76 28" aria-hidden="true"><path d="'+d+'"/></svg>'}
/* ───── rendu principal ───── */
function draw(anim){
 STILL=!anim;$('app').classList.toggle('still',STILL);
 try{
  var n=span(),rows=rng(n,0),cur=sum(rows),prevRows=N>0?rng(n,n):null,prev=prevRows?sum(prevRows):null,yest=DAYS[dkey(t0()-DAY)]||{},tod=DAYS[TODAY]||{};
  var best={k:'—',n:-1};rows.forEach(function(r){if((r.v.visits||0)>best.n)best={k:r.k,n:r.v.visits||0}});
  /* hero */
  var lbl={1:'اليوم',7:'آخر 7 أيام',30:'آخر 30 يومًا',90:'آخر 90 يومًا',365:'آخر سنة',0:'منذ البداية'}[N];
  $('rng').textContent=lbl+(n>1?' · '+rows[0].k+' ← '+rows[rows.length-1].k:' · '+TODAY);
  count($('bigN'),cur.vis);
  var bd=$('bigD'),pc=prev?pct(cur.vis,prev.vis):null;
  if(pc===null||!isFinite(pc)){bd.hidden=true}else{bd.hidden=false;var r=Math.round(pc);bd.className='chip '+(r>0?'up':r<0?'dn':'eq');bd.textContent=(r>0?'▲ +':r<0?'▼ ':'● ')+r+'% عن الفترة السابقة'}
  count($('mToday'),tod.visits||0);count($('mYest'),yest.visits||0);$('mBest').textContent=best.n>0?best.k.slice(5):'—';
  /* KPI */
  var pv=function(r){return r.v.visits||0},pw=function(r){return r.v.views||0};
  var ppv=function(r){return r.v.visits?(r.v.views||0)/r.v.visits:0},pd=function(r){return r.v.durn?r.v.dur/r.v.durn:0},pn=function(r){var a=(r.v.new||{}).n||0,b=(r.v.ret||{}).n||0;return a+b?a/(a+b)*100:0};
  var tot=cur.nw+cur.rt,K=[
   {l:'الزيارات',v:cur.vis,d:pc,f:'i',sp:rows.map(pv)},
   {l:'مشاهدات الصفحات',v:cur.vw,d:prev?pct(cur.vw,prev.vw):null,f:'i',sp:rows.map(pw)},
   {l:'متوسط مدة البقاء',v:cur.durn?cur.dur/cur.durn:0,d:prev&&prev.durn&&cur.durn?pct(cur.dur/cur.durn,prev.dur/prev.durn):null,f:'s',sp:rows.map(pd)},
   {l:'زوار عائدون',v:tot?cur.rt/tot*100:0,f:'p',na:!tot,sp:rows.map(function(r){return pn(r)?100-pn(r):0})}];
  $('kpi').innerHTML=K.map(function(k,i){return'<div class="kpi rise" style="--i:'+(i+1)+'"><small>'+k.l+'</small><b data-v="'+(k.na?'':k.v)+'" data-f="'+k.f+'">'+(k.na?'—':'0')+'</b>'+(k.sub?'<span class="dl eq">'+k.sub+'</span>':dl(k.d))+(k.sp?spark(k.sp.slice(-30)):'')+'</div>'}).join('');
  [].forEach.call($('kpi').querySelectorAll('b'),function(b){if(b.dataset.v==='')return;var v=+b.dataset.v,f={i:0,d:function(x){return f1(x)},p:function(x){return Math.round(x)+'%'},s:dur}[b.dataset.f];count(b,v,f||undefined)});
  chart(rows);insights(rows,cur,prev,best);
  /* donuts + barres */
  donut('dSrc',agg(rows,'src'),function(k){return lab('src',k)});donut('dDev',agg(rows,'dev'),function(k){return lab('dev',k)});
  bars('tSrc',agg(rows,'src'),8,function(k){return lab('src',k)});
  bars('tOs',agg(rows,'os'),6);bars('tPg',agg(rows,'pg'),10);bars('tRef',agg(rows,'ref'),10);bars('tTz',agg(rows,'tz'),10,tzc);
  heat(rows);table(rows);
 }catch(e){console.error('draw',e)}
}
/* ───── barres ───── */
function bars(id,o,lim,lf,order){var el=$(id);if(!el)return;var ks=order||top(o,lim),t=0,k;for(k in o)t+=o[k];ks=ks.filter(function(k){return o[k]!==undefined||order});
 if(!ks.length||!t){el.innerHTML='<div class="empty">لا بيانات بعد</div>';return}
 var mx=Math.max.apply(null,ks.map(function(k){return o[k]||0}))||1;
 el.innerHTML=ks.map(function(k,i){var v=o[k]||0;return'<div class="row"><span class="rk">'+(i+1)+'</span><span class="nm" title="'+esc(k)+'">'+esc(lf?lf(k):lab('',k))+'</span><div class="bar"><i style="--w:'+(v/mx*100).toFixed(1)+'%;animation-delay:'+(i*60)+'ms"></i></div><span><b>'+nf.format(v)+'</b><small>'+Math.round(v/t*100)+'%</small></span></div>'}).join('')}
/* ───── donut ───── */
function donut(id,o,lf){var el=$(id);if(!el)return;var ks=top(o),t=0,k;for(k in o)t+=o[k];if(!t){el.innerHTML='<div class="empty" style="width:100%">لا بيانات بعد</div>';return}
 var it=ks.slice(0,5).map(function(k){return{n:lf(k),v:o[k]}}),rest=ks.slice(5).reduce(function(a,k){return a+o[k]},0);if(rest)it.push({n:'أخرى',v:rest});
 var R=52,C=2*Math.PI*R,acc=0,s='<svg viewBox="0 0 140 140" role="img"><circle cx="70" cy="70" r="'+R+'" fill="none" stroke="currentColor" stroke-opacity=".08" stroke-width="16"/>';
 it.forEach(function(x,i){var len=Math.max(0,x.v/t*C-2);s+='<circle class="seg" cx="70" cy="70" r="'+R+'" fill="none" stroke="'+PAL[i%PAL.length]+'" stroke-width="16" stroke-dasharray="'+len.toFixed(2)+' '+(C-len).toFixed(2)+'" stroke-dashoffset="'+(-acc).toFixed(2)+'" transform="rotate(-90 70 70)" style="--c:'+C.toFixed(2)+';animation-delay:'+(i*120)+'ms"/>';acc+=x.v/t*C});
 s+='<text class="dc" x="70" y="72">'+nf.format(t)+'</text><text class="dc2" x="70" y="86">زيارة</text></svg><div class="dlg">'+it.map(function(x,i){return'<div><i style="background:'+PAL[i%PAL.length]+'"></i><span>'+esc(x.n)+'</span><b>'+nf.format(x.v)+'</b><small>'+Math.round(x.v/t*100)+'%</small></div>'}).join('')+'</div>';el.innerHTML=s}
/* ───── courbe lissée interactive ───── */
function smooth(p,lo,hi){var d='M'+p[0][0].toFixed(1)+' '+p[0][1].toFixed(1),cl=function(y){return Math.max(lo,Math.min(hi,y))};
 for(var i=0;i<p.length-1;i++){var a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c,t=.16;d+='C'+(b[0]+(c[0]-a[0])*t).toFixed(1)+' '+cl(b[1]+(c[1]-a[1])*t).toFixed(1)+' '+(c[0]-(e[0]-b[0])*t).toFixed(1)+' '+cl(c[1]-(e[1]-b[1])*t).toFixed(1)+' '+c[0].toFixed(1)+' '+c[1].toFixed(1)}return d}
function chart(rows){var svg=$('chart'),tip=$('tip'),n=rows.length,pts=rows.map(function(r){return{k:r.k,vis:r.v.visits||0,vw:r.v.views||0}});
 var W=700,H=300,L=42,R=14,T=14,B=30,keys=[['vw','مشاهدات','#5b86ff'],['vis','زيارات','#f2b705']].filter(function(x){return SHOW[x[0]==='vw'?'vw':'vis']});
 var mx=Math.max(5,Math.max.apply(null,pts.map(function(p){return Math.max(SHOW.vw?p.vw:0,SHOW.vis?p.vis:0)})));mx=Math.ceil(mx/4)*4||4;
 var x=function(i){return n>1?L+i*(W-L-R)/(n-1):(L+W-R)/2},y=function(v){return T+(H-T-B)*(1-v/mx)},base=y(0),s='<defs><linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2b705" stop-opacity=".38"/><stop offset="1" stop-color="#f2b705" stop-opacity="0"/></linearGradient><linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b86ff" stop-opacity=".3"/><stop offset="1" stop-color="#5b86ff" stop-opacity="0"/></linearGradient></defs>';
 for(var g=0;g<=4;g++){var gv=Math.round(mx*g/4),gy=y(gv);s+='<line class="grid" x1="'+L+'" x2="'+(W-R)+'" y1="'+gy+'" y2="'+gy+'" stroke-dasharray="3 5"/><text class="axis" x="'+(L-8)+'" y="'+(gy+4)+'" text-anchor="end">'+gv+'</text>'}
 var step=Math.ceil(n/7);pts.forEach(function(p,i){if(i%step===0||i===n-1)s+='<text class="axis" x="'+x(i)+'" y="'+(H-9)+'" text-anchor="middle">'+p.k.slice(n>200?2:5)+'</text>'});
 keys.forEach(function(kk){var pp=pts.map(function(p,i){return[x(i),y(p[kk[0]])]});if(n<2){s+='<circle cx="'+pp[0][0]+'" cy="'+pp[0][1]+'" r="5" fill="'+kk[2]+'"/>';return}
  var d=n>90?pp.map(function(q,i){return(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)}).join(' '):smooth(pp,T,base);
  s+='<path class="ar" d="'+d+' L'+x(n-1).toFixed(1)+' '+base+' L'+x(0).toFixed(1)+' '+base+'Z" fill="url(#'+(kk[0]==='vis'?'gv':'gw')+')"/><path class="ln" pathLength="1000" style="--L:1000" d="'+d+'" stroke="'+kk[2]+'"/>'});
 s+='<line id="cl" y1="'+T+'" y2="'+base+'" stroke="#f2b705" stroke-opacity=".6" stroke-dasharray="4 4" visibility="hidden"/>';keys.forEach(function(kk){s+='<circle id="cd_'+kk[0]+'" r="5" fill="'+kk[2]+'" stroke="#fff" stroke-width="2" visibility="hidden"/>'});
 svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.innerHTML=s;
 $('cNote').textContent=n+' يوم';
 $('lg').innerHTML=[['vis','زيارات','#f2b705'],['vw','مشاهدات','#5b86ff']].map(function(l){return'<button data-k="'+l[0]+'" class="'+(SHOW[l[0]]?'':'off')+'"><i style="background:'+l[2]+'"></i>'+l[1]+'</button>'}).join('');
 var move=function(ev){var bx=svg.getBoundingClientRect(),cx=(ev.touches?ev.touches[0].clientX:ev.clientX),vx=(cx-bx.left)/bx.width*W,i=n>1?Math.round((vx-L)/(W-L-R)*(n-1)):0;i=Math.max(0,Math.min(n-1,i));var p=pts[i],px=x(i);
  var cl=$('cl');cl.setAttribute('x1',px);cl.setAttribute('x2',px);cl.setAttribute('visibility','visible');
  keys.forEach(function(kk){var c=$('cd_'+kk[0]);c.setAttribute('cx',px);c.setAttribute('cy',y(p[kk[0]]));c.setAttribute('visibility','visible')});
  tip.innerHTML='<b>'+p.k+'</b>'+(SHOW.vis?'<span><em style="font-style:normal"><i style="background:#f2b705"></i>زيارات</em><b style="margin:0;color:#fff">'+p.vis+'</b></span>':'')+(SHOW.vw?'<span><em style="font-style:normal"><i style="background:#5b86ff"></i>مشاهدات</em><b style="margin:0;color:#fff">'+p.vw+'</b></span>':'');
  var sc=bx.width/W,tx=px*sc-tip.offsetWidth/2;tx=Math.max(0,Math.min(bx.width-tip.offsetWidth,tx));tip.style.transform='translate('+tx+'px,4px)';tip.style.opacity=1};
 var out=function(){tip.style.opacity=0;[].forEach.call(svg.querySelectorAll('#cl,[id^=cd_]'),function(e){e.setAttribute('visibility','hidden')})};
 svg.onpointermove=move;svg.onpointerleave=out;svg.ontouchmove=move;svg.ontouchend=out}
$('lg').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var k=b.dataset.k,o=k==='vis'?'vw':'vis';if(SHOW[k]&&!SHOW[o])return;SHOW[k]=!SHOW[k];STILL=true;draw(false)});
/* ───── carte de chaleur ───── */
function heat(rows){var m=[],i,j;for(i=0;i<7;i++)m.push(new Array(24).fill(0));rows.forEach(function(r){var wd=new Date(r.k+'T00:00:00Z').getUTCDay(),h=r.v.hr||{};for(var k in h)m[wd][+k]+=h[k]});
 var mx=0;m.forEach(function(r){r.forEach(function(v){if(v>mx)mx=v})});var el=$('hm');if(!mx){el.innerHTML='<div class="empty" style="grid-column:1/-1">لا بيانات بعد</div>';return}
 var s='<span></span>';for(j=0;j<24;j++)s+='<span class="h">'+(j%3===0?j:'')+'</span>';
 WORDER.forEach(function(d){s+='<span class="l">'+WD[d]+'</span>';for(j=0;j<24;j++){var v=m[d][j];s+=v?'<span class="c" style="--o:'+(.12+.88*v/mx).toFixed(2)+'" title="'+WD[d]+' '+j+':00 — '+v+'"></span>':'<span class="c z" title="'+WD[d]+' '+j+':00 — 0"></span>'}});el.innerHTML=s}
function hours(rows){if(!$('cHr'))return;var h=agg(rows,'hr'),mx=Math.max(1,Math.max.apply(null,[0].concat(Object.keys(h).map(function(k){return h[k]})))),s='',i;
 for(i=0;i<24;i++){var v=h[i]||0,bh=v/mx*130,bx=12+i*28;s+='<rect x="'+bx+'" y="'+(150-bh)+'" width="20" height="'+Math.max(bh,2)+'" rx="5" fill="'+(v===mx&&v?'#f2b705':'#5b86ff')+'" opacity="'+(v?1:.25)+'"><title>'+i+':00 → '+v+'</title></rect><text class="axis" x="'+(bx+10)+'" y="172" text-anchor="middle" style="font-size:10px">'+i+'</text>'}$('cHr').innerHTML=s}
/* ───── résumé intelligent ───── */
function insights(rows,cur,prev,best){var a=[],src=agg(rows,'src'),dev=agg(rows,'dev'),h=agg(rows,'hr'),ts=top(src,1)[0],th=top(h,1)[0],tp=top(agg(rows,'pg'),1)[0],ds=0,k;for(k in src)ds+=src[k];var dt=0;for(k in dev)dt+=dev[k];
 if(!cur.vis){$('ins').innerHTML='<p>لا زيارات في هذه الفترة بعد.</p>';return}
 var p=prev?pct(cur.vis,prev.vis):null;
 if(p!==null&&isFinite(p))a.push('الزيارات '+(p>=0?'<b>ارتفعت '+Math.round(p)+'%</b>':'<b>انخفضت '+Math.abs(Math.round(p))+'%</b>')+' مقارنةً بالفترة السابقة ('+nf.format(prev.vis)+' زيارة).');
 else a.push('إجمالي <b>'+nf.format(cur.vis)+'</b> زيارة و<b>'+nf.format(cur.vw)+'</b> مشاهدة في هذه الفترة.');
 if(best.n>0)a.push('أفضل يوم: <b>'+best.k+'</b> ('+WD[new Date(best.k+'T00:00:00Z').getUTCDay()]+') بـ <b>'+best.n+'</b> زيارة.');
 if(ts&&ds)a.push('المصدر الأول: <b>'+esc(lab('src',ts))+'</b> بنسبة <b>'+Math.round(src[ts]/ds*100)+'%</b> من الزوار.');
 if(dt&&dev.mobile!==undefined)a.push('<b>'+Math.round((dev.mobile||0)/dt*100)+'%</b> من الزوار يتصفحون من الهاتف — تأكّد دائمًا من التجربة على الجوال.');
 if(th!==undefined)a.push('ذروة النشاط عند الساعة <b>'+th+':00</b> (توقيت الخادم).');
 if(tp)a.push('الصفحة الأكثر مشاهدة: <b dir="ltr">'+esc(tp)+'</b>.');
 var t=cur.nw+cur.rt;if(t)a.push('<b>'+Math.round(cur.rt/t*100)+'%</b> زوار عائدون و<b>'+Math.round(cur.nw/t*100)+'%</b> زوار جدد.');
 if(cur.durn)a.push('متوسط البقاء في الموقع: <b>'+dur(cur.dur/cur.durn)+'</b> و<b>'+f1(cur.vw/cur.vis)+'</b> صفحة لكل زيارة.');
 $('ins').innerHTML=a.map(function(x){return'<p><span>'+x+'</span></p>'}).join('')}
/* ───── tableau + export ───── */
function cols(rows){return top(agg(rows,'src'),6)}
function table(rows){var cs=cols(rows),rev=rows.slice().reverse(),lim=ALLROWS?rev.length:45,sh=rev.slice(0,lim);
 $('tDay').innerHTML='<thead><tr><th>التاريخ</th><th>زيارات</th><th>مشاهدات</th><th>المدة</th><th>جدد</th><th>عائدون</th>'+cs.map(function(c){return'<th>'+esc(lab('src',c))+'</th>'}).join('')+'</tr></thead><tbody>'+sh.map(function(r){var v=r.v,s=v.src||{};return'<tr><td>'+r.k+'</td><td>'+(v.visits||0)+'</td><td>'+(v.views||0)+'</td><td>'+(v.durn?dur(v.dur/v.durn):'—')+'</td><td>'+((v.new||{}).n||0)+'</td><td>'+((v.ret||{}).n||0)+'</td>'+cs.map(function(c){return'<td>'+(s[c]||0)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody>';
 var m=$('more');m.hidden=rev.length<=45;m.textContent=ALLROWS?'عرض أقل':'عرض الكل ('+rev.length+')'}
$('more').addEventListener('click',function(){ALLROWS=!ALLROWS;table(rng(span(),0))});
function dl_(name,type,text){var u=URL.createObjectURL(new Blob([text],{type:type})),a=document.createElement('a');a.href=u;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u)},1000)}
$('csv').addEventListener('click',function(){try{var rows=rng(span(),0),cs=cols(rows),c=[['date','visits','views','avg_seconds','new','returning'].concat(cs).join(',')];
 rows.forEach(function(r){var v=r.v,s=v.src||{};c.push([r.k,v.visits||0,v.views||0,v.durn?Math.round(v.dur/v.durn):0,(v.new||{}).n||0,(v.ret||{}).n||0].concat(cs.map(function(k){return s[k]||0})).join(','))});
 dl_('stats-'+TODAY+'.csv','text/csv;charset=utf-8;','\ufeff'+c.join('\r\n'))}catch(e){alert('تعذّر التصدير: '+e.message)}});
try{var c=sessionStorage.getItem('cei_st');if(c)unlock(c)}catch(e){}
})();
