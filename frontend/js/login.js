// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

const API_URL = "http://127.0.0.1:8000";

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password = document
            .getElementById("password")
            .value;

        if (email === "" || password === "") {

            alert("Please fill all fields.");

            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/login`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        "Accept": "application/json"

                    },

                    body: JSON.stringify({

                        email: email,

                        password: password

                    })

                }
            );

            let data;

            try {

                data = await response.json();

            } catch {

                throw new Error(
                    "Invalid response from backend"
                );

            }

            if (!response.ok) {

                alert(
                    data.detail ||
                    "❌ Invalid email or password."
                );

                return;

            }


            // ================= SAVE LOGIN DATA =================

            localStorage.setItem(
                "accessToken",
                data.access_token
            );

            localStorage.setItem(
                "tokenType",
                data.token_type || "bearer"
            );

            localStorage.setItem(
                "userRole",
                data.role || ""
            );

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );

            localStorage.setItem(
                "userEmail",
                email
            );


            // ================= ROLE BASED REDIRECT =================

            if (data.role === "admin") {

                alert(
                    "✅ Admin Login Successful!"
                );

                window.location.href =
                    "admin.html";

            }

            else if (data.role === "student") {

                alert(
                    "✅ Login Successful! Welcome to InternMatch."
                );

                window.location.href =
                    "dashboard.html";

            }

            else {

                alert(
                    "❌ Unknown user role."
                );

                localStorage.clear();

            }


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            alert(
                "❌ Unable to connect to backend. Make sure FastAPI is running on port 8000."
            );

        }

    });

}