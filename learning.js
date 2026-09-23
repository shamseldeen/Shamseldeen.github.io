document.querySelectorAll('[data-filter]').forEach(input=>{
  const table=document.getElementById(input.dataset.filter);
  const rows=[...table.tBodies[0].rows];
  const ar=document.documentElement.lang==='ar';
  const label=input.id==='courseSearch'?(ar?'كورسًا':'courses'):(ar?'مشروعًا تدريبيًا':'projects');
  input.addEventListener('input',()=>{
    const query=input.value.trim().toLowerCase();let count=0;
    rows.forEach(row=>{row.hidden=!row.textContent.toLowerCase().includes(query);if(!row.hidden)count++;});
    document.getElementById(input.id+'Count').textContent=count+' '+label+(query?(ar?' مطابقًا للبحث':' matching your search'):'');
  });
});
