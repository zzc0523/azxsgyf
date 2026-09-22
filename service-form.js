/* 服务登记 · 通用表单渲染引擎（六大项目共用）
   由 service-form.js 提供渲染与交互，HTML 外壳只需 <div class="body" id="body"> + 引入本文件 + 调用 init(项目名) */

const ACCIDENT = ['物体打击','厂（场）内车辆致害','道路（轨道）车辆致害','机械致害','起重致害','触电','淹溺','灼烫','火灾','高处坠落','跌落','坍塌','水害','容器爆炸','管道爆炸','可燃气体爆炸','可燃液体蒸气爆炸','粉尘爆炸','民用爆炸物品爆炸','烟花爆竹爆炸','其他可燃固体爆炸','高温熔融物爆炸','中毒','窒息','滑坡','泄漏','其他'];

let orderNo, project, OVERDUE, PLACE, COMPANY, COMPANY_INDUSTRY='', LITE=false, ENTRY='', RISK=false, HAZARD=false, PATROL=false, SCORE=false;

/* ===== 六大项目字段 schema（来自功能清单.md） ===== */
const SCHEMA = {
 '安全风险辨识、评估、评价': [
   {title:'风险点采集', rows:[
     {t:'photo',name:'风险点图片',max:1},
     {t:'text',name:'风险点名称',max:20},
     {t:'single',name:'风险点种类',opts:['设备设施','场所区域','作业活动']},
     {t:'single',name:'风险位置',opts:['生产区域','辅助生产区域','非生产区域']},
     {t:'multi',name:'可能导致的事故种类',opts:ACCIDENT,hint:'GB 6441 事故种类（可多选）'},
     {t:'single',name:'选用评价方法',opts:['风险判定矩阵法（R=LS）','作业条件危险性评价法(D=LEC)']},
   ]},
   {title:'风险评价计算（C5 计算引擎）', rows:[{t:'calc'}]},
   {title:'风险描述与管控', rows:[
     {t:'ai',name:'事故诱因',max:100,ai:'文本生成'},
     {t:'ai',name:'管控措施',max:100,ai:'文本生成'},
   ]},
 ],
 '生产安全重大事故隐患排查': [
   {title:'隐患检查表（C10 检查表库）', rows:[
     {t:'single',name:'选择行业检查表',opts:['危化品','工贸','建筑施工','矿山','其他'],hint:'后台按行业法规生成，支持跳题'},
   ]},
   {title:'逐项排查', rows:[
     {t:'rate',name:'排查项状态',opts:['不涉及','无问题','有问题'],def:'无问题'},
     {t:'photo',name:'现场照片',max:1},
     {t:'ai',name:'隐患描述',max:100,ai:'图片辨识'},
     {t:'ai',name:'排查依据',max:100,ai:'智能填充'},
     {t:'multi',name:'事故种类',opts:ACCIDENT,hint:'GB 6441 事故种类（可多选）'},
     {t:'ai',name:'整改建议',max:100,ai:'智能填充'},
   ]},
   {title:'新增隐患', rows:[
     {t:'photo',name:'隐患图片',max:1},
     {t:'text',name:'隐患名称',max:30},
     {t:'ai',name:'隐患描述',max:100,ai:'图片辨识'},
     {t:'ai',name:'排查依据',max:100,ai:'智能填充'},
     {t:'multi',name:'事故种类',opts:ACCIDENT,hint:'GB 6441 事故种类（可多选）'},
     {t:'ai',name:'整改建议',max:100,ai:'智能填充'},
   ]},
 ],
 '安全生产宣传教育培训': [],
 '安全生产应急预案编制': [
   {title:'应急预案编制信息采集', rows:[
     {t:'text',name:'应急预案名称',max:50},
     {t:'multi',name:'应急预案种类',opts:['综合应急预案','专项应急预案','现场处置方案']},
     {t:'text',name:'风险场景',max:500,area:true},
     {t:'text',name:'应急组织架构及人员分工',max:500,area:true},
     {t:'multi',name:'事故种类',opts:ACCIDENT,hint:'27项事故种类（可多选）'},
     {t:'text',name:'事故响应程序',max:500,area:true},
     {t:'location',name:'当前位置'},
     {t:'text',name:'应急物资',max:500,area:true},
   ]},
   {title:'应急预案编制（C5 文档生成）', rows:[
     {t:'ai',name:'应急资源调查报告',ai:'文档生成',doc:true},
     {t:'ai',name:'生产安全事故风险评估报告',ai:'文档生成',doc:true},
     {t:'ai',name:'应急预案',ai:'文档生成',doc:true},
     {t:'doc',name:'其他文档'},
   ]},
 ],
 '安全生产应急救援演练': [
   {title:'演练信息', rows:[
     {t:'multi',name:'演练目的',opts:['检验预案','完善准备','锻炼队伍','磨合机制','科普宣教']},
     {t:'single',name:'演练类型',opts:['综合应急演练','专项应急演练']},
     {t:'text',name:'演练地点',max:30},
     {t:'single',name:'演练方式',opts:['桌面推演','实战演练']},
     {t:'text',name:'演练名称',max:50},
     {t:'text',name:'总指挥',max:50},
     {t:'number',name:'演练人数'},
     {t:'single',name:'效果评价',opts:['达到既定目标','基本达到既定目标','未达到既定目标']},
   ]},
   {title:'演练方案与准备', rows:[
     {t:'multi',name:'应急组织架构',opts:['指挥部','抢险救援组','警戒疏散组','医疗救护组','通讯联络组','后勤保障组','其他']},
     {t:'text',name:'演练流程',max:500,area:true},
     {t:'text',name:'演练场景',max:500,area:true},
     {t:'text',name:'演练物资',max:500,area:true},
     {t:'pdf',name:'演练方案'},
   ]},
   {title:'演练评估（C11 三档评级）', rows:[
     {t:'rate',name:'方案编制',opts:['符合','基本符合','不符合'],def:'符合'},
     {t:'rate',name:'人员分工',opts:['符合','基本符合','不符合'],def:'符合'},
     {t:'rate',name:'组织协调',opts:['符合','基本符合','不符合'],def:'符合'},
     {t:'rate',name:'事故报告',opts:['符合','基本符合','不符合'],def:'符合'},
     {t:'rate',name:'人员配合',opts:['符合','基本符合','不符合'],def:'符合'},
     {t:'rate',name:'应急处置',opts:['符合','基本符合','不符合'],def:'符合'},
     {t:'rate',name:'医疗救护',opts:['符合','基本符合','不符合'],def:'符合'},
     {t:'ai',name:'演练总结',max:500,ai:'文本生成'},
   ]},
   {title:'演练影像（C3）', rows:[
     {t:'photo',name:'签到表',max:9},
     {t:'photo',name:'演练物资照片',max:9},
     {t:'photo',name:'现场演练照片',max:9},
   ]},
 ],
 '安全生产标准化管理体系建设': [
   {title:'标准化评分', rows:[
     {t:'single',name:'选用评分表',opts:['金属冶炼','工贸通用','危化品','建筑施工'],hint:'按行业自动固定评分表'},
     {t:'number',name:'标准总分',key:'standard'},
     {t:'rate',name:'扣除分',opts:['无问题','有问题'],def:'无问题',key:'deduct'},
     {t:'number',name:'扣除分数',key:'deductVal',showIf:'deduct=有问题'},
     {t:'number',name:'空项分',key:'kong'},
   ]},
   {title:'新增隐患', rows:[
     {t:'photo',name:'隐患图片',max:1},
     {t:'text',name:'问题描述',max:200,area:true},
     {t:'ai',name:'隐患描述',max:100,ai:'图片辨识'},
     {t:'ai',name:'排查依据',max:100,ai:'智能填充'},
     {t:'multi',name:'事故种类',opts:ACCIDENT,hint:'可来自大模型生成'},
     {t:'ai',name:'整改建议',max:100,ai:'智能填充'},
   ]},
   {title:'标准化结论（C5 计算）', rows:[{t:'calcScore'}]},
   {title:'报告整理（C5 文档生成）', rows:[
     {t:'ai',name:'评审报告',ai:'文档生成',doc:true},
     {t:'ai',name:'改进建议',ai:'文档生成',doc:true},
     {t:'doc',name:'其他报告'},
   ]},
 ],
};

