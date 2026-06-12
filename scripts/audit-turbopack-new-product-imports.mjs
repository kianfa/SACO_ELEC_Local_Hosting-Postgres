import { readFileSync, existsSync } from "node:fs"
import { dirname, extname, join, normalize } from "node:path"
import process from "node:process"

const root = process.cwd()
const clientEntry = "components/admin/product-form.tsx"
const newPage = "app/admin/(protected)/products/new/page.tsx"
const editPage = "app/admin/(protected)/products/[id]/edit/page.tsx"

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8")
}

function resolveAlias(specifier) {
  if (!specifier.startsWith("@/")) return null
  const base = join(root, specifier.slice(2))
  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ]
  const match = candidates.find(existsSync)
  return match ? normalize(match).slice(root.length + 1).replaceAll("\\", "/") : null
}

function importsOf(relativePath) {
  const source = read(relativePath)
  const imports = []
  const pattern = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\sfrom\s+)?["']([^"']+)["']/g
  let match
  while ((match = pattern.exec(source))) imports.push(match[1])
  return imports
}

function assert(condition, message) {
  if (!condition) {
    console.error(`✗ ${message}`)
    process.exitCode = 1
  } else {
    console.log(`✓ ${message}`)
  }
}

const clientSource = read(clientEntry)
const newPageSource = read(newPage)
const editPageSource = read(editPage)

assert(!clientSource.includes("@/lib/actions/"), "ProductForm does not import Server Action modules")
assert(!clientSource.includes("@/lib/storage/local-media-storage"), "ProductForm does not import local-media-storage")
assert(!clientSource.includes("@/lib/supabase/server"), "ProductForm does not import the server Supabase client")
assert(!clientSource.includes("@/lib/auth/admin-auth"), "ProductForm does not import admin-auth")
assert(!/from\s+["']node:/.test(clientSource), "ProductForm does not import Node built-ins")
assert(!clientSource.includes('server-only'), "ProductForm does not import server-only")
assert(newPageSource.includes("submitAction={createProductAction}"), "new-product Server Component passes create action as a prop")
assert(newPageSource.includes("quickCreateBrandSubmitAction={quickCreateBrandAction}"), "new-product Server Component passes quick brand action as a prop")
assert(newPageSource.includes("quickCreateCategorySubmitAction={quickCreateCategoryAction}"), "new-product Server Component passes quick category action as a prop")
assert(editPageSource.includes("submitAction={updateProductAction.bind(null, product.id)}"), "edit Server Component passes bound update action as a prop")

const visited = new Set()
const visiting = []
const cycles = []
function walk(relativePath) {
  if (visiting.includes(relativePath)) {
    cycles.push([...visiting.slice(visiting.indexOf(relativePath)), relativePath])
    return
  }
  if (visited.has(relativePath)) return
  visited.add(relativePath)
  visiting.push(relativePath)
  for (const specifier of importsOf(relativePath)) {
    const resolved = resolveAlias(specifier)
    if (resolved) walk(resolved)
  }
  visiting.pop()
}
walk(clientEntry)
assert(cycles.length === 0, "ProductForm client import graph has no circular imports")

const serverOnlyReachable = [...visited].filter((relativePath) => {
  const source = read(relativePath)
  return source.includes('server-only') || /from\s+["']node:/.test(source)
})
assert(serverOnlyReachable.length === 0, "ProductForm client import graph cannot reach server-only or Node modules")

if (process.exitCode) {
  console.error("\nTurbopack new-product import audit failed.")
  process.exit(process.exitCode)
}
console.log("\nAll Turbopack new-product import checks passed.")
