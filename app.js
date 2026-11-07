/* WEAR ME app: store and admin dashboard. Needs config.js and api-client.js loaded first. */
(function(){"use strict";
/* ----- p2 ----- */
/* ===== core: helpers, data, cloud ===== */
var $=function(s,r){return (r||document).querySelector(s)};
var NGN=function(n){return "₦"+Number(n||0).toLocaleString("en-NG")};
var NGNc=function(n){n=Number(n||0);if(n>=1e6)return "₦"+(n/1e6).toFixed(n%1e6?1:0)+"M";if(n>=1e3)return "₦"+Math.round(n/1e3)+"k";return "₦"+Math.round(n)};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var store={
  get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
var fmtDate=function(iso){try{return new Date(iso).toLocaleString("en-NG",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"})}catch(e){return ""}};
var waNum=function(p){var d=String(p||"").replace(/\D/g,"");if(d.charAt(0)==="0")d="234"+d.slice(1);return d};
var waLink=function(num,text){return "https://wa.me/"+waNum(num)+(text?"?text="+encodeURIComponent(text):"")};
var prettyNum=function(p){var d=waNum(p);if(d.indexOf('234')===0&&d.length===13){d='0'+d.slice(3);return d.slice(0,4)+' '+d.slice(4,7)+' '+d.slice(7)}return String(p||'')};
var rid=function(p){return p+"-"+String(Math.floor(100000+Math.random()*900000))};

var CATS=[
  {id:"senators",name:"Senators",icon:"kaftan"},{id:"suits",name:"Suits",icon:"suit"},
  {id:"agbada",name:"Native & Agbada",icon:"kaftan"},{id:"shirts",name:"Shirts",icon:"shirt"},
  {id:"trousers",name:"Trousers",icon:"trousers"},{id:"shoes",name:"Shoes",icon:"shoe"},
  {id:"caps",name:"Caps",icon:"cap"},{id:"accessories",name:"Accessories",icon:"acc"}
];
var CATBY={};CATS.forEach(function(c,i){c.ci=i+1;CATBY[c.id]=c});
var SIZES={senators:["S","M","L","XL","XXL"],suits:["38","40","42","44","46","48"],agbada:["M","L","XL","XXL"],shirts:["S","M","L","XL","XXL"],trousers:["30","32","34","36","38","40"],shoes:["40","41","42","43","44","45"],caps:["One size"],accessories:["One size"]};
var DESC={
  senators:"Cut from breathable fabric with a clean collar and straight-leg trousers. Sold as a two-piece set.",
  suits:"Tailored in a structured wool blend with a half-canvas front. Jacket and trousers sold together.",
  agbada:"Three-piece native set with generous drape and fine trim. Ideal for weddings and ceremonies.",
  shirts:"Easy-iron cotton with a crisp collar. Pairs with any suit or trouser.",
  trousers:"Tailored through the leg with a comfortable waist and a clean break at the shoe.",
  shoes:"Leather upper, cushioned insole and a durable sole built for long days.",
  caps:"Hand-finished with a soft lining and a snug, even fit.",
  accessories:"A finishing touch chosen to sit with our senators and suits."
};
var ICON={};CATS.forEach(function(c){ICON[c.id]=c.icon});
var DEFAULTS=[
  [1,"Abuja Classic Senator","senators",48000,"#1f2f4f","top new"],[2,"Lekki Embroidered Senator","senators",62000,"#1f4d3a","best"],
  [3,"Ikoyi Plain Senator","senators",42000,"#3b3f45","best"],[4,"Kano Linen Senator","senators",55000,"#c9b48a","new"],
  [5,"Royal Collar Senator","senators",68000,"#6b1f2e","top"],[6,"Banker Two-Piece Suit","suits",165000,"#1a1a1a","top best"],
  [7,"Victoria Island Three-Piece","suits",220000,"#3b3f45","top"],[8,"Slim Fit Wedding Suit","suits",185000,"#2a4a8a","new"],
  [9,"Executive Pinstripe Suit","suits",195000,"#1f2f4f","best"],[10,"Evening Tuxedo","suits",240000,"#121212","new"],
  [11,"Grand Agbada Set","agbada",280000,"#e8dfc8","top"],[12,"Royal Blue Agbada","agbada",310000,"#2a4a8a","new"],
  [13,"Trimmed Kaftan Set","agbada",95000,"#6b1f2e","best"],[14,"Oxford Dress Shirt","shirts",24000,"#f1efe8","best"],
  [15,"Slim Poplin Shirt","shirts",22000,"#8fb2d6","new"],[16,"Mandarin Collar Shirt","shirts",26000,"#1a1a1a","new"],
  [17,"Tailored Trousers","trousers",32000,"#3b3f45","best"],[18,"Stone Chinos","trousers",28000,"#b9a98a",""],
  [19,"Pleated Wool Trousers","trousers",38000,"#1f2f4f","new"],[20,"Oxford Leather Shoe","shoes",78000,"#5a3b27","top"],
  [21,"Black Penny Loafer","shoes",65000,"#1a1a1a","best"],[22,"Cross-Strap Palm Slippers","shoes",45000,"#7a4a2a",""],
  [23,"Wine Fila Cap","caps",12000,"#6b1f2e","new"],[24,"Navy Fila Cap","caps",12000,"#1f2f4f","best"],
  [25,"Silk Tie","accessories",14000,"#1f4d3a","top"],[26,"Leather Belt","accessories",18000,"#3a2a1f",""],
  [27,"Pocket Square Set","accessories",9000,"#8a8f94","new"]
].map(function(a){return {id:a[0],name:a[1],cat:a[2],price:a[3],color:a[4],tags:a[5].split(" ").filter(Boolean),desc:DESC[a[2]],sizes:SIZES[a[2]].slice(),image:"",active:true,soldOut:false}});
var DEF_SITE={businessName:"WEAR ME",whatsapp:"2349048431819",phone:"0800 000 0000",address:"Your shop address here",email:"",deliveryFee:3500,freeAbove:0,bankName:"OPay",accountNumber:"0000000000",accountName:"WEAR ME",payLink:"https://www.opayweb.com",contacts:[{reason:"Enquiries",number:"0904 843 1819"},{reason:"Complaints",number:""}],socials:[],models:["","","",""],sizeGuides:{},legal:{}};
var DEF_BANNERS=[
  {id:"d1",type:"text",theme:1,art:"kaftan",artColor:"#e8dfc8",title:"New season senators",sub:"Fresh cuts in rich colours.",cta:"Shop senators",link:"catalogue-senators",seconds:6,repeats:2,active:true},
  {id:"d2",type:"text",theme:2,art:"suit",artColor:"#c9b48a",title:"Suits that mean business",sub:"Two-piece, three-piece and tuxedos.",cta:"Shop suits",link:"catalogue-suits",seconds:6,repeats:2,active:true},
  {id:"d3",type:"text",theme:3,art:"shirt",artColor:"#f1efe8",title:"Sew with us",sub:"Your idea and your measurements, made for you.",cta:"Start sewing",link:"sew-with-us",seconds:6,repeats:2,active:true}
];
var LINKS=[["","No button"],["home","Home"],["catalogue","Full catalogue"],["catalogue-new","New arrivals"],["catalogue-best","Best sellers"],["sew-with-us","Sew with us"]].concat(CATS.map(function(c){return ["catalogue-"+c.id,c.name]}));

var S={
  cart:store.get("wm_cart",[]),wish:store.get("wm_wish",[]),last:store.get("wm_last",null),
  dbProducts:null,site:Object.assign({},DEF_SITE),banners:null,
  tab:"top",q:"",sort:"featured",ship:"home",ddOpen:false,menu:false,cartOpen:false,qv:null,
  sew:{imgs:[],busy:false,done:null,err:""}
};
function save(){store.set("wm_cart",S.cart);store.set("wm_wish",S.wish)}
function allProducts(){return S.dbProducts&&S.dbProducts.length?S.dbProducts:DEFAULTS}
function liveProducts(){return allProducts().filter(function(p){return p.active!==false})}
function byId(id){var a=allProducts();for(var i=0;i<a.length;i++)if(String(a[i].id)===String(id))return a[i];return null}
function sizesOf(p){return p.sizes&&p.sizes.length?p.sizes:(SIZES[p.cat]||["One size"])}
function descOf(p){return p.desc||DESC[p.cat]||""}
function siteWa(){return S.site.whatsapp||DEF_SITE.whatsapp}

/* cloud: db, user and assets arrive later; every feature works without them */
var cloud={db:null,user:null,assets:null,canEdit:false,ready:false};
async function use(n){try{if(window.claude&&window.claude.use)return await window.claude.use(n)}catch(e){}return null}
async function dbWrite(fn){try{await fn();return true}catch(e){return false}}
function rerenderKeepScroll(){var y=window.scrollY;render();window.scrollTo(0,y)}
function storeRefresh(){var r=route().v;if(r==="admin")return;if(r==="checkout"||r==="sew")return;rerenderKeepScroll()}
function startStoreSubs(){
  if(!cloud.db||startStoreSubs.on)return;startStoreSubs.on=true;
  var noop=function(){};
  cloud.db.collection("products").onSnapshot(function(s){S.dbProducts=s.docs.map(function(d){return d.data()}).sort(function(a,b){return a.id-b.id});storeRefresh();if(route().v==="admin")adminRefresh()},noop);
  cloud.db.doc("settings/site").onSnapshot(function(s){S.site=Object.assign({},DEF_SITE,s.exists?s.data():{});storeRefresh()},noop);
  cloud.db.doc("settings/banners").onSnapshot(function(s){S.banners=s.exists&&s.data().items?s.data().items:null;Banner.update()},noop);
}
async function initCloud(){
  cloud.db=await use("db");cloud.user=await use("user");cloud.assets=await use("assets");
  try{if(cloud.user)cloud.canEdit=!!(await cloud.user.canEdit())}catch(e){}
  cloud.ready=true;startStoreSubs();startMyOrders();
  if(route().v==="admin"){startAdminSubs()}
  render();
}

/* icons + art */
var IC={
  menu:'<svg class="ico" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  user:'<svg class="ico" viewBox="0 0 24 24"><circle cx="10" cy="8" r="3.6"/><path d="M3.5 20c.4-3.6 3.2-5.6 6.5-5.6"/><circle cx="17.5" cy="17" r="3.6"/><path d="m15.8 17 1.3 1.3 2.2-2.4"/></svg>',
  cart:'<svg class="ico" viewBox="0 0 24 24"><path d="M3 4h2.5l2.2 11h10.6l2-8H6.4"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/></svg>',
  search:'<svg class="ico" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/></svg>',
  heart:'<svg class="ico" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z"/></svg>',
  x:'<svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  chev:'<svg class="ico chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  box:'<svg class="ico" viewBox="0 0 24 24"><path d="M4 8l8-4 8 4v10l-8 3-8-3Z"/><path d="M4 8l8 3.5L20 8M12 11.5V21"/></svg>',
  mail:'<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
  ticket:'<svg class="ico" viewBox="0 0 24 24"><path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4v0a2 2 0 0 0 0-4V6H3Z"/><path d="M12 9.5v5"/></svg>',
  star:'<svg class="ico" viewBox="0 0 24 24"><path d="m12 4 2.4 5 5.4.7-4 3.7 1 5.4L12 16.2 7.2 18.8l1-5.4-4-3.7 5.4-.7Z"/></svg>',
  tick:'<svg class="ico" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  arrow:'<svg class="ico" style="width:18px;height:18px" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  needle:'<svg class="ico" viewBox="0 0 24 24"><path d="M19 4 6 17"/><ellipse cx="17.8" cy="5.2" rx=".9" ry="2.2" transform="rotate(45 17.8 5.2)"/><path d="M6 17c-1 1-2 2-1 3 1 1 2 0 3-1M5 20c5 1 9-2 11-6"/></svg>'
};
function art(p,cls){return '<svg class="'+(cls||"")+'" viewBox="0 0 100 120" aria-hidden="true"><use href="#g-'+ICON[p.cat]+'" style="color:'+esc(p.color)+'"/></svg>'}
function pic(p){return p.image?'<img src="'+BLOB+esc(p.image)+'" alt="'+esc(p.name)+'" loading="lazy" draggable="false">':art(p)}
function cico(id){return '<svg class="cico" viewBox="0 0 100 120" aria-hidden="true"><use href="#g-'+CATBY[id].icon+'" style="color:currentColor"/></svg>'}
function toast(msg){var box=$("#toastbox");box.innerHTML='<div class="toast" role="status">'+esc(msg)+'</div>';clearTimeout(toast.t);toast.t=setTimeout(function(){box.innerHTML=""},2800)}

var BLOB=window.WM_BLOB||"/blob/";

/* routing */
function route(){
  var h=(location.hash||"").slice(1);
  if(window.WM_MODE==="admin"){var q=(h||"admin").split("-");if(q[0]!=="admin")q=["admin"];return {v:"admin",tab:q[1]||"sales",sub:q[2]||""}}
  if(!h||h==="welcome")return {v:"welcome"};
  if(h==="home")return {v:"home"};
  if(h.indexOf("catalogue")===0){var c=h.split("-").slice(1).join("-")||"all";return {v:"catalogue",cat:c}}
  if(h==="checkout")return {v:"checkout"};
  if(h==="thank-you")return {v:"thanks"};
  if(h==="sew-with-us")return {v:"sew"};
  if(h==="my-orders")return {v:"orders"};
  if(h==="contact-us")return {v:"info",page:"contact"};
  if(h==="size-guide")return {v:"info",page:"size-guide"};
  if(h.indexOf("legal-")===0)return {v:"info",page:h.slice(6)};
  return {v:"home"};
}
function go(h){if(location.hash==="#"+h){render()}else{location.hash=h}}

/* ----- p3 ----- */
/* ===== banner slider ===== */
var Banner=(function(){
  var host=$("#bannerhost"),items=[],idx=0,timer=null,plays=0,sig="",visible=false,track=null,sx=null;
  function list(){var b=S.banners,a=[];if(b&&b.length){a=b.filter(function(x){return x&&x.mediaId&&x.active!==false}).map(function(x){return {id:x.id||"v",type:"video",mediaId:x.mediaId,repeats:x.repeats||2,seconds:6}});if(a.length)return a}return DEF_BANNERS}
  function slide(it,i){
    var bg="";
    if(it.type==="image")bg='<img src="'+BLOB+esc(it.mediaId)+'" alt="" draggable="false">';
    else if(it.type==="video")bg='<video muted playsinline preload="auto" src="'+BLOB+esc(it.mediaId)+'"></video>';
    else bg='<div class="bn-anim bn-'+(it.theme||1)+'"></div>'+(it.art?'<svg class="bn-art" viewBox="0 0 100 120" aria-hidden="true"><use href="#g-'+esc(it.art)+'" style="color:'+esc(it.artColor||"#e8dfc8")+'"/></svg>':"");
    var copy=(it.title||it.sub||it.cta)?'<div class="bn-copy">'+(it.title?'<h2>'+esc(it.title)+'</h2>':"")+(it.sub?'<p>'+esc(it.sub)+'</p>':"")+(it.cta&&it.link?'<a class="btn btn-gold" href="#'+esc(it.link)+'">'+esc(it.cta)+'</a>':"")+'</div>':"";
    return '<div class="bn-slide'+(i===0?" on":"")+'">'+bg+(it.type!=="text"&&copy?'<div class="bn-shade"></div>':"")+copy+'</div>';
  }
  function build(){
    items=list();idx=0;plays=0;
    host.innerHTML='<div class="bn" role="region" aria-label="Announcements"><div class="bn-track">'+items.map(slide).join("")+'</div>'+
      (items.length>1?'<div class="bn-dots">'+items.map(function(_,i){return '<button data-bn="'+i+'" aria-label="Show banner '+(i+1)+'" aria-current="'+(i===0)+'"></button>'}).join("")+'</div>':"")+'</div>';
    track=$(".bn-track",host);
    Array.prototype.forEach.call(host.querySelectorAll("video"),function(v){
      v.muted=true;
      v.addEventListener("ended",function(){onEnded(v)});
      v.addEventListener("error",function(){clearTimeout(timer);timer=setTimeout(next,1500)});
    });
    if(visible)start();
  }
  function show(i){
    idx=(i+items.length)%items.length;
    if(track)track.style.transform="translateX(-"+(idx*100)+"%)";
    Array.prototype.forEach.call(host.querySelectorAll(".bn-slide"),function(s,k){s.classList.toggle("on",k===idx)});
    Array.prototype.forEach.call(host.querySelectorAll(".bn-dots button"),function(b,k){b.setAttribute("aria-current",String(k===idx))});
    start();
  }
  function next(){if(items.length>1)show(idx+1);else start()}
  function start(){
    clearTimeout(timer);if(!visible||document.hidden)return;
    var it=items[idx],slides=host.querySelectorAll(".bn-slide"),v=slides[idx]&&slides[idx].querySelector("video");
    Array.prototype.forEach.call(host.querySelectorAll("video"),function(x){if(x!==v)x.pause()});
    plays=0;
    if(v){
      try{v.currentTime=0}catch(e){}
      var p=v.play();
      if(p&&p.catch)p.catch(function(){timer=setTimeout(next,(it.seconds||6)*1000)});
    }else{
      timer=setTimeout(next,(it.seconds||5)*1000);
    }
  }
  function onEnded(v){
    var it=items[idx];plays++;
    if(plays>=(it.repeats||2)){if(items.length>1)next();else{plays=0;v.currentTime=0;v.play()}}
    else{v.currentTime=0;v.play()}
  }
  function update(){
    var s=JSON.stringify(list());
    if(s===sig&&host.firstChild)return;sig=s;build();
  }
  function setVisible(v){
    host.hidden=!v;
    if(v===visible)return;visible=v;
    if(v){if(!host.firstChild)update();else start()}
    else{clearTimeout(timer);Array.prototype.forEach.call(host.querySelectorAll("video"),function(x){x.pause()})}
  }
  host.addEventListener("click",function(e){var b=e.target.closest("[data-bn]");if(b)show(+b.getAttribute("data-bn"))});
  host.addEventListener("pointerdown",function(e){sx=e.clientX});
  host.addEventListener("pointerup",function(e){if(sx==null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>45&&items.length>1)show(dx<0?idx+1:idx-1)});
  host.addEventListener("pointercancel",function(){sx=null});
  document.addEventListener("visibilitychange",function(){if(document.hidden)clearTimeout(timer);else start()});
  return {show:setVisible,update:update};
})();

/* ===== store pieces ===== */
function count(cat){return liveProducts().filter(function(p){return p.cat===cat}).length}
function cartCount(){return S.cart.reduce(function(n,i){return n+i.qty},0)}
function cartLines(){return S.cart.filter(function(i){return byId(i.id)})}
function subtotal(){return cartLines().reduce(function(n,i){return n+byId(i.id).price*i.qty},0)}
function shipFee(sub){
  if(S.ship==="pickup")return 0;
  var f=Number(S.site.deliveryFee)||0,free=Number(S.site.freeAbove)||0;
  return free>0&&sub>=free?0:f;
}
function collection(cat){
  var list=liveProducts();
  if(cat==="new")list=list.filter(function(p){return (p.tags||[]).indexOf("new")>-1});
  else if(cat==="best")list=list.filter(function(p){return (p.tags||[]).indexOf("best")>-1});
  else if(cat==="wishlist")list=list.filter(function(p){return S.wish.indexOf(p.id)>-1});
  else if(cat!=="all")list=list.filter(function(p){return p.cat===cat});
  var q=S.q.trim().toLowerCase();
  if(q)list=list.filter(function(p){return (p.name+" "+(CATBY[p.cat]?CATBY[p.cat].name:"")).toLowerCase().indexOf(q)>-1});
  list=list.slice();
  if(S.sort==="low")list.sort(function(a,b){return a.price-b.price});
  if(S.sort==="high")list.sort(function(a,b){return b.price-a.price});
  if(S.sort==="name")list.sort(function(a,b){return a.name.localeCompare(b.name)});
  return list;
}
var TITLES={all:"Full catalogue",new:"New arrivals",best:"Best sellers",wishlist:"Your wishlist"};

function header(r){
  var onCat=r.v==="catalogue";
  var links=CATS.map(function(c){return '<a href="#catalogue-'+c.id+'">'+cico(c.id)+c.name+'<small>'+count(c.id)+'</small></a>'}).join("");
  return '<header class="hdr"><div class="wrap">'+
    '<div class="hdr-row"><button class="ibtn" data-act="menu-open" aria-label="Open menu">'+IC.menu+'</button>'+
    '<a class="logo" href="#home" aria-label="WEAR ME home">WEAR ME<i></i></a><span class="grow"></span>'+
    '<button class="ibtn" data-act="acct" aria-label="'+(S.acct?"My account":"Login or sign up")+'">'+IC.user+'</button>'+
    '<button class="ibtn" data-act="cart-open" aria-label="Open cart">'+IC.cart+(cartCount()?'<span class="badge-n">'+cartCount()+'</span>':'')+'</button></div>'+
    '<form class="search" data-form="search" role="search">'+IC.search+
    '<label class="sr" for="q">Search products</label><input id="q" type="search" placeholder="Search senators, suits, shoes…" value="'+esc(S.q)+'" autocomplete="off"></form>'+
    '<nav class="nav" aria-label="Main"><a href="#home" class="'+(r.v==="home"?"on":"")+'">Home</a>'+
    '<div class="ddwrap"><button data-act="dd" aria-expanded="'+S.ddOpen+'" class="'+(onCat?"on":"")+'">Catalogue '+IC.chev+'</button>'+
    (S.ddOpen?'<div class="dd" role="menu">'+links+'<a class="all" href="#catalogue">View full catalogue '+IC.arrow+'</a></div>':'')+'</div>'+
    '<a href="#catalogue-new" class="'+(onCat&&r.cat==="new"?"on":"")+'">New arrivals</a>'+
    '<a href="#catalogue-best" class="'+(onCat&&r.cat==="best"?"on":"")+'">Best sellers</a>'+
    '<a href="#sew-with-us" class="gold'+(r.v==="sew"?" on":"")+'">Sew with us</a></nav>'+
    '</div></header>';
}
function card(p){
  var wished=S.wish.indexOf(p.id)>-1,tags=p.tags||[];
  var tag=p.soldOut?'<span class="tag">Sold out</span>':(tags.indexOf("new")>-1?'<span class="tag gold">New</span>':(tags.indexOf("best")>-1?'<span class="tag">Best seller</span>':''));
  return '<article class="card"><div class="thumb"><button class="pic" data-act="quick" data-id="'+p.id+'" aria-label="View '+esc(p.name)+'">'+pic(p)+'</button>'+tag+'</div>'+
    '<div class="cat">'+esc(CATBY[p.cat]?CATBY[p.cat].name:"")+'</div>'+
    '<h3><button data-act="quick" data-id="'+p.id+'">'+esc(p.name)+'</button></h3>'+
    '<div class="price">'+NGN(p.price)+'</div>'+
    '<button class="btn btn-line" data-act="quick" data-id="'+p.id+'"'+(p.soldOut?" disabled":"")+'>'+(p.soldOut?"Sold out":"Choose size")+'</button></article>';
}
function footer(){
  var s=S.site,cl=contactLines();
  return '<footer class="foot"><div class="wrap"><nav aria-label="Footer">'+
    '<a href="'+esc(waLink(siteWa(),"Hello WEAR ME"))+'" target="_blank" rel="noopener">Chat with us</a><a href="#sew-with-us">Sew with us</a><a href="#contact-us">Contact us</a>'+
    '<a href="#legal-terms">Terms &amp; conditions</a><a href="#legal-privacy">Privacy notice</a><a href="#legal-cookies">Cookie notice</a><a href="#size-guide">Size guide</a><a href="#legal-returns">Return policy</a><a href="#legal-refunds">Returns &amp; refund timeline</a>'+
    '</nav><hr><h4>Contact us</h4><dl>'+
    '<div><dt>Business name</dt><dd>'+esc(s.businessName)+'</dd></div>'+
    '<div><dt>Address</dt><dd>'+esc(s.address)+'</dd></div>'+
    '<div><dt>Phone number</dt><dd>'+esc(s.phone)+'</dd></div>'+
    '<div><dt>Chat with us</dt><dd>'+esc(prettyNum(siteWa()))+'</dd></div>'+
    cl.filter(function(c){return c.num}).map(function(c){return '<div><dt>'+esc(c.label)+'</dt><dd>'+esc(c.num)+'</dd></div>'}).join("")+'</dl>'+
    socialsHTML("socials")+'<hr><p class="rights">All Rights Reserved</p></div></footer>';
}

/* ===== store pages ===== */
function pageWelcome(){
  var L=liveProducts(),sample=[L[1]||DEFAULTS[1],L[5]||DEFAULTS[5],L[19]||DEFAULTS[19]];
  return '<section class="welcome"><div class="wrap"><span class="eyebrow">Men’s wear</span><div class="mark">WEAR ME</div>'+
    '<p>Senators and suits, cut to fit the man who walks in and gets noticed.</p>'+
    '<div class="tiles">'+sample.map(function(p){return '<div>'+art(p)+'</div>'}).join("")+'</div>'+
    '<a class="btn btn-gold" href="#home">Enter the store '+IC.arrow+'</a></div></section>';
}
function pageHome(){
  var tabs=[["top","Top picks"],["best","Best sellers"],["new","New arrivals"]];
  var list=liveProducts().filter(function(p){return (p.tags||[]).indexOf(S.tab)>-1}).slice(0,8);
  var L=liveProducts(),hero=[L[0]||DEFAULTS[0],L[5]||DEFAULTS[5],L[10]||DEFAULTS[10]];
  return '<section class="hero"><div class="wrap"><div style="display:grid;gap:14px;justify-items:start">'+
    '<span class="eyebrow">New season</span><h1>Senators and suits, cut to fit.</h1>'+
    '<p>Tailored menswear for weddings, boardrooms and every Sunday in between.</p></div>'+
    '<div class="art four">'+[0,1,2,3].map(function(i){var id=(S.site.models||[])[i],p=hero[i%3];return '<div>'+(id?'<img src="'+BLOB+esc(id)+'" alt="Model '+(i+1)+'" loading="lazy" draggable="false">':art(L[(i*4+1)%Math.max(L.length,1)]||p))+'</div>'}).join("")+'</div></div></section>'+
    '<div class="wrap"><section class="block"><div class="block-head"><h2>Picked for you</h2><div class="tabs" role="group" aria-label="Collections">'+
    tabs.map(function(t){return '<button data-act="tab" data-v="'+t[0]+'" aria-pressed="'+(S.tab===t[0])+'">'+t[1]+'</button>'}).join("")+'</div></div>'+
    (list.length?'<div class="grid">'+list.map(card).join("")+'</div>':'<div class="noresult">Nothing here yet.</div>')+'</section></div>'+
    '<div class="strip"><div class="wrap">'+
    '<div><b>Delivery to your door</b><span>Fee shown at checkout</span></div>'+
    '<div><b>Made-to-measure</b><span>Use Sew with us</span></div>'+
    '<div><b>Track your order</b><span>See it from our warehouse to you</span></div>'+
    '<div><b>Pay your way</b><span>Bank transfer or card</span></div></div></div>';
}
function pageCatalogue(r){
  var cat=r.cat,list=collection(cat);
  var title=TITLES[cat]||(CATBY[cat]?CATBY[cat].name:"Full catalogue");
  var chip=function(id,label,n,href){return '<a href="'+href+'" class="'+(cat===id?"on":"")+'">'+label+' <small>'+n+'</small></a>'};
  var chips=chip("all","All",liveProducts().length,"#catalogue")+CATS.map(function(c){return chip(c.id,c.name,count(c.id),"#catalogue-"+c.id)}).join("");
  return '<div class="wrap"><div class="page-title"><h1>'+esc(title)+'</h1><p>'+(CATBY[cat]?esc(DESC[cat]):"Browse everything WEAR ME makes, separated by type.")+'</p></div>'+
    '<div class="chips" aria-label="Filter by type">'+chips+'</div>'+
    '<div class="bar"><span class="count" aria-live="polite">'+list.length+' item'+(list.length===1?"":"s")+(S.q?' for “'+esc(S.q)+'” <button class="link" data-act="clear-q">Clear</button>':'')+'</span>'+
    '<label class="sr" for="sort">Sort by</label><select id="sort" data-chg="sort">'+
    [["featured","Featured"],["low","Price: low to high"],["high","Price: high to low"],["name","Name A–Z"]].map(function(o){return '<option value="'+o[0]+'"'+(S.sort===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select></div>'+
    (list.length?'<div class="grid">'+list.map(card).join("")+'</div>':'<div class="noresult"><p>Nothing matches yet.</p><button class="btn btn-primary" data-act="clear-q">See full catalogue</button></div>')+'</div>';
}
function summaryHTML(){
  var sub=subtotal(),fee=shipFee(sub);
  return cartLines().map(function(i){var p=byId(i.id);
    return '<div class="sum-item"><div class="thumb-s">'+pic(p)+'</div><div><b>'+esc(p.name)+'</b><small>Size '+esc(i.size)+' · Qty '+i.qty+'</small></div><span>'+NGN(p.price*i.qty)+'</span></div>'}).join("")+
    '<div class="row"><span>Subtotal</span><span>'+NGN(sub)+'</span></div>'+
    '<div class="row"><span>Delivery</span><span>'+(fee?NGN(fee):"Free")+'</span></div>'+
    '<div class="row total"><span>Total</span><span>'+NGN(sub+fee)+'</span></div>';
}
function pageCheckout(){
  if(!cartLines().length)return '<div class="wrap"><div class="empty" style="padding:72px 0"><p>Your cart is empty.</p><a class="btn btn-primary" href="#catalogue">Browse the catalogue</a></div></div>';
  var sub=subtotal(),f=Number(S.site.deliveryFee)||0,free=Number(S.site.freeAbove)||0;
  var homeAmt=(free>0&&sub>=free)||f===0?"Free":NGN(f);
  var opt=function(v,t,d,amt){return '<label class="opt"><input type="radio" name="ship" value="'+v+'"'+(S.ship===v?" checked":"")+'><div><b>'+t+'</b><span>'+d+'</span></div><span class="amt">'+amt+'</span></label>'};
  var pay=function(v,t,d,c){return '<label class="opt"><input type="radio" name="pay" value="'+v+'"'+(c?" checked":"")+'><div><b>'+t+'</b><span>'+d+'</span></div></label>'};
  return '<div class="wrap"><div class="page-title"><h1>Checkout</h1></div>'+
    '<form class="co" id="coform" novalidate><div style="display:grid;gap:18px;min-width:0">'+
    '<div class="panel"><h2>Your details</h2><div class="two">'+
    '<div class="fld"><label for="f-name">Full name</label><input id="f-name" name="name" autocomplete="name" required value="'+esc(S.acct?S.acct.name:"")+'"></div>'+
    '<div class="fld"><label for="f-phone">Phone number</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="0801 234 5678" required value="'+esc(S.acct?S.acct.phone:"")+'"></div></div>'+
    '<div class="fld"><label for="f-email">Email address</label><input id="f-email" name="email" type="email" autocomplete="email" required value="'+esc(S.acct?S.acct.email:"")+'"><small>We use this to show your order in My orders.'+(S.acct?'':' <button type="button" class="link" data-act="auth-open" data-v="login">Log in</button> to fill this in.')+'</small></div>'+
    '<div class="fld"><label for="f-addr">Delivery address</label><input id="f-addr" name="addr" autocomplete="street-address" required></div>'+
    '<div class="two"><div class="fld"><label for="f-city">City / area</label><input id="f-city" name="city" required></div>'+
    '<div class="fld"><label for="f-state">State</label><input id="f-state" name="state" required></div></div>'+
    '<div class="fld"><label for="f-note">Notes or measurements (optional)</label><textarea id="f-note" name="note" placeholder="Tell us about colour, fit or measurements"></textarea></div></div>'+
    '<div class="panel"><h2>Delivery</h2>'+opt("home","Home delivery","Delivered to the address above",homeAmt)+opt("pickup","Store pickup","Collect from our shop","Free")+'</div>'+
    '<div class="panel" id="paypanel">'+payPanelHTML()+'</div></div>'+
    '<aside class="panel"><h2>Order summary</h2><div id="sum" style="display:grid;gap:12px">'+summaryHTML()+'</div>'+
    '<div class="note-err" id="coerr" role="alert"></div>'+
    '<button class="btn btn-gold btn-block'+(payComplete()?'':' is-off')+'" type="submit" id="cobtn"'+(payComplete()?'':' disabled')+'>Place order</button><div class="meta" id="cohelp" style="text-align:center">'+(payComplete()?'':'Complete your payment above to place your order.')+'</div>'+
    '<a class="link" href="#catalogue" style="text-align:center">Continue shopping</a></aside></form></div>';
}
function pageThanks(){
  var o=S.last;
  if(!o)return '<div class="wrap"><div class="thanks"><h1>No order yet</h1><a class="btn btn-primary" href="#catalogue">Browse the catalogue</a></div></div>';
  return '<div class="wrap"><div class="thanks"><div class="tick">'+IC.tick+'</div><h1>Thank you, '+esc(String(o.name).split(" ")[0])+'!</h1>'+
    '<p>Your order has been received. We will call you on '+esc(o.phone)+' to confirm delivery and any measurements.</p>'+
    '<div class="oid">'+esc(o.id)+'</div><p>'+o.items+' item'+(o.items===1?"":"s")+' · Total '+NGN(o.total)+'</p>'+
    '<p>'+(o.pay==="transfer"?"We have your payment screenshot and will confirm it shortly.":"Your card was verified.")+'</p>'+
    (S.acct?'<a class="btn btn-gold" href="#my-orders">Track this order</a>':'<p>Log in with <b>'+esc(o.email)+'</b> to track this order.</p>')+
    '<a class="btn btn-primary" href="#home">Continue shopping</a>'+
    (o.local?'<p class="proto">Prototype note: this order is saved on this device only because the shared database was not reachable. It will not show in the admin dashboard.</p>':'')+'</div></div>';
}
function sewThumbs(){
  return S.sew.imgs.map(function(im,i){return '<div class="thumb-s" style="position:relative"><img src="'+esc(im.url)+'" alt="Inspiration '+(i+1)+'"><button data-act="sew-rm" data-i="'+i+'" aria-label="Remove image" style="position:absolute;top:2px;right:2px;background:var(--surface);border-radius:50%;width:24px;height:24px;display:grid;place-items:center"><svg class="ico" style="width:14px;height:14px" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'}).join("");
}
function pageSew(){
  var d=S.sew.done;
  if(d){
    return '<div class="wrap"><div class="thanks"><div class="tick">'+IC.tick+'</div><h1>Request saved</h1>'+
      '<svg class="stitch" viewBox="0 0 320 24" aria-hidden="true"><path d="M4 12 H316" stroke="var(--accent)" stroke-width="3" fill="none" stroke-linecap="round"/></svg>'+
      '<p>Thanks, '+esc(String(d.name).split(" ")[0])+'. Your request <b>'+esc(d.id)+'</b> is with us. An agent will send payment details and next steps on WhatsApp.</p>'+
      '<a class="btn wa" href="'+esc(d.url)+'" target="_blank" rel="noopener">Continue to WhatsApp '+IC.arrow+'</a>'+
      '<p>If WhatsApp did not open, tap the button. You can also message 0904 843 1819 directly.</p>'+
      (d.local?'<p class="proto">Prototype note: saved on this device only because the shared database was not reachable.</p>':'')+
      '<a class="link" href="#home">Back to the store</a></div></div>';
  }
  var gar=["Senator","Suit","Agbada / Native","Shirt","Trousers","Cap","Something else"];
  return '<div class="wrap"><form class="sew" id="sewform" novalidate>'+
    '<div class="page-title"><span class="eyebrow">Made-to-measure</span><h1>Sew with us</h1><p>Tell us what you want made. We save your request, then an agent continues with you on WhatsApp for measurements and payment.</p></div>'+
    '<div class="panel"><div class="two"><div class="fld"><label for="s-name">Full name</label><input id="s-name" name="name" autocomplete="name" required></div>'+
    '<div class="fld"><label for="s-phone">Phone number</label><input id="s-phone" name="phone" type="tel" autocomplete="tel" placeholder="0801 234 5678" required></div></div>'+
    '<div class="two"><div class="fld"><label for="s-loc">Your location</label><input id="s-loc" name="location" placeholder="City and state" required></div>'+
    '<div class="fld"><label for="s-gar">What should we sew?</label><select id="s-gar" name="garment">'+gar.map(function(g){return '<option>'+g+'</option>'}).join("")+'</select></div></div></div>'+
    '<div class="panel"><h3>Inspiration</h3>'+
    (cloud.assets?'<div class="upl"><div id="sewthumbs" class="upl">'+sewThumbs()+'</div><label class="btn btn-line btn-sm" for="s-file">Add pictures</label><input id="s-file" type="file" accept="image/*" multiple class="sr"></div>':'')+
    '<div class="fld"><label for="s-link">Link to a picture or post (optional)</label><input id="s-link" name="link" type="url" placeholder="https://"></div></div>'+
    '<div class="panel"><div class="fld"><label for="s-notes">Details</label><textarea id="s-notes" name="notes" placeholder="Fabric, colour, fit, measurements, date you need it by"></textarea></div>'+
    '<div class="note-err" id="sewerr" role="alert">'+esc(S.sew.err)+'</div>'+
    '<button class="btn btn-gold btn-block" type="submit" id="sewbtn">Sew</button></div></form></div>';
}

/* ===== layers (menu, cart, quick view) ===== */
function menuHTML(){
  return '<div class="scrim" data-act="close-layers"></div><aside class="drawer left" role="dialog" aria-label="Menu">'+
    '<div class="drawer-head"><a class="logo" href="#home">WEAR ME<i></i></a><button class="ibtn" data-act="close-layers" aria-label="Close menu">'+IC.x+'</button></div>'+
    '<div class="drawer-body"><a class="mrow hl" href="#sew-with-us">'+IC.needle+'Sew with us</a>'+
    '<div class="sect"><span>My WEAR ME account</span></div>'+
    (S.acct?'<div class="acctcard"><b>Hi, '+esc(String(S.acct.name).split(" ")[0])+'</b><span>'+esc(S.acct.email)+'</span></div>':'<button class="mrow" data-act="auth-open" data-v="login">'+IC.user+'Login / Sign up</button>')+
    '<a class="mrow" href="#my-orders">'+IC.box+'My orders</a>'+
    '<button class="mrow" data-act="soon" data-t="Inbox">'+IC.mail+'Inbox</button>'+
    (S.acct?'<button class="mrow" data-act="logout">'+IC.x+'Sign out</button>':'')+
    '<div class="sect"><span>Our catalogue</span><a href="#catalogue">See all</a></div>'+
    CATS.map(function(c){return '<a class="mrow" href="#catalogue-'+c.id+'">'+cico(c.id)+c.name+'<small>'+count(c.id)+'</small></a>'}).join("")+
    '<div class="sect"><span>Collections</span></div>'+
    '<a class="mrow" href="#catalogue-new">'+IC.star+'New arrivals</a><a class="mrow" href="#catalogue-best">'+IC.star+'Best sellers</a></div></aside>';
}
function cartHTML(){
  var lines=cartLines(),body;
  if(!lines.length)body='<div class="empty"><svg viewBox="0 0 100 120"><use href="#g-suit" style="color:currentColor"/></svg><p>Your cart is empty.</p><button class="btn btn-primary" data-act="close-go" data-to="catalogue">Browse the catalogue</button></div>';
  else body=lines.map(function(i){var p=byId(i.id),idx=S.cart.indexOf(i);
    return '<div class="cart-line"><div class="thumb-s">'+pic(p)+'</div><div style="display:grid;gap:6px;min-width:0"><h4>'+esc(p.name)+'</h4><div class="sub">Size '+esc(i.size)+'</div>'+
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="qty"><button data-act="dec" data-i="'+idx+'" aria-label="Decrease quantity">−</button><span>'+i.qty+'</span><button data-act="inc" data-i="'+idx+'" aria-label="Increase quantity">+</button></div><b>'+NGN(p.price*i.qty)+'</b></div>'+
      '<button class="link" style="justify-self:start" data-act="rm" data-i="'+idx+'">Remove</button></div></div>'}).join("");
  var sub=subtotal(),free=Number(S.site.freeAbove)||0;
  return '<div class="scrim" data-act="close-layers"></div><aside class="drawer right" role="dialog" aria-label="Cart">'+
    '<div class="drawer-head"><strong style="font-size:17px">Your cart ('+cartCount()+')</strong><button class="ibtn" data-act="close-layers" aria-label="Close cart">'+IC.x+'</button></div>'+
    '<div class="drawer-body">'+body+'</div>'+
    (lines.length?'<div class="cart-foot"><div class="row total"><span>Subtotal</span><span>'+NGN(sub)+'</span></div>'+
      (free>0?'<span style="font-size:13px;color:var(--muted)">'+(sub>=free?"You get free delivery.":"Add "+NGN(free-sub)+" more for free delivery.")+'</span>':'')+
      '<button class="btn btn-gold btn-block" data-act="close-go" data-to="checkout">Checkout</button></div>':'')+'</aside>';
}
function quickHTML(){
  var q=S.qv;if(!q)return "";
  var p=byId(q.id);if(!p)return "";
  return '<div class="scrim" data-act="close-layers"></div><div class="modal" data-act="close-layers"><div class="sheet" role="dialog" aria-label="'+esc(p.name)+'">'+
    '<button class="x" data-act="close-layers" aria-label="Close">'+IC.x+'</button><div class="pic">'+pic(p)+'</div><div class="info">'+
    '<span class="eyebrow">'+esc(CATBY[p.cat]?CATBY[p.cat].name:"")+'</span><h2 style="font-family:var(--display);font-size:30px;line-height:1.05">'+esc(p.name)+'</h2>'+
    '<div class="price">'+NGN(p.price)+'</div><p style="margin:0;color:var(--muted)">'+esc(descOf(p))+'</p>'+
    '<div><div style="font-size:13px;font-weight:700;margin-bottom:8px">Size</div><div class="sizes" role="group" aria-label="Size">'+
    sizesOf(p).map(function(s){return '<button data-act="size" data-v="'+esc(s)+'" aria-pressed="'+(q.size===s)+'">'+esc(s)+'</button>'}).join("")+'</div></div>'+
    (guideFor(p)?'<div><button class="link" data-act="guide" aria-expanded="'+!!q.guide+'">'+(q.guide?"Hide size guide":"Size guide")+'</button>'+(q.guide?'<div class="guidebox">'+guideHTML(guideFor(p))+'</div>':'')+'</div>':'')+
    '<div class="note-err" role="alert">'+(q.err?"Choose a size first.":"")+'</div>'+
    '<div style="display:flex;gap:10px;align-items:center"><div class="qty"><button data-act="qv-dec" aria-label="Decrease quantity">−</button><span>'+q.qty+'</span><button data-act="qv-inc" aria-label="Increase quantity">+</button></div>'+
    '<button class="btn btn-gold" style="flex:1" data-act="qadd"'+(p.soldOut?" disabled":"")+'>'+(p.soldOut?"Sold out":"Add to cart")+'</button></div></div></div></div>';
}
function layers(){
  if(route().v==="admin"){return}
  var h="";
  if(S.auth.open)h=authHTML();else if(S.menu)h=menuHTML();else if(S.cartOpen)h=cartHTML();else if(S.qv)h=quickHTML();
  $("#layers").innerHTML=h;document.body.classList.toggle("lock",!!h);
}

/* ===== render ===== */
function render(){
  var r=route();
  Banner.show(r.v!=="welcome"&&r.v!=="admin");
  if(r.v==="admin"){document.body.classList.remove("lock");renderAdmin(r);return}
  var h="";
  if(r.v==="welcome")h=pageWelcome();
  else h=header(r)+"<main>"+(r.v==="home"?pageHome():r.v==="catalogue"?pageCatalogue(r):r.v==="checkout"?pageCheckout():r.v==="sew"?pageSew():r.v==="orders"?pageOrders():r.v==="info"?pageInfo(r):pageThanks())+"</main>"+footer();
  var keep=document.activeElement&&document.activeElement.id==="q";
  $("#root").innerHTML=h;
  if(keep){var el=$("#q");if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}}
  var ddb=$(".ddwrap>button"),ddp=$(".dd");if(ddb&&ddp){var rc=ddb.getBoundingClientRect();ddp.style.top=(rc.bottom+4)+"px";ddp.style.left=Math.max(8,rc.left)+"px";ddp.style.right="auto"}
  layers();
}

/* ===== store actions ===== */
function addToCart(id,size,qty){
  var f=S.cart.filter(function(i){return String(i.id)===String(id)&&i.size===size})[0];
  if(f)f.qty+=qty;else S.cart.push({id:id,size:size,qty:qty});
  save();
}
async function saveOrder(order){
  if(cloud.db){var ok=await dbWrite(function(){return cloud.db.doc("orders/"+order.id).set(order)});if(ok)return true}
  var a=store.get("wm_local_orders",[]);a.push(order);store.set("wm_local_orders",a);return false;
}
async function submitCheckout(f){
  if(!payComplete()){$("#coerr").textContent="Complete your payment first.";return}
  if(!f.checkValidity()){f.reportValidity();$("#coerr").textContent="Please complete the highlighted details.";return}
  $("#coerr").textContent="";
  var btn=$("#cobtn");btn.disabled=true;btn.textContent="Placing order…";
  var d=new FormData(f),lines=cartLines(),sub=subtotal(),fee=shipFee(sub);
  var order={
    id:rid("WM"),name:String(d.get("name")).trim(),phone:String(d.get("phone")).trim(),email:String(d.get("email")||"").trim().toLowerCase(),
    addr:String(d.get("addr")),city:String(d.get("city")),state:String(d.get("state")),note:String(d.get("note")||""),
    ship:S.ship,pay:S.pay.method,status:"New",statusAt:{New:new Date().toISOString()},trackNote:"",
    payStatus:S.pay.method==="transfer"?"Proof sent":"Unpaid",proof:S.pay.method==="transfer"?S.pay.proof:"",
    card:S.pay.method==="card"&&S.pay.card?{brand:S.pay.card.brand,last4:S.pay.card.last4,exp:S.pay.card.exp}:null,
    lines:lines.map(function(i){var p=byId(i.id);return {pid:p.id,name:p.name,cat:p.cat,size:i.size,qty:i.qty,price:p.price}}),
    items:lines.reduce(function(n,i){return n+i.qty},0),subtotal:sub,fee:fee,total:sub+fee,createdAt:new Date().toISOString()
  };
  var ok=await saveOrder(order);
  S.last=Object.assign({},order,{local:!ok,proof:""});S.cart=[];S.pay=freshPay();if(S.acct)startMyOrders();store.set("wm_last",S.last);save();
  go("thank-you");
}
async function submitSew(f){
  if(S.sew.busy)return;
  if(!f.checkValidity()){f.reportValidity();return}
  S.sew.busy=true;var btn=$("#sewbtn");btn.disabled=true;btn.textContent="Stitching…";
  var d=new FormData(f);
  var req={
    id:rid("SW"),name:String(d.get("name")).trim(),phone:String(d.get("phone")).trim(),location:String(d.get("location")).trim(),
    garment:String(d.get("garment")),link:String(d.get("link")||""),notes:String(d.get("notes")||""),
    images:S.sew.imgs.map(function(i){return i.id}),status:"New",quote:0,paid:false,createdAt:new Date().toISOString()
  };
  var ok=false;
  if(cloud.db)ok=await dbWrite(function(){return cloud.db.doc("styling/"+req.id).set(req)});
  if(!ok){var a=store.get("wm_local_styling",[]);a.push(req);store.set("wm_local_styling",a)}
  var msg="Hello WEAR ME, I'm "+req.name+". I just sent a sewing request ("+req.id+") for "+req.garment+" in "+req.location+". Please send me the payment details.";
  var url=waLink(siteWa(),msg);
  S.sew.done={id:req.id,name:req.name,url:url,local:!ok};S.sew.imgs=[];S.sew.busy=false;
  var w=null;try{w=window.open(url,"_blank","noopener")}catch(e){}
  render();window.scrollTo(0,0);
}
async function sewFiles(files){
  if(!cloud.assets)return;
  var err=$("#sewerr");
  for(var i=0;i<files.length&&S.sew.imgs.length<4;i++){
    var f=files[i];
    try{var r=await cloud.assets.upload(f);S.sew.imgs.push({id:r.id,url:r.url})}
    catch(e){if(err)err.textContent="One picture could not be uploaded. Try a smaller JPG or PNG."}
  }
  var t=$("#sewthumbs");if(t)t.innerHTML=sewThumbs();
}

/* ----- p3b ----- */
/* ===== accounts, payment gating, my orders ===== */
S.acct=store.get("wm_session",null);
S.auth={open:false,mode:"login",step:"choose",err:"",info:""};
S.myOrders=null;
function freshPay(){return {method:"",proof:"",transferDone:false,cardStep:"form",card:null,cardErr:"",codeErr:"",proofErr:"",showForm:false}}
S.pay=freshPay();

/* ---- accounts (prototype: kept in this browser only) ---- */
async function hashPw(email,pw){
  try{var d=new TextEncoder().encode("wm:"+email+":"+pw),h=await crypto.subtle.digest("SHA-256",d);return Array.prototype.map.call(new Uint8Array(h),function(b){return ("0"+b.toString(16)).slice(-2)}).join("")}
  catch(e){return "p:"+btoa(unescape(encodeURIComponent(pw)))}
}
function accounts(){return store.get("wm_accounts",[])}
function signIn(a){
  S.acct={name:a.name,email:a.email,phone:a.phone||""};store.set("wm_session",S.acct);
  S.auth={open:false,mode:"login",step:"choose",err:"",info:""};S.menu=false;
  startMyOrders();toast("Welcome, "+String(a.name).split(" ")[0]);render();
}
function signOut(){
  S.acct=null;store.set("wm_session",null);S.myOrders=null;S.menu=false;S.pay=freshPay();stopMyOrders();toast("Signed out");render();
}
async function doSignup(f){
  var d=new FormData(f),name=String(d.get("name")).trim(),email=String(d.get("email")).trim().toLowerCase(),phone=String(d.get("phone")||"").trim(),pw=String(d.get("password"));
  if(!name||!/^\S+@\S+\.\S+$/.test(email)){S.auth.err="Enter your name and a valid email address.";layers();return}
  if(pw.length<8){S.auth.err="Use at least 8 characters for your password.";layers();return}
  var list=accounts();
  if(list.some(function(a){return a.email===email})){S.auth.err="That email already has an account. Log in instead.";layers();return}
  list.push({name:name,email:email,phone:phone,hash:await hashPw(email,pw)});store.set("wm_accounts",list);
  signIn({name:name,email:email,phone:phone});
}
async function doLogin(f){
  var d=new FormData(f),email=String(d.get("email")).trim().toLowerCase(),pw=String(d.get("password"));
  var a=accounts().filter(function(x){return x.email===email})[0];
  if(!a||a.hash!==await hashPw(email,pw)){S.auth.err="That email and password do not match. Check them or sign up.";layers();return}
  signIn(a);
}

/* ---- my orders ---- */
var myUnsub=null;
function stopMyOrders(){if(myUnsub){try{myUnsub()}catch(e){}myUnsub=null}}
function startMyOrders(){
  stopMyOrders();if(!S.acct)return;
  var em=S.acct.email;
  var local=store.get("wm_local_orders",[]).filter(function(o){return String(o.email||"").toLowerCase()===em});
  S.myOrders=local;
  if(!cloud.db)return;
  try{
    myUnsub=cloud.db.collection("orders").where("email","==",em).onSnapshot(function(s){
      S.myOrders=s.docs.map(function(d){return d.data()}).concat(local);
      if(route().v==="orders")rerenderKeepScroll();
    },function(){});
  }catch(e){}
}
var STEPS=[["New","Order placed"],["Confirmed","Order confirmed"],["Packed","Packed at our warehouse"],["Shipped","On its way to you"],["Delivered","Delivered"]];
function trackHTML(o){
  if(o.status==="Cancelled")return '<p class="cancelled"><b>Order cancelled.</b> Message us on WhatsApp if you have questions.</p>';
  var idx=0;STEPS.forEach(function(s,i){if(s[0]===o.status)idx=i});
  return '<ol class="track">'+STEPS.map(function(s,i){
    var lab=s[1];if(i===3&&o.ship==="pickup")lab="Ready for pickup";
    var at=o.statusAt&&o.statusAt[s[0]];
    return '<li class="'+(i<idx?"done":i===idx?"now":"")+'"><span class="dot"></span><div><b>'+lab+'</b>'+(at&&i<=idx?'<small>'+fmtDate(at)+'</small>':'')+'</div></li>'}).join("")+'</ol>'+
    (o.trackNote?'<p class="tnote"><b>Latest update:</b> '+esc(o.trackNote)+'</p>':'');
}
function refundBlock(o){
  var rf=o.refund;
  if(rf){
    var msg={Requested:"We are checking your report.",Confirmed:"Issue confirmed. Your refund is being approved.",Approved:"Refund approved"+(rf.amount?" for "+NGN(rf.amount):"")+".",Declined:"We could not approve this report."+(rf.declineReason?" "+rf.declineReason:"")}[rf.status]||"";
    return '<div class="refbox"><b>Problem reported: '+esc(rf.reason)+'</b><span>'+esc(msg)+'</span></div>';
  }
  if(o.status==="Cancelled"||o.payStatus==="Unpaid")return "";
  if(S.reportId===o.id)return '<form class="refund" data-id="'+esc(o.id)+'" id="refundform" novalidate><div class="fld"><label for="rf-r">What went wrong?</label><select id="rf-r" name="reason">'+ISSUE_REASONS.map(function(r){return '<option>'+esc(r)+'</option>'}).join("")+'</select></div><div class="fld"><label for="rf-n">Tell us more</label><textarea id="rf-n" name="note" rows="3"></textarea></div><div class="inline"><button class="btn btn-gold btn-sm" type="submit">Send report</button><button class="btn btn-line btn-sm" type="button" data-act="report-close">Cancel</button></div></form>';
  return '<button class="link" data-act="report-open" data-id="'+esc(o.id)+'">Report a problem</button>';
}
function pageOrders(){
  if(!S.acct)return '<div class="wrap"><div class="page-title"><h1>My orders</h1><p>Log in to see your orders and follow each one from our warehouse to your door.</p></div><button class="btn btn-primary" data-act="auth-open" data-v="login">Login / Sign up</button></div>';
  var list=(S.myOrders||[]).slice().sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt)});
  return '<div class="wrap"><div class="page-title"><h1>My orders</h1><p>Signed in as '+esc(S.acct.email)+'.</p></div>'+
    (S.myOrders===null?'<p class="meta">Loading…</p>':list.length?list.map(function(o){
      return '<article class="ord"><div class="ord-head"><div><b>'+esc(o.id)+'</b><span class="meta">'+fmtDate(o.createdAt)+'</span></div><span class="pill">'+NGN(o.total)+'</span></div>'+
        trackHTML(o)+
        '<div class="ord-items">'+(o.lines||[]).map(function(l){return '<div class="row"><span>'+esc(l.name)+' <span class="meta">Size '+esc(l.size)+' × '+l.qty+'</span></span><span>'+NGN(l.price*l.qty)+'</span></div>'}).join("")+'</div>'+
        refundBlock(o)+
        '<p class="meta">Payment: '+(o.pay==="card"?"Card"+(o.card?" ending "+esc(o.card.last4):""):"Bank transfer")+' · '+esc(o.payStatus||"Unpaid")+'</p></article>'}).join(""):
      '<div class="empty" style="padding:48px 0"><p>No orders yet.</p><a class="btn btn-primary" href="#catalogue">Browse the catalogue</a></div>')+'</div>';
}

/* ---- auth layer ---- */
function authHTML(){
  var a=S.auth,sign=a.mode==="signup",body;
  var google='<button type="button" class="soc" data-act="oauth" data-v="Google">Continue with Google</button>';
  var apple='<button type="button" class="soc" data-act="oauth" data-v="Apple">Continue with Apple</button>';
  var err='<div class="note-err" id="auth-err" role="alert">'+esc(a.err)+'</div>';
  var info=a.info?'<p class="authinfo">'+esc(a.info)+'</p>':'';
  var fl=function(id,label,name,type,extra){return '<div class="fld"><label for="'+id+'">'+label+'</label><input id="'+id+'" name="'+name+'" type="'+type+'" '+(extra||"")+'></div>'};
  if(!sign){
    body='<h2>Welcome back</h2><p class="meta">Log in to track your orders.</p>'+google+info+'<div class="or"><span>or log in with email</span></div>'+
      '<form id="loginform" novalidate class="authform">'+fl("l-email","Email address","email","email",'autocomplete="email" required')+fl("l-pw","Password","password","password",'autocomplete="current-password" required')+err+
      '<button class="btn btn-gold btn-block" type="submit">Log in</button></form>'+
      '<p class="meta" style="text-align:center">New to WEAR ME? <button class="link" data-act="auth-mode" data-v="signup">Sign up</button></p>';
  }else if(a.step==="choose"){
    body='<h2>Create your account</h2><p class="meta">Choose how you want to sign up.</p>'+google+apple+
      '<button type="button" class="soc" data-act="auth-email">Continue with email address</button>'+info+
      '<p class="meta" style="text-align:center">Already have an account? <button class="link" data-act="auth-mode" data-v="login">Log in</button></p>';
  }else{
    body='<h2>Sign up with email</h2>'+
      '<form id="signupform" novalidate class="authform">'+fl("g-name","Full name","name","text",'autocomplete="name" required')+fl("g-email","Email address","email","email",'autocomplete="email" required')+
      fl("g-phone","Phone number","phone","tel",'autocomplete="tel" placeholder="0801 234 5678"')+fl("g-pw","Password (8 or more characters)","password","password",'autocomplete="new-password" required minlength="8"')+err+
      '<button class="btn btn-gold btn-block" type="submit">Create account</button></form>'+
      '<p class="meta" style="text-align:center"><button class="link" data-act="auth-back">Back</button> · <button class="link" data-act="auth-mode" data-v="login">Log in instead</button></p>';
  }
  return '<div class="scrim" data-act="close-layers"></div><div class="modal" data-act="close-layers"><div class="sheet ed" role="dialog" aria-label="Login or sign up"><button class="x" data-act="close-layers" aria-label="Close">'+IC.x+'</button>'+
    '<div class="info authbox">'+body+'<p class="proto">Prototype: accounts are kept in this browser only. Google and Apple sign-in need a real sign-in service and arrive with the full build.</p></div></div></div>';
}

/* ---- payment ---- */
function brandOf(num){
  var n=String(num).replace(/\D/g,""),p6=+n.slice(0,6);
  if(n.length>=6&&((p6>=506099&&p6<=506198)||(p6>=650002&&p6<=650027)||(p6>=507865&&p6<=507964)))return "Verve";
  if(/^3[47]/.test(n))return "American Express";
  if(/^4/.test(n))return "Visa";
  if(/^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/.test(n))return "Mastercard";
  return "";
}
function luhn(n){var s=0,alt=false;for(var i=n.length-1;i>=0;i--){var d=+n.charAt(i);if(alt){d*=2;if(d>9)d-=9}s+=d;alt=!alt}return n.length>0&&s%10===0}
function lenOk(b,n){var L=n.length;return b==="American Express"?L===15:b==="Verve"?(L===16||L===18||L===19):b==="Visa"?(L===13||L===16||L===19):b==="Mastercard"?L===16:false}
function fmtCard(v,brand){var d=v.replace(/\D/g,"").slice(0,19);if(brand==="American Express"){d=d.slice(0,15);return [d.slice(0,4),d.slice(4,10),d.slice(10)].filter(Boolean).join(" ")}return d.replace(/(.{4})/g,"$1 ").trim()}
function fmtExp(v){var d=v.replace(/\D/g,"").slice(0,4);return d.length>2?d.slice(0,2)+"/"+d.slice(2):d}
function expOk(v){var m=/^(\d\d)\/(\d\d)$/.exec(v);if(!m)return false;var mm=+m[1],yy=+m[2];if(mm<1||mm>12)return false;var now=new Date(),cy=now.getFullYear()%100,cm=now.getMonth()+1;return yy>cy||(yy===cy&&mm>=cm)}
function savedCard(){return S.acct?store.get("wm_card:"+S.acct.email,null):null}
function orderTotal(){var s=subtotal();return s+shipFee(s)}
function payComplete(){var p=S.pay;return (p.method==="transfer"&&p.transferDone&&!!p.proof)||(p.method==="card"&&p.cardStep==="done"&&!!p.card)}
function placeholderTag(v,d){return v===d?' <span class="tag-ph">placeholder</span>':''}
function transferHTML(){
  var s=S.site,p=S.pay;
  var h='<div class="bank"><div class="row"><span>Bank</span><b>'+esc(s.bankName)+'</b></div>'+
    '<div class="row"><span>Account number</span><span class="inl-copy"><b id="acctno">'+esc(s.accountNumber)+'</b><button type="button" class="btn btn-line btn-sm" data-act="pay-copy">Copy</button></span></div>'+
    '<div class="row"><span>Account name</span><b>'+esc(s.accountName)+'</b></div>'+
    '<div class="row total"><span>Amount to send</span><b>'+NGN(orderTotal())+'</b></div>'+
    (s.accountNumber===DEF_SITE.accountNumber?'<p class="tag-ph">Placeholder account details. Set the real ones in Admin, Settings.</p>':'')+'</div>'+
    '<a class="btn btn-gold btn-block" href="'+esc(s.payLink)+'" target="_blank" rel="noopener">Pay with OPay '+IC.arrow+'</a>'+
    '<p class="meta">Make your transfer, take a screenshot of the payment, then upload it here and tap Done.</p>';
  if(p.proof)h+='<div class="proofrow"><div class="proofprev"><img src="'+p.proof+'" alt="Payment screenshot"></div><div class="proofmeta"><b>Screenshot added</b>'+
    (p.transferDone?'<span class="okline">Payment proof sent. You can place your order.</span>':'<span class="meta">Tap Done when it looks right.</span>')+
    '<label class="link" for="proof-file" style="cursor:pointer">Change screenshot</label></div></div>';
  else h+='<label class="btn btn-line btn-block" for="proof-file" style="cursor:pointer">Upload payment screenshot</label>';
  h+='<input id="proof-file" type="file" accept="image/*" class="sr">'+(p.proofErr?'<div class="note-err">'+esc(p.proofErr)+'</div>':'');
  if(!p.transferDone)h+='<button type="button" class="btn btn-primary btn-block'+(p.proof?'':' is-off')+'" data-act="pay-done"'+(p.proof?'':' disabled')+'>Done</button>';
  return h;
}
function cardHTML(){
  var p=S.pay,sc=savedCard();
  if(p.cardStep==="done"&&p.card)return '<div class="bank"><div class="row"><span>Card</span><b>'+esc(p.card.brand)+' ending '+esc(p.card.last4)+'</b></div><p class="okline">Card verified. You can place your order.</p></div><button type="button" class="link" data-act="card-change">Use a different card</button>';
  if(p.cardStep==="code")return '<p class="meta">We sent a 6-digit code to <b>'+esc(cardPhone())+'</b>, the phone number on this order. Enter it to approve the card.</p>'+
    '<div class="fld"><label for="c-code">Code</label><input id="c-code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="123456"></div>'+
    '<p class="proto">Prototype: text messages are not connected yet. Enter 123456 to continue.</p>'+
    (p.codeErr?'<div class="note-err">'+esc(p.codeErr)+'</div>':'')+
    '<button type="button" class="btn btn-primary btn-block" data-act="card-verify">Verify code</button><button type="button" class="link" data-act="card-back">Back</button>';
  var h='<p class="meta">We take Visa, Mastercard, Verve and American Express.</p>';
  if(sc&&!p.showForm)h+='<button type="button" class="soc" data-act="card-saved">Use saved '+esc(sc.brand)+' ending '+esc(sc.last4)+'</button><button type="button" class="link" data-act="card-new">Use a different card</button>';
  else h+='<div class="fld"><label for="c-num">Card number</label><input id="c-num" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456"><small id="c-brand"></small></div>'+
    '<div class="fld"><label for="c-name">Name on card</label><input id="c-name" autocomplete="cc-name"></div>'+
    '<div class="two"><div class="fld"><label for="c-exp">Expiry (MM/YY)</label><input id="c-exp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5"></div>'+
    '<div class="fld"><label for="c-cvv">CVV</label><input id="c-cvv" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="123" type="password"></div></div>'+
    (p.cardErr?'<div class="note-err">'+esc(p.cardErr)+'</div>':'')+
    '<button type="button" class="btn btn-primary btn-block" data-act="card-save">Save card</button>'+
    '<p class="proto">Prototype: card details are checked on this device only and are never sent or stored. Real card payments go live through a payment provider in the full build.</p>';
  return h;
}
function cardPhone(){var el=$("#f-phone");return (el&&el.value.trim())||(S.acct&&S.acct.phone)||"your phone"}
function payPanelHTML(){
  var p=S.pay,tab=function(v,l){return '<button type="button" class="paytab" data-act="pay-method" data-v="'+v+'" aria-pressed="'+(p.method===v)+'">'+l+'</button>'};
  return '<h2>Payment</h2><p class="meta">Pay first, then place your order. The order button unlocks once payment is complete.</p>'+
    '<div class="paytabs" role="group" aria-label="Payment method">'+tab("transfer","Bank transfer")+tab("card","Card")+'</div>'+
    (p.method==="transfer"?transferHTML():p.method==="card"?cardHTML():'<p class="meta">Choose bank transfer or card to continue.</p>');
}
function syncOrderBtn(){
  var b=$("#cobtn"),h=$("#cohelp");if(!b)return;
  var ok=payComplete();b.disabled=!ok;b.classList.toggle("is-off",!ok);
  if(h)h.textContent=ok?"":"Complete your payment above to place your order.";
}
function refreshPay(){var el=$("#paypanel");if(el)el.innerHTML=payPanelHTML();syncOrderBtn()}
function compressImage(file){
  return new Promise(function(res,rej){
    var fr=new FileReader();fr.onerror=rej;
    fr.onload=function(){var img=new Image();img.onerror=rej;img.onload=function(){
      var sc=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*sc),h=Math.round(img.height*sc),c=document.createElement("canvas");
      c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);
      var q=.62,out=c.toDataURL("image/jpeg",q);while(out.length>170000&&q>.3){q-=.08;out=c.toDataURL("image/jpeg",q)}
      out.length>220000?rej(new Error("big")):res(out)};img.src=fr.result};
    fr.readAsDataURL(file);
  });
}

/* ---- handlers called from the main event listeners ---- */
function openAuth(mode){S.menu=false;S.cartOpen=false;S.qv=null;S.auth={open:true,mode:mode||"login",step:"choose",err:"",info:""};layers()}
function storeAct(a,g,tEl){
  if(a==="acct"){if(S.acct){S.menu=true;layers()}else openAuth("login");return true}
  if(a==="auth-open"){openAuth(g("data-v"));return true}
  if(a==="auth-mode"){S.auth.mode=g("data-v");S.auth.step="choose";S.auth.err="";S.auth.info="";layers();return true}
  if(a==="auth-email"){S.auth.step="email";S.auth.err="";layers();return true}
  if(a==="auth-back"){S.auth.step="choose";S.auth.err="";layers();return true}
  if(a==="oauth"){S.auth.info=g("data-v")+" sign-in needs a real sign-in service, which arrives with the full build. For now, continue with your email address.";layers();return true}
  if(a==="logout"){signOut();return true}
  if(a==="pay-method"){S.pay.method=g("data-v");S.pay.cardErr="";S.pay.codeErr="";refreshPay();return true}
  if(a==="pay-copy"){
    var n=S.site.accountNumber;
    try{navigator.clipboard.writeText(n).then(function(){toast("Account number copied")},function(){toast("Press and hold the number to copy it")})}catch(e){toast("Press and hold the number to copy it")}
    return true;
  }
  if(a==="pay-done"){if(S.pay.proof){S.pay.transferDone=true;refreshPay()}return true}
  if(a==="card-save"){
    var raw=($("#c-num").value||"").replace(/\D/g,""),brand=brandOf(raw),nm=$("#c-name").value.trim(),ex=$("#c-exp").value.trim(),cv=($("#c-cvv").value||"").replace(/\D/g,"");
    var err="";
    if(!brand)err="We take Visa, Mastercard, Verve and American Express. Check the card number.";
    else if(!lenOk(brand,raw)||!luhn(raw))err="That card number does not look right. Check it and try again.";
    else if(!nm)err="Enter the name on the card.";
    else if(!expOk(ex))err="Enter a valid expiry date as MM/YY.";
    else if(cv.length!==(brand==="American Express"?4:3))err="Enter the "+(brand==="American Express"?"4":"3")+"-digit security code (CVV).";
    else if(cardPhone()==="your phone"){err="Add your phone number in Your details above. We send the approval code there."}
    if(err){S.pay.cardErr=err;refreshPay();return true}
    S.pay.card={brand:brand,last4:raw.slice(-4),exp:ex,name:nm};S.pay.cardErr="";S.pay.cardStep="code";S.pay.codeErr="";
    $("#c-num").value="";$("#c-cvv").value="";refreshPay();return true;
  }
  if(a==="card-saved"){var sc=savedCard();S.pay.card=sc;S.pay.cardStep="code";S.pay.codeErr="";refreshPay();return true}
  if(a==="card-new"){S.pay.showForm=true;refreshPay();return true}
  if(a==="card-back"){S.pay.cardStep="form";S.pay.card=null;refreshPay();return true}
  if(a==="card-change"){S.pay.cardStep="form";S.pay.card=null;S.pay.showForm=true;refreshPay();return true}
  if(a==="card-verify"){
    var c=($("#c-code").value||"").trim();
    if(c!=="123456"){S.pay.codeErr="That code is not right. Check the message and try again.";refreshPay();return true}
    S.pay.cardStep="done";S.pay.codeErr="";
    if(S.acct)store.set("wm_card:"+S.acct.email,{brand:S.pay.card.brand,last4:S.pay.card.last4,exp:S.pay.card.exp,name:S.pay.card.name});
    refreshPay();return true;
  }
  return false;
}
function storeChange(el){
  if(el.id==="proof-file"){
    var f=el.files&&el.files[0];if(!f)return true;
    S.pay.proofErr="";S.pay.transferDone=false;
    compressImage(f).then(function(u){S.pay.proof=u;refreshPay()}).catch(function(){S.pay.proofErr="That picture could not be used. Upload a JPG or PNG screenshot.";refreshPay()});
    el.value="";return true;
  }
  return false;
}
function storeInput(el){
  if(el.id==="c-num"){var b=brandOf(el.value);el.value=fmtCard(el.value,b);var h=$("#c-brand");if(h)h.textContent=b?b:"";return true}
  if(el.id==="c-exp"){el.value=fmtExp(el.value);return true}
  if(el.id==="c-cvv"||el.id==="c-code"){el.value=el.value.replace(/\D/g,"");return true}
  return false;
}
function storeSubmit(f){
  if(f.id==="loginform"){doLogin(f);return true}
  if(f.id==="signupform"){doSignup(f);return true}
  if(f.id==="refundform"){
    var d=new FormData(f),id=f.getAttribute("data-id");
    dbWrite(function(){return cloud.db.doc("orders/"+id).update({refund:{status:"Requested",reason:String(d.get("reason")),note:String(d.get("note")||"").trim(),at:new Date().toISOString()}})}).then(function(ok){toast(ok?"Report sent. We will review it.":"Could not send. Try again.");S.reportId="";if(ok)render()});
    return true;
  }
  return false;
}

/* ----- p3c ----- */
/* ===== info pages: contact, legal, size guides ===== */
var LEGAL_KEYS=[["terms","Terms & conditions"],["privacy","Privacy notice"],["cookies","Cookie notice"],["returns","Return policy"],["refunds","Returns & refund timeline"]];
var LEGAL_DEF={
  terms:"# Terms & conditions\n\nThese are starter terms for WEAR ME. Replace this text in the admin dashboard under Legal.\n\nBy placing an order or a sewing request you agree to pay the price shown or quoted, and to give correct delivery and contact details.\n\nOrders are confirmed once we have checked your payment. We may cancel an order if an item is unavailable, and we will refund any payment made for it.\n\nMade-to-measure items are sewn to the measurements you give us, so please check them carefully before you confirm.",
  privacy:"# Privacy notice\n\nThis is starter text for WEAR ME. Replace it in the admin dashboard under Legal.\n\nWe collect your name, phone number, email address and delivery details so we can process your order, contact you about it and sew your made-to-measure items.\n\nWe do not sell your details. We share them only with the people who help us deliver your order. If you want your details removed, contact us using the details on the Contact us page.",
  cookies:"# Cookie notice\n\nThis is starter text for WEAR ME. Replace it in the admin dashboard under Legal.\n\nThis site stores small pieces of information on your device so it can remember your cart and keep you signed in. You can clear this information in your browser settings at any time.",
  returns:"# Return policy\n\nThis is starter text for WEAR ME. Replace it in the admin dashboard under Legal.\n\nIf there is a problem with your order, report it from My orders. Tell us what is wrong and we will review it.\n\nMade-to-measure items are sewn for you and can only be returned if they have a fault or do not match the order.",
  refunds:"# Returns & refund timeline\n\nThis is starter text for WEAR ME. Replace it in the admin dashboard under Legal.\n\n1. You report a problem from My orders.\n2. Our team reviews it and confirms the issue.\n3. Finance approves the refund and sends the money back to you.\n\nSet the number of working days for each step here before you go live."
};
var GUIDE_CATS=["senators","suits","agbada","shirts","trousers","shoes"];
var GUIDE_DEF={
  senators:"Size,Chest (in),Waist (in),Length (in)\nS,36-38,30-32,41\nM,39-41,33-35,42\nL,42-44,36-38,43\nXL,45-47,39-41,44\nXXL,48-50,42-44,45\nNote: Starter measurements. Check them against your own cut before you go live.",
  suits:"Size,Chest (in),Waist (in),Shoulder (in)\n38,38,32,17\n40,40,34,17.5\n42,42,36,18\n44,44,38,18.5\n46,46,40,19\n48,48,42,19.5\nNote: Starter measurements. Check them against your own cut before you go live.",
  agbada:"Size,Chest (in),Length (in)\nM,40-42,52\nL,43-45,54\nXL,46-48,56\nXXL,49-51,58\nNote: Starter measurements. Check them against your own cut before you go live.",
  shirts:"Size,Chest (in),Neck (in),Sleeve (in)\nS,36-38,15,24\nM,39-41,15.5,25\nL,42-44,16,25.5\nXL,45-47,17,26\nXXL,48-50,17.5,26.5\nNote: Starter measurements. Check them against your own cut before you go live.",
  trousers:"Size,Waist (in),Hip (in),Inseam (in)\n30,30,38,30\n32,32,40,31\n34,34,42,31\n36,36,44,32\n38,38,46,32\n40,40,48,32\nNote: Starter measurements. Check them against your own cut before you go live.",
  shoes:"Size (EU),Foot length (cm)\n40,25.0\n41,25.7\n42,26.5\n43,27.3\n44,28.0\n45,28.8\nNote: Starter measurements. Check them against your own cut before you go live."
};
function legalText(k){var v=(S.site.legal||{})[k];return typeof v==="string"&&v.trim()?v:LEGAL_DEF[k]}
function guideText(c){var g=S.site.sizeGuides||{};return typeof g[c]==="string"?g[c]:(GUIDE_DEF[c]||"")}
function guideFor(p){return p&&p.sizeGuide!==false&&guideText(p.cat).trim()?guideText(p.cat):""}
function richText(txt){
  return String(txt).split(/\n{2,}/).map(function(b){b=b.trim();if(!b)return "";if(b.indexOf("# ")===0)return "<h2>"+esc(b.slice(2))+"</h2>";return "<p>"+esc(b).replace(/\n/g,"<br>")+"</p>"}).join("");
}
function guideHTML(txt){
  var lines=String(txt||"").split("\n").map(function(l){return l.trim()}).filter(Boolean),rows=[],notes=[];
  lines.forEach(function(l){if(l.indexOf(",")>-1&&!/^note:/i.test(l))rows.push(l.split(",").map(function(c){return c.trim()}));else notes.push(l)});
  if(!rows.length&&!notes.length)return "";
  return (rows.length?'<div class="tblw"><table class="tbl"><thead><tr>'+rows[0].map(function(c){return "<th>"+esc(c)+"</th>"}).join("")+"</tr></thead><tbody>"+
    rows.slice(1).map(function(r){return "<tr>"+r.map(function(c,i){return (i?"<td>":"<th scope=\"row\">")+esc(c)+(i?"</td>":"</th>")}).join("")+"</tr>"}).join("")+"</tbody></table></div>":"")+
    notes.map(function(n){return '<p class="meta">'+esc(n.replace(/^note:\s*/i,"Note: "))+"</p>"}).join("");
}
var SOCIALS=[["Instagram","https://instagram.com/"],["Facebook","https://facebook.com/"],["TikTok","https://tiktok.com/@"],["X","https://x.com/"],["YouTube","https://youtube.com/@"],["Snapchat","https://snapchat.com/add/"],["Other",""]];
function socialUrl(s){
  var base="";SOCIALS.forEach(function(x){if(x[0]===s.platform)base=x[1]});
  var h=String(s.handle||"").trim();if(/^https?:\/\//.test(h))return h;
  return base&&h?base+h.replace(/^@/,""):"";
}
function socialsHTML(cls){
  var list=(S.site.socials||[]).filter(function(s){return s&&s.handle});
  if(!list.length)return "";
  return '<div class="'+(cls||"socials")+'">'+list.map(function(s){var u=socialUrl(s),lab=esc(s.platform)+" "+esc(s.handle);return u?'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+lab+"</a>":"<span>"+lab+"</span>"}).join("")+"</div>";
}
function contactLines(){
  return (S.site.contacts||[]).filter(function(c){return c&&(c.reason||c.number)}).map(function(c){
    return {label:"For "+String(c.reason||"").trim().toLowerCase()+" contact",num:String(c.number||"").trim()};
  });
}
function pageInfo(r){
  var p=r.page,h="";
  if(p==="contact"){
    var s=S.site;
    h='<div class="page-title"><h1>Contact us</h1><p>Pick the number that fits your reason for calling.</p></div><div class="panel info-card">'+
      contactLines().map(function(c){return '<div class="crow"><span>'+esc(c.label)+'</span>'+(c.num?'<b>'+esc(c.num)+'</b><a class="btn btn-line btn-sm" target="_blank" rel="noopener" href="'+esc(waLink(c.num,"Hello WEAR ME"))+'">WhatsApp</a>':'<b class="muted">Not set yet</b>')+'</div>'}).join("")+
      '<div class="crow"><span>Chat with us</span><b>'+esc(prettyNum(siteWa()))+'</b><a class="btn btn-gold btn-sm" target="_blank" rel="noopener" href="'+esc(waLink(siteWa(),"Hello WEAR ME"))+'">Open chat</a></div>'+
      (s.phone?'<div class="crow"><span>Phone</span><b>'+esc(s.phone)+'</b></div>':'')+
      (s.email?'<div class="crow"><span>Email</span><b>'+esc(s.email)+'</b></div>':'')+
      '<div class="crow"><span>Location</span><b>'+esc(s.address)+'</b></div></div>'+
      (socialsHTML("socials big")?'<h2 class="sub-h">Follow us</h2>'+socialsHTML("socials big"):'');
  }else if(p==="size-guide"){
    h='<div class="page-title"><h1>Size guide</h1><p>Measure yourself, then pick the size that fits best. Not sure? Use Sew with us for made-to-measure.</p></div>'+
      GUIDE_CATS.filter(function(c){return guideText(c).trim()}).map(function(c){return '<section class="panel"><h2>'+esc(CATBY[c].name)+'</h2>'+guideHTML(guideText(c))+'</section>'}).join("");
  }else{
    var lab="";LEGAL_KEYS.forEach(function(k){if(k[0]===p)lab=k[1]});
    if(!lab)return '<div class="wrap"><div class="page-title"><h1>Page not found</h1></div></div>';
    h='<article class="legal">'+richText(legalText(p))+'</article>';
  }
  return '<div class="wrap info-page">'+h+'</div>';
}

/* ----- p4a ----- */
/* ===== admin: state, data, finance maths, charts ===== */
var A={tab:"overview",range:"30",pie:"rev",demo:false,orders:null,styling:null,ledger:null,orderFilter:"all",edit:null,bdraft:null,sdraft:null,busy:"",pq:""};
var ORDER_STATUS=["New","Confirmed","Packed","Shipped","Delivered","Cancelled"],PAY_STATUS=["Unpaid","Proof sent","Paid","Refunded"];
var STY_STATUS=["New","Contacted","Measuring","Sewing","Ready","Delivered","Cancelled"];
function startAdminSubs(){
  if(startAdminSubs.on||!cloud.db||!cloud.canEdit)return;startAdminSubs.on=true;
  A.unsubs=[];var mk=function(name,key){A.unsubs.push(cloud.db.collection(name).onSnapshot(function(s){A[key]=s.docs.map(function(d){return Object.assign({_id:d.id},d.data())});adminRefresh()},function(){A[key]=A[key]||[];adminRefresh()}))};
  mk("orders","orders");mk("styling","styling");mk("ledger","ledger");
}
function adminRefresh(){
  if(route().v!=="admin")return;
  var a=document.activeElement;
  if(a&&a.matches&&a.matches("input,textarea,select")&&$("#root").contains(a))return;
  render();
}
function sum(arr,fn){return arr.reduce(function(n,x){return n+(Number(fn(x))||0)},0)}
function dataset(){
  if(A.demo)return demoData();
  return {orders:A.orders||[],styling:A.styling||[],ledger:A.ledger||[]};
}
function demoData(){
  if(demoData.c)return demoData.c;
  var seed=11,rnd=function(){seed=(seed*9301+49297)%233280;return seed/233280},now=Date.now(),orders=[],i,k;
  for(i=0;i<52;i++){
    var d=Math.floor(Math.pow(rnd(),1.5)*120),n=1+Math.floor(rnd()*2.4),lines=[];
    for(k=0;k<n;k++){var p=DEFAULTS[Math.floor(Math.pow(rnd(),1.6)*DEFAULTS.length)];lines.push({pid:p.id,name:p.name,cat:p.cat,size:"M",qty:rnd()>.85?2:1,price:p.price})}
    var sub=sum(lines,function(l){return l.price*l.qty}),st=rnd()<.07?"Cancelled":(d>6?"Delivered":(d>2?"Shipped":"New"));
    orders.push({_id:"WM-D"+i,id:"WM-D"+i,name:"Sample customer",phone:"08000000000",status:st,payStatus:st==="Delivered"||st==="Shipped"?"Paid":"Unpaid",lines:lines,items:lines.length,subtotal:sub,fee:0,total:sub,createdAt:new Date(now-d*864e5-rnd()*864e5).toISOString()});
  }
  var ledger=[],m;
  for(m=0;m<5;m++){var dt=new Date(now);dt.setMonth(dt.getMonth()-m);var ym=dt.toISOString().slice(0,8);
    ledger.push({_id:"L"+m+"a",type:"expense",label:"Fabric and materials",amount:380000+m*15000,date:ym+"05"},{_id:"L"+m+"b",type:"expense",label:"Workshop and tailors",amount:260000,date:ym+"12"},{_id:"L"+m+"c",type:"expense",label:"Ads and photos",amount:90000,date:ym+"18"})}
  var styling=[0,1,2,3].map(function(j){return {_id:"SW-D"+j,id:"SW-D"+j,name:"Sample client",phone:"08000000000",garment:"Senator",location:"Sample city",status:j<2?"Delivered":"Sewing",quote:45000+j*10000,paid:j<2,createdAt:new Date(now-(j*9+3)*864e5).toISOString(),images:[],notes:"Sample request"}});
  demoData.c={orders:orders,styling:styling,ledger:ledger};return demoData.c;
}
function liveOrders(ds){return ds.orders.filter(function(o){return o.status!=="Cancelled"})}
function liveStyling(ds){return ds.styling.filter(function(s){return s.status!=="Cancelled"&&Number(s.quote)>0})}
function t(iso){return +new Date(iso)}
function revIn(ds,s,e){
  return sum(liveOrders(ds).filter(function(o){var x=t(o.createdAt);return x>=s&&x<e}),function(o){return o.total})+
         sum(liveStyling(ds).filter(function(o){var x=t(o.createdAt);return x>=s&&x<e}),function(o){return o.quote});
}
function expIn(ds,s,e){return sum(ds.ledger.filter(function(l){var x=+new Date(l.date+"T12:00:00");return l.type==="expense"&&x>=s&&x<e}),function(l){return l.amount})}
function buckets(range){
  var now=new Date(),out=[],i,eod=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  if(range==="365"){for(i=11;i>=0;i--){var s=new Date(now.getFullYear(),now.getMonth()-i,1),e=new Date(now.getFullYear(),now.getMonth()-i+1,1);out.push({s:+s,e:+e,l:s.toLocaleString("en",{month:"short"})})}}
  else{var step=range==="90"?7:1,n=range==="90"?13:+range;
    for(i=n-1;i>=0;i--){var e2=new Date(+eod-i*step*864e5),s2=new Date(+e2-step*864e5);out.push({s:+s2,e:+e2,l:s2.getDate()+" "+s2.toLocaleString("en",{month:"short"})})}}
  return out;
}
function overview(ds,range){
  var b=buckets(range),span=b[b.length-1].e-b[0].s;
  var rev=b.map(function(x){return revIn(ds,x.s,x.e)}),exp=b.map(function(x){return expIn(ds,x.s,x.e)});
  var cur=sum(rev,function(v){return v}),prev=revIn(ds,b[0].s-span,b[0].s);
  var ok=liveOrders(ds),sty=liveStyling(ds);
  var booked=sum(ok,function(o){return o.total})+sum(sty,function(s){return s.quote});
  var collected=sum(ok.filter(function(o){return o.payStatus==="Paid"}),function(o){return o.total})+sum(sty.filter(function(s){return s.paid}),function(s){return s.quote})+sum(ds.ledger.filter(function(l){return l.type==="income"}),function(l){return l.amount});
  var expenses=sum(ds.ledger.filter(function(l){return l.type==="expense"}),function(l){return l.amount});
  return {b:b,rev:rev,exp:exp,cur:cur,prev:prev,growth:prev>0?(cur-prev)/prev:null,booked:booked,collected:collected,expenses:expenses,profit:collected-expenses,
    orders:ok.length,newOrders:ds.orders.filter(function(o){return o.status==="New"}).length,newStyling:ds.styling.filter(function(s){return s.status==="New"}).length};
}
function sections(ds){
  var rows=CATS.map(function(c){return {cat:c,rev:0,units:0}}),by={};rows.forEach(function(r){by[r.cat.id]=r});
  liveOrders(ds).forEach(function(o){(o.lines||[]).forEach(function(l){var r=by[l.cat];if(r){r.rev+=l.price*l.qty;r.units+=l.qty}})});
  return rows;
}
function topProducts(ds){
  var m={};
  liveOrders(ds).forEach(function(o){(o.lines||[]).forEach(function(l){var k=l.pid;m[k]=m[k]||{name:l.name,cat:l.cat,units:0,rev:0};m[k].units+=l.qty;m[k].rev+=l.price*l.qty})});
  return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return b.rev-a.rev});
}

/* charts */
function niceMax(v){if(v<=0)return 1000;var p=Math.pow(10,Math.floor(Math.log10(v))),n=v/p,m=n<=1?1:n<=2?2:n<=5?5:10;return m*p}
function lineChart(o){
  var labels=o.b.map(function(x){return x.l}),rev=o.rev,exp=o.exp;
  var W=Math.max(300,Math.min(680,innerWidth-96)),H=Math.max(190,Math.round(W*.46)),L=50,R=12,T=14,B=30,iw=W-L-R,ih=H-T-B,n=labels.length;
  var max=niceMax(Math.max.apply(null,rev.concat(exp,[0])));
  var x=function(i){return L+(n===1?iw/2:i*iw/(n-1))},y=function(v){return T+ih-(v/max)*ih};
  var g="",k;
  for(k=0;k<=4;k++){var gy=T+ih-k*ih/4;g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+gy+'" y2="'+gy+'" class="gl"/><text x="'+(L-6)+'" y="'+(gy+4)+'" text-anchor="end" class="ax">'+NGNc(max*k/4)+'</text>'}
  var step=Math.ceil(n/(W<420?4:6)),xl="";
  labels.forEach(function(l,i){if(i%step===0)xl+='<text x="'+x(i)+'" y="'+(H-8)+'" text-anchor="middle" class="ax">'+esc(l)+'</text>'});
  var path=function(a){return a.map(function(v,i){return (i?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1)}).join(" ")};
  var area=path(rev)+" L"+x(n-1).toFixed(1)+" "+(T+ih)+" L"+x(0).toFixed(1)+" "+(T+ih)+" Z";
  var hasExp=exp.some(function(v){return v>0}),w=iw/Math.max(n-1,1),hits="";
  labels.forEach(function(l,i){hits+='<rect class="hit" x="'+(x(i)-w/2).toFixed(1)+'" y="'+T+'" width="'+w.toFixed(1)+'" height="'+ih+'" data-tip="'+esc(l+"\n"+(o.l1||"Revenue")+" "+NGN(rev[i])+(hasExp?"\n"+(o.l2||"Expenses")+" "+NGN(exp[i]):""))+'"/>'});
  var dots=n<=14?rev.map(function(v,i){return '<circle cx="'+x(i).toFixed(1)+'" cy="'+y(v).toFixed(1)+'" r="3" fill="var(--c1)" stroke="var(--surface)" stroke-width="2"/>'}).join(""):'<circle cx="'+x(n-1).toFixed(1)+'" cy="'+y(rev[n-1]).toFixed(1)+'" r="4" fill="var(--c1)" stroke="var(--surface)" stroke-width="2"/>';
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Cash over time">'+g+xl+
    '<path d="'+area+'" fill="var(--c1)" opacity=".12"/><path d="'+path(rev)+'" fill="none" stroke="var(--c1)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'+
    (hasExp?'<path d="'+path(exp)+'" fill="none" stroke="var(--c2)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>':'')+dots+hits+'</svg>';
}
function donut(rows,mode){
  var key=mode==="rev"?"rev":"units",total=sum(rows,function(r){return r[key]}),nz=rows.filter(function(r){return r[key]>0});
  var cx=100,cy=100,r=70,sw=32;
  if(!nz.length)return '<svg viewBox="0 0 200 200" role="img" aria-label="No sales yet"><circle cx="100" cy="100" r="70" fill="none" stroke="var(--tile)" stroke-width="32"/><text x="100" y="104" text-anchor="middle" class="ax">No sales yet</text></svg>';
  var pt=function(a){var rad=a*Math.PI/180;return [cx+r*Math.cos(rad),cy+r*Math.sin(rad)]};
  var ang=-90,out="",gap=nz.length>1?1.6:0;
  nz.forEach(function(row){
    var frac=row[key]/total,a0=ang,a1=ang+frac*360;ang=a1;
    var tip=esc(row.cat.name+"\n"+(mode==="rev"?NGN(row.rev):row.units+" sold")+"\n"+Math.round(frac*100)+"%");
    if(frac>0.999){out+='<circle cx="100" cy="100" r="'+r+'" fill="none" stroke="var(--c'+row.cat.ci+')" stroke-width="'+sw+'" data-tip="'+tip+'"/>';return}
    var p0=pt(a0+gap/2),p1=pt(a1-gap/2),large=(a1-a0-gap)>180?1:0;
    out+='<path d="M'+p0[0].toFixed(2)+' '+p0[1].toFixed(2)+' A'+r+' '+r+' 0 '+large+' 1 '+p1[0].toFixed(2)+' '+p1[1].toFixed(2)+'" fill="none" stroke="var(--c'+row.cat.ci+')" stroke-width="'+sw+'" data-tip="'+tip+'"/>';
  });
  return '<svg viewBox="0 0 200 200" role="img" aria-label="Sales by section">'+out+
    '<text x="100" y="98" text-anchor="middle" style="font-size:17px;font-weight:700;fill:var(--fg)">'+(mode==="rev"?NGNc(total):total)+'</text>'+
    '<text x="100" y="116" text-anchor="middle" class="ax">'+(mode==="rev"?"revenue":"units sold")+'</text></svg>';
}
function showTip(e){
  var el=e.target.closest&&e.target.closest("[data-tip]"),tip=$("#tip");
  if(!el){tip.hidden=true;return}
  tip.innerHTML=esc(el.getAttribute("data-tip")).replace(/\n/g,"<br>");tip.hidden=false;
  var x=e.clientX+14,y=e.clientY+14,w=tip.offsetWidth,h=tip.offsetHeight;
  if(x+w>innerWidth-8)x=e.clientX-w-14;if(y+h>innerHeight-8)y=e.clientY-h-14;
  tip.style.left=Math.max(8,x)+"px";tip.style.top=Math.max(8,y)+"px";
}

/* ----- p4c ----- */
/* ===== finance: cash events, buckets, statements ===== */
A.sub="";A.eye=false;A.gran="day";A.stmt="month";A.dr=null;A.cancelId="";A.rejectId="";A.acc=null;A.status=undefined;A.authErr="";A.profErr="";

function cashEvents(ds){
  var ev=[];
  ds.orders.forEach(function(o){
    if(o.payStatus==="Paid"||o.payStatus==="Refunded")ev.push({d:o.paidAt||o.createdAt,t:"in",kind:"Order",ref:o.id,label:"Order "+o.id+(o.name?" ("+o.name+")":""),amt:Number(o.total)||0});
    if(o.refund&&o.refund.status==="Approved")ev.push({d:o.refund.approvedAt||o.createdAt,t:"out",kind:"Refund",ref:o.id,label:"Refund for order "+o.id,amt:Number(o.refund.amount)||0});
  });
  ds.styling.forEach(function(s){if(s.paid&&Number(s.quote)>0)ev.push({d:s.paidAt||s.createdAt,t:"in",kind:"Sewing",ref:s.id,label:"Sewing request "+s.id+(s.name?" ("+s.name+")":""),amt:Number(s.quote)||0})});
  ds.ledger.forEach(function(l){ev.push({d:l.date+"T12:00:00",t:l.type==="income"?"in":"out",kind:l.type==="income"?"Other income":"Expense",ref:l._id||"",label:l.label,amt:Number(l.amount)||0})});
  return ev.filter(function(x){return x.amt>0&&!isNaN(t(x.d))});
}
function evSum(ev,s,e,type){return sum(ev.filter(function(x){var v=t(x.d);return x.t===type&&v>=s&&v<e}),function(x){return x.amt})}
function balanceOf(ev){return evSum(ev,-Infinity,Infinity,"in")-evSum(ev,-Infinity,Infinity,"out")}
function cashOverview(ds,range){
  var ev=cashEvents(ds),b=buckets(range),span=b[b.length-1].e-b[0].s;
  var rev=b.map(function(x){return evSum(ev,x.s,x.e,"in")}),exp=b.map(function(x){return evSum(ev,x.s,x.e,"out")});
  var cur=sum(rev,function(v){return v}),prev=evSum(ev,b[0].s-span,b[0].s,"in");
  return {b:b,rev:rev,exp:exp,cur:cur,out:sum(exp,function(v){return v}),prev:prev,growth:prev>0?(cur-prev)/prev:null,l1:"Cash in",l2:"Cash out",ev:ev};
}
function granBuckets(g){
  var now=new Date(),out=[],i,eod=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  var mon=function(d){return d.toLocaleString("en",{month:"short"})};
  if(g==="year"){for(i=4;i>=0;i--){var y=now.getFullYear()-i;out.push({s:+new Date(y,0,1),e:+new Date(y+1,0,1),l:String(y)})}}
  else if(g==="month"){for(i=11;i>=0;i--){var s=new Date(now.getFullYear(),now.getMonth()-i,1);out.push({s:+s,e:+new Date(now.getFullYear(),now.getMonth()-i+1,1),l:mon(s)+" "+String(s.getFullYear()).slice(2)})}}
  else if(g==="week"){for(i=11;i>=0;i--){var e2=new Date(+eod-i*7*864e5),s2=new Date(+e2-7*864e5);out.push({s:+s2,e:+e2,l:s2.getDate()+" "+mon(s2)})}}
  else{for(i=29;i>=0;i--){var e3=new Date(+eod-i*864e5),s3=new Date(+e3-864e5);out.push({s:+s3,e:+e3,l:s3.getDate()+" "+mon(s3)})}}
  return out;
}
function inflowData(ds,g){
  var ev=cashEvents(ds),b=granBuckets(g);
  var rev=b.map(function(x){return evSum(ev,x.s,x.e,"in")}),exp=b.map(function(x){return evSum(ev,x.s,x.e,"out")});
  return {b:b,rev:rev,exp:exp,l1:"Cash in",l2:"Cash out"};
}
function pendingMoney(ds){
  return sum(ds.orders.filter(function(o){return o.status!=="Cancelled"&&(o.payStatus==="Unpaid"||o.payStatus==="Proof sent")}),function(o){return o.total})+
         sum(ds.styling.filter(function(s){return s.status!=="Cancelled"&&!s.paid&&Number(s.quote)>0}),function(s){return s.quote});
}
function stmtRange(k){
  var n=new Date(),y=n.getFullYear(),m=n.getMonth();
  if(k==="month")return {s:+new Date(y,m,1),e:+new Date(y,m+1,1),l:n.toLocaleString("en",{month:"long",year:"numeric"}),f:y+"-"+("0"+(m+1)).slice(-2)};
  if(k==="last"){var d=new Date(y,m-1,1);return {s:+d,e:+new Date(y,m,1),l:d.toLocaleString("en",{month:"long",year:"numeric"}),f:d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)}}
  if(k==="year")return {s:+new Date(y,0,1),e:+new Date(y+1,0,1),l:"Year "+y,f:String(y)};
  return {s:-Infinity,e:Infinity,l:"All time",f:"all-time"};
}
var csvCell=function(v){v=String(v==null?"":v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
function statementData(ds,k){
  var r=stmtRange(k),ev=cashEvents(ds).filter(function(x){var v=t(x.d);return v>=r.s&&v<r.e}).sort(function(a,b){return t(a.d)-t(b.d)});
  var cin=sum(ev.filter(function(x){return x.t==="in"}),function(x){return x.amt}),cout=sum(ev.filter(function(x){return x.t==="out"}),function(x){return x.amt});
  return {r:r,ev:ev,cin:cin,cout:cout,net:cin-cout};
}
function statementCSV(ds,k){
  var d=statementData(ds,k),rows=[];
  rows.push(["WEAR ME financial statement"]);rows.push(["Period",d.r.l]);rows.push(["Generated",new Date().toLocaleString("en-NG")]);rows.push([]);
  rows.push(["Date","Type","Description","Reference","Cash in (NGN)","Cash out (NGN)"]);
  d.ev.forEach(function(x){rows.push([new Date(x.d).toISOString().slice(0,10),x.kind,x.label,x.ref,x.t==="in"?x.amt:"",x.t==="out"?x.amt:""])});
  rows.push([]);rows.push(["","","","Total",d.cin,d.cout]);rows.push(["","","","Net cash",d.net,""]);rows.push([]);
  rows.push(["Sales by section (orders not cancelled)"]);rows.push(["Section","Units sold","Sales (NGN)"]);
  sections(ds).forEach(function(s){rows.push([s.cat.name,s.units,s.rev])});
  return "﻿"+rows.map(function(r){return r.map(csvCell).join(",")}).join("\r\n");
}
async function downloadStatement(){
  var ds=dataset(),csv=statementCSV(ds,A.stmt),r=stmtRange(A.stmt);
  var dl=await use("downloads");
  if(!dl){toast("Downloads are not available in this view. Open the dashboard in the Claude app or browser.");return}
  try{await dl.save({filename:"wearme-statement-"+r.f+".csv",data:new Blob([csv],{type:"text/csv"})});toast("Statement ready")}
  catch(e){if(!e||e.code!=="declined")toast("Could not prepare the statement.")}
}

/* ===== admin account (kept on the server) ===== */
function wmErr(e){return (e&&e.message)||"Could not reach the server."}
async function refreshAdminStatus(){
  try{var s=await wmAdmin.status();A.status=s;cloud.canEdit=!!s.loggedIn;A.acc=s.loggedIn?s.account:null}
  catch(e){A.status="down";cloud.canEdit=false;A.acc=null}
}
async function createAccount(f){
  var d=new FormData(f),email=String(d.get("email")).trim().toLowerCase(),pw=String(d.get("password")),pw2=String(d.get("password2"));
  if(!/^\S+@\S+\.\S+$/.test(email))return "Enter a valid email address.";
  if(pw.length<8)return "Use at least 8 characters for the password.";
  if(pw!==pw2)return "The two passwords do not match.";
  try{await wmAdmin.create(email,pw)}catch(e){return wmErr(e)}
  await refreshAdminStatus();return "";
}
async function loginAdmin(f){
  var d=new FormData(f),email=String(d.get("email")).trim().toLowerCase(),pw=String(d.get("password"));
  try{await wmAdmin.login(email,pw)}catch(e){return wmErr(e)}
  await refreshAdminStatus();return "";
}
function lockAdmin(){
  wmAdmin.logout();
  (A.unsubs||[]).forEach(function(fn){fn()});A.unsubs=[];startAdminSubs.on=false;
  A.orders=null;A.styling=null;A.ledger=null;A.status=undefined;A.acc=null;A.dr=null;cloud.canEdit=false;
}
function profileDone(){return !!(A.acc&&A.acc.profile&&A.acc.profile.name)}

/* ----- p4d ----- */
/* ===== admin dashboard: shell, sections, actions ===== */
var SECTIONS=[
  {id:"sales",name:"Sales",subs:[["products","Products"],["sizeguides","Size guides"],["styling","Personal styling"]]},
  {id:"finance",name:"Finance",subs:[["overview","Overview"],["inflow","Cash inflow"],["refunds","Refunds"],["statements","Statements"],["account","Company account"],["entries","Other entries"]]},
  {id:"pr",name:"PR",subs:[["banners","Top banners"],["models","Model pictures"]]},
  {id:"logistics",name:"Logistics",subs:[["orders","Orders"],["issues","Cancellations and refunds"],["delivery","Delivery fees"]]},
  {id:"service",name:"Customer Service",subs:[["contact","Contact details"],["social","Social handles"]]},
  {id:"legal",name:"Legal",subs:LEGAL_KEYS}
];
var ACCOUNT_SEC={id:"account",name:"My account",subs:[["profile","Profile"],["password","Password"]]};
var ISSUE_REASONS=["Wrong item","Damaged or faulty","Not as described","Wrong size","Never arrived","Other"];

function opts(list,cur){return list.map(function(v){var val=Array.isArray(v)?v[0]:v,lab=Array.isArray(v)?v[1]:v;return '<option value="'+esc(val)+'"'+(String(cur)===String(val)?" selected":"")+'>'+esc(lab)+'</option>'}).join("")}
function kpi(label,val,extra){return '<div class="kpi"><small>'+label+'</small><b>'+val+'</b>'+(extra||"")+'</div>'}
function deltaHTML(g){
  if(g==null)return '<span class="delta" style="color:var(--muted)">No earlier period</span>';
  var up=g>=0;return '<span class="delta '+(up?"up":"down")+'">'+(up?"▲ ":"▼ ")+Math.abs(Math.round(g*100))+'% vs previous</span>';
}
function rangeSeg(){return '<div class="seg" role="group" aria-label="Range">'+[["7","7 days"],["30","30 days"],["90","90 days"],["365","12 months"]].map(function(x){return '<button data-act="a-range" data-v="'+x[0]+'" aria-pressed="'+(A.range===x[0])+'">'+x[1]+'</button>'}).join("")+'</div>'}
function chartBlock(o){
  var hasExp=o.exp.some(function(v){return v>0});
  return '<div class="chart">'+lineChart(o)+'</div><div class="legend" style="grid-template-columns:repeat(auto-fit,minmax(140px,max-content));gap:6px 18px"><div><i style="background:var(--c1)"></i><span>'+(o.l1||"Revenue")+'</span></div>'+(hasExp?'<div><i style="background:var(--c2)"></i><span>'+(o.l2||"Expenses")+'</span></div>':'')+'</div>';
}
function dr(name,init){A.dr=A.dr||{};if(!A.dr[name])A.dr[name]=JSON.parse(JSON.stringify(init));return A.dr[name]}
function setPath(o,path,v){var p=path.split("."),i;for(i=0;i<p.length-1;i++){if(o[p[i]]==null)o[p[i]]={};o=o[p[i]]}o[p[p.length-1]]=v}
function field(name,id,label,path,type,val,extra){return '<div class="fld"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+(type||"text")+'" data-d="'+name+'|'+path+'" value="'+esc(val==null?"":val)+'" '+(extra||"")+'></div>'}
function ordById(id){var a=A.orders||[];for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
function saveSite(patch,msg){return adminSave(function(){return cloud.db.doc("settings/site").set(Object.assign({},S.site,patch))},msg||"Saved")}
function fmtShort(iso){try{return new Date(iso).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"})}catch(e){return ""}}

/* ----- sign in screens ----- */
function authShell(inner){return '<div class="auth-wrap"><div class="auth-card"><div class="logo">WEAR ME<i></i></div><small class="adm-tag">Admin</small>'+inner+'</div></div>'}
function screenCreate(){
  return authShell('<h1>Create your admin account</h1><p class="muted">This dashboard has one account. Choose an email and a password. You will use them every time you come back.</p>'+
    '<form id="admcreate" novalidate class="authform"><div class="fld"><label for="c-email">Email address</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>'+
    '<div class="fld"><label for="c-pw">Password (8 or more characters)</label><input id="c-pw" name="password" type="password" autocomplete="new-password" minlength="8" required></div>'+
    '<div class="fld"><label for="c-pw2">Repeat password</label><input id="c-pw2" name="password2" type="password" autocomplete="new-password" required></div>'+
    '<div class="note-err" id="auth-err" role="alert">'+esc(A.authErr)+'</div><button class="btn btn-gold btn-block" type="submit">Create account</button></form>'+
    '<a class="link" href="index.html" style="justify-self:center">Back to the store</a>');
}
function screenLogin(){
  return authShell('<h1>Welcome back</h1><p class="muted">Enter your admin email and password.</p>'+
    '<form id="admlogin" novalidate class="authform"><div class="fld"><label for="a-email">Email address</label><input id="a-email" name="email" type="email" autocomplete="email" required></div>'+
    '<div class="fld"><label for="a-pw">Password</label><input id="a-pw" name="password" type="password" autocomplete="current-password" required></div>'+
    '<div class="note-err" id="auth-err" role="alert">'+esc(A.authErr)+'</div><button class="btn btn-gold btn-block" type="submit">Log in</button></form>'+
    '<a class="link" href="index.html" style="justify-self:center">Back to the store</a>');
}
function screenProfile(){
  var p=(A.acc&&A.acc.profile)||{};
  return authShell('<h1>Set up your profile</h1><p class="muted">Tell us a little about you. You can change this later.</p>'+
    '<form id="admprofile" novalidate class="authform"><div class="fld"><label for="p-name">Full name</label><input id="p-name" name="name" autocomplete="name" required value="'+esc(p.name||"")+'"></div>'+
    '<div class="fld"><label for="p-dob">Date of birth</label><input id="p-dob" name="dob" type="date" required value="'+esc(p.dob||"")+'"></div>'+
    '<div class="fld"><label for="p-phone">Phone number</label><input id="p-phone" name="phone" type="tel" autocomplete="tel" value="'+esc(p.phone||"")+'"></div>'+
    '<div class="fld"><label for="p-role">Your role</label><input id="p-role" name="role" placeholder="Owner, manager" value="'+esc(p.role||"")+'"></div>'+
    '<div class="note-err" id="auth-err" role="alert">'+esc(A.profErr)+'</div><button class="btn btn-gold btn-block" type="submit">Save and continue</button></form>');
}

/* ----- shell ----- */
function counts(){
  var o=A.orders||[],st=A.styling||[];
  return {
    sales:st.filter(function(s){return s.status==="New"}).length,
    finance:o.filter(function(x){return x.refund&&x.refund.status==="Confirmed"}).length,
    logistics:o.filter(function(x){return x.status==="New"||(x.refund&&x.refund.status==="Requested")}).length
  };
}
function dashShell(sec,sub,body){
  var c=counts(),p=(A.acc&&A.acc.profile)||{},ini=(p.name||"A").split(" ").map(function(w){return w.charAt(0)}).join("").slice(0,2).toUpperCase();
  return '<div class="adm-app"><header class="adm-bar2"><div class="wrap"><a class="logo" href="#admin">WEAR ME<i></i></a><span class="adm-tag">Admin</span><span class="grow"></span>'+
    '<a class="btn btn-line btn-sm" href="index.html">View store</a><a class="avatar" href="#admin-account-profile" aria-label="My account">'+esc(ini)+'</a></div></header>'+
    '<div class="adm-body2"><nav class="adm-nav" aria-label="Dashboard">'+SECTIONS.map(function(s){
      var n=c[s.id];return '<a href="#admin-'+s.id+'"'+(sec.id===s.id?' aria-current="page"':'')+'>'+esc(s.name)+(n?'<span class="n">'+n+'</span>':'')+'</a>'}).join("")+'</nav>'+
    '<div class="adm-main"><h1>'+esc(sec.name)+'</h1><nav class="subtabs" aria-label="'+esc(sec.name)+' pages">'+sec.subs.map(function(s){return '<a href="#admin-'+sec.id+'-'+s[0]+'"'+(sub===s[0]?' aria-current="page"':'')+'>'+esc(s[1])+'</a>'}).join("")+'</nav>'+
    '<div class="adm-content">'+body+'</div></div></div></div>';
}
function renderAdmin(r){
  var root=$("#root");
  if(!cloud.ready||A.status===undefined){
    root.innerHTML=authShell('<p class="muted">Loading…</p>');
    if(cloud.ready&&!A.checking){A.checking=true;refreshAdminStatus().then(function(){A.checking=false;if(route().v==="admin")render()})}
    return;
  }
  if(A.status==="down"){root.innerHTML=authShell('<h1>Cannot reach the server</h1><p class="muted">Check your internet connection and that the WEAR ME server is running, then try again.</p><button class="btn btn-gold btn-block" data-act="a-retry">Try again</button>');return}
  if(!A.status.exists){root.innerHTML=screenCreate();return}
  if(!cloud.canEdit){root.innerHTML=screenLogin();return}
  startAdminSubs();
  if(!profileDone()&&r.tab!=="account"){root.innerHTML=screenProfile();return}
  var sec=r.tab==="account"?ACCOUNT_SEC:null;
  SECTIONS.forEach(function(s){if(s.id===r.tab)sec=s});
  if(!sec)sec=SECTIONS[0];
  var sub=r.sub,ok=false;sec.subs.forEach(function(s){if(s[0]===sub)ok=true});if(!ok)sub=sec.subs[0][0];
  A.tab=sec.id;A.sub=sub;
  var body="";
  try{body=sectionBody(sec.id,sub)}catch(e){body='<div class="item">Something went wrong showing this page. Try another page and come back.</div>'}
  root.innerHTML=dashShell(sec,sub,body);
}
function sectionBody(sec,sub){
  var m={
    "sales/products":subProducts,"sales/sizeguides":subGuides,"sales/styling":subStyling,
    "finance/overview":subFinOverview,"finance/inflow":subInflow,"finance/refunds":subRefunds,"finance/statements":subStatements,"finance/account":subBank,"finance/entries":subEntries,
    "pr/banners":subBanners,"pr/models":subModels,
    "logistics/orders":subOrders,"logistics/issues":subIssues,"logistics/delivery":subDelivery,
    "service/contact":subContact,"service/social":subSocial,
    "account/profile":subProfile,"account/password":subPassword
  };
  if(sec==="legal")return subLegal(sub);
  return (m[sec+"/"+sub]||subProducts)();
}
function loadingNote(){return A.orders===null&&!A.demo}

/* ----- sales ----- */
function subProducts(){
  var seeded=S.dbProducts&&S.dbProducts.length>0,q=A.pq.trim().toLowerCase();
  var list=allProducts().filter(function(p){return !q||(p.name+" "+p.cat).toLowerCase().indexOf(q)>-1});
  return '<div class="spec"><b>Product picture size</b><span>Upload pictures at 1200 × 1500 px (4:5 portrait), JPG, PNG or WebP, under 10 MB. Products marked PLACEHOLDER still show the drawn garment until you upload a picture.</span></div>'+
    (!seeded?'<div class="spec"><b>Start editing</b><span>The store is showing the 27 starter products. Load them into your catalogue to edit prices, descriptions, sizes and pictures.</span><div><button class="btn btn-gold btn-sm" data-act="a-seed"'+(A.busy==="seed"?" disabled":"")+'>'+(A.busy==="seed"?"Loading…":"Load starter products")+'</button></div></div>':'')+
    '<div class="inline"><button class="btn btn-gold btn-sm" data-act="a-padd"'+(seeded?"":" disabled")+'>Add product</button><label class="sr" for="pq">Search products</label><input id="pq" type="text" placeholder="Search products" value="'+esc(A.pq)+'" data-inp="a-pq" class="sbox"></div>'+
    list.map(function(p){
      return '<article class="prow"><div class="thumb-s">'+pic(p)+'</div><div style="min-width:0"><b>'+esc(p.name)+'</b><div class="meta">'+esc(CATBY[p.cat]?CATBY[p.cat].name:p.cat)+(p.active===false?" · Hidden":"")+(p.soldOut?" · Sold out":"")+(p.image?'':' · <span class="tag-ph">Placeholder</span>')+'</div></div>'+
        '<div class="inline"><label class="sr" for="pp-'+p.id+'">Price for '+esc(p.name)+'</label><span>₦</span><input id="pp-'+p.id+'" type="number" min="0" step="500" value="'+p.price+'" data-chg="a-price" data-id="'+p.id+'" style="width:110px"'+(seeded?"":" disabled")+'>'+
        '<label class="ck"><input type="checkbox" data-chg="a-pactive" data-id="'+p.id+'"'+(p.active!==false?" checked":"")+(seeded?"":" disabled")+'> Visible</label>'+
        '<button class="btn btn-line btn-sm" data-act="a-pedit" data-id="'+p.id+'"'+(seeded?"":" disabled")+'>Edit</button></div></article>'}).join("");
}
function productModal(){
  var e=A.edit;if(!e)return "";
  var p=e.p,tags=p.tags||[];
  return '<div class="scrim" data-act="a-pclose"></div><div class="modal"><form class="sheet wide" id="pform" novalidate style="padding:0">'+
    '<button type="button" class="x" data-act="a-pclose" aria-label="Close">'+IC.x+'</button><div class="info" style="padding-top:22px">'+
    '<h2 style="font-family:var(--display);font-size:28px">'+(e.isNew?"Add product":"Edit product")+'</h2>'+
    '<div class="fld"><label for="pf-name">Name</label><input id="pf-name" name="name" required value="'+esc(p.name)+'"></div>'+
    '<div class="two"><div class="fld"><label for="pf-cat">Section</label><select id="pf-cat" name="cat">'+opts(CATS.map(function(c){return [c.id,c.name]}),p.cat)+'</select></div>'+
    '<div class="fld"><label for="pf-price">Price (₦)</label><input id="pf-price" name="price" type="number" min="0" step="500" required value="'+p.price+'"></div></div>'+
    '<div class="fld"><label for="pf-desc">Description</label><textarea id="pf-desc" name="desc">'+esc(p.desc||"")+'</textarea></div>'+
    '<div class="two"><div class="fld"><label for="pf-sizes">Sizes (comma separated)</label><input id="pf-sizes" name="sizes" value="'+esc((p.sizes||[]).join(", "))+'"></div>'+
    '<div class="fld"><label for="pf-color">Placeholder colour</label><input id="pf-color" name="color" type="color" value="'+esc(p.color||"#1f2f4f")+'" style="padding:4px"></div></div>'+
    '<div class="inline"><label class="ck"><input type="checkbox" name="tag-top"'+(tags.indexOf("top")>-1?" checked":"")+'> Top pick</label><label class="ck"><input type="checkbox" name="tag-best"'+(tags.indexOf("best")>-1?" checked":"")+'> Best seller</label><label class="ck"><input type="checkbox" name="tag-new"'+(tags.indexOf("new")>-1?" checked":"")+'> New arrival</label></div>'+
    '<div class="inline"><label class="ck"><input type="checkbox" name="active"'+(p.active!==false?" checked":"")+'> Visible in store</label><label class="ck"><input type="checkbox" name="soldOut"'+(p.soldOut?" checked":"")+'> Sold out</label><label class="ck"><input type="checkbox" name="sizeGuide"'+(p.sizeGuide!==false?" checked":"")+'> Show size guide</label></div>'+
    '<div class="fld"><label>Picture</label><div class="spec"><span>1200 × 1500 px (4:5 portrait). JPG, PNG or WebP, under 10 MB.</span></div>'+
    '<div class="upl"><div class="thumb-s" id="pf-prev" style="width:96px">'+pic(p)+'</div>'+(cloud.assets?'<label class="btn btn-line btn-sm" for="pf-file">Upload picture</label><input id="pf-file" type="file" accept="image/*" class="sr">':'<span class="meta" style="color:var(--muted)">Uploads need the editor view.</span>')+(p.image?'<button type="button" class="link" data-act="a-pimgrm">Remove picture</button>':'')+'</div></div>'+
    '<div class="note-err" id="pf-err" role="alert"></div>'+
    '<div class="inline"><button class="btn btn-gold" type="submit" style="flex:1">Save product</button>'+(e.isNew?'':'<button type="button" class="btn btn-line" data-act="a-pdel">'+(e.confirmDel?"Tap again to delete":"Delete")+'</button>')+'</div></div></form></div>';
}
function openProductModal(){$("#layers").innerHTML=productModal();document.body.classList.toggle("lock",!!A.edit)}
function readProductForm(f){
  var d=new FormData(f),e=A.edit,tags=[];
  if(d.get("tag-top"))tags.push("top");if(d.get("tag-best"))tags.push("best");if(d.get("tag-new"))tags.push("new");
  var sizes=String(d.get("sizes")||"").split(",").map(function(x){return x.trim()}).filter(Boolean);
  return {id:e.p.id,name:String(d.get("name")).trim(),cat:String(d.get("cat")),price:Math.max(0,Number(d.get("price"))||0),color:String(d.get("color")),
    tags:tags,desc:String(d.get("desc")||"").trim(),sizes:sizes.length?sizes:SIZES[String(d.get("cat"))].slice(),image:e.p.image||"",active:!!d.get("active"),soldOut:!!d.get("soldOut"),sizeGuide:!!d.get("sizeGuide")};
}
function subGuides(){
  var g=dr("guide",GUIDE_CATS.reduce(function(o,c){o[c]=guideText(c);return o},{}));
  return '<div class="spec"><b>How to write a size guide</b><span>The first line holds the column titles, separated by commas. Each line after it is one size. A line that starts with Note: shows under the table. Customers see the guide on every product in that section. Switch it off for a single product in that product\'s edit form.</span></div>'+
    '<div class="spec"><b>Starter measurements</b><span>The tables below are starter numbers. Check them against your own cut before you go live.</span></div>'+
    GUIDE_CATS.map(function(c){
      return '<section class="panel"><h3>'+esc(CATBY[c].name)+'</h3><div class="fld"><label class="sr" for="sg-'+c+'">Size guide for '+esc(CATBY[c].name)+'</label><textarea id="sg-'+c+'" rows="8" data-d="guide|'+c+'" class="mono">'+esc(g[c])+'</textarea></div>'+
        '<div class="inline"><button class="btn btn-gold btn-sm" data-act="a-save" data-v="guide" data-id="'+c+'">Save</button><button class="btn btn-line btn-sm" data-act="a-guide-reset" data-id="'+c+'">Use starter table</button></div></section>'}).join("");
}
function subStyling(){
  if(A.styling===null&&!A.demo)return '<p>Loading requests…</p>';
  var list=(A.styling||[]).slice().sort(function(a,b){return t(b.createdAt)-t(a.createdAt)});
  return '<p class="muted" style="margin:0">Requests from the Sew with us page. Set a quote once you agree a price on WhatsApp, and tick Paid when the money arrives. Paid quotes count in Finance.</p>'+
    (list.length?list.map(function(s){
      return '<article class="item"><div class="item-head"><b>'+esc(s.id)+' · '+esc(s.garment)+'</b><span class="pill">'+esc(s.status)+'</span></div>'+
        '<div class="meta">'+fmtDate(s.createdAt)+' · '+esc(s.name)+' · '+esc(s.phone)+' · '+esc(s.location)+'</div>'+
        (s.notes?'<div>'+esc(s.notes)+'</div>':'')+(s.link?'<div class="meta">Link: <a href="'+esc(s.link)+'" target="_blank" rel="noopener">'+esc(s.link)+'</a></div>':'')+
        ((s.images||[]).length?'<div class="upl">'+s.images.map(function(id){return '<a href="'+BLOB+esc(id)+'" target="_blank" rel="noopener" class="thumb-s" style="width:88px"><img src="'+BLOB+esc(id)+'" alt="Inspiration"></a>'}).join("")+'</div>':'')+
        '<div class="inline"><label class="sr" for="ss-'+esc(s.id)+'">Status</label><select id="ss-'+esc(s.id)+'" data-chg="a-sstatus" data-id="'+esc(s.id)+'">'+opts(["New","Contacted","Measuring","Sewing","Ready","Delivered","Cancelled"],s.status)+'</select>'+
        '<label class="ck">₦ <input type="number" min="0" step="500" value="'+(Number(s.quote)||0)+'" data-chg="a-squote" data-id="'+esc(s.id)+'" aria-label="Quote" style="width:110px"></label>'+
        '<label class="ck"><input type="checkbox" data-chg="a-spaid" data-id="'+esc(s.id)+'"'+(s.paid?" checked":"")+'> Paid</label>'+
        '<a class="btn btn-line btn-sm" target="_blank" rel="noopener" href="'+esc(waLink(s.phone,"Hello "+s.name+", this is WEAR ME about your sewing request "+s.id+"."))+'">WhatsApp</a></div></article>'}).join(""):'<div class="item"><span class="muted">No sewing requests yet.</span></div>');
}

/* ----- finance ----- */
function demoBar(ds){
  var empty=!A.demo&&ds.orders.length===0&&ds.styling.length===0&&ds.ledger.length===0;
  return (A.demo?'<div class="spec"><b>Sample data</b><span>These numbers are made up so you can see how the dashboard works. Nothing is saved.</span><div><button class="btn btn-line btn-sm" data-act="a-demo">Hide sample data</button></div></div>':'')+
    (empty?'<div class="spec"><b>No money recorded yet</b><span>Paid orders, paid sewing quotes and your own entries show here.</span><div><button class="btn btn-line btn-sm" data-act="a-demo">Preview with sample data</button></div></div>':'');
}
function subFinOverview(){
  if(loadingNote())return '<p>Loading…</p>';
  var ds=dataset(),o=cashOverview(ds,A.range),bal=balanceOf(o.ev),rows=sections(ds),key=A.pie==="rev"?"rev":"units",total=sum(rows,function(r){return r[key]});
  var sorted=rows.slice().sort(function(a,b){return b[key]-a[key]}),pend=pendingMoney(ds),top=topProducts(ds).slice(0,5);
  return demoBar(ds)+
    '<section class="balance"><div class="bal-h"><span>Company balance</span><button class="eye" data-act="a-eye" aria-pressed="'+A.eye+'" aria-label="'+(A.eye?"Hide balance":"Show balance")+'">'+(A.eye?
      '<svg class="ico" viewBox="0 0 24 24"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>':
      '<svg class="ico" viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.8M6.5 7.7C3.6 9.5 2 12 2 12s3.6 6.5 10 6.5c1.5 0 2.8-.3 4-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>')+'</button></div>'+
      '<b class="bal-n" aria-live="polite">'+(A.eye?NGN(bal):"₦ ••••••••")+'</b><small>Money received from paid orders and sewing, plus other income, less refunds and expenses.</small></section>'+
    '<div class="kpis">'+kpi("Cash in",NGN(o.cur),deltaHTML(o.growth))+kpi("Cash out",NGN(o.out))+kpi("Net",NGN(o.cur-o.out))+kpi("Awaiting payment",NGN(pend))+'</div>'+
    '<div class="dgrid two"><section class="pnl"><div class="pnl-h"><h2>Financial growth</h2>'+rangeSeg()+'</div><div class="inline"><b style="font-size:22px">'+NGN(o.cur)+'</b>'+deltaHTML(o.growth)+'</div>'+chartBlock(o)+'</section>'+
    '<section class="pnl"><div class="pnl-h"><h2>Sales by section</h2><div class="seg" role="group" aria-label="Measure"><button data-act="a-pie" data-v="rev" aria-pressed="'+(A.pie==="rev")+'">Revenue</button><button data-act="a-pie" data-v="units" aria-pressed="'+(A.pie==="units")+'">Units</button></div></div>'+
    '<div class="donut-wrap"><div class="chart" style="max-width:240px;margin:0 auto;width:100%">'+donut(rows,A.pie)+'</div>'+
    '<div class="legend">'+sorted.map(function(r){var v=r[key];return '<div><i style="background:var(--c'+r.cat.ci+')"></i><span>'+esc(r.cat.name)+'</span><em>'+(A.pie==="rev"?NGN(v):v+" sold")+(total?" · "+Math.round(v/total*100)+"%":"")+'</em></div>'}).join("")+'</div></div></section></div>'+
    '<section class="pnl"><h2>Top sellers</h2>'+(top.length?'<div class="tblw"><table class="tbl"><thead><tr><th>Product</th><th class="n">Units</th><th class="n">Revenue</th></tr></thead><tbody>'+top.map(function(p){return '<tr><td>'+esc(p.name)+'</td><td class="n">'+p.units+'</td><td class="n">'+NGN(p.rev)+'</td></tr>'}).join("")+'</tbody></table></div>':'<p class="muted" style="margin:0">Nothing sold yet.</p>')+'</section>';
}
function subInflow(){
  if(loadingNote())return '<p>Loading…</p>';
  var ds=dataset(),d=inflowData(ds,A.gran),i,rows="";
  for(i=d.b.length-1;i>=0;i--)rows+='<tr><td>'+esc(d.b[i].l)+'</td><td class="n">'+NGN(d.rev[i])+'</td><td class="n">'+NGN(d.exp[i])+'</td><td class="n">'+NGN(d.rev[i]-d.exp[i])+'</td></tr>';
  var tot=sum(d.rev,function(v){return v}),out=sum(d.exp,function(v){return v});
  return demoBar(ds)+'<section class="pnl"><div class="pnl-h"><h2>Cash inflow</h2><div class="seg" role="group" aria-label="Period">'+[["day","Daily"],["week","Weekly"],["month","Monthly"],["year","Yearly"]].map(function(x){return '<button data-act="a-gran" data-v="'+x[0]+'" aria-pressed="'+(A.gran===x[0])+'">'+x[1]+'</button>'}).join("")+'</div></div>'+
    '<div class="inline"><b style="font-size:22px">'+NGN(tot)+'</b><span class="muted">in, '+NGN(out)+' out, over the '+({day:"last 30 days",week:"last 12 weeks",month:"last 12 months",year:"last 5 years"})[A.gran]+'</span></div>'+chartBlock(d)+'</section>'+
    '<section class="pnl"><h2>Breakdown</h2><div class="tblw"><table class="tbl"><thead><tr><th>Period</th><th class="n">Cash in</th><th class="n">Cash out</th><th class="n">Net</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="meta muted" style="margin:0">Cash in counts orders marked Paid, paid sewing quotes and other income. Cash out counts approved refunds and expenses.</p></section>';
}
function refundCard(o,mode){
  var rf=o.refund||{};
  return '<article class="item"><div class="item-head"><b>'+esc(o.id)+' · '+esc(o.name)+'</b><span class="pill">'+esc(rf.status)+'</span></div>'+
    '<div class="meta">Order total '+NGN(o.total)+' · '+fmtDate(rf.at||o.createdAt)+' · '+esc(o.phone)+'</div>'+
    '<div><b>Reason:</b> '+esc(rf.reason||"")+(rf.source==="cancellation"?' <span class="pill">Cancelled order</span>':'')+'</div>'+(rf.note?'<div class="meta">Note: '+esc(rf.note)+'</div>':'')+
    (rf.status==="Approved"?'<div class="okline">Refunded '+NGN(rf.amount)+' on '+fmtShort(rf.approvedAt)+'</div>':'')+
    (mode==="approve"&&rf.status==="Confirmed"?'<div class="inline"><label class="ck">Refund ₦ <input id="ra-'+esc(o.id)+'" type="number" min="0" step="100" max="'+o.total+'" value="'+(Number(rf.amount)||o.total)+'" style="width:130px"></label>'+
      '<button class="btn btn-gold btn-sm" data-act="a-refund-approve" data-id="'+esc(o.id)+'">Approve refund</button><button class="btn btn-line btn-sm" data-act="a-refund-decline" data-id="'+esc(o.id)+'">Decline</button></div>':'')+'</article>';
}
function subRefunds(){
  if(loadingNote())return '<p>Loading…</p>';
  var all=(A.orders||[]).filter(function(o){return o.refund}),
      wait=all.filter(function(o){return o.refund.status==="Confirmed"}),
      done=all.filter(function(o){return o.refund.status==="Approved"||o.refund.status==="Declined"}),
      early=all.filter(function(o){return o.refund.status==="Requested"});
  return '<p class="muted" style="margin:0">Logistics confirms that a customer has a real issue. Once confirmed it appears here for you to approve. Approved refunds come out of the company balance.</p>'+
    '<h2 class="sub-h">Waiting for your approval ('+wait.length+')</h2>'+(wait.length?wait.map(function(o){return refundCard(o,"approve")}).join(""):'<div class="item"><span class="muted">Nothing waiting.</span></div>')+
    (early.length?'<h2 class="sub-h">Still being checked by Logistics ('+early.length+')</h2>'+early.map(function(o){return refundCard(o,"view")}).join(""):'')+
    '<h2 class="sub-h">History</h2>'+(done.length?done.map(function(o){return refundCard(o,"view")}).join(""):'<div class="item"><span class="muted">No refunds yet.</span></div>');
}
function subStatements(){
  if(loadingNote())return '<p>Loading…</p>';
  var ds=dataset(),d=statementData(ds,A.stmt);
  return demoBar(ds)+'<section class="pnl"><h2>Financial statement</h2><div class="inline"><label class="sr" for="stp">Period</label><select id="stp" data-chg="a-stmt">'+opts([["month","This month"],["last","Last month"],["year","This year"],["all","All time"]],A.stmt)+'</select></div>'+
    '<div class="kpis">'+kpi("Period",esc(d.r.l))+kpi("Cash in",NGN(d.cin))+kpi("Cash out",NGN(d.cout))+kpi("Net cash",NGN(d.net))+'</div>'+
    '<div class="inline"><button class="btn btn-gold" data-act="a-download">Download statement (CSV)</button></div>'+
    '<p class="meta muted" style="margin:0">Opens in Excel, Numbers and Google Sheets. It lists every payment in and out for the period, then sales by section.</p></section>'+
    '<section class="pnl"><h2>Transactions</h2>'+(d.ev.length?'<div class="tblw"><table class="tbl"><thead><tr><th>Date</th><th>Description</th><th class="n">In</th><th class="n">Out</th></tr></thead><tbody>'+d.ev.slice(-40).reverse().map(function(x){return '<tr><td>'+fmtShort(x.d)+'</td><td>'+esc(x.label)+' <span class="pill">'+esc(x.kind)+'</span></td><td class="n">'+(x.t==="in"?NGN(x.amt):"")+'</td><td class="n">'+(x.t==="out"?NGN(x.amt):"")+'</td></tr>'}).join("")+'</tbody></table></div>':'<p class="muted" style="margin:0">No transactions in this period.</p>')+'</section>';
}
function subBank(){
  var d=dr("bank",{bankName:S.site.bankName,accountNumber:S.site.accountNumber,accountName:S.site.accountName,payLink:S.site.payLink});
  return '<div class="spec"><b>Shown to customers at checkout</b><span>These details appear when a customer picks bank transfer, with a Copy button and a Pay button that opens the link below.</span></div>'+
    '<section class="panel"><div class="two">'+field("bank","bk-n","Bank name","bankName","text",d.bankName)+field("bank","bk-a","Account number","accountNumber","text",d.accountNumber,'inputmode="numeric"')+'</div>'+
    '<div class="two">'+field("bank","bk-c","Account name","accountName","text",d.accountName)+field("bank","bk-l","Pay button link (OPay)","payLink","url",d.payLink)+'</div>'+
    (S.site.accountNumber===DEF_SITE.accountNumber?'<p class="tag-ph">Placeholder account details are showing now. Replace them before you go live.</p>':'')+
    '<div class="inline"><button class="btn btn-gold" data-act="a-save" data-v="bank">Save account details</button></div></section>';
}
function subEntries(){
  var ds=dataset(),led=ds.ledger.slice().sort(function(a,b){return String(b.date).localeCompare(String(a.date))});
  return demoBar(ds)+'<section class="pnl"><h2>Add expense or other income</h2>'+(A.demo?'<p class="muted" style="margin:0">Hide sample data to add real entries.</p>':
    '<form id="lform" class="grid" style="grid-template-columns:1fr;gap:10px" novalidate><div class="two"><div class="fld"><label for="l-type">Type</label><select id="l-type" name="type"><option value="expense">Expense</option><option value="income">Other income</option></select></div><div class="fld"><label for="l-date">Date</label><input id="l-date" name="date" type="date" required value="'+new Date().toISOString().slice(0,10)+'"></div></div>'+
    '<div class="fld"><label for="l-label">What for</label><input id="l-label" name="label" required placeholder="Fabric, rent, ads, delivery"></div><div class="fld"><label for="l-amt">Amount (₦)</label><input id="l-amt" name="amount" type="number" min="1" step="100" required></div>'+
    '<button class="btn btn-gold" type="submit">Add entry</button></form>')+'</section>'+
    '<section class="pnl"><h2>Entries</h2>'+(led.length?'<div class="tblw"><table class="tbl"><thead><tr><th>Date</th><th>What for</th><th class="n">Amount</th><th></th></tr></thead><tbody>'+led.slice(0,40).map(function(l){return '<tr><td>'+esc(l.date)+'</td><td>'+esc(l.label)+' <span class="pill">'+(l.type==="income"?"Income":"Expense")+'</span></td><td class="n">'+NGN(l.amount)+'</td><td>'+(A.demo?'':'<button class="link" data-act="a-ldel" data-id="'+esc(l._id)+'">Delete</button>')+'</td></tr>'}).join("")+'</tbody></table></div>':'<p class="muted" style="margin:0">No entries yet.</p>')+'</section>';
}

/* ----- PR ----- */
function bannerSlots(){var b=S.banners&&S.banners.length?S.banners:[],o=[0,1,2].map(function(i){var x=b[i];return x&&x.mediaId&&(!x.type||x.type==="video")?x:{mediaId:"",repeats:2}});return o}
function subBanners(){
  var slots=bannerSlots();
  return '<div class="spec"><b>Top banner videos</b><span>Upload a short video for each banner. Videos play by themselves with no play button and no sound, repeat the number of times you set, then slide to the next banner. Use MP4 or WebM, a wide 8:3 shape, under 15 seconds and under 20 MB. A banner with no video shows a placeholder animation.</span></div>'+
    slots.map(function(s,i){
      return '<article class="item"><div class="item-head"><b>Banner '+(i+1)+'</b>'+(s.mediaId?'<span class="pill live">Video live</span>':'<span class="tag-ph">Placeholder</span>')+'</div>'+
        '<div class="upl-big">'+(s.mediaId?'<video muted playsinline autoplay loop preload="auto" src="'+BLOB+esc(s.mediaId)+'"></video>':'<span>No video yet</span>')+'</div>'+
        '<div class="inline">'+(cloud.assets?'<label class="btn btn-gold btn-sm" for="bu-'+i+'">'+(s.mediaId?"Replace video":"Upload video")+'</label><input id="bu-'+i+'" type="file" accept="video/mp4,video/webm" class="sr" data-banner="'+i+'">':'<span class="muted">Uploads need the editor view.</span>')+
        (s.mediaId?'<button class="btn btn-line btn-sm" data-act="a-bremove" data-i="'+i+'">Remove video</button><label class="ck">Plays <input type="number" min="1" max="10" value="'+(s.repeats||2)+'" data-chg="a-brepeat" data-i="'+i+'" style="width:70px"> times</label>':'')+'</div></article>'}).join("");
}
function subModels(){
  var m=S.site.models||[];
  return '<div class="spec"><b>Model pictures on the home page</b><span>Upload up to 4 pictures of models wearing your clothes. Portrait 3:4, for example 1200 × 1600 px. JPG, PNG or WebP, up to 10 MB each. Slots with no picture show a placeholder garment.</span></div>'+
    '<div class="slots">'+[0,1,2,3].map(function(i){
      var id=m[i];
      return '<article class="item"><div class="item-head"><b>Model '+(i+1)+'</b>'+(id?'<span class="pill live">Picture live</span>':'<span class="tag-ph">Placeholder</span>')+'</div>'+
        '<div class="upl-big tall">'+(id?'<img src="'+BLOB+esc(id)+'" alt="Model '+(i+1)+'">':'<span>No picture yet</span>')+'</div>'+
        '<div class="inline">'+(cloud.assets?'<label class="btn btn-gold btn-sm" for="mu-'+i+'">'+(id?"Replace picture":"Upload picture")+'</label><input id="mu-'+i+'" type="file" accept="image/*" class="sr" data-model="'+i+'">':'<span class="muted">Uploads need the editor view.</span>')+
        (id?'<button class="btn btn-line btn-sm" data-act="a-mremove" data-i="'+i+'">Remove</button>':'')+'</div></article>'}).join("")+'</div>';
}

/* ----- logistics ----- */
function orderCard(o){
  var cancelling=A.cancelId===o.id,locked=o.status==="Cancelled";
  return '<article class="item"><div class="item-head"><b>'+esc(o.id)+'</b><span class="pill">'+esc(o.status)+'</span></div>'+
    '<div class="meta">'+fmtDate(o.createdAt)+' · '+esc(o.name)+' · '+esc(o.phone)+' · '+NGN(o.total)+'</div>'+
    '<div>'+(o.lines||[]).map(function(l){return '<div class="row"><span>'+esc(l.name)+' <span class="meta">(Size '+esc(l.size)+') × '+l.qty+'</span></span><span>'+NGN(l.price*l.qty)+'</span></div>'}).join("")+'</div>'+
    '<div class="meta">'+(o.ship==="pickup"?"Store pickup":"Deliver to: "+esc(o.addr)+", "+esc(o.city)+", "+esc(o.state))+' · Pay: '+esc(o.pay)+(o.fee?' · Delivery '+NGN(o.fee):'')+(o.note?'<br>Note: '+esc(o.note):'')+(o.cancelReason?'<br>Cancelled: '+esc(o.cancelReason):'')+'</div>'+
    (o.proof?'<div class="proofprev big"><img src="'+o.proof+'" alt="Payment screenshot for '+esc(o.id)+'"></div>':'')+(o.card?'<div class="meta">Card: '+esc(o.card.brand)+' ending '+esc(o.card.last4)+' (prototype, not charged)</div>':'')+
    (locked?'':'<div class="fld"><label for="ot-'+esc(o.id)+'">Tracking update shown to the customer</label><input id="ot-'+esc(o.id)+'" data-chg="a-otrack" data-id="'+esc(o.id)+'" value="'+esc(o.trackNote||"")+'" placeholder="Example: Left our warehouse, arriving Tuesday"></div>')+
    '<div class="inline">'+(o.status==="New"?'<button class="btn btn-gold btn-sm" data-act="a-confirm" data-id="'+esc(o.id)+'">Confirm order</button>':'')+
    (locked?'':'<label class="sr" for="os-'+esc(o.id)+'">Status</label><select id="os-'+esc(o.id)+'" data-chg="a-ostatus" data-id="'+esc(o.id)+'">'+opts(ORDER_STATUS.filter(function(s){return s!=="Cancelled"}),o.status)+'</select>')+
    '<label class="sr" for="op-'+esc(o.id)+'">Payment</label><select id="op-'+esc(o.id)+'" data-chg="a-opay" data-id="'+esc(o.id)+'">'+opts(PAY_STATUS,o.payStatus)+'</select>'+
    '<a class="btn btn-line btn-sm" target="_blank" rel="noopener" href="'+esc(waLink(o.phone,"Hello "+o.name+", this is WEAR ME about your order "+o.id+"."))+'">WhatsApp</a>'+
    (!locked&&!cancelling&&o.status!=="Delivered"?'<button class="btn btn-danger btn-sm" data-act="a-cancel-open" data-id="'+esc(o.id)+'">Cancel order</button>':'')+'</div>'+
    (cancelling?'<div class="fld"><label for="cr-'+esc(o.id)+'">Reason for cancelling</label><input id="cr-'+esc(o.id)+'" placeholder="Item unavailable, customer asked, payment not received"></div><div class="inline"><button class="btn btn-danger btn-sm" data-act="a-cancel-do" data-id="'+esc(o.id)+'">Confirm cancellation</button><button class="btn btn-line btn-sm" data-act="a-cancel-close">Keep order</button></div><p class="meta muted" style="margin:0">If the customer already paid, a refund goes to Finance for approval.</p>':'')+'</article>';
}
function subOrders(){
  if(loadingNote())return '<p>Loading orders…</p>';
  var list=(A.orders||[]).slice().sort(function(a,b){return t(b.createdAt)-t(a.createdAt)});
  if(A.orderFilter!=="all")list=list.filter(function(o){return o.status===A.orderFilter});
  return '<div class="inline"><label class="sr" for="of">Filter</label><select id="of" data-chg="a-ofilter">'+opts([["all","All orders"]].concat(ORDER_STATUS.map(function(s){return [s,s]})),A.orderFilter)+'</select><span class="muted">'+list.length+' shown</span></div>'+
    (list.length?list.map(orderCard).join(""):'<div class="item"><span class="muted">No orders to show.</span></div>');
}
function issueCard(o){
  var rf=o.refund,rej=A.rejectId===o.id;
  return '<article class="item"><div class="item-head"><b>'+esc(o.id)+' · '+esc(o.name)+'</b><span class="pill">'+esc(rf.status)+'</span></div>'+
    '<div class="meta">'+fmtDate(rf.at||o.createdAt)+' · '+esc(o.phone)+' · Order total '+NGN(o.total)+'</div><div><b>Customer says:</b> '+esc(rf.reason||"")+'</div>'+(rf.note?'<div class="meta">Note: '+esc(rf.note)+'</div>':'')+
    (rf.status==="Requested"&&!rej?'<div class="inline"><button class="btn btn-gold btn-sm" data-act="a-issue-confirm" data-id="'+esc(o.id)+'">Confirm issue</button><button class="btn btn-line btn-sm" data-act="a-issue-reject-open" data-id="'+esc(o.id)+'">Reject</button><a class="btn btn-line btn-sm" target="_blank" rel="noopener" href="'+esc(waLink(o.phone,"Hello "+o.name+", this is WEAR ME about the problem you reported on order "+o.id+"."))+'">WhatsApp</a></div>':'')+
    (rej?'<div class="fld"><label for="rj-'+esc(o.id)+'">Why is it rejected?</label><input id="rj-'+esc(o.id)+'" placeholder="Shown to the customer"></div><div class="inline"><button class="btn btn-danger btn-sm" data-act="a-issue-reject-do" data-id="'+esc(o.id)+'">Reject request</button><button class="btn btn-line btn-sm" data-act="a-cancel-close">Back</button></div>':'')+
    (rf.status==="Confirmed"?'<p class="okline" style="margin:0">Issue confirmed. Finance can approve the refund.</p>':'')+'</article>';
}
function subIssues(){
  if(loadingNote())return '<p>Loading…</p>';
  var all=(A.orders||[]),rf=all.filter(function(o){return o.refund}),
      need=rf.filter(function(o){return o.refund.status==="Requested"}),rest=rf.filter(function(o){return o.refund.status!=="Requested"}),
      canc=all.filter(function(o){return o.status==="Cancelled"});
  return '<p class="muted" style="margin:0">Customers report problems from My orders. Check each one, then confirm or reject it. Confirmed issues go to Finance for refund approval.</p>'+
    '<h2 class="sub-h">Needs your review ('+need.length+')</h2>'+(need.length?need.map(issueCard).join(""):'<div class="item"><span class="muted">Nothing to review.</span></div>')+
    '<h2 class="sub-h">Already handled ('+rest.length+')</h2>'+(rest.length?rest.map(issueCard).join(""):'<div class="item"><span class="muted">None yet.</span></div>')+
    '<h2 class="sub-h">Cancelled orders ('+canc.length+')</h2>'+(canc.length?canc.map(function(o){return '<div class="item"><div class="item-head"><b>'+esc(o.id)+' · '+esc(o.name)+'</b><span class="muted">'+NGN(o.total)+'</span></div><div class="meta">'+esc(o.cancelReason||"No reason given")+(o.refund?' · Refund '+esc(o.refund.status).toLowerCase():'')+'</div></div>'}).join(""):'<div class="item"><span class="muted">None.</span></div>');
}
function subDelivery(){
  var d=dr("delivery",{deliveryFee:S.site.deliveryFee,freeAbove:S.site.freeAbove});
  return '<div class="spec"><b>Delivery fees</b><span>Customers see the fee at checkout. Store pickup is always free.</span></div><section class="panel"><div class="two">'+
    field("delivery","dl-f","Home delivery fee (₦)","deliveryFee","number",d.deliveryFee,'min="0" step="100"')+field("delivery","dl-a","Free delivery above (₦)","freeAbove","number",d.freeAbove,'min="0" step="1000"')+'</div><p class="meta muted" style="margin:0">Use 0 for free delivery, and 0 to switch off the free-delivery limit.</p>'+
    '<div class="inline"><button class="btn btn-gold" data-act="a-save" data-v="delivery">Save delivery fees</button></div></section>';
}

/* ----- customer service ----- */
function subContact(){
  var d=dr("contact",{phone:S.site.phone,email:S.site.email,address:S.site.address,whatsapp:S.site.whatsapp,contacts:(S.site.contacts||[]).length?S.site.contacts:DEF_SITE.contacts});
  return '<section class="panel"><h3>Company contact</h3><div class="two">'+field("contact","ct-p","Phone number","phone","tel",d.phone)+field("contact","ct-e","Email","email","email",d.email)+'</div>'+
    field("contact","ct-a","Location","address","text",d.address)+
    field("contact","ct-w","Chat with us number (WhatsApp)","whatsapp","tel",d.whatsapp)+'<p class="meta muted" style="margin:0">The Chat with us link in the footer and the Sew with us redirect open this number on WhatsApp. Write it like 0904 843 1819.</p></section>'+
    '<section class="panel"><h3>Who to contact, and why</h3><p class="meta muted" style="margin:0">Each line shows on the store as, for example, “For enquiries contact: 0801 234 5678”. Add as many reasons as you need.</p>'+
    d.contacts.map(function(c,i){return '<div class="two rowline"><div class="fld"><label for="cr'+i+'">Reason</label><input id="cr'+i+'" data-d="contact|contacts.'+i+'.reason" value="'+esc(c.reason)+'" placeholder="Enquiries, complaints, orders"></div><div class="fld"><label for="cn'+i+'">Number</label><input id="cn'+i+'" type="tel" data-d="contact|contacts.'+i+'.number" value="'+esc(c.number)+'"></div><button class="link" data-act="a-delrow" data-v="contacts" data-i="'+i+'">Remove</button></div>'}).join("")+
    '<div class="inline"><button class="btn btn-line btn-sm" data-act="a-addrow" data-v="contacts">Add a reason</button></div></section>'+
    '<div class="inline"><button class="btn btn-gold" data-act="a-save" data-v="contact">Save contact details</button></div>';
}
function subSocial(){
  var d=dr("social",{socials:(S.site.socials||[])});
  return '<div class="spec"><b>Social handles</b><span>These show in the store footer and on the Contact us page as links. Type the handle with or without the @.</span></div><section class="panel">'+
    (d.socials.length?d.socials.map(function(s,i){return '<div class="two rowline"><div class="fld"><label for="sp'+i+'">Platform</label><select id="sp'+i+'" data-d="social|socials.'+i+'.platform">'+opts(SOCIALS.map(function(x){return x[0]}),s.platform)+'</select></div><div class="fld"><label for="sh'+i+'">Handle</label><input id="sh'+i+'" data-d="social|socials.'+i+'.handle" value="'+esc(s.handle)+'" placeholder="@wearme"></div><button class="link" data-act="a-delrow" data-v="socials" data-i="'+i+'">Remove</button></div>'}).join(""):'<p class="muted" style="margin:0">No handles yet.</p>')+
    '<div class="inline"><button class="btn btn-line btn-sm" data-act="a-addrow" data-v="socials">Add a handle</button><button class="btn btn-gold btn-sm" data-act="a-save" data-v="social">Save handles</button></div></section>';
}

/* ----- legal ----- */
function subLegal(key){
  var lab="";LEGAL_KEYS.forEach(function(k){if(k[0]===key)lab=k[1]});
  var d=dr("legal",LEGAL_KEYS.reduce(function(o,k){o[k[0]]=legalText(k[0]);return o},{}));
  return '<div class="spec"><b>Starter text</b><span>Until you save your own wording, customers see starter text. Write this to match how you run your business, and have a lawyer check it before you go live. A line starting with # becomes a heading. Leave a blank line between paragraphs.</span></div>'+
    '<section class="panel"><h3>'+esc(lab)+'</h3><div class="fld"><label class="sr" for="lg-'+key+'">'+esc(lab)+'</label><textarea id="lg-'+key+'" rows="16" data-d="legal|'+key+'">'+esc(d[key])+'</textarea></div>'+
    '<div class="inline"><button class="btn btn-gold" data-act="a-save" data-v="legal" data-id="'+key+'">Save</button><a class="btn btn-line" href="index.html#legal-'+key+'" target="_blank">See it on the store</a></div></section>';
}

/* ----- my account ----- */
function subProfile(){
  var p=(A.acc&&A.acc.profile)||{};
  return '<section class="panel"><h3>Your details</h3><form id="admprofile2" novalidate class="authform"><div class="two"><div class="fld"><label for="q-name">Full name</label><input id="q-name" name="name" required value="'+esc(p.name||"")+'"></div><div class="fld"><label for="q-dob">Date of birth</label><input id="q-dob" name="dob" type="date" value="'+esc(p.dob||"")+'"></div></div>'+
    '<div class="two"><div class="fld"><label for="q-phone">Phone number</label><input id="q-phone" name="phone" type="tel" value="'+esc(p.phone||"")+'"></div><div class="fld"><label for="q-role">Role</label><input id="q-role" name="role" value="'+esc(p.role||"")+'"></div></div>'+
    '<div class="fld"><label>Login email</label><input value="'+esc(A.acc.email)+'" disabled></div><div class="note-err" id="auth-err" role="alert"></div>'+
    '<div class="inline"><button class="btn btn-gold" type="submit">Save profile</button><button type="button" class="btn btn-line" data-act="a-lock">Log out</button></div></form></section>';
}
function subPassword(){
  return '<section class="panel"><h3>Change password</h3><form id="pwform" novalidate class="authform"><div class="fld"><label for="w-old">Current password</label><input id="w-old" name="old" type="password" autocomplete="current-password" required></div>'+
    '<div class="two"><div class="fld"><label for="w-new">New password (8 or more characters)</label><input id="w-new" name="pw" type="password" autocomplete="new-password" minlength="8" required></div><div class="fld"><label for="w-new2">Repeat new password</label><input id="w-new2" name="pw2" type="password" autocomplete="new-password" required></div></div>'+
    '<div class="note-err" id="auth-err" role="alert"></div><div class="inline"><button class="btn btn-gold" type="submit">Change password</button></div></form></section>';
}

/* ----- p5b ----- */
/* ===== admin actions and events ===== */
async function adminSave(fn,okMsg){
  var ok=await dbWrite(fn);
  toast(ok?(okMsg||"Saved"):"Could not save. Check you are signed in as the owner.");
  return ok;
}
async function seedProducts(){
  A.busy="seed";render();
  var fails=0;
  for(var i=0;i<DEFAULTS.length;i++){var p=DEFAULTS[i];var ok=await dbWrite(function(){return cloud.db.doc("products/"+p.id).set(p)});if(!ok)fails++}
  A.busy="";toast(fails?"Some products did not load. Try again.":"Starter products loaded");render();
}
async function uploadTo(file){
  if(!cloud.assets)throw new Error("noassets");
  return await cloud.assets.upload(file);
}
function closeProduct(){A.edit=null;$("#layers").innerHTML="";document.body.classList.remove("lock")}
function readDraft(name){return A.dr&&A.dr[name]}
function saveBanners(list){return adminSave(function(){return cloud.db.doc("settings/banners").set({items:list})},"Banner saved")}
function setRefund(id,patch,extra,msg){
  var o=ordById(id);if(!o)return;
  var rf=Object.assign({},o.refund||{},patch),up=Object.assign({refund:rf},extra||{});
  return adminSave(function(){return cloud.db.doc("orders/"+id).update(up)},msg);
}
function adminClick(a,g,tEl){
  if(a==="a-range"){A.range=g("data-v");render();return true}
  if(a==="a-pie"){A.pie=g("data-v");render();return true}
  if(a==="a-gran"){A.gran=g("data-v");render();return true}
  if(a==="a-demo"){A.demo=!A.demo;render();return true}
  if(a==="a-eye"){A.eye=!A.eye;render();return true}
  if(a==="a-download"){downloadStatement();return true}
  if(a==="a-retry"){A.status=undefined;render();return true}
  if(a==="a-lock"){lockAdmin();A.dr=null;render();return true}
  if(a==="a-seed"){seedProducts();return true}
  if(a==="a-padd"){
    var nid=allProducts().reduce(function(m,p){return Math.max(m,+p.id)},0)+1;
    A.edit={isNew:true,p:{id:nid,name:"",cat:"senators",price:0,color:"#1f2f4f",tags:[],desc:"",sizes:SIZES.senators.slice(),image:"",active:true,soldOut:false,sizeGuide:true}};openProductModal();return true;
  }
  if(a==="a-pedit"){var pp=byId(g("data-id"));if(pp){A.edit={isNew:false,p:JSON.parse(JSON.stringify(pp))};openProductModal()}return true}
  if(a==="a-pclose"){closeProduct();return true}
  if(a==="a-pimgrm"){A.edit.p=readProductForm($("#pform"));A.edit.p.image="";openProductModal();return true}
  if(a==="a-pdel"){
    if(!A.edit.confirmDel){A.edit.p=readProductForm($("#pform"));A.edit.confirmDel=true;openProductModal();return true}
    var did=A.edit.p.id;
    adminSave(function(){return cloud.db.doc("products/"+did).delete()},"Product deleted").then(function(ok){if(ok)closeProduct()});return true;
  }
  if(a==="a-ldel"){var lid=g("data-id");adminSave(function(){return cloud.db.doc("ledger/"+lid).delete()},"Entry deleted");return true}
  if(a==="a-addrow"){
    var k=g("data-v"),d=A.dr&&A.dr[k==="contacts"?"contact":"social"];if(!d)return true;
    if(k==="contacts")d.contacts.push({reason:"",number:""});else d.socials.push({platform:"Instagram",handle:""});
    render();return true;
  }
  if(a==="a-delrow"){
    var k2=g("data-v"),d2=A.dr&&A.dr[k2==="contacts"?"contact":"social"];if(!d2)return true;
    d2[k2].splice(+g("data-i"),1);render();return true;
  }
  if(a==="a-guide-reset"){var c=g("data-id");A.dr.guide[c]=GUIDE_DEF[c]||"";render();return true}
  if(a==="a-save"){
    var v=g("data-v"),id=g("data-id");
    if(v==="guide"){var sg=Object.assign({},S.site.sizeGuides||{});sg[id]=A.dr.guide[id];saveSite({sizeGuides:sg},"Size guide saved");return true}
    if(v==="bank"){var b=A.dr.bank;saveSite({bankName:b.bankName.trim(),accountNumber:String(b.accountNumber).trim(),accountName:b.accountName.trim(),payLink:b.payLink.trim()},"Account details saved");return true}
    if(v==="delivery"){var dl=A.dr.delivery;saveSite({deliveryFee:Math.max(0,Number(dl.deliveryFee)||0),freeAbove:Math.max(0,Number(dl.freeAbove)||0)},"Delivery fees saved");return true}
    if(v==="contact"){var c2=A.dr.contact;saveSite({phone:c2.phone.trim(),email:c2.email.trim(),address:c2.address.trim(),whatsapp:String(c2.whatsapp).replace(/[^\d]/g,"").replace(/^0/,"234"),contacts:c2.contacts.filter(function(x){return x.reason||x.number})},"Contact details saved");return true}
    if(v==="social"){saveSite({socials:A.dr.social.socials.filter(function(x){return x.handle.trim()})},"Handles saved");return true}
    if(v==="legal"){var lg=Object.assign({},S.site.legal||{});lg[id]=A.dr.legal[id];saveSite({legal:lg},"Saved");return true}
    return true;
  }
  if(a==="a-bremove"){
    var i=+g("data-i"),cur=bannerSlots().map(function(x){return Object.assign({},x)});cur[i]={mediaId:"",repeats:2};saveBanners(cur);return true;
  }
  if(a==="a-mremove"){var mi=+g("data-i"),m=(S.site.models||["","","",""]).slice();m[mi]="";saveSite({models:m},"Picture removed");return true}
  if(a==="a-confirm"){var cid=g("data-id"),sa={Confirmed:new Date().toISOString()},o=ordById(cid);adminSave(function(){return cloud.db.doc("orders/"+cid).update({status:"Confirmed",statusAt:Object.assign({},o&&o.statusAt,sa)})},"Order confirmed");return true}
  if(a==="a-cancel-open"){A.cancelId=g("data-id");render();return true}
  if(a==="a-cancel-close"){A.cancelId="";A.rejectId="";render();return true}
  if(a==="a-cancel-do"){
    var oid=g("data-id"),o2=ordById(oid),why=($("#cr-"+oid)||{}).value||"",up={status:"Cancelled",cancelReason:why.trim()||"Cancelled by store",statusAt:Object.assign({},o2&&o2.statusAt,{Cancelled:new Date().toISOString()})};
    if(o2&&o2.payStatus==="Paid"&&!o2.refund)up.refund={status:"Confirmed",source:"cancellation",reason:"Order cancelled: "+up.cancelReason,amount:o2.total,at:new Date().toISOString()};
    A.cancelId="";adminSave(function(){return cloud.db.doc("orders/"+oid).update(up)},"Order cancelled");return true;
  }
  if(a==="a-issue-confirm"){var o3=ordById(g("data-id"));setRefund(g("data-id"),{status:"Confirmed",amount:o3?o3.total:0,confirmedAt:new Date().toISOString()},null,"Issue confirmed. Sent to Finance.");return true}
  if(a==="a-issue-reject-open"){A.rejectId=g("data-id");render();return true}
  if(a==="a-issue-reject-do"){var rid=g("data-id"),rw=($("#rj-"+rid)||{}).value||"";A.rejectId="";setRefund(rid,{status:"Declined",declineReason:rw.trim()},null,"Request rejected");return true}
  if(a==="a-refund-approve"){
    var fid=g("data-id"),fo=ordById(fid),amt=Math.min(fo?fo.total:0,Math.max(0,Number(($("#ra-"+fid)||{}).value)||0));
    if(!amt){toast("Enter a refund amount.");return true}
    setRefund(fid,{status:"Approved",amount:amt,approvedAt:new Date().toISOString()},{payStatus:"Refunded"},"Refund approved");return true;
  }
  if(a==="a-refund-decline"){setRefund(g("data-id"),{status:"Declined",declineReason:"Declined by finance"},null,"Refund declined");return true}
  return false;
}
function adminChange(el){
  var c=el.getAttribute&&el.getAttribute("data-chg"),id=el.getAttribute&&el.getAttribute("data-id"),i=el.getAttribute&&el.getAttribute("data-i");
  if(c==="a-ofilter"){A.orderFilter=el.value;render();return true}
  if(c==="a-stmt"){A.stmt=el.value;render();return true}
  if(c==="a-ostatus"){var o=ordById(id),sa=Object.assign({},o&&o.statusAt);sa[el.value]=new Date().toISOString();adminSave(function(){return cloud.db.doc("orders/"+id).update({status:el.value,statusAt:sa})});return true}
  if(c==="a-otrack"){adminSave(function(){return cloud.db.doc("orders/"+id).update({trackNote:el.value.trim()})},"Update saved");return true}
  if(c==="a-opay"){var up={payStatus:el.value};if(el.value==="Paid")up.paidAt=new Date().toISOString();adminSave(function(){return cloud.db.doc("orders/"+id).update(up)});return true}
  if(c==="a-sstatus"){adminSave(function(){return cloud.db.doc("styling/"+id).update({status:el.value})});return true}
  if(c==="a-squote"){adminSave(function(){return cloud.db.doc("styling/"+id).update({quote:Math.max(0,Number(el.value)||0)})});return true}
  if(c==="a-spaid"){var su={paid:el.checked};if(el.checked)su.paidAt=new Date().toISOString();adminSave(function(){return cloud.db.doc("styling/"+id).update(su)});return true}
  if(c==="a-price"){adminSave(function(){return cloud.db.doc("products/"+id).update({price:Math.max(0,Number(el.value)||0)})},"Price updated");return true}
  if(c==="a-pactive"){adminSave(function(){return cloud.db.doc("products/"+id).update({active:el.checked})});return true}
  if(c==="a-brepeat"){var cur=bannerSlots().map(function(x){return Object.assign({},x)});cur[+i].repeats=Math.min(10,Math.max(1,Number(el.value)||2));saveBanners(cur);return true}
  if(el.id==="pf-file"&&A.edit){
    var f=el.files&&el.files[0];if(!f)return true;
    var er=$("#pf-err");
    if(f.size>10*1048576){if(er)er.textContent="That picture is over 10 MB. Choose a smaller one.";el.value="";return true}
    if(er)er.textContent="Uploading…";
    uploadTo(f).then(function(r){A.edit.p=readProductForm($("#pform"));A.edit.p.image=r.id;openProductModal()}).catch(function(){var e2=$("#pf-err");if(e2)e2.textContent="Upload failed. Use a JPG, PNG or WebP under 10 MB."});
    el.value="";return true;
  }
  var bn=el.getAttribute&&el.getAttribute("data-banner");
  if(bn!==null&&bn!==undefined&&bn!==""){
    var bf=el.files&&el.files[0];if(!bf)return true;
    if(bf.size>20*1048576){toast("That video is over 20 MB. Choose a smaller or shorter one.");el.value="";return true}
    toast("Uploading video…");var bi=+bn;
    uploadTo(bf).then(function(r){var cur=bannerSlots().map(function(x){return Object.assign({},x)});cur[bi]={mediaId:r.id,repeats:cur[bi].repeats||2};return saveBanners(cur)}).catch(function(){toast("Upload failed. Use an MP4 or WebM under 20 MB.")});
    el.value="";return true;
  }
  var md=el.getAttribute&&el.getAttribute("data-model");
  if(md!==null&&md!==undefined&&md!==""){
    var mf=el.files&&el.files[0];if(!mf)return true;
    if(mf.size>10*1048576){toast("That picture is over 10 MB. Choose a smaller one.");el.value="";return true}
    toast("Uploading picture…");var mi=+md;
    uploadTo(mf).then(function(r){var m=(S.site.models||["","","",""]).slice();while(m.length<4)m.push("");m[mi]=r.id;return saveSite({models:m},"Model "+(mi+1)+" saved")}).catch(function(){toast("Upload failed. Use a JPG, PNG or WebP under 10 MB.")});
    el.value="";return true;
  }
  if(el.getAttribute&&el.getAttribute("data-d")){adminInput(el);if(el.tagName==="SELECT")render();return true}
  return false;
}
function adminInput(el){
  var dd=el.getAttribute&&el.getAttribute("data-d");
  if(dd){var p=dd.split("|"),d=A.dr&&A.dr[p[0]];if(d)setPath(d,p[1],el.type==="number"?el.value:el.value);return true}
  if(el.getAttribute&&el.getAttribute("data-inp")==="a-pq"){A.pq=el.value;var pos=el.selectionStart;render();var n=$("#pq");if(n){n.focus();n.setSelectionRange(pos,pos)}return true}
  return false;
}
async function adminSubmit(f){
  var id=f.id;
  if(id==="admcreate"||id==="admlogin"){
    var btn=f.querySelector("button[type=submit]");if(btn)btn.disabled=true;
    var em=String(new FormData(f).get("email")||"");
    var err=id==="admcreate"?await createAccount(f):await loginAdmin(f);
    A.authErr=err;render();if(err){var ei=$("#c-email")||$("#a-email");if(ei)ei.value=em}return true;
  }
  if(id==="admprofile"||id==="admprofile2"){
    var d=new FormData(f),pr={name:String(d.get("name")||"").trim(),dob:String(d.get("dob")||""),phone:String(d.get("phone")||"").trim(),role:String(d.get("role")||"").trim()};
    if(!pr.name){A.profErr="Enter your name.";render();return true}
    A.profErr="";
    var ok=await adminSave(function(){return wmAdmin.saveProfile(pr)},"Profile saved");
    if(ok){A.acc.profile=pr;if(id==="admprofile")location.hash="#admin-sales";render()}return true;
  }
  if(id==="pwform"){
    var w=new FormData(f),old=String(w.get("old")),pw=String(w.get("pw")),pw2=String(w.get("pw2")),er=$("#auth-err");
    var msg=pw.length<8?"Use at least 8 characters.":pw!==pw2?"The two new passwords do not match.":"";
    if(msg){er.textContent=msg;return true}
    try{await wmAdmin.changePassword(old,pw);toast("Password changed");f.reset();er.textContent=""}
    catch(e){er.textContent=wmErr(e)}
    return true;
  }
  if(id==="pform"){
    var p=readProductForm(f);
    if(!p.name){$("#pf-err").textContent="Give the product a name.";return true}
    adminSave(function(){return cloud.db.doc("products/"+p.id).set(p)},"Product saved").then(function(ok){if(ok)closeProduct()});return true;
  }
  if(id==="lform"){
    if(!f.checkValidity()){f.reportValidity();return true}
    var l=new FormData(f),lid="L"+Date.now();
    adminSave(function(){return cloud.db.doc("ledger/"+lid).set({type:String(l.get("type")),date:String(l.get("date")),label:String(l.get("label")).trim(),amount:Math.max(0,Number(l.get("amount"))||0)})},"Entry added").then(function(ok){if(ok)f.reset()});return true;
  }
  return false;
}

/* ----- p5 ----- */
/* ===== events ===== */
document.addEventListener("click",function(e){
  if(S.ddOpen&&!e.target.closest(".ddwrap")){S.ddOpen=false;rerenderKeepScroll()}
  var tEl=e.target.closest("[data-act]");if(!tEl)return;
  var a=tEl.getAttribute("data-act"),g=function(k){return tEl.getAttribute(k)};
  /* store */
  if(a==="close-layers"){
    if(tEl.classList.contains("modal")&&e.target!==tEl)return;
    S.menu=false;S.cartOpen=false;S.qv=null;S.auth.open=false;layers();return;
  }
  if(storeAct(a,g,tEl))return;
  if(a==="menu-open"){S.menu=true;layers();return}
  if(a==="cart-open"){S.cartOpen=true;layers();return}
  if(a==="close-go"){S.menu=false;S.cartOpen=false;S.qv=null;layers();go(g("data-to"));return}
  if(a==="dd"){S.ddOpen=!S.ddOpen;rerenderKeepScroll();return}
  if(a==="soon"){toast((g("data-t")||"This")+" arrives in a later prototype.");return}
  if(a==="tab"){S.tab=g("data-v");rerenderKeepScroll();return}
  if(a==="clear-q"){S.q="";if(route().v==="catalogue")rerenderKeepScroll();else go("catalogue");return}
  if(a==="quick"){
    var p=byId(g("data-id"));if(!p||p.soldOut)return;
    var sz=sizesOf(p);S.qv={id:p.id,size:sz.length===1?sz[0]:null,qty:1,err:false,guide:false};layers();return;
  }
  if(a==="guide"){S.qv.guide=!S.qv.guide;layers();return}
  if(a==="report-open"){S.reportId=g("data-id");rerenderKeepScroll();return}
  if(a==="report-close"){S.reportId="";rerenderKeepScroll();return}
  if(a==="size"){S.qv.size=g("data-v");S.qv.err=false;layers();return}
  if(a==="qv-inc"){S.qv.qty=Math.min(9,S.qv.qty+1);layers();return}
  if(a==="qv-dec"){S.qv.qty=Math.max(1,S.qv.qty-1);layers();return}
  if(a==="qadd"){
    if(!S.qv.size){S.qv.err=true;layers();return}
    addToCart(S.qv.id,S.qv.size,S.qv.qty);S.qv=null;S.cartOpen=true;rerenderKeepScroll();return;
  }
  if(a==="inc"||a==="dec"||a==="rm"){
    var i=+g("data-i"),it=S.cart[i];if(!it)return;
    if(a==="inc")it.qty=Math.min(9,it.qty+1);
    if(a==="dec")it.qty=Math.max(1,it.qty-1);
    if(a==="rm")S.cart.splice(i,1);
    save();var b0=$("#layers .drawer-body"),y=b0?b0.scrollTop:0;
    rerenderKeepScroll();var b=$("#layers .drawer-body");if(b)b.scrollTop=y;return;
  }
  if(a==="sew-rm"){S.sew.imgs.splice(+g("data-i"),1);var th=$("#sewthumbs");if(th)th.innerHTML=sewThumbs();return}
  if(adminClick(a,g,tEl))return;
});
document.addEventListener("change",function(e){
  var el=e.target,c=el.getAttribute&&el.getAttribute("data-chg"),id=el.getAttribute&&el.getAttribute("data-id");
  if(c==="sort"){S.sort=el.value;rerenderKeepScroll();return}
  if(storeChange(el))return;
  if(el.name==="ship"&&el.closest("#coform")){S.ship=el.value;var s=$("#sum");if(s)s.innerHTML=summaryHTML();if(S.pay.method==="transfer")refreshPay();return}
  if(el.id==="s-file"){sewFiles(Array.prototype.slice.call(el.files));el.value="";return}
  if(adminChange(el))return;
});
document.addEventListener("input",function(e){
  var el=e.target;
  if(storeInput(el))return;
  if(el.id==="q"){S.q=el.value;if(route().v==="catalogue")render();return}
  adminInput(el);
});
document.addEventListener("submit",function(e){
  var f=e.target;
  if(f.matches('[data-form="search"]')){e.preventDefault();S.q=$("#q").value;go("catalogue");return}
  if(storeSubmit(f)){e.preventDefault();return}
  if(f.id==="coform"){e.preventDefault();submitCheckout(f);return}
  if(f.id==="sewform"){e.preventDefault();submitSew(f);return}
  if(["admcreate","admlogin","admprofile","admprofile2","pwform","pform","lform"].indexOf(f.id)>-1){e.preventDefault();adminSubmit(f);return}
});
window.addEventListener("scroll",function(){if(S.ddOpen){S.ddOpen=false;var d=$(".dd");if(d)d.remove()}},{passive:true});
document.addEventListener("pointermove",showTip);
document.addEventListener("pointerdown",showTip);
document.addEventListener("pointerleave",function(){$("#tip").hidden=true});
document.addEventListener("keydown",function(e){
  if(e.key!=="Escape")return;
  if(A.edit){A.edit=null;$("#layers").innerHTML="";document.body.classList.remove("lock");return}
  if(S.menu||S.cartOpen||S.qv||S.auth.open){S.menu=false;S.cartOpen=false;S.qv=null;S.auth.open=false;layers()}
  else if(S.ddOpen){S.ddOpen=false;rerenderKeepScroll()}
});
window.addEventListener("hashchange",function(){
  S.menu=false;S.cartOpen=false;S.qv=null;S.auth.open=false;S.ddOpen=false;S.sew.done=null;S.sew.err="";
  A.dr=null;A.cancelId="";A.rejectId="";A.authErr="";if(route().v!=="admin"){A.edit=null;$("#layers").innerHTML="";document.body.classList.remove("lock")}
  if(route().v==="admin")startAdminSubs();
  $("#tip").hidden=true;render();window.scrollTo(0,0);
});
render();
initCloud();


})();
