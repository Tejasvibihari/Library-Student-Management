import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import adminRouter from './router/adminAuth.js';
import studentRouter from './router/studentRouter.js';
import studentAuthRouter from './router/studentAuthRouter.js';
import mailRouter from './router/mailRouter.js';
import paymentRouter from './router/paymentRoute.js';
import seatRouter from './router/seatRoute.js';
import updateRouter from './router/updateRoute.js'
import testimonialRouter from './router/testimonialRoute.js';
import invoiceRouter from './router/invoiceRouter.js';
import './utils/scheduler/PaymentStatus.js';
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

// Add request timeout middleware
app.use((req, res, next) => {
    // Set request timeout to 60 seconds
    req.setTimeout(60000, () => {
        console.log('Request timeout for:', req.url);
        if (!res.headersSent) {
            res.status(408).json({ error: 'Request timeout' });
        }
    });
    
    // Handle request abortion
    req.on('aborted', () => {
        console.log('Request aborted by client:', req.url, req.method);
    });
    
    next();
});

// Improved CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing with better error handling
app.use(express.json({ 
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

app.use(express.urlencoded({ 
    limit: '50mb', 
    extended: true,
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.send("Hello World");
});

// Your routes
app.use('/api/admin/auth/', adminRouter);
app.use('/api/student/', studentRouter);
app.use('/api/student/auth', studentAuthRouter);
app.use('/api/mail/', mailRouter);
app.use('/api/payment/', paymentRouter);
app.use('/api/seat/', seatRouter);
app.use('/api/update/', updateRouter);
app.use('/api/testimonial/', testimonialRouter);
app.use('/api/invoice/', invoiceRouter);

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    
    if (error.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'CORS policy violation' });
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('aborted')) {
        console.log('Request was aborted by client');
        return; // Don't send response as connection is already closed
    }
    
    if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Define the uploads directory path
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const server = app.listen(port, () => {
    console.log(`Connected to PORT ${port}...`);
});

// Set server timeout
server.timeout = 120000; // 2 minutes
server.keepAliveTimeout = 61000; // 61 seconds
server.headersTimeout = 62000; // 62 seconds
