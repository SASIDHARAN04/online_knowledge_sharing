import React, { useState, useEffect } from 'react';
import { getMyTeachingCourses, createCourse } from '../services/courseService';
import './TeachCourses.css';

/**
 * TeachCourses Component
 * Courses or knowledge shared by the user
 * Create and manage teaching content
 */
const TeachCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getMyTeachingCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setMessage('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const newCourse = await createCourse(formData);
      setCourses([...courses, newCourse]);
      setFormData({ title: '', description: '', category: '', price: 0 });
      setShowForm(false);
      setMessage('Course created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to create course');
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="teach-courses">
      <div className="courses-header">
        <h2>My Teaching Courses</h2>
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Course'}
        </button>
      </div>

      {showForm && (
        <form className="course-form" onSubmit={handleSubmit}>
          <h3>Create New Course</h3>
          <input
            type="text"
            placeholder="Course Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Course Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows="4"
          />
          <input
            type="text"
            placeholder="Category (e.g., Programming, Design, Business)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price in Points"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
            min="0"
          />
          <button type="submit" className="submit-btn">Create Course</button>
        </form>
      )}

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="courses-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course._id} className="course-card">
              <h3>{course.title}</h3>
              <p className="category">{course.category}</p>
              <p className="description">{course.description}</p>
              <div className="course-footer">
                <span className="price">{course.price} points</span>
                <span className="students">{course.students?.length || 0} students</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-courses">
            <p>You haven't created any courses yet.</p>
            <p>Click "Create Course" to share your knowledge!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachCourses;
