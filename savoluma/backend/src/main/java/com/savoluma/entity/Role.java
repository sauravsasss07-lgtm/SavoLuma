package com.savoluma.entity;

/**
 * Mirrors the roles used across the frontend (see frontend/js/data.js → roles).
 * CEO is treated as unrestricted in business logic (see RoleService), but
 * still authenticates and is authorized through the same Spring Security
 * chain as every other role — there is no bypass path.
 */
public enum Role {
    SUPER_ADMIN,
    ADMIN,
    CEO,
    CFO,
    COO,
    CTO,
    CBO,
    DIRECTOR,
    ASST_DIRECTOR,
    MANAGER,
    ASST_MANAGER,
    HR,
    FINANCE,
    SALES,
    SUPPORT,
    DEVELOPER,
    QA,
    EMPLOYEE,
    CLIENT
}
