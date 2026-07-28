const fs = require('fs');
const file = 'src/components/ShareEnrollModal/ShareEnrollModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add currentMode state
content = content.replace(
  "const [activeTab, setActiveTab] = useState(mode === 'enrollment' ? 'links' : 'general');",
  "const [currentMode, setCurrentMode] = useState<'share'|'enrollment'>(mode);\n  const [activeTab, setActiveTab] = useState(mode === 'enrollment' ? 'links' : 'general');"
);

// Add Top Tabs UI
const topTabsUI = `
        <div className={styles.topLevelTabs}>
          <button 
            className={\`\${styles.topTab} \${currentMode === 'share' ? styles.topTabActive : ''}\`}
            onClick={() => { setCurrentMode('share'); setActiveTab('general'); }}
          >
            <Share2 size={16} /> Share
          </button>
          <button 
            className={\`\${styles.topTab} \${currentMode === 'enrollment' ? styles.topTabActive : ''}\`}
            onClick={() => { setCurrentMode('enrollment'); setActiveTab('links'); }}
          >
            Enrollments
          </button>
        </div>
`;

content = content.replace(
  "<div className={styles.titleArea}>",
  topTabsUI + "\n          <div className={styles.titleArea}>"
);

fs.writeFileSync(file, content);
console.log("Updated ShareEnrollModal.tsx");
