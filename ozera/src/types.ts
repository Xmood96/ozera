
/* ========== الفئات ========== */
export interface Category {
    id: string;
  name: string;    // اسم الفئة
}

/* ========== المنتجات ========== */
export interface Product {
  id: string;
  name: string;        // اسم المنتج
  description: string; // وصف
  price: number;       // السعر
  imageUrl: string;    // رابط الصورة
  categoryId: string;  // الفئة المرتبطة
  createdAt?: number;  // تاريخ الإنشاء (اختياري)
  updatedAt?: number;  // تاريخ التحديث
}

/* ========== المستخدمين ========== */
export interface UserProfile {
  uid: string;         // ID المستخدم في Firebase Auth
  name: string;        // اسم المستخدم
  email: string;       // الإيميل
  photoUrl?: string;   // رابط الصورة (اختياري)
}

/* ========== عناصر العربة ========== */
export interface CartItem {
  productId: string;        // ID المنتج
  name: string;             // اسم المنتج
  price: number;            // سعر المنتج الحالي
  quantity: number;         // الكمية المختارة
  imageUrl: string;         // صورة المنتج
  total: number;            // السعر الإجمالي للمنتج = price * quantity
}

/* ========== العربة الكاملة ========== */
export interface Cart {
  userId: string;           // ID صاحب العربة
  items: CartItem[];        // جميع العناصر
  totalPrice: number;       // المجموع الكلي
  updatedAt: number;        // آخر تحديث
}