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

// A simple in-memory cache for the current session.
// This is now primarily used for hydrating from localStorage, not for SWR.
const queryCache = {};
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to normalize GraphQL query strings for consistent cache keys.
const normalizeGql = (str) => str.replace(/\s+/g, ' ').trim();


/**
 * Fetches data from the network with an exponential backoff retry mechanism.
 * If successful, it updates both the in-memory and localStorage caches.
 *
 * @param {string} normalizedQuery - The normalized GraphQL query.
 * @param {string} cacheKey - The key for caching.
 * @param {object} params - The query variables.
 * @returns {Promise<any>} The fresh data from the server.
 * @throws Will throw an error if all retry attempts fail.
 */
const fetchWithRetries = async (normalizedQuery, cacheKey, params) => {
    const maxRetries = 10;
    let delay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const { data: { data } } = await axios.post(`${API}/graph`, {
                query: normalizedQuery,
                ...params
            }, { headers: { authorization: localStorage.getItem("authorization") } });

            // Success: Update caches and return the fresh data
            localStorage.setItem(cacheKey, JSON.stringify(data));
            queryCache[cacheKey] = data; // Keep in-memory cache in sync
            console.log(`[API] Fresh data fetched and cached for ${cacheKey}.`);
            return data;

        } catch (error) {
            if (error.response && error.response.status === 401) {
                handleUnauthorized();
                return new Promise(() => {}); // Prevent further execution
            }

            if (attempt === maxRetries) {
                console.error(`[API] Query failed after ${maxRetries} attempts.`, { query: normalizedQuery, params, error });
                throw error.response ? error.response.data.errors : error;
            }

            const isRetryable = !error.response || (error.response.status >= 500 && error.response.status <= 599);
            if (isRetryable) {
                console.warn(`[API] Attempt ${attempt} failed. Retrying in ${delay / 1000}s...`);
                await wait(delay);
                delay *= 2;
            } else {
                console.error("[API] Non-retryable error encountered.", error);
                throw error.response ? error.response.data.errors : error;
            }
        }
    }
};

/**
 * Performs a GraphQL query using a "Network-First, Cache-Fallback" strategy.
 * - Tries to fetch fresh data from the network.
 * - If the network fails, it falls back to serving data from the local cache.
 *
 * @param {string} queryString - The GraphQL query string.
 * @param {object} params - The query variables.
 * @returns {Promise<any>} The freshest available data.
 */
const query = async (queryString, params) => {
    const normalizedQuery = normalizeGql(queryString);
    // Note: The cache key no longer includes params to ensure the same query always hits the same cache,
    // which is typical for GraphQL where variations are handled by the query structure itself.
    // If your params truly change the resource, consider including them in the key: `${normalizedQuery}:${JSON.stringify(params)}`
    const cacheKey = `${normalizedQuery}`;

    try {
        // 1. Always attempt to get fresh data from the network first.
        const freshData = await fetchWithRetries(normalizedQuery, cacheKey, params);
        return freshData;
    } catch (networkError) {
        // 2. If the network fails, try to use the cache as a fallback.
        console.warn(`[Cache Fallback] Network request failed for ${cacheKey}. Attempting to use local cache.`, networkError);
        
        const storedData = localStorage.getItem(cacheKey);
        if (storedData) {
            try {
                const cachedData = JSON.parse(storedData);
                queryCache[cacheKey] = cachedData; // Hydrate in-memory cache
                console.log(`[Cache Fallback] Serving stale data for ${cacheKey}.`);
                return cachedData;
            } catch (parseError) {
                console.error(`[Cache Fallback] Failed to parse cached data for ${cacheKey}. Removing invalid item.`, parseError);
                localStorage.removeItem(cacheKey);
                // The cache was corrupt, so we must throw the original network error.
                throw networkError;
            }
        } else {
            // 3. If the network fails and there's no cache, it's a hard error.
            console.error(`[Cache Fallback] Network failed and no cache was available for ${cacheKey}.`);
            throw networkError;
        }
    }
};


/**
 * Performs a GraphQL mutation.
 * (Mutations are not cached to prevent unintended side-effects).
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