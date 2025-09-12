/**
 * Base class for implementing the singleton pattern
 * Provides a reusable singleton implementation that can be extended
 */
export class Singleton {
  private static instances = new WeakMap<typeof Singleton, Singleton>();

  protected constructor() {
    // Prevent direct instantiation
  }

  /**
   * Get the singleton instance of the class
   * Each class that extends Singleton will have its own instance
   * @returns The singleton instance of the calling class
   */
  static getInstance<T extends Singleton>(): T {
    if (!Singleton.instances.has(this)) {
      // Create instance bypassing protected constructor
      Singleton.instances.set(this, new this() as T);
    }

    return Singleton.instances.get(this) as T;
  }

  /**
   * Clear all singleton instances (useful for testing)
   * Note: WeakMap doesn't have a clear method, so we create a new WeakMap
   */
  static clearInstances(): void {
    Singleton.instances = new WeakMap();
  }

  /**
   * Clear a specific singleton instance (useful for testing)
   */
  static clearInstance(): void {
    Singleton.instances.delete(this);
  }
}
