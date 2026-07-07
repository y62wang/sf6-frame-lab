// Shared Okizeme setup renderer. Consumed by the Okizeme calculator and the
// Combo Finder slide-out panel. Data lives in data/oki-<slug>.js as
// window.OKI_DATA[slug] = {advMin, advMax, table:{adv:{sj,sh,m}}}.
(function(){
  function advCls(n){return n>=3?'pos':(n>=0?'even':'neg');}
  function sgn(n){return (n>=0?'+':'')+n;}
  function lookup(slug,v){
    const data=(window.OKI_DATA||{})[slug];
    if(!data) return null;
    v=Math.max(data.advMin,Math.min(data.advMax,v));
    return {v:v, d:(data.table[v]||{m:[],sj:{},sh:[]})};
  }
  function sjHTML(d){
    const sj=Object.keys(d.sj||{});
    return sj.length ? sj.map(k=>"<span class='badge sj-exact'>"+k.replace('vs_','SJ vs ').replace('empty_jump','empty jump')+" ("+d.sj[k]+")</span>").join('')
                     : "<span class='badge sj-no'>no safe jump</span>";
  }
  function tableHTML(d,v){
    let rows=(d.m||[]).map(s=>{
      const drive=s.dr?"<span class='tag drive'>DR</span>":"";
      const best=s.best?"<span class='tag best'>&#9733; best</span>":"";
      const man=s.auto?"":" <span class='man'>manual</span>";
      const nm=s.nm?"<div class='mv-name'>"+s.nm+"</div>":"";
      const posCell=s.p==='both'?"<td class='pos-col'><span class='tag pos-both'>midscreen</span></td>":"<td class='pos-col'><span class='tag pos-corner'>corner</span></td>";
      const base=s.ob-s.g;
      const plus=s.g>0?"<td class='plus-col detail-col'><span class='star'>&#9733;+"+s.g+"</span></td>":"<td class='plus-col detail-col dim'>&mdash;</td>";
      const ob=s.g>0
        ?"<td class='detail-col ob-cell'><span class='ob-base'>"+sgn(base)+"</span><span class='ob-arrow'>&rarr;</span><span class='"+advCls(s.ob)+" ob-final'>"+sgn(s.ob)+"</span></td>"
        :"<td class='"+advCls(s.ob)+" detail-col ob-cell'>"+sgn(s.ob)+"</td>";
      const tyslug={'plus frame':'plus','meaty':'meaty','safe jump':'sj','empty jump':'ej','shimmy':'shimmy'}[s.ty]||'meaty';
      const ty="<td class='type'><span class='ty ty-"+tyslug+"'>"+s.ty+"</span></td>";
      if(s.kind==='jump'){
        const note=s.ty==='safe jump'?"blocks reversal on landing, meaty jump-in if they don't":"land into throw / low; NOT reversal-safe";
        return "<tr class='meaty-row jump-row' data-kind='jump' data-pos='both' data-drive='0' data-auto='"+s.auto+"' data-type='"+tyslug+"'>"
          +"<td class='dim'>"+s.f+man+", then jump attack</td>"
          +"<td class='mv'>"+s.m+"</td>"+ty+"<td class='pos-col'><span class='tag pos-both'>midscreen</span></td>"
          +"<td class='k'>&mdash;</td><td class='exec-adv'>+"+(v-s.ft)+"</td><td class='arrow detail-col'>&rarr;</td>"
          +"<td class='dim detail-col' colspan='4'>"+note+"</td></tr>";
      }
      return "<tr class='meaty-row"+(s.best?' is-best':'')+"' data-kind='"+s.kind+"' data-pos='"+s.p+"' data-drive='"+s.dr+"' data-auto='"+s.auto+"' data-type='"+tyslug+"'>"
        +"<td class='dim'>"+s.f+man+"</td>"
        +"<td class='mv'>"+s.m+" <span class='tag kind-"+s.kind+"'>"+({normal:'N',command:'cmd',special:'sp',drive:'DRC'}[s.kind]||s.kind)+"</span>"+drive+best+nm+"</td>"
        +ty+posCell+"<td class='k'>active frame "+s.k+"</td>"
        +"<td class='exec-adv'>+"+(v-s.ft)+"</td><td class='arrow detail-col'>&rarr;</td>"
        +"<td class='"+advCls(s.oh)+" detail-col'>"+sgn(s.oh)+"</td>"
        +"<td class='"+advCls(s.ch)+" detail-col'>"+sgn(s.ch)+"</td>"
        +plus+ob+"</tr>";
    }).join('');
    (d.sh||[]).forEach(o=>{
      const fk=(o.fk&&o.fk.length)?o.fk.join(' + ')+", ":"";
      const man=o.auto?"":" <span class='man'>manual</span>";
      const move=o.mode==='back-walk'?(o.mode+" "+o.mf+"f"):o.mode;
      const note=o.mode==='back-walk'?"out of throw range at wakeup &mdash; their throw whiffs, punish it":"throw-invuln + out of range at wakeup &mdash; whiffs their throw, punish it";
      rows+="<tr class='meaty-row shimmy-row' data-kind='shimmy' data-pos='both' data-drive='0' data-auto='"+o.auto+"' data-type='shimmy'>"
        +"<td class='dim'>"+fk+move+man+"</td>"
        +"<td class='mv'>shimmy <span class='tag kind-command'>bait</span></td>"
        +"<td class='type'><span class='ty ty-shimmy'>shimmy</span></td>"
        +"<td class='pos-col'><span class='tag pos-both'>midscreen</span></td>"
        +"<td class='k'>&mdash;</td><td class='exec-adv'>+"+(v-o.fkt)+"</td><td class='arrow detail-col'>&rarr;</td>"
        +"<td class='dim detail-col' colspan='4'>"+note+"</td></tr>";
    });
    (d.tw||[]).forEach(o=>{
      const fk=(o.fk&&o.fk.length)?o.fk.join(' + ')+", then throw":"throw";
      const man=o.auto?"":" <span class='man'>manual</span>";
      rows+="<tr class='meaty-row throw-row' data-kind='throw' data-pos='both' data-drive='0' data-auto='"+o.auto+"' data-type='throw'>"
        +"<td class='dim'>"+fk+man+"</td>"
        +"<td class='mv'>"+o.cmd+" <span class='tag kind-command'>throw</span><div class='mv-name'>"+o.nm+"</div></td>"
        +"<td class='type'><span class='ty ty-throw'>throw</span></td>"
        +"<td class='pos-col'><span class='tag pos-both'>midscreen</span></td>"
        +"<td class='k'>&mdash;</td><td class='exec-adv'>+"+(v-o.fkt)+"</td><td class='arrow detail-col'>&rarr;</td>"
        +"<td class='dim detail-col' colspan='4'>tick throw &mdash; beats block/hesitation; loops to KD +"+o.kda+"</td></tr>";
    });
    if(!rows) rows="<tr><td colspan='11' class='dim'>no meaty reachable at +"+v+"</td></tr>";
    return "<table class='meaty'><thead>"
      +"<tr class='grp'><th></th><th></th><th></th><th></th><th></th><th class='fa-grp'>after framekill</th><th class='detail-col'></th><th colspan='4' class='fa-grp detail-col'>after meaty</th></tr>"
      +"<tr><th>framekill</th><th>meaty / attack</th><th>type</th><th>position</th><th>hits on</th><th class='fa-ob' title='frame advantage the instant your framekill finishes'>adv left</th><th class='detail-col'></th><th class='detail-col'>on hit</th><th class='detail-col'>on CH</th><th class='detail-col'>plus</th><th class='detail-col'>on block</th></tr>"
      +"</thead><tbody>"+rows+"</tbody></table>";
  }
  window.OkiView={lookup:lookup, sjHTML:sjHTML, tableHTML:tableHTML, advCls:advCls};
})();
