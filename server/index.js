import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import adminRouter from './router/adminAuth.js';
import studentRouter from './router/studentRouter.js';
import studentAuthRouter from './router/studentAuthRouter.js';
import mailRouter from './router/mailRouter.js';
import paymentRouter from './router/paymentRoute.js';
import seatRouter from './router/seatRoute.js';
// import './utils/scheduler/PaymentStatus.js';
import './utils/scheduler/seatStatus.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Define __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => {
        console.error(`Could not connect to MongoDB... + ${err}`);
    });

const allowedOrigins = ['http://localhost:5173', 'https://biharilibrary.in'];

app.use(cors({
    origin: function (origin, callback) {
        // console.log('Origin:', origin); // Log the origin
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // console.log('Blocked by CORS:', origin); // Log blocked origins
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.options('*', cors());

app.use(express.json({ limit: '50mb' })); // For JSON requests
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For URL-encoded requests

app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use('/api/admin/auth/', adminRouter);
app.use('/api/student/', studentRouter);
app.use('/api/student/auth', studentAuthRouter);
app.use('/api/mail/', mailRouter);
app.use('/api/payment/', paymentRouter);
app.use('/api/seat/', seatRouter);

// Define the uploads directory path
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.listen(port, (req, res) => {
    console.log(`Connected to PORT ${port}...`);
});