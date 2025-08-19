import multer from "multer";
import path from "path";
import fs from "fs";
import Student from "../models/studentModel.js";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Middleware to generate SID before multer runs
export const generateSidMiddleware = async (req, res, next) => {
    try {
        const lastStudent = await Student.findOne().sort({ sid: -1 }).lean();
        const newSid = lastStudent ? lastStudent.sid + 1 : 327;
        req.sid = newSid;
        next();
    } catch (err) {
        next(err);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        try {
            const ext = path.extname(file.originalname);
            const fileName = `${req.sid}${ext}`;
            req.savedFileName = fileName;
            cb(null, fileName);
        } catch (err) {
            cb(err);
        }
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

export const studentUpload = multer({ storage, fileFilter });
