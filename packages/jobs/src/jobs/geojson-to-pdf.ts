import { task } from "@trigger.dev/sdk";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

// Define the input schema
const GeoJSONPayload = z.object({
  geojson: z.any(), // We can refine this later or use a GeoJSON type
  outputFilename: z.string().optional().default("output.pdf"),
});

export const geojsonToPdfTask = task({
  id: "geojson-to-pdf",
  maxDuration: 2 * 60 * 1000, // 2 minutes
  run: async (payload: z.infer<typeof GeoJSONPayload>) => {
    // Dynamic import to avoid bundling issues with native module
    const gdal = await import("gdal-async");
    
    const { geojson, outputFilename } = payload;
    
    // Create a temporary directory for processing
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "geojson-pdf-"));
    const inputPath = path.join(tmpDir, "input.json");
    const outputPath = path.join(tmpDir, outputFilename);

    let ds: any = null;
    let pdfDs: any = null;

    try {
      // Write GeoJSON to file
      await fs.writeFile(inputPath, JSON.stringify(geojson));

      // Open the GeoJSON dataset (vector data)
      ds = gdal.default.open(inputPath);
      
      if (!ds) {
        throw new Error("Failed to open GeoJSON dataset");
      }
      
      // List available drivers for debugging
      const availableDrivers: string[] = [];
      try {
        for (let i = 0; i < gdal.default.drivers.count(); i++) {
          const driver = gdal.default.drivers.get(i);
          if (driver) {
            availableDrivers.push(driver.description);
          }
        }
      } catch (e) {
        console.error("Error listing drivers:", e);
      }
      
      // Check if PDF driver is available
      // Note: PDF driver requires additional GDAL plugins and may not be available in all installations
      const hasPdfDriver = availableDrivers.some(d => d.toLowerCase().includes("pdf"));
      
      if (!hasPdfDriver) {
        // PDF driver not available - use alternative approach
        // For now, we'll convert to GeoTIFF and note that PDF requires additional setup
        // In production (Trigger.dev Linux), PDF driver should be available with libgdal-dev
        throw new Error(
          `PDF driver not available in this GDAL installation. ` +
          `The PDF driver requires additional GDAL plugins. ` +
          `For local Windows development, you may need to install GDAL with PDF support. ` +
          `Production deployments on Trigger.dev should have PDF support via libgdal-dev. ` +
          `Available drivers: ${availableDrivers.slice(0, 20).join(", ")}...`
        );
      }
      
      // Get the PDF driver for vector output
      let pdfDriver: any = null;
      try {
        pdfDriver = gdal.default.drivers.get("PDF");
      } catch (driverError: any) {
        const driverErrorMsg = driverError?.message || driverError?.toString() || String(driverError);
        const lastError = (gdal.default as any).lastError?.message || (gdal.default as any).lastError || "Unknown GDAL error";
        throw new Error(`Failed to get PDF driver: ${driverErrorMsg}. GDAL last error: ${lastError}`);
      }
      
      if (!pdfDriver) {
        throw new Error(`PDF driver not found in GDAL installation`);
      }

      // Use GDAL's vector translate to convert GeoJSON to PDF
      // The PDF driver supports vector output when created with proper options
      // We'll create the output dataset and copy the layer
      try {
        const options = ["LAYER_CREATION=YES", "GEOREF=YES"];
        pdfDs = pdfDriver.create(outputPath, 0, 0, 0, gdal.default.GDT_Unknown, options);
        
        if (!pdfDs) {
          const lastError = (gdal.default as any).lastError?.message || (gdal.default as any).lastError || "Unknown GDAL error";
          throw new Error(`Failed to create PDF dataset. GDAL error: ${lastError}`);
        }
      } catch (createError: any) {
        const lastError = (gdal.default as any).lastError?.message || (gdal.default as any).lastError || "Unknown GDAL error";
        const createErrorMsg = createError?.message || createError?.toString() || String(createError);
        throw new Error(`Failed to create PDF dataset: ${createErrorMsg}. GDAL last error: ${lastError}`);
      }
      
      // Copy layers from input to output
      try {
        for (let i = 0; i < ds.layers.count(); i++) {
          const srcLayer = ds.layers.get(i);
          if (!srcLayer) {
            console.warn(`Source layer ${i} is null, skipping`);
            continue;
          }
          
          const dstLayer = pdfDs.layers.create(srcLayer.name, srcLayer.srs);
          if (!dstLayer) {
            throw new Error(`Failed to create destination layer: ${srcLayer.name}`);
          }
          
          // Copy all features from source to destination
          srcLayer.features.forEach((feature: any) => {
            if (feature) {
              dstLayer.features.add(feature);
            }
          });
        }
      } catch (layerError: any) {
        const lastError = (gdal.default as any).lastError?.message || (gdal.default as any).lastError || "Unknown GDAL error";
        const layerErrorMsg = layerError?.message || layerError?.toString() || String(layerError);
        throw new Error(`Failed to copy layers: ${layerErrorMsg}. GDAL last error: ${lastError}`);
      }
      
      // Close datasets to flush changes
      pdfDs.close();
      pdfDs = null;
      ds.close();
      ds = null;

      // Read the generated PDF
      const pdfBuffer = await fs.readFile(outputPath);
      
      // In a real scenario, you'd upload this buffer to S3 or similar and return a URL.
      // For now, we'll return a base64 string or just success message.
      
      return {
        status: "success",
        message: `PDF created with size: ${pdfBuffer.length} bytes`,
        // returning base64 for simple demo purposes (careful with large files)
        // pdfBase64: pdfBuffer.toString("base64"), 
      };

    } catch (error) {
      console.error("GDAL processing error:", error);
      console.error("Error type:", typeof error);
      console.error("Error keys:", error && typeof error === 'object' ? Object.keys(error) : 'N/A');
      console.error("Error stringified:", JSON.stringify(error, null, 2));
      
      const errorMessage = error instanceof Error 
        ? error.message || error.toString() 
        : (typeof error === 'string' ? error : JSON.stringify(error));
      const errorStack = error instanceof Error ? error.stack : undefined;
      throw new Error(`GDAL processing failed: ${errorMessage}${errorStack ? `\n${errorStack}` : ""}`);
    } finally {
      // Ensure datasets are closed before cleanup
      try {
        if (pdfDs) {
          pdfDs.close();
        }
        if (ds) {
          ds.close();
        }
      } catch (e) {
        console.error("Error closing datasets:", e);
      }
      
      // Cleanup temp files - wait a bit to ensure files are released
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        await fs.rm(tmpDir, { recursive: true, force: true });
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    }
  },
});

