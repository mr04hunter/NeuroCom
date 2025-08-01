import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import NavBar from '../src/components/NavBar'
import AuthContext from '../src/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'




// Mock dependencies
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    NavLink: ({ children }) => children,
    useNavigate: vi.fn(),
  }
})

describe('NavBar', () => {
  const mockNavigate = vi.fn()
  const mockUpdateSettings = vi.fn()
  const mockChangePassword = vi.fn()
  const mockDeleteAccount = vi.fn()

  const defaultContextValue = {
    userSettings: {
      profilePicture: null,
      username: 'testuser'
    },
    loadingAuth: false,
    user: { id: '123' },
    updateSettings: mockUpdateSettings,
    changePassword: mockChangePassword,
    deleteAccount: mockDeleteAccount,
    error: null
  }

  const renderComponent = (contextOverrides = {}) => {
    const contextValue = { ...defaultContextValue, ...contextOverrides }
    
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    return render(
      <MemoryRouter>
        <AuthContext.Provider value={contextValue}>
          <NavBar></NavBar>
        </AuthContext.Provider>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })


  it('renders correctly when not logged in', () => {
    renderComponent({user:null})

    const registerLink = screen.getByTestId('test-register-button')
    const loginLink = screen.getByTestId('test-login-button')

    expect(registerLink).toBeVisible()
    expect(loginLink).toBeVisible()

  })

  it('renders correctly when logged in', () => {
    renderComponent()

    const notificationsDropDown = screen.getByTestId('test-notifications-dropdown')
    const chatroomsDropdown = screen.getByTestId('test-chatrooms-dropdown')
    const profileDropDown = screen.getByTestId('test-profile-dropdown')
    const socialDropDown = screen.getByTestId('test-social-dropdown')

    expect(notificationsDropDown).toBeVisible()
    expect(chatroomsDropdown).toBeVisible()
    expect(socialDropDown).toBeVisible()
    expect(profileDropDown).toBeVisible()

  })
 
})