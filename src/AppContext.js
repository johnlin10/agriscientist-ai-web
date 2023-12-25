// AppContext.js
import React, { createContext, useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestoreData } from './firebase'
const firebaseConfig = {
  apiKey: 'AIzaSyCWmLE3mis8l1DRUovdntGBxdDW_BxywYg',
  authDomain: 'agriscientist-ai.firebaseapp.com',
  projectId: 'agriscientist-ai',
  storageBucket: 'agriscientist-ai.appspot.com',
  messagingSenderId: '774646280553',
  appId: '1:774646280553:web:81a472271448aa950c0df8',
  measurementId: 'G-3K8E9VNZJQ',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
  // 帳號驗證
  const [user, setUser] = useState(null)
  const [adminPermit, setAdminPermit] = useState(false)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userInfo) => {
      setUser(userInfo)
      if (
        userInfo &&
        (userInfo.uid === process.env.REACT_APP_ADMIN_ACCOUNT ||
          userInfo.uid === process.env.REACT_APP_PROJECT_USER1)
      ) {
        setAdminPermit(true)
      } else {
        setAdminPermit(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // 打包狀態和狀態設置函數
  const value = {
    user,
    adminPermit,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
