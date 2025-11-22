import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

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
const auth = getAuth(app);

async function createAdminUser() {
  try {
    console.log("🚀 جاري إنشاء حساب مسؤول...\n");

    const adminEmail = "admin@ozera.com";
    const adminPassword = "admin123";

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        adminPassword
      );

      console.log("✅ تم إنشاء حساب مسؤول بنجاح!");
      console.log("\n📧 بيانات الدخول:");
      console.log(`البريد الإلكتروني: ${adminEmail}`);
      console.log(`كلمة المرور: ${adminPassword}`);
      console.log(`UID: ${userCredential.user.uid}\n`);
      console.log("🔐 استخدم هذه البيانات لتسجيل الدخول إلى لوحة التحكم\n");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        console.log("⚠️ حساب المسؤول موجود بالفعل\n");
        console.log("📧 بيانات الدخول:");
        console.log("البريد الإلكتروني: admin@ozera.com");
        console.log("كلمة المرور: admin123\n");
      } else {
        throw error;
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ حدث خطأ:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

createAdminUser();