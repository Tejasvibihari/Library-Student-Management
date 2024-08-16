import axios from 'axios'

const client = axios.create({
    baseURL: process.env.BASE_URL,
    timeout: 10000
});

export default client;