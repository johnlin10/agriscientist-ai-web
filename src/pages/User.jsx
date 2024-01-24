import React, { useEffect, useState, useContext } from 'react'
import css from './css/User.module.scss'
import { Helmet } from 'react-helmet'
import Moment from 'react-moment'

import { AppContext } from '../AppContext'

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'

// Firebase
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
import { app, db, writeFirestoreDoc } from '../firebase'

export const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export default function User(props) {
  const { user } = useContext(AppContext)

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user
      })
      .catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message
        const email = error.email
        const credential = GoogleAuthProvider.credentialFromError(error)
        console.log(
          errorCode + '/ ' + errorMessage + '/ ' + email + '/ ' + credential
        )
      })
  }

  //updateDoc

  // 上傳用戶基本資料
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userInfo = {
          email: user.email,
          name: user.displayName,
          headSticker: user.photoURL,
          uid: user.uid,
        }

        await writeFirestoreDoc(`user/${user.uid}`, userInfo, true)
      }
    })
    return unsubscribe
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      // alert('登出成功')
    } catch (error) {
      // Handle error
      console.log(error)
    }
  }

  return (
    <>
      <Helmet>
        <title>田野數據科學家｜用戶</title>
        <meta name="description" content="登入以進行進一步的交流" />
      </Helmet>
      <div className={css.content}>
        {user ? (
          <>
            <div className={css.userInfo}>
              <img
                className={css.userIMG}
                src={user.photoURL}
                alt={user.displayName}
              ></img>
              <div>
                <p className={css.userName}>{user.displayName}</p>
                <p className={css.userEmail} title={user.email}>
                  {user.email}
                </p>
                <p className={css.userUID} title={user.email}>
                  <span className={css.id}>ID</span>
                  {user.uid}
                </p>
                {props.adminPermit ? (
                  <p className={css.projUser}>
                    <FontAwesomeIcon icon={faStar} />
                    專題成員
                  </p>
                ) : (
                  <p className={css.guest}>
                    {/* <FontAwesomeIcon icon={faStar} /> */}
                    訪客
                  </p>
                )}
              </div>
            </div>
            <p className={css.createdAt}>
              Created at{' '}
              <Moment unix fromNow>
                {Number(user.metadata.createdAt) / 1000}
              </Moment>
            </p>
            <button
              className={`${css.signOut_Btn} ${css.logout}`}
              onClick={handleSignOut}
            >
              登出
            </button>
          </>
        ) : (
          <>
            <div
              className={`${css.userInfo}${!user ? ` ${css.notSignUp}` : ''}`}
            >
              <img
                className={css.userIMG}
                src={`${process.env.PUBLIC_URL}/images/user.png`}
                alt="尚未登入"
              ></img>
              <div>
                <p className={`${css.userName} ${css.not}`}>尚未登入</p>
              </div>
            </div>
            <button className={css.signOut_Btn} onClick={handleGoogleSignIn}>
              使用 Google 登入
            </button>
          </>
        )}
      </div>
    </>
  )
}
