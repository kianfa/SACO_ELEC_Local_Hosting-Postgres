import { ResetPasswordForm } from "@/components/auth/reset-password-form"
export default async function ResetPasswordPage({searchParams}:{searchParams:Promise<{token?:string}>}){const {token=""}=await searchParams;return <main className="container mx-auto px-4 py-12"><ResetPasswordForm token={token}/></main>}
