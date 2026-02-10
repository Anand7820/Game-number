# Number Counting Web-App

Full-stack web app to count number frequencies from text or images.

## Folder Structure

```
client/
  src/
    App.jsx
    main.jsx
    index.css
  index.html
  package.json
  tailwind.config.js
  postcss.config.js
  vite.config.js
server/
  package.json
  server.js
```

## Local Development

1. Install backend dependencies:
   ```
   cd server
   npm install
   ```

2. Install frontend dependencies:
   ```
   cd ../client
   npm install
   ```

3. Start the backend:
   ```
   cd ../server
   npm run dev
   ```

4. Start the frontend:
   ```
   cd ../client
   npm run dev
   ```

5. Open in browser:
   ```
   http://localhost:5173
   ```

## Production Build

1. Build the frontend:
   ```
   cd client
   npm run build
   ```

2. Start the backend (serves the built frontend):
   ```
   cd ../server
   npm start
   ```

3. Open in browser:
   ```
   http://localhost:3000
   ```

## Deployment (Docker)

1. Build the image:
   ```
   docker build -t number-counting-web-app .
   ```

2. Run the container:
   ```
   docker run -p 3000:3000 number-counting-web-app
   ```

## API Endpoints

- `POST /count-text`
  - Body: `{ "text": "1, 2, 2 45 1" }`
  - Response: `{ "counts": { "1": 2, "2": 2, "45": 1 }, "totalNumbers": 5 }`

- `POST /count-image`
  - Form-data: `image` (JPG/PNG)
  - Response: `{ "counts": { "1": 2, "2": 2, "45": 1 }, "totalNumbers": 5 }`

## Notes

- Uploaded images are stored in memory only and discarded after processing.
- OCR uses Tesseract.js with digit-only recognition.
