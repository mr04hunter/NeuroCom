import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import EditProfileForm from '../src/components/EditProfileForm'
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
    user:{
        username: 'test_user',
        firstName: 'testname',
        lastName: 'testlastname',
        bio: 'test_bio',
        email:'test@test.com'
    },
    userSettings: {},
    loadingAuth: false,
    updateSettings: vi.fn(),
    changePassword: vi.fn(),
    edit_profile: vi.fn(),
    error: null
  }

  describe('EditProfileForm', () => {

    const renderComponent = (contextOverrides = {}) => {
        const contextValue = { ...mockAuthContext, ...contextOverrides }
        return render(
            <BrowserRouter>
                <AuthContext.Provider value={contextValue}>
                    <EditProfileForm></EditProfileForm>
                </AuthContext.Provider>

            </BrowserRouter>
        )
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders form fields correctly', () => {
        renderComponent()
        
        expect(screen.getByTestId('test-name')).toBeInTheDocument()
        expect(screen.getByTestId('test-surname')).toBeInTheDocument()
        expect(screen.getByTestId('test-username')).toBeInTheDocument()
        expect(screen.getByTestId('test-bio')).toBeInTheDocument()
        expect(screen.getByTestId('test-email')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
      })

    it('updates the values on change', () => {
        renderComponent()

        const nameInput = screen.getByTestId('test-name-input')
        const surnameInput = screen.getByTestId('test-surname-input')
        const usernameInput = screen.getByTestId('test-username-input')
        const emailInput = screen.getByTestId('test-email-input')
        const bioInput = screen.getByTestId('test-bio-input')

        fireEvent.change(nameInput, {target : {value : 'test-name'}})
        fireEvent.change(surnameInput, {target : {value : 'test-surname'}})
        fireEvent.change(usernameInput, {target : {value : 'test-username'}})
        fireEvent.change(emailInput, {target : {value : 'test-email'}})
        fireEvent.change(bioInput, {target : {value : 'test-bio'}})

        expect(nameInput).toHaveValue('test-name')
        expect(surnameInput).toHaveValue('test-surname')
        expect(usernameInput).toHaveValue('test-username')
        expect(emailInput).toHaveValue('test-email')
        expect(bioInput).toHaveValue('test-bio')



    })

    it('shows the values on render', () => {
        renderComponent()

        const nameInput = screen.getByTestId('test-name-input')
        const surnameInput = screen.getByTestId('test-surname-input')
        const usernameInput = screen.getByTestId('test-username-input')
        const emailInput = screen.getByTestId('test-email-input')
        const bioInput = screen.getByTestId('test-bio-input')


        expect(nameInput).toHaveValue('testname')
        expect(surnameInput).toHaveValue('testlastname')
        expect(usernameInput).toHaveValue('test_user')
        expect(emailInput).toHaveValue('test@test.com')
        expect(bioInput).toHaveValue('test_bio')



    })
    it('shows error on invalid form', async () => {
        renderComponent()

    // Log the rendered component for debugging


        const nameInput = screen.getByTestId('test-name-input')
        const surnameInput = screen.getByTestId('test-surname-input')
        const usernameInput = screen.getByTestId('test-username-input')
        const emailInput = screen.getByTestId('test-email-input')
        const bioInput = screen.getByTestId('test-bio-input')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        const data = {
            firstName:nameInput.value,
            lastName:surnameInput.value,
            username:usernameInput.value,
            email:emailInput.value,
            bio:bioInput.value
        }

        fireEvent.change(nameInput, {target : {value : ''}})

        fireEvent.click(submitButton)
        expect(mockAuthContext.edit_profile).not.toHaveBeenCalledWith(data)



    })

    it('it submits the form successfully', async () => {

        const mockNavigate = vi.fn()
        vi.mocked(useNavigate).mockReturnValue(mockNavigate)

        renderComponent()

    // Log the rendered component for debugging


        const nameInput = screen.getByTestId('test-name-input')
        const surnameInput = screen.getByTestId('test-surname-input')
        const usernameInput = screen.getByTestId('test-username-input')
        const emailInput = screen.getByTestId('test-email-input')
        const bioInput = screen.getByTestId('test-bio-input')
        const submitButton = screen.getByRole('button', { name: /submit/i })
        
        

        fireEvent.change(nameInput, {target : {value : 'testusernamee'}})

        

        fireEvent.click(submitButton)
        expect(mockAuthContext.edit_profile).toHaveBeenCalledWith(nameInput.value,surnameInput.value, usernameInput.value, emailInput.value, bioInput.value)
        expect(mockNavigate).toHaveBeenCalledWith('/profile')


    })

    it('navigates to unauthorized when no user and not loading', () => {
        const mockNavigate = vi.fn()
        vi.mocked(useNavigate).mockReturnValue(mockNavigate)
        renderComponent({ 
          user: null, 
          loadingAuth: false 
        })
        
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized')
      })
    

  })

  