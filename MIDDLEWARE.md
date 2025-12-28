# Middleware Documentation

## Overview
This application uses a layered middleware approach for authentication and authorization.

## Middleware Files

### 1. `auth.ts` - Authentication Middleware
**Purpose**: Checks if user is authenticated  
**Usage**: Can be used for any protected route  
**What it does**:
- Initializes auth state from localStorage if not loaded
- Checks if user is authenticated
- Redirects to `/auth/login` if not authenticated

**Example**:
```typescript
definePageMeta({
  middleware: 'auth'
})
```

---

### 2. `admin.ts` - Admin Role Middleware
**Purpose**: Checks if user has ADMIN or SUPER_ADMIN role  
**Usage**: For admin-only routes  
**What it does**:
- Ensures auth is initialized
- Double-checks authentication (safety net)
- Checks if user has ADMIN or SUPER_ADMIN role
- Redirects non-admin users to home page

**Example**:
```typescript
definePageMeta({
  middleware: ['auth', 'admin'] // Use both for admin pages
})
```

---

### 3. `scanner.ts` - Scanner Role Middleware
**Purpose**: Checks if user has SCANNER role  
**Usage**: For scanner-only routes  
**What it does**:
- Ensures auth is initialized
- Double-checks authentication
- Checks if user has SCANNER role
- Redirects non-scanner users to home page

**Example**:
```typescript
definePageMeta({
  middleware: ['auth', 'scanner']
})
```

---

### 4. `guest.ts` - Guest-Only Middleware
**Purpose**: Ensures user is NOT authenticated  
**Usage**: For auth pages (login, register, forgot-password, etc.)  
**What it does**:
- Initializes auth state from localStorage
- Checks if user is authenticated
- Redirects authenticated users to their appropriate dashboard based on role
  - ADMIN/SUPER_ADMIN → `/admin/dashboard`
  - SCANNER → `/scanner`
  - CUSTOMER → `/` (home)

**Example**:
```typescript
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})
```

---

## Middleware Execution Order

When using multiple middlewares, they execute in array order:

```typescript
definePageMeta({
  middleware: ['auth', 'admin']
})
```

**Execution flow**:
1. `auth.ts` runs first → checks authentication
2. `admin.ts` runs second → checks role

---

## Best Practices

### ✅ DO:
- Use `['auth', 'admin']` for admin pages
- Use `['auth', 'scanner']` for scanner pages
- Use `'auth'` alone for general protected pages (e.g., user profile)
- Keep middleware focused on single responsibility

### ❌ DON'T:
- Don't use role middleware without auth middleware
- Don't duplicate authentication logic in role middlewares
- Don't use middleware for business logic (use composables instead)

---

## Current Usage

### Auth Pages
All pages in `/app/pages/auth/` use:
```typescript
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})
```

**Pages**:
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`

### Admin Pages
All pages in `/app/pages/admin/` use:
```typescript
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})
```

**Pages**:
- `/admin/dashboard`
- `/admin/users`
- `/admin/attractions`
- `/admin/tickets`
- `/admin/transactions`
- `/admin/settings`

### Scanner Pages
Pages in `/app/pages/scanner/` should use:
```typescript
definePageMeta({
  middleware: ['auth', 'scanner']
})
```

### Customer Pages
Pages like profile, my-tickets should use:
```typescript
definePageMeta({
  middleware: 'auth'
})
```

---

## How It Works

### Page Refresh Scenario
1. User refreshes `/admin/dashboard`
2. Middleware `auth.ts` runs:
   - `isAuthenticated` = false (state not loaded yet)
   - Calls `initAuth()` → restores from localStorage
   - `isAuthenticated` = true ✅
3. Middleware `admin.ts` runs:
   - Checks user role
   - If ADMIN/SUPER_ADMIN → ✅ Pass
   - If not → Redirect to home
4. Page loads successfully

### First Login Scenario
1. User logs in at `/auth/login`
2. `login()` saves token & user to localStorage
3. Redirect to `/admin/dashboard` based on role
4. Middleware `auth.ts` runs:
   - `isAuthenticated` = true (already set by login)
   - Skips `initAuth()` (already initialized)
5. Middleware `admin.ts` runs:
   - Checks role → ✅ Pass
6. Page loads successfully

---

## Adding New Role Middleware

To add a new role (e.g., MANAGER):

1. Create `/app/middleware/manager.ts`:
```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
    const { user, isAuthenticated, initAuth } = useAuth()

    if (!isAuthenticated.value) {
        await initAuth()
    }

    if (!isAuthenticated.value) {
        return navigateTo('/auth/login')
    }

    const userRole = user.value?.role
    if (userRole !== 'MANAGER') {
        return navigateTo('/')
    }
})
```

2. Use in pages:
```typescript
definePageMeta({
  middleware: ['auth', 'manager']
})
```

---

## Troubleshooting

### Issue: User gets logged out on refresh
**Solution**: Make sure `initAuth()` is called in middleware

### Issue: Middleware runs twice
**Solution**: This is normal - middleware runs on both server and client. The `isInitialized` flag prevents duplicate API calls.

### Issue: Wrong redirect after login
**Solution**: Check login redirect logic in `/app/pages/auth/login.vue` - it should redirect based on role.

---

## Related Files
- `/app/composables/useAuth.ts` - Auth composable with `initAuth()`
- `/app/pages/auth/login.vue` - Login page with role-based redirect
- `/app/layouts/admin.vue` - Admin layout with auth initialization
