/* ===========================================================
   技术人员端 公共组件脚本（侧栏菜单 + 顶栏 + 页签 + 通用工具）
   -----------------------------------------------------------
   新增页面步骤：
     1) <link rel="stylesheet" href="tech-common.css">
     2) <script src="tech-common.js"></script>  放在页面脚本之前
     3) 页面初始化调用：
        initTech({ bread:['事故预防服务管理'], active:'事故预防服务管理',
                   tabs:['事故预防服务管理'], tabActive:'事故预防服务管理' })
   新增菜单：修改下方 MENUS 即可（支持二级 children）
   新增可跳转页面：在 TEC_ROUTES 登记  菜单文本 -> html 文件名
   =========================================================== */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
  c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

let _toastT;
function toast(m){
  const t = $('#toast'); if(!t) return;
  t.textContent = m; t.classList.add('show');
  clearTimeout(_toastT); _toastT = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ===== 端信息（品牌 / 当前用户，可按需修改） ===== */
const TECH_BRAND = '安全服务端';
const TECH_USER  = '张工';

/* ===== 菜单路由：已实现页面在此登记（未登记则提示未开放） ===== */
const TEC_ROUTES = {
  '事故预防服务管理': '事故预防服务管理.html',
};

/* ===== 侧栏菜单数据：后续统一在此新增/调整 ===== */
const MENUS = [
  { k:'cert', t:'个人认证',
    d:'<circle cx="8" cy="5.2" r="2.6"/><path d="M3 13.9c0-2.7 2.2-4.4 5-4.4s5 1.7 5 4.4"/>' },
  { k:'svc', t:'事故预防服务管理',
    d:'<path d="M8 14.4s4.3-4.3 4.3-7.4A4.3 4.3 0 0 0 3.7 7c0 3.1 4.3 7.4 4.3 7.4z"/><circle cx="8" cy="7" r="1.4"/>' },
];

/* ===== 侧栏渲染 ===== */
function renderNav(active){
  if(active){
    MENUS.forEach(m => { if(m.children && m.children.some(c => (c.t || c) === active)) m.open = true; });
  }
  const nav = $('#nav'); if(!nav) return;
  nav.innerHTML = MENUS.map(m => {
    if(m.children){
      return `<div class="mi group ${m.open ? 'open' : ''}" onclick="toggleGroup('${m.k}')">
          <div><svg class="ic" viewBox="0 0 16 16">${m.d}</svg><span>${m.t}</span></div><i class="caret"></i>
        </div>
        <div class="subwrap ${m.open ? '' : 'hide'}">${m.children.map(c => {
          const t = c.t || c;
          return `<div class="mi sub ${t === active ? 'active' : ''}" onclick="onMenu('${t}')">${t}</div>`;
        }).join('')}</div>`;
    }
    return `<div class="mi ${m.t === active ? 'active' : ''}" onclick="onMenu('${m.t}')">
        <svg class="ic" viewBox="0 0 16 16">${m.d}</svg><span>${m.t}</span>
      </div>`;
  }).join('');
}
function toggleGroup(k){
  const m = MENUS.find(x => x.k === k);
  if(m){ m.open = !m.open; renderNav(); }
}
function onMenu(t){
  const u = TEC_ROUTES[t];
  if(u && !location.pathname.split('/').pop().endsWith(u)){ location.href = u; return; }
  toast('「' + t + '」模块暂未开放');
}

/* ===== 侧栏收起/展开 ===== */
function toggleSide(){ const s = document.querySelector('.side'); if(s) s.classList.toggle('collapsed'); saveSide(); }
function saveSide(){ try{ const s = document.querySelector('.side'); if(s) localStorage.setItem('tec_side', s.classList.contains('collapsed') ? '1' : '0'); }catch(e){} }
function restoreSide(){
  try{
    const s = document.querySelector('.side'); if(!s) return;
    const v = localStorage.getItem('tec_side');
    if(v === '1') s.classList.add('collapsed');
    else if(v === null && window.innerWidth < 1100) s.classList.add('collapsed');
  }catch(e){}
}

/* ===== 顶栏渲染 ===== */
function renderTopbar(bread){
  bread = bread || ['事故预防服务管理'];
  const html = bread.map((b, i) =>
    i === bread.length - 1 ? '<span class="cur">' + esc(b) + '</span>' : '<span>' + esc(b) + '</span>'
  ).join('<span>›</span>');
  const tb = $('#topbar'); if(!tb) return;
  tb.innerHTML =
    '<div class="tb-left"><div class="crumb">' + html + '</div></div>' +
    '<div class="user" onclick="toast(\'' + TECH_USER + '\')"><span class="avatar">' + TECH_USER.slice(0, 1) + '</span><span>' + esc(TECH_USER) + '</span><span class="arr">▾</span></div>';
}

/* ===== 页签渲染（可选；未传 tabs 时隐藏） ===== */
function renderTabs(tabs, activeTab){
  const box = $('#tabs'); if(!box) return;
  if(!tabs || !tabs.length){ box.classList.add('hide'); return; }
  box.classList.remove('hide');
  box.innerHTML = tabs.map(t =>
    `<div class="tab ${t === activeTab ? 'active' : ''}" onclick="onTab('${t}')">${esc(t)}</div>`
  ).join('');
}
function onTab(t){
  const u = TEC_ROUTES[t];
  if(u && !location.pathname.split('/').pop().endsWith(u)){ location.href = u; return; }
  toast('「' + t + '」页签（演示）');
}

/* ===== 页面初始化入口 ===== */
function initTech(opts){
  opts = opts || {};
  restoreSide();
  renderNav(opts.active);
  renderTopbar(opts.bread);
  renderTabs(opts.tabs, opts.tabActive);
}
