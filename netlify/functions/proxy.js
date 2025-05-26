const fetch = require("node-fetch");

exports.handler = async (event) => {
  // Extract the base path without query string first
  let basePath = event.path.replace("/api", "");
  if (basePath.includes("?")) {
    basePath = basePath.substring(0, basePath.indexOf("?")); // Get path before '?'
  }

  let queryString = "";

  // Prefer rawQueryString if available (common with AWS HTTP API)
  if (event.rawQueryString && event.rawQueryString.length > 0) {
    queryString = `?${event.rawQueryString}`;
  }
  // Else, try to build from queryStringParameters (common with AWS REST API)
  else if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
    const params = new URLSearchParams(event.queryStringParameters);
    queryString = `?${params.toString()}`;
  }
  // Else, check if the original event.path (after removing /api) had a query string
  else {
    const originalPathWithQuery = event.path.replace("/api", "");
    const queryIndex = originalPathWithQuery.indexOf("?");
    if (queryIndex !== -1) {
      queryString = originalPathWithQuery.substring(queryIndex);
    }
  }

  const fullPath = `${basePath}${queryString}`;
  const backendURL = `https://graph-ongyy.kinsta.app${fullPath}`;

  console.log(`[${new Date().toISOString()}] ${event.httpMethod} ${event.path} -> ${backendURL}`);

  try {
    const response = await fetch(backendURL, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        host: "graph-ongyy.kinsta.app", // Ensure backend receives the correct host header
      },
      body: event.body, // Note: For GET/HEAD requests, body should be undefined or null
                       // node-fetch might handle this, but good to be aware.
    });

    const data = await response.text();
    console.log(`[${new Date().toISOString()}] ${event.httpMethod} ${fullPath} -> ${response.status} ${response.statusText}`);
    return {
      statusCode: response.status,
      body: data,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": response.headers.get("Content-Type") || "application/json", // Provide a default
      },
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ${event.httpMethod} ${fullPath} -> ${error.message}`);
    console.error(error); // Log the full error object for more details
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Proxy error", message: error.message }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
  }
};