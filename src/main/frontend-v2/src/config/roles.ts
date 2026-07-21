// Centralized RBAC configuration
// Adding a new role = adding an entry here. No scattered if-checks.

export type UserRole =
  | 'nCoordinator'
  | 'vCoordinator'
  | 'nAdmin'
  | 'vAdmin'
  | 'sAdmin'
  | 'Volunteer';

export type Permission =
  | 'dashboard.view'
  | 'needs.view'
  | 'needs.create'
  | 'needs.edit'
  | 'needs.delete'
  | 'needs.approve'
  | 'need-plans.view'
  | 'nominations.view'
  | 'nominations.review'
  | 'nominations.self'
  | 'volunteers.view'
  | 'volunteers.manage'
  | 'entities.view'
  | 'entities.manage'
  | 'agencies.view'
  | 'agencies.manage'
  | 'sessions.view'
  | 'settings.view'
  | 'explore.needs'
  | 'profile.edit';

export interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: string; // MUI icon name
}

export interface RoleConfig {
  label: string;
  defaultRoute: string;
  layout: 'admin' | 'volunteer';
  sidebarItems: SidebarItem[];
  permissions: Permission[];
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  nCoordinator: {
    label: 'Need Coordinator',
    defaultRoute: '/app/dashboard',
    layout: 'admin',
    sidebarItems: [
      { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: 'Dashboard' },
      { id: 'needs', label: 'Needs', path: '/app/needs', icon: 'Assignment' },
      { id: 'need-plans', label: 'Need Schedule', path: '/app/need-plans', icon: 'CalendarMonth' },
      { id: 'settings', label: 'Settings', path: '/app/settings', icon: 'Settings' },
    ],
    permissions: [
      'dashboard.view',
      'needs.view',
      'needs.create',
      'needs.edit',
      'need-plans.view',
      'nominations.view',
      'nominations.review',
      'settings.view',
      'profile.edit',
    ],
  },
  vCoordinator: {
    label: 'Volunteer Coordinator',
    defaultRoute: '/app/dashboard',
    layout: 'admin',
    sidebarItems: [
      { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: 'Dashboard' },
      { id: 'volunteers', label: 'Volunteers', path: '/app/volunteers', icon: 'People' },
      { id: 'settings', label: 'Settings', path: '/app/settings', icon: 'Settings' },
    ],
    permissions: [
      'dashboard.view',
      'volunteers.view',
      'volunteers.manage',
      'settings.view',
      'profile.edit',
    ],
  },
  nAdmin: {
    label: 'Need Admin',
    defaultRoute: '/app/approvals',
    layout: 'admin',
    sidebarItems: [
      { id: 'approvals', label: 'Approvals', path: '/app/approvals', icon: 'FactCheck' },
      { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: 'Dashboard' },
      { id: 'needs', label: 'Needs', path: '/app/needs', icon: 'Assignment' },
      { id: 'entities', label: 'Entities', path: '/app/entities', icon: 'Business' },
      { id: 'coordinators', label: 'Coordinators', path: '/app/coordinators', icon: 'People' },
      { id: 'sessions', label: 'Sessions', path: '/app/sessions', icon: 'CalendarMonth' },
      { id: 'settings', label: 'Settings', path: '/app/settings', icon: 'Settings' },
    ],
    permissions: [
      'dashboard.view',
      'needs.view',
      'needs.create',
      'needs.edit',
      'needs.approve',
      'entities.view',
      'entities.manage',
      'sessions.view',
      'settings.view',
      'profile.edit',
    ],
  },
  vAdmin: {
    label: 'Volunteer Admin',
    defaultRoute: '/app/dashboard',
    layout: 'admin',
    sidebarItems: [
      { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: 'Dashboard' },
      { id: 'volunteers', label: 'Volunteers', path: '/app/volunteers', icon: 'People' },
      { id: 'agencies', label: 'Agencies', path: '/app/agencies', icon: 'Business' },
      { id: 'settings', label: 'Settings', path: '/app/settings', icon: 'Settings' },
    ],
    permissions: [
      'dashboard.view',
      'volunteers.view',
      'volunteers.manage',
      'agencies.view',
      'agencies.manage',
      'settings.view',
      'profile.edit',
    ],
  },
  sAdmin: {
    label: 'Serve Admin',
    defaultRoute: '/app/dashboard',
    layout: 'admin',
    sidebarItems: [
      { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: 'Dashboard' },
      { id: 'needs', label: 'Needs', path: '/app/needs', icon: 'Assignment' },
      { id: 'volunteers', label: 'Volunteers', path: '/app/volunteers', icon: 'People' },
      { id: 'entities', label: 'Entities', path: '/app/entities', icon: 'Business' },
      { id: 'agencies', label: 'Agencies', path: '/app/agencies', icon: 'CorporateFare' },
      { id: 'sessions', label: 'Sessions', path: '/app/sessions', icon: 'CalendarMonth' },
      { id: 'settings', label: 'Settings', path: '/app/settings', icon: 'Settings' },
    ],
    permissions: [
      'dashboard.view',
      'needs.view',
      'needs.create',
      'needs.edit',
      'needs.delete',
      'needs.approve',
      'need-plans.view',
      'nominations.view',
      'nominations.review',
      'volunteers.view',
      'volunteers.manage',
      'entities.view',
      'entities.manage',
      'agencies.view',
      'agencies.manage',
      'sessions.view',
      'settings.view',
      'profile.edit',
    ],
  },
  Volunteer: {
    label: 'Volunteer',
    defaultRoute: '/explore/home',
    layout: 'volunteer',
    sidebarItems: [],
    permissions: ['explore.needs', 'nominations.self', 'profile.edit'],
  },
};

// Helper: get role config for a user (handles array or string role from API)
export function getRoleConfig(role: string | string[] | undefined): RoleConfig | null {
  if (!role) return null;
  const roleStr = Array.isArray(role) ? role[0] : role;
  return ROLE_CONFIG[roleStr as UserRole] ?? null;
}

// Helper: check if user has a specific permission
export function hasPermission(
  role: string | string[] | undefined,
  permission: Permission,
): boolean {
  const config = getRoleConfig(role);
  if (!config) return false;
  return config.permissions.includes(permission);
}
