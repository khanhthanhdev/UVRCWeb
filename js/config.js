// Configuration for the application
const config = {
    // API base URL - change this for different environments
    apiBaseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.protocol}//${window.location.host}`  // Use local server in development
        : 'https://uvrc-web.vercel.app',  // Use Vercel in production

    // Helper function to make API calls
    async fetchApi(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}/api/${endpoint}`;
        console.log('Fetching from URL:', url, 'with options:', options);
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                },
                mode: 'cors'
            });
            
            // Log detailed error information
            if (!response.ok) {
                console.error('API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });
                
                // Try to get error details from response
                const errorData = await response.text();
                console.error('Error Details:', errorData);
                
                throw new Error(`HTTP error! status: ${response.status} - ${errorData || response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API Response Data:', data);
            return data;
        } catch (error) {
            console.error('API call failed:', error);
            const errorMessage = `Failed to fetch data: ${error.message}`;
            this.showError(errorMessage);
            throw error;
        }
    },

    // Helper function to display errors
    showError(message) {
        console.error(message);
        // Add visual feedback for users
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ff4444; color: white; padding: 15px; border-radius: 5px; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.2);';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        // Remove the error message after 5 seconds
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => document.body.removeChild(errorDiv), 500);
        }, 5000);
    }
};
