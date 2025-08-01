import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import LogInForm from '../src/components/LogInForm'
import AuthContext from '../src/contexts/AuthContext'


// Correctly mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...actual,
      BrowserRouter: ({ children }) => children,
      useNavigate: vi.fn()
    }
  })
  
  vi.mock('axios')
  vi.mock('react-toastify', () => ({
    toast:{
        error: vi.fn()
    }
  }))
  
  const mockAuthContext = {
    login: vi.fn()
    
  }

  describe('LoginForm', () => {

    const renderComponent = (contextOverrides = {}) => {
        const contextValue = { ...mockAuthContext, ...contextOverrides }
        return render(
            <BrowserRouter>
                <AuthContext.Provider value={contextValue}>
                    <LogInForm></LogInForm>
                </AuthContext.Provider>

            </BrowserRouter>
        )
    }

    beforeEach(() => {
        vi.clearAllMocks()

    })


    it('renders all fields correctly', () => {
        renderComponent()

        const usernameInput = screen.getByTestId('username-input')
        const passwordInput = screen.getByTestId('password-input')


        expect(usernameInput).toBeVisible()
        expect(passwordInput).toBeVisible()

    })

    it('changes all values correctly', () => {
        renderComponent()

        const usernameInput = screen.getByTestId('username-input')
        const passwordInput = screen.getByTestId('password-input')

        fireEvent.change(usernameInput, {target: {value: 'username'}})
        fireEvent.change(passwordInput, {target: {value: 'password'}})

        expect(usernameInput).toHaveValue('username')
        expect(passwordInput).toHaveValue('password')

    })

    it('submits the data correctly', () => {
        renderComponent()

        const usernameInput = screen.getByTestId('username-input')
        const passwordInput = screen.getByTestId('password-input')
        const submitButton = screen.getByRole('button', { name: /log in/i })

        fireEvent.change(usernameInput, {target: {value: 'username'}})
        fireEvent.change(passwordInput, {target: {value: 'password'}})
        fireEvent.click(submitButton)

        expect(mockAuthContext.login).toBeCalledWith(usernameInput.value, passwordInput.value)
        

    })

    it('does not submit the data when there is no data', () => {
        renderComponent()

        const usernameInput = screen.getByTestId('username-input')
        const passwordInput = screen.getByTestId('password-input')
        const submitButton = screen.getByRole('button', { name: /log in/i })

    
        fireEvent.click(submitButton)

        expect(mockAuthContext.login).not.toBeCalledWith(usernameInput.value, passwordInput.value)
        

    })



  })