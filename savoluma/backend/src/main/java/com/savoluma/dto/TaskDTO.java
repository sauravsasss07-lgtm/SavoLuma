package com.savoluma.dto;

import com.savoluma.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private Long id;
    private String taskCode;
    private Long projectId;
    private String projectName;
    private String title;
    private String assignedToId;
    private String assignedToName;
    private String priority;
    private String status;
    private LocalDate dueDate;

    public static TaskDTO fromEntity(Task t) {
        return TaskDTO.builder()
                .id(t.getId())
                .taskCode(t.getTaskCode())
                .projectId(t.getProject() != null ? t.getProject().getId() : null)
                .projectName(t.getProject() != null ? t.getProject().getName() : null)
                .title(t.getTitle())
                .assignedToId(t.getAssignedTo() != null ? t.getAssignedTo().getEmployeeId() : null)
                .assignedToName(t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : null)
                .priority(t.getPriority())
                .status(t.getStatus())
                .dueDate(t.getDueDate())
                .build();
    }
}
