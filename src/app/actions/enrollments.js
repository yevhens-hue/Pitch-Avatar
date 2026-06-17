'use server';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrollments = getEnrollments;
exports.getEnrollmentStats = getEnrollmentStats;
exports.getGroups = getGroups;
exports.getPresenters = getPresenters;
exports.getCourses = getCourses;
exports.getEnrollmentLinks = getEnrollmentLinks;
exports.generateEnrollmentLinks = generateEnrollmentLinks;
exports.createEnrollment = createEnrollment;
exports.updateEnrollment = updateEnrollment;
exports.deleteEnrollment = deleteEnrollment;
exports.manualEnterResult = manualEnterResult;
exports.calculateActiveSeats = calculateActiveSeats;
exports.getSeatsQuota = getSeatsQuota;
exports.updateSeatsQuota = updateSeatsQuota;
exports.getMailDomain = getMailDomain;
exports.saveMailDomain = saveMailDomain;
exports.getEnrollmentByLinkId = getEnrollmentByLinkId;
exports.updateEnrollmentStatusAction = updateEnrollmentStatusAction;
var supabase_1 = require("@/lib/supabase");
var cache_1 = require("next/cache");
var email_1 = require("@/lib/email");
/**
 * ── Enrollments CRUD ──────────────────────────────────────────────────────────
 */
