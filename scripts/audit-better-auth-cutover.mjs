import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
const root=process.cwd(); const read=(p)=>readFileSync(join(root,p),"utf8")
const checks=[]; const check=(label,ok)=>{checks.push([label,ok]); console.log(`${ok?"✓":"✗"} ${label}`)}
const runtime=["app","components","lib","proxy.ts"].map((p)=>existsSync(join(root,p))?p:null).filter(Boolean)
const { execFileSync } = await import("node:child_process")
let grep=""; try{grep=execFileSync("grep",["-RInE","supabase\\.auth|createServerClient|@supabase/ssr",...runtime],{cwd:root,encoding:"utf8"})}catch(e){grep=e.stdout||""}
check("runtime Supabase Auth calls removed",grep.trim()==="")
check("Better Auth server config exists",existsSync(join(root,"lib/auth/better-auth.ts")))
check("Better Auth browser client exists",existsSync(join(root,"lib/auth/auth-client.ts")))
check("Better Auth route handler exists",existsSync(join(root,"app/api/auth/[...all]/route.ts")))
check("proxy uses Better Auth cookie helper",read("proxy.ts").includes("getSessionCookie"))
check("proxy performs no database lookup",!read("proxy.ts").includes(".from("))
check("customer registration hardcodes customer role",read("lib/services/auth-service.ts").includes('role: "customer"'))
check("admin authorization verifies profile role",read("lib/auth/admin-auth.ts").includes('user.role !== "admin"'))
check("server Supabase client is server-only",read("lib/supabase/server.ts").includes('import "server-only"'))
check("server Supabase client uses secret key",read("lib/supabase/server.ts").includes("SUPABASE_SECRET_KEY"))
check("dev command keeps Webpack",JSON.parse(read("package.json")).scripts.dev==="next dev --webpack")
check("Better Auth migration exists",existsSync(join(root,"supabase/migrations/20260606_replace_supabase_auth_with_better_auth.sql")))
check("admin bootstrap script exists",existsSync(join(root,"scripts/create-admin.ts")))
if(checks.some(([,ok])=>!ok))process.exit(1)
console.log(`\nAll ${checks.length} Better Auth cutover checks passed.`)
