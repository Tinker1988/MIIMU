import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"

import { useUser } from "@/context/UserContext"

export default function HomePage() {
  const { user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [navigate, user])

  if (user) return null

  return (
    <>
      <Navbar />
      <main className="pb-16">
        <section className="hero-shell">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1.45fr_1fr] md:py-12">
            <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_80px_rgba(245,158,11,0.14)] backdrop-blur md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Solar Operations Hub</p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
                Make In India Mahila Udyog manages solar applications and project updates in one place.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                For users, the platform offers a clear and smooth project journey from application to installation. They can easily check real-time updates, track the status of their project, and receive important notifications. All necessary documents such as approvals, reports, and invoices are stored digitally, allowing users to access them anytime without hassle.

                The hub also improves communication between users and administrators by providing timely updates and alerts about each step of the project. This reduces confusion and delays while increasing transparency and trust. Overall, the Solar Operations Hub supports the growth of clean energy by making solar project management more accessible, user-friendly, and reliable, while also encouraging sustainable development and wider adoption of solar solutions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">

              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-white/60 bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.24)] md:p-6">
                <p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">On-Grid</p>
                <p className="mt-4 text-2xl font-semibold md:text-3xl">What is an On-Grid Solar System?</p>
                <p className="mt-3 text-sm text-slate-300">An on-grid solar system, also known as a grid-tied or grid-connected solar system, is directly linked to the public electricity grid. It generates electricity using solar panels and supplies it to your home in real time. When the solar system produces more electricity than needed, the excess power is exported to the grid. When solar production is insufficient (such as at night), electricity is imported from the grid.

                </p>
              </div>
              <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 shadow-[0_20px_60px_rgba(16,185,129,0.08)] md:p-6">
                <p className="text-sm uppercase tracking-[0.22em] text-emerald-700">Off-Grid</p>
                <p className="mt-4 text-2xl font-semibold text-emerald-950 md:text-3xl">What is an Off Grid Solar System?</p>
                <p className="mt-3 text-sm text-emerald-900/80">An off grid solar system is a standalone solar power setup that functions completely independently from the main electricity grid. Unlike grid-connected systems, it generates electricity using solar panels and stores excess energy in batteries for use when sunlight is unavailable. This allows homes, farms, and businesses to have a reliable power supply without relying on the utility grid.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
