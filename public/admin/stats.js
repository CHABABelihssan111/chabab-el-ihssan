var DAYS={},TODAY='',N=30;
function $(i){return document.getElementById(i)}
function load(code){return fetch('/stats/data.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'code='+encodeURIComponent(code)}).then(function(r){if(!r.ok)throw 0;return r.json()})}
function unlock(code){load(code).then(function(j){try{sessionStorage.setItem('cei_st',code)}catch(e){}DAYS=j.days||{};TODAY=j.today;$('gate').hidden=true;$('app').hidden=false;draw()}).catch(function(){$('err').textContent='الكود غير صحيح أو الخدمة غير متاحة'})}
$('go').onclick=function(){unlock($('code').value)};$('code').onkeydown=function(e){if(e.key==='Enter')unlock(this.value)};
document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){N=+b.dataset.n;document.querySelectorAll('.tabs button').forEach(function(x){x.classList.toggle('on',x===b)});draw()}});
function fmt(d){return d.toISOString().slice(0,10)}
var ICON={facebook:'📘 فيسبوك',instagram:'📸 إنستغرام',whatsapp:'💬 واتساب',tiktok:'🎵 تيك توك',youtube:'▶️ يوتيوب',twitter:'🐦 تويتر / X',telegram:'✈️ تيليغرام',snapchat:'👻 سناب شات',linkedin:'💼 لينكدإن',pinterest:'📌 بنترست',messenger:'💭 ماسنجر',google:'🔎 قوقل',bing:'🔎 بينغ',yahoo:'🔎 ياهو',duckduckgo:'🔎 DuckDuckGo',yandex:'🔎 ياندكس',reddit:'👽 ريديت',threads:'🧵 Threads',direct:'🔗 مباشر (رابط/حفظ/غير معروف)'};
var DEV={mobile:'📱 هاتف',desktop:'💻 حاسوب',tablet:'📲 لوحي'};
function lab(map,k){if(map==='src')return ICON[k]||(k.indexOf('site:')===0?'🌐 '+k.slice(5):'🏷️ '+k);if(map==='dev')return DEV[k]||k;return k}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function range(){var end=new Date(TODAY+'T00:00:00Z'),a=[];for(var i=N-1;i>=0;i--){var k=fmt(new Date(end-i*864e5));a.push({k:k,v:DAYS[k]||{}})}return a}
function agg(rows,map){var o={};rows.forEach(function(r){var m=r.v[map]||{};for(var k in m)o[k]=(o[k]||0)+m[k]});return o}
function table(id,map,limit,key){var o=agg(window._rows,map),ks=Object.keys(o).sort(function(a,b){return o[b]-o[a]}).slice(0,limit||10),t=0;for(var k in o)t+=o[k];
 var el=$(id);if(!ks.length){el.innerHTML='<div class="empty">لا بيانات بعد</div>';return}
 var mx=o[ks[0]];el.innerHTML=ks.map(function(k){return'<div class="row"><span>'+esc(lab(key||map,k))+'</span><div class="bar"><i style="width:'+(o[k]/mx*100).toFixed(1)+'%"></i></div><span><b>'+o[k]+'</b> <small>'+(t?Math.round(o[k]/t*100):0)+'%</small></span></div>'}).join('')}
