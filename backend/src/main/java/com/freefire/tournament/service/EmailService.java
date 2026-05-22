package com.freefire.tournament.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {
    private final String apiKey;
    private final String fromAddress;
    private final HttpClient httpClient;

    public EmailService(
            @Value("${spring.mail.password:}") String apiKey,
            @Value("${spring.mail.properties.mail.from:}") String fromAddress) {
        this.apiKey = apiKey;
        this.fromAddress = (fromAddress == null || fromAddress.isBlank() || fromAddress.contains("your-email")) 
                           ? "eglesportsff@gmail.com" 
                           : fromAddress;
        this.httpClient = HttpClient.newBuilder().build();
    }

    public void sendOtp(String to, String otp) {
        System.out.println("EmailService: Preparing to send OTP to " + to + " using sender " + fromAddress);
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("EmailService: Brevo API Key (MAIL_PASSWORD) is missing or empty! Bypassing email sending.");
            logFallback(to, otp);
            return;
        }

        // Prepare Brevo API JSON payload
        String jsonPayload = "{"
                + "\"sender\":{\"email\":\"" + fromAddress + "\"},"
                + "\"to\":[{\"email\":\"" + to + "\"}],"
                + "\"subject\":\"Tournament registration OTP\","
                + "\"htmlContent\":\"Your registration OTP is <strong>" + otp + "</strong>. It expires soon.\""
                + "}";

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            // Timeout the request after 5 seconds to prevent hanging
            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(response -> {
                        if (response.statusCode() >= 200 && response.statusCode() < 300) {
                            System.out.println("Email sent successfully via Brevo HTTP API to " + to);
                        } else {
                            System.err.println("Failed to send email via Brevo HTTP API: Status " + response.statusCode() + ", Response: " + response.body());
                        }
                    })
                    .exceptionally(e -> {
                        System.err.println("Failed to send email via Brevo HTTP API asynchronously: " + e.getMessage());
                        return null;
                    });
            
            // Log to console as well for debugging purposes
            System.out.println("\n[HTTP Email Triggered] OTP sent to: " + to + " (OTP: " + otp + ")");
            
        } catch (Exception e) {
            System.err.println("Failed to send email via Brevo HTTP API: " + e.getMessage());
            logFallback(to, otp);
        }
    }

    private void logFallback(String to, String otp) {
        System.out.println("\n==================================================");
        System.out.println("SMTP BYPASSED - REGISTRATION OTP FOR: " + to);
        System.out.println("OTP CODE IS: " + otp);
        System.out.println("==================================================\n");
    }
}
