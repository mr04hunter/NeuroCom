interface ImportMetaEnv {
    readonly VITE_WS_URL: string
    readonly VITE_API_BASE_URL: string
    // Add other VITE_ environment variables you use
    readonly VITE_APP_TITLE: string
    // ... add more as needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  declare module "*.png" {
    const value: string;
    export default value;
  }
  
  declare module "*.jpg" {
    const value: string;
    export default value;
  }
  
  declare module "*.jpeg" {
    const value: string;
    export default value;
  }
  
  declare module "*.gif" {
    const value: string;
    export default value;
  }
  
  declare module "*.svg" {
    const value: string;
    export default value;
  }