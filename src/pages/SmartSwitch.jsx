import { useEffect, useState } from 'react'
import style from './css/SmartSwitch.module.scss'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { writeFirestoreDoc } from '../firebase'

// 專門用於實驗性專題使用，知道鏈接的人即可進入
export default function SmartSwitch() {
  const [switch1, setSwitch1] = useState(false)
  const [control1, setControl1] = useState(false)

  const [switch2, setSwitch2] = useState(false)
  const [control2, setControl2] = useState(false)

  const [switchAuth, setSwitchAuth] = useState(true)

  useEffect(() => {
    const sensorsDataRef = doc(db, 'test_database', 'smartswitch')
    const unsubscribe = onSnapshot(sensorsDataRef, (docSnap) => {
      setSwitch1(docSnap.data().switch_1)
      setControl1(docSnap.data().switch_1)
      setSwitch2(docSnap.data().switch_2)
      setControl2(docSnap.data().switch_2)
      setSwitchAuth(docSnap.data().auth)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        await writeFirestoreDoc(
          'test_database/smartswitch',
          {
            switch_1: control1,
            switch_2: control2,
            auth: switchAuth,
          },
          true
        )
      } catch (error) {
        console.error('Error writing to Firestore:', error)
      }
    }

    fetchData()
  }, [control1, control2, switchAuth])

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
          {switchAuth ? '已授權' : '未授權'}
        </div>
      </div>
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
