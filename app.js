const V=[['Age','Usia'],['Study_Hours','Jam belajar'],['Sleep_Hours','Jam tidur'],['Attendance','Kehadiran'],['Exam_Score','Nilai ujian'],['Monthly_Spending','Pengeluaran bulanan'],['Screen_Hours','Jam layar'],['Satisfaction','Kepuasan']];
const L=Object.fromEntries(V),S={rows:[],g:'all',hv:'Exam_Score',sx:'Study_Hours',sy:'Exam_Score'};
const sum=a=>a.reduce((x,y)=>x+y,0),mean=a=>sum(a)/a.length;
const qt=(s,p)=>{const i=(s.length-1)*p,l=Math.floor(i);return s[l]+(s[Math.min(l+1,s.length-1)]-s[l])*(i-l)};
const sdev=a=>{const m=mean(a);return Math.sqrt(sum(a.map(x=>(x-m)**2))/(a.length-1))};
function desc(a){const s=[...a].sort((x,y)=>x-y),n=s.length,m=mean(a),d=sdev(a),c={};
  a.forEach(x=>c[x]=(c[x]||0)+1);const mx=Math.max(...Object.values(c));
  return{n,m,med:qt(s,.5),mode:mx>1?+Object.keys(c).find(k=>c[k]==mx):null,sd:d,min:s[0],q1:qt(s,.25),q3:qt(s,.75),max:s[n-1],cv:d/m*100,
  sk:n*sum(a.map(x=>((x-m)/d)**3))/((n-1)*(n-2))}}
function corr(x,y){const mx=mean(x),my=mean(y);let a=0,b=0,c=0;x.forEach((v,i)=>{a+=(v-mx)*(y[i]-my);b+=(v-mx)**2;c+=(y[i]-my)**2});return a/Math.sqrt(b*c)}
const f=(x,d=2)=>x==null||isNaN(x)?'—':(+x.toFixed(d)).toLocaleString('id-ID');
const rows=()=>S.rows.filter(r=>S.g=='all'||r.Gender==S.g),col=(R,k)=>R.map(r=>r[k]);
if(typeof module!=='undefined')module.exports={desc,corr};

function spark(a,d){const W=130,B=10,w=(d.max-d.min)||1,c=Array(B).fill(0);
  a.forEach(x=>c[Math.min(B-1,Math.floor((x-d.min)/w*B))]++);const M=Math.max(...c),bw=W/B,X=v=>(v-d.min)/w*W;
  return`<svg width="${W}" height="34" viewBox="0 0 ${W} 34">`+c.map((v,i)=>`<rect x="${i*bw+1}" y="${24-v/M*22}" width="${bw-2}" height="${v/M*22}" fill="var(--bar)"/>`).join('')+
  `<line x1="0" x2="${W}" y1="28" y2="28" stroke="var(--line)"/><rect x="${X(d.q1)}" y="26" width="${Math.max(2,X(d.q3)-X(d.q1))}" height="4" fill="var(--ink)"/><rect x="${X(d.med)-1}" y="23" width="2" height="10" fill="var(--hot)"/></svg>`}

function ledger(){const R=rows();
  document.getElementById('n').textContent=`n = ${R.length}`;
  const H=['Variabel','Rata-rata','Median','Modus','SD','CV %','Min','Q1','Q3','Maks','Skewness','Sebaran'],GS=[1,4,6,10];
  const th=(h,i)=>`<th class="${GS.includes(i)?'gs':''}">${h}</th>`;
  document.getElementById('ledger').innerHTML='<tr class="grp"><th></th><th colspan="3" class="gs">Pusat data</th><th colspan="2" class="gs">Penyebaran</th><th colspan="4" class="gs">Rentang &amp; kuartil</th><th colspan="2" class="gs">Bentuk</th></tr><tr>'+H.map(th).join('')+'</tr>'+V.map(([k,l])=>{const a=col(R,k),d=desc(a);
    return`<tr><td class="nm">${l}</td>`+[d.m,d.med,d.mode,d.sd,d.cv,d.min,d.q1,d.q3,d.max,d.sk].map((v,i)=>`<td class="${GS.includes(i+1)?'gs':''}${i==0?' key':''}">${f(v,i==4?1:2)}</td>`).join('')+`<td class="gs">${spark(a,d)}</td></tr>`}).join('')}

