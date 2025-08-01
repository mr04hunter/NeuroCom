import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import MessagesList from '../src/components/MessagesList'
import { ChatContext } from '../src/contexts/ChatContext'
import AuthContext from '../src/contexts/AuthContext'


vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...actual,
      NavLink: ({ children }) => children,
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
  

  const time_date = new Date(2023, 0, 1).toISOString()

  // Mock ChatContext
  const mockChatContext = {
    messages: [{
      id: 1,
      sender: {
        id: 2,
        firstName: 'test',
        lastName: 'test',
        username: 'test',
        email: 'test@email.com',
        bio: 'test',
        profile_photo: null
      },
      content: 'test-content',
      timestamp: new Date(2023, 0, 1).toISOString(), // Note: lowercase 't'
      created_at: new Date(2023, 0, 1).toISOString(),
      file: null,
      message: {
        id: 1,
        sender: {
          id: 2,
          firstName: 'test',
          lastName: 'test',
          username: 'test',
          email: 'test@email.com',
          bio: 'test',
          profile_photo: null
        },
        content: 'test-content',
        timestamp: new Date(2023, 0, 1).toISOString(), // Note: lowercase 't'
        created_at: new Date(2023, 0, 1).toISOString(),
        file: null,
       // Ensure message object exists with timestamp
    },
    }],
    // Add other context properties to match the destructuring in your component
    
    fetchDms: vi.fn(),
    direct_messages: [],
    loading: false,
    setCurrentDmId: vi.fn(),
    messagesLoading: false,
    currentDmId: null,
    dmInitialized: false,
    setdmInit: vi.fn(),
    newMesNot: false,
    setNewMesNot: vi.fn(),
    otherUser: null,
    nextDmPage: null,
    userStatus: {},
    editIndex: null,
    setEditIndex: vi.fn(),
    editMessage: null,
    setEditMessage: vi.fn(),
    nextMessagesPage: null,
    sendMessage: vi.fn(),
    messagesEndRef: { current: null },
    firstMessageRef: { current: null },
    chatWindowRef: { current: null },
    hoveredIndex: null,
    setHoveredIndex: vi.fn(),
    fetchMessages: vi.fn(),
    isOnBottom: vi.fn(),
    currentMessages: [],
    submitDelete: vi.fn(),
    submitEdit: vi.fn(),
    handleEdit: vi.fn(),
    handleDelete: vi.fn()
 
  }

  const mockAuthContextValue = {
    user: {
        id:2,
        firstName:'test',
        lastName:'test',
        username:'test',
        email:'test@email.com',
        bio:'test'
      }
  }


  describe('MessagesList', () => {

    const renderComponent = (contextOverrides = {}) => {
        const contextValue = { ...mockChatContext, ...contextOverrides }
        return render(
            <BrowserRouter>
            <AuthContext.Provider value={mockAuthContextValue}>
            <ChatContext.Provider value={contextValue}>
                    <MessagesList></MessagesList>
                </ChatContext.Provider>
            </AuthContext.Provider>

            </BrowserRouter>
        )
    }

    beforeEach(() => {
        vi.clearAllMocks()

    })


    it('renders fields correctly', () => {
        renderComponent()
        const messageContent = screen.getByTestId('message-test-content')

        expect(messageContent).toBeVisible()
        
    })

    it('handles edit click correctly', () => {
        renderComponent({hoveredIndex:0})
        const editButton = screen.getByTestId('test-handle-edit-button')

        fireEvent.click(editButton)

        expect(mockChatContext.handleEdit).toBeCalledWith(0,'test-content')
        
    })

    it('handles edit submit correctly', () => {
        renderComponent({editIndex:0})
        const editInput = screen.getByTestId('test-edit-input')
 

        fireEvent.change(editInput, {target: {value: 'edit-message'}})
        const submitEditButton = screen.getByTestId('test-submit-edit-button')
        fireEvent.click(submitEditButton)

        expect(mockChatContext.submitEdit).toBeCalledWith(1)

        
        
    })

    it('handles deletes correctly', () => {
        renderComponent({hoveredIndex:0})
        const deleteButton = screen.getByTestId('test-handle-delete-button')

        fireEvent.click(deleteButton)

        expect(mockChatContext.submitDelete).toBeCalledWith(1)
        
    })

    


  })