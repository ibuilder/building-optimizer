// 3D model module for handling Three.js integration
const ModelModule = (function() {
    // Private variables
    let scene, camera, renderer, controls;
    let building;
    
    // Initialize Three.js scene
    function initScene(container) {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        
        // Create camera
        camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(50, 50, 50);
        camera.lookAt(0, 0, 0);
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        
        // Remove any existing canvas
        while (container.firstChild) {
            if (container.firstChild.id !== 'loading-indicator') {
                container.removeChild(container.firstChild);
            }
        }
        
        // Add renderer to container
        container.appendChild(renderer.domElement);
        
        // Add controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        
        // Handle window resize
        window.addEventListener('resize', function() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
        
        // Start animation loop
        animate();
        
        return { scene, camera, renderer, controls };
    }
    
    // Add lights to the scene
    function addLights(scene) {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        scene.add(directionalLight);
    }
    
    // Add ground to the scene
    function addGround(scene, lotSizeInSqMeters) {
        // Calculate ground size based on lot size
        const lotSideLength = Math.sqrt(lotSizeInSqMeters);
        const groundSize = lotSideLength * 1.5; // Make ground larger than lot
        
        // Create ground geometry
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x7ec850,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        scene.add(ground);
        
        // Add lot outline
        const lotGeometry = new THREE.PlaneGeometry(lotSideLength, lotSideLength);
        const lotMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffcc00,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const lot = new THREE.Mesh(lotGeometry, lotMaterial);
        lot.rotation.x = -Math.PI / 2;
        lot.position.y = 0;
        scene.add(lot);
        
        // Add grid
        const gridHelper = new THREE.GridHelper(groundSize, 20);
        gridHelper.position.y = 0;
        scene.add(gridHelper);
        
        return { ground, lot, gridHelper };
    }
    
    // Add windows to a floor
    function addWindows(floor, floorSideLength, floorIndex) {
        const windowSize = 1;
        const windowSpacing = 3;
        const windowsPerSide = Math.floor(floorSideLength / windowSpacing);
        const windowOffset = (floorSideLength - ((windowsPerSide - 1) * windowSpacing)) / 2;
        
        // Window material
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0xadd8e6,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.7
        });
        
        // Create windows on each side of the building
        for (let i = 0; i < windowsPerSide; i++) {
            for (let side = 0; side < 4; side++) {
                const windowGeometry = new THREE.BoxGeometry(
                    side % 2 === 0 ? windowSize : floorSideLength * 0.8,
                    windowSize,
                    side % 2 === 0 ? floorSideLength * 0.8 : windowSize
                );
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                
                // Position window based on side
                switch (side) {
                    case 0: // Front
                        window.position.set(
                            -windowOffset + (i * windowSpacing),
                            0,
                            floorSideLength / 2 + 0.1
                        );
                        break;
                    case 1: // Right
                        window.position.set(
                            floorSideLength / 2 + 0.1,
                            0,
                            -windowOffset + (i * windowSpacing)
                        );
                        break;
                    case 2: // Back
                        window.position.set(
                            -windowOffset + (i * windowSpacing),
                            0,
                            -floorSideLength / 2 - 0.1
                        );
                        break;
                    case 3: // Left
                        window.position.set(
                            -floorSideLength / 2 - 0.1,
                            0,
                            -windowOffset + (i * windowSpacing)
                        );
                        break;
                }
                
                floor.add(window);
            }
        }
    }
    
    // Generate building based on parameters
    function generateBuilding(scene, lotSizeInSqMeters, floorAreaRatio, numFloors) {
        // Remove existing building if it exists
        if (building) {
            scene.remove(building);
        }
        
        // Calculate building dimensions
        const lotSideLength = Math.sqrt(lotSizeInSqMeters);
        const totalBuildingArea = lotSizeInSqMeters * floorAreaRatio;
        const floorArea = totalBuildingArea / numFloors;
        const buildingSideLength = Math.sqrt(floorArea);
        
        // Create building
        building = new THREE.Group();
        
        // Add floors
        for (let i = 0; i < numFloors; i++) {
            // Slightly reduce each floor's size as we go up for a more interesting look
            const scaleFactor = 1 - (i * 0.05);
            const floorSideLength = buildingSideLength * scaleFactor;
            
            // Create floor
            const floorGeometry = new THREE.BoxGeometry(
                floorSideLength,
                2, // Floor height
                floorSideLength
            );
            const floorMaterial = new THREE.MeshStandardMaterial({
                color: 0x4287f5,
                roughness: 0.7,
                metalness: 0.2
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.y = i * 4; // 4 units between floors
            floor.castShadow = true;
            floor.receiveShadow = true;
            
            // Add windows for each floor
            addWindows(floor, floorSideLength, i);
            
            building.add(floor);
        }
        
        // Position building at center of lot
        building.position.set(0, 1, 0);
        
        // Add building to scene
        scene.add(building);
        
        return building;
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        if (controls) {
            controls.update();
        }
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    
    // Clean up resources
    function dispose() {
        if (renderer) {
            renderer.dispose();
        }
        if (controls) {
            controls.dispose();
        }
    }
    
    // Public API
    return {
        initScene,
        addLights,
        addGround,
        generateBuilding,
        dispose
    };
})();

// Export for use in app.js
window.ModelModule = ModelModule;