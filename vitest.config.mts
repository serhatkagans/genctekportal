import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// tsconfig'deki "@/*" takma adının test tarafındaki karşılığı. Testler bugüne
// kadar göreli yol kullandığı için gerekmiyordu; proxy.ts gibi uygulama
// modülleri doğrudan içe aktarılınca şart oldu.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)).replace(/[\\/]$/, "") },
  },
});
