/**
 * CNN 3D Visualizer - Main Visualizer Class
 * Handles the core 3D scene, camera, and rendering for the CNN visualization
 */

class CNNVisualizer {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        
        // Scene setup
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Layer objects
        this.layers = [];
        this.currentLayerIndex = 0;
        this.animationState = 'stopped'; // 'playing', 'paused', 'stopped'
        
        // Animation properties
        this.clock = new THREE.Clock();
        this.animationSpeed = 1.0;
        this.layerSpacing = 15;
        
        // Current data
        this.currentImage = null;
        this.processingData = null;
        
        // Event handlers
        this.onLayerChange = null;
        this.onAnimationComplete = null;
        
        this.init();
    }
    
    /**
     * Initialize the 3D scene and components
     */
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.setupEventListeners();
        
        // Start render loop
        this.animate();
        
        // Create initial layers
        this.createNetworkArchitecture();
        
        console.log('CNN Visualizer initialized');
    }
    
    /**
     * Setup the Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a202c);
        
        // Add fog for depth perception
        this.scene.fog = new THREE.Fog(0x1a202c, 50, 200);
    }
    
    /**
     * Setup the camera
     */
    setupCamera() {
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 20, 50);
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * Setup the WebGL renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    /**
     * Setup orbit controls for camera interaction
     */
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 200;
        this.controls.maxPolarAngle = Math.PI / 2 + 0.2;
    }
    
    /**
     * Setup scene lighting
     */
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
        
        // Fill lights
        const fillLight1 = new THREE.DirectionalLight(0x4f46e5, 0.3);
        fillLight1.position.set(-10, 10, -10);
        this.scene.add(fillLight1);
        
        const fillLight2 = new THREE.DirectionalLight(0x10b981, 0.2);
        fillLight2.position.set(10, -10, 10);
        this.scene.add(fillLight2);
        
        // Point lights for accent
        const pointLight1 = new THREE.PointLight(0x3b82f6, 0.5, 30);
        pointLight1.position.set(-20, 10, 0);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xf59e0b, 0.3, 25);
        pointLight2.position.set(20, 10, 0);
        this.scene.add(pointLight2);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Handle mouse events for layer interaction
        this.setupMouseInteraction();
    }
    
    /**
     * Setup mouse interaction for layer selection and tooltips
     */
    setupMouseInteraction() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            
            // Check for intersections with layer objects
            const intersectableObjects = this.layers.flatMap(layer => 
                layer.mesh ? [layer.mesh] : []
            );
            
            const intersects = raycaster.intersectObjects(intersectableObjects);
            
            if (intersects.length > 0) {
                const intersectedObject = intersects[0].object;
                const layer = this.layers.find(l => l.mesh === intersectedObject);
                
                if (layer) {
                    this.showLayerTooltip(layer, event.clientX, event.clientY);
                    this.canvas.style.cursor = 'pointer';
                }
            } else {
                this.hideLayerTooltip();
                this.canvas.style.cursor = 'default';
            }
        });
        
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            
            const intersectableObjects = this.layers.flatMap(layer => 
                layer.mesh ? [layer.mesh] : []
            );
            
            const intersects = raycaster.intersectObjects(intersectableObjects);
            
            if (intersects.length > 0) {
                const intersectedObject = intersects[0].object;
                const layer = this.layers.find(l => l.mesh === intersectedObject);
                
                if (layer) {
                    this.selectLayer(layer.index);
                }
            }
        });
    }
    
    /**
     * Show tooltip for a layer
     */
    showLayerTooltip(layer, x, y) {
        const tooltip = document.getElementById('layer-tooltip');
        const title = document.getElementById('tooltip-title');
        const description = document.getElementById('tooltip-description');
        
        title.textContent = layer.name;
        description.textContent = layer.description;
        
        tooltip.classList.add('visible');
    }
    
    /**
     * Hide layer tooltip
     */
    hideLayerTooltip() {
        const tooltip = document.getElementById('layer-tooltip');
        tooltip.classList.remove('visible');
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    /**
     * Create the network architecture with all layers
     */
    createNetworkArchitecture() {
        // Clear existing layers
        this.clearLayers();
        
        // Define CNN architecture
        const architecture = [
            {
                type: 'input',
                name: 'Input Layer',
                description: 'Original image data as a 2D grid of pixel values',
                shape: [16, 16, 1],
                position: { x: 0, y: 0, z: 0 },
                color: 0x3b82f6
            },
            {
                type: 'conv',
                name: 'Convolutional Layer 1',
                description: 'Applies 8 filters of size 3x3 to detect basic features',
                shape: [14, 14, 8],
                position: { x: 0, y: 0, z: -this.layerSpacing },
                color: 0x10b981,
                filterSize: 3,
                numFilters: 8
            },
            {
                type: 'pool',
                name: 'Max Pooling Layer 1',
                description: 'Reduces spatial dimensions by taking maximum values in 2x2 regions',
                shape: [7, 7, 8],
                position: { x: 0, y: 0, z: -this.layerSpacing * 2 },
                color: 0xf59e0b,
                poolSize: 2
            },
            {
                type: 'conv',
                name: 'Convolutional Layer 2',
                description: 'Applies 16 filters of size 3x3 to detect complex features',
                shape: [5, 5, 16],
                position: { x: 0, y: 0, z: -this.layerSpacing * 3 },
                color: 0x10b981,
                filterSize: 3,
                numFilters: 16
            },
            {
                type: 'pool',
                name: 'Max Pooling Layer 2',
                description: 'Further reduces spatial dimensions',
                shape: [2, 2, 16],
                position: { x: 0, y: 0, z: -this.layerSpacing * 4 },
                color: 0xf59e0b,
                poolSize: 2
            },
            {
                type: 'flatten',
                name: 'Flatten Layer',
                description: 'Converts 2D feature maps to 1D vector for dense layers',
                shape: [64],
                position: { x: 0, y: 0, z: -this.layerSpacing * 5 },
                color: 0x8b5cf6
            },
            {
                type: 'dense',
                name: 'Dense Layer',
                description: 'Fully connected layer with 32 neurons',
                shape: [32],
                position: { x: 0, y: 0, z: -this.layerSpacing * 6 },
                color: 0xf97316
            },
            {
                type: 'output',
                name: 'Output Layer',
                description: 'Final classification probabilities for each class',
                shape: [10],
                position: { x: 0, y: 0, z: -this.layerSpacing * 7 },
                color: 0xef4444
            }
        ];
        
        // Create layer objects
        architecture.forEach((layerConfig, index) => {
            const layer = this.createLayer(layerConfig, index);
            this.layers.push(layer);
            this.scene.add(layer.mesh);
        });
        
        console.log('Network architecture created with', this.layers.length, 'layers');
    }
    
    /**
     * Create a single layer based on configuration
     */
    createLayer(config, index) {
        const layer = {
            index,
            type: config.type,
            name: config.name,
            description: config.description,
            shape: config.shape,
            position: config.position,
            color: config.color,
            mesh: null,
            visible: true,
            animated: false
        };
        
        // Create appropriate geometry based on layer type
        switch (config.type) {
            case 'input':
                layer.mesh = this.createInputLayer(config);
                break;
            case 'conv':
                layer.mesh = this.createConvolutionalLayer(config);
                break;
            case 'pool':
                layer.mesh = this.createPoolingLayer(config);
                break;
            case 'flatten':
                layer.mesh = this.createFlattenLayer(config);
                break;
            case 'dense':
                layer.mesh = this.createDenseLayer(config);
                break;
            case 'output':
                layer.mesh = this.createOutputLayer(config);
                break;
            default:
                layer.mesh = this.createGenericLayer(config);
        }
        
        // Set position
        layer.mesh.position.set(
            config.position.x,
            config.position.y,
            config.position.z
        );
        
        // Add user data for interaction
        layer.mesh.userData = { layer };
        
        return layer;
    }
    
    /**
     * Create input layer visualization (2D grid of colored cubes)
     */
    createInputLayer(config) {
        const group = new THREE.Group();
        const [width, height] = config.shape;
        const cubeSize = 0.8;
        const spacing = 1.0;
        
        // Create material
        const material = new THREE.MeshLambertMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.8
        });
        
        // Create geometry
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        
        // Create grid of cubes
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const cube = new THREE.Mesh(geometry, material.clone());
                cube.position.set(
                    (i - width/2) * spacing,
                    (j - height/2) * spacing,
                    0
                );
                cube.castShadow = true;
                cube.receiveShadow = true;
                group.add(cube);
            }
        }
        
        return group;
    }
    
    /**
     * Create convolutional layer visualization
     */
    createConvolutionalLayer(config) {
        const group = new THREE.Group();
        const [width, height, depth] = config.shape;
        const cubeSize = 0.6;
        const spacing = 0.8;
        const layerSpacing = 1.5;
        
        // Create material
        const material = new THREE.MeshLambertMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.7
        });
        
        // Create geometry
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        
        // Create feature maps
        for (let d = 0; d < depth; d++) {
            const featureMap = new THREE.Group();
            
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    const cube = new THREE.Mesh(geometry, material.clone());
                    cube.position.set(
                        (i - width/2) * spacing,
                        (j - height/2) * spacing,
                        0
                    );
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    featureMap.add(cube);
                }
            }
            
            featureMap.position.z = (d - depth/2) * layerSpacing;
            group.add(featureMap);
        }
        
        return group;
    }
    
    /**
     * Create pooling layer visualization
     */
    createPoolingLayer(config) {
        const group = new THREE.Group();
        const [width, height, depth] = config.shape;
        const cubeSize = 0.7;
        const spacing = 1.2;
        const layerSpacing = 1.8;
        
        // Create material with different color intensity
        const material = new THREE.MeshLambertMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.8
        });
        
        // Create geometry
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        
        // Create reduced feature maps
        for (let d = 0; d < depth; d++) {
            const featureMap = new THREE.Group();
            
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    const cube = new THREE.Mesh(geometry, material.clone());
                    cube.position.set(
                        (i - width/2) * spacing,
                        (j - height/2) * spacing,
                        0
                    );
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    featureMap.add(cube);
                }
            }
            
            featureMap.position.z = (d - depth/2) * layerSpacing;
            group.add(featureMap);
        }
        
        return group;
    }
    
    /**
     * Create flatten layer visualization
     */
    createFlattenLayer(config) {
        const group = new THREE.Group();
        const [size] = config.shape;
        const sphereRadius = 0.3;
        const spacing = 0.8;
        
        // Create material
        const material = new THREE.MeshLambertMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.8
        });
        
        // Create geometry
        const geometry = new THREE.SphereGeometry(sphereRadius, 8, 8);
        
        // Create 1D array of spheres
        const cols = Math.ceil(Math.sqrt(size));
        const rows = Math.ceil(size / cols);
        
        for (let i = 0; i < size; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            const sphere = new THREE.Mesh(geometry, material.clone());
            sphere.position.set(
                (col - cols/2) * spacing,
                (row - rows/2) * spacing,
                0
            );
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            group.add(sphere);
        }
        
        return group;
    }
    
    /**
     * Create dense layer visualization
     */
    createDenseLayer(config) {
        const group = new THREE.Group();
        const [size] = config.shape;
        const sphereRadius = 0.4;
        const spacing = 1.0;
        
        // Create material
        const material = new THREE.MeshLambertMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.8
        });
        
        // Create geometry
        const geometry = new THREE.SphereGeometry(sphereRadius, 12, 12);
        
        // Create circular arrangement of neurons
        const radius = size * spacing / (2 * Math.PI);
        
        for (let i = 0; i < size; i++) {
            const angle = (i / size) * Math.PI * 2;
            const sphere = new THREE.Mesh(geometry, material.clone());
            sphere.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            group.add(sphere);
        }
        
        return group;
    }
    
    /**
     * Create output layer visualization
     */
    createOutputLayer(config) {
        const group = new THREE.Group();
        const [size] = config.shape;
        const cylinderRadius = 0.5;
        const maxHeight = 4;
        const spacing = 1.5;
        
        // Create cylinders with varying heights representing confidence
        for (let i = 0; i < size; i++) {
            const height = maxHeight * (1 - i * 0.1); // Simulate decreasing confidence
            
            const geometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, height, 8);
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL((i / size) * 0.8, 0.7, 0.5),
                transparent: true,
                opacity: 0.8
            });
            
            const cylinder = new THREE.Mesh(geometry, material);
            cylinder.position.set(
                (i - size/2) * spacing,
                height/2,
                0
            );
            cylinder.castShadow = true;
            cylinder.receiveShadow = true;
            group.add(cylinder);
        }
        
        return group;
    }
    
    /**
     * Create generic layer visualization
     */
    createGenericLayer(config) {
        const geometry = new THREE.BoxGeometry(5, 5, 1);
        const material = new THREE.MeshLambertMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.7
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }
    
    /**
     * Clear all layers from the scene
     */
    clearLayers() {
        this.layers.forEach(layer => {
            if (layer.mesh) {
                this.scene.remove(layer.mesh);
                // Dispose of geometries and materials
                this.disposeObject(layer.mesh);
            }
        });
        this.layers = [];
    }
    
    /**
     * Dispose of Three.js objects to prevent memory leaks
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
    
    /**
     * Select a specific layer
     */
    selectLayer(index) {
        if (index >= 0 && index < this.layers.length) {
            this.currentLayerIndex = index;
            
            // Update UI
            if (this.onLayerChange) {
                this.onLayerChange(this.layers[index]);
            }
            
            // Focus camera on selected layer
            this.focusOnLayer(index);
            
            console.log('Selected layer:', this.layers[index].name);
        }
    }
    
    /**
     * Focus camera on a specific layer
     */
    focusOnLayer(index) {
        if (index >= 0 && index < this.layers.length) {
            const layer = this.layers[index];
            const targetPosition = new THREE.Vector3(
                layer.position.x,
                layer.position.y + 10,
                layer.position.z + 20
            );
            
            // Animate camera movement
            this.animateCameraTo(targetPosition, layer.position);
        }
    }
    
    /**
     * Animate camera to target position
     */
    animateCameraTo(position, lookAt) {
        const duration = 1000; // 1 second
        const startPosition = this.camera.position.clone();
        const startLookAt = this.controls.target.clone();
        
        const startTime = Date.now();
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, position, easeProgress);
            this.controls.target.lerpVectors(startLookAt, lookAt, easeProgress);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }
    
    /**
     * Set animation speed
     */
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }
    
    /**
     * Load and display a new image
     */
    loadImage(imageData) {
        this.currentImage = imageData;
        
        // Update input layer with new image data
        if (this.layers.length > 0) {
            this.updateInputLayer(imageData);
        }
        
        console.log('Image loaded:', imageData);
    }
    
    /**
     * Update input layer with new image data
     */
    updateInputLayer(imageData) {
        const inputLayer = this.layers[0];
        if (inputLayer && inputLayer.type === 'input') {
            const group = inputLayer.mesh;
            const cubes = [];
            
            // Collect all cube meshes
            group.traverse((child) => {
                if (child.isMesh && child.geometry.type === 'BoxGeometry') {
                    cubes.push(child);
                }
            });
            
            // Update cube colors based on image data
            imageData.forEach((pixel, index) => {
                if (index < cubes.length) {
                    const intensity = pixel / 255;
                    cubes[index].material.color.setRGB(intensity, intensity, intensity);
                    cubes[index].material.opacity = 0.3 + intensity * 0.7;
                }
            });
        }
    }
    
    /**
     * Start forward pass animation
     */
    startAnimation() {
        this.animationState = 'playing';
        this.currentLayerIndex = 0;
        
        console.log('Animation started');
        this.animateForwardPass();
    }
    
    /**
     * Pause animation
     */
    pauseAnimation() {
        this.animationState = 'paused';
        console.log('Animation paused');
    }
    
    /**
     * Resume animation
     */
    resumeAnimation() {
        if (this.animationState === 'paused') {
            this.animationState = 'playing';
            console.log('Animation resumed');
            this.animateForwardPass();
        }
    }
    
    /**
     * Stop animation and reset
     */
    stopAnimation() {
        this.animationState = 'stopped';
        this.currentLayerIndex = 0;
        this.resetLayerAnimations();
        console.log('Animation stopped');
    }
    
    /**
     * Step forward one layer
     */
    stepForward() {
        if (this.currentLayerIndex < this.layers.length - 1) {
            this.currentLayerIndex++;
            this.animateLayer(this.currentLayerIndex);
            
            if (this.onLayerChange) {
                this.onLayerChange(this.layers[this.currentLayerIndex]);
            }
        }
    }
    
    /**
     * Animate the forward pass through the network
     */
    animateForwardPass() {
        if (this.animationState !== 'playing') return;
        
        if (this.currentLayerIndex < this.layers.length) {
            this.animateLayer(this.currentLayerIndex);
            
            // Update UI
            if (this.onLayerChange) {
                this.onLayerChange(this.layers[this.currentLayerIndex]);
            }
            
            // Schedule next layer animation
            setTimeout(() => {
                this.currentLayerIndex++;
                this.animateForwardPass();
            }, 2000 / this.animationSpeed);
        } else {
            // Animation complete
            this.animationState = 'stopped';
            if (this.onAnimationComplete) {
                this.onAnimationComplete();
            }
            console.log('Forward pass animation complete');
        }
    }
    
    /**
     * Animate a specific layer
     */
    animateLayer(index) {
        if (index >= 0 && index < this.layers.length) {
            const layer = this.layers[index];
            
            // Highlight the current layer
            this.highlightLayer(layer);
            
            // Focus camera on current layer
            this.focusOnLayer(index);
            
            // Animate layer-specific effects
            this.animateLayerEffects(layer);
        }
    }
    
    /**
     * Highlight a layer
     */
    highlightLayer(layer) {
        // Remove previous highlights
        this.layers.forEach(l => {
            if (l.mesh) {
                l.mesh.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.emissive.setHex(0x000000);
                    }
                });
            }
        });
        
        // Highlight current layer
        if (layer.mesh) {
            layer.mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.emissive.setHex(0x222222);
                }
            });
        }
    }
    
    /**
     * Animate layer-specific effects
     */
    animateLayerEffects(layer) {
        switch (layer.type) {
            case 'conv':
                this.animateConvolution(layer);
                break;
            case 'pool':
                this.animatePooling(layer);
                break;
            case 'flatten':
                this.animateFlatten(layer);
                break;
            case 'dense':
                this.animateDense(layer);
                break;
            case 'output':
                this.animateOutput(layer);
                break;
        }
    }
    
    /**
     * Animate convolution operation
     */
    animateConvolution(layer) {
        // Create animated filter that moves across the layer
        const filterGeometry = new THREE.BoxGeometry(2, 2, 0.5);
        const filterMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            emissive: 0x333333
        });
        
        const filter = new THREE.Mesh(filterGeometry, filterMaterial);
        layer.mesh.add(filter);
        
        // Animate filter movement
        const startPos = { x: -5, y: -5, z: 1 };
        const endPos = { x: 5, y: 5, z: 1 };
        
        filter.position.set(startPos.x, startPos.y, startPos.z);
        
        const duration = 2000 / this.animationSpeed;
        const startTime = Date.now();
        
        const animateFilter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            filter.position.x = startPos.x + (endPos.x - startPos.x) * progress;
            filter.position.y = startPos.y + (endPos.y - startPos.y) * progress;
            filter.rotation.z = progress * Math.PI * 2;
            
            if (progress < 1 && this.animationState === 'playing') {
                requestAnimationFrame(animateFilter);
            } else {
                layer.mesh.remove(filter);
                filterGeometry.dispose();
                filterMaterial.dispose();
            }
        };
        
        animateFilter();
    }
    
    /**
     * Animate pooling operation
     */
    animatePooling(layer) {
        // Animate shrinking effect
        const originalScale = layer.mesh.scale.clone();
        layer.mesh.scale.set(0.1, 0.1, 0.1);
        
        const duration = 1000 / this.animationSpeed;
        const startTime = Date.now();
        
        const animateScale = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out elastic
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            layer.mesh.scale.lerpVectors(
                new THREE.Vector3(0.1, 0.1, 0.1),
                originalScale,
                easeProgress
            );
            
            if (progress < 1 && this.animationState === 'playing') {
                requestAnimationFrame(animateScale);
            }
        };
        
        animateScale();
    }
    
    /**
     * Animate flatten operation
     */
    animateFlatten(layer) {
        // Animate transformation from 2D to 1D
        layer.mesh.children.forEach((child, index) => {
            const delay = index * 20;
            
            setTimeout(() => {
                if (this.animationState === 'playing') {
                    const originalY = child.position.y;
                    child.position.y = 0;
                    
                    // Bounce animation
                    const duration = 500 / this.animationSpeed;
                    const startTime = Date.now();
                    
                    const animateBounce = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        const bounceProgress = 1 - Math.abs(Math.sin(progress * Math.PI * 2)) * (1 - progress);
                        child.position.y = originalY * bounceProgress;
                        
                        if (progress < 1 && this.animationState === 'playing') {
                            requestAnimationFrame(animateBounce);
                        }
                    };
                    
                    animateBounce();
                }
            }, delay);
        });
    }
    
    /**
     * Animate dense layer
     */
    animateDense(layer) {
        // Animate connections between neurons
        layer.mesh.children.forEach((neuron, index) => {
            const delay = index * 50;
            
            setTimeout(() => {
                if (this.animationState === 'playing') {
                    neuron.material.emissive.setHex(0x444444);
                    
                    setTimeout(() => {
                        neuron.material.emissive.setHex(0x000000);
                    }, 300 / this.animationSpeed);
                }
            }, delay);
        });
    }
    
    /**
     * Animate output layer
     */
    animateOutput(layer) {
        // Animate confidence bars growing
        layer.mesh.children.forEach((cylinder, index) => {
            const originalScale = cylinder.scale.y;
            cylinder.scale.y = 0;
            
            const delay = index * 100;
            
            setTimeout(() => {
                if (this.animationState === 'playing') {
                    const duration = 800 / this.animationSpeed;
                    const startTime = Date.now();
                    
                    const animateGrow = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Ease out back
                        const easeProgress = 1 + 1.7 * Math.pow(progress - 1, 3) + 1.7 * Math.pow(progress - 1, 2);
                        
                        cylinder.scale.y = originalScale * Math.min(easeProgress, 1);
                        
                        if (progress < 1 && this.animationState === 'playing') {
                            requestAnimationFrame(animateGrow);
                        }
                    };
                    
                    animateGrow();
                }
            }, delay);
        });
    }
    
    /**
     * Reset all layer animations
     */
    resetLayerAnimations() {
        this.layers.forEach(layer => {
            if (layer.mesh) {
                // Reset scale
                layer.mesh.scale.set(1, 1, 1);
                
                // Reset emissive colors
                layer.mesh.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.emissive.setHex(0x000000);
                    }
                });
                
                // Reset positions for specific layer types
                if (layer.type === 'flatten') {
                    layer.mesh.children.forEach((child, index) => {
                        const cols = Math.ceil(Math.sqrt(layer.shape[0]));
                        const rows = Math.ceil(layer.shape[0] / cols);
                        const col = index % cols;
                        const row = Math.floor(index / cols);
                        const spacing = 0.8;
                        
                        child.position.set(
                            (col - cols/2) * spacing,
                            (row - rows/2) * spacing,
                            0
                        );
                    });
                }
            }
        });
    }
    
    /**
     * Main animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Update any ongoing animations
        this.updateAnimations();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Update ongoing animations
     */
    updateAnimations() {
        const time = this.clock.getElapsedTime();
        
        // Animate layer materials
        this.layers.forEach((layer, index) => {
            if (layer.mesh && layer.visible) {
                // Subtle breathing animation for inactive layers
                if (index !== this.currentLayerIndex) {
                    const opacity = 0.3 + 0.1 * Math.sin(time * 2 + index);
                    layer.mesh.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.opacity = opacity;
                        }
                    });
                }
            }
        });
    }
    
    /**
     * Get current layer information
     */
    getCurrentLayer() {
        return this.layers[this.currentLayerIndex] || null;
    }
    
    /**
     * Get all layers
     */
    getLayers() {
        return this.layers;
    }
    
    /**
     * Dispose of the visualizer
     */
    dispose() {
        // Clear layers
        this.clearLayers();
        
        // Dispose of renderer
        this.renderer.dispose();
        
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize);
        
        console.log('CNN Visualizer disposed');
    }
}
