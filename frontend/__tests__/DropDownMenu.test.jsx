import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import DropDownMenu from '../src/components/DropDownMenu'
import AuthContext from '../src/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'


// Mock dependencies
vi.mock('react-router-dom', async (importOriginal) => {
    const mod = await importOriginal()
    return {
      ...mod,
      useNavigate: vi.fn(),
    }
  })
  
  describe('DropDownMenu', () => {
    const mockNavigate = vi.fn()
    const mockUpdateSettings = vi.fn()
    const mockChangePassword = vi.fn()
    const mockDeleteAccount = vi.fn()
    const mockLogout= vi.fn()
  
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
      logout:mockLogout,
      error: null
    }

    const renderComponent = (contextOverrides = {}) => {
        const contextValue = { ...defaultContextValue, ...contextOverrides }
        
        vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    
        return render(
          <MemoryRouter>
            <AuthContext.Provider value={contextValue}>
              <DropDownMenu></DropDownMenu>
            </AuthContext.Provider>
          </MemoryRouter>
        )
      }

      beforeEach(() => {
        vi.clearAllMocks()
      })
    
      it('toggles dropdown menu when clicked', () => {
        renderComponent()

        const dropDownToggle = screen.getByTestId('profile-dropdown-toggle')
        const dropDownMenu = screen.queryByTestId('profile-dropdown-menu')

        expect(dropDownMenu).toBeNull()

        fireEvent.click(dropDownToggle)

        expect(screen.getByTestId('profile-dropdown-menu')).toBeVisible()

        fireEvent.click(dropDownToggle)
        expect(dropDownMenu).toBeNull();
        
      })

      it('navigates to unauthorized when no user and not loading', () => {
        renderComponent({ 
          user: null, 
          loadingAuth: false 
        })
        
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized')
      })
      
      it('does not navigate when loading auth', () => {
        renderComponent({ 
          user: null, 
          loadingAuth: true 
        })
        
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    

  })
    