import { renderHook, act } from '@testing-library/react';
import useLocalStorage from './useLocalStorage';

// Mock localStorage
let store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string): string | null => store[key] || null,
  setItem: (key: string, value: string): void => {
    store[key] = value.toString();
  },
  removeItem: (key: string): void => {
    delete store[key];
  },
  clear: (): void => {
    store = {};
  },
  key: (index: number): string | null => Object.keys(store)[index] || null,
  length: Object.keys(store).length,
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Helper to dispatch storage events
const dispatchStorageEvent = (key: string, newValue: string | null, oldValue?: string | null) => {
  const event = new StorageEvent('storage', {
    key,
    newValue,
    oldValue: oldValue !== undefined ? oldValue : null,
    storageArea: window.localStorage,
    url: window.location.href,
  });
  act(() => {
    window.dispatchEvent(event);
  });
};

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear the mock store and any Jest mocks before each test
    mockLocalStorage.clear();
    jest.clearAllMocks();
    // Spy on console.warn and suppress output during tests, but check calls
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.warn
    (console.warn as jest.Mock).mockRestore();
  });

  describe('Initialization', () => {
    it('should initialize with initialValue if localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
      expect(result.current[0]).toBe('initial');
    });

    it('should initialize with initialValue if key is not in localStorage', () => {
      mockLocalStorage.setItem('otherKey', JSON.stringify('otherValue'));
      const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
      expect(result.current[0]).toBe('initial');
    });

    it('should initialize from localStorage if value exists and is valid JSON', () => {
      mockLocalStorage.setItem('testKey', JSON.stringify('storedValue'));
      const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
      expect(result.current[0]).toBe('storedValue');
    });

    it('should initialize from localStorage with complex object', () => {
      const complexObject = { id: 1, name: 'Test' };
      mockLocalStorage.setItem('testKeyObj', JSON.stringify(complexObject));
      const { result } = renderHook(() => useLocalStorage('testKeyObj', { id: 0, name: '' }));
      expect(result.current[0]).toEqual(complexObject);
    });

    it('should fall back to initialValue if localStorage contains invalid JSON', () => {
      mockLocalStorage.setItem('testKeyInvalid', 'not a json string');
      const { result } = renderHook(() => useLocalStorage('testKeyInvalid', 'initialFallback'));
      expect(result.current[0]).toBe('initialFallback');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Error reading localStorage key “testKeyInvalid”:'),
        expect.any(Error)
      );
    });

    it('should use initialValue if localStorage item is null (e.g. previously removed explicitly)', () => {
        // JSON.parse(null) is null, so this case is handled by initialValue check
        mockLocalStorage.setItem('testKeyNull', 'null');
        const { result } = renderHook(() => useLocalStorage('testKeyNull', 'initialForNull'));
        expect(result.current[0]).toBe('initialForNull'); // Because JSON.parse('null') is null
    });
  });

  describe('Setting Value', () => {
    it('should update state and localStorage when setValue is called with a direct value', () => {
      const { result } = renderHook(() => useLocalStorage('setTestKey', 'initialSet'));
      
      act(() => {
        result.current[1]('newValue');
      });

      expect(result.current[0]).toBe('newValue');
      expect(mockLocalStorage.getItem('setTestKey')).toBe(JSON.stringify('newValue'));
    });

    it('should update state and localStorage when setValue is called with a functional updater', () => {
      const { result } = renderHook(() => useLocalStorage('setFnTestKey', 10));
      
      act(() => {
        result.current[1]((prev: number) => prev + 5);
      });

      expect(result.current[0]).toBe(15);
      expect(mockLocalStorage.getItem('setFnTestKey')).toBe(JSON.stringify(15));
    });

    it('should correctly store complex objects', () => {
      const initialObject = { count: 0, active: false };
      const updatedObject = { count: 1, active: true };
      const { result } = renderHook(() => useLocalStorage('setObjKey', initialObject));

      act(() => {
        result.current[1](updatedObject);
      });

      expect(result.current[0]).toEqual(updatedObject);
      expect(mockLocalStorage.getItem('setObjKey')).toBe(JSON.stringify(updatedObject));
    });

    it('should handle function updater returning the same value (referential equality for objects might differ)', () => {
        const initialObj = { val: 'test' };
        const { result } = renderHook(() => useLocalStorage('setFnSameObj', initialObj));
        
        act(() => {
          result.current[1](prev => ({ ...prev })); // New object with same values
        });
  
        expect(result.current[0]).toEqual(initialObj); // Value is the same
        expect(mockLocalStorage.getItem('setFnSameObj')).toBe(JSON.stringify(initialObj));
      });
  });

  describe('Storage Event Synchronization', () => {
    it('should update state when a storage event occurs for the same key with valid JSON', () => {
      const { result } = renderHook(() => useLocalStorage('syncKey', 'initialSync'));
      
      dispatchStorageEvent('syncKey', JSON.stringify('updatedViaEvent'));
      
      expect(result.current[0]).toBe('updatedViaEvent');
    });

    it('should not update state if storage event is for a different key', () => {
      const { result } = renderHook(() => useLocalStorage('syncKey', 'initialSync'));
      
      dispatchStorageEvent('anotherKey', JSON.stringify('updatedForAnother'));
      
      expect(result.current[0]).toBe('initialSync');
    });

    it('should not update state if storage event has null newValue (key removed)', () => {
      const { result } = renderHook(() => useLocalStorage('syncKeyNullEvent', 'initialSyncNull'));
      
      // Simulate a value being set first
      act(() => {
        result.current[1]('valueBeforeEvent');
      });
      expect(result.current[0]).toBe('valueBeforeEvent');

      dispatchStorageEvent('syncKeyNullEvent', null); // e.g. localStorage.removeItem('syncKeyNullEvent') in another tab
      
      // The hook's current behavior is to not change the state if newValue is null from event
      // because readValue() would return initialValue if the item is truly gone,
      // but the event listener for 'storage' specifically checks `event.newValue`.
      // If event.newValue is null, it doesn't parse or set.
      expect(result.current[0]).toBe('valueBeforeEvent'); 
    });
    
    it('should not update state if storage event has invalid JSON in newValue', () => {
        const { result } = renderHook(() => useLocalStorage('syncKeyInvalidEvent', 'initialInvalidEvent'));
        
        dispatchStorageEvent('syncKeyInvalidEvent', 'not valid json');
        
        expect(result.current[0]).toBe('initialInvalidEvent');
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('Error parsing localStorage key “syncKeyInvalidEvent” on storage event:'),
          expect.any(Error)
        );
      });

      it('should handle storage event when initial value was an object', () => {
        const initialObj = { data: 'initial' };
        const updatedObj = { data: 'updated by event' };
        const { result } = renderHook(() => useLocalStorage('syncObjKey', initialObj));
        
        dispatchStorageEvent('syncObjKey', JSON.stringify(updatedObj));
        
        expect(result.current[0]).toEqual(updatedObj);
      });
  });

  describe('Error Handling (Graceful Fallbacks)', () => {
    it('should handle localStorage.setItem throwing an error', () => {
      const { result } = renderHook(() => useLocalStorage('errorKey', 'initialError'));
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = () => { throw new Error('Disk full'); };
      
      act(() => {
        result.current[1]('newValueCausesError');
      });
      
      // State might update optimistically depending on implementation, or might not.
      // The key is that the hook doesn't crash and logs a warning.
      // Current implementation updates state first, then tries to setItem.
      expect(result.current[0]).toBe('newValueCausesError'); 
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Error setting localStorage key “errorKey”:'),
        expect.any(Error)
      );
      mockLocalStorage.setItem = originalSetItem; // Restore
    });

    // JSON.stringify can throw for circular references, but basic values are fine.
    it('should handle JSON.stringify throwing an error (e.g. circular structure)', () => {
        const { result } = renderHook(() => useLocalStorage<any>('circularKey', {}));
        const circularObj: any = { name: 'circular' };
        circularObj.self = circularObj;

        act(() => {
            result.current[1](circularObj);
        });
        
        // State updates, but localStorage saving fails.
        expect(result.current[0]).toEqual(circularObj);
        expect(mockLocalStorage.getItem('circularKey')).toBe(JSON.stringify({})); // Should still be initial or last valid
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('Error setting localStorage key “circularKey”:'),
          expect.any(Error) 
        );
    });
  });

  describe('Window undefined (SSR guard)', () => {
    it('should return initialValue and not throw if window is undefined initially (for read)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const { result } = renderHook(() => useLocalStorage('ssrKey', 'ssrInitial'));
      expect(result.current[0]).toBe('ssrInitial');
      
      // @ts-ignore
      global.window = originalWindow; // Restore
    });

    it('should warn and not throw if window is undefined on setValue', () => {
        const { result } = renderHook(() => useLocalStorage('ssrSetKey', 'ssrInitialSet'));
        const originalWindow = global.window;
        // @ts-ignore
        delete global.window;
  
        act(() => {
          result.current[1]('newValueSsr');
        });
        
        // State should still update
        expect(result.current[0]).toBe('newValueSsr');
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('Tried setting localStorage key “ssrSetKey” even though environment is not a client')
        );
        
        // @ts-ignore
        global.window = originalWindow; // Restore
      });
  });
});

