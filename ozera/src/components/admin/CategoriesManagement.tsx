import { useEffect, useState } from "react";
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

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
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
      await loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("هل تريد حذف هذه الفئة؟")) return;
    try {
      await deleteDoc(doc(db, "categories", categoryId));
      await loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="categories-management">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-primary">إدارة الفئات</h2>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary rounded-lg"
        >
          ➕ إضافة فئة جديدة
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="alert alert-info">
          <span>لا توجد فئات حالياً. انقر على "إضافة فئة جديدة"</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-base-100 rounded-lg shadow p-6 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-primary">{category.name}</h3>
                <p className="text-xs opacity-50 mt-1">ID: {category.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(category)}
                  className="btn btn-sm btn-warning rounded"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="btn btn-sm btn-error rounded"
                >
                  🗑️
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
