import { Check, Clock3, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, getBadgeClass, type StageProgress, type StageState } from "@/lib/application"

interface ProjectTimelineProps {
  stages: StageProgress[]
  editable?: boolean
  onStageChange?: (index: number, status: StageState) => void
}

const iconForStatus = (status: StageState) => {
  if (status === 'Completed') return Check
  if (status === 'In Progress') return Clock3
  return FileText
}

const circleClass = (status: StageState) => {
  if (status === 'Completed') return 'bg-green-600 text-white'
  if (status === 'In Progress') return 'bg-sky-500 text-white'
  return 'bg-slate-500 text-white'
}

const connectorClass = (status: StageState) => {
  return status === 'Completed' ? 'bg-green-600' : 'bg-slate-400'
}

const strokeClass = (status: StageState) => {
  return status === 'Completed' ? 'stroke-emerald-500' : 'stroke-slate-300'
}

export function ProjectTimeline({ stages, editable = false, onStageChange }: ProjectTimelineProps) {
  return (
    <div className="pb-2">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage, index) => {
          const Icon = iconForStatus(stage.status)
          const hasNext = index < stages.length - 1

          return (
            <div key={`${stage.label}-${index}`} className="relative">
              {hasNext ? (
                <>
                  <div
                    className={cn(
                      "absolute left-4 top-[4.4rem] h-[calc(100%-3rem)] w-10 sm:hidden",
                      "pointer-events-none",
                    )}
                  >
                    <svg viewBox="0 0 40 140" className="h-full w-full overflow-visible">
                      <path
                        d="M12 0 C12 34, 28 22, 28 56 L28 140"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className={strokeClass(stage.status)}
                      />
                    </svg>
                  </div>
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-8 top-7 hidden h-16 w-16 xl:block",
                    )}
                  >
                    <svg viewBox="0 0 64 64" className="h-full w-full overflow-visible">
                      <path
                        d="M4 12 C26 12, 18 52, 40 52 L64 52"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className={strokeClass(stage.status)}
                      />
                    </svg>
                  </div>
                  <div
                    className={cn(
                      "pointer-events-none absolute left-[calc(50%-1rem)] top-[4.8rem] hidden h-12 w-[calc(100%+2rem)] sm:block xl:hidden",
                      connectorClass(stage.status)
                    )}
                  >
                    <svg viewBox="0 0 240 48" className="h-full w-full overflow-visible">
                      <path
                        d="M0 8 C32 8, 24 40, 72 40 L240 40"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className={strokeClass(stage.status)}
                      />
                    </svg>
                  </div>
                </>
              ) : null}
              <div className="relative z-10 flex rounded-xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                <div className="w-full">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{stage.owner}</p>
                  <div className="mt-3 flex items-center">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', circleClass(stage.status))}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-4 pr-2 text-sm font-medium leading-5 text-slate-700">{stage.label}</p>
                  {editable ? (
                    <select
                      value={stage.status}
                      onChange={(event) => onStageChange?.(index, event.target.value as StageState)}
                      className="mt-3 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                    </select>
                  ) : (
                    <div className={cn('mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs sm:text-sm', getBadgeClass(stage.status))}>
                      {stage.status}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-500 sm:text-sm">{formatDateTime(stage.updatedAt)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
