package com.savoluma.dto;

import com.savoluma.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String employeeId;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String department;
    private String team;
    private String managerId; // employeeId of manager, or null
    private String title;
    private String status;
    private String photoUrl;

    public static UserDTO fromEntity(User u) {
        return UserDTO.builder()
                .id(u.getId())
                .employeeId(u.getEmployeeId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .department(u.getDepartment())
                .team(u.getTeam())
                .managerId(u.getManager() != null ? u.getManager().getEmployeeId() : null)
                .title(u.getTitle())
                .status(u.getStatus())
                .photoUrl(u.getPhotoUrl())
                .build();
    }
}
