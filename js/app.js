// Main application script
(function() {
    // Global variables
    let selectedAddress = null;
    let selectedLocation = null;
    let lotSizeInSqMeters = 500; // Default lot size
    let scene, camera, renderer, controls, building;
    
    // DOM elements
    const step1Container = document.getElementById('step-1');
    const step2Container = document.getElementById('step-2');
    const step3Container = document.getElementById('step-3');
    const progressBar = document.getElementById('progress-bar');
    const addressForm = document.getElementById('address-form');
    const addressOptions = document.getElementById('address-options');
    const backToStep1Button = document.getElementById('back-to-step-1');
    const proceedToStep3Button = document.getElementById('proceed-to-step-3');
    const backToStep2Button = document.getElementById('back-to-step-2');
    const resetButton = document.getElementById('reset');
    const selectedAddressElement = document.getElementById('selected-address');
    const lotSizeElement = document.getElementById('lot-size');
    const buildingParamsForm = document.getElementById('building-params-form');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Initialize when the page loads
    document.addEventListener('DOMContentLoaded', initialize);
    
    function initialize() {
        // Set up event listeners
        addressForm.addEventListener('submit', handleAddressSubmit);
        backToStep1Button.addEventListener('click', goToStep1);
        proceedToStep3Button.addEventListener('click', goToStep3);
        backToStep2Button.addEventListener('click', goToStep2);
        resetButton.addEventListener('click', resetApp);
        buildingParamsForm.addEventListener('submit', updateBuildingModel);
        
        // Initialize geocoder
        MapModule.initGeocoder();
    }
    
    // Handle address form submission
    function handleAddressSubmit(event) {
        event.preventDefault();
        
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const zip = document.getElementById('zip').value;
        const country = document.getElementById('country').value;
        
        const fullAddress = `${address}, ${city}, ${state} ${zip}, ${country}`;
        
        // Use Google Geocoder to find address options
        MapModule.geocodeAddress(fullAddress, (results, status) => {
            if (status === 'OK') {
                if (results.length > 0) {
                    // Clear previous options
                    addressOptions.innerHTML = '';
                    MapModule.clearMarkers();
                    
                    // Initialize map if not already done
                    MapModule.initMap(results[0].geometry.location);
                    
                    // Display address options
                    results.forEach((result, index) => {
                        addAddressOption(result, index);
                        MapModule.addMarker(result.geometry.location, index, (idx) => {
                            const result = document.querySelector(`.address-card[data-index="${idx}"]`).parentElement;
                            result.scrollIntoView({ behavior: 'smooth' });
                            selectAddress(null, idx);
                        });
                    });
                    
                    // Go to step 2
                    goToStep2();
                } else {
                    alert('No address found. Please try again.');
                }
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }
    
    // Add address option to the list
    function addAddressOption(result, index) {
        const addressCard = document.createElement('div');
        addressCard.className = 'col-md-6 mb-3';
        addressCard.innerHTML = `
            <div class="card address-card" data-index="${index}">
                <div class="card-body">
                    <h5 class="card-title">Option ${index + 1}</h5>
                    <p class="card-text">${result.formatted_address}</p>
                </div>
            </div>
        `;
        
        addressCard.querySelector('.address-card').addEventListener('click', () => {
            selectAddress(result, index);
        });
        
        addressOptions.appendChild(addressCard);
    }
    
    // Select an address
    function selectAddress(result, index) {
        // Remove selection from all cards
        document.querySelectorAll('.address-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to the clicked card
        document.querySelector(`.address-card[data-index="${index}"]`).classList.add('selected');
        
        // Get result if not provided (when clicked from marker)
        if (!result) {
            const address = document.querySelector(`.address-card[data-index="${index}"]`).querySelector('.card-text').textContent;
            MapModule.getGeocoder().geocode({ 'address': address }, (results, status) => {
                if (status === 'OK') {
                    result = results[0];
                    setSelectedAddress(result);
                }
            });
        } else {
            setSelectedAddress(result);
        }
        
        // Enable proceed button
        proceedToStep3Button.disabled = false;
    }
    
    // Set selected address
    function setSelectedAddress(result) {
        selectedAddress = result.formatted_address;
        selectedLocation = result.geometry.location;
        
        // Estimate lot size based on location (in a real app, you'd use real data)
        // For demo purposes, we'll generate a random size between 200 and 2000 sq meters
        lotSizeInSqMeters = Math.floor(Math.random() * 1800) + 200;
        
        // Update the display
        selectedAddressElement.textContent = selectedAddress;
        lotSizeElement.textContent = `${lotSizeInSqMeters} sq meters`;
    }
    
    // Go to step 1
    function goToStep1() {
        step1Container.classList.add('active');
        step2Container.classList.remove('active');
        step3Container.classList.remove('active');
        progressBar.style.width = '33%';
        progressBar.textContent = 'Step 1 of 3';
        progressBar.setAttribute('aria-valuenow', '33');
    }
    
    // Go to step 2
    function goToStep2() {
        step1Container.classList.remove('active');
        step2Container.classList.add('active');
        step3Container.classList.remove('active');
        progressBar.style.width = '66%';
        progressBar.textContent = 'Step 2 of 3';
        progressBar.setAttribute('aria-valuenow', '66');
    }
    
    // Go to step 3
    function goToStep3() {
        step1Container.classList.remove('active');
        step2Container.classList.remove('active');
        step3Container.classList.add('active');
        progressBar.style.width = '100%';
        progressBar.textContent = 'Step 3 of 3';
        progressBar.setAttribute('aria-valuenow', '100');
        
        // Initialize 3D model
        initModel();
    }
    
    // Initialize 3D model
    function initModel() {
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        
        // Get model viewer element
        const container = document.getElementById('model-viewer');
        
        // Initialize Three.js scene
        const threeElements = ModelModule.initScene(container);
        scene = threeElements.scene;
        camera = threeElements.camera;
        renderer = threeElements.renderer;
        controls = threeElements.controls;
        
        // Add lights
        ModelModule.addLights(scene);
        
        // Add ground
        ModelModule.addGround(scene, lotSizeInSqMeters);
        
        // Generate building
        const floorAreaRatio = parseFloat(document.getElementById('floor-area-ratio').value);
        const numFloors = parseInt(document.getElementById('num-floors').value);
        building = ModelModule.generateBuilding(scene, lotSizeInSqMeters, floorAreaRatio, numFloors);
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
    }
    
    // Reset the application
    function resetApp() {
        // Clear form fields
        addressForm.reset();
        
        // Clear selections
        selectedAddress = null;
        selectedLocation = null;
        
        // Go back to step 1
        goToStep1();
        
        // Clean up 3D resources
        ModelModule.dispose();
    }
    
    // Update building model when parameters change
    function updateBuildingModel(event) {
        event.preventDefault();
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        
        // Generate new building with updated parameters
        setTimeout(() => {
            const floorAreaRatio = parseFloat(document.getElementById('floor-area-ratio').value);
            const numFloors = parseInt(document.getElementById('num-floors').value);
            building = ModelModule.generateBuilding(scene, lotSizeInSqMeters, floorAreaRatio, numFloors);
            
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
        }, 100); // Short timeout to allow loading indicator to appear
    }
})();