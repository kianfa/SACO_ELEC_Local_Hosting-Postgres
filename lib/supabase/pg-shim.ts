// ---------------------------------------------------------------------------
// pg-shim.ts  — Supabase client API shim backed by a direct pg Pool.
//
// Relation resolution strategy:
//   • Many-to-one  (FK in main table, e.g. products.brand_id → brands):
//       Resolved via LEFT JOIN on the related table using the FK column.
//   • One-to-many  (FK in child table, e.g. product_images.product_id → products):
//       Resolved via a separate SELECT … WHERE child.parent_id IN (ids),
//       then grouped and attached as arrays.
//
// The direction is detected by checking whether the parsed FK column
// exists in the main table's result row.
// ---------------------------------------------------------------------------

import { Pool } from "pg"

let _pool: Pool | null = null
function getPool(): Pool {
  if (!_pool) _pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return _pool
}

// ---------------------------------------------------------------------------
// Select parser
// ---------------------------------------------------------------------------

type RelationSpec = { table: string; cols: string[]; relations: RelationSpec[]; alias?: string }

// Supabase can infer foreign-key direction from the database schema. The direct
// PostgreSQL shim needs a small equivalent map for relations whose FK lives on
// the selected row but is not part of the requested column list. Without this,
// products -> brands/categories can be mistaken for one-to-many relations and
// the shim incorrectly queries brands.product_id or categories.product_id.
const MANY_TO_ONE_FOREIGN_KEYS: Record<string, Record<string, string>> = {
  products: {
    brands: "brand_id",
    categories: "category_id",
  },
  purchase_request_items: {
    products: "product_id",
  },
}

function splitTopLevel(input: string): string[] {
  const tokens: string[] = []
  let depth = 0
  let current = ""

  for (const ch of input) {
    if (ch === "(") depth++
    if (ch === ")") depth--

    if (ch === "," && depth === 0) {
      if (current.trim()) tokens.push(current.trim())
      current = ""
      continue
    }

    current += ch
  }

  if (current.trim()) tokens.push(current.trim())
  return tokens
}

function parseSelect(select: string): { primary: string[]; relations: RelationSpec[] } {
  const primary: string[] = []
  const relations: RelationSpec[] = []

  for (const token of splitTopLevel(select)) {
    const relationMatch = token.match(/^(?:(\w+):)?(\w+)\(([\s\S]*)\)$/)
    if (relationMatch) {
      const nested = parseSelect(relationMatch[3])
      relations.push({
        alias: relationMatch[1] || undefined,
        table: relationMatch[2],
        cols: nested.primary,
        relations: nested.relations,
      })
      continue
    }

    if (token === "*" || /^\w+(\s+\w+)?$/.test(token)) primary.push(token.trim())
  }

  return { primary, relations }
}

function hiddenForeignKeys(table: string, primary: string[], relations: RelationSpec[]): Set<string> {
  const explicitForeignKeys = MANY_TO_ONE_FOREIGN_KEYS[table] ?? {}
  return new Set(
    relations
      .map((relation) => explicitForeignKeys[relation.table])
      .filter((column): column is string => Boolean(column) && !primary.includes("*") && !primary.includes(column)),
  )
}

function selectColumns(columns: string[]): string {
  if (columns.includes("*")) return "*"
  return [...new Set(columns)].map((column) => `"${column}"`).join(", ")
}

