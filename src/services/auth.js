import apiClient from './apiClient';

// Login function with real API
export async function login(email, password) {
  // Validate required fields
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }

  try {
    const response = await apiClient.post('/auth/login', {
      email: email.toLowerCase(),
      password
    });

    const data = response.data;
    
    // Return user and token in the expected format
    return {
      user: data.user,
      token: data.token
    };
  } catch (error) {
    // Handle Axios errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 'Login failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server. Please try again.');
    } else {
      // Something else happened
      throw new Error('Login failed. Please try again.');
    }
  }
}

// Register function with real API
export async function register(userData) {
  // Validate required fields
  if (!userData.email || !userData.password || !userData.name || !userData.role) {
    throw new Error('All fields are required');
  }

  try {
    const response = await apiClient.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role
    });

    const data = response.data;
    
    // Return user and token in the expected format
    return {
      user: data.user,
      token: data.token
    };
  } catch (error) {
    // Handle Axios errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server. Please try again.');
    } else {
      // Something else happened
      throw new Error('Registration failed. Please try again.');
    }
  }
}

// Token validation with real API
export async function validateToken(token) {
  try {
    const response = await apiClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.user;
  } catch (error) {
    // Handle Axios errors
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Invalid or expired token');
      }
      const errorMessage = error.response.data?.message || 'Token validation failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server. Please try again.');
    } else {
      // Something else happened
      throw new Error('Token validation failed. Please try again.');
    }
  }
}

// Admin login function with real API and demo fallback
export async function adminLogin(adminName, password) {
  // Validate required fields
  if (!adminName || !password) {
    throw new Error('Admin name and password are required');
  }

  try {
    // Convert admin name to email format or use regular login endpoint
    // If adminName looks like email, use it directly, otherwise append domain
    let email = adminName;
    if (!adminName.includes('@')) {
      email = `${adminName}@admin.com`;
    }
    
    console.warn('🔐 Admin login attempt with email:', email);
    
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    const data = response.data;
    console.warn('✅ Admin login response:', data);
    
    // Check if user has admin role
    if (data.user && data.user.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }
    
    // Return user and token in the expected format
    return {
      admin: data.user,
      token: data.token
    };
  } catch (error) {
    console.error('❌ Admin login API failed, trying demo credentials:', error);
    
    // Demo fallback for development when backend is not available
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('🔄 Backend API not available, using demo admin login');
      
      // Demo admin credentials
      const demoCredentials = [
        { adminName: 'admin', password: 'admin123' },
        { adminName: 'admin', password: 'password' },
        { adminName: 'demo', password: 'demo123' }
      ];
      
      const validCredentials = demoCredentials.find(cred => 
        cred.adminName === adminName && cred.password === password
      );
      
      if (validCredentials) {
        console.warn('✅ Demo admin login successful');
        return {
          admin: {
            id: 1,
            name: 'Demo Admin',
            email: `${adminName}@admin.com`,
            role: 'admin'
          },
          token: 'demo-admin-token-' + Date.now()
        };
      } else {
        throw new Error('Invalid admin credentials. Try: admin/admin123, admin/password, or demo/demo123');
      }
    }
    
    // Handle other Axios errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Admin login failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server. Please try again.');
    } else {
      // Something else happened
      throw new Error(error.message || 'Admin login failed. Please try again.');
    }
  }
}

// Password reset request with real API
export async function requestPasswordReset(email) {
  try {
    const response = await apiClient.post('/auth/forgot-password', {
      email
    });

    return response.data;
  } catch (error) {
    // Handle Axios errors
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Password reset request failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server. Please try again.');
    } else {
      // Something else happened
      throw new Error('Password reset request failed. Please try again.');
    }
  }
}
