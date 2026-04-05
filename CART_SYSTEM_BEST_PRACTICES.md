# 🛒 E-Commerce Cart System - Best Practices Guide

## 📋 Skema Implementasi

### 1. **Storage Layer** (`lib/storage/cart-storage.ts`)

**Best Practice: Separation of Concerns**

```
Goal: Handle semua AsyncStorage operations dan business logic di satu tempat
Benefits:
  ✅ Reusable di seluruh app
  ✅ Testable tanpa UI
  ✅ Single source of truth untuk cart logic
  ✅ Easy to migrate ke database nanti
```

**Key Features:**

- **UPSERT Logic**: Jika product sudah ada → increment quantity (bukan add duplicate)
- **Type Safety**: CartItem interface untuk consistency
- **Error Handling**: Try-catch di setiap function

```typescript
// ✅ GOOD: Upsert logic
const existingIndex = cart.findIndex((item) => item.product.id === product.id);
if (existingIndex >= 0) {
  cart[existingIndex].quantity += quantity; // ← Increment, bukan add new item
} else {
  cart.push({ product, quantity });
}

// ❌ BAD: Simpan semua add-to-cart sebagai item baru
cart.push({ product, quantity }); // ← Duplikat items!
```

---

### 2. **Context Provider** (`components/provider/CartProvider.tsx`)

**Best Practice: Global State Management dengan Hooks**

```
Goal: Manage cart state secara global tanpa prop drilling
Benefits:
  ✅ Access cart di component manapun dengan useCart()
  ✅ Real-time updates across UI
  ✅ Automatic persistence ke storage
  ✅ Clean separation: Context ≠ Storage
```

**Architecture:**

```
┌─────────────────────────────────────┐
│         CartProvider                │
│  ┌───────────────────────────────┐  │
│  │   State Management (useState) │  │
│  │  - items: CartItem[]          │  │
│  │  - count: number (total qty)  │  │
│  │  - total: number (total price)│  │
│  │  - isLoading: boolean         │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │    Operations (useCallback)   │  │
│  │  - addItem()                  │  │
│  │  - updateQuantity()           │  │
│  │  - removeItem()               │  │
│  │  - clearAll()                 │  │
│  │  - getItem()   [Helper]       │  │
│  │  - hasItem()   [Helper]       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
         ↓ Provides via Context
    ┌──────────────────┐
    │  useCart() Hook  │ ← Components access here
    └──────────────────┘
```

**Key Features:**

- **Init on Startup**: `useEffect` untuk load cart dari storage
- **Computed Values**: `count` dan `total` otomatis recalculate
- **Error Handling**: Graceful fallback jika storage fail
- **Loading State**: Track apakah sedang initialize

```typescript
// ✅ GOOD: useCallback untuk prevent unnecessary re-renders
const addItem = useCallback(async (product: Product, quantity: number = 1) => {
  const updatedCart = await addToCart(product, quantity);
  setItems(updatedCart);
  // ... update count & total
}, []); // ← Empty deps, tidak re-ciptakan function setiap render

// ❌ BAD: Function tanpa useCallback
const addItem = async (product) => {
  // ... setiap parent re-render, function baru diciptakan
  // → children yang pake addItem juga re-render! (wasteful)
};
```

---

### 3. **Integration di App**

**Best Practice: Provider Order & Wrapping**

```
Root (_layout.tsx)
  └─ PrayerProvider (Prayer specific data)
      └─ Provider (Main global providers)
          └─ QueryClientProvider (TanStack Query)
              └─ ThemeProvider (Navigation theme)
                  └─ CartProvider (✅ Cart state) ← TOP LEVEL!
                      └─ GestureHandlerRootView
                          └─ ToastProvider
                              └─ App Content
```

**Why CartProvider di atas GestureHandler?**

- CartProvider perlu accessible dari mana saja
- Gesture handler hanya butuh untuk gesture recognition
- Toast butuh accessible untuk feedback, tapi cart adalah foundational

---

### 4. **Component Integration**

**Best Practice: Local State + Global State Coordination**

#### A. ProductCard - Add to Cart

```typescript
// ✅ GOOD: Combine global + local state
const { addItem, hasItem } = useCart();
const [isAdding, setIsAdding] = useState(false);

const handleAddToCart = async () => {
  try {
    setIsAdding(true);          // ← Local UI state
    await addItem(product, 1);  // ← Global cart state + storage
    toast({ ... });             // ← User feedback
  } finally {
    setIsAdding(false);
  }
};

// UI reflects:
// 1. isAdding → Button loading state
// 2. hasItem() → Button color change (green checkmark jika sudah di cart)
// 3. toast → User notification
```

**Visual Feedback:**

```
Add to Cart Button states:
┌─────────────────────────────────────┐
│  [🛒] Default gray                  │ ← Not in cart
│  [🛒] Loading (disabled)            │ ← Adding...
│  [✓] Green bg, white checkmark      │ ← In cart
└─────────────────────────────────────┘
```

#### B. Nav - Cart Count Badge

