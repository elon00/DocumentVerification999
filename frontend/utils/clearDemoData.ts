// Utility to clear all mock/demo data from localStorage
export const clearAllDemoData = () => {
  try {
    // Clear mock blockchain files
    localStorage.removeItem("mock_blockchain_files");
    
    // Clear mock transactions
    localStorage.removeItem("mock_blockchain_transactions");
    
    // Clear any other demo-related storage
    localStorage.removeItem("demo_stats");
    localStorage.removeItem("demo_mode_data");
    
    console.log("✅ All demo/mock data cleared from localStorage");
    return true;
  } catch (error) {
    console.error("❌ Error clearing demo data:", error);
    return false;
  }
};

// Clear specific storage keys if needed
export const clearSpecificStorage = (keys: string[]) => {
  try {
    keys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ Cleared storage key: ${key}`);
    });
    return true;
  } catch (error) {
    console.error("❌ Error clearing specific storage keys:", error);
    return false;
  }
};

// Check if demo data exists in localStorage
export const hasDemoData = (): boolean => {
  const demoKeys = [
    "mock_blockchain_files",
    "mock_blockchain_transactions",
    "demo_stats",
    "demo_mode_data"
  ];
  
  return demoKeys.some(key => localStorage.getItem(key) !== null);
};

// Get all localStorage keys for debugging
export const getStorageKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
};