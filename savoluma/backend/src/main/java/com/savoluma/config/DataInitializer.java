package com.savoluma.config;

import com.savoluma.entity.CompanyLocation;
import com.savoluma.entity.Role;
import com.savoluma.entity.TaxSetting;
import com.savoluma.entity.User;
import com.savoluma.repository.CompanyLocationRepository;
import com.savoluma.repository.TaxSettingRepository;
import com.savoluma.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Seeds only when the users table is empty. Demo passwords match the
 * browser mock layer so local login works against either store.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CompanyLocationRepository locationRepository;
    private final TaxSettingRepository taxSettingRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(user("SL-0000", "superadmin", "Super@123", "Platform Super Admin", "superadmin@savoluma.com", Role.SUPER_ADMIN, "Administration", "Platform"));
            userRepository.save(user("SL-0001", "admin", "Admin@123", "System Administrator", "admin@savoluma.com", Role.ADMIN, "Administration", "Platform"));
            userRepository.save(user("SL-0002", "ceo", "Ceo@1234", "Aarav Mehta", "ceo@savoluma.com", Role.CEO, "Executive", "Leadership"));
            userRepository.save(user("SL-0003", "hr.priya", "Hr@12345", "Priya Nair", "priya.nair@savoluma.com", Role.HR, "Human Resources", "People Ops"));
            userRepository.save(user("SL-0004", "mgr.rohan", "Mgr@12345", "Rohan Kapoor", "rohan.kapoor@savoluma.com", Role.MANAGER, "Engineering", "Alpha Squad"));
            userRepository.save(user("SL-0005", "emp.sneha", "Emp@12345", "Sneha Iyer", "sneha.iyer@savoluma.com", Role.EMPLOYEE, "Engineering", "Alpha Squad"));
            log.info("Seeded initial users (empty database). Change passwords before any real deployment.");
        }
        if (locationRepository.count() == 0) {
            locationRepository.save(CompanyLocation.builder()
                    .officeName("SavoLuma Software Pvt. Ltd.")
                    .city("New Delhi")
                    .state("Delhi")
                    .country("India")
                    .address("151, Rajendra Bhavan, Rajendra Place, New Delhi - 110008")
                    .email("info@savoluma.com")
                    .phone("+91-9015435450")
                    .mapEmbedUrl("https://www.google.com/maps?q=Rajendra+Place,+New+Delhi&output=embed")
                    .active(true)
                    .build());
        }
        if (taxSettingRepository.count() == 0) {
            taxSettingRepository.save(TaxSetting.builder().code("CGST").rate(new BigDecimal("9.000")).currency("INR").active(true).build());
            taxSettingRepository.save(TaxSetting.builder().code("SGST").rate(new BigDecimal("9.000")).currency("INR").active(true).build());
            taxSettingRepository.save(TaxSetting.builder().code("IGST").rate(new BigDecimal("18.000")).currency("INR").active(true).build());
            taxSettingRepository.save(TaxSetting.builder().code("GST").rate(new BigDecimal("18.000")).currency("INR").active(true).build());
        }
    }

    private User user(String empId, String username, String password, String name, String email, Role role, String dept, String team) {
        return User.builder()
                .employeeId(empId)
                .username(username)
                .passwordHash(passwordEncoder.encode(password))
                .fullName(name)
                .email(email)
                .role(role)
                .department(dept)
                .team(team)
                .status("ACTIVE")
                .twoFactorEnabled(false)
                .build();
    }
}
