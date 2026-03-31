import mongoose from 'mongoose'

const PROJECT_STATUSES = ['Submitted', 'Under Review', 'Approved', 'Installation Scheduled', 'Live']
const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Critical']
const STAGE_STATUSES = ['Completed', 'In Progress', 'Pending']

const createDefaultTimeline = () => {
  const now = new Date()

  return [
    { owner: 'Consumer', label: 'Registration', status: 'Completed', updatedAt: now },
    { owner: 'Consumer', label: 'Application', status: 'Completed', updatedAt: now },
    { owner: 'Discom', label: 'Feasibility', status: 'Pending', updatedAt: null },
    { owner: 'Consumer', label: 'Vendor Selection', status: 'Pending', updatedAt: null },
    { owner: 'Vendor', label: 'Upload Agreement', status: 'Pending', updatedAt: null },
    { owner: 'Vendor', label: 'Installation', status: 'Pending', updatedAt: null },
    { owner: 'Discom', label: 'Inspection', status: 'Pending', updatedAt: null },
    { owner: 'Discom', label: 'Project Commissioning', status: 'Pending', updatedAt: null },
    { owner: 'Consumer', label: 'Subsidy Request', status: 'Pending', updatedAt: null },
    { owner: 'REC', label: 'Subsidy Disbursal', status: 'Pending', updatedAt: null },
  ]
}

const documentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    category: {
      type: String,
      default: 'General',
    },
    uploadedBy: {
      type: String,
      default: 'MIIMU Admin',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const folderFileSchema = new mongoose.Schema(
  {
    name: String,
    relativePath: String,
    mimeType: String,
    size: Number,
    dataUrl: String,
  },
  { _id: false }
)

const folderSchema = new mongoose.Schema(
  {
    name: String,
    uploadedBy: {
      type: String,
      default: 'MIIMU Admin',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    files: {
      type: [folderFileSchema],
      default: [],
    },
  },
  { _id: false }
)

const stageProgressSchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      trim: true,
      required: true,
    },
    label: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      enum: STAGE_STATUSES,
      default: 'Pending',
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
)

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  applicantName: {
    type: String,
    trim: true,
    required: true,
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  location: {
    type: String,
    trim: true,
    required: true,
  },
  capacityKw: {
    type: Number,
    min: 0,
    default: 0,
  },
  systemType: {
    type: String,
    trim: true,
    default: 'Rooftop PV',
  },
  status: {
    type: String,
    enum: PROJECT_STATUSES,
    default: 'Submitted',
  },
  priority: {
    type: String,
    enum: PRIORITY_LEVELS,
    default: 'Medium',
  },
  ingredients: {
    type: [String],
    default: [],
  },
  steps: {
    type: [String],
    default: [],
  },
  documents: {
    type: [documentSchema],
    default: [],
  },
  folders: {
    type: [folderSchema],
    default: [],
  },
  adminRemarks: {
    type: String,
    trim: true,
    default: '',
  },
  stageProgress: {
    type: [stageProgressSchema],
    default: createDefaultTimeline,
  },
  imageUrl: {
    type: String,
    trim: true,
    default: '',
  },
  likes: {
    type: Number,
    min: 0,
    default: 0,
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

const Recipe = mongoose.model('Recipe', recipeSchema)
export default Recipe
