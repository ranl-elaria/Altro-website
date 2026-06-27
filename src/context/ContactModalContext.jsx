import { createContext, useCallback, useContext, useState } from 'react'

const ContactModalContext = createContext(null)

export function ContactModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])
  const toggleModal = useCallback(() => setIsOpen(p => !p), [])

  return (
    <ContactModalContext.Provider value={{ isOpen, openModal, closeModal, toggleModal }}>
      {children}
    </ContactModalContext.Provider>
  )
}

export function useContactModal() {
  const context = useContext(ContactModalContext)
  if (!context) {
    throw new Error('useContactModal must be used within ContactModalProvider')
  }
  return context
}
