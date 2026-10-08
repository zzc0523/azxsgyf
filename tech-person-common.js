/* ===========================================================
   技术人员端（个人认证客户端）公共组件脚本
   —— 独立客户端，与「服务机构端」(tech-common.js) 区分，互不影响
   -----------------------------------------------------------
   新增页面步骤：
     1) <link rel="stylesheet" href="tech-person-common.css">
     2) <script src="tech-person-common.js"></script>  放在页面脚本之前
     3) 页面初始化调用：
        initTechPerson({ bread:['个人认证'], active:'个人认证',
                         tabs:['个人认证'], tabActive:'个人认证' })
   新增菜单：修改下方 MENUS
   新增可跳转页面：在 TPP_ROUTES 登记  菜单文本 -> html 文件名
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

/* ===== 端信息（品牌 / 当前用户） ===== */
const TPP_BRAND = '安责险安全服务端';
const TPP_USER  = '张老师';

/* ===== 菜单路由：已实现页面在此登记 ===== */
const TPP_ROUTES = {
  '个人认证': '个人认证_技术人员端.html',
};

/* ===== 侧栏菜单（技术人员端，与服务机构端不同） ===== */
const MENUS = [
  { k:'cert', t:'个人认证',
    d:'<circle cx="8" cy="5.4" r="2.8"/><path d="M2.9 13.7a5.1 5.1 0 0 1 10.2 0"/>' },
  { k:'svc', t:'事故预防服务管理',
    d:'<path d="M8 1.8a4.2 4.2 0 0 0-2.5 7.6c.4.3.6.7.6 1.1v.5h3.8v-.5c0-.4.2-.8.6-1.1A4.2 4.2 0 0 0 8 1.8z"/><path d="M6.4 12.6h3.2M6.9 14.2h2.2"/>' },
];

/* ===== 侧栏渲染 ===== */
function renderNav(active){
  const nav = $('#nav'); if(!nav) return;
  nav.innerHTML = MENUS.map(m => {
    if(m.children){
      const open = m.children.some(c => (c.t || c) === active);
      return `<div class="mi group ${open ? 'open' : ''}" onclick="toggleGroup('${m.k}')">
          <div><svg class="ic" viewBox="0 0 16 16">${m.d}</svg><span>${m.t}</span></div><i class="caret"></i>
        </div>
        <div class="subwrap ${open ? '' : 'hide'}">${m.children.map(c => {
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
  const u = TPP_ROUTES[t];
  if(!u){ toast('「' + t + '」模块暂未开放'); return; }
  if(location.pathname.split('/').pop().endsWith(u)) return;
  location.href = u;
}

/* ===== 侧栏收起/展开 ===== */
function toggleSide(){ const s = document.querySelector('.side'); if(s) s.classList.toggle('collapsed'); saveSide(); }
function saveSide(){ try{ const s = document.querySelector('.side'); if(s) localStorage.setItem('tpp_side', s.classList.contains('collapsed') ? '1' : '0'); }catch(e){} }
function restoreSide(){
  try{
    const s = document.querySelector('.side'); if(!s) return;
    const v = localStorage.getItem('tpp_side');
    if(v === '1') s.classList.add('collapsed');
    else if(v === null && window.innerWidth < 1100) s.classList.add('collapsed');
  }catch(e){}
}

/* ===== 顶栏渲染 ===== */
function renderTopbar(bread){
  bread = bread || ['个人认证'];
  const html = bread.map((b, i) =>
    i === bread.length - 1 ? '<span class="cur">' + esc(b) + '</span>' : '<span>' + esc(b) + '</span>'
  ).join('<span>›</span>');
  const tb = $('#topbar'); if(!tb) return;
  tb.innerHTML =
    '<div class="tb-left"><div class="crumb">' + html + '</div></div>' +
    '<div class="user" onclick="toast(\'' + TPP_USER + '\')"><span class="avatar">' + TPP_USER.slice(0,1) + '</span><span>' + esc(TPP_USER) + '</span><span class="arr">▾</span></div>';
}

/* ===== 页签渲染（可选） ===== */
function renderTabs(tabs, activeTab){
  const box = $('#tabs'); if(!box) return;
  if(!tabs || !tabs.length){ box.classList.add('hide'); return; }
  box.classList.remove('hide');
  box.innerHTML = tabs.map(t =>
    `<div class="tab ${t === activeTab ? 'active' : ''}" onclick="onTab('${t}')">${esc(t)}</div>`
  ).join('');
}
function onTab(t){
  const u = TPP_ROUTES[t];
  if(!u){ toast('「' + t + '」页签（演示）'); return; }
  if(location.pathname.split('/').pop().endsWith(u)) return;
  location.href = u;
}

/* ===== 页面初始化入口 ===== */
function initTechPerson(opts){
  opts = opts || {};
  restoreSide();
  renderNav(opts.active);
  renderTopbar(opts.bread);
  renderTabs(opts.tabs, opts.tabActive);
}
