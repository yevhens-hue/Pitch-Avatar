const fs = require('fs');
const file = 'src/app/enrollments/EnrollmentModal/index.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Wrap the return statement in <>
code = code.replace(
  '  return (\n        <div className={styles.wideModalOverlay}',
  '  return (\n    <>\n        <div className={styles.wideModalOverlay}'
);

// 2. Fix the closing tag of wideModalOverlay (remove `)}`)
code = code.replace(
  `          </div>
        </div>
      )}

      {/* ── Manual Override Modal ── */}`,
  `          </div>
        </div>

      {/* ── Manual Override Modal ── */}`
);

// 3. Fix the missing closing tags at the very end
const target = `<select id="manualStatus" className={styles.input} value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as typeof manualStatus)}>
                  <option value="Completed">Completed (Passed)</option>
                  <option value="Failed">Failed (Not Passed)</option>
                </select>

  )
}`;

const replacement = `<select id="manualStatus" className={styles.input} value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as typeof manualStatus)}>
                  <option value="Completed">Completed (Passed)</option>
                  <option value="Failed">Failed (Not Passed)</option>
                </select>
              </div>
              <div className={styles.modalFooter} style={{ padding: '24px 0 0', background: 'transparent', border: 'none', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className={styles.btnSecondary} onClick={() => setIsManualOpen(false)}>Cancel</button>
                <button className={styles.btnPrimary} onClick={handleManualSubmit}>Save Result</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
  console.log("Fixed end tags!");
} else {
  // If we already appended the tags in the previous run, we should just ensure `)}` is removed.
  fs.writeFileSync(file, code);
  console.log("Written without end tags replacement!");
}

