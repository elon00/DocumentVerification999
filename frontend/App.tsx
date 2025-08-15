import { useEffect } from "react";
import { CleanDashboardLayout } from "@/components/CleanDashboardLayout";
import { initializeApp } from "@/utils/startupCleanup";

function App() {
  // Initialize app and perform cleanup on startup
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <CleanDashboardLayout />
  );
}

export default App;
