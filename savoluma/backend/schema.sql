-- ============================================================================
-- SavoLuma Platform — MySQL schema
-- Run once against an empty `savoluma_db` database, then set
-- spring.jpa.hibernate.ddl-auto=validate in application.yml for production.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS savoluma_db CHARACTER SET utf8mb4;
USE savoluma_db;

CREATE TABLE users (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id       VARCHAR(20)  NOT NULL UNIQUE,
    username          VARCHAR(60)  NOT NULL UNIQUE,
    password_hash     VARCHAR(100) NOT NULL,
    full_name         VARCHAR(120) NOT NULL,
    email             VARCHAR(120) NOT NULL UNIQUE,
    phone             VARCHAR(20),
    role              VARCHAR(30)  NOT NULL,          -- ADMIN, CEO, HR, MANAGER, EMPLOYEE, ...
    department        VARCHAR(80),
    team              VARCHAR(80),
    manager_id        BIGINT,
    title             VARCHAR(80),
    status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, BLOCKED
    photo_url         VARCHAR(255),
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_manager FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE clients (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    logo_text    VARCHAR(60),
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id  BIGINT NOT NULL,
    username   VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    contact_name  VARCHAR(120) NOT NULL,
    email      VARCHAR(120) NOT NULL UNIQUE,
    status     VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_cu_client FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE projects (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_code  VARCHAR(20) NOT NULL UNIQUE,
    name          VARCHAR(150) NOT NULL,
    client_id     BIGINT,
    manager_id    BIGINT,
    description   TEXT,
    status        VARCHAR(30) NOT NULL DEFAULT 'PLANNING',
    priority      VARCHAR(20) DEFAULT 'MEDIUM',
    progress      INT NOT NULL DEFAULT 0,
    budget        DECIMAL(14,2),
    start_date    DATE,
    end_date      DATE,
    tech_stack    VARCHAR(255),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_client  FOREIGN KEY (client_id)  REFERENCES clients(id),
    CONSTRAINT fk_project_manager FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE project_members (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id  BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    project_role VARCHAR(50),
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_pm_user    FOREIGN KEY (user_id)    REFERENCES users(id),
    UNIQUE KEY uq_project_member (project_id, user_id)
);

CREATE TABLE project_milestones (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id  BIGINT NOT NULL,
    name        VARCHAR(150) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, IN_PROGRESS, DONE
    due_date    DATE,
    CONSTRAINT fk_milestone_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE tasks (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_code      VARCHAR(20) NOT NULL UNIQUE,
    project_id     BIGINT NOT NULL,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    assigned_to    BIGINT,
    assigned_by    BIGINT,
    priority       VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status         VARCHAR(20) NOT NULL DEFAULT 'TODO',
    due_date       DATE,
    estimated_hours DECIMAL(6,2),
    actual_hours   DECIMAL(6,2),
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_project FOREIGN KEY (project_id)  REFERENCES projects(id),
    CONSTRAINT fk_task_assignee FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT fk_task_assigner FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE TABLE attendance (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    work_date      DATE NOT NULL,
    minutes_worked INT NOT NULL DEFAULT 0,
    status         VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uq_attendance (user_id, work_date)
);

CREATE TABLE leads (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    lead_code      VARCHAR(20) NOT NULL UNIQUE,
    name           VARCHAR(120) NOT NULL,
    company        VARCHAR(150),
    email          VARCHAR(120),
    phone          VARCHAR(20),
    source         VARCHAR(30),
    requirement    TEXT,
    budget         DECIMAL(14,2),
    status         VARCHAR(30) NOT NULL DEFAULT 'NEW',
    assigned_to    BIGINT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lead_assignee FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE support_tickets (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_code    VARCHAR(20) NOT NULL UNIQUE,
    client_id      BIGINT,
    project_id     BIGINT,
    subject        VARCHAR(200) NOT NULL,
    description    TEXT,
    category       VARCHAR(50),
    priority       VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status         VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    assigned_agent BIGINT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_ticket_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_ticket_agent FOREIGN KEY (assigned_agent) REFERENCES users(id)
);

CREATE TABLE consultations (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    company       VARCHAR(150),
    email         VARCHAR(120) NOT NULL,
    phone         VARCHAR(20),
    preferred_date DATE,
    preferred_time VARCHAR(20),
    requirement   TEXT,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    assigned_to   BIGINT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consult_assignee FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE quote_requests (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(120) NOT NULL,
    company      VARCHAR(150),
    email        VARCHAR(120) NOT NULL,
    phone        VARCHAR(20),
    service      VARCHAR(120),
    budget       VARCHAR(60),
    timeline     VARCHAR(60),
    requirements TEXT,
    status       VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_postings (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(150) NOT NULL,
    team       VARCHAR(80),
    location   VARCHAR(120),
    job_type   VARCHAR(30),
    is_open    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_applications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id      BIGINT,
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(120) NOT NULL,
    phone       VARCHAR(20),
    resume_url  VARCHAR(255),
    message     TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'RECEIVED',
    applied_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES job_postings(id)
);

CREATE TABLE leave_requests (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    from_date   DATE NOT NULL,
    to_date     DATE NOT NULL,
    reason      TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE roles (
    id    VARCHAR(30) PRIMARY KEY,
    label VARCHAR(80) NOT NULL
);

CREATE TABLE permissions (
    id    VARCHAR(50) PRIMARY KEY,
    label VARCHAR(120)
);

CREATE TABLE role_permissions (
    role_id       VARCHAR(30) NOT NULL,
    permission_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

CREATE TABLE audit_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    action      VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   VARCHAR(50),
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE notifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    title       VARCHAR(150) NOT NULL,
    message     VARCHAR(500),
    type        VARCHAR(40),
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_tasks_assignee ON tasks(assigned_to);
CREATE INDEX idx_tasks_project  ON tasks(project_id);
CREATE INDEX idx_leads_status   ON leads(status);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_manager  ON users(manager_id);