const PIN = '<svg viewBox="0 0 12 15" width="11" height="14" style="vertical-align:-2px;margin-right:4px"><path d="M6 0a6 6 0 0 0-6 6c0 4.2 6 9 6 9s6-4.8 6-9A6 6 0 0 0 6 0Zm0 8.2A2.2 2.2 0 1 1 6 3.8a2.2 2.2 0 0 1 0 4.4Z" fill="#2b5ce6"/></svg>';
const TEL = '<svg viewBox="0 0 15 15" width="13" height="13" style="vertical-align:-2px;margin-right:4px"><path d="M3.1 1C2.5 1 1.9 1.6 1.9 2.3c0 6.5 4.3 10.8 10.8 10.8.7 0 1.3-.6 1.3-1.2v-1.9c0-.5-.3-.9-.7-1l-2.1-.7c-.4-.1-.8 0-1 .3l-.6.8a8.9 8.9 0 0 1-3.3-3.3l.8-.6c.3-.2.4-.6.3-1l-.7-2.1c-.1-.5-.5-.7-1-.7H3.1Z" fill="#2b5ce6"/></svg>';

/* ===== 渲染 ===== */
function fieldHTML(f){
  const id = 'f'+Math.random().toString(36).slice(2,7);
  const attrs = f.max ? `maxlength="${f.max}" oninput="cnt(this,'${id}')"` : '';
  switch(f.t){
    case 'text': return `
      <div class="frow">
        <div class="flabel">${f.name} ${f.max?`<span class="cnt" id="${id}">0/${f.max}</span>`:''}</div>
        ${f.area
          ? `<textarea class="ta" ${attrs} placeholder="请输入"></textarea>`
          : `<input class="inp" ${attrs} placeholder="请输入">`}
      </div>`;
    case 'number': return `
      <div class="frow"><div class="flabel">${f.name}</div>
      <input class="inp" type="number" data-key="${f.key||''}" oninput="recompute()" placeholder="0"></div>`;
    case 'single': return `
      <div class="frow"><div class="flabel">${f.name} ${f.hint?`<span class="hint">${f.hint}</span>`:''}</div>
      <div class="chips" data-kind="single">${f.opts.map(o=>`<span class="chip">${o}</span>`).join('')}</div></div>`;
    case 'multi': return `
      <div class="frow"><div class="flabel">${f.name} ${f.hint?`<span class="hint">${f.hint}</span>`:''}</div>
      <div class="chips" data-kind="multi">${f.opts.map(o=>`<span class="chip">${o}</span>`).join('')}
        <span class="chip other" data-other="1">其他</span></div>
      <input class="inp" style="margin-top:8px;display:none" placeholder="其他（手动填写）"></div>`;
    case 'location': return `
      <div class="frow"><div class="flabel">${f.name}</div>
      <div class="row2"><input class="inp" placeholder="点击右侧获取定位"><button class="mini" onclick="getLoc(this)">获取定位</button></div></div>`;
    case 'photo': return `
      <div class="frow lrow"${f.showIf?` data-showof="${f.showIf.split('=')[0]}" data-showval="${f.showIf.split('=')[1]}" style="display:none"`:''} onclick="goPhoto('${encodeURIComponent(f.name)}',${f.max})">
        <div class="ltxt">${f.name}</div>
        <div class="right"><span class="pcnt">${photoCount(f.name)} 张</span><span class="go">前往采集 ›</span></div></div>`;
    case 'pdf': case 'doc': return `
      <div class="frow lrow" onclick="this.querySelector('input').click()">
        <div class="ltxt">${f.name}</div>
        <div class="right"><span class="file">未上传</span><span class="go">›</span></div>
        <input type="file" accept="${f.t==='pdf'?'application/pdf':'*'}" hidden onchange="onFile(this)"></div>`;
    case 'ai': return `
      <div class="frow"><div class="flabel">${f.name} ${f.max?`<span class="cnt" id="${id}">0/${f.max}</span>`:''} ${f.doc?`<span class="tagdoc">文档</span>`:''}</div>
        ${f.doc?'':`<textarea class="ta" ${attrs} placeholder="由大模型生成或手动填写"></textarea>`}
        <button class="aibtn" onclick="aiGen('${f.ai}')">✦ 大模型${f.ai}（C5）</button></div>`;
    case 'rate': return `
      <div class="frow" ${f.showIf?`data-showof="${f.showIf.split('=')[0]}" data-showval="${f.showIf.split('=')[1]}"`:''}>
        <div class="flabel">${f.name}</div>
        <div class="chips" data-kind="single" data-group="${f.key||''}">${f.opts.map(o=>`<span class="chip ${o===f.def?'on':''}">${o}</span>`).join('')}</div></div>`;
    case 'calc': return `
      <div class="frow"><div class="calc">
        <div class="chips seg" data-kind="single" id="calcMethod">
          <span class="chip on" data-m="ls">R=LS</span><span class="chip" data-m="lec">D=LEC</span></div>
        <div id="calcInputs">${lsHTML()}</div>
        <div class="res">风险值 <b id="riskVal">—</b> ｜ 等级 <span id="riskLv" class="lv">—</span></div>
      </div></div>`;
    case 'calcScore': return `
      <div class="frow"><div class="calc">
        <div class="line">评定得分 = 标准总分 − 扣除分 − 空项分 → <b id="scoreRes">—</b></div>
        <div class="line">百分制总分 = 评定得分 ÷ (标准总分 − 空项分) × 100 → <b id="pctRes">—</b></div>
      </div></div>`;
  }
  return '';
}

