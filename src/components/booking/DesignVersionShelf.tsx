import * as React from "react"
import { createPortal } from "react-dom"
import { format } from "date-fns"
import { Pencil, Trash, X } from "@phosphor-icons/react"

import { useVersion, type DesignVersion } from "@/components/booking/VersionContext"
import { cn } from "@/lib/utils"

interface DesignVersionShelfProps {
  getCurrentState: () => {
    weekStartIso: string
    selectedDateIso: string
    selectedTime: string | null
  }
  onRevert: (state: {
    weekStartIso: string
    selectedDateIso: string
    selectedTime: string | null
  }) => void
}

export function DesignVersionShelf({ getCurrentState, onRevert }: DesignVersionShelfProps) {
  const {
    versions,
    currentVersionId,
    shelfOpen,
    setShelfOpen,
    saveVersion,
    revertToVersion,
    removeVersion,
    updateVersion,
  } = useVersion()

  const [titleInput, setTitleInput] = React.useState("")
  const [noteInput, setNoteInput] = React.useState("")
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingTitle, setEditingTitle] = React.useState("")
  const [editingNote, setEditingNote] = React.useState("")
  const [versionToRemove, setVersionToRemove] = React.useState<DesignVersion | null>(null)
  const [isClosing, setIsClosing] = React.useState(false)
  const [isEntering, setIsEntering] = React.useState(true)
  const openedAtRef = React.useRef<number>(0)
  const [pendingState, setPendingState] = React.useState<{
    weekStartIso: string
    selectedDateIso: string
    selectedTime: string | null
  } | null>(null)

  const handleSaveClick = () => {
    setPendingState(getCurrentState())
    setShowAddForm(true)
    setTitleInput("")
    setNoteInput("")
  }

  const handleSaveSubmit = () => {
    if (pendingState) {
      saveVersion(titleInput, noteInput, pendingState)
      setPendingState(null)
      setShowAddForm(false)
    }
  }

  const handleRevert = (versionId: string) => {
    const state = revertToVersion(versionId)
    onRevert(state)
  }

  const handleStartEdit = (v: DesignVersion) => {
    setEditingId(v.id)
    setEditingTitle(v.title ?? v.note ?? `Version ${v.versionNumber}`)
    setEditingNote(v.note ?? "")
  }

  const handleSaveEdit = (versionId: string) => {
    updateVersion(versionId, { title: editingTitle, note: editingNote })
    setEditingId(null)
    setEditingTitle("")
    setEditingNote("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle("")
    setEditingNote("")
  }

  const handleRemoveClick = (v: DesignVersion, e: React.MouseEvent) => {
    e.stopPropagation()
    setVersionToRemove(v)
  }

  const handleConfirmRemove = () => {
    if (versionToRemove) {
      removeVersion(versionToRemove.id)
      setVersionToRemove(null)
    }
  }

  const handleCancelRemove = () => {
    setVersionToRemove(null)
  }

  React.useEffect(() => {
    if (shelfOpen) {
      openedAtRef.current = Date.now()
      setIsEntering(true)
    }
  }, [shelfOpen])

  React.useEffect(() => {
    if (shelfOpen && isEntering) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsEntering(false))
      })
      return () => cancelAnimationFrame(id)
    }
  }, [shelfOpen, isEntering])

  const handleClose = () => {
    setShelfOpen(false)
    setIsClosing(true)
  }

  React.useEffect(() => {
    if (isClosing) {
      const id = setTimeout(() => setIsClosing(false), 300)
      return () => clearTimeout(id)
    }
  }, [isClosing])

  const isVisible = shelfOpen || isClosing
  if (!isVisible) return null

  const handleBackdropClick = () => {
    if (Date.now() - openedAtRef.current < 150) return
    handleClose()
  }

  const shelfContent = (
    <>
      {/* Confirm delete modal */}
      {versionToRemove && (
        <div
          className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/30 p-4"
          aria-modal="true"
          role="alertdialog"
          aria-labelledby="confirm-delete-title"
          aria-describedby="confirm-delete-desc"
          onClick={handleCancelRemove}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-[var(--juno-border)] bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="confirm-delete-title"
              className="text-base font-semibold text-[var(--juno-text-header)]"
            >
              Remove version?
            </h3>
            <p
              id="confirm-delete-desc"
              className="mt-2 text-sm text-[var(--juno-text-subtext)]"
            >
              “{versionToRemove.title ?? versionToRemove.note ?? `Version ${versionToRemove.versionNumber}`}” will be removed from the timeline. This can’t be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelRemove}
                className="rounded-md border border-[var(--juno-border)] px-3 py-1.5 text-sm font-medium text-[var(--juno-text-header)] hover:bg-[var(--juno-neutral-20)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="rounded-md border border-transparent bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop with hole for timeline button - prevents click-through that caused flash */}
      <div
        className={cn(
          "fixed inset-0 z-[10000] bg-black/20 transition-opacity duration-300 ease-out",
          isEntering && "opacity-0",
          isClosing && "opacity-0"
        )}
        style={{
          clipPath: "polygon(0 0, calc(100% - 56px) 0, calc(100% - 56px) 56px, 100% 56px, 100% 100%, 0 100%)",
        }}
        aria-hidden
        onClick={handleBackdropClick}
      />
      {/* Shelf panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-[10001] flex h-full w-[320px] flex-col border-l border-[var(--juno-neutral-40)] bg-white shadow-xl transition-transform duration-300 ease-out",
          (isEntering || isClosing) && "translate-x-full"
        )}
        role="dialog"
        aria-label="Design versions"
      >
        <div className="flex items-center justify-between border-b border-[var(--juno-neutral-40)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--juno-text-header)]">
            Versions
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded border border-transparent p-1.5 text-[var(--juno-text-subtext)] hover:bg-[var(--juno-neutral-20)]"
            aria-label="Close"
          >
            <X className="size-5" weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {showAddForm && pendingState ? (
            <div className="mb-4 rounded-lg border border-[var(--juno-border)] p-3">
              <label className="mb-2 block text-xs font-medium text-[var(--juno-text-header)]">
                Title
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Version with time slots"
                className="mb-3 w-full rounded-md border border-[var(--juno-border)] px-3 py-2 text-sm placeholder:text-[var(--juno-text-subtext)] focus:border-[var(--juno-primary)] focus:outline-none"
                autoFocus
              />
              <label className="mb-2 block text-xs font-medium text-[var(--juno-text-header)]">
                Notes
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Added time slot selection, fixed date picker..."
                rows={2}
                className="mb-3 w-full resize-none rounded-md border border-[var(--juno-border)] px-3 py-2 text-sm placeholder:text-[var(--juno-text-subtext)] focus:border-[var(--juno-primary)] focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveSubmit}
                  className="rounded-md border border-transparent bg-[var(--juno-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1a4030]"
                >
                  Save version
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setPendingState(null)
                  }}
                  className="rounded-md border border-[var(--juno-border)] px-3 py-1.5 text-sm text-[var(--juno-text-header)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSaveClick}
              className="mb-4 w-full rounded-md border border-dashed border-[var(--juno-border)] px-3 py-2.5 text-sm font-medium text-[var(--juno-primary)] hover:bg-[var(--juno-surface-tertiary)]"
            >
              Save new version
            </button>
          )}

          <ul className="space-y-2">
            {[...versions].reverse().map((v) => {
              const displayTitle = v.title ?? v.note ?? `Version ${v.versionNumber}`
              const isEditing = editingId === v.id
              return (
                <li key={v.id}>
                  <div
                    className={cn(
                      "rounded-lg border px-3 py-3 transition-colors",
                      currentVersionId === v.id
                        ? "border-[var(--juno-primary)] bg-[var(--juno-surface-tertiary)]"
                        : "border-[var(--juno-border)]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleRevert(v.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold text-[var(--juno-primary)]">
                            {displayTitle}
                          </span>
                          <span className="shrink-0 text-[10px] text-[var(--juno-text-subtext)]">
                            {format(new Date(v.savedAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                        {isEditing ? (
                          <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              placeholder="Title"
                              className="w-full rounded border border-[var(--juno-border)] px-2 py-1 text-xs focus:border-[var(--juno-primary)] focus:outline-none"
                              autoFocus
                            />
                            <textarea
                              value={editingNote}
                              onChange={(e) => setEditingNote(e.target.value)}
                              placeholder="Notes"
                              rows={2}
                              className="w-full resize-none rounded border border-[var(--juno-border)] px-2 py-1 text-xs focus:border-[var(--juno-primary)] focus:outline-none"
                            />
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(v.id)}
                                className="rounded bg-[var(--juno-primary)] px-2 py-1 text-[10px] font-medium text-white"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="rounded border border-[var(--juno-border)] px-2 py-1 text-[10px] text-[var(--juno-text-subtext)]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          v.note ? (
                            <p className="mt-1 line-clamp-2 text-xs text-[var(--juno-text-subtext)]">
                              {v.note}
                            </p>
                          ) : null
                        )}
                      </button>
                      {!isEditing && (
                        <div className="flex shrink-0 gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(v)}
                            className="rounded border border-transparent p-1 text-[var(--juno-text-subtext)] hover:bg-[var(--juno-neutral-20)] hover:text-[var(--juno-primary)]"
                            aria-label="Edit title and notes"
                          >
                            <Pencil className="size-3.5" weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveClick(v, e)}
                            className="rounded border border-transparent p-1 text-[var(--juno-text-subtext)] hover:bg-red-50 hover:text-red-600"
                            aria-label="Remove version"
                          >
                            <Trash className="size-3.5" weight="bold" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>
    </>
  )

  return typeof document !== "undefined"
    ? createPortal(shelfContent, document.body)
    : null
}
