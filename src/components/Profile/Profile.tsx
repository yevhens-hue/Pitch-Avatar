'use client'

import React from 'react'
import styles from './Profile.module.css'
import { useUser } from '@/context'

export default function Profile() {
  const { user } = useUser()

  return (
    <div className={styles.container}>
      <div className={styles.leftCol}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Personal Information</h2>
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" defaultValue={user?.name ?? ''} />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" defaultValue={user?.email ?? ''} disabled />
            </div>
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <select>
                 <option>Select country</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Company</label>
              <input type="text" defaultValue={user?.company ?? ''} />
            </div>
            <div className={styles.formGroup}>
              <label>Country</label>
               <select>
                 <option>Select country</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Company Role</label>
              <input type="text" placeholder="Enter your role" />
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.passwordBtn}>Change password</button>
              <button type="submit" className={styles.saveBtn}>Save changes</button>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.rightCol}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Profile Photo</h2>
          <div className={styles.photoContainer}>
            <div className={styles.avatarLarge}>{user?.avatarInitial ?? 'U'}</div>
            <button className={styles.photoBtn}>Change profile photo</button>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Subscription Plan</h2>
          <div className={styles.planContainer}>
            <div className={styles.planIcon}>★</div>
            <p className={styles.planName}>Account Plan: <strong>Trial</strong></p>
            <button className={styles.planBtn}>Change subscription plan</button>
          </div>
        </div>
      </div>
    </div>
  )
}
