package com.nivva.app.mock

import androidx.compose.runtime.Immutable
import java.math.BigDecimal
import java.text.NumberFormat
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.Locale

private val PtBr = Locale.forLanguageTag("pt-BR")

@JvmInline
value class Money private constructor(val cents: Long) {
    fun format(showSign: Boolean = false): String {
        val amount = BigDecimal.valueOf(cents, 2)
        val value = NumberFormat.getCurrencyInstance(PtBr).format(amount.abs())
            .replace('\u00A0', ' ')
        return when {
            showSign && cents > 0 -> "+ $value"
            showSign && cents < 0 -> "- $value"
            cents < 0 -> "- $value"
            else -> value
        }
    }

    companion object {
        fun cents(value: Long) = Money(value)
    }
}

enum class TransactionKind { Income, Expense }

@Immutable
data class TransactionUiModel(
    val id: String,
    val title: String,
    val category: String,
    val amount: Money,
    val date: LocalDate,
    val time: LocalTime,
    val kind: TransactionKind,
) {
    val supportingText: String
        get() = "$category • ${date.format(DateTimeFormatter.ofPattern("dd MMM", PtBr))}, " +
            time.format(DateTimeFormatter.ofPattern("HH:mm"))
}

@Immutable
data class MetricUiModel(
    val label: String,
    val amount: Money,
    val type: MetricType,
)

enum class MetricType { Income, Expense, Available }

@Immutable
data class HomeUiState(
    val balance: Money,
    val balanceVariation: String,
    val metrics: List<MetricUiModel>,
    val insight: String,
    val transactions: List<TransactionUiModel>,
)

@Immutable
data class ExpenseCategoryUiModel(
    val name: String,
    val amount: Money,
    val percentage: Int,
    val type: CategoryType,
)

enum class CategoryType { Home, Food, Transport, Leisure }

@Immutable
data class AnalyticsUiState(
    val selectedPeriod: Int,
    val totalExpenses: Money,
    val comparison: String,
    val monthLabels: List<String>,
    val chartValues: List<Float>,
    val budgetSpent: Money,
    val budgetTotal: Money,
    val categories: List<ExpenseCategoryUiModel>,
) {
    val budgetProgress: Float
        get() = (budgetSpent.cents.toFloat() / budgetTotal.cents).coerceIn(0f, 1f)
}

@Immutable
data class AccountUiModel(
    val name: String,
    val type: String,
    val balance: Money,
    val maskedNumber: String,
)

@Immutable
data class WalletUiState(
    val selectedSegment: Int,
    val accounts: List<AccountUiModel>,
    val selectedAccount: Int,
    val transactions: List<TransactionUiModel>,
)

object NivvaMockData {
    private val transactions = listOf(
        TransactionUiModel(
            "salary", "Salário", "Receita", Money.cents(485_000),
            LocalDate.of(2026, 6, 1), LocalTime.of(9, 0), TransactionKind.Income,
        ),
        TransactionUiModel(
            "market", "Mercado", "Despesa", Money.cents(-12_990),
            LocalDate.of(2026, 6, 12), LocalTime.of(14, 21), TransactionKind.Expense,
        ),
        TransactionUiModel(
            "transport", "Transporte", "Despesa", Money.cents(-2_480),
            LocalDate.of(2026, 6, 11), LocalTime.of(8, 17), TransactionKind.Expense,
        ),
        TransactionUiModel(
            "subscription", "Assinatura", "Despesa", Money.cents(-4_990),
            LocalDate.of(2026, 6, 12), LocalTime.of(7, 56), TransactionKind.Expense,
        ),
        TransactionUiModel(
            "home", "Moradia", "Despesa", Money.cents(-43_200),
            LocalDate.of(2026, 6, 11), LocalTime.of(20, 12), TransactionKind.Expense,
        ),
    )

    val home = HomeUiState(
        balance = Money.cents(1_245_080),
        balanceVariation = "2,4% este mês",
        metrics = listOf(
            MetricUiModel("Receitas", Money.cents(823_000), MetricType.Income),
            MetricUiModel("Despesas", Money.cents(432_000), MetricType.Expense),
            MetricUiModel("Ainda posso gastar", Money.cents(391_000), MetricType.Available),
        ),
        insight = "Você gastou 12% menos em alimentação este mês.",
        transactions = transactions.take(3),
    )

    val analytics = AnalyticsUiState(
        selectedPeriod = 1,
        totalExpenses = Money.cents(432_000),
        comparison = "8,4% vs. mês anterior",
        monthLabels = listOf("Jan", "Fev", "Mar", "Abr", "Mai", "Jun"),
        chartValues = listOf(0.52f, 0.78f, 0.68f, 0.64f, 0.84f, 0.7f),
        budgetSpent = Money.cents(432_000),
        budgetTotal = Money.cents(630_000),
        categories = listOf(
            ExpenseCategoryUiModel("Moradia", Money.cents(138_200), 32, CategoryType.Home),
            ExpenseCategoryUiModel("Alimentação", Money.cents(95_000), 22, CategoryType.Food),
            ExpenseCategoryUiModel("Transporte", Money.cents(60_500), 14, CategoryType.Transport),
            ExpenseCategoryUiModel("Lazer", Money.cents(43_200), 10, CategoryType.Leisure),
        ),
    )

    val wallet = WalletUiState(
        selectedSegment = 0,
        accounts = listOf(
            AccountUiModel(
                "Conta principal", "Conta corrente", Money.cents(862_050), "•••• 1234",
            ),
            AccountUiModel(
                "Reserva", "Conta digital", Money.cents(383_030), "•••• 7082",
            ),
        ),
        selectedAccount = 0,
        transactions = transactions.drop(1),
    )
}
