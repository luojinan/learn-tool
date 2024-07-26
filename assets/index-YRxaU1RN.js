import{B as ce,o as fe,A as ie,r as x,C as U,w as H,D as de,E as pe,z as ye,G as he,H as me,I as ae,J as k,g as ge}from"./index-C3vdtt9O.js";function Z(e){return he()?(me(e),!0):!1}function Q(){const e=new Set,t=i=>{e.delete(i)};return{on:i=>{e.add(i);const r=()=>t(i);return Z(r),{off:r}},off:t,trigger:(...i)=>Promise.all(Array.from(e).map(r=>r(...i)))}}function D(e){return typeof e=="function"?e():ce(e)}const ue=typeof window<"u"&&typeof document<"u";typeof WorkerGlobalScope<"u"&&globalThis instanceof WorkerGlobalScope;const ve=Object.prototype.toString,we=e=>ve.call(e)==="[object Object]",se=()=>{};function be(e,t){function n(...u){return new Promise((i,r)=>{Promise.resolve(e(()=>t.apply(this,u),{fn:t,thisArg:this,args:u})).then(i).catch(r)})}return n}const le=e=>e();function Fe(e=le){const t=x(!0);function n(){t.value=!1}function u(){t.value=!0}const i=(...r)=>{t.value&&e(...r)};return{isActive:U(t),pause:n,resume:u,eventFilter:i}}function te(e,t=!1,n="Timeout"){return new Promise((u,i)=>{setTimeout(t?()=>i(n):u,e)})}function Se(e,...t){return t.some(n=>n in e)}function Te(e){return e||de()}function R(...e){if(e.length!==1)return pe(...e);const t=e[0];return typeof t=="function"?U(ye(()=>({get:t,set:se}))):x(t)}function Oe(e,t,n={}){const{eventFilter:u=le,...i}=n;return H(e,be(u,t),i)}function Ee(e,t,n={}){const{eventFilter:u,...i}=n,{eventFilter:r,pause:s,resume:w,isActive:b}=Fe(u);return{stop:Oe(e,t,{...i,eventFilter:r}),pause:s,resume:w,isActive:b}}function Ae(e,t=!0,n){Te()?fe(e,n):t?e():ie(e)}function Y(e,t=!1){function n(o,{flush:l="sync",deep:c=!1,timeout:d,throwOnTimeout:h}={}){let f=null;const S=[new Promise(O=>{f=H(e,E=>{o(E)!==t&&(f==null||f(),O(E))},{flush:l,deep:c,immediate:!0})})];return d!=null&&S.push(te(d,h).then(()=>D(e)).finally(()=>f==null?void 0:f())),Promise.race(S)}function u(o,l){if(!ae(o))return n(E=>E===o,l);const{flush:c="sync",deep:d=!1,timeout:h,throwOnTimeout:f}=l??{};let F=null;const O=[new Promise(E=>{F=H([e,o],([A,j])=>{t!==(A===j)&&(F==null||F(),E(A))},{flush:c,deep:d,immediate:!0})})];return h!=null&&O.push(te(h,f).then(()=>D(e)).finally(()=>(F==null||F(),D(e)))),Promise.race(O)}function i(o){return n(l=>!!l,o)}function r(o){return u(null,o)}function s(o){return u(void 0,o)}function w(o){return n(Number.isNaN,o)}function b(o,l){return n(c=>{const d=Array.from(c);return d.includes(o)||d.includes(D(o))},l)}function g(o){return y(1,o)}function y(o=1,l){let c=-1;return n(()=>(c+=1,c>=o),l)}return Array.isArray(D(e))?{toMatch:n,toContains:b,changed:g,changedTimes:y,get not(){return Y(e,!t)}}:{toMatch:n,toBe:u,toBeTruthy:i,toBeNull:r,toBeNaN:w,toBeUndefined:s,changed:g,changedTimes:y,get not(){return Y(e,!t)}}}function De(e){return Y(e)}function Pe(e,t,n={}){const{immediate:u=!0}=n,i=x(!1);let r=null;function s(){r&&(clearTimeout(r),r=null)}function w(){i.value=!1,s()}function b(...g){s(),i.value=!0,r=setTimeout(()=>{i.value=!1,r=null,e(...g)},D(t))}return u&&(i.value=!0,ue&&b()),Z(w),{isPending:U(i),start:b,stop:w}}function je(e){var t;const n=D(e);return(t=n==null?void 0:n.$el)!=null?t:n}const K=ue?window:void 0;function ne(...e){let t,n,u,i;if(typeof e[0]=="string"||Array.isArray(e[0])?([n,u,i]=e,t=K):[t,n,u,i]=e,!t)return se;Array.isArray(n)||(n=[n]),Array.isArray(u)||(u=[u]);const r=[],s=()=>{r.forEach(y=>y()),r.length=0},w=(y,o,l,c)=>(y.addEventListener(o,l,c),()=>y.removeEventListener(o,l,c)),b=H(()=>[je(t),D(i)],([y,o])=>{if(s(),!y)return;const l=we(o)?{...o}:o;r.push(...n.flatMap(c=>u.map(d=>w(y,c,d,l))))},{immediate:!0,flush:"post"}),g=()=>{b(),s()};return Z(g),g}const I=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},$="__vueuse_ssr_handlers__",Ce=Ne();function Ne(){return $ in I||(I[$]=I[$]||{}),I[$]}function _e(e,t){return Ce[e]||t}function xe(e){return e==null?"any":e instanceof Set?"set":e instanceof Map?"map":e instanceof Date?"date":typeof e=="boolean"?"boolean":typeof e=="string"?"string":typeof e=="object"?"object":Number.isNaN(e)?"any":"number"}const Be={boolean:{read:e=>e==="true",write:e=>String(e)},object:{read:e=>JSON.parse(e),write:e=>JSON.stringify(e)},number:{read:e=>Number.parseFloat(e),write:e=>String(e)},any:{read:e=>e,write:e=>String(e)},string:{read:e=>e,write:e=>String(e)},map:{read:e=>new Map(JSON.parse(e)),write:e=>JSON.stringify(Array.from(e.entries()))},set:{read:e=>new Set(JSON.parse(e)),write:e=>JSON.stringify(Array.from(e))},date:{read:e=>new Date(e),write:e=>e.toISOString()}},re="vueuse-storage";function He(e,t,n,u={}){var i;const{flush:r="pre",deep:s=!0,listenToStorageChanges:w=!0,writeDefaults:b=!0,mergeDefaults:g=!1,shallow:y,window:o=K,eventFilter:l,onError:c=a=>{console.error(a)},initOnMounted:d}=u,h=(y?k:x)(typeof t=="function"?t():t);if(!n)try{n=_e("getDefaultStorage",()=>{var a;return(a=K)==null?void 0:a.localStorage})()}catch(a){c(a)}if(!n)return h;const f=D(t),F=xe(f),S=(i=u.serializer)!=null?i:Be[F],{pause:O,resume:E}=Ee(h,()=>j(h.value),{flush:r,deep:s,eventFilter:l});o&&w&&Ae(()=>{ne(o,"storage",C),ne(o,re,z),d&&C()}),d||C();function A(a,p){o&&o.dispatchEvent(new CustomEvent(re,{detail:{key:e,oldValue:a,newValue:p,storageArea:n}}))}function j(a){try{const p=n.getItem(e);if(a==null)A(p,null),n.removeItem(e);else{const T=S.write(a);p!==T&&(n.setItem(e,T),A(p,T))}}catch(p){c(p)}}function J(a){const p=a?a.newValue:n.getItem(e);if(p==null)return b&&f!=null&&n.setItem(e,S.write(f)),f;if(!a&&g){const T=S.read(p);return typeof g=="function"?g(T,f):F==="object"&&!Array.isArray(T)?{...f,...T}:T}else return typeof p!="string"?p:S.read(p)}function C(a){if(!(a&&a.storageArea!==n)){if(a&&a.key==null){h.value=f;return}if(!(a&&a.key!==e)){O();try{(a==null?void 0:a.newValue)!==S.write(h.value)&&(h.value=J(a))}catch(p){c(p)}finally{a?ie(E):E()}}}}function z(a){C(a.detail)}return h}const Me={json:"application/json",text:"text/plain"};function oe(e){return e&&Se(e,"immediate","refetch","initialData","timeout","beforeFetch","afterFetch","onFetchError","fetch","updateDataOnError")}function X(e){return typeof Headers<"u"&&e instanceof Headers?Object.fromEntries(e.entries()):e}function Je(e,...t){var n;const u=typeof AbortController=="function";let i={},r={immediate:!0,refetch:!1,timeout:0,updateDataOnError:!1};const s={method:"GET",type:"text",payload:void 0};t.length>0&&(oe(t[0])?r={...r,...t[0]}:i=t[0]),t.length>1&&oe(t[1])&&(r={...r,...t[1]});const{fetch:w=(n=K)==null?void 0:n.fetch,initialData:b,timeout:g}=r,y=Q(),o=Q(),l=Q(),c=x(!1),d=x(!1),h=x(!1),f=x(null),F=k(null),S=k(null),O=k(b||null),E=ge(()=>u&&d.value);let A,j;const J=()=>{u&&(A==null||A.abort(),A=new AbortController,A.signal.onabort=()=>h.value=!0,i={...i,signal:A.signal})},C=v=>{d.value=v,c.value=!v};g&&(j=Pe(J,g,{immediate:!1}));let z=0;const a=async(v=!1)=>{var P,N;J(),C(!0),S.value=null,f.value=null,h.value=!1,z+=1;const V=z,M={method:s.method,headers:{}};if(s.payload){const m=X(M.headers),_=D(s.payload);!s.payloadType&&_&&Object.getPrototypeOf(_)===Object.prototype&&!(_ instanceof FormData)&&(s.payloadType="json"),s.payloadType&&(m["Content-Type"]=(P=Me[s.payloadType])!=null?P:s.payloadType),M.body=s.payloadType==="json"?JSON.stringify(_):_}let ee=!1;const L={url:D(e),options:{...M,...i},cancel:()=>{ee=!0}};if(r.beforeFetch&&Object.assign(L,await r.beforeFetch(L)),ee||!w)return C(!1),Promise.resolve(null);let W=null;return j&&j.start(),w(L.url,{...M,...L.options,headers:{...X(M.headers),...X((N=L.options)==null?void 0:N.headers)}}).then(async m=>{if(F.value=m,f.value=m.status,W=await m.clone()[s.type](),!m.ok)throw O.value=b||null,new Error(m.statusText);return r.afterFetch&&({data:W}=await r.afterFetch({data:W,response:m})),O.value=W,y.trigger(m),m}).catch(async m=>{let _=m.message||m.name;if(r.onFetchError&&({error:_,data:W}=await r.onFetchError({data:W,error:m,response:F.value})),S.value=_,r.updateDataOnError&&(O.value=W),o.trigger(m),v)throw m;return null}).finally(()=>{V===z&&C(!1),j&&j.stop(),l.trigger(null)})},p=R(r.refetch);H([p,R(e)],([v])=>v&&a(),{deep:!0});const T={isFinished:U(c),isFetching:U(d),statusCode:f,response:F,error:S,data:O,canAbort:E,aborted:h,abort:J,execute:a,onFetchResponse:y.on,onFetchError:o.on,onFetchFinally:l.on,get:B("GET"),put:B("PUT"),post:B("POST"),delete:B("DELETE"),patch:B("PATCH"),head:B("HEAD"),options:B("OPTIONS"),json:G("json"),text:G("text"),blob:G("blob"),arrayBuffer:G("arrayBuffer"),formData:G("formData")};function B(v){return(P,N)=>{if(!d.value)return s.method=v,s.payload=P,s.payloadType=N,ae(s.payload)&&H([p,R(s.payload)],([V])=>V&&a(),{deep:!0}),{...T,then(V,M){return q().then(V,M)}}}}function q(){return new Promise((v,P)=>{De(c).toBe(!0).then(()=>v(T)).catch(N=>P(N))})}function G(v){return()=>{if(!d.value)return s.type=v,{...T,then(P,N){return q().then(P,N)}}}}return r.immediate&&Promise.resolve().then(()=>a()),{...T,then(v,P){return q().then(v,P)}}}export{Z as a,Je as b,D as t,He as u};
