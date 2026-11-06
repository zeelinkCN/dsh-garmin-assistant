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

