package com.research.dashboard.application.dto;

public record GrantWriteRequest(String type, String name, String provider, String status) {
}
