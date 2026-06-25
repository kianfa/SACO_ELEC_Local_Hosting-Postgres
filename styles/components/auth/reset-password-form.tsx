"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { resetPasswordAction, type AuthActionState } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: AuthActionState={ok:false,message:""}
export function ResetPasswordForm({token}:{token:string}){
 const [state,formAction,isPending]=useActionState(resetPasswordAction,initialState)
 useEffect(()=>{if(state.message) state.ok?toast.success(state.message):toast.error(state.message)},[state])
 return <Card className="mx-auto w-full max-w-md rounded-3xl border-border/70 shadow-xl"><CardHeader><CardTitle className="text-2xl text-primary">تغییر رمز عبور</CardTitle></CardHeader><CardContent><form action={formAction} className="space-y-5"><input type="hidden" name="token" value={token}/><div className="space-y-2"><Label htmlFor="password">رمز عبور جدید</Label><Input id="password" name="password" type="password" minLength={8} required/></div><div className="space-y-2"><Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label><Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required/></div><Button type="submit" disabled={isPending} className="h-12 w-full rounded-xl bg-primary text-base hover:bg-primary/90">{isPending?"در حال ذخیره...":"ذخیره رمز عبور جدید"}</Button><p className="text-center text-sm"><Link href="/auth/login" className="font-medium text-primary">بازگشت به ورود</Link></p></form></CardContent></Card>
}
