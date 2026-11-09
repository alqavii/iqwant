/* Shared answer-review table used by every test page.
   IQReview.mount(container, { title, summary, cols: [{key, label, mono}], rows: [{...cells, ok: true|false|null, note}] })
   ok: true = right, false = wrong, null = neutral (e.g. skipped / not scored). */
(function () {
  const css = `
  .iqr { margin-top: 24px; border: 1px solid var(--border, #1f232c); border-radius: 10px; background: var(--surface-card, #0d0f13); padding: 18px; }
  .iqr-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }
  .iqr-head h3 { font-size: 1rem; font-weight: 600; margin: 0; color: var(--text, #ededed); }
  .iqr-sum { font-size: .85rem; color: var(--text-muted, #848b98); margin-bottom: 10px; }
  .iqr-f { display: flex; gap: 6px; }
  .iqr-f button { font: 500 .75rem 'JetBrains Mono', monospace; padding: 5px 10px; border-radius: 5px; border: 1px solid var(--border-hover, #2d3340); background: transparent; color: var(--text-muted, #848b98); cursor: pointer; }
  .iqr-f button.on { background: var(--text, #ededed); color: var(--bg, #090a0d); }
  .iqr-wrap { overflow-x: auto; max-height: 520px; overflow-y: auto; }
  .iqr table { width: 100%; border-collapse: collapse; font-size: .82rem; margin: 0; }
  .iqr th, .iqr td { padding: 8px 10px; border-bottom: 1px solid var(--border, #1f232c); text-align: left; vertical-align: top; color: var(--text, #ededed); border-left: none; border-right: none; border-top: none; font-family: inherit; }
  .iqr th { position: sticky; top: 0; background: var(--surface, #101217); color: var(--text-dim, #4f5664); font: 600 .68rem 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: .05em; }
  .iqr td.m { font-family: 'JetBrains Mono', monospace; }
  .iqr tr.ok td:first-child { box-shadow: inset 3px 0 0 var(--green, #2fa872); }
  .iqr tr.bad td:first-child { box-shadow: inset 3px 0 0 var(--red, #df4a56); }
  .iqr tr.neu td:first-child { box-shadow: inset 3px 0 0 var(--text-dim, #4f5664); }
  .iqr .res-ok { color: var(--green, #2fa872); } .iqr .res-bad { color: var(--red, #df4a56); } .iqr .res-neu { color: var(--text-dim, #4f5664); }
  .iqr .note { color: var(--text-muted, #848b98); font-size: .78rem; margin-top: 3px; }
  .iqr-empty { color: var(--text-muted, #848b98); font-size: .85rem; padding: 10px 0; }`;
  function inject() { if (document.getElementById('iqr-css')) return; const s = document.createElement('style'); s.id = 'iqr-css'; s.textContent = css; document.head.appendChild(s); }
  function esc(v) { return v === undefined || v === null ? '–' : String(v); }
  function mount(el, opts) {
    inject();
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    const rows = opts.rows || [];
    const scored = rows.filter(r => r.ok === true || r.ok === false);
    const wrong = rows.filter(r => r.ok === false).length;
    let filter = 'all';
    el.innerHTML = `<div class="iqr"><div class="iqr-head"><h3>${opts.title || 'Review your answers'}</h3>
      <div class="iqr-f"><button data-f="all" class="on">All (${rows.length})</button><button data-f="bad">Missed (${wrong + rows.filter(r => r.ok === null).length})</button></div></div>
      ${opts.summary ? `<div class="iqr-sum">${opts.summary}</div>` : scored.length ? `<div class="iqr-sum">${scored.length - wrong} of ${scored.length} right.</div>` : ''}
      <div class="iqr-wrap"><table><thead><tr><th>#</th>${opts.cols.map(c => `<th>${c.label}</th>`).join('')}<th>Result</th></tr></thead><tbody></tbody></table></div></div>`;
    const tb = el.querySelector('tbody');
    function draw() {
      const list = rows.map((r, i) => [r, i]).filter(([r]) => filter === 'all' || r.ok !== true);
      tb.innerHTML = list.length ? list.map(([r, i]) => {
        const cls = r.ok === true ? 'ok' : r.ok === false ? 'bad' : 'neu';
        const res = r.result || (r.ok === true ? '✓' : r.ok === false ? '✗' : '–');
        return `<tr class="${cls}"><td class="m">${i + 1}</td>${opts.cols.map(c => `<td class="${c.mono ? 'm' : ''}">${esc(r[c.key])}</td>`).join('')}<td class="res-${cls}">${res}${r.note ? `<div class="note">${r.note}</div>` : ''}</td></tr>`;
      }).join('') : `<tr><td colspan="${opts.cols.length + 2}" class="iqr-empty">${filter === 'bad' ? 'Nothing missed.' : 'Nothing to review yet.'}</td></tr>`;
    }
    el.querySelectorAll('.iqr-f button').forEach(b => b.onclick = () => { filter = b.dataset.f; el.querySelectorAll('.iqr-f button').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    draw();
  }
  window.IQReview = { mount };
})();
