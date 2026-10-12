package com.nivva.api.common.error;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(TransactionNotFoundException.class)
    public ProblemDetail notFound(TransactionNotFoundException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Transaction not found", exception.getMessage(), request);
    }

    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    public ProblemDetail emailConflict(EmailAlreadyRegisteredException exception, HttpServletRequest request) {
        return problem(HttpStatus.CONFLICT, "Email already registered", exception.getMessage(), request);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ProblemDetail invalidCredentials(InvalidCredentialsException exception, HttpServletRequest request) {
        return problem(HttpStatus.UNAUTHORIZED, "Unauthorized", exception.getMessage(), request);
    }

    @ExceptionHandler(InvalidAuthException.class)
    public ProblemDetail invalidAuth(InvalidAuthException exception, HttpServletRequest request) {
        return problem(HttpStatus.BAD_REQUEST, "Validation failed", exception.getMessage(), request);
    }

    @ExceptionHandler(AccountNotFoundException.class)
    public ProblemDetail accountNotFound(AccountNotFoundException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Account not found", exception.getMessage(), request);
    }

    @ExceptionHandler(AccountHasTransactionsException.class)
    public ProblemDetail accountConflict(AccountHasTransactionsException exception, HttpServletRequest request) {
        return problem(HttpStatus.CONFLICT, "Account has transactions", exception.getMessage(), request);
    }

    @ExceptionHandler(InvalidAccountException.class)
    public ProblemDetail invalidAccount(InvalidAccountException exception, HttpServletRequest request) {
        return problem(HttpStatus.BAD_REQUEST, "Validation failed", exception.getMessage(), request);
    }

    @ExceptionHandler(GoalNotFoundException.class)
    public ProblemDetail goalNotFound(GoalNotFoundException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Goal not found", exception.getMessage(), request);
    }

    @ExceptionHandler(InvalidGoalException.class)
    public ProblemDetail invalidGoal(InvalidGoalException exception, HttpServletRequest request) {
        return problem(HttpStatus.UNPROCESSABLE_ENTITY, "Invalid goal", exception.getMessage(), request);
    }

    @ExceptionHandler({
            CategoryNotFoundException.class,
            InvalidTransactionException.class
    })
    public ProblemDetail unprocessable(RuntimeException exception, HttpServletRequest request) {
        return problem(HttpStatus.UNPROCESSABLE_ENTITY, "Invalid transaction", exception.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail validation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        ProblemDetail detail = problem(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                "One or more fields are invalid",
                request
        );
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        detail.setProperty("errors", errors);
        return detail;
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ProblemDetail badRequest(Exception exception, HttpServletRequest request) {
        log.debug("Rejected unreadable request: {}", exception.getClass().getSimpleName());
        return problem(HttpStatus.BAD_REQUEST, "Malformed request", "The request could not be read", request);
    }

    private static ProblemDetail problem(HttpStatus status, String title, String detail, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setInstance(URI.create(request.getRequestURI()));
        return problem;
    }
}
