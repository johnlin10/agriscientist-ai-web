// AppContext.js
import React, { createContext, useEffect, useState } from 'react'
import { auth } from './firebase'

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
