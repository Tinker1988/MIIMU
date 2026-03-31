import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { ProjectTimeline } from "@/components/project-timeline"
import { api } from "@/api"
import { useUser } from "@/context/UserContext"
import { formatDateTime, getBadgeClass, type ApplicationRecord } from "@/lib/application"
import { cn } from "@/lib/utils"

export default function UserDashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [selectedId, setSelectedId] = useState<string>("")

  useEffect(() => {
    if (!user) {
      navigate('/user-login')
      return
    }

    if (user.role === 'admin') {
      navigate('/admin')
      return
    }

    const fetchApplications = async () => {
      try {
        const res = await api.get('/recipes/mine')
        setApplications(res.data)
        if (res.data.length > 0) {
          setSelectedId((current) => current || res.data[0]._id)
        }
      } catch (error) {
        console.error('Failed to fetch project status', error)
      }
    }

    fetchApplications()
  }, [navigate, user])

  const selectedApplication = useMemo(
    () => applications.find((item) => item._id === selectedId) || applications[0] || null,
    [applications, selectedId]
  )

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">User Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Manage and track your application</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Follow every project update from MIIMU, check milestone progress, and reopen your shared documents whenever needed.
          </p>
        </div>

        {applications.length > 0 ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="rounded-[2rem] border border-white/60 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">My Projects</p>
              <div className="mt-4 lg:hidden">
                <select
                  value={selectedApplication?._id || ""}
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
                      selectedApplication?._id === application._id
                        ? 'border-amber-300 bg-amber-50 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    )}
                  >
                    <p className="font-semibold text-slate-900">{application.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{application.location}</p>
                    <span className={cn('mt-3 inline-flex rounded-full border px-2 py-1 text-xs', getBadgeClass(application.status || 'Pending'))}>
                      {application.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedApplication ? (
              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className={cn('inline-flex rounded-full border px-3 py-1 text-sm', getBadgeClass(selectedApplication.status || 'Pending'))}>
                        {selectedApplication.status}
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold md:text-3xl">{selectedApplication.title}</h2>
                      <p className="mt-2 text-slate-600">{selectedApplication.description}</p>
                    </div>
                    <Button asChild variant="outline">
                      <Link to={`/applications/${selectedApplication._id}`}>Open full project view</Link>
                    </Button>
                  </div>
                  {selectedApplication.adminRemarks ? (
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-800">Latest update from MIIMU</p>
                      <p className="mt-2 text-sm leading-6 text-amber-950">{selectedApplication.adminRemarks}</p>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Project Progress</p>
                  <h3 className="mt-2 text-2xl font-semibold">Approval and installation timeline</h3>
                  <div className="mt-6">
                    <ProjectTimeline stages={selectedApplication.stageProgress} />
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Folder Library</p>
                  <h3 className="mt-2 text-2xl font-semibold">Folders shared by MIIMU</h3>
                  <div className="mt-6 space-y-3">
                    {(selectedApplication.folders || []).length > 0 ? selectedApplication.folders.map((folder, index) => (
                      <div key={`${folder.name}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <p className="font-medium text-slate-900">{folder.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {folder.files.length} file(s) • {formatDateTime(folder.uploadedAt)}
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
                                <a href={file.dataUrl} download={file.name}>Download File</a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                        MIIMU has not uploaded any folders yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 rounded-[2rem] border border-dashed border-amber-300 bg-amber-50/70 p-10 text-center">
            <h2 className="text-2xl font-semibold">No projects found yet</h2>
            <p className="mt-2 text-sm text-slate-600">Create your first solar application to start tracking milestones and shared documents.</p>
            <Button asChild className="mt-6">
              <Link to="/applications/new">Create Application</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}
