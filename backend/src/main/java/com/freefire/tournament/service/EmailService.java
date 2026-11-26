package com.freefire.tournament.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freefire.tournament.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Sends transactional OTP emails using Resend HTTPS API as primary provider,
 * with fallback support for Brevo REST API and SMTP relay.
 */
@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
    private static final String RESEND_ONBOARDING_SENDER = "EGL eSports <onboarding@resend.dev>";
    private static final Set<String> UNVERIFIABLE_DOMAINS = Set.of(
            "gmail.com", "googlemail.com", "yahoo.com", "outlook.com",
            "hotmail.com", "live.com", "smtp-brevo.com", "example.com"
    );

    public enum MailProvider {
        RESEND,
        BREVO_API,
        SMTP_RELAY,
        NONE
    }

    private final MailProvider provider;
    private final String apiKey;
    private final String fromAddress;
    private final String mailHost;
    private final int mailPort;
    private final String mailUsername;
    private final long otpTtlMinutes;
    private final JavaMailSender mailSender;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    private volatile String lastStatus = "Initialized";
    private volatile int lastHttpCode = 0;
    private volatile String lastError = null;

    public EmailService(
            @Value("${app.mail.resend-api-key:}") String resendApiKey,
            @Value("${app.mail.resend-from:}") String resendFrom,
            @Value("${spring.mail.password:}") String mailPassword,
            @Value("${spring.mail.properties.mail.from:}") String mailFrom,
            @Value("${spring.mail.host:smtp.resend.com}") String mailHost,
            @Value("${spring.mail.port:587}") int mailPort,
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${app.otp.ttl-minutes:10}") long otpTtlMinutes,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            ObjectProvider<ObjectMapper> objectMapperProvider) {
        String cleanResendKey = sanitize(resendApiKey);
        String cleanMailPassword = sanitize(mailPassword);
        String cleanResendFrom = sanitize(resendFrom);
        String cleanMailFrom = sanitize(mailFrom);

        this.mailHost = sanitize(mailHost).isBlank() ? "smtp.resend.com" : sanitize(mailHost);
        this.mailPort = mailPort;
        this.mailUsername = sanitize(mailUsername);
        this.otpTtlMinutes = otpTtlMinutes;
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.objectMapper = objectMapperProvider.getIfAvailable(ObjectMapper::new);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();

        this.apiKey = !cleanResendKey.isBlank() ? cleanResendKey : cleanMailPassword;
        this.provider = detectProvider(!cleanResendKey.isBlank(), this.apiKey, this.mailUsername);
        this.fromAddress = resolveFromAddress(this.provider, cleanResendFrom, cleanMailFrom, this.mailUsername);

        log.info("EmailService initialized. Provider: {}, From: {}, KeyType: {}",
                this.provider, this.fromAddress, detectKeyType());
    }

    /**
     * Sends a registration verification OTP to the player's email address.
     */
    public void sendOtp(String to, String otp) {
        String recipient = sanitize(to);
        logConsoleOtp(recipient, otp);

        if (provider == MailProvider.NONE) {
            lastStatus = "DEV_CONSOLE_ONLY: No RESEND_API_KEY or MAIL_PASSWORD configured";
            lastError = null;
            log.warn("EmailService: {} - OTP logged to console only for {}", lastStatus, recipient);
            return;
        }

        switch (provider) {
            case RESEND -> sendViaResendApi(recipient, otp);
            case BREVO_API -> {
                if (!sendViaBrevoRestApi(recipient, otp)) {
                    if (mailSender != null && sendViaSmtpRelay(recipient, otp)) {
                        return;
                    }
                    throw new ApiException(HttpStatus.BAD_GATEWAY, buildFriendlyDeliveryError());
                }
            }
            case SMTP_RELAY -> {
                if (!sendViaSmtpRelay(recipient, otp)) {
                    throw new ApiException(HttpStatus.BAD_GATEWAY, buildFriendlyDeliveryError());
                }
            }
            default -> { /* already handled */ }
        }
    }

    private void sendViaResendApi(String to, String otp) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("from", fromAddress);
            payload.put("to", List.of(to));
            payload.put("subject", "EGL Tournament OTP Verification");
            payload.put("html", buildOtpHtml(otp));
            payload.put("text", buildOtpText(otp));

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_API_URL))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("User-Agent", "EGL-Tournament-API/1.0")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            lastHttpCode = response.statusCode();

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                lastStatus = "SUCCESS: Delivered via Resend API (HTTP " + response.statusCode() + ")";
                lastError = null;
                log.info("EmailService: {} to {}", lastStatus, to);
                return;
            }

            String extractedMessage = extractErrorMessage(response.body());
            lastError = extractedMessage;
            lastStatus = "Resend HTTP " + response.statusCode() + ": " + extractedMessage;
            log.error("EmailService: {}", lastStatus);
            throw new ApiException(HttpStatus.BAD_GATEWAY, buildFriendlyResendError(response.statusCode(), extractedMessage));
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            lastError = ex.getMessage();
            lastStatus = "Resend API Exception: " + ex.getMessage();
            log.error("EmailService: {}", lastStatus, ex);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to send OTP email right now. Please try again.");
        }
    }

    private boolean sendViaBrevoRestApi(String to, String otp) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("sender", Map.of("name", "EGL eSports", "email", extractBareEmail(fromAddress)));
            payload.put("to", List.of(Map.of("email", to)));
            payload.put("subject", "EGL Tournament OTP Verification");
            payload.put("htmlContent", buildOtpHtml(otp));

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_API_URL))
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            lastHttpCode = response.statusCode();

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                lastStatus = "SUCCESS: Delivered via Brevo REST API (HTTP " + response.statusCode() + ")";
                lastError = null;
                log.info("EmailService: {} to {}", lastStatus, to);
                return true;
            }

            lastError = extractErrorMessage(response.body());
            lastStatus = "Brevo HTTP " + response.statusCode() + ": " + lastError;
            log.error("EmailService: {}", lastStatus);
            return false;
        } catch (Exception ex) {
            lastError = ex.getMessage();
            lastStatus = "Brevo REST API Exception: " + ex.getMessage();
            log.error("EmailService: {}", lastStatus, ex);
            return false;
        }
    }

    private boolean sendViaSmtpRelay(String to, String otp) {
        if (mailSender == null) {
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(extractBareEmail(fromAddress));
            message.setTo(to);
            message.setSubject("EGL Tournament OTP Verification");
            message.setText(buildOtpText(otp));
            mailSender.send(message);
            lastStatus = "SUCCESS: Delivered via SMTP Relay (" + mailHost + ")";
            lastError = null;
            log.info("EmailService: {} to {}", lastStatus, to);
            return true;
        } catch (Exception ex) {
            lastError = ex.getMessage();
            lastStatus = "SMTP Relay Exception: " + ex.getMessage();
            log.error("EmailService: {}", lastStatus, ex);
            return false;
        }
    }

    private String buildOtpHtml(String otp) {
        return "<div style='font-family:Arial,sans-serif;padding:24px;background:#0d1222;color:#ffffff;border-radius:12px;max-width:500px;margin:0 auto;'>"
                + "<h2 style='color:#FF5500;margin-top:0;'>EGL Free Fire eSports</h2>"
                + "<p style='color:#cbd5e1;font-size:14px;'>Use the verification code below to complete your player registration:</p>"
                + "<div style='font-size:34px;font-weight:900;letter-spacing:8px;color:#FFB800;background:#170e08;padding:18px;border-radius:10px;text-align:center;border:1px solid rgba(255,85,0,0.4);margin:18px 0;'>"
                + otp + "</div>"
                + "<p style='color:#94a3b8;font-size:12px;'>This OTP expires in " + otpTtlMinutes + " minutes. For your security, do not share this code with anyone.</p>"
                + "<p style='color:#64748b;font-size:11px;margin-bottom:0;'>&copy; EGL eSports Arena. Official Free Fire Tournament Circuit.</p>"
                + "</div>";
    }

    private String buildOtpText(String otp) {
        return "EGL Free Fire eSports - Player Registration OTP\n\n"
                + "Your 6-digit verification OTP is: " + otp + "\n\n"
                + "This OTP expires in " + otpTtlMinutes + " minutes. Do not share this code with anyone.";
    }

    private MailProvider detectProvider(boolean hasExplicitResendKey, String key, String username) {
        if (key.isBlank() && username.isBlank()) {
            return MailProvider.NONE;
        }
        if (hasExplicitResendKey || key.startsWith("re_")) {
            return MailProvider.RESEND;
        }
        if (key.startsWith("xkeysib-")) {
            return MailProvider.BREVO_API;
        }
        if (key.startsWith("xsmtpsib-")) {
            return MailProvider.SMTP_RELAY;
        }
        if (mailHost.toLowerCase(Locale.ROOT).contains("resend")) {
            return MailProvider.RESEND;
        }
        if (mailSender != null && !key.isBlank()) {
            return MailProvider.SMTP_RELAY;
        }
        return MailProvider.NONE;
    }

    private String resolveFromAddress(MailProvider activeProvider, String resendFrom, String mailFrom, String username) {
        if (activeProvider == MailProvider.RESEND) {
            String candidate = !resendFrom.isBlank() ? resendFrom : mailFrom;
            String bareEmail = extractBareEmail(candidate);
            String domain = extractDomain(bareEmail);

            // Resend strictly rejects public webmail domains (@gmail.com, etc.); fall back to onboarding sender for test compatibility.
            if (bareEmail.isBlank() || bareEmail.contains("your-email") || UNVERIFIABLE_DOMAINS.contains(domain)) {
                return RESEND_ONBOARDING_SENDER;
            }
            return candidate.contains("<") ? candidate : "EGL eSports <" + bareEmail + ">";
        }

        if (!mailFrom.isBlank() && !mailFrom.contains("your-email")) {
            return mailFrom;
        }
        if (username.contains("@") && !username.endsWith("@smtp-brevo.com")) {
            return username;
        }
        return "eglesportsff@gmail.com";
    }

    private String buildFriendlyResendError(int statusCode, String message) {
        String lower = message != null ? message.toLowerCase(Locale.ROOT) : "";
        if (statusCode == 401 || lower.contains("api key is invalid")) {
            return "Email service authentication failed (Invalid Resend API key). Please check RESEND_API_KEY on the server.";
        }
        if (statusCode == 403 && (lower.contains("testing emails") || lower.contains("verify a domain"))) {
            return "OTP could not be sent to this email: Resend is using testing mode (onboarding@resend.dev). To send OTPs to players, verify a custom domain at resend.com/domains and set RESEND_FROM.";
        }
        return "Failed to send OTP email via Resend (" + statusCode + "): " + message;
    }

    private String buildFriendlyDeliveryError() {
        return lastError != null && !lastError.isBlank()
                ? "Failed to send OTP email: " + lastError
                : "Failed to send OTP email. Please check mail configuration.";
    }

    private String extractErrorMessage(String body) {
        if (body == null || body.isBlank()) {
            return "Empty response from mail provider";
        }
        try {
            JsonNode node = objectMapper.readTree(body);
            if (node.hasNonNull("message")) {
                return node.get("message").asText();
            }
        } catch (Exception ignored) {
            // Return trimmed raw response below if not JSON
        }
        return body.trim();
    }

    private void logConsoleOtp(String to, String otp) {
        log.info("OTP generated for {} (sender: {}, provider: {})", to, fromAddress, provider);
        System.out.println("\n==================================================");
        System.out.println("REGISTRATION OTP FOR: " + to);
        System.out.println("OTP CODE IS: " + otp);
        System.out.println("PROVIDER: " + provider + " | SENDER: " + fromAddress);
        System.out.println("==================================================\n");
    }

    public String detectKeyType() {
        if (apiKey.isBlank()) {
            return "MISSING";
        }
        if (apiKey.startsWith("re_")) {
            return "RESEND_API_KEY (re_...)";
        }
        if (apiKey.startsWith("xkeysib-")) {
            return "BREVO_REST_API_KEY (xkeysib)";
        }
        if (apiKey.startsWith("xsmtpsib-")) {
            return "BREVO_SMTP_KEY (xsmtpsib)";
        }
        return "CUSTOM_KEY (" + apiKey.substring(0, Math.min(4, apiKey.length())) + "...)";
    }

    /**
     * Exposes diagnostic configuration status for /api/auth/email-status without leaking secrets.
     */
    public Map<String, Object> getStatus() {
        boolean isOnboarding = provider == MailProvider.RESEND
                && fromAddress.toLowerCase(Locale.ROOT).contains("onboarding@resend.dev");

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("configured", provider != MailProvider.NONE);
        status.put("provider", provider.name());
        status.put("keyType", detectKeyType());
        status.put("senderEmail", fromAddress);
        status.put("usingOnboardingSender", isOnboarding);
        status.put("lastStatus", lastStatus);
        status.put("lastHttpCode", lastHttpCode);
        status.put("lastError", lastError);
        status.put("advice", resolveStatusAdvice(isOnboarding));
        return status;
    }

    private String resolveStatusAdvice(boolean isOnboarding) {
        if (provider == MailProvider.NONE) {
            return "Set RESEND_API_KEY (starts with re_) in Render Environment Variables to enable email OTP delivery.";
        }
        if (provider == MailProvider.RESEND && isOnboarding) {
            return "Resend is using onboarding@resend.dev, which ONLY delivers to your own Resend account email. To send OTP emails to any player, add and verify a custom domain at https://resend.com/domains and set RESEND_FROM=noreply@yourdomain.com.";
        }
        if (lastError != null && !lastError.isBlank()) {
            return "Last delivery reported an error: " + lastError;
        }
        return "Resend is configured with a custom sender and ready to send OTP emails.";
    }

    private static String sanitize(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        if (trimmed.length() >= 2 && ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
                || (trimmed.startsWith("'") && trimmed.endsWith("'")))) {
            return trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }

    private static String extractBareEmail(String sender) {
        if (sender == null || sender.isBlank()) {
            return "";
        }
        int start = sender.indexOf('<');
        int end = sender.indexOf('>');
        if (start >= 0 && end > start) {
            return sender.substring(start + 1, end).trim();
        }
        return sender.trim();
    }

    private static String extractDomain(String email) {
        int at = email.lastIndexOf('@');
        if (at < 0 || at == email.length() - 1) {
            return "";
        }
        return email.substring(at + 1).toLowerCase(Locale.ROOT).trim();
    }
}
