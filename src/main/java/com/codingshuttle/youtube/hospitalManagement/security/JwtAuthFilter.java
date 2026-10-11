package com.codingshuttle.youtube.hospitalManagement.security;

import com.codingshuttle.youtube.hospitalManagement.entity.User;
import com.codingshuttle.youtube.hospitalManagement.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final AuthUtil authUtil;

    private final HandlerExceptionResolver handlerExceptionResolver;


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        log.info("Incoming request: {}", request.getRequestURI());

        final String authorizationHeader =
                request.getHeader("Authorization");

        // Check Authorization header
        if (authorizationHeader == null) {
            filterChain.doFilter(request, response);
            return;
        }

// Reject malformed or empty Bearer token
        if (!authorizationHeader.startsWith("Bearer ") ||
                authorizationHeader.substring(7).trim().isEmpty()) {

            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Missing or invalid Bearer token"
            );
            return;
        }

        String token = authorizationHeader.substring(7).trim();

        try {

            // 4. Extract username from JWT
            String username = authUtil.getUsernameFromToken(token);

            // 5. Authenticate only if not already authenticated
            if (username != null &&
                    SecurityContextHolder.getContext()
                            .getAuthentication() == null) {

                User user = userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new org.springframework.security
                                        .authentication.BadCredentialsException(
                                        "Invalid JWT user"
                                )
                        );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                user.getAuthorities()
                        );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }

        } catch (Exception ex) {

            // Clear authentication on invalid JWT
            SecurityContextHolder.clearContext();

            log.warn("JWT authentication failed: {}", ex.getMessage());

            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid or expired JWT token"
            );
            return;
        }

        // 6. Continue request processing
        filterChain.doFilter(request, response);
    }
}
