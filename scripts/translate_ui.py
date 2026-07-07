#!/usr/bin/env python3
"""
Batch-replace all Cyrillic UI strings in JSX/TSX/TS files with English equivalents.
Only replaces string literals in JSX context, skips comments.
"""

import re
import os
import subprocess

# ── Translation dictionary ───────────────────────────────────────────────────
TRANSLATIONS = {
    # Library / ProjectsTable (screenshot)
    'Мои проекты': 'My Projects',
    'Предоставлено мне': 'Shared with me',
    'Фильтры': 'Filters',
    'Столбцы': 'Columns',
    'Развернуть': 'Expand',
    'Свернуть': 'Collapse',
    'Все типы': 'All types',
    'Все языки': 'All languages',
    'Все авторы': 'All authors',
    'Все статусы': 'All statuses',
    'За все время': 'All time',
    'За неделю': 'Last week',
    'За месяц': 'Last month',
    'Мои': 'Mine',
    'Остальные': 'Others',
    'Архив': 'Archived',
    'Архивировать': 'Archive',
    'Type Projectа': 'Project Type',
    'Все языки': 'All languages',

    # Dashboard / Navigation
    'Мои проекты': 'My Projects',
    'Проекты': 'Projects',
    'Настройки': 'Settings',
    'Помощь': 'Help',
    'Выйти': 'Sign out',
    'Профиль': 'Profile',
    'Уведомления': 'Notifications',
    'Аналитика': 'Analytics',
    'Интеграции': 'Integrations',
    'Пользователи': 'Users',
    'Роли': 'Roles',
    'Слушатели': 'Listeners',
    'Курсы': 'Courses',
    'Знания': 'Knowledge',
    'Голоса': 'Voices',
    'Шаблоны': 'Templates',
    'Планы': 'Plans',
    'Администратор': 'Admin',

    # Wizard / Project creation
    'Создать проект': 'Create Project',
    'Создать': 'Create',
    'Создание проекта': 'Create Project',
    'Название проекта': 'Project name',
    'Описание': 'Description',
    'Тип': 'Type',
    'Презентация': 'Presentation',
    'Видео': 'Video',
    'Чат-аватар': 'Chat Avatar',
    'Следующий': 'Next',
    'Назад': 'Back',
    'Готово': 'Done',
    'Отмена': 'Cancel',
    'Сохранить': 'Save',
    'Удалить': 'Delete',
    'Редактировать': 'Edit',
    'Дублировать': 'Duplicate',
    'Поделиться': 'Share',
    'Опубликовать': 'Publish',
    'Загрузить': 'Upload',
    'Скачать': 'Download',
    'Поиск': 'Search',
    'Поиск проектов...': 'Search projects...',

    # ProjectEditor panels
    'Инструкции': 'Instructions',
    'Настройки аватара': 'Avatar settings',
    'Настройки тренера': 'Coach settings',
    'База знаний': 'Knowledge base',
    'Импорт': 'Import',
    'Настройки проекта': 'Project settings',
    'Поделиться и назначить': 'Share & Assign',
    'Набор вопросов и ответов': 'Q&A Set',
    'Скрипт': 'Script',
    'Предпросмотр': 'Preview',
    'Публикация': 'Publishing',

    # Settings
    'Личный кабинет': 'Account',
    'Биллинг': 'Billing',
    'Команда': 'Team',
    'Безопасность': 'Security',
    'Домен': 'Domain',
    'Кастомный домен': 'Custom domain',
    'Шаблоны проектов': 'Project templates',

    # Coach
    'Тренер': 'Coach',
    'Тренировка': 'Training',
    'Практика': 'Practice',
    'Сессии': 'Sessions',
    'Оценка': 'Evaluation',
    'Роль': 'Role',
    'Стажёр': 'Trainee',
    'Тренер': 'Coach',
    'Начать тренировку': 'Start training',
    'Завершить': 'Finish',
    'Продолжить': 'Continue',
    'Попробовать снова': 'Try again',
    'Результаты': 'Results',

    # Common UI
    'Загрузка...': 'Loading...',
    'Загрузка': 'Loading',
    'Ошибка': 'Error',
    'Успешно': 'Success',
    'Нет данных': 'No data',
    'Нет проектов': 'No projects',
    'Пусто': 'Empty',
    'Применить': 'Apply',
    'Сбросить': 'Reset',
    'Закрыть': 'Close',
    'Открыть': 'Open',
    'Да': 'Yes',
    'Нет': 'No',
    'Добавить': 'Add',
    'Новый': 'New',
    'Имя': 'Name',
    'Email': 'Email',
    'Пароль': 'Password',
    'Войти': 'Sign in',
    'Зарегистрироваться': 'Sign up',
    'Автор': 'Author',
    'Дата': 'Date',
    'Статус': 'Status',
    'Язык': 'Language',
    'Режим': 'Mode',
    'Действия': 'Actions',
    'Просмотр': 'Preview',

    # Sara widget
    'Привет! Я Sara, ваш AI ассистент Pitch Avatar.\nЧем могу помочь сегодня?': 'Hi! I\'m Sara, your Pitch Avatar AI assistant.\nHow can I help you today?',
    'Произошла ошибка связи с сервером. Пожалуйста, попробуйте еще раз.': 'A server communication error occurred. Please try again.',
    'Сервер отвечает слишком долго. Пожалуйста, повторите попытку.': 'The server is taking too long to respond. Please try again.',
    'Выполнить действие': 'Execute action',
    'Отлично! Готовлю создание аватара': 'Creating avatar',

    # Toast / errors
    'Проект успешно создан': 'Project created successfully',
    'Ошибка создания проекта': 'Error creating project',
    'Изменения сохранены': 'Changes saved',
    'Ошибка сохранения': 'Save error',

    # Seats banner
    'мест': 'seats',
    'использовано': 'used',

    # Enrollments
    'Назначение': 'Assignment',
    'Назначения': 'Assignments',
    'Прогресс': 'Progress',
    'Завершен': 'Completed',
    'В процессе': 'In progress',
    'Не начат': 'Not started',

    # Payment
    'Оплата': 'Payment',
    'Подписка': 'Subscription',
    'Пробный период': 'Trial period',
    'Обновить план': 'Upgrade plan',

    # Share / enroll modal
    'Поделиться проектом': 'Share project',
    'Ссылка': 'Link',
    'Скопировать': 'Copy',
    'Скопировано!': 'Copied!',
    'Доступ': 'Access',
    'Публичный': 'Public',
    'Приватный': 'Private',

    # Upload / Editor
    'Перетащите файл сюда': 'Drop file here',
    'или нажмите для выбора': 'or click to select',
    'Выбрать файл': 'Select file',
    'Файл загружен': 'File uploaded',
    'Текст': 'Text',
    'Слайды': 'Slides',
    'Медиа': 'Media',

    # Error boundary
    'Что-то пошло не так': 'Something went wrong',
    'Перезагрузить': 'Reload',
    'Попробуйте обновить страницу': 'Try refreshing the page',
}

