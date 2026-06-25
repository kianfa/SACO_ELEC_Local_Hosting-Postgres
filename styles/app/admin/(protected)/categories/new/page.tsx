import { AdminLayout } from "@/components/admin/admin-layout"
import { CategoryForm } from "@/components/admin/category-form"
import { getAdminCategories } from "@/lib/services/admin-categories-service"
export default async function NewCategoryPage() { const categories = await getAdminCategories(); return <AdminLayout title="افزودن دسته‌بندی جدید" subtitle="دسته‌بندی جدید را برای محصولات و صفحه اصلی ثبت کنید."><CategoryForm categories={categories} /></AdminLayout> }
