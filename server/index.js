import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import adminRouter from './router/adminAuth.js'
import studentRouter from './router/studentRouter.js'
import mailRouter from './router/mailRouter.js'
// import './utils/scheduler/PaymentStatus.js'
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// mongoose.connect("mongodb+srv://tejasvibihari2000:z1VS5wWSKyakzfds@bihari.kup0kde.mongodb.net/?retryWrites=true&w=majority")
mongoose.connect("mongodb+srv://allinone801109:r7hF5NImT2KgOg3H@cluster0.rpizybi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
// mongoose.connect("mongodb://localhost:27017/studentLibrary")
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => {
        console.error(`Could not connect to MongoDB... + ${err}`);
    });


const allowedOrigins = ['http://localhost:5173', 'https://biharilibrary.vercel.app'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '50mb' })); // For JSON requests
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For URL-encoded requests

app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.use('/api/admin/auth/', adminRouter);
app.use('/api/student/', studentRouter);
app.use('/api/mail/', mailRouter);





app.listen(port, (req, res) => {
    console.log(`Connected to PORT ${port}...`)
})