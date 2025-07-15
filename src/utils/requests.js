import axios from "axios";

let API;

// No change to API endpoint logic
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
    // This logic to preserve some keys is fine
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

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Internal function to execute a GraphQL request with a retry mechanism.
 * This function ONLY fetches from the network and does not use any cache.
 * @param {string} query - The GraphQL query string.
 * @param {object} variables - The query variables.
 * @param {boolean} isMutation - A flag to adjust logging.
 * @returns {Promise<any>} The data from the server.
 * @throws Will throw an error if all retry attempts fail.
 */
const _executeRequestWithRetries = async (query, variables, isMutation = false) => {
    const maxRetries = 3; // A more reasonable number of retries
    let delay = 1000; // 1 second initial delay

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const { data } = await axios.post(`${API}/graph`, {
                query,
                variables
            }, {
                headers: { authorization: localStorage.getItem("authorization") }
            });

            // GraphQL can return errors in a 200 OK response, so check for them.
            if (data.errors) {
                console.error("GraphQL Errors:", data.errors);
                // GraphQL errors are usually not retryable (e.g., bad query), so we throw immediately.
                throw data.errors;
            }

            // Success!
            return data.data;

        } catch (error) {
            // Check for Axios error structure where the server response is available
            if (error.response) {
                if (error.response.status === 401) {
                    handleUnauthorized();
                    // Return a promise that never resolves to halt the execution chain
                    return new Promise(() => {});
                }

                // Decide if the error is retryable (e.g., server overload, network glitch)
                const isRetryable = error.response.status >= 500 && error.response.status <= 599;

                if (isRetryable && attempt < maxRetries) {
                    console.warn(`[API] Attempt ${attempt} failed. Retrying in ${delay / 1000}s...`);
                    await wait(delay);
                    delay *= 2; // Exponential backoff
                    continue; // Go to the next iteration of the loop
                }
            }
            
            // If we are here, it's either the last attempt or a non-retryable error.
            const requestType = isMutation ? "Mutation" : "Query";
            console.error(`[API] ${requestType} failed after ${attempt} attempts.`, {
                query,
                variables,
                error
            });

            // Throw the most specific error information available
            throw error.response?.data?.errors || error.response?.data || error;
        }
    }
};

/**
 * Performs a GraphQL query.
 * ALWAYS fetches from the network.
 * Provides a result via both a callback and a resolving Promise.
 *
 * @param {string} queryString - The GraphQL query string.
 * @param {object} params - The query variables.
 * @param {function} [callback] - An optional callback to be executed with the data on success.
 * @returns {Promise<any>} A promise that resolves with the data on success or rejects on failure.
 */
export const query = (queryString, params, callback) => {
    // We return a new Promise to handle both the callback and promise-based (.then/.catch) flows.
    return new Promise((resolve, reject) => {
        _executeRequestWithRetries(queryString, params, false)
            .then(data => {
                // On success, first execute the callback if it was provided.
                if (callback && typeof callback === 'function') {
                    try {
                        callback(data);
                    } catch (cbError) {
                        console.error("Error in query success callback:", cbError);
                        // The main operation succeeded, so we don't reject the promise, just log the error.
                    }
                }
                // Then, resolve the promise with the data.
                resolve(data);
            })
            .catch(error => {
                // On failure, reject the promise. The error is already logged.
                reject(error);
            });
    });
};

/**
 * Performs a GraphQL mutation.
 * @param {string} queryString - The GraphQL mutation string.
 * @param {object} variables - The mutation variables.
 * @returns {Promise<any>} A promise that resolves with the mutation result or rejects on failure.
 */
export const mutate = async (queryString, variables) => {
    // For mutate, we can just return the result of the execution function directly.
    return _executeRequestWithRetries(queryString, variables, true);
};

export { API };