const API_BASE = `${import.meta.env.BASE_URL}api`;
const SESSION_KEY = "hotel-management-session";

function getAuthToken() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null");
    return session?.token ?? "";
  } catch (error) {
    return "";
  }
}

export async function apiGet(fileName) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/${fileName}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${fileName}`);
  }

  return response.json();
}

export async function apiPost(fileName, payload) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/${fileName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API request failed: ${fileName}`);
  }

  return data;
}
