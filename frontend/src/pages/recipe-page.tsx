import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { api, setToken } from "@/api"
import { useUser } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProjectTimeline } from "@/components/project-timeline"
import { formatDateTime, getBadgeClass, type ApplicationRecord } from "@/lib/application"
import { cn } from "@/lib/utils"

export default function RecipePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useUser()
  const [recipe, setRecipe] = useState<ApplicationRecord | null>(null)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await api.get(`/recipes/${id}`)
        setRecipe(res.data)
        setLikes(res.data.likes)
        if (user) {
          setLiked(
            res.data.likedBy.some((entry: string | { username: string }) =>
              typeof entry === "string" ? entry === user.username : entry.username === user.username
            )
          )
        }
      } catch (err) {
        console.error("Failed to fetch application", err)
      }
    }

    fetchRecipe()
  }, [id, user])

  const handleLike = async () => {
    if (!user) return
    try {
      setToken(user.token)
      await api.put(`/recipes/${id}/like`)
      setLiked((prev) => !prev)
      setLikes((count) => (liked ? count - 1 : count + 1))
    } catch (err) {
      console.error("Failed to update priority", err)
    }
  }

  if (!recipe) return <p className="p-6 text-center">Loading application...</p>

  return (
    <Layout>
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <img
            src={recipe.imageUrl || "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=80"}
            alt={recipe.title}
            className="h-80 w-full object-cover"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/60 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', getBadgeClass(recipe.status || 'Pending'))}>
                  {recipe.status || "Submitted"}
                </span>
                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', getBadgeClass(recipe.priority || 'Medium'))}>
                  {recipe.priority || "Medium"} Priority
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{recipe.title}</h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{recipe.description}</p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Applicant</p>
                  <p className="mt-1 text-lg font-semibold">{recipe.applicantName || recipe.user.name || recipe.user.username}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">System Type</p>
                  <p className="mt-1 text-lg font-semibold">{recipe.systemType || "Rooftop PV"}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">Document Checklist</p>
                  <ul className="mt-3 space-y-2 text-sm text-amber-950">
                    {recipe.ingredients.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-800">Workflow Steps</p>
                  <ul className="mt-3 space-y-2 text-sm text-emerald-950">
                    {recipe.steps.map((step, index) => (
                      <li key={`${step}-${index}`}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {recipe.adminRemarks ? (
                <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">Latest update from MIIMU</p>
                  <p className="mt-2 text-sm leading-6 text-amber-950">{recipe.adminRemarks}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Project Progress</p>
              <h2 className="mt-2 text-2xl font-semibold">Milestone timeline</h2>
              <div className="mt-6">
                <ProjectTimeline stages={recipe.stageProgress} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Folder Library</p>
              <h2 className="mt-2 text-2xl font-semibold">Shared application folders</h2>
              <div className="mt-6 space-y-3">
                {(recipe.folders || []).length > 0 ? recipe.folders.map((folder, index) => (
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
                            <a href={file.dataUrl} download={file.name}>Download File</a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No folders have been shared for this application yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/60 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
              <p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Project Snapshot</p>
              <div className="mt-5 space-y-4 text-sm">
                <p>{recipe.capacityKw || 0} kW estimated capacity</p>
                <p>{recipe.location || "Location pending"}</p>
                <p>{recipe.contactEmail || "No email recorded"}</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold">Team signals</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Highlight projects that need immediate follow-up from engineering or operations.
              </p>
              <div className="mt-5 flex items-center gap-4">
                <Button onClick={handleLike} variant="outline" className="rounded-full">
                  <Heart className="mr-2 h-4 w-4" fill={liked ? "currentColor" : "none"} />
                  {liked ? "Prioritized" : "Mark Priority"} ({likes})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
