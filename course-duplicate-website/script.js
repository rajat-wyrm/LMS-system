let courses = [
  {id:1,title:'Full Stack Web Development',description:'Learn HTML, CSS, JavaScript, APIs and modern web development.',instructor:'Priya Sharma',slug:'full-stack-web-development',status:'Published'},
  {id:2,title:'Python for Data Science',description:'Build a strong Python foundation for data analysis and machine learning.',instructor:'Rahul Kumar',slug:'python-for-data-science',status:'Published'},
  {id:3,title:'Introduction to Artificial Intelligence',description:'Understand AI concepts, machine learning and real-world applications.',instructor:'Ananya Rao',slug:'introduction-to-artificial-intelligence',status:'Draft'}
];

function slugify(text){return text.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function uniqueSlug(base){let slug=base, n=2;while(courses.some(c=>c.slug===slug)){slug=base+'-copy-'+n++;}return slug}
function duplicateCourse(id){
  const original=courses.find(c=>c.id===id); if(!original)return;
  const base=slugify(original.title);
  const copy={...original,id:Date.now(),title:original.title+' (Copy)',slug:uniqueSlug(base),status:'Draft'};
  courses.unshift(copy); renderCourses(); updateStats(); showToast('Course duplicated successfully as a Draft');
}
function renderCourses(){
  const q=document.getElementById('search').value.toLowerCase();
  const grid=document.getElementById('courseGrid');
  const filtered=courses.filter(c=>(c.title+' '+c.instructor).toLowerCase().includes(q));
  grid.innerHTML=filtered.map(c=>`<article class="card"><span class="badge ${c.status==='Draft'?'draft':'published'}">${c.status}</span><h3>${escapeHtml(c.title)}</h3><p class="description">${escapeHtml(c.description)}</p><div class="meta"><span class="slug">/${escapeHtml(c.slug)}</span><span class="slug">${escapeHtml(c.instructor)}</span></div><div class="actions"><button class="action" onclick="editCourse(${c.id})">Edit</button><button class="action duplicate" onclick="duplicateCourse(${c.id})">Duplicate</button></div></article>`).join('');
}
function editCourse(id){const c=courses.find(x=>x.id===id);showToast('Edit selected: '+c.title)}
function addCourse(){
  const title=document.getElementById('newTitle').value.trim();if(!title){showToast('Please enter a course title');return}
  courses.unshift({id:Date.now(),title,description:document.getElementById('newDescription').value||'New course description.',instructor:document.getElementById('newInstructor').value||'Not assigned',slug:uniqueSlug(slugify(title)),status:'Draft'});
  closeModal();renderCourses();updateStats();showToast('Course created as a Draft');
}
function updateStats(){document.getElementById('totalCourses').textContent=courses.length;document.getElementById('publishedCourses').textContent=courses.filter(c=>c.status==='Published').length;document.getElementById('draftCourses').textContent=courses.filter(c=>c.status==='Draft').length}
function openModal(){document.getElementById('modal').classList.remove('hidden')}
function closeModal(){document.getElementById('modal').classList.add('hidden')}
function showToast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
renderCourses();updateStats();
