package com.inventory.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

public class InvoiceNumberGenerator {

    private static final AtomicLong counter = new AtomicLong(1);

    public static String generateInvoiceNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        return "INV-" + timestamp + "-" + String.format("%04d", counter.getAndIncrement());
    }

    public static String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        return "PO-" + timestamp + "-" + String.format("%04d", counter.getAndIncrement());
    }
}
