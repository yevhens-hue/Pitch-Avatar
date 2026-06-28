'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import styles from './Profile.module.css'
import { useUser } from '@/context'
import { useToast } from '@/components/ui/ToastProvider'
import {
  getSeatsQuota,
  updateSeatsQuota,
  getMailDomain,
  saveMailDomain
} from '@/app/actions/enrollments'
import { ListenerSeat, MailDomain } from '@/types/listeners'
import { Sparkles, ShieldCheck, Mail, Users, ChevronDown, Camera, Star, User } from 'lucide-react'
import QuotaWidget from '@/components/QuotaWidget/QuotaWidget'
import { useUIStore } from '@/lib/store'

// New imports for profile functionality
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import Select from 'react-select'
import countries from 'world-countries'
import { updateUserProfile, uploadAvatar } from '@/services/user-service'
import { supabase } from '@/lib/supabase'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  role: z.string().optional(),
})
type ProfileFormValues = z.infer<typeof profileSchema>

const countryOptions = countries.map((c) => ({
  value: c.name.common,
  label: `${c.flag} ${c.name.common}`
})).sort((a, b) => a.label.localeCompare(b.label))

export default function Profile() {
  const { user, subscription } = useUser()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const isFutureVersion = useUIStore((state) => state.isFutureVersion)

  // Form setup
  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      country: '',
      role: '',
    }
  })

  // Sync user data to form when loaded
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        country: user.country || '',
        role: user.role || '',
      })
    }
  }, [user, reset])

  // Seat Quotas State
  const [quota, setQuota] = useState<ListenerSeat | null>(null)
  const [seatsSlider, setSeatsSlider] = useState(100)
  const [adminSeatsInput, setAdminSeatsInput] = useState('100')

  // Mail Domain State
  const [mailDomain, setMailDomain] = useState<MailDomain | null>(null)
  const [domainName, setDomainName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  // Extended mail domain config
  const [dnsRegion, setDnsRegion] = useState<'EU' | 'US' | 'APAC'>('EU')
  const [dnsGenerated, setDnsGenerated] = useState(false)
  const [senderName, setSenderName] = useState('Pitch Avatar Onboarding')
  const [replyToEmail, setReplyToEmail] = useState('')
  const [invitationFromEmail, setInvitationFromEmail] = useState('')
  const [reminderFromEmail, setReminderFromEmail] = useState('')

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [localAvatar, setLocalAvatar] = useState<string | null>(null)

  // Load database values
  const loadData = () => {
    startTransition(async () => {
      try {
        const qRes = await getSeatsQuota()
        setQuota(qRes)
        setSeatsSlider(qRes.maxSeats)
        setAdminSeatsInput(qRes.maxSeats.toString())

        const mdRes = await getMailDomain()
        if (mdRes) {
          setMailDomain(mdRes)
          setDomainName(mdRes.domainName)
          setSenderEmail(mdRes.senderEmail)
        }
      } catch (err) {
        showToast('Failed to load profile data', 'error')
      }
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  // Profile Form Action
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateUserProfile(data)
      showToast('Personal info saved!', 'success')
    } catch (e: any) {
      showToast(e.message || 'Failed to save profile', 'error')
    }
  }

  // Password Reset Action
  const handlePasswordReset = async () => {
    if (!user?.email) {
      showToast('No email found to reset password', 'error')
      return
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/settings',
      })
      if (error) throw error
      showToast('Password reset email sent!', 'success')
    } catch (e: any) {
      showToast(e.message || 'Failed to send reset email', 'error')
    }
  }

  // Avatar Upload Action
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const url = await uploadAvatar(file)
      setLocalAvatar(url)
      showToast('Avatar updated successfully!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to upload avatar', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  // Calculate Tiered Billing Seats Pricing
  const calculateCost = (seats: number) => {
    if (seats <= 100) {
      return seats * 10
    }
    return (100 * 10) + ((seats - 100) * 8)
  }

  const monthlyCost = calculateCost(seatsSlider)

  const handlePurchaseSeats = async () => {
    try {
      await updateSeatsQuota(seatsSlider)
      showToast(`Successfully upgraded your capacity to ${seatsSlider} Listener Seats!`, 'success')
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to update seats', 'error')
    }
  }

  const handleAdminSeatsOverride = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(adminSeatsInput)
    if (isNaN(parsed) || parsed < 0) {
      showToast('Please enter a valid seats number', 'error')
      return
    }
    try {
      await updateSeatsQuota(parsed)
      showToast(`Super Admin: Overrode account seats limit to ${parsed}`, 'success')
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to override seats limit', 'error')
    }
  }

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainName.trim() || !senderEmail.trim()) {
      showToast('Domain name and sender address are required', 'error')
      return
    }
    try {
      await saveMailDomain(domainName, senderEmail)
      showToast(`Custom Onboarding domain ${domainName} successfully verified and confirmed!`, 'success')
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to verify domain', 'error')
    }
  }

  const currentAvatar = localAvatar || user?.photoUrl

  return (
    <div className={styles.container}>
      <div className={styles.leftCol}>
        {/* Personal info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Personal info</h2>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.fieldsetField}>
              <label>Full name</label>
              <input type="text" {...register('name')} />
            </div>
            <div className={styles.fieldsetField}>
              <label>Email</label>
              <input type="email" {...register('email')} disabled />
            </div>
            <div className={styles.fieldsetField}>
              <label>Phone Number</label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                    <PhoneInput
                      international
                      defaultCountry="US"
                      value={field.value}
                      onChange={field.onChange}
                      className="PhoneInputWrapper"
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              />
              <style>{`
                .PhoneInputWrapper input {
                  border: none !important;
                  outline: none !important;
                  background: transparent;
                  font-size: 14px;
                  width: 100%;
                  margin-left: 8px;
                }
              `}</style>
            </div>
            <div className={styles.fieldsetField}>
              <label>Company</label>
              <input type="text" {...register('company')} />
            </div>
            <div className={styles.fieldsetField}>
              <label>Country</label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={countryOptions}
                    value={countryOptions.find(c => c.value === field.value)}
                    onChange={(val) => field.onChange(val?.value)}
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#0070f3' }
                      }),
                      menu: (base) => ({ ...base, zIndex: 100 })
                    }}
                  />
                )}
              />
            </div>
            <div className={styles.fieldsetField}>
              <label>Role in company</label>
              <input type="text" {...register('role')} />
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.passwordBtn} style={{ borderColor: '#d9d9d9', color: '#8c8c8c' }} onClick={handlePasswordReset}>
                Change password
              </button>
              <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Presenter Seats billing calculator (HIDDEN TEMPORARILY)
        <div className={styles.card} id="billing-seats" style={{ borderLeft: '4px solid var(--primary)' }}>
          ...
        </div>
        */}
      </div>

      <div className={styles.rightCol}>
        {/* Account avatar */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Account avatar</h2>
          <div className={styles.avatarSvgCircle}>
            {currentAvatar ? (
              <img src={currentAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User color="white" />
            )}
          </div>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAvatarUpload} />
          <button className={styles.photoBtnCamera} onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Change your avatar photo'} <Camera size={16} />
          </button>
        </div>

        {/* Your subscription plan */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Your subscription plan</h2>
          <div className={styles.planCircle}>
            <Star size={24} />
          </div>
          <div style={{ textAlign: 'center', fontSize: '13px', marginBottom: '20px', color: '#333' }}>
            Account plan: <span style={{ color: '#0070f3', fontWeight: 500, textTransform: 'capitalize' }}>{subscription?.plan || 'Developer'}</span>
          </div>
          
          {/* Progress Bar */}
          {subscription && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>
                <span>AI Avatar Minutes</span>
                <span>{subscription.aiMinutesUsed} / {subscription.aiMinutesTotal}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: '#0070f3', 
                  width: `${Math.min(100, Math.max(0, (subscription.aiMinutesUsed / subscription.aiMinutesTotal) * 100))}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              {(subscription.aiMinutesUsed / subscription.aiMinutesTotal) > 0.8 && (
                <div style={{ fontSize: '11px', color: '#ea580c', marginTop: '6px', textAlign: 'center' }}>
                  You are nearing your AI minutes limit! Upgrade to avoid interruption.
                </div>
              )}
            </div>
          )}

          {isFutureVersion && quota && (
            <div style={{ marginBottom: '20px' }}>
              <QuotaWidget />
            </div>
          )}

          <button className={styles.saveBtn} style={{ width: '100%' }}>
            Change your plan
          </button>
        </div>

        {/* Custom Mail Domain Setup — expanded (HIDDEN TEMPORARILY)
        <div className={styles.card}>
          ...
        </div>
        */}

        {/* Super Admin Control Panel override limit manually (HIDDEN TEMPORARILY)
        <div className={styles.card} style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5' }}>
          ...
        </div>
        */}
      </div>
    </div>
  )
}
