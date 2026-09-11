package com.savoluma.controller;

import com.savoluma.dto.TaskDTO;
import com.savoluma.entity.Project;
import com.savoluma.entity.Task;
import com.savoluma.entity.User;
import com.savoluma.exception.ResourceNotFoundException;
import com.savoluma.repository.ProjectRepository;
import com.savoluma.repository.TaskRepository;
import com.savoluma.repository.UserRepository;
import com.savoluma.security.SavoUserPrincipal;
import com.savoluma.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mirrors the frontend's manager-dashboard (assign) and employee-dashboard
 * (self-update-only) task views. "/api/v1/tasks/**" is authenticated() in
 * SecurityConfig; the ownership check for status updates happens here.
 */
@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /** Tasks assigned to the calling user — used by the Employee dashboard's "My Tasks". */
    @GetMapping("/my")
    public ResponseEntity<List<TaskDTO>> getMine(@AuthenticationPrincipal SavoUserPrincipal principal) {
        List<Task> tasks = taskRepository.findByAssignedToId(principal.getUser().getId());
        return ResponseEntity.ok(tasks.stream().map(TaskDTO::fromEntity).collect(Collectors.toList()));
    }

    /** Tasks across every project the calling manager owns — used by the Manager dashboard's task board. */
    @GetMapping("/managed")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MANAGER','DIRECTOR','ASST_MANAGER')")
    public ResponseEntity<List<TaskDTO>> getManaged(@AuthenticationPrincipal SavoUserPrincipal principal) {
        List<Task> tasks = taskRepository.findByProjectManagerId(principal.getUser().getId());
        return ResponseEntity.ok(tasks.stream().map(TaskDTO::fromEntity).collect(Collectors.toList()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MANAGER','DIRECTOR','ASST_MANAGER')")
    public ResponseEntity<TaskDTO> create(@RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal SavoUserPrincipal principal) {
        Project project = projectRepository.findById(Long.valueOf(body.get("projectId")))
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        User assignee = userRepository.findByEmployeeId(body.get("assignedTo"))
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + body.get("assignedTo")));

        // Resource-level check: a MANAGER may only assign tasks within projects they manage.
        User actor = principal.getUser();
        boolean isPrivileged = actor.getRole().name().matches("SUPER_ADMIN|ADMIN");
        boolean managesProject = project.getManager() != null && project.getManager().getId().equals(actor.getId());
        if (!isPrivileged && !managesProject) {
            throw new AccessDeniedException("You can only assign tasks within projects you manage.");
        }

        Task.TaskBuilder taskBuilder = Task.builder()
                .taskCode("TSK-" + (taskRepository.count() + 1001))
                .project(project)
                .title(body.get("title"))
                .assignedTo(assignee)
                .assignedBy(actor)
                .priority(body.getOrDefault("priority", "MEDIUM"))
                .status("TODO");
        String due = body.get("dueDate");
        if (due != null && !due.isBlank()) {
            taskBuilder.dueDate(LocalDate.parse(due));
        }
        Task task = taskRepository.save(taskBuilder.build());
        auditService.log(actor, "Assigned task " + task.getTaskCode() + " to " + assignee.getEmployeeId(), "TASK", task.getTaskCode());
        return ResponseEntity.ok(TaskDTO.fromEntity(task));
    }

    /** Status update: the assignee themselves, their manager, or an admin can update it — nobody else. */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
                                                 @AuthenticationPrincipal SavoUserPrincipal principal) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        User actor = principal.getUser();

        boolean isOwner = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(actor.getId());
        boolean isProjectManager = task.getProject().getManager() != null && task.getProject().getManager().getId().equals(actor.getId());
        boolean isPrivileged = actor.getRole().name().matches("SUPER_ADMIN|ADMIN");

        if (!isOwner && !isProjectManager && !isPrivileged) {
            throw new AccessDeniedException("You can only update tasks assigned to you or tasks in projects you manage.");
        }

        task.setStatus(body.get("status"));
        taskRepository.save(task);
        auditService.log(actor, actor.getEmployeeId() + " updated task " + task.getTaskCode() + " to " + task.getStatus(), "TASK", task.getTaskCode());
        return ResponseEntity.ok(TaskDTO.fromEntity(task));
    }
}