function lsHTML(){return `<div class="ci"><span>L</span><input type="number" min="1" max="5" value="3" oninput="calcRisk()"><span>S</span><input type="number" min="1" max="5" value="3" oninput="calcRisk()"></div>`;}
function lecHTML(){return `<div class="ci"><span>L</span><input type="number" min="1" max="5" value="3" oninput="calcRisk()"><span>E</span><input type="number" min="1" max="6" value="3" oninput="calcRisk()"><span>C</span><input type="number" min="1" max="100" value="15" oninput="calcRisk()"></div>`;}

function infoCard(){
  const row=(k,v,ic)=>`<div class="frow"><span class="k">${k}：</span><span class="v">${v}${ic||''}</span></div>`;
  return `<div class="sec-title">基本信息</div>
  <div class="card first info">
    ${row('预防服务工单',orderNo)}
    ${row('企业名称',COMPANY)}
    ${row('服务项目',project)}
    ${row('计划服务日期','2025.01.01-2025.01.05')}
    ${row('计划服务地点',PLACE,PIN)}
    ${row('联系人','张三')}
    ${row('联系电话','18000000000',TEL)}
  </div>`;
}

function photoCount(n){try{return Math.max(0,+localStorage.getItem('photo_'+n)||0)}catch(e){return 0}}
function photoCard(){
  const rows = [
    {name:'企业（项目）门牌照', max:2, need:true},
    {name:'技术人员现场服务照片', max:2, need:true},
    {name:'现场检查照片', max:50},
  ];
  const html = rows.map(r=>{
    const right = r.need
      ? (photoCount(r.name) >= r.max ? `<span class="pstat ok">已完成</span>` : `<span class="pstat no">未完成</span>`)
      : `<span class="pcap">${r.max}张</span>`;
    return `
    <div class="frow lrow" onclick="goPhoto('${encodeURIComponent(r.name)}',${r.max})">
      <div class="ltxt">${r.name}</div>
      <div class="right">${right}<span class="go">›</span></div>
    </div>`;
  }).join('');
  return `<div class="sec">现场照片</div><div class="card">${html}</div>`;
}

