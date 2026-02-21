import * as React from "react"

export interface VersionState {
  weekStartIso: string
  selectedDateIso: string
  selectedTime: string | null
}

export interface DesignVersion {
  id: string
  versionNumber: number
  title?: string
  note?: string
  savedAt: string
  state: VersionState
}

const STORAGE_KEY = "design-versions"
const HIDDEN_SEEDS_KEY = "design-versions-hidden-seeds"
const SEED_OVERRIDES_KEY = "design-versions-seed-overrides"
const API_URL = "/api/design-versions"
const FILE_URL = "/design-versions.json"

/** Seed versions always shown first; user saves are appended and persisted. */
function createSeedVersions(): DesignVersion[] {
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + 1)
  const weekStart = new Date(baseDate)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const defaultState: VersionState = {
    weekStartIso: weekStart.toISOString(),
    selectedDateIso: baseDate.toISOString(),
    selectedTime: null,
  }
  return [
    {
      id: "seed-v1",
      versionNumber: 1,
      title: "Initial wireframe",
      note: "",
      savedAt: "2024-12-01T00:00:00.000Z",
      state: defaultState,
    },
    {
      id: "seed-v2",
      versionNumber: 2,
      title: "Location & date picker",
      note: "",
      savedAt: "2025-01-01T00:00:00.000Z",
      state: defaultState,
    },
    {
      id: "seed-v3",
      versionNumber: 3,
      title: "Full booking flow",
      note: "",
      savedAt: "2025-02-01T00:00:00.000Z",
      state: defaultState,
    },
  ]
}

const SEED_VERSIONS = createSeedVersions()

interface VersionContextValue {
  versions: DesignVersion[]
  currentVersionId: string | null
  shelfOpen: boolean
  setShelfOpen: (open: boolean) => void
  saveVersion: (title: string, note: string, state: VersionState) => void
  revertToVersion: (versionId: string) => VersionState
  removeVersion: (versionId: string) => void
  updateVersion: (versionId: string, updates: { title?: string; note?: string }) => void
  getCurrentVersion: () => DesignVersion | null
  isSeedVersion: (versionId: string) => boolean
}

const VersionContext = React.createContext<VersionContextValue | null>(null)

function loadFromStorage(): DesignVersion[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) return []
      return parsed.filter(
        (v): v is DesignVersion =>
          v &&
          typeof v.state === "object" &&
          typeof v.state?.weekStartIso === "string" &&
          typeof v.state?.selectedDateIso === "string"
      )
    } catch {
      return []
    }
  }
  return []
}

function loadHiddenSeeds(): string[] {
  try {
    const stored = localStorage.getItem(HIDDEN_SEEDS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : []
    }
  } catch {}
  return []
}

