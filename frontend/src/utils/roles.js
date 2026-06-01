/** Chỉ cho phép employer routes khi chạy localhost (dev) */
export function isLocalDev() {
    if (typeof window === 'undefined') return false;
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
}

export function isEmployerRole(role) {
    return role === 'EMPLOYER' || role === 'ADMIN';
}

export function isJobSeekerRole(role) {
    return role === 'JOB_SEEKER';
}