function dur(s){s=Math.round(s);return s>=60?Math.floor(s/60)+'د '+(s%60)+'ث':s+'ث'}
function draw(){
 var rows=range();window._rows=rows;
 var sv=0,sw=0,sd=0,sdn=0,nw=0,rt=0,best={k:'-',n:-1};
 rows.forEach(function(r){var v=r.v;sv+=v.visits||0;sw+=v.views||0;sd+=v.dur||0;sdn+=v.durn||0;nw+=(v.new||{}).n||0;rt+=(v.ret||{}).n||0;if((v.visits||0)>best.n)best={k:r.k,n:v.visits||0}});
 var today=rows[rows.length-1].v,k=[[today.visits||0,'زيارات اليوم'],[sv,'زيارات الفترة'],[sw,'مشاهدات الصفحات'],[(sv/N).toFixed(1),'المعدل اليومي'],[sv?(sw/sv).toFixed(1):0,'صفحات / زيارة'],[sdn?dur(sd/sdn):'-','متوسط مدة البقاء'],[(nw+rt)?Math.round(nw/(nw+rt)*100)+'%':'-','زوار جدد'],[(nw+rt)?Math.round(rt/(nw+rt)*100)+'%':'-','زوار عائدون'],[best.n>0?best.k.slice(5)+' ('+best.n+')':'-','أفضل يوم']];
 $('kpi').innerHTML=k.map(function(x){return'<div class="stat"><b>'+x[0]+'</b><small>'+x[1]+'</small></div>'}).join('');
 table('tSrc','src',20);table('tPg','pg',12);table('tRef','ref',10);table('tDev','dev');table('tOs','os');table('tBr','br');table('tLang','lang');table('tScr','scr');table('tTz','tz',8);
 // ساعات الذروة
 var h=agg(rows,'hr'),hm=Math.max(1,Math.max.apply(null,Object.keys(h).map(function(x){return h[x]})).valueOf()||1),s='';
 for(var i=0;i<24;i++){var v=h[i]||0,bh=v/hm*130,bx=10+i*28;s+='<rect x="'+bx+'" y="'+(140-bh)+'" width="20" height="'+bh+'" rx="4" fill="#1e3a8a"><title>'+i+':00 → '+v+'</title></rect><text x="'+(bx+10)+'" y="162" font-size="10" text-anchor="middle" fill="currentColor" opacity=".6">'+i+'</text>'}
 $('cHr').innerHTML=s;
 // أيام الأسبوع
 var wd=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],w={};rows.forEach(function(r){var d=wd[new Date(r.k+'T00:00:00Z').getUTCDay()];w[d]=(w[d]||0)+(r.v.visits||0)});
 var wm=Math.max.apply(null,wd.map(function(d){return w[d]||0}))||1;$('tWd').innerHTML=wd.map(function(d){return'<div class="row"><span>'+d+'</span><div class="bar"><i style="width:'+((w[d]||0)/wm*100)+'%"></i></div><b>'+(w[d]||0)+'</b></div>'}).join('');
 // الجدول اليومي
 var cols=['facebook','instagram','whatsapp','tiktok','google','direct'];
 $('tDay').innerHTML='<tr><th>التاريخ</th><th>زيارات</th><th>مشاهدات</th>'+cols.map(function(c){return'<th>'+(ICON[c]||c).split(' ')[0]+'</th>'}).join('')+'</tr>'+rows.slice().reverse().map(function(r){var v=r.v,sr=v.src||{};return'<tr><td>'+r.k+'</td><td>'+(v.visits||0)+'</td><td>'+(v.views||0)+'</td>'+cols.map(function(c){return'<td>'+(sr[c]||0)+'</td>'}).join('')+'</tr>'}).join('');
 chart(rows)}
$('csv').onclick=function(){var rows=range(),c=['date,visits,views,avg_seconds,new,returning,facebook,instagram,whatsapp,tiktok,google,direct'];rows.forEach(function(r){var v=r.v,s=v.src||{};c.push([r.k,v.visits||0,v.views||0,v.durn?Math.round(v.dur/v.durn):0,(v.new||{}).n||0,(v.ret||{}).n||0,s.facebook||0,s.instagram||0,s.whatsapp||0,s.tiktok||0,s.google||0,s.direct||0].join(','))});
 var a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+c.join('\n')],{type:'text/csv'}));a.download='stats-'+TODAY+'.csv';a.click()};
function chart(rows){var pts=rows.map(function(r){return{k:r.k,vis:r.v.visits||0,vw:r.v.views||0}}),n=pts.length;
 var W=700,H=320,L=40,R=14,T=16,B=34,max=Math.max(5,Math.max.apply(null,pts.map(function(p){return p.vw}))),x=function(i){return L+i*(W-L-R)/Math.max(1,n-1)},y=function(v){return T+(H-T-B)*(1-v/max)},s='';
 for(var g=0;g<=4;g++){var gv=Math.round(max*g/4),gy=y(gv);s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+gy+'" y2="'+gy+'" stroke="currentColor" opacity=".12"/><text x="'+(L-6)+'" y="'+(gy+4)+'" font-size="11" text-anchor="end" fill="currentColor" opacity=".6">'+gv+'</text>'}
 var step=Math.ceil(n/7);pts.forEach(function(p,i){if(i%step===0||i===n-1)s+='<text x="'+x(i)+'" y="'+(H-10)+'" font-size="11" text-anchor="middle" fill="currentColor" opacity=".6">'+p.k.slice(5)+'</text>'});
 function line(key,col){var d=pts.map(function(p,i){return(i?'L':'M')+x(i).toFixed(1)+' '+y(p[key]).toFixed(1)}).join(' ');s+='<path d="'+d+' L'+x(n-1)+' '+y(0)+' L'+x(0)+' '+y(0)+'Z" fill="'+col+'" opacity=".10"/><path class="ln" d="'+d+'" fill="none" stroke="'+col+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
  if(n<=31)pts.forEach(function(p,i){s+='<circle cx="'+x(i)+'" cy="'+y(p[key])+'" r="3.5" fill="'+col+'"><title>'+p.k+': '+p[key]+'</title></circle>'})}
 line('vw','#1e3a8a');line('vis','#c8102e');$('chart').innerHTML=s}
try{var c=sessionStorage.getItem('cei_st');if(c)unlock(c)}catch(e){}
