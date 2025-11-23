import { useState, useRef, useEffect } from "react";
import { getCategories } from "../../lib/firestore";
import { collection, deleteDoc, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import type { Category } from "../../types";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadCategories();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCategories = async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    try {
      const data = await getCategories();

      if (!isMountedRef.current) return;

      setCategories(data);
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Error loading categories:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMountedRef.current) return;

    try {
      if (editingCategory) {
        // Update category
        const categoryRef = doc(db, "categories", editingCategory.id);
        await updateDoc(categoryRef, {
          categoryName: categoryName,
        });
      } else {
        // Add new category
        await addDoc(collection(db, "categories"), {
          categoryName: categoryName,
        });
      }

      if (isMountedRef.current) {
        await loadCategories();
        handleCloseModal();
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error saving category:", error);
      }
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("هل تريد حذف هذه الفئة؟")) return;
    if (!isMountedRef.current) return;

    try {
      await deleteDoc(doc(db, "categories", categoryId));

      if (isMountedRef.current) {
        await loadCategories();
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error deleting category:", error);
      }
    }
  };

  return (
    <div className="categories-management">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-bold text-primary mb-2">📂 إدارة الفئات</h2>
          <p className="text-base-content opacity-60">إنشاء وتعديل وحذف فئات المنتجات</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary rounded-lg font-bold shadow-lg hover:shadow-xl transition-shadow"
        >
          ➕ إضافة فئة جديدة
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="mt-4 text-base-content opacity-60">جاري تحميل الفئات...</p>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="alert alert-info bg-blue-50 border-blue-200 text-blue-900">
          <span>🎯 لا توجد فئات حالياً. انقر على "إضافة فئة جديدة"</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-gradient-to-br from-base-100 to-base-200 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-6 flex flex-col items-start justify-between border border-base-300"
            >
              <div className="w-full mb-4">
                <h3 className="text-2xl font-bold text-primary">{category.name}</h3>
                <p className="text-xs opacity-50 mt-2 break-all">ID: {category.id}</p>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => handleOpenModal(category)}
                  className="btn btn-sm btn-warning rounded-lg flex-1 font-semibold"
                >
                  ✏️ تعديل
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="btn btn-sm btn-error rounded-lg flex-1 font-semibold"
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">
              {editingCategory ? "تعديل فئة" : "إضافة فئة جديدة"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">اسم الفئة</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="input input-bordered"
                  placeholder="مثال: كريمات التر��يب"
                  required
                />
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
                  {editingCategory ? "حفظ التغييرات" : "إضافة"}
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
