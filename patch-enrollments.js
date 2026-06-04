const fs = require('fs');
const file = 'src/app/actions/enrollments.ts';
let code = fs.readFileSync(file, 'utf8');

// We need to patch getEnrollments
code = code.replace(
  /targetType: e\.target_type,\s*contentType: e\.content_type,\s*groupId: e\.group_id,\s*presenterIds: e\.presenter_ids,\s*bookCalendarOrStartAvatar: e\.book_calendar_or_start_avatar,/g,
  `targetType: e.target_type || 'Anonymous',
      contentType: e.content_type || 'Project',
      groupId: e.group_id,
      presenterIds: e.email_schedule?.presenter_ids || [],
      bookCalendarOrStartAvatar: e.email_schedule?.book_calendar_or_start_avatar || false,`
);

// We need to patch createEnrollment
code = code.replace(
  /email_schedule: enrollment\.emailSchedule \|\| \{\},\s*target_type: enrollment\.targetType,\s*content_type: enrollment\.contentType,\s*group_id: \(enrollment as any\)\.groupId,\s*presenter_ids: enrollment\.presenterIds \|\| \[\],\s*book_calendar_or_start_avatar: enrollment\.bookCalendarOrStartAvatar \|\| false,/g,
  `email_schedule: {
        ...(enrollment.emailSchedule || {}),
        presenter_ids: enrollment.presenterIds || [],
        book_calendar_or_start_avatar: enrollment.bookCalendarOrStartAvatar || false,
      },
      target_type: enrollment.targetType,
      content_type: enrollment.contentType,
      group_id: (enrollment as any).groupId,`
);

// We need to patch updateEnrollment
code = code.replace(
  /email_schedule: enrollment\.emailSchedule,\s*target_type: enrollment\.targetType,\s*content_type: enrollment\.contentType,\s*group_id: \(enrollment as any\)\.groupId,\s*presenter_ids: enrollment\.presenterIds,\s*book_calendar_or_start_avatar: enrollment\.bookCalendarOrStartAvatar,/g,
  `email_schedule: {
        ...(enrollment.emailSchedule || {}),
        ...(enrollment.presenterIds !== undefined && { presenter_ids: enrollment.presenterIds }),
        ...(enrollment.bookCalendarOrStartAvatar !== undefined && { book_calendar_or_start_avatar: enrollment.bookCalendarOrStartAvatar }),
      },
      target_type: enrollment.targetType,
      content_type: enrollment.contentType,
      group_id: (enrollment as any).groupId,`
);

fs.writeFileSync(file, code);
console.log("Patched!");
