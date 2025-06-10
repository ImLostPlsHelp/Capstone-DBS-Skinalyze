document
  .getElementById('loginForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Mohon isi semua field.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/index.html';
      } else {
        alert(
          data.message || 'Login gagal. Periksa kembali email dan password.'
        );
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat login.');
    }
  });
