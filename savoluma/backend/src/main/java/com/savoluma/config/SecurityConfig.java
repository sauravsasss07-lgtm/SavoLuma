package com.savoluma.config;

import com.savoluma.security.CustomUserDetailsService;
import com.savoluma.security.JwtAuthenticationFilter;
import com.savoluma.security.RestAccessDeniedHandler;
import com.savoluma.security.RestAuthEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Central security configuration. Frontend UI hiding is never trusted —
 * every sensitive endpoint below is also enforced here. This mirrors the
 * access matrix documented in the project spec (public/client/employee/
 * admin/super-admin) and the role model in frontend/js/data.js.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // enables @PreAuthorize on service/controller methods for resource-level checks
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthEntryPoint restAuthEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt only. Never store or compare plain-text passwords anywhere in this codebase.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // stateless JWT API — no CSRF cookies in play
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint(restAuthEntryPoint)
                    .accessDeniedHandler(restAccessDeniedHandler))
            .authorizeHttpRequests(auth -> auth
                // ---------- PUBLIC ----------
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/refresh", "/api/v1/auth/verify-2fa").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/contact", "/api/v1/consultations", "/api/v1/quotes", "/api/v1/careers/apply").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/public/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()

                // ---------- SUPER ADMIN ONLY ----------
                .requestMatchers("/api/v1/system/**").hasRole("SUPER_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/users/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
                .requestMatchers("/api/v1/roles/**").hasAnyRole("SUPER_ADMIN", "ADMIN")

                // ---------- ADMIN / CEO (business operations) ----------
                .requestMatchers(HttpMethod.GET, "/api/v1/users/*/direct-reports").authenticated()
                .requestMatchers("/api/v1/users/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "HR", "CEO")
                .requestMatchers("/api/v1/reports/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO")
                .requestMatchers("/api/v1/audit-logs/**").hasAnyRole("SUPER_ADMIN", "ADMIN")

                // ---------- CRM / SALES ----------
                .requestMatchers("/api/v1/leads/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO", "SALES", "CBO")
                .requestMatchers("/api/v1/contacts/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO", "SALES", "CBO")
                .requestMatchers("/api/v1/opportunities/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO", "SALES", "CBO")
                .requestMatchers("/api/v1/activities/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO", "SALES", "CBO", "MANAGER")
                .requestMatchers("/api/v1/deals/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO", "SALES", "CBO")
                .requestMatchers("/api/v1/clients/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO", "SALES", "CBO", "HR")

                // ---------- HR ----------
                .requestMatchers("/api/v1/hr/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "HR", "CEO")

                // ---------- FINANCE ----------
                .requestMatchers("/api/v1/finance/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO", "CFO", "FINANCE")
                .requestMatchers("/api/v1/invoices/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO", "CFO", "FINANCE")
                .requestMatchers("/api/v1/payments/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO", "CFO", "FINANCE")
                .requestMatchers("/api/v1/meetings/**").authenticated()
                .requestMatchers("/api/v1/leave/**").authenticated()
                .requestMatchers("/api/v1/attendance/**").authenticated()
                .requestMatchers("/api/v1/notifications/**").authenticated()
                .requestMatchers("/api/v1/jobs/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "HR", "CEO")
                .requestMatchers("/api/v1/applicants/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "HR", "CEO")
                .requestMatchers("/api/v1/interviews/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "HR", "CEO", "MANAGER")
                .requestMatchers("/api/v1/content/**").hasAnyRole("SUPER_ADMIN", "ADMIN")

                // ---------- PROJECTS / TASKS (resource-level filtering done in service layer) ----------
                .requestMatchers(HttpMethod.GET, "/api/v1/projects/my").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/projects/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "CEO", "MANAGER", "DIRECTOR")
                .requestMatchers("/api/v1/projects/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/tasks/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "MANAGER", "DIRECTOR", "ASST_MANAGER")
                .requestMatchers("/api/v1/tasks/**").authenticated()

                // ---------- SUPPORT ----------
                .requestMatchers("/api/v1/tickets/**").authenticated()

                // ---------- CLIENT PORTAL ----------
                .requestMatchers("/api/v1/client/**").hasRole("CLIENT")

                // ---------- Everything else needs at least a valid token ----------
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
