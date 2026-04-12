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
          <h2 className={styles.cardTitle}>Личная информация</h2>
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label>Полное имя</label>
              <input type="text" defaultValue={user?.name ?? ''} />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" defaultValue={user?.email ?? ''} disabled />
            </div>
            <div className={styles.formGroup}>
              <label>Номер телефона</label>
              <select>
                 <option>Выбрать страну</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Компания</label>
              <input type="text" defaultValue={user?.company ?? ''} />
            </div>
            <div className={styles.formGroup}>
              <label>Страна</label>
               <select>
                 <option>Выбрать страну</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Роль в компании</label>
              <input type="text" placeholder="Введите вашу роль" />
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.passwordBtn}>Изменить пароль</button>
              <button type="submit" className={styles.saveBtn}>Сохранить изменения</button>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.rightCol}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Фото профиля</h2>
          <div className={styles.photoContainer}>
            <div className={styles.avatarLarge}>{user?.avatarInitial ?? 'U'}</div>
            <button className={styles.photoBtn}>Изменить фото профиля</button>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Ваш план подписки</h2>
          <div className={styles.planContainer}>
            <div className={styles.planIcon}>★</div>
            <p className={styles.planName}>План аккаунта: <strong>Trial</strong></p>
            <button className={styles.planBtn}>Изменить план подписки</button>
          </div>
        </div>
      </div>
    </div>
  )
}
