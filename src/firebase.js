/* eslint-disable no-unused-vars */
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import { debounce } from 'lodash'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const database = getDatabase(app)
export const auth = getAuth(app)
const storage = getStorage()
const analytics = getAnalytics(app)

/**
 * 根據給定的路徑自動辨識並獲取 Firestore 中的 collection 或 document 内容
 * @param {string} path - collection 或 document 的路徑
 * @returns {Promise<Array|Object>} - 如果是 collection 返回文檔數組，如果是 document 返回内容對象
 */
export const getFirestoreData = async (path) => {
  // 切割路徑以確定是 document 還是 collection
  const pathSegments = path.split('/').filter(Boolean) // 過濾掉空字符串
  const isCollection = pathSegments.length % 2 !== 0 // 奇數段表示 document，偶數段表示 collection

  if (!isCollection) {
    // 作為 document 路徑獲取數據
    const docRef = doc(db, path)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      // 如果是 document，返回其内容
      return docSnap.data()
    } else {
      // 如果 document 不存在，返回 null 或抛出錯誤
      console.error('Document does not exist at this path:', path)
      return null
    }
  } else {
    // 作為 collection 路徑獲取數據
    const colRef = collection(db, path)
    const querySnapshot = await getDocs(colRef)

    // 返回 collection 中所有 documents 的内容
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }
}

/**
 * 將內容存入或更新某個文檔中
 * @param {string} path - 文檔路徑
 * @param {Array} data - 欲存入的內容
 * @param {boolean} [overwrite] - 是否覆蓋
 * @example
 * // 覆蓋文檔的內容
 * await writeFirestoreDoc('my-doc', { name: 'John', age: 30 }, true);
 * // 更新文檔的部分內容
 * await writeFirestoreDoc('my-doc', { age: 31 }, false);
 */
export const writeFirestoreDoc = debounce(
  async (path, data, overwrite = false) => {
    const docRef = doc(db, path)
    // 使用 getDoc 檢查文檔是否存在
    const docSnapshot = await getDoc(docRef)
    if (overwrite || !docSnapshot.exists()) {
      // 如果overwrite為true，覆蓋文檔的內容
      await setDoc(docRef, data)
    } else {
      // 如果overwrite為false，更新文檔的部分內容
      await updateDoc(docRef, data)
    }
  },
  500
) // 在這裡設定節流的時間，例如 1000 毫秒 (1 秒)

/**
 * 從 Storage 路徑轉換為文件實際 URL
 * @param {string} path 文件在 Storage 的路徑
 * @returns
 */
export function getFileUrl(path) {
  const photoRef = ref(storage, path)
  const url = getDownloadURL(photoRef)
  return url
}
