document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();  

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
      const response = await fetch('/api/auth', {  
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
          
          localStorage.setItem('token', data.token);
          window.location.href = '/home';
      } else {
          alert(data.message);
      }
  } catch (error) {
      alert('An error occurred. Please try again.');
  }
});