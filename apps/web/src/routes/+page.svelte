<script lang="ts">
  import MapComponent from "$lib/components/Map.svelte";
  import Dropzone from "$lib/components/Dropzone.svelte";
  import LayerControl from "$lib/components/LayerControl.svelte";
  import { triggerPrintJob } from "$lib/print.remote";
  import type { Map as LeafletMap, GeoJSON as LeafletGeoJSON } from "leaflet";
  import { browser } from "$app/environment";

  let map: LeafletMap | undefined = $state(undefined);
  let layers = $state<any[]>([]);
  let leafletLayers = $state<Map<string, LeafletGeoJSON>>(new Map());

  function onMapReady(m: LeafletMap) {
    map = m;
  }

  async function handleDrop(files: FileList) {
    if (!browser) return;

    for (const file of files) {
      try {
        let geojson;
        const buffer = await file.arrayBuffer();
        
        if (file.name.endsWith(".zip")) {
          const shp = await import("shpjs");
          geojson = await shp.parseZip(buffer);
        } else if (file.name.endsWith(".json") || file.name.endsWith(".geojson")) {
          const text = await file.text();
          geojson = JSON.parse(text);
        }

        if (geojson) {
            addLayer(file.name, geojson);
        }
      } catch (e) {
        console.error("Failed to parse file", file.name, e);
        alert(`Failed to parse ${file.name}`);
      }
    }
  }

  async function addLayer(name: string, geojson: any) {
    if (!map) return;
    
    // Dynamic import leaflet to avoid SSR issues
    const L = await import("leaflet");
    
    const id = crypto.randomUUID();
    const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    const layer = L.geoJSON(geojson, {
        style: { color, weight: 2, fillOpacity: 0.2 }
    }).addTo(map);
    
    leafletLayers.set(id, layer);
    map.fitBounds(layer.getBounds());
    
    layers.push({
        id,
        name,
        visible: true,
        geojson,
        isPrinting: false
    });
  }

  function toggleLayer(id: string) {
    const layer = leafletLayers.get(id);
    const layerState = layers.find(l => l.id === id);
    if (layer && layerState && map) {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            layerState.visible = false;
        } else {
            map.addLayer(layer);
            layerState.visible = true;
        }
    }
  }

  async function handlePrint(id: string) {
    const layerState = layers.find(l => l.id === id);
    if (!layerState) return;

    layerState.isPrinting = true;
    try {
        const result = await triggerPrintJob({
          geojson: layerState.geojson,
          outputFilename: `map-${id}-${Date.now()}.pdf`
        });
        if (result.success) {
            alert(`Job started! Handle ID: ${result.handleId}`);
        } else {
            alert(`Failed to start job: ${result.error}`);
        }
    } catch (e) {
        console.error(e);
        alert("Error triggering job");
    } finally {
        layerState.isPrinting = false;
    }
  }
</script>

<div class="h-screen w-screen relative overflow-hidden">
  <MapComponent {onMapReady} />
  <Dropzone onDrop={handleDrop} />
  <LayerControl 
    {layers} 
    onToggle={toggleLayer} 
    onPrint={handlePrint} 
  />
</div>
