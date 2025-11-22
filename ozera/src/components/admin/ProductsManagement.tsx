import { useEffect, useState } from "react";
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
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
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    try {
      await deleteDoc(doc(db, "products", productId));
      await loadData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "غير معروفة";
  };

  return (
    <div className="products-management">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-primary">إدارة المنتجات</h2>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary rounded-lg"
        >
          ➕ إضافة منتج جديد
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="alert alert-info">
          <span>لا توجد منتجات حالياً. انقر على "إضافة منتج جديد"</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
          <table className="table">
            <thead className="bg-primary text-primary-content">
              <tr>
                <th>الصورة</th>
                <th>الاسم</th>
                <th>الفئة</th>
                <th>السعر</th>
                <th>الوصف</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="avatar">
                      <div className="w-12 h-12 rounded">
                        <img src={product.imageUrl} alt={product.name} />
                      </div>
                    </div>
                  </td>
                  <td className="font-semibold">{product.name}</td>
                  <td>{getCategoryName(product.categoryId)}</td>
                  <td className="text-primary font-bold">{product.price} ج.م</td>
                  <td className="max-w-xs truncate">{product.description}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="btn btn-sm btn-warning rounded"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="btn btn-sm btn-error rounded"
                      >
                        🗑️
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
              <div className="form-control">
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

              <div className="form-control">
                <label className="label">
                  <span className="label-text">ا��وصف</span>
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

              <div className="form-control">
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

              <div className="form-control">
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

              <div className="form-control">
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
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? "حف�� التغييرات" : "إضافة"}
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
