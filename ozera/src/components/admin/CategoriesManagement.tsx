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
      // Handle AbortError gracefully - occurs when component unmounts during query
      if (error instanceof Error && error.name === "AbortError") {
        console.debug("Categories query was aborted (expected on unmount)");
        return;
      }

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
      // Handle AbortError gracefully
      if (error instanceof Error && error.name === "AbortError") {
        console.debug("Category save was aborted (expected on unmount)");
        return;
      }

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
      // Handle AbortError gracefully
      if (error instanceof Error && error.name === "AbortError") {
        console.debug("Category delete was aborted (expected on unmount)");
        return;
      }

      if (isMountedRef.current) {
        console.error("Error deleting category:", error);
      }
    }
  };

  return (
    <div className="categories-management">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">📂 إدارة الفئات</h2>
          <p className="text-slate-600">إنشاء وتعديل وحذف فئات المنتجات</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg font-semibold"
        >
          ➕ إضافة فئة جديدة
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-green-600" />
            <p className="mt-4 text-slate-600">جاري تحميل الفئات...</p>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="alert bg-green-50 border border-green-200 text-green-900 rounded-lg">
          <span>🎯 لا توجد فئات حالياً. انقر على "إضافة فئة جديدة"</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-base-200 rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">{category.name}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(category)}
                  className="flex-1 btn btn-xs bg-green-600 hover:bg-green-700 text-white border-0 rounded"
                >
                  ✏️ تعديل
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex-1 btn btn-xs bg-red-600 hover:bg-red-700 text-white border-0 rounded"
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
              <div className="form-control flex gap-4">
                <label className="label">
                  <span className="label-text">اسم الفئة</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="input input-bordered"
                  placeholder="مثال: ك��يمات الترطيب"
                  required
                />
              </div>

              <div className="modal-action gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-sm bg-slate-200 hover:bg-slate-300 text-slate-900 border-0 rounded-lg"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg">
                  {editingCategory ? "💾 حفظ التغييرات" : "➕ إضافة"}
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
