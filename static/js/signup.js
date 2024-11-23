document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Create a FormData object to send data as form data (matches Flask's expected format)
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
        const response = await fetch("/signup", {
            method: "POST",
            body: formData,  // Sending as form data
        });

        // If the response is a redirect to login, handle it appropriately
        if (response.redirected) {
            window.location.href = response.url; // Redirect to the login page
        } else {
            const result = await response.text();  // Get the text response from the server
            alert(result);  // Display the message (error or success)
        }
    } catch (error) {
        console.error("Signup error:", error);
    }
});
