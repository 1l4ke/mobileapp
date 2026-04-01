const API_URL = "/api";

async function parseJson(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

window.AuthService = {
  async loginGuest() {
    return { user: null, isGuest: true };
  },
  async registerUser(email, password) {
    return parseJson(await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    }));
  },
  async loginUser(email, password) {
    return parseJson(await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    }));
  }
};