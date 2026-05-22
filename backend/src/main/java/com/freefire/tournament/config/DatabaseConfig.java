package com.freefire.tournament.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:postgres}")
    private String configUsername;

    @Value("${spring.datasource.password:postgres}")
    private String configPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        try {
            if (rawUrl.startsWith("jdbc:")) {
                // Already JDBC format — use directly
                System.out.println("[DatabaseConfig] Using JDBC URL directly.");
                config.setJdbcUrl(rawUrl);
                config.setUsername(configUsername);
                config.setPassword(configPassword);
            } else {
                // Convert postgres:// or postgresql:// to jdbc:postgresql://
                System.out.println("[DatabaseConfig] Converting postgres:// URL to JDBC format.");
                String normalized = rawUrl.replaceFirst("^postgres(ql)?://", "postgresql://");
                URI uri = new URI(normalized);

                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String dbName = uri.getPath().replaceFirst("^/", "");
                String query = uri.getRawQuery() != null ? "?" + uri.getRawQuery() : "";
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName + query;

                String username = configUsername;
                String password = configPassword;

                String userInfo = uri.getUserInfo();
                if (userInfo != null && !userInfo.isEmpty()) {
                    int colon = userInfo.indexOf(':');
                    if (colon != -1) {
                        username = userInfo.substring(0, colon);
                        password = userInfo.substring(colon + 1);
                    } else {
                        username = userInfo;
                    }
                }

                System.out.println("[DatabaseConfig] JDBC URL: " + jdbcUrl);
                System.out.println("[DatabaseConfig] Username: " + username);

                config.setJdbcUrl(jdbcUrl);
                config.setUsername(username);
                config.setPassword(password);
            }
        } catch (Exception e) {
            System.err.println("[DatabaseConfig] URL parsing failed: " + e.getMessage() + " — falling back to raw URL.");
            config.setJdbcUrl(rawUrl.startsWith("jdbc:") ? rawUrl : "jdbc:postgresql://" + rawUrl.replaceFirst("^postgres(ql)?://", ""));
            config.setUsername(configUsername);
            config.setPassword(configPassword);
        }

        return new HikariDataSource(config);
    }
}
