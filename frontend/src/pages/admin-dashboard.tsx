import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { ProjectTimeline } from "@/components/project-timeline"
import { api } from "@/api"
import { useUser } from "@/context/UserContext"
import {
  getBadgeClass,
  priorityOptions,
  projectStatusOptions,
  formatDateTime,
  type ApplicationRecord,
  type StageState,
} from "@/lib/application"
import { cn } from "@/lib/utils"

export default function AdminDashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [folderFiles, setFolderFiles] = useState<File[]>([])
  const [uploadingFolder, setUploadingFolder] = useState(false)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "")
      folderInputRef.current.setAttribute("directory", "")
    }
  }, [])

  useEffect(() => {
    if (!user) {
      navigate('/admin-login')
      return
    }

    if (user.role !== 'admin') {
      navigate('/dashboard')
      return
    }

    const fetchApplications = async () => {
      try {
        const res = await api.get('/recipes')
        setApplications(res.data)
        if (res.data.length > 0) {
          setSelectedId((current) => current || res.data[0]._id)
        }
      } catch (error) {
        console.error('Failed to fetch applications', error)
      }
    }

    fetchApplications()
  }, [navigate, user])

  const selectedApplication = useMemo(
    () => applications.find((item) => item._id === selectedId) || null,
    [applications, selectedId]
  )

  const updateSelectedApplication = (updater: (application: ApplicationRecord) => ApplicationRecord) => {
    setApplications((current) => current.map((item) => (item._id === selectedId ? updater(item) : item)))
  }

  const updateStage = (index: number, status: StageState) => {
    updateSelectedApplication((application) => ({
      ...application,
      stageProgress: application.stageProgress.map((stage, stageIndex) =>
        stageIndex === index
          ? { ...stage, status, updatedAt: status === 'Pending' ? null : new Date().toISOString() }
          : stage
      ),
    }))
  }

  const removeFolder = (index: number) => {
    updateSelectedApplication((application) => ({
      ...application,
      folders: application.folders.filter((_, folderIndex) => folderIndex !== index),
    }))
  }

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
      reader.readAsDataURL(file)
    })

  const uploadFolder = async () => {
    if (!selectedApplication || folderFiles.length === 0) return

    setUploadingFolder(true)
    setMessage("")

    try {
      const files = await Promise.all(
        folderFiles.map(async (file) => ({
          name: file.name,
          relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          dataUrl: await readFileAsDataUrl(file),
        }))
      )

      const rootName =
        (folderFiles[0] as File & { webkitRelativePath?: string }).webkitRelativePath?.split("/")[0] ||
        `Folder ${selectedApplication.folders.length + 1}`

      updateSelectedApplication((application) => ({
        ...application,
        folders: [
          ...(application.folders || []),
          {
            name: rootName,
            uploadedBy: "MIIMU Admin",
            uploadedAt: new Date().toISOString(),
            files,
          },
        ],
      }))

      setFolderFiles([])
      if (folderInputRef.current) folderInputRef.current.value = ""
      setMessage("Folder added. Click Save Changes to publish it for the user.")
    } catch (error) {
      console.error("Failed to prepare folder upload", error)
      setMessage("Failed to prepare folder upload.")
    } finally {
      setUploadingFolder(false)
    }
  }

  const saveChanges = async () => {
    if (!selectedApplication) return

    setSaving(true)
    setMessage("")

    try {
      const res = await api.put(`/recipes/${selectedApplication._id}`, {
        status: selectedApplication.status,
        priority: selectedApplication.priority,
        adminRemarks: selectedApplication.adminRemarks,
        folders: selectedApplication.folders,
        stageProgress: selectedApplication.stageProgress,
      })

      setApplications((current) => current.map((item) => (item._id === res.data._id ? res.data : item)))
      setMessage('Project updated successfully.')
    } catch (error) {
      console.error('Failed to save application', error)
      setMessage('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const liveCount = applications.filter((item) => item.status === 'Live').length
  const criticalCount = applications.filter((item) => item.priority === 'Critical').length

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-6">
            <p className="text-sm text-slate-500">Total Projects</p>
            <p className="mt-2 text-4xl font-semibold">{applications.length}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/60 bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)] md:p-6">
            <p className="text-sm text-slate-300">Live Projects</p>
            <p className="mt-2 text-4xl font-semibold">{liveCount}</p>
          </div>
          <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 shadow-[0_20px_60px_rgba(244,63,94,0.08)] md:p-6">
            <p className="text-sm text-rose-700">Critical Priority</p>
            <p className="mt-2 text-4xl font-semibold text-rose-950">{criticalCount}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-[2rem] border border-white/60 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Projects</p>
            <div className="mt-4 lg:hidden">
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {applications.map((application) => (
                  <option key={application._id} value={application._id}>
                    {application.title} - {application.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 hidden space-y-3 lg:block">
              {applications.map((application) => (
                <button
                  key={application._id}
                  type="button"
                  onClick={() => setSelectedId(application._id)}
                  className={cn(
                    'w-full rounded-2xl border p-4 text-left transition',
                    selectedId === application._id
                      ? 'border-amber-300 bg-amber-50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{application.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{application.applicantName}</p>
                    </div>
                    <span className={cn('rounded-full border px-2 py-1 text-xs', getBadgeClass(application.status || 'Pending'))}>
                      {application.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedApplication ? (
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Admin Workspace</p>
                    <h1 className="mt-2 text-2xl font-semibold md:text-3xl">{selectedApplication.title}</h1>
                    <p className="mt-2 text-sm text-slate-500">{selectedApplication.applicantName} • {selectedApplication.location}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button asChild variant="outline">
                      <a href={`/applications/${selectedApplication._id}`}>Open Detail View</a>
                    </Button>
                    <Button onClick={saveChanges} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Project Status</label>
                    <select
                      value={selectedApplication.status}
                      onChange={(event) => updateSelectedApplication((application) => ({ ...application, status: event.target.value }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {projectStatusOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Priority</label>
                    <select
                      value={selectedApplication.priority}
                      onChange={(event) => updateSelectedApplication((application) => ({ ...application, priority: event.target.value }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium">Admin Remarks</label>
                  <textarea
                    value={selectedApplication.adminRemarks || ""}
                    onChange={(event) => updateSelectedApplication((application) => ({ ...application, adminRemarks: event.target.value }))}
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Add approval notes, pending action items, or installation updates for the user."
                  />
                </div>

                {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
              </div>

              <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Stage Control</p>
                    <h2 className="mt-2 text-2xl font-semibold">Project timeline</h2>
                  </div>
                </div>
                <div className="mt-6">
                  <ProjectTimeline stages={selectedApplication.stageProgress} editable onStageChange={updateStage} />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Folder Library</p>
                <div className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-4">
                  <p className="text-sm text-amber-900">
                    Upload a complete folder of files for this application. The same folder will appear in the user portal.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      ref={folderInputRef}
                      type="file"
                      multiple
                      onChange={(event) => setFolderFiles(Array.from(event.target.files || []))}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-amber-700"
                    />
                    <Button type="button" onClick={uploadFolder} disabled={uploadingFolder || folderFiles.length === 0}>
                      {uploadingFolder ? "Preparing..." : "Upload Folder"}
                    </Button>
                  </div>
                  {folderFiles.length > 0 ? (
                    <p className="mt-3 text-xs text-slate-600">
                      {folderFiles.length} file(s) selected from{" "}
                      {(folderFiles[0] as File & { webkitRelativePath?: string }).webkitRelativePath?.split("/")[0] || "folder"}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 space-y-3">
                  {(selectedApplication.folders || []).length > 0 ? selectedApplication.folders.map((folder, index) => (
                    <div key={`${folder.name}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="font-medium text-slate-900">{folder.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {folder.files.length} file(s) • Uploaded by {folder.uploadedBy || "MIIMU Admin"} • {formatDateTime(folder.uploadedAt)}
                        </p>
                      </div>
                      <div className="mt-4 space-y-2">
                        {folder.files.map((file) => (
                          <div key={file.relativePath} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                              <p className="truncate text-xs text-slate-500">{file.relativePath}</p>
                            </div>
                            <Button asChild variant="outline">
                              <a href={file.dataUrl} download={file.name}>Download</a>
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Button type="button" variant="ghost" onClick={() => removeFolder(index)}>Remove Folder</Button>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                      No folders uploaded yet for this application.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  )
}
