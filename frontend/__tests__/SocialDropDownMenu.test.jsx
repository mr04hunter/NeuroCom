import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SocialDropDownMenu from '../src/components/SocialDropDownMenu'
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

describe('ChatroomsDropDownMenu', () => {
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
          <SocialDropDownMenu></SocialDropDownMenu>
        </AuthContext.Provider>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })


  it('toggles dropdown menu when clicked', () => {
    renderComponent()
    const dropdownToggle = screen.getByTestId('test-social-dropdown-button')
    const dropdownMenu = screen.queryByTestId('test-social-dropdown-content');
    
    // Initial state
    expect(dropdownMenu).toBeNull();

    // Open dropdown
    fireEvent.click(dropdownToggle)
    expect(screen.getByTestId('test-social-dropdown-content')).toBeVisible()

    // Close dropdown
    fireEvent.click(dropdownToggle)
    expect(dropdownMenu).toBeNull();
  })



 
})