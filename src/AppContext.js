// AppContext.js
import React, { createContext, useEffect, useState } from 'react'
import { auth, writeFirestoreDoc } from './firebase'

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
  // 帳號驗證
  const [user, setUser] = useState(null)
  const [adminPermit, setAdminPermit] = useState(false)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)

      // 確認是否為管理員
      const adminUids = [
        process.env.REACT_APP_ADMIN_ACCOUNT,
        process.env.REACT_APP_ADMIN_ACCOUNT2,
        process.env.REACT_APP_PROJECT_USER1,
        process.env.REACT_APP_PROJECT_USER2,
      ]
      setAdminPermit(user && adminUids.includes(user.uid))

      // 備份用戶基本資料至雲端
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
    return () => unsubscribe()
  }, [])

  // 打包狀態和狀態設置函數
  const value = {
    user,
    adminPermit,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