function entryCard(name){
  let done=false;
  try{ done = localStorage.getItem('entry_'+name) === '1'; }catch(e){}
  const status = done
    ? `<span class="pstat ok">已完成</span>`
    : `<span class="pstat no">未完成</span>`;
  const target = name + '.html?project=' + encodeURIComponent(project);
  return `<div class="sec">采集填报</div><div class="card">
    <div class="frow lrow" onclick="location.href='${target}'">
      <div class="ltxt">${name}</div>
      <div class="right">${status}<span class="go">›</span></div>
    </div></div>`;
}

/* 数量入口（风险 / 隐患） */
const COUNT_ENTRY = {
  risk:   {sec:'风险', label:'风险总数', prefix:'riskcount_',   target:'风险列表.html'},
  hazard: {sec:'隐患', label:'隐患总数', prefix:'hazardcount_', target:'隐患列表.html'},
};
function countOf(prefix){ try{ return Math.max(0, +localStorage.getItem(prefix+project)||0); }catch(e){ return 0; } }
function countEntryCard(kind){
  const cfg = COUNT_ENTRY[kind];
  const target = cfg.target + '?no=' + encodeURIComponent(orderNo) + '&project=' + encodeURIComponent(project);
  return `<div class="sec">${cfg.sec}</div><div class="card">
    <div class="frow lrow" onclick="location.href='${target}'">
      <div class="ltxt">${cfg.label}</div>
      <div class="right"><span class="rcount">${countOf(cfg.prefix)}</span><span class="go">›</span></div>
    </div></div>`;
}

