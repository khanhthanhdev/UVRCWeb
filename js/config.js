// Configuration for the application
const config = {
    // API base URL - automatically detect environment
    get apiBaseUrl() {
        const isProduction = window.location.hostname === 'uvrc-web.vercel.app';
        return isProduction ? 'https://uvrc-web.vercel.app' : 'http://localhost:3000';
    },

    // Helper function to make API calls
    async fetchApi(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}/${endpoint}`;
        console.log('Fetching from URL:', url);
        
        const isProduction = window.location.hostname === 'uvrc-web.vercel.app';
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...options.headers
                },
                mode: 'cors',
                credentials: isProduction ? 'omit' : 'include' // Only use credentials in development
            });
            
            if (!response.ok) {
                console.error('API Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });
                // Try to get more error details from response
                try {
                    const errorData = await response.json();
                    console.error('API Error Details:', errorData);
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                } catch (e) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
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
            errorDiv.remove();
        }, 5000);
    }
};
