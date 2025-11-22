<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import type { Map as LeafletMap } from "leaflet";
  import { cn } from "$lib/utils";

  interface Props {
    class?: string;
    onMapReady?: (map: LeafletMap) => void;
  }

  let { class: className, onMapReady }: Props = $props();
  let mapElement: HTMLDivElement;
  let map: LeafletMap | undefined;

  onMount(async () => {
    if (browser) {
      // Import CSS only on client side
      await import("leaflet/dist/leaflet.css");
      const L = await import("leaflet");

      // Fix default icon path issues
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      map = L.map(mapElement).setView([51.505, -0.09], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      onMapReady?.(map);
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
</script>

<div bind:this={mapElement} class={cn("h-full w-full z-0", className)}></div>