/* 现场清单（现场排查 / 现场评分，表可自定义增删） */
const LIST_META = {
  patrol: {sec:'现场排查', title:'现场排查表', key:'patrol_', types:['安全管理类排查表','现场用电类排查表','消防安全类排查表','特种设备类排查表','危化品类排查表','工贸类排查表','建筑施工类排查表','矿山类排查表']},
  score:  {sec:'现场评分', title:'评分表', key:'score_',  types:['安全管理类评分表','现场用电类评分表','消防安全类评分表','特种设备类评分表','危化品类评分表','工贸类评分表','建筑施工类评分表','矿山类评分表'],
    defaults:[
      {name:'企业安全生产标准化评分表', done:true, tableId:'T1', code:'PF-2026-001'},
      {name:'危化品企业专项评分表',     done:true, tableId:'T3', code:'PF-2025-018'},
    ]},
};
function listKey(kind){ return LIST_META[kind].key + project; }
function defaultList(kind){
  const meta = LIST_META[kind];
  if(meta.defaults) return meta.defaults.map(d=>({...d}));
  const t = meta.types;
  return [{name:t[0],done:true},{name:t[1],done:false}];
}
/* 旧默认（仅现场评分：两条通用类型名且无 tableId）自动迁移为新默认 */
function isLegacyScoreDefault(list){
  const legacy = ['安全管理类评分表','现场用电类评分表'];
  return Array.isArray(list) && list.length === 2
      && list.every(r=>!r.tableId && legacy.indexOf(r.name) >= 0);
}
function listLoad(kind){
  let list = null;
  try{ const s = localStorage.getItem(listKey(kind)); if(s != null) list = JSON.parse(s); }catch(e){}
  if(!Array.isArray(list) || !list.length){ const def = defaultList(kind); listSave(kind, def); return def; }
  if(kind === 'score' && isLegacyScoreDefault(list)){ const def = defaultList(kind); listSave(kind, def); return def; }
  return list;
}
function listSave(kind,list){ try{ localStorage.setItem(listKey(kind), JSON.stringify(list)); }catch(e){} }
function listCard(kind){
  const meta = LIST_META[kind];
  const rows = listLoad(kind).map((r,i)=>`
    <div class="frow lrow" onclick="listOpen('${kind}',${i})">
      <span class="minus" onclick="event.stopPropagation();listRemove('${kind}',${i})"><i></i></span>
      <div class="ltxt">${r.name}</div>
      <div class="right"><span class="pstat ${r.done?'ok':'gray'}">${r.done?'已完成':'未完成'}</span><span class="go">›</span></div>
    </div>`).join('');
  return `<div class="sec">${meta.sec}</div><div class="card">
    <div class="phead"><div class="ptitle">${meta.title}</div><span class="plus" onclick="${kind==='score'?'scoreAdd()':(kind==='patrol'?'patrolAdd()':'listAdd(\'patrol\')')}">＋</span></div>
    ${rows}</div>`;
}
function listAdd(kind){
  const list = listLoad(kind);
  const used = list.map(r=>r.name);
  const t = LIST_META[kind].types;
  let next = t.find(x=>used.indexOf(x)<0);
  if(!next){
    const nm = window.prompt('请输入自定义'+(kind==='score'?'评分表':'排查表')+'名称');
    if(!nm || !nm.trim()) return;
    next = nm.trim();
  }
  list.push({name:next, done:false}); listSave(kind, list); renderBody();
}
function listRemove(kind,i){
  const list = listLoad(kind); list.splice(i,1); listSave(kind, list); renderBody();
}
function listOpen(kind,i){
  const r = listLoad(kind)[i]; if(!r) return;
  if(kind === 'score'){
    location.href = '现场评分.html?no=' + encodeURIComponent(orderNo)
                 + '&project=' + encodeURIComponent(project)
                 + '&name=' + encodeURIComponent(r.name);
  } else {
    location.href = '现场排查表.html?no=' + encodeURIComponent(orderNo)
                 + '&project=' + encodeURIComponent(project)
                 + '&name=' + encodeURIComponent(r.name);
  }
}

