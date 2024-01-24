import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../AppContext'
import style from './css/SmartSwitch.module.scss'
import {
  onSnapshot,
  doc,
  collection,
  getDocs,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import { ref, onValue, set } from 'firebase/database'
import { database } from '../firebase'
import { db, writeFirestoreDoc, getFirestoreData } from '../firebase'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleXmark,
  faRightToBracket,
} from '@fortawesome/free-solid-svg-icons'

// 專門用於實驗性專題使用，知道鏈接的人即可進入
export default function SmartSwitch(props) {
  const { user } = useContext(AppContext)
  const [switchInit, setSwitchInit] = useState(false)
  const [userAuth, setUserAuth] = useState([])

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
    process.env.REACT_APP_SMARTSWITCH_USER_3,
    process.env.REACT_APP_SMARTSWITCH_USER_4,
  ]

  // useEffect(() => {
  //   const isUserAllowed = user ? allowUsers.includes(user.uid) : false
  //   setSwitchAuth(isUserAllowed)
  // }, [user])

  useEffect(() => {
    const currentUserAuth = userAuth.find((users) => users.uid === user?.uid)
    console.log(currentUserAuth)
    setSwitchAuth(currentUserAuth)
  }, [userAuth, user])

  // 新的 Realtime database 方案
  useEffect(() => {
    const unsubscribe = onValue(sensorsDataRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        console.log(data)
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
  }, [sensorsDataRef])

  useEffect(() => {
    const fetchData = async () => {
      if (
        switchInit &&
        (cardAuth || allowUsers.some((users) => user?.uid.startsWith(users)))
      ) {
        try {
          await set(sensorsDataRef, {
            switch_1: control1,
            switch_2: control2,
            card: cardAuth,
          })
        } catch (error) {
          console.error('Error writing to Realtime Database:', error)
        }
      }
    }

    if (control1 !== undefined && control2 !== undefined) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [control1, control2, cardAuth])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const userAuthRef = doc(db, 'test_database', 'smartswitch_auth')
    const unsubscribe = onSnapshot(userAuthRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setUserAuth(data.users)
        console.log(data.users)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

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

  async function updateUserAuth() {
    await writeFirestoreDoc(
      'test_database/smartswitch_auth',
      {
        users: [
          {
            authCtrl: true,
            uid: 'Zh8EYV7nH3PYqZKUhbf3h76OcNn1',
          },
          {
            authCtrl: true,
            uid: 'V5MraDn2x8OJ7d9PhCve8AZ5C5k1',
          },
          {
            uid: 'hogDssbxmBgCtdgR9xJzl1NjlCE3',
            authCtrl: true,
          },
          {
            authCtrl: true,
            uid: 'yswVR0HmttcuTcXr3OXzAF0xALk2',
          },
          {
            authCtrl: true,
            uid: 'HSAwBVkprbUvI0Qf0yOen3dApm53',
          },
        ],
      },
      true
    )
  }

  const adf = {
    users: [
      {
        authCtrl: true,
        uid: 'Zh8EYV7nH3PYqZKUhbf3h76OcNn1',
      },
      {
        authCtrl: true,
        uid: 'V5MraDn2x8OJ7d9PhCve8AZ5C5k1',
      },
      {
        uid: 'hogDssbxmBgCtdgR9xJzl1NjlCE3',
        authCtrl: true,
      },
      {
        authCtrl: true,
        uid: 'yswVR0HmttcuTcXr3OXzAF0xALk2',
      },
      {
        authCtrl: true,
        uid: 'HSAwBVkprbUvI0Qf0yOen3dApm53',
      },
    ],
  }

  return (
    <>
      <div className={style.container}>
        <div className={style.switch_block}>
          <SwitchInput
            actv={switch1}
            setActv={() => setControl1(!control1)}
            auth={switchAuth}
            cardAuth={cardAuth}
          />
          <SwitchInput
            actv={switch2}
            setActv={() => setControl2(!control2)}
            auth={switchAuth}
            cardAuth={cardAuth}
          />
          <div
            className={`${style.auth}${
              switchAuth || cardAuth ? ` ${style.actv}` : ''
            }`}
          >
            {switchAuth || cardAuth ? `已授權` : '未授權'}
          </div>
        </div>
        {/* 用戶驗證情況 */}
        {user ? (
          <div
            className={`${style.userInfo}${
              switchAuth ? '' : ` ${style.noAuth}`
            }`}
          >
            <img src={user.photoURL} alt="" />
            <p>{user.displayName}</p>
            <div className={`${style.authStatus}`}>
              {switchAuth ? (
                <FontAwesomeIcon icon={faCircleCheck} />
              ) : (
                <FontAwesomeIcon icon={faCircleXmark} />
              )}
              <p>{switchAuth ? '已驗證' : '未驗證'}</p>
            </div>
          </div>
        ) : (
          <div
            className={`${style.userInfo}${
              switchAuth ? '' : ` ${style.noAuth}`
            }`}
          >
            <p>未登入</p>

            <div
              className={`${style.authStatus} ${style.notSignin}`}
              onClick={() => props.navigateClick('/user')}
            >
              <FontAwesomeIcon icon={faRightToBracket} />
              <p>前往登入</p>
            </div>
          </div>
        )}
      </div>
      {/* 智慧插座權限控制（僅管理員可控） */}
      {switchAuth && <Authcontrol userAuth={userAuth} selfUID={user?.uid} />}
    </>
  )
}

function SwitchInput({ actv, setActv, auth, cardAuth }) {
  return (
    <div
      className={`${style.switch}${actv ? ` ${style.open}` : ''}${
        auth || cardAuth ? '' : ` ${style.noAuth}`
      }`}
      onClick={auth || cardAuth ? () => setActv() : () => {}}
    >
      <div className={style.hole1}></div>
      <div className={style.hole2}></div>
    </div>
  )
}

function Authcontrol({ userAuth, selfUID }) {
  const [users, setUsers] = useState([])
  const [authStatus, setAuthStatus] = useState(false)
  const [inputUserUID, setInputUserUID] = useState()

  useEffect(() => {
    const fetchData = async () => {
      // 下面的代碼根據你之前的需求進行修改
      const userDataPromises = userAuth.map(async (item) => {
        try {
          const userData = await getFirestoreData(`user/${item.uid}`)
          console.log({
            auth: item.authCtrl,
            uid: item.uid,
            name: userData.name,
            photo: userData.headSticker,
          })
          return {
            auth: item.authCtrl,
            uid: item.uid,
            name: userData.name,
            photo: userData.headSticker,
          }
        } catch (error) {
          // 處理用戶資料未上傳的情況，這裡你可以根據實際情況進行適當的處理
          console.error(`Failed to fetch data for user with UID: ${item.uid}`)
          return {
            auth: item.authCtrl,
            uid: item.uid,
            name: '',
            photo: '', // 設定一個默認頭像 URL
          }
        }
      })

      const userDataArray = await Promise.all(userDataPromises)
      setUsers(userDataArray)
    }

    fetchData()
  }, [userAuth]) // 記得把依賴項設為空，這樣它只會在組件初次渲染時執行

  const handleAuthChange = async (e, uid) => {
    const newAuthStatus = e.target.value === 'true'

    // 更新本地狀態
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.uid === uid ? { ...user, auth: newAuthStatus } : user
      )
    )

    // 更新雲端狀態
    const userAuthRef = doc(db, 'test_database', 'smartswitch_auth')
    const userAuthSnapshot = await getDoc(userAuthRef)

    if (userAuthSnapshot.exists()) {
      const updatedUsers = userAuthSnapshot
        .data()
        .users.map((user) =>
          user.uid === uid ? { ...user, authCtrl: newAuthStatus } : user
        )

      await updateDoc(userAuthRef, {
        users: updatedUsers,
      })
    }
  }

  useEffect(() => {
    const currentUserAuth = users.find((user) => user.uid === selfUID)?.auth
    console.log(currentUserAuth)
    setAuthStatus(currentUserAuth)
  }, [selfUID, users])

  // 新增用戶
  const addUser = async (uid, authCtrl) => {
    const userAuthRef = doc(db, 'test_database', 'smartswitch_auth')
    const userAuthSnapshot = await getDoc(userAuthRef)

    if (userAuthSnapshot.exists()) {
      const updatedUsers = [...userAuthSnapshot.data().users, { uid, authCtrl }]

      await updateDoc(userAuthRef, {
        users: updatedUsers,
      })
    }
  }

  // 移除用戶
  const removeUser = async (uid) => {
    const userAuthRef = doc(db, 'test_database', 'smartswitch_auth')
    const userAuthSnapshot = await getDoc(userAuthRef)

    if (userAuthSnapshot.exists()) {
      const updatedUsers = userAuthSnapshot
        .data()
        .users.filter((user) => user.uid !== uid)

      await updateDoc(userAuthRef, {
        users: updatedUsers,
      })
    }
  }

  const handleAddUser = (uid) => {
    // 假設這裡有一個用戶 UID 和 authCtrl 的狀態
    const newUserAuthCtrl = false // 或者 false，取決於你的需求
    addUser(uid, newUserAuthCtrl)
  }

  const handleRemoveUser = (uid) => {
    const confirmed = window.confirm('確定要移除用戶嗎？')

    if (confirmed) {
      removeUser(uid)
    }
  }

  return (
    <>
      {users?.length > 0 && (
        <div className={style.authControl}>
          <h1>已授權</h1>
          <ul>
            {users.map((user, index) => (
              <li key={index}>
                <img
                  src={
                    user.photo
                      ? user.photo
                      : 'https://fakeimg.pl/72x72/ffffff/?text=?'
                  }
                  alt=""
                />
                <div className={style.userInfo}>
                  <p className={style.userName}>
                    {user.name ? user.name : '未知用戶'}
                  </p>
                  <p className={style.userUID}>{user.uid}</p>
                </div>
                <div className={style.authStatus}>
                  {authStatus ? (
                    <>
                      <select
                        name="權限"
                        className={style.dataUnitSelection}
                        value={user.auth}
                        onChange={(e) => handleAuthChange(e, user.uid)}
                      >
                        <optgroup label="根據時間">
                          <option value={true}>權限管理員</option>
                          <option value={false}>允許控制</option>
                        </optgroup>
                      </select>
                      <button onClick={() => handleRemoveUser(user.uid)}>
                        <FontAwesomeIcon icon={faCircleXmark} />
                      </button>
                    </>
                  ) : (
                    <p>{user.auth ? '權限管理員' : '允許控制'}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {authStatus && (
            <div className={style.addUser}>
              <input
                type="text"
                placeholder="欲加入用戶的 ID"
                value={inputUserUID}
                onChange={(e) => setInputUserUID(e.target.value)}
              />
              <button
                onClick={() => {
                  handleAddUser(inputUserUID)
                  setInputUserUID('')
                }}
              >
                新增
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