function dist(){const k=S.hv,R=rows(),d=desc(col(R,k)),W=640,P={l:30,r:10,t:10,b:100},B=10,w=(d.max-d.min)||1,iw=W-P.l-P.r,ih=310-P.t-P.b,bw=iw/B,
  X=v=>P.l+(v-d.min)/w*iw,cnt={F:Array(B).fill(0),M:Array(B).fill(0)};
  R.forEach(r=>cnt[r.Gender][Math.min(B-1,Math.floor((r[k]-d.min)/w*B))]++);
  const T=Math.max(...cnt.F.map((v,i)=>v+cnt.M[i])),Y=v=>P.t+ih-v/T*ih;let s='';
  for(let i=0;i<B;i++){let y0=0;['F','M'].forEach(g=>{const v=cnt[g][i];if(v){s+=`<rect x="${P.l+i*bw+1}" y="${Y(y0+v)}" width="${bw-2}" height="${Y(y0)-Y(y0+v)}" fill="var(--${g})"><title>${g}: ${v}</title></rect>`;y0+=v}})}
  for(let i=0;i<=B;i+=2)s+=`<text x="${P.l+i*bw}" y="${P.t+ih+14}" text-anchor="middle">${f(d.min+w*i/B,1)}</text>`;
  for(let v=0;v<=T;v+=Math.ceil(T/4))s+=`<text x="${P.l-6}" y="${Y(v)+4}" text-anchor="end">${v}</text>`;
  s+=`<line x1="${X(d.m)}" x2="${X(d.m)}" y1="${P.t}" y2="${P.t+ih}" stroke="var(--ink)" stroke-dasharray="4 3"/><text x="${X(d.m)+4}" y="${P.t+10}">rata-rata ${f(d.m)}</text>`;
  [['F','Perempuan'],['M','Laki-laki']].forEach(([g,n],j)=>{const v=col(R.filter(r=>r.Gender==g),k);if(v.length<2)return;const e=desc(v),y=P.t+ih+34+j*26;
    s+=`<line x1="${X(e.min)}" x2="${X(e.max)}" y1="${y}" y2="${y}" stroke="var(--${g})"/><rect x="${X(e.q1)}" y="${y-7}" width="${Math.max(2,X(e.q3)-X(e.q1))}" height="14" fill="var(--${g})" opacity=".4" stroke="var(--${g})"/><line x1="${X(e.med)}" x2="${X(e.med)}" y1="${y-7}" y2="${y+7}" stroke="var(--${g})" stroke-width="3"/><text x="${P.l}" y="${y-12}" fill="var(--${g})">${n}: median ${f(e.med)}, rata-rata ${f(e.m)}</text>`});
  document.getElementById('dist').innerHTML=s}

function cmp(){const el=document.getElementById('cmp');
  if(S.g!='all'){el.innerHTML='<tr><td>Pilih “Semua” pada filter gender untuk membandingkan.</td></tr>';return}
  const F=S.rows.filter(r=>r.Gender=='F'),M=S.rows.filter(r=>r.Gender=='M');
  el.innerHTML='<tr class="grp"><th></th><th colspan="2" class="gs">Rata-rata</th><th class="gs"></th><th colspan="2" class="gs">Standar deviasi</th><th class="gs">Besar efek</th></tr><tr><th>Variabel</th><th class="gs">Perempuan (F)</th><th>Laki-laki (M)</th><th class="gs">Selisih F−M</th><th class="gs">F</th><th>M</th><th class="gs">Cohen d</th></tr>'+V.map(([k,l])=>{
    const a=desc(col(F,k)),b=desc(col(M,k)),sp=Math.sqrt(((a.n-1)*a.sd**2+(b.n-1)*b.sd**2)/(a.n+b.n-2)),d=(a.m-b.m)/sp,z=Math.abs(d),sz=z>=.8?'besar':z>=.5?'sedang':'kecil',w=d>=0?'F':'M';
    return`<tr><td class="nm">${l}</td><td class="gs ${w=='F'?'win F':''}">${f(a.m)}</td><td class="${w=='M'?'win M':''}">${f(b.m)}</td><td class="gs">${d>=0?'+':''}${f(a.m-b.m)}</td><td class="gs">${f(a.sd)}</td><td>${f(b.sd)}</td><td class="gs"><span class="badge ${sz}">${f(d)} · ${sz}</span></td></tr>`}).join('')}

