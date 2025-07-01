import axios from "axios";

let API;

if (window.location.href.includes('localhost')) {
    API = `http://localhost:4001`;
} else {
    API = `https://cloud.shuleplus.co.ke/api`;
}

/**
 * Handles a 401 Unauthorized response from the API.
 */
const handleUnauthorized = () => {
    console.error("Unauthorized request. Logging out user.");
    const keysToKeep = ['school', 'learningState'];
    const preservedData = {};

    keysToKeep.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            preservedData[key] = value;
        }
    });

    localStorage.clear();

    for (const key in preservedData) {
        localStorage.setItem(key, preservedData[key]);
    }

    window.location.href = '/';
};

// A simple in-memory cache for the current session
const queryCache = {};
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// *** NEW: Helper to normalize GraphQL query strings ***
// This removes newlines, tabs, and extra spaces to create a consistent cache key.
const normalizeGql = (str) => str.replace(/\s+/g, ' ').trim();


/**
 * Performs a GraphQL query with a Stale-While-Revalidate (SWR) caching strategy.
 * - Returns cached data immediately if available.
 * - Fetches fresh data in the background to update the cache.
 * - Implements exponential backoff for failed network requests.
 *
 * @param {string} queryString - The GraphQL query string.
 * @param {object} params - The query variables.
 * @returns {Promise<any>}
 */
const query = async (queryString, params) => {
    // 1. Normalize the query and create a consistent cache key
    const normalizedQuery = normalizeGql(queryString);
    const cacheKey = `${normalizedQuery}`;

    // This self-contained function handles the actual network request and retries
    const fetchAndUpdate = async () => {
        const maxRetries = 3;
        let delay = 1000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const { data: { data } } = await axios.post(`${API}/graph`, {
                    query: normalizedQuery, // Use the normalized query
                    ...params
                }, { headers: { authorization: localStorage.getItem("authorization") } });

                // Success: Update caches and return fresh data
                localStorage.setItem(cacheKey, JSON.stringify(data));
                queryCache[cacheKey] = data;
                return data;

            } catch (error) {
                if (error.response && error.response.status === 401) {
                    handleUnauthorized();
                    return new Promise(() => {}); // Prevent further execution
                }

                if (attempt === maxRetries) {
                    console.error(`API query failed after ${maxRetries} attempts.`, { query: normalizedQuery, params, error });
                    throw error.response ? error.response.data.errors : error;
                }

                const isRetryable = !error.response || (error.response.status >= 500 && error.response.status <= 599);
                if (isRetryable) {
                    console.warn(`Attempt ${attempt} failed. Retrying in ${delay / 1000}s...`);
                    await wait(delay);
                    delay *= 2;
                } else {
                    console.error("Non-retryable error encountered.", error);
                    throw error.response ? error.response.data.errors : error;
                }
            }
        }
    };

    // 2. Check for cached data (in-memory first, then localStorage)
    let cachedData = queryCache[cacheKey];
    if (!cachedData) {
        const storedData = localStorage.getItem(cacheKey);
        if (storedData) {
            try {
                cachedData = JSON.parse(storedData);
                queryCache[cacheKey] = cachedData; // Hydrate in-memory cache for speed
            } catch (e) {
                console.error("Failed to parse cached data, removing invalid item.", e);
                localStorage.removeItem(cacheKey);
            }
        }
    }

    // 3. Implement the SWR logic
    if (cachedData) {
        console.log(`[SWR] Returning stale data for ${cacheKey} and revalidating in background.`);
        
        // **Fire-and-forget** the update. We don't await this.
        // The UI already has data, this just updates the cache for next time.
        fetchAndUpdate().catch(error => {
            console.warn(`[SWR] Background revalidation failed for ${cacheKey}:`, error);
        });

        // Return the stale data immediately for a fast UI response
        return cachedData;
    }

    // 4. If no cache exists, fetch data, wait for it, and return it
    console.log(`[SWR] No cache for ${cacheKey}. Fetching from network.`);
    return await fetchAndUpdate();
};


/**
 * Performs a GraphQL mutation.
 * (Mutations are not cached and do not use SWR to prevent side-effects).
 */
const mutate = async (query, variables) => {
    try {
        const { data: { data } } = await axios.post(`${API}/graph`, {
            query,
            variables
        }, { headers: { authorization: localStorage.getItem("authorization") } });
        return data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            handleUnauthorized();
            return new Promise(() => {});
        }
        console.error("Mutation failed:", error);
        throw error?.response?.data?.errors || "An unknown error occurred during the mutation.";
    }
};

export {
    query,
    mutate,
    API
};