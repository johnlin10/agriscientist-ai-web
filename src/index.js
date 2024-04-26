import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { HashRouter } from 'react-router-dom'
import { AppProvider } from './AppContext'

import * as serviceWorkerRegistration from './serviceWorkerRegistration'
serviceWorkerRegistration.register({
  onSuccess: () => console.log('Service Worker 註冊成功'),
  onUpdate: (registration) => {
    console.log('Service Worker 更新可用')
  },
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <AppProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AppProvider>
  </React.StrictMode>
)
reportWebVitals()
