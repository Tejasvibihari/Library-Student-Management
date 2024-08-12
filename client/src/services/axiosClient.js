import axios from 'axios'

const client = axios.create({
    // baseURL: 'https://bihari-traders-api.onrender.com',
    baseURL: 'http://localhost:3000',
    // baseURL: 'https://library-student-management-api.onrender.com/',
    timeout: 10000
});

export default client;