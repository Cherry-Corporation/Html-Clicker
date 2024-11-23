document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Create a FormData object to send data as form data
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
        const response = await fetch("/login", {
            method: "POST",
            body: formData,  // Send as form data
        });

        // If the response is a redirect, handle it
        if (response.redirected) {
            window.location.href = response.url;  // Redirect to the game page
        } else {
            const result = await response.text();  // Get the text response (error or success)
            alert(result);  // Display the message
        }
    } catch (error) {
        console.error("Login error:", error);
    }
});
