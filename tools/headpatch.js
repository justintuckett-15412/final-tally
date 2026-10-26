(function(){try{var P=Storage.prototype,rs=P.setItem,rr=P.removeItem;
var ok=function(k){return k==='finaltally.v1'||(k.indexOf('finaltally.v1.')===0&&!/\.(tmp|real|homecat|lastbk|linked|lkon)$/.test(k))};
var mark=function(st,k){try{if(st!==window.localStorage||!ok(k)||!st.getItem('ft.family'))return;var d=JSON.parse(st.getItem('ft.dirty')||'{}');d[k]=Date.now();rs.call(st,'ft.dirty',JSON.stringify(d));if(window.ftDirty)window.ftDirty()}catch(e){}};
P.setItem=function(k,v){var same=false;try{same=this.getItem(k)===String(v)}catch(e){}rs.call(this,k,v);if(!same)mark(this,String(k))};
P.removeItem=function(k){var had=this.getItem(k)!==null;rr.call(this,k);if(had)mark(this,String(k))};
window.__ftRaw={set:function(k,v){rs.call(localStorage,k,v)},remove:function(k){rr.call(localStorage,k)}};}catch(e){}})();
