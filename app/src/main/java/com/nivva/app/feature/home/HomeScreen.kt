package com.nivva.app.feature.home

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.SwapHoriz
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.nivva.app.core.designsystem.AmountSize
import com.nivva.app.core.designsystem.NivvaColors
import com.nivva.app.core.designsystem.NivvaComponentSize
import com.nivva.app.core.designsystem.NivvaHomeTopBar
import com.nivva.app.core.designsystem.NivvaInsightCard
import com.nivva.app.core.designsystem.NivvaMetricCard
import com.nivva.app.core.designsystem.NivvaRadius
import com.nivva.app.core.designsystem.NivvaSectionHeader
import com.nivva.app.core.designsystem.NivvaSpacing
import com.nivva.app.core.designsystem.NivvaTheme
import com.nivva.app.core.designsystem.NivvaTransactionItem
import com.nivva.app.core.designsystem.NivvaAmount
import com.nivva.app.core.designsystem.nivvaGradient
import com.nivva.app.mock.HomeUiState
import com.nivva.app.mock.NivvaMockData

sealed interface HomeUiEvent {
    data object NotificationsClick : HomeUiEvent
    data object AddClick : HomeUiEvent
    data object TransferClick : HomeUiEvent
    data object InsightClick : HomeUiEvent
    data object SeeAllTransactions : HomeUiEvent
}

@Composable
fun HomeScreen(
    state: HomeUiState,
    onEvent: (HomeUiEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.testTag("home_screen"),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(
            start = NivvaSpacing.Md,
            end = NivvaSpacing.Md,
            bottom = NivvaSpacing.Xl,
        ),
    ) {
        item {
            NivvaHomeTopBar(
                onNotificationsClick = { onEvent(HomeUiEvent.NotificationsClick) },
            )
        }
        item {
            BalanceHero(
                state = state,
                onAdd = { onEvent(HomeUiEvent.AddClick) },
                onTransfer = { onEvent(HomeUiEvent.TransferClick) },
            )
        }
        item { Spacer(Modifier.height(NivvaSpacing.Sm)) }
        item {
            BoxWithConstraints(Modifier.fillMaxWidth()) {
                if (maxWidth < 350.dp) {
                    Column(verticalArrangement = Arrangement.spacedBy(NivvaSpacing.Xs)) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(NivvaSpacing.Xs),
                        ) {
                            state.metrics.take(2).forEach {
                                NivvaMetricCard(it, Modifier.weight(1f))
                            }
                        }
                        NivvaMetricCard(state.metrics.last(), Modifier.fillMaxWidth())
                    }
                } else {
                    Row(horizontalArrangement = Arrangement.spacedBy(NivvaSpacing.Xs)) {
                        state.metrics.forEach {
                            NivvaMetricCard(it, Modifier.weight(1f))
                        }
                    }
                }
            }
        }
        item { Spacer(Modifier.height(NivvaSpacing.Sm)) }
        item {
            NivvaInsightCard(
                message = state.insight,
                onClick = { onEvent(HomeUiEvent.InsightClick) },
            )
        }
        item {
            NivvaSectionHeader(
                title = "Transações recentes",
                action = "Ver todas",
                onAction = { onEvent(HomeUiEvent.SeeAllTransactions) },
            )
        }
        items(state.transactions, key = { it.id }) {
            NivvaTransactionItem(it)
        }
    }
}

@Composable
private fun BalanceHero(
    state: HomeUiState,
    onAdd: () -> Unit,
    onTransfer: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(nivvaGradient(), RoundedCornerShape(NivvaRadius.Hero))
            .padding(NivvaSpacing.Lg),
    ) {
        BalanceSparkline(
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .fillMaxWidth(0.43f)
                .height(82.dp),
        )
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    "Seu saldo total",
                    color = Color.White.copy(alpha = 0.9f),
                    style = MaterialTheme.typography.bodyMedium,
                )
                Spacer(Modifier.size(NivvaSpacing.Xs))
                Box(
                    Modifier
                        .size(6.dp)
                        .background(Color.White.copy(alpha = 0.75f), CircleShape),
                )
            }
            Spacer(Modifier.height(NivvaSpacing.Xs))
            NivvaAmount(state.balance, size = AmountSize.Large, color = Color.White)
            Spacer(Modifier.height(NivvaSpacing.Xxs))
            Text(
                "↑ ${state.balanceVariation}",
                color = Color.White,
                style = MaterialTheme.typography.labelMedium,
            )
            Spacer(Modifier.height(NivvaSpacing.Lg))
            Row(horizontalArrangement = Arrangement.spacedBy(NivvaSpacing.Xs)) {
                OutlinedButton(
                    onClick = onTransfer,
                    modifier = Modifier
                        .weight(1f)
                        .height(NivvaComponentSize.TouchTarget),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = Color.White,
                        contentColor = NivvaColors.PrimaryStrong,
                    ),
                    border = null,
                    shape = RoundedCornerShape(NivvaRadius.Medium),
                ) {
                    Icon(Icons.Rounded.SwapHoriz, contentDescription = null)
                    Spacer(Modifier.size(NivvaSpacing.Xs))
                    Text("Transferir")
                }
                Button(
                    onClick = onAdd,
                    modifier = Modifier
                        .weight(1f)
                        .height(NivvaComponentSize.TouchTarget),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = NivvaColors.PrimaryStrong.copy(alpha = 0.78f),
                        contentColor = Color.White,
                    ),
                    shape = RoundedCornerShape(NivvaRadius.Medium),
                ) {
                    Icon(Icons.Rounded.Add, contentDescription = null)
                    Spacer(Modifier.size(NivvaSpacing.Xs))
                    Text("Adicionar")
                }
            }
        }
    }
}

@Composable
private fun BalanceSparkline(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val points = listOf(
            Offset(0f, size.height * 0.82f),
            Offset(size.width * 0.2f, size.height * 0.68f),
            Offset(size.width * 0.38f, size.height * 0.75f),
            Offset(size.width * 0.57f, size.height * 0.28f),
            Offset(size.width * 0.78f, size.height * 0.12f),
            Offset(size.width, size.height * 0.22f),
        )
        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(points.first().x, points.first().y)
            points.zipWithNext().forEach { (start, end) ->
                val midX = (start.x + end.x) / 2
                cubicTo(midX, start.y, midX, end.y, end.x, end.y)
            }
        }
        drawPath(
            path,
            color = Color.White.copy(alpha = 0.65f),
            style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round),
        )
    }
}

@Preview(name = "Home 393dp", widthDp = 393, heightDp = 852, showBackground = true)
@Composable
private fun HomePreview() {
    NivvaTheme(darkTheme = false) {
        HomeScreen(state = NivvaMockData.home, onEvent = {})
    }
}
