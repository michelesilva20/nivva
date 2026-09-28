package com.nivva.app.feature.analytics

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.nivva.app.core.designsystem.AmountSize
import com.nivva.app.core.designsystem.NivvaAmount
import com.nivva.app.core.designsystem.NivvaCard
import com.nivva.app.core.designsystem.NivvaColors
import com.nivva.app.core.designsystem.NivvaMotion
import com.nivva.app.core.designsystem.NivvaRadius
import com.nivva.app.core.designsystem.NivvaScreenHeader
import com.nivva.app.core.designsystem.NivvaSectionHeader
import com.nivva.app.core.designsystem.NivvaSegmentedControl
import com.nivva.app.core.designsystem.NivvaSpacing
import com.nivva.app.core.designsystem.NivvaTheme
import com.nivva.app.core.designsystem.NivvaCategoryItem
import com.nivva.app.mock.AnalyticsUiState
import com.nivva.app.mock.Money
import com.nivva.app.mock.NivvaMockData

sealed interface AnalyticsUiEvent {
    data class PeriodSelected(val index: Int) : AnalyticsUiEvent
    data object CalendarClick : AnalyticsUiEvent
    data object SeeAllCategories : AnalyticsUiEvent
}

@Composable
fun AnalyticsScreen(
    state: AnalyticsUiState,
    onEvent: (AnalyticsUiEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.testTag("analytics_screen"),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(
            start = NivvaSpacing.Md,
            end = NivvaSpacing.Md,
            bottom = NivvaSpacing.Xl,
        ),
    ) {
        item {
            NivvaScreenHeader(
                title = "Análises",
                actionIcon = Icons.Rounded.CalendarMonth,
                actionDescription = "Escolher período",
                onAction = { onEvent(AnalyticsUiEvent.CalendarClick) },
            )
        }
        item {
            NivvaSegmentedControl(
                items = listOf("Semana", "Mês", "Ano", "Personalizado"),
                selectedIndex = state.selectedPeriod,
                onSelected = { onEvent(AnalyticsUiEvent.PeriodSelected(it)) },
            )
        }
        item { Spacer(Modifier.height(NivvaSpacing.Sm)) }
        item { ExpenseChartCard(state) }
        item { Spacer(Modifier.height(NivvaSpacing.Sm)) }
        item { BudgetCard(state) }
        item {
            NivvaSectionHeader(
                title = "Gastos por categoria",
                action = "Ver todas",
                onAction = { onEvent(AnalyticsUiEvent.SeeAllCategories) },
            )
        }
        items(state.categories, key = { it.name }) {
            NivvaCategoryItem(it)
        }
    }
}

@Composable
private fun ExpenseChartCard(state: AnalyticsUiState) {
    NivvaCard(Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.Bottom) {
            Column(Modifier.weight(1f)) {
                Text(
                    "Total de gastos",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                NivvaAmount(state.totalExpenses, size = AmountSize.Medium)
            }
            Column(horizontalAlignment = Alignment.End) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Rounded.TrendingUp,
                        contentDescription = null,
                        tint = NivvaColors.Expense,
                        modifier = Modifier.size(18.dp),
                    )
                    Text(
                        state.comparison,
                        style = MaterialTheme.typography.titleSmall,
                        color = NivvaColors.Expense,
                    )
                }
            }
        }
        Spacer(Modifier.height(NivvaSpacing.Lg))
        BarChart(
            labels = state.monthLabels,
            values = state.chartValues,
            selected = 4,
        )
    }
}

@Composable
private fun BarChart(
    labels: List<String>,
    values: List<Float>,
    selected: Int,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(144.dp)
            .semantics {
                contentDescription = labels.zip(values).joinToString(
                    prefix = "Gráfico de gastos mensais. ",
                ) { (label, value) -> "$label: ${(value * 100).toInt()}% do maior gasto" }
            },
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Bottom,
    ) {
        values.forEachIndexed { index, value ->
            val animated by animateFloatAsState(
                targetValue = value,
                animationSpec = tween(NivvaMotion.Emphasis),
                label = "barHeight",
            )
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Bottom,
                modifier = Modifier.weight(1f),
            ) {
                Box(
                    Modifier
                        .size(width = 24.dp, height = (100 * animated).dp)
                        .background(
                            if (index == selected) NivvaColors.Primary else NivvaColors.PrimarySoft,
                            RoundedCornerShape(topStart = 7.dp, topEnd = 7.dp),
                        ),
                )
                Spacer(Modifier.height(NivvaSpacing.Xs))
                Text(
                    labels[index],
                    style = MaterialTheme.typography.labelSmall,
                    color = if (index == selected) {
                        NivvaColors.Primary
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    },
                )
            }
        }
    }
}

@Composable
private fun BudgetCard(state: AnalyticsUiState) {
    val progress by animateFloatAsState(
        targetValue = state.budgetProgress,
        animationSpec = tween(NivvaMotion.Emphasis),
        label = "budgetProgress",
    )
    val available = Money.cents(state.budgetTotal.cents - state.budgetSpent.cents)
    NivvaCard(
        modifier = Modifier
            .fillMaxWidth()
            .semantics(mergeDescendants = true) {
                contentDescription = "Orçamento do mês: ${(progress * 100).toInt()}% utilizado. " +
                    "${available.format()} disponíveis"
            },
    ) {
        Text("Orçamento do mês", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(NivvaSpacing.Md))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(contentAlignment = Alignment.Center) {
                Canvas(Modifier.size(88.dp)) {
                    drawArc(
                        color = NivvaColors.PrimarySoft,
                        startAngle = -90f,
                        sweepAngle = 360f,
                        useCenter = false,
                        style = Stroke(width = 9.dp.toPx(), cap = StrokeCap.Round),
                        size = Size(size.width, size.height),
                    )
                    drawArc(
                        brush = com.nivva.app.core.designsystem.nivvaGradient(),
                        startAngle = -90f,
                        sweepAngle = 360f * progress,
                        useCenter = false,
                        style = Stroke(width = 9.dp.toPx(), cap = StrokeCap.Round),
                    )
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "${(progress * 100).toInt()}%",
                        style = MaterialTheme.typography.titleLarge,
                    )
                    Text(
                        "utilizado",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            Spacer(Modifier.size(NivvaSpacing.Lg))
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    NivvaAmount(state.budgetSpent, size = AmountSize.Small)
                    Text(
                        " de ${state.budgetTotal.format()}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.height(NivvaSpacing.Xs))
                Box(
                    Modifier
                        .fillMaxWidth()
                        .height(7.dp)
                        .background(
                            MaterialTheme.colorScheme.surfaceVariant,
                            RoundedCornerShape(NivvaRadius.Small),
                        ),
                ) {
                    Box(
                        Modifier
                            .fillMaxWidth(progress)
                            .height(7.dp)
                            .background(
                                NivvaColors.Primary,
                                RoundedCornerShape(NivvaRadius.Small),
                            ),
                    )
                }
                Spacer(Modifier.height(NivvaSpacing.Xs))
                Text(
                    "${available.format()} disponíveis",
                    style = MaterialTheme.typography.bodySmall,
                    color = NivvaColors.Primary,
                )
            }
        }
    }
}

@Preview(name = "Análises 393dp", widthDp = 393, heightDp = 852, showBackground = true)
@Composable
private fun AnalyticsPreview() {
    NivvaTheme(darkTheme = false) {
        AnalyticsScreen(NivvaMockData.analytics, onEvent = {})
    }
}
