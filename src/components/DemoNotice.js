import React from 'react';
import './DemoNotice.css';

const DemoNotice = () => {
  return (
    <div className="demo-notice-banner">
      <div className="demo-notice-content">
        <span className="demo-icon">🎯</span>
        <span className="demo-text">演示模式</span>
        <span className="demo-description">数据保存在浏览器本地存储中</span>
      </div>
    </div>
  );
};

export default DemoNotice; 