import React, { useState } from 'react';
import styles from './ProjectEditor.module.css';

const ProjectEditor: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(1);
  const [script, setScript] = useState('');

  return (
    <div className={styles.container}>
      {/* Left Panel: Slides Management */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Slides</h3>
        <div className={styles.slideList}>
          {[1, 2, 3].map((slide) => (
            <div 
              key={slide}
              className={`${styles.slideItem} ${activeSlide === slide ? styles.active : ''}`}
              onClick={() => setActiveSlide(slide)}
            >
              Slide {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel: Script and Stage */}
      <div className={`${styles.panel} ${styles.mainEditor}`}>
        <div className={styles.previewArea}>
          <span style={{opacity: 0.5}}>Slide {activeSlide} Visual Preview</span>
        </div>
        <div>
          <h3 className={styles.panelTitle}>Script Editor</h3>
          <textarea 
            className={styles.scriptEditor}
            placeholder="Enter script for this slide..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />
        </div>
      </div>

      {/* Right Panel: Avatar Settings */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Avatar Settings</h3>
        <div className={styles.avatarPreview}></div>
        
        <div className={styles.settingGroup}>
          <label>Avatar Voice</label>
          <select className={styles.select}>
            <option>Rachel (Professional)</option>
            <option>Drew (Casual)</option>
          </select>
        </div>

        <div className={styles.settingGroup}>
          <label>Avatar Position</label>
          <select className={styles.select}>
            <option>Bottom Right</option>
            <option>Bottom Left</option>
            <option>Hidden (Voice Only)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
