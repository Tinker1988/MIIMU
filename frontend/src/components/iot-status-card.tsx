import { Cpu, Gauge, RadioTower, TriangleAlert } from "lucide-react"
import { getBadgeClass, formatDateTime, type IotStatus } from "@/lib/application"
import { cn } from "@/lib/utils"

interface IotStatusCardProps {
  status: IotStatus
}

export function IotStatusCard({ status }: IotStatusCardProps) {
  const items = [
    { label: 'Gateway', value: status.gateway, icon: RadioTower },
    { label: 'Inverter', value: status.inverter, icon: Cpu },
    { label: 'Smart Meter', value: status.meter, icon: Gauge },
  ]

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">IoT Health</p>
          <h3 className="mt-2 text-2xl font-semibold">Live device status</h3>
        </div>
        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Generation Today</p>
          <p className="mt-1 text-xl font-semibold">{status.generationToday} kWh</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3 text-slate-600">
                <Icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </div>
              <div className={cn('mt-4 inline-flex rounded-full border px-3 py-1 text-sm', getBadgeClass(item.value))}>
                {item.value}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-sm text-amber-800">Battery Health</p>
          <p className="mt-2 text-lg font-semibold text-amber-950">{status.batteryHealth}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Last Ping</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{formatDateTime(status.lastPing)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-slate-600">
          <TriangleAlert className="h-4 w-4" />
          Active Alerts
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {status.alerts.length > 0 ? status.alerts.map((alert) => (
            <span key={alert} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm text-rose-700">
              {alert}
            </span>
          )) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
              No active alerts
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