# Sort by length descending to avoid partial replacements
sorted_translations = sorted(TRANSLATIONS.items(), key=lambda x: -len(x[0]))


def translate_content(content: str) -> str:
    """Replace Cyrillic strings in file content."""
    for ru, en in sorted_translations:
        content = content.replace(ru, en)
    return content


def process_file(filepath: str) -> bool:
    """Process a single file, return True if changed."""
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    
    translated = translate_content(original)
    
    if translated != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(translated)
        return True
    return False


def main():
    src_dir = '/Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/src'
    
    # Find all TSX/TS files (excluding tests)
    result = subprocess.run(
        ['grep', '-rln', '[А-яЁё]', src_dir, '--include=*.tsx', '--include=*.ts'],
        capture_output=True, text=True
    )
    
    files = [f for f in result.stdout.strip().split('\n') if f and 
             'test' not in f and 'spec' not in f and '.d.ts' not in f]
    
    print(f'Found {len(files)} files with Cyrillic text')
    changed = []
    
    for filepath in files:
        if process_file(filepath):
            changed.append(filepath)
            print(f'  ✅ {os.path.relpath(filepath, src_dir)}')
    
    print(f'\n✅ Translated {len(changed)}/{len(files)} files')
    return changed


if __name__ == '__main__':
    main()
