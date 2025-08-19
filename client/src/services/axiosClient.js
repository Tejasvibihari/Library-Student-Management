import axios from 'axios'

const client = axios.create({
    // baseURL: 'https://api.biharilibrary.in/',
    baseURL: 'http://localhost:3000/',
    timeout: 20000
});

export default client;
