/**
 * Animation Engine - Handles complex animations and transitions for the CNN visualization
 * Provides smooth, educational animations for layer processing and data flow
 */

class AnimationEngine {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.scene = visualizer.scene;
        this.camera = visualizer.camera;
        
        // Animation state
        this.activeAnimations = new Map();
        this.animationQueue = [];
        this.isPlaying = false;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.speed = 1.0;
        
        // Timing
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        
        // Effects
        this.particleSystem = null;
        this.dataFlowLines = [];
        this.pulseEffects = [];
        
        // Callbacks
        this.onStepComplete = null;
        this.onAnimationComplete = null;
        this.onLayerActivate = null;
        
        this.initializeEffects();
    }
    
    /**
     * Initialize visual effects systems
     */
    initializeEffects() {
        this.createParticleSystem();
        this.setupDataFlowSystem();
    }
    
    /**
     * Create particle system for data flow visualization
     */
    createParticleSystem() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random initial positions
            positions[i3] = (Math.random() - 0.5) * 50;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
            
            // Random velocities
            velocities[i3] = (Math.random() - 0.5) * 2;
            velocities[i3 + 1] = (Math.random() - 0.5) * 2;
            velocities[i3 + 2] = -Math.random() * 5 - 1;
            
            // Random colors (blue to green spectrum)
            const hue = Math.random() * 0.3 + 0.5;
            const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Random sizes
            sizes[i] = Math.random() * 2 + 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            transparent: true,
            opacity: 0.6,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.particleSystem.visible = false;
        this.scene.add(this.particleSystem);
    }
    
    /**
     * Setup data flow visualization system
     */
    setupDataFlowSystem() {
        this.dataFlowContainer = new THREE.Group();
        this.dataFlowContainer.name = 'dataFlowContainer';
        this.scene.add(this.dataFlowContainer);
    }
    
    /**
     * Start the main animation sequence
     */
    startAnimation(steps = null) {
        this.isPlaying = true;
        this.currentStep = 0;
        
        if (steps) {
            this.animationQueue = steps;
            this.totalSteps = steps.length;
        } else {
            this.setupDefaultAnimationSequence();
        }
        
        this.playNextStep();
        console.log('Animation sequence started');
    }
    
    /**
     * Setup default animation sequence for CNN processing
     */
    setupDefaultAnimationSequence() {
        const layers = this.visualizer.getLayers();
        this.animationQueue = [];
        
        layers.forEach((layer, index) => {
            this.animationQueue.push({
                type: 'activateLayer',
                layerIndex: index,
                duration: 2000,
                effects: this.getLayerEffects(layer.type)
            });
            
            if (index < layers.length - 1) {
                this.animationQueue.push({
                    type: 'dataFlow',
                    fromLayer: index,
                    toLayer: index + 1,
                    duration: 1500
                });
            }
        });
        
        this.totalSteps = this.animationQueue.length;
    }
    
    /**
     * Get appropriate effects for each layer type
     */
    getLayerEffects(layerType) {
        const effects = {
            input: ['highlight', 'pixelPulse'],
            conv: ['highlight', 'convolutionSweep', 'featureMapGlow'],
            pool: ['highlight', 'poolingAnimation', 'downsample'],
            flatten: ['highlight', 'reshapeAnimation'],
            dense: ['highlight', 'neuronActivation', 'connectionPulse'],
            output: ['highlight', 'confidenceAnimation', 'resultHighlight']
        };
        
        return effects[layerType] || ['highlight'];
    }
    
    /**
     * Play the next step in the animation sequence
     */
    playNextStep() {
        if (!this.isPlaying || this.currentStep >= this.animationQueue.length) {
            this.completeAnimation();
            return;
        }
        
        const step = this.animationQueue[this.currentStep];
        const adjustedDuration = step.duration / this.speed;
        
        console.log(`Playing step ${this.currentStep + 1}/${this.totalSteps}: ${step.type}`);
        
        this.executeAnimationStep(step, adjustedDuration).then(() => {
            if (this.onStepComplete) {
                this.onStepComplete(this.currentStep, step);
            }
            
            this.currentStep++;
            
            // Delay before next step
            setTimeout(() => {
                this.playNextStep();
            }, 500 / this.speed);
        });
    }
    
    /**
     * Execute a single animation step
     */
    async executeAnimationStep(step, duration) {
        return new Promise((resolve) => {
            switch (step.type) {
                case 'activateLayer':
                    this.animateLayerActivation(step.layerIndex, step.effects, duration, resolve);
                    break;
                case 'dataFlow':
                    this.animateDataFlow(step.fromLayer, step.toLayer, duration, resolve);
                    break;
                case 'convolution':
                    this.animateConvolution(step.layerIndex, duration, resolve);
                    break;
                case 'pooling':
                    this.animatePooling(step.layerIndex, duration, resolve);
                    break;
                case 'dense':
                    this.animateDenseLayer(step.layerIndex, duration, resolve);
                    break;
                default:
                    resolve();
            }
        });
    }
    
    /**
     * Animate layer activation with effects
     */
    animateLayerActivation(layerIndex, effects, duration, callback) {
        const layers = this.visualizer.getLayers();
        const layer = layers[layerIndex];
        
        if (!layer) {
            callback();
            return;
        }
        
        // Notify layer change
        if (this.onLayerActivate) {
            this.onLayerActivate(layer);
        }
        
        // Focus camera on layer
        this.animateCameraToLayer(layer, 1000);
        
        // Execute effects
        const effectPromises = effects.map(effect => 
            this.executeLayerEffect(layer, effect, duration)
        );
        
        Promise.all(effectPromises).then(() => {
            callback();
        });
    }
    
    /**
     * Execute specific layer effect
     */
    executeLayerEffect(layer, effect, duration) {
        return new Promise((resolve) => {
            switch (effect) {
                case 'highlight':
                    this.highlightLayer(layer, duration, resolve);
                    break;
                case 'pixelPulse':
                    this.animatePixelPulse(layer, duration, resolve);
                    break;
                case 'convolutionSweep':
                    this.animateConvolutionSweep(layer, duration, resolve);
                    break;
                case 'featureMapGlow':
                    this.animateFeatureMapGlow(layer, duration, resolve);
                    break;
                case 'poolingAnimation':
                    this.animatePoolingWindows(layer, duration, resolve);
                    break;
                case 'downsample':
                    this.animateDownsampling(layer, duration, resolve);
                    break;
                case 'reshapeAnimation':
                    this.animateReshape(layer, duration, resolve);
                    break;
                case 'neuronActivation':
                    this.animateNeuronActivation(layer, duration, resolve);
                    break;
                case 'connectionPulse':
                    this.animateConnectionPulse(layer, duration, resolve);
                    break;
                case 'confidenceAnimation':
                    this.animateConfidenceBars(layer, duration, resolve);
                    break;
                case 'resultHighlight':
                    this.animateResultHighlight(layer, duration, resolve);
                    break;
                default:
                    resolve();
            }
        });
    }
    
    /**
     * Highlight layer with glow effect
     */
    highlightLayer(layer, duration, callback) {
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Sine wave for pulsing effect
            const intensity = 0.3 + 0.7 * Math.sin(progress * Math.PI * 4);
            
            layer.mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.emissive.setScalar(intensity * 0.2);
                }
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Reset emissive
                layer.mesh.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.emissive.setScalar(0);
                    }
                });
                callback();
            }
        };
        
        animate();
    }
    
    /**
     * Animate pixel pulsing for input layer
     */
    animatePixelPulse(layer, duration, callback) {
        if (layer.type !== 'input') {
            callback();
            return;
        }
        
        const startTime = Date.now();
        const pixels = [];
        
        layer.mesh.traverse((child) => {
            if (child.userData && child.userData.type === 'pixel') {
                pixels.push(child);
            }
        });
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            pixels.forEach((pixel, index) => {
                const delay = (index / pixels.length) * 0.5;
                const adjustedProgress = Math.max(0, progress - delay);
                
                const scale = 1 + 0.3 * Math.sin(adjustedProgress * Math.PI * 6);
                pixel.scale.setScalar(scale);
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Reset scales
                pixels.forEach(pixel => pixel.scale.setScalar(1));
                callback();
            }
        };
        
        animate();
    }
    
    /**
     * Animate convolution sweep across feature maps
     */
    animateConvolutionSweep(layer, duration, callback) {
        if (layer.type !== 'conv') {
            callback();
            return;
        }
        
        // Create animated filter
        const filter = this.createAnimatedFilter();
        layer.mesh.add(filter);
        
        const startTime = Date.now();
        const sweepPath = this.calculateSweepPath(layer);
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Move filter along sweep path
            const pathIndex = Math.floor(progress * (sweepPath.length - 1));
            const pathProgress = (progress * (sweepPath.length - 1)) % 1;
            
            if (pathIndex < sweepPath.length - 1) {
                const currentPos = sweepPath[pathIndex];
                const nextPos = sweepPath[pathIndex + 1];
                
                filter.position.lerpVectors(currentPos, nextPos, pathProgress);
                filter.rotation.z = progress * Math.PI * 2;
            }
            
            // Create activation effect at filter position
            this.createActivationRipple(layer, filter.position.clone());
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                layer.mesh.remove(filter);
                this.disposeObject(filter);
                callback();
            }
        };
        
        animate();
    }
    
    /**
     * Create animated convolution filter
     */
    createAnimatedFilter() {
        const group = new THREE.Group();
        
        // Main filter body
        const geometry = new THREE.BoxGeometry(2, 2, 0.3);
        const material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            emissive: 0x333333
        });
        
        const filterMesh = new THREE.Mesh(geometry, material);
        group.add(filterMesh);
        
        // Add weight indicators
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const weight = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1, 8, 8),
                    new THREE.MeshBasicMaterial({ 
                        color: Math.random() > 0.5 ? 0xff4444 : 0x4444ff 
                    })
                );
                weight.position.set(i * 0.5, j * 0.5, 0.2);
                group.add(weight);
            }
        }
        
        return group;
    }
    
    /**
     * Calculate sweep path for convolution filter
     */
    calculateSweepPath(layer) {
        const path = [];
        const bounds = this.getLayerBounds(layer);
        const stepSize = 1.5;
        
        for (let y = bounds.min.y; y <= bounds.max.y; y += stepSize) {
            for (let x = bounds.min.x; x <= bounds.max.x; x += stepSize) {
                path.push(new THREE.Vector3(x, y, bounds.max.z + 1));
            }
        }
        
        return path;
    }
    
    /**
     * Get bounding box of layer
     */
    getLayerBounds(layer) {
        const box = new THREE.Box3().setFromObject(layer.mesh);
        return box;
    }
    
    /**
     * Create activation ripple effect
     */
    createActivationRipple(layer, position) {
        const ripple = new THREE.Mesh(
            new THREE.RingGeometry(0, 2, 16),
            new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            })
        );
        
        ripple.position.copy(position);
        ripple.lookAt(this.camera.position);
        layer.mesh.add(ripple);
        
        // Animate ripple
        const startTime = Date.now();
        const duration = 500;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            ripple.scale.setScalar(1 + progress * 2);
            ripple.material.opacity = 0.6 * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                layer.mesh.remove(ripple);
                ripple.geometry.dispose();
                ripple.material.dispose();
            }
        };
        
        animate();
    }
    
    /**
     * Animate feature map glow
     */
    animateFeatureMapGlow(layer, duration, callback) {
        const startTime = Date.now();
        const featureMaps = [];
        
        layer.mesh.traverse((child) => {
            if (child.userData && child.userData.type === 'featureMap') {
                featureMaps.push(child);
            }
        });
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            featureMaps.forEach((map, index) => {
                const delay = (index / featureMaps.length) * 0.3;
                const adjustedProgress = Math.max(0, progress - delay);
                
                const intensity = Math.sin(adjustedProgress * Math.PI * 3) * 0.3;
                
                map.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.emissive.setScalar(Math.max(0, intensity));
                    }
                });
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Reset emissive
                featureMaps.forEach(map => {
                    map.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.emissive.setScalar(0);
                        }
                    });
                });
                callback();
            }
        };
        
        animate();
    }
    
    /**
     * Animate data flow between layers
     */
    animateDataFlow(fromLayerIndex, toLayerIndex, duration, callback) {
        const layers = this.visualizer.getLayers();
        const fromLayer = layers[fromLayerIndex];
        const toLayer = layers[toLayerIndex];
        
        if (!fromLayer || !toLayer) {
            callback();
            return;
        }
        
        this.createDataFlowParticles(fromLayer, toLayer, duration, callback);
    }
    
    /**
     * Create particle flow between layers
     */
    createDataFlowParticles(fromLayer, toLayer, duration, callback) {
        const numParticles = 30;
        const particles = [];
        
        for (let i = 0; i < numParticles; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.6),
                    transparent: true,
                    opacity: 0.8
                })
            );
            
            // Random start position within from layer bounds
            const fromBounds = this.getLayerBounds(fromLayer);
            particle.position.set(
                fromBounds.min.x + Math.random() * (fromBounds.max.x - fromBounds.min.x),
                fromBounds.min.y + Math.random() * (fromBounds.max.y - fromBounds.min.y),
                fromBounds.max.z
            );
            
            particles.push(particle);
            this.dataFlowContainer.add(particle);
        }
        
        // Animate particles
        const startTime = Date.now();
        const toBounds = this.getLayerBounds(toLayer);
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            particles.forEach((particle, index) => {
                const delay = (index / numParticles) * 0.3;
                const adjustedProgress = Math.max(0, (progress - delay) / (1 - delay * 0.8));
                
                if (adjustedProgress > 0) {
                    // Ease out cubic for smooth movement
                    const easeProgress = 1 - Math.pow(1 - adjustedProgress, 3);
                    
                    const targetX = toBounds.min.x + Math.random() * (toBounds.max.x - toBounds.min.x);
                    const targetY = toBounds.min.y + Math.random() * (toBounds.max.y - toBounds.min.y);
                    const targetZ = toBounds.min.z;
                    
                    particle.position.x += (targetX - particle.position.x) * easeProgress * 0.1;
                    particle.position.y += (targetY - particle.position.y) * easeProgress * 0.1;
                    particle.position.z += (targetZ - particle.position.z) * easeProgress * 0.1;
                    
                    // Fade out as approaching target
                    particle.material.opacity = 0.8 * (1 - easeProgress);
                    
                    // Add some randomness to path
                    particle.position.x += Math.sin(adjustedProgress * Math.PI * 4) * 0.5;
                    particle.position.y += Math.cos(adjustedProgress * Math.PI * 4) * 0.5;
                }
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Clean up particles
                particles.forEach(particle => {
                    this.dataFlowContainer.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                });
                callback();
            }
        };
        
        animate();
    }
    
    /**
     * Animate camera movement to focus on layer
     */
    animateCameraToLayer(layer, duration) {
        const bounds = this.getLayerBounds(layer);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        
        const distance = Math.max(size.x, size.y, size.z) * 2;
        const targetPosition = new THREE.Vector3(
            center.x + distance * 0.5,
            center.y + distance * 0.3,
            center.z + distance
        );
        
        const controls = this.visualizer.controls;
        const startPosition = this.camera.position.clone();
        const startTarget = controls.target.clone();
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            controls.target.lerpVectors(startTarget, center, easeProgress);
            controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Set animation speed
     */
    setSpeed(speed) {
        this.speed = Math.max(0.1, Math.min(3.0, speed));
    }
    
    /**
     * Pause animation
     */
    pause() {
        this.isPlaying = false;
    }
    
    /**
     * Resume animation
     */
    resume() {
        if (!this.isPlaying && this.currentStep < this.animationQueue.length) {
            this.isPlaying = true;
            this.playNextStep();
        }
    }
    
    /**
     * Stop animation and reset
     */
    stop() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.clearActiveAnimations();
        this.resetEffects();
    }
    
    /**
     * Step forward one animation
     */
    stepForward() {
        if (this.currentStep < this.animationQueue.length) {
            const step = this.animationQueue[this.currentStep];
            this.executeAnimationStep(step, step.duration).then(() => {
                this.currentStep++;
                if (this.onStepComplete) {
                    this.onStepComplete(this.currentStep - 1, step);
                }
            });
        }
    }
    
    /**
     * Clear all active animations
     */
    clearActiveAnimations() {
        this.activeAnimations.clear();
    }
    
    /**
     * Reset all visual effects
     */
    resetEffects() {
        // Clear data flow particles
        this.dataFlowContainer.clear();
        
        // Reset layer materials
        const layers = this.visualizer.getLayers();
        layers.forEach(layer => {
            if (layer.mesh) {
                layer.mesh.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.emissive.setScalar(0);
                        child.material.opacity = child.material.userData.originalOpacity || 0.8;
                        child.scale.setScalar(1);
                    }
                });
            }
        });
        
        // Hide particle system
        if (this.particleSystem) {
            this.particleSystem.visible = false;
        }
    }
    
    /**
     * Complete animation sequence
     */
    completeAnimation() {
        this.isPlaying = false;
        console.log('Animation sequence completed');
        
        if (this.onAnimationComplete) {
            this.onAnimationComplete();
        }
    }
    
    /**
     * Update animation engine (called from main render loop)
     */
    update() {
        this.deltaTime = this.clock.getDelta();
        
        // Update particle system
        if (this.particleSystem && this.particleSystem.visible) {
            this.updateParticles();
        }
        
        // Update any continuous effects
        this.updateContinuousEffects();
    }
    
    /**
     * Update particle system
     */
    updateParticles() {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const velocities = this.particleSystem.geometry.attributes.velocity.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Update positions
            positions[i] += velocities[i] * this.deltaTime;
            positions[i + 1] += velocities[i + 1] * this.deltaTime;
            positions[i + 2] += velocities[i + 2] * this.deltaTime;
            
            // Reset particles that go too far
            if (positions[i + 2] < -50) {
                positions[i] = (Math.random() - 0.5) * 50;
                positions[i + 1] = (Math.random() - 0.5) * 20;
                positions[i + 2] = 50;
            }
        }
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    /**
     * Update continuous effects
     */
    updateContinuousEffects() {
        // Update any ongoing pulse effects
        this.pulseEffects.forEach(effect => {
            effect.update(this.deltaTime);
        });
        
        // Remove completed effects
        this.pulseEffects = this.pulseEffects.filter(effect => !effect.isComplete);
    }
    
    /**
     * Dispose of animation engine resources
     */
    dispose() {
        this.stop();
        this.clearActiveAnimations();
        
        if (this.particleSystem) {
            this.scene.remove(this.particleSystem);
            this.particleSystem.geometry.dispose();
            this.particleSystem.material.dispose();
        }
        
        if (this.dataFlowContainer) {
            this.scene.remove(this.dataFlowContainer);
        }
        
        console.log('Animation engine disposed');
    }
    
    /**
     * Dispose of Three.js objects
     */
    disposeObject(object) {
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
        if (object.children) {
            object.children.forEach(child => this.disposeObject(child));
        }
    }
}
