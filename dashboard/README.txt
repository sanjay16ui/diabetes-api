# Diabetes Prediction Dashboard

This is a modern, responsive frontend dashboard designed to work with a backend fastAPI diabetes prediction model. 

## Structure
- `index.html`: Main layout featuring a beautiful glassmorphism dark theme. Contains input forms and placeholders for the charts.
- `style.css`: All the styling including dark mode color variables, gradients, responsive designs, animations, and hover effects.
- `script.js`: Core logic using `Papa.parse` to parse the CSV dataset, and `Chart.js` to render histograms, scatter plots, and pie charts dynamically. The script handles POST requests securely and applies a CORS-bypass relay if required.
- `dataset.csv`: Data source to initially render the charts representing data.

## Dynamic Chart Engine
This dashboard is highly reactive. It does not blindly overwrite data. When a user submits a valid prediction form:
1. **Histogram Shift:** The line distribution chart immediately injects the tested Glucose, BMI, and Age values to the end of the array (labeled as `Session Output X`), allowing the user to compare their test to the historical distribution.
2. **Scatter Instantiation:** The backend outcome establishes a 3rd distinct dataset "Your Live Predictions". This renders the coordinate directly onto the map with a glowing visual, a uniquely structured tooltip identifying it as a user-submission, and the exact model outcome assigned contextually.
3. **Pie Interpolation:** The pie count aggregates the new prediction into the historical outcomes integer tracking.
4. **Resiliency:** The DOM stays locked, and page layout is unaffected. If an API request cascades through both standard and proxy retries without success, the charts simply wait rather than breaking.

## Running Locally
1. Navigate to the `dashboard` directory: `cd "C:\Users\S. SANJAYKUMAR\Desktop\diabetes-api\dashboard"`
2. Since it relies on fetching local CSV files, running it via a local server is required.
   Using Python 3, run:
   ```bash
   python -m http.server 8000
   ```
3. Open a browser and navigate to `http://localhost:8000/`

## Production Deployment
The application files (`index.html`, `style.css`, `script.js`, `dataset.csv`) can be hosted on any static hosting environment completely as-is. 
