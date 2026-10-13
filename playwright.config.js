import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',timeout:180000,workers:1,
 use:{baseURL:'http://127.0.0.1:8002/programming-languages/',
  launchOptions:process.env.PLAYWRIGHT_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH} : {}},
 webServer:{command:'python3 scripts/test-server.py',url:'http://127.0.0.1:8002/programming-languages/',reuseExistingServer:!process.env.CI}
});
