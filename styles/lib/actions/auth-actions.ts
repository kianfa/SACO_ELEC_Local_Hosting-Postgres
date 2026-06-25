"use server"

import { redirect } from "next/navigation"
import { loginAdminWithEmailPassword, loginCustomerWithEmailPassword, registerCustomerWithEmailPassword, resetCustomerPassword, sendCustomerPasswordResetEmail } from "@/lib/services/auth-service"
import { signOutAdmin } from "@/lib/auth/admin-auth"
import { signOutCustomer } from "@/lib/auth/customer-auth"
import { verifyTurnstileToken } from "@/lib/auth/turnstile"
import { checkAdminLoginRateLimit, clearAdminLoginRateLimit } from "@/lib/auth/admin-login-rate-limit"

export type LoginActionState = { ok: boolean; message: string }
export type AuthActionState = { ok: boolean; message: string }

export async function loginAdminAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) return { ok: false, message: "ایمیل و رمز عبور الزامی است" }

  const rateLimit = await checkAdminLoginRateLimit(email)
  if (!rateLimit.allowed) return { ok: false, message: rateLimit.message }

  const result = await loginAdminWithEmailPassword(email, password)
  if (!result.ok) return result

  await clearAdminLoginRateLimit(email)
  redirect("/admin/products")
}
export async function logoutAdminAction(){ await signOutAdmin(); redirect("/admin/login") }

export async function loginCustomerAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email=String(formData.get("email")??"").trim(), password=String(formData.get("password")??""), captchaToken=String(formData.get("turnstileToken")??"")
  if(!email||!password) return {ok:false,message:"ایمیل و رمز عبور الزامی است"}
  const captcha=await verifyTurnstileToken(captchaToken); if(!captcha.ok) return {ok:false,message:captcha.message}
  const result=await loginCustomerWithEmailPassword(email,password); if(!result.ok) return result
  redirect("/account")
}

export async function registerCustomerAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const fullName=String(formData.get("fullName")??"").trim(), phone=String(formData.get("phone")??"").trim(), email=String(formData.get("email")??"").trim(), password=String(formData.get("password")??""), confirmPassword=String(formData.get("confirmPassword")??""), captchaToken=String(formData.get("turnstileToken")??"")
  if(!fullName||!phone||!email||!password||!confirmPassword) return {ok:false,message:"همه فیلدهای الزامی را تکمیل کنید"}
  if(password.length<8) return {ok:false,message:"رمز عبور باید حداقل ۸ کاراکتر باشد"}
  if(password!==confirmPassword) return {ok:false,message:"رمز عبور و تکرار آن یکسان نیستند"}
  const captcha=await verifyTurnstileToken(captchaToken); if(!captcha.ok) return {ok:false,message:captcha.message}
  const result=await registerCustomerWithEmailPassword({fullName,phone,email,password}); if(!result.ok) return result
  redirect("/account")
}

export async function forgotPasswordAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email=String(formData.get("email")??"").trim(); if(!email) return {ok:false,message:"ایمیل الزامی است"}
  await sendCustomerPasswordResetEmail(email)
  return {ok:true,message:"اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی ارسال می‌شود."}
}

export async function resetPasswordAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const token=String(formData.get("token")??""), password=String(formData.get("password")??""), confirmPassword=String(formData.get("confirmPassword")??"")
  if(!token) return {ok:false,message:"لینک بازیابی نامعتبر است."}
  if(password.length<8) return {ok:false,message:"رمز عبور باید حداقل ۸ کاراکتر باشد"}
  if(password!==confirmPassword) return {ok:false,message:"رمز عبور و تکرار آن یکسان نیستند"}
  const result = await resetCustomerPassword(token,password)
  return result.ok ? {ok:true,message:"رمز عبور با موفقیت تغییر کرد."} : result
}

export async function logoutCustomerAction(){ await signOutCustomer(); redirect("/") }
