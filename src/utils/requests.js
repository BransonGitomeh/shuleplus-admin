import axios from "axios"

let API;

if (window.location.href.includes('localhost')) {
    API = `http://localhost:4001`
    // API = `https://development-smartkids.herokuapp.com`
} else {
    API = `https://development-smartkids.herokuapp.com`
}

const query = (query, params) => {
    // make request to the server
    return new Promise(async (resolve, reject) => {
        try {
            const { data: { data } } = await axios.post(`${API}/graph`, {
                query
            }, {
                headers: {
                    authorization: localStorage.getItem("authorization")
                }
            })

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
            reject(error.response.data.errors)
        }
    })
}

export {
    query,
    mutate,
    API
}