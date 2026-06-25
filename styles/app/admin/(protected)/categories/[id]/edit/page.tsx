import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { CategoryForm } from "@/components/admin/category-form"
import { getAdminCategories, getAdminCategoryById } from "@/lib/services/admin-categories-service"
import { Button } from "@/components/ui/button"
export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const [category, categories] = await Promise.all([getAdminCategoryById(id), getAdminCategories()]); if (!category) return <AdminLayout title="دسته‌بندی پیدا نشد"><div className="rounded-2xl border bg-card p-8 text-center"><p>دسته‌بندی مورد نظر وجود ندارد.</p><Button asChild className="mt-4 rounded-xl"><Link href="/admin/categories">بازگشت</Link></Button></div></AdminLayout>; return <AdminLayout title="ویرایش دسته‌بندی" subtitle={category.name}><CategoryForm category={category} categories={categories} /></AdminLayout> }
