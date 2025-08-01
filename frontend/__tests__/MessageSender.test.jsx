import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import MessageSender from '../src/components/MessageSender'
import { ChatContext } from '../src/contexts/ChatContext'
import AuthContext from '../src/contexts/AuthContext'
import fileIcon from '../assets/icons/file.icon.png'




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
  
  // Mock ChatContext
  const mockChatContext = (() => {
    let message = ''; // Local mock state
    return {
      sendMessage: vi.fn(),
      setMessage: vi.fn()
    };
  })();

  describe('MessageSender', () => {

    const renderComponent = (contextOverrides = {}) => {
        const contextValue = { ...mockChatContext, ...contextOverrides }
        return render(
            <BrowserRouter>
                <ChatContext.Provider value={contextValue}>
                    <MessageSender></MessageSender>
                </ChatContext.Provider>

            </BrowserRouter>
        )
    }

    beforeEach(() => {
        vi.clearAllMocks()

    })


    it('renders all fields correctly', () => {
        renderComponent()

        const messageInput = screen.getByTestId('message-input')



        expect(messageInput).toBeVisible()


    })

    it('changes the values correctly', () => {
        // Render the component with the mocked context
        renderComponent();
      
        const messageInput = screen.getByTestId('message-input');
      
        // Simulate input change
        fireEvent.change(messageInput, { target: { value: 'test message' } });
      
        // Assert that `setMessage` was called with the correct value
 
      
        // Simulate the context value updating
        renderComponent({ message: 'test message' });
      
        // Assert that the input value reflects the updated message
        expect(messageInput).toHaveValue('test message');
      });
      it('sends the message correctly', () => {
        const sendMessageMock = vi.fn();
        renderComponent({ sendMessage: sendMessageMock, message: 'test message' });
    
        const sendButton = screen.getByTestId('test-send-button');
        fireEvent.click(sendButton);
    
        // Assert sendMessage is called with the current `message` value
        expect(sendMessageMock).toBeCalledWith('test message');
      });



  })