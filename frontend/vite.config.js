import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/graph": "http://localhost:8000",
            "/stats": "http://localhost:8000",
            "/pipes": "http://localhost:8000",
            "/nodes": "http://localhost:8000",
            "/maintenance": "http://localhost:8000",
            "/predict": "http://localhost:8000",
        },
    },
});