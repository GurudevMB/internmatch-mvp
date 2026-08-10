// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

const API_URL = "http://127.0.0.1:8000";

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // ================= GET VALUES =================

        const email =
            document.getElementById("email")
                .value
                .trim()
                .toLowerCase();

        const password =
            document.getElementById("password")
                .value;

        // ================= EMPTY CHECK =================

        if (email === "" || password === "") {

            alert("Please fill all fields.");
            return;
        }

        try {

            // ================= BACKEND LOGIN =================

            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            // ================= LOGIN FAILED =================

            if (!response.ok) {

                alert(
                    data.detail ||
                    "❌ Invalid email or password."
                );

                return;
            }

            // ================= SAVE JWT =================

            localStorage.setItem(
                "accessToken",
                data.access_token
            );

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );

            localStorage.setItem(
                "userEmail",
                email
            );

            // ================= LOGIN SUCCESS =================

            alert(
                "✅ Login Successful! Welcome to InternMatch."
            );

            // ================= DASHBOARD =================

            window.location.href =
                "dashboard.html";

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            alert(
                "❌ Unable to connect to backend."
            );
        }

    });

}