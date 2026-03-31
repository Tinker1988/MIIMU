import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/api"
import { Layout } from "@/components/layout"
import { useUser } from "@/context/UserContext"

export default function CreateRecipe() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [applicantName, setApplicantName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [location, setLocation] = useState("")
  const [capacityKw, setCapacityKw] = useState("")
  const [systemType, setSystemType] = useState("Rooftop PV")
  const [status, setStatus] = useState("Submitted")
  const [priority, setPriority] = useState("Medium")
  const [documents, setDocuments] = useState("")
  const [workflowSteps, setWorkflowSteps] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post("/recipes", {
        title,
        description,
        applicantName,
        contactEmail,
        location,
        capacityKw: Number(capacityKw),
        systemType,
        status,
        priority,
        ingredients: documents.split("\n").map((item) => item.trim()).filter(Boolean),
        steps: workflowSteps.split("\n").map((item) => item.trim()).filter(Boolean),
        imageUrl,
      })
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create application")
    }
  }

  return (
    <Layout>
      <main className="flex justify-center px-4 py-10">
        <Card className="w-full max-w-4xl rounded-[2rem] border-white/60 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardContent className="p-6">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">New Intake</p>
              <h1 className="mt-2 text-3xl font-bold">Create solar application</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Capture customer details, site requirements, and the internal checklist your team will use through review and installation planning.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Project Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Applicant Name</label>
                  <Input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Contact Email</label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Site Location</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Project Summary</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Capacity (kW)</label>
                  <Input type="number" min="0" step="0.1" value={capacityKw} onChange={(e) => setCapacityKw(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">System Type</label>
                  <Input value={systemType} onChange={(e) => setSystemType(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Status</label>
                  <Input value={status} onChange={(e) => setStatus(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Priority</label>
                  <Input value={priority} onChange={(e) => setPriority(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Document Checklist (one per line)</label>
                <Textarea value={documents} onChange={(e) => setDocuments(e.target.value)} required />
              </div>

              

              <div>
                <label className="mb-1 block text-sm font-medium">Site Image URL</label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" className="w-full">
                Create Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </Layout>
  )
}
