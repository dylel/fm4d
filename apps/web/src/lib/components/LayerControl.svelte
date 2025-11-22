<script lang="ts">
  import { cn } from "$lib/utils";
  import { Layers, Printer, Loader2 } from "lucide-svelte";
  
  // Mocking shadcn components for now to speed up without full CLI
  // In a real setup we'd use the properly installed ones
  
  interface Layer {
    id: string;
    name: string;
    visible: boolean;
    isPrinting?: boolean;
  }

  interface Props {
    layers: Layer[];
    onToggle: (id: string) => void;
    onPrint: (id: string) => void;
    class?: string;
  }

  let { layers, onToggle, onPrint, class: className }: Props = $props();
</script>

<div class={cn("absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg border border-border w-64", className)}>
  <div class="flex items-center gap-2 mb-4 font-semibold">
    <Layers class="h-4 w-4" />
    <h3>Layers</h3>
  </div>

  <div class="space-y-3">
    {#if layers.length === 0}
      <p class="text-sm text-muted-foreground italic">No layers added yet.</p>
    {/if}

    {#each layers as layer (layer.id)}
      <div class="flex items-center justify-between gap-2 p-2 rounded hover:bg-accent/50 transition-colors">
        <div class="flex items-center gap-2 overflow-hidden">
            <input 
                type="checkbox" 
                checked={layer.visible} 
                onchange={() => onToggle(layer.id)}
                class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span class="text-sm truncate" title={layer.name}>{layer.name}</span>
        </div>
        
        <button 
            onclick={() => onPrint(layer.id)}
            disabled={layer.isPrinting}
            class="p-1.5 hover:bg-primary hover:text-primary-foreground rounded-md transition-colors disabled:opacity-50"
            title="Print to PDF"
        >
            {#if layer.isPrinting}
                <Loader2 class="h-4 w-4 animate-spin" />
            {:else}
                <Printer class="h-4 w-4" />
            {/if}
        </button>
      </div>
    {/each}
  </div>
</div>

