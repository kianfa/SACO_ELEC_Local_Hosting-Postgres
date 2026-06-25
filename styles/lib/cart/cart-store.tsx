"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

const CART_STORAGE_KEY = "industrial-electrical-cart-v1"
const FALLBACK_MAX_QUANTITY = 99

export interface CartItem {
  lineId: string
  productId: string
  variantId: string | null
  variantGroupTitle: string | null
  variantLabel: string | null
  slug: string
  name: string
  model: string | null
  sku: string | null
  brandName: string | null
  price: number
  oldPrice: number | null
  mainImageUrl: string | null
  quantity: number
  stockQuantity: number
}

export type AddToCartProduct = Omit<CartItem, "lineId" | "quantity">
export interface CartTotals { subtotal: number; discount: number; payable: number; totalQuantity: number; uniqueItems: number }
interface CartContextValue { items: CartItem[]; isHydrated: boolean; addToCart: (product: AddToCartProduct, quantity?: number) => boolean; removeFromCart: (lineId: string) => void; increaseQuantity: (lineId: string) => void; decreaseQuantity: (lineId: string) => void; updateQuantity: (lineId: string, quantity: number) => void; clearCart: () => void; getCartTotal: () => number; getCartItemsCount: () => number; totals: CartTotals }
const CartContext = createContext<CartContextValue | null>(null)
function normalizeQuantity(quantity: number) { return Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1 }
function getMaxAllowedQuantity(stockQuantity: number) { return stockQuantity > 0 ? stockQuantity : FALLBACK_MAX_QUANTITY }
export function getCartLineId(productId: string, variantId?: string | null) { return `${productId}::${variantId ?? "simple"}` }
function calculateTotals(items: CartItem[]): CartTotals { return items.reduce((totals, item) => { const quantity=normalizeQuantity(item.quantity); const lineSubtotal=(item.oldPrice ?? item.price)*quantity; const linePayable=item.price*quantity; totals.subtotal+=lineSubtotal; totals.payable+=linePayable; totals.discount+=Math.max(0,lineSubtotal-linePayable); totals.totalQuantity+=quantity; totals.uniqueItems+=1; return totals }, {subtotal:0,discount:0,payable:0,totalQuantity:0,uniqueItems:0}) }
function parseStoredCart(value: string | null): CartItem[] { if(!value)return[]; try { const parsed=JSON.parse(value); if(!Array.isArray(parsed))return[]; return parsed.filter((item)=>item&&typeof item.productId==="string"&&typeof item.slug==="string"&&typeof item.name==="string"&&typeof item.price==="number"&&typeof item.quantity==="number").map((item)=>{ const variantId=typeof item.variantId==="string"&&item.variantId?item.variantId:null; return {...item,lineId:getCartLineId(item.productId,variantId),variantId,variantGroupTitle:item.variantGroupTitle??null,variantLabel:item.variantLabel??null,quantity:Math.min(normalizeQuantity(item.quantity),getMaxAllowedQuantity(Number(item.stockQuantity)||0)),stockQuantity:Number(item.stockQuantity)||0,oldPrice:typeof item.oldPrice==="number"?item.oldPrice:null,model:item.model??null,sku:item.sku??null,brandName:item.brandName??null,mainImageUrl:item.mainImageUrl??null} }) } catch { return [] } }
function showStockWarning(){toast.warning("تعداد انتخاب‌شده بیشتر از موجودی انبار است")}
export function CartProvider({children}:{children:ReactNode}) { const[items,setItems]=useState<CartItem[]>([]); const[isHydrated,setIsHydrated]=useState(false); useEffect(()=>{setItems(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));setIsHydrated(true)},[]); useEffect(()=>{if(isHydrated)window.localStorage.setItem(CART_STORAGE_KEY,JSON.stringify(items))},[isHydrated,items]);
 const addToCart=useCallback((product:AddToCartProduct,quantity=1)=>{const requested=normalizeQuantity(quantity),max=getMaxAllowedQuantity(product.stockQuantity),lineId=getCartLineId(product.productId,product.variantId); if(product.stockQuantity===0){toast.error("این محصول در حال حاضر ناموجود است");return false} let added=false,limited=false; setItems(current=>{const existing=current.find(i=>i.lineId===lineId),next=(existing?.quantity??0)+requested,safe=Math.min(next,max); if(safe<next)limited=true; if(existing){if(safe===existing.quantity)return current;added=true;return current.map(i=>i.lineId===lineId?{...i,...product,lineId,quantity:safe}:i)} if(safe<=0)return current;added=true;return[...current,{...product,lineId,quantity:safe}]}); if(limited)showStockWarning(); if(added)toast.success("محصول به سبد خرید اضافه شد"); return added},[])
 const removeFromCart=useCallback((lineId:string)=>setItems(current=>current.filter(i=>i.lineId!==lineId)),[])
 const updateQuantity=useCallback((lineId:string,quantity:number)=>{const requested=normalizeQuantity(quantity);setItems(current=>current.map(item=>{if(item.lineId!==lineId)return item;const max=getMaxAllowedQuantity(item.stockQuantity);if(requested>max)showStockWarning();return{...item,quantity:Math.min(requested,max)}}))},[])
 const increaseQuantity=useCallback((lineId:string)=>{const item=items.find(i=>i.lineId===lineId);if(item)updateQuantity(lineId,item.quantity+1)},[items,updateQuantity]); const decreaseQuantity=useCallback((lineId:string)=>{const item=items.find(i=>i.lineId===lineId);if(!item)return;if(item.quantity<=1)removeFromCart(lineId);else updateQuantity(lineId,item.quantity-1)},[items,removeFromCart,updateQuantity]); const clearCart=useCallback(()=>setItems([]),[]); const totals=useMemo(()=>calculateTotals(items),[items]); const getCartTotal=useCallback(()=>totals.payable,[totals.payable]); const getCartItemsCount=useCallback(()=>totals.totalQuantity,[totals.totalQuantity]); const value=useMemo(()=>({items,isHydrated,addToCart,removeFromCart,increaseQuantity,decreaseQuantity,updateQuantity,clearCart,getCartTotal,getCartItemsCount,totals}),[items,isHydrated,addToCart,removeFromCart,increaseQuantity,decreaseQuantity,updateQuantity,clearCart,getCartTotal,getCartItemsCount,totals]); return <CartContext.Provider value={value}>{children}</CartContext.Provider> }
export function useCart(){const context=useContext(CartContext);if(!context)throw new Error("useCart must be used inside CartProvider");return context}
