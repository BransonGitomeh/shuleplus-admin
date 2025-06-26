import axios from "axios"

let API;

if (window.location.href.includes('localhost')) {
    API = `http://localhost:4001`
    // API = `https://development-smartkids.herokuapp.com`
} else {
   API = `https://cloud.shuleplus.co.ke/api`
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
            if (error.response)
                return reject(error.response.data.errors)

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