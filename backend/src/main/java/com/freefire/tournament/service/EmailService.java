package com.freefire.tournament.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {
    private final String apiKey;
    private final String fromAddress;
    private final String mailHost;
    private final int mailPort;
    private final String mailUsername;
    private final JavaMailSender mailSender;
    private final HttpClient httpClient;

    private volatile String lastStatus = "Initialized";
    private volatile int lastHttpCode = 0;
    private volatile String lastError = null;

    public EmailService(
            @Value("${spring.mail.password:}") String apiKey,
            @Value("${spring.mail.properties.mail.from:}") String fromAddress,
            @Value("${spring.mail.host:smtp-relay.brevo.com}") String mailHost,
            @Value("${spring.mail.port:587}") int mailPort,
            @Value("${spring.mail.username:}") String mailUsername,
            ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.fromAddress = (fromAddress == null || fromAddress.isBlank() || fromAddress.contains("your-email"))
                ? (mailUsername != null && mailUsername.contains("@") ? mailUsername.trim() : "eglesportsff@gmail.com")
                : fromAddress.trim();
        this.mailHost = mailHost != null ? mailHost.trim() : "smtp-relay.brevo.com";
        this.mailPort = mailPort;
        this.mailUsername = mailUsername != null ? mailUsername.trim() : "";
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .build();

        System.out.println("EmailService initialized. From: " + this.fromAddress
                + ", Key type: " + detectKeyType()
                + ", SMTP host: " + this.mailHost + ":" + this.mailPort);
    }

    public void sendOtp(String to, String otp) {
        sendOtpEmail(to, otp, "Nexus Tournament OTP Verification", "Registration Verification",
                "Your registration verification code is:", "REGISTRATION OTP");
    }

    public void sendPasswordResetOtp(String to, String otp) {
        sendOtpEmail(to, otp, "Nexus Tournament - Password Reset OTP", "Password Reset Request",
                "Your password reset verification code is:", "PASSWORD RESET OTP");
    }

    private void sendOtpEmail(String to, String otp, String subject, String headerSubtitle,
                              String instructionText, String consoleLabel) {
        System.out.println("\nEmailService: Preparing to send " + consoleLabel + " to " + to + " using sender " + fromAddress);

        // Always log OTP to server console so admins / developers can see it even if mail provider is down
        logConsoleOtp(to, otp, consoleLabel);

        if (apiKey.isBlank() && mailUsername.isBlank()) {
            lastStatus = "FAILED: No Brevo API Key (MAIL_PASSWORD / BREVO_API_KEY) or SMTP Username configured in environment";
            System.err.println("EmailService: " + lastStatus);
            return;
        }

        // Run asynchronously so user request is not blocked
        CompletableFuture.runAsync(() -> {
            boolean sent = false;

            // Strategy 1: If key starts with "xkeysib-" or if not an SMTP key, attempt Brevo REST API
            if (apiKey.startsWith("xkeysib-") || (!apiKey.startsWith("xsmtpsib-") && !apiKey.isBlank())) {
                sent = sendViaBrevoRestApi(to, otp, subject, headerSubtitle, instructionText);
            }

            // Strategy 2: If Brevo REST API failed or key is an SMTP key ("xsmtpsib-"), attempt SMTP relay
            if (!sent && mailSender != null && (!apiKey.isBlank() || !mailUsername.isBlank())) {
                sent = sendViaSmtpRelay(to, otp, subject, instructionText);
            }

            if (!sent) {
                System.err.println(
                        "EmailService: Email delivery failed for " + to + ". Check Render logs / Brevo dashboard.");
            }
        });
    }

    private boolean sendViaBrevoRestApi(String to, String otp, String subject, String headerSubtitle, String instructionText) {
        try {
            System.out.println(
                    "EmailService: Attempting delivery via Brevo REST API (https://api.brevo.com/v3/smtp/email)...");
            String jsonPayload = "{"
                    + "\"sender\":{\"name\":\"Nexus eSports\",\"email\":\"" + fromAddress + "\"},"
                    + "\"to\":[{\"email\":\"" + to + "\"}],"
                    + "\"subject\":\"" + subject + "\","
                    + "\"htmlContent\":\"<div style='font-family:sans-serif;padding:24px;background:#0d1222;color:#ffffff;border-radius:12px;max-width:500px;'>"
                    + "<h2 style='color:#FF5500;margin-top:0;'>Nexus Free Fire eSports</h2>"
                    + "<p style='color:#f59e0b;font-weight:bold;margin-bottom:4px;'>" + headerSubtitle + "</p>"
                    + "<p style='color:#94a3b8;'>" + instructionText + "</p>"
                    + "<div style='font-size:36px;font-weight:900;letter-spacing:6px;color:#FFB800;background:#170e08;padding:16px;border-radius:8px;text-align:center;border:1px solid rgba(255,85,0,0.3);margin:16px 0;'>"
                    + otp + "</div>"
                    + "<p style='color:#94a3b8;font-size:12px;'>This OTP expires in 10 minutes. For your security, do not share this code with anyone.</p>"
                    + "<p style='color:#64748b;font-size:11px;margin-bottom:0;'>© Nexus eSports Arena. Official Free Fire Tournament Circuit.</p>"
                    + "</div>\""
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            lastHttpCode = response.statusCode();

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                lastStatus = "SUCCESS: Delivered via Brevo REST API (HTTP " + response.statusCode() + ")";
                lastError = null;
                System.out.println("EmailService: " + lastStatus + " to " + to);
                return true;
            } else {
                lastError = response.body();
                lastStatus = "Brevo HTTP " + response.statusCode() + ": " + lastError;
                System.err.println("EmailService: " + lastStatus);

                if (response.statusCode() == 400 && lastError != null && lastError.contains("not verified")) {
                    System.err.println("\n[ACTION REQUIRED IN BREVO]");
                    System.err.println("Sender email '" + fromAddress + "' is not verified in Brevo!");
                    System.err.println("Go to Brevo -> Senders & IP -> Senders, add and verify '" + fromAddress
                            + "' or set MAIL_FROM to your registered Brevo email.\n");
                } else if (response.statusCode() == 401) {
                    System.err.println("\n[ACTION REQUIRED IN BREVO]");
                    System.err.println(
                            "Brevo returned 401 Unauthorized! If your key starts with 'xsmtpsib-', that is an SMTP key, not a REST API key.");
                    System.err.println(
                            "Generate a REST API Key from Brevo -> SMTP & API -> API Keys (starts with 'xkeysib-').\n");
                }
                return false;
            }
        } catch (Exception e) {
            lastError = e.getMessage();
            lastStatus = "Brevo REST API Exception: " + e.getMessage();
            System.err.println("EmailService: " + lastStatus);
            return false;
        }
    }

    private boolean sendViaSmtpRelay(String to, String otp, String subject, String instructionText) {
        try {
            System.out
                    .println("EmailService: Attempting delivery via SMTP Relay (" + mailHost + ":" + mailPort + ")...");
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(instructionText + " " + otp
                    + "\n\nThis OTP expires in 10 minutes.\nDo not share this code.\n\nNexus eSports Arena");
            mailSender.send(message);
            lastStatus = "SUCCESS: Delivered via SMTP Relay (" + mailHost + ")";
            lastError = null;
            System.out.println("EmailService: " + lastStatus + " to " + to);
            return true;
        } catch (Exception e) {
            lastError = e.getMessage();
            lastStatus = "SMTP Relay Exception: " + e.getMessage();
            System.err.println("EmailService: " + lastStatus);
            return false;
        }
    }

    private void logConsoleOtp(String to, String otp, String label) {
        System.out.println("\n==================================================");
        System.out.println(label + " FOR: " + to);
        System.out.println("OTP CODE IS: " + otp);
        System.out.println("SENDER: " + fromAddress);
        System.out.println("==================================================\n");
    }

    public String detectKeyType() {
        if (apiKey.isBlank())
            return "MISSING";
        if (apiKey.startsWith("xkeysib-"))
            return "BREVO_REST_API_KEY (xkeysib)";
        if (apiKey.startsWith("xsmtpsib-"))
            return "BREVO_SMTP_KEY (xsmtpsib)";
        return "UNKNOWN_KEY_FORMAT (" + apiKey.substring(0, Math.min(6, apiKey.length())) + "...)";
    }

    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configured", !apiKey.isBlank() || !mailUsername.isBlank());
        status.put("keyType", detectKeyType());
        status.put("senderEmail", fromAddress);
        status.put("smtpHost", mailHost);
        status.put("smtpPort", mailPort);
        status.put("lastStatus", lastStatus);
        status.put("lastHttpCode", lastHttpCode);
        status.put("lastError", lastError);

        String advice = "All good.";
        if (apiKey.isBlank()) {
            advice = "MAIL_PASSWORD or BREVO_API_KEY is not set in Render environment variables.";
        } else if (apiKey.startsWith("xsmtpsib-")) {
            advice = "You configured a Brevo SMTP key (xsmtpsib-). Make sure MAIL_HOST is smtp-relay.brevo.com and MAIL_USERNAME is your Brevo login email, or create a REST API key (xkeysib-) in Brevo -> SMTP & API -> API Keys.";
        } else if (lastError != null && lastError.contains("not verified")) {
            advice = "Sender email '" + fromAddress
                    + "' is NOT verified in Brevo. In your Brevo dashboard, go to 'Senders & IP' -> 'Senders', add and verify this email address, or update MAIL_FROM in Render to your verified email.";
        }
        status.put("advice", advice);
        return status;
    }
}
