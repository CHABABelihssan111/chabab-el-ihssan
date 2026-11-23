var DAYS={},TODAY='',N=30,CODE='';
function $(i){return document.getElementById(i)}
function load(code){return fetch('/stats/data.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'code='+encodeURIComponent(code)}).then(function(r){if(!r.ok)throw 0;return r.json()})}
function unlock(code){load(code).then(function(j){CODE=code;try{sessionStorage.setItem('cei_st',code)}catch(e){}DAYS=j.days||{};TODAY=j.today;$('gate').hidden=true;$('app').hidden=false;draw()}).catch(function(){$('err').textContent='الكود غير صحيح أو الخدمة غير متاحة'})}
$('go').onclick=function(){unlock($('code').value)};$('code').onkeydown=function(e){if(e.key==='Enter')unlock(this.value)};
document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){N=+b.dataset.n;document.querySelectorAll('.tabs button').forEach(function(x){x.classList.toggle('on',x===b)});draw()}});
function fmt(d){return d.toISOString().slice(0,10)}
function draw(){
 var end=new Date(TODAY+'T00:00:00Z'),pts=[];
 for(var i=N-1;i>=0;i--){var d=new Date(end-i*864e5),k=fmt(d),v=DAYS[k]||{views:0,visits:0};pts.push({k:k,vis:v.visits||0,vw:v.views||0})}
 var sv=0,sw=0;pts.forEach(function(p){sv+=p.vis;sw+=p.vw});
 $('sToday').textContent=pts[pts.length-1].vis;$('sVisits').textContent=sv;$('sViews').textContent=sw;$('sAvg').textContent=(sv/N).toFixed(1);
 var W=700,H=320,L=40,R=14,T=16,B=34,max=Math.max(5,Math.max.apply(null,pts.map(function(p){return p.vw}))),x=function(i){return L+i*(W-L-R)/Math.max(1,N-1)},y=function(v){return T+(H-T-B)*(1-v/max)};
 var s='';
 for(var g=0;g<=4;g++){var gv=Math.round(max*g/4),gy=y(gv);s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+gy+'" y2="'+gy+'" stroke="currentColor" opacity=".12"/><text x="'+(L-6)+'" y="'+(gy+4)+'" font-size="11" text-anchor="end" fill="currentColor" opacity=".6">'+gv+'</text>'}
 var step=Math.ceil(N/7);pts.forEach(function(p,i){if(i%step===0||i===N-1)s+='<text x="'+x(i)+'" y="'+(H-10)+'" font-size="11" text-anchor="middle" fill="currentColor" opacity=".6">'+p.k.slice(5)+'</text>'});
 function line(key,col,fill){var d=pts.map(function(p,i){return(i?'L':'M')+x(i).toFixed(1)+' '+y(p[key]).toFixed(1)}).join(' ');
  if(fill)s+='<path d="'+d+' L'+x(N-1)+' '+y(0)+' L'+x(0)+' '+y(0)+'Z" fill="'+col+'" opacity=".10"/>';
  s+='<path class="ln" d="'+d+'" fill="none" stroke="'+col+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
  if(N<=31)pts.forEach(function(p,i){s+='<circle cx="'+x(i)+'" cy="'+y(p[key])+'" r="3.5" fill="'+col+'"><title>'+p.k+': '+p[key]+'</title></circle>'})}
 line('vw','#1e3a8a',true);line('vis','#c8102e',true);
 $('chart').innerHTML=s}
try{var c=sessionStorage.getItem('cei_st');if(c)unlock(c)}catch(e){}