async function attachRelations(
  pool: Pool,
  table: string,
  inputRows: Record<string, unknown>[],
  relations: RelationSpec[],
): Promise<Record<string, unknown>[]> {
  let rows = inputRows
  const explicitForeignKeys = MANY_TO_ONE_FOREIGN_KEYS[table] ?? {}

  for (const relation of relations) {
    const outputKey = relation.alias ?? relation.table
    const nestedHiddenCols = hiddenForeignKeys(relation.table, relation.cols, relation.relations)
    const nestedSelectCols = relation.cols.includes("*")
      ? relation.cols
      : [...relation.cols, ...nestedHiddenCols]

    const singular = relation.table.replace(/s$/, "").replace(/ie$/, "y")
    const candidates = [`${singular}_id`, `${relation.table}_id`]
    const fkInMain = explicitForeignKeys[relation.table] ?? candidates.find((candidate) => candidate in (rows[0] ?? {}))

    if (fkInMain) {
      // Many-to-one: FK is in the main table row (e.g. purchase_request_items.product_id -> products.id).
      const ids = [...new Set(rows.map((row) => row[fkInMain]).filter((value) => value != null))]
      if (!ids.length) {
        rows = rows.map((row) => ({ ...row, [outputKey]: null }))
        continue
      }

      const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ")
      const relatedColumns = selectColumns(["id", ...nestedSelectCols])
      const relatedResult = await pool.query(
        `SELECT ${relatedColumns} FROM public."${relation.table}" WHERE "id" IN (${placeholders})`,
        ids,
      )

      let relatedRows = relatedResult.rows as Record<string, unknown>[]
      relatedRows = await attachRelations(pool, relation.table, relatedRows, relation.relations)
      if (nestedHiddenCols.size) {
        relatedRows = relatedRows.map((row) => {
          const sanitized = { ...row }
          for (const column of nestedHiddenCols) delete sanitized[column]
          return sanitized
        })
      }

      const relatedMap = new Map(relatedRows.map((row) => [String(row.id), row]))
      rows = rows.map((row) => ({
        ...row,
        [outputKey]: row[fkInMain] != null ? (relatedMap.get(String(row[fkInMain])) ?? null) : null,
      }))
      continue
    }

    // One-to-many: FK is in the child table (e.g. product_images.product_id -> products.id).
    const mainSingular = table.replace(/s$/, "")
    const childFk = `${mainSingular}_id`
    const parentIds = [...new Set(rows.map((row) => row.id).filter((value) => value != null))]

    if (!parentIds.length) {
      rows = rows.map((row) => ({ ...row, [outputKey]: [] }))
      continue
    }

    const placeholders = parentIds.map((_, index) => `$${index + 1}`).join(", ")
    const childColumns = selectColumns([childFk, ...nestedSelectCols])
    const childResult = await pool.query(
      `SELECT ${childColumns} FROM public."${relation.table}" WHERE "${childFk}" IN (${placeholders})`,
      parentIds,
    )

    let childRows = childResult.rows as Record<string, unknown>[]
    childRows = await attachRelations(pool, relation.table, childRows, relation.relations)
    if (nestedHiddenCols.size) {
      childRows = childRows.map((row) => {
        const sanitized = { ...row }
        for (const column of nestedHiddenCols) delete sanitized[column]
        return sanitized
      })
    }

    const grouped = new Map<string, Record<string, unknown>[]>()
    for (const childRow of childRows) {
      const key = String(childRow[childFk])
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(childRow)
    }

    rows = rows.map((row) => ({ ...row, [outputKey]: grouped.get(String(row.id)) ?? [] }))
  }

  return rows
}

// ---------------------------------------------------------------------------
// WHERE builder (shared)
// ---------------------------------------------------------------------------

type WhereClause = { col: string; op: string; val: unknown }
type OrderClause = { col: string; ascending: boolean; nullsFirst?: boolean }

function buildWhere(wheres: WhereClause[], orRaws: string[], params: unknown[], tablePrefix = ""): string {
  const prefix = tablePrefix ? `"${tablePrefix}".` : ""
  const parts: string[] = []

  for (const w of wheres) {
    if (w.op === "__never__") { parts.push("FALSE"); continue }
    if (w.op === "IN") {
      const vals = w.val as unknown[]
      if (!vals.length) { parts.push("FALSE"); continue }
      const placeholders = vals.map((_, i) => `$${params.length + i + 1}`).join(", ")
      params.push(...vals)
      parts.push(`${prefix}"${w.col}" IN (${placeholders})`)
      continue
    }
    if (w.val === null && w.op === "=") { parts.push(`${prefix}"${w.col}" IS NULL`); continue }
    if (w.val === null && w.op === "!=") { parts.push(`${prefix}"${w.col}" IS NOT NULL`); continue }
    params.push(w.val)
    parts.push(`${prefix}"${w.col}" ${w.op} $${params.length}`)
  }

  for (const orRaw of orRaws) {
    const orParts = orRaw.split(",").map((segment) => {
      const firstDot = segment.indexOf(".")
      const col = segment.slice(0, firstDot)
      const rest = segment.slice(firstDot + 1)
      const secondDot = rest.indexOf(".")
      const op = rest.slice(0, secondDot)
      const val = rest.slice(secondDot + 1)
      if (op === "is" && val === "null") return `${prefix}"${col}" IS NULL`
      if (op === "ilike") { params.push(val); return `${prefix}"${col}" ILIKE $${params.length}` }
      if (op === "lte") { params.push(val); return `${prefix}"${col}" <= $${params.length}` }
      if (op === "gte") { params.push(val); return `${prefix}"${col}" >= $${params.length}` }
      if (op === "lt") { params.push(val); return `${prefix}"${col}" < $${params.length}` }
      if (op === "eq") { params.push(val); return `${prefix}"${col}" = $${params.length}` }
      return "TRUE"
    })
    if (orParts.length) parts.push(`(${orParts.join(" OR ")})`)
  }

  return parts.length ? `WHERE ${parts.join(" AND ")}` : ""
}

