import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import socketIo from ('socket.io');
import adminRouter from './router/adminAuth.js'
import studentRouter from './router/studentRouter.js'

import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// mongoose.connect("mongodb+srv://tejasvibihari2000:z1VS5wWSKyakzfds@bihari.kup0kde.mongodb.net/?retryWrites=true&w=majority")
mongoose.connect("mongodb://localhost:27017/studentLibrary")
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error(`Could not connect to MongoDB... + ${err}`));

const io = socketIo(server, {
    cors: {
        origin: "*", // Adjust as needed for security
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    // origin: 'https://bihari-traders.vercel.app',
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Add OPTIONS to methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.use('/api/admin/auth/', adminRouter);
app.use('/api/student/', studentRouter);





app.listen(port, (req, res) => {
    console.log(`Connected to PORT ${port}...`)
})