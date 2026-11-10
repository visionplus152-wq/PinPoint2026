(() => {
  const destinations = window.PT_DESTINATIONS || [];
  const experiences = window.PT_EXPERIENCES || [];
  const content = document.getElementById("explorerContent");
  const title = document.getElementById("explorerTitle");
  const step = document.getElementById("stepNumber");
  const crumbs = document.getElementById("breadcrumbs");
  const searchForm = document.getElementById("destinationSearch");
  const searchInput = document.getElementById("searchInput");
  const feedback = document.getElementById("searchFeedback");
  const state = {region:null,country:null,city:null};
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const attr = esc;
  const findRegion = name => destinations.find(x=>x.name===name);
  const findCountry = () => findRegion(state.region)?.countries.find(x=>x.name===state.country);
  const findCity = () => findCountry()?.cities.find(x=>x.name===state.city);
  const setActiveMap = () => document.querySelectorAll("[data-map-region]").forEach(b=>b.classList.toggle("selected",b.dataset.mapRegion===state.region));
  const scrollExplorerIntoView = () => {
    const top = document.getElementById("explorer").getBoundingClientRect().top + window.scrollY - 86;
    window.scrollTo({top,behavior:"smooth"});
  };
  function renderCrumbs(){
    const parts = [{label:"World",action:()=>reset()}];
    if(state.region) parts.push({label:state.region,action:()=>{state.country=null;state.city=null;renderCountries();}});
    if(state.country) parts.push({label:state.country,action:()=>{state.city=null;renderCities();}});
    if(state.city) parts.push({label:state.city,action:null});
    crumbs.innerHTML = parts.map((p,i)=>`${i?'<span class="sep">/</span>':''}${p.action?`<button type="button" data-crumb="${i}">${esc(p.label)}</button>`:`<span class="crumb-current">${esc(p.label)}</span>`}`).join("");
    crumbs.querySelectorAll("[data-crumb]").forEach(b=>b.addEventListener("click",()=>parts[Number(b.dataset.crumb)].action()));
  }
  function reset(){
    state.region=state.country=state.city=null;
    title.textContent="Choose your continent";step.textContent="01";setActiveMap();renderCrumbs();renderRegions();
  }
  function renderRegions(){
    content.innerHTML=`<div class="region-grid">${destinations.map((r,i)=>`
      <button class="region-card" type="button" data-region="${attr(r.name)}">
        <img src="${attr(r.image)}" alt="" loading="lazy"><span class="region-symbol">${r.symbol||"✦"}</span>
        <strong>${esc(r.name)}</strong><small>${r.countries.length} destinations to discover</small>
      </button>`).join("")}</div>`;
    content.querySelectorAll("[data-region]").forEach(b=>b.addEventListener("click",()=>chooseRegion(b.dataset.region)));
  }
  function chooseRegion(name){
    state.region=name;state.country=state.city=null;setActiveMap();renderCountries();scrollExplorerIntoView();
  }
  function renderCountries(){
    const region=findRegion(state.region);if(!region)return reset();
    title.textContent=`Explore ${region.name}`;step.textContent="02";renderCrumbs();setActiveMap();
    content.innerHTML=`<div class="country-list">${region.countries.map(c=>`
      <button class="choice-card" type="button" data-country="${attr(c.name)}">
        <span><b>${esc(c.name)}</b><small>${c.cities.length} cities and destinations</small></span><span class="chevron">→</span>
      </button>`).join("")}</div><div class="country-feature"><b>Looking beyond the cities?</b><p>Some experiences are spread across a whole country — such as scenic excursions, national parks and multi-stop tours.</p></div>`;
    content.querySelectorAll("[data-country]").forEach(b=>b.addEventListener("click",()=>{state.country=b.dataset.country;state.city=null;renderCities();}));
  }
  function renderCities(){
    const country=findCountry();if(!country)return renderCountries();
    title.textContent=`Discover ${country.name}`;step.textContent="03";renderCrumbs();
    content.innerHTML=`<div class="city-grid">${country.cities.map(c=>`
      <button class="choice-card" type="button" data-city="${attr(c.name)}">
        <span><b>${esc(c.name)}</b><small>Explore tours and local experiences</small></span><span class="chevron">↗</span>
      </button>`).join("")}</div>
      <div class="country-feature"><b>Explore all of ${esc(country.name)}</b><p>Find country-wide excursions, day trips and experiences that may not be tied to one city.</p><button class="text-action" type="button" id="countryWide">Explore country experiences →</button></div>`;
    content.querySelectorAll("[data-city]").forEach(b=>b.addEventListener("click",()=>{state.city=b.dataset.city;renderExperiences();}));
    document.getElementById("countryWide").addEventListener("click",()=>{state.city="Country-wide experiences";renderExperiences();});
  }
  function renderExperiences(){
    const city=findCity();
    const ids=city?.experienceIds||[];
    const offers=experiences.filter(e=>ids.includes(e.id));
    title.textContent=state.city==="Country-wide experiences"?`${state.country} experiences`:`Experiences in ${state.city}`;
    step.textContent="04";renderCrumbs();
    const cards=offers.map(e=>`
      <article class="experience-card">
        <img src="${attr(e.image)}" alt="${attr(e.title)}" loading="lazy">
        <div class="experience-card-body">
          <span class="provider">${esc(e.provider)} · ${esc(e.category)}</span>
          <h4>${esc(e.title)}</h4><p>${esc(e.description)}</p>
          ${e.affiliateUrl && e.affiliateUrl!=="#" && e.status==="active"
            ? `<a href="${attr(e.affiliateUrl)}" target="_blank" rel="sponsored nofollow noopener">View experience <span>↗</span></a>`
            : `<span class="sample-link">Affiliate link to be added after verification</span>`}
        </div>
      </article>`).join("");
    content.innerHTML=`<div class="experience-grid">${cards || `<div class="no-experiences"><b>We're curating experiences for ${esc(state.city)}.</b><br>Check back soon as new tours and activities are added. You can also browse other cities or explore another destination.</div>`}</div>
      <p class="result-note">Prices, availability and inclusions can change. Always confirm details with the booking provider before purchase. Some links may earn us a commission.</p>`;
  }
  function search(query){
    const q=query.trim().toLowerCase();if(!q)return;
    const matches=[];
    destinations.forEach(r=>r.countries.forEach(c=>{
      if(r.name.toLowerCase().includes(q))matches.push({type:"region",region:r.name});
      if(c.name.toLowerCase().includes(q))matches.push({type:"country",region:r.name,country:c.name});
      c.cities.forEach(city=>{if(city.name.toLowerCase().includes(q))matches.push({type:"city",region:r.name,country:c.name,city:city.name});});
    }));
    const exact=matches.find(m=>m.type==="city")||matches.find(m=>m.type==="country")||matches[0];
    if(!exact){feedback.textContent="No matching destination found yet. Try a continent, country or city.";return;}
    state.region=exact.region;state.country=exact.country||null;state.city=exact.city||null;setActiveMap();
    if(exact.type==="region")renderCountries();else if(exact.type==="country")renderCities();else renderExperiences();
    feedback.textContent=`Showing results for ${query}.`;scrollExplorerIntoView();
  }
  searchForm.addEventListener("submit",e=>{e.preventDefault();search(searchInput.value);});
  document.querySelectorAll("[data-search]").forEach(b=>b.addEventListener("click",()=>{searchInput.value=b.dataset.search;search(b.dataset.search);}));
  document.getElementById("resetExplorer").addEventListener("click",reset);
  document.querySelectorAll("[data-map-region]").forEach(b=>b.addEventListener("click",()=>chooseRegion(b.dataset.mapRegion)));
  document.querySelectorAll("[data-jump-region]").forEach(a=>a.addEventListener("click",()=>{state.region=a.dataset.jumpRegion;state.country=state.city=null;setActiveMap();renderCountries();}));
  document.querySelectorAll("[data-category],[data-season]").forEach(a=>a.addEventListener("click",()=>{feedback.textContent=`Explore destinations and experiences for ${a.dataset.category||a.dataset.season}.`;}));
  const menuToggle=document.getElementById("menuToggle"),nav=document.getElementById("mainNav");
  menuToggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuToggle.setAttribute("aria-expanded",String(open));});
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuToggle.setAttribute("aria-expanded","false");}));
  document.getElementById("year").textContent=new Date().getFullYear();
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}}),{threshold:.12});
    document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
  }else document.querySelectorAll(".reveal").forEach(el=>el.classList.add("is-visible"));
  reset();
})();