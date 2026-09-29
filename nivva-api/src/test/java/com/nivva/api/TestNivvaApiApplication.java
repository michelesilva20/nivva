package com.nivva.api;

import org.springframework.boot.SpringApplication;

public class TestNivvaApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(NivvaApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
