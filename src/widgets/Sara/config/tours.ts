export const TOUR_IDS = [
  // 1 - Видео с аватаром
  'tour_write_script',
  'tour_upload_background',
  'tour_create_avatar',
  'tour_generate_video',
  'tour_share_video',

  // 2 - Chat
  'tour_create_chat_avatar_1',
  'tour_create_chat_avatar_2',
  'tour_create_chat_avatar_3',
  'tour_test_chat',
  'tour_chat_get_link',

  // 3 - Слайды
  'tour_upload_slides',
  'tour_add_voice_or_avatar',
  'tour_share_slides',

  // 4 - Локализация
  'tour_upload_video',
  'tour_choose_voice',
  'tour_choose_language',
  'tour_adjust_video_length',
  'tour_loc_download',

  // 5 - Общий
  'tour_generate_slides',
  'tour_create_chat_avatar',
] as const;

export type TourId = typeof TOUR_IDS[number];

export const CHECKLISTS = {
  VIDEO: [
    { id: 'tour_write_script', title: 'Write or generate your script' },
    { id: 'tour_upload_background', title: 'Upload a background' },
    { id: 'tour_create_avatar', title: 'Create your avatar and choose a voice' },
    { id: 'tour_generate_video', title: 'Generate your video' },
    { id: 'tour_share_video', title: 'Share your video' },
  ],
  CHAT: [
    { id: 'tour_create_chat_avatar_1', title: 'Create your avatar' },
    { id: 'tour_create_chat_avatar_2', title: 'Upload or choose presentation or toggle widget' },
    { id: 'tour_create_chat_avatar_3', title: 'Set up conversation scenario' },
    { id: 'tour_test_chat', title: 'Test your avatar' },
    { id: 'tour_chat_get_link', title: 'Get link or embed code' },
  ],
  SLIDES: [
    { id: 'tour_upload_slides', title: 'Upload your presentation' },
    { id: 'tour_write_script', title: 'Add or generate script' },
    { id: 'tour_add_voice_or_avatar', title: 'Add voice or avatar and generate' },
    { id: 'tour_share_slides', title: 'Share or download' },
  ],
  LOCALIZATION: [
    { id: 'tour_upload_video', title: 'Upload your video' },
    { id: 'tour_choose_voice', title: 'Choose voice or avatar' },
    { id: 'tour_choose_language', title: 'Choose target language' },
    { id: 'tour_adjust_video_length', title: 'Adjust video length' },
    { id: 'tour_loc_download', title: 'Download or share' },
  ],
  GENERAL: [
    { id: 'tour_generate_video', title: 'Create your first avatar video' },
    { id: 'tour_upload_video', title: 'Translate any video' },
    { id: 'tour_generate_slides', title: 'Add avatar to a presentation' },
    { id: 'tour_share_video', title: 'Share the result' },
    { id: 'tour_create_chat_avatar', title: 'Try a chat avatar' },
  ],
} as const;

/**
 * Mapping of internal Tour IDs to real Stonly Guide IDs (Hashes).
 * TODO: Product/Content team to provide the actual Stonly hashes (e.g. 'NGxoMErklJ').
 */
export const STONLY_ID_MAP: Record<TourId, string> = {
  tour_write_script: 'STONLY_HASH_PLACEHOLDER',
  tour_upload_background: 'STONLY_HASH_PLACEHOLDER',
  tour_create_avatar: 'STONLY_HASH_PLACEHOLDER',
  tour_generate_video: 'STONLY_HASH_PLACEHOLDER',
  tour_share_video: 'STONLY_HASH_PLACEHOLDER',
  tour_create_chat_avatar_1: 'STONLY_HASH_PLACEHOLDER',
  tour_create_chat_avatar_2: 'STONLY_HASH_PLACEHOLDER',
  tour_create_chat_avatar_3: 'STONLY_HASH_PLACEHOLDER',
  tour_test_chat: 'STONLY_HASH_PLACEHOLDER',
  tour_chat_get_link: 'STONLY_HASH_PLACEHOLDER',
  tour_upload_slides: 'STONLY_HASH_PLACEHOLDER',
  tour_add_voice_or_avatar: 'STONLY_HASH_PLACEHOLDER',
  tour_share_slides: 'STONLY_HASH_PLACEHOLDER',
  tour_upload_video: 'STONLY_HASH_PLACEHOLDER',
  tour_choose_voice: 'STONLY_HASH_PLACEHOLDER',
  tour_choose_language: 'STONLY_HASH_PLACEHOLDER',
  tour_adjust_video_length: 'STONLY_HASH_PLACEHOLDER',
  tour_loc_download: 'STONLY_HASH_PLACEHOLDER',
  tour_generate_slides: 'STONLY_HASH_PLACEHOLDER',
  tour_create_chat_avatar: 'STONLY_HASH_PLACEHOLDER'
};
