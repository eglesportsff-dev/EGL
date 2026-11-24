package com.freefire.tournament.config;

import com.freefire.tournament.security.JwtAuthenticationFilter;
import com.freefire.tournament.security.UserPrincipalService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter,
                                            AuthenticationProvider authProvider) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authProvider)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/verify-otp", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/email-status", "/api/matches", "/api/leaderboard", "/api/tournaments/updates", "/api/tournament/*/point-table", "/api/players/active", "/api/push/vapid-public-key").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/matches/create").hasRole("CONTROLLER")
                        .requestMatchers(HttpMethod.POST, "/api/matches/join").hasRole("USER")
                        .requestMatchers(HttpMethod.POST, "/api/matches/join-team").hasRole("USER")
                        .requestMatchers(HttpMethod.POST, "/api/matches/team/validate").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/matches/upcoming").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/matches/friend-invites").hasRole("USER")
                        .requestMatchers(HttpMethod.POST, "/api/matches/friend-invites/accept", "/api/matches/friend-invites/reject", "/api/matches/invite/accept").hasRole("USER")
                        .requestMatchers("/api/help/**").hasRole("USER")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/master/**").hasRole("MASTER_CONTROLLER")
                        .requestMatchers("/api/controller/**").hasRole("CONTROLLER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    AuthenticationProvider authenticationProvider(UserPrincipalService userDetailsService, PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(encoder);
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
