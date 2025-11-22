# @repo/jobs

This package contains background jobs powered by [Trigger.dev](https://trigger.dev).

## Setup

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Trigger.dev**:
   - Login to Trigger.dev CLI:
     ```bash
     npx trigger.dev login
     ```
   - Update `trigger.config.ts` with your Project ID.

3. **Run Dev Server**:
   ```bash
   pnpm dev
   ```

4. **Deploy to Production**:
   ```bash
   # Make sure you're logged in
   npx trigger.dev login
   
   # Deploy your jobs
   pnpm deploy
   ```
   
   **Note**: Ensure your `.env` file has `TRIGGER_PROJECT_ID` set to your production project ID.

## Jobs

### `geojson-to-pdf`

Converts a GeoJSON input into a georeferenced PDF using `node-gdal-async`.

- **Input**: `{ geojson: any, outputFilename?: string }`
- **System Dependencies**: Requires `libgdal-dev` (configured via build extension).

## Deployment

To deploy your jobs to Trigger.dev production:

1. **Ensure you're logged in**:
   ```bash
   npx trigger.dev login
   ```

2. **Set environment variables** in your `.env` file:
   - `TRIGGER_PROJECT_ID` - Your production project ID from Trigger.dev dashboard
   - `TRIGGER_SECRET_KEY` - Your production secret key from Trigger.dev dashboard

3. **Deploy**:
   ```bash
   pnpm deploy
   ```

   This will build and upload your jobs to Trigger.dev's cloud infrastructure.

4. **Verify deployment**: Check your Trigger.dev dashboard to see your deployed jobs.

## Development

- **Testing**: You can trigger the job manually via the Trigger.dev dashboard or CLI using the test payload feature.

### Windows Development Note

`gdal-async` requires native bindings and GDAL system libraries. On Windows, see [INSTALL_WINDOWS.md](./INSTALL_WINDOWS.md) for detailed installation instructions.

**Quick steps:**
1. Install GDAL via [OSGeo4W](https://trac.osgeo.org/osgeo4w/) (recommended)
2. Add OSGeo4W `bin` directory to your system PATH
3. Set `GDAL_DATA` environment variable to OSGeo4W `share\gdal` directory
4. Rebuild: `pnpm rebuild gdal-async --filter @repo/jobs`

**Note**: Production deployments on Trigger.dev will work correctly as they run on Linux where `libgdal-dev` is automatically installed via the build extension.

