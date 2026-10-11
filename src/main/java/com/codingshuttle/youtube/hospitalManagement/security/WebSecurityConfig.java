package com.codingshuttle.youtube.hospitalManagement.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

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

    // OAuth2 ko abhi temporarily disable rakha hai.
    // private final OAuth2SuccessHandler oAuth2SuccessHandler;

    private final HandlerExceptionResolver handlerExceptionResolver;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity)
            throws Exception {

        httpSecurity

                // REST API + JWT authentication
                .csrf(csrf -> csrf.disable())

                // Enable CORS configuration defined below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // JWT based application -> no server-side session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Public APIs
                        .requestMatchers(
                                "/public/**",
                                "/auth/**"
                        ).permitAll()

                        // Allow browser preflight requests
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

                        .requestMatchers(
                                HttpMethod.GET,
                                "/doctors/*/photo"
                        )
                        .hasAnyRole("DOCTOR", "ADMIN", "PATIENT")

                        // Doctor APIs
                        .requestMatchers("/doctors/**")
                        .hasAnyRole(
                                DOCTOR.name(),
                                ADMIN.name()
                        )

                        // Everything else requires authentication
                        .anyRequest()
                        .authenticated()
                )

                // JWT filter
                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                )


                .exceptionHandling(exception -> exception

                        // Missing authentication -> 401 Unauthorized
                        .authenticationEntryPoint(
                                (request, response, authException) -> {
                                    response.sendError(
                                            HttpServletResponse.SC_UNAUTHORIZED,
                                            "Authentication required"
                                    );
                                }
                        )

                        // Authenticated but insufficient permission -> 403
                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {
                                    response.sendError(
                                            HttpServletResponse.SC_FORBIDDEN,
                                            "Access denied"
                                    );
                                }
                        )
                );


        /*
         * OAuth2 Login
         * Enable later when Google/OAuth credentials are configured.
         *
         * .oauth2Login(oAuth2 -> oAuth2
         *      .failureHandler((request, response, exception) -> {
         *          log.error(
         *              "OAuth2 error: {}",
         *              exception.getMessage()
         *          );
         *
         *          handlerExceptionResolver.resolveException(
         *              request,
         *              response,
         *              null,
         *              exception
         *          );
         *      })
         *      .successHandler(oAuth2SuccessHandler)
         * )
         */

        return httpSecurity.build();
    }

    /**
     * CORS configuration for Next.js frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Development frontend
        configuration.setAllowedOrigins(
                List.of("http://localhost:3000")
        );

        // HTTP methods frontend is allowed to call
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

        // Request headers
        configuration.setAllowedHeaders(
                List.of(
                        HttpHeaders.AUTHORIZATION,
                        HttpHeaders.CONTENT_TYPE,
                        HttpHeaders.ACCEPT
                )
        );

        // Headers frontend can read
        configuration.setExposedHeaders(
                List.of(HttpHeaders.AUTHORIZATION)
        );

        // Keep enabled for future cookie-based authentication support
        configuration.setAllowCredentials(true);

        // Cache browser preflight response
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

//        configuration.applyPermitDefaultValues();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtFilterRegistration(
            JwtAuthFilter jwtAuthFilter) {

        FilterRegistrationBean<JwtAuthFilter> registration =
                new FilterRegistrationBean<>(jwtAuthFilter);

        registration.setEnabled(false);

        return registration;
    }
}