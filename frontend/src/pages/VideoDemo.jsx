import React from 'react';
import { useLocation } from 'react-router-dom';
import './DemoPages.css';

const VideoDemo = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const courseId = params.get('courseId');
  const teacherId = params.get('teacherId');

  return (
    <div className="demo-page">
      <h2>Video Demo</h2>
      <p>Course: {courseId}</p>
      <p>Teacher: {teacherId}</p>
      <div className="video-placeholder">
        <p>Video session placeholder — replace with real provider (Jitsi/Daily/Twilio)</p>
      </div>
    </div>
  );
};

export default VideoDemo;
