import os
import re

with open('src/app/enrollments/[[...slug]]/page.tsx', 'r') as f:
    original = f.read()

# 1. We need to add the imports at the top
imports = """import EnrollmentsTable from './components/EnrollmentsTable'
import EnrollmentsKanban from './components/EnrollmentsKanban'
import EnrollmentModal from './EnrollmentModal'
import { useEnrollmentForm, emptyFormState } from './hooks/useEnrollmentForm'
"""

# Replace imports
original = original.replace("import styles from './Enrollments.module.css'", "import styles from './Enrollments.module.css'\n" + imports)

# 2. Inside the component, remove the huge block of state and replace with useEnrollmentForm()
# Find line with `const [activeTab, setActiveTab]` and replace down to `const [showCustomResultDropdown`
state_start = original.find("const [activeTab, setActiveTab]")
state_end = original.find("const loadData = () => {")

if state_start != -1 and state_end != -1:
    # also remove emptyFormState from here since it's now in the hook
    form_state_hook = "\n  const form = useEnrollmentForm()\n  const { formData, setFormData, enableReminders, presenters, calendarUrl, dontSendOpenNotifications, bookCalendarOrStartAvatar, sendAnimatedGif, scheduledDate, scheduledTime, securityHumanDetection, securityAntiFraud, securityIdentityVerification, securityAntiImpersonation } = form\n\n  "
    original = original[:state_start] + form_state_hook + original[state_end:]


# 3. Replace the table rendering block
table_marker = "{/* ── Table view ── */}"
table_end_marker = "{/* ── Kanban view ── */}"
table_start_idx = original.find(table_marker)
table_end_idx = original.find(table_end_marker)

if table_start_idx != -1 and table_end_idx != -1:
    table_replacement = """{/* ── Table view ── */}
      {viewMode === 'table' && (
        <EnrollmentsTable
          styles={styles}
          enrollments={filteredEnrollments}
          selectedIds={selectedIds}
          visibleColumns={visibleColumns}
          isLoading={isLoading}
          isPending={isPending}
          toggleSelectAll={toggleSelectAll}
          toggleSelect={toggleSelect}
          handleCopyLink={handleCopyLink}
          handleOpenEdit={handleOpenEdit}
          activeInlineStatusId={activeInlineStatusId}
          setActiveInlineStatusId={setActiveInlineStatusId}
          handleInlineStatusChange={handleInlineStatusChange}
          activeGearId={activeGearId}
          setActiveGearId={setActiveGearId}
          handleOpenManual={handleOpenManual}
          handleUpdateWebLink={handleUpdateWebLink}
          handleDelete={handleDelete}
          getStatusClass={getStatusClass}
        />
      )}

      """
    original = original[:table_start_idx] + table_replacement + original[table_end_idx:]


# 4. Replace Kanban
kanban_marker = "{/* ── Kanban view ── */}"
kanban_end_marker = "{/* ── Modal (Create / Edit Enrollment) ── */}"
kanban_start_idx = original.find(kanban_marker)
kanban_end_idx = original.find(kanban_end_marker)

if kanban_start_idx != -1 and kanban_end_idx != -1:
    kanban_replacement = """{/* ── Kanban view ── */}
      {viewMode === 'kanban' && (
        <EnrollmentsKanban
          styles={styles}
          enrollments={enrollments}
          isLoading={isLoading}
          isPending={isPending}
          handleCopyLink={handleCopyLink}
          handleOpenEdit={handleOpenEdit}
          handleDelete={handleDelete}
        />
      )}

      """
    original = original[:kanban_start_idx] + kanban_replacement + original[kanban_end_idx:]

# 5. Replace Modal
modal_marker = "{/* ── Modal (Create / Edit Enrollment) ── */}"
modal_start_idx = original.find(modal_marker)
# Find the end of the file or the `</main>` closing
main_closing_idx = original.rfind("</main>")

if modal_start_idx != -1 and main_closing_idx != -1:
    modal_replacement = """{/* ── Modal (Create / Edit Enrollment) ── */}
      <EnrollmentModal
        isOpen={isOpen}
        closeModal={closeModal}
        handleSave={handleSave}
        editingId={editingId}
        listeners={listeners}
        projects={projects}
        groups={groups}
        styles={styles}
        form={form}
      />
    """
    original = original[:modal_start_idx] + modal_replacement + original[main_closing_idx:]

with open('src/app/enrollments/[[...slug]]/page.tsx', 'w') as f:
    f.write(original)

print("page.tsx refactored successfully")
