import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLMNvYJcfNiYbFzMpfmcrAAst8EVhZfEI",
  authDomain: "ozera-eg.firebaseapp.com",
  projectId: "ozera-eg",
  storageBucket: "ozera-eg.firebasestorage.app",
  messagingSenderId: "50265366064",
  appId: "1:50265366064:web:2511e7802a07779b6957f5",
  measurementId: "G-K7W98RBMWL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  { categoryName: "زيوت الوجه" },
  { categoryName: "كريمات الترطيب" },
  { categoryName: "مقشرات طبيعية" },
  { categoryName: "أقنعة العناية" },
  { categoryName: "سيرامات وأمصال" }
];

const products = [
  {
    name: "زيت الورد والزيتون",
    description: "زيت طبيعي معالج بالأوزون لترطيب وتغذية البشرة",
    price: 299,
    categoryId: "زيوت الوجه",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"
  },
  {
    name: "كريم الأرغان المرطب",
    description: "كريم غني بزيت الأرغان الطبيعي للبشرة الجافة",
    price: 349,
    categoryId: "كريمات الترطيب",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"
  },
  {
    name: "كريم اللافندر والحليب",
    description: "مرطب فاخر برائحة اللافندر الطبيعية",
    price: 329,
    categoryId: "كريمات الترطيب",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"
  },
  {
    name: "مقشر القهوة الطبيعي",
    description: "مقشر لطيف بدقائق القهوة الطبيعية لإزالة الجلد الميت",
    price: 249,
    categoryId: "مقشرات طبيعية",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-af7c619b3fbb?w=500&h=500&fit=crop"
  },
  {
    name: "مقشر الشوفان والعسل",
    description: "مقشر ناعم مع الشوفان والعسل الطبيعي",
    price: 269,
    categoryId: "مقشرات طبيعية",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-af7c619b3fbb?w=500&h=500&fit=crop"
  },
  {
    name: "قناع الطين الأسود",
    description: "قناع تنقية عميقة بالطين الأسود والفحم النشط",
    price: 279,
    categoryId: "أقنعة العناية",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-af7c619b3fbb?w=500&h=500&fit=crop"
  },
  {
    name: "قناع الزعفران والعسل",
    description: "قناع مرطب فاخر بالزعفران والعسل الطبيعي",
    price: 349,
    categoryId: "أقنعة العناية",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-af7c619b3fbb?w=500&h=500&fit=crop"
  },
  {
    name: "سيرم الشاي الأخضر",
    description: "أمصال مركز بالشاي الأخضر لتنعيم وتفتيح البشرة",
    price: 399,
    categoryId: "سيرامات وأمصال",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"
  },
  {
    name: "سيرم فيتامين سي",
    description: "أمصال قوية بفيتامين سي لتعزيز الإضاءة والحيوية",
    price: 449,
    categoryId: "سيرامات وأمصال",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"
  },
  {
    name: "سيرم الروز هيب",
    description: "أمصال طبيعي من زيت الروز هيب لتجديد البشرة",
    price: 379,
    categoryId: "سيرامات وأمصال",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"
  },
  {
    name: "زيت جوز الهند العضوي",
    description: "زيت جوز الهند الطبيعي النقي للعناية الشاملة",
    price: 279,
    categoryId: "زيوت الوجه",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"
  },
  {
    name: "زيت الجزر والطماطم",
    description: "زيت مغذي بمستخلصات الجزر والطماطم الطبيعية",
    price: 319,
    categoryId: "زيوت الوجه",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"
  }
];

async function seedDatabase() {
  try {
    console.log("🌱 جاري إضافة البيانات الاختبارية...\n");

    // Add categories
    console.log("📂 إضافة الفئات:");
    const categoryMap = {};
    for (const category of categories) {
      const docRef = await addDoc(collection(db, "categories"), category);
      categoryMap[category.categoryName] = docRef.id;
      console.log(`✓ تمت إضافة فئة: ${category.categoryName}`);
    }

    console.log("\n📦 إضافة المنتجات:");
    for (const product of products) {
      const categoryId = categoryMap[product.categoryId];
      const productData = {
        ...product,
        categoryId: categoryId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      await addDoc(collection(db, "products"), productData);
      console.log(`✓ تمت إضافة منتج: ${product.name}`);
    }

    console.log("\n✅ تمت إضافة البيانات بنجاح!");
    console.log(`- عدد الفئات: ${categories.length}`);
    console.log(`- عدد المنتجات: ${products.length}`);
    console.log("\n🚀 يمكنك الآن رؤية المنتجات والفئات في التطبيق!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ حدث خطأ:", error.message);
    process.exit(1);
  }
}

seedDatabase();
