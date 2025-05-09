import mongoose, { Document, Schema } from 'mongoose';
import {
  BezierControlPoint, 
  CuttingMethod, 
  Position, 
  Rotation, 
  Vector3D,
  SectionType,
  ComponentType, 
  FinType, 
  StabilityStatus,
  FlightPhase,
  SymmetryOptions,
  ConnectionType,
  MechanismType,
  VersionHistory,
  TimeValuePair
} from '../types/models';

// Sub-document interfaces
interface IGlobalSettings {
  defaultCuttingMethod: CuttingMethod;
  defaultMaterial: mongoose.Types.ObjectId;
  scale: number;
}

interface IMaterial {
  type: mongoose.Types.ObjectId;
  thickness: number;
  doubled: boolean;
}

interface IComponent {
  id: string;
  type: ComponentType;
  sectionId: string;
  name: string;
  material: IMaterial;
  cuttingMethod: CuttingMethod;
  bezierControls: BezierControlPoint[];
  position: Position;
  rotation: Rotation;
  symmetry: SymmetryOptions;
  linkedComponents: string[];
  constraints: string[];
  metadata: any;
}

interface IFinDesign {
  id: string;
  componentId: string;
  sectionId: string;
  name: string;
  finType: FinType;
  controlPoints: {
    id: string;
    label: string;
    x: number;
    y: number;
    handleIn?: Position;
    handleOut?: Position;
    isAttachmentPoint: boolean;
  }[];
  dimensions: {
    height: number;
    width: number;
    area: number;
    rootChord: number;
    tipChord: number;
    span: number;
    sweepAngle: number;
  };
  position: {
    axialPosition: number;
    sectionBoundaryIntersect: boolean;
    primaryAttachmentSectionId: string;
  };
  aerodynamics: {
    contributionToCP: Vector3D;
    normalForceCoefficient: number;
    dragCoefficient: number;
  };
}

interface ISectionConnection {
  id: string;
  section1Id: string;
  section2Id: string;
  connectionType: ConnectionType;
  mechanismType: MechanismType;
  components: string[];
}

interface IStabilityAnalysis {
  flightPhases: {
    phase: FlightPhase;
    centerOfPressure: Vector3D;
    centerOfGravity: Vector3D;
    stabilityMargin: number;
    stabilityStatus: StabilityStatus;
  }[];
  recommendations: string[];
}

interface IMassProperties {
  structural: {
    totalMass: number;
    componentMasses: {
      componentId: string;
      mass: number;
      centerOfMass: Vector3D;
    }[];
  };
  propellant: {
    waterVolume: number;
    waterMass: number;
    airPressure: number;
    airMass: number;
  };
  recoverySystem: {
    type: string;
    mass: number;
    deploymentMechanism: {
      type: string;
      mass: number;
    };
    dimensions: any;
    properties: any;
  };
  payload: {
    mass: number;
    position: Vector3D;
    volume: number;
    density: number;
    description: string;
  };
}

interface IFlightPerformance {
  thrust: {
    maxThrust: number;
    averageThrust: number;
    thrustDuration: number;
    thrustCurve: TimeValuePair[];
    impulse: number;
  };
  trajectory: {
    maxAltitude: number;
    maxVelocity: number;
    maxAcceleration: number;
    timeToApogee: number;
    totalFlightTime: number;
    flightPath: {
      time: number;
      x: number;
      y: number;
      z: number;
      velocity: number;
    }[];
  };
  recovery: {
    descentRate: number;
    driftDistance: number;
    impactVelocity: number;
    impactForce: number;
  };
}

interface ITemplateSettings {
  paperSize: string;
  orientation: string;
  units: string;
  includeInstructions: boolean;
  includeRegistrationMarks: boolean;
}

interface IPerformanceMetrics {
  weight: number;
  stability: number;
  dragCoefficient: number;
  estimatedHeight: number;
  centerOfGravity: Vector3D;
  centerOfPressure: Vector3D;
}

// Section schemas need to be more specific based on the technical specifications
interface ISection {
  id: string;
  type: SectionType;
  name: string;
  boundaries: {
    start: number;
    end: number;
  };
  // Additional section-specific fields will be added based on the section type
  [key: string]: any;
}

// Main Design interface
export interface IDesign extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  globalSettings: IGlobalSettings;
  sections: ISection[];
  components: IComponent[];
  sectionConnections: ISectionConnection[];
  finDesigns: IFinDesign[];
  massProperties: IMassProperties;
  stabilityAnalysis: IStabilityAnalysis;
  flightPerformance: IFlightPerformance;
  performanceMetrics: IPerformanceMetrics;
  templateSettings: ITemplateSettings;
  qrCode?: string;
  thumbnailUrl?: string;
  version: number;
  history: VersionHistory[];
}

