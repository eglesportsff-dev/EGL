package com.freefire.tournament.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.properties.mail.from:}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public void sendOtp(String to, String otp) {
        if (fromAddress == null || fromAddress.isBlank() || fromAddress.contains("your-email")) {
            System.out.println("\n==================================================");
            System.out.println("REGISTRATION OTP FOR: " + to);
            System.out.println("OTP CODE IS: " + otp);
            System.out.println("==================================================\n");
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Tournament registration OTP");
        message.setText("Your registration OTP is " + otp + ". It expires soon.");
        mailSender.send(message);
    }
}
