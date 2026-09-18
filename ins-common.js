/* ===========================================================
   保险机构端 公共组件脚本（侧栏菜单 + 顶栏 + 通用工具）
   后续新增页面：
     1) <script src="ins-common.js"></script> 放在页面脚本之前
     2) 页面初始化时调用 initIns({ bread:[一级,二级...], active:'二级菜单文本' })
     3) 新增菜单项：修改下方 MENUS；新增可跳转页面：在 INS_ROUTES 登记 菜单文本->文件名
   =========================================================== */
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let _toastT;
function toast(m){const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(_toastT);_toastT=setTimeout(()=>t.classList.remove('show'),1800);}

/* 菜单路由：已实现的页面在此登记 菜单文本 -> html 文件名（未登记则提示未开放） */
const INS_ROUTES={'投保查询':'投保查询.html','服务计划管理':'服务计划管理.html','服务报告审核':'服务报告审核.html','事故预防服务需求':'事故预防服务需求.html','评分表管理':'评分表管理.html','隐患检查表管理':'检查表管理.html'};

/* ===== 侧栏菜单数据：后续统一在此修改 ===== */
const MENUS=[
  {k:'home',t:'首页',d:'<path d="M2.4 6.9 8 2.6l5.6 4.3V13a.7.7 0 0 1-.7.7H3.1a.7.7 0 0 1-.7-.7z"/>'},
  {k:'cert',t:'企业认证',d:'<path d="M8 1.7 13 3.5v4c0 3-2.1 5.5-5 6.6C5.1 12.9 3 10.5 3 7.5v-4z"/><path d="m5.9 7.9 1.5 1.5 2.7-2.8"/>'},
  {k:'product',t:'产品备案管理',d:'<path d="M4 1.8h4.6l3.4 3.4V14a.7.7 0 0 1-.7.7H4a.7.7 0 0 1-.7-.7V2.5A.7.7 0 0 1 4 1.8z"/><path d="M9 1.9V5.2H12.3"/>'},
  {k:'biz',t:'保险业务管理',open:true,d:'<path d="M1.8 4.3h3.8l1.4 1.5h7.2v7a.7.7 0 0 1-.7.7H2.5a.7.7 0 0 1-.7-.7z"/>',children:[{t:'投保查询'},'理赔管理','保单管理']},
  {k:'tech',t:'技术人员管理',d:'<circle cx="8" cy="5.1" r="2.6"/><path d="M3.1 14c0-2.6 2.1-4.3 4.9-4.3s4.9 1.7 4.9 4.3"/>'},
  {k:'service',t:'事故预防服务管理',d:'<path d="M8 14.3s4.2-4.2 4.2-7.3A4.2 4.2 0 0 0 3.8 7c0 3.1 4.2 7.3 4.2 7.3z"/><circle cx="8" cy="7" r="1.4"/>',children:['事故预防服务需求','事故预防服务查询','服务计划管理','服务报告审核']},
  {k:'hidden',t:'隐患整改跟踪',d:'<path d="M8 2.1 14.3 13H1.7z"/><path d="M8 6.3v3"/><circle cx="8" cy="11.3" r=".7" fill="currentColor" stroke="none"/>'},
  {k:'risk',t:'风险整改跟踪',d:'<path d="M8 1.8s3.6 3 3.6 6.3A3.6 3.6 0 0 1 8 14a3.6 3.6 0 0 1-3.6-5.9c.5.9 1.4 1.3 2 .9.9-.6.4-2.4 1.6-7.2z"/>'},
  {k:'check',t:'隐患检查表管理',d:'<rect x="2" y="2" width="12" height="12" rx="2"/><path d="m5.4 8.2 1.8 1.8 3.5-3.6"/>'},
  {k:'score',t:'评分表管理',d:'<rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 6h6M5 9h6M5 12h3"/>'}
];

function renderNav(active){
  if(active){ MENUS.forEach(m=>{ if(m.children && m.children.some(c=>(c.t||c)===active)) m.open=true; }); }
  $('#nav').innerHTML=MENUS.map(m=>{
    if(m.children){
      return `<div class="mi group ${m.open?'open':''}" onclick="toggleGroup('${m.k}')">
        <div><svg class="ic" viewBox="0 0 16 16">${m.d}</svg><span>${m.t}</span></div><i class="caret"></i></div>
        <div class="subwrap ${m.open?'':'hide'}">${m.children.map(c=>{const t=c.t||c;return `<div class="mi sub ${t===active?'active':''}" onclick="onMenu('${t}')">${t}</div>`;}).join('')}</div>`;
    }
    return `<div class="mi ${m.t===active?'active':''}" onclick="onMenu('${m.t}')"><svg class="ic" viewBox="0 0 16 16">${m.d}</svg><span>${m.t}</span></div>`;
  }).join('');
}
function toggleGroup(k){const m=MENUS.find(x=>x.k===k);if(m){m.open=!m.open;renderNav();}}
function onMenu(t){
  const u=INS_ROUTES[t];
  if(u && !location.pathname.split('/').pop().endsWith(u)){ location.href=u; return; }
  toast('「'+t+'」模块暂未开放');
}

function toggleSide(){const s=document.querySelector('.side');if(s)s.classList.toggle('collapsed');saveSide();}
function saveSide(){try{const s=document.querySelector('.side');if(s)localStorage.setItem('ins_side',s.classList.contains('collapsed')?'1':'0');}catch(e){}}
function restoreSide(){
  try{
    const s=document.querySelector('.side');if(!s)return;
    const v=localStorage.getItem('ins_side');
    if(v==='1') s.classList.add('collapsed');
    else if(v===null && window.innerWidth<1100) s.classList.add('collapsed');
  }catch(e){}
}

function renderTopbar(bread){
  bread=bread||['保险机构端'];
  const html=bread.map((b,i)=> i===bread.length-1?'<span class="cur">'+esc(b)+'</span>':'<span>'+esc(b)+'</span>').join('<span>›</span>');
  $('#topbar').innerHTML=
    '<div class="tb-left"><div class="hamb" onclick="toggleSide()" title="收起/展开菜单">☰</div><div class="crumb">'+html+'</div></div>'+
    '<div class="user" onclick="toast(\'中国人寿保险\')"><span class="avatar">寿</span><span>中国人寿保险</span><span class="arr">▾</span></div>';
}

/* ===== 页签渲染（可选；未传 tabs 时隐藏） ===== */
function renderTabs(tabs, activeTab){
  const box=$('#tabs'); if(!box) return;
  if(!tabs || !tabs.length){ box.classList.add('hide'); return; }
  box.classList.remove('hide');
  box.innerHTML=tabs.map(t=>`<div class="tab ${t===activeTab?'active':''}" onclick="onTab('${t}')">${esc(t)}</div>`).join('');
}
function onTab(t){
  const u=INS_ROUTES[t];
  if(u && !location.pathname.split('/').pop().endsWith(u)){ location.href=u; return; }
  toast('「'+t+'」页签（演示）');
}

/* 页面初始化入口 */
function initIns(opts){
  opts=opts||{};
  restoreSide();
  renderNav(opts.active);
  renderTopbar(opts.bread);
  renderTabs(opts.tabs, opts.tabActive);
}