// Schema definitions
const GlobalSettingsSchema = new Schema<IGlobalSettings>({
  defaultCuttingMethod: {
    type: String,
    enum: Object.values(CuttingMethod),
    default: CuttingMethod.DIGITAL
  },
  defaultMaterial: {
    type: Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  scale: {
    type: Number,
    default: 1.0
  }
}, { _id: false });

const MaterialSchema = new Schema<IMaterial>({
  type: {
    type: Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  thickness: {
    type: Number,
    required: true,
    min: 0
  },
  doubled: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const BezierControlPointSchema = new Schema<BezierControlPoint>({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  handleIn: {
    type: {
      x: Number,
      y: Number
    },
    required: false
  },
  handleOut: {
    type: {
      x: Number,
      y: Number
    },
    required: false
  }
}, { _id: false });

const PositionSchema = new Schema<Position>({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  z: {
    type: Number,
    default: 0
  }
}, { _id: false });

const RotationSchema = new Schema<Rotation>({
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  z: {
    type: Number,
    default: 0
  }
}, { _id: false });

const SymmetryOptionsSchema = new Schema<SymmetryOptions>({
  enabled: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 1,
    min: 1
  },
  axis: {
    type: String,
    default: 'central'
  }
}, { _id: false });

const ComponentSchema = new Schema<IComponent>({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(ComponentType),
    required: true
  },
  sectionId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  material: {
    type: MaterialSchema,
    required: true
  },
  cuttingMethod: {
    type: String,
    enum: Object.values(CuttingMethod),
    required: true
  },
  bezierControls: [BezierControlPointSchema],
  position: {
    type: PositionSchema,
    required: true
  },
  rotation: {
    type: RotationSchema,
    default: { x: 0, y: 0, z: 0 }
  },
  symmetry: {
    type: SymmetryOptionsSchema,
    default: { enabled: false, count: 1, axis: 'central' }
  },
  linkedComponents: [{
    type: String
  }],
  constraints: [{
    type: String
  }],
  metadata: {
    type: Schema.Types.Mixed
  }
}, { _id: false });

// We'll define condensed version of other schemas to keep this file manageable
const SectionSchema = new Schema<ISection>({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(SectionType),
    required: true
  },
  name: {
    type: String,
    required: true
  },
  boundaries: {
    start: {
      type: Number,
      required: true
    },
    end: {
      type: Number,
      required: true
    }
  }
}, { _id: false, strict: false });

const SectionConnectionSchema = new Schema<ISectionConnection>({
  id: {
    type: String,
    required: true
  },
  section1Id: {
    type: String,
    required: true
  },
  section2Id: {
    type: String,
    required: true
  },
  connectionType: {
    type: String,
    enum: Object.values(ConnectionType),
    required: true
  },
  mechanismType: {
    type: String,
    enum: Object.values(MechanismType),
    required: true
  },
  components: [{
    type: String
  }]
}, { _id: false });

// Simplified versions of other schemas to keep this manageable
const FinDesignSchema = new Schema({}, { _id: false, strict: false });
const StabilityAnalysisSchema = new Schema({}, { _id: false, strict: false });
const MassPropertiesSchema = new Schema({}, { _id: false, strict: false });
const FlightPerformanceSchema = new Schema({}, { _id: false, strict: false });
const PerformanceMetricsSchema = new Schema({}, { _id: false, strict: false });
const TemplateSettingsSchema = new Schema({}, { _id: false, strict: false });
const VersionHistorySchema = new Schema<VersionHistory>({
  version: Number,
  timestamp: Date,
  changes: String
}, { _id: false });

// Main Design Schema
const DesignSchema = new Schema<IDesign>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  globalSettings: {
    type: GlobalSettingsSchema,
    required: true
  },
  sections: [SectionSchema],
  components: [ComponentSchema],
  sectionConnections: [SectionConnectionSchema],
  finDesigns: [FinDesignSchema],
  massProperties: {
    type: MassPropertiesSchema
  },
  stabilityAnalysis: {
    type: StabilityAnalysisSchema
  },
  flightPerformance: {
    type: FlightPerformanceSchema
  },
  performanceMetrics: {
    type: PerformanceMetricsSchema
  },
  templateSettings: {
    type: TemplateSettingsSchema
  },
  qrCode: {
    type: String
  },
  thumbnailUrl: {
    type: String
  },
  version: {
    type: Number,
    default: 1
  },
  history: [VersionHistorySchema]
}, {
  timestamps: true
});

// Create indices for performance
DesignSchema.index({ createdBy: 1 });
DesignSchema.index({ isPublic: 1 });
DesignSchema.index({ 'components.type': 1 });

export default mongoose.model<IDesign>('Design', DesignSchema);
