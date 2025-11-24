import { useState, useRef, useEffect } from "react";
import { getProducts, getCategories } from "../../lib/firestore";
import { collection, deleteDoc, doc, updateDoc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import type { Product, Category } from "../../types";

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    categoryId: "",
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadData = async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      if (!isMountedRef.current) return;

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Error loading data:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        categoryId: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMountedRef.current) return;

    try {
      if (editingProduct) {
        // Update product
        const productRef = doc(db, "products", editingProduct.id);
        await updateDoc(productRef, {
          ...formData,
          updatedAt: Timestamp.now(),
        });
      } else {
        // Add new product
        await addDoc(collection(db, "products"), {
          ...formData,
          price: Number(formData.price),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      if (isMountedRef.current) {
        await loadData();
        handleCloseModal();
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error saving product:", error);
      }
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    if (!isMountedRef.current) return;

    try {
      await deleteDoc(doc(db, "products", productId));

      if (isMountedRef.current) {
        await loadData();
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "غير معروفة";
  };

  return (
    <div className="products-management">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">📦 إدارة المنتجات</h2>
          <p className="text-slate-600">إضافة وتعديل وحذف المنتجات</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg font-semibold shadow-md"
        >
          ➕ إضافة منتج جديد
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-blue-600" />
            <p className="mt-4 text-slate-600">جاري تحميل المنتجات...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="alert bg-blue-50 border border-blue-200 text-blue-900 rounded-lg">
          <span>🎯 لا توجد منتجات حالياً. انقر على "إضافة منتج جديد"</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-slate-900">الصورة</th>
                <th className="text-slate-900">الاسم</th>
                <th className="text-slate-900">الفئة</th>
                <th className="text-slate-900">السعر</th>
                <th className="text-slate-900">الوصف</th>
                <th className="text-slate-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td>
                    <div className="avatar">
                      <div className="w-12 h-12 rounded">
                        <img src={product.imageUrl} alt={product.name} />
                      </div>
                    </div>
                  </td>
                  <td className="font-semibold text-slate-900">{product.name}</td>
                  <td className="text-slate-700">{getCategoryName(product.categoryId)}</td>
                  <td className="font-bold text-blue-600">{product.price} ج.م</td>
                  <td className="max-w-xs truncate text-slate-600">{product.description}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="btn btn-xs bg-blue-600 hover:bg-blue-700 text-white border-0 rounded"
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-0 rounded"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">
              {editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control flex gap-4 ">
                <label className="label">
                  <span className="label-text">اسم المنتج</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control flex gap-7 ">
                <label className="label">
                  <span className="label-text">الوصف</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="textarea textarea-bordered"
                  required
                />
              </div>

              <div className="form-control flex gap-10 ">
                <label className="label">
                  <span className="label-text">السعر</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control flex gap-4 ">
                <label className="label">
                  <span className="label-text">رابط الصورة</span>
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control flex gap-12">
                <label className="label">
                  <span className="label-text">الفئة</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="select select-bordered"
                  required
                >
                  <option value="">اختر فئة</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-outline"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingProduct ? "حفظ التغييرات" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={handleCloseModal}
          />
        </div>
      )}
    </div>
  );
}