function getEnrollments(options) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, search, status, groupName, _c, sortBy, _d, sortOrder, limit, _e, offset, query, sortByMap, dbSortBy, _f, enrollments, enrollError, count, joined, finalData, term_1;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _a = options || {}, _b = _a.search, search = _b === void 0 ? '' : _b, status = _a.status, groupName = _a.groupName, _c = _a.sortBy, sortBy = _c === void 0 ? 'created_at' : _c, _d = _a.sortOrder, sortOrder = _d === void 0 ? 'desc' : _d, limit = _a.limit, _e = _a.offset, offset = _e === void 0 ? 0 : _e;
                    query = supabase_1.supabase
                        .from('enrollments')
                        .select("\n      *,\n      projects(title),\n      listeners(email, first_name, last_name),\n      groups".concat(groupName && groupName !== 'All Group' ? '!inner' : '', "(name)\n    "), { count: 'exact' });
                    // Apply status filter
                    if (status && status !== 'All Status') {
                        query = query.eq('status', status);
                    }
                    // Apply group filter
                    if (groupName && groupName !== 'All Group') {
                        query = query.eq('groups.name', groupName);
                    }
                    // Apply search
                    if (search.trim()) {
                        query = query.ilike('title', "%".concat(search, "%"));
                    }
                    sortByMap = {
                        createdAt: 'created_at',
                        startDate: 'start_date',
                        projectTitle: 'project_id',
                        listenerName: 'listener_id',
                    };
                    dbSortBy = sortByMap[sortBy] || sortBy;
                    // Apply sorting
                    // Handle specific sort keys that are from joined tables
                    if (dbSortBy === 'project_id') {
                        // Note: sorting by joined tables requires an RPC or View in Supabase.
                        // For now, we fallback to project_id sort.
                        query = query.order('project_id', { ascending: sortOrder === 'asc' });
                    }
                    else if (dbSortBy === 'listener_id') {
                        query = query.order('listener_id', { ascending: sortOrder === 'asc' });
                    }
                    else {
                        // default sorts on the enrollment table columns like created_at, start_date, status
                        query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });
                    }
                    // Apply pagination
                    if (limit) {
                        query = query.range(offset, offset + limit - 1);
                    }
                    return [4 /*yield*/, query];
                case 1:
                    _f = _g.sent(), enrollments = _f.data, enrollError = _f.error, count = _f.count;
                    if (enrollError) {
                        console.error('Error fetching enrollments:', enrollError);
                        return [2 /*return*/, { data: [], count: 0 }];
                    }
                    joined = enrollments.map(function (e) {
                        var _a, _b;
                        var result = {
                            id: e.id,
                            title: e.title,
                            listenerId: e.listener_id,
                            projectId: e.project_id,
                            status: e.status,
                            startDate: e.start_date,
                            expirationDays: e.expiration_days,
                            expiresAt: e.expires_at,
                            emailSchedule: e.email_schedule || {},
                            createdAt: e.created_at,
                            targetType: e.target_type || 'Anonymous',
                            contentType: e.content_type || 'Project',
                            groupId: e.group_id,
                            presenterIds: ((_a = e.email_schedule) === null || _a === void 0 ? void 0 : _a.presenter_ids) || [],
                            bookCalendarOrStartAvatar: ((_b = e.email_schedule) === null || _b === void 0 ? void 0 : _b.book_calendar_or_start_avatar) || false,
                            progress: e.progress,
                            timeSpent: e.time_spent,
                            score: e.score,
                            videoRecording: e.video_recording,
                            groupName: e.groups ? e.groups.name : undefined,
                            projectTitle: e.projects ? e.projects.title : 'Unknown Project',
                            listenerName: e.listeners ? "".concat(e.listeners.first_name || '', " ").concat(e.listeners.last_name || '').trim() : 'Anonymous',
                            listenerEmail: e.listeners ? e.listeners.email : 'Anonymous',
                        };
                        if (e.expires_at && new Date(e.expires_at) < new Date() && result.status !== 'Completed' && result.status !== 'Expired') {
                            result.status = 'Expired';
                            // Optimistically update DB async
                            supabase_1.supabase.from('enrollments').update({ status: 'Expired' }).eq('id', e.id).then();
                        }
                        return result;
                    });
                    finalData = joined;
                    if (search.trim()) {
                        term_1 = search.toLowerCase();
                        finalData = joined.filter(function (e) {
                            var _a, _b, _c;
                            return ((_a = e.projectTitle) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(term_1)) ||
                                ((_b = e.listenerName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(term_1)) ||
                                ((_c = e.listenerEmail) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(term_1)) ||
                                e.title.toLowerCase().includes(term_1);
                        });
                    }
                    return [2 /*return*/, { data: finalData, count: count || 0 }];
            }
        });
    });
}
function getEnrollmentStats() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, allEnrollments, error, activeCount, uniqueListeners, completedCount, totalCount, completionRate;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('enrollments')
                        .select('status, listener_id')];
                case 1:
                    _a = _b.sent(), allEnrollments = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching enrollment stats:', error);
                        return [2 /*return*/, { activeCount: 0, uniqueListeners: 0, completionRate: 0 }];
                    }
                    activeCount = allEnrollments.filter(function (e) { return e.status === 'In Progress' || e.status === 'Pending'; }).length;
                    uniqueListeners = new Set(allEnrollments.map(function (e) { return e.listener_id; }).filter(Boolean)).size;
                    completedCount = allEnrollments.filter(function (e) { return e.status === 'Completed'; }).length;
                    totalCount = allEnrollments.length;
                    completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
                    return [2 /*return*/, { activeCount: activeCount, uniqueListeners: uniqueListeners, completionRate: completionRate }];
            }
        });
    });
}
function getGroups() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase.from('groups').select('*').order('name')];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching groups:', error);
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, data];
            }
        });
    });
}
function getPresenters() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('presenters')
                        .select('*')
                        .order('first_name')];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching presenters:', error);
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, data];
            }
        });
    });
}
function getCourses() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, existingCourses, getCrsError, projectsData, newCourses, courseProjectsToInsert, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('courses')
                        .select('*')
                        .order('name')];
                case 1:
                    _a = _b.sent(), existingCourses = _a.data, getCrsError = _a.error;
                    if (getCrsError) {
                        console.error('Error fetching courses:', getCrsError);
                        return [2 /*return*/, []];
                    }
                    if (!(!existingCourses || existingCourses.length === 0)) return [3 /*break*/, 9];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, supabase_1.supabase.from('projects').select('id, title')];
                case 3:
                    projectsData = (_b.sent()).data;
                    if (!(projectsData && projectsData.length > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, supabase_1.supabase
                            .from('courses')
                            .insert([
                            { name: 'Onboarding & Training Pack' },
                            { name: 'Sales & Product Pitch' }
                        ])
                            .select()];
                case 4:
                    newCourses = (_b.sent()).data;
                    if (!(newCourses && newCourses.length > 0)) return [3 /*break*/, 7];
                    courseProjectsToInsert = [];
                    if (projectsData[0]) {
                        courseProjectsToInsert.push({ course_id: newCourses[0].id, project_id: projectsData[0].id });
                    }
                    if (projectsData[1]) {
                        courseProjectsToInsert.push({ course_id: newCourses[0].id, project_id: projectsData[1].id });
                    }
                    if (projectsData[projectsData.length - 1]) {
                        courseProjectsToInsert.push({ course_id: newCourses[1].id, project_id: projectsData[projectsData.length - 1].id });
                    }
                    if (!(courseProjectsToInsert.length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, supabase_1.supabase.from('course_projects').insert(courseProjectsToInsert)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [2 /*return*/, newCourses];
                case 7: return [3 /*break*/, 9];
                case 8:
                    err_1 = _b.sent();
                    console.error('Failed to seed courses mock:', err_1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, existingCourses || []];
            }
        });
    });
}
function getEnrollmentLinks(enrollmentId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('enrollment_links')
                        .select("\n      *,\n      listeners(email, first_name, last_name),\n      projects(title)\n    ")
                        .eq('assignment_id', enrollmentId)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching enrollment links:', error);
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, data.map(function (l) { return ({
                            id: l.id,
                            assignmentId: l.assignment_id,
                            listenerId: l.listener_id,
                            projectId: l.project_id,
                            uniqueUrl: l.unique_url,
                            createdAt: l.created_at,
                            listenerName: l.listeners ? "".concat(l.listeners.first_name || '', " ").concat(l.listeners.last_name || '').trim() : 'Anonymous',
                            listenerEmail: l.listeners ? l.listeners.email : 'Anonymous',
                            projectTitle: l.projects ? l.projects.title : 'Project',
                        }); })];
            }
        });
    });
}
function generateEnrollmentLinks(enrollmentId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, enrollment, enrollError, listenerIds, grpListeners, projectIds, crsProjects, linksToInsert, _i, listenerIds_1, listenerId, _b, projectIds_1, projectId, randHex, appUrl, cleanAppUrl, uniqueUrl, insertError;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('enrollments')
                        .select('*')
                        .eq('id', enrollmentId)
                        .single()];
                case 1:
                    _a = _c.sent(), enrollment = _a.data, enrollError = _a.error;
                    if (enrollError || !enrollment) {
                        console.error('Error fetching enrollment for link generation:', enrollError);
                        throw new Error('Enrollment not found');
                    }
                    return [4 /*yield*/, supabase_1.supabase
                            .from('enrollment_links')
                            .delete()
                            .eq('assignment_id', enrollmentId)];
                case 2:
                    _c.sent();
                    listenerIds = [null];
                    if (!(enrollment.target_type === 'listener' && enrollment.listener_id)) return [3 /*break*/, 3];
                    listenerIds = [enrollment.listener_id];
                    return [3 /*break*/, 5];
                case 3:
                    if (!(enrollment.target_type === 'group' && enrollment.group_id)) return [3 /*break*/, 5];
                    return [4 /*yield*/, supabase_1.supabase
                            .from('listener_groups')
                            .select('listener_id')
                            .eq('group_id', enrollment.group_id)];
                case 4:
                    grpListeners = (_c.sent()).data;
                    if (grpListeners && grpListeners.length > 0) {
                        listenerIds = grpListeners.map(function (gl) { return gl.listener_id; });
                    }
                    _c.label = 5;
                case 5:
                    projectIds = [];
                    if (!(enrollment.content_type === 'project' && enrollment.project_id)) return [3 /*break*/, 6];
                    projectIds = [enrollment.project_id];
                    return [3 /*break*/, 8];
                case 6:
                    if (!(enrollment.content_type === 'course' && enrollment.project_id)) return [3 /*break*/, 8];
                    return [4 /*yield*/, supabase_1.supabase
                            .from('course_projects')
                            .select('project_id')
                            .eq('course_id', enrollment.project_id)];
                case 7:
                    crsProjects = (_c.sent()).data;
                    if (crsProjects && crsProjects.length > 0) {
                        projectIds = crsProjects.map(function (cp) { return cp.project_id; });
                    }
                    _c.label = 8;
                case 8:
                    if (projectIds.length === 0 && enrollment.project_id) {
                        projectIds = [enrollment.project_id];
                    }
                    linksToInsert = [];
                    for (_i = 0, listenerIds_1 = listenerIds; _i < listenerIds_1.length; _i++) {
                        listenerId = listenerIds_1[_i];
                        for (_b = 0, projectIds_1 = projectIds; _b < projectIds_1.length; _b++) {
                            projectId = projectIds_1[_b];
                            randHex = Math.random().toString(16).slice(2, 10);
                            appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pitch-avatar.com';
                            cleanAppUrl = appUrl.replace(/^https?:\/\//, '');
                            uniqueUrl = "".concat(appUrl, "/v/enroll-").concat(enrollmentId.slice(0, 8), "-").concat(randHex);
                            linksToInsert.push({
                                assignment_id: enrollmentId,
                                listener_id: listenerId,
                                project_id: projectId,
                                unique_url: uniqueUrl,
                                group_id: enrollment.group_id
                            });
                        }
                    }
                    if (!(linksToInsert.length > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, supabase_1.supabase
                            .from('enrollment_links')
                            .insert(linksToInsert)];
                case 9:
                    insertError = (_c.sent()).error;
                    if (insertError) {
                        console.error('Error inserting enrollment links:', insertError);
                        throw new Error(insertError.message);
                    }
                    _c.label = 10;
                case 10: return [2 /*return*/, getEnrollmentLinks(enrollmentId)];
            }
        });
    });
}
function createEnrollment(enrollment) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, _a, seatsData, seatsError, maxSeats, activeSeatsCount, newSeatsNeeded, activeEnrollments, activeListenerIds, grpListeners, startDateStr, expDays, expiresAtStr, expDate, _b, created, error, enrollmentId, _c, listenerRes, projectRes, generatedLinkRes, appUrl, enrollmentLink, res;
        var _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    userId = enrollment.userId || '00000000-0000-0000-0000-000000000000';
                    return [4 /*yield*/, supabase_1.supabase
                            .from('listener_seats')
                            .select('*')
                            .eq('user_id', userId)
                            .maybeSingle()
                        // If no record exists yet, default to 100. If record exists, use its value (could be 0).
                    ];
                case 1:
                    _a = _g.sent(), seatsData = _a.data, seatsError = _a.error;
                    maxSeats = seatsData !== null ? seatsData.max_seats : 1;
                    return [4 /*yield*/, calculateActiveSeats()
                        // Calculate new seats needed based on targetType
                    ];
                case 2:
                    activeSeatsCount = _g.sent();
                    newSeatsNeeded = 0;
                    return [4 /*yield*/, supabase_1.supabase
                            .from('enrollments')
                            .select('listener_id')
                            .in('status', ['Pending', 'In Progress'])];
                case 3:
                    activeEnrollments = (_g.sent()).data;
                    activeListenerIds = new Set((activeEnrollments === null || activeEnrollments === void 0 ? void 0 : activeEnrollments.map(function (e) { return e.listener_id; }).filter(Boolean)) || []);
                    if (!(enrollment.targetType === 'listener' && enrollment.listenerId)) return [3 /*break*/, 4];
                    if (!activeListenerIds.has(enrollment.listenerId)) {
                        newSeatsNeeded = 1;
                    }
                    return [3 /*break*/, 7];
                case 4:
                    if (!(enrollment.targetType === 'group' && enrollment.groupId)) return [3 /*break*/, 6];
                    return [4 /*yield*/, supabase_1.supabase
                            .from('listener_groups')
                            .select('listener_id')
                            .eq('group_id', enrollment.groupId)];
                case 5:
                    grpListeners = (_g.sent()).data;
                    if (grpListeners && grpListeners.length > 0) {
                        newSeatsNeeded += grpListeners.length;
                    }
                    return [3 /*break*/, 7];
                case 6:
                    // For anonymous or unassigned, assume at least 1 new seat is needed
                    newSeatsNeeded = 1;
                    _g.label = 7;
                case 7:
                    if (activeSeatsCount + newSeatsNeeded > maxSeats) {
                        throw new Error("QUOTA_EXCEEDED: You have reached your limit of ".concat(maxSeats, " active Enrollment Seats. Please upgrade your seat plan or archive active enrollments."));
                    }
                    startDateStr = enrollment.startDate || new Date().toISOString();
                    expDays = enrollment.expirationDays !== undefined ? enrollment.expirationDays : 14;
                    expiresAtStr = null;
                    if (expDays > 0) {
                        expDate = new Date(startDateStr);
                        expDate.setDate(expDate.getDate() + expDays);
                        expiresAtStr = expDate.toISOString();
                    }
                    return [4 /*yield*/, supabase_1.supabase
                            .from('enrollments')
                            .insert([{
                                title: enrollment.title || "Enrollment-".concat(Date.now()),
                                listener_id: enrollment.listenerId,
                                project_id: enrollment.projectId,
                                status: enrollment.status || 'Pending',
                                start_date: startDateStr,
                                expiration_days: expDays,
                                expires_at: expiresAtStr,
                                email_schedule: __assign(__assign({}, (enrollment.emailSchedule || {})), { presenter_ids: enrollment.presenterIds || [], book_calendar_or_start_avatar: enrollment.bookCalendarOrStartAvatar || false }),
                                target_type: enrollment.targetType,
                                content_type: enrollment.contentType,
                                group_id: enrollment.groupId,
                            }])
                            .select()];
                case 8:
                    _b = _g.sent(), created = _b.data, error = _b.error;
                    if (error) {
                        console.error('Error creating enrollment:', error);
                        throw new Error(error.message);
                    }
                    enrollmentId = created[0].id;
                    // Generate enrollment links based on target type and content type
                    return [4 /*yield*/, generateEnrollmentLinks(enrollmentId)
                        // Update active count in seats table
                    ];
                case 9:
                    // Generate enrollment links based on target type and content type
                    _g.sent();
                    // Update active count in seats table
                    return [4 /*yield*/, supabase_1.supabase
                            .from('listener_seats')
                            .update({ active_count: activeSeatsCount + 1 })
                            .eq('user_id', userId)
                        // Send Invitation Email if checked
                    ];
                case 10:
                    // Update active count in seats table
                    _g.sent();
                    if (!(((_d = enrollment.emailSchedule) === null || _d === void 0 ? void 0 : _d.sendInvite) && enrollment.listenerId)) return [3 /*break*/, 15];
                    console.log('Attempting to send invite email...', { listenerId: enrollment.listenerId, projectId: enrollment.projectId });
                    return [4 /*yield*/, Promise.all([
                            supabase_1.supabase.from('listeners').select('first_name, email').eq('id', enrollment.listenerId).single(),
                            supabase_1.supabase.from('projects').select('title').eq('id', enrollment.projectId).single(),
                            supabase_1.supabase.from('enrollment_links').select('unique_url').eq('assignment_id', enrollmentId).eq('listener_id', enrollment.listenerId).limit(1).maybeSingle()
                        ])];
                case 11:
                    _c = _g.sent(), listenerRes = _c[0], projectRes = _c[1], generatedLinkRes = _c[2];
                    console.log('Query results:', {
                        listener: listenerRes.data,
                        project: projectRes.data,
                        link: generatedLinkRes.data
                    });
                    if (!(listenerRes.data && projectRes.data)) return [3 /*break*/, 13];
                    appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pitch-avatar.com';
                    enrollmentLink = ((_e = generatedLinkRes.data) === null || _e === void 0 ? void 0 : _e.unique_url) || "".concat(appUrl, "/v/enroll-").concat(enrollmentId.slice(0, 8));
                    return [4 /*yield*/, (0, email_1.sendEnrollmentInvitation)(listenerRes.data.email, enrollment.emailSchedule.inviteSubject || 'Welcome to your onboarding training session', enrollment.emailSchedule.inviteBody || 'Hello {{listener_first_name}},\\n\\nYour interactive video presentation is ready! Please use the link below to get started.', {
                            listenerFirstName: listenerRes.data.first_name || '',
                            projectTitle: projectRes.data.title || '',
                            enrollmentLink: enrollmentLink
                        })];
                case 12:
                    res = _g.sent();
                    console.log('Resend response:', res);
                    return [3 /*break*/, 14];
                case 13:
                    console.log('Skipping email send because listener or project data is missing.');
                    _g.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    console.log('Not sending email. Condition failed:', { sendInvite: (_f = enrollment.emailSchedule) === null || _f === void 0 ? void 0 : _f.sendInvite, listenerId: enrollment.listenerId });
                    _g.label = 16;
                case 16:
                    (0, cache_1.revalidatePath)('/enrollments');
                    return [2 /*return*/, created[0]];
            }
        });
    });
}
function updateEnrollment(id, enrollment) {
    return __awaiter(this, void 0, void 0, function () {
        var expiresAtStr, expDate, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    expiresAtStr = undefined;
                    if (enrollment.expirationDays !== undefined && enrollment.expirationDays > 0) {
                        expDate = new Date(enrollment.startDate || new Date().toISOString());
                        expDate.setDate(expDate.getDate() + enrollment.expirationDays);
                        expiresAtStr = expDate.toISOString();
                    }
                    else if (enrollment.expirationDays === null || enrollment.expirationDays === 0) {
                        expiresAtStr = null;
                    }
                    return [4 /*yield*/, supabase_1.supabase
                            .from('enrollments')
                            .update(__assign(__assign({ title: enrollment.title, status: enrollment.status, start_date: enrollment.startDate }, (enrollment.expirationDays !== undefined && {
                            expiration_days: enrollment.expirationDays,
                            expires_at: expiresAtStr
                        })), { email_schedule: __assign(__assign(__assign({}, (enrollment.emailSchedule || {})), (enrollment.presenterIds !== undefined && { presenter_ids: enrollment.presenterIds })), (enrollment.bookCalendarOrStartAvatar !== undefined && { book_calendar_or_start_avatar: enrollment.bookCalendarOrStartAvatar })), target_type: enrollment.targetType, content_type: enrollment.contentType, group_id: enrollment.groupId }))
                            .eq('id', id)
                            .select()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error updating enrollment:', error);
                        throw new Error(error.message);
                    }
                    // Re-generate links to reflect any updated listeners, projects, group, or course
                    return [4 /*yield*/, generateEnrollmentLinks(id)];
                case 2:
                    // Re-generate links to reflect any updated listeners, projects, group, or course
                    _b.sent();
                    (0, cache_1.revalidatePath)('/enrollments');
                    return [2 /*return*/, data[0]];
            }
        });
    });
}
function deleteEnrollment(id) {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('enrollments')
                        .delete()
                        .eq('id', id)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error('Error deleting enrollment:', error);
                        throw new Error(error.message);
                    }
                    (0, cache_1.revalidatePath)('/enrollments');
                    return [2 /*return*/];
            }
        });
    });
}
function manualEnterResult(id, status, date) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('enrollments')
                        .update({
                        status: status,
                        start_date: date // Manual entry setting date and status overrides
                    })
                        .eq('id', id)
                        .select()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error in manual entry override:', error);
                        throw new Error(error.message);
                    }
                    (0, cache_1.revalidatePath)('/enrollments');
                    return [2 /*return*/, data[0]];
            }
        });
    });
}
/**
 * ── Billing / Seats Administration ──────────────────────────────────────────
 */
