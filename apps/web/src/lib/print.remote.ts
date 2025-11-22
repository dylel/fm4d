import { geojsonToPdfTask } from "@repo/jobs/src/jobs/geojson-to-pdf";
import { tasks } from "@trigger.dev/sdk";
import { command } from "$app/server";
import { z } from "zod";

const geojsonSchema = z.any(); // You can refine this with a proper GeoJSON schema later

export const triggerPrintJob = command(
  z.object({
    geojson: geojsonSchema,
    outputFilename: z.string().optional(),
  }),
  async ({ geojson, outputFilename }) => {
    try {
      const handle = await tasks.trigger<typeof geojsonToPdfTask>("geojson-to-pdf", {
        geojson: geojson,
        outputFilename: outputFilename || `map-${Date.now()}.pdf`,
      });

      return {
        success: true,
        handleId: handle.id,
      };
    } catch (error) {
      console.error("Failed to trigger job:", error);
      return {
        success: false,
        error: "Failed to trigger print job",
      };
    }
  }
);