/* 现场评分表：从保险机构端「评分表管理」中选取状态为“启用”的评分表添加 */
function insTables(){
  try{ const s = localStorage.getItem('ins_score_tables'); const a = s ? JSON.parse(s) : []; return Array.isArray(a) ? a : []; }catch(e){ return []; }
}
let SCORE_AVAIL = [];   // 当前弹层可选的（机构端启用、且未添加）评分表
function scoreAdd(){
  const enabled = insTables().filter(t => t.status === '启用');
  const used = listLoad('score').map(r => r.tableId || null).filter(Boolean);
  SCORE_AVAIL = enabled.filter(t => used.indexOf(t.id) < 0);
  if(!SCORE_AVAIL.length){ toast('机构端暂无可选（启用）的评分表'); return; }
  const box = document.getElementById('scoreSheet');
  if(!box){ toast('暂不支持选择'); return; }
  const qEl = document.getElementById('scoreSheetQ'); if(qEl) qEl.value = '';
  renderScoreSheet('');
  box.classList.add('show');
}
function renderScoreSheet(kw){
  kw = (kw || '').trim().toLowerCase();
  const list = SCORE_AVAIL.filter(t =>
    !kw || String(t.name || '').toLowerCase().indexOf(kw) >= 0 || String(t.code || '').toLowerCase().indexOf(kw) >= 0);
  document.getElementById('scoreSheetList').innerHTML = list.length ? list.map(t =>
    `<div class="as-item" onclick="scorePick('${t.id}')">
       <div style="flex:1;min-width:0">
         <div class="ai-name">${esc(t.name)}</div>
         <div class="ai-code">${esc(t.code)}</div>
       </div>
     </div>`).join('') : `<div class="as-empty">未找到匹配的评分表</div>`;
}
function scoreFilter(){ const q = document.getElementById('scoreSheetQ'); renderScoreSheet(q ? q.value : ''); }
function scorePick(id){
  const t = insTables().find(x => x.id === id); if(!t){ closeScoreSheet(); return; }
  const list = listLoad('score');
  if(list.some(r => (r.tableId || '') === id)){ toast('该评分表已添加'); closeScoreSheet(); return; }
  list.push({name:t.name, done:false, tableId:t.id, code:t.code, org:t.org});
  listSave('score', list);
  closeScoreSheet();
  renderBody();
  toast('已添加：' + t.name);
}
function closeScoreSheet(){ const b = document.getElementById('scoreSheet'); if(b) b.classList.remove('show'); }

