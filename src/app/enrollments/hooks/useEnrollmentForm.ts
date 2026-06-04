import { useState } from 'react'

export const emptyFormState = {
  title: '',
  targetType: 'listener', // 'listener' | 'group' | 'anonymous'
  listenerId: '',
  contentType: 'project',
  projectId: '',
  status: 'Not started',
  startDate: '',
  emailSchedule: {
    sendInvite: true,
    sendReminders: true,
    reminderFrequency: 'daily',
    inviteSubject: 'You are invited to a new Pitch Avatar presentation',
    inviteBody: 'Hello, \\n\\nYou have been invited to view this presentation. Please click the link to begin.',
    translateToListenerLang: true,
    reminderSubject: '',
    reminderText: '',
    reminderCount: 3,
    stopRemindersWhenOpened: true,
  },
  results: {
    recording: false,
    sendResultsToListener: true,
    sendResultsToPresenter: false,
    generateSummary: false,
    answerLimitedTime: false,
    customMetrics: [] as string[]
  }
}

export function useEnrollmentForm() {
  const [activeTab, setActiveTab] = useState<'general' | 'invitations' | 'links' | 'layout' | 'advanced' | 'security' | 'results'>('general')
  const [showMetricDropdown, setShowMetricDropdown] = useState(false)
  const [formData, setFormData] = useState(emptyFormState)

  // Upgraded custom visual wizard fields
  const [presenters, setPresenters] = useState<string[]>(['info@roi4cio.com'])
  const [calendarUrl, setCalendarUrl] = useState<string>('https://meetings.hubspot.com/your-handle')
  const [dontSendOpenNotifications, setDontSendOpenNotifications] = useState<boolean>(false)
  const [bookCalendarOrStartAvatar, setBookCalendarOrStartAvatar] = useState<boolean>(false)
  const [invitationText, setInvitationText] = useState<string>('')
  const [sendAnimatedGif, setSendAnimatedGif] = useState<boolean>(false)
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [scheduledTime, setScheduledTime] = useState<string>('')
  const [enableReminders, setEnableReminders] = useState<boolean>(false)
  
  // Viewer layout (Slide Player)
  const [showSlideCounter, setShowSlideCounter] = useState<boolean>(true)
  const [showPlayPause, setShowPlayPause] = useState<boolean>(true)
  const [showPrevNext, setShowPrevNext] = useState<boolean>(true)
  const [showProgressBar, setShowProgressBar] = useState<boolean>(true)
  const [showSettingsBtn, setShowSettingsBtn] = useState<boolean>(true)
  const [showFullscreenBtn, setShowFullscreenBtn] = useState<boolean>(true)
  const [showAllSlideControls, setShowAllSlideControls] = useState<boolean>(true)

  // Viewer layout (Avatar & Chat Panel)
  const [showAvatarPanel, setShowAvatarPanel] = useState<boolean>(true)
  const [showAvatarVideoPhoto, setShowAvatarVideoPhoto] = useState<boolean>(true)
  const [showAvatarNameLabel, setShowAvatarNameLabel] = useState<boolean>(true)
  const [showMuteBtn, setShowMuteBtn] = useState<boolean>(true)
  const [showChatMessages, setShowChatMessages] = useState<boolean>(true)
  const [showChatInput, setShowChatInput] = useState<boolean>(true)
  const [showMicrophoneBtn, setShowMicrophoneBtn] = useState<boolean>(true)
  const [showAvatarFrameBorder, setShowAvatarFrameBorder] = useState<boolean>(false)
  const [avatarPosition, setAvatarPosition] = useState<string>('Right')
  const [avatarHeight, setAvatarHeight] = useState<number>(40)
  const [chatHeight, setChatHeight] = useState<number>(60)

  // Viewer layout (Bottom Bar Actions)
  const [showPresenterInfo, setShowPresenterInfo] = useState<boolean>(true)
  const [showCallPresenter, setShowCallPresenter] = useState<boolean>(true)
  const [showScheduleMeeting, setShowScheduleMeeting] = useState<boolean>(true)
  const [showLikeThumbs, setShowLikeThumbs] = useState<boolean>(true)
  const [showCommentFeedback, setShowCommentFeedback] = useState<boolean>(true)
  const [showShareBtn, setShowShareBtn] = useState<boolean>(true)
  const [showSlidesDropdown, setShowSlidesDropdown] = useState<boolean>(true)

  // Advanced settings
  const [showSlideFeed, setShowSlideFeed] = useState<boolean>(false)
  const [allowListenerShareSlides, setAllowListenerShareSlides] = useState<boolean>(true)
  const [enableChatWithListener, setEnableChatWithListener] = useState<boolean>(true)
  const [allowComments, setAllowComments] = useState<boolean>(true)
  const [allowDownloadFile, setAllowDownloadFile] = useState<boolean>(false)
  const [allowCallPresenter, setAllowCallPresenter] = useState<boolean>(true)
  const [callPresenterBtnText, setCallPresenterBtnText] = useState<string>('Call presenter')
  const [allowScheduleMeeting, setAllowScheduleMeeting] = useState<boolean>(true)
  const [scheduleMeetingCalendarUrl, setScheduleMeetingCalendarUrl] = useState<string>('https://meetings.hubspot.com/your-handle')
  const [scheduleMeetingBtnText, setScheduleMeetingBtnText] = useState<string>('Schedule meeting')
  const [enableSubtitles, setEnableSubtitles] = useState<boolean>(false)
  const [voiceRecognition, setVoiceRecognition] = useState<boolean>(true)
  const [sendPdfReportEmail, setSendPdfReportEmail] = useState<boolean>(true)
  const [sendPerformanceReportEmail, setSendPerformanceReportEmail] = useState<boolean>(true)
  const [allowListenersViewViaLink, setAllowListenersViewViaLink] = useState<boolean>(true)
  const [useVoiceMessageAudience, setUseVoiceMessageAudience] = useState<boolean>(false)
  const [allowChangeDetailLevel, setAllowChangeDetailLevel] = useState<boolean>(false)
  const [showDebuggerMode, setShowDebuggerMode] = useState<boolean>(false)
  const [levelOfDetail, setLevelOfDetail] = useState<string>('Full-length presentation')
  const [startFromSlide, setStartFromSlide] = useState<number>(1)
  const [advancedComment, setAdvancedComment] = useState<string>('')

  // Security Verification settings
  const [securityHumanDetection, setSecurityHumanDetection] = useState<boolean>(false)
  const [securityAntiFraud, setSecurityAntiFraud] = useState<boolean>(false)
  const [securityIdentityVerification, setSecurityIdentityVerification] = useState<boolean>(false)
  const [securityAntiImpersonation, setSecurityAntiImpersonation] = useState<boolean>(false)

  // Results settings
  const [resultsRecording, setResultsRecording] = useState<boolean>(false)
  const [resultsSendToListener, setResultsSendToListener] = useState<boolean>(false)
  const [resultsSendToPresenterListener, setResultsSendToPresenterListener] = useState<boolean>(false)
  const [resultsSendToPresenterGroup, setResultsSendToPresenterGroup] = useState<boolean>(false)
  const [resultsGenerateSummary, setResultsGenerateSummary] = useState<boolean>(false)
  const [resultsShowCorrectAnswer, setResultsShowCorrectAnswer] = useState<boolean>(false)
  const [resultsAnswerLimitedTime, setResultsAnswerLimitedTime] = useState<boolean>(false)
  const [resultsAnswerTimeLimit, setResultsAnswerTimeLimit] = useState<number>(60)

  // Custom results dropdown search states
  const [customResultsList, setCustomResultsList] = useState<string[]>([])
  const [customResultsSearch, setCustomResultsSearch] = useState<string>('')
  const [showCustomResultDropdown, setShowCustomResultDropdown] = useState<boolean>(false)

  return {
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
    resultsAnswerTimeLimit, setResultsAnswerTimeLimit,
    customResultsList, setCustomResultsList,
    customResultsSearch, setCustomResultsSearch,
    showCustomResultDropdown, setShowCustomResultDropdown,
  }
}
