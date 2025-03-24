import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './store.jsx'
import { Provider } from 'react-redux'

import toast,{ Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App/>
    <Toaster 
    position='bottom-right'
    toastOptions={
      {duration : 1800}
    }
    />
  </Provider>
)
