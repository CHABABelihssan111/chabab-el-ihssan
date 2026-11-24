(function(){'use strict';
var ITEMS=[],TAB='feedback',CODE='',Q='',TYPE='',busy=false;
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var P={mail:'📧',phone:'📞',pin:'📍',user:'👤',clock:'🕒',page:'📄',coin:'💰',tool:'🛠️',check:'✅',trash:'🗑️',wa:'💬',inbox:'📭',msg:'💬',list:'📋',bulb:'💡',warn:'⚠️',heart:'🤲',users:'🤝'};
function ic(n){return '<span class="em">'+(P[n]||P.msg)+'</span>'}
var TYPES={suggestion:['اقتراح','bulb'],remark:['ملاحظة','msg'],problem:['مشكلة','warn'],thanks:['شكر','heart'],donate:['تبرع','coin'],join:['انضمام / تطوع','users'],sadaqa:['صدقة جارية','heart']};
function toast(m){var t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toast._t);toast._t=setTimeout(function(){t.style.display='none'},2600)}
function call(extra){var b='code='+encodeURIComponent(CODE)+(extra||'');return fetch('/feedback/list.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:b}).then(function(r){if(!r.ok){var e=new Error('http');e.status=r.status;throw e}return r.json()})}
function unlock(code){CODE=code;call().then(function(j){try{sessionStorage.setItem('cei_st',code)}catch(e){}ITEMS=j.items||[];$('gate').hidden=true;$('app').hidden=false;draw()}).catch(function(e){CODE='';try{sessionStorage.removeItem('cei_st')}catch(x){}$('err').textContent=e&&e.status===429?'محاولات كثيرة، حاول بعد قليل':e&&e.status===403?'الرمز غير صحيح':'تعذّر الاتصال بالخادم. تأكد من رفع مجلد feedback (list.php).'})}
function act(extra,msg){if(busy)return;busy=true;call(extra).then(function(j){ITEMS=j.items||[];draw();if(msg)toast(msg)}).catch(function(){toast('تعذّر تنفيذ العملية')}).then(function(){busy=false})}
$('go').onclick=function(){unlock($('code').value)};$('code').onkeydown=function(e){if(e.key==='Enter')unlock(this.value)};
$('rf').onclick=function(){act('','تم التحديث')};
$('all').onclick=function(){act('&seen=all&val=1','تم تعليم الكل كمقروء')};
$('q').oninput=function(){Q=this.value.trim().toLowerCase();draw()};
$('dk').onclick=function(){document.body.classList.toggle('dark');try{localStorage.setItem('cei_fb_dark',document.body.classList.contains('dark')?'1':'0')}catch(e){}};
try{var dk=localStorage.getItem('cei_fb_dark');if(dk==='1'||(dk===null&&matchMedia('(prefers-color-scheme:dark)').matches))document.body.classList.add('dark')}catch(e){}
function hay(i){return [i.name,i.contact,i.message,i.phone,i.email,i.wilaya,i.project,i.skills,i.note,i.amount].join(' ').toLowerCase()}
function draw(){
 var fb=ITEMS.filter(function(i){return i.kind==='feedback'}),fm=ITEMS.filter(function(i){return i.kind==='form'});
 var nf=fb.filter(function(i){return !i.seen}).length,nm=fm.filter(function(i){return !i.seen}).length;
 $('kpi').innerHTML=[[ITEMS.length,'إجمالي الرسائل'],[nf+nm,'غير مقروءة'],[fb.length,'ملاحظات وبلاغات'],[fm.length,'استمارات']].map(function(k){return '<div class="k"><b>'+k[0]+'</b><small>'+k[1]+'</small></div>'}).join('');
 $('tabs').innerHTML=[['feedback','msg','الملاحظات',nf],['form','list','الاستمارات',nm]].map(function(t){return '<button type="button" class="tab'+(TAB===t[0]?' on':'')+'" data-t="'+t[0]+'">'+ic(t[1])+t[2]+(t[3]?'<b>'+t[3]+'</b>':'')+'</button>'}).join('');
 Array.prototype.forEach.call($('tabs').children,function(b){b.onclick=function(){TAB=b.dataset.t;TYPE='';draw()}});
 var base=TAB==='feedback'?fb:fm,types=[];base.forEach(function(i){if(types.indexOf(i.type)<0)types.push(i.type)});
 $('chips').innerHTML=types.length>1?[''].concat(types).map(function(t){return '<button type="button" class="chip'+(TYPE===t?' on':'')+'" data-ty="'+esc(t)+'">'+esc(t?(TYPES[t]||[t])[0]:'الكل')+'</button>'}).join(''):'';
 Array.prototype.forEach.call($('chips').children,function(b){b.onclick=function(){TYPE=b.dataset.ty;draw()}});
 var rows=base.filter(function(i){return (!TYPE||i.type===TYPE)&&(!Q||hay(i).indexOf(Q)>=0)});
 if(!rows.length){$('list').innerHTML='<div class="empty">'+ic('inbox')+'<div>'+(Q||TYPE?'لا نتائج مطابقة':'لا توجد رسائل بعد')+'</div></div>';return}
 $('list').innerHTML=rows.map(function(i){
  var T=TYPES[i.type]||[i.type||'رسالة','msg'];
  var h='<article class="it'+(i.seen?'':' new')+'"><div class="top"><span class="tag '+esc(i.type)+'">'+ic(T[1])+esc(T[0])+'</span><span dir="ltr">'+ic('clock')+' '+esc(i.at)+'</span></div>';
  if(i.kind==='feedback'){
   var c=i.contact||'',cl=/@/.test(c)?'<a href="mailto:'+esc(c)+'">'+esc(c)+'</a>':/[0-9]{6,}/.test(c)?'<a href="tel:'+esc(c.replace(/[^0-9+]/g,''))+'">'+esc(c)+'</a>':esc(c);
   h+='<div class="msg">'+esc(i.message)+'</div><div class="kv"><span>'+ic('user')+'<b>'+esc(i.name||'زائر مجهول')+'</b></span>'+(c?'<span>'+ic('phone')+cl+'</span>':'')+(i.page?'<span>'+ic('page')+'<b dir="ltr">'+esc(i.page)+'</b></span>':'')+'</div>';
  }else{
   var tel=esc(String(i.phone||'').replace(/[^0-9+]/g,''));
   h+='<div class="kv"><span>'+ic('user')+'<b>'+esc(i.name)+'</b></span><span>'+ic('phone')+'<a href="tel:'+tel+'">'+esc(i.phone)+'</a></span>'+(i.email?'<span>'+ic('mail')+'<a href="mailto:'+esc(i.email)+'">'+esc(i.email)+'</a></span>':'')+(i.wilaya?'<span>'+ic('pin')+'<b>'+esc(i.wilaya)+'</b></span>':'')+(i.amount?'<span>'+ic('coin')+'<b>'+esc(i.amount)+' دج</b></span>':'')+(i.project?'<span>'+ic('list')+'<b>'+esc(i.project)+'</b></span>':'')+(i.skills?'<span>'+ic('tool')+'<b>'+esc(i.skills)+'</b></span>':'')+'</div>'+(i.note?'<div class="msg">'+esc(i.note)+'</div>':'');
  }
  var ph=String(i.phone||(/[0-9]{8,}/.test(i.contact||'')?i.contact:'')).replace(/[^0-9]/g,'');
  if(ph){ph=ph.replace(/^00/,'');if(ph.charAt(0)==='0')ph='213'+ph.slice(1)}
  h+='<div class="act"><button class="btn sm" type="button" data-s="'+esc(i.id)+'" data-v="'+(i.seen?0:1)+'">'+ic('check')+(i.seen?'إرجاع كجديد':'تعليم كمقروء')+'</button>'+(ph?'<a class="btn sm" style="text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/'+ph+'">'+ic('wa')+'واتساب</a>':'')+'<button class="btn sm dng" type="button" data-d="'+esc(i.id)+'">'+ic('trash')+'حذف</button></div></article>';
  return h}).join('');
 Array.prototype.forEach.call($('list').querySelectorAll('[data-s]'),function(b){b.onclick=function(){act('&seen='+b.dataset.s+'&val='+b.dataset.v)}});
 Array.prototype.forEach.call($('list').querySelectorAll('[data-d]'),function(b){b.onclick=function(){if(confirm('حذف هذه الرسالة نهائياً؟'))act('&delete='+b.dataset.d,'تم الحذف')}});
}
$('csv').onclick=function(){
 var rows=ITEMS.filter(function(i){return i.kind===TAB});
 var cols=TAB==='feedback'?['at','type','name','contact','message','page']:['at','type','name','phone','email','wilaya','amount','project','skills','note'];
 var q=function(v){v=String(v==null?'':v);if(/^[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 var c=[cols.join(',')].concat(rows.map(function(r){return cols.map(function(k){return q(r[k])}).join(',')}));
 var url=URL.createObjectURL(new Blob(['﻿'+c.join('\r\n')],{type:'text/csv;charset=utf-8;'})),a=document.createElement('a');
 a.href=url;a.download=TAB+'-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();
 setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url)},1000);
};
setInterval(function(){if(CODE&&!document.hidden&&!busy)call().then(function(j){if((j.items||[]).length!==ITEMS.length){ITEMS=j.items;draw()}}).catch(function(){})},60000);
try{var c=sessionStorage.getItem('cei_st');if(c)unlock(c)}catch(e){}
})();
