// Startup cleanup utility to ensure clean blockchain-only operation
import { clearAllDemoData, hasDemoData, getStorageKeys } from './clearDemoData';

export const performStartupCleanup = () => {
  console.log("🚀 Performing startup cleanup...");
  
  // Log current localStorage state
  const storageKeys = getStorageKeys();
  console.log("📦 Current localStorage keys:", storageKeys);
  
  // Clear any demo/mock data
  if (hasDemoData()) {
    console.log("🧹 Found demo data, clearing...");
    clearAllDemoData();
  } else {
    console.log("✅ No demo data found");
  }
  
  // Ensure blockchain mode is set
  localStorage.setItem('appMode', 'blockchain');
  console.log("🔗 Mode set to blockchain");
  
  // Clear any cached view function results that might be stale
  const keysToRemove = storageKeys.filter(key => 
    key.includes('view_cache') || 
    key.includes('cached_') ||
    key.includes('temp_')
  );
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed stale cache key: ${key}`);
  });
  
  console.log("✅ Startup cleanup completed");
};

// Export for use in main app initialization
export const initializeApp = () => {
  performStartupCleanup();
  
  // Set up performance monitoring
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      console.log("👋 App closing, cleanup completed");
    });
  }
  
  return true;
};
