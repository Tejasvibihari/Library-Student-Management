import multer from "multer";
import path from "path";
import fs from "fs";
import Student from "../models/studentModel.js";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: async (req, file, cb) => {
        try {
            let newSid;
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                const lastStudent = await Student.findOne().sort({ sid: -1 });
                newSid = lastStudent ? lastStudent.sid + 1 : 327;

                const existingSid = await Student.findOne({ sid: newSid });
                if (!existingSid) break;

                attempts++;
            }

            if (attempts >= maxAttempts) {
                return cb(new Error("Unable to generate unique student ID after multiple attempts"));
            }

            // ✅ Attach sid to request for controller usage
            req.sid = newSid;

            // ✅ Save file as sid + original extension
            const ext = path.extname(file.originalname);
            cb(null, `${newSid}${ext}`);

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
