import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

const submissionDetailsNode = document.querySelector('.submission-details');
const appRoot = document.createElement('div');
submissionDetailsNode.after(appRoot);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>, appRoot
);
