package com.freefire.tournament.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public HikariDataSource dataSource(DataSourceProperties properties) {
        String rawUrl = properties.getUrl();
        
        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            try {
                String cleanUrl = rawUrl.replaceFirst("^postgres(?:ql)?://", "");
                int slashIndex = cleanUrl.indexOf('/');
                if (slashIndex != -1) {
                    String authority = cleanUrl.substring(0, slashIndex);
                    String dbPath = cleanUrl.substring(slashIndex + 1);
                    
                    int lastAtIndex = authority.lastIndexOf('@');
                    if (lastAtIndex != -1) {
                        String userInfo = authority.substring(0, lastAtIndex);
                        String hostAndPort = authority.substring(lastAtIndex + 1);
                        
                        int colonIndex = userInfo.indexOf(':');
                        String username = (colonIndex != -1) ? userInfo.substring(0, colonIndex) : userInfo;
                        String password = (colonIndex != -1) ? userInfo.substring(colonIndex + 1) : null;
                        
                        String host = hostAndPort;
                        int port = 5432;
                        int portColonIndex = hostAndPort.indexOf(':');
                        if (portColonIndex != -1) {
                            host = hostAndPort.substring(0, portColonIndex);
                            port = Integer.parseInt(hostAndPort.substring(portColonIndex + 1));
                        }
                        
                        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbPath;
                        HikariDataSource dataSource = new HikariDataSource();
                        dataSource.setJdbcUrl(jdbcUrl);
                        dataSource.setUsername(username);
                        if (password != null) {
                            dataSource.setPassword(password);
                        }
                        return dataSource;
                    } else {
                        String host = authority;
                        int port = 5432;
                        int portColonIndex = authority.indexOf(':');
                        if (portColonIndex != -1) {
                            host = authority.substring(0, portColonIndex);
                            port = Integer.parseInt(authority.substring(portColonIndex + 1));
                        }
                        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbPath;
                        HikariDataSource dataSource = new HikariDataSource();
                        dataSource.setJdbcUrl(jdbcUrl);
                        dataSource.setUsername(properties.getUsername());
                        dataSource.setPassword(properties.getPassword());
                        return dataSource;
                    }
                }
            } catch (Exception e) {
                // Fallback to standard builder if parsing fails
                return properties.initializeDataSourceBuilder().type(HikariDataSource.class).build();
            }
        }
        
        return properties.initializeDataSourceBuilder().type(HikariDataSource.class).build();
    }
}