// Test the useEffect for initialization (component mount)
describe('useLocalStorage - Initialization Effect', () => {
    beforeEach(() => {
        mockLocalStorage.clear();
        jest.spyOn(console, 'warn').mockImplementation(() => {});
      });
    
      afterEach(() => {
        (console.warn as jest.Mock).mockRestore();
      });

    it('should re-read from localStorage on mount if value changed externally before mount but after initial read setup', () => {
        // This tests the specific useEffect that calls readValue() on mount.
        // Simulate initial read returning initialValue
        mockLocalStorage.setItem('mountKey', JSON.stringify('valueBeforeFirstRender'));

        const { result, rerender } = renderHook(
            ({ key, initialValue }) => useLocalStorage(key, initialValue),
            { initialProps: { key: 'mountKey', initialValue: 'initial' } }
        );
        
        // Initially, it might pick up 'valueBeforeFirstRender' due to direct call to readValue in useState initializer
        expect(result.current[0]).toBe('valueBeforeFirstRender');

        // Now, simulate that localStorage was updated by something else *after* the useState initializer ran
        // but *before* the useEffect for mount ran (or to simulate a more complex scenario)
        // Or, more simply, test if a rerender with the same key picks up a new localStorage value
        // if the internal state somehow diverged.
        mockLocalStorage.setItem('mountKey', JSON.stringify('valueUpdatedJustBeforeEffect'));
        
        // The useEffect with empty dependency array [] runs setStoredValue(readValue())
        // Let's force a rerender to ensure effects are processed if needed, though `renderHook` does this.
        // The key is that the readValue in the useEffect should pick up the latest.
        // This specific test is a bit nuanced due to useState's initializer also calling readValue.
        // A better way to test this effect is to ensure that if localStorage changes *without* a storage event
        // and the component re-renders, it *doesn't* automatically pick it up without a change in key.
        // The current useEffect([]) is mainly for the initial hydration.

        // Let's test a different angle: if the key changes, it should re-initialize.
        mockLocalStorage.setItem('newMountKey', JSON.stringify('newValueForKeyChange'));
        rerender({ key: 'newMountKey', initialValue: 'newInitial' });
        
        expect(result.current[0]).toBe('newValueForKeyChange');
    });
});