// ---------------------------------------------------------------------------
// Query builder
// ---------------------------------------------------------------------------

class PgQueryBuilder {
  private _table: string
  private _select = "*"
  private _wheres: WhereClause[] = []
  private _orRaws: string[] = []
  private _orders: OrderClause[] = []
  private _limit: number | null = null
  private _isCountHead = false

  constructor(table: string) { this._table = table }

  select(cols: string, opts?: { count?: string; head?: boolean }): this {
    this._select = cols
    if (opts?.head) this._isCountHead = true
    return this
  }

  eq(col: string, val: unknown): this { this._wheres.push({ col, op: "=", val }); return this }
  neq(col: string, val: unknown): this { this._wheres.push({ col, op: "!=", val }); return this }
  in(col: string, vals: unknown[]): this {
    if (!vals.length) { this._wheres.push({ col, op: "__never__", val: null }); return this }
    this._wheres.push({ col, op: "IN", val: vals }); return this
  }
  or(raw: string): this { this._orRaws.push(raw); return this }
  gte(col: string, val: unknown): this { this._wheres.push({ col, op: ">=", val }); return this }
  lt(col: string, val: unknown): this { this._wheres.push({ col, op: "<", val }); return this }
  lte(col: string, val: unknown): this { this._wheres.push({ col, op: "<=", val }); return this }
  ilike(col: string, val: unknown): this { this._wheres.push({ col, op: "ILIKE", val }); return this }
  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }): this {
    this._orders.push({ col, ascending: opts?.ascending ?? true, nullsFirst: opts?.nullsFirst })
    return this
  }
  limit(n: number): this { this._limit = n; return this }
  abortSignal(_signal: AbortSignal): this { return this }

  // -------------------------------------------------------------------------
  // Core executor
  // -------------------------------------------------------------------------
  private async _run(): Promise<{ data: unknown[] | null; count?: number | null; error: null }> {
    const pool = getPool()
    const params: unknown[] = []
    const { primary, relations } = parseSelect(this._select)

    if (this._isCountHead) {
      const where = buildWhere(this._wheres, this._orRaws, params)
      const r = await pool.query(`SELECT COUNT(*) FROM public."${this._table}" ${where}`, params)
      return { data: null, count: Number(r.rows[0]?.count ?? 0), error: null }
    }

    // --- Build main SELECT ---
    // Supabase resolves relations even when the FK is not included in the public
    // select list. Add only the FK columns needed internally by the shim and strip
    // them again before returning the rows.
    const hiddenPrimaryCols = hiddenForeignKeys(this._table, primary, relations)
    const selectedPrimaryCols = primary.includes("*") ? primary : [...primary, ...hiddenPrimaryCols]
    const mainCols = selectedPrimaryCols.includes("*")
      ? `"${this._table}".*`
      : selectedPrimaryCols.map((c) => `"${this._table}"."${c}"`).join(", ")

    const where = buildWhere(this._wheres, this._orRaws, params, this._table)
    const orderSql = this._orders
      .map(({ col, ascending, nullsFirst }) => {
        let s = `"${this._table}"."${col}" ${ascending ? "ASC" : "DESC"}`
        if (nullsFirst === true) s += " NULLS FIRST"
        if (nullsFirst === false) s += " NULLS LAST"
        return s
      })
      .join(", ")

    let mainSql = `SELECT ${mainCols} FROM public."${this._table}" ${where}`
    if (orderSql) mainSql += ` ORDER BY ${orderSql}`
    if (this._limit !== null) { params.push(this._limit); mainSql += ` LIMIT $${params.length}` }

    const mainResult = await pool.query(mainSql, params)
    let rows = mainResult.rows as Record<string, unknown>[]

    // --- Resolve direct and nested relations ---
    rows = await attachRelations(pool, this._table, rows, relations)

    if (hiddenPrimaryCols.size) {
      rows = rows.map((row) => {
        const sanitized = { ...row }
        for (const col of hiddenPrimaryCols) delete sanitized[col]
        return sanitized
      })
    }

    return { data: rows, error: null }
  }

  then(resolve: (v: { data: unknown; count?: number | null; error: null }) => void, reject: (e: unknown) => void) {
    this._run().then(resolve, reject)
  }

  maybeSingle(): Promise<{ data: unknown | null; error: null }> {
    this._limit = 1
    return this._run().then((r) => ({ data: (r.data as unknown[])?.[0] ?? null, error: null }))
  }

  single(): Promise<{ data: unknown; error: null }> {
    this._limit = 1
    return this._run().then((r) => {
      const row = (r.data as unknown[])?.[0]
      if (!row) throw new Error(`No row found in ${this._table}`)
      return { data: row, error: null }
    })
  }

  // Mutation builders
  insert(payload: Record<string, unknown> | Record<string, unknown>[]): PgMutationBuilder {
    return new PgMutationBuilder(this._table, "insert", Array.isArray(payload) ? payload : [payload])
  }
  update(payload: Record<string, unknown>): PgMutationBuilder {
    return new PgMutationBuilder(this._table, "update", [payload], this._wheres)
  }
  upsert(payload: Record<string, unknown> | Record<string, unknown>[], opts?: { onConflict?: string }): PgMutationBuilder {
    return new PgMutationBuilder(this._table, "upsert", Array.isArray(payload) ? payload : [payload], [], opts?.onConflict)
  }
  delete(): PgMutationBuilder {
    return new PgMutationBuilder(this._table, "delete", [], this._wheres)
  }
}

