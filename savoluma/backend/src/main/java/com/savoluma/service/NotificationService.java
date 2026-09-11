package com.savoluma.service;

import com.savoluma.entity.Notification;
import com.savoluma.entity.User;
import com.savoluma.repository.NotificationRepository;
import com.savoluma.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notifyUser(User user, String title, String message, String type) {
        if (user == null) return;
        notificationRepository.save(Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .build());
    }

    public void notifyByEmployeeId(String employeeId, String title, String message, String type) {
        userRepository.findByEmployeeId(employeeId).ifPresent(u -> notifyUser(u, title, message, type));
    }

    public List<Notification> forUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markRead(Long id, Long userId) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUser() != null && n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }
}
