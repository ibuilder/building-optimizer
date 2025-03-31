// Map module for handling Google Maps integration
const MapModule = (function() {
    // Private variables
    let map;
    let geocoder;
    let markers = [];
    
    // Initialize map
    function initMap(location) {
        const mapOptions = {
            zoom: 14,
            center: location,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        return map;
    }
    
    // Initialize geocoder
    function initGeocoder() {
        geocoder = new google.maps.Geocoder();
        return geocoder;
    }
    
    // Add marker to the map
    function addMarker(location, index, clickCallback) {
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            label: (index + 1).toString()
        });
        
        if (clickCallback) {
            marker.addListener('click', () => clickCallback(index));
        }
        
        markers.push(marker);
        return marker;
    }
    
    // Clear all markers from the map
    function clearMarkers() {
        markers.forEach(marker => marker.setMap(null));
        markers = [];
    }
    
    // Geocode an address
    function geocodeAddress(address, callback) {
        if (!geocoder) {
            initGeocoder();
        }
        
        geocoder.geocode({ 'address': address }, callback);
    }
    
    // Public API
    return {
        initMap,
        initGeocoder,
        addMarker,
        clearMarkers,
        geocodeAddress,
        getGeocoder: function() { return geocoder; }
    };
})();

// Export for use in app.js
window.MapModule = MapModule;