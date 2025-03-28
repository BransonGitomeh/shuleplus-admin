const fetch = require("node-fetch");

exports.handler = async (event) => {
  const path = event.path.replace("/api", ""); // Remove "/api" prefix
  const backendURL = `http://68.183.27.113:4001${path}`;

  try {
    const response = await fetch(backendURL, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        host: "68.183.27.113", // Ensure backend receives the correct host header
      },
      body: event.body,
    });

    const data = await response.text();
    return {
      statusCode: response.status,
      body: data,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS if needed
        "Content-Type": response.headers.get("Content-Type"),
      },
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
