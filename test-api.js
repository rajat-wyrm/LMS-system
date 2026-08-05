async function testDelete() {
  try {
    const ts = Date.now();
    // Register
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Inst', email: `inst_${ts}@test.com`, password: 'password123', role: 'instructor' })
    });
    const regData = await regRes.json();
    const token = regData.token;
    
    // Create course
    const createRes = await fetch('http://localhost:5000/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Test Delete', description: 'Test', category: 'Test', level: 'Beginner' })
    });
    const createData = await createRes.json();
    const courseId = createData.data.id;
    console.log('Created course:', courseId);

    // Enroll in course
    const enrollRes = await fetch(`http://localhost:5000/api/enrollments/${courseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    console.log('Enroll status:', enrollRes.status);

    // Delete course
    const deleteRes = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const deleteData = await deleteRes.json();
    console.log('Delete status:', deleteRes.status);
    console.log('Delete response:', deleteData);
  } catch (err) {
    console.log('Test failed:', err);
  }
}

testDelete();
