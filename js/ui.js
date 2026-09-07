/* eReturn Demo — ছোট UI হেল্পার (ফর্ম বাইন্ডিং, কার্ড, টেবিল) */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function get(obj, path) {
    return path.split('.').reduce((o, k) => {
      if (o === null || o === undefined) return undefined;
      const m = k.match(/^(\w+)\[(\d+)\]$/);
      return m ? (o[m[1]] || [])[+m[2]] : o[k];
    }, obj);
  }

  function set(obj, path, val) {
    const parts = path.split('.');
    let o = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const m = parts[i].match(/^(\w+)\[(\d+)\]$/);
      if (m) { o[m[1]] = o[m[1]] || []; o = o[m[1]][+m[2]] = o[m[1]][+m[2]] || {}; }
      else { o = o[parts[i]] = o[parts[i]] || {}; }
    }
    const last = parts[parts.length - 1];
    const m = last.match(/^(\w+)\[(\d+)\]$/);
    if (m) { o[m[1]] = o[m[1]] || []; o[m[1]][+m[2]] = val; }
    else o[last] = val;
  }

  function helpIcon(key) {
    if (!key || !FieldHelp[key]) return '';
    return '<span class="help" data-help="' + esc(key) + '" title="ব্যাখ্যা দেখুন">?</span>';
  }

  /* একটি সাধারণ ইনপুট ফিল্ড */
  function field(o) {
    const id = 'f_' + Math.random().toString(36).slice(2, 9);
    const type = o.type || 'money';
    let inner = '';
    const path = o.path ? ' data-path="' + esc(o.path) + '"' : '';
    const ro = o.readonly ? ' readonly' : '';
    const val = o.value !== undefined ? o.value : '';

    if (type === 'select') {
      inner = '<select' + path + ro + '>' +
        (o.options || []).map(op => {
          const v = typeof op === 'string' ? op : op.v;
          const t = typeof op === 'string' ? op : op.t;
          return '<option value="' + esc(v) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>';
        }).join('') + '</select>';
    } else if (type === 'radio') {
      inner = '<div class="inline">' + (o.options || []).map(op => {
        const v = typeof op === 'string' ? op : op.v;
        const t = typeof op === 'string' ? op : op.t;
        return '<label><input type="radio" name="' + id + '"' + path + ' value="' + esc(v) + '"' +
          (String(val) === String(v) ? ' checked' : '') + '> ' + esc(t) + '</label>';
      }).join('') + '</div>';
    } else if (type === 'checkbox') {
      // ? আইকনটা label-এর বাইরে রাখা হয়েছে — নাহলে ক্লিকে চেকবক্সও টগল হয়ে যায়
      return '<span class="chk-row">' +
        '<label class="chk"><input type="checkbox"' + path + (val ? ' checked' : '') + '>' +
        '<span class="chk-t">' + esc(o.label) + '</span></label>' +
        helpIcon(o.help) + '</span>';
    } else if (type === 'text') {
      inner = '<input type="text"' + path + ro + ' value="' + esc(val) + '" placeholder="' + esc(o.placeholder || '') + '">';
    } else { // money / number
      inner = '<input type="text" class="num' + (o.calc ? ' calc' : '') + '"' + path + ro +
        (o.calc ? ' data-calc="' + esc(o.calc) + '"' : '') +
        ' value="' + esc(val === 0 && o.blankZero ? '' : val) + '" inputmode="numeric">';
    }
    return '<div class="field">' +
      (o.label ? '<label>' + esc(o.label) + helpIcon(o.help) + '</label>' : '') +
      inner +
      (o.hint ? '<div class="small muted" style="margin-top:4px">' + o.hint + '</div>' : '') +
      '</div>';
  }

  function card(title, body, helpKey) {
    return '<div class="card">' +
      (title ? '<h2>' + esc(title) + helpIcon(helpKey) + '</h2>' : '') + body + '</div>';
  }

  /* গণনা করা লাইনের টেবিল */
  function calcTable(rows, opts) {
    const o = opts || {};
    let h = '<table class="calc">';
    if (o.head) h += '<thead><tr><th>' + esc(o.head[0]) + '</th><th style="text-align:right">' + esc(o.head[1]) + '</th></tr></thead>';
    h += '<tbody>';
    rows.forEach(r => {
      if (!r) return;
      const cls = r.cls ? ' class="' + r.cls + '"' : '';
      h += '<tr' + cls + '><td>' + r.label + (r.help ? helpIcon(r.help) : '') + '</td>' +
        '<td class="amt">' + (r.raw !== undefined ? r.raw : TaxCalc.fmt(r.value)) + '</td></tr>';
    });
    return h + '</tbody></table>';
  }

  /* সারি যোগ/বাদ দেওয়া যায় এমন টেবিল */
  function dynTable(cfg) {
    // cfg: {title, help, path, cols:[{key,label,type,options,readonly,help,width}], rows:[], addLabel, total}
    let h = '<div class="tbl-head"><b>' + esc(cfg.title || '') + '</b>' + helpIcon(cfg.help) + '<span class="spacer"></span>' +
      '<button class="btn ghost" data-add="' + esc(cfg.path) + '">+ ' + esc(cfg.addLabel || 'Add') + '</button></div>';
    h += '<div class="tbl-wrap"><table class="dt"><thead><tr><th style="width:34px"></th>' +
      cfg.cols.map(c => '<th' + (c.width ? ' style="width:' + c.width + '"' : '') + '>' + esc(c.label) + helpIcon(c.help) + '</th>').join('') +
      '<th style="width:40px"></th></tr></thead><tbody>';
    if (!cfg.rows.length) {
      h += '<tr><td colspan="' + (cfg.cols.length + 2) + '" class="muted" style="padding:14px;text-align:center">কোনো সারি নেই — "+ ' +
        esc(cfg.addLabel || 'Add') + '" চাপুন।</td></tr>';
    }
    cfg.rows.forEach((row, i) => {
      h += '<tr><td class="muted">' + (i + 1) + '</td>';
      cfg.cols.forEach(c => {
        const p = cfg.path + '[' + i + '].' + c.key;
        const v = row[c.key] === undefined ? '' : row[c.key];
        if (c.type === 'select') {
          h += '<td><select data-path="' + esc(p) + '">' + (c.options || []).map(op => {
            const ov = typeof op === 'string' ? op : op.v, ot = typeof op === 'string' ? op : op.t;
            return '<option value="' + esc(ov) + '"' + (String(v) === String(ov) ? ' selected' : '') + '>' + esc(ot) + '</option>';
          }).join('') + '</select></td>';
        } else if (c.type === 'text') {
          h += '<td><input type="text" data-path="' + esc(p) + '" value="' + esc(v) + '"></td>';
        } else if (c.type === 'readonly') {
          h += '<td><input type="text" class="num" readonly data-calc="' + esc(c.calc || '') + '" data-idx="' + i + '" value=""></td>';
        } else {
          h += '<td><input type="text" class="num" inputmode="numeric" data-path="' + esc(p) + '" value="' + esc(v === 0 ? '' : v) + '"></td>';
        }
      });
      h += '<td><button class="icon-btn" data-del="' + esc(cfg.path) + '" data-i="' + i + '" title="মুছুন">&#128465;</button></td></tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  function pageActions(extra) {
    return '<div class="page-actions">' +
      '<button class="btn" data-nav="back">&larr; Back</button>' +
      '<span class="spacer"></span>' + (extra || '') +
      '<button class="btn wide" data-nav="next">Save &amp; Continue &rarr;</button></div>';
  }

  global.UI = { esc, get, set, field, card, calcTable, dynTable, helpIcon, pageActions };
})(window);
