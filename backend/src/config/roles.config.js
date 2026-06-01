/**
 * Role-Based Access Control (RBAC) Configuration
 * Centralized role definitions and hierarchy for backend
 * This ensures consistency across all backend modules
 */

export const ROLES = {
    ADMIN: "ADMIN",
    EMPLOYER: "EMPLOYER",
    JOB_SEEKER: "JOB_SEEKER"
};

/**
 * Role hierarchy - higher number = more permissions
 */
export const ROLE_HIERARCHY = {
    [ROLES.JOB_SEEKER]: 1,
    [ROLES.EMPLOYER]: 2,
    [ROLES.ADMIN]: 3
};

/**
 * Check if a role has minimum required level
 * @param {string} userRole - The user's role
 * @param {string} minimumRole - The minimum required role
 * @returns {boolean} - True if userRole has at least the minimum level
 */
export const hasMinimumRole = (userRole, minimumRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const minimumLevel = ROLE_HIERARCHY[minimumRole] || 0;
    return userLevel >= minimumLevel;
};

/**
 * Check if a role can manage another role
 * A role can only manage roles below their level
 * @param {string} managerRole - The role trying to manage
 * @param {string} targetRole - The role being managed
 * @returns {boolean} - True if managerRole can manage targetRole
 */
export const canManageRole = (managerRole, targetRole) => {
    // ADMIN can manage all
    if (managerRole === ROLES.ADMIN) return true;
    
    // Others can only manage roles below them
    const managerLevel = ROLE_HIERARCHY[managerRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
    return managerLevel > targetLevel;
};






