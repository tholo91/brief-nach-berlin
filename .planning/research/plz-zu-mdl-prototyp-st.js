const fs=require("fs"),path=require("path");
const [gjDir,web]=process.argv.slice(2);
const f=fs.readdirSync(gjDir).find(n=>/json$/i.test(n));
const gj=JSON.parse(fs.readFileSync(path.join(gjDir,f),"utf8"));
console.log(gj.features.length,Object.keys(gj.features[0].properties),JSON.stringify(gj.crs||null));
// WGS84 -> UTM32 (Krueger-Reihe)
const a=6378137,fl=1/298.257222101,n=fl/(2-fl),A=a/(1+n)*(1+n*n/4+n**4/64),k0=.9996;
const al=[n/2-2*n*n/3+5*n**3/16,13*n*n/48-3*n**3/5,61*n**3/240];
function utm(lat,lon){const p=lat*Math.PI/180,l=(lon-9)*Math.PI/180,c=2*Math.sqrt(n)/(1+n);
const t=Math.sinh(Math.atanh(Math.sin(p))-c*Math.atanh(c*Math.sin(p)));const xi=Math.atan2(t,Math.cos(l)),eta=Math.atanh(Math.sin(l)/Math.sqrt(1+t*t));
let E=eta,N=xi;al.forEach((v,i)=>{const j=2*(i+1);E+=v*Math.cos(j*xi)*Math.sinh(j*eta);N+=v*Math.sin(j*xi)*Math.cosh(j*eta)});
return [500000+k0*A*E,k0*A*N]}
function inR(x,y,r){let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const[xi,yi]=r[i],[xj,yj]=r[j];if((yi>y)!=(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
function inF(x,y,g){const ps=g.type==="Polygon"?[g.coordinates]:g.coordinates;return ps.some(p=>inR(x,y,p[0])&&!p.slice(1).some(h=>inR(x,y,h)))}
const nameKey=Object.keys(gj.features[0].properties).find(k=>/Nr/.test(k));
const sample=gj.features[0].geometry.coordinates.flat(3).slice(0,2);console.log("sample",sample,nameKey);
const pb=require(path.join(web,"data/plz-bundesland-mapping.json"));const cur=require(path.join(web,"data/plz-landtagswahlkreis-mapping.json"));
const rows=fs.readFileSync(path.join(web,"data/raw/geonames_de.txt"),"utf8").split("\n").map(l=>l.split("\t"));
const byPlz={};for(const r of rows){const z=r[1];if(pb[z]?.bundeslandKey==="ST")(byPlz[z]=byPlz[z]||[]).push([+r[9],+r[10],r[2]])}
const res={},dLat=.008,dLon=.012;let none=0;
for(const z of Object.keys(pb).filter(z=>pb[z].bundeslandKey==="ST")){const pts=byPlz[z]||[];const s=new Set();
for(const[la,lo]of pts){for(const[dy,dx]of[[0,0]]){const[x,y]=utm(la+dy,lo+dx);for(const ft of gj.features)if(inF(x,y,ft.geometry))s.add(+ft.properties[nameKey])}}
res[z]=[...s].sort((a,b)=>a-b);if(!s.size)none++}
const ks=Object.keys(res);const h={};for(const k of ks){const n=res[k].length;h[n]=(h[n]||0)+1}
console.log("ST PLZ",ks.length,"ohne Treffer",none,"Anzahl WK je PLZ",h,"zuvor gemappt",ks.filter(k=>cur[k]).length);
for(const z of["29410","29416","39104","06108","06484"])console.log(z,JSON.stringify(res[z]),"alt",JSON.stringify(cur[z]),pb[z].ortsname);
let same=0,cmp=0,ov=0;for(const k of ks)if(cur[k]){cmp++;if(res[k].some(v=>cur[k].includes(v)))ov++;}console.log("Vergleich alt/neu: Überlappung",ov,"von",cmp);
const nm={};for(const ft of gj.features)nm[+ft.properties[nameKey]]=ft.properties["Name Wahlk"];
const bad=ks.filter(k=>cur[k]&&!res[k].some(v=>cur[k].includes(v)));
for(const k of bad.slice(0,12))console.log(k,pb[k].ortsname,"|",pb[k].kreisname,"| alt",cur[k].map(v=>v+" "+nm[v]).join(","),"| neu",res[k].map(v=>v+" "+nm[v]).join(","));
