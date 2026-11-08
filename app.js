"use strict";
const $ = id => document.getElementById(id);
const metricNames = {
  hearing_pct: "Adult hearing-disability prevalence (%)",
  tornado_records_2023_2025: "NOAA county-based tornado records (2023–2025)",
  hurricane_eal_usd: "FEMA hurricane expected annual loss (USD)"
};
const criterionNames = {
  TEXT_ALERTS: "Written alerts", CLEAR_ALERT_TEXT: "Alert wording",
  CAPTIONS_TRANSCRIPTS: "Captions / transcripts", INTERPRETER_OPTIONS: "Interpreting / CART",
  ACCESSIBLE_WEB: "Web information", NONVOICE_CONTACT: "Non-voice contact",
  SHELTER_COMMUNICATION: "Shelter communication"
};
const marks = {"Documented in official source":"D", "Needs direct confirmation":"?", "Not reviewed":"N", "Not located in sources reviewed":"L", "Not applicable to material reviewed":"—"};
const money = n => n == null ? "Not available" : new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const integer = n => new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(n);
const el = (tag, opts = {}, text = "") => {const node=document.createElement(tag); for(const [k,v] of Object.entries(opts)) node.setAttribute(k,v); node.textContent=text; return node;};
let counties=[], evidence=[], models=[], featureByFips=new Map(), countyByFips=new Map(), reviewed=new Set(), selected=null;
let mapProject=null;
const currentMetric = () => $("metric").value;
const metricValue = c => c[currentMetric()];
const announce = text => {$("live").textContent=text;};
function boundsAndProject(features) {
  const pts=[];
  for(const f of features) for(const poly of getPolygons(f.geometry)) for(const p of poly[0]) pts.push(p);
  const minLon=Math.min(...pts.map(p=>p[0])), maxLon=Math.max(...pts.map(p=>p[0]));
  const minLat=Math.min(...pts.map(p=>p[1])), maxLat=Math.max(...pts.map(p=>p[1]));
  const cosine=Math.cos(34*Math.PI/180), width=(maxLon-minLon)*cosine, height=maxLat-minLat;
  const scale=Math.min(850/width,480/height), xPad=(920-scale*width)/2, yPad=(550-scale*height)/2;
  return ([lon,lat])=>[xPad+(lon-minLon)*cosine*scale,yPad+(maxLat-lat)*scale];
}
function getPolygons(geometry) {
  if(!geometry) return [];
  if(geometry.type==="Polygon") return [geometry.coordinates];
  if(geometry.type==="MultiPolygon") return geometry.coordinates;
  return [];
}
function pathData(feature){
  return getPolygons(feature.geometry).map(poly=>poly.map(ring=>ring.map((p,i)=>{const [x,y]=mapProject(p);return (i?"L":"M")+x.toFixed(1)+","+y.toFixed(1);}).join(" ")+" Z").join(" ")).join(" ");
}
function colorFor(c){
  const vals=counties.map(metricValue).filter(v=>v!==null && Number.isFinite(v));
  const n=metricValue(c);if(n==null) return "#cfd9df";
  const min=Math.min(...vals),max=Math.max(...vals),ratio=max===min?.5:Math.max(0,Math.min(1,(n-min)/(max-min)));
  const shades=["#e8f4f2","#b8ded8","#7fbfb4","#37998e","#176d75","#114c67"];
  return shades[Math.min(shades.length-1,Math.floor(ratio*shades.length))];
}
function fmtMetric(c){const n=metricValue(c); if(n==null)return "Not available";if(currentMetric()==="hearing_pct")return n.toFixed(1)+"%";if(currentMetric()==="hurricane_eal_usd")return money(n);return integer(n);}
function redrawMap(){
  const svg=$("county-map"); svg.replaceChildren();
  for(const [fips,feature] of featureByFips){
    const c=countyByFips.get(fips);if(!c)continue;
    const path=document.createElementNS("http://www.w3.org/2000/svg","path");
    for(const [key,value] of Object.entries({d:pathData(feature),fill:colorFor(c),class:"map-county"+(selected===fips?" active":""),tabindex:"0",role:"button", "aria-label":c.name+" County: "+metricNames[currentMetric()]+", "+fmtMetric(c)})) path.setAttribute(key,value);
    const title=document.createElementNS("http://www.w3.org/2000/svg","title");title.textContent=c.name+" County: "+fmtMetric(c);path.appendChild(title);
    path.addEventListener("click",()=>selectCounty(fips));path.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();selectCounty(fips);}});
    svg.appendChild(path);
  }
  const vals=counties.map(metricValue).filter(v=>v!=null); const format=v=>currentMetric()==="hurricane_eal_usd"? money(v): currentMetric()==="hearing_pct"?v.toFixed(1)+"%":integer(v);
  $("map-legend").textContent="Map color indicates "+metricNames[currentMetric()]+". Displayed range: "+format(Math.min(...vals))+" to "+format(Math.max(...vals))+". Gray means unavailable. Use the table for precise values.";
}
function selectCounty(fips){
  selected=fips;const c=countyByFips.get(fips);if(!c)return;
  $("detail-name").textContent=c.name+" County";
  const detail=$("detail-data");detail.replaceChildren();
  const dl=el("dl"); const add=(k,v)=>{dl.append(el("dt",{},k),el("dd",{},v));};
  add("Hearing prevalence",c.hearing_pct.toFixed(1)+"%");
  add("Estimated adults*",integer(c.estimated_adults_hearing));
  add("NOAA tornado records",integer(c.tornado_records_2023_2025));
  add("Hurricane EAL",money(c.hurricane_eal_usd));
  add("Evidence review",reviewed.has(fips)?"7 criteria reviewed":"Not in seven-county sample");
  detail.append(dl,el("p",{class:"subtle"},"These values do not measure accessible services, individual safety, or emergency preparedness."));
  redrawMap(); for(const row of document.querySelectorAll("#county-rows tr")){row.classList.toggle("selected-row",row.getAttribute("data-fips")===fips);} announce(c.name+" County selected");
}
function showCountyTable(){
  const tbody=$("county-rows");tbody.replaceChildren();
  const query=$("search").value.toLowerCase().trim();
  for(const c of counties.filter(c=>c.name.toLowerCase().includes(query))){
    const tr=el("tr",{"data-fips":c.fips});const name=el("td");const btn=el("button",{type:"button"},c.name);btn.addEventListener("click",()=>selectCounty(c.fips));name.append(btn);
    tr.append(name,el("td",{class:"num"},c.hearing_pct.toFixed(1)+"%"),el("td",{class:"num"},integer(c.estimated_adults_hearing)),el("td",{class:"num"},integer(c.tornado_records_2023_2025)),el("td",{class:"num"},money(c.hurricane_eal_usd)),el("td",{},reviewed.has(c.fips)?"Reviewed":"Not reviewed"));
    tbody.append(tr);
  }
}
function evidenceMatrix(){
  const thead=$("evidence-head"), tbody=$("evidence-body");thead.replaceChildren();tbody.replaceChildren();
  const row=el("tr");row.append(el("th",{scope:"col"},"County")); for(const label of Object.values(criterionNames))row.append(el("th",{scope:"col"},label)); thead.append(row);
  for(const c of counties.filter(c=>reviewed.has(c.fips))){
    const tr=el("tr");tr.append(el("th",{scope:"row"},c.name));
    for(const code of Object.keys(criterionNames)){
      const record=evidence.find(r=>r.fips===c.fips&&r.criterion===code);const status=record?.status||"Not reviewed";
      const td=el("td"),btn=el("button",{type:"button",class:"mark "+(status==="Documented in official source"?"yes":status==="Needs direct confirmation"?"unknown":"other"),"aria-label":c.name+": "+criterionNames[code]+" — "+status},marks[status]||"N");
      btn.addEventListener("click",()=>showEvidence(c,code,record));td.append(btn);tr.append(td);
    }tbody.append(tr);
  }
}
function showEvidence(county,code,record){
  const d=$("evidence-detail");d.replaceChildren();d.append(el("h3",{},county.name+" County · "+criterionNames[code]));d.append(el("p",{},"Evidence status: "+(record?.status||"Not reviewed")));
  d.append(el("p",{class:"subtle"},"A documentation status is not a determination about whether a service exists, works, or complies with the ADA."));
  if(record?.reviewed_date)d.append(el("p",{class:"subtle"},"Reviewed: "+record.reviewed_date));
  if(record?.public_source_url){const a=el("a",{href:record.public_source_url,target:"_blank",rel:"noopener noreferrer"},"Open recorded public source");d.append(a);}
}
function modelsTable(){
  const body=$("model-rows"),bars=$("model-bars");body.replaceChildren();bars.replaceChildren();
  for(const m of models){const tr=el("tr");tr.append(el("th",{scope:"row"},m.model),el("td",{class:"num"},m.roc_auc.toFixed(3)),el("td",{class:"num"},m.average_precision.toFixed(3)),el("td",{class:"num"},m.brier_score.toFixed(3)));body.append(tr);
    const row=el("div",{class:"chart-row"});row.append(el("span",{},m.model));const track=el("div",{class:"track"});const fill=el("div",{class:"fill",style:"width:"+(m.average_precision*100).toFixed(1)+"%"});track.append(fill);row.append(track,el("strong",{},m.average_precision.toFixed(3)));bars.append(row);
  }
}
async function main(){
  try{
    const [researchResponse,geoResponse]=await Promise.all([fetch("data/research.json"),fetch("data/sc_counties.geojson")]);
    if(!researchResponse.ok||!geoResponse.ok)throw new Error("Research data files were not found. Run Step 29 again.");
    const research=await researchResponse.json(),geo=await geoResponse.json();
    counties=research.counties;evidence=research.evidence;models=research.models;
    countyByFips=new Map(counties.map(c=>[c.fips,c]));reviewed=new Set(evidence.map(r=>r.fips));
    featureByFips=new Map(geo.features.map(f=>[f.id,f]));mapProject=boundsAndProject(geo.features);
    $("n-counties").textContent=counties.length;$("n-reviewed").textContent=reviewed.size;
    $("n-documented").textContent=evidence.filter(r=>r.status==="Documented in official source").length;
    $("n-unconfirmed").textContent=evidence.filter(r=>r.status==="Needs direct confirmation").length;
    $("built-date").textContent="Data snapshot built "+research.built_on+". Geography is for exploratory comparison. Source vintages and selection rules are documented in the research repository.";
    $("metric").addEventListener("change",redrawMap);$("search").addEventListener("input",showCountyTable);
    showCountyTable();evidenceMatrix();modelsTable();selectCounty("45019");
  }catch(err){$("main").prepend(el("p",{class:"notice",role:"alert"},"Could not load research data: "+err.message+". Start the local server as instructed in webapp/README.md."));}
}
main();
