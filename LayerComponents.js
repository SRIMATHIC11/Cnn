/**
 * Layer Components - Individual layer visualization components
 * Provides specialized rendering and animation for different CNN layer types
 */

class LayerComponents {
    constructor() {
        this.materials = this.initializeMaterials();
        this.geometries = this.initializeGeometries();
    }
    
    /**
     * Initialize reusable materials for different layer types
     */
    initializeMaterials() {
        return {
            input: new THREE.MeshLambertMaterial({
                color: 0x3b82f6,
                transparent: true,
                opacity: 0.8
            }),
            convolution: new THREE.MeshLambertMaterial({
                color: 0x10b981,
                transparent: true,
                opacity: 0.7
            }),
            pooling: new THREE.MeshLambertMaterial({
                color: 0xf59e0b,
                transparent: true,
                opacity: 0.8
            }),
            flatten: new THREE.MeshLambertMaterial({
                color: 0x8b5cf6,
                transparent: true,
                opacity: 0.8
            }),
            dense: new THREE.MeshLambertMaterial({
                color: 0xf97316,
                transparent: true,
                opacity: 0.8
            }),
            output: new THREE.MeshLambertMaterial({
                color: 0xef4444,
                transparent: true,
                opacity: 0.8
            }),
            filter: new THREE.MeshLambertMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.6,
                emissive: 0x333333
            }),
            connection: new THREE.LineBasicMaterial({
                color: 0x64748b,
                transparent: true,
                opacity: 0.3
            })
        };
    }
    
    /**
     * Initialize reusable geometries
     */
    initializeGeometries() {
        return {
            cube: new THREE.BoxGeometry(0.8, 0.8, 0.8),
            smallCube: new THREE.BoxGeometry(0.6, 0.6, 0.6),
            sphere: new THREE.SphereGeometry(0.3, 12, 12),
            largeSphere: new THREE.SphereGeometry(0.4, 16, 16),
            cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
            filter: new THREE.BoxGeometry(2, 2, 0.3),
            thinPlane: new THREE.PlaneGeometry(1, 1)
        };
    }
    
    /**
     * Create an enhanced input layer with image data visualization
     */
    createInputLayer(config, imageData = null) {
        const group = new THREE.Group();
        const [width, height, channels] = config.shape;
        const pixelSize = 0.8;
        const spacing = 1.0;
        
        // Create pixel grid
        const pixels = [];
        for (let i = 0; i < width; i++) {
            pixels[i] = [];
            for (let j = 0; j < height; j++) {
                pixels[i][j] = [];
                
                for (let c = 0; c < channels; c++) {
                    const cube = new THREE.Mesh(
                        this.geometries.cube.clone(),
                        this.materials.input.clone()
                    );
                    
                    cube.position.set(
                        (i - width/2) * spacing,
                        (j - height/2) * spacing,
                        c * 0.2
                    );
                    
                    // Set initial color based on image data
                    if (imageData) {
                        const dataIndex = (j * width + i) * channels + c;
                        const intensity = imageData[dataIndex] / 255;
                        cube.material.color.setRGB(intensity, intensity, intensity);
                    }
                    
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    cube.userData = { type: 'pixel', i, j, c };
                    
                    pixels[i][j][c] = cube;
                    group.add(cube);
                }
            }
        }
        
        // Add border frame
        this.addLayerFrame(group, width * spacing, height * spacing, 0x3b82f6);
        
        group.userData = { type: 'input', pixels };
        return group;
    }
    
    /**
     * Create a convolutional layer with feature maps and filters
     */
    createConvolutionalLayer(config) {
        const group = new THREE.Group();
        const [width, height, numFilters] = config.shape;
        const cubeSize = 0.6;
        const spacing = 0.8;
        const filterSpacing = 2.0;
        
        // Create feature maps
        const featureMaps = [];
        for (let f = 0; f < numFilters; f++) {
            const featureMap = new THREE.Group();
            const mapCubes = [];
            
            for (let i = 0; i < width; i++) {
                mapCubes[i] = [];
                for (let j = 0; j < height; j++) {
                    const cube = new THREE.Mesh(
                        this.geometries.smallCube.clone(),
                        this.materials.convolution.clone()
                    );
                    
                    cube.position.set(
                        (i - width/2) * spacing,
                        (j - height/2) * spacing,
                        0
                    );
                    
                    // Vary color intensity for visual interest
                    const hue = (f / numFilters) * 0.3 + 0.3; // Green range
                    cube.material.color.setHSL(hue, 0.7, 0.5);
                    
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    cube.userData = { type: 'feature', filter: f, i, j };
                    
                    mapCubes[i][j] = cube;
                    featureMap.add(cube);
                }
            }
            
            featureMap.position.z = (f - numFilters/2) * filterSpacing;
            featureMap.userData = { type: 'featureMap', filter: f, cubes: mapCubes };
            featureMaps.push(featureMap);
            group.add(featureMap);
        }
        
        // Add filter visualization containers (will be populated during animation)
        const filterContainer = new THREE.Group();
        filterContainer.name = 'filterContainer';
        group.add(filterContainer);
        
        // Add connection lines to previous layer (placeholder)
        const connectionContainer = new THREE.Group();
        connectionContainer.name = 'connectionContainer';
        group.add(connectionContainer);
        
        group.userData = { 
            type: 'convolution', 
            featureMaps, 
            filterContainer,
            connectionContainer,
            config 
        };
        
        return group;
    }
    
    /**
     * Create a pooling layer with downsampling visualization
     */
    createPoolingLayer(config) {
        const group = new THREE.Group();
        const [width, height, depth] = config.shape;
        const cubeSize = 0.7;
        const spacing = 1.2;
        const layerSpacing = 2.0;
        
        // Create pooled feature maps
        const pooledMaps = [];
        for (let d = 0; d < depth; d++) {
            const pooledMap = new THREE.Group();
            const mapCubes = [];
            
            for (let i = 0; i < width; i++) {
                mapCubes[i] = [];
                for (let j = 0; j < height; j++) {
                    const cube = new THREE.Mesh(
                        this.geometries.cube.clone(),
                        this.materials.pooling.clone()
                    );
                    
                    cube.position.set(
                        (i - width/2) * spacing,
                        (j - height/2) * spacing,
                        0
                    );
                    
                    // Color variation for depth
                    const intensity = 0.5 + (d / depth) * 0.5;
                    cube.material.color.setRGB(1, 0.6 * intensity, 0);
                    
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    cube.userData = { type: 'pooled', depth: d, i, j };
                    
                    mapCubes[i][j] = cube;
                    pooledMap.add(cube);
                }
            }
            
            pooledMap.position.z = (d - depth/2) * layerSpacing;
            pooledMap.userData = { type: 'pooledMap', depth: d, cubes: mapCubes };
            pooledMaps.push(pooledMap);
            group.add(pooledMap);
        }
        
        // Add pooling window visualization containers
        const poolingContainer = new THREE.Group();
        poolingContainer.name = 'poolingContainer';
        group.add(poolingContainer);
        
        group.userData = { 
            type: 'pooling', 
            pooledMaps, 
            poolingContainer,
            config 
        };
        
        return group;
    }
    
    /**
     * Create a flatten layer that transforms 2D to 1D
     */
    createFlattenLayer(config) {
        const group = new THREE.Group();
        const [size] = config.shape;
        const sphereRadius = 0.3;
        const spacing = 0.8;
        
        // Calculate arrangement (try to make it somewhat 2D initially)
        const cols = Math.ceil(Math.sqrt(size));
        const rows = Math.ceil(size / cols);
        
        const neurons = [];
        for (let i = 0; i < size; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            const sphere = new THREE.Mesh(
                this.geometries.sphere.clone(),
                this.materials.flatten.clone()
            );
            
            sphere.position.set(
                (col - cols/2) * spacing,
                (row - rows/2) * spacing,
                0
            );
            
            // Color gradient
            const progress = i / size;
            sphere.material.color.setHSL(0.8, 0.7, 0.3 + progress * 0.4);
            
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            sphere.userData = { type: 'neuron', index: i };
            
            neurons.push(sphere);
            group.add(sphere);
        }
        
        // Add transformation effect container
        const transformContainer = new THREE.Group();
        transformContainer.name = 'transformContainer';
        group.add(transformContainer);
        
        group.userData = { 
            type: 'flatten', 
            neurons,
            transformContainer,
            config 
        };
        
        return group;
    }
    
    /**
     * Create a dense (fully connected) layer
     */
    createDenseLayer(config) {
        const group = new THREE.Group();
        const [size] = config.shape;
        const sphereRadius = 0.4;
        
        // Arrange neurons in a circle
        const radius = Math.max(5, size * 0.5);
        const neurons = [];
        
        for (let i = 0; i < size; i++) {
            const angle = (i / size) * Math.PI * 2;
            
            const sphere = new THREE.Mesh(
                this.geometries.largeSphere.clone(),
                this.materials.dense.clone()
            );
            
            sphere.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );
            
            // Color based on position
            const hue = (i / size) * 0.1 + 0.1; // Orange range
            sphere.material.color.setHSL(hue, 0.8, 0.5);
            
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            sphere.userData = { type: 'neuron', index: i };
            
            neurons.push(sphere);
            group.add(sphere);
        }
        
        // Add connection visualization container
        const connectionContainer = new THREE.Group();
        connectionContainer.name = 'connectionContainer';
        group.add(connectionContainer);
        
        group.userData = { 
            type: 'dense', 
            neurons,
            connectionContainer,
            config 
        };
        
        return group;
    }
    
    /**
     * Create an output layer with confidence visualization
     */
    createOutputLayer(config, classNames = null) {
        const group = new THREE.Group();
        const [numClasses] = config.shape;
        const cylinderRadius = 0.5;
        const maxHeight = 4;
        const spacing = 1.8;
        
        const outputs = [];
        const defaultClasses = ['Class 0', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 
                               'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9'];
        
        for (let i = 0; i < numClasses; i++) {
            // Create cylinder for confidence
            const height = maxHeight * (0.2 + Math.random() * 0.8); // Random initial heights
            
            const geometry = new THREE.CylinderGeometry(
                cylinderRadius, 
                cylinderRadius, 
                height, 
                12
            );
            
            const material = this.materials.output.clone();
            
            // Color based on confidence (red to green gradient)
            const confidence = height / maxHeight;
            const hue = confidence * 0.3; // Red (0) to Green (0.3)
            material.color.setHSL(hue, 0.8, 0.5);
            
            const cylinder = new THREE.Mesh(geometry, material);
            cylinder.position.set(
                (i - numClasses/2) * spacing,
                height/2,
                0
            );
            
            cylinder.castShadow = true;
            cylinder.receiveShadow = true;
            cylinder.userData = { 
                type: 'output', 
                class: i, 
                confidence: confidence,
                className: classNames ? classNames[i] : defaultClasses[i]
            };
            
            outputs.push(cylinder);
            group.add(cylinder);
            
            // Add text label (3D text would be complex, using placeholder)
            this.addTextLabel(group, cylinder.position, cylinder.userData.className);
        }
        
        // Add activation effect container
        const activationContainer = new THREE.Group();
        activationContainer.name = 'activationContainer';
        group.add(activationContainer);
        
        group.userData = { 
            type: 'output', 
            outputs,
            activationContainer,
            config 
        };
        
        return group;
    }
    
    /**
     * Add a frame around a layer for visual separation
     */
    addLayerFrame(group, width, height, color) {
        const frameGeometry = new THREE.EdgesGeometry(
            new THREE.PlaneGeometry(width + 1, height + 1)
        );
        const frameMaterial = new THREE.LineBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.5
        });
        
        const frame = new THREE.LineSegments(frameGeometry, frameMaterial);
        frame.position.z = -0.5;
        group.add(frame);
    }
    
    /**
     * Add a simple text label (placeholder - would use TextGeometry in full implementation)
     */
    addTextLabel(group, position, text) {
        // Create a simple colored plane as text placeholder
        const labelGeometry = new THREE.PlaneGeometry(1, 0.3);
        const labelMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(position.x, position.y - 3, position.z);
        label.userData = { type: 'label', text };
        
        group.add(label);
    }
    
    /**
     * Create animated convolution filter
     */
    createConvolutionFilter(filterSize = 3, color = 0xffffff) {
        const filter = new THREE.Group();
        
        // Main filter body
        const filterGeometry = new THREE.BoxGeometry(filterSize, filterSize, 0.3);
        const filterMaterial = this.materials.filter.clone();
        filterMaterial.color.setHex(color);
        
        const filterMesh = new THREE.Mesh(filterGeometry, filterMaterial);
        filter.add(filterMesh);
        
        // Add filter weights visualization (small cubes)
        const weightSize = 0.2;
        const weightSpacing = filterSize / 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const weight = new THREE.Mesh(
                    new THREE.BoxGeometry(weightSize, weightSize, weightSize),
                    new THREE.MeshBasicMaterial({ 
                        color: Math.random() > 0.5 ? 0xff0000 : 0x0000ff 
                    })
                );
                
                weight.position.set(
                    (i - 1) * weightSpacing,
                    (j - 1) * weightSpacing,
                    0.2
                );
                
                filter.add(weight);
            }
        }
        
        filter.userData = { type: 'filter', size: filterSize };
        return filter;
    }
    
    /**
     * Create pooling window visualization
     */
    createPoolingWindow(poolSize = 2, color = 0xffff00) {
        const windowGeometry = new THREE.BoxGeometry(poolSize, poolSize, 0.1);
        const windowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.userData = { type: 'poolingWindow', size: poolSize };
        
        return window;
    }
    
    /**
     * Create connection lines between layers
     */
    createConnections(fromLayer, toLayer, numConnections = 20) {
        const connections = new THREE.Group();
        
        // Get neuron positions from both layers
        const fromNeurons = this.extractNeuronPositions(fromLayer);
        const toNeurons = this.extractNeuronPositions(toLayer);
        
        if (fromNeurons.length === 0 || toNeurons.length === 0) return connections;
        
        // Create random connections
        for (let i = 0; i < numConnections; i++) {
            const fromIndex = Math.floor(Math.random() * fromNeurons.length);
            const toIndex = Math.floor(Math.random() * toNeurons.length);
            
            const fromPos = fromNeurons[fromIndex].clone();
            const toPos = toNeurons[toIndex].clone();
            
            // Convert to world coordinates
            fromLayer.localToWorld(fromPos);
            toLayer.localToWorld(toPos);
            connections.worldToLocal(fromPos);
            connections.worldToLocal(toPos);
            
            const geometry = new THREE.BufferGeometry().setFromPoints([fromPos, toPos]);
            const line = new THREE.Line(geometry, this.materials.connection.clone());
            
            line.userData = { type: 'connection', from: fromIndex, to: toIndex };
            connections.add(line);
        }
        
        connections.userData = { type: 'connections' };
        return connections;
    }
    
    /**
     * Extract neuron positions from a layer
     */
    extractNeuronPositions(layer) {
        const positions = [];
        
        layer.traverse((child) => {
            if (child.userData && (child.userData.type === 'neuron' || 
                                  child.userData.type === 'pixel' ||
                                  child.userData.type === 'feature')) {
                positions.push(child.position.clone());
            }
        });
        
        return positions;
    }
    
    /**
     * Update layer with new data
     */
    updateLayerData(layer, data) {
        const userData = layer.userData;
        
        switch (userData.type) {
            case 'input':
                this.updateInputData(layer, data);
                break;
            case 'convolution':
                this.updateConvolutionData(layer, data);
                break;
            case 'pooling':
                this.updatePoolingData(layer, data);
                break;
            case 'output':
                this.updateOutputData(layer, data);
                break;
        }
    }
    
    /**
     * Update input layer with image data
     */
    updateInputData(layer, imageData) {
        const pixels = layer.userData.pixels;
        if (!pixels || !imageData) return;
        
        let dataIndex = 0;
        for (let i = 0; i < pixels.length; i++) {
            for (let j = 0; j < pixels[i].length; j++) {
                for (let c = 0; c < pixels[i][j].length; c++) {
                    if (dataIndex < imageData.length) {
                        const intensity = imageData[dataIndex] / 255;
                        const pixel = pixels[i][j][c];
                        pixel.material.color.setRGB(intensity, intensity, intensity);
                        pixel.material.opacity = 0.3 + intensity * 0.7;
                        dataIndex++;
                    }
                }
            }
        }
    }
    
    /**
     * Update convolution layer with feature map data
     */
    updateConvolutionData(layer, featureData) {
        const featureMaps = layer.userData.featureMaps;
        if (!featureMaps || !featureData) return;
        
        featureMaps.forEach((map, mapIndex) => {
            if (mapIndex < featureData.length) {
                const mapData = featureData[mapIndex];
                const cubes = map.userData.cubes;
                
                let dataIndex = 0;
                for (let i = 0; i < cubes.length; i++) {
                    for (let j = 0; j < cubes[i].length; j++) {
                        if (dataIndex < mapData.length) {
                            const activation = mapData[dataIndex];
                            const cube = cubes[i][j];
                            
                            // Update color based on activation
                            const intensity = Math.max(0, Math.min(1, activation));
                            cube.material.opacity = 0.3 + intensity * 0.7;
                            
                            // Color from blue (low) to green (high)
                            cube.material.color.setHSL(0.3 + intensity * 0.3, 0.8, 0.5);
                            
                            dataIndex++;
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update pooling layer data
     */
    updatePoolingData(layer, pooledData) {
        const pooledMaps = layer.userData.pooledMaps;
        if (!pooledMaps || !pooledData) return;
        
        pooledMaps.forEach((map, mapIndex) => {
            if (mapIndex < pooledData.length) {
                const mapData = pooledData[mapIndex];
                const cubes = map.userData.cubes;
                
                let dataIndex = 0;
                for (let i = 0; i < cubes.length; i++) {
                    for (let j = 0; j < cubes[i].length; j++) {
                        if (dataIndex < mapData.length) {
                            const value = mapData[dataIndex];
                            const cube = cubes[i][j];
                            
                            // Update based on pooled value
                            const intensity = Math.max(0, Math.min(1, value));
                            cube.material.opacity = 0.4 + intensity * 0.6;
                            cube.scale.setScalar(0.5 + intensity * 0.5);
                            
                            dataIndex++;
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update output layer with prediction probabilities
     */
    updateOutputData(layer, predictions) {
        const outputs = layer.userData.outputs;
        if (!outputs || !predictions) return;
        
        outputs.forEach((cylinder, index) => {
            if (index < predictions.length) {
                const confidence = predictions[index];
                
                // Update height
                const newHeight = 4 * confidence;
                cylinder.scale.y = newHeight / 4;
                cylinder.position.y = newHeight / 2;
                
                // Update color
                const hue = confidence * 0.3; // Red to green
                cylinder.material.color.setHSL(hue, 0.8, 0.5);
                
                // Update opacity
                cylinder.material.opacity = 0.4 + confidence * 0.6;
                
                // Update user data
                cylinder.userData.confidence = confidence;
            }
        });
    }
    
    /**
     * Dispose of all materials and geometries
     */
    dispose() {
        // Dispose materials
        Object.values(this.materials).forEach(material => {
            material.dispose();
        });
        
        // Dispose geometries
        Object.values(this.geometries).forEach(geometry => {
            geometry.dispose();
        });
        
        console.log('LayerComponents disposed');
    }
}