// ---------------------------------------------------------------------------
// Mutation builder
// ---------------------------------------------------------------------------

class PgMutationBuilder {
  private _table: string
  private _op: "insert" | "update" | "upsert" | "delete"
  private _rows: Record<string, unknown>[]
  private _wheres: WhereClause[]
  private _onConflict?: string
  private _returning: string | null = null
  private _extraWheres: WhereClause[] = []

  constructor(table: string, op: "insert" | "update" | "upsert" | "delete", rows: Record<string, unknown>[], wheres: WhereClause[] = [], onConflict?: string) {
    this._table = table; this._op = op; this._rows = rows; this._wheres = [...wheres]; this._onConflict = onConflict
  }

  eq(col: string, val: unknown): this { this._wheres.push({ col, op: "=", val }); return this }
  neq(col: string, val: unknown): this { this._wheres.push({ col, op: "!=", val }); return this }
  in(col: string, vals: unknown[]): this { this._wheres.push({ col, op: "IN", val: vals }); return this }
  abortSignal(_signal: AbortSignal): this { return this }

  select(cols: string): PgMutationBuilderWithSelect {
    this._returning = cols
    return new PgMutationBuilderWithSelect(this)
  }

  async _exec(): Promise<{ data: unknown[] | null; error: null }> {
    const pool = getPool()
    const params: unknown[] = []
    const returning = this._returning
      ? ` RETURNING ${this._returning === "*" ? "*" : this._returning.split(",").map((c) => `"${c.trim()}"`).join(", ")}`
      : ""
    const where = buildWhere(this._wheres, [], params)

    if (this._op === "delete") {
      const r = await pool.query(`DELETE FROM public."${this._table}" ${where}${returning}`, params)
      return { data: r.rows, error: null }
    }

    if (this._op === "update" && this._rows[0]) {
      const row = this._rows[0]
      const sets = Object.keys(row).map((k) => { params.push(row[k]); return `"${k}" = $${params.length}` })
      const r = await pool.query(`UPDATE public."${this._table}" SET ${sets.join(", ")} ${where}${returning}`, params)
      return { data: r.rows, error: null }
    }

    if ((this._op === "insert" || this._op === "upsert") && this._rows.length) {
      const keys = Object.keys(this._rows[0])
      const colsSql = keys.map((k) => `"${k}"`).join(", ")
      const valuesSets = this._rows.map((row) => {
        const phs = keys.map((k) => { params.push(row[k]); return `$${params.length}` })
        return `(${phs.join(", ")})`
      })
      let sql = `INSERT INTO public."${this._table}" (${colsSql}) VALUES ${valuesSets.join(", ")}`
      if (this._op === "upsert" && this._onConflict) {
        const updates = keys.filter((k) => k !== this._onConflict).map((k) => `"${k}" = EXCLUDED."${k}"`).join(", ")
        sql += ` ON CONFLICT ("${this._onConflict}") DO UPDATE SET ${updates}`
      }
      sql += returning
      const r = await pool.query(sql, params)
      return { data: r.rows, error: null }
    }

    return { data: [], error: null }
  }

