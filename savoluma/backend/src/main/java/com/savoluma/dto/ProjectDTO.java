package com.savoluma.dto;

import com.savoluma.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;
    private String projectCode;
    private String name;
    private Long clientId;
    private String managerId;
    private String managerName;
    private String status;
    private String priority;
    private int progress;
    private LocalDate startDate;
    private LocalDate endDate;
    private String techStack;

    public static ProjectDTO fromEntity(Project p) {
        return ProjectDTO.builder()
                .id(p.getId())
                .projectCode(p.getProjectCode())
                .name(p.getName())
                .clientId(p.getClientId())
                .managerId(p.getManager() != null ? p.getManager().getEmployeeId() : null)
                .managerName(p.getManager() != null ? p.getManager().getFullName() : null)
                .status(p.getStatus())
                .priority(p.getPriority())
                .progress(p.getProgress())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .techStack(p.getTechStack())
                .build();
    }
}
