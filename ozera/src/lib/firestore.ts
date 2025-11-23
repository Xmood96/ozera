import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import type { Product, Category } from "../types";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id?: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: Timestamp;
  status: "pending" | "paid" | "in_delivery" | "completed" | "cancelled";
  customerPhone?: string;
  deliveryAddress?: string;
}

// Fetch all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().categoryName,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Fetch all products or by category
export async function getProducts(categoryId?: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products");
    let q;

    if (categoryId && categoryId !== "all") {
      q = query(productsRef, where("categoryId", "==", categoryId));
    } else {
      q = query(productsRef);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Save order to Firebase
export async function saveOrder(order: Order): Promise<string> {
  try {
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, {
      items: order.items,
      totalAmount: order.totalAmount,
      createdAt: Timestamp.now(),
      status: "pending",
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving order:", error);
    throw error;
  }
}
