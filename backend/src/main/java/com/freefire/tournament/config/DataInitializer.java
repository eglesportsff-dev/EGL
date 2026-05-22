package com.freefire.tournament.config;

import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.repository.UserRepository;
import com.freefire.tournament.util.CodeGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JdbcTemplate jdbc;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminUsername;

    public DataInitializer(UserRepository users, PasswordEncoder encoder, JdbcTemplate jdbc,
                           @Value("${app.admin.email:}") String adminEmail,
                           @Value("${app.admin.password:}") String adminPassword,
                           @Value("${app.admin.username:Admin}") String adminUsername) {
        this.users = users;
        this.encoder = encoder;
        this.jdbc = jdbc;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminUsername = adminUsername;
    }

    @Override
    @Transactional
    public void run(String... args) {
        repairLegacySchema();
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            System.out.println("EGL Admin account not initialized because ADMIN_EMAIL or ADMIN_PASSWORD is missing.");
            return;
        }
        if ("admin123".equals(adminPassword)) {
            throw new IllegalStateException("ADMIN_PASSWORD must be changed before starting the application.");
        }
        if (!users.existsByEmail(adminEmail)) {
            createAdmin();
            System.out.println("EGL Admin account initialized.");
        }
    }

    private void createAdmin() {
        User admin = new User();
        admin.setUid(CodeGenerator.uid());
        admin.setUsername(adminUsername);
        admin.setGameUid("ADMIN-" + CodeGenerator.uid());
        admin.setProfileScreenshotUrl("Backend seeded admin account");
        admin.setUpiId("admin@egl");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(encoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        admin.setEmailVerified(true);
        users.save(admin);
    }

    private void repairLegacySchema() {
        // Clean up any legacy unverified user accounts from the main users table
        jdbc.execute("delete from users where email_verified = false");
        jdbc.execute("alter table if exists matches add column if not exists team_only boolean not null default false");
        jdbc.execute("""
                do $$
                begin
                    if exists(select 1 from pg_type where typname = 'transaction_type') then
                        alter type transaction_type add value if not exists 'REFUND';
                    end if;
                end $$;
                """);
        jdbc.execute("alter table if exists matches add column if not exists room_id varchar(80)");
        jdbc.execute("alter table if exists matches add column if not exists room_password varchar(80)");
        jdbc.execute("alter table if exists matches alter column match_time drop not null");
        jdbc.execute("alter table if exists match_participants add column if not exists team_id bigint");
        jdbc.execute("alter table if exists team_invites add column if not exists rejected boolean not null default false");
        jdbc.execute("alter table if exists team_invites add column if not exists note varchar(240)");
        jdbc.execute("alter table if exists team_invites add column if not exists response_note varchar(240)");
        jdbc.execute("alter table if exists team_invites add column if not exists rejected_at timestamptz");
        jdbc.execute("alter table if exists tournament_updates alter column message type varchar(4000)");
        jdbc.execute("alter table if exists user_notifications alter column message type varchar(4000)");
        jdbc.execute("alter table if exists user_notifications add column if not exists reference_id bigint");
        jdbc.execute("alter table if exists user_notifications drop constraint if exists user_notifications_type_check");
        jdbc.execute("""
                alter table if exists user_notifications
                add constraint user_notifications_type_check
                check (type in ('PAYMENT', 'MATCH', 'UPDATE'))
                """);
    }
}