```typescript
// ✅ GOOD: Real-time badge
const { count: cartCount } = useCart();

return (
  <View className="relative">
    <Button ...>
      <Icon as={ShoppingCartIcon} />
    </Button>
    {cartCount > 0 && (
      <View className="absolute -right-1 -top-1 ... bg-destructive">
        <Text>{cartCount > 99 ? '99+' : cartCount}</Text>
      </View>
    )}
  </View>
);

// ✅ Auto-update:
// - User click "Add to Cart"
// - CartProvider state updated
// - All useCart() hooks re-render
// - Nav badge updates instantly (no manual refresh needed!)
```

---

## 🔑 Key Best Practices

### 1. **Quantity Management (Upsert, bukan Insert)**

```typescript
// ✅ Correct way:
// Cart: [{id:1, qty:1}, {id:2, qty:1}]
// Add Product 1 again
// Result: [{id:1, qty:2}, {id:2, qty:1}] ✅

// ❌ Wrong way:
// Cart: [{id:1, qty:1}, {id:2, qty:1}]
// Add Product 1 again
// Result: [{id:1, qty:1}, {id:2, qty:1}, {id:1, qty:1}] ❌ DUPLICATE!
```

### 2. **Storage Sync Pattern**

```
Component Action
    ↓
Storage Function (cart-storage.ts)
    ↓
AsyncStorage.setItem() ← Persisted
    ↓
Provider updates state (useState)
    ↓
Using hook gets new data (re-render)
    ↓
UI reflects changes instantly
```

### 3. **Error Handling**

```typescript
// ✅ GOOD: Graceful degradation
try {
  const cart = await getCart();
  setItems(cart);
} catch (error) {
  console.error('Failed to load cart:', error);
  // Fallback: empty cart, app still works
  setItems([]);
  toast({ title: 'Failed to load cart', variant: 'destructive' });
}

// ❌ BAD: Silent failures
const cart = await getCart(); // ← bisa throw, user tidak tahu kenapa cart kosong
setItems(cart);
```

### 4. **Performance: Computed Values**

```typescript
// ✅ GOOD: Computed values updated together
const [items, setItems] = useState([]);
const [count, setCount] = useState(0);
const [total, setTotal] = useState(0);

// Whenever items change, ALWAYS update count + total:
const cart = await getCart();
setItems(cart);
setCount(await getCartCount()); // ← Computed from storage
setTotal(await getCartTotal());  // ← Computed from storage

// ❌ BAD: Compute di render (expensive!)
function CartBadge() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0); // ← Recompute setiap render!
  return <Text>{count}</Text>;
}
```

### 5. **Real-time Sync Across Components**

```
Multiple components using useCart():
├─ ProductCard.tsx (add to cart)
├─ Nav.tsx (show badge)
├─ CartPage.tsx (show full cart)
├─ Checkout.tsx (show total)
└─ HomeBlock.tsx (show cart count)

When ProductCard.addItem() called:
1. CartProvider state updated
2. ALL components using useCart() detect change
3. ALL components re-render with new state
4. No prop drilling needed! ✅
```

---

## 📊 Data Structure

```typescript
// Storage format:
{
  "TESATE_CART": [
    {
      "product": {
        "id": 1,
        "title": "Product 1",
        "price": 29.99,
        // ... full Product object
      },
      "quantity": 2
    },
    {
      "product": {
        "id": 2,
        "title": "Product 2",
        "price": 49.99,
        // ... full Product object
      },
      "quantity": 1
    }
  ]
}

// Computed values:
count = 2 + 1 = 3 items total
total = (29.99 * 2) + (49.99 * 1) = $109.97
```

---

## 🎯 Migration Path (Jika Ingin Database Nanti)

**Advantage dari architecture ini:**
Storage functions sudah isolated, jadi migration ke database super mudah:

```typescript
// Current: AsyncStorage
export async function getCart(): Promise<CartItem[]> {
  const data = await AsyncStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

// Future: Database
export async function getCart(): Promise<CartItem[]> {
  const response = await fetch('/api/cart');
  return response.json();
}

// Provider code tetap SAMA! ✅
// Hanya ganti implementation, tidak perlu ubah seluruh app.
```

---

## ✅ Checklist: Production Ready

- ✅ Upsert logic untuk duplikasi handling
- ✅ AsyncStorage untuk persistence
- ✅ Context API untuk global state
- ✅ useCallback untuk performance
- ✅ Error handling + fallback
- ✅ Loading states
- ✅ Real-time sync across components
- ✅ Computed values (count, total)
- ✅ Type safety (TypeScript)
- ✅ User feedback (toast)
- ✅ Visual indicators (badge, button state)

---

## 🚀 Next Steps (Rekomendasi)

1. **Cart Page**: Buat screen untuk menampilkan semua items, bisa update quantity, remove, dll
2. **Persist User**: Link cart ke user account (backend sync)
3. **Checkout Flow**: Integrate dengan payment gateway
4. **Order History**: Save completed orders ke database
5. **Wishlist**: Parallel dengan cart system (sama pattern)

---

This is **production-ready cart system** bro! No database needed, but easily migrate to one. 🎉