function calculateActiveSeats() {
    return __awaiter(this, void 0, void 0, function () {
        var activeEnrollments, now, validActive, activeListenerIds, anonymousCount, _i, validActive_1, ae, groupIds, grpListeners, _a, grpListeners_1, gl;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('enrollments')
                        .select('listener_id, target_type, group_id, expires_at')
                        .in('status', ['Pending', 'In Progress'])];
                case 1:
                    activeEnrollments = (_b.sent()).data;
                    now = new Date();
                    validActive = (activeEnrollments === null || activeEnrollments === void 0 ? void 0 : activeEnrollments.filter(function (ae) { return !ae.expires_at || new Date(ae.expires_at) >= now; })) || [];
                    activeListenerIds = new Set();
                    anonymousCount = 0;
                    for (_i = 0, validActive_1 = validActive; _i < validActive_1.length; _i++) {
                        ae = validActive_1[_i];
                        if (ae.target_type === 'anonymous' || (!ae.listener_id && !ae.group_id)) {
                            anonymousCount++;
                        }
                        else if (ae.listener_id) {
                            activeListenerIds.add(ae.listener_id);
                        }
                    }
                    groupIds = Array.from(new Set(validActive.map(function (ae) { return ae.group_id; }).filter(Boolean)));
                    if (!(groupIds.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase_1.supabase
                            .from('listener_groups')
                            .select('listener_id')
                            .in('group_id', groupIds)];
                case 2:
                    grpListeners = (_b.sent()).data;
                    if (grpListeners) {
                        for (_a = 0, grpListeners_1 = grpListeners; _a < grpListeners_1.length; _a++) {
                            gl = grpListeners_1[_a];
                            if (gl.listener_id)
                                activeListenerIds.add(gl.listener_id);
                        }
                    }
                    _b.label = 3;
                case 3: return [2 /*return*/, activeListenerIds.size + anonymousCount];
            }
        });
    });
}
function getSeatsQuota() {
    return __awaiter(this, arguments, void 0, function (userId) {
        var activeCount, _a, data, error;
        if (userId === void 0) { userId = '00000000-0000-0000-0000-000000000000'; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, calculateActiveSeats()];
                case 1:
                    activeCount = _b.sent();
                    return [4 /*yield*/, supabase_1.supabase
                            .from('listener_seats')
                            .select('*')
                            .eq('user_id', userId)
                            .maybeSingle()];
                case 2:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error || !data) {
                        return [2 /*return*/, { id: '', userId: userId, maxSeats: 1, activeCount: activeCount }];
                    }
                    if (data.active_count !== activeCount) {
                        supabase_1.supabase.from('listener_seats').update({ active_count: activeCount }).eq('user_id', userId).then();
                    }
                    return [2 /*return*/, {
                            id: data.id,
                            userId: data.user_id,
                            maxSeats: data.max_seats,
                            activeCount: activeCount
                        }];
            }
        });
    });
}
function updateSeatsQuota(maxSeats_1) {
    return __awaiter(this, arguments, void 0, function (maxSeats, userId) {
        var _a, data, error;
        if (userId === void 0) { userId = '00000000-0000-0000-0000-000000000000'; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('listener_seats')
                        .upsert({ user_id: userId, max_seats: maxSeats, active_count: 0 }, { onConflict: 'user_id' })
                        .select()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error updating max seats:', error);
                        throw new Error(error.message);
                    }
                    (0, cache_1.revalidatePath)('/enrollments');
                    (0, cache_1.revalidatePath)('/settings');
                    return [2 /*return*/, data[0]];
            }
        });
    });
}
/**
 * ── Mail Domain Settings ────────────────────────────────────────────────────
 */
