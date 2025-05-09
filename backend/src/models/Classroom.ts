import mongoose, { Document, Schema } from 'mongoose';

// Define interface for classroom assignment
export interface IAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  submissionType: string;
  associatedDesigns: string[];  // Array of Design IDs
  createdAt: Date;
}

// Define main Classroom interface
export interface IClassroom extends Document {
  name: string;
  teacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  assignments: IAssignment[];
  institutionId?: mongoose.Types.ObjectId;
  description?: string;
  gradeLevel?: string;
  subject?: string;
  academicYear?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define schema for assignments
const AssignmentSchema = new Schema<IAssignment>({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  submissionType: {
    type: String,
    required: true,
    enum: ['design', 'report', 'template', 'other'],
    default: 'design'
  },
  associatedDesigns: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Define main Classroom schema
const ClassroomSchema = new Schema<IClassroom>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  assignments: [AssignmentSchema],
  institutionId: {
    type: Schema.Types.ObjectId,
    ref: 'Institution'
  },
  description: {
    type: String
  },
  gradeLevel: {
    type: String
  },
  subject: {
    type: String
  },
  academicYear: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for common queries
ClassroomSchema.index({ teacher: 1 });
ClassroomSchema.index({ institutionId: 1 });
ClassroomSchema.index({ 'assignments.dueDate': 1 });

// Compound index for efficient student management
ClassroomSchema.index({ teacher: 1, institutionId: 1 });

// Virtual for number of students
ClassroomSchema.virtual('studentCount').get(function() {
  return this.students.length;
});

// Virtual for number of assignments
ClassroomSchema.virtual('assignmentCount').get(function() {
  return this.assignments.length;
});

// Middleware to ensure institutionId consistency when saving
ClassroomSchema.pre('save', async function(next) {
  // If this classroom belongs to an institution, ensure the institution exists and is updated
  if (this.institutionId) {
    try {
      // Find the institution
      const institution = await mongoose.model('Institution').findById(this.institutionId);
      if (!institution) {
        throw new Error(`Institution with ID ${this.institutionId} not found`);
      }
      
      // Update the institution's classrooms array if needed
      const classroomId = this._id;
      if (institution.classrooms.indexOf(classroomId) === -1) {
        institution.classrooms.push(classroomId);
        await institution.save();
      }
      
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model<IClassroom>('Classroom', ClassroomSchema);
