"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Button } from "@/components/ui/button"
import { Heart, Bookmark, MapPin, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/api"
import { useUser } from "@/context/UserContext"
import { Link } from "react-router-dom"

export interface RecipeCardProps {
  id: string
  title: string
  applicantName: string
  location: string
  capacityKw: number
  systemType: string
  status: string
  priority: string
  description: string
  imageUrl?: string
  initialLikes?: number
  initiallySaved?: boolean
  initiallyLiked?: boolean
}

export function RecipeCard({
  id,
  title,
  applicantName,
  location,
  capacityKw,
  systemType,
  status,
  priority,
  description,
  imageUrl,
  initialLikes = 0,
  initiallySaved = false,
  initiallyLiked = false,
}: RecipeCardProps) {
  const [liked, setLiked] = useState(initiallyLiked)
  const [saved, setSaved] = useState(initiallySaved)
  const [likes, setLikes] = useState(initialLikes)
  const { user } = useUser()

  const imgSrc = useMemo(
    () => imageUrl || "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    [imageUrl]
  )

  const toggleLike = async () => {
    if (!user) return alert("Please log in to prioritize applications.")
    try {
      await api.put(`/recipes/${id}/like`)
      setLiked((prev) => !prev)
      setLikes((prev) => (liked ? prev - 1 : prev + 1))
    } catch (err) {
      alert(err || "Failed to update priority.")
    }
  }

  const toggleSave = async () => {
    if (!user) return alert("Please log in to track applications.")
    try {
      if (saved) {
        await api.delete(`/users/save/${id}`)
        setSaved(false)
      } else {
        await api.post(`/users/save/${id}`)
        setSaved(true)
      }
    } catch (err: any) {
      alert(err || "Failed to update tracking.")
    }
  }

  return (
    <Card className="overflow-hidden rounded-[1.75rem] border-white/60 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <Link to={`/applications/${id}`} className="block">
        <CardHeader className="p-0">
          <div className="relative h-52 w-full bg-muted">
            <img
              src={imgSrc}
              alt={`Site preview for ${title}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
              {status}
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-amber-950">
              {priority} Priority
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Applicant: {applicantName}</p>
            </div>
            <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              {systemType}
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4" />
                Site
              </div>
              <p className="mt-2 font-medium text-slate-900">{location}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <Zap className="h-4 w-4" />
                Capacity
              </div>
              <p className="mt-2 font-medium text-emerald-950">{capacityKw} kW</p>
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            className={cn("gap-2 rounded-full", liked ? "text-primary" : "text-gray-400")}
          >
            <Heart className={cn("h-4 w-4", liked ? "fill-primary" : "fill-transparent")} />
            <span className="text-sm">{likes} Priority</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSave}
            className={cn("gap-2 rounded-full", saved ? "text-primary" : "text-gray-400")}
          >
            <Bookmark className={cn("h-4 w-4", saved ? "fill-primary" : "fill-transparent")} />
            <span className="text-sm">{saved ? "Tracking" : "Track"}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
