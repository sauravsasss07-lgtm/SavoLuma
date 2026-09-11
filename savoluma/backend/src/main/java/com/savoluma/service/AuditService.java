package com.savoluma.service;

import com.savoluma.entity.AuditLog;
import com.savoluma.entity.User;
import com.savoluma.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    /** Call from any service method that creates/updates/deletes a record, or changes a role/permission. */
    public void log(User actor, String action, String entityType, String entityId) {
        String ip = currentIp();
        AuditLog entry = AuditLog.builder()
                .user(actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .ipAddress(ip)
                .build();
        auditLogRepository.save(entry);
    }

    private String currentIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            HttpServletRequest request = attrs.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            return forwarded != null ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }
}
