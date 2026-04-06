/**
 * UI Controller - Manages user interface interactions and updates
 * Handles control panel, layer information, and user input
 */

class UIController {
    constructor(visualizer, animationEngine) {
        this.visualizer = visualizer;
        this.animationEngine = animationEngine;
        
        // UI elements
        this.elements = this.getUIElements();
        
        // State
        this.currentImage = 'digit-3';
        this.animationSpeed = 1.0;
        this.isPlaying = false;
        this.currentLayerIndex = 0;
        
        // Sample images and data
        this.imageData = this.initializeImageData();
        this.layerData = this.initializeLayerData();
        
        this.setupEventListeners();
        this.updateUI();
        
        console.log('UI Controller initialized');
    }
    
    /**
     * Get references to all UI elements
     */
    getUIElements() {
        return {
            // Controls
            imageSelect: document.getElementById('image-select'),
            animationSpeed: document.getElementById('animation-speed'),
            speedValue: document.getElementById('speed-value'),
            playBtn: document.getElementById('play-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            stepBtn: document.getElementById('step-btn'),
            autoPlayBtn: document.getElementById('auto-play-btn'),
            
            // Layer info
            currentLayerName: document.getElementById('current-layer-name'),
            currentLayerDescription: document.getElementById('current-layer-description'),
            layerShape: document.getElementById('layer-shape'),
            layerParams: document.getElementById('layer-params'),
            layerOutput: document.getElementById('layer-output'),
            
            // Architecture steps
            architectureSteps: document.querySelectorAll('.step'),
            
            // Predictions
            predictions: document.querySelector('.predictions'),
            
            // Loading indicator
            loading: document.getElementById('loading'),
            
            // Modal elements
            helpModal: document.getElementById('help-modal'),
            modalClose: document.querySelector('.close')
        };
    }
    
    /**
     * Initialize sample image data
     */
    initializeImageData() {
        const imageSize = 16 * 16; // 16x16 images
        
        return {
            'digit-3': this.generateDigit3Data(),
            'digit-7': this.generateDigit7Data(),
            'cat': this.generateCatData(),
            'dog': this.generateDogData(),
            'random': this.generateRandomData()
        };
    }
    
    /**
     * Generate sample data for digit "3"
     */
    generateDigit3Data() {
        const data = new Array(256).fill(0);
        
        // Create a simple pattern resembling "3"
        const pattern = [
            0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,
            0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,
            0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,
            0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,
            0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,
            0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,
            0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,
            0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,
            0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,
            0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,
            0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        
        return pattern.map(p => p * 255);
    }
    
    /**
     * Generate sample data for digit "7"
     */
    generateDigit7Data() {
        const data = new Array(256).fill(0);
        
        const pattern = [
            0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
            0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
            0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0,
            0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,
            0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,
            0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,
            0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,
            0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
            0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,
            0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,
            0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,
            0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,
            0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,
            0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,
            0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,
            0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0
        ];
        
        return pattern.map(p => p * 255);
    }
    
    /**
     * Generate sample cat-like pattern
     */
    generateCatData() {
        const data = new Array(256);
        
        for (let i = 0; i < 256; i++) {
            const x = i % 16;
            const y = Math.floor(i / 16);
            
            // Create cat-like features
            let value = 0;
            
            // Ears
            if ((x >= 3 && x <= 5 && y >= 2 && y <= 4) || 
                (x >= 10 && x <= 12 && y >= 2 && y <= 4)) {
                value = 200;
            }
            
            // Face outline
            if (x >= 4 && x <= 11 && y >= 5 && y <= 12) {
                value = 150;
            }
            
            // Eyes
            if ((x === 6 && y === 7) || (x === 9 && y === 7)) {
                value = 50;
            }
            
            // Nose
            if (x === 8 && y === 9) {
                value = 100;
            }
            
            // Add some noise
            value += (Math.random() - 0.5) * 30;
            
            data[i] = Math.max(0, Math.min(255, value));
        }
        
        return data;
    }
    
    /**
     * Generate sample dog-like pattern
     */
    generateDogData() {
        const data = new Array(256);
        
        for (let i = 0; i < 256; i++) {
            const x = i % 16;
            const y = Math.floor(i / 16);
            
            let value = 0;
            
            // Long ears
            if ((x >= 2 && x <= 4 && y >= 4 && y <= 10) || 
                (x >= 11 && x <= 13 && y >= 4 && y <= 10)) {
                value = 180;
            }
            
            // Face
            if (x >= 5 && x <= 10 && y >= 6 && y <= 13) {
                value = 160;
            }
            
            // Snout
            if (x >= 6 && x <= 9 && y >= 11 && y <= 14) {
                value = 140;
            }
            
            // Eyes
            if ((x === 6 && y === 8) || (x === 9 && y === 8)) {
                value = 60;
            }
            
            // Nose
            if (x >= 7 && x <= 8 && y === 13) {
                value = 80;
            }
            
            // Add noise
            value += (Math.random() - 0.5) * 25;
            
            data[i] = Math.max(0, Math.min(255, value));
        }
        
        return data;
    }
    
    /**
     * Generate random pattern
     */
    generateRandomData() {
        const data = new Array(256);
        
        for (let i = 0; i < 256; i++) {
            data[i] = Math.random() * 255;
        }
        
        return data;
    }
    
    /**
     * Initialize layer information data
     */
    initializeLayerData() {
        return [
            {
                name: 'Input Layer',
                description: 'Original image data represented as a 2D grid of pixel values. Each pixel contains intensity information that will be processed by subsequent layers.',
                shape: '16 × 16 × 1',
                parameters: '0',
                outputSize: '256',
                color: '#3b82f6'
            },
            {
                name: 'Convolutional Layer 1',
                description: 'Applies 8 different 3×3 filters to detect basic features like edges, corners, and simple patterns. Each filter learns to recognize specific visual patterns.',
                shape: '14 × 14 × 8',
                parameters: '80',
                outputSize: '1,568',
                color: '#10b981'
            },
            {
                name: 'Max Pooling Layer 1',
                description: 'Reduces spatial dimensions by taking the maximum value in each 2×2 region. This provides translation invariance and reduces computational load.',
                shape: '7 × 7 × 8',
                parameters: '0',
                outputSize: '392',
                color: '#f59e0b'
            },
            {
                name: 'Convolutional Layer 2',
                description: 'Applies 16 filters to detect more complex features by combining simpler patterns from the previous layer.',
                shape: '5 × 5 × 16',
                parameters: '1,168',
                outputSize: '400',
                color: '#10b981'
            },
            {
                name: 'Max Pooling Layer 2',
                description: 'Further reduces spatial dimensions while preserving the most important feature information.',
                shape: '2 × 2 × 16',
                parameters: '0',
                outputSize: '64',
                color: '#f59e0b'
            },
            {
                name: 'Flatten Layer',
                description: 'Converts the 2D feature maps into a 1D vector that can be processed by fully connected layers.',
                shape: '64',
                parameters: '0',
                outputSize: '64',
                color: '#8b5cf6'
            },
            {
                name: 'Dense Layer',
                description: 'Fully connected layer with 32 neurons that learns complex patterns from the flattened features.',
                shape: '32',
                parameters: '2,080',
                outputSize: '32',
                color: '#f97316'
            },
            {
                name: 'Output Layer',
                description: 'Final layer that produces classification probabilities for each possible class using softmax activation.',
                shape: '10',
                parameters: '330',
                outputSize: '10',
                color: '#ef4444'
            }
        ];
    }
    
    /**
     * Setup event listeners for UI controls
     */
    setupEventListeners() {
        // Image selection
        this.elements.imageSelect.addEventListener('change', (e) => {
            this.selectImage(e.target.value);
        });
        
        // Animation speed
        this.elements.animationSpeed.addEventListener('input', (e) => {
            this.setAnimationSpeed(parseFloat(e.target.value));
        });
        
        // Control buttons
        this.elements.playBtn.addEventListener('click', () => {
            this.startAnimation();
        });
        
        this.elements.pauseBtn.addEventListener('click', () => {
            this.pauseAnimation();
        });
        
        this.elements.resetBtn.addEventListener('click', () => {
            this.resetAnimation();
        });
        
        this.elements.stepBtn.addEventListener('click', () => {
            this.stepForward();
        });
        
        this.elements.autoPlayBtn.addEventListener('click', () => {
            this.autoPlay();
        });
        
        // Architecture step clicks
        this.elements.architectureSteps.forEach((step, index) => {
            step.addEventListener('click', () => {
                this.selectLayer(index);
            });
        });
        
        // Modal controls
        if (this.elements.modalClose) {
            this.elements.modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // Setup visualizer callbacks
        this.setupVisualizerCallbacks();
    }
    
    /**
     * Setup callbacks for visualizer events
     */
    setupVisualizerCallbacks() {
        // Layer change callback
        this.visualizer.onLayerChange = (layer) => {
            this.updateLayerInfo(layer);
            this.updateArchitectureProgress(layer.index);
        };
        
        // Animation callbacks
        this.animationEngine.onStepComplete = (stepIndex, step) => {
            this.updateAnimationProgress(stepIndex);
        };
        
        this.animationEngine.onAnimationComplete = () => {
            this.onAnimationComplete();
        };
        
        this.animationEngine.onLayerActivate = (layer) => {
            this.updateLayerInfo(layer);
            this.updateArchitectureProgress(layer.index);
        };
    }
    
    /**
     * Select and load a new image
     */
    selectImage(imageId) {
        this.currentImage = imageId;
        const imageData = this.imageData[imageId];
        
        if (imageData) {
            this.visualizer.loadImage(imageData);
            this.updatePredictions(imageId);
            console.log('Selected image:', imageId);
        }
    }
    
    /**
     * Set animation speed
     */
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
        this.animationEngine.setSpeed(speed);
        this.visualizer.setAnimationSpeed(speed);
        this.elements.speedValue.textContent = speed.toFixed(1) + 'x';
    }
    
    /**
     * Start animation
     */
    startAnimation() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.animationEngine.startAnimation();
            this.updateControlButtons();
            console.log('Animation started');
        }
    }
    
