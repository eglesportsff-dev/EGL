package com.freefire.tournament.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;

/**
 * Automatically enables Row Level Security (RLS) on all PostgreSQL tables in the public schema.
 * This secures the Supabase database from unauthorized public access via the PostgREST API
 * (which runs as anon/authenticated roles) while allowing direct JDBC connection (owner/postgres)
 * to continue functioning normally.
 */
@Component
public class DatabaseSecurityInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSecurityInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Starting DatabaseSecurityInitializer to enable RLS on all public tables...");
        try {
            // Get all user tables in the public schema
            List<String> tables = jdbcTemplate.queryForList(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public'", 
                String.class
            );
            
            for (String table : tables) {
                // Enable Row Level Security on each table
                String sql = String.format("ALTER TABLE \"public\".\"%s\" ENABLE ROW LEVEL SECURITY", table);
                jdbcTemplate.execute(sql);
                System.out.println("Enabled Row Level Security on table: " + table);
            }
            System.out.println("Successfully enabled Row Level Security on all public tables.");
        } catch (Exception e) {
            System.err.println("Error enabling Row Level Security on database tables: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