function getMailDomain() {
    return __awaiter(this, arguments, void 0, function (userId) {
        var _a, data, error;
        if (userId === void 0) { userId = '00000000-0000-0000-0000-000000000000'; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('mail_domains')
                        .select('*')
                        .eq('user_id', userId)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error || !data || data.length === 0) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            id: data[0].id,
                            domainName: data[0].domain_name,
                            senderEmail: data[0].sender_email,
                            isConfirmed: data[0].is_confirmed,
                            userId: data[0].user_id
                        }];
            }
        });
    });
}
function saveMailDomain(domainName_1, senderEmail_1) {
    return __awaiter(this, arguments, void 0, function (domainName, senderEmail, userId) {
        var existing, result, _a, data, error, _b, data, error;
        if (userId === void 0) { userId = '00000000-0000-0000-0000-000000000000'; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getMailDomain(userId)];
                case 1:
                    existing = _c.sent();
                    if (!existing) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase_1.supabase
                            .from('mail_domains')
                            .update({
                            domain_name: domainName,
                            sender_email: senderEmail,
                            is_confirmed: true // Silently confirm for mockup purposes
                        })
                            .eq('id', existing.id)
                            .select()];
                case 2:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw new Error(error.message);
                    result = data[0];
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, supabase_1.supabase
                        .from('mail_domains')
                        .insert([{
                            domain_name: domainName,
                            sender_email: senderEmail,
                            is_confirmed: true,
                            user_id: userId
                        }])
                        .select()];
                case 4:
                    _b = _c.sent(), data = _b.data, error = _b.error;
                    if (error)
                        throw new Error(error.message);
                    result = data[0];
                    _c.label = 5;
                case 5:
                    (0, cache_1.revalidatePath)('/profile');
                    return [2 /*return*/, result];
            }
        });
    });
}
function getEnrollmentByLinkId(linkId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, links, linkError, link, _b, enrollment, enrollError, currentStatus;
        var _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('enrollment_links')
                        .select('*')
                        .ilike('unique_url', "%".concat(linkId, "%"))
                        .limit(1)];
                case 1:
                    _a = _f.sent(), links = _a.data, linkError = _a.error;
                    if (linkError || !links || links.length === 0) {
                        console.error('Error fetching enrollment by link ID:', linkError);
                        return [2 /*return*/, null];
                    }
                    link = links[0];
                    return [4 /*yield*/, supabase_1.supabase
                            .from('enrollments')
                            .select('*, projects(*)')
                            .eq('id', link.assignment_id)
                            .single()];
                case 2:
                    _b = _f.sent(), enrollment = _b.data, enrollError = _b.error;
                    if (enrollError || !enrollment) {
                        console.error('Error fetching enrollment details:', enrollError);
                        return [2 /*return*/, null];
                    }
                    currentStatus = enrollment.status;
                    if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date() && currentStatus !== 'Completed' && currentStatus !== 'Expired') {
                        currentStatus = 'Expired';
                        supabase_1.supabase.from('enrollments').update({ status: 'Expired' }).eq('id', enrollment.id).then();
                    }
                    return [2 /*return*/, {
                            enrollmentId: enrollment.id,
                            projectId: link.project_id,
                            listenerId: link.listener_id,
                            status: currentStatus,
                            projectTitle: ((_c = enrollment.projects) === null || _c === void 0 ? void 0 : _c.title) || 'Presentation Project',
                            slidesCount: ((_d = enrollment.projects) === null || _d === void 0 ? void 0 : _d.slides_count) || 12,
                            slides: ((_e = enrollment.projects) === null || _e === void 0 ? void 0 : _e.slides) || [],
                        }];
            }
        });
    });
}
function updateEnrollmentStatusAction(id, status) {
    return __awaiter(this, void 0, void 0, function () {
        var updateData, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    updateData = { status: status };
                    if (status === 'In Progress') {
                        updateData.start_date = new Date().toISOString();
                    }
                    return [4 /*yield*/, supabase_1.supabase
                            .from('enrollments')
                            .update(updateData)
                            .eq('id', id)
                            .select()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error updating enrollment status:', error);
                        throw new Error(error.message);
                    }
                    (0, cache_1.revalidatePath)('/enrollments');
                    return [2 /*return*/, data[0]];
            }
        });
    });
}
