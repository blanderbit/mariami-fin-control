import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    server: {
        proxy: {
            '/api/v1': {
                target: 'http://0.0.0.0:8000',
                changeOrigin: true,
            },
        },
    },
});
