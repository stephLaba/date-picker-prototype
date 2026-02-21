import fs from "node:fs"
import path from "node:path"

/** Persisted to repo - survives every build. Served from public/, written via API. */
const VERSIONS_FILE = path.resolve(__dirname, "public/design-versions.json")

export function designVersionsPlugin() {
  return {
    name: "design-versions",
    configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/design-versions.json" && req.method === "GET") {
          try {
            const data = fs.readFileSync(VERSIONS_FILE, "utf-8")
            res.setHeader("Content-Type", "application/json")
            res.end(data)
          } catch {
            res.setHeader("Content-Type", "application/json")
            res.end("[]")
          }
          return
        }
        if (req.url === "/api/design-versions" && req.method === "POST") {
          const body = await new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = []
            req.on("data", (chunk: Buffer) => chunks.push(chunk))
            req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")))
            req.on("error", reject)
          })
          try {
            const versions = JSON.parse(body)
            if (!Array.isArray(versions)) throw new Error("Expected array")
            fs.mkdirSync(path.dirname(VERSIONS_FILE), { recursive: true })
            fs.writeFileSync(VERSIONS_FILE, JSON.stringify(versions, null, 2), "utf-8")
            res.setHeader("Content-Type", "application/json")
            res.statusCode = 200
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.setHeader("Content-Type", "application/json")
            res.statusCode = 400
            res.end(JSON.stringify({ error: "Invalid payload" }))
          }
          return
        }
        next()
      })
    },
  }
}
