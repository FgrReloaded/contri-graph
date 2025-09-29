export type GraphDotShape = 'rounded' | 'square' | 'circle' | 'diamond' | 'triangle' | 'hexagon'

export interface GraphAppearance {
  baseColor: string
  minOpacity: number
  maxOpacity: number
  size: number
  gap: number
  shape: GraphDotShape
  base3DColor?: string
  cameraAngleX: number
  cameraAngleY: number
  cameraAngleZ: number
}

export const defaultGraphAppearance: GraphAppearance = {
  baseColor: '#10b981',
  minOpacity: 0.1,
  maxOpacity: 1,
  size: 12,
  gap: 2,
  shape: 'rounded',
  base3DColor: '#cccccc',
  cameraAngleX: 45,
  cameraAngleY: 45,
  cameraAngleZ: 45,
}


