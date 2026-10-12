
package com.codingshuttle.youtube.hospitalManagement.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.util.ArrayList;
import java.util.List;

import static com.codingshuttle.youtube.hospitalManagement.entity.type.PermissionType.APPOINTMENT_DELETE;
import static com.codingshuttle.youtube.hospitalManagement.entity.type.PermissionType.USER_MANAGE;
import static com.codingshuttle.youtube.hospitalManagement.entity.type.RoleType.ADMIN;
import static com.codingshuttle.youtube.hospitalManagement.entity.type.RoleType.DOCTOR;

@Configuration
@RequiredArgsConstructor
@Slf4j
@EnableMethodSecurity
public class WebSecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // OAuth2 temporarily disabled
    private final HandlerExceptionResolver handlerExceptionResolver;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity)
            throws Exception {

        httpSecurity

                .csrf(csrf -> csrf.disable())

                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource())
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(
                                "/health",
                                "/health/**",
                                "/public/**",
                                "/auth/**"
                        ).permitAll()

                        // Browser preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // Admin delete permissions
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/admin/**"
                        )
                        .hasAnyAuthority(
                                APPOINTMENT_DELETE.name(),
                                USER_MANAGE.name()
                        )

                        // Admin APIs
                        .requestMatchers("/admin/**")
                        .hasRole(ADMIN.name())

                        // Doctor photo access
                        .requestMatchers(
                                HttpMethod.GET,
                                "/doctors/*/photo"
                        )
                        .hasAnyRole(
                                "DOCTOR",
                                "ADMIN",
                                "PATIENT"
                        )

                        // Doctor APIs
                        .requestMatchers("/doctors/**")
                        .hasAnyRole(
                                DOCTOR.name(),
                                ADMIN.name()
                        )

                        // All other endpoints
                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint(
                                (request, response, authException) -> {
                                    response.sendError(
                                            HttpServletResponse.SC_UNAUTHORIZED,
                                            "Authentication required"
                                    );
                                }
                        )

                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {
                                    response.sendError(
                                            HttpServletResponse.SC_FORBIDDEN,
                                            "Access denied"
                                    );
                                }
                        )
                );

        return httpSecurity.build();
    }

    // CORS for local Next.js and deployed Vercel frontend
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        List<String> allowedOrigins = new ArrayList<>();
        allowedOrigins.add("http://localhost:3000");

        if (frontendUrl != null && !frontendUrl.isBlank()) {
            String origin = frontendUrl.trim()
                    .replaceAll("/+$", "");

            if (!allowedOrigins.contains(origin)) {
                allowedOrigins.add(origin);
            }
        }

        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        HttpHeaders.AUTHORIZATION,
                        HttpHeaders.CONTENT_TYPE,
                        HttpHeaders.ACCEPT
                )
        );

        configuration.setExposedHeaders(
                List.of(HttpHeaders.AUTHORIZATION)
        );

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // Prevent JWT filter from registering twice
    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtFilterRegistration(
            JwtAuthFilter jwtAuthFilter) {

        FilterRegistrationBean<JwtAuthFilter> registration =
                new FilterRegistrationBean<>(jwtAuthFilter);

        registration.setEnabled(false);

        return registration;
    }
}
