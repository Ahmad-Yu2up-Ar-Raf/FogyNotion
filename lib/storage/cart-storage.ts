import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/type/product-type';

const CART_KEY = 'TESATE_CART';

/**
 * CartItem: Product dengan quantity
 * Jika user add product yang sama 2x, quantity = 2 (bukan 2 cart items)
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * ✅ MUTEX LOCK untuk prevent race condition
 * Jika user click "Add" 3x cepat-cepat, hanya eksekusi sequential, bukan parallel
 * Generic: support any return type (void, CartItem[], etc)
 */
let isProcessing = false;
const processingQueue: Array<() => Promise<any>> = [];

async function executeWithLock<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve) => {
    processingQueue.push(async () => {
      const result = await fn();
      resolve(result);
    });

    if (!isProcessing) {
      processQueue();
    }
  });
}

async function processQueue(): Promise<void> {
  if (processingQueue.length === 0 || isProcessing) return;

  isProcessing = true;
  while (processingQueue.length > 0) {
    const fn = processingQueue.shift();
    if (fn) {
      try {
        await fn();
      } catch (error) {
        console.error('❌ Queue processing error:', error);
      }
    }
  }
  isProcessing = false;
}

/**
 * ✅ UPSERT LOGIC: Handle product duplikasi
 * - Jika product sudah ada di cart → increment quantity
 * - Jika product baru → add ke cart dengan quantity 1
 * - Sequential execution: protect dari race condition
 */
export async function addToCart(product: Product, quantity: number = 1): Promise<CartItem[]> {
  return executeWithLock(async () => {
    try {
      const cart = await getCart();

      // Cari apakah product sudah ada
      const existingIndex = cart.findIndex((item) => item.product.id === product.id);

      if (existingIndex >= 0) {
        // ✅ Product sudah ada → increment quantity
        cart[existingIndex].quantity += quantity;
      } else {
        // ✅ Product baru → add ke cart
        cart.push({ product, quantity });
      }

      await saveCart(cart);
    } catch (error) {
      console.error('❌ addToCart error:', error);
      throw error;
    }
  });
}

/**
 * ✅ UPDATE QUANTITY: Set quantity ke value tertentu
 * - Jika quantity <= 0 → remove dari cart
 */
export async function updateCartQuantity(productId: number, quantity: number): Promise<CartItem[]> {
  return executeWithLock(async () => {
    try {
      let cart = await getCart();

      if (quantity <= 0) {
        // Hapus dari cart
        cart = cart.filter((item) => item.product.id !== productId);
      } else {
        // Update quantity
        const item = cart.find((item) => item.product.id === productId);
        if (item) {
          item.quantity = quantity;
        }
      }

      await saveCart(cart);
      return cart;
    } catch (error) {
      console.error('❌ updateCartQuantity error:', error);
      throw error;
    }
  });
}

/**
 * ✅ REMOVE DARI CART
 */
export async function removeFromCart(productId: number): Promise<CartItem[]> {
  return executeWithLock(async () => {
    try {
      const cart = await getCart();
      const filtered = cart.filter((item) => item.product.id !== productId);
      await saveCart(filtered);
      return filtered;
    } catch (error) {
      console.error('❌ removeFromCart error:', error);
      throw error;
    }
  });
}

/**
 * ✅ GET CART: Retrieve semua items
 */
export async function getCart(): Promise<CartItem[]> {
  try {
    const data = await AsyncStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ getCart error:', error);
    return [];
  }
}

/**
 * ✅ SAVE CART: Save ke storage
 */
export async function saveCart(cart: CartItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('❌ saveCart error:', error);
    throw error;
  }
}

/**
 * ✅ CLEAR CART: Hapus semua items
 */
export async function clearCart(): Promise<void> {
  return executeWithLock(async () => {
    try {
      await AsyncStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error('❌ clearCart error:', error);
      throw error;
    }
  });
}

/**
 * ✅ GET CART COUNT: Total jumlah items (sum of quantities)
 * Misal: [{id:1, qty:2}, {id:2, qty:1}] → total = 3
 */
export async function getCartCount(): Promise<number> {
  try {
    const cart = await getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error('❌ getCartCount error:', error);
    return 0;
  }
}

/**
 * ✅ GET CART TOTAL: Total harga semua items
 * (product.price * quantity)
 */
export async function getCartTotal(): Promise<number> {
  try {
    const cart = await getCart();
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  } catch (error) {
    console.error('❌ getCartTotal error:', error);
    return 0;
  }
}