    /**
     * Pause animation
     */
    pauseAnimation() {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.animationEngine.pause();
            this.updateControlButtons();
            console.log('Animation paused');
        }
    }
    
    /**
     * Reset animation
     */
    resetAnimation() {
        this.isPlaying = false;
        this.currentLayerIndex = 0;
        this.animationEngine.stop();
        this.visualizer.stopAnimation();
        this.updateControlButtons();
        this.updateArchitectureProgress(0);
        this.updateLayerInfo(this.visualizer.getLayers()[0]);
        console.log('Animation reset');
    }
    
    /**
     * Step forward one layer
     */
    stepForward() {
        this.animationEngine.stepForward();
        console.log('Stepped forward');
    }
    
    /**
     * Auto play with continuous loop
     */
    autoPlay() {
        if (!this.isPlaying) {
            this.startAnimation();
            
            // Setup auto-restart
            const originalCallback = this.animationEngine.onAnimationComplete;
            this.animationEngine.onAnimationComplete = () => {
                setTimeout(() => {
                    this.resetAnimation();
                    setTimeout(() => {
                        this.startAnimation();
                    }, 1000);
                }, 2000);
                
                // Restore original callback
                if (originalCallback) {
                    originalCallback();
                }
            };
        }
    }
    
    /**
     * Select specific layer
     */
    selectLayer(layerIndex) {
        this.currentLayerIndex = layerIndex;
        this.visualizer.selectLayer(layerIndex);
        this.updateArchitectureProgress(layerIndex);
        
        const layers = this.visualizer.getLayers();
        if (layers[layerIndex]) {
            this.updateLayerInfo(layers[layerIndex]);
        }
    }
    
    /**
     * Update layer information panel
     */
    updateLayerInfo(layer) {
        if (!layer) return;
        
        const layerData = this.layerData[layer.index];
        
        if (layerData) {
            this.elements.currentLayerName.textContent = layerData.name;
            this.elements.currentLayerDescription.textContent = layerData.description;
            this.elements.layerShape.textContent = layerData.shape;
            this.elements.layerParams.textContent = layerData.parameters;
            this.elements.layerOutput.textContent = layerData.outputSize;
        }
    }
    
    /**
     * Update architecture progress indicators
     */
    updateArchitectureProgress(currentIndex) {
        this.elements.architectureSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index === currentIndex) {
                step.classList.add('active');
            } else if (index < currentIndex) {
                step.classList.add('completed');
            }
        });
    }
    
    /**
     * Update animation progress
     */
    updateAnimationProgress(stepIndex) {
        // Could add progress bar or other indicators here
        console.log(`Animation progress: ${stepIndex + 1}/${this.animationEngine.totalSteps}`);
    }
    
    /**
     * Update control buttons state
     */
    updateControlButtons() {
        this.elements.playBtn.disabled = this.isPlaying;
        this.elements.pauseBtn.disabled = !this.isPlaying;
        
        // Update button icons and text
        if (this.isPlaying) {
            this.elements.playBtn.innerHTML = '<i class="fas fa-play"></i> Running...';
            this.elements.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        } else {
            this.elements.playBtn.innerHTML = '<i class="fas fa-play"></i> Start Processing';
            this.elements.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Paused';
        }
    }
    
    /**
     * Update prediction results
     */
    updatePredictions(imageId) {
        // Simulate different predictions for different images
        const predictions = this.getPredictionsForImage(imageId);
        
        const predictionElements = this.elements.predictions.children;
        
        predictions.forEach((pred, index) => {
            if (index < predictionElements.length) {
                const element = predictionElements[index];
                const className = element.querySelector('.class-name');
                const confidenceFill = element.querySelector('.confidence-fill');
                const confidenceValue = element.querySelector('.confidence-value');
                
                className.textContent = pred.class;
                confidenceFill.style.width = `${pred.confidence}%`;
                confidenceValue.textContent = `${pred.confidence}%`;
                
                // Animate the change
                confidenceFill.style.transition = 'width 0.8s ease-out';
            }
        });
    }
    
    /**
     * Get predictions for specific image
     */
    getPredictionsForImage(imageId) {
        const predictionSets = {
            'digit-3': [
                { class: 'Digit 3', confidence: 89 },
                { class: 'Digit 8', confidence: 8 },
                { class: 'Digit 2', confidence: 3 }
            ],
            'digit-7': [
                { class: 'Digit 7', confidence: 94 },
                { class: 'Digit 1', confidence: 4 },
                { class: 'Digit 2', confidence: 2 }
            ],
            'cat': [
                { class: 'Cat', confidence: 85 },
                { class: 'Dog', confidence: 12 },
                { class: 'Bird', confidence: 3 }
            ],
            'dog': [
                { class: 'Dog', confidence: 78 },
                { class: 'Cat', confidence: 18 },
                { class: 'Wolf', confidence: 4 }
            ],
            'random': [
                { class: 'Unknown', confidence: 45 },
                { class: 'Noise', confidence: 30 },
                { class: 'Pattern', confidence: 25 }
            ]
        };
        
        return predictionSets[imageId] || predictionSets['random'];
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(event) {
        switch (event.key) {
            case ' ': // Spacebar
                event.preventDefault();
                if (this.isPlaying) {
                    this.pauseAnimation();
                } else {
                    this.startAnimation();
                }
                break;
            case 'r':
            case 'R':
                event.preventDefault();
                this.resetAnimation();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.stepForward();
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (this.animationSpeed < 3.0) {
                    this.setAnimationSpeed(this.animationSpeed + 0.1);
                    this.elements.animationSpeed.value = this.animationSpeed;
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (this.animationSpeed > 0.1) {
                    this.setAnimationSpeed(this.animationSpeed - 0.1);
                    this.elements.animationSpeed.value = this.animationSpeed;
                }
                break;
            case 'h':
            case 'H':
                event.preventDefault();
                this.showHelp();
                break;
            case 'Escape':
                this.closeModal();
                break;
        }
    }
    
    /**
     * Animation complete callback
     */
    onAnimationComplete() {
        this.isPlaying = false;
        this.updateControlButtons();
        
        // Show completion effect
        this.showCompletionEffect();
        
        console.log('Animation sequence completed');
    }
    
    /**
     * Show completion effect
     */
    showCompletionEffect() {
        // Add a temporary success message or effect
        const toast = document.createElement('div');
        toast.className = 'completion-toast';
        toast.innerHTML = '<i class="fas fa-check-circle"></i> Processing Complete!';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    /**
     * Show help modal
     */
    showHelp() {
        if (this.elements.helpModal) {
            this.elements.helpModal.style.display = 'block';
        }
    }
    
    /**
     * Close modal
     */
    closeModal() {
        if (this.elements.helpModal) {
            this.elements.helpModal.style.display = 'none';
        }
    }
    
    /**
     * Update UI with current state
     */
    updateUI() {
        // Load initial image
        this.selectImage(this.currentImage);
        
        // Set initial speed
        this.setAnimationSpeed(this.animationSpeed);
        
        // Update initial layer info
        const layers = this.visualizer.getLayers();
        if (layers.length > 0) {
            this.updateLayerInfo(layers[0]);
        }
        
        // Update control buttons
        this.updateControlButtons();
        
        // Hide loading indicator
        if (this.elements.loading) {
            this.elements.loading.classList.add('hidden');
        }
    }
    
    /**
     * Get current state for debugging
     */
    getState() {
        return {
            currentImage: this.currentImage,
            animationSpeed: this.animationSpeed,
            isPlaying: this.isPlaying,
            currentLayerIndex: this.currentLayerIndex
        };
    }
    
    /**
     * Dispose of UI controller
     */
    dispose() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyboard);
        
        console.log('UI Controller disposed');
    }
}

// Global functions for modal controls (called from HTML)
function showHelp() {
    if (window.uiController) {
        window.uiController.showHelp();
    }
}

function showAbout() {
    alert('CNN 3D Visualizer v1.0\n\nAn educational tool for understanding Convolutional Neural Networks through interactive 3D visualization.\n\nBuilt with Three.js and modern web technologies.');
}
