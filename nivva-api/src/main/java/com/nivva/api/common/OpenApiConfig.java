package com.nivva.api.common;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI nivvaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Nivva API")
                        .version("v1")
                        .description("""
                                Register or login, copy the access token, click Authorize, then call Accounts, Transactions and Goals.
                                Categories remain public reference data. Goal contributions are not transactions.
                                """))
                .components(new Components().addSecuritySchemes(
                        "bearer-jwt",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                ));
    }
}
