<script lang="ts">
  import { cn } from "$lib/utils";
  import { Upload } from "lucide-svelte";

  interface Props {
    onDrop: (files: FileList) => void;
    class?: string;
  }

  let { onDrop, class: className }: Props = $props();
  let isDragOver = $state(false);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onDrop(e.dataTransfer.files);
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class={cn(
    "absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg border border-border transition-colors",
    isDragOver ? "bg-primary/10 border-primary" : "",
    className
  )}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  <div class="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
    <Upload class="h-8 w-8" />
    <p class="text-center">
      Drop Shapefile (.zip)<br />
      or GeoJSON here
    </p>
  </div>
</div>

