'use client'

import { ToastContainer } from 'react-toastify'

export default function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnHover
      toastStyle={{
        background: '#111',
        color: '#e5e2e1',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 0,
        fontFamily: 'var(--font-inter)',
        fontSize: '12px',
        letterSpacing: '0.05em',
      }}
    />
  )
}
