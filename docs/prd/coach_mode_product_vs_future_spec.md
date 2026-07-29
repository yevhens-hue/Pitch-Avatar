# Coach Mode — Product Version vs. Future Backlog Specification

## Overview

This specification documents the current live **Product Version (Current Production Version)** of Coach Mode in Pitch Avatar, as well as the deferred **Future Extension Version (Backlog Architecture)**.

---

## 1. Product Version (Current Live Architecture)

The Current Product Version is deployed and live at `https://pitch-avatar-lab.vercel.app/chat-avatar/create`.

### Key Features & Design Principles:

1. **Single Editable Q&A Set per Avatar:**
   - Instead of a complex multi-set manager, each avatar has a single active Q&A training set.
   - The set name (default: `Default Coach Q&A Set`) is displayed in the set header and can be edited inline by clicking the pencil icon ✏️.
   - The legacy `Active Set:` dropdown toolbar and `+ New Set` button are **hidden** in this version to simplify user experience.

2. **Interactive Setup Checkboxes (Default: Unchecked `false`):**
   - Both interactive setup checkboxes are **unchecked by default**:
     - ☐ **`Do you want to connect a Knowledge Base now?`**
       - When checked, reveals the `KnowledgeBaseUI` component (`Content for Tests`).
     - ☐ **`Do you want to generate questions now?`**
       - When checked, reveals **BOTH** connected sections below:
         1. **`Generation Parameters`** (Amount, Difficulty, Language, Topic selection, and *Generate & add to Set* button).
         2. **`Test Set Card`** (Q&A questions table, *Save Set*, *+ Add manually*, and *Import CSV*).
       - When unchecked, both sections are hidden.

3. **Knowledge Base Target Scope:**
   - In Step 4 (`Knowledge Base`), users specify the scope for each source:
     - `General Avatar Base (Standard Q&A responses)`
     - `Coach Mode (Q&A Training Set questions)`
   - Every uploaded document/link in the Knowledge Base table displays a color-coded scope badge (`General Avatar Base` in blue, `Coach Mode` in amber) that double-functions as an interactive dropdown to re-assign scope on the fly.

4. **Slide-Decoupled Chat Avatars:**
   - For Chat Avatars without slides (`hasPresentation={false}`), slide-anchored timing options (*Before slides*, *On slides*, *After slides*) and slide-bound test format evaluation (*Text + slide*, *Correct slide only*) are **hidden**.
   - `Test format` dropdown offers clean `Text / voice` evaluation.

5. **100% English UI:**
   - All user-facing labels, buttons, tooltips, placeholders, and checkbox text are strictly in English.

---

## 2. Future Version (Backlog & Advanced Extensions)

The following features are saved in the backlog for future releases when multi-set management or presentation deck integration is required:

1. **Multi-Set Management (Sets Toolbar):**
   - **`Active Set:` Dropdown:** Allows users to switch between multiple created Q&A sets (e.g., *Product Demo Set*, *Objection Handling Set*, *Executive Pitch Set*).
   - **`+ New Set` Button:** Opens a modal/input to create and name additional Q&A sets within a single project.

2. **Topic Filter Toolbar (`Filter Topic`):**
   - Filter pills toolbar (`All`, `Product`, `Price`, `Objection`, `Technical`, `Discovery`, `ROI`, `Competitors`, `Use_case`) above the question table.
   - Allows users to filter displayed questions by specific topic tags.

3. **Slide-Anchored Presentation Flow (`Question timing`):**
   - For presentation deck projects (`hasPresentation={true}`):
     - `Before slides`: Ask questions before revealing slide content.
     - `On slides`: Anchor questions to specific slide transitions.
     - `After slides`: Perform Q&A round after presentation finishes.
   - Test formats evaluate slide navigation (`Text + slide`, `Correct slide only`).

---

## Summary Matrix

| Feature | Current Product Version (Live) | Future Extension Version (Backlog) |
| :--- | :--- | :--- |
| **Q&A Set Architecture** | Single Editable Set (`Default Coach Q&A Set`) | Multi-Set Selector (`Active Set:` + `+ New Set`) |
| **Topic Filter Bar** | Hidden (All questions listed) | Enabled (`Filter Topic:` pills) |
| **Interactive Checkboxes Default** | `false` (Unchecked) | N/A |
| **Checkbox 2 Scope** | Wraps `Generation Parameters` + `Test Set Card` | N/A |
| **KB Target Scope** | Interactive Badge / Dropdown in table | Static scope assignment |
| **Slide Timing Options** | Hidden for Chat Avatars (`hasPresentation={false}`) | Visible for Presentation Decks |
| **UI Language** | 100% English | 100% English |
