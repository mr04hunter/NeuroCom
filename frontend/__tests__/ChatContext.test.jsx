import React from 'react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import {ChatContext, ChatProvider} from '../src/contexts/ChatContext'
import AuthContext from '../src/contexts/AuthContext'
import { useContext } from 'react'


// Mock component to test context values
const TestComponent = () => {
  const context = useContext(ChatContext)
  return (
    <div>
      <div data-testid="messages">{JSON.stringify(context.messages)}</div>
      <div data-testid="channelId">{context.currentChannelId}</div>
      <div data-testid="loading">{context.loading.toString()}</div>
      <button 
        onClick={() => context.connectChannel('chatroom1', 'channel1')}
        data-testid="connect-btn"
      >
        Connect
      </button>
    </div>
  )
}

describe('ChatProvider', () => {
  let wsServer
  let mockLocalStorage

  global.WebSocket = vi.fn(() => ({
    readyState: WebSocket.CLOSED,
    close: vi.fn(),
    onopen: null,
    onclose: null,
    onmessage: null,
    send: vi.fn(),
    server: {
      clients: vi.fn(() => {
        return []
      })
    }
  }));

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
    global.localStorage = mockLocalStorage
    
    // Mock WebSocket server
    wsServer = new WebSocket('ws://78.181.130.233:8000/ws/chatroom/chatroom1/channel1/')
  })

  afterEach(() => {
 
    vi.clearAllMocks()
  })

  // Mock AuthContext values
  const mockAuthContext = {
    user: { id: 1, username: 'testuser' },
    userSettings: {},
    loadingAuth: false,
    updateSettings: vi.fn(),
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
    error: null,
    onlineUsers: []
  }

  const wrapper = ({ children }) => (
    <AuthContext.Provider value={mockAuthContext}>
      <ChatProvider mode="chatroom">
        {children}
      </ChatProvider>
    </AuthContext.Provider>
  )

  it('initializes with correct default values', () => {
    render(<TestComponent />, { wrapper })
    
    expect(screen.getByTestId('messages')).toHaveTextContent('[]')
    expect(screen.getByTestId('loading')).toHaveTextContent('true')
    expect(screen.getByTestId('channelId')).toHaveTextContent('')
  })

  it('connects to WebSocket and handles messages', async () => {
    render(<TestComponent />, { wrapper })

    // Trigger connection
    await act(async () => {
      fireEvent.click(screen.getByTestId('connect-btn'))
    })

    // Wait for connection
    await wsServer.connected

    // Simulate receiving a message
    const mockMessage = {
      action_type: 'chat_message',
      message: {
        id: 1,
        content: 'Test message',
        user: 'testuser'
      }
    }

    await act(async () => {
      wsServer.send(JSON.stringify(mockMessage))
    })

    // Wait for and check if message was added to state
    await waitFor(() => {
      const messages = JSON.parse(screen.getByTestId('messages').textContent)
      expect(messages).toEqual([{
        id: 1,
        content: 'Test message',
        user: 'testuser'
      }])
    })
  })

  it('handles message editing', async () => {
    render(<TestComponent />, { wrapper })

    // Connect and send initial message
    await act(async () => {
      fireEvent.click(screen.getByTestId('connect-btn'))
    })
    await wsServer.connected

    // Add initial message
    const initialMessage = {
      action_type: 'chat_message',
      message: {
        id: 1,
        content: 'Initial message',
        user: 'testuser'
      }
    }

    await act(async () => {
      wsServer.send(JSON.stringify(initialMessage))
    })

    // Send edit message event
    const editEvent = {
      action_type: 'message_edited',
      message_id: 1,
      new_content: 'Edited message'
    }

    await act(async () => {
      wsServer.send(JSON.stringify(editEvent))
    })

    // Check if message was edited
    await waitFor(() => {
      const messages = JSON.parse(screen.getByTestId('messages').textContent)
      expect(messages[0].content).toBe('Edited message')
    })
  })

  it('handles message deletion', async () => {
    render(<TestComponent />, { wrapper })

    // Connect and add a message
    await act(async () => {
      fireEvent.click(screen.getByTestId('connect-btn'))
    })
    await wsServer.connected

    // Add initial message
    const initialMessage = {
      action_type: 'chat_message',
      message: {
        id: 1,
        content: 'Initial message',
        user: 'testuser'
      }
    }

    await act(async () => {
      wsServer.send(JSON.stringify(initialMessage))
    })

    // Send delete message event
    const deleteEvent = {
      action_type: 'message_deleted',
      message_id: 1
    }

    await act(async () => {
      wsServer.send(JSON.stringify(deleteEvent))
    })

    // Check if message was removed
    await waitFor(() => {
      const messages = JSON.parse(screen.getByTestId('messages').textContent)
      expect(messages).toHaveLength(0)
    })
  })

  it('handles user status updates', async () => {
    const TestComponentWithStatus = () => {
      const context = useContext(ChatContext)
      return (
        <div>
          <div data-testid="user-status">{JSON.stringify(context.userStatus)}</div>
          <button 
            onClick={() => context.connectChannel('chatroom1', 'channel1')}
            data-testid="connect-btn"
          >
            Connect
          </button>
        </div>
      )
    }

    render(<TestComponentWithStatus />, { wrapper })

    // Connect to channel
    await act(async () => {
      fireEvent.click(screen.getByTestId('connect-btn'))
    })
    await wsServer.connected

    // Send user status update
    const statusEvent = {
      action_type: 'user_status',
      user_status: [
        { user_id: 1, status: 'online' }
      ]
    }

    await act(async () => {
      wsServer.send(JSON.stringify(statusEvent))
    })

    await waitFor(() => {
      const userStatus = JSON.parse(screen.getByTestId('user-status').textContent)
      expect(userStatus).toEqual([{ user_id: 1, status: 'online' }])
    })
  })

  it('cleans up WebSocket connection on unmount', async () => {
    const { unmount } = render(<TestComponent />, { wrapper })

    // Connect to channel
    await act(async () => {
      fireEvent.click(screen.getByTestId('connect-btn'))
    })
    await wsServer.connected

    // Unmount component
    unmount()

    // Check if WebSocket was closed
    expect(wsServer.server.clients().length).toBe(0)
  })
})