const email = "user@example.com";
const password = "password123";

async function run() {
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    console.log("Status:", response.status);
    console.log("Headers:");
    response.headers.forEach((val, key) => {
      console.log(`  ${key}: ${val}`);
    });

    const data = await response.json();
    console.log("Body:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
