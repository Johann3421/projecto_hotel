// ==================== Availability ====================
export interface AvailabilityResult {
  roomType: RoomTypeWithDetails
  availableCount: number
  pricePerNight: number
  totalPrice: number
  nights: number
}

export interface RoomTypeWithDetails {
  id: string
  name: string
  slug: string
  description: string
  shortDesc: string | null
  basePrice: number
  weekendSurcharge: number
  maxGuests: number
  bedConfiguration: string
  sizeSqm: number | null
  floor: string | null
  view: string | null
  images: Array<{ id: string; url: string; alt: string | null; caption: string | null; position: number }>
  amenities: Array<{ amenity: { id: string; name: string; icon: string; category: string } }>
  rooms: Array<{ id: string }>
  seasonalPrices: Array<{ id: string; name: string; startDate: Date; endDate: Date; multiplier: number }>
}

// ==================== Booking Store ====================
export interface GuestFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  documentType: "DNI" | "PASSPORT" | "CE" | "RUC"
  documentNumber: string
  notes?: string
  specialRequests?: string
}

export interface ExtraSelection {
  extraId: string
  name: string
  quantity: number
  unitPrice: number
  price?: number
  priceType: string
  icon?: string
  description?: string
}

export interface RoomSelectionData {
  roomTypeId: string
  roomTypeName: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  nights: number
  pricePerNight: number
  roomCost: number
}

// ==================== Server Action Response ====================
export interface ActionResponse<T = unknown> {
  success: boolean
  error?: string
  code?: string
  data?: T
}

// ==================== Housekeeping ====================
export interface HousekeepingEvent {
  type: "ROOM_STATUS_CHANGE" | "ASSIGNMENT" | "COMPLETION"
  roomId: string
  roomNumber: string
  fromStatus?: string
  toStatus?: string
  assignedTo?: string
  timestamp: string
}

// ==================== PMS Dashboard ====================
export interface DashboardKPIs {
  occupancyRate: number
  arrivalsToday: number
  departuresToday: number
  dirtyRooms: number
  totalRooms: number
  revenueToday: number
  revenueYesterday: number
}

export interface TapeChartReservation {
  id: string
  confirmationCode: string
  guestName: string
  checkIn: string
  checkOut: string
  status: string
  roomId: string
  roomNumber: string
}
