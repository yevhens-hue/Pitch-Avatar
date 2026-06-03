import os

with open('src/app/enrollments/EnrollmentModal/raw_modal.tsx', 'r') as f:
    lines = f.readlines()

while lines and ('</div>' in lines[-1] or ')' in lines[-1] or '}' in lines[-1] or lines[-1].strip() == ''):
    lines.pop()

modal_body = ''.join(lines)
# Clean the opening
if modal_body.strip().startswith('{isOpen && ('):
    modal_body = modal_body.replace('{isOpen && (', 'if (!isOpen) return null;\n  return (', 1)

component = """import React, { useState } from 'react'
import { 
  X, Check, ChevronDown, Monitor, MessageSquare, 
  Settings, Users, Lock, Link as LinkIcon, BarChart2,
  Video, Mic, Eye, FileText, Smartphone, LayoutTemplate
} from 'lucide-react'
import { Enrollment, Listener, Project, ENROLLMENT_STATUS } from '@/types/listeners'

export default function EnrollmentModal({
  isOpen, closeModal, handleSave, editingId,
  listeners, projects, groups,
  styles,
  form,
}: any) {
  const {
    activeTab, setActiveTab,
    showMetricDropdown, setShowMetricDropdown,
    formData, setFormData,
    presenters, setPresenters,
    calendarUrl, setCalendarUrl,
    dontSendOpenNotifications, setDontSendOpenNotifications,
    bookCalendarOrStartAvatar, setBookCalendarOrStartAvatar,
    invitationText, setInvitationText,
    sendAnimatedGif, setSendAnimatedGif,
    scheduledDate, setScheduledDate,
    scheduledTime, setScheduledTime,
    enableReminders, setEnableReminders,
    showSlideCounter, setShowSlideCounter,
    showPlayPause, setShowPlayPause,
    showPrevNext, setShowPrevNext,
    showProgressBar, setShowProgressBar,
    showSettingsBtn, setShowSettingsBtn,
    showFullscreenBtn, setShowFullscreenBtn,
    showAllSlideControls, setShowAllSlideControls,
    showAvatarPanel, setShowAvatarPanel,
    showAvatarVideoPhoto, setShowAvatarVideoPhoto,
    showAvatarNameLabel, setShowAvatarNameLabel,
    showMuteBtn, setShowMuteBtn,
    showChatMessages, setShowChatMessages,
    showChatInput, setShowChatInput,
    showMicrophoneBtn, setShowMicrophoneBtn,
    showAvatarFrameBorder, setShowAvatarFrameBorder,
    avatarPosition, setAvatarPosition,
    avatarHeight, setAvatarHeight,
    chatHeight, setChatHeight,
    showPresenterInfo, setShowPresenterInfo,
    showCallPresenter, setShowCallPresenter,
    showScheduleMeeting, setShowScheduleMeeting,
    showLikeThumbs, setShowLikeThumbs,
    showCommentFeedback, setShowCommentFeedback,
    showShareBtn, setShowShareBtn,
    showSlidesDropdown, setShowSlidesDropdown,
    showSlideFeed, setShowSlideFeed,
    allowListenerShareSlides, setAllowListenerShareSlides,
    enableChatWithListener, setEnableChatWithListener,
    allowComments, setAllowComments,
    allowDownloadFile, setAllowDownloadFile,
    allowCallPresenter, setAllowCallPresenter,
    callPresenterBtnText, setCallPresenterBtnText,
    allowScheduleMeeting, setAllowScheduleMeeting,
    scheduleMeetingCalendarUrl, setScheduleMeetingCalendarUrl,
    scheduleMeetingBtnText, setScheduleMeetingBtnText,
    enableSubtitles, setEnableSubtitles,
    voiceRecognition, setVoiceRecognition,
    sendPdfReportEmail, setSendPdfReportEmail,
    sendPerformanceReportEmail, setSendPerformanceReportEmail,
    allowListenersViewViaLink, setAllowListenersViewViaLink,
    useVoiceMessageAudience, setUseVoiceMessageAudience,
    allowChangeDetailLevel, setAllowChangeDetailLevel,
    showDebuggerMode, setShowDebuggerMode,
    levelOfDetail, setLevelOfDetail,
    startFromSlide, setStartFromSlide,
    advancedComment, setAdvancedComment,
    securityHumanDetection, setSecurityHumanDetection,
    securityAntiFraud, setSecurityAntiFraud,
    securityIdentityVerification, setSecurityIdentityVerification,
    securityAntiImpersonation, setSecurityAntiImpersonation,
    resultsRecording, setResultsRecording,
    resultsSendToListener, setResultsSendToListener,
    resultsSendToPresenterListener, setResultsSendToPresenterListener,
    resultsSendToPresenterGroup, setResultsSendToPresenterGroup,
    resultsGenerateSummary, setResultsGenerateSummary,
    resultsShowCorrectAnswer, setResultsShowCorrectAnswer,
    resultsAnswerLimitedTime, setResultsAnswerLimitedTime,
    customResultsList, setCustomResultsList,
    customResultsSearch, setCustomResultsSearch,
    showCustomResultDropdown, setShowCustomResultDropdown,
  } = form;

"""

footer = """
  )
}
"""

with open('src/app/enrollments/EnrollmentModal/index.tsx', 'w') as out:
    out.write(component + modal_body + footer)

print('Generated EnrollmentModal/index.tsx')
