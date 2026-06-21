import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Student from '../../models/studentModel.js';
import StudentV2 from '../../models/v2/studentModelV2.js';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export const generateSidMiddlewareV2 = async (req, res, next) => {
    try {
        // Legacy Student collection is still checked here because it will
        // eventually be migrated into StudentV2 — we don't want a freshly
        // generated sid to collide with a legacy sid that hasn't been
        // migrated yet. No artificial floor anymore: a brand new system
        // (both collections empty) starts sid at 1.
        const [lastLegacyStudent, lastV2Student] = await Promise.all([
            Student.findOne().sort({ sid: -1 }).lean(),
            StudentV2.findOne().sort({ sid: -1 }).lean()
        ]);
        const maxSid = Math.max(lastLegacyStudent?.sid || 0, lastV2Student?.sid || 0);
        req.sid = Number(req.body?.sid || maxSid + 1);
        next();
    } catch (err) {
        next(err);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = `${req.sid}${ext}`;
        req.savedFileName = fileName;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const studentUploadV2 = multer({ storage, fileFilter });