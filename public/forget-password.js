document.getElementById('forgetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const message = document.getElementById('message');

    try {
        const response = await fetch('/api/auth/forget-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        message.textContent = data.message;
    } catch (error) {
        message.textContent = 'Something went wrong. Please try again.';
    }
});