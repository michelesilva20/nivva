package com.nivva.api.support;

import org.testcontainers.DockerClientFactory;

public final class DockerAvailability {

    private DockerAvailability() {
    }

    public static boolean available() {
        try {
            return DockerClientFactory.instance().isDockerAvailable();
        } catch (RuntimeException exception) {
            return false;
        }
    }
}
