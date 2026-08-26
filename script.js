const menuButton=document.getElementById("menuButton"),navigation=document.getElementById("navigation");
menuButton.addEventListener("click",()=>{const open=navigation.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));menuButton.setAttribute("aria-label",open?"Close navigation":"Open navigation")});
navigation.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{navigation.classList.remove("open");menuButton.setAttribute("aria-expanded","false")}));
const today=new Date();document.getElementById("currentDate").textContent=today.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});document.getElementById("year").textContent=today.getFullYear();
const observer=new IntersectionObserver((entries,obs)=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");obs.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
