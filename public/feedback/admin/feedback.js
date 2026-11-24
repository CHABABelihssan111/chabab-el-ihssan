var ITEMS=[],TAB='feedback',CODE='';
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function load(code,del){var b='code='+encodeURIComponent(code)+(del?'&delete='+del:'');return fetch('/feedback/list.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:b}).then(function(r){if(!r.ok)throw 0;return r.json()})}
function unlock(code){load(code).then(function(j){CODE=code;try{sessionStorage.setItem('cei_st',code)}catch(e){}ITEMS=j.items||[];$('gate').hidden=true;$('app').hidden=false;draw()}).catch(function(){$('err').textContent='الكود غير صحيح أو الخدمة غير متاحة'})}
$('go').onclick=function(){unlock($('code').value)};$('code').onkeydown=function(e){if(e.key==='Enter')unlock(this.value)};
$('rf').onclick=function(){load(CODE).then(function(j){ITEMS=j.items||[];draw()})};
var TYPES={suggestion:'💡 اقتراح',remark:'📝 ملاحظة',problem:'⚠️ مشكلة',thanks:'🙏 شكر',donate:'💰 تبرع',join:'🤝 انضمام',sadaqa:'🌿 صدقة جارية'};
function draw(){
 var fb=ITEMS.filter(function(i){return i.kind==='feedback'}),fm=ITEMS.filter(function(i){return i.kind==='form'});
 $('tabs').innerHTML='<button data-t="feedback" class="'+(TAB==='feedback'?'on':'')+'">💬 الملاحظات<b>'+fb.length+'</b></button><button data-t="form" class="'+(TAB==='form'?'on':'')+'">📋 الاستمارات<b>'+fm.length+'</b></button>';
 Array.prototype.forEach.call($('tabs').children,function(b){b.onclick=function(){TAB=b.dataset.t;draw()}});
 var rows=TAB==='feedback'?fb:fm;
 if(!rows.length){$('list').innerHTML='<div class="card empty">لا توجد رسائل بعد</div>';return}
 $('list').innerHTML=rows.map(function(i){
  var h='<div class="card it"><div class="top"><span class="tag">'+esc(TYPES[i.type]||i.type||'')+'</span><span dir="ltr">'+esc(i.at)+'</span></div>';
  if(i.kind==='feedback'){
   h+='<div class="msg">'+esc(i.message)+'</div><div class="kv"><span>الاسم</span><b>'+esc(i.name||'—')+'</b><span>للتواصل</span><b>'+esc(i.contact||'—')+'</b><span>الصفحة</span><b dir="ltr">'+esc(i.page||'')+'</b></div>';
  }else{
   var tel=esc(i.phone);
   h+='<div class="kv"><span>الاسم</span><b>'+esc(i.name)+'</b><span>الهاتف</span><a href="tel:'+tel+'">'+tel+'</a>'+(i.email?'<span>البريد</span><a href="mailto:'+esc(i.email)+'">'+esc(i.email)+'</a>':'')+(i.wilaya?'<span>الولاية</span><b>'+esc(i.wilaya)+'</b>':'')+(i.amount?'<span>المبلغ (دج)</span><b>'+esc(i.amount)+'</b>':'')+(i.project?'<span>المشروع</span><b>'+esc(i.project)+'</b>':'')+(i.skills?'<span>المهارات</span><b>'+esc(i.skills)+'</b>':'')+'</div>'+(i.note?'<div class="msg">'+esc(i.note)+'</div>':'');
  }
  return h+'<button class="del" data-id="'+esc(i.id)+'">🗑️ حذف</button></div>';
 }).join('');
 Array.prototype.forEach.call($('list').querySelectorAll('.del'),function(b){b.onclick=function(){if(!confirm('حذف هذه الرسالة نهائياً؟'))return;load(CODE,b.dataset.id).then(function(j){ITEMS=j.items||[];draw()})}});
}
$('csv').onclick=function(){
 var rows=ITEMS.filter(function(i){return i.kind===TAB});
 var cols=TAB==='feedback'?['at','type','name','contact','message','page']:['at','type','name','phone','email','wilaya','amount','project','skills','note'];
 var q=function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'};
 var c=[cols.join(',')].concat(rows.map(function(r){return cols.map(function(k){return q(r[k])}).join(',')}));
 var url=URL.createObjectURL(new Blob(['\ufeff'+c.join('\r\n')],{type:'text/csv;charset=utf-8;'})),a=document.createElement('a');
 a.href=url;a.download=TAB+'-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();
 setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url)},1000);
};
try{var c=sessionStorage.getItem('cei_st');if(c)unlock(c)}catch(e){}
