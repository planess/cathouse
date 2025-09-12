/**
 * Type definition for callback functions used in authorization event handling.
 * Represents a function that takes no parameters and returns nothing.
 */
type Callback = () => void;

/**
 * The name of the custom event used for authorization state changes.
 *
 * @constant {string}
 */
const eventName = 'authChange';

/**
 * Event target instance used to handle authorization-related events.
 * This allows for communication between different parts of the application
 * when authorization state changes occur.
 *
 * @constant {EventTarget}
 */
const authEventTarget = new EventTarget();

/**
 * Triggers an authorization change event.
 * This function dispatches a custom event to notify all listeners
 * that the authorization state has changed.
 *
 * @function
 * @example
 * // Trigger auth change after user login
 * triggerAuthChange();
 */
export function triggerAuthChange() {
  authEventTarget.dispatchEvent(new Event(eventName));
}

/**
 * Registers a callback function to be executed when authorization state changes.
 * This function adds an event listener for authorization changes and returns
 * a cleanup function to remove the listener when no longer needed.
 *
 * @function
 * @param {() => void} callback - The function to be called when authorization changes occur
 * @returns {() => void} A cleanup function that removes the event listener when called
 *
 * @example
 * // Listen for auth changes and update UI
 * const unsubscribe = onRefresh(() => {
 *   console.log('Authorization state changed');
 *   // Update UI or refresh data
 * });
 *
 * // Later, when component unmounts or no longer needs the listener
 * unsubscribe();
 */
export function onRefresh(callback: Callback): Callback {
  authEventTarget.addEventListener(eventName, callback);

  return () => {
    authEventTarget.removeEventListener(eventName, callback);
  };
}
