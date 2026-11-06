/* AUTO-GENERATED from src/client/*.js — do not edit directly */
window.__ModuleLoader__.load({
  id: 'dsh-garmin-assistant',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const PANEL = 'garmin-panel'
    const API = '/garmin-panel/api'

    /* ---------------------------------------------------------------- *
     * 样式：全部从 DSH 主题 token 派生，深浅色自动跟随
     * ---------------------------------------------------------------- */
    const CSS = `
    .gp-root{
      --gp-t1:var(--dsw-alias-label-primary,#e8edf4);
      --gp-t2:var(--dsw-alias-label-secondary,#9aa7b8);
      --gp-t3:var(--dsw-alias-label-tertiary,#697689);
      --gp-line:color-mix(in srgb, var(--gp-t1) 13%, transparent);
      --gp-line2:color-mix(in srgb, var(--gp-t1) 7%, transparent);
      --gp-card:color-mix(in srgb, var(--gp-t1) 4%, transparent);
      --gp-card2:color-mix(in srgb, var(--gp-t1) 7%, transparent);
      --gp-green:#2fbf71; --gp-blue:#3a8dff; --gp-amber:#e8a33d; --gp-red:#e5534b; --gp-violet:#8b7cf6;
      height:100%; overflow:auto; color:var(--gp-t1); scroll-padding-top:64px;
      font-size:13px; line-height:1.5; padding-top:0;
      background:transparent;
    }
    .gp-root *{box-sizing:border-box}
    .gp-section{display:contents}
    .gp-wrap{max-width:1560px;margin:0 auto;padding:0 22px 64px}
    .gp-top{display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:40;
      padding:calc(var(--dsh-frame-top-clearance,0px) + 12px) 0 11px;
      background:var(--dsw-alias-bg-base,#0b0d10);
      border-bottom:1px solid var(--gp-line2);
      box-shadow:0 10px 20px -18px rgba(0,0,0,.55)}
    .gp-title{font-size:15px;font-weight:650;letter-spacing:.2px;display:flex;align-items:center;gap:9px}
    .gp-badge{font-size:10px;font-weight:500;color:var(--gp-t3);border:1px solid var(--gp-line);
      padding:2px 7px;border-radius:999px;letter-spacing:.4px}
    .gp-right{margin-left:auto;display:flex;align-items:center;gap:8px}
    .gp-status{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--gp-t2);
      border:1px solid var(--gp-line);padding:4px 9px;border-radius:999px;white-space:nowrap}
    .gp-dot{width:6px;height:6px;border-radius:50%;background:var(--gp-green)}
    .gp-dot.bad{background:var(--gp-red)}
    .gp-btn{border:1px solid var(--gp-line);background:var(--gp-card);color:var(--gp-t2);height:27px;
      border-radius:8px;padding:0 10px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
    .gp-btn:hover{background:var(--gp-card2);color:var(--gp-t1)}
    .gp-btn.primary{background:var(--gp-blue);border-color:var(--gp-blue);color:#04121f;font-weight:650}
    .gp-btn.primary:hover{background:#5ba3ff}
    .gp-sec{display:flex;align-items:baseline;gap:10px;margin:24px 2px 11px}
    .gp-sec h2{font-size:13px;margin:0;font-weight:650;letter-spacing:.3px}
    .gp-sec .hint{font-size:11px;color:var(--gp-t3)}
    .gp-sec .sp{margin-left:auto;font-size:11px;color:var(--gp-t3)}
    .gp-card{background:var(--gp-card);border:1px solid var(--gp-line2);border-radius:13px;padding:13px 14px;min-width:0}
    .gp-card h3{font-size:12px;margin:0 0 9px;font-weight:600;display:flex;align-items:center;gap:7px}
    /* 今日状态：5 张图形化 KPI —— 图形主导，数字与标签作补充 */
    .gp-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:11px}
    /* 卡片可隐藏后按可见数量重排：1 张铺满，2–5 张等分（宽度不够时由媒体查询接管） */
    .gp-kpis.n1{grid-template-columns:minmax(0,1fr)}
    .gp-kpis.n2{grid-template-columns:repeat(2,minmax(0,1fr))}
    .gp-kpis.n3{grid-template-columns:repeat(3,minmax(0,1fr))}
    .gp-kpis.n4{grid-template-columns:repeat(4,minmax(0,1fr))}
    .gp-kpi{min-height:146px;padding:10px 12px 9px;display:flex;flex-direction:column;gap:5px}
    .gp-kpi .k{font-size:11px;line-height:15px;color:var(--gp-t2);display:flex;align-items:center;gap:6px}
    .gp-kpi .k .sp{margin-left:auto;font-size:10px;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-kpi .viz{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:9px}
    .gp-kpi .viz.col{flex-direction:column;gap:2px}
    .gp-kpi .viz svg{display:block;overflow:visible}
    .gp-kpi .sub .lg{display:inline-flex;align-items:center;gap:4px;margin-left:8px}
    .gp-kpi .sub .lg::before{content:'';width:6px;height:6px;border-radius:2px;background:currentColor}
    .gp-kpi .sub .lg.dg{color:var(--gp-green)}
    .gp-kpi .sub .lg.dv{color:var(--gp-violet)}
    .gp-kpi .sub .lg.dm{color:var(--gp-t3)}
    .gp-kpi .sub{font-size:10.5px;line-height:14px;height:14px;color:var(--gp-t3);text-align:center;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
    .gp-kpi .sub b{color:var(--gp-t2);font-weight:600}
    .gp-kpi .sub .dg{color:var(--gp-green)} .gp-kpi .sub .dv{color:var(--gp-violet)}
    .gp-kpi .num{font-size:24px;font-weight:700;letter-spacing:-.4px;font-variant-numeric:tabular-nums;line-height:1}
    .gp-kpi .num small{font-size:10.5px;font-weight:500;color:var(--gp-t3);margin-left:3px;letter-spacing:0}
    .gp-kpi .delta{font-size:10.5px;font-weight:650;font-variant-numeric:tabular-nums;margin-left:3px}
    .gp-kpi .delta.good{color:var(--gp-green)} .gp-kpi .delta.bad{color:var(--gp-red)}
    .gp-kpi .delta.flat{color:var(--gp-t3)}
    .gp-kpi .bat-side{display:flex;flex-direction:column;gap:2px;flex:none;font-size:10px;line-height:1.35;
      font-variant-numeric:tabular-nums}
    .gp-kpi .bat-side .up{color:var(--gp-green)} .gp-kpi .bat-side .dn{color:var(--gp-amber)}
    .gp-kpi .bat-side .lb{font-size:9px;color:var(--gp-t3)}
    .gp-kpi .rhr-row{display:flex;align-items:baseline;justify-content:center;gap:2px}
    .gp-pill{font-size:10px;padding:1px 6px;border-radius:999px;border:1px solid var(--gp-line);color:var(--gp-t2);white-space:nowrap}
    .gp-pill.g{color:var(--gp-green);border-color:color-mix(in srgb,var(--gp-green) 40%,transparent)}
    .gp-pill.a{color:var(--gp-amber);border-color:color-mix(in srgb,var(--gp-amber) 40%,transparent)}
    .gp-pill.r{color:var(--gp-red);border-color:color-mix(in srgb,var(--gp-red) 40%,transparent)}
    .gp-grid{display:grid;gap:11px}
    .gp-g2{grid-template-columns:repeat(2,minmax(0,1fr))}
    .gp-g2.n1{grid-template-columns:minmax(0,1fr)}
    .gp-g3{grid-template-columns:repeat(3,minmax(0,1fr))}
    .gp-span{grid-column:1 / -1}
    .gp-grid-top{align-items:start}
    .gp-g3.n1{grid-template-columns:minmax(0,1fr)}
    .gp-g3.n2{grid-template-columns:repeat(2,minmax(0,1fr))}
    .gp-g4{grid-template-columns:repeat(4,minmax(0,1fr))}
    .gp-split{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
    .gp-row{display:flex;align-items:center;gap:9px;font-size:11.5px}
    .gp-row+.gp-row{margin-top:8px}
    .gp-row .lab{width:56px;color:var(--gp-t2);flex:none}
    .gp-row .val{width:54px;text-align:right;font-variant-numeric:tabular-nums;flex:none}
    .gp-bar{flex:1;height:6px;border-radius:999px;background:var(--gp-card2);overflow:hidden}
    .gp-bar>i{display:block;height:100%;border-radius:999px}
    .gp-mini{font-size:11px;color:var(--gp-t2)}
    .gp-empty{border:1px dashed var(--gp-line);border-radius:10px;padding:12px;color:var(--gp-t3);font-size:11.5px}
    .gp-empty b{color:var(--gp-t2)}
    .gp-skel{background:var(--gp-card2);border-radius:6px;animation:gp-pulse 1.4s ease-in-out infinite}
    @keyframes gp-pulse{0%,100%{opacity:.45}50%{opacity:.9}}
    .gp-table{width:100%;border-collapse:collapse;font-size:11.5px}
    .gp-table th{text-align:left;font-weight:500;color:var(--gp-t3);font-size:10.5px;padding:5px 7px;border-bottom:1px solid var(--gp-line);white-space:nowrap}
    .gp-table td{padding:7px;border-bottom:1px solid var(--gp-line2);color:var(--gp-t2);white-space:nowrap}
    .gp-table td.n{font-variant-numeric:tabular-nums;color:var(--gp-t1)}
    .gp-table tr:last-child td{border-bottom:0}
    .gp-tname{color:var(--gp-t1);font-weight:500;max-width:240px;overflow:hidden;text-overflow:ellipsis}
    .gp-tag{font-size:10px;border:1px solid var(--gp-line);border-radius:5px;padding:1px 5px;color:var(--gp-t3)}
    .gp-insight{display:flex;gap:9px;padding:9px 11px;border-radius:9px;background:var(--gp-card2);font-size:11.5px;color:var(--gp-t2)}
    .gp-insight+.gp-insight{margin-top:7px}
    .gp-insight b{color:var(--gp-t1)}
    .gp-insight .ic{width:18px;height:18px;border-radius:5px;display:grid;place-items:center;flex:none;font-size:10px;font-weight:700}
    .gp-insight.warn .ic{background:color-mix(in srgb,var(--gp-amber) 18%,transparent);color:var(--gp-amber)}
    .gp-insight.good .ic{background:color-mix(in srgb,var(--gp-green) 18%,transparent);color:var(--gp-green)}
    .gp-insight.bad .ic{background:color-mix(in srgb,var(--gp-red) 18%,transparent);color:var(--gp-red)}
    .gp-err{padding:12px;border-radius:10px;border:1px solid color-mix(in srgb,var(--gp-red) 40%,transparent);
      color:var(--gp-red);font-size:12px;display:flex;gap:10px;align-items:center}
    .gp-auth{padding:22px;border:1px solid var(--gp-line);border-radius:12px;background:var(--gp-card)}
    .gp-auth code{font-family:ui-monospace,monospace;background:var(--gp-card2);padding:2px 6px;border-radius:5px;font-size:11.5px}
    .gp-foot{margin-top:24px;padding-top:12px;border-top:1px solid var(--gp-line2);display:flex;gap:14px;
      font-size:10.5px;color:var(--gp-t3);flex-wrap:wrap}
    .gp-auth{max-width:520px}
    .gp-auth-title{font-size:15px;font-weight:650;margin-bottom:4px}
    .gp-auth-head{margin-bottom:16px}
    .gp-form{display:flex;flex-direction:column;gap:11px;margin-top:6px}
    .gp-field{display:flex;flex-direction:column;gap:5px;font-size:11.5px;color:var(--gp-t2)}
    .gp-input{height:34px;border-radius:9px;border:1px solid var(--gp-line);background:var(--gp-card);
      color:var(--gp-t1);padding:0 10px;font-size:12.5px;outline:none;font-family:inherit}
    .gp-input:focus{border-color:var(--gp-blue)}
    .gp-auth-actions{display:flex;align-items:center;gap:10px;margin-top:4px}
    .gp-auth-foot{margin-top:16px;padding-top:12px;border-top:1px solid var(--gp-line2);font-size:11px;color:var(--gp-t3)}
    .gp-auth-foot code{font-family:ui-monospace,monospace;background:var(--gp-card2);padding:1px 5px;border-radius:4px}
    /* 设备查看器 */
    .gp-dev-anchor{position:relative;display:inline-flex}
    .gp-btn.dev{color:var(--gp-blue);border-color:color-mix(in srgb,var(--gp-blue) 36%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 11%,transparent)}
    .gp-btn.dev:hover,.gp-btn.dev.on{color:#8fc2ff;border-color:color-mix(in srgb,var(--gp-blue) 52%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 20%,transparent)}
    .gp-btn.dev .n{font-variant-numeric:tabular-nums;opacity:.85;margin-left:-2px}
    .gp-dev-pop{position:absolute;top:calc(100% + 8px);right:0;width:320px;max-width:calc(100vw - 28px);
      z-index:40;padding:8px;border-radius:13px;border:1px solid var(--gp-line);
      background:var(--dsw-alias-bg-layer-2,#20242c);
      box-shadow:0 22px 48px -16px rgba(0,0,0,.65),0 2px 10px rgba(0,0,0,.28);animation:gp-pop .13s ease-out}
    @keyframes gp-pop{from{transform:translateY(-4px)}to{transform:none}}
    .gp-dev-hd{display:flex;align-items:center;gap:7px;padding:3px 3px 8px}
    .gp-dev-hd b{font-size:12px;font-weight:650;letter-spacing:.2px}
    .gp-dev-hd .cnt{font-size:10px;color:var(--gp-t3)}
    .gp-dev-hd .sp{margin-left:auto;display:flex;align-items:center;gap:2px}
    .gp-icon-btn{width:22px;height:22px;padding:0;border-radius:6px;border:1px solid transparent;background:transparent;
      color:var(--gp-t3);font-size:13px;line-height:1;cursor:pointer;display:inline-grid;place-items:center}
    .gp-icon-btn:hover{background:var(--gp-card2);color:var(--gp-t1)}
    .gp-dev-body{max-height:min(60vh,430px);overflow:auto}
    .gp-dev-row{padding:8px 6px;border-radius:9px}
    .gp-dev-row+.gp-dev-row{border-top:1px solid var(--gp-line2)}
    .gp-dev-row.open{background:var(--gp-card)}
    .gp-dev-head{display:flex;align-items:flex-start;gap:10px}
    .gp-dev-main{min-width:0;flex:1}
    .gp-dev-name{font-size:12px;font-weight:650;color:var(--gp-t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gp-dev-tags{display:flex;align-items:center;gap:5px;margin-top:4px;flex-wrap:wrap}
    .gp-dev-meta{display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex:none}
    .gp-dev-meta .t{font-size:10.5px;color:var(--gp-t3);white-space:nowrap;font-variant-numeric:tabular-nums}
    .gp-dev-toggle{border:1px solid var(--gp-line);background:transparent;color:var(--gp-t2);font-size:10.5px;
      height:20px;padding:0 7px;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:3px}
    .gp-dev-toggle:hover{background:var(--gp-card2);color:var(--gp-t1)}
    .gp-dev-toggle .caret{font-size:8px;transition:transform .12s}
    .gp-dev-toggle .caret.up{transform:rotate(180deg)}
    .gp-dev-detail{margin-top:8px;padding:8px 9px;border-radius:8px;background:var(--gp-card2);border:1px solid var(--gp-line2)}
    .gp-dev-kv{display:flex;gap:8px;font-size:11px;line-height:1.7}
    .gp-dev-kv>span{flex:none;width:42px;color:var(--gp-t3)}
    .gp-dev-kv>b{font-weight:500;color:var(--gp-t2);word-break:break-all}
    .gp-dev-note{font-size:10.5px;color:var(--gp-t3);line-height:1.7}
    .gp-dev-detail .gp-dev-note{margin-top:5px;padding-top:5px;border-top:1px solid var(--gp-line2)}
    .gp-dev-foot{display:flex;align-items:center;gap:8px;padding:7px 4px 1px;margin-top:5px;
      border-top:1px solid var(--gp-line2);font-size:10px;color:var(--gp-t3)}
    /* AI 教练 */
    .gp-coach{padding:14px 16px;border-left:3px solid color-mix(in srgb,var(--gp-violet) 58%,transparent);
      background:linear-gradient(90deg,color-mix(in srgb,var(--gp-violet) 8%,transparent),transparent 46%),var(--gp-card)}
    .gp-coach-pitch{font-size:12px;color:var(--gp-t2);line-height:1.75;max-width:820px}
    .gp-coach-muted{font-size:11px;color:var(--gp-t3);line-height:1.6}
    .gp-coach-actions{display:flex;align-items:center;gap:9px;margin-top:11px;flex-wrap:wrap}
    .gp-coach-skel{display:flex;flex-direction:column;gap:7px}
    .gp-coach-body{margin-top:2px;font-size:12.5px;line-height:1.78;color:var(--gp-t2);max-width:960px}
    .gp-coach-body b{color:var(--gp-t1);font-weight:600}
    .gp-coach-body code{font-family:ui-monospace,monospace;font-size:11.5px;background:var(--gp-card2);
      padding:1px 5px;border-radius:4px;color:var(--gp-t1)}
    .gp-coach-h{font-size:12.5px;font-weight:650;color:var(--gp-t1);letter-spacing:.2px;margin:12px 0 4px;
      display:flex;align-items:center;gap:7px}
    .gp-coach-h:first-child{margin-top:0}
    .gp-coach-h::before{content:'';width:3px;height:11px;border-radius:2px;background:var(--gp-violet);flex:none}
    .gp-coach-p{margin:1px 0}
    .gp-coach-li{display:flex;gap:8px;margin:3px 0;padding-left:2px}
    .gp-coach-li>i{flex:none;color:var(--gp-violet);font-style:normal;font-variant-numeric:tabular-nums;min-width:10px}
    .gp-coach-li>span{min-width:0}
    .gp-coach-gap{height:7px}
    .gp-coach-foot{display:flex;align-items:center;gap:9px;margin-top:14px;padding-top:10px;
      border-top:1px solid var(--gp-line2);font-size:10.5px;color:var(--gp-t3);flex-wrap:wrap}
    .gp-coach-foot .sp{margin-left:auto;display:flex;gap:6px}
    .gp-coach-err{padding:11px 12px;border-radius:10px;border:1px solid color-mix(in srgb,var(--gp-red) 36%,transparent);
      background:color-mix(in srgb,var(--gp-red) 7%,transparent);display:flex;flex-direction:column;gap:4px}
    .gp-coach-err b{color:var(--gp-red);font-size:12px;font-weight:600}
    .gp-toast{position:fixed;top:64px;right:26px;z-index:80;max-width:380px;padding:9px 13px;border-radius:10px;
      font-size:12px;line-height:1.5;box-shadow:0 10px 30px rgba(0,0,0,.35);border:1px solid var(--gp-line);
      background:var(--gp-card2);color:var(--gp-t1);animation:gp-in .16s ease-out}
    .gp-toast.ok{border-color:color-mix(in srgb,var(--gp-green) 45%,transparent)}
    .gp-toast.err{border-color:color-mix(in srgb,var(--gp-red) 50%,transparent);color:var(--gp-red)}
    @keyframes gp-in{from{transform:translateY(-6px)}to{transform:none}}
    @media (max-width:1220px){
      .gp-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}
      .gp-kpis.n4,.gp-kpis.n5{grid-template-columns:repeat(3,minmax(0,1fr))}
      .gp-split,.gp-g3,.gp-g3.n1,.gp-g3.n2,.gp-g3.n3,.gp-g4{
        grid-template-columns:minmax(0,1fr)}
      .gp-g2,.gp-g2.n1{grid-template-columns:minmax(0,1fr)}
      .gp-unlock-row{grid-template-columns:minmax(0,1fr)}
      .gp-sp2{grid-column:auto}
    }
    /* 活动行：可点击进详情 */
    .gp-row-click{cursor:pointer}
    .gp-row-click:hover{background:var(--gp-card2)}
    .gp-row-click:focus-visible{outline:2px solid var(--gp-blue);outline-offset:-2px}
    .gp-row-open{color:var(--gp-t3);text-align:right;padding-right:3px;font-size:14px;line-height:1}
    .gp-row-click:hover .gp-row-open{color:var(--gp-t1)}
    /* 活动详情抽屉 */
    .gp-detail-backdrop{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.35);
      animation:gp-detail-fade .16s ease-out}
    .gp-detail{position:fixed;top:0;right:0;bottom:0;z-index:91;width:min(560px,92vw);height:100%;
      display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-2,#20242c);
      border-left:1px solid var(--gp-line);box-shadow:-24px 0 60px -20px rgba(0,0,0,.6);
      color:var(--gp-t1);animation:gp-detail-in .22s cubic-bezier(.2,.7,.3,1)}
    @keyframes gp-detail-in{from{transform:translateX(100%)}to{transform:none}}
    @keyframes gp-detail-fade{from{opacity:0}to{opacity:1}}
    .gp-detail-hd{display:flex;align-items:flex-start;gap:12px;padding:16px 18px 12px;
      border-bottom:1px solid var(--gp-line2);flex:none}
    .gp-detail-title{font-size:15px;font-weight:650;line-height:1.35;min-width:0;overflow-wrap:anywhere}
    .gp-detail-sub{font-size:11px;color:var(--gp-t3);margin-top:3px;font-variant-numeric:tabular-nums}
    .gp-detail-close{margin-left:auto;flex:none;width:28px;height:28px;border-radius:8px;
      border:1px solid var(--gp-line);background:var(--gp-card);color:var(--gp-t2);
      font-size:14px;line-height:1;cursor:pointer;display:grid;place-items:center}
    .gp-detail-close:hover{background:var(--gp-card2);color:var(--gp-t1)}
    .gp-detail-body{flex:1;overflow:auto;padding:14px 18px 22px;display:flex;flex-direction:column;gap:16px}
    .gp-detail-body>*{flex:none}
    .gp-detail-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
    .gp-detail-kpi{background:var(--gp-card);border:1px solid var(--gp-line2);border-radius:10px;
      padding:8px 10px;min-width:0}
    .gp-detail-kpi .k{font-size:10.5px;color:var(--gp-t3)}
    .gp-detail-kpi .v{font-size:15px;font-weight:650;margin-top:2px;font-variant-numeric:tabular-nums;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gp-detail-kpi .v small{font-size:10px;font-weight:400;color:var(--gp-t3);margin-left:3px}
    .gp-detail-sec{display:flex;align-items:baseline;gap:8px}
    .gp-detail-sec h4{font-size:12px;margin:0;font-weight:650}
    .gp-detail-sec .sp{margin-left:auto;font-size:10.5px;color:var(--gp-t3)}
    .gp-detail-track{display:flex;flex-direction:column;gap:0}
    .gp-detail-map{display:block;width:100%;height:220px;background:var(--gp-card);
      border:1px solid var(--gp-line2);border-radius:11px}
    .gp-detail-mapwrap{position:relative;width:100%;height:220px;border-radius:11px;overflow:hidden;
      border:1px solid var(--gp-line2);background:var(--gp-card)}
    .gp-detail-mapwrap .gp-detail-map{height:100%;border:0;border-radius:0}
    .gp-detail-map-img{object-fit:cover;object-position:center;background:var(--gp-card)}
    .gp-map-attr{position:absolute;right:5px;bottom:5px;z-index:2;font-size:9.5px;line-height:1.5;
      padding:0 5px;border-radius:4px;color:var(--gp-t2);text-decoration:none;
      background:color-mix(in srgb,var(--gp-card) 86%,transparent);border:1px solid var(--gp-line2)}
    .gp-map-attr:hover{color:var(--gp-t1)}
    .gp-map-attr-lg{font-size:10.5px;padding:1px 7px}
    .gp-map-zoom{position:absolute;right:5px;top:5px;z-index:2;font:inherit;font-size:10px;
      line-height:1.5;padding:1px 7px;border-radius:5px;cursor:pointer;color:var(--gp-t2);
      background:color-mix(in srgb,var(--gp-card) 88%,transparent);border:1px solid var(--gp-line2)}
    .gp-map-zoom:hover{color:var(--gp-t1)}
    .gp-map-unavailable{color:var(--gp-t3);opacity:.86}
    .gp-map-zoom-backdrop{position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.62);
      animation:gp-detail-fade .16s ease-out}
    .gp-map-zoom-modal{position:fixed;z-index:96;top:50%;left:50%;transform:translate(-50%,-50%);
      width:min(720px,calc(100vw - 32px));border-radius:14px;overflow:hidden;
      background:var(--dsw-alias-bg-layer-2,#20242c);border:1px solid var(--gp-line);
      box-shadow:0 30px 80px -30px rgba(0,0,0,.7);animation:gp-detail-fade .16s ease-out}
    .gp-map-zoom-hd{display:flex;align-items:center;gap:10px;padding:9px 14px;
      border-bottom:1px solid var(--gp-line2)}
    .gp-map-zoom-hd .tt{font-size:13px;font-weight:650;color:var(--gp-t1)}
    .gp-map-zoom-hd .gp-detail-close{margin-left:auto}
    .gp-map-zoom-body{position:relative;background:var(--gp-card)}
    .gp-map-zoom-img{display:block;width:100%;height:auto;max-height:68vh;object-fit:cover}
    .gp-detail-elev{display:block;width:100%;margin-top:8px;background:var(--gp-card);
      border:1px solid var(--gp-line2);border-radius:9px;padding:5px 7px 4px}
    /* 海拔剖面（路书预览 / 活动抽屉共用）：左海拔轴 + 底距离轴 + 悬停提示 */
    .gp-elev{display:flex;flex-direction:column;gap:1px;min-width:0}
    .gp-elev-main{display:flex;align-items:stretch;gap:5px;min-width:0}
    .gp-elev-yaxis{width:34px;flex:none;display:flex;flex-direction:column;
      justify-content:space-between;padding:2px 0;text-align:right;
      font-size:9px;line-height:1;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-elev-y{white-space:nowrap}
    .gp-elev-plot{position:relative;flex:1;min-width:0;cursor:crosshair;touch-action:pan-y}
    .gp-elev-plot svg{display:block;width:100%}
    .gp-elev-xaxis{display:flex;justify-content:space-between;padding-left:39px;
      font-size:9px;line-height:1.4;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-elev-stats{display:flex;gap:11px;flex-wrap:wrap;padding-left:39px;font-size:10px;
      line-height:1.5;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-elev-stats b{color:var(--gp-t2);font-weight:600}
    .gp-elev-tip{position:absolute;top:1px;transform:translateX(-50%);z-index:4;
      pointer-events:none;white-space:nowrap;font-size:9.5px;line-height:1.5;
      padding:1px 6px;border-radius:5px;color:var(--gp-t1);
      border:1px solid var(--gp-line);background:var(--gp-card2);
      box-shadow:0 6px 16px -8px rgba(0,0,0,.6);font-variant-numeric:tabular-nums}
    .gp-detail-cap{font-size:10.5px;color:var(--gp-t3);margin-top:6px;display:flex;gap:10px;
      flex-wrap:wrap;font-variant-numeric:tabular-nums}
    .gp-detail-empty{border:1px dashed var(--gp-line);border-radius:10px;padding:16px;
      color:var(--gp-t3);font-size:11.5px;text-align:center}
    .gp-detail-splits{max-height:240px;overflow:auto;border:1px solid var(--gp-line2);border-radius:10px}
    .gp-detail-splits .gp-table th,.gp-detail-splits .gp-table td{padding:5px 8px}
    .gp-detail-zones{display:flex;flex-direction:column;gap:6px}
    .gp-detail-zone{display:flex;align-items:center;gap:8px;font-size:11px}
    .gp-detail-zone .z{width:22px;color:var(--gp-t3);flex:none;font-variant-numeric:tabular-nums}
    .gp-detail-zone .bar{flex:1;height:7px;border-radius:999px;background:var(--gp-card2);overflow:hidden}
    .gp-detail-zone .bar>i{display:block;height:100%;border-radius:999px}
    .gp-detail-zone .t{width:56px;text-align:right;color:var(--gp-t2);flex:none;
      font-variant-numeric:tabular-nums}
    .gp-detail-zone .r{width:82px;text-align:right;color:var(--gp-t3);flex:none;font-size:10px;
      font-variant-numeric:tabular-nums}
    .gp-detail-chips{display:flex;flex-wrap:wrap;gap:6px}
    .gp-detail-chip{font-size:10.5px;color:var(--gp-t2);border:1px solid var(--gp-line);
      border-radius:999px;padding:2px 9px;line-height:1.6}
    .gp-detail-foot{flex:none;display:flex;align-items:center;gap:8px;padding:12px 18px;
      border-top:1px solid var(--gp-line2);background:var(--gp-card)}
    .gp-detail-foot .sp{margin-left:auto;display:flex;gap:8px}
    .gp-detail-link{text-decoration:none}
    /* 抽屉打开时页面 toast 必须在遮罩之上 */
    .gp-toast{z-index:120}
    /* 首屏：setup/status 未返回前的小骨架，避免先闪一下空仪表盘 */
    .gp-boot{min-height:62vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:12px;color:var(--gp-t3)}
    .gp-spin{width:20px;height:20px;border-radius:50%;border:2px solid var(--gp-line);
      border-top-color:var(--gp-blue);animation:gp-rotate .9s linear infinite;flex:none}
    @keyframes gp-rotate{to{transform:rotate(360deg)}}
    .gp-boot-text{font-size:11.5px;letter-spacing:.3px}
    /* 首次连接引导：三步开始（整页首屏与仪表盘预览浮层共用同一张卡片） */
    .gp-onb-page{min-height:calc(100vh - var(--dsh-frame-top-clearance,48px));display:flex;
      align-items:center;justify-content:center;padding:30px 18px 56px}
    .gp-onb-overlay{position:fixed;inset:0;z-index:110;display:flex;align-items:flex-start;
      justify-content:center;overflow:auto;padding:calc(var(--dsh-frame-top-clearance,48px) + 14px) 16px 28px;
      background:rgba(4,8,14,.62);backdrop-filter:blur(4px);animation:gp-detail-fade .16s ease-out}
    .gp-onb-card{width:100%;max-width:760px;background:var(--dsw-alias-bg-layer-2,#20242c);
      border:1px solid var(--gp-line);border-radius:18px;padding:26px 28px 20px;
      box-shadow:0 26px 70px -30px rgba(0,0,0,.6);color:var(--gp-t1);min-width:0}
    .gp-onb-hd{display:flex;align-items:flex-start;gap:12px;margin-bottom:18px}
    .gp-onb-mark{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;flex:none;
      background:color-mix(in srgb,var(--gp-blue) 17%,transparent);
      border:1px solid color-mix(in srgb,var(--gp-blue) 34%,transparent);font-size:19px}
    .gp-onb-hd-main{min-width:0;flex:1}
    .gp-onb-title{font-size:21px;font-weight:700;letter-spacing:.3px;margin:0;line-height:1.3}
    .gp-onb-sub{font-size:12.5px;color:var(--gp-t2);margin:4px 0 0;line-height:1.7}
    .gp-onb-close{flex:none;height:28px;border-radius:8px;border:1px solid var(--gp-line);
      background:var(--gp-card);color:var(--gp-t2);font-size:12px;padding:0 12px;cursor:pointer;
      font-family:inherit}
    .gp-onb-close:hover{background:var(--gp-card2);color:var(--gp-t1)}
    .gp-onb-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,352px);gap:13px;
      align-items:start}
    .gp-onb-step{border:1px solid var(--gp-line2);border-radius:14px;background:var(--gp-card);
      padding:15px 16px;min-width:0;display:flex;flex-direction:column;gap:10px}
    .gp-onb-step1{grid-column:1}
    .gp-onb-step2{grid-column:2;border-color:color-mix(in srgb,var(--gp-blue) 34%,transparent);
      background:linear-gradient(180deg,color-mix(in srgb,var(--gp-blue) 7%,transparent),transparent 62%),var(--gp-card)}
    .gp-onb-step3{grid-column:1 / -1;gap:9px}
    .gp-onb-step-hd{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
    .gp-onb-n{width:25px;height:25px;border-radius:50%;flex:none;display:grid;place-items:center;
      font-size:12px;font-weight:700;color:var(--gp-blue);
      background:color-mix(in srgb,var(--gp-blue) 15%,transparent);
      border:1px solid color-mix(in srgb,var(--gp-blue) 32%,transparent);
      font-variant-numeric:tabular-nums}
    .gp-onb-step-title{font-size:13.5px;font-weight:650;margin:0;letter-spacing:.2px;line-height:1.4}
    .gp-onb-tag{margin-left:auto;font-size:9.5px;color:var(--gp-t3);border:1px solid var(--gp-line);
      border-radius:999px;padding:1px 8px;white-space:nowrap}
    .gp-onb-tag.on{color:var(--gp-blue);border-color:color-mix(in srgb,var(--gp-blue) 40%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 11%,transparent)}
    .gp-onb-copy{font-size:11.5px;color:var(--gp-t2);line-height:1.8;margin:0}
    .gp-onb-copy b{color:var(--gp-t1);font-weight:600}
    .gp-onb-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
    .gp-onb-link{text-decoration:none;height:32px;font-size:12px;padding:0 12px}
    .gp-onb-link.sub{height:27px;font-size:11px;color:var(--gp-t2);border-color:var(--gp-line);
      background:transparent}
    .gp-onb-link.sub:hover{color:var(--gp-t1);background:var(--gp-card2)}
    .gp-onb-help-toggle{align-self:flex-start;border:0;background:transparent;padding:2px 0;
      color:var(--gp-blue);font-size:11.5px;font-family:inherit;cursor:pointer;display:inline-flex;
      align-items:center;gap:6px;text-align:left;line-height:1.6}
    .gp-onb-help-toggle:hover{text-decoration:underline}
    .gp-onb-help-toggle .caret{font-size:9px;transition:transform .12s;display:inline-block}
    .gp-onb-help-toggle .caret.up{transform:rotate(180deg)}
    .gp-onb-help{margin:2px 0 0;border-top:1px dashed var(--gp-line2);padding-top:10px;
      display:flex;flex-direction:column;gap:8px;animation:gp-in .14s ease-out}
    .gp-onb-help ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}
    .gp-onb-help li{display:flex;gap:9px;font-size:11.5px;color:var(--gp-t2);line-height:1.7;min-width:0}
    .gp-onb-help li .n{width:18px;height:18px;border-radius:50%;flex:none;display:grid;place-items:center;
      font-size:9.5px;color:var(--gp-t3);background:var(--gp-card2);font-variant-numeric:tabular-nums;
      margin-top:1px}
    .gp-onb-help li b{color:var(--gp-t1);font-weight:600}
    .gp-onb-help code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;
      background:var(--gp-card2);border:1px solid var(--gp-line2);border-radius:5px;padding:1px 5px;
      color:var(--gp-t1);white-space:nowrap}
    .gp-onb-help .note{font-size:10.5px;color:var(--gp-t3);line-height:1.7;background:var(--gp-card2);
      border-radius:8px;padding:7px 9px}
    .gp-onb-keyrow{display:flex;gap:8px;align-items:stretch;flex-wrap:wrap}
    .gp-onb-keyrow .gp-input{flex:1 1 100%;min-width:0;height:36px;
      font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.4px}
    .gp-onb-keyrow .gp-input:focus{border-color:var(--gp-blue)}
    .gp-onb-keyrow .gp-btn{flex:1 1 100%;height:34px;justify-content:center;font-size:12.5px}
    .gp-onb-privacy{font-size:10.5px;color:var(--gp-t3);line-height:1.6;display:flex;
      align-items:flex-start;gap:5px}
    .gp-onb-privacy::before{content:'🔒';font-size:10px;line-height:1.6}
    .gp-onb-alert{font-size:11.5px;line-height:1.65;color:var(--gp-red);
      background:color-mix(in srgb,var(--gp-red) 8%,transparent);
      border:1px solid color-mix(in srgb,var(--gp-red) 34%,transparent);border-radius:9px;
      padding:8px 10px;display:flex;flex-direction:column;gap:4px;word-break:break-word}
    .gp-onb-alert a{color:inherit;text-decoration:underline;text-underline-offset:2px}
    .gp-onb-ok{font-size:11.5px;line-height:1.65;color:var(--gp-green);display:flex;
      align-items:center;gap:7px}
    .gp-onb-ok .gp-spin{width:13px;height:13px;border-width:1.5px;border-top-color:var(--gp-green)}
    .gp-onb-step3 .gp-unlock.bare{background:transparent;border:0;padding:0;gap:9px;
      align-self:stretch;width:100%}
    .gp-onb-step3 .gp-unlock.bare .gp-log{max-height:150px}
    .gp-onb-step3-foot{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:1px}
    .gp-onb-skip{border:0;background:transparent;padding:2px 0;color:var(--gp-t3);font-size:11.5px;
      font-family:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
    .gp-onb-skip:hover{color:var(--gp-t2)}
    .gp-onb-foot{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:18px;
      padding-top:13px;border-top:1px solid var(--gp-line2);font-size:10.5px;color:var(--gp-t3)}
    .gp-onb-foot .sp{margin-left:auto}
    .gp-onb-foot .gp-btn{height:29px}
    .gp-foot-link{border:0;background:transparent;padding:0;color:var(--gp-blue);font-size:10.5px;
      font-family:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
    .gp-foot-link:hover{color:var(--gp-t1)}
    .gp-onb a:focus-visible,.gp-onb button:focus-visible,.gp-onb input:focus-visible,
    .gp-onb-card a:focus-visible,.gp-onb-card button:focus-visible,.gp-onb-card input:focus-visible{
      outline:2px solid var(--gp-blue);outline-offset:2px}
    @media (max-width:860px){
      .gp-onb-grid{grid-template-columns:minmax(0,1fr)}
      .gp-onb-step1,.gp-onb-step2,.gp-onb-step3{grid-column:1}
    }
    /* 进阶解锁卡片 */
    .gp-unlock{background:var(--gp-card);border:1px solid var(--gp-line2);border-radius:13px;
      padding:12px 14px;min-width:0;display:flex;flex-direction:column;gap:9px;align-self:start;
      border-left:3px solid color-mix(in srgb,var(--gp-blue) 45%,transparent)}
    .gp-unlock.compact{padding:11px 12px;gap:8px}
    .gp-unlock.bare{background:transparent;border:0;padding:0;border-left:0}
    .gp-unlock-hd{display:flex;align-items:center;gap:8px}
    .gp-unlock-hd b{font-size:12px;font-weight:650;letter-spacing:.2px}
    .gp-unlock-ic{width:20px;height:20px;border-radius:6px;display:grid;place-items:center;flex:none;
      background:color-mix(in srgb,var(--gp-blue) 15%,transparent);font-size:11px}
    .gp-unlock-tag{margin-left:auto;font-size:9.5px;color:var(--gp-t3);border:1px solid var(--gp-line);
      border-radius:999px;padding:1px 7px;white-space:nowrap}
    .gp-unlock-copy{font-size:11.5px;color:var(--gp-t2);line-height:1.78}
    .gp-unlock.compact .gp-unlock-copy{font-size:11px;line-height:1.7}
    .gp-unlock-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
    .gp-unlock-muted{font-size:10.5px;color:var(--gp-t3);line-height:1.6}
    .gp-unlock-err{font-size:11px;color:var(--gp-red);line-height:1.65;word-break:break-word}
    .gp-log{background:var(--gp-card2);border:1px solid var(--gp-line2);border-radius:8px;
      padding:8px 9px;max-height:132px;overflow:auto}
    .gp-log-line{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:1.7;
      color:var(--gp-t2);opacity:.82;white-space:pre-wrap;word-break:break-all;margin:0}
    .gp-hintline{display:flex;align-items:center;gap:7px;font-size:10.5px;color:var(--gp-t2)}
    .gp-hintline .gp-spin{width:12px;height:12px;border-width:1.5px}
    .gp-form-compact{gap:9px;margin-top:0}
    .gp-form-compact .gp-input{height:31px}
    .gp-unlock-row{display:grid;gap:11px;grid-template-columns:minmax(0,3fr) minmax(0,1fr);margin-top:11px}
    .gp-sp2{grid-column:span 2}
    .gp-detail-lock{display:flex;flex-direction:column;gap:10px}
    .gp-detail-lock-hint{font-size:11.5px;color:var(--gp-t3);line-height:1.7;
      background:var(--gp-card);border:1px solid var(--gp-line2);border-radius:10px;padding:10px 12px}
    /* AI 健康 · 角色分段切换 */
    .gp-coach-hd{display:flex;align-items:center;gap:10px;margin:-1px 0 12px;flex-wrap:wrap}
    .gp-seg{display:inline-flex;gap:2px;padding:2px;border-radius:9px;
      border:1px solid var(--gp-line);background:var(--gp-card2)}
    .gp-seg-btn{border:0;background:transparent;color:var(--gp-t2);font-size:11.5px;height:24px;
      padding:0 11px;border-radius:7px;cursor:pointer;font-family:inherit;white-space:nowrap;
      display:inline-flex;align-items:center;gap:5px}
    .gp-seg-btn:hover{color:var(--gp-t1)}
    .gp-seg-btn.on{background:color-mix(in srgb,var(--gp-blue) 20%,transparent);color:var(--gp-t1);
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--gp-blue) 45%,transparent)}
    .gp-seg-btn:focus-visible{outline:2px solid var(--gp-blue);outline-offset:1px}
    .gp-coach.verdict-keep{border-left-color:var(--gp-green)}
    .gp-coach.verdict-watch{border-left-color:var(--gp-amber)}
    .gp-coach.verdict-attention{border-left-color:var(--gp-red)}
    .gp-verdict{display:flex;align-items:center;gap:7px;margin:0 0 9px;font-size:10.5px;color:var(--gp-t3)}
    .gp-verdict .tag{font-size:10px;font-weight:600;padding:1px 8px;border-radius:999px;
      border:1px solid var(--gp-line);letter-spacing:.2px}
    .gp-verdict.keep .tag{color:var(--gp-green);
      border-color:color-mix(in srgb,var(--gp-green) 42%,transparent);
      background:color-mix(in srgb,var(--gp-green) 11%,transparent)}
    .gp-verdict.watch .tag{color:var(--gp-amber);
      border-color:color-mix(in srgb,var(--gp-amber) 42%,transparent);
      background:color-mix(in srgb,var(--gp-amber) 11%,transparent)}
    .gp-verdict.attention .tag{color:var(--gp-red);
      border-color:color-mix(in srgb,var(--gp-red) 42%,transparent);
      background:color-mix(in srgb,var(--gp-red) 11%,transparent)}
    .gp-coach-disclaim{margin-top:11px;padding-top:9px;border-top:1px solid var(--gp-line2);
      font-size:10px;color:var(--gp-t3);letter-spacing:.15px}
    /* 个性化 · 原地编辑（Android 桌面风格，无弹窗） */
    .gp-slot{position:relative;display:block;min-width:0}
    .gp-slot-body{display:block;min-width:0}
    .gp-slot.is-editing{border:2px dashed color-mix(in srgb,var(--gp-blue) 52%,transparent);
      border-radius:15px;padding:15px 8px 8px;margin:18px 0 10px;
      background:color-mix(in srgb,var(--gp-blue) 4%,transparent);
      transition:border-color .12s ease,background .12s ease}
    .gp-slot.is-editing:hover{border-color:color-mix(in srgb,var(--gp-blue) 76%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 7%,transparent)}
    /* 编辑态：内容整体不可点击/不可选中（捕获阶段另有兜底，防 dispatchEvent） */
    .gp-slot.is-editing .gp-slot-body{pointer-events:none;user-select:none;-webkit-user-select:none}
    .gp-slot.is-editing .gp-sec{margin-top:2px}
    .gp-slot.is-dragging{opacity:.5}
    .gp-slot-tools{position:absolute;top:-13px;left:11px;right:11px;height:24px;z-index:2;
      display:flex;align-items:center;gap:7px;pointer-events:none}
    .gp-slot-handle{pointer-events:auto;cursor:grab;display:inline-grid;place-items:center;
      width:24px;height:24px;border-radius:7px;flex:none;
      border:1px solid color-mix(in srgb,var(--gp-blue) 40%,transparent);
      background:var(--dsw-alias-bg-layer-2,#20242c);color:var(--gp-blue);
      font-size:13px;line-height:1;box-shadow:0 2px 8px rgba(0,0,0,.28)}
    .gp-slot-handle:active{cursor:grabbing}
    .gp-slot-label{pointer-events:auto;cursor:grab;font-size:10.5px;color:var(--gp-t2);
      background:var(--dsw-alias-bg-layer-2,#20242c);border:1px solid var(--gp-line);
      border-radius:999px;padding:2px 9px;line-height:1.4;white-space:nowrap;
      max-width:52%;overflow:hidden;text-overflow:ellipsis}
    .gp-slot-label:active{cursor:grabbing}
    .gp-slot-remove{pointer-events:auto;margin-left:auto;flex:none;width:24px;height:24px;
      border-radius:7px;border:1px solid color-mix(in srgb,var(--gp-red) 34%,transparent);
      background:var(--dsw-alias-bg-layer-2,#20242c);color:var(--gp-red);font-size:14px;
      line-height:1;cursor:pointer;display:grid;place-items:center;font-family:inherit}
    .gp-slot-remove:hover{background:color-mix(in srgb,var(--gp-red) 16%,transparent);
      color:color-mix(in srgb,var(--gp-red) 82%,var(--gp-t1))}
    .gp-slot-remove:focus-visible,.gp-slot-handle:focus-visible,.gp-addbox:focus-visible{
      outline:2px solid var(--gp-blue);outline-offset:1px}
    /* 拖拽中的插入占位：与拖动源同高、虚线框，顶边是 3px 插入线 */
    .gp-slot-ghost{position:relative;margin:10px 0;
      border:2px dashed color-mix(in srgb,var(--gp-blue) 62%,transparent);border-radius:15px;
      background:color-mix(in srgb,var(--gp-blue) 7%,transparent);
      display:flex;align-items:center;justify-content:center;min-height:44px}
    .gp-slot-insert{position:absolute;left:6px;right:6px;top:-3px;height:3px;border-radius:2px;
      background:var(--gp-blue);pointer-events:none;
      box-shadow:0 0 9px color-mix(in srgb,var(--gp-blue) 70%,transparent)}
    .gp-slot-ghost-text{font-size:11.5px;color:var(--gp-t2);letter-spacing:.4px;pointer-events:none}
    /* 卡片级个性化：比区块槽更细的虚线框，手柄 / × 收在卡片顶部两角 */
    .gp-card-slot{position:relative;display:block;min-width:0;pointer-events:auto}
    .gp-card-slot.is-editing{border:1.5px dashed color-mix(in srgb,var(--gp-blue) 55%,transparent);
      border-radius:14px;padding:23px 5px 5px;background:color-mix(in srgb,var(--gp-blue) 3%,transparent);
      transition:border-color .12s ease,background .12s ease}
    .gp-card-slot.is-editing:hover{border-color:color-mix(in srgb,var(--gp-blue) 78%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 6%,transparent)}
    .gp-card-slot.is-editing .gp-card-slot-body{pointer-events:none;user-select:none;
      -webkit-user-select:none;height:100%}
    .gp-card-slot.is-editing .gp-card-slot-body>*{height:100%}
    .gp-card-slot.is-dragging{opacity:.5}
    .gp-card-tools{position:absolute;top:3px;left:4px;right:4px;height:18px;z-index:2;
      display:flex;align-items:center;gap:5px;pointer-events:none}
    .gp-card-handle{pointer-events:auto;cursor:grab;display:inline-grid;place-items:center;
      width:18px;height:18px;flex:none;border-radius:5px;font-size:11px;line-height:1;
      border:1px solid color-mix(in srgb,var(--gp-blue) 42%,transparent);
      background:var(--dsw-alias-bg-layer-2,#20242c);color:var(--gp-blue);
      box-shadow:0 1px 5px rgba(0,0,0,.26)}
    .gp-card-handle:active{cursor:grabbing}
    .gp-card-label{pointer-events:auto;cursor:grab;font-size:9.5px;line-height:1.4;color:var(--gp-t3);
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100% - 54px)}
    .gp-card-label:active{cursor:grabbing}
    .gp-card-remove{pointer-events:auto;margin-left:auto;flex:none;width:18px;height:18px;
      border-radius:5px;border:1px solid color-mix(in srgb,var(--gp-red) 36%,transparent);
      background:var(--dsw-alias-bg-layer-2,#20242c);color:var(--gp-red);font-size:11px;
      line-height:1;cursor:pointer;display:grid;place-items:center;font-family:inherit;padding:0}
    .gp-card-remove:hover{background:color-mix(in srgb,var(--gp-red) 16%,transparent);
      color:color-mix(in srgb,var(--gp-red) 82%,var(--gp-t1))}
    .gp-card-remove:focus-visible,.gp-card-handle:focus-visible,.gp-card-add:focus-visible{
      outline:2px solid var(--gp-blue);outline-offset:1px}
    /* 卡片拖拽占位：与拖动源同高，顶边 3px 插入线 */
    .gp-card-ghost{position:relative;min-width:0;min-height:40px;
      border:1.5px dashed color-mix(in srgb,var(--gp-blue) 62%,transparent);border-radius:14px;
      background:color-mix(in srgb,var(--gp-blue) 7%,transparent);
      display:flex;align-items:center;justify-content:center}
    .gp-card-insert{position:absolute;left:6px;right:6px;top:-2px;height:3px;border-radius:2px;
      background:var(--gp-blue);pointer-events:none;
      box-shadow:0 0 9px color-mix(in srgb,var(--gp-blue) 70%,transparent)}
    .gp-card-ghost-text{font-size:10.5px;color:var(--gp-t2);letter-spacing:.4px;pointer-events:none}
    /* 隐藏卡片的虚线添加 chip（渲染在卡片区末尾） */
    .gp-card-add{display:inline-flex;align-items:center;gap:5px;min-height:32px;padding:0 11px;
      pointer-events:auto;align-self:start;justify-self:start;
      border:1px dashed color-mix(in srgb,var(--gp-blue) 42%,transparent);
      border-radius:10px;background:color-mix(in srgb,var(--gp-blue) 7%,transparent);
      color:var(--gp-t1);font-size:11px;font-family:inherit;cursor:pointer;text-align:left}
    .gp-card-add:hover{background:color-mix(in srgb,var(--gp-blue) 15%,transparent);
      border-color:color-mix(in srgb,var(--gp-blue) 66%,transparent)}
    .gp-card-add .plus{color:var(--gp-blue);font-size:13px;line-height:1;font-weight:600}
    .gp-card-add .lb{white-space:nowrap}
    .gp-card-addrow{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px;margin-top:2px}
    .gp-cards-empty{grid-column:1/-1;font-size:11px;color:var(--gp-t3);padding:7px 2px}
    .gp-coach-hd-outer{margin:0 0 9px}
    .gp-coach-role{font-size:12px;font-weight:650;letter-spacing:.2px;color:var(--gp-t1)}
    /* 编辑态底部的隐藏区块添加区 */
    .gp-addzone{margin:20px 0 4px;border:2px dashed var(--gp-line);border-radius:15px;
      padding:12px 13px 13px;background:color-mix(in srgb,var(--gp-t1) 2%,transparent)}
    .gp-addzone-hd{display:flex;align-items:baseline;gap:8px;margin-bottom:10px}
    .gp-addzone-hd b{font-size:12px;font-weight:650;letter-spacing:.2px}
    .gp-addzone-hd .cnt{font-size:10.5px;color:var(--gp-t3)}
    .gp-addbox-row{display:flex;flex-wrap:wrap;gap:8px}
    .gp-addbox{display:inline-flex;align-items:center;gap:7px;min-height:38px;padding:0 13px;
      border:1px dashed color-mix(in srgb,var(--gp-blue) 42%,transparent);border-radius:10px;
      background:color-mix(in srgb,var(--gp-blue) 7%,transparent);color:var(--gp-t1);
      font-size:12px;font-family:inherit;cursor:pointer;text-align:left}
    .gp-addbox:hover{background:color-mix(in srgb,var(--gp-blue) 15%,transparent);
      border-color:color-mix(in srgb,var(--gp-blue) 66%,transparent)}
    .gp-addbox .plus{color:var(--gp-blue);font-size:14px;line-height:1;font-weight:600}
    .gp-addbox .lb{white-space:nowrap}
    .gp-addzone-empty{font-size:11.5px;color:var(--gp-t3);padding:3px 1px}
    /* 浮动编辑工具条：高于内容，低于 toast（120） */
    .gp-editbar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:100;
      display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:14px;
      border:1px solid var(--gp-line);background:var(--dsw-alias-bg-layer-2,#20242c);
      box-shadow:0 18px 44px -14px rgba(0,0,0,.66),0 2px 8px rgba(0,0,0,.24);
      max-width:calc(100vw - 20px);animation:gp-editbar-in .16s ease-out}
    @keyframes gp-editbar-in{from{opacity:0}to{opacity:1}}
    .gp-editbar-hint{font-size:10.5px;color:var(--gp-t3);padding:0 4px;white-space:nowrap}
    .gp-editbar .sp{width:1px;height:18px;background:var(--gp-line2);margin:0 2px}
    .gp-editbar .gp-btn{height:30px}
    .gp-root.is-editing .gp-wrap{padding-bottom:110px}
    .gp-btn.on{background:var(--gp-card2);color:var(--gp-t1)}
    @media (max-width:600px){
      .gp-wrap{padding:0 14px 48px}
      .gp-top{flex-wrap:wrap;gap:8px;padding:calc(var(--dsh-frame-top-clearance,0px) + 10px) 0 10px}
      .gp-right{width:100%;flex-wrap:wrap;margin-left:0}
      .gp-sec{flex-wrap:wrap}
      .gp-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
      .gp-kpis.n1{grid-template-columns:minmax(0,1fr)}
      .gp-kpis.n2,.gp-kpis.n3,.gp-kpis.n4,.gp-kpis.n5{
        grid-template-columns:repeat(2,minmax(0,1fr))}
      .gp-g2,.gp-g2.n1,.gp-g3,.gp-g3.n1,.gp-g3.n2,.gp-g3.n3{
        grid-template-columns:minmax(0,1fr)}
      .gp-onb-page{padding:16px 12px 44px}
      .gp-onb-overlay{padding:calc(var(--dsh-frame-top-clearance,48px) + 8px) 10px 20px}
      .gp-onb-card{padding:20px 16px 16px;border-radius:15px}
      .gp-onb-hd{gap:10px;margin-bottom:14px}
      .gp-onb-title{font-size:18px}
      .gp-onb-step{padding:13px}
      .gp-onb-foot .sp{display:none}
      .gp-unlock-row{grid-template-columns:minmax(0,1fr)}
      .gp-sp2{grid-column:auto}
      .gp-detail{width:100vw}
      .gp-detail-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
      .gp-slot.is-editing{margin:16px 0 8px;padding:14px 6px 7px}
      .gp-slot-tools{left:8px;right:8px}
      .gp-slot-label{max-width:44%}
      .gp-card-slot.is-editing{padding:22px 4px 4px}
      .gp-card-label{max-width:calc(100% - 48px)}
      .gp-card-add{font-size:10.5px;min-height:30px;padding:0 9px}
      .gp-addzone{padding:10px 10px 11px}
      .gp-addbox{flex:1 1 100%;justify-content:flex-start}
      .gp-editbar{left:10px;right:10px;bottom:10px;transform:none;flex-wrap:wrap;
        justify-content:center;padding:8px;gap:7px}
      .gp-editbar-hint{flex:1 1 100%;text-align:center;padding:0;white-space:normal}
      .gp-editbar .sp{display:none}
      .gp-coach-hd{gap:8px}
      .gp-coach-disclaim{margin-top:9px}
    }
    /* ---------------- v3：账号设置 / 进阶数据 / AI 营养 / 活动平铺 ---------------- */
    .gp-account-btn{position:relative}
    .gp-account-btn .adot{width:7px;height:7px;border-radius:50%;background:var(--gp-amber);flex:none;
      margin-left:1px;box-shadow:0 0 0 3px color-mix(in srgb,var(--gp-amber) 16%,transparent)}
    /* 授权可能过期：可关闭琥珀横幅 */
    .gp-banner{display:flex;align-items:center;gap:9px;margin:9px 0 1px;padding:8px 11px;
      border-radius:10px;font-size:11.5px;line-height:1.6;color:var(--gp-t1);
      border:1px solid color-mix(in srgb,var(--gp-amber) 42%,transparent);
      background:color-mix(in srgb,var(--gp-amber) 11%,transparent)}
    .gp-banner .ic{color:var(--gp-amber);font-weight:700;flex:none}
    .gp-banner .sp{margin-left:auto;display:flex;align-items:center;gap:7px;flex:none}
    .gp-banner .gp-btn{height:25px;font-size:11px;padding:0 9px}
    .gp-banner .x{border:0;background:transparent;color:var(--gp-t3);font-size:13px;line-height:1;
      font-family:inherit;cursor:pointer;padding:2px 4px;border-radius:5px}
    .gp-banner .x:hover{color:var(--gp-t1);background:var(--gp-card2)}
    /* ---------------- 回看：顶栏日期导航 / 日历弹层 / 回看横幅 ---------------- */
    .gp-datenav{position:relative;display:flex;align-items:center;gap:4px;flex:none;
      padding:2px 3px;border:1px solid var(--gp-line);border-radius:10px;background:var(--gp-card)}
    .gp-datenav.is-review{border-color:color-mix(in srgb,var(--gp-amber) 40%,var(--gp-line));
      background:color-mix(in srgb,var(--gp-amber) 7%,var(--gp-card))}
    .gp-dn-btn{width:21px;height:23px;flex:none;display:inline-flex;align-items:center;justify-content:center;
      border:0;border-radius:7px;background:transparent;color:var(--gp-t2);font-size:13px;line-height:1;
      font-family:inherit;cursor:pointer;padding:0}
    .gp-dn-btn:hover:not(:disabled){background:var(--gp-card2);color:var(--gp-t1)}
    .gp-dn-btn:disabled{opacity:.3;cursor:not-allowed;color:var(--gp-t3);background:transparent}
    .gp-dn-btn:focus-visible,.gp-dn-label:focus-visible,.gp-dn-opt:focus-visible{
      outline:2px solid var(--gp-blue);outline-offset:-1px}
    .gp-dn-label{height:23px;display:inline-flex;align-items:center;gap:5px;padding:0 6px;border:0;border-radius:7px;
      background:transparent;color:var(--gp-t1);font-family:inherit;cursor:pointer;white-space:nowrap}
    .gp-dn-label:hover,.gp-dn-label.on{background:var(--gp-card2)}
    .gp-dn-label b{font-size:12px;font-weight:650;letter-spacing:.2px;font-variant-numeric:tabular-nums}
    .gp-dn-label .w{font-size:10.5px;color:var(--gp-t3);letter-spacing:.2px}
    .gp-dn-today{height:23px;padding:0 8px;font-size:11px;border-radius:7px}
    .gp-dn-chip{flex:none;font-size:10.5px;font-weight:600;letter-spacing:.2px;color:var(--gp-amber);
      padding:2px 7px;border-radius:999px;white-space:nowrap;
      border:1px solid color-mix(in srgb,var(--gp-amber) 44%,transparent);
      background:color-mix(in srgb,var(--gp-amber) 12%,transparent)}
    .gp-dn-pop{position:absolute;top:calc(100% + 7px);left:0;z-index:60;width:188px;
      max-height:min(58vh,332px);overflow:auto;padding:5px;border-radius:12px;
      border:1px solid var(--gp-line);background:var(--dsw-alias-bg-layer-2,#20242c);
      box-shadow:0 20px 46px -16px rgba(0,0,0,.6);animation:gp-in .14s ease-out}
    .gp-dn-pop-hd{font-size:10px;color:var(--gp-t3);padding:3px 7px 5px;letter-spacing:.3px}
    .gp-dn-opt{width:100%;display:flex;align-items:center;gap:7px;height:26px;padding:0 7px;border:0;
      border-radius:7px;background:transparent;color:var(--gp-t2);font-family:inherit;font-size:11.5px;
      cursor:pointer;text-align:left}
    .gp-dn-opt:hover{background:var(--gp-card2);color:var(--gp-t1)}
    .gp-dn-opt .w{width:30px;flex:none;color:var(--gp-t3);font-size:10.5px}
    .gp-dn-opt .d{flex:1;font-variant-numeric:tabular-nums}
    .gp-dn-opt .ck{color:var(--gp-blue);font-size:11px}
    .gp-dn-opt.today .d{color:var(--gp-blue);font-weight:600}
    .gp-dn-opt.on{background:color-mix(in srgb,var(--gp-blue) 18%,transparent);color:var(--gp-t1)}
    .gp-dn-opt.on .w{color:var(--gp-t2)}
    /* 回看横幅：比授权横幅更细，紧跟顶栏 */
    .gp-review-banner{margin:7px 0 1px;padding:6px 10px;font-size:11px}
    .gp-review-banner .ic{font-size:12px}
    .gp-review-banner .sp .dot{color:var(--gp-t3)}
    /* 区块标题里的日期锚点（只在回看时出现） */
    .gp-sec-day{font-size:11px;font-weight:500;color:var(--gp-amber);letter-spacing:.2px}
    /* 账号设置弹窗：高于抽屉（91）/ 编辑条（100）/ toast（120） */
    .gp-acct-backdrop{position:fixed;inset:0;z-index:139;background:rgba(0,0,0,.46);
      animation:gp-detail-fade .16s ease-out}
    .gp-acct{position:fixed;z-index:140;top:50%;left:50%;transform:translate(-50%,-50%);
      width:min(566px,calc(100vw - 24px));max-height:min(86vh,780px);display:flex;flex-direction:column;
      border-radius:16px;border:1px solid var(--gp-line);background:var(--dsw-alias-bg-layer-2,#20242c);
      color:var(--gp-t1);box-shadow:0 30px 80px -24px rgba(0,0,0,.7);animation:gp-acct-in .16s ease-out}
    @keyframes gp-acct-in{from{opacity:0;transform:translate(-50%,-52%)}to{opacity:1;transform:translate(-50%,-50%)}}
    .gp-acct-hd{display:flex;align-items:center;gap:9px;padding:14px 16px 11px;flex:none;
      border-bottom:1px solid var(--gp-line2)}
    .gp-acct-hd b{font-size:14px;font-weight:650;letter-spacing:.2px}
    .gp-acct-hd .sp{margin-left:auto;display:flex;align-items:center;gap:4px}
    .gp-acct-body{overflow:auto;padding:2px 16px 10px;display:flex;flex-direction:column}
    .gp-acct-row{display:grid;grid-template-columns:92px minmax(0,1fr);gap:10px;
      padding:10px 0;border-bottom:1px solid var(--gp-line2)}
    .gp-acct-row:last-child{border-bottom:0}
    .gp-acct-lab{font-size:11px;color:var(--gp-t3);padding-top:2px;line-height:1.6}
    .gp-acct-val{min-width:0;display:flex;flex-direction:column;gap:6px}
    .gp-acct-main{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--gp-t1);flex-wrap:wrap}
    .gp-acct-main b{font-weight:600}
    .gp-acct-sub{font-size:10.5px;color:var(--gp-t3);line-height:1.7;font-variant-numeric:tabular-nums;
      word-break:break-word}
    .gp-acct-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
    .gp-acct-actions .gp-btn{height:25px;font-size:11px;padding:0 9px}
    .gp-acct-warn{font-size:10.5px;line-height:1.65;color:var(--gp-amber);border-radius:8px;padding:6px 8px;
      background:color-mix(in srgb,var(--gp-amber) 9%,transparent);
      border:1px solid color-mix(in srgb,var(--gp-amber) 32%,transparent)}
    .gp-acct-keyform{display:flex;gap:7px;flex-wrap:wrap}
    .gp-acct-keyform .gp-input{flex:1 1 100%;height:31px;font-size:11.5px;letter-spacing:.3px;
      font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
    .gp-acct-keyform .gp-btn{height:28px;font-size:11.5px}
    .gp-acct-err{font-size:11px;line-height:1.6;color:var(--gp-red);border-radius:8px;padding:6px 8px;
      word-break:break-word;background:color-mix(in srgb,var(--gp-red) 8%,transparent);
      border:1px solid color-mix(in srgb,var(--gp-red) 30%,transparent)}
    .gp-acct-note{font-size:11px;line-height:1.65;color:var(--gp-green)}
    .gp-acct-ft{flex:none;padding:9px 16px;border-top:1px solid var(--gp-line2);background:var(--gp-card);
      font-size:10px;color:var(--gp-t3);line-height:1.6}
    .gp-acct-log{max-height:96px}
    /* 高级功能 Key（可选）：账号设置 / 新手引导共用 */
    .gp-acct-sec{display:flex;flex-direction:column;gap:8px;padding:11px 0 2px;
      border-bottom:1px solid var(--gp-line2)}
    .gp-acct-sec-hd{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
    .gp-acct-sec-hd b{font-size:12px;font-weight:650;letter-spacing:.2px}
    .gp-acct-sec-hd .gp-acct-sub{margin-left:auto}
    .gp-keys{display:flex;flex-direction:column;gap:10px;min-width:0}
    .gp-keys-sec{display:flex;flex-direction:column;gap:7px;min-width:0;
      border-top:1px dashed var(--gp-line2);padding-top:9px}
    .gp-keys-sec:first-child{border-top:0;padding-top:0}
    .gp-keys-hd{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
    .gp-keys-hd b{font-size:12px;font-weight:600;color:var(--gp-t1)}
    .gp-key-pill{font-size:10px;line-height:1.5;padding:1px 7px;border-radius:999px;
      border:1px solid var(--gp-line);color:var(--gp-t2);white-space:nowrap;max-width:100%}
    .gp-key-pill.g{color:var(--gp-green);border-color:color-mix(in srgb,var(--gp-green) 42%,transparent);
      background:color-mix(in srgb,var(--gp-green) 9%,transparent)}
    .gp-key-pill.a{color:var(--gp-amber);border-color:color-mix(in srgb,var(--gp-amber) 42%,transparent);
      background:color-mix(in srgb,var(--gp-amber) 9%,transparent)}
    .gp-key-pill.r{color:var(--gp-red);border-color:color-mix(in srgb,var(--gp-red) 38%,transparent);
      background:color-mix(in srgb,var(--gp-red) 8%,transparent);white-space:normal}
    .gp-keys-masked{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;
      line-height:1.6;color:var(--gp-t3);word-break:break-all}
    .gp-keys-form{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
    .gp-keys-form .gp-input{flex:1 1 100%;min-width:0;height:31px;font-size:11.5px;
      font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.3px}
    .gp-keys-form .gp-btn{height:28px;font-size:11.5px}
    .gp-keys-links{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:10.5px}
    .gp-keys-links a{color:var(--gp-blue);text-decoration:none;white-space:nowrap}
    .gp-keys-links a:hover{text-decoration:underline}
    .gp-keys-note{font-size:10.5px;line-height:1.7;color:var(--gp-t3);margin:0}
    .gp-keys-ok{font-size:11px;line-height:1.6;color:var(--gp-green)}
    .gp-keys-err{font-size:11px;line-height:1.65;color:var(--gp-red);border-radius:8px;
      padding:6px 8px;word-break:break-word;
      background:color-mix(in srgb,var(--gp-red) 8%,transparent);
      border:1px solid color-mix(in srgb,var(--gp-red) 30%,transparent)}
    .gp-keys-auth{display:flex;align-items:center;gap:7px;flex-wrap:wrap;font-size:11px;
      color:var(--gp-t2)}
    .gp-keys-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .gp-onb-keys{border-top:1px dashed var(--gp-line2);padding-top:9px;display:flex;
      flex-direction:column;gap:8px}
    .gp-onb-keys-toggle{display:flex;align-items:center;gap:7px;width:100%;border:0;
      background:transparent;color:var(--gp-t1);font:inherit;font-size:12px;font-weight:600;
      padding:2px 0;cursor:pointer;text-align:left}
    .gp-onb-keys-toggle:hover{color:var(--gp-blue)}
    .gp-onb-keys-toggle .caret{display:inline-block;font-size:9px;color:var(--gp-t3);
      transition:transform .12s}
    .gp-onb-keys-toggle .caret.up{transform:rotate(90deg)}
    .gp-onb-keys-toggle .gp-onb-tag{margin-left:auto}
    .gp-onb-keys .gp-keys{padding:1px 0 0}
    .gp-rb-setup{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:space-between}
    .gp-rb-setup .gp-btn{height:25px;font-size:11px;flex:none}
    .gp-dot.warn{background:var(--gp-amber)}
    /* 进阶数据卡片：数字 + 迷你条，风格与 KPI 对齐 */
    .gp-adv{padding:11px 12px;min-height:108px;display:flex;flex-direction:column;gap:6px}
    .gp-adv .k{font-size:11px;line-height:15px;color:var(--gp-t2);display:flex;align-items:center;gap:6px}
    .gp-adv .k .sp{margin-left:auto;font-size:10px;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-adv .big{font-size:22px;font-weight:700;letter-spacing:-.3px;line-height:1.12;
      font-variant-numeric:tabular-nums}
    .gp-adv .big small{font-size:10.5px;font-weight:500;color:var(--gp-t3);margin-left:3px;letter-spacing:0}
    .gp-adv .mini{font-size:10.5px;line-height:1.7;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-adv .mini b{color:var(--gp-t2);font-weight:600}
    .gp-adv .bars{display:flex;flex-direction:column;gap:5px;margin:1px 0 0}
    .gp-adv .barrow{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--gp-t3)}
    .gp-adv .barrow .lb{width:22px;flex:none;font-variant-numeric:tabular-nums}
    .gp-adv .barrow .bar{flex:1;height:5px;border-radius:999px;background:var(--gp-card2);overflow:hidden}
    .gp-adv .barrow .bar>i{display:block;height:100%;border-radius:999px}
    .gp-adv .barrow .v{width:42px;text-align:right;color:var(--gp-t2);font-variant-numeric:tabular-nums}
    .gp-adv-empty{font-size:11px;line-height:1.7;color:var(--gp-t3);padding-top:3px}
    /* AI 营养建议 */
    .gp-nutri .gp-coach-body{margin-top:5px}
    .gp-nutri-pitch{font-size:12px;line-height:1.75;color:var(--gp-t2)}
    .gp-nutri-intake{font-size:10.5px;line-height:1.6;color:var(--gp-t3);margin-top:6px;
      font-variant-numeric:tabular-nums}
    .gp-nutri-muted{font-size:11px;line-height:1.6;color:var(--gp-t3);margin-top:8px}
    .gp-nutri-actions{display:flex;align-items:center;gap:9px;margin-top:10px;flex-wrap:wrap}
    .gp-nutri-actions .gp-btn{height:28px}
    .gp-nutri-skel{display:flex;flex-direction:column;gap:7px}
    .gp-nutri-foot{display:flex;align-items:center;gap:8px;margin-top:11px;padding-top:9px;
      border-top:1px solid var(--gp-line2);font-size:10.5px;color:var(--gp-t3);flex-wrap:wrap}
    .gp-nutri-foot .sp{margin-left:auto;display:flex;gap:6px}
    .gp-nutri-foot .gp-btn{height:25px;font-size:11px;padding:0 9px}
    /* 活动平铺卡片 */
    .gp-act-grid{grid-template-columns:minmax(0,1fr)}
    .gp-tiles-wrap{padding:11px 12px 12px}
    /* 168px 为最小可读宽度；全宽面板里按 5 列收敛（约 1280px 时 4–5 列），600px 固定 2 列 */
    .gp-tiles{display:grid;gap:9px;
      grid-template-columns:repeat(auto-fill,minmax(max(168px,calc((100% - 36px) / 5)),1fr))}
    .gp-tile{display:flex;flex-direction:column;gap:4px;min-width:0;padding:8px 9px 7px;
      border-radius:11px;border:1px solid var(--gp-line2);background:var(--gp-card);cursor:pointer;
      transition:border-color .12s ease,background .12s ease}
    .gp-tile:hover{background:var(--gp-card2);border-color:color-mix(in srgb,var(--gp-blue) 46%,transparent)}
    .gp-tile:focus-visible{outline:2px solid var(--gp-blue);outline-offset:1px}
    .gp-tile-hd{display:flex;align-items:center;gap:5px;min-width:0;font-size:10.5px;
      color:var(--gp-t2);font-variant-numeric:tabular-nums}
    .gp-tile-ic{display:inline-flex;align-items:center;justify-content:center;flex:none;
      width:18px;height:18px;color:var(--gp-blue)}
    .gp-tile-ic svg{display:block}
    .gp-tile[data-icon="run"] .gp-tile-ic{color:var(--gp-amber)}
    .gp-tile[data-icon="strength"] .gp-tile-ic{color:var(--gp-violet)}
    .gp-tile[data-icon="walk"] .gp-tile-ic,
    .gp-tile[data-icon="hike"] .gp-tile-ic{color:var(--gp-green)}
    .gp-tile[data-icon="dot"] .gp-tile-ic{color:var(--gp-t3)}
    .gp-tile-ic .fill{fill:currentColor}
    .gp-tile-name{font-size:11px;line-height:1.4;color:var(--gp-t1);white-space:nowrap;
      overflow:hidden;text-overflow:ellipsis}
    .gp-tile-thumb{display:block;width:100%;height:64px;border-radius:8px;background:var(--gp-card2);
      overflow:hidden}
    .gp-tile-thumb svg{display:block;width:100%;height:64px}
    .gp-tile-thumb.sk{animation:gp-pulse 1.4s ease-in-out infinite}
    .gp-tile-fb{height:64px;border-radius:8px;background:var(--gp-card2);display:flex;
      flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:0}
    .gp-tile-fb .cal{font-size:17px;font-weight:700;line-height:1.15;font-variant-numeric:tabular-nums}
    .gp-tile-fb .cal small{font-size:9.5px;font-weight:500;color:var(--gp-t3);margin-left:2px}
    .gp-tile-fb .hr{font-size:9.5px;color:var(--gp-t2);font-variant-numeric:tabular-nums}
    .gp-tile-fb .nt{font-size:9px;color:var(--gp-t3);letter-spacing:.3px}
    .gp-tile-ft{display:flex;align-items:baseline;gap:5px;min-width:0;font-size:10.5px;
      color:var(--gp-t2);font-variant-numeric:tabular-nums}
    .gp-tile-ft .ty{margin-left:auto;font-size:9.5px;color:var(--gp-t3);white-space:nowrap;
      overflow:hidden;text-overflow:ellipsis;max-width:52%}
    .gp-tiles-foot{display:flex;align-items:center;gap:9px;margin-top:9px;font-size:10.5px;
      color:var(--gp-t3);flex-wrap:wrap}
    .gp-tiles-foot .sp{margin-left:auto;display:flex;gap:7px}
    .gp-tiles-foot .gp-btn{height:25px;font-size:11px;padding:0 9px;text-decoration:none}
    /* 月度分布：7 列热力日历 */
    .gp-heat{padding:12px 13px}
    .gp-heat-hd{display:flex;align-items:baseline;gap:8px;margin-bottom:9px}
    .gp-heat-hd b{font-size:12px;font-weight:650;letter-spacing:.2px}
    .gp-heat-hd .sp{margin-left:auto;font-size:10.5px;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-heat-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;margin-bottom:4px}
    .gp-heat-wd{font-size:9px;color:var(--gp-t3);text-align:center;letter-spacing:.2px}
    .gp-heat-note{font-size:10.5px;color:var(--gp-amber);margin-left:8px}
    .gp-heat-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
    .gp-heat-cell{height:22px;border-radius:5px;border:1px solid transparent;background:var(--gp-card2);
      display:grid;place-items:center;font-size:9px;color:var(--gp-t3);cursor:default;
      font-variant-numeric:tabular-nums;transition:border-color .1s ease}
    .gp-heat-cell.empty{background:transparent;border-color:transparent}
    .gp-heat-cell.b1{background:color-mix(in srgb,var(--gp-green) 20%,transparent);color:var(--gp-t1)}
    .gp-heat-cell.b2{background:color-mix(in srgb,var(--gp-green) 46%,transparent);color:var(--gp-t1)}
    .gp-heat-cell.b3{background:color-mix(in srgb,var(--gp-amber) 58%,transparent);color:#1b1205}
    .gp-heat-cell.b4{background:color-mix(in srgb,var(--gp-amber) 78%,var(--gp-red));color:#1b1205}
    .gp-heat-cell.b5{background:var(--gp-red);color:#fff}
    .gp-heat-cell:hover{border-color:var(--gp-t1)}
    .gp-heat-legend{display:flex;align-items:center;gap:4px;margin-top:7px;font-size:9.5px;color:var(--gp-t3)}
    .gp-heat-legend i{display:block;width:10px;height:10px;border-radius:3px}
    .gp-heat-tot{margin-top:8px;font-size:10.5px;color:var(--gp-t2);font-variant-numeric:tabular-nums}
    .gp-heat-types{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}
    .gp-heat-chip{font-size:10px;color:var(--gp-t2);border:1px solid var(--gp-line);border-radius:999px;
      padding:1px 7px;font-variant-numeric:tabular-nums}
    .gp-heat-empty{font-size:11px;color:var(--gp-t3);padding:8px 0 3px}
    @media (max-width:600px){
      .gp-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}
      .gp-banner{flex-wrap:wrap}
      .gp-banner .sp{margin-left:0;width:100%;justify-content:flex-end}
      .gp-acct-row{grid-template-columns:minmax(0,1fr);gap:4px}
      .gp-acct-lab{padding-top:0}
      .gp-acct{max-height:calc(100vh - 18px);width:calc(100vw - 18px)}
      .gp-acct-body{padding:2px 13px 10px}
      .gp-acct-sec-hd .gp-acct-sub{margin-left:0}
      .gp-keys-form .gp-btn{flex:1 1 auto;justify-content:center}
      .gp-heat-cell{height:20px}
      .gp-tile-ft .ty{max-width:46%}
    }
    /* ---------------- 健康趋势：紧凑图表卡 ---------------- */
    .gp-sec-tools{margin-left:auto;display:flex;align-items:center;gap:8px}
    .gp-trends{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:11px}
    .gp-trend{min-height:128px;padding:10px 11px 9px;display:flex;flex-direction:column;gap:4px}
    .gp-trend-hd{display:flex;align-items:center;gap:7px;min-width:0}
    .gp-trend-lb{font-size:11px;line-height:15px;color:var(--gp-t2);white-space:nowrap;
      overflow:hidden;text-overflow:ellipsis}
    .gp-trend-pill{margin-left:auto;flex:none;font-variant-numeric:tabular-nums}
    .gp-trend-chart{height:72px;display:flex;flex-direction:column;justify-content:flex-end;min-width:0}
    .gp-trend-chart svg{display:block;width:100%;overflow:visible}
    .gp-trend-x{display:flex;justify-content:space-between;font-size:9px;line-height:11px;
      color:var(--gp-t3);margin-top:1px;font-variant-numeric:tabular-nums}
    .gp-trend-ft{font-size:10px;line-height:14px;color:var(--gp-t3);display:flex;align-items:center;
      gap:6px;min-width:0;font-variant-numeric:tabular-nums;white-space:nowrap;
      overflow:hidden;text-overflow:ellipsis}
    .gp-trend-ft b{color:var(--gp-t2);font-weight:600}
    .gp-trend-delta{font-weight:650;flex:none}
    .gp-trend-delta.good{color:var(--gp-green)}
    .gp-trend-delta.bad{color:var(--gp-amber)}
    .gp-trend-delta.flat{color:var(--gp-t3)}
    .gp-trend-empty{height:72px;display:flex;align-items:center;justify-content:center;
      border:1px dashed var(--gp-line);border-radius:9px;color:var(--gp-t3);font-size:10.5px;
      letter-spacing:.2px;text-align:center;padding:0 6px}
    @media (max-width:1220px){
      .gp-trends{grid-template-columns:repeat(3,minmax(0,1fr))}
    }
    @media (max-width:600px){
      .gp-trends{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media (max-width:430px){
      .gp-trends{grid-template-columns:minmax(0,1fr)}
    }
    /* ---------------- v5：A 类展示（心率区间 / 睡眠规律 / 身体成分 / FIT 曲线） ---------------- */
    /* HRV 卡第二行：基线 / 昨夜峰值 / 状态（过长时省略，title 里有完整文本） */
    .gp-trend-ft.wrap{flex-wrap:wrap;white-space:normal;height:auto;row-gap:1px}
    .gp-trend-note{flex:1 1 100%;min-width:0;font-size:9.5px;line-height:12px;color:var(--gp-t3);
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
    /* 心率区间卡：Z1–Z5 五行，条宽表示该区间在最大心率里的位置与跨度 */
    .gp-hrz{display:flex;flex-direction:column;gap:4px;margin-top:1px}
    .gp-hrz-row{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--gp-t3);
      font-variant-numeric:tabular-nums}
    .gp-hrz-row .z{width:17px;flex:none;color:var(--gp-t2);font-weight:600}
    .gp-hrz-row .bar{flex:1;height:6px;border-radius:999px;background:var(--gp-card2);overflow:hidden}
    .gp-hrz-row .bar>i{display:block;height:100%;border-radius:999px}
    .gp-hrz-row .r{width:76px;text-align:right;color:var(--gp-t2);white-space:nowrap}
    .gp-hrz-muted{font-size:11px;line-height:1.7;color:var(--gp-t3);padding-top:3px}
    /* 睡眠规律性：7 晚图下方的紧凑一行 + 入睡时间点阵 */
    .gp-sleep-reg{margin-top:9px;padding:9px 12px 8px;border-radius:13px;border:1px solid var(--gp-line2);
      background:var(--gp-card);display:flex;flex-direction:column;gap:5px;min-width:0}
    .gp-sleep-reg .hd{display:flex;align-items:baseline;gap:8px;min-width:0}
    .gp-sleep-reg .hd b{font-size:11.5px;font-weight:600;color:var(--gp-t1)}
    .gp-sleep-reg .hd .sp{margin-left:auto;font-size:10px;color:var(--gp-t3);white-space:nowrap;
      font-variant-numeric:tabular-nums}
    .gp-sleep-reg .txt{font-size:11px;line-height:1.65;color:var(--gp-t2);
      font-variant-numeric:tabular-nums}
    .gp-sleep-reg .txt b{color:var(--gp-t1);font-weight:600}
    .gp-sleep-reg .dots{display:block;width:100%;height:34px}
    .gp-sleep-reg .muted{font-size:11px;line-height:1.7;color:var(--gp-t3)}
    /* 身体成分：3 列指标网格，缺值用「未记录」占位 */
    .gp-bcomp{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:9px}
    .gp-bcomp .cell{min-width:0;padding:5px 7px 6px;border-radius:8px;background:var(--gp-card2)}
    .gp-bcomp .cell .lb{font-size:9.5px;line-height:1.4;color:var(--gp-t3);white-space:nowrap;
      overflow:hidden;text-overflow:ellipsis}
    .gp-bcomp .cell .vl{font-size:12px;font-weight:600;color:var(--gp-t1);margin-top:1px;
      white-space:nowrap;font-variant-numeric:tabular-nums}
    .gp-bcomp .cell .vl small{font-size:9px;font-weight:400;color:var(--gp-t3);margin-left:2px}
    .gp-bcomp .cell .vl.none{color:var(--gp-t3);font-weight:400;font-size:11px}
    .gp-bcomp-foot{font-size:10px;color:var(--gp-t3);margin-top:7px;font-variant-numeric:tabular-nums}
    /* Body Battery KPI 内的当日迷你曲线 */
    .gp-bbspark{width:100%;max-width:150px;height:34px;margin:1px auto 0;flex:none}
    .gp-bbspark svg{display:block;width:100%;height:34px;overflow:visible}
    /* 活动详情：训练评级 chips / 组次表 / FIT 曲线 */
    .gp-detail-info{margin-top:2px}
    .gp-detail-sets{max-height:212px;overflow:auto;border:1px solid var(--gp-line2);border-radius:10px}
    .gp-detail-sets .gp-table th,.gp-detail-sets .gp-table td{padding:5px 8px}
    .gp-fit{border:1px solid var(--gp-line2);border-radius:12px;background:var(--gp-card);min-width:0}
    .gp-fit-hd{display:flex;align-items:center;gap:8px;padding:9px 11px;min-width:0}
    .gp-fit-hd b{font-size:12px;font-weight:650;letter-spacing:.2px}
    .gp-fit-toggle{border:0;background:transparent;color:var(--gp-t2);font-family:inherit;font-size:11px;
      display:inline-flex;align-items:center;gap:5px;cursor:pointer;padding:2px 0;margin-left:auto}
    .gp-fit-toggle:hover{color:var(--gp-t1)}
    .gp-fit-toggle .caret{font-size:8px;transition:transform .12s}
    .gp-fit-toggle .caret.up{transform:rotate(180deg)}
    .gp-fit-body{padding:0 11px 11px;display:flex;flex-direction:column;gap:8px;min-width:0}
    .gp-fit-muted{font-size:11px;line-height:1.7;color:var(--gp-t3)}
    .gp-fit-muted b{color:var(--gp-t2);font-weight:600}
    .gp-fit-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .gp-fit-actions .gp-btn{height:27px;font-size:11.5px}
    .gp-fit-chips{display:flex;flex-wrap:wrap;gap:5px}
    .gp-fit-chip{height:22px;padding:0 8px;border-radius:999px;border:1px solid var(--gp-line);
      background:transparent;color:var(--gp-t3);font-family:inherit;font-size:10.5px;cursor:pointer;
      display:inline-flex;align-items:center;gap:5px}
    .gp-fit-chip::before{content:'';width:6px;height:6px;border-radius:2px;background:currentColor;flex:none}
    .gp-fit-chip:hover:not(:disabled){color:var(--gp-t1)}
    .gp-fit-chip.on{color:var(--gp-t1);border-color:color-mix(in srgb,var(--gp-blue) 44%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 13%,transparent)}
    .gp-fit-chip:disabled{opacity:.4;cursor:default}
    .gp-fit-chart{display:block;width:100%;height:160px;background:var(--gp-card2);
      border:1px solid var(--gp-line2);border-radius:9px}
    .gp-fit-legend{display:flex;flex-wrap:wrap;gap:9px;font-size:10px;color:var(--gp-t3);
      font-variant-numeric:tabular-nums}
    .gp-fit-legend span{display:inline-flex;align-items:center;gap:4px}
    .gp-fit-legend i{display:block;width:9px;height:2.5px;border-radius:1px}
    @media (max-width:600px){
      .gp-bcomp{grid-template-columns:repeat(2,minmax(0,1fr))}
      .gp-fit-chart{height:150px}
    }
    /* ---------------- v6：B 类（训练计划 / 女性健康 / 深度分析） ---------------- */
    /* 训练计划：周一–周日 7 个日期格 */
    .gp-plan-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
    .gp-plan-day{position:relative;display:flex;flex-direction:column;gap:3px;min-width:0;min-height:92px;
      padding:7px 7px 6px;border-radius:9px;border:1px solid var(--gp-line2);
      background:var(--gp-card);color:var(--gp-t1);text-align:left;
      transition:border-color .12s ease,background .12s ease}
    .gp-plan-day[role="button"]{cursor:pointer}
    .gp-plan-day[role="button"]:hover{background:var(--gp-card2);
      border-color:color-mix(in srgb,var(--gp-blue) 46%,transparent)}
    .gp-plan-day[role="button"]:focus-visible{outline:2px solid var(--gp-blue);outline-offset:1px}
    .gp-plan-day.is-today{border-color:color-mix(in srgb,var(--gp-blue) 58%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 10%,transparent)}
    .gp-plan-day.is-done{background:color-mix(in srgb,var(--gp-green) 9%,transparent)}
    .gp-plan-day.is-rest{color:var(--gp-t3)}
    .gp-plan-wd{font-size:9.5px;line-height:1.3;color:var(--gp-t3);display:flex;align-items:center;gap:4px;
      white-space:nowrap}
    .gp-plan-day.is-today .gp-plan-wd{color:var(--gp-blue)}
    .gp-plan-date{font-size:9px;line-height:1.2;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-plan-ic{display:inline-flex;align-items:center;color:var(--gp-blue);margin-top:1px}
    .gp-plan-day.is-done .gp-plan-ic{color:var(--gp-green)}
    .gp-plan-name{font-size:10.5px;line-height:1.35;white-space:nowrap;overflow:hidden;
      text-overflow:ellipsis;color:var(--gp-t1)}
    .gp-plan-meta{font-size:9.5px;line-height:1.4;color:var(--gp-t3);font-variant-numeric:tabular-nums;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gp-plan-check{color:var(--gp-green);font-weight:700;margin-left:2px}
    .gp-plan-rest{font-size:10.5px;line-height:1.4;color:var(--gp-t3);padding:2px 0}
    .gp-plan-link{margin-top:auto;font-size:9.5px;line-height:1.4;color:var(--gp-blue);
      text-decoration:none;align-self:flex-start;white-space:nowrap}
    .gp-plan-link:hover{text-decoration:underline}
    .gp-plan-foot{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:10px;
      color:var(--gp-t3);flex-wrap:wrap;font-variant-numeric:tabular-nums}
    .gp-plan-foot .sp{margin-left:auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .gp-plan-coach-name{font-size:13px;font-weight:650;line-height:1.4;margin-bottom:3px}
    .gp-plan-coach-sum{font-size:10.5px;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-plan-coach-row{display:flex;align-items:baseline;gap:7px;font-size:10.5px;color:var(--gp-t2);
      margin-top:6px;min-width:0}
    .gp-plan-coach-row .d{flex:none;color:var(--gp-t3);font-size:9.5px;font-variant-numeric:tabular-nums}
    .gp-plan-coach-row .n{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gp-plan-coach-row .t{margin-left:auto;flex:none;color:var(--gp-t3);font-size:9.5px;
      font-variant-numeric:tabular-nums}
    .gp-plan-goal{display:flex;flex-direction:column;gap:4px;margin-top:9px}
    .gp-plan-goal:first-of-type{margin-top:0}
    .gp-plan-goal .hd{display:flex;align-items:baseline;gap:6px;font-size:11px;color:var(--gp-t2);min-width:0}
    .gp-plan-goal .hd b{color:var(--gp-t1);font-weight:600;white-space:nowrap;overflow:hidden;
      text-overflow:ellipsis}
    .gp-plan-goal .hd .sp{margin-left:auto;color:var(--gp-t3);font-size:10px;
      font-variant-numeric:tabular-nums;white-space:nowrap}
    .gp-plan-goal .bar{height:6px;border-radius:999px;background:var(--gp-card2);overflow:hidden}
    .gp-plan-goal .bar>i{display:block;height:100%;border-radius:999px}
    .gp-plan-goal .ft{font-size:10px;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    /* 训练计划：只读说明 / 卡片头部小链接 / 悬停复制按钮 */
    .gp-plan-hd{display:flex;align-items:center;gap:8px;min-width:0}
    .gp-plan-hd .sp{margin-left:auto;display:flex;align-items:center;gap:10px;flex:none}
    .gp-plan-hdlink{border:0;background:transparent;color:var(--gp-blue);font:inherit;font-size:10px;
      line-height:1.5;padding:0;cursor:pointer;text-decoration:none;white-space:nowrap;
      display:inline-flex;align-items:center;gap:2px}
    .gp-plan-hdlink:hover{text-decoration:underline}
    .gp-plan-copy{position:absolute;top:3px;right:3px;z-index:1;width:18px;height:18px;padding:0;
      border-radius:5px;border:1px solid var(--gp-line2);background:var(--dsw-alias-bg-layer-2,#20242c);
      color:var(--gp-t2);font:inherit;font-size:11px;line-height:1;cursor:pointer;
      display:inline-grid;place-items:center;opacity:0;pointer-events:none;transition:opacity .12s ease}
    .gp-plan-day:hover .gp-plan-copy,.gp-plan-day:focus-within .gp-plan-copy{
      opacity:1;pointer-events:auto}
    .gp-plan-copy:hover{color:var(--gp-t1);background:var(--gp-card2)}
    .gp-plan-copy:focus-visible{opacity:1;pointer-events:auto;outline:2px solid var(--gp-blue);
      outline-offset:1px}
    .gp-plan-pop{position:fixed;z-index:72;width:296px;max-width:calc(100vw - 16px);
      padding:11px 12px 10px;border-radius:12px;border:1px solid var(--gp-line);
      background:var(--dsw-alias-bg-layer-2,#20242c);color:var(--gp-t1);
      box-shadow:0 24px 54px -18px rgba(0,0,0,.7),0 2px 10px rgba(0,0,0,.28);
      animation:gp-pop .13s ease-out;display:flex;flex-direction:column;gap:8px}
    .gp-plan-pop:focus{outline:none}
    .gp-plan-pop-hd{display:flex;align-items:flex-start;gap:8px;min-width:0}
    .gp-plan-pop-ic{flex:none;display:inline-flex;color:var(--gp-blue);margin-top:1px}
    .gp-plan-pop-tt{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}
    .gp-plan-pop-tt b{font-size:12.5px;font-weight:650;line-height:1.35;word-break:break-word}
    .gp-plan-pop-tt span{font-size:10px;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-plan-pop-kv{display:grid;grid-template-columns:54px minmax(0,1fr);gap:3px 8px;
      font-size:11px;line-height:1.55}
    .gp-plan-pop-kv .k{color:var(--gp-t3)}
    .gp-plan-pop-kv .v{color:var(--gp-t2);min-width:0;word-break:break-word;
      font-variant-numeric:tabular-nums}
    .gp-plan-pop-kv .v.done{color:var(--gp-green)}
    .gp-plan-pop-acts{display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding-top:8px;
      border-top:1px solid var(--gp-line2)}
    .gp-plan-pop-acts .gp-btn{height:24px;font-size:11px;padding:0 6px}
    .gp-plan-pop-acts .gp-btn.link{text-decoration:none}
    .gp-plan-pop-acts .sp{margin-left:auto}
    .gp-plan-empty{display:flex;flex-direction:column;align-items:center;gap:9px;
      padding:16px 10px 4px;text-align:center}
    .gp-plan-empty-t{font-size:11.5px;line-height:1.6;color:var(--gp-t3)}
    .gp-plan-empty-a{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:center}
    .gp-plan-empty-a .gp-btn{height:26px;font-size:11px;padding:0 10px;text-decoration:none}
    .gp-plan-ro{display:flex;align-items:center;gap:8px;margin-top:9px;padding-top:8px;
      border-top:1px solid var(--gp-line2);font-size:10px;line-height:1.5;color:var(--gp-t3);
      flex-wrap:wrap}
    .gp-plan-ro .sp{margin-left:auto}
    .gp-plan-ro a{color:var(--gp-blue);text-decoration:none;white-space:nowrap}
    .gp-plan-ro a:hover{text-decoration:underline}
    /* 女性健康：两行说明，缺值统一 muted */
    .gp-wm-phase{font-size:20px;font-weight:700;letter-spacing:-.2px;line-height:1.2;margin-bottom:5px}
    .gp-wm-row{display:flex;align-items:baseline;gap:8px;font-size:11px;line-height:1.7;color:var(--gp-t3)}
    .gp-wm-row .lb{width:62px;flex:none}
    .gp-wm-row b{color:var(--gp-t1);font-weight:600;font-variant-numeric:tabular-nums;word-break:break-all}
    .gp-wm-preg{display:flex;align-items:baseline;gap:9px;margin-bottom:6px}
    .gp-wm-preg .big{font-size:26px;font-weight:700;letter-spacing:-.3px;line-height:1}
    .gp-wm-preg small{font-size:11px;color:var(--gp-t3)}
    .gp-wm-muted{font-size:11px;line-height:1.7;color:var(--gp-t3);padding-top:2px}
    /* 深度分析：PDC 横向条 / 爬坡 / 心率漂移 / 电子变速 */
    .gp-deep-sec{padding-top:9px;margin-top:9px;border-top:1px solid var(--gp-line2);min-width:0}
    .gp-deep-sec:first-child{padding-top:0;margin-top:0;border-top:0}
    .gp-deep-h{display:flex;align-items:baseline;gap:7px;font-size:11px;font-weight:600;
      color:var(--gp-t1);margin-bottom:6px;min-width:0}
    .gp-deep-h .sp{margin-left:auto;font-size:9.5px;font-weight:400;color:var(--gp-t3);
      font-variant-numeric:tabular-nums;white-space:nowrap}
    .gp-pdc{display:flex;flex-direction:column;gap:5px}
    .gp-pdc-row{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--gp-t3);
      font-variant-numeric:tabular-nums}
    .gp-pdc-row .lb{width:32px;flex:none;color:var(--gp-t2)}
    .gp-pdc-row .bar{flex:1;height:8px;border-radius:999px;background:var(--gp-card2);overflow:hidden}
    .gp-pdc-row .bar>i{display:block;height:100%;border-radius:999px;
      background:linear-gradient(90deg,var(--gp-violet),var(--gp-blue))}
    .gp-pdc-row .v{width:56px;text-align:right;color:var(--gp-t2);white-space:nowrap}
    .gp-climbs{display:flex;flex-direction:column;min-width:0}
    .gp-climb{display:grid;grid-template-columns:38px minmax(0,1fr) 68px 62px 58px;gap:6px;
      align-items:center;padding:5px 0;font-size:10.5px;color:var(--gp-t2);
      font-variant-numeric:tabular-nums;border-top:1px solid var(--gp-line2);min-width:0}
    .gp-climb:first-child{border-top:0}
    .gp-climb .cat{font-size:9.5px;font-weight:700;color:var(--gp-amber);white-space:nowrap}
    .gp-climb .m{color:var(--gp-t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gp-climb .x{color:var(--gp-t3);white-space:nowrap;font-size:10px}
    .gp-drift{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .gp-drift .big{font-size:24px;font-weight:700;letter-spacing:-.3px;line-height:1;
      font-variant-numeric:tabular-nums}
    .gp-drift .note{font-size:10px;color:var(--gp-t3);line-height:1.5;flex:1 1 100%}
    .gp-shifts{display:flex;flex-direction:column;gap:5px}
    .gp-shift-row{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--gp-t3);
      font-variant-numeric:tabular-nums}
    .gp-shift-row .lb{width:58px;flex:none;color:var(--gp-t2);white-space:nowrap}
    .gp-shift-row .bar{flex:1;height:6px;border-radius:999px;background:var(--gp-card2);overflow:hidden}
    .gp-shift-row .bar>i{display:block;height:100%;border-radius:999px}
    .gp-shift-row .v{width:34px;text-align:right;color:var(--gp-t2)}
    .gp-deep-muted{font-size:11px;line-height:1.7;color:var(--gp-t3)}
    @media (max-width:600px){
      .gp-plan-week{grid-template-columns:repeat(4,minmax(0,1fr))}
      .gp-plan-day{min-height:84px}
      .gp-plan-name{font-size:10px}
      .gp-climb{grid-template-columns:32px minmax(0,1fr) 58px 54px;gap:5px}
      .gp-climb .wpkg{display:none}
    }
    /* ---------------- v7：路书工坊 ---------------- */
    .gp-rb{max-width:1180px;margin:0 auto;padding:2px 0 44px}
    .gp-rb-lead{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:18px 2px 12px}
    .gp-rb-lead h1{font-size:18px;line-height:1.3;margin:0;font-weight:650;letter-spacing:.2px}
    .gp-rb-lead p{margin:0;font-size:11.5px;color:var(--gp-t3)}
    .gp-rb-svc{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}
    .gp-rb-svc .sv{font-size:10.5px;color:var(--gp-t3);border:1px solid var(--gp-line2);
      border-radius:999px;padding:2px 8px;white-space:nowrap}
    .gp-rb-svc .sv b{font-weight:600;color:var(--gp-t2)}
    .gp-rb-svc .sv b.ok{color:var(--gp-green)}
    .gp-rb-svc .sv b.warn{color:var(--gp-amber)}
    .gp-rb-svc .sv b.off{color:var(--gp-t3)}
    .gp-rb-tabs{display:flex;gap:4px;padding:4px;background:var(--gp-card);
      border:1px solid var(--gp-line2);border-radius:11px;width:max-content;max-width:100%}
    .gp-rb-tab{border:0;background:transparent;color:var(--gp-t2);font:inherit;font-size:12.5px;
      height:30px;padding:0 16px;border-radius:8px;cursor:pointer;display:inline-flex;
      align-items:center;gap:6px;white-space:nowrap}
    .gp-rb-tab:hover{color:var(--gp-t1);background:var(--gp-card2)}
    .gp-rb-tab.on{background:var(--gp-blue);color:#04121f;font-weight:650}
    .gp-rb-panel{margin-top:16px}
    .gp-rb-sechead{display:flex;align-items:baseline;gap:10px;margin:2px 2px 11px;flex-wrap:wrap}
    .gp-rb-sechead h2{font-size:13px;margin:0;font-weight:650;letter-spacing:.3px}
    .gp-rb-sechead .hint{font-size:11px;color:var(--gp-t3)}
    .gp-rb-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:start}
    .gp-rb-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
    .gp-rb-card{background:var(--gp-card);border:1px solid var(--gp-line2);border-radius:13px;
      padding:12px 13px;display:flex;flex-direction:column;gap:9px;min-width:0}
    .gp-rb-card.is-open{grid-column:1 / -1}
    .gp-rb-ch{display:flex;align-items:flex-start;gap:8px;min-width:0}
    .gp-rb-name{flex:1;min-width:0;font-size:13px;font-weight:600;line-height:1.4;color:var(--gp-t1);
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .gp-rb-chip{flex:none;font-size:10px;line-height:1.5;padding:1px 7px;border-radius:999px;
      border:1px solid var(--gp-line);color:var(--gp-t2);white-space:nowrap}
    .gp-rb-chip.xz{color:var(--gp-amber);
      border-color:color-mix(in srgb,var(--gp-amber) 42%,transparent);
      background:color-mix(in srgb,var(--gp-amber) 9%,transparent)}
    .gp-rb-chip.amap{color:var(--gp-blue);
      border-color:color-mix(in srgb,var(--gp-blue) 42%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 9%,transparent)}
    .gp-rb-chip.ai{color:var(--gp-violet);
      border-color:color-mix(in srgb,var(--gp-violet) 42%,transparent);
      background:color-mix(in srgb,var(--gp-violet) 9%,transparent)}
    .gp-rb-chip.gpx{color:var(--gp-green);
      border-color:color-mix(in srgb,var(--gp-green) 42%,transparent);
      background:color-mix(in srgb,var(--gp-green) 9%,transparent)}
    .gp-rb-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px 10px;
      font-size:11px;line-height:1.55;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-rb-meta b{color:var(--gp-t1);font-weight:600}
    .gp-rb-thumb{border:1px solid var(--gp-line2);border-radius:9px;
      background:color-mix(in srgb,var(--gp-blue) 4%,transparent);padding:5px;height:66px;
      display:flex;align-items:center}
    .gp-rb-thumb .gp-rb-track{border:0;padding:0;background:none;width:100%}
    .gp-rb-expand{border-top:1px solid var(--gp-line2);padding-top:10px;display:flex;
      flex-direction:column;gap:8px}
    .gp-rb-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
    .gp-rb-actions .gp-btn{height:26px;font-size:11px}
    .gp-rb-card>.gp-rb-actions{margin-top:auto;padding-top:2px}
    .gp-rb-actions a.gp-btn{text-decoration:none}
    .gp-rb-btn-danger,.gp-rb-actions .gp-btn.danger{color:var(--gp-red);
      border-color:color-mix(in srgb,var(--gp-red) 34%,transparent)}
    .gp-rb-actions .gp-btn.danger:hover{background:color-mix(in srgb,var(--gp-red) 12%,transparent);
      color:var(--gp-red)}
    .gp-rb-confirm{display:flex;align-items:center;gap:7px;flex-wrap:wrap;font-size:11px;
      color:var(--gp-t2);background:color-mix(in srgb,var(--gp-red) 8%,transparent);
      border:1px solid color-mix(in srgb,var(--gp-red) 28%,transparent);
      border-radius:8px;padding:6px 8px}
    .gp-rb-confirm .sp{margin-left:auto}
    .gp-rb-empty{border:1px dashed var(--gp-line);border-radius:14px;padding:44px 20px;
      display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;
      color:var(--gp-t3);font-size:11.5px;line-height:1.7}
    .gp-rb-empty .big{font-size:14px;font-weight:600;color:var(--gp-t2)}
    .gp-rb-empty-ic{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;
      color:var(--gp-blue);background:color-mix(in srgb,var(--gp-blue) 12%,transparent);
      border:1px solid color-mix(in srgb,var(--gp-blue) 26%,transparent);margin-bottom:2px}
    .gp-rb-skel{background:var(--gp-card);border:1px solid var(--gp-line2);border-radius:13px;
      padding:13px;display:flex;flex-direction:column;gap:8px}
    .gp-rb-sec{background:var(--gp-card);border:1px solid var(--gp-line2);border-radius:13px;
      padding:13px 14px;min-width:0;display:flex;flex-direction:column;gap:9px}
    .gp-rb-sec+.gp-rb-sec{margin-top:12px}
    .gp-rb-sec h3{font-size:12px;margin:0;font-weight:600;display:flex;align-items:center;gap:7px}
    .gp-rb-sec-plain{margin-top:12px}
    .gp-rb-field{display:flex;flex-direction:column;gap:5px;min-width:0}
    .gp-rb-lab{font-size:10.5px;color:var(--gp-t3);letter-spacing:.2px}
    .gp-rb-input,.gp-rb-textarea{width:100%;background:color-mix(in srgb,var(--gp-t1) 5%,transparent);
      border:1px solid var(--gp-line);border-radius:8px;color:var(--gp-t1);font:inherit;
      font-size:12px;padding:7px 9px;outline:none;min-width:0}
    .gp-rb-input::placeholder,.gp-rb-textarea::placeholder{color:var(--gp-t3)}
    .gp-rb-input:focus,.gp-rb-textarea:focus{
      border-color:color-mix(in srgb,var(--gp-blue) 62%,transparent);
      box-shadow:0 0 0 2px color-mix(in srgb,var(--gp-blue) 14%,transparent)}
    .gp-rb-textarea{min-height:86px;resize:vertical;line-height:1.65}
    .gp-rb-inline{display:flex;gap:7px;align-items:center;min-width:0}
    .gp-rb-inline .gp-rb-input{flex:1}
    .gp-rb-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .gp-rb-form-grid .full{grid-column:1 / -1}
    .gp-rb-via{display:flex;flex-direction:column;gap:6px}
    .gp-rb-check{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--gp-t2);
      padding-top:2px;cursor:pointer}
    .gp-rb-check input{accent-color:var(--gp-blue)}
    .gp-rb-hint{font-size:10.5px;line-height:1.65;color:var(--gp-t3)}
    .gp-rb-note{font-size:11px;line-height:1.75;color:var(--gp-t3);margin:0}
    .gp-rb-ok{font-size:11px;color:var(--gp-green)}
    .gp-rb-error{font-size:11.5px;line-height:1.65;color:var(--gp-red);
      background:color-mix(in srgb,var(--gp-red) 10%,transparent);
      border:1px solid color-mix(in srgb,var(--gp-red) 30%,transparent);
      border-radius:8px;padding:7px 9px;word-break:break-word}
    .gp-rb-muted{font-size:11px;line-height:1.7;color:var(--gp-t3);background:var(--gp-card);
      border:1px dashed var(--gp-line);border-radius:9px;padding:9px 11px}
    .gp-rb-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:2px}
    .gp-rb-chipv{font-size:10.5px;line-height:1.5;border:1px solid var(--gp-line);
      border-radius:999px;padding:1px 8px;color:var(--gp-t2);background:var(--gp-card2);
      white-space:nowrap}
    .gp-rb-chipv b{color:var(--gp-t1);font-weight:600;margin-left:3px}
    .gp-rb-chipv.warn{color:var(--gp-amber);
      border-color:color-mix(in srgb,var(--gp-amber) 40%,transparent)}
    .gp-rb-loading{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--gp-t2)}
    .gp-rb-spin{width:13px;height:13px;border-radius:50%;border:2px solid var(--gp-line);
      border-top-color:var(--gp-blue);animation:gp-rb-spin .8s linear infinite;flex:none}
    .gp-rb-spin.big{width:20px;height:20px;border-width:2.5px}
    @keyframes gp-rb-spin{to{transform:rotate(360deg)}}
    .gp-rb-linkbtn{background:none;border:0;color:var(--gp-blue);font:inherit;font-size:11px;
      cursor:pointer;padding:2px 0;text-align:left;align-self:flex-start}
    .gp-rb-linkbtn:hover{text-decoration:underline}
    .gp-rb-file{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
    .gp-rb-steps{margin:0;padding-left:18px;font-size:11.5px;line-height:1.9;color:var(--gp-t2)}
    .gp-rb-steps li{padding-left:2px}
    .gp-rb-auth{display:flex;flex-direction:column;gap:8px;
      border:1px solid color-mix(in srgb,var(--gp-amber) 34%,transparent);
      background:color-mix(in srgb,var(--gp-amber) 8%,transparent);
      border-radius:10px;padding:11px 12px}
    .gp-rb-auth-hd{display:flex;align-items:center;gap:8px}
    .gp-rb-auth .tt{font-size:12px;font-weight:600;color:var(--gp-amber)}
    .gp-rb-auth .gp-btn{align-self:flex-start}
    .gp-rb-track{border:1px solid var(--gp-line2);border-radius:9px;padding:6px;
      background:color-mix(in srgb,var(--gp-blue) 3.5%,transparent);
      display:flex;flex-direction:column;gap:4px;min-width:0}
    .gp-rb-track.is-empty{align-items:center;justify-content:center;min-height:64px}
    .gp-rb-track.is-compact{border:0;padding:0;background:none}
    .gp-rb-track-svg{display:block;width:100%;height:auto}
    .gp-rb-track-map{position:relative;width:100%;border-radius:6px;overflow:hidden;
      background:var(--gp-card)}
    .gp-rb-track-map .gp-rb-track-svg{height:100%}
    .gp-rb-track-img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}
    .gp-map-shimmer{position:absolute;inset:0;z-index:1;pointer-events:none;
      background:linear-gradient(105deg,transparent 24%,
        color-mix(in srgb,var(--gp-t1) 8%,transparent) 48%,transparent 72%);
      background-size:220% 100%;animation:gp-map-shimmer 1.15s linear infinite}
    @keyframes gp-map-shimmer{from{background-position:150% 0}to{background-position:-70% 0}}
    .gp-rb-track-elev{margin-top:1px}
    .gp-rb-track-elev svg{display:block;width:100%}
    .gp-rb-track-elev-empty{height:64px;display:flex;align-items:center;justify-content:center;
      border:1px dashed var(--gp-line2);border-radius:6px;font-size:10.5px;color:var(--gp-t3)}
    .gp-rb-track-meta{display:flex;gap:12px;flex-wrap:wrap;font-size:10.5px;color:var(--gp-t3);
      font-variant-numeric:tabular-nums;padding:1px 1px 0}
    .gp-rb-track-meta b{color:var(--gp-t2);font-weight:600}
    .gp-rb-track-empty{font-size:11px;color:var(--gp-t3);padding:14px 6px}
    .gp-rb-garmin{border:1px solid var(--gp-line2);background:var(--gp-card);border-radius:11px;
      padding:0 12px;margin-top:12px}
    .gp-rb-garmin>summary{cursor:pointer;list-style:none;font-size:12px;font-weight:600;
      padding:10px 0;display:flex;align-items:center;gap:7px;color:var(--gp-t1)}
    .gp-rb-garmin>summary::-webkit-details-marker{display:none}
    .gp-rb-garmin>summary::before{content:'▸';color:var(--gp-t3);font-size:10px;
      transition:transform .15s ease;display:inline-block}
    .gp-rb-garmin[open]>summary::before{transform:rotate(90deg)}
    .gp-rb-garmin-body{padding:0 0 12px;font-size:11.5px;color:var(--gp-t2);line-height:1.8}
    .gp-rb-garmin-body ol{margin:0 0 8px;padding-left:18px}
    .gp-rb-garmin-body li{margin:2px 0}
    .gp-rb-garmin-body a{color:var(--gp-blue);word-break:break-all;text-decoration:none}
    .gp-rb-garmin-body a:hover{text-decoration:underline}
    .gp-rb-garmin-body .sep{height:1px;background:var(--gp-line2);margin:9px 0}
    .gp-rb-ai{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,1fr);gap:12px;
      align-items:start}
    .gp-rb-ai-form,.gp-rb-preview{min-width:0;display:flex;flex-direction:column}
    .gp-rb-preview{position:sticky;top:64px}
    .gp-rb-plan-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:9px;min-height:300px;text-align:center;color:var(--gp-t2)}
    .gp-rb-plan-loading b{font-size:12.5px;font-weight:600}
    .gp-rb-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:8px;min-height:300px;text-align:center;border:1px dashed var(--gp-line);
      border-radius:10px;padding:22px 16px}
    .gp-rb-placeholder .big{font-size:12.5px;font-weight:600;color:var(--gp-t2)}
    .gp-rb-placeholder .gp-rb-hint{max-width:280px}
    .gp-rb-cands{display:flex;flex-direction:column;gap:7px;margin-top:2px}
    .gp-rb-cand{display:flex;flex-direction:column;gap:5px;text-align:left;border:1px solid var(--gp-line);
      background:var(--gp-card);border-radius:10px;padding:9px 10px;cursor:pointer;
      color:var(--gp-t1);font:inherit;min-width:0}
    .gp-rb-cand:hover{background:var(--gp-card2)}
    .gp-rb-cand.on{border-color:color-mix(in srgb,var(--gp-blue) 62%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 10%,transparent)}
    .gp-rb-cand .top{display:flex;align-items:center;gap:8px;min-width:0}
    .gp-rb-cand .nm{font-size:12px;font-weight:600;min-width:0;overflow:hidden;
      text-overflow:ellipsis;white-space:nowrap}
    .gp-rb-cand .sub{display:flex;gap:10px;flex-wrap:wrap;font-size:10.5px;color:var(--gp-t3);
      font-variant-numeric:tabular-nums;line-height:1.5}
    .gp-rb-cand .sub b{color:var(--gp-t2);font-weight:600}
    .gp-rb-ambig{border:1px solid color-mix(in srgb,var(--gp-amber) 32%,transparent);
      background:color-mix(in srgb,var(--gp-amber) 7%,transparent);border-radius:10px;
      padding:9px 10px;display:flex;flex-direction:column;gap:7px}
    .gp-rb-ambig-hd{font-size:11.5px;font-weight:600;color:var(--gp-amber)}
    .gp-rb-selected{display:flex;flex-direction:column;gap:9px}
    .gp-rb-xz-preview{display:flex;flex-direction:column;gap:9px;margin-top:3px;
      border-top:1px solid var(--gp-line2);padding-top:10px}
    /* ---------------- v9：路书编辑 + 一句话生成 ---------------- */
    .gp-rb-menu-wrap{position:relative;margin-left:auto;display:flex}
    .gp-rb-more{height:26px;width:28px;padding:0;justify-content:center;font-size:14px;line-height:1}
    .gp-rb-menu{position:absolute;right:0;top:calc(100% + 4px);z-index:30;min-width:124px;
      background:var(--gp-card);border:1px solid var(--gp-line);border-radius:10px;padding:4px;
      display:flex;flex-direction:column;gap:2px;
      box-shadow:0 18px 36px -14px rgba(0,0,0,.6),0 2px 8px rgba(0,0,0,.24)}
    .gp-rb-menu-item{border:0;background:transparent;color:var(--gp-t2);font:inherit;
      font-size:11.5px;line-height:1.5;text-align:left;padding:6px 9px;border-radius:6px;
      cursor:pointer;white-space:nowrap}
    .gp-rb-menu-item:hover{background:var(--gp-card2);color:var(--gp-t1)}
    .gp-rb-menu-item.danger{color:var(--gp-red)}
    .gp-rb-menu-item.danger:hover{background:color-mix(in srgb,var(--gp-red) 12%,transparent)}
    .gp-rb-menu-item[disabled]{opacity:.55;cursor:default}
    .gp-rb-editbox{display:flex;flex-direction:column;gap:7px;
      border:1px solid color-mix(in srgb,var(--gp-blue) 34%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 6%,transparent);
      border-radius:9px;padding:8px 9px}
    .gp-rb-editbox .gp-rb-textarea{min-height:64px}
    .gp-rb-editbox-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
    .gp-rb-editbox-row .gp-btn{height:25px;font-size:11px}
    .gp-rb-editbox-row .gp-rb-count{margin-left:auto;font-variant-numeric:tabular-nums}
    .gp-rb-desc{font-size:11px;line-height:1.55;color:var(--gp-t3);
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .gp-rb-card .gp-rb-updated{font-variant-numeric:tabular-nums}
    .gp-rb-newtag{flex:none;font-size:9.5px;line-height:1.5;padding:1px 7px;border-radius:999px;
      color:var(--gp-green);border:1px solid color-mix(in srgb,var(--gp-green) 45%,transparent);
      background:color-mix(in srgb,var(--gp-green) 10%,transparent);white-space:nowrap}
    .gp-rb-card.is-new{border-color:color-mix(in srgb,var(--gp-green) 52%,transparent);
      box-shadow:0 0 0 2px color-mix(in srgb,var(--gp-green) 16%,transparent)}
    .gp-rb-ai{grid-template-columns:minmax(0,1fr)}
    .gp-rb-aihero{border:1px solid var(--gp-line2);border-radius:13px;padding:16px 17px;
      background:var(--gp-card);display:flex;flex-direction:column;gap:10px;min-width:0}
    .gp-rb-aihero-hd{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
    .gp-rb-aihero-hd h2{font-size:14px;margin:0;font-weight:650;letter-spacing:.2px}
    .gp-rb-prompt{min-height:104px;font-size:12.5px}
    .gp-rb-generate{height:32px;font-size:12px;padding:0 18px}
    .gp-rb-stages{display:flex;flex-direction:column;gap:9px;border-radius:10px;padding:10px 12px;
      border:1px solid color-mix(in srgb,var(--gp-blue) 30%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 6%,transparent)}
    .gp-rb-stages.is-done{border-color:color-mix(in srgb,var(--gp-green) 32%,transparent);
      background:color-mix(in srgb,var(--gp-green) 6%,transparent)}
    .gp-rb-stages-hd{display:flex;align-items:baseline;justify-content:space-between;
      gap:10px;flex-wrap:wrap;font-size:11.5px;color:var(--gp-t2)}
    .gp-rb-stages-hd .tt{font-weight:600}
    .gp-rb-stages-elapsed{font-size:10.5px;color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-rb-stages-list{display:flex;gap:6px;flex-wrap:wrap}
    .gp-rb-stage{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;
      line-height:1.5;padding:2px 9px;border-radius:999px;border:1px solid var(--gp-line);
      color:var(--gp-t3);background:var(--gp-card2);white-space:nowrap}
    .gp-rb-stage::before{content:'';width:5px;height:5px;border-radius:50%;
      background:var(--gp-line);flex:none}
    .gp-rb-stage.is-on{color:var(--gp-blue);
      border-color:color-mix(in srgb,var(--gp-blue) 45%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 10%,transparent)}
    .gp-rb-stage.is-on::before{background:var(--gp-blue);animation:gp-rb-pulse 1s ease-in-out infinite}
    .gp-rb-stage.is-done{color:var(--gp-green);
      border-color:color-mix(in srgb,var(--gp-green) 38%,transparent);
      background:color-mix(in srgb,var(--gp-green) 8%,transparent)}
    .gp-rb-stage.is-done::before{background:var(--gp-green)}
    @keyframes gp-rb-pulse{0%,100%{opacity:1}50%{opacity:.35}}
    .gp-rb-aierr{display:flex;flex-direction:column;gap:8px;border-radius:10px;padding:10px 12px;
      border:1px solid color-mix(in srgb,var(--gp-red) 34%,transparent);
      background:color-mix(in srgb,var(--gp-red) 8%,transparent)}
    .gp-rb-aierr-tt{font-size:11.5px;font-weight:650;color:var(--gp-red)}
    .gp-rb-aierr-msg{font-size:11.5px;line-height:1.65;color:var(--gp-t2);word-break:break-word}
    /* 多日行程：错误详情 + 按天诊断（diagnostics.dayErrors） */
    .gp-rb-diagdetail{background:transparent;border-style:dashed;padding:6px 9px;
      font-variant-numeric:tabular-nums;word-break:break-word}
    .gp-rb-diag{border:1px solid color-mix(in srgb,var(--gp-red) 24%,transparent);
      background:var(--gp-card);border-radius:8px;padding:6px 9px}
    .gp-rb-diag>summary{cursor:pointer;font-size:10.5px;line-height:1.6;color:var(--gp-t3);
      list-style:none;display:flex;align-items:center;gap:5px}
    .gp-rb-diag>summary::-webkit-details-marker{display:none}
    .gp-rb-diag>summary::before{content:'▸';font-size:9px;color:var(--gp-t3)}
    .gp-rb-diag[open]>summary::before{content:'▾'}
    .gp-rb-diag-body{display:flex;flex-direction:column;gap:4px;padding:7px 0 2px}
    .gp-rb-diag-row{display:flex;gap:7px;flex-wrap:wrap;align-items:baseline;font-size:10.5px;
      line-height:1.6;color:var(--gp-t2);word-break:break-word}
    .gp-rb-diag-row b{flex:none;color:var(--gp-t1);font-weight:600;font-variant-numeric:tabular-nums}
    .gp-rb-diag-row .code{flex:none;font-size:9.5px;color:var(--gp-amber);
      border:1px solid color-mix(in srgb,var(--gp-amber) 34%,transparent);
      border-radius:999px;padding:0 6px}
    .gp-rb-diag-row .msg{flex:1;min-width:0;color:var(--gp-t3)}
    .gp-rb-results{display:flex;flex-direction:column;gap:11px;min-width:0}
    .gp-rb-resolved{display:flex;flex-direction:column;gap:8px;border:1px solid var(--gp-line2);
      background:var(--gp-card);border-radius:11px;padding:9px 12px}
    .gp-rb-resolved-line{display:flex;align-items:center;gap:4px 8px;flex-wrap:wrap;
      font-size:11.5px;line-height:1.6;color:var(--gp-t2);min-width:0}
    .gp-rb-resolved-line .dot{color:var(--gp-t3)}
    .gp-rb-place{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:100%}
    .gp-rb-place .k{color:var(--gp-t3);flex:none}
    .gp-rb-place .v{color:var(--gp-t1);font-weight:500;min-width:0;overflow:hidden;
      text-overflow:ellipsis;white-space:nowrap;max-width:340px}
    .gp-rb-place .gp-rb-linkbtn{font-size:10.5px;flex:none}
    .gp-rb-alt{display:flex;flex-direction:column;gap:5px;margin-top:2px;
      border:1px solid var(--gp-line);border-radius:9px;padding:7px;background:var(--gp-card2);
      align-self:flex-start;width:100%;max-width:460px}
    .gp-rb-alt-hd{font-size:10.5px;color:var(--gp-t3);padding:0 2px 2px}
    .gp-rb-alt-item{display:flex;flex-direction:column;gap:2px;text-align:left;border:0;
      background:transparent;color:var(--gp-t1);font:inherit;font-size:11px;line-height:1.5;
      padding:6px 8px;border-radius:7px;cursor:pointer;min-width:0}
    .gp-rb-alt-item:hover{background:color-mix(in srgb,var(--gp-blue) 12%,transparent)}
    .gp-rb-alt-item b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .gp-rb-alt-item span{font-size:10.5px;color:var(--gp-t3);overflow:hidden;
      text-overflow:ellipsis;white-space:nowrap}
    .gp-rb-results-hd{display:flex;align-items:baseline;justify-content:space-between;
      gap:10px;flex-wrap:wrap;margin-bottom:2px}
    .gp-rb-aicands{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;
      align-items:start}
    .gp-rb-aicand{background:var(--gp-card);border:1px solid var(--gp-line2);border-radius:12px;
      padding:11px 12px;display:flex;flex-direction:column;gap:8px;min-width:0}
    .gp-rb-aicand-hd{display:flex;align-items:flex-start;gap:7px;min-width:0}
    .gp-rb-aicand-hd .nm{flex:1;min-width:0;font-size:12.5px;font-weight:600;line-height:1.4;
      color:var(--gp-t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .gp-rb-aicand-sum{font-size:11px;line-height:1.55;color:var(--gp-t2);
      font-variant-numeric:tabular-nums}
    .gp-rb-aicand-desc{font-size:10.5px;line-height:1.6;color:var(--gp-t3);
      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .gp-rb-aicand-badges{display:flex;gap:6px;flex-wrap:wrap}
    .gp-rb-diff{flex:none;font-size:10px;line-height:1.5;padding:1px 8px;border-radius:999px;
      border:1px solid;white-space:nowrap}
    .gp-rb-diff.easy{color:var(--gp-green);
      border-color:color-mix(in srgb,var(--gp-green) 44%,transparent);
      background:color-mix(in srgb,var(--gp-green) 10%,transparent)}
    .gp-rb-diff.medium{color:var(--gp-amber);
      border-color:color-mix(in srgb,var(--gp-amber) 44%,transparent);
      background:color-mix(in srgb,var(--gp-amber) 10%,transparent)}
    .gp-rb-diff.hard{color:var(--gp-red);
      border-color:color-mix(in srgb,var(--gp-red) 44%,transparent);
      background:color-mix(in srgb,var(--gp-red) 10%,transparent)}
    .gp-rb-aicand-track{border-top:1px dashed var(--gp-line2);padding-top:8px}
    .gp-rb-aicand-foot{display:flex;align-items:center;gap:6px;flex-wrap:wrap;
      border-top:1px solid var(--gp-line2);padding-top:8px;margin-top:auto}
    .gp-rb-aicand-foot .sp{margin-left:auto}
    .gp-rb-aicand-foot .gp-btn{height:26px;font-size:11px}
    .gp-rb-adv{border:1px solid var(--gp-line2);background:var(--gp-card);border-radius:12px;
      padding:0 13px}
    .gp-rb-adv>summary{cursor:pointer;list-style:none;font-size:12px;font-weight:600;
      padding:11px 0;display:flex;align-items:center;gap:7px;color:var(--gp-t1)}
    .gp-rb-adv>summary::-webkit-details-marker{display:none}
    .gp-rb-adv>summary::before{content:'▸';color:var(--gp-t3);font-size:10px;
      transition:transform .15s ease;display:inline-block}
    .gp-rb-adv[open]>summary::before{transform:rotate(90deg)}
    .gp-rb-adv-body{padding:0 0 13px;display:flex;flex-direction:column;gap:10px}
    .gp-rb-placeholder{min-height:200px}
    /* ---------- v11：多日行程（模式切换 / 每日卡片 / 行程分组） ---------- */
    .gp-rb-modeseg{display:inline-flex;align-items:center;gap:2px;padding:3px;
      background:var(--gp-card2);border:1px solid var(--gp-line2);border-radius:9px;
      align-self:flex-start}
    .gp-rb-modebtn{border:0;background:transparent;color:var(--gp-t2);font:inherit;
      font-size:11.5px;line-height:1.5;padding:4px 14px;border-radius:7px;cursor:pointer;
      white-space:nowrap}
    .gp-rb-modebtn:hover{color:var(--gp-t1)}
    .gp-rb-modebtn.on{background:var(--gp-blue);color:#04121f;font-weight:650}
    .gp-rb-multirow{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap}
    .gp-rb-multirow .gp-rb-field{width:152px}
    .gp-rb-multirow .gp-rb-useweb{flex:1;min-width:150px;align-self:center;padding-top:14px}
    .gp-rb-select{appearance:none;padding-right:22px;cursor:pointer;
      background-image:linear-gradient(45deg,transparent 50%,var(--gp-t3) 50%),
        linear-gradient(135deg,var(--gp-t3) 50%,transparent 50%);
      background-position:calc(100% - 12px) 52%,calc(100% - 7px) 52%;
      background-size:5px 5px,5px 5px;background-repeat:no-repeat}
    .gp-rb-sources{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
    .gp-rb-sources-lab{font-size:10px;color:var(--gp-t3);letter-spacing:.2px}
    .gp-rb-source{font-size:10.5px;line-height:1.5;padding:1px 8px;border-radius:999px;
      color:var(--gp-blue);text-decoration:none;max-width:240px;overflow:hidden;
      text-overflow:ellipsis;white-space:nowrap;
      border:1px solid color-mix(in srgb,var(--gp-blue) 40%,transparent);
      background:color-mix(in srgb,var(--gp-blue) 8%,transparent)}
    .gp-rb-source:hover{background:color-mix(in srgb,var(--gp-blue) 16%,transparent)}
    .gp-rb-tripresult{display:flex;flex-direction:column;gap:11px;min-width:0}
    .gp-rb-trip-hd{display:flex;align-items:flex-start;justify-content:space-between;
      gap:10px;flex-wrap:wrap}
    .gp-rb-trip-titlewrap{min-width:0;display:flex;flex-direction:column;gap:3px}
    .gp-rb-trip-title{font-size:14px;line-height:1.4;margin:0;font-weight:650;color:var(--gp-t1)}
    .gp-rb-trip-meta{font-size:11px;line-height:1.6;color:var(--gp-t3);
      font-variant-numeric:tabular-nums}
    .gp-rb-trip-overview{border:1px solid var(--gp-line2);border-radius:11px;padding:7px;
      background:color-mix(in srgb,var(--gp-blue) 3.5%,transparent)}
    .gp-rb-days{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;
      align-items:start}
    .gp-rb-day{background:var(--gp-card);border:1px solid var(--gp-line2);border-radius:12px;
      padding:10px 11px;display:flex;flex-direction:column;gap:7px;min-width:0}
    .gp-rb-day.is-error{border-color:color-mix(in srgb,var(--gp-red) 40%,transparent);
      background:color-mix(in srgb,var(--gp-red) 5%,var(--gp-card))}
    .gp-rb-day.is-open{grid-column:1 / -1}
    .gp-rb-day-hd{display:flex;align-items:center;gap:7px;min-width:0}
    .gp-rb-daybadge{flex:none;display:inline-flex;align-items:center;justify-content:center;
      min-width:26px;height:19px;padding:0 6px;border-radius:6px;font-size:10.5px;
      font-weight:650;line-height:1;color:#04121f;background:var(--gp-blue);
      font-variant-numeric:tabular-nums}
    .gp-rb-day-title{flex:1;min-width:0;font-size:12.5px;font-weight:600;line-height:1.4;
      color:var(--gp-t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .gp-rb-day-route{font-size:11px;line-height:1.55;color:var(--gp-t2);
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .gp-rb-day-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:10.5px;line-height:1.5;
      color:var(--gp-t3);font-variant-numeric:tabular-nums}
    .gp-rb-day-meta b{color:var(--gp-t2);font-weight:600}
    .gp-rb-day-note{font-size:10.5px;line-height:1.6;color:var(--gp-t3);
      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .gp-rb-day-err{border:1px solid color-mix(in srgb,var(--gp-red) 32%,transparent);
      background:color-mix(in srgb,var(--gp-red) 7%,transparent);border-radius:8px;
      padding:7px 8px;font-size:11px;line-height:1.6;color:var(--gp-t2);
      display:flex;flex-direction:column;gap:6px}
    .gp-rb-day-err .gp-rb-actions .gp-btn{height:25px;font-size:11px}
    .gp-rb-day-track{border-top:1px dashed var(--gp-line2);padding-top:8px}
    .gp-rb-day-foot{display:flex;align-items:center;gap:6px;flex-wrap:wrap;
      border-top:1px solid var(--gp-line2);padding-top:7px;margin-top:auto}
    .gp-rb-day-foot .sp{margin-left:auto}
    .gp-rb-day-foot .gp-btn{height:26px;font-size:11px}
    .gp-rb-trip-foot{font-variant-numeric:tabular-nums}
    .gp-rb-tripgroup{border:1px solid var(--gp-line2);border-radius:13px;background:var(--gp-card);
      padding:0 12px 12px;margin-bottom:12px}
    .gp-rb-tripgroup-hd{display:flex;align-items:center;gap:10px;flex-wrap:wrap;
      padding:9px 0;border-bottom:1px solid var(--gp-line2);margin-bottom:10px}
    .gp-rb-tripgroup-toggle{flex:1;min-width:0;display:flex;align-items:center;gap:8px;
      border:0;background:transparent;color:var(--gp-t1);font:inherit;text-align:left;
      cursor:pointer;padding:2px 0}
    .gp-rb-triparrow{flex:none;color:var(--gp-t3);font-size:10px;width:11px}
    .gp-rb-tripgroup-title{font-size:13px;font-weight:650;color:var(--gp-t1);min-width:0;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .gp-rb-tripgroup-meta{font-size:10.5px;color:var(--gp-t3);white-space:nowrap;
      font-variant-numeric:tabular-nums}
    .gp-rb-tripgroup-toggle:hover .gp-rb-tripgroup-title{color:var(--gp-blue)}
    .gp-rb-tripgroup-del{height:24px;font-size:10.5px;flex:none;
      color:var(--gp-red);border-color:color-mix(in srgb,var(--gp-red) 30%,var(--gp-line))}
    .gp-rb-tripgroup-del:hover{background:color-mix(in srgb,var(--gp-red) 10%,transparent)}
    .gp-rb-tripgroup .gp-rb-confirm{margin-bottom:10px}
    .gp-rb-tripgroup .gp-rb-grid{gap:10px}
    .gp-toast.is-workshop{top:auto;bottom:24px;right:26px;z-index:120}
    @media (max-width:1100px){
      .gp-rb-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .gp-rb-aicands{grid-template-columns:repeat(2,minmax(0,1fr))}
      .gp-rb-days{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media (max-width:980px){
      .gp-rb-ai{grid-template-columns:minmax(0,1fr)}
      .gp-rb-preview{position:static}
      .gp-rb-grid2{grid-template-columns:minmax(0,1fr)}
    }
    @media (max-width:760px){
      .gp-rb-aicands{grid-template-columns:minmax(0,1fr)}
      .gp-rb-days{grid-template-columns:minmax(0,1fr)}
      .gp-rb-day.is-open{grid-column:auto}
      .gp-rb-place .v{max-width:100%}
      .gp-rb-resolved-line{align-items:flex-start}
    }
    @media (max-width:600px){
      .gp-rb{padding-bottom:28px}
      .gp-rb-lead h1{font-size:16px}
      .gp-rb-lead p{font-size:11px}
      .gp-rb-svc{margin-left:0;width:100%}
      .gp-rb-tabs{width:100%}
      .gp-rb-tab{flex:1;justify-content:center;padding:0 6px}
      .gp-rb-grid{grid-template-columns:minmax(0,1fr)}
      .gp-rb-form-grid{grid-template-columns:minmax(0,1fr)}
      .gp-rb-card.is-open{grid-column:auto}
      .gp-rb-empty{padding:30px 14px}
      .gp-rb-actions .gp-btn{height:28px}
      .gp-rb-plan-loading,.gp-rb-placeholder{min-height:220px}
      .gp-rb-modeseg{width:100%}
      .gp-rb-modebtn{flex:1;justify-content:center}
      .gp-rb-multirow .gp-rb-field{width:100%}
      .gp-rb-multirow .gp-rb-useweb{padding-top:0}
      .gp-rb-tripgroup{padding:0 9px 9px}
      .gp-rb-tripgroup-hd{gap:6px}
      .gp-rb-tripgroup-meta{white-space:normal}
    }
    `

    /* ---------------------------------------------------------------- *
     * 工具函数
     * ---------------------------------------------------------------- */
    const fmt = (n, d = 0) =>
      typeof n === 'number' && isFinite(n)
        ? n.toLocaleString('zh-CN', { maximumFractionDigits: d, minimumFractionDigits: d })
        : '—'
    const hours = (sec) => (typeof sec === 'number' ? (sec / 3600).toFixed(1) : '—')
    const clock = (sec) => {
      if (typeof sec !== 'number') return '—'
      const s = Math.round(sec)
      const hh = Math.floor(s / 3600)
      const mm = Math.floor((s % 3600) / 60)
      return hh ? `${hh}h${String(mm).padStart(2, '0')}m` : `${mm}m`
    }
    const clampPct = (v) => Math.max(0, Math.min(100, Math.round(v)))
    const pillClass = (v) => (v >= 70 ? 'g' : v >= 40 ? 'a' : 'r')
    const LEVEL_ZH = {
      PRIME: '极佳', HIGH: '良好', MODERATE: '中等', LOW: '偏低', POOR: '差',
      GOOD: '好', FAIR: '一般', EXCELLENT: '优秀',
    }

    const RECORD_ZH = {
      'Longest Run': '最长跑步',
      'Longest Ride': '最长骑行',
      'Most Elevation Gain Cycling': '单次最大爬升',
      'Most Elevation Gain': '单次最大爬升',
      'Fastest 100K Cycling': '最快 100K',
      'Fastest 40K Cycling': '最快 40K',
      'Most Steps Day': '单日最多步数',
      'Most Steps Week': '单周最多步数',
      'Most Steps Month': '单月最多步数',
      'Longest Daily Goal Streak': '最长日目标连续',
      'Longest Weekly Goal Streak': '最长周目标连续',
      'Fastest 400m Pool Swim': '最快 400m 泳池',
      'Fastest 800m Pool Swim': '最快 800m 泳池',
    }
    const recordZh = (name) => {
      if (RECORD_ZH[name]) return RECORD_ZH[name]
      if (/^Unknown/.test(name)) return '其他记录'
      return name
    }
    const deviceKind = (name = '') => {
      if (/Edge|Garmin Edge|码表/i.test(name)) return '码表'
      if (/Instinct|Fenix|Forerunner|Venu|Epix|Vivo|Lily|MARQ|手表/i.test(name)) return '手表'
      if (/Index|Scale|S2|体重秤/i.test(name)) return '体重秤'
      return '设备'
    }

    /* 设备接口里的 kind 可能是英文枚举，也可能没给（退回按名字猜） */
    const KIND_ZH = {
      watch: '手表', smartwatch: '手表', fitness: '手表', wearable: '手表',
      edge: '码表', cycling: '码表', bike: '码表', computer: '码表', bike_computer: '码表',
      scale: '体重秤', index: '体重秤', sensor: '传感器',
    }
    const deviceChip = (d) => KIND_ZH[String(d?.kind || '').toLowerCase()] || deviceKind(d?.name || '')
    const firstOf = (...vals) => {
      for (const v of vals) if (v !== undefined && v !== null && v !== '') return v
      return null
    }
    const numOf = (...vals) => {
      for (const v of vals) {
        const n = typeof v === 'string' ? Number(v) : v
        if (typeof n === 'number' && isFinite(n)) return n
      }
      return null
    }

    /* ---------------- v3 小工具：日期 / 月份 / 轨迹 / 运动图标 ---------------- */
    const pad2 = (n) => String(n).padStart(2, '0')
    const isoDay = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

    /** 取 YYYY-MM-DD 部分；兼容 ISO、'YYYY-MM-DD HH:mm:ss' 与空值 */
    function dayPart(value) {
      const text = String(value ?? '').trim()
      const m = /^(\d{4}-\d{2}-\d{2})/.exec(text)
      return m ? m[1] : null
    }
    /** 取 HH:mm 部分；兼容 'YYYY-MM-DD HH:mm:ss' 与 ISO */
    function timePart(value) {
      const text = String(value ?? '').trim()
      const m = /[T ](\d{2}):(\d{2})/.exec(text)
      return m ? `${m[1]}:${m[2]}` : null
    }
    /** 日期加减（按本地中午计算，避开夏令时/时区抖动） */
    function shiftDay(day, delta) {
      const base = dayPart(day)
      if (!base) return null
      const [y, m, d] = base.split('-').map(Number)
      const dt = new Date(y, m - 1, d, 12, 0, 0, 0)
      dt.setDate(dt.getDate() + delta)
      return isoDay(dt)
    }
    function shortDay(day) {
      const base = dayPart(day)
      return base ? base.slice(5, 10) : '—'
    }

    /* ---------------- 回看窗口：最近 30 天（今天 − 29 … 今天） ---------------- */
    const REVIEW_SPAN = 30

    /** 本机今天的 ISO 日（用户 locale 的日界线，与后端 date= 语义一致） */
    function todayIso() {
      return isoDay(new Date())
    }

    /** 'YYYY-MM-DD' → '周四'（周一为一周起点） */
    function dayWeekday(day) {
      const base = dayPart(day)
      if (!base) return ''
      const [y, m, d] = base.split('-').map(Number)
      const dt = new Date(y, m - 1, d, 12, 0, 0, 0)
      if (Number.isNaN(dt.getTime())) return ''
      return WEEKDAYS_ZH[(dt.getDay() + 6) % 7] || ''
    }

    /** 'YYYY-MM-DD' → '11-05 周四' */
    function dayText(day) {
      const base = dayPart(day)
      if (!base) return '—'
      return `${shortDay(base)} ${dayWeekday(base)}`
    }

    /** 回看窗口内最早的日期（今天 − 29） */
    function reviewMinDay(today) {
      return shiftDay(dayPart(today) || todayIso(), -(REVIEW_SPAN - 1))
    }

    /** 把任意日期夹到 [今天−29, 今天]：未来与超窗日期永不可选 */
    function clampReviewDay(day, today) {
      const base = dayPart(day)
      if (!base) return dayPart(today) || todayIso()
      const hi = dayPart(today) || todayIso()
      const lo = reviewMinDay(hi)
      if (base > hi) return hi
      if (base < lo) return lo
      return base
    }

    /** 最近 30 天（今天在最前，便于弹层从上往下读） */
    function reviewDayOptions(today) {
      const hi = dayPart(today) || todayIso()
      const out = []
      for (let i = 0; i < REVIEW_SPAN; i++) {
        const day = shiftDay(hi, -i)
        if (!day) break
        out.push(day)
      }
      return out
    }

    /** 月份键 ±N 个月，用于「本月无活动时回退到最近有活动的月份」 */
    function shiftMonthKey(monthKey, delta) {
      const m = /^(\d{4})-(\d{2})$/.exec(String(monthKey ?? ''))
      if (!m) return monthKey
      const d = new Date(Number(m[1]), Number(m[2]) - 1 + delta, 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }

    function monthLabel(monthKey) {
      const m = /^(\d{4})-(\d{2})$/.exec(String(monthKey ?? ''))
      return m ? `${m[1]} 年 ${Number(m[2])} 月` : String(monthKey ?? '')
    }
    /** 令牌/密钥时间：ISO 或秒/毫秒时间戳 → 'YYYY-MM-DD HH:mm' */
    function stampText(value) {
      if (value === null || value === undefined || value === '') return null
      let ms = NaN
      if (typeof value === 'number') ms = value < 1e12 ? value * 1000 : value
      else {
        const text = String(value).trim()
        if (/^\d+$/.test(text)) {
          const n = Number(text)
          ms = n < 1e12 ? n * 1000 : n
        } else ms = Date.parse(text)
      }
      if (!isFinite(ms)) return String(value)
      const d = new Date(ms)
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
    }
    /** 从若干候选字段里找第一个非空日期 */
    function dateOf(...vals) {
      for (const v of vals) {
        const day = dayPart(v)
        if (day) return day
      }
      return null
    }

    /* 运动类型 → 图标（内联 SVG，18px） */
    function sportIconKey(type) {
      const t = String(type ?? '').toLowerCase()
      if (/bik|cycl|bike|骑行/.test(t)) return 'bike'
      if (/run|treadmill|跑/.test(t)) return 'run'
      if (/swim|泳/.test(t)) return 'swim'
      if (/strength|weight|力量/.test(t)) return 'strength'
      if (/kayak|row|canoe|paddle|划/.test(t)) return 'paddle'
      if (/walk|步/.test(t)) return 'walk'
      if (/hik|hike|mount|徒步|登山/.test(t)) return 'hike'
      return 'dot'
    }

    function SportIcon({ type, size = 18 }) {
      const key = sportIconKey(type)
      const common = {
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.7,
        strokeLinecap: 'round', strokeLinejoin: 'round',
      }
      let paths
      if (key === 'bike') {
        paths = [
          h('circle', { key: 'a', cx: 5.6, cy: 17, r: 3.5, ...common }),
          h('circle', { key: 'b', cx: 18.4, cy: 17, r: 3.5, ...common }),
          h('path', { key: 'c', d: 'M5.6 17 9.4 8.6h4.4L18.4 17M9.9 8.6h4.3M8.2 12.7h6.5', ...common }),
        ]
      } else if (key === 'run') {
        paths = [
          h('path', {
            key: 'a',
            d: 'M3.4 16.9c0-1.7.8-2.8 2.2-3.9l2-1.5 1.3 1.7 2.4-.7-.4-2 2.7-.7 1.7 3.3c1.2.4 3.1.8 4.1 1.7.8.7 1 2.2.2 3H4.8c-.9 0-1.4-.4-1.4-.9Z',
            ...common,
          }),
          h('path', { key: 'b', d: 'M3.4 16.9v2.2h17.9', ...common }),
          h('path', { key: 'c', d: 'M8.7 11.2l1.5 2.1', ...common }),
        ]
      } else if (key === 'swim') {
        paths = [9, 13.4, 17.8].map((y, i) => h('path', {
          key: `w${i}`,
          d: `M2 ${y}c1.7 0 1.7-1.7 3.4-1.7S7.1 ${y} 8.8 ${y}s1.7-1.7 3.4-1.7S13.9 ${y} 15.6 ${y}s1.7-1.7 3.4-1.7S20.7 ${y} 22 ${y}`,
          ...common,
        }))
      } else if (key === 'strength') {
        paths = [
          h('path', { key: 'a', d: 'M7 8.4v7.2M4.4 9.7v4.6M17 8.4v7.2M19.6 9.7v4.6M7 12h10', ...common }),
        ]
      } else if (key === 'paddle') {
        paths = [
          h('path', { key: 'a', d: 'M12 21V9', ...common }),
          h('path', { key: 'b', d: 'M12 9C9.4 7.5 8 5.1 8.9 3.2c2.1-.9 3.8 1.2 3.1 5.8Z', ...common }),
          h('path', { key: 'c', d: 'M12 9c2.6-1.5 4-3.9 3.1-5.8-2.1-.9-3.8 1.2-3.1 5.8Z', ...common }),
        ]
      } else if (key === 'walk') {
        paths = [
          h('circle', { key: 'a', cx: 13.4, cy: 4.4, r: 1.9, ...common }),
          h('path', { key: 'b', d: 'M12.9 8.2c-.4 2-1.2 3.3-2.5 4.6l-2.3 2.2M13.2 8.2c1.1 1.7 2.1 2.7 3.1 4.3M10.4 13.4 9 20.6M14.9 12.5l2.2 8.1', ...common }),
        ]
      } else if (key === 'hike') {
        paths = [
          h('path', { key: 'a', d: 'M2.6 19.4 9.2 6.8l4 6.9 2.4-3.3 5.8 9Z', ...common }),
          h('path', { key: 'b', d: 'M7.4 11.2l1.8 1.7 1.7-1.7', ...common }),
        ]
      } else {
        paths = [h('circle', { key: 'a', cx: 12, cy: 12, r: 4.2, className: 'fill', fill: 'currentColor' })]
      }
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': true,
      }, ...paths)
    }

    /** 轨迹点归一化到 120×64（留 6px 内边距，经度按中纬度余弦压缩，Y 翻转北上） */
    function trackThumbPoints(points, W = 120, H = 64, PAD = 6) {
      const rows = (Array.isArray(points) ? points : [])
        .map((p) => (Array.isArray(p)
          ? [numOf(p[0]), numOf(p[1])]
          : [numOf(p?.lat, p?.latitude), numOf(p?.lon, p?.lng, p?.longitude)]))
        .filter(([la, lo]) => la !== null && lo !== null)
      if (rows.length < 2) return null
      const lats = rows.map((r) => r[0])
      const lons = rows.map((r) => r[1])
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLon = Math.min(...lons)
      const maxLon = Math.max(...lons)
      const midLat = (minLat + maxLat) / 2
      const kx = Math.max(1e-6, Math.cos((midLat * Math.PI) / 180))
      const spanX = Math.max(1e-9, (maxLon - minLon) * kx)
      const spanY = Math.max(1e-9, maxLat - minLat)
      const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY)
      const padX = (W - spanX * scale) / 2
      const padY = (H - spanY * scale) / 2
      return rows
        .map(([lat, lon]) => {
          const x = padX + (lon - minLon) * kx * scale
          const y = H - padY - (lat - minLat) * scale
          return `${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join(' ')
    }

    /** 当月网格：Mon 起 7 列，返回天数与前置空格数 */
    function monthGrid(monthKey) {
      const m = /^(\d{4})-(\d{2})$/.exec(String(monthKey ?? ''))
      const now = new Date()
      const y = m ? Number(m[1]) : now.getFullYear()
      const mo = m ? Number(m[2]) : now.getMonth() + 1
      const days = new Date(y, mo, 0).getDate()
      const firstDow = (new Date(y, mo - 1, 1).getDay() + 6) % 7
      return { year: y, month: mo, days, firstDow }
    }

    const TRAINING_STATUS_ZH = {
      PRODUCTIVE: '高效训练', PEAKING: '巅峰状态', MAINTAINING: '保持状态',
      RECOVERY: '恢复中', STRAINED: '负荷偏高', UNPRODUCTIVE: '低效训练',
      OVERREACHING: '过度训练', DETRAINING: '状态下滑', NO_STATUS: '暂无状态',
      BALANCED: '平衡',
    }
    const HEAT_TREND_ZH = {
      ACCLIMATIZED: '已适应', UNACCLIMATIZED: '未适应', DECAYING: '适应消退', NONE: '无数据',
    }
    const ACWR_ZH = {
      OPTIMAL: '适宜', LOW: '偏低', HIGH: '偏高', VERY_LOW: '过低', VERY_HIGH: '过高',
      UNDERTRAINING: '训练不足', OVERREACHING: '过度训练', 'OPTIMAL RANGE': '适宜',
    }
    const acwrText = (v) => (v ? ACWR_ZH[String(v).toUpperCase()] || String(v) : '')

    /** 把 {score|value|...} 或纯数字统一成 {score, level} */
    function scoreEntry(value) {
      const n = numOf(value)
      if (n !== null) return { score: n, level: null }
      if (!value || typeof value !== 'object') return null
      const score = numOf(value.score, value.value, value.endurance_score, value.enduranceScore,
        value.hill_score, value.hillScore, value.overall)
      if (score === null) return null
      return {
        score,
        level: firstOf(value.level, value.classification, value.status, value.label),
      }
    }

    /** 周/日序列取最后一条 */
    function latestRow(value) {
      if (Array.isArray(value)) return value.length ? value[value.length - 1] : null
      if (!value || typeof value !== 'object') return null
      for (const key of ['weekly', 'daily', 'series', 'trend', 'data', 'rows', 'periods']) {
        if (Array.isArray(value[key]) && value[key].length) return value[key][value[key].length - 1]
      }
      return value
    }

    /* 上次同步：接口可能给 ISO 字符串 / 秒 / 毫秒，统一成「3 分钟前」或「上次同步 20:12」 */
    function syncText(value) {
      if (value === null || value === undefined || value === '') return null
      const pad = (n) => String(n).padStart(2, '0')
      let ms = NaN
      if (typeof value === 'number') {
        ms = value < 1e12 ? value * 1000 : value
      } else if (typeof value === 'string') {
        const text = value.trim()
        if (/^\d+$/.test(text)) {
          const n = Number(text)
          ms = n < 1e12 ? n * 1000 : n
        } else {
          ms = Date.parse(text)
          if (Number.isNaN(ms)) return text
        }
      }
      if (!isFinite(ms)) return null
      const diff = Date.now() - ms
      if (diff < 60e3) return '刚刚'
      if (diff < 3600e3) return `${Math.floor(diff / 60e3)} 分钟前`
      if (diff < 86400e3) return `${Math.floor(diff / 3600e3)} 小时前`
      const d = new Date(ms)
      if (diff < 7 * 86400e3) return `上次同步 ${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
      return `上次同步 ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    }

    /* 太阳能 / 闹钟这两个接口的返回形状比较宽松，这里都兜一下 */
    function solarText(solar) {
      if (!solar || typeof solar !== 'object') return null
      const list = Array.isArray(solar)
        ? solar
        : Array.isArray(solar.solar_data) ? solar.solar_data
          : Array.isArray(solar.data) ? solar.data : null
      const row = list ? list[list.length - 1] : solar
      if (!row || typeof row !== 'object' || Array.isArray(row)) return null
      const intensity = numOf(row.solar_utilization_max_pct, row.solar_utilization_avg_pct,
        row.solarIntensityMaxPct, row.solarIntensityAvgPct, row.intensity)
      const charge = numOf(row.activity_time_gained_minutes, row.chargeTimeMinutes,
        row.solar_charge_time_minutes, row.minutes_gained)
      const parts = []
      if (intensity !== null) parts.push(`强度 ${fmt(intensity, intensity < 10 ? 1 : 0)}%`)
      if (charge !== null) parts.push(`充电 +${fmt(charge, charge < 10 ? 1 : 0)} 分钟`)
      return parts.length ? parts.join(' · ') : null
    }
    function alarmCount(alarms) {
      if (alarms === null || alarms === undefined) return null
      if (Array.isArray(alarms)) return alarms.length
      if (typeof alarms === 'object') {
        if (Array.isArray(alarms.alarms)) return alarms.alarms.length
        if (typeof alarms.count === 'number') return alarms.count
      }
      return null
    }

    /** 统一剪贴板：优先 async API，失败退回 execCommand，返回是否成功 */
    function copyText(text) {
      return new Promise((resolve) => {
        const fallback = () => {
          try {
            const ta = document.createElement('textarea')
            ta.value = text
            ta.style.position = 'fixed'
            ta.style.top = '-1000px'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.focus()
            ta.select()
            const ok = document.execCommand('copy')
            ta.remove()
            resolve(!!ok)
          } catch {
            resolve(false)
          }
        }
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(() => resolve(true)).catch(fallback)
        } else fallback()
      })
    }

    /* ---------------- v6 小工具：性别 / 训练计划 / 目标 ---------------- */
    const GENDER_STORAGE_KEY = 'garmin-panel-gender-v1'
    const GENDER_VALUES = ['female', 'male']
    /** 'female' | 'male' 存本地；'none' 只作为本次会话的「未设置」哨兵，不写 localStorage */
    function normalizeGender(value) {
      const text = String(value ?? '').trim().toLowerCase()
      return GENDER_VALUES.includes(text) ? text : null
    }
    function readStoredGender() {
      try { return normalizeGender(localStorage.getItem(GENDER_STORAGE_KEY)) } catch { return null }
    }
    function writeStoredGender(value) {
      const next = normalizeGender(value)
      try {
        if (next) localStorage.setItem(GENDER_STORAGE_KEY, next)
        else localStorage.removeItem(GENDER_STORAGE_KEY)
      } catch { /* 隐私模式：只影响记忆 */ }
      return next
    }

    const WEEKDAYS_ZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    /** 周一起算的周一日期；无法解析时返回 null */
    function mondayOf(day) {
      const base = dayPart(day)
      if (!base) return null
      const [y, m, d] = base.split('-').map(Number)
      const dt = new Date(y, m - 1, d, 12, 0, 0, 0)
      const dow = (dt.getDay() + 6) % 7
      dt.setDate(dt.getDate() - dow)
      return isoDay(dt)
    }
    function planWeekStart(week) {
      return mondayOf(week?.start) || mondayOf(isoDay(new Date()))
    }
    function planWorkoutAt(workouts, date) {
      const rows = (Array.isArray(workouts) ? workouts : [])
        .filter((row) => row && dayPart(row.date) === date)
      return rows.length ? { workout: rows[0], count: rows.length } : null
    }
    function planDurationText(minutes) {
      const min = numOf(minutes)
      if (min === null || min <= 0) return ''
      if (min < 60) return `${Math.round(min)} 分钟`
      const hh = Math.floor(min / 60)
      const mm = Math.round(min % 60)
      return mm ? `${hh}h${pad2(mm)}m` : `${hh}h`
    }
    function planWorkoutName(workout) {
      return String(firstOf(workout?.name, workout?.title, '未命名课程'))
    }

    /* 训练计划只读：编辑 / 排课都回 Garmin Connect，这里只拼深链 */
    const GARMIN_WEB_INTL = 'https://connect.garmin.com'
    const GARMIN_WEB_CN = 'https://connect.garmin.cn'
    function planLinks(data) {
      const region = String(data?.region ?? data?.garminRegion ?? '').trim().toLowerCase()
      const base = region === 'cn' ? GARMIN_WEB_CN : GARMIN_WEB_INTL
      return {
        base,
        calendar: `${base}/modern/calendar`,
        workouts: `${base}/modern/workouts`,
        coach: `${base}/modern/coach`,
        goals: `${base}/modern/goals`,
        workout: (id) => `${base}/modern/workout/${encodeURIComponent(String(id))}`,
      }
    }
    function planWorkoutHref(workout, links) {
      return workout?.workoutId != null && workout.workoutId !== ''
        ? links.workout(workout.workoutId)
        : links.calendar
    }
    function planDistanceText(meters) {
      const m = numOf(meters)
      if (m === null || m <= 0) return ''
      if (m >= 1000) {
        const km = m / 1000
        return `${fmt(km, Number.isInteger(km) ? 0 : 1)} km`
      }
      return `${fmt(Math.round(m))} m`
    }
    /** 来源：Coach 显式标记优先；排课与 Coach 重叠时按 Coach 算（id → 日期 + 名称） */
    function planSourceOf(workout, coachRows) {
      const raw = String(workout?.source ?? '').trim().toLowerCase()
      if (raw === 'coach' || raw === 'garmin_coach' || raw === 'garmin coach') return 'Garmin Coach'
      const rows = Array.isArray(coachRows) ? coachRows : []
      const day = dayPart(workout?.date)
      const name = planWorkoutName(workout)
      const hit = rows.some((row) => {
        if (workout?.workoutId != null && row?.workoutId != null) {
          return String(row.workoutId) === String(workout.workoutId)
        }
        return dayPart(row?.date) === day && planWorkoutName(row) === name
      })
      return hit ? 'Garmin Coach' : '已排课'
    }
    function planSportText(workout) {
      const type = String(workout?.type ?? '').trim()
      if (!type) return '运动'
      return SPORT_ZH[type] || type
    }
    /** 复制详情：单节课 3 行（名称 / 日期·类型·时长·距离·来源 / Garmin 链接） */
    function planDetailText(day, workout, links, source) {
      if (!day || !workout) return ''
      const meta = [
        `${day.date} ${day.weekday}`,
        planSportText(workout),
        `时长 ${planDurationText(workout.durationMin) || '未标注'}`,
        `距离 ${planDistanceText(workout.distanceM) || '未标注'}`,
        `来源 ${source || '已排课'}`,
      ]
      const done = workout.completed ? ' [已完成]' : ''
      return [
        planWorkoutName(workout),
        meta.join(' · ') + done,
        planWorkoutHref(workout, links),
      ].join('\n')
    }
    /** 问 AI 教练：固定句式，课程名 / 日期 / 时长 */
    function planAiPrompt(day, workout) {
      return `帮我看下这节课：${planWorkoutName(workout)}（${day.date}，${planDurationText(workout.durationMin) || '时长未标注'}）`
    }
    /** 复制整周：固定 7 行，无课写「休息」 */
    function planWeekText(days) {
      return (Array.isArray(days) ? days : []).map((day) => {
        const workout = day?.workout
        if (!workout) return `${day?.weekday || ''} ${shortDay(day?.date)} · 休息`.trim()
        const bits = [planWorkoutName(workout)]
        const duration = planDurationText(workout.durationMin)
        if (duration) bits.push(duration)
        const distance = planDistanceText(workout.distanceM)
        if (distance) bits.push(distance)
        const done = workout.completed ? ' [已完成]' : ''
        return `${day.weekday} ${shortDay(day.date)} · ${bits.join(' · ')}${done}`
      }).join('\n')
    }
    const PLAN_AI_WEEK_PROMPT = '我本周想安排骑行训练，请根据我的负荷给出一周计划'

    const GOAL_TYPE_ZH = {
      distance: '距离', duration: '时长', time: '时长', steps: '步数',
      calories: '卡路里', weight: '体重', workouts: '训练次数', count: '次数',
    }
    function goalTypeText(type) {
      const key = String(type ?? '').trim().toLowerCase()
      if (!key) return '目标'
      return GOAL_TYPE_ZH[key] || String(type)
    }
    function goalUnitText(type) {
      const key = String(type ?? '').trim().toLowerCase()
      if (/distance|骑|跑|swim|cycl|bike/.test(key)) return 'km'
      if (/duration|time|时长/.test(key)) return '分钟'
      if (/steps|步/.test(key)) return '步'
      if (/calorie|卡/.test(key)) return 'kcal'
      if (/weight|体重/.test(key)) return 'kg'
      return ''
    }
    function goalNumber(value) {
      const n = numOf(value)
      return n === null ? null : fmt(n, Number.isInteger(n) ? 0 : 1)
    }

    /** 生成给 AI 的简报文本（也是复制的内容） */
    /** 抽屉用：按需取 JSON，卸载/换路径时 abort；enabled=false 时完全不动 */
    function useJson(path, enabled = true, version = 0) {
      const [state, setState] = React.useState({ loading: !!enabled })
      React.useEffect(() => {
        if (!enabled || !path) return undefined
        const controller = new AbortController()
        let active = true
        setState({ loading: true })
        fetch(`${API}/${path}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
          })
          .then((data) => {
            if (active) setState({ loading: false, data })
          })
          .catch((err) => {
            if (!active || err?.name === 'AbortError') return
            setState({ loading: false, error: String(err?.message ?? err) })
          })
        return () => {
          active = false
          controller.abort()
        }
      }, [path, enabled, version])
      return state
    }

    /**
     * 活动缩略轨迹：只对候选活动懒加载，并发 ≤ 3，按 id 记忆化。
     * version 变化会丢弃旧缓存（刷新即重取）；enabled=false 完全不发请求。
     */
    function useActivityTracks(ids, enabled, version, concurrency = 3) {
      const store = React.useRef({ version, map: {} })
      if (store.current.version !== version) store.current = { version, map: {} }
      const [, bump] = React.useReducer((n) => n + 1, 0)
      const key = (Array.isArray(ids) ? ids : []).join(',')

      React.useEffect(() => {
        if (!enabled) return undefined
        const list = key ? key.split(',') : []
        const map = store.current.map
        const pending = list.filter((id) => !map[id])
        if (!pending.length) return undefined
        let active = true
        let cursor = 0
        let inflight = 0
        const controllers = new Set()

        const pump = () => {
          if (!active) return
          while (inflight < concurrency && cursor < pending.length) {
            const id = pending[cursor++]
            if (map[id]) continue
            map[id] = { status: 'loading' }
            inflight += 1
            const controller = new AbortController()
            controllers.add(controller)
            fetch(`${API}/activities/${encodeURIComponent(id)}/track`, {
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            })
              .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
              .then((data) => {
                if (!active) return
                if (data?.status === 'ok') {
                  const points = trackThumbPoints(data.points)
                  map[id] = points ? { status: 'ok', points } : { status: 'no_track' }
                } else {
                  map[id] = { status: data?.status || 'no_track' }
                }
              })
              .catch((err) => {
                if (active) map[id] = { status: 'error', error: String(err?.message ?? err) }
              })
              .finally(() => {
                controllers.delete(controller)
                inflight -= 1
                if (active) { bump(); pump() }
              })
          }
        }
        pump()

        return () => {
          active = false
          for (const controller of controllers) {
            try { controller.abort() } catch { /* ignore */ }
          }
          controllers.clear()
          for (const id of pending) {
            if (map[id]?.status === 'loading') delete map[id]
          }
        }
      }, [key, enabled, version, concurrency])

      return store.current.map
    }

    /**
     * 区块级资源加载：enabled=false 时完全不发请求（隐藏区块不浪费一次 Garmin 调用）。
     * 重新显示（enabled 变 true）会重新拉取；过期响应用 cancelled 丢弃。
     */
    function useResource(path, version, enabled = true) {
      const [state, setState] = React.useState({ loading: !!enabled })
      React.useEffect(() => {
        if (!enabled || !path) {
          setState({ loading: false })
          return undefined
        }
        const controller = new AbortController()
        let cancelled = false
        setState((s) => (s.data ? { ...s, loading: true } : { loading: true }))
        fetch(`${API}/${path}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
          })
          .then((data) => { if (!cancelled) setState({ loading: false, data }) })
          .catch((err) => {
            if (cancelled || err?.name === 'AbortError') return
            setState({ loading: false, error: String(err?.message ?? err) })
          })
        return () => {
          cancelled = true
          controller.abort()
        }
      }, [path, version, enabled])
      return state
    }

    /** POST JSON：返回解析后的 body；网络/HTTP 失败抛出 */
    async function postJson(path, body, signal) {
      const res = await fetch(`${API}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
        signal,
      })
      let data = null
      try { data = await res.json() } catch { data = null }
      if (!res.ok && !data) throw new Error(`HTTP ${res.status}`)
      return data
    }

    /** GET JSON：非 2xx 直接抛错，交给调用方显示 */
    async function fetchJson(path, signal) {
      const res = await fetch(`${API}/${path}`, {
        headers: { Accept: 'application/json' },
        signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    }

    /* ---------------------------------------------------------------- *
     * 静态底图（高德）
     * - 全局只探测一次 /staticmap/status；老 host 没有该端点时回退到
     *   /roadbook/status 的 amapConfigured / amapKeyValid。
     * - 结果按「首/末点 + 点数 + bbox + 尺寸 + coord/kind」缓存在模块级 Map，
     *   同一组轨迹在抽屉关闭重开、标签来回切换时不会重复打接口（配额友好）。
     * - 请求可取消：最后一个消费组件卸载时 abort，并清掉 inflight。
     * ---------------------------------------------------------------- */
    const STATIC_MAP_STATUS = {
      configured: false,
      valid: false,
      known: false,
      loading: true,
    }
    let staticMapStatusPromise = null
    const staticMapStatusListeners = new Set()

    const staticMapStatusSnapshot = () => ({ ...STATIC_MAP_STATUS })

    function staticMapStatusApply(next) {
      Object.assign(STATIC_MAP_STATUS, next)
      const snapshot = staticMapStatusSnapshot()
      for (const listener of staticMapStatusListeners) {
        try { listener(snapshot) } catch { /* ignore */ }
      }
    }

    /** 只发一次状态探测；失败静默降级（未知 → 不启用底图） */
    function loadStaticMapStatus() {
      if (staticMapStatusPromise) return staticMapStatusPromise
      staticMapStatusPromise = (async () => {
        let next = null
        try {
          const res = await fetch(`${API}/staticmap/status`, {
            headers: { Accept: 'application/json' },
          })
          if (res.ok) {
            const data = await res.json()
            if (data && typeof data === 'object') {
              next = {
                configured: !!data.configured,
                valid: data.valid !== false,
                known: true,
                loading: false,
              }
            }
          }
        } catch { /* 老 host 无此端点 → 走 /roadbook/status */ }
        if (!next) {
          try {
            const res = await fetch(`${API}/roadbook/status`, {
              headers: { Accept: 'application/json' },
            })
            if (res.ok) {
              const data = await res.json()
              if (data && typeof data === 'object') {
                next = {
                  configured: !!data.amapConfigured,
                  valid: data.amapKeyValid !== false,
                  known: true,
                  loading: false,
                }
              }
            }
          } catch { /* 静默降级 */ }
        }
        staticMapStatusApply(next || {
          configured: false, valid: false, known: false, loading: false,
        })
        return staticMapStatusSnapshot()
      })()
      return staticMapStatusPromise
    }

    function useStaticMapStatus() {
      const [state, setState] = React.useState(staticMapStatusSnapshot)
      React.useEffect(() => {
        let active = true
        const listener = (next) => { if (active) setState(next) }
        staticMapStatusListeners.add(listener)
        loadStaticMapStatus().then((next) => { if (active) setState(next) })
        return () => {
          active = false
          staticMapStatusListeners.delete(listener)
        }
      }, [])
      return state
    }

    /** [lat,lng] / {lat,lon|lng} → [lat,lng]；非法点丢弃 */
    function staticMapLatLng(point) {
      if (Array.isArray(point)) {
        const lat = numOf(point[0])
        const lng = numOf(point[1])
        return lat !== null && lng !== null ? [lat, lng] : null
      }
      if (point && typeof point === 'object') {
        const lat = numOf(point.lat, point.latitude)
        const lng = numOf(point.lng, point.lon, point.longitude)
        return lat !== null && lng !== null ? [lat, lng] : null
      }
      return null
    }
    const staticMapPoints = (points) => (Array.isArray(points) ? points : [])
      .map(staticMapLatLng)
      .filter(Boolean)

    function staticMapOptions(options) {
      const opts = options && typeof options === 'object' ? options : {}
      const rawW = numOf(opts.width)
      const rawH = numOf(opts.height)
      return {
        coord: opts.coord === 'gcj02' ? 'gcj02' : 'wgs84',
        width: Math.max(160, Math.min(1600, Math.round(rawW === null ? 720 : rawW))),
        height: Math.max(120, Math.min(1200, Math.round(rawH === null ? 360 : rawH))),
        kind: opts.kind === 'route' ? 'route' : 'activity',
        color: opts.color ? String(opts.color) : null,
        weight: numOf(opts.weight),
        enabled: opts.enabled !== false,
      }
    }

    /** 便宜的缓存键：首/末点 + 点数 + bbox + 尺寸 + coord/kind */
    function staticMapKey(rows, opts) {
      let minLat = Infinity
      let minLng = Infinity
      let maxLat = -Infinity
      let maxLng = -Infinity
      for (const [lat, lng] of rows) {
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
      }
      const round = (n) => Math.round(n * 1e5) / 1e5
      const first = rows[0]
      const last = rows[rows.length - 1]
      return [
        opts.coord,
        opts.kind,
        `${opts.width}x${opts.height}`,
        opts.color || '',
        opts.weight === null ? '' : String(opts.weight),
        rows.length,
        round(first[0]), round(first[1]),
        round(last[0]), round(last[1]),
        round(minLat), round(minLng), round(maxLat), round(maxLng),
      ].join('|')
    }

    function staticMapBody(rows, opts) {
      const body = {
        points: rows,
        coord: opts.coord,
        width: opts.width,
        height: opts.height,
        kind: opts.kind,
      }
      if (opts.color) body.color = opts.color
      if (opts.weight !== null) body.weight = opts.weight
      return body
    }

    /** 统一响应：ok → {url}；unavailable → 静默降级；其余 → 错误 */
    function staticMapResult(data) {
      if (data && data.status === 'ok'
        && typeof data.dataUrl === 'string' && data.dataUrl.startsWith('data:image/')) {
        return { status: 'ok', url: data.dataUrl, source: data.source || 'amap' }
      }
      if (data && data.status === 'unavailable') {
        return { status: 'unavailable', message: String(data.message || '底图不可用') }
      }
      return {
        status: 'error',
        error: String((data && (data.message || data.error)) || '底图加载失败'),
      }
    }

    const STATIC_MAP_CACHE = new Map()
    const STATIC_MAP_INFLIGHT = new Map()

    /** 量容器宽度：静态图按容器等比请求，避免 object-fit 裁掉轨迹 */
    function useElementWidth() {
      const [width, setWidth] = React.useState(0)
      const cleanupRef = React.useRef(null)
      const setRef = React.useCallback((node) => {
        if (cleanupRef.current) {
          cleanupRef.current()
          cleanupRef.current = null
        }
        if (!node) {
          setWidth(0)
          return
        }
        const read = () => {
          const next = Math.round(node.getBoundingClientRect().width)
          setWidth((prev) => (prev === next ? prev : next))
        }
        read()
        if (typeof ResizeObserver === 'function') {
          const observer = new ResizeObserver(read)
          observer.observe(node)
          cleanupRef.current = () => observer.disconnect()
        } else {
          window.addEventListener('resize', read)
          cleanupRef.current = () => window.removeEventListener('resize', read)
        }
      }, [])
      React.useEffect(() => () => {
        if (cleanupRef.current) cleanupRef.current()
      }, [])
      return [setRef, width]
    }

    /**
     * 取缓存 / 共享 inflight。返回 { result } 或 { entry }；
     * entry.refs 记录消费组件数，最后一个卸载且未完成时 abort。
     */
    function staticMapEntry(key, rows, opts) {
      const cached = STATIC_MAP_CACHE.get(key)
      if (cached) return { result: cached, entry: null }
      let entry = STATIC_MAP_INFLIGHT.get(key)
      if (!entry) {
        const controller = new AbortController()
        entry = { controller, refs: 0, settled: false, promise: null }
        entry.promise = fetch(`${API}/staticmap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(staticMapBody(rows, opts)),
          signal: controller.signal,
        })
          .then((res) => res.json().catch(() => null).then((data) => ({ res, data })))
          .then(({ res, data }) => {
            if (!res.ok && !data) throw new Error(`HTTP ${res.status}`)
            const result = staticMapResult(data)
            if (result.status === 'ok' || result.status === 'unavailable') {
              STATIC_MAP_CACHE.set(key, result)
            }
            return result
          })
          .finally(() => {
            entry.settled = true
            STATIC_MAP_INFLIGHT.delete(key)
          })
        STATIC_MAP_INFLIGHT.set(key, entry)
      }
      entry.refs += 1
      return { result: null, entry }
    }

    function staticMapStateOf(result) {
      if (result.status === 'ok') {
        return {
          url: result.url,
          loading: false,
          error: null,
          unavailable: false,
          configured: true,
          valid: true,
          source: result.source || 'amap',
        }
      }
      if (result.status === 'unavailable') {
        return {
          url: null,
          loading: false,
          error: null,
          unavailable: true,
          configured: true,
          valid: true,
          message: result.message,
        }
      }
      return {
        url: null,
        loading: false,
        error: result.error || '底图加载失败',
        unavailable: false,
        configured: true,
        valid: true,
      }
    }

    /**
     * useStaticMap(points, options) → { url, loading, error, unavailable, ... }
     * options: { coord: 'wgs84'|'gcj02', kind: 'activity'|'route', width, height,
     *            color?, weight?, enabled? }
     * 只有 configured && valid && points.length >= 2 时才发请求。
     */
    function useStaticMap(points, options = {}) {
      const status = useStaticMapStatus()
      const rows = staticMapPoints(points)
      const opts = staticMapOptions(options)
      const active = opts.enabled && status.configured && status.valid && rows.length >= 2
      const key = active ? staticMapKey(rows, opts) : ''
      const inactive = () => ({
        url: null,
        loading: false,
        error: null,
        unavailable: !!status.known && (!status.configured || !status.valid),
        configured: !!status.configured,
        valid: !!status.valid,
      })
      const [state, setState] = React.useState(() => {
        if (!active) return inactive()
        const cached = STATIC_MAP_CACHE.get(key)
        if (cached) return staticMapStateOf(cached)
        return {
          url: null,
          loading: true,
          error: null,
          unavailable: false,
          configured: true,
          valid: true,
        }
      })

      React.useEffect(() => {
        if (!active) {
          setState(inactive())
          return undefined
        }
        const cached = STATIC_MAP_CACHE.get(key)
        if (cached) {
          setState(staticMapStateOf(cached))
          return undefined
        }
        const { entry } = staticMapEntry(key, rows, opts)
        let mounted = true
        setState((prev) => (prev.url ? prev : {
          url: null,
          loading: true,
          error: null,
          unavailable: false,
          configured: true,
          valid: true,
        }))
        entry.promise
          .then((result) => {
            if (mounted) setState(staticMapStateOf(result))
          })
          .catch((err) => {
            if (!mounted || err?.name === 'AbortError') return
            setState({
              url: null,
              loading: false,
              error: String(err?.message ?? err),
              unavailable: false,
              configured: true,
              valid: true,
            })
          })
        return () => {
          mounted = false
          entry.refs -= 1
          if (entry.refs <= 0 && !entry.settled) {
            try { entry.controller.abort() } catch { /* ignore */ }
            STATIC_MAP_INFLIGHT.delete(key)
          }
        }
        // key/active 已编码坐标、尺寸、kind 与状态，无需把对象放进依赖
      }, [key, active])

      return state
    }

    /* ---------------------------------------------------------------- *
     * 个性化布局：区块级 + 卡片级（localStorage 持久化）
     * v2: [{ id, visible, cards: [{ id, visible }] }]，数组顺序 = 渲染顺序
     * ---------------------------------------------------------------- */
    const LAYOUT_STORAGE_KEY = 'garmin-panel-layout-v2'
    const LEGACY_LAYOUT_STORAGE_KEY = 'garmin-panel-layout-v1'
    const SECTION_DEFS = [
      { id: 'kpi', label: '今日状态', hint: '准备度 · 睡眠 · 恢复' },
      { id: 'body', label: '今天身体（含恢复）', hint: '步数 · 心率 · 压力' },
      { id: 'sleep', label: '睡眠 · 近 7 晚', hint: '近 7 晚' },
      { id: 'womens', label: '女性健康', hint: '周期 · 孕期' },
      { id: 'trends', label: '健康趋势', hint: '最近 7 天 / 30 天' },
      { id: 'load', label: '训练负荷', hint: '趋势 · 平衡 · 能力' },
      { id: 'advanced', label: '进阶数据', hint: '训练状态 · 阈值 · 耐受 · 体能年龄' },
      { id: 'coach', label: 'AI 健康 · 今日建议', hint: '教练与管家' },
      { id: 'plan', label: '训练计划', hint: '本周课表 · 目标 · 只读' },
      { id: 'activities', label: '最近活动', hint: '近 30 天 · 月度分布' },
      { id: 'extras', label: '计划 · 装备 · 身体', hint: '本周安排 · 装备 · 体重' },
      { id: 'records', label: '个人记录', hint: '最佳成绩' },
    ]
    /* 多卡板块的卡片清单：id + 中文名；顺序即默认渲染顺序 */
    const CARD_DEFS = {
      kpi: [
        { id: 'readiness', label: '训练准备度' },
        { id: 'sleep', label: '睡眠评分' },
        { id: 'battery', label: 'Body Battery' },
        { id: 'rhr', label: '静息心率' },
        { id: 'intensity', label: '本周强度分钟' },
      ],
      body: [
        { id: 'steps', label: '步数' },
        { id: 'calories', label: '能量消耗' },
        { id: 'stress', label: '压力' },
        { id: 'hr', label: '心率' },
        { id: 'breath', label: '呼吸 / 血氧' },
        { id: 'hydration', label: '水分' },
        { id: 'recovery', label: '恢复' },
      ],
      womens: [
        { id: 'cycle', label: '周期' },
        { id: 'pregnancy', label: '孕期' },
      ],
      trends: [
        { id: 'rhr', label: '静息心率' },
        { id: 'hrv', label: 'HRV' },
        { id: 'sleep', label: '睡眠' },
        { id: 'steps', label: '步数' },
        { id: 'stress', label: '压力' },
        { id: 'battery', label: 'Body Battery' },
        { id: 'respiration', label: '呼吸' },
        { id: 'spo2', label: '血氧' },
        { id: 'intensity', label: '强度分钟' },
        { id: 'weight', label: '体重' },
      ],
      load: [
        { id: 'trend', label: '负荷趋势' },
        { id: 'balance', label: '负荷平衡' },
        { id: 'ability', label: '能力' },
        { id: 'insight', label: '今日提醒' },
      ],
      advanced: [
        { id: 'status', label: '训练状态' },
        { id: 'thresholds', label: '阈值' },
        { id: 'tolerance', label: '跑步耐受度' },
        { id: 'endurance', label: '耐力 / 爬坡' },
        { id: 'acclimation', label: '热适应 / 海拔' },
        { id: 'fitnessAge', label: '体能年龄' },
        { id: 'hrzones', label: '心率区间' },
      ],
      extras: [
        { id: 'plan', label: '本周安排' },
        { id: 'gear', label: '装备' },
        { id: 'devices', label: '设备' },
        { id: 'bodycomp', label: '身体成分' },
        { id: 'nutrition', label: 'AI 营养建议' },
      ],
      coach: [
        { id: 'coach', label: 'AI 教练' },
        { id: 'steward', label: 'AI 健康管家' },
      ],
      plan: [
        { id: 'week', label: '本周课表' },
        { id: 'coach', label: 'Garmin Coach' },
        { id: 'goals', label: '目标' },
      ],
      activities: [
        { id: 'list', label: '活动列表' },
        { id: 'month', label: '月度分布' },
      ],
    }
    const CARD_META = Object.keys(CARD_DEFS).reduce((acc, sectionId) => {
      acc[sectionId] = CARD_DEFS[sectionId].reduce((map, card) => { map[card.id] = card; return map }, {})
      return acc
    }, {})
    const SECTION_META = SECTION_DEFS.reduce((acc, s) => { acc[s.id] = s; return acc }, {})
    const SECTION_IDS = SECTION_DEFS.map((s) => s.id)
    const cardsFor = (sectionId) => CARD_DEFS[sectionId] || []
    const defaultCards = (sectionId) => cardsFor(sectionId).map((card) => ({ id: card.id, visible: true }))
    const cardLabel = (sectionId, cardId) => CARD_META[sectionId]?.[cardId]?.label || cardId
    /* 新用户 / 恢复默认只铺稳定区块；plan / womens 由 Page 在可用时按默认顺序补进来 */
    const BASE_SECTION_IDS = SECTION_DEFS.map((s) => s.id)
      .filter((id) => id !== 'plan' && id !== 'womens')
    const defaultLayout = () => BASE_SECTION_IDS.map((id) => ({
      id,
      visible: true,
      cards: defaultCards(id),
    }))

    /** 单板块的卡片数组清洗：未知/重复丢弃，缺失的按默认顺序补在末尾（visible=true） */
    function sanitizeCards(sectionId, rawCards) {
      const defs = cardsFor(sectionId)
      if (!defs.length) return []
      const known = new Set(defs.map((card) => card.id))
      const seen = new Set()
      const out = []
      if (Array.isArray(rawCards)) {
        for (const row of rawCards) {
          const id = row && typeof row.id === 'string' ? row.id : null
          if (!id || !known.has(id) || seen.has(id)) continue
          seen.add(id)
          out.push({ id, visible: row.visible !== false })
        }
      }
      for (const def of defs) {
        if (!seen.has(def.id)) out.push({ id: def.id, visible: true })
      }
      return out
    }

    /**
     * 读取 v2；v2 不存在时回退 v1（旧布局只有区块，卡片补默认值）。
     * 未知/重复区块丢弃，缺失的按默认顺序补在末尾；坏 JSON 直接退回默认。
     */
    function readLayout2() {
      const fallback = defaultLayout()
      let raw = null
      try {
        raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
        if (!raw) raw = localStorage.getItem(LEGACY_LAYOUT_STORAGE_KEY)
      } catch { return fallback }
      if (!raw) return fallback
      let parsed
      try { parsed = JSON.parse(raw) } catch { return fallback }
      if (!Array.isArray(parsed)) return fallback
      const seen = new Set()
      const out = []
      for (const row of parsed) {
        const id = row && typeof row.id === 'string' ? row.id : null
        if (!id || seen.has(id) || !SECTION_META[id]) continue
        seen.add(id)
        out.push({
          id,
          visible: row.visible !== false,
          cards: sanitizeCards(id, row.cards),
        })
      }
      for (const id of BASE_SECTION_IDS) {
        if (!seen.has(id)) {
          out.push({ id, visible: true, cards: defaultCards(id) })
        }
      }
      return out.length ? out : fallback
    }

    function writeLayout2(layout) {
      try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout.map((row) => ({
          id: row.id,
          visible: row.visible !== false,
          cards: (Array.isArray(row.cards) ? row.cards : []).map((card) => ({
            id: card.id,
            visible: card.visible !== false,
          })),
        }))))
      } catch { /* 隐私模式/配额满：只影响记忆，不影响当前会话 */ }
    }

    /** 恢复默认时同时清掉 v1，避免以后误以为旧布局还在 */
    function clearLegacyLayout() {
      try { localStorage.removeItem(LEGACY_LAYOUT_STORAGE_KEY) } catch { /* ignore */ }
    }

    const sectionRowOf = (layout, sectionId) => layout.find((row) => row.id === sectionId)

    /** 读取某板块的卡片顺序；数据损坏时回退默认顺序 */
    function cardsOf(layout, sectionId) {
      const row = sectionRowOf(layout, sectionId)
      return row && Array.isArray(row.cards) && row.cards.length ? row.cards : defaultCards(sectionId)
    }

    /**
     * 纯函数：隐藏 / 追加 / 拖拽排序（区块级）。
     * 行对象整体搬移，cards 字段保持不变。
     */
    function hideInLayout(layout, id) {
      if (!SECTION_META[id]) return layout
      const index = layout.findIndex((row) => row.id === id)
      if (index < 0 || layout[index].visible === false) return layout
      const next = layout.slice()
      next[index] = { ...layout[index], visible: false }
      return next
    }

    /** 追加到可见顺序末尾：把行移到完整数组末尾并置为可见 */
    function appendToLayout(layout, id) {
      if (!SECTION_META[id]) return layout
      const row = sectionRowOf(layout, id)
      if (!row) return layout
      return [...layout.filter((item) => item.id !== id), { ...row, visible: true }]
    }

    /**
     * 新区块按默认顺序插入：放在默认顺序里它后面第一个已有区块之前。
     * 用于 plan / womens 这类「条件可用」的区块迁移，避免一律追加到末尾。
     */
    function insertSectionByDefault(layout, id) {
      if (!SECTION_META[id] || sectionRowOf(layout, id)) return layout
      const defIndex = SECTION_IDS.indexOf(id)
      const at = layout.findIndex((row) => SECTION_IDS.indexOf(row.id) > defIndex)
      const next = layout.slice()
      next.splice(at < 0 ? next.length : at, 0, {
        id,
        visible: true,
        cards: defaultCards(id),
      })
      return next
    }

    /**
     * 把 id 移到可见序列的 at 位置（0..visibleCount，表示插到第 at 个可见区块之前）。
     * 隐藏区块在完整数组里的相对位置尽量保持不动：锚点取目标可见区块在完整数组中的下标。
     */
    function reorderLayout(layout, id, at) {
      const visibleRows = layout.filter((row) => row.visible !== false)
      const fromVisible = visibleRows.findIndex((row) => row.id === id)
      if (fromVisible < 0 || !Number.isFinite(at)) return layout
      let target = Math.max(0, Math.min(at, visibleRows.length))
      if (fromVisible < target) target -= 1
      if (target === fromVisible) return layout
      const fromIndex = layout.findIndex((row) => row.id === id)
      const anchorId = at < visibleRows.length ? visibleRows[at].id : null
      const anchorIndex = anchorId ? layout.findIndex((row) => row.id === anchorId) : layout.length
      const next = layout.slice()
      const [row] = next.splice(fromIndex, 1)
      next.splice(fromIndex < anchorIndex ? anchorIndex - 1 : anchorIndex, 0, row)
      return next
    }

    /** 对某板块的 cards 数组做不可变更新；mutate 返回 null 表示无变化 */
    function updateCards(layout, sectionId, mutate) {
      if (!CARD_META[sectionId]) return layout
      const index = layout.findIndex((row) => row.id === sectionId)
      if (index < 0) return layout
      const row = layout[index]
      const cards = cardsOf(layout, sectionId)
      const nextCards = mutate(cards.slice())
      if (!nextCards) return layout
      const next = layout.slice()
      next[index] = { ...row, cards: nextCards }
      return next
    }

    /** 隐藏某张卡片：只改 visible，数组位置不变 */
    function hideCard(layout, sectionId, cardId) {
      if (!CARD_META[sectionId]?.[cardId]) return layout
      return updateCards(layout, sectionId, (cards) => {
        const index = cards.findIndex((card) => card.id === cardId)
        if (index < 0 || cards[index].visible === false) return null
        cards[index] = { ...cards[index], visible: false }
        return cards
      })
    }

    /** 显示某张卡片：移到可见顺序末尾并置为可见 */
    function showCard(layout, sectionId, cardId) {
      if (!CARD_META[sectionId]?.[cardId]) return layout
      return updateCards(layout, sectionId, (cards) => {
        const index = cards.findIndex((card) => card.id === cardId)
        if (index < 0) return null
        if (cards[index].visible !== false && index === cards.length - 1) return null
        const [row] = cards.splice(index, 1)
        cards.push({ ...row, visible: true })
        return cards
      })
    }

    /**
     * 在同一板块内移动卡片：fromVisibleIdx / toVisibleIdx 都是「可见卡片序列」的下标，
     * toVisibleIdx 是插入位置（0..visibleCount）。隐藏卡片的相对位置尽量保持不动。
     */
    function moveCard(layout, sectionId, fromVisibleIdx, toVisibleIdx) {
      if (!CARD_META[sectionId]) return layout
      return updateCards(layout, sectionId, (cards) => {
        const visible = cards.filter((card) => card.visible !== false)
        if (!Number.isFinite(fromVisibleIdx) || fromVisibleIdx < 0 || fromVisibleIdx >= visible.length) {
          return null
        }
        if (!Number.isFinite(toVisibleIdx)) return null
        let target = Math.max(0, Math.min(toVisibleIdx, visible.length))
        if (fromVisibleIdx < target) target -= 1
        if (target === fromVisibleIdx) return null
        const fromId = visible[fromVisibleIdx].id
        const anchorId = toVisibleIdx < visible.length ? visible[toVisibleIdx].id : null
        const fromIndex = cards.findIndex((card) => card.id === fromId)
        const anchorIndex = anchorId ? cards.findIndex((card) => card.id === anchorId) : cards.length
        const [row] = cards.splice(fromIndex, 1)
        cards.splice(fromIndex < anchorIndex ? anchorIndex - 1 : anchorIndex, 0, row)
        return cards
      })
    }

    /** 编辑态内容锁：卡片工具（⠿ / ×）必须放行，其余点击一律拦掉 */
    function lockSlotContent(e) {
      const target = e.target
      if (target && typeof target.closest === 'function'
        && (target.closest('.gp-card-tools') || target.closest('.gp-card-add'))) return
      e.preventDefault()
      e.stopPropagation()
    }

    /* ---------------------------------------------------------------- *
     * 小组件
     * ---------------------------------------------------------------- */
    function Row({ lab, val, pct, color }) {
      return h('div', { className: 'gp-row' },
        h('span', { className: 'lab' }, lab),
        h('span', { className: 'val' }, val),
        h('div', { className: 'gp-bar' },
          h('i', { style: { width: `${clampPct(pct)}%`, background: color || 'var(--gp-blue)' } })))
    }

    function Spark({ points, color }) {
      const max = Math.max(1, ...points)
      const min = Math.min(...points)
      const span = Math.max(1e-6, max - min)
      const W = 56, H = 24
      const pts = points
        .map((v, i) => `${(i / Math.max(1, points.length - 1)) * W},${H - ((v - min) / span) * (H - 4) - 2}`)
        .join(' ')
      return h('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: { display: 'block' } },
        h('polyline', { points: pts, fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' }))
    }

    function StepsRing({ value, goal }) {
      const pct = goal ? clampPct((value / goal) * 100) : 0
      const R = 33, C = 2 * Math.PI * R
      return h('svg', { width: 88, height: 88, viewBox: '0 0 88 88' },
        h('circle', { cx: 44, cy: 44, r: R, fill: 'none', stroke: 'var(--gp-card2)', strokeWidth: 7 }),
        h('circle', {
          cx: 44, cy: 44, r: R, fill: 'none', stroke: 'var(--gp-green)', strokeWidth: 7,
          strokeLinecap: 'round', strokeDasharray: C, strokeDashoffset: C * (1 - pct / 100),
          transform: 'rotate(-90 44 44)',
        }),
        h('text', { x: 44, y: 42, textAnchor: 'middle', fontSize: 14, fontWeight: 700, fill: 'var(--gp-t1)' }, fmt(value)),
        h('text', { x: 44, y: 55, textAnchor: 'middle', fontSize: 8.5, fill: 'var(--gp-t3)' }, `/ ${fmt(goal)} 步`))
    }

    function SleepChart({ data }) {
      if (!data || !data.nights || !data.nights.length) {
        return h('div', { className: 'gp-empty' }, h('b', null, '最近没有睡眠记录'), ' — Garmin 未同步到睡眠数据')
      }
      const nights = data.nights
      const W = 940, H = 170, padL = 26, padB = 36, padT = 10
      const bw = (W - padL - 6) / nights.length
      const maxH = 9
      const y = (v) => padT + (H - padT - padB) * (1 - v / maxH)
      const bars = nights.map((n, i) => {
        const total = (n.deep || 0) + (n.light || 0) + (n.rem || 0) + (n.awakeSec || 0) / 36
        if (!total) return null
        const scale = (H - padT - padB) / Math.max(total, 1)
        const x = padL + i * bw + bw * 0.22
        const w = bw * 0.56
        let top = H - padB
        const segs = [
          ['var(--gp-green)', (n.deep || 0) * scale],
          ['var(--gp-blue)', (n.light || 0) * scale],
          ['var(--gp-violet)', (n.rem || 0) * scale],
          ['var(--gp-t3)', ((n.awakeSec || 0) / 3600) * scale],
        ]
        return h('g', { key: n.date },
          ...segs.map(([c, hh], k) => {
            if (!hh) return null
            top -= hh
            return h('rect', { key: k, x, y: top, width: w, height: Math.max(1, hh), fill: c, rx: 1.5 })
          }),
          h('text', { x: x + w / 2, y: H - 20, textAnchor: 'middle', fontSize: 9, fill: 'var(--gp-t3)' }, n.date.slice(5)),
          h('text', { x: x + w / 2, y: H - 9, textAnchor: 'middle', fontSize: 9, fill: 'var(--gp-t3)' },
            typeof n.hours === 'number' ? `${n.hours.toFixed(1)}h` : ''),
          typeof n.score === 'number'
            ? h('text', { x: x + w / 2, y: y(n.hours || 0) - 6, textAnchor: 'middle', fontSize: 9, fill: 'var(--gp-green)' }, n.score)
            : null)
      })
      const scoreLine = nights
        .map((n, i) => (typeof n.hours === 'number'
          ? `${padL + i * bw + bw / 2},${y(n.hours)}`
          : null))
        .filter(Boolean)
        .join(' ')
      return h('div', null,
        h('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, preserveAspectRatio: 'none' },
          [0, 3, 6, 9].map((v) => h('g', { key: v },
            h('line', { x1: padL, x2: W - 6, y1: y(v), y2: y(v), stroke: 'var(--gp-line2)' }),
            h('text', { x: 2, y: y(v) + 3, fontSize: 9, fill: 'var(--gp-t3)' }, `${v}h`))),
          scoreLine ? h('polyline', { points: scoreLine, fill: 'none', stroke: 'var(--gp-green)', strokeWidth: 1.4, strokeDasharray: '4 3' }) : null,
          bars),
        h('div', { className: 'gp-mini', style: { display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' } },
          h('span', null, '■ 深睡'), h('span', { style: { color: 'var(--gp-t3)' } }, '■ 浅睡'),
          h('span', { style: { color: 'var(--gp-violet)' } }, '■ REM'),
          h('span', null,
            `均分 ${fmt(data.avgScore)} · 均时长 ${data.avgHours ?? '—'}h`)))
    }

    function LoadChart({ data }) {
      if (!data || !data.series || !data.series.length) {
        return h('div', { className: 'gp-empty' }, h('b', null, '没有训练负荷数据'))
      }
      const series = data.series
      const W = 940, H = 180, padL = 30, padB = 26, padT = 10
      const maxV = Math.max(100, ...series.map((d) => Math.max(d.atl || 0, d.ctl || 0)))
      const x = (i) => padL + (i / Math.max(1, series.length - 1)) * (W - padL - 8)
      const y = (v) => padT + (H - padT - padB) * (1 - (v || 0) / maxV)
      const line = (key) => series.map((d, i) => `${x(i)},${y(d[key])}`).join(' ')
      return h('div', null,
        h('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, preserveAspectRatio: 'none' },
          [0, 0.5, 1].map((f) => h('g', { key: f },
            h('line', { x1: padL, x2: W - 8, y1: y(maxV * f), y2: y(maxV * f), stroke: 'var(--gp-line2)' }),
            h('text', { x: 2, y: y(maxV * f) + 3, fontSize: 9, fill: 'var(--gp-t3)' }, Math.round(maxV * f)))),
          h('polyline', { points: line('ctl'), fill: 'none', stroke: 'var(--gp-violet)', strokeWidth: 2 }),
          h('polyline', { points: line('atl'), fill: 'none', stroke: 'var(--gp-blue)', strokeWidth: 2 }),
          h('text', { x: padL, y: H - 6, fontSize: 9, fill: 'var(--gp-t3)' }, series[0].date.slice(5)),
          h('text', { x: W - 8, y: H - 6, fontSize: 9, fill: 'var(--gp-t3)', textAnchor: 'end' },
            series[series.length - 1].date.slice(5))),
        h('div', { className: 'gp-mini', style: { display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' } },
          h('span', { style: { color: 'var(--gp-blue)' } },
            `● ATL ${fmt(data.current?.atl)}`),
          h('span', { style: { color: 'var(--gp-violet)' } },
            `● CTL ${fmt(data.current?.ctl)}`),
          h('span', { style: { color: 'var(--gp-red)' } },
            `● TSB ${fmt(data.current?.tsb)}`),
          h('span', { style: { marginLeft: 'auto' } },
            `ACWR ${fmt(data.current?.acwr, 1)} ${data.current?.acwrStatus || ''}`)))
    }

    /* ---------------------------------------------------------------- *
     * 今日状态：5 张图形化 KPI
     * 图形主导、数字补充；全部内联 SVG，颜色取自 --gp-* token
     * ---------------------------------------------------------------- */
    const scoreColor = (v) =>
      (v >= 70 ? 'var(--gp-green)' : v >= 40 ? 'var(--gp-amber)' : 'var(--gp-red)')

    /** 极坐标 → SVG 坐标（0° 在右，顺时针，与 SVG 的 y 轴向下一致） */
    function polar(cx, cy, r, deg) {
      const a = (deg * Math.PI) / 180
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
    }

    /** 从 fromDeg 顺时针画到 toDeg 的圆弧路径 */
    function arcPath(cx, cy, r, fromDeg, toDeg) {
      const [x0, y0] = polar(cx, cy, r, fromDeg)
      const [x1, y1] = polar(cx, cy, r, toDeg)
      const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0
      return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
    }

    /** 训练准备度：270° 弧形仪表（轨道 + 分值弧 + 中心分数 + 等级） */
    function ReadinessGauge({ score, level }) {
      const n = numOf(score)
      const has = n !== null
      const value = has ? clampPct(n) : 0
      const color = has ? scoreColor(value) : 'var(--gp-t3)'
      const cx = 50
      const cy = 52
      const r = 38
      const START = 135
      const SWEEP = 270
      const ticks = [0, 25, 50, 75, 100].map((t) => {
        const deg = START + (SWEEP * t) / 100
        const [x1, y1] = polar(cx, cy, r + 7, deg)
        const [x2, y2] = polar(cx, cy, r + 11, deg)
        return h('line', {
          key: `t${t}`, x1, y1, x2, y2,
          stroke: 'var(--gp-line)', strokeWidth: 1.4, strokeLinecap: 'round',
        })
      })
      return h('svg', {
        viewBox: '0 0 100 100',
        preserveAspectRatio: 'xMidYMid meet',
        role: 'img',
        'aria-label': has ? `训练准备度 ${value} 分` : '训练准备度暂无数据',
        style: { height: 88, width: '100%' },
      },
        h('path', {
          d: arcPath(cx, cy, r, START, START + SWEEP),
          fill: 'none', stroke: 'var(--gp-card2)', strokeWidth: 9, strokeLinecap: 'round',
        }),
        has && value > 0
          ? h('path', {
              d: arcPath(cx, cy, r, START, START + (SWEEP * value) / 100),
              fill: 'none', stroke: color, strokeWidth: 9, strokeLinecap: 'round',
            })
          : null,
        ticks,
        h('text', {
          x: cx, y: cy + 8, textAnchor: 'middle', fontSize: 27, fontWeight: 700,
          fill: has ? 'var(--gp-t1)' : 'var(--gp-t3)',
          style: { fontVariantNumeric: 'tabular-nums' },
        }, has ? fmt(value) : '—'),
        h('text', {
          x: cx, y: cy + 23, textAnchor: 'middle', fontSize: 10.5,
          fill: has ? color : 'var(--gp-t3)', letterSpacing: 0.3,
        }, has ? (LEVEL_ZH[level] || String(level || '')) : ''))
    }

    /** 睡眠评分：外圈评分环 + 内侧三段细弧（深睡 / REM / 其余） */
    function SleepDonut({ score, qualifier, deepPct, remPct }) {
      const n = numOf(score)
      const has = n !== null
      const pct = has ? clampPct(n) : 0
      const R = 40
      const C = 2 * Math.PI * R
      const deep = Math.min(100, Math.max(0, numOf(deepPct) ?? 0))
      const rem = Math.min(100 - deep, Math.max(0, numOf(remPct) ?? 0))
      const segs = []
      let cursor = -90
      const push = (share, color, key) => {
        const span = Math.min(Math.max(0, share), 100) * 3.6
        if (span <= 0.01) return
        segs.push(h('path', {
          key, d: arcPath(50, 50, 28, cursor, cursor + span),
          fill: 'none', stroke: color, strokeWidth: 3.4,
        }))
        cursor += span
      }
      push(deep, 'var(--gp-green)', 'deep')
      push(rem, 'var(--gp-violet)', 'rem')
      push(100 - deep - rem, 'color-mix(in srgb, var(--gp-t3) 42%, transparent)', 'rest')
      return h('svg', {
        viewBox: '0 0 100 100', preserveAspectRatio: 'xMidYMid meet', role: 'img',
        'aria-label': has
          ? `睡眠评分 ${pct} 分，深睡 ${fmt(deep)}%，REM ${fmt(rem)}%`
          : '睡眠评分暂无数据',
        style: { height: 78, width: '100%' },
      },
        h('title', null, '外圈：睡眠评分（0-100）；内圈：深睡 / REM / 其余 占比'),
        h('circle', { cx: 50, cy: 50, r: R, fill: 'none', stroke: 'var(--gp-card2)', strokeWidth: 7 }),
        has && pct > 0
          ? h('circle', {
              cx: 50, cy: 50, r: R, fill: 'none', stroke: scoreColor(pct), strokeWidth: 7,
              strokeLinecap: 'round', strokeDasharray: C, strokeDashoffset: C * (1 - pct / 100),
              transform: 'rotate(-90 50 50)',
            })
          : null,
        segs,
        h('text', {
          x: 50, y: 50, textAnchor: 'middle', dominantBaseline: 'middle',
          fontSize: 21, fontWeight: 700, fill: has ? 'var(--gp-t1)' : 'var(--gp-t3)',
          style: { fontVariantNumeric: 'tabular-nums' },
        }, has ? fmt(pct) : '—'),
        h('text', {
          x: 50, y: 65, textAnchor: 'middle', fontSize: 9,
          fill: has ? scoreColor(pct) : 'var(--gp-t3)',
        }, has ? (LEVEL_ZH[qualifier] || String(qualifier || '')) : ''))
    }

    /** Body Battery：电池外形，填充宽度 = 当前电量；旁边是充 / 耗数字 */
    function BatteryGauge({ current, charged, drained, height = 62 }) {
      const v = numOf(current)
      const has = v !== null
      const pct = has ? clampPct(v) : 0
      const color = has
        ? (v >= 60 ? 'var(--gp-green)' : v >= 30 ? 'var(--gp-amber)' : 'var(--gp-red)')
        : 'var(--gp-t3)'
      const innerX = 10.5
      const innerY = 18.5
      const innerW = 103
      const innerH = 35
      const charge = numOf(charged)
      const drain = numOf(drained)
      return h(React.Fragment, null,
        h('svg', {
          viewBox: '0 0 140 72', preserveAspectRatio: 'xMidYMid meet', role: 'img',
          'aria-label': has ? `Body Battery ${pct} / 100` : 'Body Battery 暂无数据',
          style: { height, width: '100%', minWidth: 0, flex: '1 1 auto' },
        },
          h('rect', {
            x: 6, y: 14, width: 112, height: 44, rx: 10,
            fill: 'none', stroke: 'var(--gp-line)', strokeWidth: 1.6,
          }),
          h('rect', { x: 119.5, y: 28, width: 6, height: 16, rx: 2.5, fill: 'var(--gp-line)' }),
          has && pct > 0
            ? h('rect', {
                x: innerX, y: innerY, width: (innerW * pct) / 100, height: innerH,
                rx: 6, fill: color, opacity: 0.9,
              })
            : null,
          [0, 25, 50, 75, 100].map((t) => h('line', {
            key: `t${t}`,
            x1: innerX + (innerW * t) / 100, x2: innerX + (innerW * t) / 100,
            y1: 61.5, y2: 65.5,
            stroke: 'var(--gp-line)', strokeWidth: 1.2, strokeLinecap: 'round',
          })),
          h('text', {
            x: 62, y: 41, textAnchor: 'middle', dominantBaseline: 'middle',
            fontSize: 16, fontWeight: 700, fill: has ? 'var(--gp-t1)' : 'var(--gp-t3)',
            style: { fontVariantNumeric: 'tabular-nums' },
          }, has ? fmt(pct) : '—')),
        h('div', { className: 'bat-side' },
          charge !== null ? h('span', { className: 'up' }, `充 +${fmt(charge)}`) : null,
          drain !== null ? h('span', { className: 'dn' }, `耗 −${fmt(drain)}`) : null))
    }

    /** 静息心率相对 7 日均值的变化：更低更好，等值显示持平 */
    function rhrDelta(value, avg7) {
      const now = numOf(value)
      const avg = numOf(avg7)
      if (now === null || avg === null) return null
      const diff = now - avg
      if (!diff) return h('span', { className: 'delta flat' }, '持平')
      const good = diff < 0
      return h('span', { className: `delta ${good ? 'good' : 'bad'}` },
        `${good ? '↓' : '↑'}${fmt(Math.abs(diff))}`)
    }

    /** 静息心率：近 8 天迷你折线 + 今天高亮 + 7 日均基准线 */
    function RhrTrend({ value, avg7, series }) {
      const now = numOf(value)
      const avg = numOf(avg7)
      const pts = (Array.isArray(series) ? series : [])
        .map((row) => ({ v: numOf(row?.value) }))
        .filter((row) => row.v !== null)
      const W = 190
      const H = 46
      const PAD = 7
      if (!pts.length) {
        return h('svg', {
          viewBox: `0 0 ${W} ${H}`, 'aria-hidden': true,
          style: { height: H, width: '100%' },
        }, h('line', {
          x1: PAD, x2: W - PAD, y1: H / 2, y2: H / 2,
          stroke: 'var(--gp-line2)', strokeDasharray: '3 3',
        }))
      }
      const values = pts.map((row) => row.v)
      const lo = Math.min(...values, avg ?? Infinity) - 1.5
      const hi = Math.max(...values, avg ?? -Infinity) + 1.5
      const span = Math.max(1, hi - lo)
      const px = (i) => PAD + (i / Math.max(1, pts.length - 1)) * (W - PAD * 2)
      const py = (v) => PAD + (1 - (v - lo) / span) * (H - PAD * 2)
      const color = now === null || avg === null
        ? 'var(--gp-blue)'
        : now <= avg ? 'var(--gp-green)' : now <= avg + 3 ? 'var(--gp-amber)' : 'var(--gp-red)'
      const last = pts[pts.length - 1]
      return h('svg', {
        viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', role: 'img',
        'aria-label': `近 ${pts.length} 天静息心率趋势：今天 ${fmt(now)} bpm，7 日均值 ${fmt(avg)}`,
        style: { height: H, width: '100%', overflow: 'visible' },
      },
        h('title', null, '折线：近 8 天静息心率；虚线：7 日均值；高亮圆点：今天'),
        avg !== null
          ? h('line', {
              x1: PAD, x2: W - PAD, y1: py(avg), y2: py(avg),
              stroke: 'var(--gp-line)', strokeDasharray: '3 3',
            })
          : null,
        h('polyline', {
          points: pts.map((row, i) => `${px(i)},${py(row.v)}`).join(' '),
          fill: 'none', stroke: color, strokeWidth: 1.8,
          strokeLinejoin: 'round', strokeLinecap: 'round',
        }),
        h('circle', { cx: px(pts.length - 1), cy: py(last.v), r: 6.5, fill: color, opacity: 0.16 }),
        h('circle', { cx: px(pts.length - 1), cy: py(last.v), r: 3.2, fill: color }))
    }

    /** 本周强度分钟：朝 150 分钟目标推进的圆环 */
    function IntensityRing({ total, goal }) {
      const n = numOf(total)
      const has = n !== null
      const g = numOf(goal) || 150
      const pct = clampPct(((n ?? 0) / g) * 100)
      const R = 40
      const C = 2 * Math.PI * R
      const color = pct >= 100 ? 'var(--gp-green)' : 'var(--gp-amber)'
      return h('svg', {
        viewBox: '0 0 100 100', preserveAspectRatio: 'xMidYMid meet', role: 'img',
        'aria-label': has ? `本周强度分钟 ${fmt(n)} / ${fmt(g)}` : '本周强度分钟暂无数据',
        style: { height: 78, width: '100%' },
      },
        h('circle', { cx: 50, cy: 50, r: R, fill: 'none', stroke: 'var(--gp-card2)', strokeWidth: 8 }),
        has && pct > 0
          ? h('circle', {
              cx: 50, cy: 50, r: R, fill: 'none', stroke: color, strokeWidth: 8,
              strokeLinecap: 'round', strokeDasharray: C, strokeDashoffset: C * (1 - pct / 100),
              transform: 'rotate(-90 50 50)',
            })
          : null,
        h('text', {
          x: 50, y: 50, textAnchor: 'middle', dominantBaseline: 'middle',
          fontSize: 22, fontWeight: 700, fill: has ? 'var(--gp-t1)' : 'var(--gp-t3)',
          style: { fontVariantNumeric: 'tabular-nums' },
        }, has ? fmt(n) : '—'),
        h('text', {
          x: 50, y: 64, textAnchor: 'middle', fontSize: 8.5, fill: 'var(--gp-t3)',
        }, `/ ${fmt(g)} 分钟`))
    }

    /* ---------------------------------------------------------------- *
     * 活动详情抽屉
     * 数据按需拉取；组件卸载即丢弃，不引入全局状态
     * ---------------------------------------------------------------- */
    const SPORT_ZH = {
      road_biking: '公路骑行', cycling: '骑行', mountain_biking: '山地骑行',
      gravel_cycling: '砾石骑行', indoor_cycling: '室内骑行', virtual_ride: '虚拟骑行',
      running: '跑步', trail_running: '越野跑', treadmill_running: '跑步机', track_running: '场地跑',
      walking: '步行', hiking: '徒步', lap_swimming: '泳池游泳', open_water_swimming: '公开水域游泳',
      strength_training: '力量训练', yoga: '瑜伽', pilates: '普拉提', meditation: '冥想',
      rowing: '划船', kayaking: '皮划艇', canoeing: '独木舟', paddleboarding: '桨板',
      skiing: '滑雪', snowboarding: '单板滑雪', golf: '高尔夫',
    }
    const ZONE_COLORS = ['var(--gp-green)', 'var(--gp-blue)', 'var(--gp-violet)', 'var(--gp-amber)', 'var(--gp-red)']

    const zoneTime = (sec) => {
      if (typeof sec !== 'number' || !isFinite(sec)) return '—'
      const total = Math.max(0, Math.round(sec))
      const hh = Math.floor(total / 3600)
      const mm = Math.floor((total % 3600) / 60)
      const ss = total % 60
      return hh
        ? `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
        : `${mm}:${String(ss).padStart(2, '0')}`
    }
    const paceText = (mps) => {
      if (typeof mps !== 'number' || !isFinite(mps) || mps <= 0.2) return null
      const total = Math.round(1000 / mps)
      return `${Math.floor(total / 60)}'${String(total % 60).padStart(2, '0')}"/km`
    }
    const speedText = (mps) =>
      typeof mps === 'number' && isFinite(mps) ? `${fmt(mps * 3.6, 1)} km/h` : null
    const whenText = (value) => {
      const text = String(value ?? '')
      if (!text) return ''
      return text.replace('T', ' ').slice(0, 16)
    }

    /**
     * 活动轨迹地图：有底图时显示静态地图（后端把轨迹画在图上），
     * 加载中 / 不可用时退回原来的离线 SVG 轨迹。
     * basemap 由 ActivityDrawer 的 useStaticMap 提供；onZoom 打开 720px 浮层。
     */
    function TrackMap({ points, basemap = null, onZoom = null, wrapRef = null }) {
      const [failedUrl, setFailedUrl] = React.useState(null)
      const map = basemap && typeof basemap === 'object' ? basemap : null
      const url = map && map.url && map.url !== failedUrl ? map.url : null
      if (!Array.isArray(points) || points.length < 2) return null
      const W = 560
      const H = 220
      const PAD = 12
      const lats = points.map((p) => p[0])
      const lons = points.map((p) => p[1])
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLon = Math.min(...lons)
      const maxLon = Math.max(...lons)
      const midLat = (minLat + maxLat) / 2
      // 经度按中纬度余弦压缩，避免高纬度轨迹被拉宽
      const kx = Math.max(1e-6, Math.cos((midLat * Math.PI) / 180))
      const spanX = Math.max(1e-9, (maxLon - minLon) * kx)
      const spanY = Math.max(1e-9, maxLat - minLat)
      const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY)
      const padX = (W - spanX * scale) / 2
      const padY = (H - spanY * scale) / 2
      const px = (lon) => padX + (lon - minLon) * kx * scale
      const py = (lat) => H - padY - (lat - minLat) * scale // Y 翻转：北上
      const pts = points
        .map((p) => `${px(p[1]).toFixed(1)},${py(p[0]).toFixed(1)}`)
        .join(' ')
      return h('div', { className: 'gp-detail-mapwrap', 'data-gp-map-wrap': '1', ref: wrapRef || undefined },
        url
          ? h('img', {
              className: 'gp-detail-map gp-detail-map-img',
              src: url,
              alt: '活动轨迹地图',
              draggable: false,
              'data-gp-basemap': '1',
              onError: () => setFailedUrl(url),
            })
          : h('svg', {
              className: 'gp-detail-map',
              viewBox: `0 0 ${W} ${H}`,
              preserveAspectRatio: 'xMidYMid meet',
              role: 'img',
              'aria-label': '离线轨迹（无底图）',
            }, h('polyline', {
              points: pts,
              fill: 'none',
              stroke: 'var(--gp-green)',
              strokeWidth: 2,
              strokeLinejoin: 'round',
              strokeLinecap: 'round',
            })),
        url && onZoom
          ? h('button', {
              type: 'button',
              className: 'gp-map-zoom',
              title: '放大地图',
              'data-gp-map-zoom': '1',
              onClick: () => onZoom(url),
            }, '放大')
          : null,
        url
          ? h('a', {
              className: 'gp-map-attr',
              href: 'https://www.amap.com/',
              target: '_blank',
              rel: 'noreferrer noopener',
              title: '高德地图',
              'data-gp-map-attribution': '1',
              onClick: (event) => event.stopPropagation(),
            }, '高德地图')
          : null)
    }

    /** 海拔序列归一化：[{d,e}] / [e…] / [{distanceM,elevationM}]；d 单位米 */
    function elevRowsOf(rows, totalDistanceM = null) {
      const list = Array.isArray(rows) ? rows : []
      const out = []
      list.forEach((row, index) => {
        let d = null
        let e = null
        if (Array.isArray(row)) {
          d = numOf(row[0])
          e = numOf(row[1])
        } else if (typeof row === 'number' || typeof row === 'string') {
          e = numOf(row)
        } else if (row && typeof row === 'object') {
          e = numOf(row.e, row.ele, row.elevationM, row.elevation, row.alt, row.altitude)
          d = numOf(row.d, row.distanceM, row.dist, row.distance)
        }
        if (e === null) return
        out.push({ i: index, d, e })
      })
      if (out.length < 2) return []
      const allD = out.every((r) => r.d !== null)
      const span = Math.max(1, out.length - 1)
      const total = numOf(totalDistanceM)
      const fallback = total !== null && total > 0 ? total : span
      return out.map((r) => ({
        d: allD ? r.d : (r.i / span) * fallback,
        e: r.e,
      }))
    }

    /** 大剖面降采样（只影响绘制/悬停，统计仍用原始序列） */
    function elevSample(rows, max = 320) {
      if (rows.length <= max) return rows
      const step = rows.length / max
      const out = []
      for (let i = 0; i < max; i++) out.push(rows[Math.floor(i * step)])
      out.push(rows[rows.length - 1])
      return out
    }

    /**
     * 海拔剖面（TrackPreview / ActivityDrawer 共用）：
     * 面积 + 折线 + 左侧海拔轴（m）+ 底部距离轴（km）+ 爬升 / 最大坡度，
     * 鼠标或触摸悬停显示十字线与「12.4 km · 356 m」提示。
     * `rows` 支持 [{d,e}] / [e…] / [{distanceM,elevationM}]。
     */
    function ElevationProfile({
      rows,
      distanceM = null,
      height = 64,
      showStats = true,
      className = '',
      label = '海拔剖面',
    }) {
      const data = React.useMemo(() => elevRowsOf(rows, distanceM), [rows, distanceM])
      const [hover, setHover] = React.useState(null)
      const plotRef = React.useRef(null)
      const W = 240
      const H = 64
      const PAD = 3
      if (data.length < 2) return null
      const maxD = Math.max(1e-9, ...data.map((r) => r.d))
      const minE = Math.min(...data.map((r) => r.e))
      const maxE = Math.max(...data.map((r) => r.e))
      const spanE = Math.max(1e-6, maxE - minE)
      const px = (d) => PAD + (Math.max(0, Math.min(maxD, d)) / maxD) * (W - PAD * 2)
      const py = (e) => H - PAD - ((e - minE) / spanE) * (H - PAD * 2)

      let gain = 0
      let slope = null
      for (let i = 1; i < data.length; i++) {
        const dDelta = data[i].d - data[i - 1].d
        const eDelta = data[i].e - data[i - 1].e
        if (eDelta > 0) gain += eDelta
        if (dDelta >= 20 && eDelta > 0) {
          const pct = (eDelta / dDelta) * 100
          if (slope === null || pct > slope) slope = pct
        }
      }
      gain = Math.round(gain)
      const slopeRounded = slope === null ? null : Math.round(slope * 10) / 10

      const draw = elevSample(data)
      const pts = draw.map((r) => [px(r.d), py(r.e)])
      let line = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
      for (let i = 1; i < pts.length; i++) {
        line += `L${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`
      }
      const area = `${line}L${(W - PAD).toFixed(1)} ${(H - PAD).toFixed(1)}L${PAD.toFixed(1)} ${(H - PAD).toFixed(1)}Z`
      const totalText = maxD >= 1000 ? `${fmt(maxD / 1000, 1)} km` : `${Math.round(maxD)} m`
      const minText = `${Math.round(minE)} m`
      const maxText = `${Math.round(maxE)} m`
      const tipText = hover
        ? `${fmt(hover.d / 1000, 1)} km · ${Math.round(hover.e)} m`
        : ''
      const summary = `${label}：0–${totalText}，海拔 ${Math.round(minE)}–${Math.round(maxE)} m，累计爬升 ${gain} m${slopeRounded === null ? '' : `，最大坡度 ${slopeRounded}%`}`

      const locate = (event) => {
        const rect = plotRef.current && plotRef.current.getBoundingClientRect
          ? plotRef.current.getBoundingClientRect()
          : null
        if (!rect || !(rect.width > 0)) return null
        const frac = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
        const target = frac * maxD
        let best = draw[0]
        let delta = Math.abs(best.d - target)
        for (let i = 1; i < draw.length; i++) {
          const next = Math.abs(draw[i].d - target)
          if (next < delta) { best = draw[i]; delta = next }
        }
        return { d: best.d, e: best.e }
      }
      const onMove = (event) => {
        const point = locate(event)
        if (point) setHover(point)
      }
      const clearHover = () => setHover(null)

      return h('div', {
        className: `gp-elev${className ? ` ${className}` : ''}`,
        'data-gp-elev-chart': '1',
        'data-gp-elev-hover': hover ? `${Math.round(hover.d)},${Math.round(hover.e)}` : undefined,
      },
        h('div', { className: 'gp-elev-main' },
          h('div', { className: 'gp-elev-yaxis', 'aria-hidden': true },
            h('span', { className: 'gp-elev-y', 'data-gp-elev-y': 'max' }, maxText),
            h('span', { className: 'gp-elev-y', 'data-gp-elev-y': 'min' }, minText)),
          h('div', {
            className: 'gp-elev-plot',
            ref: plotRef,
            onPointerMove: onMove,
            onPointerDown: onMove,
            onPointerLeave: clearHover,
            onPointerCancel: clearHover,
            'data-gp-elev-plot': '1',
          },
            h('svg', {
              viewBox: `0 0 ${W} ${H}`,
              preserveAspectRatio: 'none',
              style: { display: 'block', width: '100%', height: `${height}px` },
              'data-gp-elev-svg': '1',
              role: 'img',
              'aria-label': summary,
            },
              h('title', null, summary),
              h('path', { d: area, fill: 'color-mix(in srgb, var(--gp-blue) 24%, transparent)' }),
              h('path', { d: line, fill: 'none', stroke: 'var(--gp-blue)', strokeWidth: 1.4 }),
              hover
                ? h('line', {
                    x1: px(hover.d).toFixed(1), y1: 0,
                    x2: px(hover.d).toFixed(1), y2: H,
                    stroke: 'var(--gp-t3)', strokeWidth: 1,
                    strokeDasharray: '2 2', vectorEffect: 'non-scaling-stroke',
                    'data-gp-elev-crosshair': '1',
                  })
                : null,
              hover
                ? h('circle', {
                    cx: px(hover.d).toFixed(1),
                    cy: py(hover.e).toFixed(1),
                    r: 2.4,
                    fill: 'var(--gp-blue)',
                    stroke: 'var(--gp-card)',
                    strokeWidth: 1,
                  })
                : null),
            hover
              ? h('div', {
                  className: 'gp-elev-tip',
                  style: { left: `${Math.max(10, Math.min(90, (px(hover.d) / W) * 100))}%` },
                  'data-gp-elev-tip': '1',
                }, tipText)
              : null)),
        h('div', { className: 'gp-elev-xaxis', 'aria-hidden': true },
          h('span', { 'data-gp-elev-x': '0' }, '0'),
          h('span', { 'data-gp-elev-x': 'total' }, totalText)),
        showStats
          ? h('div', { className: 'gp-elev-stats', 'data-gp-elev-stats': '1' },
              h('span', null, '爬升 ', h('b', null, `${gain} m`)),
              slopeRounded === null
                ? null
                : h('span', { 'data-gp-elev-slope': '1' }, '最大坡度 ', h('b', null, `${slopeRounded}%`)))
          : null)
    }

    function ElevationChart({ rows }) {
      return h(ElevationProfile, {
        rows,
        height: 80,
        className: 'gp-detail-elev',
        label: '活动海拔',
      })
    }

    function ZoneBars({ zones, unit }) {
      const max = Math.max(1, ...zones.map((z) => z.seconds))
      return h('div', { className: 'gp-detail-zones' }, zones.map((z) => h('div', {
        key: z.zone,
        className: 'gp-detail-zone',
      },
        h('span', { className: 'z' }, `Z${z.zone}`),
        h('div', { className: 'bar' },
          h('i', {
            style: {
              width: `${clampPct((z.seconds / max) * 100)}%`,
              background: ZONE_COLORS[(z.zone - 1) % ZONE_COLORS.length],
            },
          })),
        h('span', { className: 't' }, zoneTime(z.seconds)),
        h('span', { className: 'r' },
          z.low != null
            ? `${fmt(z.low, 0)}${z.high != null ? `–${fmt(z.high, 0)}` : '+'} ${unit}`
            : ''))))
    }

    /* ---------------------------------------------------------------- *
     * FIT 曲线：点击后才解析（慢），通道叠加、各自归一化后共用时间轴
     * ---------------------------------------------------------------- */
    const FIT_CHANNELS = [
      { key: 'hr', label: '心率', color: 'var(--gp-red)', value: (s) => numOf(s?.hr, s?.heart_rate, s?.heartRate) },
      { key: 'power', label: '功率', color: 'var(--gp-violet)', value: (s) => numOf(s?.power, s?.watts) },
      { key: 'cadence', label: '踏频', color: 'var(--gp-amber)', value: (s) => numOf(s?.cadence, s?.cad) },
      { key: 'speed', label: '速度', color: 'var(--gp-blue)', value: (s) => numOf(s?.speed, s?.velocity) },
      { key: 'alt', label: '海拔', color: 'var(--gp-green)', value: (s) => numOf(s?.alt, s?.altitude, s?.elevation) },
      { key: 'temp', label: '温度', color: '#e8734a', value: (s) => numOf(s?.temp, s?.temperature) },
    ]
    const FIT_CHANNEL_ALIASES = {
      hr: 'hr', heart_rate: 'hr', heartrate: 'hr', heart: 'hr', 心率: 'hr',
      power: 'power', watts: 'power', 功率: 'power',
      cadence: 'cadence', cad: 'cadence', 踏频: 'cadence', 步频: 'cadence',
      speed: 'speed', velocity: 'speed', 速度: 'speed',
      alt: 'alt', altitude: 'alt', elevation: 'alt', 海拔: 'alt',
      temp: 'temp', temperature: 'temp', 温度: 'temp',
    }
    const fitChannelKeyOf = (raw) => {
      const name = String(firstOf(raw?.key, raw?.name, raw?.channel, raw) ?? '').trim().toLowerCase()
      return FIT_CHANNEL_ALIASES[name] || null
    }
    const fitChannelDef = (key) => FIT_CHANNELS.find((row) => row.key === key) || null

    /** 可用通道 = 后端 channels ∩ 该通道确有数值；完全没有声明时按数据推断 */
    function fitChannelsOf(payload, samples) {
      const declared = Array.isArray(payload?.channels) ? payload.channels : []
      const keys = []
      for (const raw of declared) {
        const key = fitChannelKeyOf(raw)
        if (key && !keys.includes(key)) keys.push(key)
      }
      const candidates = keys.length ? keys : FIT_CHANNELS.map((row) => row.key)
      return candidates.filter((key) => {
        const def = fitChannelDef(key)
        return !!def && samples.some((row) => def.value(row) !== null)
      })
    }

    /** 原始样本可能上万条：等距抽稀到 ≤ max，最后一点必留 */
    function fitDownsample(samples, max = 240) {
      const rows = Array.isArray(samples) ? samples.filter((row) => row && typeof row === 'object') : []
      if (rows.length <= max) return rows
      const step = rows.length / max
      const out = []
      for (let i = 0; i < max; i++) out.push(rows[Math.floor(i * step)])
      out.push(rows[rows.length - 1])
      return out
    }

    function fitTimeText(sample) {
      const direct = firstOf(sample?.t, sample?.time)
      if (typeof direct === 'string' && direct) return direct.replace('T', ' ').slice(-8)
      const sec = numOf(direct, sample?.elapsed, sample?.seconds)
      if (sec === null) return ''
      const total = Math.max(0, Math.round(sec))
      const hh = Math.floor(total / 3600)
      const mm = Math.floor((total % 3600) / 60)
      const ss = total % 60
      return hh ? `${hh}:${pad2(mm)}:${pad2(ss)}` : `${mm}:${pad2(ss)}`
    }

    /** 多通道折线：每条线按自身 min–max 归一化，X 为样本序号（= 时间） */
    function FitChart({ samples, active }) {
      const W = 560
      const H = 160
      const PADX = 6
      const PADY = 8
      const rows = Array.isArray(samples) ? samples : []
      const n = rows.length
      const x = (i) => (n <= 1 ? W / 2 : PADX + (i / (n - 1)) * (W - PADX * 2))
      const defs = (Array.isArray(active) ? active : [])
        .map(fitChannelDef)
        .filter(Boolean)
      const series = defs.map((def) => {
        const values = rows.map((row) => def.value(row))
        const finite = values.filter((v) => v !== null)
        if (!finite.length) return { def, values: null }
        let lo = Math.min(...finite)
        let hi = Math.max(...finite)
        if (hi <= lo) { hi = lo + 1; lo -= 1 }
        const y = (v) => PADY + (1 - (v - lo) / (hi - lo)) * (H - PADY * 2)
        const segments = []
        let current = []
        values.forEach((v, i) => {
          if (v === null) {
            if (current.length) segments.push(current)
            current = []
            return
          }
          current.push([x(i), y(v)])
        })
        if (current.length) segments.push(current)
        return {
          def,
          min: Math.min(...finite),
          max: Math.max(...finite),
          segments,
        }
      }).filter((row) => row.segments && row.segments.length)

      return h(React.Fragment, null,
        h('svg', {
          className: 'gp-fit-chart',
          viewBox: `0 0 ${W} ${H}`,
          preserveAspectRatio: 'none',
          role: 'img',
          'data-gp-fit-chart': '1',
          'data-gp-fit-series-count': String(series.length),
          'aria-label': `FIT 曲线：${defs.map((def) => def.label).join(' / ') || '未选择通道'}`,
        },
          h('line', {
            x1: PADX, x2: W - PADX, y1: PADY, y2: PADY,
            stroke: 'var(--gp-line2)',
          }),
          h('line', {
            x1: PADX, x2: W - PADX, y1: H - PADY, y2: H - PADY,
            stroke: 'var(--gp-line2)',
          }),
          series.map((row) => row.segments.map((seg, i) => h('polyline', {
            key: `${row.def.key}-${i}`,
            'data-gp-fit-series': row.def.key,
            points: seg.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' '),
            fill: 'none',
            stroke: row.def.color,
            strokeWidth: 1.6,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
          })))),
        h('div', { className: 'gp-fit-legend' },
          series.map((row) => h('span', { key: row.def.key },
            h('i', { style: { background: row.def.color } }),
            `${row.def.label} ${fmt(row.min)}–${fmt(row.max)}`)),
          h('span', { style: { marginLeft: 'auto' } },
            `${fitTimeText(rows[0])} → ${fitTimeText(rows[n - 1])}`)))
    }

    /**
     * 抽屉里的「FIT 曲线」折叠块：默认收起，点「加载曲线」才解析，
     * 每次点击/重试都是一次独立请求，卸载时中断。
     */
    function FitCurves({ id, flow }) {
      const [open, setOpen] = React.useState(false)
      const [state, setState] = React.useState({ phase: 'idle' })
      const [active, setActive] = React.useState(null)
      const abortRef = React.useRef(null)
      const aliveRef = React.useRef(true)

      React.useEffect(() => () => {
        aliveRef.current = false
        try { abortRef.current?.abort() } catch { /* ignore */ }
      }, [])

      const load = React.useCallback(() => {
        if (abortRef.current) { try { abortRef.current.abort() } catch { /* ignore */ } }
        const controller = new AbortController()
        abortRef.current = controller
        setState({ phase: 'loading' })
        fetchJson(`activities/${encodeURIComponent(id)}/streams`, controller.signal)
          .then((data) => {
            if (!aliveRef.current || controller.signal.aborted) return
            if (data?.status === 'ok' && Array.isArray(data.samples) && data.samples.length) {
              const samples = fitDownsample(data.samples)
              const channels = fitChannelsOf(data, samples)
              const defaults = ['hr', 'alt'].filter((key) => channels.includes(key))
              const initial = defaults.length ? defaults : channels.slice(0, 1)
              setActive(initial)
              setState({ phase: 'ok', samples, channels, stats: data.stats || null })
            } else if (data?.status === 'advanced_required') {
              setState({ phase: 'advanced_required' })
            } else {
              setState({
                phase: 'unavailable',
                message: String(firstOf(data?.message, '这条活动没有可用的 FIT 曲线数据')),
              })
            }
          })
          .catch((err) => {
            if (!aliveRef.current || controller.signal.aborted) return
            if (err?.name === 'AbortError') return
            setState({
              phase: 'unavailable',
              message: `FIT 曲线加载失败：${String(err?.message ?? err)}`,
            })
          })
      }, [id])

      const toggleChannel = (key) => {
        setActive((prev) => {
          const list = Array.isArray(prev) ? prev : []
          if (list.includes(key)) {
            if (list.length === 1) return list
            return list.filter((item) => item !== key)
          }
          return FIT_CHANNELS.map((row) => row.key).filter((k) => list.includes(k) || k === key)
        })
      }

      let body = null
      if (state.phase === 'loading') {
        body = h('div', { className: 'gp-fit-muted', 'data-gp-fit-state': 'loading' },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { className: 'gp-spin', 'aria-hidden': true }),
            h('span', null, '正在解析 FIT…（约 5–15 秒）')),
          h('div', { style: { marginTop: 6 } }, '原始采样点较多，解析完成后会缓存这次结果。'))
      } else if (state.phase === 'ok') {
        const channels = Array.isArray(state.channels) ? state.channels : []
        const activeList = (Array.isArray(active) ? active : []).filter((key) => channels.includes(key))
        body = h('div', { 'data-gp-fit-state': 'ok', style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { className: 'gp-fit-chips' }, channels.map((key) => {
            const def = fitChannelDef(key)
            if (!def) return null
            const on = activeList.includes(key)
            return h('button', {
              key,
              type: 'button',
              className: `gp-fit-chip${on ? ' on' : ''}`,
              'data-gp-fit-toggle': key,
              'aria-pressed': on,
              title: `${on ? '隐藏' : '显示'}${def.label}`,
              onClick: () => toggleChannel(key),
            }, def.label)
          })),
          activeList.length
            ? h(FitChart, { samples: state.samples, active: activeList })
            : h('div', { className: 'gp-fit-muted' }, '至少选择一个通道'))
      } else if (state.phase === 'advanced_required') {
        body = h('div', { 'data-gp-fit-state': 'advanced_required', style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { className: 'gp-fit-muted' }, h('b', null, '需要进阶模式'), '：FIT 原始曲线来自 Garmin 账号登录，官方 Personal API 不提供。'),
          h(UnlockCard, { flow, id: 'fit', compact: true, hint: 'FIT 曲线' }))
      } else if (state.phase === 'unavailable') {
        body = h('div', { 'data-gp-fit-state': 'unavailable', style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { className: 'gp-fit-muted' }, state.message || '暂无 FIT 曲线'),
          h('div', { className: 'gp-fit-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn',
              'data-gp-fit-retry': '1',
              onClick: load,
            }, '重试')))
      } else {
        body = h('div', { 'data-gp-fit-state': 'idle', style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { className: 'gp-fit-muted' }, '把原始 FIT 采样点画成曲线（心率 / 功率 / 踏频 / 速度 / 海拔 / 温度）。解析较慢，约 5–15 秒，需要时再点。'),
          h('div', { className: 'gp-fit-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              'data-gp-fit-load': '1',
              onClick: load,
            }, '加载曲线')))
      }

      return h('div', { className: 'gp-fit', 'data-gp-fit-block': '1' },
        h('div', { className: 'gp-fit-hd' },
          h('b', null, 'FIT 曲线'),
          h('button', {
            type: 'button',
            className: 'gp-fit-toggle',
            'data-gp-fit-collapse': '1',
            'aria-expanded': open,
            onClick: () => setOpen((value) => !value),
          },
            open ? '收起' : '展开',
            h('span', { className: `caret${open ? ' up' : ''}`, 'aria-hidden': true }, '▾'))),
        open ? h('div', { className: 'gp-fit-body', 'data-gp-fit-body': '1' }, body) : null)
    }

    /* ---------------------------------------------------------------- *
     * 活动详情「深度分析」：默认收起，点「加载分析」才请求 analysis
     * ---------------------------------------------------------------- */
    const ANALYSIS_DURATION_LABELS = {
      5: '5s', 30: '30s', 60: '1m', 300: '5m', 600: '10m', 1200: '20m', 3600: '60m',
    }
    function analysisDurationLabel(sec) {
      const n = numOf(sec)
      if (n === null) return null
      return ANALYSIS_DURATION_LABELS[n] || (n >= 60 ? `${Math.round(n / 60)}m` : `${Math.round(n)}s`)
    }
    /** 兼容 {label,watts} 与 {sec,watts} 两种时长写法 */
    function pdcRowsOf(powerCurve) {
      const list = Array.isArray(powerCurve?.durations) ? powerCurve.durations : []
      return list.map((raw, i) => {
        const sec = numOf(raw?.sec)
        const watts = numOf(raw?.watts, raw?.power, raw?.value)
        const label = firstOf(raw?.label, analysisDurationLabel(sec), `#${i + 1}`)
        return { key: `${i}-${label}`, label: String(label), watts }
      }).filter((row) => row.watts !== null)
    }
    function driftRating(percent) {
      const value = numOf(percent)
      if (value === null) return null
      if (value < 5) return { text: '良好', cls: 'g' }
      if (value <= 10) return { text: '可接受', cls: 'a' }
      return { text: '偏高', cls: 'r' }
    }
    const SHIFT_ROWS = [
      { key: 'proactive', label: '主动变速', en: 'proactive', color: 'var(--gp-green)' },
      { key: 'reactive', label: '被动变速', en: 'reactive', color: 'var(--gp-amber)' },
      { key: 'coasting', label: '滑行', en: 'coasting', color: 'var(--gp-blue)' },
      { key: 'spunnedOut', label: '空转', en: 'spun out', color: 'var(--gp-red)' },
    ]
    function shiftValueOf(shifts, key) {
      if (!shifts || typeof shifts !== 'object') return null
      if (key === 'spunnedOut') return numOf(shifts.spunnedOut, shifts.spunOut, shifts.spun_out)
      return numOf(shifts[key])
    }

    function DeepAnalysis({ id, flow }) {
      const [open, setOpen] = React.useState(false)
      const [state, setState] = React.useState({ phase: 'idle' })
      const abortRef = React.useRef(null)
      const aliveRef = React.useRef(true)

      React.useEffect(() => () => {
        aliveRef.current = false
        try { abortRef.current?.abort() } catch { /* ignore */ }
      }, [])

      const load = React.useCallback(() => {
        if (abortRef.current) { try { abortRef.current.abort() } catch { /* ignore */ } }
        const controller = new AbortController()
        abortRef.current = controller
        setState({ phase: 'loading' })
        fetchJson(`activities/${encodeURIComponent(id)}/analysis`, controller.signal)
          .then((data) => {
            if (!aliveRef.current || controller.signal.aborted) return
            if (data?.status === 'ok') {
              setState({ phase: 'ok', data })
            } else if (data?.status === 'advanced_required') {
              setState({ phase: 'advanced_required' })
            } else {
              setState({
                phase: 'unavailable',
                message: String(firstOf(data?.message, '这条活动没有可用的深度分析')),
              })
            }
          })
          .catch((err) => {
            if (!aliveRef.current || controller.signal.aborted || err?.name === 'AbortError') return
            setState({
              phase: 'unavailable',
              message: `深度分析加载失败：${String(err?.message ?? err)}`,
            })
          })
      }, [id])

      let body = null
      if (state.phase === 'loading') {
        body = h('div', { className: 'gp-deep-muted', 'data-gp-deep-state': 'loading' },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { className: 'gp-spin', 'aria-hidden': true }),
            h('span', null, '正在分析…（约 10–30 秒）')),
          h('div', { style: { marginTop: 6 } }, '正在解析功率曲线、爬坡、心率漂移与电子变速。'))
      } else if (state.phase === 'ok') {
        const data = state.data && typeof state.data === 'object' ? state.data : {}
        const pdc = pdcRowsOf(data.powerCurve)
        const maxWatts = pdc.reduce((max, row) => Math.max(max, row.watts), 0)
        const climbs = Array.isArray(data.climbs) ? data.climbs : []
        const drift = numOf(data.hrDrift?.percent)
        const rating = driftRating(drift)
        const shifts = data.shifts && typeof data.shifts === 'object' ? data.shifts : null
        const shiftSum = SHIFT_ROWS.reduce((sum, row) => sum + (shiftValueOf(shifts, row.key) ?? 0), 0)
        const shiftTotal = numOf(shifts?.total) ?? (shifts ? shiftSum : null)

        body = h('div', {
          'data-gp-deep-state': 'ok',
          style: { display: 'flex', flexDirection: 'column', gap: 0 },
        },
          h('div', { className: 'gp-deep-sec', 'data-gp-deep-pdc': '1' },
            h('div', { className: 'gp-deep-h' }, '功率曲线（PDC）',
              h('span', { className: 'sp' }, pdc.length ? `${pdc.length} 个时长` : '')),
            pdc.length
              ? h('div', { className: 'gp-pdc', 'data-gp-pdc-count': String(pdc.length) },
                  pdc.map((row) => h('div', {
                    key: row.key,
                    className: 'gp-pdc-row',
                    'data-gp-pdc-bar': row.label,
                    'data-gp-pdc-watts': String(row.watts),
                  },
                    h('span', { className: 'lb' }, row.label),
                    h('div', { className: 'bar' },
                      h('i', {
                        style: {
                          width: `${maxWatts > 0 ? Math.max(4, (row.watts / maxWatts) * 100) : 0}%`,
                        },
                      })),
                    h('span', { className: 'v' }, `${fmt(row.watts)} W`))))
              : h('div', { className: 'gp-deep-muted', 'data-gp-deep-pdc-empty': '1' },
                  '无功率数据（需要功率计）')),

          h('div', {
            className: 'gp-deep-sec',
            'data-gp-deep-climbs': String(climbs.length),
          },
            h('div', { className: 'gp-deep-h' }, '爬坡',
              h('span', { className: 'sp' }, climbs.length ? `${climbs.length} 段` : '')),
            climbs.length
              ? h('div', { className: 'gp-climbs' }, climbs.map((row, i) => h('div', {
                  key: `${firstOf(row?.category, 'climb')}-${i}`,
                  className: 'gp-climb',
                  'data-gp-climb': String(firstOf(row?.category, '')),
                },
                  h('span', { className: 'cat' }, String(firstOf(row?.category, '—'))),
                  h('span', { className: 'm' },
                    `${fmt((numOf(row?.distanceM) ?? 0) / 1000, 2)} km`),
                  h('span', { className: 'x' }, `↑ ${fmt(row?.elevationGainM)} m`),
                  h('span', { className: 'x' }, `VAM ${fmt(row?.vam)}`),
                  h('span', { className: 'x wpkg' }, `${fmt(row?.wpkg, 2)} W/kg`))))
              : h('div', { className: 'gp-deep-muted' }, '未记录爬坡')),

          h('div', { className: 'gp-deep-sec', 'data-gp-deep-drift': '1' },
            h('div', { className: 'gp-deep-h' }, '心率漂移'),
            drift === null
              ? h('div', { className: 'gp-deep-muted' }, '无心率漂移数据')
              : h('div', {
                  className: 'gp-drift',
                  'data-gp-drift-percent': String(drift),
                },
                  h('span', { className: 'big' }, `${fmt(drift, 1)}%`),
                  rating
                    ? h('span', {
                        className: `gp-pill ${rating.cls}`,
                        'data-gp-drift-rating': rating.text,
                      }, rating.text)
                    : null,
                  h('div', { className: 'note' }, '<5% 良好 · 5–10% 可接受 · >10% 偏高'))),

          h('div', {
            className: 'gp-deep-sec',
            'data-gp-deep-shifts': '1',
            'data-gp-shift-total': shiftTotal === null ? '' : String(shiftTotal),
          },
            h('div', { className: 'gp-deep-h' }, '变速质量',
              h('span', { className: 'sp' },
                shiftTotal !== null ? `共 ${fmt(shiftTotal)} 次` : 'Di2 / eTap')),
            shifts
              ? h('div', { className: 'gp-shifts' }, SHIFT_ROWS.map((row) => {
                  const value = shiftValueOf(shifts, row.key)
                  const pct = shiftTotal && shiftTotal > 0 && value !== null
                    ? (value / shiftTotal) * 100
                    : 0
                  return h('div', {
                    key: row.key,
                    className: 'gp-shift-row',
                    'data-gp-shift-row': row.key,
                    title: `${row.label} · ${row.en}`,
                  },
                    h('span', { className: 'lb', title: row.en }, row.label),
                    h('div', { className: 'bar' },
                      h('i', {
                        style: {
                          width: `${Math.max(0, Math.min(100, pct))}%`,
                          background: row.color,
                        },
                      })),
                    h('span', { className: 'v' }, value !== null ? fmt(value) : '—'))
                }))
              : h('div', { className: 'gp-deep-muted', 'data-gp-shift-empty': '1' },
                  '未检测到电子变速数据')))
      } else if (state.phase === 'advanced_required') {
        body = h('div', {
          'data-gp-deep-state': 'advanced_required',
          style: { display: 'flex', flexDirection: 'column', gap: 8 },
        },
          h('div', { className: 'gp-deep-muted' },
            h('b', null, '需要进阶模式'),
            '：深度分析来自 Garmin 账号登录，官方 Personal API 不提供。'),
          h(UnlockCard, { flow, id: 'deep', compact: true, hint: '深度分析' }))
      } else if (state.phase === 'unavailable') {
        body = h('div', {
          'data-gp-deep-state': 'unavailable',
          style: { display: 'flex', flexDirection: 'column', gap: 8 },
        },
          h('div', { className: 'gp-deep-muted' }, state.message || '暂无深度分析'),
          h('div', { className: 'gp-fit-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn',
              'data-gp-deep-retry': '1',
              onClick: load,
            }, '重试')))
      } else {
        body = h('div', {
          'data-gp-deep-state': 'idle',
          style: { display: 'flex', flexDirection: 'column', gap: 8 },
        },
          h('div', { className: 'gp-deep-muted' },
            '功率曲线、爬坡、心率漂移与电子变速（Di2 / eTap）来自原始 FIT 分析，约 10–30 秒，需要时再点。'),
          h('div', { className: 'gp-fit-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              'data-gp-deep-load': '1',
              onClick: load,
            }, '加载分析（约 10–30 秒）')))
      }

      return h('div', { className: 'gp-fit gp-deep', 'data-gp-deep-block': '1' },
        h('div', { className: 'gp-fit-hd' },
          h('b', null, '深度分析'),
          h('button', {
            type: 'button',
            className: 'gp-fit-toggle',
            'data-gp-deep-collapse': '1',
            'aria-expanded': open,
            onClick: () => setOpen((value) => !value),
          },
            open ? '收起' : '展开',
            h('span', { className: `caret${open ? ' up' : ''}`, 'aria-hidden': true }, '▾'))),
        open ? h('div', { className: 'gp-fit-body', 'data-gp-deep-body': '1' }, body) : null)
    }

    /* ---------------------------------------------------------------- *
     * 健康趋势：7 / 30 天折线 · 柱状 · Body Battery 区间带
     * 纯内联 SVG；空值不画 0（折线按连续非空段拆分，柱状直接跳过），
     * 只有首尾日期标在 X 轴下方，Y 轴自动缩放并画 1–2 条网格线。
     * ---------------------------------------------------------------- */
    const TRENDS_RANGE_KEY = 'garmin-panel-trends-range-v1'
    const TRENDS_DAYS = [7, 30]
    const TREND_W = 300
    const TREND_H = 62
    const TREND_PADX = 3
    const TREND_TOPY = 5
    const TREND_BOTY = 3

    function readTrendsRange() {
      try {
        return Number(localStorage.getItem(TRENDS_RANGE_KEY)) === 30 ? 30 : 7
      } catch { return 7 }
    }

    function trendRowsOf(data) {
      const list = Array.isArray(data?.series) ? data.series : []
      return list.filter((row) => row && dayPart(row.date))
    }

    /** pick(row) → number|null；NaN / 非数字一律当空值（缺口），绝不当 0 */
    function trendValue(row, pick) {
      if (!row || typeof pick !== 'function') return null
      const v = pick(row)
      return typeof v === 'number' && isFinite(v) ? v : null
    }

    function trendLast(rows, pick) {
      for (let i = rows.length - 1; i >= 0; i--) {
        const v = trendValue(rows[i], pick)
        if (v !== null) return v
      }
      return null
    }

    function trendAvg(rows, pick) {
      const vals = rows.map((row) => trendValue(row, pick)).filter((v) => v !== null)
      return vals.length ? vals.reduce((sum, v) => sum + v, 0) / vals.length : null
    }

    function trendMin(rows, pick) {
      const vals = rows.map((row) => trendValue(row, pick)).filter((v) => v !== null)
      return vals.length ? Math.min(...vals) : null
    }

    function trendDelta(diff, goodWhen, digits = 0, unit = '') {
      if (diff === null || !isFinite(diff)) return null
      if (Math.abs(diff) < (digits > 0 ? 0.05 : 0.5)) {
        return h('span', { className: 'gp-trend-delta flat' }, '持平')
      }
      const good = goodWhen === 'up' ? diff > 0 : goodWhen === 'down' ? diff < 0 : null
      const cls = good === null ? 'flat' : good ? 'good' : 'bad'
      return h('span', { className: `gp-trend-delta ${cls}` },
        `${diff > 0 ? '↑' : '↓'}${fmt(Math.abs(diff), digits)}${unit}`)
    }

    /**
     * 一张趋势卡：标题行（名称 + 最新值 pill）、72px 图表区、页脚（均值/变化）。
     */
    function TrendCard({ id, label, color, pill, footer, chart, loading, footerClass = '', ...rest }) {
      return h('div', { className: 'gp-card gp-trend', 'data-gp-trend': id, ...rest },
        h('div', { className: 'gp-trend-hd' },
          h('span', { className: 'gp-trend-lb' }, label),
          h('span', {
            className: 'gp-pill gp-trend-pill',
            style: { color, borderColor: `color-mix(in srgb, ${color} 42%, transparent)` },
            'data-gp-trend-latest': id,
          }, pill)),
        loading
          ? h('div', { className: 'gp-trend-chart' }, h(Skel, { h: 62 }))
          : chart,
        h('div', { className: `gp-trend-ft${footerClass ? ` ${footerClass}` : ''}`, 'data-gp-trend-foot': id }, footer))
    }

    /**
     * 折线 / 柱状 / 区间带。空值：折线拆成多段（单点画圆），柱状跳过，
     * 所以绝不把 null 画到底线（0）上。
     */
    function TrendChart({
      id, label, rows, pick, color, avg = null, kind = 'line',
      barsPick = null, barsColor = null, bandPick = null, rangeDays = 7, emptyText = null,
    }) {
      const values = rows.map((row) => trendValue(row, pick))
      const finite = values.filter((v) => v !== null)
      const missing = !rows.length || (kind === 'bar' ? finite.length === 0 : finite.length < 2)
      if (missing) {
        return h('div', {
          className: 'gp-trend-empty',
          'data-gp-trend-empty': id,
        }, emptyText || `近 ${rangeDays} 天未记录`)
      }

      const innerW = TREND_W - TREND_PADX * 2
      const innerH = TREND_H - TREND_TOPY - TREND_BOTY
      const n = rows.length
      const x = (i) => (n === 1 ? TREND_W / 2 : TREND_PADX + (i / (n - 1)) * innerW)

      /* Y 轴自动缩放：折线把均值也算进范围，柱状从 0 起 */
      let lo
      let hi
      if (kind === 'bar') {
        lo = 0
        hi = Math.max(1, ...finite)
      } else if (kind === 'band') {
        const mins = []
        const maxs = []
        for (const row of rows) {
          const band = bandPick ? bandPick(row) : null
          const mn = numOf(band?.min)
          const mx = numOf(band?.max)
          if (mn !== null) mins.push(mn)
          if (mx !== null) maxs.push(mx)
        }
        lo = Math.min(...mins, ...finite)
        hi = Math.max(...maxs, ...finite)
      } else {
        lo = Math.min(...finite, avg ?? Infinity)
        hi = Math.max(...finite, avg ?? -Infinity)
      }
      if (!isFinite(lo) || !isFinite(hi)) { lo = 0; hi = 1 }
      if (hi <= lo) hi = lo + 1
      if (kind === 'bar') {
        hi *= 1.08
      } else {
        const pad = (hi - lo) * 0.14 || 1
        lo = Math.max(0, lo - pad)
        hi += pad
      }
      const y = (v) => TREND_TOPY + (1 - (v - lo) / (hi - lo)) * innerH

      /* 连续非空段 → 折线；null 是段边界（不画 0） */
      const segments = []
      let current = []
      values.forEach((v, i) => {
        if (v === null) {
          if (current.length) segments.push(current)
          current = []
          return
        }
        current.push([x(i), y(v)])
      })
      if (current.length) segments.push(current)

      const lineNodes = segments.map((seg, i) => (seg.length === 1
        ? h('circle', {
            key: `seg${i}`, cx: seg[0][0], cy: seg[0][1], r: 1.7, fill: color,
          })
        : h('polyline', {
            key: `seg${i}`,
            points: seg.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' '),
            fill: 'none',
            stroke: color,
            strokeWidth: 1.8,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
          })))

      /* 柱状（步数 / 强度 / 睡眠时长格状小柱） */
      const bars = barsPick ? rows.map((row) => trendValue(row, barsPick)) : values
      const barFinite = bars.filter((v) => v !== null)
      const barMax = Math.max(1, ...barFinite)
      const bw = Math.max(2, Math.min(9, (innerW / Math.max(1, n)) * 0.55))
      const barHeight = barsPick ? innerH * 0.42 : innerH
      const barNodes = bars.map((v, i) => {
        if (v === null) return null
        const height = Math.max(1.4, (Math.max(0, v) / barMax) * barHeight)
        return h('rect', {
          key: `bar${i}`,
          x: x(i) - bw / 2,
          y: TREND_H - TREND_BOTY - height,
          width: bw,
          height,
          rx: 1.2,
          fill: barsColor || color,
          opacity: barsPick ? 0.5 : 0.85,
        })
      })

      /* Body Battery：每日 min–max 区间带 */
      let bandNodes = []
      if (kind === 'band') {
        const bandSegs = []
        let band = []
        rows.forEach((row, i) => {
          const raw = bandPick ? bandPick(row) : null
          const mn = numOf(raw?.min)
          const mx = numOf(raw?.max)
          if (mn === null || mx === null) {
            if (band.length) bandSegs.push(band)
            band = []
            return
          }
          band.push({ x: x(i), min: mn, max: mx })
        })
        if (band.length) bandSegs.push(band)
        bandNodes = bandSegs.map((seg, i) => {
          const top = seg.map((p) => `${p.x.toFixed(1)},${y(p.max).toFixed(1)}`)
          const bottom = seg.slice().reverse().map((p) => `${p.x.toFixed(1)},${y(p.min).toFixed(1)}`)
          return h('polygon', {
            key: `band${i}`,
            points: [...top, ...bottom].join(' '),
            fill: color,
            opacity: 0.16,
          })
        })
      }

      const nulls = values.filter((v) => v === null).length
      const zeros = finite.filter((v) => v === 0).length
      const avgLine = kind === 'line' && typeof avg === 'number' && isFinite(avg)
        ? h('line', {
            x1: TREND_PADX,
            x2: TREND_W - TREND_PADX,
            y1: y(avg),
            y2: y(avg),
            stroke: 'var(--gp-line)',
            strokeDasharray: '3 3',
          })
        : null

      return h('div', {
        className: 'gp-trend-chart',
        'data-gp-trend-chart': id,
        'data-gp-trend-nulls': String(nulls),
        'data-gp-trend-drawn': String(finite.length),
        'data-gp-trend-segments': String(kind === 'bar' ? 0 : segments.length),
        'data-gp-trend-zeros': String(zeros),
        title: `X 轴：${rows[0].date} → ${rows[rows.length - 1].date}`,
      },
        h('svg', {
          viewBox: `0 0 ${TREND_W} ${TREND_H}`,
          preserveAspectRatio: 'none',
          role: 'img',
          'aria-label': `${label} 近 ${rangeDays} 天趋势`,
          style: { height: TREND_H },
        },
          /* 2 条网格线：上界 + 下界（柱状的下界即 0 基线） */
          h('line', {
            x1: TREND_PADX, x2: TREND_W - TREND_PADX, y1: y(hi), y2: y(hi),
            stroke: 'var(--gp-line2)',
          }),
          h('line', {
            x1: TREND_PADX, x2: TREND_W - TREND_PADX, y1: y(lo), y2: y(lo),
            stroke: 'var(--gp-line2)',
          }),
          avgLine,
          bandNodes,
          kind === 'bar' || barsPick ? barNodes : null,
          kind === 'bar' ? null : lineNodes),
        h('div', { className: 'gp-trend-x' },
          h('span', null, shortDay(rows[0].date)),
          h('span', null, shortDay(rows[rows.length - 1].date))))
    }

    /* ---------------------------------------------------------------- *
     * A 类展示：HRV 详情 / 心率区间 / 睡眠规律 / Body Battery 曲线
     * 全部对缺失字段容忍：拿不到就显示「未获取 / 未记录」，绝不抛错
     * ---------------------------------------------------------------- */
    /** "HH:MM" → 分钟；wrap=true 时把中午之前的时间算到次日（入睡时间用） */
    function clockMinutesOf(value, wrap = false) {
      const m = /^(\d{1,2}):(\d{2})/.exec(String(value ?? '').trim())
      if (!m) return null
      const mins = Number(m[1]) * 60 + Number(m[2])
      if (!isFinite(mins) || mins < 0 || mins > 24 * 60) return null
      return wrap && mins < 12 * 60 ? mins + 24 * 60 : mins
    }
    function minutesClock(value) {
      const n = numOf(value)
      if (n === null) return null
      const mins = ((Math.round(n) % 1440) + 1440) % 1440
      return `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`
    }

    /**
     * snapshot 里的 HRV 详情：顶层 snapshot.hrv 优先，其次 kpi.sleep 的扁平键。
     * 字段名在不同后端版本里不一致，这里全部做别名兼容。
     */
    function hrvDetailOf(snap) {
      const top = snap?.hrv && typeof snap.hrv === 'object' ? snap.hrv : {}
      const kpiSleep = snap?.kpi?.sleep && typeof snap.kpi.sleep === 'object' ? snap.kpi.sleep : {}
      const low = numOf(top.baselineBalancedLow, top.baselineLow, top.baselineLowUpper,
        top.balancedLow, kpiSleep.baselineBalancedLow, kpiSleep.baselineLowUpper,
        kpiSleep.baselineLow)
      const high = numOf(top.baselineBalancedHigh, top.baselineHigh, top.baselineUpper,
        top.balancedHigh, kpiSleep.baselineBalancedHigh, kpiSleep.baselineHigh)
      const peak = numOf(top.lastNight5MinHigh, top.lastNightMax, top.lastNightHigh,
        kpiSleep.lastNight5MinHigh, kpiSleep.lastNightMax)
      const statusRaw = firstOf(top.status, top.hrvStatus, top.baselineStatus,
        kpiSleep.hrvStatus, kpiSleep.status)
      const status = statusRaw ? String(statusRaw).toUpperCase() : null
      if (low === null && high === null && peak === null && !status) return null
      return { low, high, peak, status }
    }

    function hrvDetailText(info) {
      if (!info) return null
      const parts = []
      if (info.low !== null && info.high !== null) {
        parts.push(`基线 ${fmt(info.low)}–${fmt(info.high)} ms`)
      } else if (info.low !== null) parts.push(`基线下限 ${fmt(info.low)} ms`)
      else if (info.high !== null) parts.push(`基线上限 ${fmt(info.high)} ms`)
      if (info.peak !== null) parts.push(`昨夜最高 ${fmt(info.peak)} ms`)
      if (info.status) parts.push(info.status)
      return parts.length ? parts.join(' · ') : null
    }

    /** extras.hrZones 里挑 DEFAULT / running 档；没有 zones 的档位直接跳过 */
    function pickHrZoneProfile(list) {
      const rows = Array.isArray(list) ? list.filter((row) => row
        && typeof row === 'object'
        && Array.isArray(row.zones)
        && row.zones.length) : []
      if (!rows.length) return null
      const sportOf = (row) => String(firstOf(row.sport, row.activityType, row.profile, '')
        ?? '').toUpperCase()
      return rows.find((row) => sportOf(row) === 'DEFAULT' || sportOf(row) === 'GENERIC')
        || rows.find((row) => sportOf(row) === 'RUNNING' || sportOf(row) === 'RUN')
        || rows[0]
    }

    /** 心率区间行：zone / low / high，缺 zone 号时按数组下标补 */
    function hrZoneRowsOf(profile) {
      const zones = Array.isArray(profile?.zones) ? profile.zones : []
      return zones.map((row, i) => ({
        zone: numOf(row?.zone, row?.zoneNumber, row?.index, i + 1) ?? i + 1,
        low: numOf(row?.low, row?.lowBpm, row?.min, row?.from),
        high: numOf(row?.high, row?.highBpm, row?.max, row?.to),
      })).filter((row) => row.low !== null || row.high !== null)
    }

    /**
     * 睡眠规律性：7 晚入睡 / 起床均值 + 波动分钟 + 每晚入睡点。
     * 优先用后端 averages（同一份 /trends 已经算好），缺失时从逐晚字段现算。
     */
    function sleepRegularityOf(rows, averages) {
      const list = Array.isArray(rows) ? rows.filter((row) => row && dayPart(row.date)) : []
      const beds = []
      for (const row of list) {
        const bed = clockMinutesOf(firstOf(row.sleepStartLocal, row.sleep_start_local,
          row.bedtimeLocal), true)
        const wake = clockMinutesOf(firstOf(row.sleepEndLocal, row.sleep_end_local,
          row.wakeLocal))
        beds.push({ date: dayPart(row.date), mins: bed, wake })
      }
      const bedValues = beds.map((row) => row.mins).filter((v) => v !== null)
      const wakeValues = beds.map((row) => row.wake).filter((v) => v !== null)
      const mean = (values) => (values.length
        ? values.reduce((sum, v) => sum + v, 0) / values.length
        : null)
      const bedMean = mean(bedValues)
      const wakeMean = mean(wakeValues)
      const bedAvg = clockMinutesOf(averages?.bedtimeAvg, true) ?? bedMean
      const wakeAvg = clockMinutesOf(averages?.wakeAvg) ?? wakeMean
      let variability = numOf(averages?.bedtimeVariabilityMin)
      if (variability === null && bedValues.length > 1 && bedMean !== null) {
        const mad = bedValues.reduce((sum, v) => sum + Math.abs(v - bedMean), 0) / bedValues.length
        variability = Math.round(mad)
      }
      const dots = beds.filter((row) => row.mins !== null)
      return {
        bedAvg,
        wakeAvg,
        variability: variability !== null ? Math.max(0, Math.round(variability)) : null,
        dots,
        nights: list.length,
      }
    }

    /** 睡眠规律性：紧凑卡片（7 晚图下方），一行文字 + 入睡点阵 */
    function SleepRegularity({ rows, averages, loading, nights }) {
      const info = sleepRegularityOf(rows, averages)
      const hasAny = info.bedAvg !== null || info.wakeAvg !== null || info.dots.length > 0
      if (loading && !hasAny) {
        return h('div', { className: 'gp-sleep-reg', 'data-gp-sleep-reg': '1' },
          h('div', { className: 'hd' }, h('b', null, '睡眠规律性')),
          h(Skel, { h: 34 }))
      }
      if (!hasAny) {
        return h('div', { className: 'gp-sleep-reg', 'data-gp-sleep-reg': 'empty' },
          h('div', { className: 'hd' }, h('b', null, '睡眠规律性')),
          h('div', { className: 'muted' }, '未获取到睡眠规律数据'))
      }
      const bedText = info.bedAvg !== null ? minutesClock(info.bedAvg) : '—'
      const wakeText = info.wakeAvg !== null ? minutesClock(info.wakeAvg) : '—'
      const varText = info.variability !== null ? `±${fmt(info.variability)} 分钟` : '—'
      const line = `平均入睡 ${bedText} · 平均起床 ${wakeText} · 波动 ${varText}`
      return h('div', { className: 'gp-sleep-reg', 'data-gp-sleep-reg': '1' },
        h('div', { className: 'hd' },
          h('b', null, '睡眠规律性'),
          h('span', { className: 'sp' }, `${info.nights || info.dots.length || nights || 0} 晚 · 入睡时间`)),
        h('div', { className: 'txt', 'data-gp-sleep-reg-text': line },
          '平均入睡 ', h('b', null, bedText),
          ' · 平均起床 ', h('b', null, wakeText),
          ' · 波动 ', h('b', null, varText)),
        h(SleepRegularityDots, { dots: info.dots }))
    }

    /** 每晚入睡时间点：X = 第几晚，Y = 入睡时刻（越晚越靠下），虚线为均值 */
    function SleepRegularityDots({ dots }) {
      const list = Array.isArray(dots) ? dots : []
      if (!list.length) return null
      const W = 300
      const H = 34
      const PADX = 6
      const PADY = 5
      const values = list.map((row) => row.mins)
      let lo = Math.min(...values)
      let hi = Math.max(...values)
      if (hi - lo < 1) { lo -= 30; hi += 30 }
      const span = Math.max(1, hi - lo)
      const x = (i) => (list.length === 1 ? W / 2 : PADX + (i / (list.length - 1)) * (W - PADX * 2))
      const y = (v) => PADY + (1 - (v - lo) / span) * (H - PADY * 2)
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length
      return h('svg', {
        className: 'dots',
        viewBox: `0 0 ${W} ${H}`,
        preserveAspectRatio: 'none',
        role: 'img',
        'aria-label': `近 ${list.length} 晚入睡时间点`,
        'data-gp-sleep-dots': String(list.length),
        'data-gp-sleep-bed-avg': minutesClock(avg) || '',
      },
        h('title', null, list.map((row) => `${row.date} ${minutesClock(row.mins)}`).join(' · ')),
        h('line', {
          x1: PADX, x2: W - PADX, y1: y(avg), y2: y(avg),
          stroke: 'var(--gp-line)', strokeDasharray: '3 3',
        }),
        list.map((row, i) => h('circle', {
          key: `${row.date}-${i}`,
          cx: x(i), cy: y(row.mins), r: 2.6,
          fill: 'var(--gp-blue)',
        })))
    }

    /**
     * Body Battery 当日曲线：日级 sparkline（约 40px）。
     * 只有电池 KPI 卡挂载时才请求（懒加载）；no_series / 失败时什么都不画，
     * 让外层保留原本的电池图形，不弹错误。
     */
    function BodyBatterySpark({ enabled = true, date = null, version = 0 }) {
      const [state, setState] = React.useState({ phase: 'idle' })
      React.useEffect(() => {
        if (!enabled) return undefined
        const day = dayPart(date) || isoDay(new Date())
        let active = true
        let controller = new AbortController()
        setState({ phase: 'loading' })
        fetch(`${API}/body-battery?date=${encodeURIComponent(day)}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
          })
          .then((data) => {
            if (!active) return
            const series = Array.isArray(data?.series) ? data.series : []
            const points = series
              .map((row) => ({ t: String(firstOf(row?.t, row?.time, '') ?? ''), level: numOf(row?.level) }))
              .filter((row) => row.level !== null)
            if (data?.status === 'ok' && points.length > 1) {
              setState({
                phase: 'ok',
                points,
                charged: numOf(data?.charged),
                drained: numOf(data?.drained),
                highest: numOf(data?.highest),
                lowest: numOf(data?.lowest),
              })
            } else {
              setState({ phase: 'empty' })
            }
          })
          .catch((err) => {
            if (!active || err?.name === 'AbortError') return
            setState({ phase: 'empty' })
          })
        return () => { active = false; controller.abort() }
      }, [enabled, date, version])

      if (state.phase !== 'ok') return null
      const pts = state.points
      const W = 300
      const H = 40
      const PADX = 3
      const PADY = 4
      const x = (i) => (pts.length === 1 ? W / 2 : PADX + (i / (pts.length - 1)) * (W - PADX * 2))
      const y = (v) => PADY + (1 - Math.max(0, Math.min(100, v)) / 100) * (H - PADY * 2)
      const line = pts.map((row, i) => `${x(i).toFixed(1)},${y(row.level).toFixed(1)}`).join(' ')
      const area = `M${PADX} ${H - PADY}L${line.split(' ').join('L')}L${W - PADX} ${H - PADY}Z`
      const rangeText = state.highest !== null && state.lowest !== null
        ? `Body Battery 曲线 · 最高 ${fmt(state.highest)} · 最低 ${fmt(state.lowest)}`
        : 'Body Battery 曲线'
      return h('div', {
        className: 'gp-bbspark',
        'data-gp-bbspark': '1',
        'data-gp-bbspark-points': String(pts.length),
        title: rangeText,
      },
        h('svg', {
          viewBox: `0 0 ${W} ${H}`,
          preserveAspectRatio: 'none',
          role: 'img',
          'aria-label': rangeText,
        },
          h('path', {
            d: area,
            fill: 'color-mix(in srgb, var(--gp-green) 16%, transparent)',
            stroke: 'none',
          }),
          h('polyline', {
            points: line,
            fill: 'none',
            stroke: 'var(--gp-green)',
            strokeWidth: 1.6,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
          })))
    }

    function Skel({ h: height = 60 }) {
      return h('div', { className: 'gp-skel', style: { height } })
    }

    /** KPI 卡里居中的骨架，高度与对应图形一致，切换时不跳动 */
    function KpiSkel({ height = 80 }) {
      return h('div', { className: 'viz' },
        h('div', { style: { width: '100%' } }, h(Skel, { h: height })))
    }

    /* ---------------------------------------------------------------- *
     * AI 教练
     * 只在点击时调模型（一次调用 = 一次对话额度），结果留在组件 state 里
     * ---------------------------------------------------------------- */
    const COACH_CODE_ZH = {
      RATE_LIMIT: '模型限流，稍后再试',
      ACCOUNT_QUOTA: '账号额度不足',
      ACCOUNT_SIGN_IN_REQUIRED: 'Harness 账号需要重新登录',
      ACCOUNT_TOKEN_INVALID: 'Harness 账号令牌失效，请重新登录',
      AUTH: '模型凭证无效，请重新登录',
      LLM_UNAVAILABLE: '未配置模型',
      GARMIN_UNAUTHENTICATED: 'Garmin 未登录',
      TIMEOUT: '模型响应超时',
      TRANSPORT: '网络异常，连不上模型服务',
      SOCKS: '网络代理异常',
      EMPTY_RESPONSE: '模型没有返回正文',
      CONTEXT_WINDOW_EXCEEDED: '数据超出模型上下文',
      INVALID_REQUEST: '请求参数不合法',
      NETWORK: '连不上面板后端',
      INTERNAL: '服务端内部错误',
    }

    /* 行内 markdown-lite：**粗体** 与 `代码`（其余原样） */
    function coachInline(text, keyBase) {
      const parts = []
      const re = /(\*\*[^*]+\*\*|`[^`]+`)/g
      let last = 0
      let seq = 0
      let m
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push(text.slice(last, m.index))
        const token = m[0]
        parts.push(token.startsWith('**')
          ? h('b', { key: `${keyBase}-b${seq++}` }, token.slice(2, -2))
          : h('code', { key: `${keyBase}-c${seq++}` }, token.slice(1, -1)))
        last = m.index + token.length
      }
      if (last < text.length) parts.push(text.slice(last))
      return parts
    }

    /* 行级 markdown-lite：## 标题 / 「」整行标题 / - 列表 / 1. 有序列表 / 空行留白 */
    function coachLines(text) {
      const nodes = []
      String(text || '').split(/\r?\n/).forEach((raw, i) => {
        const line = raw.trim()
        if (!line) { nodes.push(h('div', { key: i, className: 'gp-coach-gap' })); return }

        const heading =
          /^#{1,4}\s*(.+?)\s*#*$/.exec(line) ||
          /^\*\*([^*]+)\*\*$/.exec(line) ||
          /^[「【](.+?)[」】]$/.exec(line)
        if (heading) {
          nodes.push(h('div', { key: i, className: 'gp-coach-h' }, ...coachInline(heading[1], i)))
          return
        }

        const bullet = /^[-*•·]\s+(.+)$/.exec(line)
        if (bullet) {
          nodes.push(h('div', { key: i, className: 'gp-coach-li' },
            h('i', null, '•'), h('span', null, ...coachInline(bullet[1], i))))
          return
        }

        const ordered = /^(\d{1,2})[.、)]\s+(.+)$/.exec(line)
        if (ordered) {
          nodes.push(h('div', { key: i, className: 'gp-coach-li' },
            h('i', null, `${ordered[1]}.`), h('span', null, ...coachInline(ordered[2], i))))
          return
        }

        // 「训练建议：xxx」这类短标签行，把冒号前加粗
        const labelled = /^([^：:]{2,6})[：:]\s*(.+)$/.exec(line)
        if (labelled) {
          nodes.push(h('div', { key: i, className: 'gp-coach-p' },
            h('b', null, labelled[1]), '：', ...coachInline(labelled[2], i)))
          return
        }

        nodes.push(h('div', { key: i, className: 'gp-coach-p' }, ...coachInline(line, i)))
      })
      return nodes
    }

    /* AI 健康：教练 / 管家双角色。两个角色的结果分别缓存，切换 tab 不重新请求 */
    const STEWARD_CODE_ZH = {
      RATE_LIMIT: '模型限流，稍后再试',
      ACCOUNT_QUOTA: '账号额度不足',
      ACCOUNT_SIGN_IN_REQUIRED: 'Harness 账号需要重新登录',
      LLM_UNAVAILABLE: '当前 Harness 未配置可用模型',
      TIMEOUT: '分析超时，请重试',
    }
    const VERDICT_ZH = { keep: '保持即可', watch: '可以留意', attention: '需要关注' }
    const VERDICT_IDS = ['keep', 'watch', 'attention']
    const emptyRole = () => ({ phase: 'idle', result: null, error: null })

    function emptyStatus() {
      return {
        coach: { loading: true, available: null, model: null },
        steward: { loading: true, available: null, model: null },
      }
    }

    function coachStamp(result) {
      const generated = result?.generatedAt ? new Date(result.generatedAt) : null
      return generated && !Number.isNaN(generated.getTime())
        ? generated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
        : '—'
    }

    /**
     * 双角色状态放在 Page（而不是卡片）里，这样隐藏/显示区块不会丢缓存，
     * 但 enabled=false 时两个 status 请求都不会发出。
     */
    function useCoachRoles({ date, enabled, version }) {
      const [tab, setTab] = React.useState('coach') // coach | steward
      const [coach, setCoach] = React.useState(emptyRole)
      const [steward, setSteward] = React.useState(emptyRole)
      const [status, setStatus] = React.useState(emptyStatus)
      const [copied, setCopied] = React.useState(null) // role id | null
      const copyTimer = React.useRef(null)
      const statusLoaded = React.useRef(false)

      React.useEffect(() => () => {
        if (copyTimer.current) clearTimeout(copyTimer.current)
      }, [])

      /* 可用性只查一次（两个 status 都很便宜，不产生模型调用） */
      React.useEffect(() => {
        if (!enabled || statusLoaded.current) return undefined
        const controller = new AbortController()
        let cancelled = false
        const grab = (path) =>
          fetch(`${API}/${path}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
            .then((r) => r.json())
            .then((d) => ({ available: d?.available === true, model: d?.model ?? null }))
            .catch(() => ({ available: false, model: null }))
        Promise.all([grab('coach/status'), grab('steward/status')]).then(([c, s]) => {
          if (cancelled) return
          statusLoaded.current = true
          setStatus({ coach: { loading: false, ...c }, steward: { loading: false, ...s } })
        })
        return () => { cancelled = true; controller.abort() }
      }, [enabled])

      /* 刷新（version）或切换回看日期时清空两个角色的缓存结果：
         旧结果只对生成那天有意义，跨天不该继续挂着 */
      React.useEffect(() => {
        setCoach(emptyRole())
        setSteward(emptyRole())
        setCopied(null)
      }, [version, date])

      const run = React.useCallback((role, force) => {
        const setRole = role === 'coach' ? setCoach : setSteward
        const path = role === 'coach' ? 'coach' : 'steward'
        setRole((s) => ({ ...s, phase: 'loading', error: null }))
        setCopied(null)
        fetch(`${API}/${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force: !!force, ...(date ? { date } : {}) }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.status === 'ok' && data.text) {
              setRole({ phase: 'ok', result: data, error: null })
              if (data.model) {
                setStatus((s) => ({ ...s, [role]: { ...s[role], loading: false, available: true, model: data.model } }))
              }
              return
            }
            setRole({
              phase: 'error',
              result: null,
              error: {
                code: data?.code || 'INTERNAL',
                message: data?.message || '',
                retryAfterMs: data?.retryAfterMs,
              },
            })
          })
          .catch((err) => {
            setRole({ phase: 'error', result: null, error: { code: 'NETWORK', message: String(err?.message || err) } })
          })
      }, [date])

      const copy = React.useCallback((role) => {
        const text = (role === 'coach' ? coach : steward).result?.text
        if (!text) return
        copyText(text).then((ok) => {
          if (!ok) return
          setCopied(role)
          if (copyTimer.current) clearTimeout(copyTimer.current)
          copyTimer.current = setTimeout(() => setCopied(null), 1800)
        })
      }, [coach, steward])

      return { tab, setTab, coach, steward, status, copied, run, copy }
    }

    const COACH_ROLE_LABEL = { coach: 'AI 教练', steward: 'AI 健康管家' }

    /** 角色分段切换：只渲染当前可见的角色（卡片被隐藏时对应 tab 一并消失） */
    function CoachTabs({ roles, tab, setTab }) {
      return h('div', { className: 'gp-seg', role: 'tablist', 'aria-label': 'AI 建议角色' },
        roles.map((role) => h('button', {
          key: role,
          type: 'button',
          role: 'tab',
          'aria-selected': tab === role,
          className: `gp-seg-btn${tab === role ? ' on' : ''}`,
          'data-gp-tab': role,
          onClick: () => setTab(role),
        }, COACH_ROLE_LABEL[role] || role)))
    }

    /**
     * 角色卡片。普通模式由 tab 切换；编辑态用 pinned 固定角色、隐藏 tab
     * （角色 tab 在板块级单独渲染，所以隐藏角色卡片时 tab 会一起消失）。
     */
    function CoachCard({
      api, roles = ['coach', 'steward'], pinned = null, showTabs = true,
      date = null, reviewing = false,
    }) {
      const { tab, setTab, coach, steward, status, copied, run, copy } = api
      const enabledRoles = Array.isArray(roles) ? roles : ['coach', 'steward']
      if (!enabledRoles.length) return null
      const role = pinned && enabledRoles.includes(pinned)
        ? pinned
        : enabledRoles.includes(tab) ? tab : enabledRoles[0]
      const roleState = role === 'coach' ? coach : steward
      const roleStatus = status[role] || {}
      const verdict = role === 'steward' && roleState.phase === 'ok' && VERDICT_IDS.includes(roleState.result?.verdict)
        ? roleState.result.verdict
        : null
      const cardCls = `gp-card gp-coach${verdict ? ` verdict-${verdict}` : ''}`
      const stamp = coachStamp(roleState.result)
      /* 回看时把建议自己覆盖的那天写进页脚（结果里带 date 就用它，否则用当前选中日） */
      const adviceDay = dayPart(roleState.result?.date) || (reviewing ? dayPart(date) : null)
      const model = roleState.result?.model || roleStatus.model

      let body
      if (roleState.phase === 'loading') {
        body = h('div', null,
          h('div', { className: 'gp-coach-skel' },
            h('div', { className: 'gp-skel', style: { height: 13, width: '58%' } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '94%' } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '88%' } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '72%' } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '84%' } })),
          h('div', { className: 'gp-coach-muted', style: { marginTop: 10 } },
            role === 'coach' ? '教练正在看你的数据…（约 5–10 秒）' : '管家正在看你的数据…（约 5–10 秒）'))
      } else if (roleState.phase === 'error') {
        const err = roleState.error || {}
        let friendly
        if (role === 'coach') {
          friendly = COACH_CODE_ZH[err.code] || err.message || '教练暂时不可用'
        } else {
          const secs = err.retryAfterMs ? Math.max(1, Math.ceil(err.retryAfterMs / 1000)) : null
          friendly = err.code === 'RATE_LIMIT'
            ? `模型限流，稍后再试${secs ? `（${secs} 秒后）` : ''}`
            : STEWARD_CODE_ZH[err.code] || err.message || '管家暂时不可用'
        }
        const known = role === 'coach' ? COACH_CODE_ZH[err.code] : STEWARD_CODE_ZH[err.code]
        // 已知错误码已经翻译过；只有原始 message 明显更详细时才再显示一行
        const rawText = err.message && err.message !== friendly &&
          (known ? err.message.length > friendly.length + 6 : true)
          ? err.message
          : null
        body = h('div', null,
          h('div', { className: 'gp-coach-err' },
            h('b', null, friendly),
            rawText ? h('span', { className: 'gp-coach-muted' }, rawText) : null),
          h('div', { className: 'gp-coach-actions' },
            err.retryAfterMs
              ? h('span', { className: 'gp-coach-muted' },
                  `建议 ${Math.max(1, Math.ceil(err.retryAfterMs / 1000))} 秒后重试`)
              : null,
            h('button', { className: 'gp-btn', onClick: () => run(role, true) }, '重试')))
      } else if (roleState.phase === 'ok' && roleState.result?.text) {
        const isSteward = role === 'steward'
        body = h('div', null,
          isSteward && verdict
            ? h('div', { className: `gp-verdict ${verdict}` },
                h('span', { className: 'tag' }, VERDICT_ZH[verdict]),
                h('span', null, '今日健康结论'))
            : null,
          h('div', { className: 'gp-coach-body' }, ...coachLines(roleState.result.text)),
          h('div', {
            className: 'gp-coach-foot',
            'data-gp-advice-date': adviceDay || '',
          },
            h('span', null, `模型 ${model || '—'} · 生成于 ${stamp}`),
            adviceDay && reviewing
              ? h('span', { className: 'gp-advice-day', 'data-gp-advice-based': '1' },
                  `基于 ${shortDay(adviceDay)}`)
              : null,
            h('span', { className: 'sp' },
              isSteward
                ? h('button', { className: 'gp-btn', onClick: () => copy('steward') },
                    copied === 'steward' ? '已复制' : '复制')
                : null,
              h('button', { className: 'gp-btn', onClick: () => run(role, true) }, '重新分析'),
              isSteward
                ? null
                : h('button', { className: 'gp-btn', onClick: () => copy('coach') },
                    copied === 'coach' ? '已复制' : '复制建议'))))
      } else {
        body = h('div', null,
          h('div', { className: 'gp-coach-pitch' },
            role === 'coach'
              ? '让教练结合今天的准备度、负荷和睡眠，给出可执行的训练与恢复建议。'
              : '让管家看看睡眠、HRV、压力与 Body Battery，给出今天的生活与恢复提醒。'),
          roleStatus.available === false
            ? h('div', { className: 'gp-coach-muted', style: { marginTop: 9 } },
                role === 'coach'
                  ? '当前 Harness 未配置可用模型，教练暂不可用'
                  : '当前 Harness 未配置可用模型，管家暂不可用')
            : h('div', { className: 'gp-coach-actions' },
                h('button', { className: 'gp-btn primary', onClick: () => run(role, false) },
                  role === 'coach' ? '让教练分析今天' : '让管家看看今天'),
                h('span', { className: 'gp-coach-muted' },
                  '只在点击时调用模型，约消耗一次对话额度')))
      }

      return h('div', {
        className: cardCls,
        'data-gp-role': role,
        'data-gp-coach-role': role,
        'data-gp-verdict': verdict || '',
      },
        showTabs
          ? h('div', { className: 'gp-coach-hd' },
              h(CoachTabs, { roles: enabledRoles, tab: role, setTab }))
          : h('div', { className: 'gp-coach-hd' },
              h('b', { className: 'gp-coach-role' }, COACH_ROLE_LABEL[role] || role)),
        body,
        h('div', { className: 'gp-coach-disclaim' }, 'AI 建议仅供参考，不构成医疗建议'))
    }

    /* ---------------------------------------------------------------- *
     * AI 营养建议：点击才调模型，结果留在组件 state，刷新（version）清空
     * ---------------------------------------------------------------- */
    const NUTRITION_CODE_ZH = {
      RATE_LIMIT: '模型限流，稍后再试',
      ACCOUNT_QUOTA: '账号额度不足',
      ACCOUNT_SIGN_IN_REQUIRED: 'Harness 账号需要重新登录',
      ACCOUNT_TOKEN_INVALID: 'Harness 账号令牌失效，请重新登录',
      LLM_UNAVAILABLE: '当前 Harness 未配置可用模型',
      TIMEOUT: '生成超时，请重试',
      TRANSPORT: '网络异常，连不上模型服务',
      EMPTY_RESPONSE: '模型没有返回正文',
      INVALID_REQUEST: '请求参数不合法',
      NETWORK: '连不上面板后端',
    }

    function intakeText(nutrition) {
      if (!nutrition || typeof nutrition !== 'object') return null
      const parts = []
      const cal = numOf(nutrition.calories)
      if (cal !== null) parts.push(`${fmt(cal)} kcal`)
      const protein = numOf(nutrition.protein_g, nutrition.protein)
      if (protein !== null) parts.push(`蛋白 ${fmt(protein)} g`)
      const carbs = numOf(nutrition.carbs_g, nutrition.carbs)
      if (carbs !== null) parts.push(`碳水 ${fmt(carbs)} g`)
      return parts.length ? `今日已记录 ${parts.join(' · ')}` : null
    }

    function NutritionCard({ nutrition, version, date, reviewing = false, showToast, ...rest }) {
      const status = useJson('nutrition/advice/status', true, version)
      const [advice, setAdvice] = React.useState({ phase: 'idle', result: null, error: null })
      const [copied, setCopied] = React.useState(false)
      const copyTimer = React.useRef(null)
      const alive = React.useRef(true)
      const seq = React.useRef(0)

      React.useEffect(() => () => {
        alive.current = false
        if (copyTimer.current) clearTimeout(copyTimer.current)
      }, [])

      /* 刷新数据（version bump）或切换回看日期时清空缓存结果，丢弃仍在飞行中的旧请求 */
      React.useEffect(() => {
        seq.current += 1
        setAdvice({ phase: 'idle', result: null, error: null })
        setCopied(false)
      }, [version, date])

      const run = React.useCallback((force) => {
        const mine = ++seq.current
        setAdvice({ phase: 'loading', result: null, error: null })
        setCopied(false)
        const payload = { force: !!force }
        if (date) payload.date = date
        fetch(`${API}/nutrition/advice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((r) => r.json())
          .then((data) => {
            if (!alive.current || mine !== seq.current) return
            if (data?.status === 'ok' && data.text) {
              setAdvice({ phase: 'ok', result: data, error: null })
              return
            }
            setAdvice({
              phase: 'error',
              result: null,
              error: {
                code: data?.code || 'INTERNAL',
                message: data?.message || '',
                retryAfterMs: data?.retryAfterMs,
              },
            })
          })
          .catch((err) => {
            if (!alive.current || mine !== seq.current) return
            setAdvice({
              phase: 'error',
              result: null,
              error: { code: 'NETWORK', message: String(err?.message ?? err) },
            })
          })
      }, [date])

      const copy = React.useCallback(() => {
        const text = advice.result?.text
        if (!text) return
        copyText(text).then((ok) => {
          if (!ok || !alive.current) return
          setCopied(true)
          if (copyTimer.current) clearTimeout(copyTimer.current)
          copyTimer.current = setTimeout(() => setCopied(false), 1800)
          showToast?.('营养建议已复制', 'ok')
        })
      }, [advice, showToast])

      const intake = intakeText(nutrition)
      const model = advice.result?.model || status.data?.model || null
      /* 回看时页脚标注建议覆盖的那一天 */
      const adviceDay = dayPart(advice.result?.date) || (reviewing ? dayPart(date) : null)

      let body
      if (advice.phase === 'loading') {
        body = h('div', { 'data-gp-nutri-state': 'loading' },
          h('div', { className: 'gp-nutri-skel' },
            h('div', { className: 'gp-skel', style: { height: 12, width: '56%' } }),
            h('div', { className: 'gp-skel', style: { height: 10, width: '94%' } }),
            h('div', { className: 'gp-skel', style: { height: 10, width: '88%' } }),
            h('div', { className: 'gp-skel', style: { height: 10, width: '76%' } }),
            h('div', { className: 'gp-skel', style: { height: 10, width: '84%' } })),
          h('div', { className: 'gp-nutri-muted' }, '营养师正在计算…（约 5–10 秒）'))
      } else if (advice.phase === 'error') {
        const err = advice.error || {}
        const secs = err.retryAfterMs ? Math.max(1, Math.ceil(err.retryAfterMs / 1000)) : null
        const friendly = err.code === 'RATE_LIMIT'
          ? `模型限流，稍后再试${secs ? `（${secs} 秒后）` : ''}`
          : NUTRITION_CODE_ZH[err.code] || err.message || '营养建议暂时不可用'
        const known = NUTRITION_CODE_ZH[err.code]
        const rawText = err.message && err.message !== friendly &&
          (known ? err.message.length > friendly.length + 6 : true)
          ? err.message
          : null
        body = h('div', { 'data-gp-nutri-state': 'error' },
          h('div', { className: 'gp-coach-err' },
            h('b', null, friendly),
            rawText ? h('span', { className: 'gp-coach-muted' }, rawText) : null),
          h('div', { className: 'gp-nutri-actions' },
            h('button', { className: 'gp-btn', type: 'button', onClick: () => run(true) }, '重试')))
      } else if (advice.phase === 'ok' && advice.result?.text) {
        body = h('div', { 'data-gp-nutri-state': 'ok' },
          intake ? h('div', { className: 'gp-nutri-intake' }, intake) : null,
          h('div', { className: 'gp-coach-body' }, ...coachLines(advice.result.text)),
          h('div', {
            className: 'gp-nutri-foot',
            'data-gp-advice-date': adviceDay || '',
          },
            h('span', null, `模型 ${model || '—'} · 生成于 ${coachStamp(advice.result)}`),
            adviceDay && reviewing
              ? h('span', { className: 'gp-advice-day', 'data-gp-advice-based': '1' },
                  `基于 ${shortDay(adviceDay)}`)
              : null,
            h('span', { className: 'sp' },
              h('button', {
                className: 'gp-btn', type: 'button', 'data-gp-nutri-regen': '1',
                onClick: () => run(true),
              }, '重新生成'),
              h('button', {
                className: 'gp-btn', type: 'button', 'data-gp-nutri-copy': '1', onClick: copy,
              }, copied ? '已复制' : '复制'))))
      } else {
        const unavailable = status.data?.available === false
        body = h('div', { 'data-gp-nutri-state': 'idle' },
          h('div', { className: 'gp-nutri-pitch' }, '根据今天的训练与体重，让 AI 给出热量/蛋白/碳水建议'),
          intake ? h('div', { className: 'gp-nutri-intake' }, intake) : null,
          status.loading
            ? h('div', { className: 'gp-nutri-muted' }, '正在检查模型…')
            : unavailable
              ? h('div', { className: 'gp-nutri-muted' }, '当前 Harness 未配置可用模型')
              : h('div', { className: 'gp-nutri-actions' },
                  h('button', {
                    className: 'gp-btn primary',
                    type: 'button',
                    'data-gp-nutri-run': '1',
                    onClick: () => run(false),
                  }, '让 AI 给饮食建议'),
                  h('span', { className: 'gp-nutri-muted', style: { marginTop: 0 } },
                    '只在点击时调用模型，约消耗一次对话额度')))
      }

      return h('div', { className: 'gp-card gp-nutri gp-span', ...rest },
        h('h3', null, 'AI 营养建议'),
        body)
    }

    /* ---------------------------------------------------------------- *
     * 活动平铺卡片 + 月度分布
     * ---------------------------------------------------------------- */
    const OUTDOOR_RE = /bik|cycl|bike|run|hik|walk|swim|row|kayak|ski|snow|golf|骑|跑|走|徒步|泳|划/i

    /** 只有可能带 GPS 的户外活动才去拉轨迹（室内/力量/距离为 0 直接跳过） */
    function gpsCandidate(a) {
      if (!a || typeof a !== 'object') return false
      if (a.has_gps === true || a.hasGps === true || a.has_track === true || a.track === true) return true
      if (a.has_gps === false || a.hasGps === false) return false
      const type = String(firstOf(a.type, a.activity_type, '') ?? '')
      // 室内 / 力量 / 瑜伽等不可能有 GPS，直接跳过（不浪费一次轨迹请求）
      if (/indoor|virtual|treadmill|strength|weight|yoga|pilates|meditation/i.test(type)) return false
      const distance = numOf(a.distance_meters, a.distanceMeters) || 0
      return distance > 0 && OUTDOOR_RE.test(type)
    }

    const activityDay = (a) => dayPart(firstOf(a?.start_time, a?.startTimeLocal, a?.start_time_local,
      a?.startTimeGmt, a?.start_time_gmt))
    const activityType = (a) => String(firstOf(a?.type, a?.activity_type, a?.sport, '') ?? '')

    /** 近 30 天、最多 12 条；返回值按时间倒序 */
    function recentActivityTiles(data, today) {
      const list = Array.isArray(data?.activities) ? data.activities : []
      const todayDay = dayPart(today) || isoDay(new Date())
      const cutoff = shiftDay(todayDay, -30)
      return list
        .filter((a) => a && activityDay(a))
        .filter((a) => {
          const day = activityDay(a)
          return day >= cutoff && day <= todayDay
        })
        .sort((a, b) => String(activityDay(b)).localeCompare(String(activityDay(a))))
        .slice(0, 12)
    }

    function ActivityTile({ activity, track, onOpen }) {
      const id = activity.id
      const day = activityDay(activity)
      const time = timePart(firstOf(activity.start_time, activity.startTimeLocal, activity.start_time_local))
      const type = activityType(activity)
      const icon = sportIconKey(type)
      const distanceM = numOf(activity.distance_meters, activity.distanceMeters)
      const calories = numOf(activity.calories)
      const avgHr = numOf(activity.avg_hr_bpm, activity.averageHR)

      let media
      if (track?.status === 'loading') {
        media = h('div', { className: 'gp-tile-thumb sk', 'data-gp-tile-track': 'loading' })
      } else if (track?.status === 'ok' && track.points) {
        media = h('div', { className: 'gp-tile-thumb', 'data-gp-tile-track': 'ok' },
          h('svg', {
            viewBox: '0 0 120 64', role: 'img', 'aria-label': '活动轨迹缩略图',
          },
            h('polyline', {
              points: track.points,
              fill: 'none',
              stroke: 'var(--gp-green)',
              strokeWidth: 1.6,
              strokeLinejoin: 'round',
              strokeLinecap: 'round',
            })))
      } else {
        media = h('div', { className: 'gp-tile-fb', 'data-gp-tile-track': track?.status || 'none' },
          h('div', { className: 'cal' }, fmt(calories), h('small', null, calories !== null ? 'kcal' : '')),
          h('div', { className: 'hr' }, avgHr !== null ? `${fmt(avgHr)} bpm` : '心率 —'),
          h('div', { className: 'nt' }, '无轨迹'))
      }

      return h('div', {
        className: 'gp-tile',
        role: 'button',
        tabIndex: 0,
        title: activity.name || '活动',
        'data-gp-tile': String(id),
        'data-sport': type,
        'data-icon': icon,
        onClick: () => onOpen?.(id),
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen?.(id)
          }
        },
      },
        h('div', { className: 'gp-tile-hd' },
          h('span', { className: 'gp-tile-ic' }, h(SportIcon, { type })),
          h('span', null, shortDay(day)),
          time ? h('span', { style: { color: 'var(--gp-t3)' } }, time) : null),
        h('div', { className: 'gp-tile-name' }, activity.name || `活动 ${id}`),
        media,
        h('div', { className: 'gp-tile-ft' },
          h('span', null, distanceM !== null && distanceM > 0
            ? `${fmt(distanceM / 1000, 1)} km`
            : '—'),
          h('span', { 'aria-hidden': true }, '·'),
          h('span', null, clock(activity.duration_seconds)),
          h('span', { className: 'ty' }, SPORT_ZH[type] || type || '运动')))
    }

    function ActivityTilesCard({ tiles, total, loading, advanced, tracks, onOpen, ...rest }) {
      let body
      if (loading && !tiles.length) {
        body = h('div', { className: 'gp-tiles' },
          Array.from({ length: 6 }, (_, i) => h('div', { key: i, className: 'gp-tile' },
            h('div', { className: 'gp-skel', style: { height: 14, width: '62%' } }),
            h('div', { className: 'gp-skel', style: { height: 64, marginTop: 5 } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '80%', marginTop: 4 } }))))
      } else if (!tiles.length) {
        body = h('div', { className: 'gp-empty', style: { margin: '4px 2px' } },
          h('b', null, '近 30 天没有活动记录'))
      } else {
        body = h('div', { className: 'gp-tiles' }, tiles.map((a) => h(ActivityTile, {
          key: a.id,
          activity: a,
          track: advanced && gpsCandidate(a) ? tracks[String(a.id)] : null,
          onOpen,
        })))
      }
      return h('div', { className: 'gp-card gp-tiles-wrap', 'data-gp-tiles': '1', ...rest },
        body,
        h('div', { className: 'gp-tiles-foot' },
          h('span', null, `近 30 天 · ${tiles.length} 场`),
          total > tiles.length
            ? h('span', { className: 'sp' },
                h('a', {
                  className: 'gp-btn',
                  href: 'https://connect.garmin.com/modern/activities',
                  target: '_blank',
                  rel: 'noreferrer',
                  'data-gp-act-all': '1',
                }, '查看全部'))
            : null))
    }

    function heatBucket(load, max) {
      if (!load || !max || load <= 0) return 0
      const ratio = load / Math.max(1, max)
      if (ratio > 0.8) return 5
      if (ratio > 0.55) return 4
      if (ratio > 0.3) return 3
      if (ratio > 0.1) return 2
      return 1
    }

    const HEAT_COLORS = [
      null,
      'color-mix(in srgb, var(--gp-green) 20%, transparent)',
      'color-mix(in srgb, var(--gp-green) 46%, transparent)',
      'color-mix(in srgb, var(--gp-amber) 58%, transparent)',
      'color-mix(in srgb, var(--gp-amber) 78%, var(--gp-red))',
      'var(--gp-red)',
    ]

    function MonthHeatCard({ calendar, loading, error, monthKey, note = null, ...rest }) {
      const days = Array.isArray(calendar?.days) ? calendar.days : []
      const byDay = {}
      for (const row of days) {
        const key = dayPart(row?.date)
        if (key) byDay[key] = row
      }
      const grid = monthGrid(monthKey)
      const maxLoad = numOf(calendar?.maxDayLoad)
        ?? Math.max(0, ...days.map((row) => numOf(row?.load) ?? 0))
      const counts = days.reduce((sum, row) => sum + (numOf(row?.count) ?? 0), 0)
      const totals = calendar?.totals && typeof calendar.totals === 'object'
        ? calendar.totals
        : { count: counts }
      const byType = Array.isArray(calendar?.byType) ? calendar.byType : []

      let body
      if (loading && !calendar) {
        body = h('div', { className: 'gp-heat-grid' },
          Array.from({ length: 14 }, (_, i) => h('div', {
            key: i, className: 'gp-heat-cell', style: { opacity: 0.4 },
          })))
      } else if (error) {
        body = h('div', { className: 'gp-heat-empty' }, '本月分布暂不可用')
      } else if (!counts) {
        body = h('div', { className: 'gp-heat-empty' }, '本月还没有活动记录')
      } else {
        const cells = []
        for (let i = 0; i < grid.firstDow; i++) {
          cells.push(h('div', { key: `e${i}`, className: 'gp-heat-cell empty' }))
        }
        for (let d = 1; d <= grid.days; d++) {
          const day = `${monthKey}-${pad2(d)}`
          const row = byDay[day]
          const count = numOf(row?.count) ?? 0
          const load = numOf(row?.load) ?? 0
          const bucket = heatBucket(load, maxLoad)
          const title = count > 0
            ? `${shortDay(day)} · ${fmt(count)} 次 · ${fmt(numOf(row?.distanceKm) ?? 0, 1)} km · ${fmt(numOf(row?.durationMin) ?? 0)} 分钟`
            : `${shortDay(day)} · 无运动`
          cells.push(h('div', {
            key: day,
            className: `gp-heat-cell${bucket ? ` b${bucket}` : ''}`,
            title,
            'data-gp-heat-day': day,
            'data-gp-heat-bucket': String(bucket),
          }, String(d)))
        }
        body = h(React.Fragment, null,
          h('div', { className: 'gp-heat-week' },
            ['一', '二', '三', '四', '五', '六', '日'].map((wd) =>
              h('div', { key: wd, className: 'gp-heat-wd' }, wd))),
          h('div', { className: 'gp-heat-grid' }, ...cells),
          h('div', { className: 'gp-heat-legend' },
            h('span', null, '少'),
            HEAT_COLORS.slice(1).map((color, i) => h('i', {
              key: i, style: { background: color, width: 10, height: 10 },
            })),
            h('span', null, '多')),
          h('div', { className: 'gp-heat-tot' },
            `${fmt(numOf(totals.count) ?? counts)} 次 · ${fmt(numOf(totals.distanceKm) ?? 0, 1)} km · ${fmt(numOf(totals.durationMin) ?? 0)} 分钟`),
          byType.length
            ? h('div', { className: 'gp-heat-types' }, byType.map((row, i) => h('span', {
                key: `${row?.type ?? 'x'}-${i}`,
                className: 'gp-heat-chip',
              }, `${SPORT_ZH[row?.type] || row?.type || '其他'} ${fmt(numOf(row?.count) ?? 0)} · ${fmt(numOf(row?.distanceKm) ?? 0)} km`)))
            : null)
      }

      return h('div', { className: 'gp-card gp-heat', 'data-gp-heat': '1', ...rest },
        h('div', { className: 'gp-heat-hd' },
          h('b', null, '本月运动分布'),
          h('span', { className: 'sp' }, monthLabel(monthKey)),
          note ? h('span', { className: 'gp-heat-note' }, note) : null),
        body)
    }

    /* ---------------------------------------------------------------- *
     * B 类：训练计划（本周课表 / Garmin Coach / 目标）
     * ---------------------------------------------------------------- */
    function PlanWeekCard({ data, loading, showToast = null, ...rest }) {
      const today = isoDay(new Date())
      const week = data?.week || null
      const workouts = Array.isArray(data?.workouts) ? data.workouts : []
      const links = planLinks(data)
      const coachRows = Array.isArray(data?.coach?.workouts) ? data.coach.workouts : []
      const start = planWeekStart(week)
      const end = firstOf(dayPart(week?.end), start ? shiftDay(start, 6) : null)
      const days = start
        ? Array.from({ length: 7 }, (_, i) => {
            const date = shiftDay(start, i)
            const found = planWorkoutAt(workouts, date)
            return {
              date,
              weekday: WEEKDAYS_ZH[i],
              workout: found ? found.workout : null,
              count: found ? found.count : 0,
            }
          })
        : []
      const [pop, setPop] = React.useState(null)
      const closeDetail = React.useCallback(() => setPop(null), [])

      const copyDetail = (day, message) => {
        const workout = day?.workout
        if (!workout) return
        copyText(planDetailText(day, workout, links, planSourceOf(workout, coachRows)))
          .then((ok) => {
            showToast?.(ok ? message : '复制失败：请手动复制', ok ? 'ok' : 'err')
          })
      }

      const copyWeek = () => {
        copyText(planWeekText(days)).then((ok) => {
          showToast?.(ok ? '已复制本周课表' : '复制失败：请手动复制', ok ? 'ok' : 'err')
        })
      }
      const copyWeekPrompt = () => {
        copyText(PLAN_AI_WEEK_PROMPT).then((ok) => {
          showToast?.(ok ? '已复制一周安排提示，去「AI 教练」提问' : '复制失败：请手动复制',
            ok ? 'ok' : 'err')
        })
      }

      const openDetail = (day, el) => {
        if (!day?.workout) return
        const width = 272
        const height = 236
        const rect = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null
        let left = 16
        let top = 120
        if (rect) {
          left = rect.left + rect.width / 2 - width / 2
          top = rect.bottom + 6
          if (top + height > window.innerHeight - 8) {
            top = Math.max(8, rect.top - height - 6)
          }
        }
        left = Math.max(8, Math.min(left, window.innerWidth - width - 8))
        setPop({ date: day.date, left, top })
      }

      const popDay = pop ? days.find((day) => day.date === pop.date) : null
      const popWorkout = popDay ? popDay.workout : null
      const emptyWeek = !!data && !loading && days.length === 7
        && days.every((day) => !day.workout)

      let body
      if (loading && !data) {
        body = h(Skel, { h: 110 })
      } else if (!data) {
        body = h('div', { className: 'gp-deep-muted' }, '课表加载失败，稍后重试')
      } else {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-plan-week' }, days.map((day) => {
            const workout = day.workout
            const isToday = day.date === today
            const cls = [
              'gp-plan-day',
              isToday ? 'is-today' : '',
              workout ? '' : 'is-rest',
              workout?.completed ? 'is-done' : '',
            ].filter(Boolean).join(' ')
            return h('div', {
              key: day.date,
              className: cls,
              role: workout ? 'button' : undefined,
              tabIndex: workout ? 0 : undefined,
              title: workout
                ? `${planWorkoutName(workout)} · ${planDurationText(workout.durationMin) || '时长未标注'} · 左键详情 · 右键复制`
                : '休息',
              'data-gp-plan-day': day.date,
              'data-gp-plan-today': isToday ? '1' : undefined,
              'data-gp-plan-rest': workout ? undefined : '1',
              'data-gp-plan-done': workout?.completed ? '1' : undefined,
              'data-gp-plan-workout-id': workout?.workoutId != null
                ? String(workout.workoutId)
                : undefined,
              onClick: workout ? (e) => openDetail(day, e.currentTarget) : undefined,
              onContextMenu: workout
                ? (e) => {
                    e.preventDefault()
                    copyDetail(day, `已复制：${planWorkoutName(workout)}`)
                  }
                : undefined,
              onKeyDown: workout
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openDetail(day, e.currentTarget)
                    }
                  }
                : undefined,
            },
              workout
                ? h('button', {
                    type: 'button',
                    className: 'gp-plan-copy',
                    'aria-label': '复制训练详情',
                    title: '复制训练详情',
                    'data-gp-plan-copy-detail': day.date,
                    onClick: (e) => {
                      e.stopPropagation()
                      closeDetail()
                      copyDetail(day, `已复制：${planWorkoutName(workout)}`)
                    },
                  }, '⧉')
                : null,
              h('div', { className: 'gp-plan-wd' },
                day.weekday,
                isToday ? h('span', { style: { color: 'var(--gp-blue)' } }, '今天') : null),
              h('div', { className: 'gp-plan-date' }, shortDay(day.date)),
              workout
                ? h('div', { className: 'gp-plan-ic' }, h(SportIcon, { type: workout.type, size: 14 }))
                : null,
              workout
                ? h('div', { className: 'gp-plan-name' }, planWorkoutName(workout))
                : h('div', { className: 'gp-plan-rest' }, '休息'),
              workout
                ? h('div', { className: 'gp-plan-meta' },
                    planDurationText(workout.durationMin) || '—',
                    day.count > 1 ? ` · +${day.count - 1}` : '',
                    workout.completed ? h('span', { className: 'gp-plan-check' }, '✓') : null)
                : null)
          })),
          emptyWeek
            ? h('div', { className: 'gp-plan-empty', 'data-gp-plan-empty-week': '1' },
                h('div', { className: 'gp-plan-empty-t' }, '本周没有训练安排'),
                h('div', { className: 'gp-plan-empty-a' },
                  h('a', {
                    className: 'gp-btn',
                    href: links.calendar,
                    target: '_blank',
                    rel: 'noreferrer',
                    'data-gp-plan-empty-calendar': '1',
                  }, '在 Garmin 安排训练'),
                  h('button', {
                    type: 'button',
                    className: 'gp-btn',
                    'data-gp-plan-empty-ai': '1',
                    onClick: copyWeekPrompt,
                  }, '让 AI 帮我安排一周')))
            : null,
          h('div', { className: 'gp-plan-foot' },
            h('span', null,
              `${start ? `${shortDay(start)} – ${shortDay(end)} · ` : ''}只读`),
            h('span', { className: 'sp' },
              h('a', {
                className: 'gp-plan-hdlink',
                href: links.calendar,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-edit-link': '1',
              }, '编辑请到 Garmin Connect'),
              h('a', {
                className: 'gp-plan-hdlink',
                href: links.workouts,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-library': '1',
              }, '课库 ↗'))))
      }

      return h('div', {
        className: 'gp-card gp-span gp-plan-week-card',
        'data-gp-plan-week': '1',
        ...rest,
      },
        h('h3', { className: 'gp-plan-hd' },
          '本周课表',
          h('span', { className: 'sp' },
            h('a', {
              className: 'gp-plan-hdlink',
              href: links.calendar,
              target: '_blank',
              rel: 'noreferrer',
              title: '在 Garmin Connect 打开训练日历',
              'data-gp-plan-calendar': '1',
            }, '在 Garmin 打开'),
            h('button', {
              type: 'button',
              className: 'gp-plan-hdlink',
              title: '复制本周 7 天课表',
              'data-gp-plan-copy-week': '1',
              onClick: copyWeek,
            }, '复制整周课表'))),
        body,
        pop && popWorkout
          ? h(PlanDetailPopover, {
              key: `pop-${pop.date}`,
              day: popDay,
              workout: popWorkout,
              source: planSourceOf(popWorkout, coachRows),
              links,
              pos: { left: pop.left, top: pop.top },
              showToast,
              onClose: closeDetail,
            })
          : null)
    }

    function PlanCoachCard({ data, loading, ...rest }) {
      const coach = data?.coach && typeof data.coach === 'object' ? data.coach : null
      const workouts = Array.isArray(coach?.workouts) ? coach.workouts.slice() : []
      const planName = firstOf(coach?.planName, coach?.name)
      const hasCoach = !!(coach && (planName || workouts.length))
      const links = planLinks(data)
      const totalMin = workouts.reduce((sum, row) => sum + (numOf(row?.durationMin) ?? 0), 0)
      const rows = workouts
        .slice()
        .sort((a, b) => String(firstOf(a?.date, '')).localeCompare(String(firstOf(b?.date, ''))))
        .slice(0, 3)

      let body
      if (loading && !data) {
        body = h(Skel, { h: 70 })
      } else if (!hasCoach) {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-plan-empty', 'data-gp-plan-coach-empty': '1' },
            h('div', { className: 'gp-plan-empty-t' }, '未启用 Garmin Coach 计划'),
            h('div', { className: 'gp-plan-empty-a' },
              h('a', {
                className: 'gp-btn',
                href: links.coach,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-coach-open': '1',
              }, '去开启'))),
          h('div', { className: 'gp-plan-ro' },
            h('span', null, '只读 · 编辑请到 Garmin Connect'),
            h('span', { className: 'sp' },
              h('a', {
                href: links.coach,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-coach-manage': '1',
              }, 'Garmin Coach ↗'))))
      } else {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-plan-coach-name' }, String(planName || 'Garmin Coach 计划')),
          h('div', { className: 'gp-plan-coach-sum' },
            `本周 ${workouts.length} 节`,
            totalMin > 0 ? ` · 共 ${planDurationText(totalMin)}` : ''),
          rows.length
            ? h('div', { style: { marginTop: 7 } }, rows.map((row, i) => h('div', {
                key: `${firstOf(row?.id, i)}-${i}`,
                className: 'gp-plan-coach-row',
              },
                h('span', { className: 'd' }, shortDay(firstOf(row?.date))),
                h('span', { className: 'n' }, planWorkoutName(row)),
                h('span', { className: 't' }, planDurationText(row?.durationMin) || ''))))
            : null,
          h('div', { className: 'gp-plan-ro' },
            h('span', null, '只读 · 编辑请到 Garmin Connect'),
            h('span', { className: 'sp' },
              h('a', {
                href: links.coach,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-coach-manage': '1',
              }, '管理计划 ↗'))))
      }

      return h('div', {
        className: 'gp-card',
        'data-gp-plan-coach': '1',
        ...rest,
      },
        h('h3', null, 'Garmin Coach'),
        body)
    }

    function PlanGoalsCard({ data, loading, ...rest }) {
      const goals = (Array.isArray(data?.goals) ? data.goals : [])
        .filter((row) => row && typeof row === 'object')
      const links = planLinks(data)
      let body
      if (loading && !data) {
        body = h(Skel, { h: 70 })
      } else if (!goals.length) {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-plan-empty', 'data-gp-plan-goals-empty': '1' },
            h('div', { className: 'gp-plan-empty-t' }, '没有进行中的目标'),
            h('div', { className: 'gp-plan-empty-a' },
              h('a', {
                className: 'gp-btn',
                href: links.goals,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-goals-open': '1',
              }, '去设置目标'))),
          h('div', { className: 'gp-plan-ro' },
            h('span', null, '只读 · 编辑请到 Garmin Connect'),
            h('span', { className: 'sp' },
              h('a', {
                href: links.goals,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-goals-manage': '1',
              }, '目标设置 ↗'))))
      } else {
        body = h(React.Fragment, null, goals.map((goal, i) => {
          const type = firstOf(goal?.type, goal?.kind, '')
          const target = numOf(goal?.target)
          const current = numOf(goal?.current) ?? 0
          const pct = target !== null && target > 0 ? clampPct((current / target) * 100) : 0
          const remain = target !== null ? Math.max(0, target - current) : null
          const unit = goalUnitText(type)
          const period = firstOf(goal?.period, goal?.range)
          const endDate = dayPart(goal?.endDate)
          return h('div', {
            key: `${type || 'goal'}-${i}`,
            className: 'gp-plan-goal',
            'data-gp-plan-goal': String(type || 'goal'),
            'data-gp-plan-goal-pct': String(pct),
          },
            h('div', { className: 'hd' },
              h('b', null, goalTypeText(type), period ? ` · ${period}` : ''),
              h('span', { className: 'sp' },
                `${goalNumber(current) ?? '—'} / ${target !== null ? goalNumber(target) : '—'}${unit ? ` ${unit}` : ''}`)),
            h('div', { className: 'bar' },
              h('i', {
                style: {
                  width: `${pct}%`,
                  background: pct >= 100 ? 'var(--gp-green)' : 'var(--gp-blue)',
                },
              })),
            h('div', { className: 'ft' },
              remain === null ? '目标值未标注'
                : remain <= 0 ? '已达成'
                  : `还差 ${goalNumber(remain)}${unit ? ` ${unit}` : ''}`,
              endDate ? ` · ${endDate} 截止` : ''))
        }),
        h('div', { className: 'gp-plan-ro' },
          h('span', null, '只读 · 编辑请到 Garmin Connect'),
          h('span', { className: 'sp' },
            h('a', {
              href: links.goals,
              target: '_blank',
              rel: 'noreferrer',
              'data-gp-plan-goals-manage': '1',
            }, '目标设置 ↗'))))
      }

      return h('div', {
        className: 'gp-card',
        'data-gp-plan-goals': '1',
        ...rest,
      },
        h('h3', null, '目标'),
        body)
    }

    /* ---------------------------------------------------------------- *
     * B 类：女性健康（周期 / 孕期）
     * ---------------------------------------------------------------- */
    function WomensCycleCard({ data, loading, ...rest }) {
      const cycle = data?.status === 'ok' && data.cycle && typeof data.cycle === 'object'
        ? data.cycle
        : null
      const phase = firstOf(cycle?.phase)
      const lastStart = dayPart(cycle?.lastStartDate)
      const nextStart = dayPart(cycle?.predictedNextStart)
      const length = numOf(cycle?.cycleLengthDays)

      let body
      if (loading && !data) {
        body = h(Skel, { h: 80 })
      } else if (!cycle) {
        body = h('div', { className: 'gp-wm-muted', 'data-gp-wm-empty': '1' }, '未记录')
      } else {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-wm-phase' }, phase ? String(phase) : '未记录'),
          h('div', { className: 'gp-wm-row' },
            h('span', { className: 'lb' }, '上次开始'),
            h('b', null, lastStart || '未记录')),
          h('div', { className: 'gp-wm-row' },
            h('span', { className: 'lb' }, '平均周期'),
            h('b', null, length !== null ? `${fmt(length)} 天` : '未记录')),
          h('div', { className: 'gp-wm-row' },
            h('span', { className: 'lb' }, '当前阶段'),
            h('b', null, phase ? String(phase) : '未记录')),
          h('div', { className: 'gp-wm-row' },
            h('span', { className: 'lb' }, '预测下次'),
            h('b', null, nextStart || '未记录')))
      }

      return h('div', {
        className: 'gp-card',
        'data-gp-womens-cycle': '1',
        ...rest,
      },
        h('h3', null, '周期'),
        body)
    }

    function WomensPregnancyCard({ data, loading, ...rest }) {
      const pregnancy = data?.status === 'ok' && data.pregnancy && typeof data.pregnancy === 'object'
        ? data.pregnancy
        : null
      const week = numOf(pregnancy?.week)
      const dueDate = dayPart(pregnancy?.dueDate)

      let body
      if (loading && !data) {
        body = h(Skel, { h: 70 })
      } else if (!pregnancy) {
        body = h('div', { className: 'gp-wm-muted', 'data-gp-wm-preg-empty': '1' }, '未记录')
      } else {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-wm-preg' },
            h('span', { className: 'big' }, week !== null ? fmt(week) : '—'),
            h('small', null, '周')),
          h('div', { className: 'gp-wm-row' },
            h('span', { className: 'lb' }, '预产期'),
            h('b', null, dueDate || '未记录')))
      }

      return h('div', {
        className: 'gp-card',
        'data-gp-womens-pregnancy': '1',
        ...rest,
      },
        h('h3', null, '孕期'),
        body)
    }

    /** 一个可拖拽的区块槽：编辑态套虚线框，左上 ⠿ 手柄、右上 × 隐藏 */
    function SectionSlot({
      id, label, node, editing, index, draggingId,
      onDragStart, onDragOver, onDrop, onDragEnd, onRemove,
    }) {
      const dragging = editing && draggingId === id
      return h('div', {
        className: `gp-slot${editing ? ' is-editing' : ''}${dragging ? ' is-dragging' : ''}`,
        'data-gp-slot': id,
        'data-gp-slot-index': index,
        draggable: editing ? true : undefined,
        onDragStart: editing ? (e) => onDragStart(e, id) : undefined,
        onDragOver: editing ? (e) => onDragOver(e, index) : undefined,
        onDrop: editing ? (e) => onDrop(e, index) : undefined,
        onDragEnd: editing ? onDragEnd : undefined,
      },
        editing
          ? h('div', { className: 'gp-slot-tools' },
              h('span', { className: 'gp-slot-handle', title: '拖动排序', 'aria-hidden': true }, '⠿'),
              h('span', { className: 'gp-slot-label', title: label }, label),
              h('button', {
                type: 'button',
                className: 'gp-slot-remove',
                title: `隐藏「${label}」`,
                'aria-label': `隐藏 ${label}`,
                'data-gp-remove': id,
                onClick: () => onRemove(id),
              }, '×'))
          : null,
        h('div', {
          className: 'gp-slot-body',
          /* 编辑态内容不可点：pointer-events 拦不住 dispatchEvent，捕获阶段再兜一层 */
          onClickCapture: editing ? lockSlotContent : undefined,
          onKeyDownCapture: editing ? lockSlotContent : undefined,
        }, node))
    }

    /**
     * 一个可拖拽的卡片槽：比区块槽更细的虚线框，左上 ⠿、右上 ×。
     * 卡片只能在所属板块内拖拽（sectionId 作为拖拽作用域）。
     */
    function CardSlot({
      sectionId, id, label, node, index, draggingId,
      onDragStart, onDragOver, onDrop, onDragEnd, onRemove,
    }) {
      const dragging = draggingId === id
      return h('div', {
        className: `gp-card-slot is-editing${dragging ? ' is-dragging' : ''}`,
        'data-gp-card-slot': `${sectionId}:${id}`,
        'data-gp-card-section': sectionId,
        'data-gp-card': id,
        'data-gp-card-index': index,
        draggable: true,
        onDragStart: (e) => onDragStart(e, sectionId, id),
        onDragOver: (e) => onDragOver(e, sectionId, index),
        onDrop: (e) => onDrop(e, sectionId, index),
        onDragEnd,
      },
        h('div', { className: 'gp-card-tools' },
          h('span', { className: 'gp-card-handle', title: '拖动排序', 'aria-hidden': true }, '⠿'),
          h('span', { className: 'gp-card-label', title: label }, label),
          h('button', {
            type: 'button',
            className: 'gp-card-remove',
            title: `隐藏「${label}」`,
            'aria-label': `隐藏 ${label}`,
            'data-gp-card-remove': id,
            'data-gp-card-section': sectionId,
            onClick: () => onRemove(sectionId, id),
          }, '×')),
        h('div', {
          className: 'gp-card-slot-body',
          onClickCapture: lockSlotContent,
          onKeyDownCapture: lockSlotContent,
        }, node))
    }

    /** 卡片拖拽中的插入占位：与拖动源同高，顶边 3px 插入线 */
    function CardGhost({ height, onDragOver, onDrop }) {
      return h('div', {
        className: 'gp-card-ghost',
        'data-gp-card-ghost': '1',
        style: height ? { height: `${height}px` } : undefined,
        onDragOver,
        onDrop,
      },
        h('div', { className: 'gp-card-insert', 'aria-hidden': true }),
        h('span', { className: 'gp-card-ghost-text' }, '放到这里'))
    }

    /**
     * 一个板块的卡片区：非编辑态直接渲染卡片（无额外包装）；
     * 编辑态每张卡包 CardSlot，拖拽时插入等高占位，末尾渲染隐藏卡片的 ＋ 添加 chip。
     */
    function CardGrid({
      sectionId, className, cards, nodes, editing, drag,
      onDragStart, onDragOver, onDrop, onDragEnd, onRemove, onAdd,
    }) {
      const visible = cards.filter((card) => card.visible !== false)
      const hidden = cards.filter((card) => card.visible === false)
      const cap = sectionId === 'kpi' ? 5
        : sectionId === 'body' || sectionId === 'extras' || sectionId === 'advanced' ? 3
          : sectionId === 'load' ? 2 : 0
      /* 全隐藏时保持默认列数，让隐藏卡片 chip 也能成行排列 */
      const cls = cap && visible.length
        ? `${className} n${Math.min(visible.length, cap)}`
        : className
      const children = []
      visible.forEach((card, index) => {
        const ghost = editing && drag.id && drag.sectionId === sectionId && drag.at === index
        if (ghost) {
          children.push(h(CardGhost, {
            key: `cghost-${sectionId}-${index}`,
            height: drag.height,
            onDragOver: (e) => onDragOver(e, sectionId),
            onDrop: (e) => onDrop(e, sectionId, index),
          }))
        }
        const node = nodes[card.id] || h('div', { className: 'gp-empty' }, '这张卡片暂不可用')
        if (editing) {
          children.push(h(CardSlot, {
            key: card.id,
            sectionId,
            id: card.id,
            label: cardLabel(sectionId, card.id),
            node,
            index,
            draggingId: drag.sectionId === sectionId ? drag.id : null,
            onDragStart,
            onDragOver,
            onDrop,
            onDragEnd,
            onRemove,
          }))
        } else {
          children.push(React.cloneElement(node, {
            key: card.id,
            'data-gp-card-id': card.id,
            'data-gp-card-section': sectionId,
          }))
        }
      })
      if (editing && drag.id && drag.sectionId === sectionId && drag.at === visible.length) {
        children.push(h(CardGhost, {
          key: `cghost-${sectionId}-end`,
          height: drag.height,
          onDragOver: (e) => onDragOver(e, sectionId),
          onDrop: (e) => onDrop(e, sectionId, visible.length),
        }))
      }
      if (!visible.length) {
        children.push(h('div', { key: 'cards-empty', className: 'gp-cards-empty' }, '本板块的卡片都已隐藏'))
      }
      if (editing && hidden.length) {
        children.push(h('div', { key: 'card-addrow', className: 'gp-card-addrow' },
          hidden.map((card) => {
            const label = cardLabel(sectionId, card.id)
            return h('button', {
              key: card.id,
              type: 'button',
              className: 'gp-card-add',
              draggable: false,
              'data-gp-card-add': card.id,
              'data-gp-card-section': sectionId,
              title: `添加 ${label}`,
              onDragStart: (e) => e.stopPropagation(),
              onClick: () => onAdd(sectionId, card.id),
            },
              h('span', { className: 'plus', 'aria-hidden': true }, '＋'),
              h('span', { className: 'lb' }, label))
          })))
      }
      return h('div', { className: cls, 'data-gp-cards': sectionId }, ...children)
    }

    /** 拖拽中的插入占位：与拖动源同高，顶边画 3px 插入线 */
    function SlotGhost({ height, onDragOver, onDrop }) {
      return h('div', {
        className: 'gp-slot-ghost',
        'data-gp-ghost': '1',
        style: height ? { height: `${height}px` } : undefined,
        onDragOver,
        onDrop,
      },
        h('div', { className: 'gp-slot-insert', 'aria-hidden': true }),
        h('span', { className: 'gp-slot-ghost-text' }, '放到这里'))
    }

    /** 编辑态底部：隐藏区块的虚线添加框，点击追加到可见顺序末尾 */
    function AddZone({ hidden, onAdd, onDragOver, onDrop }) {
      return h('div', { className: 'gp-addzone', 'data-gp-addzone': '1', onDragOver, onDrop },
        h('div', { className: 'gp-addzone-hd' },
          h('b', null, '添加区块'),
          h('span', { className: 'cnt' }, hidden.length ? `${hidden.length} 个隐藏` : '')),
        hidden.length
          ? h('div', { className: 'gp-addbox-row' }, hidden.map((item) =>
              h('button', {
                key: item.id,
                type: 'button',
                className: 'gp-addbox',
                'data-gp-add': item.id,
                title: `添加 ${item.label}`,
                onClick: () => onAdd(item.id),
              },
                h('span', { className: 'plus', 'aria-hidden': true }, '＋'),
                h('span', { className: 'lb' }, item.label))))
          : h('div', { className: 'gp-addzone-empty' }, '所有区块都已显示'))
    }

    /** 编辑态浮动工具条：重看引导 / 恢复默认 / 完成 */
    function EditBar({ onReset, onDone, onOnboard }) {
      return h('div', {
        className: 'gp-editbar',
        role: 'toolbar',
        'aria-label': '个性化编辑',
        'data-gp-editbar': '1',
      },
        h('span', { className: 'gp-editbar-hint' }, '拖动区块 / 卡片排序 · 点 × 隐藏 · Esc 退出'),
        h('span', { className: 'sp', 'aria-hidden': true }),
        h('button', {
          type: 'button', className: 'gp-btn', 'data-gp-onboard-open': 'editbar', onClick: onOnboard,
        }, '重看新手引导'),
        h('button', {
          type: 'button', className: 'gp-btn', 'data-gp-reset': '1', onClick: onReset,
        }, '恢复默认'),
        h('button', {
          type: 'button', className: 'gp-btn primary', 'data-gp-edit-done': '1', onClick: onDone,
        }, '✓ 完成'))
    }

    /* ---------------------------------------------------------------- *
     * v7：路书工坊（Route Workshop）
     * 次级页面：我的路书 / 导入（行者 / GPX）/ AI 规划
     * ---------------------------------------------------------------- */
    const RB = `${API}/roadbook`
    const RB_TABS = [
      { id: 'mine', label: '我的路书' },
      { id: 'import', label: '导入' },
      { id: 'plan', label: 'AI 规划' },
    ]
    const RB_SOURCE = {
      xingzhe: { label: '行者', cls: 'xz' },
      amap: { label: '高德', cls: 'amap' },
      ai: { label: 'AI', cls: 'ai' },
      gpx: { label: 'GPX', cls: 'gpx' },
    }
    const rbSource = (source) => {
      const key = String(source ?? '').toLowerCase()
      return RB_SOURCE[key] || { label: String(source || '未知'), cls: 'other' }
    }
    const rbKm = (m) =>
      typeof m === 'number' && isFinite(m) ? `${fmt(m / 1000, m >= 100000 ? 0 : 1)} km` : '—'
    const rbMeter = (m) =>
      typeof m === 'number' && isFinite(m) ? `${fmt(m)} m` : '—'
    const rbPointCount = (n) =>
      typeof n === 'number' && isFinite(n) ? `${fmt(n)} 点` : '—'
    const rbDay = (value) => dateOf(value) || stampText(value) || '—'
    const rbErrorText = (data, fallback = '请求失败') => {
      if (!data) return fallback
      const msg = data.message || data.error || fallback
      return data.code ? `${data.code}：${String(msg)}` : String(msg)
    }

    /** 轨迹点统一成 {lat, lon}；数组 / 对象 / 字符串数字都兼容，非法点直接丢弃 */
    function rbPoints(points) {
      const rows = (Array.isArray(points) ? points : [])
        .map((p) => {
          if (Array.isArray(p)) {
            const lat = numOf(p[0])
            const lon = numOf(p[1])
            return lat !== null && lon !== null ? { lat, lon } : null
          }
          const lat = numOf(p?.lat, p?.latitude)
          const lon = numOf(p?.lon, p?.lng, p?.longitude)
          return lat !== null && lon !== null ? { lat, lon } : null
        })
        .filter(Boolean)
      return rows.length >= 2 ? rows : []
    }

    /** 海拔序列 → [{d, e}]；支持 [e…] / [{d,e}] / [{distanceM,elevationM}]；d 单位米 */
    function rbElevationRows(elevation, pointCount = 0, totalDistanceM = null) {
      const rows = Array.isArray(elevation) ? elevation : []
      const out = []
      rows.forEach((row, index) => {
        let d = null
        let e = null
        if (Array.isArray(row)) {
          d = numOf(row[0])
          e = numOf(row[1])
        } else if (typeof row === 'number' || typeof row === 'string') {
          e = numOf(row)
        } else if (row && typeof row === 'object') {
          e = numOf(row.e, row.ele, row.elevationM, row.elevation, row.alt, row.altitude)
          d = numOf(row.d, row.distanceM, row.dist, row.distance)
        }
        if (e === null) return
        out.push({ i: index, d, e })
      })
      if (out.length < 2) return []
      const allD = out.every((r) => r.d !== null)
      const span = Math.max(1, pointCount - 1)
      const total = numOf(totalDistanceM)
      const fallbackTotal = total !== null && total > 0 ? total : 1000
      return out.map((r) => ({
        d: allD ? r.d : (pointCount > 1 ? (r.i / span) * fallbackTotal : r.i),
        e: r.e,
      }))
    }
    function rbElevGain(rows) {
      let out = 0
      for (let i = 1; i < rows.length; i++) {
        const delta = rows[i].e - rows[i - 1].e
        if (delta > 0) out += delta
      }
      return Math.round(out)
    }

    /** 大轨迹降采样：保留首尾，SVG polyline 不至于塞入上千个点 */
    function rbDownsample(rows, max = 240) {
      if (!Array.isArray(rows) || rows.length <= max) return rows
      const step = rows.length / max
      const out = []
      for (let i = 0; i < max; i++) out.push(rows[Math.floor(i * step)])
      out.push(rows[rows.length - 1])
      return out
    }

    /** 高德候选地点坐标 → "lng,lat" */
    function rbLocale(location) {
      if (Array.isArray(location)) {
        const lng = numOf(location[0])
        const lat = numOf(location[1])
        return lng !== null && lat !== null ? `${lng},${lat}` : null
      }
      if (location && typeof location === 'object') {
        const lng = numOf(location.lng, location.lon, location.longitude)
        const lat = numOf(location.lat, location.latitude)
        return lng !== null && lat !== null ? `${lng},${lat}` : null
      }
      const text = String(location ?? '').trim()
      return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(text) ? text.replace(/\s+/g, '') : null
    }

    /**
     * 路书 JSON 资源：path 为 /roadbook 之后的路径。
     * enabled=false 不发请求；version 变化重取；卸载/切页 abort。
     */
    function useRbResource(path, version = 0, enabled = true) {
      const [state, setState] = React.useState({ loading: !!enabled })
      React.useEffect(() => {
        if (!enabled || !path) {
          setState({ loading: false })
          return undefined
        }
        const controller = new AbortController()
        let active = true
        setState((prev) => (prev.data ? { ...prev, loading: true } : { loading: true }))
        fetch(`${RB}/${path}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
          .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
          .then((data) => { if (active) setState({ loading: false, data }) })
          .catch((err) => {
            if (!active || err?.name === 'AbortError') return
            setState({ loading: false, error: String(err?.message ?? err) })
          })
        return () => {
          active = false
          controller.abort()
        }
      }, [path, version, enabled])
      return state
    }

    /** 统一 JSON 请求：返回 body（含 status:error），网络错误抛出；signal 可取消 */
    async function rbRequest(method, path, body, signal) {
      const res = await fetch(`${RB}/${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body ?? {}),
        signal,
      })
      let data = null
      try { data = await res.json() } catch { data = null }
      if (!res.ok && !data) throw new Error(`HTTP ${res.status}`)
      return data
    }
    const rbPost = (path, body, signal) => rbRequest('POST', path, body, signal)
    const rbPatch = (path, body, signal) => rbRequest('PATCH', path, body, signal)

    /** AI 规划的进度阶段（时间驱动，最后一步停在「估算海拔」） */
    const RB_AI_STAGES = ['解析条件', '搜索地点', '规划路线', '估算海拔']
    /** 多日行程的阶段（时间驱动，最后一步停在「估算海拔」） */
    const RB_AI_MULTI_STAGES = ['解析需求', '联网参考', '规划每日路线', '估算海拔']
    const RB_MULTI_MIN_DAYS = 2
    const RB_MULTI_MAX_DAYS = 15
    /**
     * 多日行程的失败码 → 面板文案。
     * 后端 /roadbook/ai-plan-multi 的错误码：INVALID_JSON（模型没返回 JSON）、
     * INVALID_ITINERARY（天数 / 地名排不通）、PLANNING_FAILED（每天都没排出路线）、
     * LLM_UNAVAILABLE（模型未就绪）；AI_UNAVAILABLE 是旧 mock / 网关的兼容别名。
     */
    const RB_MULTI_ERRORS = {
      INVALID_ITINERARY: {
        title: '行程需求需要调整',
        message: 'AI 没能按你的天数排出一份合理的多日行程。',
        hint: '试试把天数改成 2–15 之间的其他值，或在需求里写清每天的里程区间、想去的城市与路段，再生成一次。',
      },
      INVALID_JSON: {
        title: 'AI 返回的行程格式不正确',
        message: '模型这次没有返回可解析的行程 JSON，点「重试」通常就能恢复。',
        hint: '连续失败时把需求写短一点：先写天数，再写每天里程和想经过的城市 / 路段。',
      },
      PLANNING_FAILED: {
        title: '没能排出可骑行的路线',
        message: '这次所有天都没有规划出可用的路线，通常是地名太泛或路网缺失。',
        hint: '换一组更常见的地名（起点 / 终点，例如「海口」「文昌」），或把天数、总里程放宽一点再试。',
      },
      LLM_UNAVAILABLE: {
        title: 'AI 规划暂不可用',
        message: 'AI 服务暂时不可用（模型未就绪或调用失败）。',
        hint: '稍后再点「重试」，或改回「单日」用「高级选项」手动规划路线。',
        unavailable: true,
      },
    }
    /** 失败码归一：大小写、AI_UNAVAILABLE → LLM_UNAVAILABLE */
    const rbMultiErrorKey = (code) => {
      const key = String(code || '').toUpperCase()
      return key === 'AI_UNAVAILABLE' ? 'LLM_UNAVAILABLE' : key
    }
    /** diagnostics.dayErrors 的单天序号（后端可能给 1 基 day，也可能给 0 基 dayIndex） */
    const rbDiagDayNo = (item, index) => {
      const day = numOf(item?.day)
      if (day !== null && day >= 1) return Math.round(day)
      const dayIndex = numOf(item?.dayIndex)
      return dayIndex !== null ? Math.round(dayIndex) + 1 : index + 1
    }
    const rbDiagRows = (diagnostics) => {
      const list = diagnostics && Array.isArray(diagnostics.dayErrors) ? diagnostics.dayErrors : []
      return list.slice(0, 30)
    }
    const rbDayNumber = (value, fallback = 0) => {
      const n = numOf(value)
      return n === null ? fallback : Math.max(0, Math.round(n))
    }
    const rbTripDays = (trip) => (trip && Array.isArray(trip.days) ? trip.days : [])
    const rbDayOk = (day) => String(day?.status || 'ok') !== 'error'
    const rbDayError = (day) => String(day?.status || '') === 'error'
      ? String(day?.message || day?.error || '这一天的路线生成失败')
      : ''
    const rbDiffSummary = (days) => {
      const counts = { easy: 0, medium: 0, hard: 0 }
      days.forEach((day) => {
        const diff = rbDifficulty(day?.difficulty)
        if (diff) counts[diff.key] += 1
      })
      const parts = []
      if (counts.easy) parts.push(`轻松 ${counts.easy}`)
      if (counts.medium) parts.push(`适中 ${counts.medium}`)
      if (counts.hard) parts.push(`较难 ${counts.hard}`)
      return parts.length ? parts.join(' · ') : ''
    }
    const rbTripTotals = (trip) => {
      const days = rbTripDays(trip).filter(rbDayOk)
      let distanceM = 0
      let gainM = 0
      let durationSec = 0
      days.forEach((day) => {
        const d = numOf(day?.distanceM)
        const g = numOf(day?.elevationGainM)
        const t = numOf(day?.durationSec)
        if (d !== null) distanceM += d
        if (g !== null) gainM += g
        if (t !== null) durationSec += t
      })
      const totalD = numOf(trip?.totalDistanceM)
      const totalG = numOf(trip?.totalElevationGainM)
      return {
        distanceM: totalD !== null ? totalD : distanceM,
        gainM: totalG !== null ? totalG : gainM,
        durationSec,
        dayCount: rbTripDays(trip).length,
        difficulty: rbDiffSummary(days),
      }
    }
    const rbDayTitle = (day, index) => {
      const name = String(day?.name || '').trim()
      return name || `第 ${index + 1} 天`
    }
    const rbDayRouteText = (day) => {
      const from = String(day?.from || '').trim()
      const to = String(day?.to || '').trim()
      if (from && to) return `${from} → ${to}`
      return from || to || ''
    }
    const rbTripSourceLinks = (trip) => (trip && Array.isArray(trip.sources) ? trip.sources : [])
      .filter((item) => item && (item.title || item.url))
      .slice(0, 5)
    const RB_DIFFICULTY = {
      easy: { key: 'easy', label: '轻松' },
      medium: { key: 'medium', label: '适中' },
      hard: { key: 'hard', label: '较难' },
    }
    const rbDifficulty = (value) => {
      const key = String(value ?? '').toLowerCase()
      if (RB_DIFFICULTY[key]) return RB_DIFFICULTY[key]
      if (!key) return null
      if (/轻|易|easy/.test(key)) return RB_DIFFICULTY.easy
      if (/中|medium|moderate/.test(key)) return RB_DIFFICULTY.medium
      if (/难|hard|difficult/.test(key)) return RB_DIFFICULTY.hard
      return null
    }
    const rbShape = (loop) => (loop ? '环线' : '点对点')
    const rbPlaceText = (place) => {
      if (!place) return ''
      const name = String(place.name ?? '').trim()
      const address = String(place.address ?? '').trim()
      if (name && address) return `${name}（${address}）`
      return name || address
    }
    const rbAlternatives = (place) => (Array.isArray(place?.alternatives) ? place.alternatives : [])
      .filter((alt) => alt && (typeof alt === 'string' || alt.name || alt.address || alt.location))
      .slice(0, 3)

    /**
     * 卡片缩略图：列表接口只有 meta，按需拉详情（并发 3，按 id 记忆化）。
     * 失败静默降级为「无缩略图」，不影响卡片本身。
     */
    function useRbThumbs(routes, version = 0, enabled = true) {
      const [map, setMap] = React.useState({})
      const key = (Array.isArray(routes) ? routes : []).map((r) => r?.id).filter(Boolean).join(',')
      React.useEffect(() => {
        if (!enabled) {
          setMap({})
          return undefined
        }
        const ids = key ? key.split(',').slice(0, 12) : []
        if (!ids.length) {
          setMap({})
          return undefined
        }
        let active = true
        const store = {}
        const controllers = new Set()
        let cursor = 0
        let inflight = 0
        const commit = () => { if (active) setMap({ ...store }) }
        const pump = () => {
          if (!active) return
          while (inflight < 3 && cursor < ids.length) {
            const id = ids[cursor++]
            inflight += 1
            const controller = new AbortController()
            controllers.add(controller)
            fetch(`${RB}/routes/${encodeURIComponent(id)}`, {
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            })
              .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
              .then((data) => {
                if (!active) return
                const route = data?.route || data
                const pts = rbPoints(route?.points)
                store[id] = pts.length
                  ? {
                      points: pts,
                      elevation: route?.elevation,
                      distanceM: route?.distanceM,
                      elevationGainM: route?.elevationGainM,
                    }
                  : null
              })
              .catch(() => { if (active) store[id] = null })
              .finally(() => {
                controllers.delete(controller)
                inflight -= 1
                commit()
                pump()
              })
          }
        }
        pump()
        return () => {
          active = false
          for (const controller of controllers) {
            try { controller.abort() } catch { /* ignore */ }
          }
          controllers.clear()
        }
      }, [key, version, enabled])
      return map
    }

    /**
     * 共享轨迹预览：有底图时用高德静态图（路线已画在图上），否则退回归一化 SVG；
     * 下面固定 64px 海拔面积图 + 距离/爬升标签。points 为空或非法时渲染占位，不抛错。
     * compact 只画小轨迹（卡片缩略图不请求底图，省配额）。
     */
    function TrackPreview({
      points,
      elevation = null,
      distanceM = null,
      elevationGainM = null,
      height = 190,
      compact = false,
      emptyText = '暂无轨迹数据',
      basemap = true,
      showElevation = true,
    }) {
      const allRows = rbPoints(points)
      const mapRows = rbDownsample(allRows, 700)
      const W = 240
      const PAD = 6
      const H = compact ? 52 : Math.max(160, Math.min(220, Number(height) || 190))
      const [mapRef, mapWidth] = useElementWidth()
      const mapScale = mapWidth > 0 ? Math.min(2, 1600 / mapWidth) : 2
      const map = useStaticMap(mapRows, {
        coord: 'gcj02',
        kind: 'route',
        width: mapWidth > 0 ? Math.max(160, Math.round(mapWidth * mapScale)) : 720,
        height: mapWidth > 0 ? Math.max(120, Math.round(H * mapScale)) : 360,
        enabled: !compact && basemap !== false && mapWidth > 0,
      })
      const [failedUrl, setFailedUrl] = React.useState(null)
      if (!allRows.length) {
        return h('div', {
          className: `gp-rb-track${compact ? ' is-compact' : ''} is-empty`,
          'data-gp-track-empty': '1',
        }, compact ? null : h('div', { className: 'gp-rb-track-empty' }, emptyText))
      }
      const rows = compact ? rbDownsample(allRows, 120) : mapRows
      const lats = rows.map((r) => r.lat)
      const lons = rows.map((r) => r.lon)
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLon = Math.min(...lons)
      const maxLon = Math.max(...lons)
      const midLat = (minLat + maxLat) / 2
      const kx = Math.max(1e-6, Math.cos((midLat * Math.PI) / 180))
      const spanX = Math.max(1e-9, (maxLon - minLon) * kx)
      const spanY = Math.max(1e-9, maxLat - minLat)
      const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY)
      const padX = (W - spanX * scale) / 2
      const padY = (H - spanY * scale) / 2
      const coords = rows.map((r) => [
        padX + (r.lon - minLon) * kx * scale,
        H - padY - (r.lat - minLat) * scale,
      ])
      const line = coords.map((c) => `${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(' ')
      const start = coords[0]
      const end = coords[coords.length - 1]
      const mapUrl = !compact && map.url && map.url !== failedUrl ? map.url : null
      const elevRows = rbElevationRows(elevation, allRows.length, numOf(distanceM))
      const explicitGain = numOf(elevationGainM)
      const gain = explicitGain !== null
        ? explicitGain
        : (elevRows.length ? rbElevGain(elevRows) : null)

      const elevChart = elevRows.length >= 2
        ? h(ElevationProfile, {
            rows: elevRows,
            distanceM: numOf(distanceM),
            height: 64,
          })
        : null

      const trackSvg = h('svg', {
        className: 'gp-rb-track-svg',
        viewBox: `0 0 ${W} ${H}`,
        preserveAspectRatio: 'xMidYMid meet',
        style: { height: `${H}px` },
        role: 'img',
        'data-gp-track': '1',
        'aria-label': compact ? '路线缩略图' : '路线轨迹',
      },
        h('polyline', {
          points: line,
          fill: 'none',
          stroke: 'var(--gp-blue)',
          strokeWidth: compact ? 2.4 : 2,
          strokeLinejoin: 'round',
          strokeLinecap: 'round',
        }),
        h('circle', {
          cx: start[0].toFixed(1), cy: start[1].toFixed(1),
          r: compact ? 2.6 : 3.2, fill: 'var(--gp-green)', stroke: 'none',
        }),
        h('circle', {
          cx: end[0].toFixed(1), cy: end[1].toFixed(1),
          r: compact ? 2.6 : 3.2, fill: 'var(--gp-red)', stroke: 'none',
        }))

      return h('div', {
        className: `gp-rb-track${compact ? ' is-compact' : ''}`,
        'data-gp-track': '1',
      },
        compact
          ? trackSvg
          : h('div', {
              className: 'gp-rb-track-map',
              style: { height: `${H}px` },
              ref: mapRef,
              'data-gp-track-map': mapUrl ? 'basemap' : 'svg',
            },
              mapUrl
                ? h('img', {
                    className: 'gp-rb-track-img',
                    src: mapUrl,
                    alt: '路线地图',
                    draggable: false,
                    'data-gp-basemap': '1',
                    onError: () => setFailedUrl(mapUrl),
                  })
                : trackSvg,
              mapUrl
                ? h('a', {
                    className: 'gp-map-attr',
                    href: 'https://www.amap.com/',
                    target: '_blank',
                    rel: 'noreferrer noopener',
                    title: '高德地图',
                    'data-gp-map-attribution': '1',
                    onClick: (event) => event.stopPropagation(),
                  }, '高德地图')
                : null,
              !mapUrl && map.loading
                ? h('div', {
                    className: 'gp-map-shimmer',
                    'data-gp-map-loading': '1',
                    'aria-hidden': true,
                  })
                : null),
        compact || !showElevation ? null : h('div', {
          className: 'gp-rb-track-elev',
          'data-gp-elev': elevRows.length ? '1' : '0',
        },
          elevChart || h('div', { className: 'gp-rb-track-elev-empty' }, '暂无海拔数据')),
        compact ? null : h('div', { className: 'gp-rb-track-meta' },
          h('span', null, '距离 ', h('b', null, rbKm(numOf(distanceM)))),
          h('span', null, '爬升 ', h('b', null, gain === null ? '—' : rbMeter(gain))),
          h('span', null, rbPointCount(allRows.length))))
    }

    /** 保存 / 导出后的佳明导入指引（折叠；不做任何设备控制） */
    function GarminGuide({ open = false }) {
      return h('details', {
        className: 'gp-rb-garmin',
        'data-gp-garmin-guide': '1',
        open: open || undefined,
      },
        h('summary', null, '如何导入佳明'),
        h('div', { className: 'gp-rb-garmin-body' },
          h('ol', null,
            h('li', null, '打开 Garmin Connect → 训练与计划 → 课程 → 导入。'),
            h('li', null, '选择刚下载或导出的 GPX 文件，保存为课程。'),
            h('li', null, '在码表 / 手表同步课程后即可导航。')),
          h('a', {
            href: 'https://connect.garmin.com/app/courses/import',
            target: '_blank',
            rel: 'noreferrer noopener',
          }, 'https://connect.garmin.com/app/courses/import'),
          h('div', { className: 'gp-rb-hint' },
            '国内账号请用 connect.garmin.cn 的同一入口（登录后进入「课程 → 导入」）。'),
          h('div', { className: 'sep' }),
          h('div', null,
            'USB 文件方式：把 GPX 复制到 Garmin/NewFiles/ 后断开设备，部分设备会自动导入。'),
          h('div', { className: 'gp-rb-hint' },
            '注意：部分设备导入课程时会忽略 GPX 里的海拔，海拔可能显示为 0。'),
          h('div', { className: 'gp-rb-hint' },
            '也可以先下载 GPX，再在 Garmin Connect 网页端按上面的入口手动导入。')))
    }

    /* ---------------------------- 我的路书 ---------------------------- */
    /** PATCH 单条路书：{name?|description?} → route；status 非 ok 时抛出可读错误 */
    async function rbPatchRoute(id, patch, signal) {
      const data = await rbPatch(`routes/${encodeURIComponent(id)}`, patch, signal)
      if (data?.status === 'not_found') throw new Error('路书不存在或已被删除')
      if (data?.status !== 'ok') throw new Error(rbErrorText(data, '保存失败'))
      return data.route || {}
    }

    function RouteMineTab({ version, onRefresh, onGoTab, showToast, highlightId = null }) {
      const list = useRbResource('routes', version)
      const baseRoutes = Array.isArray(list.data?.routes) ? list.data.routes : []
      const [openId, setOpenId] = React.useState(null)
      const [confirmId, setConfirmId] = React.useState(null)
      const [menuId, setMenuId] = React.useState(null)
      const [edit, setEdit] = React.useState(null)
      const [overlay, setOverlay] = React.useState({})
      const [deleting, setDeleting] = React.useState(false)
      const [copyingId, setCopyingId] = React.useState(null)
      /* 行程分组：折叠、删除二次确认、删除后本地立即隐藏 */
      const [collapsedTrips, setCollapsedTrips] = React.useState({})
      const [tripConfirm, setTripConfirm] = React.useState(null)
      const [tripDeleting, setTripDeleting] = React.useState(null)
      const [removedTrips, setRemovedTrips] = React.useState([])
      const deleteAbort = React.useRef(null)
      const editAbort = React.useRef(null)
      const copyAbort = React.useRef(null)
      const tripAbort = React.useRef(null)
      React.useEffect(() => () => {
        deleteAbort.current?.abort()
        editAbort.current?.abort()
        copyAbort.current?.abort()
        tripAbort.current?.abort()
      }, [])
      const thumbs = useRbThumbs(baseRoutes, version)
      const detail = useRbResource(
        openId ? `routes/${encodeURIComponent(openId)}` : '',
        version,
        !!openId,
      )

      /* 本地覆盖层：PATCH / 复制成功后立即反映到卡片，再等列表重取回来 */
      const routes = baseRoutes
        .map((route) => (overlay[route.id] ? { ...route, ...overlay[route.id] } : route))
        .filter((route) => !route.tripId || removedTrips.indexOf(String(route.tripId)) < 0)
      const ordered = highlightId
        ? [...routes].sort((a, b) => {
            if (String(a.id) === String(highlightId)) return -1
            if (String(b.id) === String(highlightId)) return 1
            return 0
          })
        : routes

      /* 行程分组：同一 tripId 的路线收进一个分组，按 dayIndex 升序；零散路线保持原顺序 */
      const groups = (() => {
        const out = []
        const byTrip = new Map()
        ordered.forEach((route) => {
          const tripId = route.tripId ? String(route.tripId) : ''
          if (!tripId) {
            out.push({ kind: 'route', route, key: `route-${route.id}` })
            return
          }
          let group = byTrip.get(tripId)
          if (!group) {
            group = {
              kind: 'trip',
              tripId,
              title: String(route.tripTitle || '未命名行程'),
              routes: [],
              key: `trip-${tripId}`,
            }
            byTrip.set(tripId, group)
            out.push(group)
          } else if (!route.tripTitle && group.title === '未命名行程') {
            group.title = String(route.tripTitle)
          }
          group.routes.push(route)
        })
        out.forEach((item) => {
          if (item.kind !== 'trip') return
          item.routes.sort((a, b) => rbDayNumber(a.dayIndex, 0) - rbDayNumber(b.dayIndex, 0))
          item.distanceM = item.routes.reduce((sum, route) => {
            const value = numOf(route.distanceM)
            return value === null ? sum : sum + value
          }, 0)
          item.collapsed = !!collapsedTrips[item.tripId]
        })
        return out
      })()

      /* 菜单点开时点外面关闭（RMB / 触屏都走 pointerdown）；不用 click，避免和菜单项竞争 */
      React.useEffect(() => {
        if (!menuId) return undefined
        const onDown = (event) => {
          const node = event?.target
          if (node && typeof node.closest === 'function'
            && node.closest('[data-gp-rb-menu], [data-gp-rb-menu-btn]')) return
          setMenuId(null)
        }
        document.addEventListener('pointerdown', onDown, true)
        return () => document.removeEventListener('pointerdown', onDown, true)
      }, [menuId])

      const remove = async (id) => {
        if (deleting) return
        setDeleting(true)
        deleteAbort.current?.abort()
        const controller = new AbortController()
        deleteAbort.current = controller
        try {
          const res = await fetch(`${RB}/routes/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            signal: controller.signal,
          })
          const data = await res.json().catch(() => null)
          if (!res.ok || (data && data.status && data.status !== 'ok')) {
            throw new Error(rbErrorText(data, `删除失败（HTTP ${res.status}）`))
          }
          if (openId === id) setOpenId(null)
          setConfirmId(null)
          setMenuId(null)
          setOverlay((prev) => {
            if (!Object.prototype.hasOwnProperty.call(prev, id)) return prev
            const next = { ...prev }
            delete next[id]
            return next
          })
          showToast?.('路书已删除')
          onRefresh?.()
        } catch (err) {
          if (err?.name !== 'AbortError') showToast?.(`删除失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setDeleting(false)
        }
      }

      /** 删除整个行程：DELETE /roadbook/trips/:tripId；先本地隐藏，再刷新列表 */
      const removeTrip = async (group) => {
        if (tripDeleting) return
        setTripDeleting(group.tripId)
        tripAbort.current?.abort()
        const controller = new AbortController()
        tripAbort.current = controller
        try {
          const data = await rbRequest('DELETE', `trips/${encodeURIComponent(group.tripId)}`, undefined, controller.signal)
          if (!data || data.status !== 'ok') throw new Error(rbErrorText(data, '删除行程失败'))
          setRemovedTrips((prev) => (prev.indexOf(group.tripId) >= 0 ? prev : [...prev, group.tripId]))
          setTripConfirm(null)
          const openRoute = openId ? routes.find((route) => String(route.id) === String(openId)) : null
          if (openRoute && String(openRoute.tripId || '') === group.tripId) setOpenId(null)
          showToast?.('行程已删除')
          onRefresh?.()
        } catch (err) {
          if (err?.name !== 'AbortError') showToast?.(`删除行程失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setTripDeleting(null)
        }
      }

      const beginEdit = (route, mode) => {
        setMenuId(null)
        setConfirmId(null)
        editAbort.current?.abort()
        setEdit({
          id: route.id,
          mode,
          value: mode === 'name' ? String(route.name || '') : String(route.description || ''),
          saving: false,
          error: '',
        })
      }

      const cancelEdit = () => {
        if (edit?.saving) return
        editAbort.current?.abort()
        setEdit(null)
      }

      const saveEdit = async () => {
        if (!edit || edit.saving) return
        const isName = edit.mode === 'name'
        const value = String(edit.value ?? '').trim()
        if (isName && !value) {
          setEdit((prev) => (prev ? { ...prev, error: '名称不能为空' } : prev))
          return
        }
        if (isName && value.length > 80) {
          setEdit((prev) => (prev ? { ...prev, error: '名称最多 80 个字符' } : prev))
          return
        }
        if (!isName && String(edit.value ?? '').length > 500) {
          setEdit((prev) => (prev ? { ...prev, error: '描述最多 500 个字符' } : prev))
          return
        }
        const id = edit.id
        const field = isName ? 'name' : 'description'
        const snapshot = overlay[id]
        editAbort.current?.abort()
        const controller = new AbortController()
        editAbort.current = controller
        /* 乐观更新：先改卡片，失败再回滚，保证「保存后名字立刻变」 */
        setOverlay((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: isName ? value : edit.value } }))
        setEdit((prev) => (prev ? { ...prev, saving: true, error: '' } : prev))
        try {
          const route = await rbPatchRoute(id, isName ? { name: value } : { description: value }, controller.signal)
          const serverValue = isName
            ? (route.name === undefined ? value : route.name)
            : (route.description === undefined ? value : route.description)
          setOverlay((prev) => ({
            ...prev,
            [id]: {
              ...(prev[id] || {}),
              [field]: serverValue,
              updatedAt: route.updatedAt || new Date().toISOString(),
            },
          }))
          setEdit(null)
          showToast?.(isName ? '已重命名' : '描述已保存')
          onRefresh?.()
        } catch (err) {
          if (err?.name === 'AbortError') return
          setOverlay((prev) => {
            if (snapshot === undefined) {
              const next = { ...prev }
              delete next[id]
              return next
            }
            return { ...prev, [id]: snapshot }
          })
          setEdit((prev) => (prev ? { ...prev, saving: false, error: String(err?.message ?? err) } : prev))
        }
      }

      const copyRoute = async (route) => {
        if (copyingId) return
        setMenuId(null)
        copyAbort.current?.abort()
        const controller = new AbortController()
        copyAbort.current = controller
        setCopyingId(route.id)
        try {
          const detailRes = await fetch(`${RB}/routes/${encodeURIComponent(route.id)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          })
          if (!detailRes.ok) throw new Error(`HTTP ${detailRes.status}`)
          const detailData = await detailRes.json().catch(() => null)
          const full = detailData?.route || detailData || {}
          const pts = rbPoints(full.points)
          if (pts.length < 2) throw new Error('原路书没有可复制的轨迹点')
          const data = await rbPost('save', {
            name: `${route.name || '未命名路书'} 副本`,
            source: route.source || 'gpx',
            points: pts,
            elevation: full.elevation,
            distanceM: full.distanceM ?? route.distanceM,
            durationSec: full.durationSec,
          }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '复制失败'))
          showToast?.('已复制路线')
          onRefresh?.()
        } catch (err) {
          if (err?.name !== 'AbortError') showToast?.(`复制失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setCopyingId(null)
        }
      }

      const exportLink = (route) => h('a', {
        className: 'gp-btn',
        href: `${RB}/routes/${encodeURIComponent(route.id)}/gpx`,
        download: `${route.name || route.id}.gpx`,
        title: '导出 GPX',
        'data-gp-rb-export': String(route.id),
        onClick: () => showToast?.('GPX 下载已开始'),
      }, '导出 GPX')

      const editBox = (route) => {
        if (!edit || String(edit.id) !== String(route.id)) return null
        const isName = edit.mode === 'name'
        return h('div', {
          className: 'gp-rb-editbox',
          'data-gp-rb-edit': isName ? 'name' : 'desc',
          'data-gp-rb-edit-id': String(route.id),
        },
          isName
            ? h('input', {
                className: 'gp-rb-input',
                value: edit.value,
                placeholder: '路书名称（最多 80 字）',
                maxLength: 80,
                spellCheck: false,
                autoFocus: true,
                onChange: (event) => {
                  const value = event.target.value
                  setEdit((prev) => (prev ? { ...prev, value } : prev))
                },
                onKeyDown: (event) => {
                  if (event.key === 'Enter') { event.preventDefault(); saveEdit() }
                  if (event.key === 'Escape') cancelEdit()
                },
                'data-gp-rb-rename-input': String(route.id),
              })
            : h('textarea', {
                className: 'gp-rb-textarea',
                value: edit.value,
                placeholder: '补一句路线说明，例如「沿湖多，适合晨骑」（最多 500 字）',
                maxLength: 500,
                autoFocus: true,
                onChange: (event) => {
                  const value = event.target.value
                  setEdit((prev) => (prev ? { ...prev, value } : prev))
                },
                'data-gp-rb-desc-input': String(route.id),
              }),
          h('div', { className: 'gp-rb-editbox-row' },
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              onClick: saveEdit,
              disabled: edit.saving,
              'data-gp-rb-edit-save': String(route.id),
            }, edit.saving ? '保存中…' : '保存'),
            h('button', {
              type: 'button',
              className: 'gp-btn',
              onClick: cancelEdit,
              disabled: edit.saving,
              'data-gp-rb-edit-cancel': String(route.id),
            }, '取消'),
            isName
              ? null
              : h('span', { className: 'gp-rb-hint gp-rb-count' },
                  `${String(edit.value || '').length}/500`)),
          edit.error
            ? h('div', { className: 'gp-rb-error', 'data-gp-rb-edit-error': '1' }, edit.error)
            : null)
      }

      const menuItem = (label, attrs, onClick, cls = '') => h('button', {
        type: 'button',
        role: 'menuitem',
        className: `gp-rb-menu-item${cls ? ` ${cls}` : ''}`,
        onClick,
        ...attrs,
      }, label)

      const card = (route) => {
        const src = rbSource(route.source)
        const open = openId === route.id
        const thumb = thumbs[route.id]
        const isNew = highlightId !== null && String(highlightId) === String(route.id)
        const description = String(route.description || '').trim()
        const updated = timePart(stampText(route.updatedAt))
        const editing = edit && String(edit.id) === String(route.id)
        return h('div', {
          className: `gp-rb-card${open ? ' is-open' : ''}${isNew ? ' is-new' : ''}`,
          key: route.id,
          'data-gp-rb-route': String(route.id),
          'data-gp-rb-new': isNew ? '1' : undefined,
        },
          h('div', { className: 'gp-rb-ch' },
            route.tripId && numOf(route.dayIndex) !== null
              ? h('span', {
                  className: 'gp-rb-daybadge',
                  'data-gp-rb-daybadge': String(route.id),
                }, `D${rbDayNumber(route.dayIndex, 0) + 1}`)
              : null,
            h('div', { className: 'gp-rb-name', title: route.name }, route.name || '未命名路书'),
            h('span', { className: `gp-rb-chip ${src.cls}` }, src.label),
            isNew ? h('span', { className: 'gp-rb-newtag', 'data-gp-rb-newtag': '1' }, '刚刚保存') : null),
          editBox(route),
          !(editing && edit.mode === 'desc') && description
            ? h('div', {
                className: 'gp-rb-desc',
                title: description,
                'data-gp-rb-desc': String(route.id),
              }, description)
            : null,
          h('div', { className: 'gp-rb-meta' },
            h('span', null, '距离 ', h('b', null, rbKm(numOf(route.distanceM)))),
            h('span', null, '爬升 ', h('b', null, rbMeter(numOf(route.elevationGainM)))),
            h('span', null, '点数 ', h('b', null, rbPointCount(numOf(route.pointCount)))),
            h('span', null, '保存 ', h('b', null, rbDay(route.createdAt))),
            updated
              ? h('span', {
                  className: 'gp-rb-updated',
                  title: `更新于 ${updated}`,
                  'data-gp-rb-updated': String(route.id),
                }, '更新于 ', h('b', null, updated))
              : null),
          thumb?.points
            ? h('div', { className: 'gp-rb-thumb' },
                h(TrackPreview, {
                  compact: true,
                  points: thumb.points,
                  distanceM: thumb.distanceM,
                  elevationGainM: thumb.elevationGainM,
                }))
            : null,
          open
            ? h('div', { className: 'gp-rb-expand', 'data-gp-rb-preview': String(route.id) },
                detail.loading
                  ? h('div', { className: 'gp-rb-loading' },
                      h('i', { className: 'gp-rb-spin', 'aria-hidden': true }),
                      '正在加载路线…')
                  : detail.error
                    ? h('div', { className: 'gp-rb-error' }, `预览失败：${detail.error}`)
                    : detail.data?.status === 'not_found'
                      ? h('div', { className: 'gp-rb-error' }, '路书不存在或已被删除')
                      : detail.data?.status === 'error'
                        ? h('div', { className: 'gp-rb-error' }, rbErrorText(detail.data, '路书读取失败'))
                        : h('div', null,
                        h(TrackPreview, {
                          points: detail.data?.points,
                          elevation: detail.data?.elevation,
                          distanceM: detail.data?.distanceM ?? route.distanceM,
                          elevationGainM: detail.data?.elevationGainM ?? route.elevationGainM,
                          height: 210,
                        }),
                        h('div', { className: 'gp-rb-hint' },
                          `来源 ${src.label} · 保存于 ${rbDay(route.createdAt)}`)))
            : null,
          h('div', { className: 'gp-rb-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn',
              onClick: () => { setMenuId(null); setOpenId(open ? null : route.id) },
              'data-gp-rb-preview-toggle': String(route.id),
            }, open ? '收起' : '预览'),
            exportLink(route),
            h('div', { className: 'gp-rb-menu-wrap' },
              h('button', {
                type: 'button',
                className: 'gp-btn gp-rb-more',
                title: '更多操作',
                'aria-label': '更多操作',
                'aria-expanded': menuId === route.id ? 'true' : 'false',
                onClick: () => setMenuId(menuId === route.id ? null : route.id),
                'data-gp-rb-menu-btn': String(route.id),
              }, '⋮'),
              menuId === route.id
                ? h('div', { className: 'gp-rb-menu', role: 'menu', 'data-gp-rb-menu': String(route.id) },
                    menuItem('重命名', { 'data-gp-rb-rename': String(route.id) }, () => beginEdit(route, 'name')),
                    menuItem('编辑描述', { 'data-gp-rb-edit-desc': String(route.id) }, () => beginEdit(route, 'desc')),
                    menuItem(
                      copyingId === route.id ? '复制中…' : '复制路线',
                      { 'data-gp-rb-copy': String(route.id), disabled: copyingId === route.id },
                      () => copyRoute(route),
                    ),
                    menuItem('删除', { 'data-gp-rb-delete': String(route.id) }, () => {
                      setMenuId(null)
                      setConfirmId(route.id)
                    }, 'danger'))
                : null)),
          confirmId === route.id
            ? h('div', { className: 'gp-rb-confirm', 'data-gp-rb-confirm': String(route.id) },
                h('span', null, `删除「${route.name || '未命名路书'}」？`),
                h('button', {
                  type: 'button',
                  className: 'gp-btn',
                  onClick: () => setConfirmId(null),
                  disabled: deleting,
                }, '取消'),
                h('button', {
                  type: 'button',
                  className: 'gp-btn danger',
                  onClick: () => remove(route.id),
                  disabled: deleting,
                  'data-gp-rb-delete-yes': String(route.id),
                }, deleting ? '删除中…' : '删除'))
            : null)
      }

      const tripSection = (group) => {
        const collapsed = !!group.collapsed
        const confirming = tripConfirm === group.tripId
        const deletingTrip = tripDeleting === group.tripId
        const dayCount = group.routes.length
        return h('section', {
          className: 'gp-rb-tripgroup',
          key: group.key,
          'data-gp-rb-trip-group': group.tripId,
        },
          h('div', { className: 'gp-rb-tripgroup-hd' },
            h('button', {
              type: 'button',
              className: 'gp-rb-tripgroup-toggle',
              'aria-expanded': collapsed ? 'false' : 'true',
              'data-gp-rb-group-toggle': group.tripId,
              onClick: () => setCollapsedTrips((prev) => ({ ...prev, [group.tripId]: !collapsed })),
            },
              h('span', { className: 'gp-rb-triparrow', 'aria-hidden': true }, collapsed ? '▸' : '▾'),
              h('span', {
                className: 'gp-rb-tripgroup-title',
                title: group.title,
                'data-gp-rb-group-title': group.tripId,
              }, group.title),
              h('span', {
                className: 'gp-rb-tripgroup-meta',
                'data-gp-rb-group-meta': group.tripId,
              }, `${dayCount} 天 · 总里程 ${rbKm(group.distanceM)}`)),
            h('button', {
              type: 'button',
              className: 'gp-btn gp-rb-tripgroup-del',
              'data-gp-rb-group-delete': group.tripId,
              onClick: () => setTripConfirm(confirming ? null : group.tripId),
            }, '删除行程')),
          confirming
            ? h('div', { className: 'gp-rb-confirm', 'data-gp-rb-group-confirm': group.tripId },
                h('span', null, `删除「${group.title}」整个行程？${dayCount} 天路线一并删除。`),
                h('button', {
                  type: 'button',
                  className: 'gp-btn',
                  onClick: () => setTripConfirm(null),
                  disabled: deletingTrip,
                }, '取消'),
                h('button', {
                  type: 'button',
                  className: 'gp-btn danger',
                  onClick: () => removeTrip(group),
                  disabled: deletingTrip,
                  'data-gp-rb-group-delete-yes': group.tripId,
                }, deletingTrip ? '删除中…' : '删除'))
            : null,
          collapsed
            ? null
            : h('div', {
                className: 'gp-rb-grid gp-rb-tripgroup-grid',
                'data-gp-rb-trip-grid': group.tripId,
              }, group.routes.map(card)))
      }

      let body = null
      if (list.loading && !list.data) {
        body = h('div', { className: 'gp-rb-grid', 'data-gp-rb-list-loading': '1' },
          [0, 1, 2].map((i) => h('div', { className: 'gp-rb-skel', key: i },
            h('div', { className: 'gp-skel', style: { height: 15, width: '58%' } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '82%' } }),
            h('div', { className: 'gp-skel', style: { height: 58 } }))))
      } else if (list.error) {
        body = h('div', { className: 'gp-rb-error' },
          `路书列表加载失败：${list.error}`,
          h('button', {
            type: 'button',
            className: 'gp-btn',
            style: { marginLeft: 10 },
            onClick: () => onRefresh?.(),
          }, '重试'))
      } else if (!routes.length) {
        body = h('div', { className: 'gp-rb-empty', 'data-gp-rb-empty': '1' },
          h('div', { className: 'gp-rb-empty-ic', 'aria-hidden': true },
            h('svg', { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none' },
              h('path', {
                d: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z',
                stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round',
              }),
              h('circle', { cx: 9, cy: 11, r: 1.5, fill: 'currentColor' }))),
          h('div', { className: 'big' }, '还没有保存的路书'),
          h('div', null, '从行者导入、上传 GPX，或让 AI 规划一条骑行路线。'),
          h('div', { className: 'gp-rb-actions', style: { marginTop: 6, justifyContent: 'center' } },
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              onClick: () => onGoTab?.('import'),
              'data-gp-rb-empty-import': '1',
            }, '去导入'),
            h('button', {
              type: 'button',
              className: 'gp-btn',
              onClick: () => onGoTab?.('plan'),
              'data-gp-rb-empty-plan': '1',
            }, 'AI 规划')))
      } else {
        const blocks = []
        let run = []
        const flush = () => {
          if (!run.length) return
          blocks.push(h('div', {
            className: 'gp-rb-grid',
            key: `rb-grid-${blocks.length}`,
            'data-gp-rb-grid': '1',
          }, run))
          run = []
        }
        groups.forEach((item) => {
          if (item.kind === 'trip') {
            flush()
            blocks.push(tripSection(item))
            return
          }
          run.push(card(item.route))
        })
        flush()
        body = h('div', null, blocks, h(GarminGuide, {}))
      }

      const hint = routes.length
        ? `${routes.length} 条 · 点击预览展开轨迹与海拔${highlightId !== null ? ' · 新保存的路书已置顶' : ''}`
        : '保存后在这里管理'

      return h('div', { className: 'gp-rb-tabpanel', 'data-gp-rb-panel': 'mine' },
        h('div', { className: 'gp-rb-sechead' },
          h('h2', null, '我的路书'),
          h('span', { className: 'hint' }, hint)),
        body)
    }

    /* ------------------------------ 导入 ------------------------------ */
    function RouteImportTab({ status, onSaved, onStatus, showToast, onGoTab, onGoPlan, onOpenSettings = null }) {
      const [num, setNum] = React.useState('')
      const [xPhase, setXPhase] = React.useState('idle')
      const [xRoute, setXRoute] = React.useState(null)
      const [xError, setXError] = React.useState('')
      const [auth, setAuth] = React.useState({ phase: 'idle', error: '', waited: 0 })
      const [gpx, setGpx] = React.useState({ phase: 'idle', name: '', size: 0, error: '', route: null })
      const xingzheReady = status?.data ? !!status.data.xingzheConfigured : true
      const xAbort = React.useRef(null)
      const authAbort = React.useRef(null)
      const saveAbort = React.useRef(null)
      const importAbort = React.useRef(null)
      const pollAbort = React.useRef(null)
      const pollTimer = React.useRef(null)
      const pollBusy = React.useRef(false)
      const alive = React.useRef(true)
      const fileRef = React.useRef(null)

      React.useEffect(() => () => {
        alive.current = false
        if (pollTimer.current) {
          clearInterval(pollTimer.current)
          pollTimer.current = null
        }
        xAbort.current?.abort()
        authAbort.current?.abort()
        saveAbort.current?.abort()
        importAbort.current?.abort()
        pollAbort.current?.abort()
      }, [])

      const stopPoll = () => {
        if (pollTimer.current) {
          clearInterval(pollTimer.current)
          pollTimer.current = null
        }
      }

      const loadXingzhe = async (raw) => {
        const text = String(raw ?? '').trim()
        const id = (/\d{3,}/.exec(text) || [])[0]
        if (!id) {
          setXPhase('error')
          setXError('请输入路书编号或链接，例如 #850821')
          return
        }
        xAbort.current?.abort()
        const controller = new AbortController()
        xAbort.current = controller
        setXPhase('loading')
        setXError('')
        setXRoute(null)
        try {
          const res = await fetch(`${RB}/xingzhe/${encodeURIComponent(id)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          })
          const data = await res.json().catch(() => null)
          if (!alive.current) return
          if (data?.status === 'ok') {
            setXRoute(data)
            setXPhase('preview')
            return
          }
          if (data?.status === 'auth_required') {
            setXPhase('auth')
            setAuth({ phase: 'idle', error: '', waited: 0 })
            return
          }
          if (data?.status === 'not_found') {
            setXPhase('error')
            setXError(`未找到路书 #${id}，请检查编号`)
            return
          }
          setXPhase('error')
          setXError(rbErrorText(data, `获取失败（HTTP ${res.status}）`))
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setXPhase('error')
          setXError(String(err?.message ?? err))
        }
      }

      const authorize = async () => {
        stopPoll()
        const target = num
        setAuth({ phase: 'starting', error: '', waited: 0 })
        authAbort.current?.abort()
        const authController = new AbortController()
        authAbort.current = authController
        try {
          const res = await fetch(`${RB}/auth-url`, {
            headers: { Accept: 'application/json' },
            signal: authController.signal,
          })
          const data = await res.json().catch(() => null)
          if (!data?.url) throw new Error(data?.message || '未能获取行者授权链接')
          try { window.open(data.url, '_blank') } catch { /* 弹窗被拦截时仍继续轮询 */ }
          if (!alive.current) return
          setAuth({ phase: 'waiting', error: '', waited: 0 })
          let ticks = 0
          pollTimer.current = setInterval(async () => {
            if (!alive.current) return
            if (pollBusy.current) return
            pollBusy.current = true
            ticks += 1
            try {
              pollAbort.current?.abort()
              const pollController = new AbortController()
              pollAbort.current = pollController
              const r = await fetch(`${RB}/auth-status`, {
                headers: { Accept: 'application/json' },
                signal: pollController.signal,
              })
              const st = await r.json().catch(() => null)
              if (!alive.current) return
              if (st?.authorized) {
                stopPoll()
                setAuth({ phase: 'ok', error: '', waited: ticks * 2 })
                onStatus?.()
                loadXingzhe(target)
                return
              }
              if (st?.error) {
                stopPoll()
                setAuth({ phase: 'error', error: String(st.error), waited: ticks * 2 })
                return
              }
              if (ticks >= 45) {
                stopPoll()
                setAuth({
                  phase: 'timeout',
                  error: '授权超时，请确认行者 App 内已完成授权后重试',
                  waited: 90,
                })
                return
              }
              setAuth({ phase: 'waiting', error: '', waited: ticks * 2 })
            } catch {
              if (!alive.current) return
              if (ticks >= 45) {
                stopPoll()
                setAuth({ phase: 'timeout', error: '授权超时，请稍后重试', waited: 90 })
              }
            } finally {
              pollBusy.current = false
            }
          }, 2000)
        } catch (err) {
          if (err?.name === 'AbortError') return
          setAuth({ phase: 'error', error: String(err?.message ?? err), waited: 0 })
        }
      }

      const saveXingzhe = async () => {
        if (!xRoute) return
        setXPhase('saving')
        setXError('')
        saveAbort.current?.abort()
        const controller = new AbortController()
        saveAbort.current = controller
        try {
          const data = await rbPost('import', {
            source: 'xingzhe',
            id: xRoute.id,
            name: xRoute.name,
          }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '保存失败'))
          setXPhase('saved')
          onSaved?.()
          showToast?.('已保存为我的路书')
        } catch (err) {
          if (err?.name === 'AbortError') return
          setXPhase('preview')
          setXError(String(err?.message ?? err))
          showToast?.(`保存失败：${String(err?.message ?? err)}`, 'err')
        }
      }

      const onFile = (event) => {
        const input = event?.target
        const file = input?.files?.[0]
        if (!file) return
        const name = String(file.name || 'route.gpx').replace(/\.gpx$/i, '')
        setGpx({ phase: 'reading', name, size: file.size, error: '', route: null })
        const reader = new FileReader()
        reader.onerror = () => {
          if (alive.current) setGpx({ phase: 'error', name, size: file.size, error: '文件读取失败', route: null })
        }
        reader.onload = async () => {
          const text = String(reader.result || '')
          if (!alive.current) return
          if (!/<gpx[\s>]/i.test(text)) {
            setGpx({
              phase: 'error',
              name,
              size: file.size,
              error: '不是有效的 GPX 文件（缺少 <gpx> 根节点）',
              route: null,
            })
            return
          }
          setGpx((prev) => ({ ...prev, phase: 'saving' }))
          importAbort.current?.abort()
          const importController = new AbortController()
          importAbort.current = importController
          try {
            const data = await rbPost('import', { source: 'gpx', name, gpx: text }, importController.signal)
            if (data?.status !== 'ok') throw new Error(rbErrorText(data, '导入失败'))
            if (!alive.current) return
            /* 导入接口只回 meta，预览用的轨迹/海拔再取一次完整路书（失败不影响导入成功） */
            let savedRoute = data.route || null
            if (savedRoute?.id) {
              try {
                const detailRes = await fetch(`${RB}/routes/${encodeURIComponent(savedRoute.id)}`, {
                  headers: { Accept: 'application/json' },
                  signal: importController.signal,
                })
                if (detailRes.ok) {
                  const detail = await detailRes.json().catch(() => null)
                  const full = detail?.route || detail
                  if (full && typeof full === 'object') savedRoute = { ...savedRoute, ...full }
                }
              } catch { /* 预览失败时保留 meta */ }
            }
            if (!alive.current) return
            setGpx({ phase: 'saved', name, size: file.size, error: '', route: savedRoute })
            onSaved?.()
            showToast?.('GPX 已导入')
          } catch (err) {
            if (!alive.current || err?.name === 'AbortError') return
            setGpx({ phase: 'error', name, size: file.size, error: String(err?.message ?? err), route: null })
          }
        }
        reader.readAsText(file)
        try { input.value = '' } catch { /* ignore */ }
      }

      const xzPreview = xRoute
        ? h('div', { className: 'gp-rb-xz-preview', 'data-gp-rb-xz-preview': '1' },
            h('div', { className: 'gp-rb-ch' },
              h('div', { className: 'gp-rb-name', title: xRoute.name }, xRoute.name || '行者路书'),
              h('span', { className: 'gp-rb-chip xz' }, '行者')),
            h(TrackPreview, {
              points: xRoute.points,
              elevation: xRoute.elevation,
              distanceM: xRoute.distanceM,
              elevationGainM: xRoute.elevationGainM,
              height: 190,
            }),
            h('div', { className: 'gp-rb-meta' },
              h('span', null, '距离 ', h('b', null, rbKm(numOf(xRoute.distanceM)))),
              h('span', null, '爬升 ', h('b', null, rbMeter(numOf(xRoute.elevationGainM)))),
              h('span', null, '点数 ', h('b', null, rbPointCount(numOf(xRoute.points?.length)))),
              h('span', null, '编号 ', h('b', null, `#${xRoute.id}`))),
            xError ? h('div', { className: 'gp-rb-error' }, xError) : null,
            h('div', { className: 'gp-rb-actions' },
              h('button', {
                type: 'button',
                className: 'gp-btn primary',
                onClick: saveXingzhe,
                disabled: xPhase === 'saving' || xPhase === 'saved',
                'data-gp-rb-xz-save': '1',
              }, xPhase === 'saved' ? '已保存' : xPhase === 'saving' ? '保存中…' : '保存为我的路书'),
              xPhase === 'saved'
                ? h('span', { className: 'gp-rb-ok', 'data-gp-rb-xz-saved': '1' }, '✓ 已加入我的路书')
                : null),
            xPhase === 'saved' ? h(GarminGuide, { open: true }) : null)
        : null

      const authPanel = h('div', { className: 'gp-rb-auth', 'data-gp-rb-auth': '1' },
        h('div', { className: 'gp-rb-auth-hd' },
          h('span', { className: 'tt' }, '需要授权行者账号'),
          auth.phase === 'ok' ? h('span', { className: 'gp-rb-chip gpx' }, '已授权') : null),
        h('div', { className: 'gp-rb-note' },
          auth.phase === 'waiting'
            ? `已打开授权页面，等待授权…（已等待 ${auth.waited} 秒）`
            : auth.phase === 'ok'
              ? '授权完成，正在重新获取路书…'
              : '行者路书需要行者账号授权后才能读取。点击下方按钮，在打开的页面完成授权。'),
        auth.error ? h('div', { className: 'gp-rb-error' }, auth.error) : null,
        h('button', {
          type: 'button',
          className: 'gp-btn primary',
          onClick: authorize,
          disabled: auth.phase === 'starting' || auth.phase === 'waiting' || !xingzheReady,
          'data-gp-rb-auth-btn': '1',
        }, auth.phase === 'waiting'
          ? '等待授权…'
          : auth.phase === 'starting' ? '正在打开…' : '授权行者'),
        auth.phase === 'waiting'
          ? h('div', { className: 'gp-rb-hint' }, '每 2 秒检查一次授权状态，最多等待 90 秒。')
          : null)

      const gpxSaved = gpx.route
        ? h('div', { className: 'gp-rb-xz-preview', 'data-gp-rb-gpx-preview': '1' },
            h('div', { className: 'gp-rb-ch' },
              h('div', { className: 'gp-rb-name' }, gpx.route.name || gpx.name || 'GPX 路书'),
              h('span', { className: 'gp-rb-chip gpx' }, 'GPX')),
            h(TrackPreview, {
              points: gpx.route.points,
              elevation: gpx.route.elevation,
              distanceM: gpx.route.distanceM,
              elevationGainM: gpx.route.elevationGainM,
              height: 170,
            }),
            h('div', { className: 'gp-rb-meta' },
              h('span', null, '距离 ', h('b', null, rbKm(numOf(gpx.route.distanceM)))),
              h('span', null, '爬升 ', h('b', null, rbMeter(numOf(gpx.route.elevationGainM)))),
              h('span', null, '点数 ', h('b', null, rbPointCount(numOf(gpx.route.pointCount)))),
              h('span', null, '保存 ', h('b', null, rbDay(gpx.route.createdAt)))),
            h('div', { className: 'gp-rb-actions' },
              h('button', {
                type: 'button',
                className: 'gp-btn',
                onClick: () => onGoTab?.('mine'),
              }, '查看我的路书')),
            h(GarminGuide, { open: true }))
        : null

      return h('div', { className: 'gp-rb-tabpanel', 'data-gp-rb-panel': 'import' },
        h('div', { className: 'gp-rb-sechead' },
          h('h2', null, '导入路书'),
          h('span', { className: 'hint' }, '行者编号直连或上传 GPX 文件')),
        h('div', { className: 'gp-rb-grid2' },
          h('section', { className: 'gp-rb-sec', 'data-gp-rb-xingzhe': '1' },
            h('h3', null, '行者路书'),
            h('label', { className: 'gp-rb-field' },
              h('span', { className: 'gp-rb-lab' }, '路书编号或链接'),
              h('div', { className: 'gp-rb-inline' },
                h('input', {
                  className: 'gp-rb-input',
                  value: num,
                  placeholder: '#850821 / 链接',
                  spellCheck: false,
                  onChange: (e) => setNum(e.target.value),
                  onKeyDown: (e) => { if (e.key === 'Enter') loadXingzhe(num) },
                  'data-gp-rb-xz-input': '1',
                }),
                h('button', {
                  type: 'button',
                  className: 'gp-btn primary',
                  onClick: () => loadXingzhe(num),
                  disabled: xPhase === 'loading' || xPhase === 'saving' || !xingzheReady,
                  'data-gp-rb-xz-fetch': '1',
                }, xPhase === 'loading' ? '获取中…' : '获取'))),
            xingzheReady
              ? null
              : h('div', { className: 'gp-rb-muted gp-rb-setup', 'data-gp-rb-xingzhe-missing': '1' },
                  h('span', null, '未配置行者应用，暂时只能导入 GPX。'),
                  h('button', {
                    type: 'button',
                    className: 'gp-btn',
                    onClick: () => onOpenSettings?.(),
                    'data-gp-rb-xz-settings': '1',
                  }, '去设置')),
            xPhase === 'idle'
              ? h('div', { className: 'gp-rb-hint' }, '输入行者 App 里路书的编号或分享链接，抓取轨迹后保存。')
              : null,
            xPhase === 'loading'
              ? h('div', { className: 'gp-rb-loading', 'data-gp-rb-xz-loading': '1' },
                  h('i', { className: 'gp-rb-spin', 'aria-hidden': true }),
                  '正在获取行者路书…')
              : null,
            xError && xPhase !== 'preview' && xPhase !== 'saving'
              ? h('div', { className: 'gp-rb-error', 'data-gp-rb-xz-error': '1' }, xError)
              : null,
            (xPhase === 'preview' || xPhase === 'saving' || xPhase === 'saved') ? xzPreview : null,
            xPhase === 'auth' ? authPanel : null),
          h('section', { className: 'gp-rb-sec', 'data-gp-rb-gpx': '1' },
            h('h3', null, 'GPX 文件'),
            h('div', { className: 'gp-rb-note' },
              '从行者 App 或其他工具导出 GPX 后，在本地选择文件即可导入。'),
            h('input', {
              type: 'file',
              accept: '.gpx,application/gpx+xml',
              ref: fileRef,
              className: 'gp-rb-file',
              onChange: onFile,
              'data-gp-rb-gpx-input': '1',
            }),
            h('div', { className: 'gp-rb-actions' },
              h('button', {
                type: 'button',
                className: 'gp-btn',
                onClick: () => fileRef.current?.click(),
                'data-gp-rb-gpx-pick': '1',
              }, '选择 GPX 文件'),
              gpx.name
                ? h('span', { className: 'gp-rb-hint' },
                    `${gpx.name}${gpx.size ? ` · ${Math.max(1, Math.round(gpx.size / 1024))} KB` : ''}`)
                : null),
            gpx.phase === 'reading' || gpx.phase === 'saving'
              ? h('div', { className: 'gp-rb-loading', 'data-gp-rb-gpx-loading': '1' },
                  h('i', { className: 'gp-rb-spin', 'aria-hidden': true }),
                  gpx.phase === 'reading' ? '正在读取文件…' : '正在解析并导入 GPX…')
              : null,
            gpx.error
              ? h('div', { className: 'gp-rb-error', 'data-gp-rb-gpx-error': '1' }, `导入失败：${gpx.error}`)
              : null,
            gpxSaved)),
        h('section', { className: 'gp-rb-sec gp-rb-sec-plain' },
          h('h3', null, '说明'),
          h('ol', { className: 'gp-rb-steps' },
            h('li', null, '打开行者 App → 路书详情 → 下载 GPX。'),
            h('li', null, '把 GPX 保存到手机或电脑。'),
            h('li', null, '回到本页「GPX 文件」选择文件导入。')),
          h('p', { className: 'gp-rb-note' },
            '实验性能力：编号直连依赖行者服务端的登录会话，是否可用由后端决定，前端不提供开关。请仅导入自己有权使用或已获授权的路书轨迹。'),
          onGoPlan
            ? h('button', {
                type: 'button',
                className: 'gp-rb-linkbtn',
                onClick: onGoPlan,
              }, '没有现成路书？让 AI 规划一条 →')
            : null))
    }

    /* ----------------------------- AI 规划 ----------------------------- */
    function RoutePlanTab({ status, onSaved, showToast, onOpenSettings = null }) {
      const amapConfigured = !!status?.data?.amapConfigured
      const amapValid = status?.data?.amapKeyValid !== false
      const amapReady = amapConfigured && amapValid
      const amapKnown = !!status?.data
      const aiAvailable = status?.data?.aiAvailable !== false && status?.data?.aiConfigured !== false
      const [prompt, setPrompt] = React.useState('')
      const [ai, setAi] = React.useState({ phase: 'idle', stage: -1, elapsed: 0, error: '', unavailable: false })
      const [result, setResult] = React.useState(null)
      const [resolved, setResolved] = React.useState(null)
      const [candidates, setCandidates] = React.useState([])
      const [expandedId, setExpandedId] = React.useState(null)
      const [savedIds, setSavedIds] = React.useState([])
      const [savingId, setSavingId] = React.useState(null)
      const [altFor, setAltFor] = React.useState(null)
      const [advancedOpen, setAdvancedOpen] = React.useState(false)
      const [fields, setFields] = React.useState({
        origin: '',
        destination: '',
        loop: false,
        targetDistanceKm: '',
        elevationTargetM: '',
        city: '',
      })
      const [via, setVia] = React.useState([])
      const [planPhase, setPlanPhase] = React.useState('idle')
      const [planError, setPlanError] = React.useState('')
      const [ambiguous, setAmbiguous] = React.useState(null)
      /* 多日行程：模式 / 参数 / 结果 / 分天展开与保存状态 */
      const [mode, setMode] = React.useState('single')
      const [tripDaysInput, setTripDaysInput] = React.useState(3)
      const [tripDistanceKm, setTripDistanceKm] = React.useState('')
      const [useWeb, setUseWeb] = React.useState(true)
      const [multiAi, setMultiAi] = React.useState({
        phase: 'idle', stage: -1, elapsed: 0, error: '', hint: '', detail: '',
        code: '', title: '', unavailable: false, diagnostics: null,
      })
      const [trip, setTrip] = React.useState(null)
      const [dayOpen, setDayOpen] = React.useState({})
      const [daySaving, setDaySaving] = React.useState(null)
      const [savedDayIds, setSavedDayIds] = React.useState([])
      const [dayRetrying, setDayRetrying] = React.useState(null)
      const [tripSaving, setTripSaving] = React.useState(false)
      const [tripSaved, setTripSaved] = React.useState(false)
      const [tripError, setTripError] = React.useState('')
      const aiAbort = React.useRef(null)
      const multiAbort = React.useRef(null)
      const tripSaveAbort = React.useRef(null)
      const daySaveAbort = React.useRef(null)
      const retryAbort = React.useRef(null)
      const multiStageTimer = React.useRef(null)
      const multiTickTimer = React.useRef(null)
      const multiStartedAt = React.useRef(0)
      const planAbort = React.useRef(null)
      const saveAbort = React.useRef(null)
      const stageTimer = React.useRef(null)
      const tickTimer = React.useRef(null)
      const startedAt = React.useRef(0)

      const clearTimers = React.useCallback(() => {
        if (stageTimer.current) {
          clearInterval(stageTimer.current)
          stageTimer.current = null
        }
        if (tickTimer.current) {
          clearInterval(tickTimer.current)
          tickTimer.current = null
        }
        if (multiStageTimer.current) {
          clearInterval(multiStageTimer.current)
          multiStageTimer.current = null
        }
        if (multiTickTimer.current) {
          clearInterval(multiTickTimer.current)
          multiTickTimer.current = null
        }
      }, [])

      React.useEffect(() => () => {
        clearTimers()
        aiAbort.current?.abort()
        multiAbort.current?.abort()
        tripSaveAbort.current?.abort()
        daySaveAbort.current?.abort()
        retryAbort.current?.abort()
        planAbort.current?.abort()
        saveAbort.current?.abort()
      }, [clearTimers])

      const elapsedNow = () => Math.max(0, Math.round((Date.now() - startedAt.current) / 1000))
      const elapsedMulti = () => Math.max(0, Math.round((Date.now() - multiStartedAt.current) / 1000))
      const setField = (key, value) => setFields((prev) => ({ ...prev, [key]: value }))

      /** AI 解析结果回填高级表单，让「换地点 / 手动微调」有据可依 */
      const syncFields = (parsed) => {
        const next = {
          origin: parsed.origin ? String(parsed.origin) : '',
          destination: parsed.destination ? String(parsed.destination) : '',
          loop: !!parsed.loop,
          targetDistanceKm: parsed.targetDistanceKm === null || parsed.targetDistanceKm === undefined
            ? '' : String(parsed.targetDistanceKm),
          elevationTargetM: parsed.elevationTargetM === null || parsed.elevationTargetM === undefined
            ? '' : String(parsed.elevationTargetM),
          city: parsed.city ? String(parsed.city) : '',
        }
        setFields(next)
        setVia(Array.isArray(parsed.viaPoints) ? parsed.viaPoints.map((value) => String(value)) : [])
        return next
      }

      const startTimers = () => {
        clearTimers()
        startedAt.current = Date.now()
        setAi({ phase: 'running', stage: 0, elapsed: 0, error: '', unavailable: false })
        stageTimer.current = setInterval(() => {
          setAi((prev) => (prev.phase === 'running'
            ? { ...prev, stage: Math.min(RB_AI_STAGES.length - 1, prev.stage + 1) }
            : prev))
        }, 1200)
        tickTimer.current = setInterval(() => {
          setAi((prev) => (prev.phase === 'running' ? { ...prev, elapsed: elapsedNow() } : prev))
        }, 400)
      }

      const startMultiTimers = () => {
        clearTimers()
        multiStartedAt.current = Date.now()
        setMultiAi({
          phase: 'running', stage: 0, elapsed: 0, error: '', hint: '', detail: '',
          code: '', title: '', unavailable: false, diagnostics: null,
        })
        multiStageTimer.current = setInterval(() => {
          setMultiAi((prev) => (prev.phase === 'running'
            ? { ...prev, stage: Math.min(RB_AI_MULTI_STAGES.length - 1, prev.stage + 1) }
            : prev))
        }, 1400)
        multiTickTimer.current = setInterval(() => {
          setMultiAi((prev) => (prev.phase === 'running' ? { ...prev, elapsed: elapsedMulti() } : prev))
        }, 400)
      }

      const resetTrip = () => {
        setTrip(null)
        setDayOpen({})
        setSavedDayIds([])
        setDaySaving(null)
        setDayRetrying(null)
        setTripSaving(false)
        setTripSaved(false)
        setTripError('')
      }

      /**
       * 失败响应 → 面板文案：按 code 取友好标题 / 说明 / 建议，
       * diagnostics.dayErrors 原样带进 state，供错误框里的「按天诊断」展开。
       */
      const multiErrorOf = (data, err) => {
        const code = String(data?.code || err?.code || '')
        const key = rbMultiErrorKey(code)
        const preset = RB_MULTI_ERRORS[key] || null
        const raw = String(data?.message || err?.message || (preset ? preset.message : '行程规划失败'))
        const diagnostics = data?.diagnostics || err?.diagnostics || null
        return {
          code: key || code,
          title: preset ? preset.title : '行程生成失败',
          /* INVALID_ITINERARY 保留「行程需求需要调整」前缀，但没返回 message 时只给友好文案 */
          message: key === 'INVALID_ITINERARY'
            ? `行程需求需要调整：${raw}`
            : preset ? preset.message : raw,
          /* 其它失败码把后端原文降级到「后端返回：…」，INVALID_ITINERARY 已在正文里 */
          detail: preset && key !== 'INVALID_ITINERARY' ? raw : '',
          hint: preset?.hint || '',
          unavailable: !!preset?.unavailable || /^(AI|LLM)_UNAVAILABLE$/.test(key) || !aiAvailable,
          diagnostics,
        }
      }

      /** 多日行程：一次 /ai-plan-multi；force 用于「换一批」 */
      const runMulti = async (force = false) => {
        const text = prompt.trim()
        if (!text) {
          setMultiAi({
            phase: 'error', stage: -1, elapsed: 0, code: '', title: '', detail: '',
            unavailable: false, hint: '', diagnostics: null,
            error: '先写一句行程需求，例如「环海南岛 8 天，人均每天 70–90 km，想走东线经典路段」',
          })
          return
        }
        if (!amapReady) return
        multiAbort.current?.abort()
        const controller = new AbortController()
        multiAbort.current = controller
        resetTrip()
        startMultiTimers()
        const dayCount = Math.max(
          RB_MULTI_MIN_DAYS,
          Math.min(RB_MULTI_MAX_DAYS, rbDayNumber(tripDaysInput, 3)),
        )
        const body = { prompt: text, days: dayCount, useWeb: !!useWeb }
        const totalKm = numOf(tripDistanceKm)
        if (totalKm !== null && totalKm > 0) body.totalDistanceKm = totalKm
        if (force) body.force = true
        try {
          const data = await rbPost('ai-plan-multi', body, controller.signal)
          if (data?.status !== 'ok') {
            const info = multiErrorOf(data, null)
            const error = new Error(info.message)
            error.code = info.code
            error.title = info.title
            error.detail = info.detail
            error.hint = info.hint
            error.unavailable = info.unavailable
            error.diagnostics = info.diagnostics
            error.info = info
            throw error
          }
          const tripData = data?.trip || {}
          const days = (Array.isArray(tripData.days) ? tripData.days : []).map((day, index) => ({
            ...day,
            dayIndex: day?.dayIndex === undefined ? index : rbDayNumber(day.dayIndex, index),
          }))
          if (!days.length) throw new Error('AI 没有返回可用的每日路线，请调整天数或需求后再试')
          const elapsed = elapsedMulti()
          clearTimers()
          setTrip({
            ...tripData,
            days,
            usedWeb: !!data.usedWeb,
            sources: Array.isArray(data.sources) ? data.sources : [],
          })
          setMultiAi({
            phase: 'done', stage: RB_AI_MULTI_STAGES.length - 1, elapsed,
            error: '', hint: '', detail: '', code: '', title: '', unavailable: false, diagnostics: null,
          })
        } catch (err) {
          if (err?.name === 'AbortError') return
          const elapsed = elapsedMulti()
          const info = err?.info || multiErrorOf(null, err)
          clearTimers()
          setMultiAi({
            phase: 'error', stage: -1, elapsed,
            error: info.message,
            title: info.title,
            detail: info.detail,
            hint: info.hint,
            code: info.code,
            unavailable: info.unavailable,
            diagnostics: info.diagnostics,
          })
        }
      }

      /** 保存多日行程中的一天：沿用 /roadbook/save，标题带上 D1/D2 前缀 */
      const saveDay = async (day, index) => {
        if (daySaving !== null) return
        const pts = rbPoints(day?.points)
        if (pts.length < 2) {
          showToast?.('这一天的路线还没有轨迹点，无法保存', 'err')
          return
        }
        const title = rbDayTitle(day, index)
        daySaveAbort.current?.abort()
        const controller = new AbortController()
        daySaveAbort.current = controller
        setDaySaving(index)
        setTripError('')
        try {
          const data = await rbPost('save', {
            name: `${String(trip?.title || '多日行程')} D${index + 1} ${title}`,
            description: String(day?.note || ''),
            source: 'ai',
            points: pts,
            elevation: day?.elevation,
            distanceM: numOf(day?.distanceM),
            durationSec: numOf(day?.durationSec),
            /* 行程上下文：后端在没有合法 tripId 时会落回独立路书，但字段照传，
               方便已绑定 tripId 的场景（或后续版本）直接归组 */
            tripTitle: String(trip?.title || ''),
            dayIndex: index,
          }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '保存失败'))
          setSavedDayIds((prev) => (prev.indexOf(index) >= 0 ? prev : [...prev, index]))
          showToast?.('已保存这一天')
        } catch (err) {
          if (err?.name === 'AbortError') return
          setTripError(String(err?.message ?? err))
          showToast?.(`保存失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setDaySaving(null)
        }
      }

      /** 保存整个行程：POST /roadbook/trips/save，成功后由外壳切到「我的路书」 */
      const saveTrip = async () => {
        if (!trip || tripSaving) return
        const payload = []
        rbTripDays(trip).forEach((day, index) => {
          if (!rbDayOk(day)) return
          const pts = rbPoints(day.points)
          if (pts.length < 2) return
          payload.push({
            dayIndex: index,
            name: rbDayTitle(day, index),
            from: String(day.from || ''),
            to: String(day.to || ''),
            note: String(day.note || ''),
            points: pts,
            elevation: day.elevation,
            distanceM: numOf(day.distanceM),
            durationSec: numOf(day.durationSec),
          })
        })
        if (!payload.length) {
          setTripError('没有可保存的每日路线，请先重新生成或单独重试失败的天')
          return
        }
        tripSaveAbort.current?.abort()
        const controller = new AbortController()
        tripSaveAbort.current = controller
        setTripSaving(true)
        setTripError('')
        try {
          const data = await rbPost('trips/save', {
            title: String(trip.title || '多日骑行行程'),
            days: payload,
          }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '行程保存失败'))
          setTripSaved(true)
          showToast?.(`行程已保存（${payload.length} 天）`)
          onSaved?.(Array.isArray(data.routes) && data.routes[0] ? data.routes[0] : { id: null })
        } catch (err) {
          if (err?.name === 'AbortError') return
          setTripError(String(err?.message ?? err))
          showToast?.(`保存失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setTripSaving(false)
        }
      }

      /** 失败的天单独重试：用这一天的 from→to 调 /ai-plan，再用候选覆盖当天 */
      const retryDay = async (day, index) => {
        if (dayRetrying !== null) return
        const from = String(day?.from || '').trim()
        const to = String(day?.to || '').trim()
        const km = numOf(day?.distanceM)
        const text = [
          from && to ? `${from} → ${to}` : (from || to || `第 ${index + 1} 天`),
          `第 ${index + 1} 天`,
          km !== null ? `约 ${Math.round(km / 1000)} km` : '',
          '请生成一条可骑行的路线',
        ].filter(Boolean).join('，')
        retryAbort.current?.abort()
        const controller = new AbortController()
        retryAbort.current = controller
        setDayRetrying(index)
        setTripError('')
        try {
          const data = await rbPost('ai-plan', { prompt: text }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '重新生成失败'))
          const cand = (Array.isArray(data.candidates) ? data.candidates : [])
            .find((item) => rbPoints(item?.points).length >= 2)
          if (!cand) throw new Error('没有生成可用的路线，请稍后再试')
          setTrip((prev) => {
            if (!prev) return prev
            const days = prev.days.map((item, i) => (i === index ? {
              ...item,
              status: 'ok',
              name: cand.name || item.name,
              summary: cand.summary || item.summary,
              difficulty: cand.difficulty || item.difficulty,
              difficultyReason: cand.difficultyReason || item.difficultyReason,
              distanceM: cand.distanceM ?? item.distanceM,
              durationSec: cand.durationSec ?? item.durationSec,
              elevationGainM: cand.elevationGainM ?? item.elevationGainM,
              elevationEstimated: cand.elevationEstimated ?? item.elevationEstimated,
              points: cand.points,
              elevation: cand.elevation,
            } : item))
            /* 单天重试后重算行程合计，避免头部仍显示旧的总里程 / 总爬升 */
            let sumDistance = 0
            let sumGain = 0
            days.forEach((item) => {
              if (!rbDayOk(item)) return
              const d = numOf(item.distanceM)
              const g = numOf(item.elevationGainM)
              if (d !== null) sumDistance += d
              if (g !== null) sumGain += g
            })
            return {
              ...prev,
              days,
              totalDistanceM: numOf(prev.totalDistanceM) !== null ? sumDistance : prev.totalDistanceM,
              totalElevationGainM: numOf(prev.totalElevationGainM) !== null ? sumGain : prev.totalElevationGainM,
            }
          })
          setDayOpen((prev) => ({ ...prev, [index]: true }))
          setSavedDayIds((prev) => prev.filter((i) => i !== index))
          showToast?.('已重新生成这一天')
        } catch (err) {
          if (err?.name === 'AbortError') return
          setTripError(String(err?.message ?? err))
        } finally {
          setDayRetrying(null)
        }
      }

      /** 一句话生成：只打一次 /ai-plan；force 用于「换一批」 */
      const runAi = async (force = false) => {
        const text = prompt.trim()
        if (!text) {
          setAi({
            phase: 'error',
            stage: -1,
            elapsed: 0,
            error: '先写一句规划需求，例如「周末从四明湖出发，60–80 km 环线，爬升 800 m 左右」',
            unavailable: false,
          })
          return
        }
        if (!amapReady) return
        aiAbort.current?.abort()
        const controller = new AbortController()
        aiAbort.current = controller
        setResult(null)
        setResolved(null)
        setCandidates([])
        setExpandedId(null)
        setAltFor(null)
        setAmbiguous(null)
        setPlanError('')
        setPlanPhase('idle')
        setSavedIds([])
        startTimers()
        try {
          const body = force ? { prompt: text, force: true } : { prompt: text }
          const data = await rbPost('ai-plan', body, controller.signal)
          if (data?.status !== 'ok') {
            const error = new Error(rbErrorText(data, 'AI 规划失败'))
            error.code = String(data?.code || '')
            throw error
          }
          const list = (Array.isArray(data.candidates) ? data.candidates : []).slice(0, 3)
          const parsed = data.parsed || {}
          syncFields(parsed)
          const elapsed = elapsedNow()
          clearTimers()
          setResult({ ...data, candidates: list })
          setResolved(data.resolved || null)
          setCandidates(list)
          setExpandedId(list[0]?.tempId ?? null)
          setAi({ phase: 'done', stage: RB_AI_STAGES.length - 1, elapsed, error: '', unavailable: false })
          if (!list.length) showToast?.('没有生成候选路线，补充距离或地点再试', 'err')
        } catch (err) {
          if (err?.name === 'AbortError') return
          const elapsed = elapsedNow()
          clearTimers()
          setAi({
            phase: 'error',
            stage: -1,
            elapsed,
            error: String(err?.message ?? err),
            /* host 的真实错误码是 LLM_UNAVAILABLE；AI_UNAVAILABLE 兼容旧 mock/网关 */
            unavailable: !aiAvailable || /^(AI|LLM)_UNAVAILABLE$/.test(String(err?.code || '')),
          })
        }
      }

      /** 手动规划：高级选项与「换地点」共用；返回 {status} 供调用方判断 */
      const runPlan = async (override = null, viaOverride = null, options = {}) => {
        if (!amapReady) return { status: 'off' }
        const merged = override ? { ...fields, ...override } : fields
        const origin = String(merged.origin || '').trim()
        const destination = String(merged.destination || '').trim()
        const viaList = Array.isArray(viaOverride) ? viaOverride : via
        const body = {
          origin,
          destination,
          loop: !!merged.loop,
          viaPoints: viaList.map((value) => String(value).trim()).filter(Boolean),
          targetDistanceKm: numOf(merged.targetDistanceKm),
          elevationTargetM: numOf(merged.elevationTargetM),
          city: String(merged.city || '').trim(),
        }
        if (options.autoPick) body.autoPick = true
        if (!origin || (!destination && !body.loop)) {
          setPlanPhase('error')
          setPlanError(!origin
            ? '请填写起点（也可以先用一句话生成）'
            : '请填写终点，或勾选环线')
          return { status: 'invalid' }
        }
        planAbort.current?.abort()
        const controller = new AbortController()
        planAbort.current = controller
        setPlanPhase('loading')
        setPlanError('')
        setAmbiguous(null)
        try {
          const data = await rbPost('plan', body, controller.signal)
          if (data?.status === 'ambiguous') {
            const list = Array.isArray(data.candidates) ? data.candidates : []
            const place = String(data.place || '')
            const backendField = typeof data.field === 'string' ? data.field : ''
            const field = /^(origin|destination|viaPoints\[\d+\])$/.test(backendField)
              ? backendField
              : (place && place === body.destination ? 'destination' : 'origin')
            setAmbiguous({ place, field, candidates: list })
            setPlanPhase('ambiguous')
            return { status: 'ambiguous', data }
          }
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '规划失败'))
          const list = Array.isArray(data.candidates) ? data.candidates : []
          setCandidates(list)
          setExpandedId(list[0]?.tempId ?? null)
          setSavedIds([])
          setPlanPhase(list.length ? 'candidates' : 'empty')
          return { status: 'ok', data, candidates: list }
        } catch (err) {
          if (err?.name === 'AbortError') return { status: 'aborted' }
          setPlanPhase('error')
          setPlanError(String(err?.message ?? err))
          return { status: 'error', error: err }
        }
      }

      const pickAmbiguous = (candidate) => {
        if (!ambiguous) return
        const loc = rbLocale(candidate?.location)
        if (!loc) {
          setPlanError('该地点没有坐标，请换一个候选')
          return
        }
        setPlanError('')
        const viaMatch = /^viaPoints\[(\d+)\]$/.exec(ambiguous.field)
        if (viaMatch) {
          const index = Number(viaMatch[1])
          const nextVia = via.map((value, i) => (i === index ? loc : value))
          setVia(nextVia)
          setAmbiguous(null)
          runPlan(null, nextVia)
          return
        }
        const key = ambiguous.field === 'destination' ? 'destination' : 'origin'
        const override = { [key]: loc }
        setFields((prev) => ({ ...prev, ...override }))
        setAmbiguous(null)
        runPlan(override)
      }

      /** 换地点：按选中的候选坐标重跑 /plan（传 "lng,lat"），并回写 resolved 展示 */
      const pickAlternative = async (field, alt) => {
        const loc = rbLocale(alt?.location ?? alt)
        if (!loc) {
          setPlanError('该地点没有坐标，请换一个候选')
          return
        }
        setAltFor(null)
        setPlanError('')
        const key = field === 'origin' ? 'origin' : field === 'destination' ? 'destination' : null
        const viaMatch = /^via-(\d+)$/.exec(field)
        const override = key ? { [key]: loc } : null
        let viaOverride = null
        if (viaMatch) {
          const index = Number(viaMatch[1])
          viaOverride = via.map((value, i) => (i === index ? loc : value))
          setVia(viaOverride)
        }
        if (override) setFields((prev) => ({ ...prev, ...override }))
        const res = await runPlan(override, viaOverride, { autoPick: true })
        if (res.status !== 'ok') return
        const place = {
          name: alt?.name || alt?.title || loc,
          address: alt?.address || '',
          location: loc,
        }
        setResolved((prev) => {
          if (!prev) return prev
          if (key) {
            return {
              ...prev,
              [key]: { ...(prev[key] || {}), ...place, alternatives: rbAlternatives(prev[key]) },
            }
          }
          if (viaMatch) {
            const index = Number(viaMatch[1])
            const viaList = Array.isArray(prev.via) ? prev.via.slice() : []
            viaList[index] = { ...(viaList[index] || {}), ...place }
            return { ...prev, via: viaList }
          }
          return prev
        })
        showToast?.('已按新地点重新规划')
      }

      const saveCandidate = async (candidate) => {
        if (!candidate || savingId) return
        saveAbort.current?.abort()
        const controller = new AbortController()
        saveAbort.current = controller
        const tempId = candidate.tempId
        setSavingId(tempId)
        setPlanError('')
        try {
          const data = await rbPost('save', {
            name: candidate.name,
            description: candidate.description || '',
            source: 'ai',
            points: candidate.points,
            elevation: candidate.elevation,
            distanceM: candidate.distanceM,
            durationSec: candidate.durationSec,
          }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '保存失败'))
          setSavedIds((prev) => (prev.indexOf(tempId) >= 0 ? prev : [...prev, tempId]))
          showToast?.('已保存到我的路书')
          onSaved?.(data.route || { name: candidate.name })
        } catch (err) {
          if (err?.name === 'AbortError') return
          setPlanError(String(err?.message ?? err))
          showToast?.(`保存失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setSavingId(null)
        }
      }

      /* ------------------------------ 渲染 ------------------------------ */

      const progressBox = (ai.phase === 'running' || ai.phase === 'done')
        ? h('div', {
            className: `gp-rb-stages${ai.phase === 'done' ? ' is-done' : ''}`,
            'data-gp-rb-ai-progress': '1',
            'data-gp-rb-ai-phase': ai.phase,
          },
            h('div', { className: 'gp-rb-stages-hd' },
              h('span', { className: 'tt' }, ai.phase === 'done' ? '路书已生成' : '正在生成路书…'),
              h('span', { className: 'gp-rb-stages-elapsed', 'data-gp-rb-ai-elapsed': '1' },
                `已用 ${ai.elapsed} 秒`)),
            h('div', { className: 'gp-rb-stages-list' },
              RB_AI_STAGES.map((label, index) => h('span', {
                key: label,
                className: `gp-rb-stage${ai.phase === 'done' || index < ai.stage
                  ? ' is-done'
                  : index === ai.stage ? ' is-on' : ''}`,
                'data-gp-rb-ai-stage': index,
                'data-gp-rb-ai-stage-on': index === ai.stage && ai.phase === 'running' ? '1' : '0',
              }, label))))
        : null

      const aiErrorBox = ai.phase === 'error'
        ? h('div', { className: 'gp-rb-aierr', 'data-gp-rb-ai-error': '1' },
            h('div', { className: 'gp-rb-aierr-tt' }, '生成失败'),
            h('div', { className: 'gp-rb-aierr-msg' }, ai.error || 'AI 规划失败'),
            ai.unavailable
              ? h('div', { className: 'gp-rb-muted', 'data-gp-rb-ai-unavailable': '1' },
                  'AI 规划暂不可用，可展开下方「高级选项」手动生成路线。')
              : null,
            h('div', { className: 'gp-rb-actions' },
              h('button', {
                type: 'button',
                className: 'gp-btn primary',
                onClick: () => runAi(false),
                'data-gp-rb-ai-retry': '1',
              }, '重试'),
              ai.unavailable
                ? h('button', {
                    type: 'button',
                    className: 'gp-btn',
                    onClick: () => setAdvancedOpen(true),
                    'data-gp-rb-ai-manual': '1',
                  }, '手动规划')
                : null))
        : null

      /* ---------------- 多日行程：进度 / 错误 / 结果 ---------------- */

      const multiProgressBox = (multiAi.phase === 'running' || multiAi.phase === 'done')
        ? h('div', {
            className: `gp-rb-stages${multiAi.phase === 'done' ? ' is-done' : ''}`,
            'data-gp-rb-multi-progress': '1',
            'data-gp-rb-multi-phase': multiAi.phase,
          },
            h('div', { className: 'gp-rb-stages-hd' },
              h('span', { className: 'tt' },
                multiAi.phase === 'done' ? '行程已生成' : `正在规划 ${rbDayNumber(tripDaysInput, 3)} 天行程…`),
              h('span', { className: 'gp-rb-stages-elapsed', 'data-gp-rb-multi-elapsed': '1' },
                `已用 ${multiAi.elapsed} 秒`)),
            h('div', { className: 'gp-rb-stages-list' },
              RB_AI_MULTI_STAGES.map((label, index) => h('span', {
                key: label,
                className: `gp-rb-stage${multiAi.phase === 'done' || index < multiAi.stage
                  ? ' is-done'
                  : index === multiAi.stage ? ' is-on' : ''}`,
                'data-gp-rb-multi-stage': index,
                'data-gp-rb-multi-stage-on': index === multiAi.stage && multiAi.phase === 'running' ? '1' : '0',
              }, label))))
        : null

      const diagDays = rbDiagRows(multiAi.diagnostics)

      const multiErrorBox = multiAi.phase === 'error'
        ? h('div', {
            className: 'gp-rb-aierr',
            'data-gp-rb-multi-error': '1',
            'data-gp-rb-multi-code': multiAi.code || '',
          },
            h('div', { className: 'gp-rb-aierr-tt', 'data-gp-rb-multi-title': '1' },
              multiAi.title || (multiAi.code === 'INVALID_ITINERARY' ? '行程需求需要调整' : '行程生成失败')),
            h('div', { className: 'gp-rb-aierr-msg' }, multiAi.error || 'AI 行程规划失败'),
            multiAi.detail
              ? h('div', { className: 'gp-rb-muted gp-rb-diagdetail', 'data-gp-rb-multi-detail': '1' },
                  `后端返回：${multiAi.detail}`)
              : null,
            multiAi.hint
              ? h('div', { className: 'gp-rb-muted', 'data-gp-rb-multi-hint': '1' }, multiAi.hint)
              : null,
            diagDays.length
              ? h('details', { className: 'gp-rb-diag', 'data-gp-rb-multi-diag': '1' },
                  h('summary', { 'data-gp-rb-multi-diag-toggle': '1' },
                    `按天诊断（${diagDays.length} 天失败）`),
                  h('div', { className: 'gp-rb-diag-body' },
                    diagDays.map((item, index) => h('div', {
                      key: `multi-diag-${index}`,
                      className: 'gp-rb-diag-row',
                      'data-gp-rb-multi-diag-row': String(index),
                    },
                      h('b', null, `第 ${rbDiagDayNo(item, index)} 天`),
                      h('span', { className: 'code' }, String(item?.code || 'PLANNING_FAILED')),
                      h('span', { className: 'msg' },
                        String(item?.message || item?.error || '路线规划失败'))))))
              : null,
            multiAi.unavailable
              ? h('div', { className: 'gp-rb-muted', 'data-gp-rb-multi-unavailable': '1' },
                  '当前环境 AI 规划未就绪（默认模型未选择或调用受限），「高级选项」手动规划仍然可用。')
              : null,
            h('div', { className: 'gp-rb-actions' },
              h('button', {
                type: 'button',
                className: 'gp-btn primary',
                onClick: () => runMulti(false),
                'data-gp-rb-multi-retry': '1',
              }, '重试'),
              h('button', {
                type: 'button',
                className: 'gp-btn',
                onClick: () => setMode('single'),
                'data-gp-rb-multi-single': '1',
              }, '改回单日')))
        : null

      const tripDayList = rbTripDays(trip)
      const tripTotals = trip ? rbTripTotals(trip) : null

      const dayCard = (day, index) => {
        const open = !!dayOpen[index]
        const failed = rbDayError(day)
        const diff = rbDifficulty(day?.difficulty)
        const saved = savedDayIds.indexOf(index) >= 0
        const fromTo = rbDayRouteText(day)
        const distance = numOf(day?.distanceM)
        const gain = numOf(day?.elevationGainM)
        const duration = numOf(day?.durationSec)
        const note = String(day?.note || '').trim()
        return h('article', {
          className: `gp-rb-day${failed ? ' is-error' : ''}${open ? ' is-open' : ''}`,
          key: `trip-day-${index}`,
          'data-gp-rb-day': String(index),
          'data-gp-rb-day-index': String(index),
          'data-gp-rb-day-status': failed ? 'error' : 'ok',
        },
          h('div', { className: 'gp-rb-day-hd' },
            h('span', { className: 'gp-rb-daybadge', 'data-gp-rb-day-badge': '1' }, `D${index + 1}`),
            h('div', { className: 'gp-rb-day-title', title: rbDayTitle(day, index) },
              rbDayTitle(day, index)),
            diff
              ? h('span', {
                  className: `gp-rb-diff ${diff.key}`,
                  title: day?.difficultyReason || diff.label,
                  'data-gp-rb-day-diff': diff.key,
                }, diff.label)
              : null),
          fromTo
            ? h('div', { className: 'gp-rb-day-route', 'data-gp-rb-day-route': '1' }, fromTo)
            : null,
          h('div', { className: 'gp-rb-day-meta' },
            h('span', null, '距离 ', h('b', null, rbKm(distance))),
            h('span', null, '爬升 ', h('b', null, gain === null ? '—' : rbMeter(gain))),
            h('span', null, '用时 ', h('b', null, duration === null ? '—' : clock(duration))),
            day?.elevationEstimated
              ? h('span', { className: 'gp-rb-chipv warn', 'data-gp-rb-day-estimated': '1' }, '估算海拔')
              : null),
          note
            ? h('div', { className: 'gp-rb-day-note', title: note, 'data-gp-rb-day-note': '1' }, note)
            : null,
          failed
            ? h('div', { className: 'gp-rb-day-err', 'data-gp-rb-day-error': '1' },
                h('div', null, rbDayError(day)),
                h('div', { className: 'gp-rb-actions' },
                  h('button', {
                    type: 'button',
                    className: 'gp-btn',
                    onClick: () => retryDay(day, index),
                    disabled: dayRetrying === index,
                    'data-gp-rb-day-retry': String(index),
                  }, dayRetrying === index ? '重试中…' : '单独重试'),
                  h('span', { className: 'gp-rb-hint' },
                    fromTo ? `按 ${fromTo} 重新生成` : '重新生成这一天的路线')))
            : null,
          open
            ? h('div', { className: 'gp-rb-day-track', 'data-gp-rb-day-track': String(index) },
                h(TrackPreview, {
                  points: day?.points,
                  elevation: day?.elevation,
                  distanceM: day?.distanceM,
                  elevationGainM: day?.elevationGainM,
                  height: 170,
                }))
            : null,
          h('div', { className: 'gp-rb-day-foot' },
            h('button', {
              type: 'button',
              className: 'gp-rb-linkbtn',
              'aria-expanded': open ? 'true' : 'false',
              onClick: () => setDayOpen((prev) => ({ ...prev, [index]: !open })),
              'data-gp-rb-day-expand': String(index),
            }, open ? '收起地图与海拔' : '展开地图与海拔'),
            h('span', { className: 'sp' }),
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              onClick: () => saveDay(day, index),
              disabled: saved || daySaving === index || failed,
              'data-gp-rb-day-save': String(index),
            }, saved ? '已保存' : daySaving === index ? '保存中…' : '保存这一天')))
      }

      const tripResultBox = (mode === 'multi' && trip)
        ? h('section', {
            className: 'gp-rb-tripresult',
            'data-gp-rb-trip': '1',
            'data-gp-rb-trip-days': String(tripDayList.length),
            'data-gp-rb-trip-usedweb': trip.usedWeb ? '1' : '0',
          },
            h('div', { className: 'gp-rb-trip-hd' },
              h('div', { className: 'gp-rb-trip-titlewrap' },
                h('h3', { className: 'gp-rb-trip-title', 'data-gp-rb-trip-title': '1' },
                  String(trip.title || '多日骑行行程')),
                h('div', { className: 'gp-rb-trip-meta', 'data-gp-rb-trip-meta': '1' },
                  `${tripTotals.dayCount} 天 · 总里程 ${rbKm(tripTotals.distanceM)} · 总爬升 ${rbMeter(tripTotals.gainM)}`
                  + (tripTotals.difficulty ? ` · 难度 ${tripTotals.difficulty}` : ''))),
              h('div', { className: 'gp-rb-actions' },
                h('button', {
                  type: 'button',
                  className: 'gp-btn',
                  onClick: () => runMulti(true),
                  disabled: multiAi.phase === 'running',
                  'data-gp-rb-trip-more': '1',
                }, '换一批'),
                h('button', {
                  type: 'button',
                  className: 'gp-btn primary',
                  onClick: saveTrip,
                  disabled: tripSaving || tripSaved,
                  'data-gp-rb-trip-save': '1',
                }, tripSaved ? '已保存' : tripSaving ? '保存中…' : '保存整个行程'))),
            trip.usedWeb
              ? (() => {
                  const sources = rbTripSourceLinks(trip)
                  return sources.length
                    ? h('div', { className: 'gp-rb-sources', 'data-gp-rb-sources': '1' },
                        h('span', { className: 'gp-rb-sources-lab' }, '参考来源'),
                        sources.map((item, index) => h('a', {
                          key: `trip-source-${index}`,
                          className: 'gp-rb-source',
                          href: String(item.url || '#'),
                          target: '_blank',
                          rel: 'noreferrer',
                          title: String(item.title || item.url || '参考来源'),
                          'data-gp-rb-source': String(index),
                        }, String(item.title || item.url || '参考来源'))))
                    : null
                })()
              : h('div', { className: 'gp-rb-muted', 'data-gp-rb-noweb': '1' },
                  '未使用联网参考（AI 知识+地图规划）'),
            h('div', { className: 'gp-rb-trip-overview', 'data-gp-rb-trip-overview': '1' },
              h(TrackPreview, {
                points: Array.isArray(trip.overviewPoints) && trip.overviewPoints.length
                  ? trip.overviewPoints
                  : tripDayList.reduce((acc, day) => acc.concat(rbPoints(day?.points)), []),
                distanceM: tripTotals.distanceM,
                elevationGainM: tripTotals.gainM,
                showElevation: false,
                height: 210,
              })),
            h('div', { className: 'gp-rb-days', 'data-gp-rb-days': '1' },
              tripDayList.map((day, index) => dayCard(day, index))),
            trip.engine
              ? h('div', { className: 'gp-rb-hint gp-rb-trip-foot', 'data-gp-rb-trip-engine': '1' },
                  `生成引擎 ${trip.engine}`)
              : null,
            tripError
              ? h('div', { className: 'gp-rb-error', 'data-gp-rb-trip-error': '1' }, tripError)
              : null)
        : null

      const promptPlaceholder = mode === 'multi'
        ? '例：环海南岛 8 天，人均每天 70–90 km，想走东线经典路段'
        : '例：周末从四明湖出发，60–80 km 环线，爬升 800 m 左右，想走湖边和古镇，体能中等'

      const promptHero = h('section', { className: 'gp-rb-aihero', 'data-gp-rb-aihero': '1' },
        h('div', { className: 'gp-rb-aihero-hd' },
          h('h2', null, mode === 'multi' ? '一句话生成多日骑行行程' : '一句话生成成熟路书'),
          h('span', { className: 'gp-rb-hint' },
            amapReady
              ? (mode === 'multi'
                  ? '写清天数、每天里程与想走的区域，AI 会按天排路线并估算海拔'
                  : '描述场景、距离和想走的地方，AI 会挑地点、排路线、估海拔')
              : '配置高德 Key 后才能生成路线')),
        h('div', { className: 'gp-rb-modeseg', 'data-gp-rb-mode': '1', role: 'group', 'aria-label': '规划模式' },
          h('button', {
            type: 'button',
            className: `gp-rb-modebtn${mode === 'single' ? ' on' : ''}`,
            'aria-pressed': mode === 'single' ? 'true' : 'false',
            'data-gp-rb-mode-btn': 'single',
            onClick: () => setMode('single'),
          }, '单日'),
          h('button', {
            type: 'button',
            className: `gp-rb-modebtn${mode === 'multi' ? ' on' : ''}`,
            'aria-pressed': mode === 'multi' ? 'true' : 'false',
            'data-gp-rb-mode-btn': 'multi',
            onClick: () => setMode('multi'),
          }, '多日')),
        mode === 'multi'
          ? h('div', { className: 'gp-rb-multirow', 'data-gp-rb-multirow': '1' },
              h('label', { className: 'gp-rb-field gp-rb-daysfield' },
                h('span', { className: 'gp-rb-lab' }, '天数'),
                h('select', {
                  className: 'gp-rb-input gp-rb-select',
                  value: String(tripDaysInput),
                  onChange: (event) => setTripDaysInput(rbDayNumber(event.target.value, 3)),
                  'data-gp-rb-days': '1',
                }, Array.from({ length: RB_MULTI_MAX_DAYS - RB_MULTI_MIN_DAYS + 1 }, (_, i) => RB_MULTI_MIN_DAYS + i)
                  .map((value) => h('option', { key: value, value: String(value) }, `${value} 天`)))),
              h('label', { className: 'gp-rb-field' },
                h('span', { className: 'gp-rb-lab' }, '总里程 km（可选）'),
                h('input', {
                  className: 'gp-rb-input',
                  type: 'number',
                  min: 0,
                  value: tripDistanceKm,
                  placeholder: '例如 600',
                  spellCheck: false,
                  onChange: (event) => setTripDistanceKm(event.target.value),
                  'data-gp-rb-total-distance': '1',
                })),
              h('label', { className: 'gp-rb-check gp-rb-useweb' },
                h('input', {
                  type: 'checkbox',
                  checked: !!useWeb,
                  onChange: (event) => setUseWeb(event.target.checked),
                  'data-gp-rb-useweb': '1',
                }),
                '联网参考经典路线'))
          : null,
        h('textarea', {
          className: 'gp-rb-textarea gp-rb-prompt',
          value: prompt,
          placeholder: promptPlaceholder,
          maxLength: 2000,
          spellCheck: false,
          onChange: (event) => setPrompt(event.target.value),
          'data-gp-rb-prompt': '1',
        }),
        h('div', { className: 'gp-rb-actions' },
          h('button', {
            type: 'button',
            className: 'gp-btn primary gp-rb-generate',
            onClick: () => (mode === 'multi' ? runMulti(false) : runAi(false)),
            disabled: !amapReady || !aiAvailable
              || (mode === 'multi' ? multiAi.phase === 'running' : ai.phase === 'running'),
            title: !amapReady ? '未配置高德 Web服务 Key' : !aiAvailable ? 'AI 规划暂不可用'
              : mode === 'multi' ? '生成多日行程' : '生成路书',
            'data-gp-rb-ai-generate': '1',
          }, mode === 'multi'
            ? (multiAi.phase === 'running' ? '生成中…' : '生成行程')
            : (ai.phase === 'running' ? '生成中…' : '生成路书')),
          h('button', {
            type: 'button',
            className: 'gp-btn',
            onClick: () => (mode === 'multi' ? runMulti(true) : runAi(true)),
            disabled: !amapReady || !aiAvailable
              || (mode === 'multi' ? multiAi.phase === 'running' : ai.phase === 'running'),
            'data-gp-rb-ai-more': '1',
          }, '换一批'),
          h('span', { className: 'gp-rb-hint' },
            mode === 'multi' ? '一次生成 2–15 天行程，可换一批重来' : '一次生成 2–3 条候选，可换一批重来')),
        !aiAvailable
          ? h('div', { className: 'gp-rb-muted', 'data-gp-rb-ai-off': '1' },
              'AI 规划暂不可用，可展开下方「高级选项」手动生成路线。')
          : null,
        amapKnown && !amapReady
          ? h('div', { className: 'gp-rb-muted gp-rb-setup', 'data-gp-rb-amap-missing': '1' },
              h('span', null, !amapConfigured
                ? '未配置高德 Web服务 Key，暂时无法 AI 规划。'
                : `高德 Key 无效：${keysErrorText(status.data.amapKeyError, '请重新设置')}`),
              h('button', {
                type: 'button',
                className: 'gp-btn',
                onClick: () => onOpenSettings?.(),
                'data-gp-rb-amap-settings': '1',
              }, '去设置'))
          : null,
        mode === 'multi' ? multiProgressBox : progressBox,
        mode === 'multi' ? multiErrorBox : aiErrorBox)

      const placeNode = (label, key, place) => {
        const alts = rbAlternatives(place)
        return h('div', { className: 'gp-rb-place', key },
          h('span', { className: 'k' }, `${label}：`),
          h('span', { className: 'v', title: place?.address || '' }, rbPlaceText(place) || '待定'),
          alts.length
            ? h('button', {
                type: 'button',
                className: 'gp-rb-linkbtn',
                'aria-expanded': altFor === key ? 'true' : 'false',
                'data-gp-rb-swap': key,
                onClick: () => setAltFor(altFor === key ? null : key),
                disabled: planPhase === 'loading',
              }, altFor === key ? '收起' : '换地点')
            : null)
      }

      const altBox = (key, place) => {
        if (altFor !== key) return null
        const alts = rbAlternatives(place)
        if (!alts.length) return null
        return h('div', { className: 'gp-rb-alt', 'data-gp-rb-alt': key, key },
          h('div', { className: 'gp-rb-alt-hd' }, `「${place?.name || '地点'}」的其他匹配`),
          alts.map((alt, index) => h('button', {
            type: 'button',
            className: 'gp-rb-alt-item',
            key: index,
            'data-gp-rb-alt-item': String(index),
            disabled: planPhase === 'loading',
            onClick: () => pickAlternative(key, alt),
          },
            h('b', null, alt?.name || alt?.title || `备选 ${index + 1}`),
            alt?.address ? h('span', null, alt.address) : null)))
      }

      const viaList = resolved && Array.isArray(resolved.via) ? resolved.via : []
      const loop = !!(result?.parsed?.loop ?? fields.loop)
      const destinationPlace = resolved && resolved.destination
        ? resolved.destination
        : (loop ? { name: '同起点（环线）', address: '' } : null)
      const resolvedBox = resolved
        ? h('div', { className: 'gp-rb-resolved', 'data-gp-rb-resolved': '1' },
            h('div', { className: 'gp-rb-resolved-line', 'data-gp-rb-resolved-line': '1' },
              placeNode('起点', 'origin', resolved.origin),
              h('span', { className: 'dot', 'aria-hidden': true }, '·'),
              placeNode('终点', 'destination', destinationPlace)),
            viaList.length
              ? h('div', { className: 'gp-rb-resolved-line' },
                  viaList.map((place, index) => placeNode(`途经 ${index + 1}`, `via-${index}`, place)))
              : null,
            altBox('origin', resolved.origin),
            altBox('destination', resolved.destination),
            viaList.map((place, index) => altBox(`via-${index}`, place)))
        : null

      const candidateCard = (candidate, index) => {
        const id = candidate.tempId ?? `cand_${index}`
        const diff = rbDifficulty(candidate.difficulty)
        const open = expandedId === id
        const saved = savedIds.indexOf(id) >= 0
        const loop = !!(result?.parsed?.loop ?? fields.loop)
        const summary = [
          rbShape(loop),
          rbKm(numOf(candidate.distanceM)),
          `爬升 ${rbMeter(numOf(candidate.elevationGainM))}`,
          clock(numOf(candidate.durationSec)),
        ]
        return h('article', {
          className: 'gp-rb-aicand',
          key: id,
          'data-gp-rb-cand': String(id),
          'data-gp-rb-cand-diff': diff?.key || '',
        },
          h('div', { className: 'gp-rb-aicand-hd' },
            h('div', { className: 'nm', title: candidate.name }, candidate.name || `候选路线 ${index + 1}`),
            diff
              ? h('span', {
                  className: `gp-rb-diff ${diff.key}`,
                  title: candidate.difficultyReason || diff.label,
                  'data-gp-rb-diff-pill': diff.key,
                }, diff.label)
              : null),
          h('div', { className: 'gp-rb-aicand-sum', 'data-gp-rb-cand-sum': '1' }, summary.join(' · ')),
          candidate.description
            ? h('div', { className: 'gp-rb-aicand-desc', title: candidate.description }, candidate.description)
            : null,
          candidate.elevationEstimated
            ? h('div', { className: 'gp-rb-aicand-badges' },
                h('span', { className: 'gp-rb-chipv warn', 'data-gp-rb-estimated': '1' }, '估算'))
            : null,
          open
            ? h('div', { className: 'gp-rb-aicand-track', 'data-gp-rb-cand-track': String(id) },
                h(TrackPreview, {
                  points: candidate.points,
                  elevation: candidate.elevation,
                  distanceM: candidate.distanceM,
                  elevationGainM: candidate.elevationGainM,
                  height: 180,
                }))
            : null,
          h('div', { className: 'gp-rb-aicand-foot' },
            h('button', {
              type: 'button',
              className: 'gp-rb-linkbtn',
              'aria-expanded': open ? 'true' : 'false',
              'data-gp-rb-cand-expand': String(id),
              onClick: () => setExpandedId(open ? null : id),
            }, open ? '收起轨迹与海拔' : '展开轨迹与海拔'),
            h('span', { className: 'sp' }),
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              'data-gp-rb-cand-save': String(id),
              disabled: saved || savingId === id,
              onClick: () => saveCandidate(candidate),
            }, saved ? '已保存' : savingId === id ? '保存中…' : '保存为路书')))
      }

      const ambigBox = ambiguous
        ? h('div', { className: 'gp-rb-ambig', 'data-gp-rb-ambiguous': '1' },
            h('div', { className: 'gp-rb-ambig-hd' }, `「${ambiguous.place}」有多个匹配地点`),
            h('div', { className: 'gp-rb-cands' },
              (ambiguous.candidates || []).map((candidate, index) => h('button', {
                type: 'button',
                key: `${candidate.name}-${index}`,
                className: 'gp-rb-cand',
                onClick: () => pickAmbiguous(candidate),
                'data-gp-rb-ambig-cand': String(index),
              },
                h('div', { className: 'top' },
                  h('div', { className: 'nm' }, candidate.name || `候选地点 ${index + 1}`)),
                h('div', { className: 'sub' }, candidate.address || '')))))
        : null

      const resultsBox = (mode === 'single' && (resolved || candidates.length || ambiguous || planError))
        ? h('div', { className: 'gp-rb-results', 'data-gp-rb-results': '1' },
            resolvedBox,
            ambigBox,
            candidates.length
              ? h('section', { className: 'gp-rb-sec' },
                  h('div', { className: 'gp-rb-results-hd' },
                    h('h3', null, `候选路线（${candidates.length}）`),
                    h('span', { className: 'gp-rb-hint' },
                      result?.engine ? `生成引擎 ${result.engine}` : '来自高德规划')),
                  h('div', { className: 'gp-rb-aicands', 'data-gp-rb-cands': '1' },
                    candidates.map(candidateCard)))
              : null,
            planError
              ? h('div', { className: 'gp-rb-error', 'data-gp-rb-plan-error': '1' }, planError)
              : null)
        : null

      const idleBox = (mode === 'single'
        ? (ai.phase === 'idle' && !resolved && !candidates.length && !ambiguous && !planError)
        : (multiAi.phase === 'idle' && !trip))
        ? h('div', { className: 'gp-rb-placeholder', 'data-gp-rb-placeholder': '1' },
            h('div', { className: 'gp-rb-empty-ic', 'aria-hidden': true },
              h('svg', { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none' },
                h('path', {
                  d: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z',
                  stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round',
                }),
                h('circle', { cx: 9, cy: 11, r: 1.5, fill: 'currentColor' }))),
            h('div', { className: 'big' },
              mode === 'multi' ? '生成后在这里预览整段行程' : '生成后在这里预览候选路线'),
            h('div', { className: 'gp-rb-hint' },
              mode === 'multi'
                ? '设定天数 → 生成每日路线 → 逐天预览海拔，或一次保存整个行程。'
                : '写一句需求 → 生成 2–3 条成熟路书 → 选一条保存到我的路书。'))
        : null

      const input = (key, placeholder, extra = null) => h('input', {
        className: 'gp-rb-input',
        value: fields[key],
        placeholder,
        spellCheck: false,
        onChange: (event) => setField(key, event.target.value),
        ...(extra || {}),
      })

      const field = (label, node, extraClass = '') => h('label', {
        className: `gp-rb-field${extraClass ? ` ${extraClass}` : ''}`,
      },
        h('span', { className: 'gp-rb-lab' }, label),
        node)

      const advanced = h('details', {
        className: 'gp-rb-adv',
        'data-gp-rb-advanced': '1',
        open: advancedOpen || undefined,
        onToggle: (event) => setAdvancedOpen(!!event.currentTarget.open),
      },
        h('summary', { 'data-gp-rb-advanced-toggle': '1' }, '高级选项'),
        h('div', { className: 'gp-rb-adv-body' },
          h('p', { className: 'gp-rb-note' },
            '手动指定起点 / 终点 / 途经点，适合已有明确坐标或想微调距离、爬升时使用。'),
          h('div', { className: 'gp-rb-form-grid' },
            field('起点', input('origin', '例如 四明湖', { 'data-gp-rb-origin': '1' })),
            field('终点', input('destination', '例如 四明山', { 'data-gp-rb-destination': '1' })),
            h('div', { className: 'gp-rb-field full' },
              h('span', { className: 'gp-rb-lab' }, '途经点（可增删）'),
              h('div', { className: 'gp-rb-via' },
                via.map((value, index) => h('div', { className: 'gp-rb-inline', key: index },
                  h('input', {
                    className: 'gp-rb-input',
                    value,
                    placeholder: '途经点（可选）',
                    onChange: (event) => setVia((prev) => prev.map((v, i) => (i === index ? event.target.value : v))),
                    'data-gp-rb-via': String(index),
                  }),
                  h('button', {
                    type: 'button',
                    className: 'gp-btn',
                    onClick: () => setVia((prev) => prev.filter((_, i) => i !== index)),
                    'aria-label': '删除途经点',
                  }, '－'))),
                h('button', {
                  type: 'button',
                  className: 'gp-btn',
                  onClick: () => setVia((prev) => [...prev, '']),
                  'data-gp-rb-via-add': '1',
                }, '＋ 添加途经点'))),
            h('label', { className: 'gp-rb-check full' },
              h('input', {
                type: 'checkbox',
                checked: !!fields.loop,
                onChange: (event) => setField('loop', event.target.checked),
                'data-gp-rb-loop': '1',
              }),
              '环线（起点即终点）'),
            field('目标距离（km）', input('targetDistanceKm', '例如 60', {
              type: 'number', min: 0, 'data-gp-rb-distance': '1',
            })),
            field('目标爬升（m）', input('elevationTargetM', '例如 800', {
              type: 'number', min: 0, 'data-gp-rb-elevation': '1',
            })),
            field('城市', input('city', '例如 宁波', { 'data-gp-rb-city': '1' }), 'full')),
          h('div', { className: 'gp-rb-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              onClick: () => runPlan(),
              disabled: !amapReady || planPhase === 'loading' || planPhase === 'saving',
              title: amapReady ? '按上面的条件生成路线' : '未配置高德 Web服务 Key',
              'data-gp-rb-plan': '1',
            }, planPhase === 'loading' ? '规划中…' : '生成路线'),
            h('span', { className: 'gp-rb-hint' }, '未勾选环线时必须填写终点。')),
          planPhase === 'loading'
            ? h('div', { className: 'gp-rb-plan-loading', 'data-gp-rb-plan-loading': '1' },
                h('i', { className: 'gp-rb-spin big', 'aria-hidden': true }),
                h('b', null, '正在规划骑行路线…（约 5–15 秒）'),
                h('span', { className: 'gp-rb-hint' }, '正在向高德请求候选路线并计算海拔。'))
            : null))

      return h('div', { className: 'gp-rb-tabpanel', 'data-gp-rb-panel': 'plan' },
        h('div', { className: 'gp-rb-sechead' },
          h('h2', null, 'AI 规划'),
          h('span', { className: 'hint' }, '一句话描述目的地与强度，生成可直接保存的骑行路书')),
        h('div', { className: 'gp-rb-ai' },
          promptHero,
          idleBox,
          mode === 'multi' ? tripResultBox : resultsBox,
          advanced))
    }

    /* --------------------------- 路书工坊外壳 --------------------------- */
    function RouteWorkshop({ showToast, statusVersion = 0, onOpenSettings = null }) {
      const [tab, setTab] = React.useState('mine')
      const [version, setVersion] = React.useState(0)
      const [highlightId, setHighlightId] = React.useState(null)
      const status = useRbResource('status', `${version}:${statusVersion}`)
      const bump = React.useCallback(() => setVersion((value) => value + 1), [])
      const info = status.data || {}
      const pending = !status.data && status.loading
      const svcClass = (ok, warn) => (ok ? 'ok' : warn ? 'warn' : 'off')
      const amapValid = info.amapKeyValid !== false
      const amapText = !info.amapConfigured ? '未配置' : amapValid ? '已配置' : 'Key 无效'

      /* 规划保存 → 重取列表 + 切到「我的路书」并高亮新卡片 */
      const goMine = React.useCallback((route) => {
        setVersion((value) => value + 1)
        setHighlightId(route?.id !== undefined && route?.id !== null ? String(route.id) : null)
        setTab('mine')
        const root = document.querySelector('.gp-root')
        if (root) root.scrollTop = 0
      }, [])

      const switchTab = (id) => {
        setHighlightId(null)
        setTab(id)
        const root = document.querySelector('.gp-root')
        if (root) root.scrollTop = 0
      }

      return h('div', { className: 'gp-rb', 'data-gp-rb': '1' },
        h('div', { className: 'gp-rb-lead' },
          h('h1', null, '路线规划、导入与保存'),
          h('p', null, '把行者路书、GPX 或 AI 规划的骑行路线收进一处，导出后导入佳明。'),
          h('div', { className: 'gp-rb-svc' },
            h('span', { className: 'sv' }, '行者 ',
              h('b', {
                className: svcClass(info.xingzheConfigured && info.xingzheAuthorized, info.xingzheConfigured && !info.xingzheAuthorized),
              }, pending ? '…' : !info.xingzheConfigured ? '未配置' : info.xingzheAuthorized ? '已授权' : '未授权')),
            h('span', { className: 'sv' }, '高德 ',
              h('b', { className: svcClass(amapValid && info.amapConfigured, !amapValid && info.amapConfigured) },
                pending ? '…' : amapText)),
            h('span', { className: 'sv' }, '已存 ',
              h('b', null, pending ? '…' : typeof info.routeCount === 'number' ? String(info.routeCount) : '—'),
              ' 条'))),
        status.error
          ? h('div', { className: 'gp-rb-error', 'data-gp-rb-status-error': '1' },
              `服务状态获取失败：${status.error}`)
          : null,
        h('div', { className: 'gp-rb-tabs', role: 'tablist', 'aria-label': '路书工坊标签' },
          RB_TABS.map((item) => h('button', {
            key: item.id,
            type: 'button',
            role: 'tab',
            'aria-selected': tab === item.id,
            className: `gp-rb-tab${tab === item.id ? ' on' : ''}`,
            'data-gp-rb-tab': item.id,
            onClick: () => switchTab(item.id),
          }, item.label))),
        h('div', { className: 'gp-rb-panel' },
          tab === 'mine'
            ? h(RouteMineTab, {
                version,
                onRefresh: bump,
                onGoTab: switchTab,
                showToast,
                highlightId,
              })
            : tab === 'import'
              ? h(RouteImportTab, {
                  status,
                  onSaved: bump,
                  showToast,
                  onGoTab: switchTab,
                  onGoPlan: () => switchTab('plan'),
                  onStatus: bump,
                  onOpenSettings,
                })
              : h(RoutePlanTab, { status, onSaved: goMine, showToast, onOpenSettings })))
    }
    /* ---------------------------------------------------------------- *
     * 登录界面
     * ---------------------------------------------------------------- */
    /**
     * 邮箱 / 密码 / 区域 / MFA 表单本身。
     * LoginView（整页登录）和进阶解锁卡片共用同一套逻辑，只是外壳不同。
     */
    function Credentials({ compact = false, onSuccess }) {
      const [email, setEmail] = React.useState('')
      const [password, setPassword] = React.useState('')
      const [region, setRegion] = React.useState('intl')
      const [code, setCode] = React.useState('')
      const [phase, setPhase] = React.useState('form')
      const [busy, setBusy] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [note, setNote] = React.useState(null)

      const apply = (r) => {
        setBusy(false)
        if (!r) { setError('登录请求失败'); return }
        if (r.state === 'mfa') {
          setPhase('mfa')
          setNote('Garmin 需要两步验证码，验证码已发送到你的邮箱/手机。')
          return
        }
        if (r.state === 'ok') {
          setNote('登录成功，正在重连 Garmin…')
          onSuccess?.()
          return
        }
        if (r.state === 'failed') setError(r.error || '登录失败')
        else setNote('正在连接 Garmin…')
      }

      const post = async (path, body) => {
        setBusy(true)
        setError(null)
        try {
          const res = await fetch(`${API}/${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          apply(await res.json())
        } catch (err) {
          setBusy(false)
          setError(String(err))
        }
      }

      const fields = phase === 'form'
        ? [
            h('label', { key: 'email', className: 'gp-field' },
              h('span', null, 'Garmin 邮箱'),
              h('input', {
                className: 'gp-input', type: 'email', value: email, autoComplete: 'username',
                placeholder: 'you@example.com',
                onChange: (e) => setEmail(e.target.value),
              })),
            h('label', { key: 'pass', className: 'gp-field' },
              h('span', null, '密码'),
              h('input', {
                className: 'gp-input', type: 'password', value: password, autoComplete: 'current-password',
                placeholder: '••••••••',
                onChange: (e) => setPassword(e.target.value),
                onKeyDown: (e) => { if (e.key === 'Enter' && !busy) post('login', { email, password, region }) },
              })),
            h('label', { key: 'region', className: 'gp-field' },
              h('span', null, '账号区域'),
              h('select', {
                className: 'gp-input', value: region,
                onChange: (e) => setRegion(e.target.value),
              },
                h('option', { value: 'intl' }, '国际版 (garmin.com)'),
                h('option', { value: 'cn' }, '中国版 (garmin.cn)'))),
            h('div', { key: 'act', className: 'gp-auth-actions' },
              h('button', {
                className: 'gp-btn primary', disabled: busy,
                onClick: () => post('login', { email, password, region }),
              }, busy ? '登录中…' : '登录'),
              compact
                ? null
                : h('span', { className: 'gp-mini' }, '开启两步验证的话，下一步会让你填验证码')),
          ]
        : [
            h('label', { key: 'code', className: 'gp-field' },
              h('span', null, '两步验证码'),
              h('input', {
                className: 'gp-input', value: code, inputMode: 'numeric', placeholder: '6 位数字',
                onChange: (e) => setCode(e.target.value),
                onKeyDown: (e) => { if (e.key === 'Enter' && !busy) post('login/mfa', { code }) },
              })),
            h('div', { key: 'act', className: 'gp-auth-actions' },
              h('button', {
                className: 'gp-btn primary', disabled: busy,
                onClick: () => post('login/mfa', { code }),
              }, busy ? '验证中…' : '提交验证码'),
              h('button', {
                className: 'gp-btn', disabled: busy,
                onClick: () => { setPhase('form'); setCode(''); setError(null); setNote(null) },
              }, '返回')),
          ]

      return h('form', {
        className: `gp-form${compact ? ' gp-form-compact' : ''}`,
        onSubmit: (e) => e.preventDefault(),
      },
        ...fields,
        note ? h('div', { className: 'gp-mini' }, note) : null,
        error ? h('div', { className: 'gp-err' }, error) : null)
    }

    function LoginView({ onAuthed }) {
      return h('div', { className: 'gp-auth gp-card' },
        h('div', { className: 'gp-auth-head' },
          h('div', { className: 'gp-auth-title' }, '登录 Garmin'),
          h('div', { className: 'gp-mini' },
            '面板需要你的 Garmin 账号授权。凭据只在本地换取令牌（存 ~/.garminconnect），不会上传或保存密码。')),
        h(Credentials, { onSuccess: onAuthed }),
        h('div', { className: 'gp-auth-foot' },
          '登录后可解锁训练负荷、训练准备度、装备与训练计划等进阶数据。'))
    }

    /* ---------------------------------------------------------------- *
     * 进阶解锁：setup/install → 轮询日志 → 账号登录（MFA）→ 刷新
     * 状态放在 Page 里，所有解锁卡片共用同一个 flow，避免重复安装/轮询
     * ---------------------------------------------------------------- */
    const UNLOCK_REASON = '训练负荷（CTL/ATL/ACWR）、训练准备度、VO₂max 趋势、比赛预测、装备、训练计划——这些 Garmin 官方 Personal API 不提供，需要 Garmin 账号密码登录。'
    const UNLOCK_POLL_MS = 1200
    const UNLOCK_MAX_POLLS = 150

    function useUnlockFlow(onUnlocked) {
      const [phase, setPhase] = React.useState('idle') // idle | installing | login | failed | ok
      const [lines, setLines] = React.useState([])
      const [error, setError] = React.useState(null)
      // 哪个卡片发起了流程：只有它展开进度/登录表单，其余卡片显示一行状态
      const [owner, setOwner] = React.useState(null)
      const timer = React.useRef(null)
      const alive = React.useRef(true)
      const polls = React.useRef(0)
      const doneRef = React.useRef(onUnlocked)
      doneRef.current = onUnlocked

      const stop = React.useCallback(() => {
        if (timer.current) { clearTimeout(timer.current); timer.current = null }
      }, [])

      React.useEffect(() => () => { alive.current = false; stop() }, [stop])

      const poll = React.useCallback(async () => {
        if (!alive.current) return
        polls.current += 1
        try {
          const data = await fetchJson('setup/install/log')
          if (!alive.current) return
          const nextLines = Array.isArray(data?.lines) ? data.lines : null
          if (nextLines) setLines(nextLines)
          if (data?.failed) {
            const marked = [...(nextLines || [])]
              .reverse()
              .find((line) => /^[✗×x]\s/.test(String(line).trim()))
            stop()
            setPhase('failed')
            setError(String(data.error || data.message || marked || '组件准备失败，请重试'))
            return
          }
          if (data?.done) {
            stop()
            setPhase('login')
            return
          }
          if (polls.current >= UNLOCK_MAX_POLLS) {
            stop()
            setPhase('failed')
            setError('等待组件准备超时，请重试')
            return
          }
          stop()
          timer.current = setTimeout(() => { void poll() }, UNLOCK_POLL_MS)
        } catch (err) {
          if (!alive.current) return
          stop()
          setPhase('failed')
          setError(String(err?.message ?? err))
        }
      }, [stop])

      const start = React.useCallback(async (ownerId = 'card') => {
        stop()
        polls.current = 0
        setOwner(ownerId)
        setPhase('installing')
        setLines([])
        setError(null)
        try {
          const data = await postJson('setup/install')
          if (!alive.current) return
          if (data && data.started === false) {
            setPhase('failed')
            setError(String(data.error || '无法开始准备组件'))
            return
          }
          void poll()
        } catch (err) {
          if (!alive.current) return
          setPhase('failed')
          setError(String(err?.message ?? err))
        }
      }, [poll, stop])

      const reset = React.useCallback(() => {
        stop()
        setPhase('idle')
        setOwner(null)
        setLines([])
        setError(null)
      }, [stop])

      const succeed = React.useCallback(() => {
        stop()
        setPhase('ok')
        doneRef.current?.()
        timer.current = setTimeout(() => {
          if (alive.current) { setPhase('idle'); setOwner(null); setLines([]); setError(null) }
        }, 3200)
      }, [stop])

      return { phase, lines, error, owner, start, reset, succeed }
    }

    /**
     * 一块「解锁进阶数据」卡片；安装中显示只读日志，完成后原地变成登录表单。
     * head=false + reason=null 时只保留流程本体，供新手引导第 3 步嵌进自己的卡片。
     */
    function UnlockCard({
      flow, id = 'card', compact = false, bare = false, className = '', hint = null,
      showHead = true, reason = UNLOCK_REASON, onStart = null, startLabel = '自动准备并登录',
    }) {
      if (!flow) return null
      const cls = ['gp-unlock']
      if (compact) cls.push('compact')
      if (bare) cls.push('bare')
      if (className) cls.push(className)
      const shell = cls.join(' ')
      const { phase } = flow
      const active = !flow.owner || flow.owner === id
      const begin = () => {
        onStart?.()
        flow.start(id)
      }

      if (phase === 'ok') {
        return h('div', { className: shell },
          hint ? h('div', { className: 'gp-unlock-muted' }, hint) : null,
          h('div', { className: 'gp-hintline' },
            h('span', { className: 'gp-dot' }),
            h('span', null, '已解锁进阶数据，正在刷新…')))
      }

      const head = showHead
        ? h('div', { className: 'gp-unlock-hd' },
            h('span', { className: 'gp-unlock-ic', 'aria-hidden': true }, '🔓'),
            h('b', null, '解锁进阶数据'),
            compact ? null : h('span', { className: 'gp-unlock-tag' }, '需要账号登录'))
        : null

      let body
      if (phase !== 'idle' && !active) {
        body = h(React.Fragment, null,
          reason ? h('div', { className: 'gp-unlock-copy' }, reason) : null,
          phase === 'failed'
            ? h('div', { className: 'gp-unlock-muted' }, '组件准备失败')
            : h('div', { className: 'gp-hintline' },
                h('span', { className: 'gp-spin', 'aria-hidden': true }),
                h('span', null, phase === 'login' ? '等待登录完成…' : '正在准备组件…')))
      } else if (phase === 'installing') {
        const tail = flow.lines.slice(-8)
        body = h(React.Fragment, null,
          h('div', { className: 'gp-hintline', role: 'status', 'aria-live': 'polite' },
            h('span', { className: 'gp-spin', 'aria-hidden': true }),
            h('span', null, '正在下载组件…')),
          h('div', {
            className: 'gp-log',
            role: 'log',
            'aria-live': 'polite',
            'aria-label': '组件准备日志',
            'data-gp-install-log': '1',
          },
            tail.length
              ? tail.map((line, i) => h('div', { key: i, className: 'gp-log-line' }, String(line)))
              : h('div', { className: 'gp-log-line' }, '等待日志…')),
          h('div', { className: 'gp-unlock-muted' },
            '准备完成后会在这里显示登录表单，全程不需要命令行。'))
      } else if (phase === 'failed') {
        const tail = flow.lines.slice(-4)
        body = h(React.Fragment, null,
          h('div', { className: 'gp-unlock-err' }, flow.error || '准备失败，请重试'),
          tail.length
            ? h('div', { className: 'gp-log' },
                tail.map((line, i) => h('div', { key: i, className: 'gp-log-line' }, String(line))))
            : null,
          h('div', { className: 'gp-unlock-actions' },
            h('button', {
              className: 'gp-btn primary',
              'data-gp-unlock-retry': id,
              onClick: begin,
            }, '重试'),
            h('button', { className: 'gp-btn', onClick: () => flow.reset() }, '取消')))
      } else if (phase === 'login') {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-unlock-muted' }, '组件已就绪，用 Garmin 账号登录即可解锁。'),
          h(Credentials, { compact: true, onSuccess: flow.succeed }))
      } else {
        body = h(React.Fragment, null,
          hint ? h('div', { className: 'gp-unlock-muted' }, hint) : null,
          reason ? h('div', { className: 'gp-unlock-copy' }, reason) : null,
          h('div', { className: 'gp-unlock-actions' },
            h('button', {
              className: 'gp-btn primary',
              'data-gp-unlock-start': id,
              onClick: begin,
            }, startLabel),
            compact ? null : h('span', { className: 'gp-unlock-muted' }, '全程在面板内完成')))
      }

      return h('div', { className: shell }, head, body)
    }

    /* ---------------------------------------------------------------- *
     * 首次连接引导：获取只读 Key → 粘贴验证 → 可选解锁进阶数据
     * 整页首屏与「重看新手引导」浮层共用同一个组件，互不重置 Key / 模式
     * ---------------------------------------------------------------- */
    const ONBOARD_FLAG = 'garmin-panel-onboarded-v1'
    const API_TOKEN_URL = 'https://connect.garmin.com/app/settings/personalApiToken'
    const GARMIN_LOGIN_URL = 'https://connect.garmin.com'

    function markOnboarded() {
      try { localStorage.setItem(ONBOARD_FLAG, '1') } catch { /* 隐私模式：只影响记忆 */ }
    }
    function readOnboarded() {
      try { return localStorage.getItem(ONBOARD_FLAG) === '1' } catch { return false }
    }

    /** 第 1 步：去哪里拿 Key（含可展开的分步帮助） */
    function OnboardStep1({ open, onToggle }) {
      const helpId = 'gp-onb-help'
      const steps = [
        ['在打开的页面登录 Garmin 账号'],
        ['右上角头像 → 设置（Settings）→ 找到 Personal API'],
        [h('span', null,
          '点「创建」并选择有效期（', h('code', null, '30/90/180/365'), ' 天，建议 365）')],
        [h('span', null, h('b', null, 'Key 只显示一次'), '——先复制，再关闭页面')],
        ['回到这里粘贴'],
      ]
      return h('section', { className: 'gp-onb-step gp-onb-step1', 'data-gp-onb-step': '1' },
        h('div', { className: 'gp-onb-step-hd' },
          h('span', { className: 'gp-onb-n', 'aria-hidden': true }, '1'),
          h('h2', { className: 'gp-onb-step-title' }, '获取只读 Key'),
          h('span', { className: 'gp-onb-tag' }, '免费')),
        h('p', { className: 'gp-onb-copy' },
          'Garmin 有一个官方的只读接口（Personal API），可以生成一串 Key，用来读取你的运动和健康数据。'),
        h('div', { className: 'gp-onb-actions' },
          h('a', {
            className: 'gp-btn primary gp-onb-link',
            href: API_TOKEN_URL,
            target: '_blank',
            rel: 'noreferrer',
            'data-gp-api-link': '1',
          }, '打开 Garmin Personal API 页面', h('span', { 'aria-hidden': true }, '↗')),
          h('a', {
            className: 'gp-btn gp-onb-link sub',
            href: GARMIN_LOGIN_URL,
            target: '_blank',
            rel: 'noreferrer',
            'data-gp-login-link': '1',
          }, '还没登录 Garmin？')),
        h('button', {
          type: 'button',
          className: 'gp-onb-help-toggle',
          'aria-expanded': open,
          'aria-controls': helpId,
          'data-gp-help-toggle': '1',
          onClick: onToggle,
        },
          '不知道怎么找？看步骤',
          h('span', { className: `caret${open ? ' up' : ''}`, 'aria-hidden': true }, '▾')),
        open
          ? h('div', { className: 'gp-onb-help', id: helpId, 'data-gp-help-panel': '1' },
              h('ol', null,
                steps.map(([content], i) => h('li', { key: i },
                  h('span', { className: 'n', 'aria-hidden': true }, String(i + 1)),
                  h('span', null, content)))),
              h('div', { className: 'note' }, 'Key 只读、不能改数据；过期后重新生成即可。'))
          : null)
    }

    /** 第 2 步：粘贴并验证（真正的 form submit，错误/成功都有 aria-live） */
    function OnboardStep2({ value, onChange, onSubmit, busy, saved, error, inputRef }) {
      return h('section', { className: 'gp-onb-step gp-onb-step2', 'data-gp-onb-step': '2' },
        h('div', { className: 'gp-onb-step-hd' },
          h('span', { className: 'gp-onb-n', 'aria-hidden': true }, '2'),
          h('h2', { className: 'gp-onb-step-title' }, '粘贴并验证'),
          saved ? h('span', { className: 'gp-onb-tag on' }, '已验证') : null),
        h('p', { className: 'gp-onb-copy' }, '把刚才复制的 Key 粘贴到这里，验证通过后就会开始同步。'),
        h('form', {
          className: 'gp-onb-keyrow',
          onSubmit,
          'data-gp-key-form': '1',
          noValidate: true,
        },
          h('input', {
            ref: inputRef,
            className: 'gp-input',
            type: 'password',
            value,
            placeholder: '粘贴 Key',
            autoComplete: 'off',
            spellCheck: false,
            'aria-label': 'Garmin Personal API Key',
            'data-gp-key-input': '1',
            disabled: saved,
            onChange,
          }),
          h('button', {
            className: 'gp-btn primary',
            type: 'submit',
            disabled: busy || saved || !String(value).trim(),
            'data-gp-key-submit': '1',
          }, saved ? '已验证' : busy ? '验证中…' : '验证并保存')),
        error
          ? h('div', {
              className: 'gp-onb-alert',
              role: 'alert',
              'aria-live': 'assertive',
              'data-gp-key-error': '1',
            },
              h('span', null, error),
              h('a', { href: API_TOKEN_URL, target: '_blank', rel: 'noreferrer' }, '重新生成 Key ↗'))
          : null,
        saved
          ? h('div', {
              className: 'gp-onb-ok',
              role: 'status',
              'aria-live': 'polite',
              'data-gp-key-success': '1',
            },
              h('span', { className: 'gp-spin', 'aria-hidden': true }),
              h('span', null, '✓ 已验证，正在加载你的数据…'))
          : null,
        h('div', { className: 'gp-onb-privacy' }, '只存本机（600 权限）、只读、不上传、不进仓库'))
    }

    /** 第 3 步：可选，复用账号登录流程（安装日志 / 登录表单都由 UnlockCard 提供） */
    function OnboardStep3({ flow, open, onStart, onSkip, showSkip }) {
      return h('section', {
        className: 'gp-onb-step gp-onb-step3',
        'data-gp-onb-step': '3',
        'data-gp-advanced': open ? '1' : '0',
      },
        h('div', { className: 'gp-onb-step-hd' },
          h('span', { className: 'gp-onb-n', 'aria-hidden': true }, '3'),
          h('h2', { className: 'gp-onb-step-title' }, '可选：解锁进阶数据'),
          h('span', { className: 'gp-onb-tag' }, open ? '进行中' : '可选')),
        h('p', { className: 'gp-onb-copy' },
          '想要训练负荷、训练准备度、VO₂max 趋势、比赛预测？这些 Garmin 官方 API 不提供，需要 Garmin 账号密码登录一次。'),
        h(UnlockCard, {
          flow,
          id: 'onboarding',
          bare: true,
          showHead: false,
          reason: null,
          onStart,
        }),
        h(AdvancedKeysPanel, { variant: 'onboarding', collapsible: true }),
        showSkip
          ? h('div', { className: 'gp-onb-step3-foot' },
              h('button', {
                type: 'button',
                className: 'gp-onb-skip',
                'data-gp-onboard-skip': '1',
                onClick: onSkip,
              }, '先跳过'),
              h('span', { className: 'gp-onb-copy' },
                '以后在首页的解锁卡片里也能随时开启。'))
          : null)
    }

    /**
     * 新手引导本体。preview=true 时是浮层（从仪表盘「重看新手引导」打开），
     * 只读本地状态，不会重置已保存的 Key 或连接模式。
     */
    function Onboarding({
      flow, preview = false, alreadyConnected = false, onSaved, onDismiss, onClose,
    }) {
      const [stage, setStage] = React.useState('intro') // intro | advanced | done
      const [key, setKey] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [saved, setSaved] = React.useState(false)
      const [help, setHelp] = React.useState(false)
      const inputRef = React.useRef(null)
      const timer = React.useRef(null)
      const alive = React.useRef(true)

      React.useEffect(() => () => {
        alive.current = false
        if (timer.current) clearTimeout(timer.current)
      }, [])

      /* 浮层：Esc 关闭（不写任何持久状态） */
      React.useEffect(() => {
        if (!preview) return undefined
        const onKeyDown = (e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            onClose?.()
          }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [preview, onClose])

      const submit = async (e) => {
        e.preventDefault()
        const value = key.trim()
        if (!value || busy || saved) return
        setBusy(true)
        setError(null)
        try {
          const data = await postJson('setup/key', { key: value })
          if (!alive.current) return
          if (data && data.ok) {
            setSaved(true)
            setStage('done')
            setBusy(false)
            markOnboarded()
            // 先让成功提示停留一下，再刷新页面数据（不整页 reload）
            timer.current = setTimeout(() => { if (alive.current) onSaved?.() }, 900)
            return
          }
          setBusy(false)
          setError(String(data?.error || 'Key 验证失败，请检查后重试'))
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => inputRef.current?.focus?.())
          }
        } catch (err) {
          if (!alive.current) return
          setBusy(false)
          setError(`保存失败：${String(err?.message ?? err)}`)
        }
      }

      const dismiss = () => {
        markOnboarded()
        // 刚保存成功就点「已了解」时，别丢掉那次 version bump：先刷新再收尾
        if (saved) onSaved?.()
        if (preview) onClose?.()
        else onDismiss?.()
      }

      const startAdvanced = () => setStage('advanced')

      const card = h('div', {
        className: 'gp-onb-card',
        'data-gp-onb-card': preview ? 'preview' : 'page',
        role: preview ? 'dialog' : undefined,
        'aria-modal': preview ? 'true' : undefined,
        'aria-label': preview ? '新手引导' : undefined,
      },
        h('header', { className: 'gp-onb-hd' },
          h('div', { className: 'gp-onb-mark', 'aria-hidden': true }, '⌚'),
          h('div', { className: 'gp-onb-hd-main' },
            h('h1', { className: 'gp-onb-title' }, '连接你的 Garmin'),
            h('p', { className: 'gp-onb-sub' }, '三步开始，只读、免费、数据只存本机')),
          preview
            ? h('button', {
                type: 'button',
                className: 'gp-onb-close',
                'aria-label': '关闭新手引导',
                'data-gp-onb-close': '1',
                onClick: () => onClose?.(),
              }, '关闭')
            : null),
        h('div', { className: 'gp-onb-grid' },
          h(OnboardStep1, { open: help, onToggle: () => setHelp((v) => !v) }),
          h(OnboardStep2, {
            value: key,
            onChange: (e) => {
              setKey(e.target.value)
              if (error) setError(null)
            },
            onSubmit: submit,
            busy,
            saved,
            error,
            inputRef,
          }),
          h(OnboardStep3, {
            flow,
            open: stage === 'advanced',
            onStart: startAdvanced,
            onSkip: dismiss,
            showSkip: !preview,
          })),
        h('div', { className: 'gp-onb-foot' },
          h('span', null, preview
            ? '只是重看一遍：已有的 Key 和登录状态不会改变。'
            : '之后可以在首页底部重新打开这份引导。'),
          h('span', { className: 'sp', 'aria-hidden': true }),
          saved || alreadyConnected
            ? h('button', {
                type: 'button',
                className: 'gp-btn primary',
                'data-gp-onb-done': '1',
                onClick: dismiss,
              }, '已了解，开始使用')
            : null))

      return preview
        ? h('div', { className: 'gp-onb-overlay', 'data-gp-onb-overlay': '1' }, card)
        : h('div', { className: 'gp-onb-page', 'data-gp-onb-page': '1' }, card)
    }

    /* ---------------------------------------------------------------- *
     * 账号设置弹窗（数据源 / Key / 账号登录 / 组件 / 操作）
     * ---------------------------------------------------------------- */
    const ACCOUNT_REASON_ZH = {
      key_invalid: 'Personal API Key 无效或已过期',
      key_expired: 'Personal API Key 已过期',
      key_missing: '尚未配置 Personal API Key',
      sso_missing: '尚未登录 Garmin 账号',
      sso_expired: 'Garmin 账号令牌已过期',
      token_expiring: '账号令牌临近过期',
      mcp_missing: '高级模式组件未安装',
      unauth: 'Garmin 授权可能已过期',
    }
    const REASON_ALIASES = {
      keyInvalid: 'key_invalid', keyExpired: 'key_expired', keyMissing: 'key_missing',
      ssoMissing: 'sso_missing', ssoExpired: 'sso_expired', tokenExpiring: 'token_expiring',
      mcpMissing: 'mcp_missing', unauthenticated: 'unauth',
    }

    function reasonText(reason) {
      const raw = String(reason ?? '').trim()
      if (!raw) return ''
      const key = REASON_ALIASES[raw] || raw.toLowerCase().replace(/[-\s]/g, '_')
      return ACCOUNT_REASON_ZH[key] || raw
    }

    /** 到期描述：支持剩余天数、时间戳、ISO 日期；缺省按 180 天令牌寿命推算 */
    function expiryText(expire, ageDays) {
      if (typeof expire === 'number' && isFinite(expire)) {
        if (expire > 1e9) {
          const ms = expire < 1e12 ? expire * 1000 : expire
          const day = dayPart(new Date(ms).toISOString())
          return day ? `预计 ${day} 过期` : null
        }
        return `预计 ${Math.max(0, Math.round(expire))} 天后过期`
      }
      const day = dayPart(expire)
      if (day) {
        const ms = Date.parse(`${day}T12:00:00`)
        if (isFinite(ms)) {
          return `预计 ${Math.max(0, Math.ceil((ms - Date.now()) / 86400000))} 天后过期`
        }
      }
      if (typeof ageDays === 'number' && isFinite(ageDays)) {
        return `预计 ${Math.max(0, 180 - Math.round(ageDays))} 天后过期`
      }
      return null
    }

    function AccountModal({ account, setup, advanced, flow, onClose, onReload, refresh, showToast, gender = null, onGenderSave = null, onRoadbookChanged = null }) {
      const [keyOpen, setKeyOpen] = React.useState(false)
      const [key, setKey] = React.useState('')
      const [keyBusy, setKeyBusy] = React.useState(false)
      const [keyError, setKeyError] = React.useState(null)
      const [revalBusy, setRevalBusy] = React.useState(false)
      const [revalError, setRevalError] = React.useState(null)
      const [loginOpen, setLoginOpen] = React.useState(false)
      const [loginDone, setLoginDone] = React.useState(false)
      const [genderDraft, setGenderDraft] = React.useState(gender === 'female' || gender === 'male' ? gender : 'none')
      const [genderNote, setGenderNote] = React.useState(null)
      const alive = React.useRef(true)
      const keyInput = React.useRef(null)

      React.useEffect(() => () => { alive.current = false }, [])

      React.useEffect(() => {
        const onKeyDown = (e) => {
          if (e.key === 'Escape') { e.preventDefault(); onClose?.() }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [onClose])

      React.useEffect(() => {
        if (!keyOpen) return undefined
        const timer = setTimeout(() => keyInput.current?.focus?.(), 40)
        return () => clearTimeout(timer)
      }, [keyOpen])

      const hasKey = typeof account?.hasKey === 'boolean' ? account.hasKey
        : typeof setup?.hasKey === 'boolean' ? setup.hasKey : null
      const keyValid = typeof account?.keyValid === 'boolean' ? account.keyValid
        : typeof setup?.keyValid === 'boolean' ? setup.keyValid : null
      const ssoAuthed = typeof account?.ssoAuthed === 'boolean' ? account.ssoAuthed
        : typeof setup?.ssoAuthed === 'boolean' ? setup.ssoAuthed : null
      const mcpInstalled = typeof account?.mcpInstalled === 'boolean' ? account.mcpInstalled
        : typeof setup?.mcpInstalled === 'boolean' ? setup.mcpInstalled : null
      const isAdvanced = typeof account?.advanced === 'boolean' ? account.advanced : advanced === true
      const reasons = Array.isArray(account?.reasons) ? account.reasons.map(reasonText).filter(Boolean) : []
      const keyUpdated = firstOf(account?.keyUpdatedAt, account?.keyUpdated, account?.keySetAt)
      const tokenUpdated = firstOf(account?.tokenUpdatedAt, account?.tokenUpdated)
      const tokenAge = numOf(account?.tokenAgeDays)
      const expire = account?.tokenExpiresEstimate

      const keyText = keyValid === true ? '有效'
        : keyValid === false ? '无效'
          : hasKey === true ? '未验证' : '未配置'
      const keyDot = keyValid === true ? '' : keyValid === false ? ' bad' : hasKey ? ' warn' : ' warn'

      let ssoText = '未登录'
      if (ssoAuthed === true) ssoText = '有效'
      else if (reasons.some((r) => r.includes('过期'))) ssoText = '过期'
      const ssoDot = ssoAuthed === true ? '' : ssoAuthed === false && !isAdvanced ? ' warn' : ' bad'

      const expireLabel = expiryText(expire, tokenAge)
      const tokenWarn = isAdvanced && tokenAge !== null && tokenAge > 150
      const expireDays = (() => {
        if (typeof expire === 'number' && expire > 0 && expire <= 400) return Math.round(expire)
        if (typeof expire === 'string') {
          const day = dayPart(expire)
          if (day) {
            const ms = Date.parse(`${day}T12:00:00`)
            if (isFinite(ms)) return Math.round((ms - Date.now()) / 86400000)
          }
        }
        if (tokenAge !== null) return 180 - Math.round(tokenAge)
        return null
      })()
      const expireSoon = isAdvanced && expireDays !== null && expireDays <= 30

      const submitKey = async (e) => {
        e.preventDefault()
        const value = key.trim()
        if (!value || keyBusy) return
        setKeyBusy(true)
        setKeyError(null)
        try {
          const data = await postJson('setup/key', { key: value })
          if (!alive.current) return
          setKeyBusy(false)
          if (data && data.ok) {
            setKey('')
            setKeyOpen(false)
            showToast?.('Key 已验证并保存', 'ok')
            onReload?.()
            return
          }
          setKeyError(String(data?.error || 'Key 验证失败，请检查后重试'))
        } catch (err) {
          if (!alive.current) return
          setKeyBusy(false)
          setKeyError(`保存失败：${String(err?.message ?? err)}`)
        }
      }

      const revalidate = async () => {
        if (revalBusy) return
        setRevalBusy(true)
        setRevalError(null)
        try {
          const data = await postJson('account/revalidate-key')
          if (!alive.current) return
          setRevalBusy(false)
          if (data && data.ok) {
            showToast?.('Key 验证通过', 'ok')
            onReload?.()
            return
          }
          setRevalError(String(data?.error || 'Key 仍然无效，请重新粘贴'))
        } catch (err) {
          if (!alive.current) return
          setRevalBusy(false)
          setRevalError(`验证失败：${String(err?.message ?? err)}`)
        }
      }

      /* 组件状态：直接复用解锁流程（安装 / 轮询 / 失败），但只保留紧凑日志 */
      const installActive = !!(flow && flow.owner === 'account' && flow.phase !== 'idle')
      let installBlock
      if (!installActive) {
        installBlock = h('div', { className: 'gp-acct-actions' },
          h('button', {
            className: 'gp-btn',
            type: 'button',
            'data-gp-acct-install': '1',
            disabled: !flow,
            onClick: () => flow?.start('account'),
          }, mcpInstalled ? '重新准备' : '准备组件'))
      } else if (flow.phase === 'installing') {
        const tail = flow.lines.slice(-4)
        installBlock = h(React.Fragment, null,
          h('div', { className: 'gp-hintline', role: 'status', 'aria-live': 'polite' },
            h('span', { className: 'gp-spin', 'aria-hidden': true }),
            h('span', null, '正在准备组件…')),
          h('div', { className: 'gp-log gp-acct-log', role: 'log', 'aria-label': '组件准备日志' },
            tail.length
              ? tail.map((line, i) => h('div', { key: i, className: 'gp-log-line' }, String(line)))
              : h('div', { className: 'gp-log-line' }, '等待日志…')),
          h('div', { className: 'gp-acct-actions' },
            h('button', { className: 'gp-btn', type: 'button', onClick: () => flow.reset() }, '取消')))
      } else if (flow.phase === 'failed') {
        installBlock = h(React.Fragment, null,
          h('div', { className: 'gp-acct-err' }, flow.error || '组件准备失败，请重试'),
          h('div', { className: 'gp-acct-actions' },
            h('button', { className: 'gp-btn primary', type: 'button', onClick: () => flow.start('account') }, '重试'),
            h('button', { className: 'gp-btn', type: 'button', onClick: () => flow.reset() }, '取消')))
      } else if (flow.phase === 'login') {
        installBlock = h(React.Fragment, null,
          h('div', { className: 'gp-acct-sub' }, '组件已就绪，请用下方「重新登录 Garmin 账号」完成登录。'),
          h('div', { className: 'gp-acct-actions' },
            h('button', { className: 'gp-btn', type: 'button', onClick: () => flow.reset() }, '取消')))
      } else {
        installBlock = h('div', { className: 'gp-hintline' },
          h('span', { className: 'gp-dot' }),
          h('span', null, '组件已就绪'))
      }

      const row = (id, label, ...children) => h('div', {
        className: 'gp-acct-row',
        'data-gp-acct-row': id,
      },
        h('div', { className: 'gp-acct-lab' }, label),
        h('div', { className: 'gp-acct-val' }, ...children))

      return h(React.Fragment, null,
        h('div', { className: 'gp-acct-backdrop', onClick: onClose, 'aria-hidden': true }),
        h('div', {
          className: 'gp-acct',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': '账号设置',
          'data-gp-account-modal': '1',
        },
          h('div', { className: 'gp-acct-hd' },
            h('b', null, '账号设置'),
            h('div', { className: 'sp' },
              h('button', {
                className: 'gp-icon-btn',
                type: 'button',
                title: '关闭',
                'aria-label': '关闭账号设置',
                'data-gp-account-close': '1',
                onClick: onClose,
              }, '✕'))),

          h('div', { className: 'gp-acct-body' },
            row('source', '数据来源',
              h('div', { className: 'gp-acct-main' },
                h('span', { className: `gp-dot${hasKey === true || ssoAuthed === true ? '' : ' warn'}` }),
                h('b', null, 'Garmin 官方 Personal API'),
                isAdvanced ? h('span', { className: 'gp-pill' }, '账号登录') : null),
              h('div', { className: 'gp-acct-sub' },
                isAdvanced ? '官方只读数据 + 账号登录的进阶数据' : '官方只读数据（免费）'),
              reasons.length
                ? h('div', { className: 'gp-acct-sub' }, `检查项：${reasons.join(' · ')}`)
                : null),

            row('gender', '性别',
              h('div', { className: 'gp-acct-main' },
                h('span', { className: `gp-dot${genderDraft === 'none' ? ' warn' : ''}` }),
                h('b', null, genderDraft === 'female' ? '女' : genderDraft === 'male' ? '男' : '未设置')),
              h('div', { className: 'gp-acct-sub' },
                '女性健康区块只在性别为「女」时出现；未设置则不显示，也不会请求女性健康数据。'),
              h('div', {
                className: 'gp-acct-actions',
                'data-gp-acct-gender-options': '1',
                role: 'group',
                'aria-label': '性别',
              }, [['none', '未设置'], ['female', '女'], ['male', '男']].map(([value, label]) => h('button', {
                key: value,
                type: 'button',
                className: `gp-btn${genderDraft === value ? ' primary' : ''}`,
                'data-gp-acct-gender': value,
                'aria-pressed': genderDraft === value,
                onClick: () => { setGenderDraft(value); setGenderNote(null) },
              }, label))),
              h('div', { className: 'gp-acct-actions' },
                h('button', {
                  className: 'gp-btn primary',
                  type: 'button',
                  'data-gp-acct-gender-save': '1',
                  onClick: () => {
                    onGenderSave?.(genderDraft)
                    setGenderNote(genderDraft === 'none'
                      ? '已设为未设置，正在刷新…'
                      : '性别已保存，正在刷新…')
                  },
                }, '保存性别')),
              genderNote ? h('div', { className: 'gp-acct-note' }, genderNote) : null),

            row('key', 'Personal API Key',
              h('div', { className: 'gp-acct-main' },
                h('span', { className: `gp-dot${keyDot}` }),
                h('b', null, keyText),
                keyUpdated
                  ? h('span', { className: 'gp-acct-sub' }, `更新于 ${stampText(keyUpdated)}`)
                  : null),
              h('div', { className: 'gp-acct-sub' },
                hasKey === false
                  ? '尚未保存 Key，粘贴后即可读取官方数据。'
                  : '只读、只存本机；失效后重新生成并粘贴即可。'),
              revalError ? h('div', { className: 'gp-acct-err', role: 'alert' }, revalError) : null,
              keyError
                ? h('div', { className: 'gp-acct-err', role: 'alert' },
                    keyError,
                    h('div', { style: { marginTop: 4 } },
                      h('a', {
                        href: API_TOKEN_URL,
                        target: '_blank',
                        rel: 'noreferrer',
                        style: { color: 'inherit', textDecoration: 'underline' },
                      }, '重新生成 Key ↗')))
                : null,
              keyOpen
                ? h('form', { className: 'gp-acct-keyform', onSubmit: submitKey, noValidate: true },
                    h('input', {
                      ref: keyInput,
                      className: 'gp-input',
                      type: 'password',
                      value: key,
                      placeholder: '粘贴新的 Personal API Key',
                      autoComplete: 'off',
                      spellCheck: false,
                      'aria-label': 'Garmin Personal API Key',
                      'data-gp-acct-key-input': '1',
                      disabled: keyBusy,
                      onChange: (e) => {
                        setKey(e.target.value)
                        if (keyError) setKeyError(null)
                      },
                    }),
                    h('button', {
                      className: 'gp-btn primary',
                      type: 'submit',
                      disabled: keyBusy || !key.trim(),
                      'data-gp-acct-key-submit': '1',
                    }, keyBusy ? '验证中…' : '验证并保存'),
                    h('button', {
                      className: 'gp-btn',
                      type: 'button',
                      onClick: () => { setKeyOpen(false); setKey(''); setKeyError(null) },
                    }, '取消'))
                : null,
              h('div', { className: 'gp-acct-actions' },
                h('button', {
                  className: 'gp-btn',
                  type: 'button',
                  'data-gp-acct-key-open': '1',
                  onClick: () => { setKeyOpen((v) => !v); setKeyError(null) },
                }, keyOpen ? '收起 Key 表单' : '重新粘贴 Key'),
                h('button', {
                  className: 'gp-btn',
                  type: 'button',
                  disabled: revalBusy || hasKey === false,
                  'data-gp-acct-revalidate': '1',
                  onClick: revalidate,
                }, revalBusy ? '验证中…' : '重新验证'))),

            row('sso', '账号登录（进阶）',
              h('div', { className: 'gp-acct-main' },
                h('span', { className: `gp-dot${ssoDot}` }),
                h('b', null, ssoText),
                isAdvanced ? null : h('span', { className: 'gp-pill' }, '未启用')),
              h('div', { className: 'gp-acct-sub' },
                tokenUpdated
                  ? `令牌更新于 ${stampText(tokenUpdated)}${expireLabel ? ` · ${expireLabel}` : ''}`
                  : isAdvanced
                    ? '尚未登录 Garmin 账号，进阶数据暂不可用。'
                    : '进阶数据（训练负荷 / 阈值 / 耐受度）需要账号登录。'),
              tokenWarn || expireSoon
                ? h('div', { className: 'gp-acct-warn', 'data-gp-acct-token-warn': '1' },
                    tokenWarn
                      ? `令牌已 ${Math.round(tokenAge)} 天未更新，约 180 天后过期，建议重新登录 Garmin 账号。`
                      : `令牌将在 ${Math.max(0, Math.round(expireDays))} 天后过期，建议重新登录 Garmin 账号。`)
                : null,
              loginDone ? h('div', { className: 'gp-acct-note' }, '登录成功，正在刷新数据…') : null,
              loginOpen
                ? h('div', { 'data-gp-acct-login-form': '1' },
                    h(Credentials, {
                      compact: true,
                      onSuccess: () => {
                        setLoginDone(true)
                        flow?.succeed?.()
                        onReload?.()
                      },
                    }))
                : null),

            row('mcp', '组件状态',
              h('div', { className: 'gp-acct-main' },
                h('span', { className: `gp-dot${mcpInstalled === true ? '' : mcpInstalled === false ? ' bad' : ' warn'}` }),
                h('b', null, mcpInstalled === true ? '已安装' : mcpInstalled === false ? '未安装' : '未知')),
              h('div', { className: 'gp-acct-sub' },
                '进阶数据依赖本机的 garmin-mcp 组件，准备过程全程在面板内完成。'),
              installBlock),

            h('div', {
              className: 'gp-acct-sec',
              'data-gp-acct-sec': 'advanced-keys',
            },
              h('div', { className: 'gp-acct-sec-hd' },
                h('b', null, '高级功能 Key（可选）'),
                h('span', { className: 'gp-acct-sub' },
                  '路线规划 / 行者导入；不配置不影响基础数据')),
              h(AdvancedKeysPanel, {
                variant: 'account',
                onChanged: onRoadbookChanged,
                showToast,
              })),

            row('actions', '操作',
              h('div', { className: 'gp-acct-actions' },
                h('button', {
                  className: 'gp-btn',
                  type: 'button',
                  'data-gp-acct-login': '1',
                  onClick: () => { setLoginOpen((v) => !v); setLoginDone(false) },
                }, loginOpen ? '收起登录表单' : '重新登录 Garmin 账号'),
                h('button', {
                  className: 'gp-btn',
                  type: 'button',
                  'data-gp-acct-refresh': '1',
                  onClick: () => { refresh?.(); showToast?.('正在刷新数据…', 'ok') },
                }, '刷新数据'),
                h('button', {
                  className: 'gp-btn',
                  type: 'button',
                  'data-gp-acct-close': '1',
                  onClick: onClose,
                }, '关闭')))),
          h('div', { className: 'gp-acct-ft' },
            '凭据只存本机（~/.garminconnect，600 权限），不上传、不进仓库。')))
    }

    /* ---------------------------------------------------------------- *
     * 设备查看器（顶栏弹层）
     * ---------------------------------------------------------------- */
    function useDeviceDetail(id, version) {
      const [state, setState] = React.useState({ id: null, loading: false })
      React.useEffect(() => {
        if (!id) return undefined
        let cancelled = false
        setState({ id, loading: true })
        fetch(`${API}/devices/${encodeURIComponent(id)}`, { headers: { Accept: 'application/json' } })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
          })
          .then((data) => { if (!cancelled) setState({ id, loading: false, data }) })
          .catch((error) => { if (!cancelled) setState({ id, loading: false, error: String(error) }) })
        return () => { cancelled = true }
      }, [id, version])
      return state
    }

    function DeviceDetail({ device, state }) {
      if (!state || state.loading) return h('div', { className: 'gp-dev-note' }, '加载中…')
      if (state.error) return h('div', { className: 'gp-dev-note' }, '设备数据暂不可用')
      const data = state.data
      if (!data || typeof data !== 'object') return h('div', { className: 'gp-dev-note' }, '无详情数据')
      const s = data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings) ? data.settings : {}
      const rows = []
      const model = firstOf(s.model, s.part_number, s.partNumber, data.model, device?.model)
      if (model) rows.push(['型号', String(model)])
      const serial = firstOf(s.serial_number, s.serialNumber, data.serial, device?.serial)
      if (serial) rows.push(['序列号', String(serial)])
      const firmware = firstOf(s.software_version, s.softwareVersion, s.firmware_version, s.firmwareVersion,
        s.firmware?.version, s.version)
      if (firmware) rows.push(['固件', String(firmware)])
      const solar = solarText(data.solar)
      if (solar) rows.push(['太阳能', solar])
      const alarms = alarmCount(data.alarms)
      if (alarms !== null) rows.push(['闹钟', `${alarms} 个`])
      if (!rows.length) return h('div', { className: 'gp-dev-note' }, '无详情数据')
      return h('div', { className: 'gp-dev-detail' },
        rows.map(([k, v]) => h('div', { key: k, className: 'gp-dev-kv' },
          h('span', null, k), h('b', null, v))))
    }

    function DevicePopover({ list, loading, error, latest, version, onRefresh, onClose, anchorRef }) {
      const [openId, setOpenId] = React.useState(null)
      const boxRef = React.useRef(null)
      const raw = useDeviceDetail(openId, version)
      const detail = raw.id === openId ? raw : { id: openId, loading: true }

      React.useEffect(() => {
        const onPointerDown = (e) => {
          if (boxRef.current && boxRef.current.contains(e.target)) return
          if (anchorRef?.current && anchorRef.current.contains(e.target)) return
          onClose()
        }
        const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKeyDown)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('keydown', onKeyDown)
        }
      }, [onClose, anchorRef])

      const latestName = latest?.name || null
      let body
      if (error || (!loading && !list)) {
        body = h('div', { className: 'gp-dev-note', style: { padding: '10px 4px' } }, '设备数据暂不可用')
      } else if (!list) {
        body = h('div', { className: 'gp-dev-note', style: { padding: '10px 4px' } }, '加载中…')
      } else if (!list.length) {
        body = h('div', { className: 'gp-dev-note', style: { padding: '10px 4px' } }, '没有登记设备')
      } else {
        body = h('div', { className: 'gp-dev-body' }, list.map((d, i) => {
          const id = String(firstOf(d.id, d.device_id, i))
          const isOpen = openId === id
          const fromLatest = latest && String(latest.id) === id ? latest.at : null
          const when = syncText(firstOf(d.lastSync, d.last_sync, fromLatest)) || '同步时间未知'
          return h('div', { key: id, className: `gp-dev-row${isOpen ? ' open' : ''}` },
            h('div', { className: 'gp-dev-head' },
              h('div', { className: 'gp-dev-main' },
                h('div', { className: 'gp-dev-name' }, firstOf(d.name, d.deviceName, `设备 ${id}`)),
                h('div', { className: 'gp-dev-tags' },
                  h('span', { className: 'gp-tag' }, deviceChip(d)),
                  d.isPrimary ? h('span', { className: 'gp-pill g' }, '主设备') : null)),
              h('div', { className: 'gp-dev-meta' },
                h('span', { className: 't' }, when),
                h('button', {
                  className: 'gp-dev-toggle',
                  onClick: () => setOpenId(isOpen ? null : id),
                  'aria-expanded': isOpen,
                }, '详情', h('span', { className: `caret${isOpen ? ' up' : ''}` }, '▾')))),
            isOpen ? h(DeviceDetail, { device: d, state: detail }) : null)
        }))
      }

      return h('div', { className: 'gp-dev-pop', ref: boxRef, role: 'dialog', 'aria-label': '我的 Garmin 设备' },
        h('div', { className: 'gp-dev-hd' },
          h('b', null, '我的 Garmin 设备'),
          list ? h('span', { className: 'cnt' }, `${list.length} 台`) : null,
          h('div', { className: 'sp' },
            h('button', {
              className: 'gp-icon-btn', onClick: onRefresh, title: '刷新设备', 'aria-label': '刷新设备',
            }, '↻'))),
        body,
        latestName
          ? h('div', { className: 'gp-dev-foot' },
              h('span', null, '最近同步'),
              h('span', { style: { marginLeft: 'auto', color: 'var(--gp-t2)' } }, latestName))
          : null)
    }

    /** 力量训练组次：兼容 reps / repetitionCount、weight / weight_kg 等写法 */
    function normalizeExerciseSets(raw) {
      const rows = Array.isArray(raw) ? raw : []
      return rows.map((row, i) => {
        if (!row || typeof row !== 'object') return null
        const name = firstOf(row.exercise, row.exerciseName, row.name, row.category,
          row.exercise_name, row.activity)
        const reps = numOf(row.reps, row.repetitionCount, row.repetitions, row.rep_count)
        const weight = numOf(row.weight_kg, row.weightKg, row.weight, row.weight_lb)
        const seconds = numOf(row.duration_seconds, row.durationSec, row.duration, row.seconds)
        if (!name && reps === null && seconds === null && weight === null) return null
        return {
          key: `${i}-${String(firstOf(row.set, i + 1))}`,
          set: numOf(row.set, row.set_index, row.setNumber, row.index, i + 1),
          name: name ? String(name) : '—',
          reps,
          weight,
          seconds,
        }
      }).filter(Boolean)
    }

    function ActivityDrawer({ id, onClose, showToast, flow, gated, version = 0 }) {
      const detail = useJson(`activities/${encodeURIComponent(id)}`, true, version)
      const track = useJson(`activities/${encodeURIComponent(id)}/track`, true, version)
      const trackPoints = React.useMemo(
        () => (Array.isArray(track.data?.points) ? track.data.points : []),
        [track.data],
      )
      // 活动轨迹来自 /activities/:id/track（WGS-84），底图请求用 coord=wgs84
      const [mapRef, mapWidth] = useElementWidth()
      const mapScale = mapWidth > 0 ? Math.min(2, 1600 / mapWidth) : 2
      const basemap = useStaticMap(trackPoints, {
        coord: 'wgs84',
        kind: 'activity',
        width: mapWidth > 0 ? Math.max(160, Math.round(mapWidth * mapScale)) : 720,
        height: mapWidth > 0 ? Math.max(120, Math.round(220 * mapScale)) : 360,
        enabled: mapWidth > 0,
      })
      const [zoomUrl, setZoomUrl] = React.useState(null)
      const [copied, setCopied] = React.useState(false)
      const copyTimer = React.useRef(null)

      React.useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current) }, [])

      // Escape 先关地图浮层，再关抽屉；监听器随抽屉卸载移除
      React.useEffect(() => {
        const onKeyDown = (e) => {
          if (e.key !== 'Escape') return
          if (zoomUrl) setZoomUrl(null)
          else onClose()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [onClose, zoomUrl])

      const link = `https://connect.garmin.com/modern/activity/${id}`
      const copyLink = React.useCallback(async () => {
        const ok = await copyText(link)
        if (ok) {
          setCopied(true)
          if (copyTimer.current) clearTimeout(copyTimer.current)
          copyTimer.current = setTimeout(() => setCopied(false), 1800)
        }
        showToast?.(ok ? '活动链接已复制到剪贴板' : '复制失败：请手动复制链接', ok ? 'ok' : 'err')
      }, [link, showToast])

      const data = detail.data && typeof detail.data === 'object' ? detail.data : null
      const summary = data?.summary && typeof data.summary === 'object' ? data.summary : null
      const s = summary ?? {}
      const detailError = detail.error || (data?.status === 'error' ? data.message || '加载失败' : null)
      const loading = detail.loading
      // 官方 API 模式下详情/轨迹会明确返回 advanced_required
      const detailAdvanced = data?.status === 'advanced_required'
      const trackAdvanced = track.data?.status === 'advanced_required'

      const sport = String(firstOf(s.type, s.activity_type, '') ?? '')
      const isBike = /bik|cycl|bike|骑行/i.test(sport)
      const isFoot = /run|walk|hik|trail|treadmill|hike|跑|走|徒步/i.test(sport)
      const speed = numOf(s.avg_speed_mps)
      const aerobic = numOf(data?.effect?.aerobic_effect, s.training_effect)
      const anaerobic = numOf(data?.effect?.anaerobic_effect, s.anaerobic_training_effect)
      const distanceM = numOf(s.distance_meters)
      const distanceKm = distanceM !== null ? distanceM / 1000 : null
      const when = whenText(firstOf(s.start_time_local, s.start_time_gmt))

      /* A 类详情字段：全部可能缺席，缺了就不占位 */
      const trainingLoad = numOf(firstOf(s.training_load, s.trainingLoad,
        data?.training_load, data?.trainingLoad))
      const maxSpeed = numOf(firstOf(s.max_speed_mps, s.maxSpeedMps,
        data?.max_speed_mps, data?.maxSpeedMps))
      const elevMin = numOf(firstOf(s.elevation_min_meters, s.elevationMinMeters,
        data?.elevation_min_meters, data?.elevationMinMeters))
      const elevMax = numOf(firstOf(s.elevation_max_meters, s.elevationMaxMeters,
        data?.elevation_max_meters, data?.elevationMaxMeters))
      const aerobicLabel = firstOf(s.aerobic_label, s.aerobicLabel,
        data?.aerobic_label, data?.aerobicLabel, data?.effect?.aerobic_label)
      const anaerobicLabel = firstOf(s.anaerobic_label, s.anaerobicLabel,
        data?.anaerobic_label, data?.anaerobicLabel, data?.effect?.anaerobic_label)
      const manufacturer = firstOf(s.device_manufacturer, s.deviceManufacturer,
        s.manufacturer, data?.device_manufacturer, data?.deviceManufacturer,
        data?.device?.manufacturer)
      const sets = normalizeExerciseSets(firstOf(data?.exerciseSets, data?.exercise_sets,
        s.exerciseSets, s.exercise_sets))

      const kpis = [
        { k: '距离', v: fmt(distanceKm, 2), u: distanceKm !== null ? 'km' : '' },
        { k: '用时', v: clock(s.duration_seconds) },
        { k: '移动用时', v: clock(s.moving_duration_seconds) },
        isBike || !isFoot
          ? { k: '均速', v: speedText(speed) ?? '—' }
          : { k: '配速', v: paceText(speed) ?? '—' },
        { k: '爬升', v: fmt(s.elevation_gain_meters, 0), u: numOf(s.elevation_gain_meters) !== null ? 'm' : '' },
        { k: '卡路里', v: fmt(s.calories), u: numOf(s.calories) !== null ? 'kcal' : '' },
        { k: '平均心率', v: fmt(s.avg_hr_bpm), u: numOf(s.avg_hr_bpm) !== null ? 'bpm' : '' },
        { k: '最大心率', v: fmt(s.max_hr_bpm), u: numOf(s.max_hr_bpm) !== null ? 'bpm' : '' },
        {
          k: '训练效果',
          v: aerobic !== null || anaerobic !== null
            ? `${fmt(aerobic, 1)} / ${fmt(anaerobic, 1)}`
            : '—',
          u: aerobic !== null || anaerobic !== null ? '有氧/无氧' : '',
        },
      ]
      if (trainingLoad !== null) kpis.push({ k: '训练负荷', v: fmt(trainingLoad) })
      if (maxSpeed !== null) kpis.push({ k: '最大速度', v: speedText(maxSpeed) ?? '—' })
      if (elevMin !== null || elevMax !== null) {
        kpis.push({
          k: '海拔区间',
          v: elevMin !== null && elevMax !== null
            ? `${fmt(elevMin, 0)}–${fmt(elevMax, 0)}`
            : fmt(elevMin !== null ? elevMin : elevMax, 0),
          u: 'm',
        })
      }

      /* 文字评级 + 设备厂商：有才显示，不占位 */
      const infoChips = []
      if (aerobicLabel) infoChips.push(String(aerobicLabel))
      if (anaerobicLabel) infoChips.push(String(anaerobicLabel))
      if (manufacturer) infoChips.push(String(manufacturer))

      /* 轨迹 */
      let trackBlock
      if (track.loading) {
        trackBlock = h('div', null,
          h(Skel, { h: 220 }),
          h('div', { style: { marginTop: 8 } }, h(Skel, { h: 70 })))
      } else if (
        track.error ||
        !track.data ||
        track.data.status === 'error' ||
        track.data.status !== 'ok' ||
        !Array.isArray(track.data.points) ||
        track.data.points.length < 2
      ) {
        trackBlock = h('div', { className: 'gp-detail-empty' }, '该活动没有 GPS 轨迹（室内或无定位记录）')
      } else {
        const stats = track.data.stats ?? {}
        const elevation = Array.isArray(track.data.elevation) ? track.data.elevation : []
        const elevValues = elevation
          .map((row) => (Number.isFinite(row?.e) ? row.e : null))
          .filter((v) => v !== null)
        const minE = elevValues.length ? Math.min(...elevValues) : null
        const maxE = elevValues.length ? Math.max(...elevValues) : null
        trackBlock = h('div', { className: 'gp-detail-track' },
          h(TrackMap, {
            points: track.data.points,
            basemap,
            wrapRef: mapRef,
            onZoom: (url) => setZoomUrl(url),
          }),
          h(ElevationChart, { rows: elevation }),
          h('div', { className: 'gp-detail-cap' },
            h('span', null, basemap.url ? '轨迹地图 · 高德' : '离线轨迹 · 无底图'),
            basemap.configured && basemap.unavailable
              ? h('span', { className: 'gp-map-unavailable' }, '底图不可用')
              : null,
            stats.distanceM != null ? h('span', null, `轨迹 ${fmt(stats.distanceM / 1000, 2)} km`) : null,
            minE !== null && maxE !== null
              ? h('span', null, `海拔 ${fmt(minE, 0)}–${fmt(maxE, 0)} m`)
              : null))
      }

      const laps = Array.isArray(data?.splits?.laps) ? data.splits.laps : []
      const hrZones = Array.isArray(data?.hrZones) ? data.hrZones : []
      const powerZones = Array.isArray(data?.powerZones) ? data.powerZones : []
      const weather = data?.weather && typeof data.weather === 'object' ? data.weather : null
      const gear = Array.isArray(data?.gear) ? data.gear : []

      const chips = []
      if (weather) {
        const temp = numOf(weather.temperature)
        if (temp !== null) {
          chips.push(`${fmt(temp, 1)}${weather.temperature_unit ? `°${weather.temperature_unit}` : '°'}`)
        }
        if (weather.weather_description) chips.push(String(weather.weather_description))
        const humidity = numOf(weather.humidity_percent)
        if (humidity !== null) chips.push(`湿度 ${fmt(humidity, 0)}%`)
        const wind = numOf(weather.wind_speed)
        if (wind !== null) chips.push(`风 ${fmt(wind, 0)} ${weather.wind_speed_unit || 'km/h'}`)
      }
      for (const g of gear) {
        if (g?.name) chips.push(String(g.name))
      }

      // 官方 API 模式下这些区块要么明确 advanced_required，要么整块为空
      const hasAdvanced =
        laps.length > 0 || hrZones.length > 0 || powerZones.length > 0 || !!weather || chips.length > 0 ||
        infoChips.length > 0 || sets.length > 0 ||
        (track.data?.status === 'ok' && Array.isArray(track.data.points) && track.data.points.length >= 2)
      const lockAdvanced = detailAdvanced || trackAdvanced ||
        (!!gated && !loading && !track.loading && !hasAdvanced)

      return h(React.Fragment, null,
        h('div', { className: 'gp-detail-backdrop', onClick: onClose, 'aria-hidden': true }),
        h('div', {
          className: 'gp-detail',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': '活动详情',
          'data-gp-detail': '1',
        },
          h('div', { className: 'gp-detail-hd' },
            h('div', { style: { minWidth: 0 } },
              h('div', { className: 'gp-detail-title' },
                summary?.name || `活动 ${id}`),
              h('div', { className: 'gp-detail-sub' },
                when || (loading ? '加载中…' : ''),
                sport ? `${when ? ' · ' : ''}${SPORT_ZH[sport] || sport}` : '')),
            h('button', {
              className: 'gp-detail-close',
              onClick: onClose,
              title: '关闭',
              'aria-label': '关闭',
            }, '✕')),

          h('div', { className: 'gp-detail-body' },
            detailError
              ? h('div', { className: 'gp-err' }, `活动详情加载失败：${detailError}`)
              : null,

            loading && !data
              ? h('div', { className: 'gp-detail-kpis' },
                  Array.from({ length: 9 }, (_, i) => h('div', { key: i, className: 'gp-detail-kpi' },
                    h(Skel, { h: 34 }))))
              : h('div', { className: 'gp-detail-kpis' }, kpis.map((item) => h('div', {
                  key: item.k,
                  className: 'gp-detail-kpi',
                },
                  h('div', { className: 'k' }, item.k),
                  h('div', { className: 'v' }, item.v, item.u ? h('small', null, item.u) : null)))),

            infoChips.length
              ? h('div', {
                  className: 'gp-detail-chips gp-detail-info',
                  'data-gp-detail-info': '1',
                }, infoChips.map((chip, i) => h('span', {
                  key: `${chip}-${i}`,
                  className: 'gp-detail-chip',
                }, chip)))
              : null,

            sets.length
              ? h('div', null,
                  h('div', { className: 'gp-detail-sec' },
                    h('h4', null, '组次'),
                    h('span', { className: 'sp' }, `${sets.length} 组`)),
                  h('div', { className: 'gp-detail-sets', 'data-gp-drawer-sets': String(sets.length) },
                    h('table', { className: 'gp-table' },
                      h('thead', null, h('tr', null,
                        ['组', '动作', '次数', '重量'].map((t) => h('th', { key: t }, t)))),
                      h('tbody', null, sets.map((row) => h('tr', { key: row.key },
                        h('td', { className: 'n' }, fmt(row.set)),
                        h('td', { className: 'gp-tname' }, row.name),
                        h('td', { className: 'n' }, row.reps !== null ? `${fmt(row.reps)} 次` : '—'),
                        h('td', { className: 'n' },
                          row.weight !== null ? `${fmt(row.weight, 1)} kg` : '—')))))))
              : null,

            lockAdvanced
              ? h('div', { className: 'gp-detail-lock' },
                  h('div', { className: 'gp-detail-lock-hint' },
                    '分段、心率 / 功率区间、天气与轨迹来自 Garmin 账号登录，官方 Personal API 不提供。'),
                  h(UnlockCard, { flow, id: 'drawer', compact: true }))
              : h(React.Fragment, null,
                  h('div', { className: 'gp-detail-sec' }, h('h4', null, '轨迹')),
                  trackBlock,

                  h('div', { className: 'gp-detail-sec' }, h('h4', null, '分段'),
                    h('span', { className: 'sp' }, laps.length ? `${laps.length} 圈` : '')),
                  laps.length
                    ? h('div', { className: 'gp-detail-splits' },
                        h('table', { className: 'gp-table' },
                          h('thead', null, h('tr', null,
                            ['圈', '距离', '用时', isBike || !isFoot ? '均速' : '配速', '均心', '爬升'].map((t) =>
                              h('th', { key: t }, t)))),
                          h('tbody', null, laps.map((lap, i) => h('tr', { key: lap.lap_number ?? i },
                            h('td', { className: 'n' }, fmt(lap.lap_number ?? i + 1)),
                            h('td', { className: 'n' },
                              lap.distance_meters != null ? `${fmt(lap.distance_meters / 1000, 2)} km` : '—'),
                            h('td', { className: 'n' }, clock(lap.duration_seconds)),
                            h('td', { className: 'n' },
                              (isBike || !isFoot ? speedText(lap.avg_speed_mps) : paceText(lap.avg_speed_mps)) || '—'),
                            h('td', { className: 'n' }, fmt(lap.avg_hr_bpm)),
                            h('td', { className: 'n' },
                              lap.elevation_gain_meters != null ? `${fmt(lap.elevation_gain_meters, 0)} m` : '—'))))))
                    : h('div', { className: 'gp-detail-empty' }, '没有分段数据'),

                  hrZones.length || powerZones.length
                    ? h('div', null,
                        h('div', { className: 'gp-detail-sec' },
                          h('h4', null, '心率区间'),
                          h('span', { className: 'sp' }, 'bpm')),
                        hrZones.length
                          ? h(ZoneBars, { zones: hrZones, unit: 'bpm' })
                          : h('div', { className: 'gp-detail-empty' }, '没有心率区间数据'),
                        powerZones.length
                          ? h('div', { style: { marginTop: 14 } },
                              h('div', { className: 'gp-detail-sec' },
                                h('h4', null, '功率区间'),
                                h('span', { className: 'sp' }, 'W')),
                              h(ZoneBars, { zones: powerZones, unit: 'W' }))
                          : null)
                    : null,

                  chips.length
                    ? h('div', null,
                        h('div', { className: 'gp-detail-sec' }, h('h4', null, '天气 · 装备')),
                        h('div', { className: 'gp-detail-chips' },
                          chips.map((chip, i) => h('span', { key: `${chip}-${i}`, className: 'gp-detail-chip' }, chip))))
                    : null),

            /* FIT 曲线永远可点：官方模式下会明确返回 advanced_required */
            h(FitCurves, { id, flow }),
            h(DeepAnalysis, { id, flow })),

          h('div', { className: 'gp-detail-foot' },
            h('a', {
              className: 'gp-btn primary gp-detail-link',
              href: link,
              target: '_blank',
              rel: 'noreferrer',
            }, '在 Garmin Connect 打开'),
            h('div', { className: 'sp' },
              h('button', { className: 'gp-btn', onClick: copyLink }, copied ? '已复制' : '复制链接'),
              h('button', { className: 'gp-btn', onClick: onClose }, '关闭')))),

        zoomUrl
          ? h(React.Fragment, null,
              h('div', {
                className: 'gp-map-zoom-backdrop',
                onClick: () => setZoomUrl(null),
                'aria-hidden': true,
              }),
              h('div', {
                className: 'gp-map-zoom-modal',
                role: 'dialog',
                'aria-modal': 'true',
                'aria-label': '活动轨迹地图',
                'data-gp-map-modal': '1',
              },
                h('div', { className: 'gp-map-zoom-hd' },
                  h('div', { className: 'tt' }, '活动轨迹地图'),
                  h('button', {
                    className: 'gp-detail-close',
                    onClick: () => setZoomUrl(null),
                    title: '关闭',
                    'aria-label': '关闭',
                  }, '✕')),
                h('div', { className: 'gp-map-zoom-body' },
                  h('img', {
                    className: 'gp-map-zoom-img',
                    src: zoomUrl,
                    alt: '活动轨迹地图',
                    'data-gp-map-modal-img': '1',
                  }),
                  h('a', {
                    className: 'gp-map-attr gp-map-attr-lg',
                    href: 'https://www.amap.com/',
                    target: '_blank',
                    rel: 'noreferrer noopener',
                    title: '高德地图',
                    'data-gp-map-attribution': '1',
                  }, '高德地图'))))
          : null)
    }

    function PlanDetailPopover({
      day, workout, source, links, pos, showToast = null, onClose,
    }) {
      const ref = React.useRef(null)
      React.useEffect(() => {
        const node = ref.current
        try { node?.focus?.({ preventScroll: true }) } catch { /* ignore */ }
        const onKey = (e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            onClose?.()
          }
        }
        const onDown = (e) => {
          const box = ref.current
          if (!box) return
          const target = e.target
          if (box.contains(target)) return
          if (target && target.closest && target.closest('[data-gp-plan-day]')) return
          onClose?.()
        }
        const onScroll = () => onClose?.()
        document.addEventListener('keydown', onKey, true)
        document.addEventListener('pointerdown', onDown, true)
        window.addEventListener('scroll', onScroll, true)
        return () => {
          document.removeEventListener('keydown', onKey, true)
          document.removeEventListener('pointerdown', onDown, true)
          window.removeEventListener('scroll', onScroll, true)
        }
      }, [onClose])

      const copy = (text, message) => copyText(text).then((ok) => {
        showToast?.(ok ? message : '复制失败：请手动复制', ok ? 'ok' : 'err')
        return ok
      })
      const href = planWorkoutHref(workout, links)
      const duration = planDurationText(workout.durationMin)
      const distance = planDistanceText(workout.distanceM)

      return h('div', {
        ref,
        tabIndex: -1,
        role: 'dialog',
        'aria-label': '训练详情',
        className: 'gp-plan-pop',
        style: { left: `${pos.left}px`, top: `${pos.top}px` },
        'data-gp-plan-pop': '1',
        'data-gp-plan-pop-date': day.date,
        onContextMenu: (e) => e.preventDefault(),
      },
        h('div', { className: 'gp-plan-pop-hd' },
          h('span', { className: 'gp-plan-pop-ic' },
            h(SportIcon, { type: workout.type, size: 15 })),
          h('div', { className: 'gp-plan-pop-tt' },
            h('b', null, planWorkoutName(workout)),
            h('span', null, `${planSportText(workout)} · ${day.date} ${day.weekday}`))),
        h('div', { className: 'gp-plan-pop-kv' },
          h('span', { className: 'k' }, '时长'),
          h('span', { className: 'v' }, duration || '未标注'),
          h('span', { className: 'k' }, '距离'),
          h('span', { className: 'v' }, distance || '未标注'),
          h('span', { className: 'k' }, '完成状态'),
          h('span', { className: `v${workout.completed ? ' done' : ''}` },
            workout.completed ? '已完成' : '未完成'),
          h('span', { className: 'k' }, '来源'),
          h('span', { className: 'v' }, source)),
        h('div', { className: 'gp-plan-pop-acts' },
          h('button', {
            type: 'button',
            className: 'gp-btn primary',
            'data-gp-plan-pop-copy': '1',
            onClick: () => copy(
              planDetailText(day, workout, links, source),
              '已复制',
            ),
          }, '复制详情'),
          h('button', {
            type: 'button',
            className: 'gp-btn',
            'data-gp-plan-pop-ai': '1',
            onClick: () => copy(planAiPrompt(day, workout), '已复制，去 AI 教练提问'),
          }, '问 AI 教练'),
          h('a', {
            className: 'gp-btn link',
            href,
            target: '_blank',
            rel: 'noreferrer',
            'data-gp-plan-pop-open': workout.workoutId != null ? 'workout' : 'calendar',
            'data-gp-plan-open-workout': workout.workoutId != null
              ? String(workout.workoutId)
              : undefined,
            title: workout.workoutId != null
              ? '在 Garmin Connect 打开这节课'
              : '用 Garmin Connect 训练日历安排这节课',
          }, '在 Garmin 打开'),
          h('span', { className: 'sp' }),
          h('button', {
            type: 'button',
            className: 'gp-btn',
            'data-gp-plan-pop-close': '1',
            onClick: () => onClose?.(),
          }, '关闭')))
    }

    /* ---------------- 路书高级 Key（高德 / 行者，可选） ---------------- */
    const AMAP_KEY_URL = 'https://console.amap.com'
    const XINGZHE_KEY_URL = 'https://www.imxingzhe.com/home/#/settings/api'
    const XZ_AUTH_TIMEOUT_SEC = 90
    const XZ_AUTH_POLL_MS = 2000

    /** 后端错误（英文 code / 中文文案）→ 给用户看的中文；未知英文附在兜底文案后 */
    function keysErrorText(value, fallback = '操作失败，请稍后重试') {
      if (value === null || value === undefined) return fallback
      const raw = typeof value === 'string'
        ? value
        : String(value.message || value.error || value.code || '')
      const text = raw.trim()
      if (!text) return fallback
      const table = {
        invalid_key: 'Key 无效，请确认已复制完整且类型正确',
        amap_invalid: '高德 Key 无效，请确认服务平台选择的是「Web服务」',
        amap_key_invalid: '高德 Key 无效，请确认服务平台选择的是「Web服务」',
        amap_quota: '高德 Key 配额不足或权限受限，请到控制台检查',
        quota_exceeded: '请求配额已用尽，请到服务商控制台检查额度',
        missing_key: '请先填写 Key',
        missing_client: '请填写行者应用 ID 和 Secret',
        invalid_client: '行者应用 ID 或 Secret 不正确',
        network_error: '网络连接失败，请检查网络后重试',
        timeout: '请求超时，请稍后重试',
        unauthorized: '授权状态已失效，请重新授权',
        forbidden: '没有访问该接口的权限，请检查 Key 的服务平台与权限',
        not_configured: '尚未配置',
      }
      const key = text.toLowerCase()
      if (table[key]) return table[key]
      if (/[\u4e00-\u9fa5]/.test(text)) return text
      if (/timeout|timed out/i.test(text)) return table.timeout
      if (/network|failed to fetch|load failed|econnrefused|enotfound/i.test(text)) return table.network_error
      if (/quota|rate.?limit|too many/i.test(text)) return table.quota_exceeded
      if (/missing|required|empty/i.test(text)) return table.missing_key
      if (/not.?configured|unconfigured/i.test(text)) return table.not_configured
      if (/invalid.*(key|amap)|amap.*invalid/i.test(text)) return table.amap_invalid
      if (/invalid.*(client|secret|app)|xingzhe.*(invalid|auth)/i.test(text)) return table.invalid_client
      if (/unauthor|forbidden|401|403/i.test(text)) return table.unauthorized
      return `${fallback}（${text}）`
    }

    /** DELETE JSON：返回 body；非 2xx / status:error 抛出可翻译错误 */
    async function rbDelete(path, signal) {
      const res = await fetch(`${RB}/${path}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        signal,
      })
      let data = null
      try { data = await res.json() } catch { data = null }
      if (!res.ok) throw new Error(keysErrorText(data?.error, `HTTP ${res.status}`))
      if (data && data.status && data.status !== 'ok') {
        throw new Error(keysErrorText(data.error, '删除失败，请稍后重试'))
      }
      return data
    }

    /**
     * 高级功能 Key（可选）：高德 Web服务 Key + 行者应用 ID / Secret。
     * variant='onboarding' 时折叠展示；variant='account' 时完整状态 + 行内表单。
     * 只读 GET /roadbook/keys；保存 / 清除后重新 GET 并通知父级刷新路书状态。
     */
    function AdvancedKeysPanel({
      variant = 'account',
      collapsible = false,
      onChanged = null,
      showToast = null,
    }) {
      const isOnb = variant === 'onboarding'
      const [open, setOpen] = React.useState(!collapsible)
      const [version, setVersion] = React.useState(0)
      const enabled = !collapsible || open
      const res = useRbResource('keys', version, enabled)
      const keysData = res.data && typeof res.data === 'object' ? res.data : {}
      const amap = keysData.amap && typeof keysData.amap === 'object' ? keysData.amap : {}
      const xz = keysData.xingzhe && typeof keysData.xingzhe === 'object' ? keysData.xingzhe : {}
      const pending = enabled && !res.data && !res.error
      const loadError = enabled && !res.data
        ? res.error
        : keysData.status && keysData.status !== 'ok'
          ? keysErrorText(keysData.error, '读取配置失败')
          : null

      const [amapValue, setAmapValue] = React.useState('')
      const [amapBusy, setAmapBusy] = React.useState(false)
      const [amapError, setAmapError] = React.useState('')
      const [amapSaved, setAmapSaved] = React.useState(false)
      const [xzId, setXzId] = React.useState('')
      const [xzSecret, setXzSecret] = React.useState('')
      const [xzBusy, setXzBusy] = React.useState(false)
      const [xzError, setXzError] = React.useState('')
      const [xzSaved, setXzSaved] = React.useState(false)
      const [clearBusy, setClearBusy] = React.useState('')
      const [auth, setAuth] = React.useState({ phase: 'idle', waited: 0, error: '' })
      const alive = React.useRef(true)
      const amapAbort = React.useRef(null)
      const xzAbort = React.useRef(null)
      const clearAbort = React.useRef(null)
      const authAbort = React.useRef(null)
      const pollAbort = React.useRef(null)
      const pollTimer = React.useRef(null)
      const pollBusy = React.useRef(false)

      const stopPoll = () => {
        if (pollTimer.current) {
          clearInterval(pollTimer.current)
          pollTimer.current = null
        }
        pollBusy.current = false
      }

      React.useEffect(() => () => {
        alive.current = false
        stopPoll()
        amapAbort.current?.abort()
        xzAbort.current?.abort()
        clearAbort.current?.abort()
        authAbort.current?.abort()
        pollAbort.current?.abort()
      }, [])

      const notifyChanged = () => {
        setVersion((v) => v + 1)
        if (onChanged) onChanged()
      }

      const saveAmap = async (e) => {
        e?.preventDefault?.()
        const value = amapValue.trim()
        if (!value || amapBusy) return
        setAmapBusy(true)
        setAmapError('')
        setAmapSaved(false)
        amapAbort.current?.abort()
        const controller = new AbortController()
        amapAbort.current = controller
        try {
          const body = await rbPost('keys', { amap: value }, controller.signal)
          if (!alive.current) return
          if (!body) throw new Error('服务未返回结果')
          if (body.status && body.status !== 'ok') {
            throw new Error(keysErrorText(body.error, '保存失败，请稍后重试'))
          }
          const result = body.amap && typeof body.amap === 'object' ? body.amap : {}
          notifyChanged()
          if (result.valid === false || result.saved === false) {
            setAmapError(keysErrorText(result.error, 'Key 验证未通过'))
            return
          }
          setAmapValue('')
          setAmapSaved(true)
          showToast?.('高德 Key 已保存并验证通过', 'ok')
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setAmapError(keysErrorText(err?.message, '保存失败，请稍后重试'))
        } finally {
          if (alive.current) setAmapBusy(false)
        }
      }

      const clearAmap = async () => {
        if (clearBusy) return
        setClearBusy('amap')
        setAmapError('')
        setAmapSaved(false)
        clearAbort.current?.abort()
        const controller = new AbortController()
        clearAbort.current = controller
        try {
          const body = await rbDelete('keys/amap', controller.signal)
          if (!alive.current) return
          if (body && body.status && body.status !== 'ok') {
            throw new Error(keysErrorText(body.error, '清除失败，请稍后重试'))
          }
          setAmapValue('')
          notifyChanged()
          showToast?.('已清除高德 Key', 'ok')
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setAmapError(keysErrorText(err?.message, '清除失败，请稍后重试'))
        } finally {
          if (alive.current) setClearBusy('')
        }
      }

      const saveXingzhe = async (e) => {
        e?.preventDefault?.()
        if (xzBusy) return
        const clientId = xzId.trim()
        const secret = xzSecret.trim()
        if (!clientId && !secret) {
          setXzError('请填写行者应用 ID 或 Secret')
          return
        }
        const payload = {}
        if (clientId) payload.xingzheClientId = clientId
        if (secret) payload.xingzheClientSecret = secret
        setXzBusy(true)
        setXzError('')
        setXzSaved(false)
        xzAbort.current?.abort()
        const controller = new AbortController()
        xzAbort.current = controller
        try {
          const body = await rbPost('keys', payload, controller.signal)
          if (!alive.current) return
          if (!body) throw new Error('服务未返回结果')
          if (body.status && body.status !== 'ok') {
            throw new Error(keysErrorText(body.error, '保存失败，请稍后重试'))
          }
          const result = body.xingzhe && typeof body.xingzhe === 'object' ? body.xingzhe : {}
          notifyChanged()
          if (result.error || result.saved === false) {
            setXzError(keysErrorText(result.error, '保存失败，请稍后重试'))
            return
          }
          if (result.configured === false) {
            setXzError('保存未生效，请同时填写应用 ID 和 Secret')
            return
          }
          setXzId('')
          setXzSecret('')
          setXzSaved(true)
          showToast?.('行者应用信息已保存', 'ok')
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setXzError(keysErrorText(err?.message, '保存失败，请稍后重试'))
        } finally {
          if (alive.current) setXzBusy(false)
        }
      }

      const clearXingzhe = async () => {
        if (clearBusy) return
        setClearBusy('xingzhe')
        setXzError('')
        setXzSaved(false)
        clearAbort.current?.abort()
        const controller = new AbortController()
        clearAbort.current = controller
        try {
          const body = await rbDelete('keys/xingzhe', controller.signal)
          if (!alive.current) return
          if (body && body.status && body.status !== 'ok') {
            throw new Error(keysErrorText(body.error, '清除失败，请稍后重试'))
          }
          setXzId('')
          setXzSecret('')
          notifyChanged()
          showToast?.('已清除行者应用信息', 'ok')
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setXzError(keysErrorText(err?.message, '清除失败，请稍后重试'))
        } finally {
          if (alive.current) setClearBusy('')
        }
      }

      const authorize = async () => {
        if (auth.phase === 'starting' || auth.phase === 'waiting') return
        if (!xz.configured) {
          setAuth({ phase: 'error', waited: 0, error: '先保存行者应用 ID 和 Secret，再授权' })
          return
        }
        stopPoll()
        setAuth({ phase: 'starting', waited: 0, error: '' })
        authAbort.current?.abort()
        const controller = new AbortController()
        authAbort.current = controller
        try {
          const response = await fetch(`${RB}/auth-url`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          })
          const body = await response.json().catch(() => null)
          if (!body || !body.url) {
            throw new Error(keysErrorText(body?.message || body?.error, '未能获取行者授权链接'))
          }
          try { window.open(body.url, '_blank') } catch { /* 弹窗被拦截时仍继续轮询 */ }
          if (!alive.current) return
          setAuth({ phase: 'waiting', waited: 0, error: '' })
          let ticks = 0
          pollTimer.current = setInterval(async () => {
            if (!alive.current || pollBusy.current) return
            pollBusy.current = true
            ticks += 1
            try {
              pollAbort.current?.abort()
              const pollController = new AbortController()
              pollAbort.current = pollController
              const response2 = await fetch(`${RB}/auth-status`, {
                headers: { Accept: 'application/json' },
                signal: pollController.signal,
              })
              const status = await response2.json().catch(() => null)
              if (!alive.current) return
              if (status && status.authorized) {
                stopPoll()
                setAuth({ phase: 'ok', waited: ticks * 2, error: '' })
                notifyChanged()
                showToast?.('行者账号已授权', 'ok')
                return
              }
              if (ticks * (XZ_AUTH_POLL_MS / 1000) >= XZ_AUTH_TIMEOUT_SEC) {
                stopPoll()
                setAuth({
                  phase: 'error',
                  waited: ticks * 2,
                  error: `等待授权超时（${XZ_AUTH_TIMEOUT_SEC} 秒），请重试`,
                })
                return
              }
              setAuth({ phase: 'waiting', waited: ticks * 2, error: '' })
            } catch (err) {
              if (err?.name !== 'AbortError' && alive.current) {
                setAuth({ phase: 'waiting', waited: ticks * 2, error: '' })
              }
            } finally {
              pollBusy.current = false
            }
          }, XZ_AUTH_POLL_MS)
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setAuth({ phase: 'error', waited: 0, error: keysErrorText(err?.message, '未能打开行者授权页面') })
        }
      }

      const amapStatus = (() => {
        if (pending) return { cls: '', text: '…' }
        if (!amap.configured) return { cls: '', text: '未配置' }
        if (amap.valid === true) return { cls: 'g', text: '有效' }
        if (amap.valid === false) {
          return { cls: 'r', text: `无效：${keysErrorText(amap.error, '验证未通过')}` }
        }
        return { cls: 'a', text: '已保存' }
      })()
      const xzStatus = pending
        ? { cls: '', text: '…' }
        : xz.configured ? { cls: 'g', text: '已配置' } : { cls: '', text: '未配置' }
      const authText = pending
        ? '…'
        : xz.authorized ? '已授权' : '未授权'
      const authReady = xz.configured === true

      const amapBlock = h('div', { className: 'gp-keys-sec', 'data-gp-keys-amap': '1' },
        h('div', { className: 'gp-keys-hd' },
          h('b', null, '高德 Web服务 Key'),
          h('span', {
            className: `gp-key-pill${amapStatus.cls ? ` ${amapStatus.cls}` : ''}`,
            'data-gp-amap-status': amapStatus.cls || 'off',
          }, amapStatus.text)),
        amap.masked
          ? h('div', { className: 'gp-keys-masked', 'data-gp-amap-masked': '1' }, `已保存：${amap.masked}`)
          : null,
        h('form', { className: 'gp-keys-form', onSubmit: saveAmap, noValidate: true },
          h('input', {
            className: 'gp-input',
            type: 'password',
            value: amapValue,
            placeholder: '32 位 Web服务 Key',
            autoComplete: 'off',
            spellCheck: false,
            'aria-label': '高德 Web服务 Key',
            'data-gp-amap-key-input': '1',
            disabled: amapBusy || clearBusy === 'amap',
            onChange: (e) => {
              setAmapValue(e.target.value)
              setAmapError('')
              setAmapSaved(false)
            },
          }),
          h('button', {
            className: 'gp-btn primary',
            type: 'submit',
            disabled: amapBusy || !amapValue.trim(),
            'data-gp-amap-save': '1',
          }, amapBusy ? '验证中…' : '保存并验证'),
          amap.configured
            ? h('button', {
                className: 'gp-btn',
                type: 'button',
                disabled: !!clearBusy || amapBusy,
                'data-gp-amap-clear': '1',
                onClick: clearAmap,
              }, clearBusy === 'amap' ? '清除中…' : '清除')
            : null),
        h('div', { className: 'gp-keys-links' },
          h('a', { href: AMAP_KEY_URL, target: '_blank', rel: 'noreferrer' }, '获取高德 Key ↗')),
        isOnb
          ? h('div', { className: 'gp-keys-note' }, '创建应用 → 添加 Key → 服务平台选「Web服务」')
          : null,
        amapError
          ? h('div', {
              className: 'gp-keys-err',
              role: 'alert',
              'aria-live': 'assertive',
              'data-gp-amap-error': '1',
            }, amapError)
          : null,
        amapSaved
          ? h('div', {
              className: 'gp-keys-ok',
              role: 'status',
              'aria-live': 'polite',
              'data-gp-amap-ok': '1',
            }, '已保存并验证通过')
          : null)

      const xzBlock = h('div', { className: 'gp-keys-sec', 'data-gp-keys-xingzhe': '1' },
        h('div', { className: 'gp-keys-hd' },
          h('b', null, '行者应用'),
          h('span', {
            className: `gp-key-pill${xzStatus.cls ? ` ${xzStatus.cls}` : ''}`,
            'data-gp-xz-status': xzStatus.cls || 'off',
          }, xzStatus.text)),
        xz.clientIdMasked
          ? h('div', { className: 'gp-keys-masked', 'data-gp-xz-masked': '1' },
              `应用 ID：${xz.clientIdMasked}`)
          : null,
        h('div', { className: 'gp-keys-auth' },
          h('span', null, '授权状态：'),
          h('span', {
            className: `gp-key-pill${xz.authorized ? ' g' : xz.configured ? ' a' : ''}`,
            'data-gp-xz-auth-state': xz.authorized ? 'ok' : xz.configured ? 'pending' : 'off',
          }, authText),
          h('button', {
            className: 'gp-btn',
            type: 'button',
            disabled: !authReady || auth.phase === 'starting' || auth.phase === 'waiting',
            'data-gp-xz-auth': '1',
            onClick: authorize,
          }, auth.phase === 'waiting'
            ? '等待授权…'
            : auth.phase === 'starting' ? '正在打开…' : '授权行者'),
          xz.expiresAt
            ? h('span', { className: 'gp-keys-note' },
                `有效期至 ${stampText(xz.expiresAt) || String(xz.expiresAt)}`)
            : null),
        auth.phase === 'waiting'
          ? h('div', {
              className: 'gp-keys-note',
              role: 'status',
              'aria-live': 'polite',
              'data-gp-xz-auth-wait': '1',
            }, `已打开授权页面，等待授权…（${auth.waited} / ${XZ_AUTH_TIMEOUT_SEC} 秒）`)
          : null,
        auth.error
          ? h('div', {
              className: 'gp-keys-err',
              role: 'alert',
              'data-gp-xz-auth-error': '1',
            }, auth.error)
          : null,
        h('form', { className: 'gp-keys-form', onSubmit: saveXingzhe, noValidate: true },
          h('input', {
            className: 'gp-input',
            type: 'text',
            value: xzId,
            placeholder: '行者应用 ID（Client ID）',
            autoComplete: 'off',
            spellCheck: false,
            'aria-label': '行者应用 ID',
            'data-gp-xz-id-input': '1',
            disabled: xzBusy || clearBusy === 'xingzhe',
            onChange: (e) => {
              setXzId(e.target.value)
              setXzError('')
              setXzSaved(false)
            },
          }),
          h('input', {
            className: 'gp-input',
            type: 'password',
            value: xzSecret,
            placeholder: '行者应用 Secret',
            autoComplete: 'off',
            spellCheck: false,
            'aria-label': '行者应用 Secret',
            'data-gp-xz-secret-input': '1',
            disabled: xzBusy || clearBusy === 'xingzhe',
            onChange: (e) => {
              setXzSecret(e.target.value)
              setXzError('')
              setXzSaved(false)
            },
          }),
          h('button', {
            className: 'gp-btn primary',
            type: 'submit',
            disabled: xzBusy || (!xzId.trim() && !xzSecret.trim()),
            'data-gp-xz-save': '1',
          }, xzBusy ? '保存中…' : '保存'),
          xz.configured
            ? h('button', {
                className: 'gp-btn',
                type: 'button',
                disabled: !!clearBusy || xzBusy,
                'data-gp-xz-clear': '1',
                onClick: clearXingzhe,
              }, clearBusy === 'xingzhe' ? '清除中…' : '清除')
            : null),
        h('div', { className: 'gp-keys-links' },
          h('a', { href: XINGZHE_KEY_URL, target: '_blank', rel: 'noreferrer' }, '打开行者 API 设置 ↗')),
        isOnb
          ? h('div', { className: 'gp-keys-note' }, '保存后可在「路书工坊 → 导入」里点授权')
          : null,
        xzError
          ? h('div', {
              className: 'gp-keys-err',
              role: 'alert',
              'aria-live': 'assertive',
              'data-gp-xz-error': '1',
            }, xzError)
          : null,
        xzSaved
          ? h('div', {
              className: 'gp-keys-ok',
              role: 'status',
              'aria-live': 'polite',
              'data-gp-xz-ok': '1',
            }, '已保存')
          : null)

      const body = h(React.Fragment, null,
        loadError
          ? h('div', {
              className: 'gp-keys-err',
              role: 'alert',
              'data-gp-keys-load-error': '1',
            },
              `配置读取失败：${loadError}`,
              h('button', {
                className: 'gp-btn',
                type: 'button',
                style: { marginLeft: 8 },
                onClick: () => setVersion((v) => v + 1),
              }, '重试'))
          : null,
        amapBlock,
        xzBlock,
        isOnb
          ? h('div', { className: 'gp-keys-actions' },
              h('button', {
                className: 'gp-btn',
                type: 'button',
                'data-gp-onb-keys-later': '1',
                onClick: () => setOpen(false),
              }, '以后再说'),
              h('span', { className: 'gp-keys-note' },
                '不配置也不影响基础数据，之后可在「账号设置」里随时补上。'))
          : null)

      if (!collapsible) {
        return h('div', { className: 'gp-keys', 'data-gp-keys-panel': variant }, body)
      }
      return h('div', { className: 'gp-onb-keys', 'data-gp-onb-keys': open ? '1' : '0' },
        h('button', {
          type: 'button',
          className: 'gp-onb-keys-toggle',
          'aria-expanded': open,
          'aria-controls': 'gp-onb-keys-body',
          'data-gp-onb-keys-toggle': '1',
          onClick: () => setOpen((v) => !v),
        },
          h('span', { className: `caret${open ? ' up' : ''}`, 'aria-hidden': true }, '▸'),
          h('span', null, '路线规划（可选）'),
          h('span', { className: 'gp-onb-tag' }, open ? '可跳过' : '可选')),
        open
          ? h('div', { className: 'gp-keys', id: 'gp-onb-keys-body' }, body)
          : null)
    }

    /* ---------------------------------------------------------------- *
     * 回看 · 顶栏日期导航
     *   ‹ 11-05 周四 ›  [今天]  [回看 11-05]
     * 只负责「选哪一天」：日级接口由 Page 拼进 path，其它请求完全不动。
     * ---------------------------------------------------------------- */
    function DateNav({ selectedDate, todayDate, keyboardEnabled = true, onPick, onToday }) {
      const [open, setOpen] = React.useState(false)
      const rootRef = React.useRef(null)
      const day = dayPart(selectedDate) || dayPart(todayDate) || todayIso()
      const today = dayPart(todayDate) || todayIso()
      const minDay = reviewMinDay(today)
      const reviewing = day !== today
      const canPrev = !!minDay && day > minDay
      const canNext = day < today
      const options = reviewDayOptions(today)

      /* 打开弹层时点外面关闭；Esc 与「选择某一项」的关闭在键盘/点击里处理 */
      React.useEffect(() => {
        if (!open) return undefined
        const onPointerDown = (e) => {
          const root = rootRef.current
          if (root && e?.target && root.contains(e.target)) return
          setOpen(false)
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
      }, [open])

      /* 键盘：[ / ] 前天 / 后一天，Esc 关闭弹层。输入框内一律忽略 */
      React.useEffect(() => {
        if (!keyboardEnabled) return undefined
        const onKeyDown = (e) => {
          if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
          const target = e.target
          const tag = String(target?.tagName || '').toLowerCase()
          if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return
          if (e.key === '[') {
            e.preventDefault()
            if (canPrev) onPick(shiftDay(day, -1))
          } else if (e.key === ']') {
            e.preventDefault()
            if (canNext) onPick(shiftDay(day, 1))
          } else if (e.key === 'Escape' && open) {
            e.preventDefault()
            setOpen(false)
          }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [keyboardEnabled, open, canPrev, canNext, day, onPick])

      return h('div', {
        className: `gp-datenav${reviewing ? ' is-review' : ''}`,
        'data-gp-datenav': '1',
        'data-gp-date-selected': day,
        'data-gp-date-today': today,
        'data-gp-date-min': minDay || '',
        'data-gp-date-reviewing': reviewing ? '1' : '0',
        role: 'group',
        'aria-label': '回看日期导航',
        ref: rootRef,
      },
        h('button', {
          type: 'button',
          className: 'gp-dn-btn',
          'data-gp-date-prev': '1',
          'aria-label': '前一天',
          title: canPrev ? '前一天（快捷键 [）' : `最多回看 ${REVIEW_SPAN} 天`,
          disabled: !canPrev,
          onClick: () => { if (canPrev) onPick(shiftDay(day, -1)) },
        }, '‹'),
        h('button', {
          type: 'button',
          className: `gp-dn-label${open ? ' on' : ''}`,
          'data-gp-date-label': '1',
          'aria-haspopup': 'listbox',
          'aria-expanded': open,
          'aria-label': `当前日期 ${dayText(day)}，点击选择最近 ${REVIEW_SPAN} 天`,
          title: `选择日期（最近 ${REVIEW_SPAN} 天）`,
          onClick: () => setOpen((v) => !v),
        },
          h('b', null, shortDay(day)),
          h('span', { className: 'w' }, dayWeekday(day))),
        h('button', {
          type: 'button',
          className: 'gp-dn-btn',
          'data-gp-date-next': '1',
          'aria-label': '后一天',
          title: canNext ? '后一天（快捷键 ]）' : '已经是今天',
          disabled: !canNext,
          onClick: () => { if (canNext) onPick(shiftDay(day, 1)) },
        }, '›'),
        reviewing
          ? h('button', {
              type: 'button',
              className: 'gp-btn gp-dn-today',
              'data-gp-date-today-btn': '1',
              'aria-label': '回到今天',
              title: '回到今天',
              onClick: () => { setOpen(false); onToday() },
            }, '今天')
          : null,
        reviewing
          ? h('span', {
              className: 'gp-dn-chip',
              'data-gp-date-chip': '1',
              title: '正在回看历史数据',
            }, `回看 ${shortDay(day)}`)
          : null,
        open
          ? h('div', {
              className: 'gp-dn-pop',
              'data-gp-date-pop': '1',
              role: 'listbox',
              'aria-label': `最近 ${REVIEW_SPAN} 天`,
            },
              h('div', { className: 'gp-dn-pop-hd', 'data-gp-date-pop-hd': '1' },
                `最近 ${REVIEW_SPAN} 天（${shortDay(minDay)} → ${shortDay(today)}）`),
              options.map((option) => {
                const isToday = option === today
                const isSelected = option === day
                return h('button', {
                  key: option,
                  type: 'button',
                  role: 'option',
                  'aria-selected': isSelected,
                  className: `gp-dn-opt${isSelected ? ' on' : ''}${isToday ? ' today' : ''}`,
                  'data-gp-date-option': option,
                  'data-gp-date-option-today': isToday ? '1' : '0',
                  'data-gp-date-option-selected': isSelected ? '1' : '0',
                  onClick: () => { setOpen(false); onPick(option) },
                },
                  h('span', { className: 'w' }, dayWeekday(option)),
                  h('span', { className: 'd' }, isToday ? `今天 · ${shortDay(option)}` : shortDay(option)),
                  isSelected ? h('span', { className: 'ck', 'aria-hidden': true }, '✓') : null)
              }))
          : null)
    }

    /* ---------------------------------------------------------------- *
     * 页面
     * ---------------------------------------------------------------- */
    function Page() {
      const [version, setVersion] = React.useState(0)
      const [refreshing, setRefreshing] = React.useState(false)
      const [deviceOpen, setDeviceOpen] = React.useState(false)
      const [deviceVersion, setDeviceVersion] = React.useState(0)
      const [detailId, setDetailId] = React.useState(null)
      const [toast, setToast] = React.useState(null)
      const [layout, setLayout] = React.useState(readLayout2)
      const [editing, setEditing] = React.useState(false)
      const [onboarded, setOnboarded] = React.useState(readOnboarded)
      const [onboardPreview, setOnboardPreview] = React.useState(false)
      const [accountOpen, setAccountOpen] = React.useState(false)
      const [workshopOpen, setWorkshopOpen] = React.useState(false)
      /* 路书服务状态版本：账号设置里保存/清除高级 Key 后 bump，工坊重挂载时取新状态 */
      const [roadbookVersion, setRoadbookVersion] = React.useState(0)
      /* 性别偏好：null = 跟随 /profile；'none' = 用户明确未设置（压过 profile） */
      const [gender, setGender] = React.useState(readStoredGender)
      const [bannerDismissed, setBannerDismissed] = React.useState(false)
      const [drag, setDrag] = React.useState({ id: null, at: null, height: 0 })
      const [cardDrag, setCardDrag] = React.useState({
        sectionId: null, id: null, at: null, height: 0,
      })
      /* 健康趋势的时间范围：7 / 30 天，独立持久化（只影响 /trends 一次请求） */
      const [trendsRange, setTrendsRange] = React.useState(readTrendsRange)
      /* 回看：selectedDate 默认本机今天；只影响日级接口的 path（不改 version） */
      const [todayDate, setTodayDate] = React.useState(todayIso)
      const [selectedDate, setSelectedDate] = React.useState(todayIso)
      const [reviewBannerHidden, setReviewBannerHidden] = React.useState(false)
      const toastTimer = React.useRef(null)
      const deviceAnchor = React.useRef(null)
      const layoutBtn = React.useRef(null)
      const dragIdRef = React.useRef(null)
      const dragAtRef = React.useRef(null)
      const cardDragRef = React.useRef({ sectionId: null, id: null, at: null })

      /* 当前布局 → { id: visible }，同时作为 useResource 的 enabled 开关 */
      const visible = React.useMemo(() => {
        const out = {}
        for (const row of layout) out[row.id] = row.visible !== false
        return out
      }, [layout])

      React.useEffect(() => { writeLayout2(layout) }, [layout])

      /* 趋势范围写回 localStorage：刷新后保持 7 / 30 天 */
      React.useEffect(() => {
        try { localStorage.setItem(TRENDS_RANGE_KEY, String(trendsRange)) } catch { /* ignore */ }
      }, [trendsRange])

      const changeTrendsRange = React.useCallback((days) => {
        setTrendsRange(days === 30 ? 30 : 7)
      }, [])

      /* ---------------- 回看：选日期 / 回到今天 ---------------- */
      const reviewing = selectedDate !== todayDate

      /* 任何入口（箭头 / 弹层 / 快捷键 / 横幅）都走这里：夹到 30 天窗口内，
         并顺手刷新「今天」——页面跨过午夜后箭头边界依然正确 */
      const pickDate = React.useCallback((day) => {
        const now = todayIso()
        const next = clampReviewDay(day, now)
        setTodayDate(now)
        setSelectedDate((cur) => (cur === next ? cur : next))
        setReviewBannerHidden(false)
      }, [])

      const goToday = React.useCallback(() => {
        const now = todayIso()
        setTodayDate(now)
        setSelectedDate(now)
        setReviewBannerHidden(false)
      }, [])

      /* 日期一变，横幅重新出现（隐藏只针对当次回看） */
      React.useEffect(() => { setReviewBannerHidden(false) }, [selectedDate])

      /* 日级接口共用的 query：只有这些接口跟随 selectedDate */
      const dateQuery = `date=${encodeURIComponent(selectedDate)}`

      /* 布局改动立即写回 localStorage（无独立保存步骤） */
      const applyLayout = React.useCallback((next) => {
        if (!next) return
        setLayout(next)
        writeLayout2(next)
      }, [])

      const removeSection = React.useCallback((id) => {
        const next = hideInLayout(layout, id)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout])

      const addSection = React.useCallback((id) => {
        const next = appendToLayout(layout, id)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout])

      const removeCard = React.useCallback((sectionId, cardId) => {
        const next = hideCard(layout, sectionId, cardId)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout])

      const addCard = React.useCallback((sectionId, cardId) => {
        const next = showCard(layout, sectionId, cardId)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout])

      const clearCardDrag = React.useCallback(() => {
        cardDragRef.current = { sectionId: null, id: null, at: null }
        setCardDrag({ sectionId: null, id: null, at: null, height: 0 })
      }, [])

      const clearDrag = React.useCallback(() => {
        dragIdRef.current = null
        dragAtRef.current = null
        setDrag({ id: null, at: null, height: 0 })
      }, [])

      const exitEdit = React.useCallback(() => {
        clearDrag()
        clearCardDrag()
        setEditing(false)
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => layoutBtn.current?.focus?.())
        }
      }, [clearDrag, clearCardDrag])

      const toggleEditing = React.useCallback(() => {
        if (editing) { exitEdit(); return }
        /* 编辑态下抽屉/设备浮层会挡操作，进入前先收起 */
        setDeviceOpen(false)
        setDetailId(null)
        clearDrag()
        clearCardDrag()
        setEditing(true)
      }, [editing, exitEdit, clearDrag, clearCardDrag])

      /* Esc 退出编辑 */
      React.useEffect(() => {
        if (!editing) return undefined
        const onKeyDown = (e) => {
          if (e.key !== 'Escape') return
          e.preventDefault()
          exitEdit()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [editing, exitEdit])

      const beginDrag = React.useCallback((e, id) => {
        if (!editing || cardDragRef.current.id) return
        dragIdRef.current = id
        dragAtRef.current = null
        let height = 0
        try { height = Math.round(e.currentTarget.getBoundingClientRect().height) } catch { height = 0 }
        setDrag({ id, at: null, height: height > 0 ? height : 0 })
        try {
          const dt = e.dataTransfer
          if (dt) {
            dt.effectAllowed = 'move'
            dt.setData('text/plain', id)
            dt.setData('application/x-gp-section', id)
          }
        } catch { /* 个别环境不允许写自定义 MIME */ }
      }, [editing])

      const overSlot = React.useCallback((e, index) => {
        if (cardDragRef.current.id || !dragIdRef.current) return
        e.preventDefault()
        try { if (e.dataTransfer) e.dataTransfer.dropEffect = 'move' } catch { /* ignore */ }
        const rect = e.currentTarget.getBoundingClientRect()
        const at = e.clientY > rect.top + rect.height / 2 ? index + 1 : index
        if (dragAtRef.current !== at) {
          dragAtRef.current = at
          setDrag((d) => (d.id ? { ...d, at } : d))
        }
      }, [])

      const overGhost = React.useCallback((e) => {
        if (cardDragRef.current.id || !dragIdRef.current) return
        e.preventDefault()
        try { if (e.dataTransfer) e.dataTransfer.dropEffect = 'move' } catch { /* ignore */ }
      }, [])

      const dropAt = React.useCallback((e, at) => {
        if (cardDragRef.current.id) return
        e.preventDefault()
        const id = dragIdRef.current
        const target = at !== null && at !== undefined ? at : dragAtRef.current
        dragIdRef.current = null
        dragAtRef.current = null
        setDrag({ id: null, at: null, height: 0 })
        if (!id || target === null || target === undefined) return
        const next = reorderLayout(layout, id, target)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout])

      const dropSlot = React.useCallback((e, index) => {
        if (cardDragRef.current.id) return
        if (dragAtRef.current === null) {
          const rect = e.currentTarget.getBoundingClientRect()
          dragAtRef.current = e.clientY > rect.top + rect.height / 2 ? index + 1 : index
        }
        dropAt(e, dragAtRef.current)
      }, [dropAt])

      const endDrag = React.useCallback(() => { clearDrag() }, [clearDrag])

      /* ---- 卡片拖拽：作用域限定在 sectionId 内，拖到别的板块不生效 ---- */
      const beginCardDrag = React.useCallback((e, sectionId, cardId) => {
        if (!editing) return
        /* 卡片在区块槽内部：必须阻止 dragstart 冒泡，否则会同时触发区块拖拽 */
        e.stopPropagation()
        const cards = cardsOf(layout, sectionId)
        const fromVisible = cards.filter((card) => card.visible !== false)
          .findIndex((card) => card.id === cardId)
        if (fromVisible < 0) return
        let height = 0
        try { height = Math.round(e.currentTarget.getBoundingClientRect().height) } catch { height = 0 }
        cardDragRef.current = { sectionId, id: cardId, at: null }
        dragIdRef.current = null
        dragAtRef.current = null
        setDrag({ id: null, at: null, height: 0 })
        setCardDrag({ sectionId, id: cardId, at: null, height: height > 0 ? height : 0 })
        try {
          const dt = e.dataTransfer
          if (dt) {
            dt.effectAllowed = 'move'
            dt.setData('text/plain', `${sectionId}:${cardId}`)
            dt.setData('application/x-gp-card', `${sectionId}:${cardId}`)
          }
        } catch { /* 个别环境不允许写自定义 MIME */ }
      }, [editing, layout])

      const overCardSlot = React.useCallback((e, sectionId, index) => {
        const current = cardDragRef.current
        if (!current.id || current.sectionId !== sectionId) return
        e.preventDefault()
        e.stopPropagation()
        try { if (e.dataTransfer) e.dataTransfer.dropEffect = 'move' } catch { /* ignore */ }
        if (index === undefined || index === null) return
        const rect = e.currentTarget.getBoundingClientRect()
        const at = e.clientY > rect.top + rect.height / 2 ? index + 1 : index
        if (current.at !== at) {
          current.at = at
          setCardDrag((d) => (d.id ? { ...d, at } : d))
        }
      }, [])

      const dropCard = React.useCallback((e, sectionId, at) => {
        const current = cardDragRef.current
        if (!current.id || current.sectionId !== sectionId) return
        e.preventDefault()
        e.stopPropagation()
        const target = at !== null && at !== undefined ? at : current.at
        const cardId = current.id
        clearCardDrag()
        if (target === null || target === undefined) return
        const visibleCards = cardsOf(layout, sectionId).filter((card) => card.visible !== false)
        const fromVisible = visibleCards.findIndex((card) => card.id === cardId)
        if (fromVisible < 0) return
        const next = moveCard(layout, sectionId, fromVisible, target)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout, clearCardDrag])

      const endCardDrag = React.useCallback(() => { clearCardDrag() }, [clearCardDrag])

      const show = (id) => visible[id] !== false

      /* 连接状态决定首屏：none → 向导；official 且未进阶 → 解锁卡片 */
      const setup = useResource('setup/status', version)
      const setupData = setup.data && typeof setup.data === 'object' ? setup.data : null
      const setupMode = typeof setupData?.mode === 'string' ? setupData.mode : null
      const advanced = setupData?.advanced === true
      const gated = setupMode === 'official' && !advanced

      /* 性别：本地有值就不再请求 /profile；未设置时用 /profile 兜底。
         'none' 表示用户明确选择「未设置」，此时不再回退 profile。 */
      const profileRes = useResource('profile', version, gender === null)
      const profileGender = normalizeGender(profileRes.data?.gender)
      const effectiveGender = gender === 'none'
        ? null
        : (gender === 'female' || gender === 'male' ? gender : profileGender)
      /* 区块可用性：plan 仅进阶模式；womens 仅女性。不可用时既不渲染，也不出现在个性化列表里 */
      const sectionAvailable = (id) => {
        if (id === 'plan') return advanced === true
        if (id === 'womens') return effectiveGender === 'female'
        return true
      }

      /* 迁移：可用但布局里还没有的新区块（plan / womens）按默认顺序补成可见行 */
      const missingSections = React.useMemo(() => {
        const ids = []
        if (advanced && !sectionRowOf(layout, 'plan')) ids.push('plan')
        if (effectiveGender === 'female' && !sectionRowOf(layout, 'womens')) ids.push('womens')
        return ids
      }, [advanced, effectiveGender, layout])
      React.useEffect(() => {
        if (!missingSections.length) return
        let next = layout
        for (const id of missingSections) next = insertSectionByDefault(next, id)
        if (next !== layout) applyLayout(next)
      }, [missingSections, layout, applyLayout])

      /* 恢复默认：稳定区块 + 当前可用的 plan / womens（同步写回，避免先闪一下） */
      const resetLayout = React.useCallback(() => {
        let next = defaultLayout()
        if (advanced) next = insertSectionByDefault(next, 'plan')
        if (effectiveGender === 'female') next = insertSectionByDefault(next, 'womens')
        applyLayout(next)
        clearLegacyLayout()
      }, [applyLayout, advanced, effectiveGender])

      /* 账号状态：顶栏提醒点与账号设置弹窗共用（服务端 /account 可能暂不可用，回退 setup/status） */
      const accountRes = useResource('account', version)
      const accountData = accountRes.data && typeof accountRes.data === 'object' ? accountRes.data : null

      const coachVisible = show('coach')
      /* 卡片级可见性：AI 板块的两个角色可以各自隐藏；两个都藏起来就不发 status 请求 */
      const coachCards = cardsOf(layout, 'coach')
      const coachRoles = coachCards
        .filter((card) => card.visible !== false)
        .map((card) => card.id)
      const coachRolesKey = coachRoles.join(',')
      const coachRoleVisible = coachRoles.length > 0

      /* 活动板块拆成「列表 / 月度分布」两张卡，任一张可见才发请求 */
      const activityCards = cardsOf(layout, 'activities')
      const activityCardVisible = (id) =>
        activityCards.some((card) => card.id === id && card.visible !== false)
      const activityListVisible = activityCardVisible('list')
      const activityMonthVisible = activityCardVisible('month')
      const activitiesVisible = show('activities') && (activityListVisible || activityMonthVisible)

      /* 进阶数据只在账号登录（advanced）时参与渲染与请求 */
      const advancedVisible = advanced && show('advanced')

      /* 隐藏的区块不发请求；snapshot 被 kpi/body 共用，extras 被 extras/records/advanced 共用。
         只有日级接口带 date=selectedDate：日期变化 = path 变化 → 仅这些资源重取。 */
      const snapshot = useResource(`snapshot?${dateQuery}`, version, show('kpi') || show('body'))
      const sleep = useResource(`sleep?days=7&${dateQuery}`, version, show('sleep'))
      /* 健康趋势：区块隐藏或 10 张卡全隐藏时不发请求；7/30 天只改这一个接口 */
      const trendCardVisible = cardsOf(layout, 'trends').some((card) => card.visible !== false)
      const trendsVisible = show('trends') && trendCardVisible
      const trendsRes = useResource(`trends?days=${trendsRange}&${dateQuery}`, version, trendsVisible)
      /* 睡眠规律性：趋势区块可见就复用它（30 天取最后 7 行，避免重复请求），
         否则由睡眠区块自己拉一次 trends?days=7 */
      const sleepRegularityOwn = useResource(`trends?days=7&${dateQuery}`, version,
        show('sleep') && !trendsVisible)
      const sleepRegularityData = trendsVisible ? trendsRes.data : sleepRegularityOwn.data
      const sleepRegularityRows = trendRowsOf(sleepRegularityData).slice(-7)
      const sleepRegularityLoading = trendsVisible
        ? trendsRes.loading && !trendsRes.data
        : sleepRegularityOwn.loading && !sleepRegularityOwn.data
      const load = useResource(`load?days=30&${dateQuery}`, version, show('load') || advancedVisible)
      const activities = useResource(`activities?limit=20&${dateQuery}`, version, activitiesVisible)
      /* 训练计划：仅进阶模式 + 区块可见 + 至少一张卡可见时才请求 */
      const planCards = cardsOf(layout, 'plan')
      const planCardVisible = planCards.some((card) => card.visible !== false)
      const planVisible = advanced && show('plan') && planCardVisible
      const plan = useResource('plan', version, planVisible)
      const extras = useResource(`extras?${dateQuery}`, version,
        show('extras') || show('records') || advancedVisible)
      const auth = useResource('login/status', version)
      const devices = useResource('devices', `${version}:${deviceVersion}`)
      const deviceList = Array.isArray(devices.data?.devices) ? devices.data.devices : null

      /* 月度分布：月份跟随快照日期（没有快照就用本机今天） */
      const snapshotDay = firstOf(dayPart(snapshot.data?.date), isoDay(new Date()))
      const monthKey = snapshotDay.slice(0, 7)
      /* 女性健康：仅 female + 区块/卡片可见时请求。
         日期跟快照走；快照未就绪前不发请求，避免 date 从「本机今天」跳变导致重复请求 */
      const womensCards = cardsOf(layout, 'womens')
      const womensCardVisible = womensCards.some((card) => card.visible !== false)
      const womensDay = dayPart(snapshot.data?.date) || (snapshot.loading ? null : isoDay(new Date()))
      const womensPath = womensDay ? `womens?date=${womensDay}` : null
      const womensOn = effectiveGender === 'female' && show('womens') && womensCardVisible && !!womensPath
      const womens = useResource(womensPath, version, womensOn)
      const monthVisibleNow = show('activities') && activityMonthVisible
      const calendar = useResource(`activities/calendar?month=${monthKey}`, version, monthVisibleNow)
      // 本月还没有活动时，自动回退到最近有活动的上一个月（最多回退 2 个月）
      const primaryEmpty = !calendar.loading && !calendar.error && (calendar.data?.totals?.count ?? 0) === 0
      const prevMonthKey = shiftMonthKey(monthKey, -1)
      const calendarPrev = useResource(
        `activities/calendar?month=${prevMonthKey}`,
        version,
        monthVisibleNow && primaryEmpty,
      )
      const prevHasData = (calendarPrev.data?.totals?.count ?? 0) > 0
      const previousTwoKey = shiftMonthKey(monthKey, -2)
      const calendarPrevTwo = useResource(
        `activities/calendar?month=${previousTwoKey}`,
        version,
        monthVisibleNow && primaryEmpty && !calendarPrev.loading && !prevHasData,
      )
      const prevTwoHasData = (calendarPrevTwo.data?.totals?.count ?? 0) > 0
      const displayCalendar = prevHasData
        ? calendarPrev.data
        : (prevTwoHasData ? calendarPrevTwo.data : calendar.data)
      const displayMonthKey = prevHasData
        ? prevMonthKey
        : (prevTwoHasData ? previousTwoKey : monthKey)
      const displayCalendarLoading = calendar.loading
        || (primaryEmpty && (calendarPrev.loading || (!prevHasData && calendarPrevTwo.loading)))
      const calendarNote = displayMonthKey !== monthKey ? '本月暂无活动 · 显示最近有活动的月份' : null

      /* 活动平铺：近 30 天最多 12 条；只有户外候选才懒加载轨迹（并发 ≤ 3） */
      const tileList = React.useMemo(
        () => recentActivityTiles(activities.data, snapshotDay),
        [activities.data, snapshotDay],
      )
      const trackIds = React.useMemo(
        () => (advanced ? tileList.filter(gpsCandidate).map((a) => String(a.id)) : []),
        [tileList, advanced],
      )
      const tracks = useActivityTracks(
        trackIds,
        advanced && show('activities') && activityListVisible,
        version,
      )

      const reload = React.useCallback(() => setVersion((v) => v + 1), [])
      const unlock = useUnlockFlow(reload)

      /* 新手引导：首次整页 / 仪表盘重看浮层；两条路径都不动已保存的 Key */
      const finishOnboarding = React.useCallback(() => {
        markOnboarded()
        setOnboarded(true)
      }, [])
      const keySaved = React.useCallback(() => {
        markOnboarded()
        setOnboarded(true)
        // 关键：version bump 让 setup/status 与所有资源重新拉取，
        // 官方模式（mode:'official'）下仪表盘会直接替换向导，无需整页刷新。
        reload()
      }, [reload])
      const openOnboarding = React.useCallback(() => {
        setDeviceOpen(false)
        setDetailId(null)
        if (editing) exitEdit()
        setOnboardPreview(true)
      }, [editing, exitEdit])
      const bumpRoadbook = React.useCallback(() => setRoadbookVersion((v) => v + 1), [])
      /* 路书工坊「去设置」：关掉整页工坊，直接打开账号设置里的高级 Key 区块 */
      const openAccountFromWorkshop = React.useCallback(() => {
        setWorkshopOpen(false)
        setAccountOpen(true)
      }, [])

      /* 两个 AI 角色的结果放在 Page 层，隐藏/显示区块不丢缓存，切换 tab 不重算。
         生成时把 selectedDate 作为 {date} 传给后端：回看就分析那一天。 */
      const coachApi = useCoachRoles({
        date: selectedDate,
        enabled: coachVisible && coachRoleVisible,
        version,
      })

      /* 当前激活角色被隐藏时，自动切到剩下的那个；两个都隐藏则交给「全部隐藏」提示 */
      React.useEffect(() => {
        if (!coachRoles.length) return
        if (!coachRoles.includes(coachApi.tab)) coachApi.setTab(coachRoles[0])
      }, [coachRolesKey, coachApi.tab, coachApi.setTab])

      const refresh = React.useCallback(() => {
        setRefreshing(true)
        fetch(`${API}/refresh`, { method: 'POST' })
          .catch(() => {})
          .finally(() => { setRefreshing(false); setVersion((v) => v + 1) })
      }, [])

      const showToast = React.useCallback((msg, kind = 'ok') => {
        setToast({ msg, kind })
        if (toastTimer.current) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), 2600)
      }, [])
      React.useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

      /* 性别保存：写 localStorage → 立即重算可见性（无需整页刷新）→ 版本 bump 重取数据 */
      const saveGender = React.useCallback((value) => {
        const next = writeStoredGender(value)
        /* 未设置：清空本地偏好，本次会话立即隐藏；下次加载回退 /profile */
        setGender(next || 'none')
        showToast(next ? '性别已保存，正在刷新…' : '已设为未设置，女性健康区块已隐藏', 'ok')
        reload()
      }, [reload, showToast])

      const snap = snapshot.data
      const unauth =
        (snap && snap.status === 'unauthenticated') || (auth.data && auth.data.authed === false)
      const kpi = snap?.kpi ?? {}
      const today = snap?.today ?? {}
      const recovery = snap?.recovery ?? {}

      /* 账号视图：/account 优先，缺失字段回退 setup/status（老后端也能显示大部分状态） */
      const acct = {
        mode: accountData?.mode ?? setupMode,
        advanced: typeof accountData?.advanced === 'boolean' ? accountData.advanced : advanced,
        hasKey: typeof accountData?.hasKey === 'boolean' ? accountData.hasKey
          : typeof setupData?.hasKey === 'boolean' ? setupData.hasKey : null,
        keyValid: typeof accountData?.keyValid === 'boolean' ? accountData.keyValid
          : typeof setupData?.keyValid === 'boolean' ? setupData.keyValid : null,
        ssoAuthed: typeof accountData?.ssoAuthed === 'boolean' ? accountData.ssoAuthed
          : typeof setupData?.ssoAuthed === 'boolean' ? setupData.ssoAuthed : null,
        mcpInstalled: typeof accountData?.mcpInstalled === 'boolean' ? accountData.mcpInstalled
          : typeof setupData?.mcpInstalled === 'boolean' ? setupData.mcpInstalled : null,
        keyUpdatedAt: firstOf(accountData?.keyUpdatedAt, accountData?.keyUpdatedAtMs),
        tokenUpdatedAt: firstOf(accountData?.tokenUpdatedAt, accountData?.tokenUpdated),
        tokenAgeDays: numOf(accountData?.tokenAgeDays),
        tokenExpiresEstimate: accountData?.tokenExpiresEstimate ?? null,
        reasons: Array.isArray(accountData?.reasons) ? accountData.reasons : [],
        needsAttention: accountData?.needsAttention === true,
      }
      /* 任一区块返回 unauthenticated / 已配置的 Key 失效 → 顶部琥珀横幅（授权问题） */
      const sectionUnauth = [snapshot.data, sleep.data, activities.data, extras.data, load.data]
        .some((row) => row && row.status === 'unauthenticated')
      const keyBroken = acct.keyValid === false && acct.hasKey === true
      const authBroken = unauth || sectionUnauth || keyBroken
      /* 顶栏提醒点更宽：后端 needsAttention 还包含「没配 Key」「组件未装」等可优化项 */
      const needsAttention = acct.needsAttention || authBroken

      const insights = []
      if (load.data?.current) {
        const c = load.data.current
        if (c.acwr > 1.5) insights.push(['warn', '负荷偏高', `ACWR ${c.acwr}（${c.acwrStatus}），急性负荷 ${c.atl} 远高于慢性 ${c.ctl}，TSB ${c.tsb}。建议减量并补 Z2 有氧。`])
        else if (c.acwr < 0.8) insights.push(['warn', '负荷偏低', `ACWR ${c.acwr}，近期训练量不足，可逐步加量。`])
      }
      if (kpi.sleep && kpi.sleep.score >= 80) insights.push(['good', '睡眠良好', `昨夜 ${kpi.sleep.hours}h / ${kpi.sleep.score} 分，深睡 ${kpi.sleep.deepPct}%，HRV ${kpi.sleep.hrv}ms。`])
      if (kpi.rhr && kpi.rhr.avg7 && kpi.rhr.value <= kpi.rhr.avg7 - 5) insights.push(['good', '静息心率走低', `今日 ${kpi.rhr.value} bpm，比 7 日均值 ${kpi.rhr.avg7} 低 ${kpi.rhr.avg7 - kpi.rhr.value}，恢复信号好。`])
      if (kpi.intensity && kpi.intensity.total < kpi.intensity.goal * 0.5) insights.push(['bad', '强度分钟落后', `本周 ${kpi.intensity.total}/${kpi.intensity.goal} 分钟，进度偏慢。`])

      /* setup/status 返回之前只显示居中骨架，绝不先闪一下空仪表盘 */
      if (!setupData && !setup.error) {
        return h('div', { className: 'gp-root' },
          h('style', null, CSS),
          h('div', { className: 'gp-boot' },
            h('div', { className: 'gp-spin', 'aria-hidden': true }),
            h('div', { className: 'gp-boot-text' }, '正在读取连接状态…')))
      }

      /* 没 Key 也没登录：整页引导（点过「先跳过」后不再挡路） */
      if (setupMode === 'none' && !onboarded) {
        return h('div', { className: 'gp-root' },
          h('style', null, CSS),
          h(Onboarding, {
            flow: unlock,
            onSaved: keySaved,
            onDismiss: finishOnboarding,
          }))
      }

      const loadLocked = gated || load.data?.status === 'advanced_required'

      /* 每个区块独立成节点，按 layout 顺序渲染；隐藏的区块根本不会挂载 */
      const section = (id, ...children) =>
        h('div', { key: id, className: 'gp-section', 'data-gp-section': id }, ...children)

      const sectionNodes = {}
      const cardNodes = { kpi: {}, body: {}, womens: {}, trends: {}, load: {}, advanced: {}, extras: {}, coach: {}, plan: {}, activities: {} }
      /* 回看时给区块标题补日期锚点：当日类「· 11-05」，区间类「· 截至 11-05」。
         今天（默认）完全不加，标题文案保持原样。 */
      const reviewDay = reviewing ? shortDay(selectedDate) : null
      const dayTitle = (text, kind = 'day') => (reviewDay
        ? h(React.Fragment, null, text,
            h('span', {
              className: 'gp-sec-day',
              'data-gp-sec-day': '1',
              'data-gp-sec-anchor': kind,
            }, kind === 'until' ? ` · 截至 ${reviewDay}` : ` · ${reviewDay}`))
        : text)
      /* 一个板块的卡片区：顺序 / 显隐来自 layout，nodes 是按 id 建好的卡片元素 */
      const gridFor = (id, className) => h(CardGrid, {
        sectionId: id,
        className,
        cards: cardsOf(layout, id),
        nodes: cardNodes[id],
        editing,
        drag: cardDrag,
        onDragStart: beginCardDrag,
        onDragOver: overCardSlot,
        onDrop: dropCard,
        onDragEnd: endCardDrag,
        onRemove: removeCard,
        onAdd: addCard,
      })

      /* 1 训练准备度：270° 弧形仪表 */
      cardNodes.kpi.readiness = h('div', { className: 'gp-card gp-kpi', 'data-gp-kpi': 'readiness' },
            h('div', { className: 'k' }, '训练准备度'),
            snapshot.loading
              ? h(KpiSkel, { height: 88 })
              : h('div', { className: 'viz' },
                  h(ReadinessGauge, {
                    score: kpi.readiness?.score,
                    level: kpi.readiness?.level,
                  })),
            h('div', { className: 'sub' },
              snapshot.loading
                ? ''
                : kpi.readiness
                  ? (kpi.readiness.feedback || '按今天的状态安排强度')
                  : gated ? '账号登录后显示' : '暂无数据'))

      /* 2 睡眠评分：评分环 + 深睡 / REM / 其余三段内弧 */
      cardNodes.kpi.sleep = h('div', { className: 'gp-card gp-kpi', 'data-gp-kpi': 'sleep' },
            h('div', { className: 'k' }, '睡眠评分'),
            snapshot.loading
              ? h(KpiSkel, { height: 78 })
              : h('div', { className: 'viz' },
                  h(SleepDonut, {
                    score: kpi.sleep?.score,
                    qualifier: kpi.sleep?.qualifier,
                    deepPct: kpi.sleep?.deepPct,
                    remPct: kpi.sleep?.remPct,
                  })),
            h('div', { className: 'sub' },
              snapshot.loading
                ? ''
                : kpi.sleep
                  ? [
                      h('b', { key: 'h' }, typeof kpi.sleep.hours === 'number'
                        ? clock(kpi.sleep.hours * 3600)
                        : '—'),
                      numOf(kpi.sleep.deepPct) !== null
                        ? h('span', { key: 'd', className: 'lg dg' }, `深睡 ${fmt(kpi.sleep.deepPct)}%`)
                        : null,
                      numOf(kpi.sleep.remPct) !== null
                        ? h('span', { key: 'r', className: 'lg dv' }, `REM ${fmt(kpi.sleep.remPct)}%`)
                        : null,
                      numOf(kpi.sleep.deepPct) !== null && numOf(kpi.sleep.remPct) !== null
                        ? h('span', { key: 'o', className: 'lg dm' },
                            `其余 ${fmt(Math.max(0, 100 - kpi.sleep.deepPct - kpi.sleep.remPct))}%`)
                        : null,
                    ]
                  : '—'))

      /* 3 Body Battery：电池外形 + 充 / 耗数字 + 当日迷你曲线（懒加载） */
      cardNodes.kpi.battery = h('div', { className: 'gp-card gp-kpi', 'data-gp-kpi': 'battery' },
            h('div', { className: 'k' }, 'Body Battery'),
            snapshot.loading
              ? h(KpiSkel, { height: 62 })
              : h('div', { className: 'viz' },
                  h(BatteryGauge, {
                    current: kpi.bodyBattery?.current,
                    charged: kpi.bodyBattery?.charged,
                    drained: kpi.bodyBattery?.drained,
                    /* 有当日曲线时电池图形收窄，整卡高度仍保持在 KPI 行高内 */
                    height: 42,
                  })),
            snapshot.loading
              ? null
              : h(BodyBatterySpark, { enabled: show('kpi'), date: selectedDate, version }),
            h('div', { className: 'sub' },
              snapshot.loading
                ? ''
                : kpi.bodyBattery?.highest != null
                  ? `今日峰值 ${fmt(kpi.bodyBattery.highest)}`
                  : '满电 100'))

      /* 4 静息心率：今日 vs 7 日均值的迷你柱状对比 */
      cardNodes.kpi.rhr = h('div', { className: 'gp-card gp-kpi', 'data-gp-kpi': 'rhr' },
            h('div', { className: 'k' },
              '静息心率',
              h('svg', {
                viewBox: '0 0 26 12', width: 26, height: 12, 'aria-hidden': true,
                style: { marginLeft: 6, opacity: 0.7 },
              }, h('path', {
                d: 'M0 6h4l2-4 3 8 2-5 2 3h3l2-4 2 8 2-6h2',
                fill: 'none', stroke: 'var(--gp-red)', strokeWidth: 1.5,
                strokeLinejoin: 'round', strokeLinecap: 'round',
              }))),
            snapshot.loading
              ? h(KpiSkel, { height: 82 })
              : h('div', { className: 'viz col' },
                  h('div', { className: 'rhr-row' },
                    h('span', { className: 'num' }, fmt(kpi.rhr?.value),
                      h('small', null, 'bpm')),
                    rhrDelta(kpi.rhr?.value, kpi.rhr?.avg7)),
                  h(RhrTrend, {
                    value: kpi.rhr?.value,
                    avg7: kpi.rhr?.avg7,
                    series: kpi.rhr?.series,
                  })),
            h('div', { className: 'sub' },
              snapshot.loading
                ? ''
                : kpi.rhr?.avg7 && kpi.rhr?.value != null
                  ? (kpi.rhr.value === kpi.rhr.avg7
                    ? `与 7 日均值持平（${fmt(kpi.rhr.avg7)}）`
                    : `比 7 日均值（${fmt(kpi.rhr.avg7)}）${kpi.rhr.value < kpi.rhr.avg7 ? '低' : '高'} ${fmt(Math.abs(kpi.rhr.value - kpi.rhr.avg7))} bpm`)
                  : kpi.rhr?.avg7 ? `7 日均值 ${fmt(kpi.rhr.avg7)}` : '—'))

      /* 5 本周强度分钟：朝 150 分钟目标推进的圆环 */
      cardNodes.kpi.intensity = h('div', { className: 'gp-card gp-kpi', 'data-gp-kpi': 'intensity' },
            h('div', { className: 'k' }, '本周强度分钟'),
            snapshot.loading
              ? h(KpiSkel, { height: 78 })
              : h('div', { className: 'viz' },
                  h(IntensityRing, {
                    total: kpi.intensity?.total,
                    goal: kpi.intensity?.goal,
                  })),
            h('div', { className: 'sub' },
              snapshot.loading
                ? ''
                : typeof kpi.intensity?.total !== 'number'
                  ? '—'
                  : kpi.intensity.total >= (kpi.intensity.goal || 150)
                    ? '已达成本周目标'
                    : `还差 ${fmt((kpi.intensity.goal || 150) - kpi.intensity.total)} 分钟`))

      sectionNodes.kpi = section('kpi',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('今日状态')),
          h('span', { className: 'hint' }, '能不能练 · 恢复够不够'),
          h('span', { className: 'sp' }, snap?.date ?? '')),
        gridFor('kpi', 'gp-kpis'))

      /* 今天身体：7 张卡在 3 列网格里重排，恢复卡不再单独占右侧 */
      cardNodes.body.steps = h('div', { className: 'gp-card' },
              h('h3', null, '步数'),
              today.steps
                ? h('div', { style: { display: 'flex', gap: 12, alignItems: 'center' } },
                    h(StepsRing, { value: today.steps.value, goal: today.steps.goal }),
                    h('div', { className: 'gp-mini' },
                      h('div', null, '距离 ', h('b', null, `${((today.steps.distanceM || 0) / 1000).toFixed(2)} km`)),
                      h('div', { style: { marginTop: 4 } }, '楼层 ', h('b', null, fmt(today.floors, 1)))))
                : h(Skel, { h: 76 }))

      cardNodes.body.calories = h('div', { className: 'gp-card' },
              h('h3', null, '能量消耗'),
              today.calories
                ? h('div', null,
                    h('div', { className: 'v', style: { fontSize: 24, fontWeight: 700 } },
                      fmt(today.calories.total), h('small', { style: { fontSize: 12, color: 'var(--gp-t3)', marginLeft: 4 } }, 'kcal')),
                    h('div', { className: 'gp-mini', style: { marginTop: 8 } },
                      `活动 ${fmt(today.calories.active)} · 静息 ${fmt(today.calories.rest)}`))
                : h(Skel, { h: 60 }))

      cardNodes.body.stress = h('div', { className: 'gp-card' },
              h('h3', null, '压力'),
              today.stress
                ? h('div', null,
                    h('div', { style: { display: 'flex', gap: 8, alignItems: 'baseline' } },
                      h('div', { style: { fontSize: 24, fontWeight: 700 } }, fmt(today.stress.avg)),
                      h('span', { className: 'gp-pill g' }, today.stress.qualifier || '')),
                    h('div', { className: 'gp-mini', style: { marginTop: 6 } }, `峰值 ${fmt(today.stress.max)}`))
                : h(Skel, { h: 60 }))

      cardNodes.body.hr = h('div', { className: 'gp-card' },
              h('h3', null, '心率'),
              today.hr
                ? h('div', null,
                    h(Row, { lab: '静息', val: fmt(today.hr.rest), pct: 15, color: 'var(--gp-green)' }),
                    h(Row, { lab: '平均', val: fmt(today.hr.avg), pct: 35, color: 'var(--gp-blue)' }),
                    h(Row, { lab: '最高', val: fmt(today.hr.max), pct: 70, color: 'var(--gp-red)' }))
                : h(Skel, { h: 60 }))

      cardNodes.body.breath = h('div', { className: 'gp-card' },
              h('h3', null, '呼吸 / 血氧'),
              h('div', null,
                today.respiration?.avg
                  ? h(Row, { lab: '呼吸', val: `${today.respiration.avg}/min`, pct: 60, color: 'var(--gp-violet)' })
                  : h('div', { className: 'gp-mini' }, '呼吸数据暂无'),
                today.spo2
                  ? h(Row, { lab: '血氧', val: `${today.spo2.avg}%`, pct: today.spo2.avg, color: 'var(--gp-blue)' })
                  : h('div', { className: 'gp-empty', style: { marginTop: 8, padding: '7px 9px' } },
                      h('b', null, 'SpO₂'), ' 设备今日未记录')))

      cardNodes.body.hydration = h('div', { className: 'gp-card' },
              h('h3', null, '水分'),
              h('div', { style: { fontSize: 24, fontWeight: 700 } },
                fmt(today.hydration?.ml),
                h('small', { style: { fontSize: 12, color: 'var(--gp-t3)', marginLeft: 4 } },
                  `/ ${fmt(today.hydration?.goal)} ml`)),
              h('div', { className: 'gp-bar', style: { marginTop: 8 } },
                h('i', {
                  style: {
                    width: `${clampPct(((today.hydration?.ml || 0) / (today.hydration?.goal || 2500)) * 100)}%`,
                    background: 'var(--gp-blue)',
                  },
                })))

      /* 恢复（训练准备度来自账号登录） */
      cardNodes.body.recovery = gated
            ? h(UnlockCard, { flow: unlock, id: 'recovery', compact: true, hint: '恢复准备度' })
            : h('div', { className: 'gp-card' },
                h('h3', null, '恢复'),
                h('div', { style: { display: 'flex', gap: 8, alignItems: 'baseline' } },
                  h('div', { style: { fontSize: 26, fontWeight: 700 } }, fmt(kpi.readiness?.score)),
                  kpi.readiness
                    ? h('span', { className: `gp-pill ${pillClass(kpi.readiness.score)}` },
                        LEVEL_ZH[kpi.readiness.level] || kpi.readiness.level)
                    : null),
                h('div', { className: 'gp-mini', style: { margin: '4px 0 10px' } },
                  recovery.recoveryHours != null ? `恢复时间 ${recovery.recoveryHours}h` : ''),
                (recovery.factors || []).map(([lab, val], i) =>
                  h(Row, { key: i, lab, val: `${val}%`, pct: val, color: val >= 70 ? 'var(--gp-green)' : val >= 40 ? 'var(--gp-amber)' : 'var(--gp-red)' })),
                h('div', { style: { display: 'flex', gap: 14, marginTop: 12, borderTop: '1px solid var(--gp-line2)', paddingTop: 9 } },
                  h('div', null, h('div', { className: 'gp-mini' }, 'HRV 周均'),
                    h('div', { style: { fontSize: 16, fontWeight: 650 } }, fmt(recovery.hrvWeekly), h('small', { style: { fontSize: 10, color: 'var(--gp-t3)' } }, ' ms'))),
                  h('div', null, h('div', { className: 'gp-mini' }, '恢复倒计时'),
                    h('div', { style: { fontSize: 16, fontWeight: 650 } }, fmt(recovery.recoveryHours), h('small', { style: { fontSize: 10, color: 'var(--gp-t3)' } }, ' h')))))

      sectionNodes.body = section('body',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('今天身体'))),
        gridFor('body', 'gp-grid gp-g3'))

      sectionNodes.sleep = section('sleep',
        h('div', { className: 'gp-sec' }, h('h2', null, '睡眠 · 近 7 晚'),
          reviewDay
            ? h('span', { className: 'hint', 'data-gp-sleep-anchor': '1' },
                `截至 ${reviewDay}`)
            : null,
          h('span', { className: 'sp' }, sleep.data ? `均分 ${fmt(sleep.data.avgScore)}` : '')),
        h('div', { className: 'gp-card' },
          h('h3', null, '每晚阶段与评分'),
          sleep.loading ? h(Skel, { h: 150 }) : h(SleepChart, { data: sleep.data })),
        /* 睡眠规律性：复用 /trends 的 7 晚字段（趋势不可见时自己拉一次） */
        h(SleepRegularity, {
          rows: sleepRegularityRows,
          averages: sleepRegularityData?.averages,
          loading: sleepRegularityLoading,
          nights: Array.isArray(sleep.data?.nights) ? sleep.data.nights.length : null,
        }))

      /* ---------------- 女性健康（仅 female 时挂载） ---------------- */
      const womensData = womens.data && typeof womens.data === 'object' ? womens.data : null
      const womensLoading = (snapshot.loading || womens.loading) && !womensData
      cardNodes.womens.cycle = h(WomensCycleCard, { data: womensData, loading: womensLoading })
      cardNodes.womens.pregnancy = h(WomensPregnancyCard, { data: womensData, loading: womensLoading })
      sectionNodes.womens = effectiveGender === 'female'
        ? section('womens',
            h('div', { className: 'gp-sec', 'data-gp-womens': '1' },
              h('h2', null, '女性健康'),
              h('span', { className: 'hint' }, '周期 · 孕期')),
            gridFor('womens', 'gp-grid gp-g2'))
        : null

      /* ---------------- 健康趋势：10 张紧凑图表卡（7 / 30 天） ---------------- */
      const trendRows = trendRowsOf(trendsRes.data)
      const trendDays = trendsRange
      const trendLoading = trendsRes.loading && !trendsRes.data
      const trendPick = (key) => (row) => numOf(row?.[key])
      const trendAverageOf = (key) => {
        const fromApi = numOf(trendsRes.data?.averages?.[key])
        return fromApi !== null ? fromApi : trendAvg(trendRows, trendPick(key))
      }

      const trendRhrLast = trendLast(trendRows, trendPick('rhr'))
      const trendRhrAvg = trendAverageOf('rhr')
      const trendHrvLast = trendLast(trendRows, trendPick('hrv'))
      const trendHrvAvg = trendAverageOf('hrv')
      const trendSleepScoreLast = trendLast(trendRows, trendPick('sleepScore'))
      const trendSleepScoreAvg = trendAverageOf('sleepScore')
      const trendSleepHoursAvg = trendAverageOf('sleepHours')
      const trendStepsLast = trendLast(trendRows, trendPick('steps'))
      const trendStepsAvg = trendAverageOf('steps')
      const trendStressLast = trendLast(trendRows, trendPick('stress'))
      const trendStressAvg = trendAverageOf('stress')
      const trendRespLast = trendLast(trendRows, trendPick('respiration'))
      const trendRespAvg = trendAverageOf('respiration')
      const trendSpo2Last = trendLast(trendRows, trendPick('spo2'))
      const trendSpo2Min = trendMin(trendRows, trendPick('spo2'))
      const trendBatteryPick = (row) => numOf(row?.bodyBattery?.latest)
      const trendBatteryLast = trendLast(trendRows, trendBatteryPick)
      const trendBatteryBands = trendRows
        .map((row) => row?.bodyBattery)
        .filter((band) => band && numOf(band.min) !== null && numOf(band.max) !== null)
      const trendBatteryMin = trendBatteryBands.length
        ? Math.min(...trendBatteryBands.map((band) => numOf(band.min)))
        : null
      const trendBatteryMax = trendBatteryBands.length
        ? Math.max(...trendBatteryBands.map((band) => numOf(band.max)))
        : null
      const trendIntensityPick = trendPick('intensity')
      const trendIntensityLast = trendLast(trendRows, trendIntensityPick)
      const trendIntensityWeekVals = trendRows.slice(-7)
        .map((row) => trendValue(row, trendIntensityPick))
        .filter((v) => v !== null)
      const trendIntensityWeek = trendIntensityWeekVals.length
        ? trendIntensityWeekVals.reduce((sum, v) => sum + v, 0)
        : null
      const trendIntensityAvg = trendAverageOf('intensity')
      const trendWeightPick = trendPick('weightKg')
      const trendWeightLast = trendLast(trendRows, trendWeightPick)
      const trendWeightFirst = (() => {
        for (const row of trendRows) {
          const v = trendValue(row, trendWeightPick)
          if (v !== null) return v
        }
        return null
      })()
      const trendWeightDelta = trendWeightLast !== null && trendWeightFirst !== null
        ? trendWeightLast - trendWeightFirst
        : null

      cardNodes.trends.rhr = h(TrendCard, {
        id: 'rhr',
        label: '静息心率',
        color: 'var(--gp-red)',
        pill: trendRhrLast !== null ? `${fmt(trendRhrLast)} bpm` : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'rhr', label: '静息心率', rows: trendRows, pick: trendPick('rhr'),
          color: 'var(--gp-red)', avg: trendRhrAvg, rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, trendRhrAvg !== null ? `均值 ${fmt(trendRhrAvg)} bpm` : '均值 —'),
          trendDelta(
            trendRhrLast !== null && trendRhrAvg !== null ? trendRhrLast - trendRhrAvg : null,
            'down', 0, '')),
      })

      /* HRV 详情（基线 / 昨夜峰值 / 状态）：snapshot 有就显示，缺了只保留原页脚 */
      const hrvInfo = hrvDetailOf(snap)
      const hrvNote = hrvDetailText(hrvInfo)

      cardNodes.trends.hrv = h(TrendCard, {
        id: 'hrv',
        label: 'HRV',
        color: 'var(--gp-violet)',
        pill: trendHrvLast !== null ? `${fmt(trendHrvLast)} ms` : '—',
        loading: trendLoading,
        footerClass: hrvNote ? 'wrap' : '',
        title: hrvNote || undefined,
        chart: h(TrendChart, {
          id: 'hrv', label: 'HRV', rows: trendRows, pick: trendPick('hrv'),
          color: 'var(--gp-violet)', avg: trendHrvAvg, rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, trendHrvAvg !== null ? `均值 ${fmt(trendHrvAvg)} ms` : '均值 —'),
          trendDelta(
            trendHrvLast !== null && trendHrvAvg !== null ? trendHrvLast - trendHrvAvg : null,
            'up', 0, ' ms'),
          hrvNote
            ? h('span', {
                className: 'gp-trend-note',
                'data-gp-trend-hrv-detail': '1',
              }, hrvNote)
            : null),
      })

      cardNodes.trends.sleep = h(TrendCard, {
        id: 'sleep',
        label: '睡眠',
        color: 'var(--gp-green)',
        pill: trendSleepScoreLast !== null ? `${fmt(trendSleepScoreLast)} 分` : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'sleep', label: '睡眠', rows: trendRows,
          pick: trendPick('sleepScore'),
          barsPick: trendPick('sleepHours'),
          barsColor: 'var(--gp-blue)',
          color: 'var(--gp-green)',
          rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, `均分 ${trendSleepScoreAvg !== null ? fmt(trendSleepScoreAvg, 1) : '—'}`),
          h('span', null,
            `均时长 ${trendSleepHoursAvg !== null ? `${fmt(trendSleepHoursAvg, 1)}h` : '—'}`)),
      })

      cardNodes.trends.steps = h(TrendCard, {
        id: 'steps',
        label: '步数',
        color: 'var(--gp-blue)',
        pill: trendStepsLast !== null ? fmt(trendStepsLast) : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'steps', label: '步数', rows: trendRows, pick: trendPick('steps'),
          color: 'var(--gp-blue)', kind: 'bar', rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, `日均 ${trendStepsAvg !== null ? fmt(trendStepsAvg) : '—'} 步`)),
      })

      cardNodes.trends.stress = h(TrendCard, {
        id: 'stress',
        label: '压力',
        color: 'var(--gp-amber)',
        pill: trendStressLast !== null ? fmt(trendStressLast) : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'stress', label: '压力', rows: trendRows, pick: trendPick('stress'),
          color: 'var(--gp-amber)', avg: trendStressAvg, rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, `均值 ${trendStressAvg !== null ? fmt(trendStressAvg) : '—'}`),
          trendDelta(
            trendStressLast !== null && trendStressAvg !== null ? trendStressLast - trendStressAvg : null,
            'down', 0, '')),
      })

      cardNodes.trends.battery = h(TrendCard, {
        id: 'battery',
        label: 'Body Battery',
        color: 'var(--gp-green)',
        pill: trendBatteryLast !== null ? fmt(trendBatteryLast) : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'battery', label: 'Body Battery', rows: trendRows,
          pick: trendBatteryPick,
          bandPick: (row) => row?.bodyBattery,
          color: 'var(--gp-green)', kind: 'band', rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, `当前 ${trendBatteryLast !== null ? fmt(trendBatteryLast) : '—'}`),
          trendBatteryMin !== null && trendBatteryMax !== null
            ? h('span', null, `区间 ${fmt(trendBatteryMin)}–${fmt(trendBatteryMax)}`)
            : null),
      })

      cardNodes.trends.respiration = h(TrendCard, {
        id: 'respiration',
        label: '呼吸',
        color: 'var(--gp-violet)',
        pill: trendRespLast !== null ? fmt(trendRespLast, 1) : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'respiration', label: '呼吸', rows: trendRows, pick: trendPick('respiration'),
          color: 'var(--gp-violet)', avg: trendRespAvg, rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null,
            `均值 ${trendRespAvg !== null ? fmt(trendRespAvg, 1) : '—'} 次/分`)),
      })

      cardNodes.trends.spo2 = h(TrendCard, {
        id: 'spo2',
        label: '血氧',
        color: 'var(--gp-blue)',
        pill: trendSpo2Last !== null ? `${fmt(trendSpo2Last)}%` : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'spo2', label: '血氧', rows: trendRows, pick: trendPick('spo2'),
          color: 'var(--gp-blue)', avg: trendAvg(trendRows, trendPick('spo2')),
          rangeDays: trendDays, emptyText: '设备未记录',
        }),
        footer: h(React.Fragment, null,
          h('span', null, `最低 ${trendSpo2Min !== null ? `${fmt(trendSpo2Min)}%` : '—'}`)),
      })

      cardNodes.trends.intensity = h(TrendCard, {
        id: 'intensity',
        label: '强度分钟',
        color: 'var(--gp-amber)',
        pill: trendIntensityLast !== null ? `${fmt(trendIntensityLast)} 分钟` : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'intensity', label: '强度分钟', rows: trendRows,
          pick: trendIntensityPick, color: 'var(--gp-amber)', kind: 'bar',
          rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, `周合计 ${trendIntensityWeek !== null ? fmt(trendIntensityWeek) : '—'} 分钟`),
          h('span', null, `日均 ${trendIntensityAvg !== null ? fmt(trendIntensityAvg) : '—'} 分钟`)),
      })

      cardNodes.trends.weight = h(TrendCard, {
        id: 'weight',
        label: '体重',
        color: 'var(--gp-violet)',
        pill: trendWeightLast !== null ? `${fmt(trendWeightLast, 1)} kg` : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'weight', label: '体重', rows: trendRows, pick: trendWeightPick,
          color: 'var(--gp-violet)', rangeDays: trendDays, emptyText: '未称重',
        }),
        footer: h(React.Fragment, null,
          h('span', null,
            trendWeightLast !== null ? `最新 ${fmt(trendWeightLast, 1)} kg` : '未称重'),
          trendDelta(trendWeightDelta, null, 1, ' kg')),
      })

      sectionNodes.trends = section('trends',
        h('div', { className: 'gp-sec', 'data-gp-trends': '1' },
          h('h2', null, '健康趋势'),
          h('span', { className: 'hint', 'data-gp-trends-hint': '1' },
            reviewDay ? `截至 ${reviewDay} · 最近 7 天 / 30 天` : '最近 7 天 / 30 天'),
          h('div', { className: 'gp-sec-tools' },
            h('div', {
              className: 'gp-seg', role: 'tablist', 'aria-label': '健康趋势时间范围',
            }, TRENDS_DAYS.map((days) => h('button', {
              key: days,
              type: 'button',
              role: 'tab',
              'aria-selected': trendsRange === days,
              className: `gp-seg-btn${trendsRange === days ? ' on' : ''}`,
              'data-gp-trends-range': String(days),
              onClick: () => changeTrendsRange(days),
            }, `${days} 天`))))),
        gridFor('trends', 'gp-trends'))

      /* 训练负荷：趋势 / 平衡 / 能力 / 今日提醒 四张卡，可在 2 列网格里重排 */
      cardNodes.load.trend = loadLocked
        ? h(UnlockCard, { flow: unlock, id: 'load' })
        : h('div', { className: 'gp-card' },
            h('h3', null, '急性 / 慢性负荷（近 14 天）'),
            load.loading ? h(Skel, { h: 150 }) : h(LoadChart, { data: load.data }))

      cardNodes.load.balance = loadLocked
        ? h('div', { className: 'gp-card' },
            h('h3', null, '负荷平衡'),
            h('div', { className: 'gp-empty' }, h('b', null, '账号登录后显示'), '负荷平衡与 ACWR'))
        : h('div', { className: 'gp-card' },
            h('h3', null, '负荷平衡'),
            load.data?.balance
              ? h('div', null,
                  h('div', { style: { fontSize: 22, fontWeight: 700, marginBottom: 2 } },
                    fmt(load.data.current?.acwr, 1),
                    h('small', { style: { fontSize: 11, color: 'var(--gp-t3)', marginLeft: 6 } }, load.data.current?.acwrStatus)),
                  h('div', { className: 'gp-mini', style: { marginBottom: 10 } },
                    load.data.balance.feedback || ''),
                  (() => {
                    const bal = load.data.balance
                    const keys = ['aerobic_low', 'aerobic_high', 'anaerobic']
                    const scale = Math.max(
                      100,
                      ...keys.map((k) => Math.max((bal[k]?.load || 0) * 1.05, (bal[k]?.target_max || 0) * 1.2)),
                    )
                    return keys.map((key) => {
                      const b = bal[key]
                      if (!b) return null
                      const label = { aerobic_low: '有氧低', aerobic_high: '有氧高', anaerobic: '无氧' }[key]
                      return h(Row, {
                        key, lab: label, val: fmt(b.load),
                        pct: (b.load / scale) * 100,
                        color: b.status === 'within' ? 'var(--gp-green)' : 'var(--gp-amber)',
                      })
                    })
                  })(),
                  h('div', { className: 'gp-mini', style: { marginTop: 10, lineHeight: 1.6 } },
                    '目标：有氧低 137–301 · 有氧高 164–328 · 无氧 0–164'))
              : h(Skel, { h: 110 }))

      /* 能力（VO₂max / 阈值 / 比赛预测都需要账号登录），合成一张卡 */
      cardNodes.load.ability = gated
        ? h(UnlockCard, { flow: unlock, id: 'ability', hint: 'VO₂max · 阈值 · 比赛预测' })
        : h('div', { className: 'gp-card' },
            h('h3', null, '能力'),
            h('div', { className: 'gp-mini' },
              h('div', null, 'VO₂max ', h('b', null, fmt(load.data?.vo2max?.latest, 1)),
                ' · 30 天变化 ', h('b', null, fmt(load.data?.vo2max?.change, 1))),
              h('div', { style: { marginTop: 6 } },
                `骑行 FTP ${fmt(load.data?.ftp?.functional_threshold_power_watts)} W`),
              h('div', { style: { marginTop: 4 } },
                `跑步阈值 ${fmt(load.data?.lactate?.functional_threshold_power_watts)} W · ${fmt(load.data?.lactate?.power_to_weight, 2)} W/kg`),
              h('div', { style: { marginTop: 8, borderTop: '1px solid var(--gp-line2)', paddingTop: 7 } },
                load.data?.race
                  ? ['5K', '10K', 'half_marathon', 'marathon'].map((key) =>
                      h('div', { key, style: { display: 'flex', justifyContent: 'space-between', marginTop: 2 } },
                        h('span', null, key === 'half_marathon' ? '半马' : key === 'marathon' ? '全马' : key),
                        h('b', null, load.data.race[key]?.time ?? '—')))
                  : '比赛预测暂无数据')))

      cardNodes.load.insight = h('div', { className: 'gp-card' },
        h('h3', null, '值得注意'),
        insights.length
          ? insights.slice(0, 3).map(([kind, title, text], i) =>
              h('div', { key: i, className: `gp-insight ${kind}` },
                h('div', { className: 'ic' }, kind === 'good' ? '✓' : kind === 'bad' ? '!' : '·'),
                h('div', null, h('b', null, title), '：', text)))
          : h('div', { className: 'gp-mini' }, '数据齐全后自动生成'))

      sectionNodes.load = section('load',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('训练负荷', 'until')),
          h('span', { className: 'hint' }, '急性/慢性 · ACWR · 强度分布')),
        gridFor('load', 'gp-grid gp-g2'))

      /* ---------------- 进阶数据（仅 advanced 模式渲染） ---------------- */
      const advEmpty = (text = '未记录') => h('div', { className: 'gp-adv-empty' }, text)
      const advBar = (label, value, max, color) => h('div', { className: 'barrow', key: label },
        h('span', { className: 'lb' }, label),
        h('div', { className: 'bar' },
          h('i', {
            style: {
              width: `${clampPct(max > 0 ? ((numOf(value) ?? 0) / max) * 100 : 0)}%`,
              background: color,
            },
          })),
        h('span', { className: 'v' }, fmt(value, typeof value === 'number' && !Number.isInteger(value) ? 2 : 0)))
      const advCard = (id, title, extra, ...children) => h('div', {
        className: 'gp-card gp-adv',
        'data-gp-adv': id,
      },
        h('div', { className: 'k' }, title, extra ? h('span', { className: 'sp' }, extra) : null),
        ...children)
      const advSkel = h(Skel, { h: 62 })
      const advLoading = load.loading || extras.loading

      const advCurrent = load.data?.current ?? null
      const advCtl = numOf(advCurrent?.ctl)
      const advAtl = numOf(advCurrent?.atl)
      const advTsb = numOf(advCurrent?.tsb)
      const advAcwr = numOf(advCurrent?.acwr)
      const advMaxLoad = Math.max(1, advCtl ?? 0, advAtl ?? 0)
      cardNodes.advanced.status = advCard('status', '训练状态',
        advCurrent?.acwrStatus ? acwrText(advCurrent.acwrStatus) : null,
        load.loading && !load.data
          ? advSkel
          : advCurrent
            ? h(React.Fragment, null,
                h('div', { className: 'big' },
                  TRAINING_STATUS_ZH[advCurrent.status] || advCurrent.status || '—',
                  h('small', null, advAcwr !== null ? `ACWR ${fmt(advAcwr, 2)}` : '')),
                h('div', { className: 'bars' },
                  advBar('CTL', advCtl, advMaxLoad, 'var(--gp-violet)'),
                  advBar('ATL', advAtl, advMaxLoad, 'var(--gp-blue)'),
                  advBar('TSB', Math.abs(advTsb ?? 0), advMaxLoad, (advTsb ?? 0) < 0 ? 'var(--gp-amber)' : 'var(--gp-green)')),
                h('div', { className: 'mini' },
                  `急性 ${fmt(advAtl)} · 慢性 ${fmt(advCtl)} · TSB ${fmt(advTsb)}`,
                  advCurrent.acwrStatus ? ` · ${acwrText(advCurrent.acwrStatus)}` : ''))
            : advEmpty(loadLocked ? '账号登录后显示' : '未记录'))

      const advFtp = load.data?.ftp
      const advLactate = load.data?.lactate
      const ftpWatts = numOf(advFtp?.functional_threshold_power_watts, advFtp?.ftp)
      const ltWatts = numOf(advLactate?.functional_threshold_power_watts,
        advLactate?.lactate_threshold_power_watts)
      const ltWkg = numOf(advLactate?.power_to_weight, advLactate?.w_per_kg)
      const thresholdDay = dateOf(advFtp?.date, advFtp?.beginDate, advFtp?.begin_date,
        advLactate?.date, advLactate?.beginDate, load.data?.thresholds?.date)
      const thresholdStale = load.data?.thresholds?.stale === true
        || advFtp?.stale === true || advLactate?.stale === true
        || (thresholdDay ? thresholdDay < shiftDay(snapshotDay, -30) : false)
      cardNodes.advanced.thresholds = advCard('thresholds', '阈值',
        thresholdStale ? '可能过期' : thresholdDay ? shortDay(thresholdDay) : null,
        load.loading && !load.data
          ? advSkel
          : ftpWatts !== null || ltWatts !== null
            ? h(React.Fragment, null,
                h('div', { className: 'big' },
                  ftpWatts !== null ? fmt(ftpWatts) : '—',
                  h('small', null, ftpWatts !== null ? 'W FTP' : 'FTP')),
                h('div', { className: 'mini' },
                  `乳酸阈 ${ltWatts !== null ? `${fmt(ltWatts)} W` : '—'}`,
                  ltWkg !== null ? ` · ${fmt(ltWkg, 2)} W/kg` : ''),
                h('div', { className: 'mini' },
                  thresholdDay ? `数据日期 ${thresholdDay}` : '数据日期未标注'),
                thresholdStale
                  ? h('span', {
                      className: 'gp-pill a',
                      style: { alignSelf: 'flex-start', marginTop: 2 },
                    }, '阈值可能已过期')
                  : null)
            : advEmpty())

      const tolRaw = firstOf(load.data?.tolerance, load.data?.runningTolerance, load.data?.toleranceTrend)
      const tolNum = numOf(tolRaw)
      const tol = tolNum !== null ? { tolerance_km: tolNum } : latestRow(tolRaw)
      const tolKm = numOf(tol?.tolerance_km, tol?.toleranceKm, tol?.tolerance)
      const tolAcute = numOf(tol?.acute_load_km, tol?.acuteLoadKm, tol?.acute_load)
      const tolRatio = numOf(tol?.load_ratio, tol?.loadRatio, tol?.ratio)
      cardNodes.advanced.tolerance = advCard('tolerance', '跑步耐受度',
        tolRatio !== null ? `负荷比 ${fmt(tolRatio, 2)}` : null,
        load.loading && !load.data
          ? advSkel
          : tolKm !== null
            ? h(React.Fragment, null,
                h('div', { className: 'big' }, fmt(tolKm, 1), h('small', null, 'km 可承受')),
                h('div', { className: 'bars' },
                  advBar('负荷', tolRatio !== null ? tolRatio : (tolAcute ?? 0),
                    tolRatio !== null ? 1.5 : Math.max(1, tolAcute ?? 0),
                    tolRatio !== null && tolRatio > 1.2 ? 'var(--gp-amber)' : 'var(--gp-green)')),
                h('div', { className: 'mini' },
                  `急性负荷 ${tolAcute !== null ? `${fmt(tolAcute, 1)} km` : '—'}`))
            : advEmpty())

      const enduranceRaw = firstOf(load.data?.endurance, load.data?.enduranceScore,
        extras.data?.endurance, extras.data?.enduranceScore)
      const hillRaw = firstOf(load.data?.hill, load.data?.hillScore, load.data?.hill_score,
        extras.data?.hill, extras.data?.hillScore)
      const endurance = scoreEntry(enduranceRaw)
      const hill = scoreEntry(hillRaw)
      cardNodes.advanced.endurance = advCard('endurance', '耐力 / 爬坡',
        (endurance?.level || hill?.level)
          ? (LEVEL_ZH[endurance?.level] || LEVEL_ZH[hill?.level]
            || endurance?.level || hill?.level)
          : null,
        advLoading && !load.data && !extras.data
          ? advSkel
          : endurance || hill
            ? h(React.Fragment, null,
                h('div', { className: 'big' },
                  fmt(endurance?.score ?? hill?.score),
                  h('small', null, endurance ? '耐力分' : '爬坡分')),
                h('div', { className: 'mini' },
                  `耐力 ${fmt(endurance?.score)} · 爬坡 ${fmt(hill?.score)}`),
                h('div', { className: 'bars' },
                  advBar('耐力', endurance?.score ?? 0, 100, 'var(--gp-green)'),
                  advBar('爬坡', hill?.score ?? 0, 100, 'var(--gp-amber)')))
            : advEmpty())

      const accliRaw = firstOf(load.data?.acclimation, extras.data?.acclimation,
        extras.data?.heatAcclimation)
      const heatPct = numOf(accliRaw?.heat_acclimation_percent, accliRaw?.heatAcclimationPercent,
        accliRaw?.heat, accliRaw?.percent)
      const heatTrend = firstOf(accliRaw?.heat_trend, accliRaw?.heatTrend, accliRaw?.trend)
      const altitudePct = numOf(accliRaw?.altitude_acclimation_percent,
        accliRaw?.altitudeAcclimationPercent, accliRaw?.altitude)
      cardNodes.advanced.acclimation = advCard('acclimation', '热适应 / 海拔',
        typeof heatTrend === 'string'
          ? (HEAT_TREND_ZH[heatTrend.toUpperCase()] || heatTrend)
          : null,
        advLoading && !load.data && !extras.data
          ? advSkel
          : heatPct !== null || altitudePct !== null
            ? h(React.Fragment, null,
                h('div', { className: 'big' },
                  fmt(heatPct), h('small', null, '% 热适应')),
                h('div', { className: 'bars' },
                  advBar('热', heatPct ?? 0, 100, 'var(--gp-amber)'),
                  advBar('海拔', altitudePct ?? 0, 100, 'var(--gp-blue)')),
                h('div', { className: 'mini' },
                  altitudePct !== null ? `海拔适应 ${fmt(altitudePct)}%` : '海拔适应未记录'))
            : advEmpty())

      const fitnessAge = extras.data?.fitnessAge
      const fitYears = numOf(fitnessAge?.years, fitnessAge?.fitnessAge)
      const fitChrono = numOf(fitnessAge?.chronologicalAge)
      const fitAchievable = numOf(fitnessAge?.achievableFitnessAge)
      const fitDelta = fitYears !== null && fitChrono !== null ? fitYears - fitChrono : null
      cardNodes.advanced.fitnessAge = advCard('fitnessAge', '体能年龄',
        fitnessAge?.lastUpdated ? shortDay(fitnessAge.lastUpdated) : null,
        extras.loading && !extras.data
          ? advSkel
          : fitYears !== null
            ? h(React.Fragment, null,
                h('div', { className: 'big' },
                  fmt(fitYears, 1), h('small', null, '岁')),
                fitDelta !== null
                  ? h('span', {
                      className: `gp-pill ${fitDelta <= 0 ? 'g' : 'a'}`,
                      style: { alignSelf: 'flex-start' },
                    }, fitDelta <= 0 ? `比实际年轻 ${fmt(Math.abs(fitDelta), 1)} 岁`
                      : `比实际年长 ${fmt(fitDelta, 1)} 岁`)
                  : null,
                h('div', { className: 'mini' },
                  `实际 ${fitChrono !== null ? `${fmt(fitChrono)} 岁` : '—'}`,
                  fitAchievable !== null ? ` · 可达 ${fmt(fitAchievable, 1)} 岁` : ''))
            : advEmpty())

      cardNodes.advanced.hrzones = (() => {
        const profile = pickHrZoneProfile(extras.data?.hrZones)
        const rows = hrZoneRowsOf(profile)
        const declaredMax = numOf(profile?.maxHr, profile?.max_hr, profile?.maxHeartRate)
        const zoneCeil = rows.length
          ? Math.max(0, ...rows.map((row) => numOf(row.high, row.low) ?? 0))
          : 0
        const scaleMax = declaredMax !== null && declaredMax > 0
          ? declaredMax
          : (zoneCeil > 0 ? zoneCeil : null)
        return advCard('hrzones', '心率区间',
          declaredMax !== null
            ? `最大心率 ${fmt(declaredMax)} bpm`
            : profile?.method ? String(profile.method) : null,
          extras.loading && !extras.data
            ? advSkel
            : rows.length
              ? h('div', {
                  className: 'gp-hrz',
                  'data-gp-hr-zones': String(rows.length),
                }, rows.map((row, i) => {
                  const base = scaleMax || 1
                  const low = row.low !== null ? row.low : 0
                  const high = row.high !== null ? row.high : base
                  const left = Math.max(0, Math.min(100, (low / base) * 100))
                  const width = Math.max(4, Math.min(100 - left, ((high - low) / base) * 100))
                  return h('div', {
                    key: `z${row.zone}`,
                    className: 'gp-hrz-row',
                    'data-gp-hr-zone': `Z${row.zone}`,
                  },
                    h('span', { className: 'z' }, `Z${row.zone}`),
                    h('div', { className: 'bar' },
                      h('i', {
                        style: {
                          marginLeft: `${left.toFixed(1)}%`,
                          width: `${width.toFixed(1)}%`,
                          background: ZONE_COLORS[i % ZONE_COLORS.length],
                        },
                      })),
                    h('span', { className: 'r' },
                      row.low !== null && row.high !== null
                        ? `${fmt(row.low)}–${fmt(row.high)} bpm`
                        : row.low !== null
                          ? `${fmt(row.low)}+ bpm`
                          : row.high !== null ? `≤${fmt(row.high)} bpm` : '—'))
                }))
              : advEmpty('未获取到心率区间'))
      })()

      sectionNodes.advanced = advanced
        ? section('advanced',
            h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('进阶数据', 'until')),
              h('span', { className: 'hint' }, '训练状态 · 阈值 · 耐受 · 体能年龄'),
              h('span', { className: 'sp' }, snap?.date ?? '')),
            gridFor('advanced', 'gp-grid gp-g3'))
        : null

      /* AI 角色卡片：编辑态每张卡固定一个角色，普通态由 tab 切换 */
      cardNodes.coach.coach = h(CoachCard, {
        api: coachApi, roles: coachRoles, pinned: 'coach', showTabs: false,
        date: selectedDate, reviewing,
      })
      cardNodes.coach.steward = h(CoachCard, {
        api: coachApi, roles: coachRoles, pinned: 'steward', showTabs: false,
        date: selectedDate, reviewing,
      })

      sectionNodes.coach = section('coach',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('AI 健康 · 今日建议')),
          h('span', { className: 'hint', 'data-gp-coach-hint': '1' },
            reviewDay ? `基于 ${reviewDay} 数据 · 手动触发` : '基于今日数据 · 手动触发'),
          h('span', { className: 'sp' }, snap?.date ?? '')),
        editing
          ? h(React.Fragment, null,
              coachRoles.length
                ? h('div', { key: 'tabs', className: 'gp-coach-hd gp-coach-hd-outer' },
                    h(CoachTabs, {
                      roles: coachRoles,
                      tab: coachRoles.includes(coachApi.tab) ? coachApi.tab : coachRoles[0],
                      setTab: coachApi.setTab,
                    }))
                : null,
              gridFor('coach', 'gp-grid gp-coach-cards'))
          : coachRoles.length
            ? h(CoachCard, {
                api: coachApi, roles: coachRoles, date: selectedDate, reviewing,
              })
            : h('div', { className: 'gp-cards-empty' }, '本板块的卡片都已隐藏'))

      /* 活动：平铺卡片（list）+ 月度分布（month），两张卡可各自隐藏 */
      const activityTotal = Math.max(
        numOf(activities.data?.count) ?? 0,
        Array.isArray(activities.data?.activities) ? activities.data.activities.length : 0,
      )
      cardNodes.activities.list = h(ActivityTilesCard, {
        tiles: tileList,
        total: activityTotal,
        loading: activities.loading,
        advanced,
        tracks,
        onOpen: (id) => setDetailId(id),
      })
      cardNodes.activities.month = h(MonthHeatCard, {
        calendar: displayCalendar,
        loading: displayCalendarLoading,
        error: calendar.error || null,
        monthKey: displayMonthKey,
        note: calendarNote,
      })

      /* ---------------- 训练计划（仅 advanced 时挂载） ---------------- */
      const planData = plan.data && typeof plan.data === 'object' ? plan.data : null
      const planLoading = plan.loading && !planData
      const planLocked = planData?.status === 'advanced_required'
      cardNodes.plan.week = h(PlanWeekCard, { data: planData, loading: planLoading, showToast })
      cardNodes.plan.coach = h(PlanCoachCard, { data: planData, loading: planLoading })
      cardNodes.plan.goals = h(PlanGoalsCard, { data: planData, loading: planLoading })
      sectionNodes.plan = advanced
        ? section('plan',
            h('div', { className: 'gp-sec', 'data-gp-plan': '1' },
              h('h2', null, '训练计划'),
              h('span', { className: 'hint' }, '本周课表 · 目标 · 只读，编辑请到 Garmin Connect')),
            planLocked
              ? h('div', { className: 'gp-card', 'data-gp-plan-lock': '1' },
                  h('div', { className: 'gp-deep-muted' },
                    h('b', null, '需要进阶模式'),
                    '：训练计划来自 Garmin 账号登录，官方 Personal API 不提供。'),
                  h('div', { className: 'gp-deep-muted', 'data-gp-plan-lock-note': '1' },
                    '训练计划需要进阶模式（Garmin 登录），或直接在 Garmin Connect 查看'),
                  h(UnlockCard, { flow: unlock, id: 'plan-section', compact: true, hint: '训练计划' }))
              : gridFor('plan', 'gp-grid gp-g2'))
        : null

      sectionNodes.activities = section('activities',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('最近活动', 'until')),
          h('span', { className: 'hint' }, '近 30 天 · 月度分布'),
          h('span', { className: 'sp' }, activities.data ? `共 ${fmt(activityTotal)} 条` : '')),
        gridFor('activities', 'gp-grid gp-act-grid'))

      /* 计划 · 装备 · 身体：5 张卡，身体成分合并体重 / 体脂 / 肌肉量 */
      const weighRows = Array.isArray(extras.data?.weighIns)
        ? extras.data.weighIns.filter((w) => w && typeof w.weight_kg === 'number')
        : []
      const latestWeigh = weighRows.length ? weighRows[weighRows.length - 1] : null
      const earliestWeigh = weighRows.length ? weighRows[0] : null
      const weightDelta = latestWeigh && earliestWeigh && weighRows.length > 1
        ? latestWeigh.weight_kg - earliestWeigh.weight_kg
        : null
      const nutrition = extras.data?.nutrition || null

      cardNodes.extras.plan = gated
        ? h(UnlockCard, { flow: unlock, id: 'plan', hint: '本周安排 · 装备' })
        : h('div', { className: 'gp-card' },
            h('h3', null, '本周安排'),
            extras.loading
              ? h(Skel, { h: 60 })
              : extras.data?.workouts && typeof extras.data.workouts.count === 'number'
                ? h('div', { className: 'gp-mini' },
                    `共 ${extras.data.workouts.count} 个已排课 · ${extras.data.week.start} → ${extras.data.week.end}`)
                : h('div', { className: 'gp-empty' }, h('b', null, '本周无排课')))

      cardNodes.extras.gear = h('div', { className: 'gp-card' },
        h('h3', null, '装备'),
        extras.loading
          ? h(Skel, { h: 60 })
          : extras.data?.gear?.length
            ? extras.data.gear.map((g) =>
                h('div', { key: g.uuid, style: { display: 'flex', justifyContent: 'space-between', marginTop: 4 } },
                  h('span', { className: 'gp-mini' }, g.full_name || g.name),
                  h('b', null, g.max_distance_km ? `${fmt(g.max_distance_km, 1)} km` : '')))
            : h('div', { className: 'gp-empty' }, h('b', null, gated ? '账号登录后显示装备' : '没有登记装备')))

      cardNodes.extras.devices = h('div', { className: 'gp-card' },
        h('h3', null, '设备'),
        extras.loading
          ? h(Skel, { h: 60 })
          : extras.data?.devices?.length
            ? extras.data.devices.map((d) =>
                h('div', { key: d.device_id, style: { display: 'flex', justifyContent: 'space-between', marginTop: 4 } },
                  h('span', { className: 'gp-mini' }, d.device_name),
                  h('span', { className: 'gp-tag' }, deviceKind(d.device_name))))
            : gated
              ? h('div', { className: 'gp-empty' }, h('b', null, '账号登录后显示设备'))
              : h('div', { className: 'gp-empty' }, h('b', null, '没有设备')))

      /* 身体成分：/extras 的 bodyComp 优先，缺失时退回最近一次称重；
         五项指标固定成 3 列网格，缺值显示「未记录」而不是消失 */
      const bodyCompRaw = extras.data?.bodyComp && typeof extras.data.bodyComp === 'object'
        ? extras.data.bodyComp
        : null
      const bcomp = bodyCompRaw || latestWeigh
      const bcompWeight = numOf(bcomp?.weight_kg, bcomp?.weightKg)
      const bcompMetrics = [
        { key: 'fat', label: '体脂率', value: numOf(bcomp?.body_fat_percent, bcomp?.bodyFatPercent), unit: '%' },
        { key: 'muscle', label: '肌肉量', value: numOf(bcomp?.muscle_mass_kg, bcomp?.muscleMassKg), unit: 'kg' },
        { key: 'bone', label: '骨量', value: numOf(bcomp?.bone_mass_kg, bcomp?.boneMassKg), unit: 'kg' },
        { key: 'water', label: '体水分', value: numOf(bcomp?.body_water_percent, bcomp?.bodyWaterPercent), unit: '%' },
        { key: 'bmi', label: 'BMI', value: numOf(bcomp?.bmi), unit: '' },
      ]
      const bcompDay = dateOf(bcomp?.date, bcomp?.measuredAt, bcomp?.measured_at)

      cardNodes.extras.bodycomp = h('div', { className: 'gp-card', 'data-gp-bodycomp-card': '1' },
        h('h3', null, '身体成分'),
        extras.loading && !extras.data
          ? h(Skel, { h: 60 })
          : bcomp
            ? h('div', null,
                h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 6 } },
                  h('div', { style: { fontSize: 24, fontWeight: 700 } }, fmt(bcompWeight, 1)),
                  h('small', { style: { fontSize: 11, color: 'var(--gp-t3)' } }, 'kg'),
                  weightDelta !== null
                    ? h('span', {
                        className: `delta ${weightDelta < 0 ? 'good' : weightDelta > 0 ? 'bad' : 'flat'}`,
                        style: { fontSize: 10.5, fontWeight: 650 },
                      }, `${weightDelta < 0 ? '↓' : weightDelta > 0 ? '↑' : ''}${fmt(Math.abs(weightDelta), 1)}`)
                    : null),
                h('div', { className: 'gp-bcomp' }, bcompMetrics.map((metric) => h('div', {
                  key: metric.key,
                  className: 'cell',
                  'data-gp-bcomp': metric.key,
                },
                  h('div', { className: 'lb' }, metric.label),
                  metric.value !== null
                    ? h('div', { className: 'vl' },
                        fmt(metric.value, 1),
                        metric.unit ? h('small', null, metric.unit) : null)
                    : h('div', { className: 'vl none' }, '未记录')))),
                h('div', { className: 'gp-bcomp-foot' },
                  bcompDay ? `记录于 ${bcompDay}` : '未记录测量日期',
                  weighRows.length > 1 ? ` · 共 ${weighRows.length} 次称重` : ''))
            : h('div', { className: 'gp-empty' }, h('b', null, '暂无体重记录')))

      cardNodes.extras.nutrition = h(NutritionCard, {
        nutrition,
        version,
        date: selectedDate,
        reviewing,
        showToast,
      })

      sectionNodes.extras = section('extras',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('计划 · 装备 · 身体'))),
        gridFor('extras', 'gp-grid gp-g3 gp-grid-top'))

      sectionNodes.records = section('records',
        h('div', { className: 'gp-sec' }, h('h2', null, '个人记录')),
        h('div', { className: 'gp-card', style: { padding: '4px 8px 8px' } },
          extras.loading
            ? h(Skel, { h: 100 })
            : extras.data?.records?.length
              ? h('table', { className: 'gp-table' },
                  h('thead', null, h('tr', null, ['项目', '成绩', '日期'].map((t) => h('th', { key: t }, t)))),
                  h('tbody', null, extras.data.records.map((r, i) =>
                    h('tr', { key: i },
                      h('td', { className: 'gp-tname' }, recordZh(r.record_type)),
                      h('td', { className: 'n' }, r.value),
                      h('td', { className: 'n' }, r.date)))))
              : h('div', { className: 'gp-empty' }, h('b', null, '没有个人记录'))))

      /* 按 layout 顺序组装区块描述：{ id, label, node }，隐藏的不挂载、不请求 */
      const sections = layout.flatMap((row) => {
        const node = sectionNodes[row.id]
        if (row.visible === false || !node || !sectionAvailable(row.id)) return []
        const meta = SECTION_META[row.id] || { id: row.id, label: row.id, hint: '' }
        return [{ id: row.id, label: meta.label, hint: meta.hint || '', node }]
      })

      const hiddenSections = layout
        .filter((row) => row.visible === false && sectionNodes[row.id] && sectionAvailable(row.id))
        .map((row) => {
          const meta = SECTION_META[row.id] || { id: row.id, label: row.id }
          return { id: row.id, label: meta.label }
        })

      /* 拖拽时在插入位置渲染等高的虚线占位；drop 后立即写回布局 */
      const slots = []
      sections.forEach((item, index) => {
        if (editing && drag.id && drag.at === index) {
          slots.push(h(SlotGhost, {
            key: `ghost-${index}`,
            height: drag.height,
            onDragOver: overGhost,
            onDrop: (e) => dropAt(e, index),
          }))
        }
        slots.push(h(SectionSlot, {
          key: item.id,
          id: item.id,
          label: item.label,
          node: item.node,
          editing,
          index,
          draggingId: drag.id,
          onDragStart: beginDrag,
          onDragOver: overSlot,
          onDrop: dropSlot,
          onDragEnd: endDrag,
          onRemove: removeSection,
        }))
      })
      if (editing && drag.id && drag.at === sections.length) {
        slots.push(h(SlotGhost, {
          key: 'ghost-end',
          height: drag.height,
          onDragOver: overGhost,
          onDrop: (e) => dropAt(e, sections.length),
        }))
      }

      /* 拖到底部添加区也视为「放到最后」 */
      const overTail = (e) => {
        if (!dragIdRef.current) return
        e.preventDefault()
        if (dragAtRef.current !== sections.length) {
          dragAtRef.current = sections.length
          setDrag((d) => (d.id ? { ...d, at: sections.length } : d))
        }
      }
      const dropTail = (e) => dropAt(e, sections.length)

      /* 路书工坊：整页次级视图，仪表盘整棵卸载（不保留隐藏 DOM） */
      if (workshopOpen) {
        return h('div', { className: 'gp-root', 'data-gp-workshop': '1' },
          h('style', null, CSS),
          h('div', { className: 'gp-wrap' },
            h('div', { className: 'gp-top' },
              h('div', { className: 'gp-title' },
                '路书工坊',
                h('span', { className: 'gp-badge' }, 'ROUTE WORKSHOP')),
              h('div', { className: 'gp-right' },
                h('button', {
                  type: 'button',
                  className: 'gp-btn gp-rb-back',
                  onClick: () => setWorkshopOpen(false),
                  'data-gp-workshop-back': '1',
                }, '← 返回面板'))),
            h(RouteWorkshop, {
              showToast,
              statusVersion: roadbookVersion,
              onOpenSettings: openAccountFromWorkshop,
            })),
          toast ? h('div', { className: `gp-toast is-workshop ${toast.kind}` }, toast.msg) : null)
      }

      return h('div', { className: `gp-root${editing ? ' is-editing' : ''}` },
        h('style', null, CSS),
        h('div', { className: 'gp-wrap' },
          /* 顶栏 */
          h('div', { className: 'gp-top' },
            h('div', { className: 'gp-title' }, '佳明助手', h('span', { className: 'gp-badge' }, 'GARMIN ASSISTANT')),
            /* 回看日期导航：只在仪表盘顶栏，路书工坊整页不渲染 */
            h(DateNav, {
              selectedDate,
              todayDate,
              onPick: pickDate,
              onToday: goToday,
              keyboardEnabled: detailId == null && !accountOpen && !onboardPreview && !deviceOpen,
            }),
            h('div', { className: 'gp-right' },
              h('span', { className: 'gp-status' },
                h('span', { className: `gp-dot${unauth ? ' bad' : needsAttention ? ' warn' : ''}` }),
                unauth ? '未认证' : needsAttention ? '需检查' : snapshot.loading ? '同步中' : '已连接'),
              gated
                ? null
                : h('div', { className: 'gp-dev-anchor', ref: deviceAnchor },
                    h('button', {
                      className: `gp-btn dev${deviceOpen ? ' on' : ''}`,
                      onClick: () => setDeviceOpen((v) => !v),
                      title: 'Garmin 设备',
                      'aria-haspopup': 'dialog',
                      'aria-expanded': deviceOpen,
                    },
                      h('span', { 'aria-hidden': true }, '⌚'),
                      '设备',
                      deviceList ? h('span', { className: 'n' }, String(deviceList.length)) : null),
                    deviceOpen
                      ? h(DevicePopover, {
                          list: deviceList,
                          loading: devices.loading,
                          error: devices.error,
                          latest: devices.data?.latest,
                          version: deviceVersion,
                          anchorRef: deviceAnchor,
                          onRefresh: () => setDeviceVersion((v) => v + 1),
                          onClose: () => setDeviceOpen(false),
                        })
                      : null),
              h('button', { className: 'gp-btn', onClick: refresh }, refreshing ? '刷新中…' : '↻ 刷新'),
              h('button', {
                type: 'button',
                className: 'gp-btn gp-rb-entry',
                onClick: () => setWorkshopOpen(true),
                title: '路书工坊',
                'data-gp-workshop-open': '1',
              },
                h('svg', {
                  width: 13,
                  height: 13,
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  'aria-hidden': true,
                },
                  h('path', {
                    d: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z',
                    stroke: 'currentColor',
                    strokeWidth: 1.6,
                    strokeLinejoin: 'round',
                  }),
                  h('path', {
                    d: 'M9 4v14M15 6v14',
                    stroke: 'currentColor',
                    strokeWidth: 1.2,
                    opacity: 0.55,
                  })),
                '路书工坊'),
              h('button', {
                className: 'gp-btn gp-account-btn',
                onClick: () => setAccountOpen(true),
                title: needsAttention ? '账号设置 · 有需要检查的项目' : '账号设置',
                'aria-haspopup': 'dialog',
                'aria-expanded': accountOpen,
                'data-gp-account-open': '1',
              },
                h('span', { 'aria-hidden': true }, '⚙'),
                '账号设置',
                needsAttention
                  ? h('span', {
                      className: 'adot',
                      title: '有需要检查的项目',
                      'data-gp-account-dot': '1',
                    })
                  : null),
              h('button', {
                ref: layoutBtn,
                className: `gp-btn${editing ? ' on' : ''}`,
                onClick: toggleEditing,
                title: editing ? '完成个性化' : '个性化布局',
                'aria-pressed': editing,
                'data-gp-edit-toggle': editing ? 'done' : 'edit',
              }, editing ? '✓ 完成' : '⚙ 个性化'))),

          /* 回看横幅：贴在顶栏下方，可关闭；「回到今天」把所有日级数据恢复成实时值 */
          reviewing && !reviewBannerHidden
            ? h('div', {
                className: 'gp-banner gp-review-banner',
                role: 'status',
                'data-gp-review-banner': '1',
                'data-gp-review-date': selectedDate,
              },
                h('span', { className: 'ic', 'aria-hidden': true }, '↺'),
                h('span', { className: 'txt', 'data-gp-review-text': '1' },
                  `正在回看 ${shortDay(selectedDate)}（${dayWeekday(selectedDate)}）的数据`),
                h('span', { className: 'sp' },
                  h('span', { className: 'dot', 'aria-hidden': true }, '·'),
                  h('button', {
                    className: 'gp-btn',
                    type: 'button',
                    'data-gp-review-reset': '1',
                    onClick: goToday,
                  }, '回到今天'),
                  h('button', {
                    className: 'x',
                    type: 'button',
                    title: '关闭提示',
                    'aria-label': '关闭回看提示',
                    'data-gp-review-dismiss': '1',
                    onClick: () => setReviewBannerHidden(true),
                  }, '✕')))
            : null,

          toast ? h('div', { className: `gp-toast ${toast.kind}` }, toast.msg) : null,
          snapshot.error ? h('div', { className: 'gp-err' }, `数据加载失败：${snapshot.error}`) : null,
          authBroken && !bannerDismissed
            ? h('div', {
                className: 'gp-banner',
                role: 'status',
                'data-gp-auth-banner': '1',
              },
                h('span', { className: 'ic', 'aria-hidden': true }, '!'),
                h('span', null, 'Garmin 授权可能已过期'),
                h('span', { className: 'sp' },
                  h('button', {
                    className: 'gp-btn',
                    type: 'button',
                    'data-gp-banner-open': '1',
                    onClick: () => setAccountOpen(true),
                  }, '打开账号设置'),
                  h('button', {
                    className: 'x',
                    type: 'button',
                    title: '关闭提醒',
                    'aria-label': '关闭提醒',
                    'data-gp-banner-close': '1',
                    onClick: () => setBannerDismissed(true),
                  }, '✕')))
            : null,
          unauth && gated && snap?.message
            ? h('div', { className: 'gp-empty', style: { marginTop: 8 } },
                h('b', null, '官方数据暂不可用'), '：', snap.message)
            : null,

          unauth && !gated ? h(LoginView, { onAuthed: refresh }) : null,
          ...slots,

          editing
            ? h(AddZone, {
                hidden: hiddenSections,
                onAdd: addSection,
                onDragOver: overTail,
                onDrop: dropTail,
              })
            : null,

          /* 页脚：任何时候都能重看新手引导（只预览，不动已保存的连接） */
          h('div', { className: 'gp-foot' },
            h('span', null, 'Garmin Connect 同步'),
            h('span', null, '只读面板 · 写操作请在对话里完成'),
            h('button', {
              type: 'button',
              className: 'gp-foot-link',
              'data-gp-onboard-open': 'footer',
              onClick: openOnboarding,
            }, '重看新手引导'),
            h('span', null, `更新于 ${snap?.updatedAt ? new Date(snap.updatedAt).toLocaleTimeString('zh-CN') : '—'}`))),
        editing
          ? h(EditBar, { onReset: resetLayout, onDone: exitEdit, onOnboard: openOnboarding })
          : null,
        detailId != null
          ? h(ActivityDrawer, {
              key: detailId,
              id: detailId,
              onClose: () => setDetailId(null),
              showToast,
              flow: unlock,
              gated,
              version,
            })
          : null,
        onboardPreview
          ? h(Onboarding, {
              flow: unlock,
              preview: true,
              alreadyConnected: setupMode !== 'none' || onboarded,
              onClose: () => setOnboardPreview(false),
              onSaved: keySaved,
            })
          : null,
        accountOpen
          ? h(AccountModal, {
              account: acct,
              setup: setupData,
              advanced,
              flow: unlock,
              gender: effectiveGender,
              onGenderSave: saveGender,
              onClose: () => setAccountOpen(false),
              onReload: reload,
              refresh,
              showToast,
              onRoadbookChanged: bumpRoadbook,
            })
          : null)
    }


    function PanelIcon(props) {
      const size = props?.size || 18
      return h('svg', { viewBox: '0 0 64 64', width: size, height: size, 'aria-hidden': true },
        h('defs', null,
          h('clipPath', { id: 'gp-ic-round' },
            h('rect', { x: 0, y: 0, width: 64, height: 64, rx: 14 }))),
        h('g', { clipPath: 'url(#gp-ic-round)' },
          h('rect', { width: 64, height: 64, fill: '#3b3b3b' }),
          h('path', { d: 'M0 0H64V7.4L0 27.2Z', fill: '#4ea8e8' }),
          h('g', { transform: 'translate(0 24.44) rotate(-17) scale(1.25 1)' },
            h('text', {
              x: 5.65, y: 0, fontFamily: 'Helvetica,Arial,sans-serif',
              fontSize: 8.3, fontWeight: 800, letterSpacing: 0.6, fill: '#3b3b3b',
            }, 'GARMIN'),
            h('text', {
              x: 42.41, y: 0.8, fontFamily: 'Helvetica,Arial,sans-serif',
              fontSize: 1.7, fontWeight: 700, fill: '#3b3b3b',
            }, '®')),
          h('circle', { cx: 31.9, cy: 41, r: 14.6, fill: 'none', stroke: '#4ea8e8', strokeWidth: 5.2 }),
          h('rect', { x: 13, y: 39.15, width: 7.6, height: 3.9, fill: '#3b3b3b' }),
          h('rect', { x: 43, y: 35.5, width: 21, height: 11.25, fill: '#3b3b3b' })))
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(
          () => ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL }, Page)),
          'garmin-panel: page',
        )
        ctx.effect(
          () => ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register({ name: 'sidebar.panellist', id: PANEL, order: 20, label: () => '佳明助手' }, PanelIcon)),
          'garmin-panel: sidebar entry',
        )
      },
    }
  },
})
