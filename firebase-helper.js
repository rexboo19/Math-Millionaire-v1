// Firebase Helper Utility
// Provides a unified interface for localStorage and Firebase
// Falls back to localStorage if Firebase is not configured

class DataStore {
    constructor() {
        this.useFirebase = false;
        this.db = null;
        
        // Check if Firebase is available and configured
        if (typeof firebase !== 'undefined' && window.firebaseDatabase) {
            try {
                this.db = window.firebaseDatabase;
                this.useFirebase = true;
                console.log('Firebase initialized successfully');
            } catch (error) {
                console.warn('Firebase initialization failed, using localStorage:', error);
                this.useFirebase = false;
            }
        } else {
            console.log('Firebase not configured, using localStorage');
        }
    }
    
    // Set a value (works with both Firebase and localStorage)
    async set(key, value) {
        if (this.useFirebase && this.db) {
            try {
                await this.db.ref(key).set(value);
                return true;
            } catch (error) {
                console.error('Firebase set error:', error);
                // Fallback to localStorage
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    console.error('localStorage set error:', e);
                    return false;
                }
            }
        } else {
            // Use localStorage
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('localStorage set error:', error);
                return false;
            }
        }
    }
    
    // Get a value (works with both Firebase and localStorage)
    async get(key) {
        if (this.useFirebase && this.db) {
            try {
                const snapshot = await this.db.ref(key).once('value');
                const value = snapshot.val();
                return value !== null ? value : null;
            } catch (error) {
                console.error('Firebase get error:', error);
                // Fallback to localStorage
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch (e) {
                    console.error('localStorage get error:', e);
                    return null;
                }
            }
        } else {
            // Use localStorage
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                console.error('localStorage get error:', error);
                return null;
            }
        }
    }
    
    // Remove a value
    async remove(key) {
        if (this.useFirebase && this.db) {
            try {
                await this.db.ref(key).remove();
                return true;
            } catch (error) {
                console.error('Firebase remove error:', error);
                // Fallback to localStorage
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    console.error('localStorage remove error:', e);
                    return false;
                }
            }
        } else {
            // Use localStorage
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('localStorage remove error:', error);
                return false;
            }
        }
    }
    
    // Listen for changes (Firebase only, with localStorage fallback polling)
    on(key, callback) {
        if (this.useFirebase && this.db) {
            try {
                this.db.ref(key).on('value', (snapshot) => {
                    const value = snapshot.val();
                    callback(value !== null ? value : null);
                });
                // Return unsubscribe function
                return () => {
                    this.db.ref(key).off('value');
                };
            } catch (error) {
                console.error('Firebase on error:', error);
                // Fallback: poll localStorage
                const interval = setInterval(() => {
                    try {
                        const item = localStorage.getItem(key);
                        const value = item ? JSON.parse(item) : null;
                        callback(value);
                    } catch (e) {
                        console.error('localStorage poll error:', e);
                    }
                }, 2000);
                return () => clearInterval(interval);
            }
        } else {
            // Fallback: poll localStorage
            const interval = setInterval(() => {
                try {
                    const item = localStorage.getItem(key);
                    const value = item ? JSON.parse(item) : null;
                    callback(value);
                } catch (e) {
                    console.error('localStorage poll error:', e);
                }
            }, 2000);
            return () => clearInterval(interval);
        }
    }
    
    // Check if a key exists
    async exists(key) {
        const value = await this.get(key);
        return value !== null;
    }
}

// Create global instance
window.dataStore = new DataStore();

