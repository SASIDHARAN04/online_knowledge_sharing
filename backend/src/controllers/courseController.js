const Course = require('../models/Course');
const User = require('../models/User');

/**
 * Course Controller
 * Handles course-related operations
 */

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'username email role skills')
      .populate('students', 'username email');
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get courses taught by current user
const getMyTeachingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('students', 'username email');
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get courses user is learning
const getMyLearningCourses = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user._id })
      .populate('instructor', 'username email role skills');
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new course
const createCourse = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    
    const course = new Course({
      title,
      description,
      category,
      price: price || 0,
      instructor: req.user._id,
      students: []
    });

    await course.save();
    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'username email role skills');

    res.status(201).json({
      message: 'Course created successfully',
      course: populatedCourse
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating course', error: error.message });
  }
};

// Enroll in a course
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Check if user has enough points
    const user = await User.findById(req.user._id);
    if (user.points < course.price) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Deduct points and enroll
    user.points -= course.price;
    await user.save();

    course.students.push(req.user._id);
    await course.save();

    // Award points to instructor
    const instructor = await User.findById(course.instructor);
    instructor.points += course.price;
    await instructor.save();

    res.json({ message: 'Enrolled successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllCourses,
  getMyTeachingCourses,
  getMyLearningCourses,
  createCourse,
  enrollInCourse
};
