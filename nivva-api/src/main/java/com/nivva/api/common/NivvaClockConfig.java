package com.nivva.api.common;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NivvaClockConfig {

    public static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");

    @Bean
    Clock nivvaClock() {
        return Clock.system(ZONE);
    }
}
