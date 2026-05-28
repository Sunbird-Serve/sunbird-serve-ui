// Core domain types for Sunbird Serve

export interface User {
  osid: string;
  identityDetails: {
    fullname: string;
    name: string;
    gender?: string;
    dob?: string;
  };
  contactDetails?: {
    email: string;
    mobile?: string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  role: string[];
  agencyId?: string;
}

export interface Need {
  id: string;
  needTypeId: string;
  name: string;
  description?: string;
  status: NeedStatus;
  userId: string;
  entityId?: string;
  priority?: 'Low' | 'Medium' | 'High';
  startDate?: string;
  endDate?: string;
  occurrence?: string;
  timeSlot?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NeedStatus =
  | 'New'
  | 'Nominated'
  | 'Approved'
  | 'Rejected'
  | 'Assigned'
  | 'Fulfilled';

export interface NeedType {
  id: string;
  name: string;
  description?: string;
  taskType?: string;
  image?: string;
}

export interface Entity {
  id: string;
  name: string;
  description?: string;
  address?: string;
  contactDetails?: {
    email?: string;
    phone?: string;
  };
}

export interface Nomination {
  id: string;
  needId: string;
  userId: string;
  nominatedUserId: string;
  status: 'Nominated' | 'Approved' | 'Rejected' | 'Confirmed';
  createdAt?: string;
}

export interface NeedPlan {
  id: string;
  needId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface Agency {
  id: string;
  name: string;
  description?: string;
  contactDetails?: {
    email?: string;
    phone?: string;
  };
}

// API response wrappers
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiError {
  status: number;
  message: string;
  details?: string;
}
