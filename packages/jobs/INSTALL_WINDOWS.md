# After installing GDAL via OSGeo4W, run these commands:

# 1. Add OSGeo4W to PATH (adjust path if different)
# Add C:\OSGeo4W64\bin to your system PATH environment variable

# 2. Set GDAL_DATA environment variable (adjust path if different)  
# Set GDAL_DATA=C:\OSGeo4W64\share\gdal

# 3. Rebuild gdal-async
pnpm rebuild gdal-async --filter @repo/jobs

# 4. Verify installation
pnpm exec --filter @repo/jobs -- node -e "require('gdal-async'); console.log('GDAL loaded successfully!')"

