import React, { useState, useEffect } from 'react';
import { getMyLearningCourses, getAllCourses, enrollInCourse } from '../services/courseService';
import './LearningCourses.css';

/**
 * LearningCourses Component
 * Courses the user is currently learning
 * Progress overview
 */
const LearningCourses = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyCourses();
    fetchAllCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const data = await getMyLearningCourses();
      setMyCourses(data);
    } catch (error) {
      console.error('Failed to fetch my courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const data = await getAllCourses();
      setAllCourses(data);
    } catch (error) {
      console.error('Failed to fetch all courses:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId);
      setMessage('Successfully enrolled in course!');
      setTimeout(() => {
        setMessage('');
        fetchMyCourses();
        fetchAllCourses();
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to enroll in course');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="learning-courses">
      <div className="courses-header">
        <h2>My Learning Courses</h2>
        <button
          className="toggle-btn"
          onClick={() => setShowAllCourses(!showAllCourses)}
        >
          {showAllCourses ? 'Show My Courses' : 'Browse All Courses'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {showAllCourses ? (
        <div>
          <h3>Available Courses</h3>
          <div className="courses-grid">
            {allCourses.length > 0 ? (
              allCourses.map((course) => (
                <div key={course._id} className="course-card">
                  <h4>{course.title}</h4>
                  <p className="instructor">By: {course.instructor?.username || 'Unknown'}</p>
                  <p className="category">{course.category}</p>
                  <p className="description">{course.description}</p>
                  <div className="course-footer">
                    <span className="price">{course.price} points</span>
                    <button
                      className="enroll-btn"
                      onClick={() => handleEnroll(course._id)}
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-courses">No courses available</div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h3>Courses I'm Learning</h3>
          <div className="courses-grid">
            {myCourses.length > 0 ? (
              myCourses.map((course) => (
                <div key={course._id} className="course-card learning">
                  <h4>{course.title}</h4>
                  <p className="instructor">By: {course.instructor?.username || 'Unknown'}</p>
                  <p className="category">{course.category}</p>
                  <p className="description">{course.description}</p>
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '60%' }}></div>
                    </div>
                    <span className="progress-text">60% Complete</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-courses">
                <p>You're not enrolled in any courses yet.</p>
                <p>Browse available courses to start learning!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningCourses;
