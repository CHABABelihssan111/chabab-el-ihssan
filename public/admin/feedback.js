(function(){'use strict';
var ITEMS=[],TAB='feedback',CODE='',Q='',TYPE='',busy=false;
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var P={mail:'M3 6h18v12H3zM3 7l9 7 9-7',phone:'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',pin:'M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12zM12 7a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.5-6 8-6s8 2 8 6',clock:'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',page:'M6 3h9l4 4v14H6zM14 3v5h5',coin:'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.7c0 2.3-5 1.3-5 3.6 0 1.1 1 1.7 2.5 1.7s2.5-.5 2.5-1.5',tool:'M14 7l3 3-9 9H5v-3zM13 8l3 3',check:'M4 12l5 5L20 6',trash:'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6',wa:'M4 20l1.3-4.2A8 8 0 1112 20a8 8 0 01-3.9-1z',inbox:'M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5',msg:'M4 5h16v11H9l-5 4z',list:'M5 4h14v17H5zM9 9h6M9 13h6M9 17h3',bulb:'M9 18h6M10 21h4M12 3a6 6 0 00-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 00-4-10z',warn:'M12 3l10 18H2zM12 10v5M12 18h.01',heart:'M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z',users:'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20c0-3.5 3-6 7-6s7 2.5 7 6M17 4.5a3 3 0 010 6M19 14c2 .8 3 2.6 3 5'};
function ic(n){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(P[n]||P.msg)+'"/></svg>'}
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
