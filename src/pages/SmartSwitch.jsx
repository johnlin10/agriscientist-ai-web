import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../AppContext'
import style from './css/SmartSwitch.module.scss'
import { onSnapshot, doc } from 'firebase/firestore'
import { ref, onValue, set } from 'firebase/database'
import { database } from '../firebase'
import { writeFirestoreDoc } from '../firebase'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'

// 專門用於實驗性專題使用，知道鏈接的人即可進入
export default function SmartSwitch() {
  const { user } = useContext(AppContext)
  const [switchInit, setSwitchInit] = useState(false)

  const [switch1, setSwitch1] = useState(false)
  const [control1, setControl1] = useState(false)

  const [switch2, setSwitch2] = useState(false)
  const [control2, setControl2] = useState(false)

  const [cardAuth, setCardAuth] = useState(false)

  const [switchAuth, setSwitchAuth] = useState(false)
  const sensorsDataRef = ref(database, 'other/smartSwitch')

  const allowUsers = [
    process.env.REACT_APP_ADMIN_ACCOUNT,
    process.env.REACT_APP_SMARTSWITCH_USER_1,
    process.env.REACT_APP_SMARTSWITCH_USER_2,
  ]

  useEffect(() => {
    if (user) {
      if (allowUsers.some((users) => user.uid.startsWith(users))) {
        setSwitchAuth(true)
      } else {
        setSwitchAuth(false)
      }
    }
  }, [user])

  // 新的 Realtime database 方案
  useEffect(() => {
    const unsubscribe = onValue(sensorsDataRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSwitch1(data.switch_1)
        setControl1(data.switch_1)
        setSwitch2(data.switch_2)
        setControl2(data.switch_2)
        setCardAuth(data.card ? data.card : false)
        setSwitchInit(true)
      } else {
        set(sensorsDataRef, {
          switch_1: false,
          switch_2: false,
          card: false,
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (
        switchInit &&
        allowUsers.some((users) => user?.uid.startsWith(users))
      ) {
        try {
          await set(sensorsDataRef, {
            switch_1: control1,
            switch_2: control2,
          })
        } catch (error) {
          console.error('Error writing to Realtime Database:', error)
        }
      }
    }

    if (control1 !== undefined && control2 !== undefined) {
      fetchData()
    }
  }, [control1, control2])

  // 原本的 Firestore 方案
  // useEffect(() => {
  //   const unsubscribe = onSnapshot(sensorsDataRef, (docSnap) => {
  //     setSwitch1(docSnap.data().switch_1)
  //     setControl1(docSnap.data().switch_1)
  //     setSwitch2(docSnap.data().switch_2)
  //     setControl2(docSnap.data().switch_2)
  //     setSwitchAuth(docSnap.data().auth)
  //   })

  //   return () => {
  //     unsubscribe()
  //   }
  // }, [])

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       await writeFirestoreDoc(
  //         'test_database/smartswitch',
  //         {
  //           switch_1: control1,
  //           switch_2: control2,
  //           auth: switchAuth,
  //         },
  //         true
  //       )
  //     } catch (error) {
  //       console.error('Error writing to Firestore:', error)
  //     }
  //   }

  //   fetchData()
  // }, [control1, control2, switchAuth])

  return (
    <div className={style.container}>
      <div className={style.switch_block}>
        <SwitchInput
          actv={switch1}
          setActv={() => setControl1(!control1)}
          auth={switchAuth}
        />
        <SwitchInput
          actv={switch2}
          setActv={() => setControl2(!control2)}
          auth={switchAuth}
        />
        <div className={`${style.auth}${switchAuth ? ` ${style.actv}` : ''}`}>
          {switchAuth ? `已授權` : '未授權'}
        </div>
      </div>
      {user ? (
        <div
          className={`${style.userInfo}${switchAuth ? '' : ` ${style.noAuth}`}`}
        >
          <img src={user.photoURL} alt="" />
          <p>{user.displayName}</p>
          <div className={`${style.authStatus}`}>
            {switchAuth ? <FontAwesomeIcon icon={faCircleCheck} /> : ''}
            <p>{switchAuth ? '已驗證' : '未授權'}</p>
          </div>
        </div>
      ) : (
        <div
          className={`${style.userInfo}${switchAuth ? '' : ` ${style.noAuth}`}`}
        >
          <p>未登入</p>
        </div>
      )}
    </div>
  )
}

function SwitchInput({ actv, setActv, auth }) {
  return (
    <div
      className={`${style.switch}${actv ? ` ${style.open}` : ''}${
        auth ? '' : ` ${style.noAuth}`
      }`}
      onClick={auth ? () => setActv() : () => {}}
    >
      <div className={style.hole1}></div>
      <div className={style.hole2}></div>
    </div>
  )
}
