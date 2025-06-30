import axios from "axios"

let API;

if (window.location.href.includes('localhost')) {
    API = `http://localhost:4001`
} else {
    API = `https://cloud.shuleplus.co.ke/api`
}

/**
 * Handles a 401 Unauthorized response from the API.
 * This function will clear all user-specific data from localStorage,
 * keeping only essential application state, and then redirect to the homepage.
 */
const handleUnauthorized = () => {
    console.error("Unauthorized request. Logging out user.");

    // Define which keys to preserve in localStorage
    const keysToKeep = ['school', 'learningState'];
    const preservedData = {};

    // Save the values of the keys we want to keep
    keysToKeep.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            preservedData[key] = value;
        }
    });

    // Clear all items from localStorage
    localStorage.clear();

    // Restore the preserved items
    for (const key in preservedData) {
        localStorage.setItem(key, preservedData[key]);
    }

    // Redirect to the root page (login page)
    window.location.href = '/';
}


const queryCache = {}

const query = (query, params) => {
    // make request to the server
    return new Promise(async (resolve, reject) => {
        const cacheKey = `${query}${JSON.stringify(params)}`

        if (queryCache[cacheKey]) {
            return resolve(queryCache[cacheKey])
        }

        try {
            const { data: { data } } = await axios.post(`${API}/graph`, {
                query,
                ...params
            }, {
                headers: {
                    authorization: localStorage.getItem("authorization")
                }
            })

            localStorage.setItem(cacheKey, JSON.stringify(data))
            queryCache[cacheKey] = data

            resolve(data)
        } catch (error) {
            // *** MODIFICATION HERE ***
            // Check for a 401 Unauthorized error first
            if (error.response && error.response.status === 401) {
                return handleUnauthorized(); // The function will handle redirection
            }

            // Continue with original error handling for other errors
            if (error.response) {
                return reject(error.response.data.errors)
            }

            reject(error)
        }
    })
}

const mutate = (query, variables) => {
    // make request to the server
    return new Promise(async (resolve, reject) => {
        try {
            const { data: { data } } = await axios.post(`${API}/graph`, {
                query,
                variables
            }, {
                headers: {
                    authorization: localStorage.getItem("authorization")
                }
            })

            resolve(data)
        } catch (error) {
            // *** MODIFICATION HERE ***
            // Check for a 401 Unauthorized error first
            if (error.response && error.response.status === 401) {
                return handleUnauthorized(); // The function will handle redirection
            }

            // Continue with original error handling for other errors
            console.log(error)
            reject(error?.response?.data?.errors)
        }
    })
}

export {
    query,
    mutate,
    API
}