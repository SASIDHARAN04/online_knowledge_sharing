const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate } = require('../middlewares/auth');

// Public routes
router.get('/', courseController.getAllCourses);

// Protected routes
router.get('/teaching', authenticate, courseController.getMyTeachingCourses);
router.get('/learning', authenticate, courseController.getMyLearningCourses);
router.post('/', authenticate, courseController.createCourse);
router.post('/:courseId/enroll', authenticate, courseController.enrollInCourse);

module.exports = router;
