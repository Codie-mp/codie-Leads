import { createServer } from "./src/server/index.js";
import { syncLegacySchema } from "./src/server/routes/legacy.js";

async function start() {
  try {
    console.log("Syncing database schema...");
    await syncLegacySchema();
    
    console.log("Starting server...");
    const app = await createServer();
    const PORT = process.env.PORT || 3000;
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