  then(resolve: (v: { data: unknown[] | null; error: null }) => void, reject: (e: unknown) => void) {
    this._exec().then(resolve, reject)
  }
}

class PgMutationBuilderWithSelect {
  constructor(private _builder: PgMutationBuilder) {}
  abortSignal(_signal: AbortSignal): this { return this }
  single(): Promise<{ data: unknown; error: null }> {
    return this._builder._exec().then((r) => ({ data: (r.data as unknown[])?.[0] ?? null, error: null }))
  }
  then(resolve: (v: { data: unknown[] | null; error: null }) => void, reject: (e: unknown) => void) {
    this._builder._exec().then(resolve, reject)
  }
}

// ---------------------------------------------------------------------------
// RPC builder
// ---------------------------------------------------------------------------

type RpcArgumentCast = "text" | "jsonb"

// node-postgres sends parameter placeholders without a PostgreSQL type. Named
// function calls cannot resolve an overload when every placeholder is unknown,
// and JavaScript arrays must be serialized before being cast to jsonb. Keep the
// explicit casts scoped to the RPC signatures used by this application.
const RPC_ARGUMENT_CASTS: Record<string, Record<string, RpcArgumentCast>> = {
  create_purchase_request: {
    p_customer_name: "text",
    p_phone: "text",
    p_description: "text",
    p_preferred_contact_time: "text",
    p_preferred_contact_time_note: "text",
    p_items: "jsonb",
  },
}

// Named PostgreSQL function calls require the installed SQL argument names to
// match exactly. The checkout RPC has a stable six-argument SQL signature, so
// call it positionally to remain compatible with existing self-hosted databases
// that may have the correct types but older parameter-name metadata.
const RPC_POSITIONAL_ARGUMENTS: Record<string, string[]> = {
  create_purchase_request: [
    "p_customer_name",
    "p_phone",
    "p_description",
    "p_preferred_contact_time",
    "p_preferred_contact_time_note",
    "p_items",
  ],
}

function normalizeRpcParameter(value: unknown, cast?: RpcArgumentCast): unknown {
  if (cast === "jsonb") return JSON.stringify(value ?? null)
  return value
}

class PgRpcBuilder {
  constructor(private _fn: string, private _args: Record<string, unknown>) {}
  then(resolve: (v: { data: unknown; error: null }) => void, reject: (e: unknown) => void) {
    const pool = getPool()
    const casts = RPC_ARGUMENT_CASTS[this._fn] ?? {}
    const positionalKeys = RPC_POSITIONAL_ARGUMENTS[this._fn]
    const keys = positionalKeys ?? Object.keys(this._args)
    const params = keys.map((key) => normalizeRpcParameter(this._args[key], casts[key]))
    const argsSql = keys
      .map((key, index) => positionalKeys
        ? `$${index + 1}${casts[key] ? `::${casts[key]}` : ""}`
        : `${key} => $${index + 1}${casts[key] ? `::${casts[key]}` : ""}`)
      .join(", ")

    // Supabase RPC returns the scalar function result directly. PostgreSQL's
    // SELECT * wrapper returns scalar functions as a one-column row instead,
    // which breaks callers expecting the JSON payload itself. Alias and unwrap
    // the scalar value so the pg fallback matches Supabase's response shape.
    pool.query(`SELECT public."${this._fn}"(${argsSql}) AS "data"`, params)
      .then((r) => resolve({ data: r.rows[0]?.data ?? null, error: null }))
      .catch(reject)
  }
}

// ---------------------------------------------------------------------------
// Shim client
// ---------------------------------------------------------------------------

export class PgShimClient {
  from(table: string): PgQueryBuilder { return new PgQueryBuilder(table) }
  rpc(fn: string, args: Record<string, unknown> = {}): PgRpcBuilder { return new PgRpcBuilder(fn, args) }
}

export function createPgShimClient(): PgShimClient {
  return new PgShimClient()
}
