const fetch = require("node-fetch");

exports.handler = async (event) => {
  const path = event.path.replace("/api", ""); // Remove "/api" prefix
  const backendURL = `https://graph-ongyy.kinsta.app${path}`;

  console.log(`[${new Date().toISOString()}] ${event.httpMethod} ${path} -> ${backendURL}`);

  try {
    const response = await fetch(backendURL, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        host: "graph-ongyy.kinsta.app", // Ensure backend receives the correct host header
      },
      body: event.body,
    });

    const data = await response.text();
    console.log(`[${new Date().toISOString()}] ${event.httpMethod} ${path} -> ${response.status} ${response.statusText}`);
    return {
      statusCode: response.status,
      body: data,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS if needed
        "Content-Type": response.headers.get("Content-Type"),
      },
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ${event.httpMethod} ${path} -> ${error.message}`);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
