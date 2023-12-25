/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  addDoc,
  getDoc,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'

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
export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
const analytics = getAnalytics(app)
