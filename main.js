/**
 * Main Application Entry Point
 * Initializes the CNN 3D Visualizer and coordinates all components
 */

// Global variables
let visualizer = null;
let animationEngine = null;
let uiController = null;
let layerComponents = null;

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Initializing CNN 3D Visualizer...');
    
    try {
        // Check for WebGL support
        if (!checkWebGLSupport()) {
            showError('WebGL is not supported in your browser. Please use a modern browser with WebGL support.');
            return;
        }
        
        // Initialize core components
        initializeComponents();
        
        // Setup global error handling
        setupErrorHandling();
        
        // Start the application
        startApplication();
        
        console.log('CNN 3D Visualizer initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to initialize the application. Please refresh the page and try again.');
    }
}

/**
 * Check if WebGL is supported
 */
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
    } catch (e) {
        return false;
    }
}

/**
 * Initialize all core components
 */
function initializeComponents() {
    // Initialize layer components system
    layerComponents = new LayerComponents();
    
    // Initialize the main 3D visualizer
    visualizer = new CNNVisualizer('three-canvas');
    
    // Initialize animation engine
    animationEngine = new AnimationEngine(visualizer);
    
    // Initialize UI controller
    uiController = new UIController(visualizer, animationEngine);
    
    // Make components globally accessible for debugging
    window.visualizer = visualizer;
    window.animationEngine = animationEngine;
    window.uiController = uiController;
    window.layerComponents = layerComponents;
}

/**
 * Setup global error handling
 */
function setupErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showError('An unexpected error occurred. The application may not function correctly.');
    });
    
    // Handle general errors
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        showError('A JavaScript error occurred. Please check the console for details.');
    });
    
    // Handle Three.js specific errors
    if (window.THREE) {
        const originalConsoleError = console.error;
        console.error = function(...args) {
            if (args[0] && args[0].includes && args[0].includes('THREE')) {
                showError('A 3D graphics error occurred. Your browser or GPU may not support all features.');
            }
            originalConsoleError.apply(console, args);
        };
    }
}

/**
 * Start the main application
 */
function startApplication() {
    // Hide loading indicator
    hideLoading();
    
    // Setup welcome message
    showWelcomeMessage();
    
    // Setup application-level event listeners
    setupApplicationEvents();
    
    // Start performance monitoring
    setupPerformanceMonitoring();
    
    console.log('Application started successfully');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }
}

/**
 * Show welcome message
 */
function showWelcomeMessage() {
    const welcomeToast = document.createElement('div');
    welcomeToast.className = 'welcome-toast';
    welcomeToast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-brain" style="color: #3b82f6;"></i>
            <span>Welcome to CNN 3D Visualizer!</span>
        </div>
        <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 0.25rem;">
            Press <kbd>H</kbd> for help or <kbd>Space</kbd> to start
        </div>
    `;
    welcomeToast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(10px);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid #475569;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideInDown 0.5s ease-out;
        max-width: 400px;
        text-align: center;
    `;
    
    document.body.appendChild(welcomeToast);
    
    setTimeout(() => {
        welcomeToast.style.animation = 'slideOutUp 0.5s ease-in';
        setTimeout(() => {
            if (document.body.contains(welcomeToast)) {
                document.body.removeChild(welcomeToast);
            }
        }, 500);
    }, 5000);
}

/**
 * Setup application-level event listeners
 */
function setupApplicationEvents() {
    // Handle visibility change (page focus/blur)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause animations when page is not visible
            if (animationEngine && animationEngine.isPlaying) {
                animationEngine.pause();
            }
        }
    });
    
    // Handle window focus/blur for performance optimization
    window.addEventListener('blur', () => {
        // Reduce rendering quality when window loses focus
        if (visualizer && visualizer.renderer) {
            visualizer.renderer.setPixelRatio(Math.min(window.devicePixelRatio * 0.5, 1));
        }
    });
    
    window.addEventListener('focus', () => {
        // Restore rendering quality when window gains focus
        if (visualizer && visualizer.renderer) {
            visualizer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        // Reset application state if needed
        if (uiController) {
            uiController.resetAnimation();
        }
    });
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
    if (!visualizer || !visualizer.renderer) return;
    
    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();
    
    function monitorPerformance() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            
            // Adjust quality based on performance
            if (fps < 30) {
                // Reduce quality for better performance
                if (visualizer.renderer.getPixelRatio() > 1) {
                    visualizer.renderer.setPixelRatio(1);
                }
                // Reduce shadow quality
                if (visualizer.renderer.shadowMap.enabled) {
                    visualizer.renderer.shadowMap.type = THREE.BasicShadowMap;
                }
            } else if (fps > 55) {
                // Increase quality if performance allows
                if (visualizer.renderer.getPixelRatio() < window.devicePixelRatio) {
                    visualizer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                }
                // Restore shadow quality
                if (visualizer.renderer.shadowMap.enabled) {
                    visualizer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                }
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(monitorPerformance);
    }
    
    monitorPerformance();
}

/**
 * Show error message to user
 */
function showError(message) {
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
            <span>Error</span>
        </div>
        <div style="margin-top: 0.5rem; font-size: 0.9rem;">
            ${message}
        </div>
    `;
    errorToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.95);
        backdrop-filter: blur(10px);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        cursor: pointer;
    `;
    
    document.body.appendChild(errorToast);
    
    // Remove on click or after timeout
    errorToast.addEventListener('click', () => {
        removeErrorToast(errorToast);
    });
    
    setTimeout(() => {
        removeErrorToast(errorToast);
    }, 8000);
}

/**
 * Remove error toast
 */
function removeErrorToast(toast) {
    if (document.body.contains(toast)) {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }
}

/**
 * Cleanup application resources
 */
function cleanupApplication() {
    try {
        if (uiController) {
            uiController.dispose();
        }
        
        if (animationEngine) {
            animationEngine.dispose();
        }
        
        if (layerComponents) {
            layerComponents.dispose();
        }
        
        if (visualizer) {
            visualizer.dispose();
        }
        
        console.log('Application cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

/**
 * Handle application shutdown
 */
function handleShutdown() {
    cleanupApplication();
}

// Add CSS animations for toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideOutUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
    
    kbd {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 0.8em;
    }
`;
document.head.appendChild(style);

// Application lifecycle events
window.addEventListener('load', initializeApp);
window.addEventListener('beforeunload', handleShutdown);

// Export for debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        cleanupApplication,
        checkWebGLSupport
    };
}
