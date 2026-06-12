import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { getMinimalCustomerStatusWithTrace } from "@/lib/auth/session"
import { createRequestTraceId, traceLog, withRequestTraceTiming } from "@/lib/performance/request-tracing"
export const dynamic="force-dynamic"
export async function GET(request:NextRequest){const requestId=createRequestTraceId();traceLog(`customer-status request started requestId=${requestId}`);if(!getSessionCookie(request)){return NextResponse.json({authenticated:false,user:null},{headers:{"Cache-Control":"private, no-store"}})}try{const status=await withRequestTraceTiming("customer-status route logic",requestId,()=>getMinimalCustomerStatusWithTrace(requestId));return NextResponse.json(status,{headers:{"Cache-Control":"private, no-store"}})}catch{return NextResponse.json({authenticated:false,user:null},{headers:{"Cache-Control":"private, no-store"}})}}
