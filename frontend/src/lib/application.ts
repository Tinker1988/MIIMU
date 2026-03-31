export type StageState = 'Completed' | 'In Progress' | 'Pending'

export interface StageProgress {
  owner: string
  label: string
  status: StageState
  updatedAt?: string | null
}

export interface IotStatus {
  gateway: string
  inverter: string
  meter: string
  batteryHealth: string
  generationToday: number
  lastPing?: string | null
  alerts: string[]
}

export interface ApplicationDocument {
  name: string
  url: string
  category: string
  uploadedBy?: string
  uploadedAt?: string
}

export interface ApplicationFolderFile {
  name: string
  relativePath: string
  mimeType: string
  size: number
  dataUrl: string
}

export interface ApplicationFolder {
  name: string
  uploadedBy?: string
  uploadedAt?: string
  files: ApplicationFolderFile[]
}

export interface ApplicationRecord {
  _id: string
  title: string
  description: string
  applicantName?: string
  contactEmail?: string
  location?: string
  capacityKw?: number
  systemType?: string
  status?: string
  priority?: string
  ingredients: string[]
  steps: string[]
  documents: ApplicationDocument[]
  folders: ApplicationFolder[]
  adminRemarks?: string
  stageProgress: StageProgress[]
  iotStatus: IotStatus
  imageUrl?: string
  likes: number
  likedBy: Array<string | { username: string }>
  user: {
    username: string
    name?: string
    role?: string
  }
  createdAt?: string
}

export const stageStatusOptions: StageState[] = ['Completed', 'In Progress', 'Pending']
export const projectStatusOptions = ['Submitted', 'Under Review', 'Approved', 'Installation Scheduled', 'Live']
export const priorityOptions = ['Low', 'Medium', 'High', 'Critical']
export const iotStateOptions = ['Online', 'Offline', 'Pending', 'Fault']

export const formatDateTime = (value?: string | null) => {
  if (!value) return 'Pending'

  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getBadgeClass = (status: string) => {
  if (status === 'Completed' || status === 'Online' || status === 'Approved' || status === 'Live') {
    return 'border-emerald-300 bg-emerald-50 text-emerald-700'
  }

  if (status === 'In Progress' || status === 'Under Review' || status === 'Installation Scheduled' || status === 'Pending') {
    return 'border-sky-300 bg-sky-50 text-sky-700'
  }

  if (status === 'Critical' || status === 'Fault') {
    return 'border-rose-300 bg-rose-50 text-rose-700'
  }

  return 'border-slate-300 bg-slate-50 text-slate-600'
}
