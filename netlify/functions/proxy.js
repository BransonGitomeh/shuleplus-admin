const fetch = require("node-fetch");

// --- Retry Configuration ---
const MAX_RETRIES = 3; // Total attempts will be MAX_RETRIES + 1
const INITIAL_BACKOFF_MS = 100; // Start with a 100ms delay

// --- Helper function for async sleep ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.handler = async (event) => {
  const basePath = event.path.replace(/^\/api/, "");
  const queryString = event.rawQueryString ? `?${event.rawQueryString}` : "";
  const fullPath = `${basePath}${queryString}`;
  const backendURL = `https://graph-ongyy.kinsta.app${fullPath}`;
  const requestMethod = event.httpMethod.toUpperCase();

  console.log(`[PROXY_REQUEST] ${requestMethod} ${event.path} -> ${backendURL}`);

  const forwardedHeaders = {};
  for (const [key, value] of Object.entries(event.headers)) {
      const lowerKey = key.toLowerCase();
      if (['accept', 'accept-language', 'content-type', 'authorization'].includes(lowerKey)) {
          forwardedHeaders[key] = value;
      }
  }
  forwardedHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';
  forwardedHeaders['host'] = "graph-ongyy.kinsta.app";
  forwardedHeaders['X-Forwarded-For'] = event.requestContext?.http?.sourceIp || 'unknown';
  forwardedHeaders['X-Forwarded-Proto'] = 'https';
  
  const body = (requestMethod === 'GET' || requestMethod === 'HEAD') ? undefined : event.body;

  // --- Retry Loop ---
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        // --- Calculate Exponential Backoff with Jitter ---
        const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        const jitter = backoffTime * 0.2 * Math.random(); // Add up to 20% jitter
        const waitTime = backoffTime + jitter;
        
        console.log(`[PROXY_RETRY] Attempt ${attempt} failed. Retrying in ${Math.round(waitTime)}ms...`);
        await sleep(waitTime);
      }
      
      console.log(`[PROXY_SENDING] Attempt ${attempt + 1}/${MAX_RETRIES + 1} to ${backendURL}`);
      console.log(`[PROXY_SENDING] Headers: ${JSON.stringify(forwardedHeaders)}`);
      if(body) console.log(`[PROXY_SENDING] Body included.`);

      const response = await fetch(backendURL, {
        method: requestMethod,
        headers: forwardedHeaders,
        body: body,
        redirect: 'manual' 
      });

      // --- Success or Non-Retryable Error Condition ---
      // We will not retry on 4xx client errors or most 5xx server errors.
      // We only retry on specific transient errors like 502, 503, 504.
      if (response.status < 500 || ![502, 503, 504].includes(response.status)) {
        const responseBody = await response.text();
        const responseContentType = response.headers.get("Content-Type") || "application/json";
        
        console.log(`[PROXY_SUCCESS] ${requestMethod} ${fullPath} -> ${response.status} ${response.statusText}`);

        return {
          statusCode: response.status,
          body: responseBody,
          headers: {
            "Content-Type": responseContentType,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          },
        };
      }
      
      // If we are here, it's a retryable status code (502, 503, 504).
      // We throw an error to trigger the catch block and the next loop iteration.
      throw new Error(`Received retryable status code: ${response.status}`);

    } catch (error) {
      console.error(`[PROXY_ATTEMPT_FAILED] Attempt ${attempt + 1} failed with error: ${error.message}`);
      // If this was the last attempt, we give up and return an error.
      if (attempt === MAX_RETRIES) {
        console.error(`[PROXY_FATAL] All ${MAX_RETRIES + 1} attempts failed. Giving up.`);
        return {
          statusCode: 502,
          body: JSON.stringify({ error: "Proxy Error", message: "Could not connect to the backend service after multiple retries." }),
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        };
      }
      // Otherwise, the loop will continue to the next attempt after the delay.
    }
  }
};