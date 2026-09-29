package com.nivva.api.common;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI nivvaOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Nivva API")
                .version("v1")
                .description("Transaction vertical slice. Mobile is not connected yet."));
    }
}
