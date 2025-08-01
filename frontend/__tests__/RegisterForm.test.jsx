import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AuthContext from '../src/contexts/AuthContext'
import RegisterForm from '../src/components/RegisterForm'


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
    
    userSettings: {},
    loadingAuth: false,
    updateSettings: vi.fn(),
    changePassword: vi.fn(),
    register: vi.fn(),
    error: null
  }

  describe('EditProfileForm', () => {

    const renderComponent = (contextOverrides = {}) => {
        const contextValue = { ...mockAuthContext, ...contextOverrides }
        return render(
            <BrowserRouter>
                <AuthContext.Provider value={contextValue}>
                    <RegisterForm></RegisterForm>
                </AuthContext.Provider>
            </BrowserRouter>
        )
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders form fields correctly', () => {
        renderComponent()
        
        expect(screen.getByTestId('test-register-name')).toBeInTheDocument()
        expect(screen.getByTestId('test-register-surname')).toBeInTheDocument()
        expect(screen.getByTestId('test-register-username')).toBeInTheDocument()
        expect(screen.getByTestId('test-register-email')).toBeInTheDocument()
        expect(screen.getByTestId('test-register-password')).toBeInTheDocument()
        expect(screen.getByTestId('test-register-confirm-password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
      })

    it('updates the values on change', () => {
        renderComponent()

        const nameInput = screen.getByTestId('test-register-name')
        const surnameInput = screen.getByTestId('test-register-surname')
        const usernameInput = screen.getByTestId('test-register-username')
        const emailInput = screen.getByTestId('test-register-email')
        const passwordInput = screen.getByTestId('test-register-password')
        const confPasswordInput = screen.getByTestId('test-register-confirm-password')

        fireEvent.change(nameInput, {target : {value : 'test-name'}})
        fireEvent.change(surnameInput, {target : {value : 'test-surname'}})
        fireEvent.change(usernameInput, {target : {value : 'test-username'}})
        fireEvent.change(emailInput, {target : {value : 'test-email'}})
        fireEvent.change(passwordInput, {target : {value : 'test-password'}})
        fireEvent.change(confPasswordInput, {target : {value : 'test-conf-password'}})

        expect(nameInput).toHaveValue('test-name')
        expect(surnameInput).toHaveValue('test-surname')
        expect(usernameInput).toHaveValue('test-username')
        expect(emailInput).toHaveValue('test-email')
        expect(passwordInput).toHaveValue('test-password')
        expect(confPasswordInput).toHaveValue('test-conf-password')



    })

    
    it('shows error on invalid form', async () => {
        renderComponent()

    // Log the rendered component for debugging


        const nameInput = screen.getByTestId('test-register-name')
        const surnameInput = screen.getByTestId('test-register-surname')
        const usernameInput = screen.getByTestId('test-register-username')
        const emailInput = screen.getByTestId('test-register-email')
        const passwordInput = screen.getByTestId('test-register-password')
        const confPasswordInput = screen.getByTestId('test-register-confirm-password')
        const submitButton = screen.getByRole('button', { name: /register/i })
      

        

        fireEvent.click(submitButton)
        expect(mockAuthContext.register).not.toHaveBeenCalledWith(nameInput.value, surnameInput.value, usernameInput.value, emailInput.value, passwordInput.value, confPasswordInput.value)



    })

    it('it submits the form successfully', async () => {

        const mockNavigate = vi.fn()
        vi.mocked(useNavigate).mockReturnValue(mockNavigate)

        renderComponent()

    // Log the rendered component for debugging


        const nameInput = screen.getByTestId('test-register-name')
        const surnameInput = screen.getByTestId('test-register-surname')
        const usernameInput = screen.getByTestId('test-register-username')
        const emailInput = screen.getByTestId('test-register-email')
        const passwordInput = screen.getByTestId('test-register-password')
        const confPasswordInput = screen.getByTestId('test-register-confirm-password')
        const submitButton = screen.getByRole('button', { name: /register/i })
        
        

        fireEvent.change(nameInput, {target : {value : 'testnamee'}})
        fireEvent.change(surnameInput, {target : {value : 'testsurname'}})
        fireEvent.change(usernameInput, {target : {value : 'testusername'}})
        fireEvent.change(emailInput, {target : {value : 'test@email.com'}})
        fireEvent.change(passwordInput, {target : {value : 'test-password'}})
        fireEvent.change(confPasswordInput, {target : {value : 'test-password'}})

        

        fireEvent.click(submitButton)
        expect(mockAuthContext.register).toHaveBeenCalledWith(nameInput.value,surnameInput.value, emailInput.value, usernameInput.value, passwordInput.value)



    })


  })

  