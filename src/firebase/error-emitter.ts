
import { EventEmitter } from 'events';

// This is a global event emitter for Firebase errors.
// We use this to decouple error handling from the components that trigger them.
export const errorEmitter = new EventEmitter();