/* 现场排查表：从保险机构端「检查表管理」中选取状态为“启用”、且「适用行业」与企业行业一致的检查表添加 */
function patrolTables(){
  try{ const s = localStorage.getItem('ins_patrol_tables'); const a = s ? JSON.parse(s) : []; return Array.isArray(a) ? a : []; }catch(e){ return []; }
}
/* 企业行业：优先取 URL 参数 industry，其次按企业名称匹配「服务计划管理」数据，最后用演示映射兜底 */
const DEMO_COMPANY_INDUSTRY = { '福州无比欢信息科技有限公司':'建筑施工', '福建厦发信息有限公司':'建筑施工' };
function enterpriseIndustry(){
  const u = (new URLSearchParams(location.search).get('industry') || '').trim();
  if(u) return u;
  try{
    const s = localStorage.getItem('ins_plans');
    const arr = s ? JSON.parse(s) : [];
    const hit = (Array.isArray(arr) ? arr : []).find(p => p && p.company === COMPANY);
    if(hit && hit.industry) return hit.industry;
  }catch(e){}
  return DEMO_COMPANY_INDUSTRY[COMPANY] || '其他';
}
let PATROL_AVAIL = [];   // 当前弹层可选的（机构端启用、适用行业一致、且未添加）检查表
function patrolAdd(){
  const enabled = patrolTables().filter(t => t.status === '启用');
  const used = listLoad('patrol').map(r => r.tableId || null).filter(Boolean);
  // 按企业行业过滤：只显示适用行业相同的检查表
  PATROL_AVAIL = enabled.filter(t => (t.industry || '') === COMPANY_INDUSTRY && used.indexOf(t.code) < 0);
  const box = document.getElementById('patrolSheet');
  if(!enabled.length){ toast('机构端暂无可选（启用）的检查表'); return; }
  if(!box){ toast('暂不支持选择'); return; }
  const qEl = document.getElementById('patrolSheetQ'); if(qEl) qEl.value = '';
  renderPatrolSheet('');
  box.classList.add('show');
}
function renderPatrolSheet(kw){
  kw = (kw || '').trim().toLowerCase();
  const list = PATROL_AVAIL.filter(t =>
    !kw || String(t.name||'').toLowerCase().indexOf(kw) >= 0
        || String(t.code||'').toLowerCase().indexOf(kw) >= 0
        || String(t.industry||'').toLowerCase().indexOf(kw) >= 0);
  const empty = kw ? '未找到匹配的检查表'
    : (COMPANY_INDUSTRY ? `暂无适用「${esc(COMPANY_INDUSTRY)}」行业的检查表` : '暂无可用检查表');
  document.getElementById('patrolSheetList').innerHTML = list.length ? list.map(t =>
    `<div class="as-item" onclick="patrolPick('${esc(t.code)}')">
       <div style="flex:1;min-width:0">
         <div class="ai-name">${esc(t.name)}</div>
         <div class="ai-code">编号 ${esc(t.code)}</div>
       </div>
     </div>`).join('') : `<div class="as-empty">${empty}</div>`;
}
function patrolFilter(){ const q = document.getElementById('patrolSheetQ'); renderPatrolSheet(q ? q.value : ''); }
function patrolPick(code){
  const t = patrolTables().find(x => x.code === code); if(!t){ closePatrolSheet(); return; }
  const list = listLoad('patrol');
  if(list.some(r => (r.tableId || '') === code)){ toast('该检查表已添加'); closePatrolSheet(); return; }
  list.push({name:t.name, done:false, tableId:t.code, code:t.code, org:t.org, industry:t.industry});
  listSave('patrol', list);
  closePatrolSheet();
  renderBody();
  toast('已添加：' + t.name);
}
function closePatrolSheet(){ const b = document.getElementById('patrolSheet'); if(b) b.classList.remove('show'); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }function projectCard(){
  const secs = SCHEMA[project] || [];
  return secs.map(s=>`<div class="sec">${s.title}</div><div class="card">${s.rows.map(fieldHTML).join('')}</div>`).join('');
}

/* ===== 交互 ===== */
function cnt(el,id){ if(id) document.getElementById(id).textContent = (el.value.length)+'/'+(el.maxLength||''); }
function goPhoto(name,max){ location.href = '照片采集.html?title='+name+'&max='+max; }
function getLoc(btn){ const i=btn.previousElementSibling; i.value='26.0713°N, 119.4512°E'; toast('已获取当前定位'); }
function onFile(inp){ const span=inp.closest('.frow').querySelector('.file'); span.textContent=inp.files[0]?inp.files[0].name:'未上传'; if(inp.files[0]) span.classList.add('ok'); }
function aiGen(type){ toast('大模型'+type+'：生成中…'); }

document.addEventListener('click', e=>{
  const c = e.target.closest('.chip'); if(!c) return;
  const box = c.closest('.chips'); if(!box) return;
  if(box.dataset.kind === 'single'){
    box.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));
    c.classList.add('on');
    if(c.dataset.m){ document.getElementById('calcInputs').innerHTML = c.dataset.m==='lec'?lecHTML():lsHTML(); calcRisk(); }
    const g = box.dataset.group;
    if(g) applyShow(g, c.textContent);
  } else {
    if(c.dataset.other){ c.classList.toggle('on'); c.nextElementSibling.style.display = c.classList.contains('on')?'block':'none'; return; }
    c.classList.toggle('on');
  }
});

