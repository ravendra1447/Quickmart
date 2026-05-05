// Safe Toast Wrapper - Prevents destroy errors
let isClient = false;

if (typeof window !== 'undefined') {
  isClient = true;
}

// Simple toast replacement that doesn't cause destroy errors
const safeToast = {
  success: (message, options = {}) => {
    if (isClient) {
      console.log('✅', message);
      // Optional: Show a simple notification
      showNotification(message, 'success');
    }
  },
  error: (message, options = {}) => {
    if (isClient) {
      console.log('❌', message);
      // Optional: Show a simple notification
      showNotification(message, 'error');
    }
  },
  info: (message, options = {}) => {
    if (isClient) {
      console.log('ℹ️', message);
      showNotification(message, 'info');
    }
  },
  warning: (message, options = {}) => {
    if (isClient) {
      console.log('⚠️', message);
      showNotification(message, 'warning');
    }
  },
  loading: (message, options = {}) => {
    if (isClient) {
      console.log('⏳', message);
      showNotification(message, 'loading');
    }
  }
};

// Simple notification system (optional)
let notifications = [];

const showNotification = (message, type = 'info') => {
  if (!isClient) return;
  
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    transition: all 0.3s ease;
    transform: translateX(0);
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  // Set colors based on type
  const colors = {
    success: 'background: #10b981; color: white;',
    error: 'background: #ef4444; color: white;',
    info: 'background: #3b82f6; color: white;',
    warning: 'background: #f59e0b; color: #92400e;',
    loading: 'background: #6b7280; color: white;'
  };
  
  notification.style.cssText += colors[type] || colors.info;
  
  // Add message
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
  
  // Store for reference
  notifications.push(notification);
};

export default safeToast;
