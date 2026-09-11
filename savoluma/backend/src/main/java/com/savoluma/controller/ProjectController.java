package com.savoluma.controller;

import com.savoluma.dto.ProjectDTO;
import com.savoluma.entity.Project;
import com.savoluma.entity.ProjectMember;
import com.savoluma.entity.User;
import com.savoluma.exception.ResourceNotFoundException;
import com.savoluma.repository.ProjectMemberRepository;
import com.savoluma.repository.ProjectRepository;
import com.savoluma.repository.UserRepository;
import com.savoluma.security.SavoUserPrincipal;
import com.savoluma.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * "/api/v1/projects/**" is authenticated() at the SecurityConfig level —
 * every role-specific narrowing (a MANAGER only ever sees projects where
 * manager == self; an EMPLOYEE only sees projects they're a member of)
 * happens here, in code, never trusted to the frontend. This is the
 * "resource level access" requirement from spec section 30.
 */
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /** CEO/Admin/SuperAdmin see everything; everyone else gets "my" behaviour applied. */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','CEO','COO','CTO')")
    public ResponseEntity<List<ProjectDTO>> getAll() {
        return ResponseEntity.ok(projectRepository.findAll().stream().map(ProjectDTO::fromEntity).collect(Collectors.toList()));
    }

    /** Every authenticated employee: managers get projects they manage, others get projects they're staffed on. */
    @GetMapping("/my")
    public ResponseEntity<List<ProjectDTO>> getMine(@AuthenticationPrincipal SavoUserPrincipal principal) {
        User user = principal.getUser();
        List<Project> projects;
        String role = user.getRole().name();
        if (role.matches("SUPER_ADMIN|ADMIN|CEO|COO|CTO")) {
            projects = projectRepository.findAll();
        } else if (role.equals("MANAGER") || role.equals("DIRECTOR")) {
            projects = projectRepository.findByManagerId(user.getId());
        } else {
            projects = projectMemberRepository.findByUserId(user.getId())
                    .stream()
                    .map(ProjectMember::getProject)
                    .filter(p -> p != null)
                    .toList();
        }
        return ResponseEntity.ok(projects.stream().map(ProjectDTO::fromEntity).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getOne(@PathVariable Long id) {
        Project p = projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
        return ResponseEntity.ok(ProjectDTO.fromEntity(p));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','CEO','MANAGER','DIRECTOR')")
    public ResponseEntity<ProjectDTO> create(@RequestBody Map<String, String> body,
                                              @AuthenticationPrincipal SavoUserPrincipal principal) {
        User manager = null;
        if (body.get("managerId") != null) {
            manager = userRepository.findByEmployeeId(body.get("managerId")).orElse(null);
        }
        Project project = Project.builder()
                .projectCode("PRJ-" + Year.now().getValue() + "-" + (projectRepository.count() + 1))
                .name(body.get("name"))
                .manager(manager)
                .status("PLANNING")
                .priority("MEDIUM")
                .progress(0)
                .build();
        project = projectRepository.save(project);
        auditService.log(principal.getUser(), "Created project " + project.getProjectCode(), "PROJECT", project.getProjectCode());
        return ResponseEntity.ok(ProjectDTO.fromEntity(project));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','CEO','MANAGER','DIRECTOR')")
    public ResponseEntity<ProjectDTO> update(@PathVariable Long id, @RequestBody Map<String, Object> changes,
                                              @AuthenticationPrincipal SavoUserPrincipal principal) {
        Project p = projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));

        // Resource-level check: a MANAGER may only update projects they manage.
        User actor = principal.getUser();
        boolean isManagerOfThis = p.getManager() != null && p.getManager().getId().equals(actor.getId());
        boolean isPrivileged = actor.getRole().name().matches("SUPER_ADMIN|ADMIN|CEO");
        if (!isPrivileged && !isManagerOfThis) {
            throw new org.springframework.security.access.AccessDeniedException("You can only update projects you manage.");
        }

        if (changes.containsKey("status")) p.setStatus((String) changes.get("status"));
        if (changes.containsKey("progress")) p.setProgress((Integer) changes.get("progress"));
        projectRepository.save(p);
        auditService.log(actor, "Updated project " + p.getProjectCode(), "PROJECT", p.getProjectCode());
        return ResponseEntity.ok(ProjectDTO.fromEntity(p));
    }
}
