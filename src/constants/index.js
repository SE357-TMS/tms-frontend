// Trạng thái tour
export const TRAVEL_STATUS = {
  PLANNED: 'PLANNED',
  BOOKING: 'BOOKING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Labels cho trạng thái
export const TRAVEL_STATUS_LABELS = {
  [TRAVEL_STATUS.PLANNED]: 'Đang lên kế hoạch',
  [TRAVEL_STATUS.BOOKING]: 'Đang đặt chỗ',
  [TRAVEL_STATUS.CONFIRMED]: 'Đã xác nhận',
  [TRAVEL_STATUS.IN_PROGRESS]: 'Đang diễn ra',
  [TRAVEL_STATUS.COMPLETED]: 'Hoàn thành',
  [TRAVEL_STATUS.CANCELLED]: 'Đã hủy',
};

// Loại hình du lịch
export const TRAVEL_TYPE = {
  DOMESTIC: 'DOMESTIC',
  INTERNATIONAL: 'INTERNATIONAL',
  BUSINESS: 'BUSINESS',
  LEISURE: 'LEISURE',
};

// Labels cho loại hình du lịch
export const TRAVEL_TYPE_LABELS = {
  [TRAVEL_TYPE.DOMESTIC]: 'Trong nước',
  [TRAVEL_TYPE.INTERNATIONAL]: 'Quốc tế',
  [TRAVEL_TYPE.BUSINESS]: 'Công tác',
  [TRAVEL_TYPE.LEISURE]: 'Nghỉ dưỡng',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TRAVELS: '/travels',
  TRAVEL_DETAIL: '/travels/:id',
  BOOKINGS: '/bookings',
  PROFILE: '/profile',
};
