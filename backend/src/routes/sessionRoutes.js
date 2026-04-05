const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const sessionController = require('../controllers/sessionController');
const { authenticate } = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOC files are allowed'), false);
        }
    }
});

router.post('/create', authenticate, sessionController.createSession);
router.get('/:sessionId', authenticate, sessionController.getSession);
router.get('/join/:sessionId', authenticate, sessionController.joinSession);
router.post('/share', authenticate, sessionController.shareResource);

router.post('/upload', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

module.exports = router;
