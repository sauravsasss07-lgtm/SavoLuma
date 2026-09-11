package com.savoluma.service;

import com.savoluma.dto.CreateUserRequest;
import com.savoluma.dto.UserDTO;
import com.savoluma.entity.User;

import java.util.List;

public interface UserService {
    List<UserDTO> getAll();
    UserDTO getByEmployeeId(String employeeId);
    UserDTO create(CreateUserRequest request, User actor);
    UserDTO update(String employeeId, CreateUserRequest changes, User actor);
    UserDTO setStatus(String employeeId, String status, User actor); // ACTIVE | BLOCKED — the "fire / remove access" action
    void delete(String employeeId, User actor);
    List<UserDTO> getDirectReports(String managerEmployeeId);
}
