// A simple event emitter for cross-component communication.
// This is used to propagate Firestore permission errors to a listener component.

type Listener<T> = (data: T) => void;

class EventEmitter<TEventMap> {
  private listeners: { [K in keyof TEventMap]?: Array<Listener<TEventMap[K]>> } = {};

  on<K extends keyof TEventMap>(eventName: K, listener: Listener<TEventMap[K]>) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]!.push(listener);
  }

  off<K extends keyof TEventMap>(eventName: K, listener: Listener<TEventMap[K]>) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName] = this.listeners[eventName]!.filter(l => l !== listener);
  }

  emit<K extends keyof TEventMap>(eventName: K, data: TEventMap[K]) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName]!.forEach(listener => listener(data));
  }
}

interface AppEvents {
  'permission-error': import('./errors').FirestorePermissionError;
}

export const errorEmitter = new EventEmitter<AppEvents>();
