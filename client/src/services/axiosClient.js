import axios from 'axios'

const client = axios.create({
    baseURL: 'https://api.biharilibrary.in/',
    timeout: 10000
});

export default client;