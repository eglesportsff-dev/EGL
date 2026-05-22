package com.freefire.tournament.util;

import java.security.SecureRandom;

public final class CodeGenerator {
    private static final SecureRandom RANDOM = new SecureRandom();

    private CodeGenerator() {}

    public static String otp() {
        return String.valueOf(100000 + RANDOM.nextInt(900000));
    }

    public static String uid() {
        return "FF" + (10000000 + RANDOM.nextInt(90000000));
    }
}
