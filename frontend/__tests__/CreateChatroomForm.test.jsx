import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CreateChatroomForm from '../src/components/CreateChatroomForm'
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
vi.mock('react-toastify')

const mockAuthContext = {
  user: {
    firstName:'test',
    lastName:'test',
    username:'test',
    email:'test@email.com',
    bio:'test'
  },
  userSettings: {},
  loadingAuth: false,
  updateSettings: vi.fn(),
  changePassword: vi.fn(),
  deleteAccount: vi.fn(),
  error: null
}

describe('CreateChatroomForm', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <CreateChatroomForm />
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    renderComponent()
    
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('updates input values on change', () => {
    renderComponent()
    
    const nameInput = screen.getByLabelText(/Name:/i)
    const titleInput = screen.getByLabelText(/Title/i)
    const descriptionInput = screen.getByLabelText(/Description/i)

    fireEvent.change(nameInput, { target: { value: 'Test Chatroom' } })
    fireEvent.change(titleInput, { target: { value: 'Test Title' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })

    expect(nameInput).toHaveValue('Test Chatroom')
    expect(titleInput).toHaveValue('Test Title')
    expect(descriptionInput).toHaveValue('Test Description')
  })

  it('submits form with correct data', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => 'test-token'),
      setItem: vi.fn(),
      clear: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })

    // Mock navigate
    const mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    // Mock axios post response
    const mockAxiosPost = vi.mocked(axios.post)
    mockAxiosPost.mockResolvedValue({
      status: 201,
      data: { id: '123', name: 'Test Chatroom' }
    })

    renderComponent()
    
    const nameInput = screen.getByLabelText(/Name:/i)
    const titleInput = screen.getByLabelText(/Title/i)
    const descriptionInput = screen.getByLabelText(/Description/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })

    fireEvent.change(nameInput, { target: { value: 'Test Chatroom' } })
    fireEvent.change(titleInput, { target: { value: 'Test Title' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/api/chatroom/create_chatroom/',
        {
          name: 'Test Chatroom',
          title: 'Test Title',
          description: 'Test Description'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token test-token'
          }
        }
      )
      expect(mockNavigate).toHaveBeenCalledWith('/')
      expect(toast.success).toHaveBeenCalledWith('Chatroom Created Successfully')
    })
  })

  it('handles form submission error', async () => {
    // Mock navigate
    const mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    // Mock axios to throw an error
    const mockAxiosPost = vi.mocked(axios.post)
    mockAxiosPost.mockRejectedValue(new Error('Submission failed'))

    // Spy on console.log
    const consoleLogSpy = vi.spyOn(console, 'log')

    renderComponent()
    
    const nameInput = screen.getByLabelText(/Name:/i)
    const titleInput = screen.getByLabelText(/Title/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })

    fireEvent.change(nameInput, { target: { value: 'Test Chatroom' } })
    fireEvent.change(titleInput, { target: { value: 'Test Title' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error))
    })

    consoleLogSpy.mockRestore()
  })
})