function applyShow(group, val){
  document.querySelectorAll('[data-showof="'+group+'"]').forEach(r=>{
    r.style.display = (r.dataset.showval===val) ? '' : 'none';
  });
  recompute();
}

function calcRisk(){
  const ins = document.querySelectorAll('#calcInputs input');
  if(!ins.length) return;               // 非风险评价页无需计算
  const m = (document.querySelector('#calcMethod .chip.on')||{}).dataset?.m || 'ls';
  let R=0;
  if(m==='ls'){ const L=+ins[0].value||0,S=+ins[1].value||0; R=L*S; levelLS(R); }
  else { const L=+ins[0].value||0,E=+ins[1].value||0,C=+ins[2].value||0; R=L*E*C; levelLEC(R); }
  document.getElementById('riskVal').textContent = R;
}
function lv(text,cls){ const e=document.getElementById('riskLv'); e.textContent=text; e.className='lv '+cls; }
function levelLS(R){ if(R<=8)lv('蓝·低风险','blue'); else if(R<=12)lv('黄·一般','yellow'); else if(R<=16)lv('橙·较大','orange'); else lv('红·重大','red'); }
function levelLEC(R){ if(R<=70)lv('蓝·低风险','blue'); else if(R<=160)lv('黄·一般','yellow'); else if(R<=320)lv('橙·较大','orange'); else lv('红·重大','red'); }

function recompute(){
  const s=+((document.querySelector('[data-key="standard"]')||{}).value||0);
  const k=+((document.querySelector('[data-key="kong"]')||{}).value||0);
  const dv=document.querySelector('[data-group="deduct"] .chip.on');
  const deductVal = (dv && dv.textContent==='有问题') ? +((document.querySelector('[data-key="deductVal"]')||{}).value||0) : 0;
  const score = s - deductVal - k;
  const denom = (s - k) || 1;
  const pct = denom>0 ? (score/denom*100) : 0;
  const sr=document.getElementById('scoreRes'), pr=document.getElementById('pctRes');
  if(sr){ sr.textContent = Math.max(0,score).toFixed(0); pr.textContent = pct.toFixed(1)+' 分'; }
}

function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1600);}

/* ===== 初始化（由各 HTML 调用） ===== */
function init(projectName, lite, entry, risk, hazard, patrol, score){
  const q = new URLSearchParams(location.search);
  orderNo  = q.get('no') || 'YF2131900';
  project  = projectName || q.get('project') || '安全风险辨识、评估、评价';
  OVERDUE  = q.get('overdue') === '1';
  LITE     = !!lite;
  ENTRY    = entry || '';
  RISK     = !!risk;
  HAZARD   = !!hazard;
  PATROL   = !!patrol;
  SCORE    = !!score;
  PLACE    = '福州马尾区海峡广场A座';
  COMPANY  = '福州无比欢信息科技有限公司';
  COMPANY_INDUSTRY = enterpriseIndustry();
  renderBody();
}
function renderBody(){
  const entryHTML  = ENTRY ? entryCard(ENTRY) : '';
  const patrolHTML = PATROL ? listCard('patrol') : '';
  const scoreHTML  = SCORE ? listCard('score') : '';
  const riskHTML   = RISK ? countEntryCard('risk') : '';
  const hazardHTML = HAZARD ? countEntryCard('hazard') : '';
  document.getElementById('body').innerHTML = infoCard() + photoCard() + entryHTML + patrolHTML + scoreHTML + riskHTML + hazardHTML + (LITE ? '' : projectCard());
  applyShow('deduct', (document.querySelector('[data-group="deduct"] .chip.on')||{}).textContent || '无问题');
  applyShow('exam', (document.querySelector('[data-group="exam"] .chip.on')||{}).textContent || '否');
  calcRisk();
  recompute();
}
window.addEventListener('pageshow',function(e){if(e.persisted)init(project, LITE, ENTRY, RISK, HAZARD, PATROL, SCORE);});