const SH={Age:'Usia',Study_Hours:'Belajar',Sleep_Hours:'Tidur',Attendance:'Hadir',Exam_Score:'Nilai',Monthly_Spending:'Belanja',Screen_Hours:'Layar',Satisfaction:'Puas'};
function heat(){const R=rows(),el=document.getElementById('heat');
  const clr=r=>{const t=Math.min(1,Math.abs(r)),c=r>=0?'47,93,158':'196,87,43';return`rgba(${c},${(.08+.85*t).toFixed(2)})`};
  el.innerHTML='<tr><th></th>'+V.map(([k,l])=>`<th class="hc" title="${l}">${SH[k]}</th>`).join('')+'</tr>'+V.map(([a,la])=>`<tr><td class="nm">${la}</td>`+V.map(([b])=>{
    const r=corr(col(R,a),col(R,b));return`<td class="c${a==S.sx&&b==S.sy||a==S.sy&&b==S.sx?' sel':''}" tabindex="0" data-x="${a}" data-y="${b}" style="background:${clr(r)};color:${Math.abs(r)>.55?'#fff':'inherit'}">${f(r)}</td>`}).join('')+'</tr>').join('')}

function scatter(){const R=rows(),x=col(R,S.sx),y=col(R,S.sy),W=640,H=340,P={l:48,r:12,t:12,b:40},ex=desc(x),ey=desc(y),
  X=v=>P.l+(v-ex.min)/((ex.max-ex.min)||1)*(W-P.l-P.r),Y=v=>H-P.b-(v-ey.min)/((ey.max-ey.min)||1)*(H-P.t-P.b);let s='';
  for(let i=0;i<=4;i++){const vx=ex.min+(ex.max-ex.min)*i/4,vy=ey.min+(ey.max-ey.min)*i/4;
    s+=`<text x="${X(vx)}" y="${H-P.b+16}" text-anchor="middle">${f(vx,1)}</text><text x="${P.l-6}" y="${Y(vy)+4}" text-anchor="end">${f(vy,1)}</text><line x1="${P.l}" x2="${W-P.r}" y1="${Y(vy)}" y2="${Y(vy)}" stroke="var(--line)"/>`}
  s+=`<text x="${(W+P.l)/2}" y="${H-6}" text-anchor="middle">${L[S.sx]}</text><text transform="translate(12 ${H/2}) rotate(-90)" text-anchor="middle">${L[S.sy]}</text>`;
  R.forEach((r,i)=>s+=`<circle cx="${X(x[i])}" cy="${Y(y[i])}" r="4" fill="var(--${r.Gender})" fill-opacity=".7"><title>${r.Gender} · ${L[S.sx]} ${r[S.sx]} · ${L[S.sy]} ${r[S.sy]}</title></circle>`);
  const rr=corr(x,y),b=rr*ey.sd/ex.sd,a=ey.m-b*ex.m;
  if(S.sx!=S.sy)s+=`<line x1="${X(ex.min)}" y1="${Y(a+b*ex.min)}" x2="${X(ex.max)}" y2="${Y(a+b*ex.max)}" stroke="var(--ink)" stroke-width="1.5"/>`;
  s+=`<g><circle cx="${W-150}" cy="14" r="4" fill="var(--F)"/><text x="${W-142}" y="18">F</text><circle cx="${W-110}" cy="14" r="4" fill="var(--M)"/><text x="${W-102}" y="18">M</text></g>`;
  document.getElementById('sc').innerHTML=s;
  document.getElementById('reg').textContent=`r = ${f(rr)} · R² = ${f(rr*rr)} · kemiringan = ${f(b,3)} ${L[S.sy]} per 1 ${L[S.sx]}`}

function all(){ledger();dist();cmp();heat();scatter()}
function pick(){document.getElementById('sx').value=S.sx;document.getElementById('sy').value=S.sy;heat();scatter()}
Promise.resolve(window.DATA).then(d=>{S.rows=d;
  const hv=document.getElementById('hv');
  hv.innerHTML=V.map(([k,l])=>`<button data-k="${k}" class="${k==S.hv?'on':''}">${l}</button>`).join('');
  hv.onclick=e=>{const k=e.target.dataset.k;if(!k)return;S.hv=k;hv.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k==k));dist()};
  ['sx','sy'].forEach(id=>{const el=document.getElementById(id);el.innerHTML=V.map(([k,l])=>`<option value="${k}">${l}</option>`).join('');el.onchange=()=>{S[id]=el.value;pick()}});
  document.getElementById('gender').onclick=e=>{const g=e.target.dataset.g;if(!g)return;S.g=g;e.currentTarget.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.g==g));all()};
  const h=document.getElementById('heat');
  const hit=e=>{const c=e.target.closest('td.c');if(c){S.sx=c.dataset.x;S.sy=c.dataset.y;pick()}};
  h.onclick=hit;h.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();hit(e)}};
  all();pick()});