function loadSeedOverrides(): Record<string, { title?: string; note?: string }> {
  try {
    const stored = localStorage.getItem(SEED_OVERRIDES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === "object") {
        const result: Record<string, { title?: string; note?: string }> = {}
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof k === "string" && v && typeof v === "object") {
            const obj = v as Record<string, unknown>
            result[k] = {
              ...(typeof obj.title === "string" && { title: obj.title }),
              ...(typeof obj.note === "string" && { note: obj.note }),
            }
          }
        }
        return result
      }
    }
  } catch {}
  return {}
}

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const [userVersions, setUserVersions] = React.useState<DesignVersion[]>(loadFromStorage)
  const [hiddenSeedIds, setHiddenSeedIds] = React.useState<string[]>(loadHiddenSeeds)
  const [seedOverrides, setSeedOverrides] = React.useState<
    Record<string, { title?: string; note?: string }>
  >(loadSeedOverrides)
  const [hasLoadedFromFile, setHasLoadedFromFile] = React.useState(false)

  React.useEffect(() => {
    if (hasLoadedFromFile) return
    setHasLoadedFromFile(true)
    fetch(FILE_URL)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const valid = data.filter(
            (v: unknown): v is DesignVersion =>
              !!v &&
              typeof (v as DesignVersion).state === "object" &&
              typeof (v as DesignVersion).state?.weekStartIso === "string" &&
              typeof (v as DesignVersion).state?.selectedDateIso === "string"
          )
          if (valid.length > 0) setUserVersions(valid)
        }
      })
      .catch(() => {})
  }, [hasLoadedFromFile])

  const versions = React.useMemo(() => {
    const visibleSeeds = SEED_VERSIONS.filter((s) => !hiddenSeedIds.includes(s.id))
    return [
      ...visibleSeeds.map((s) => {
        const override = seedOverrides[s.id]
        if (!override) return s
        return {
          ...s,
          title: override.title !== undefined ? override.title : (s.title ?? s.note ?? ""),
          note: override.note !== undefined ? override.note : (s.note ?? ""),
        }
      }),
      ...userVersions,
    ]
  }, [userVersions, hiddenSeedIds, seedOverrides])
  const [currentVersionId, setCurrentVersionId] = React.useState<string | null>(null)
  const [shelfOpen, setShelfOpen] = React.useState(false)

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userVersions))
    localStorage.setItem(HIDDEN_SEEDS_KEY, JSON.stringify(hiddenSeedIds))
    localStorage.setItem(SEED_OVERRIDES_KEY, JSON.stringify(seedOverrides))
    if (userVersions.length > 0) {
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userVersions),
      }).catch(() => {})
    }
  }, [userVersions, hiddenSeedIds, seedOverrides])

  const saveVersion = React.useCallback((title: string, note: string, state: VersionState) => {
    setUserVersions((prev) => {
      const versionNumber = SEED_VERSIONS.length + prev.length + 1
      const id = `v${versionNumber}-${Date.now()}`
      const newVersion: DesignVersion = {
        id,
        versionNumber,
        title: title.trim() || `Version ${versionNumber}`,
        note: note.trim() || "",
        savedAt: new Date().toISOString(),
        state,
      }
      setCurrentVersionId(id)
      return [...prev, newVersion]
    })
  }, [])

  const revertToVersion = React.useCallback((versionId: string) => {
    const version = versions.find((v) => v.id === versionId)
    if (!version) throw new Error(`Version ${versionId} not found`)
    setCurrentVersionId(versionId)
    return version.state
  }, [versions])

  const getCurrentVersion = React.useCallback(() => {
    if (!currentVersionId) return null
    return versions.find((v) => v.id === currentVersionId) ?? null
  }, [currentVersionId, versions])

  const isSeedVersion = React.useCallback((versionId: string) => {
    return versionId.startsWith("seed-")
  }, [])

  const removeVersion = React.useCallback((versionId: string) => {
    if (versionId.startsWith("seed-")) {
      setHiddenSeedIds((prev) => (prev.includes(versionId) ? prev : [...prev, versionId]))
    } else {
      setUserVersions((prev) => prev.filter((v) => v.id !== versionId))
    }
    setCurrentVersionId((curr) => (curr === versionId ? null : curr))
  }, [])

  const updateVersion = React.useCallback(
    (versionId: string, updates: { title?: string; note?: string }) => {
      if (versionId.startsWith("seed-")) {
        setSeedOverrides((prev) => ({
          ...prev,
          [versionId]: {
            ...prev[versionId],
            ...(updates.title !== undefined && { title: updates.title.trim() }),
            ...(updates.note !== undefined && { note: updates.note.trim() }),
          },
        }))
      } else {
        setUserVersions((prev) =>
          prev.map((v) =>
            v.id === versionId
              ? {
                  ...v,
                  ...(updates.title !== undefined && { title: updates.title.trim() }),
                  ...(updates.note !== undefined && { note: updates.note.trim() }),
                }
              : v
          )
        )
      }
    },
    []
  )

  const value = React.useMemo<VersionContextValue>(
    () => ({
      versions,
      currentVersionId,
      shelfOpen,
      setShelfOpen,
      saveVersion,
      revertToVersion,
      removeVersion,
      updateVersion,
      getCurrentVersion,
      isSeedVersion,
    }),
    [
      versions,
      currentVersionId,
      shelfOpen,
      saveVersion,
      revertToVersion,
      removeVersion,
      updateVersion,
      getCurrentVersion,
      isSeedVersion,
    ]
  )

  return (
    <VersionContext.Provider value={value}>{children}</VersionContext.Provider>
  )
}

export function useVersion() {
  const ctx = React.useContext(VersionContext)
  if (!ctx) throw new Error("useVersion must be used within VersionProvider")
  return ctx
}
