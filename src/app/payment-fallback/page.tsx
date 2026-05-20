'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Mail, AlertTriangle, ShieldCheck, CreditCard, Landmark, Globe } from 'lucide-react'
import styles from './PaymentFallback.module.css'

export default function PaymentFallbackPage() {
  const [lang, setLang] = useState<'RU' | 'EN'>('RU')
  const [reason, setReason] = useState('Professional Plan (Monthly)')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Listen to search params for initial reasons (e.g. /payment-fallback?reason=Business)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const r = params.get('reason')
      if (r) {
        setReason(r)
      }
      const l = params.get('lang')
      if (l === 'EN' || l === 'RU') {
        setLang(l)
      }
    }
  }, [])

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
      alertBadge: 'Payment System Update',
      title: 'Direct Billing & Payment Support',
      subtitle: 'Our primary payment gateway is undergoing maintenance. Our finance team is processing all upgrades, card updates, and purchases manually to ensure zero interruption to your service.',
      bankTitle: 'Bank Transfer (Invoice)',
      bankDesc: 'We issue direct professional invoices (IBAN/SEPA) ideal for standard subscription plans or larger accounts.',
      cardTitle: 'PayPal Instant Billing',
      cardDesc: 'Perfect for immediate card payments. We send a secure checkout link directly to your email, playable via any credit card.',
      nameLabel: 'Full Name *',
      companyLabel: 'Company Name',
      emailLabel: 'Email Address *',
      reasonLabel: 'Billing Request *',
      msgLabel: 'Additional Details / Notes',
      msgPlaceholder: 'e.g. Prefer PayPal link, custom billing cycle, or corporate tax details.',
      submitBtn: 'Submit Payment Request',
      emailBtn: 'Send Direct Email',
      successTitle: 'Request Submitted Successfully!',
      successDesc: 'Thank you, {name}. Our billing operations department has received your request regarding {reason}.',
      successNext: 'Next Steps: A secure card-payment link or bank invoice details will be sent to {email} within 15 minutes.',
      successFooter: 'For any urgent questions, reach out to us at',
      backBtn: 'Back to Platform',
      returnBtn: 'Submit Another Request',
      trustSecure: '100% Secure manual payment processing in compliance with GDPR.',
      options: {
        pro_m: 'Professional Plan — Monthly ($29.00)',
        pro_a: 'Professional Plan — Annual ($290.00)',
        bus_m: 'Business Plan — Monthly ($79.00)',
        bus_a: 'Business Plan — Annual ($790.00)',
        add_10: '10 Minutes Add-on ($12.00)',
        add_25: '25 Minutes Add-on ($29.00)',
        add_50: '50 Minutes Add-on ($59.00)',
        add_100: '100 Minutes Add-on ($109.00)',
        up_card: 'Update Payment Card Details',
        ent: 'Enterprise / Custom Billing',
        other: 'Other / General Question'
      }
    },
    RU: {
      alertBadge: 'Обновление платежной системы',
      title: 'Прямая поддержка платежей и биллинга',
      subtitle: 'Наш основной платежный провайдер временно находится на техническом обслуживании. Наша финансовая команда обрабатывает все переводы, обновления карт и покупки вручную, чтобы исключить простои в работе вашего сервиса.',
      bankTitle: 'Банковский перевод (Инвойс)',
      bankDesc: 'Мы выставляем прямые профессиональные счета (IBAN/SEPA), идеально подходящие для стандартных тарифов или крупных аккаунтов.',
      cardTitle: 'Безопасная оплата PayPal',
      cardDesc: 'Отлично подходит для быстрой оплаты картой. Мы отправим прямую ссылку на оплату на ваш email. Оплата возможна любой картой.',
      nameLabel: 'Имя и фамилия *',
      companyLabel: 'Название компании',
      emailLabel: 'Электронная почта *',
      reasonLabel: 'Предмет запроса *',
      msgLabel: 'Дополнительные детали / Комментарий',
      msgPlaceholder: 'Например: Пришлите ссылку на PayPal, или укажите корпоративные налоговые реквизиты компании.',
      submitBtn: 'Отправить запрос на оплату',
      emailBtn: 'Написать на почту напрямую',
      successTitle: 'Запрос успешно отправлен!',
      successDesc: 'Спасибо, {name}. Наша финансовая служба получила ваш запрос по теме: {reason}.',
      successNext: 'Что дальше: Ссылка на быструю оплату картой или реквизиты банковского счета будут отправлены на {email} в течение 15 минут.',
      successFooter: 'По любым срочным вопросам пишите нам на',
      backBtn: 'Вернуться на платформу',
      returnBtn: 'Отправить новый запрос',
      trustSecure: '100% Безопасная ручная обработка транзакций в соответствии с регламентом GDPR.',
      options: {
        pro_m: 'Тариф Professional — Месячный ($29.00)',
        pro_a: 'Тариф Professional — Годовой ($290.00)',
        bus_m: 'Тариф Business — Месячный ($79.00)',
        bus_a: 'Тариф Business — Годовой ($790.00)',
        add_10: 'Докупка 10 минут ($12.00)',
        add_25: 'Докупка 25 минут ($29.00)',
        add_50: 'Докупка 50 минут ($59.00)',
        add_100: 'Докупка 100 минут ($109.00)',
        up_card: 'Обновить платежную карту в профиле',
        ent: 'Тариф Enterprise / Кастомные условия',
        other: 'Другой / Общий вопрос'
      }
    }
  }

  const t = copy[lang]

  return (
    <div className={styles.page}>
      
      {/* Top Navbar */}
      <div className={styles.navbar}>
        <Link href="/settings" className={styles.backLink}>
          <ArrowLeft size={16} /> {t.backBtn}
        </Link>

        {/* Language Switcher */}
        <button onClick={() => setLang(l => l === 'RU' ? 'EN' : 'RU')} className={styles.langBtn}>
          <Globe size={16} />
          <span>{lang === 'RU' ? 'English' : 'Русский'}</span>
        </button>
      </div>

      <div className={styles.container}>
        {!isSubmitted ? (
          <div className={styles.grid}>
            
            {/* Left Column: Info Card */}
            <div className={styles.infoCol}>
              <div className={styles.alertBadge}>
                <AlertTriangle size={18} />
                <span>{t.alertBadge}</span>
              </div>
              <h1 className={styles.title}>{t.title}</h1>
              <p className={styles.subtitle}>{t.subtitle}</p>

              <div className={styles.channels}>
                <div className={styles.channelCard}>
                  <div className={styles.channelHeader}>
                    <Landmark size={22} className={styles.channelIcon} />
                    <strong>{t.bankTitle}</strong>
                  </div>
                  <p>{t.bankDesc}</p>
                </div>

                <div className={styles.channelCard}>
                  <div className={styles.channelHeader}>
                    <CreditCard size={22} className={styles.channelIcon} />
                    <strong>{t.cardTitle}</strong>
                  </div>
                  <p>{t.cardDesc}</p>
                </div>
              </div>

              <div className={styles.trustBadge}>
                <ShieldCheck size={20} className={styles.shieldIcon} />
                <span>{t.trustSecure}</span>
              </div>
            </div>

            {/* Right Column: Form Container */}
            <div className={styles.formCol}>
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
                      <option value="Other / General Question">{t.options.other}</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>{t.msgLabel}</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={t.msgPlaceholder}
                    rows={4}
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.actions}>
                  <a href={mailtoUrl} className={styles.mailToBtn} title="Open in your local email client">
                    <Mail size={16} /> {t.emailBtn}
                  </a>
                  <button type="submit" className={styles.submitBtn}>
                    {t.submitBtn}
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : (
          /* Success Screen */
          <div className={styles.successScreen}>
            <CheckCircle size={72} className={styles.successIcon} />
            <h2 className={styles.successTitle}>{t.successTitle}</h2>
            <p className={styles.successDesc}>
              {t.successDesc.replace('{name}', name).replace('{reason}', reason)}
            </p>
            
            <div className={styles.successBox}>
              <ShieldCheck size={20} className={styles.shieldIcon} />
              <span>
                {t.successNext.replace('{email}', email)}
              </span>
            </div>

            <p className={styles.successFooter}>
              {t.successFooter} <a href="mailto:support@pitchavatar.com">support@pitchavatar.com</a>.
            </p>

            <div className={styles.successActions}>
              <Link href="/settings" className={styles.doneBtn}>
                {t.backBtn}
              </Link>
              <button className={styles.returnBtn} onClick={handleReset}>
                {t.returnBtn}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
