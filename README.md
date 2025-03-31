# Building Optimizer

A web application that allows users to select an address via Google Maps API, verify it, and then generates an optimized 3D building model based on floor-to-area ratio parameters.

## Features

- **Address Input and Verification**
  - User-friendly form for entering address details
  - Integration with Google Maps API for geocoding and address verification
  - Interactive map with selectable address options

- **3D Building Visualization**
  - Dynamic building generation based on lot size and floor area ratio
  - Interactive 3D model using Three.js
  - Adjustable building parameters (floor area ratio, number of floors)
  - Realistic visualization with floors, windows, and lot boundaries

## Project Structure

```
building-optimizer/
│
├── index.html               # Main HTML page
├── css/
│   └── styles.css           # Custom CSS styles
├── js/
│   ├── app.js               # Main application logic
│   ├── map.js               # Google Maps integration module
│   └── model.js             # Three.js 3D model module
└── README.md                # Project documentation
```

## Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/building-optimizer.git
   cd building-optimizer
   ```

2. **Google Maps API Key**
   - Create a Google Cloud Platform account if you don't have one
   - Create a new project and enable the following APIs:
     - Maps JavaScript API
     - Geocoding API
   - Create an API key with appropriate restrictions
   - Replace `YOUR_API_KEY` in the `index.html` file with your actual API key

3. **Run the application**
   - Open `index.html` in a web browser, or
   - Use a local development server:
     ```
     # If you have Python installed
     python -m http.server
     
     # If you have Node.js installed
     npx http-server
     ```

## How to Use

1. **Enter Address**
   - Fill out the address form with street address, city, state, ZIP/postal code, and country
   - Click "Find Address" to search for the location

2. **Verify Address**
   - Select the correct address from the options presented
   - The map will display markers for each option
   - Click "Proceed" after selecting an address

3. **View and Adjust Building Model**
   - The application will generate a 3D building model optimized for the selected location
   - Adjust the Floor Area Ratio (FAR) and number of floors using the controls
   - Click "Update Model" to regenerate the building with new parameters
   - Use mouse controls to rotate, zoom, and pan the 3D view

## Technologies Used

- **Frontend**
  - HTML5, CSS3, JavaScript (ES6)
  - Bootstrap 5 for responsive design

- **APIs and Libraries**
  - Google Maps API for geocoding and mapping
  - Three.js for 3D rendering
  - OrbitControls for camera manipulation

## Browser Compatibility

The application works best in modern browsers that support WebGL, including:
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Safari (latest)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Google Maps Platform for geocoding and mapping capabilities
- Three.js community for 3D rendering capabilities
- Bootstrap team for responsive UI components