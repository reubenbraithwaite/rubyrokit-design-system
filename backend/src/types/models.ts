/**
 * Common types used across multiple models
 */

export enum CuttingMethod {
  DIGITAL = 'digital',
  HAND = 'hand',
  HYBRID = 'hybrid',
  LASER = 'laser',
  DIE = 'die',
}

export enum ComponentType {
  NOSECONE_SHROUD = 'nosecone_shroud',
  PAYLOAD_SHROUD = 'payload_shroud',
  MAIN_BODY_SHROUD = 'main_body_shroud',
  BULKHEAD = 'bulkhead',
  SPAR = 'spar',
  FIN = 'fin',
  NOSECONE_SUPPORT = 'nosecone_support',
  OTHER = 'other',
}

export enum SectionType {
  NOSECONE = 'nosecone',
  PAYLOAD_BAY = 'payload_bay',
  MAIN_BODY = 'main_body',
}

export enum FinType {
  MAIN = 'main',
  UPPER = 'upper',
}

export enum ConnectionType {
  FIXED = 'fixed',
  SEPARABLE = 'separable',
  FUNCTIONAL = 'functional',
}

export enum MechanismType {
  TAB_SLOT = 'tab_slot',
  THREADED = 'threaded',
  FRICTION = 'friction',
  OTHER = 'other',
}

export enum FlightPhase {
  LAUNCH = 'launch',
  MID_THRUST = 'mid_thrust',
  COAST = 'coast',
  RECOVERY = 'recovery',
}

export enum StabilityStatus {
  STABLE = 'stable',
  MARGINAL = 'marginal',
  UNSTABLE = 'unstable',
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface BezierControlPoint {
  x: number;
  y: number;
  handleIn?: Position;
  handleOut?: Position;
}

export interface Dimensions {
  height?: number;
  width?: number;
  length?: number;
  diameter?: number;
  area?: number;
}

export interface TimeValuePair {
  time: number;
  value: number;
}

export interface SymmetryOptions {
  enabled: boolean;
  count: number;
  axis: string;
}

export interface VersionHistory {
  version: number;
  timestamp: Date;
  changes: string;
}
