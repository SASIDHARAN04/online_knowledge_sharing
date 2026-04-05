import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './DemoPages.css';

const DocsDemo = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const courseId = params.get('courseId');
  const teacherId = params.get('teacherId');
  const [content, setContent] = useState('Shared document content goes here...');

  return (
    <div className="demo-page">
      <h2>Shared Document Demo</h2>
      <p>Course: {courseId}</p>
      <p>Teacher: {teacherId}</p>
      <textarea
        className="doc-editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="doc-actions">
        <button onClick={() => alert('Simulated save: content length ' + content.length)}>Save (simulated)</button>
      </div>
    </div>
  );
};

export default DocsDemo;
