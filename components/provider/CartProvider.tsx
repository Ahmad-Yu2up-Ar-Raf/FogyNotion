import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useTransition,
} from 'react';
import {
  addToCart,
  updateCartQuantity,
  removeFromCart,
  getCart,
  clearCart,
  getCartCount,
  getCartTotal,
  CartItem,
} from '@/lib/storage/cart-storage';
import { Product } from '@/type/product-type';

/**
 * ✅ OPTIMISTIC UI: Update UI instantly, sync to storage in background
 *
 * Benefits:
 * - ⚡ Instant feedback (no lag)
 * - 🔄 Storage syncs in background
 * - ↩️ Rollback if error
 * - 🛡️ Race condition protected
 */
type CartContextState = {
  // State
  items: CartItem[];
  count: number;
  total: number;
  isLoading: boolean;
  isPending: boolean; // ← Optimistic operation pending

  // Operations
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearAll: () => Promise<void>;

  // Helpers
  getItem: (productId: number) => CartItem | undefined;
  hasItem: (productId: number) => boolean;
};

const CartContext = createContext<CartContextState | null>(null);

/**
 * ✅ OPTIMISTIC STATE HELPER
 * Update state immediately, sync storage in background
 */
function updateStateOptimistic(
  items: CartItem[],
  onSuccess: (newItems: CartItem[]) => void,
  onError: () => void
): { newCount: number; newTotal: number } {
  const newCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const newTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Schedule storage sync in background (non-blocking)
  requestAnimationFrame(async () => {
    try {
      await require('@/lib/storage/cart-storage').saveCart(items);
      onSuccess(items);
    } catch (error) {
      console.error('❌ Optimistic sync failed:', error);
      onError();
    }
  });

  return { newCount, newTotal };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [count, setCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ✅ useTransition untuk track optimistic operations
  const [isPending, startTransition] = useTransition();

  /**
   * ✅ INIT: Load cart dari storage saat app startup
   */
  useEffect(() => {
    const initCart = async () => {
      try {
        setIsLoading(true);
        const cart = await getCart();
        const cartCount = await getCartCount();
        const cartTotal = await getCartTotal();

        setItems(cart);
        setCount(cartCount);
        setTotal(cartTotal);
      } catch (error) {
        console.error('❌ initCart error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initCart();
  }, []);

  /**
   * ✅ ADD TO CART (Optimistic)
   * 1. Update UI instantly ⚡
   * 2. Sync to storage in background 🔄
   * 3. Rollback if error ↩️
   */
  const addItem = useCallback(
    async (product: Product, quantity: number = 1) => {
      // ✅ OPTIMISTIC UPDATE: Immediately update UI
      startTransition(() => {
        const updatedItems = [...items];
        const existingIndex = updatedItems.findIndex((item) => item.product.id === product.id);

        if (existingIndex >= 0) {
          updatedItems[existingIndex].quantity += quantity;
        } else {
          updatedItems.push({ product, quantity });
        }

        setItems(updatedItems);
        const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        setCount(newCount);
        setTotal(newTotal);

        // ✅ SYNC IN BACKGROUND: Non-blocking storage update
        requestAnimationFrame(async () => {
          try {
            await addToCart(product, quantity);
          } catch (error) {
            console.error('❌ addItem sync error:', error);
            // ↩️ ROLLBACK: Refresh dari storage jika gagal
            try {
              const freshCart = await getCart();
              const freshCount = await getCartCount();
              const freshTotal = await getCartTotal();
              setItems(freshCart);
              setCount(freshCount);
              setTotal(freshTotal);
            } catch (rollbackError) {
              console.error('❌ rollback failed:', rollbackError);
            }
          }
        });
      });
    },
    [items]
  );

  /**
   * ✅ UPDATE QUANTITY (Optimistic)
   */
  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      // ✅ OPTIMISTIC UPDATE
      startTransition(() => {
        let updatedItems = items;

        if (quantity <= 0) {
          updatedItems = items.filter((item) => item.product.id !== productId);
        } else {
          updatedItems = items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
        }

        setItems(updatedItems);
        const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        setCount(newCount);
        setTotal(newTotal);

        // ✅ SYNC IN BACKGROUND
        requestAnimationFrame(async () => {
          try {
            await updateCartQuantity(productId, quantity);
          } catch (error) {
            console.error('❌ updateQuantity sync error:', error);
            // ↩️ ROLLBACK
            try {
              const freshCart = await getCart();
              const freshCount = await getCartCount();
              const freshTotal = await getCartTotal();
              setItems(freshCart);
              setCount(freshCount);
              setTotal(freshTotal);
            } catch (rollbackError) {
              console.error('❌ rollback failed:', rollbackError);
            }
          }
        });
      });
    },
    [items]
  );

  /**
   * ✅ REMOVE FROM CART (Optimistic)
   */
  const removeItem = useCallback(
    async (productId: number) => {
      // ✅ OPTIMISTIC UPDATE
      startTransition(() => {
        const updatedItems = items.filter((item) => item.product.id !== productId);

        setItems(updatedItems);
        const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        setCount(newCount);
        setTotal(newTotal);

        // ✅ SYNC IN BACKGROUND
        requestAnimationFrame(async () => {
          try {
            await removeFromCart(productId);
          } catch (error) {
            console.error('❌ removeItem sync error:', error);
            // ↩️ ROLLBACK
            try {
              const freshCart = await getCart();
              const freshCount = await getCartCount();
              const freshTotal = await getCartTotal();
              setItems(freshCart);
              setCount(freshCount);
              setTotal(freshTotal);
            } catch (rollbackError) {
              console.error('❌ rollback failed:', rollbackError);
            }
          }
        });
      });
    },
    [items]
  );

  /**
   * ✅ CLEAR ALL CART (Optimistic)
   */
  const clearAll = useCallback(async () => {
    // ✅ OPTIMISTIC UPDATE
    startTransition(() => {
      setItems([]);
      setCount(0);
      setTotal(0);

      // ✅ SYNC IN BACKGROUND
      requestAnimationFrame(async () => {
        try {
          await clearCart();
        } catch (error) {
          console.error('❌ clearAll sync error:', error);
          // ↩️ ROLLBACK
          try {
            const freshCart = await getCart();
            const freshCount = await getCartCount();
            const freshTotal = await getCartTotal();
            setItems(freshCart);
            setCount(freshCount);
            setTotal(freshTotal);
          } catch (rollbackError) {
            console.error('❌ rollback failed:', rollbackError);
          }
        }
      });
    });
  }, [items]);

  /**
   * ✅ HELPER: Get specific item dari cart
   */
  const getItem = useCallback(
    (productId: number): CartItem | undefined => {
      return items.find((item) => item.product.id === productId);
    },
    [items]
  );

  /**
   * ✅ HELPER: Check apakah product sudah ada di cart
   */
  const hasItem = useCallback(
    (productId: number): boolean => {
      return items.some((item) => item.product.id === productId);
    },
    [items]
  );

  const value: CartContextState = {
    items,
    count,
    total,
    isLoading,
    isPending, // ← User dapat check if optimistic operation sedang berjalan
    addItem,
    updateQuantity,
    removeItem,
    clearAll,
    getItem,
    hasItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * ✅ HOOK: useCart
 * Use di mana saja untuk access cart state + operations
 *
 * @example
 * const { items, count, isPending, addItem } = useCart();
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be inside CartProvider');
  }
  return ctx;
}
