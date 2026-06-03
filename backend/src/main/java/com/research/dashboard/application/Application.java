package com.research.dashboard.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.research.dashboard.application.config.ResearchDashboardProperties;

@SpringBootApplication
@EnableConfigurationProperties(ResearchDashboardProperties.class)
public class Application {

	public static void main(String[] args) {
		System.setProperty("java.net.preferIPv4Stack", "true");
		SpringApplication.run(Application.class, args);
	}

}
