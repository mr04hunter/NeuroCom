import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import axios from 'axios';
import AuthContext from '../src/contexts/AuthContext';
import { AuthProvider } from '../src/contexts/AuthContext';

// Mock dependencies
vi.mock('axios');

describe('AuthProvider', () => {
  const mockToken = 'test-token';
  const mockUser = { 
    id: 1, 
    username: 'testuser', 
    email: 'test@example.com' 
  };
  const mockUserSettings = { 
    darkmode: true 
  };
  const mockChatrooms = [{ id: 1, name: 'Test Chatroom' }];

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn(key => {
            delete store[key]
        }),
        clear: vi.fn(() => {
          store = {};
        })
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock WebSocket
    global.WebSocket = vi.fn(() => ({
      readyState: WebSocket.CLOSED,
      close: vi.fn(),
      onopen: null,
      onclose: null,
      onmessage: null,
      send: vi.fn()
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle successful authentication', async () => {
    // Mock axios get requests
    axios.get.mockImplementation((url) => {
      if (url === '/api/user/me/') {
        return Promise.resolve({ data: mockUser });
      }
      if (url === '/api/chatroom/chatrooms/') {
        return Promise.resolve({ data: mockChatrooms });
      }
      throw new Error('Not mocked');
    });

    // Mock fetch for user settings
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserSettings)
      })
    );

    // Set up localStorage with token
    localStorage.setItem('auth_token', mockToken);

    let renderResult;
    await act(async () => {
      renderResult = render(
        <AuthProvider>
          <div data-testid="child-component">Test Child Component</div>
        </AuthProvider>
      );
    });

    // Verify user is set and child component renders
    expect(renderResult.getByTestId('child-component')).toBeTruthy();
  });

  it('should handle authentication failure', async () => {
    // Mock axios to throw an error
    axios.get.mockRejectedValue(new Error('Authentication failed'));

    // Clear token
    localStorage.removeItem('auth_token');

    let renderResult;
    await act(async () => {
      renderResult = render(
        <AuthProvider>
          <div data-testid="child-component">Test Child Component</div>
        </AuthProvider>
      );
    });

    // Verify component still renders
    expect(renderResult.getByTestId('child-component')).toBeTruthy();
  });

  it('should toggle dark mode based on user settings', async () => {
    // Mock axios get requests
    axios.get.mockImplementation((url) => {
      if (url === '/api/user/me/') {
        return Promise.resolve({ data: mockUser });
      }
      if (url === '/api/chatroom/chatrooms/') {
        return Promise.resolve({ data: mockChatrooms });
      }
      throw new Error('Not mocked');
    });

    // Mock fetch for user settings with dark mode on
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ darkmode: true })
      })
    );

    // Set up localStorage with token
    localStorage.setItem('auth_token', mockToken);

    // Spy on document.body.className
    const classNameSpy = vi.spyOn(document.body, 'className', 'set');

    await act(async () => {
      render(
        <AuthProvider>
          <div>Test Child Component</div>
        </AuthProvider>
      );
    });

    // Check if dark mode was applied
    expect(classNameSpy).toHaveBeenCalledWith('dark-mode');
  });

  it('should establish WebSocket connection', async () => {
    // Mock axios get requests
    axios.get.mockImplementation((url) => {
      if (url === '/api/user/me/') {
        return Promise.resolve({ data: mockUser });
      }
      if (url === '/api/chatroom/chatrooms/') {
        return Promise.resolve({ data: mockChatrooms });
      }
      throw new Error('Not mocked');
    });

    // Mock fetch for user settings
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserSettings)
      })
    );

    // Set up localStorage with token
    localStorage.setItem('auth_token', mockToken);

    await act(async () => {
      render(
        <AuthProvider>
          <div>Test Child Component</div>
        </AuthProvider>
      );
    });

    // Verify WebSocket was instantiated
    expect(global.WebSocket).toHaveBeenCalledWith(
      expect.stringContaining('/ws/activity/?token=')
    );
  });

  it('should call login and update state', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), {
      wrapper: AuthProvider,
    });

    // Simulate login action
    await act(async () => {
      await result.current.login('testUser', 'password123');
    });

    // Assert that user is logged in
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user).toBeDefined();
  });

  it('should call register and update state', async () => {
    global.fetch = vi.fn()
    const { result } = renderHook(() => React.useContext(AuthContext), {
      wrapper: AuthProvider,
    });

    // Simulate login action
    await act(async () => {
      await result.current.register('first', 'last', 'email@email.com', 'username', 'password123',);
    });

    // Assert that user is logged in
    expect(fetch).toBeCalledWith(
        '/api/user/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    'username': 'username',
                    'firstName': 'first',
                    'lastName': 'last',
                    'email': 'email@email.com',
                    'password': 'password123'
                })
            }
    )
    
  });

  it('logs out successfully', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      });
  
      // Simulate login action
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isLoggedIn).toBe(false);
      expect(result.current.user).toBeNull()
      expect(axios.post).toBeCalledWith('/api/user/logout/',null,{
            headers:{
                'Authorization': `Token ${localStorage.getItem('auth_token')}`
            }
        })

  })

  it('updates the user settings correctly', async () => {
    global.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserSettings)
        })
      );

    const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      });
  
      // Simulate login action
      await act(async () => {
        await result.current.updateSettings(mockUserSettings);
      });
      
      expect(result.current.userSettings).toBeTruthy()
      expect(fetch).toBeCalledWith('/api/user/update_settings/',{
                method:'PUT',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Token ${localStorage.getItem('auth_token')}`
                },body:JSON.stringify(mockUserSettings)
            })

    
  })

  it('edits profile correctly', async () => {
    global.fetch = vi.fn()

    const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      });
  
      // Simulate login action
      await act(async () => {
        await result.current.edit_profile('first', 'last', 'username', 'email@email.com', 'bio');
      });

      expect(fetch).toBeCalledWith('/api/user/edit_profile/',{
                method:'PUT',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Token ${localStorage.getItem('auth_token')}`
                },
                body:JSON.stringify({
                    firstName:'first',
                    lastName:'last',
                    username:'username',
                    email:'email@email.com',
                    bio:'bio'
                })
            
        })
    
  })

  it('changes the password correctly', async () => {
    global.fetch = vi.fn()

    const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      });
  
      // Simulate login action
      await act(async () => {
        await result.current.changePassword('oldpassword', 'newpassword', 'newpassword');
      });

      expect(fetch).toBeCalledWith('/api/user/change_password/',{
                method:'PUT',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization': `Token ${localStorage.getItem('auth_token')}`
                },body:JSON.stringify({
                    'old_password':'oldpassword',
                    'new_password':'newpassword',
                    'confirm_new_password':'newpassword'
                })
            })

  })

  it('deletes the account correctly', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      });
  
      // Simulate login action
      await act(async () => {
        await result.current.deleteAccount();
      });

      
      expect(axios.delete).toBeCalledWith('/api/user/delete_account/',{
                headers:{
                    'Authorization':`Token ${localStorage.getItem('auth_token')}`
                }
            })
  })

});