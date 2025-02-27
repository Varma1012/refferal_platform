document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');  // Extract token from URL
    const newPassword = document.getElementById('newPassword').value;
    const message = document.getElementById('message');

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json();
        message.textContent = data.message;
    } catch (error) {
        message.textContent = 'Something went wrong. Please try again.';
    }
});