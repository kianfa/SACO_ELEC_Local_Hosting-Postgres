import { AdminLayout } from "@/components/admin/admin-layout"
import { CategoriesManagement } from "@/components/admin/categories-management"
import { getAdminCategories } from "@/lib/services/admin-categories-service"
export default async function AdminCategoriesPage() { const categories = await getAdminCategories(); return <AdminLayout title="مدیریت دسته‌بندی‌ها" subtitle="دسته‌بندی‌های محصولات، تصاویر، ترتیب نمایش و تنظیمات صفحه اصلی را مدیریت کنید."><CategoriesManagement categories={categories} /></AdminLayout> }
