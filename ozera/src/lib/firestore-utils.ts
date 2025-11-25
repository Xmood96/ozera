import { getDocs, Query } from "firebase/firestore";

/**
 * Manages Firestore query execution with proper abort signal handling
 * Prevents AbortError when components unmount or queries are cancelled
 */
export class FirestoreQueryManager {
  private abortController: AbortController | null = null;

  /**
   * Execute a Firestore query with abort signal support
   * @param query - The Firestore query to execute
   * @returns Promise resolving to the query snapshot
   */
  async executeQuery<T extends { docs: any[] }>(query: Query): Promise<T | null> {
    try {
      // Create a new abort controller for this query
      this.abortController = new AbortController();
      
      // Execute the query
      const snapshot = await getDocs(query);
      
      // Return null if aborted
      if (this.abortController.signal.aborted) {
        return null;
      }
      
      return snapshot as T;
    } catch (error) {
      // Handle AbortError gracefully - this is expected when component unmounts
      if (error instanceof Error && error.name === "AbortError") {
        console.debug("Firestore query was aborted (expected on unmount)");
        return null;
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Cancel any pending queries
   * Should be called in useEffect cleanup
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Check if the current operation was aborted
   */
  isAborted(): boolean {
    return this.abortController?.signal.aborted ?? false;
  }
}

/**
 * Hook utility for safe async Firestore operations
 * Returns a function that wraps promise operations with abort handling
 */
export function createSafeAsyncWrapper(isMountedRef: React.MutableRefObject<boolean>) {
  return async function safeAsync<T>(
    promise: Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: unknown) => void
  ): Promise<T | null> {
    try {
      const result = await promise;
      
      // Only proceed if component is still mounted
      if (!isMountedRef.current) {
        return null;
      }
      
      onSuccess?.(result);
      return result;
    } catch (error) {
      // Handle AbortError gracefully
      if (error instanceof Error && error.name === "AbortError") {
        console.debug("Async operation was aborted (expected on unmount)");
        return null;
      }
      
      // Only log error if component is still mounted
      if (isMountedRef.current) {
        console.error("Async operation failed:", error);
        onError?.(error);
      }
      
      return null;
    }
  };
}
