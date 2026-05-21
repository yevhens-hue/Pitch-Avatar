import React, { useState, useEffect } from 'react'
import { X, CheckCircle, Mail, AlertTriangle, ShieldCheck, CreditCard, Landmark, Globe } from 'lucide-react'
import styles from './PaymentFallbackModal.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialReason?: string
}

export default function PaymentFallbackModal({ isOpen, onClose, initialReason }: Props) {
  const [lang, setLang] = useState<'RU' | 'EN'>('EN')
  const [reason, setReason] = useState('Professional Plan (Monthly)')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Update reason when initialReason changes
  useEffect(() => {
    if (initialReason) {
      setReason(initialReason)
    }
  }, [initialReason])

  if (!isOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setName('')
    setCompany('')
    setEmail('')
    setMessage('')
    onClose()
  }

  // Pre-filled mailto parameters
  const mailtoSubject = encodeURIComponent(`Pitch Avatar Billing Request - ${reason}`)
  const mailtoBody = encodeURIComponent(
    `Hello Pitch Avatar Team,\n\nI would like to request support for: ${reason}.\n\nMy Details:\nName: ${name || '[Your Name]'}\nCompany: ${company || '[Your Company]'}\nEmail: ${email || '[Your Email]'}\n\nAdditional Details:\n${message || 'No additional details provided.'}\n\nPlease send me the bank transfer details or a secure PayPal payment link.\n\nBest regards,`
  )
  const mailtoUrl = `mailto:support@pitchavatar.com?subject=${mailtoSubject}&body=${mailtoBody}`

  // Multilingual Copy
  const copy = {
    EN: {
      alertBadge: 'System Update',
      title: 'Direct Billing Support',
      subtitle: 'Our payment processor is undergoing scheduled maintenance. Our finance team is actively processing all subscription upgrades and payments manually to avoid any service interruption.',
      bankTitle: 'Bank Transfer (Invoice)',
      bankDesc: 'We issue direct professional invoices (IBAN/SEPA) ideal for standard monthly or annual subscriptions.',
      cardTitle: 'PayPal Secure Billing',
      cardDesc: 'Perfect for immediate card payments. We send a secure link directly to your email, playable via any major card.',
      nameLabel: 'Full Name *',
      companyLabel: 'Company Name',
      emailLabel: 'Email Address *',
      reasonLabel: 'Billing Request *',
      msgLabel: 'Additional Details / Notes',
      msgPlaceholder: 'e.g. Please send a PayPal invoice or list custom onboarding seat counts.',
      submitBtn: 'Submit Payment Request',
      emailBtn: 'Send Direct Email',
      successTitle: 'Request Submitted Successfully!',
      successDesc: 'Thank you, {name}. Our billing operations department has received your request regarding {reason}.',
      successNext: 'Next Steps: An email containing a secure PayPal card-payment link or bank invoice details will be sent to {email} within 15 minutes.',
      successFooter: 'For any urgent adjustments, feel free to contact us at',
      backBtn: 'Return to Platform',
      options: {
        pro_m: 'Professional Plan — Monthly',
        pro_a: 'Professional Plan — Annual',
        bus_m: 'Business Plan — Monthly',
        bus_a: 'Business Plan — Annual',
        add_10: '10 Minutes Add-on ($12.00)',
        add_25: '25 Minutes Add-on ($29.00)',
        add_50: '50 Minutes Add-on ($59.00)',
        add_100: '100 Minutes Add-on ($109.00)',
        up_card: 'Update Payment Card Details',
        ent: 'Enterprise / Custom Billing'
      }
    },
    RU: {
      alertBadge: 'Обновление системы',
      title: 'Прямая поддержка биллинга',
      subtitle: 'Наша платежная система находится на плановом обслуживании. Финансовая команда обрабатывает все обновления подписок и платежи вручную, чтобы избежать перерывов в работе сервиса.',
      bankTitle: 'Банковский перевод (Инвойс)',
      bankDesc: 'Мы выставляем прямые профессиональные счета (IBAN/SEPA), идеально подходящие для стандартных месячных или годовых подписок.',
      cardTitle: 'Безопасная оплата PayPal',
      cardDesc: 'Отлично подходит для быстрой оплаты картой. Мы отправим безопасную ссылку прямо на ваш email, оплата возможна любой картой.',
      nameLabel: 'Имя и фамилия *',
      companyLabel: 'Название компании',
      emailLabel: 'Электронная почта *',
      reasonLabel: 'Предмет запроса *',
      msgLabel: 'Дополнительные детали / Комментарий',
      msgPlaceholder: 'Например: Пришлите ссылку на PayPal или укажите корпоративные налоговые реквизиты.',
      submitBtn: 'Отправить запрос на оплату',
      emailBtn: 'Написать на почту напрямую',
      successTitle: 'Запрос успешно отправлен!',
      successDesc: 'Спасибо, {name}. Наша финансовая служба получила ваш запрос по теме: {reason}.',
      successNext: 'Что дальше: Ссылка на быструю оплату картой через PayPal или реквизиты банковского счета будут отправлены на {email} в течение 15 минут.',
      successFooter: 'По любым срочным вопросам пишите нам на',
      backBtn: 'Вернуться на платформу',
      options: {
        pro_m: 'Тариф Professional — Месячный',
        pro_a: 'Тариф Professional — Годовой',
        bus_m: 'Тариф Business — Месячный',
        bus_a: 'Тариф Business — Годовой',
        add_10: 'Докупка 10 минут ($12.00)',
        add_25: 'Докупка 25 минут ($29.00)',
        add_50: 'Докупка 50 минут ($59.00)',
        add_100: 'Докупка 100 минут ($109.00)',
        up_card: 'Обновить платежную карту',
        ent: 'Тариф Enterprise / Кастомные условия'
      }
    }
  }

  const t = copy[lang]

  return (
    <div className={styles.overlay} onClick={handleReset}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Language Switcher */}
        <button 
          onClick={() => setLang(l => l === 'RU' ? 'EN' : 'RU')} 
          style={{
            position: 'absolute',
            top: '24px',
            right: '64px',
            background: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            zIndex: 10
          }}
        >
          <Globe size={14} />
          <span>{lang === 'RU' ? 'English' : 'Русский'}</span>
        </button>

        {/* Close Button */}
        <button className={styles.closeBtn} onClick={handleReset} aria-label="Close modal">
          <X size={20} />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header with warning badge */}
            <div className={styles.header}>
              <div className={styles.alertBadge}>
                <AlertTriangle size={18} />
                <span>{t.alertBadge}</span>
              </div>
              <h2 className={styles.title}>{t.title}</h2>
              <p className={styles.subtitle}>{t.subtitle}</p>
            </div>

            {/* Supported Payment Channels */}
            <div className={styles.channels}>
              <div className={styles.channelCard}>
                <div className={styles.channelHeader}>
                  <Landmark size={20} className={styles.channelIcon} />
                  <strong>{t.bankTitle}</strong>
                </div>
                <p>{t.bankDesc}</p>
              </div>

              <div className={styles.channelCard}>
                <div className={styles.channelHeader}>
                  <CreditCard size={20} className={styles.channelIcon} />
                  <strong>{t.cardTitle}</strong>
                </div>
                <p>{t.cardDesc}</p>
              </div>
            </div>

            {/* Form */}
            <form className={styles.form} onSubmit={handleFormSubmit}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>{t.nameLabel}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>{t.companyLabel}</label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>{t.emailLabel}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>{t.reasonLabel}</label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className={styles.select}
                  >
                    <option value="Professional Plan (Monthly)">{t.options.pro_m}</option>
                    <option value="Professional Plan (Annual)">{t.options.pro_a}</option>
                    <option value="Business Plan (Monthly)">{t.options.bus_m}</option>
                    <option value="Business Plan (Annual)">{t.options.bus_a}</option>
                    <option value="10 Minutes Add-on">{t.options.add_10}</option>
                    <option value="25 Minutes Add-on">{t.options.add_25}</option>
                    <option value="50 Minutes Add-on">{t.options.add_50}</option>
                    <option value="100 Minutes Add-on">{t.options.add_100}</option>
                    <option value="Update Card Details">{t.options.up_card}</option>
                    <option value="Enterprise / Custom Billing">{t.options.ent}</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>{t.msgLabel}</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t.msgPlaceholder}
                  rows={3}
                  className={styles.textarea}
                />
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <a href={mailtoUrl} className={styles.mailToBtn} title="Open in your local email client">
                  <Mail size={16} /> {t.emailBtn}
                </a>
                <button type="submit" className={styles.submitBtn}>
                  {t.submitBtn}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className={styles.successScreen}>
            <CheckCircle size={64} className={styles.successIcon} />
            <h2 className={styles.successTitle}>{t.successTitle}</h2>
            <p className={styles.successDesc}>
              {t.successDesc.replace('{name}', name).replace('{reason}', reason)}
            </p>
            
            <div className={styles.successBox}>
              <ShieldCheck size={18} className={styles.shieldIcon} />
              <span>
                {t.successNext.replace('{email}', email)}
              </span>
            </div>

            <p className={styles.successFooter}>
              {t.successFooter} <a href="mailto:support@pitchavatar.com">support@pitchavatar.com</a>.
            </p>

            <button className={styles.doneBtn} onClick={handleReset}>
              {t.backBtn}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
