package com.nivva.app.feature.wallet

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
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountBalance
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.MoreHoriz
import androidx.compose.material.icons.rounded.QrCodeScanner
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.SwapHoriz
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.nivva.app.core.designsystem.AmountSize
import com.nivva.app.core.designsystem.NivvaAmount
import com.nivva.app.core.designsystem.NivvaCard
import com.nivva.app.core.designsystem.NivvaColors
import com.nivva.app.core.designsystem.NivvaComponentSize
import com.nivva.app.core.designsystem.NivvaQuickAction
import com.nivva.app.core.designsystem.NivvaRadius
import com.nivva.app.core.designsystem.NivvaScreenHeader
import com.nivva.app.core.designsystem.NivvaSectionHeader
import com.nivva.app.core.designsystem.NivvaSegmentedControl
import com.nivva.app.core.designsystem.NivvaSpacing
import com.nivva.app.core.designsystem.NivvaTheme
import com.nivva.app.core.designsystem.NivvaTransactionItem
import com.nivva.app.mock.AccountUiModel
import com.nivva.app.mock.NivvaMockData
import com.nivva.app.mock.WalletUiState
import kotlinx.coroutines.flow.distinctUntilChanged

sealed interface WalletUiEvent {
    data class SegmentSelected(val index: Int) : WalletUiEvent
    data class AccountSelected(val index: Int) : WalletUiEvent
    data object AddAccount : WalletUiEvent
    data class QuickAction(val name: String) : WalletUiEvent
    data object SearchHistory : WalletUiEvent
}

@Composable
fun WalletScreen(
    state: WalletUiState,
    onEvent: (WalletUiEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.testTag("wallet_screen"),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(
            bottom = NivvaSpacing.Xl,
        ),
    ) {
        item {
            Column(Modifier.padding(horizontal = NivvaSpacing.Md)) {
                NivvaScreenHeader(
                    title = "Carteira",
                    actionIcon = Icons.Rounded.Add,
                    actionDescription = "Adicionar conta",
                    onAction = { onEvent(WalletUiEvent.AddAccount) },
                )
                NivvaSegmentedControl(
                    items = listOf("Contas", "Cartões", "Investimentos"),
                    selectedIndex = state.selectedSegment,
                    onSelected = { onEvent(WalletUiEvent.SegmentSelected(it)) },
                )
            }
        }
        item { Spacer(Modifier.height(NivvaSpacing.Sm)) }
        item {
            AccountCarousel(
                state = state,
                onSelected = { onEvent(WalletUiEvent.AccountSelected(it)) },
            )
        }
        item {
            PageIndicator(
                count = state.accounts.size,
                selected = state.selectedAccount,
                modifier = Modifier.padding(vertical = NivvaSpacing.Xs),
            )
        }
        item {
            QuickActions(
                onAction = { onEvent(WalletUiEvent.QuickAction(it)) },
                modifier = Modifier.padding(horizontal = NivvaSpacing.Md),
            )
        }
        item {
            NivvaSectionHeader(
                title = "Histórico",
                modifier = Modifier.padding(horizontal = NivvaSpacing.Md),
            )
        }
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = NivvaSpacing.Md),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    "Hoje, 12 de jun.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.weight(1f))
                androidx.compose.material3.IconButton(
                    onClick = { onEvent(WalletUiEvent.SearchHistory) },
                    modifier = Modifier.size(NivvaComponentSize.TouchTarget),
                ) {
                    Icon(Icons.Rounded.Search, contentDescription = "Buscar no histórico")
                }
            }
        }
        items(state.transactions, key = { it.id }) {
            NivvaTransactionItem(
                transaction = it,
                modifier = Modifier.padding(horizontal = NivvaSpacing.Md),
            )
        }
    }
}

@Composable
private fun AccountCarousel(
    state: WalletUiState,
    onSelected: (Int) -> Unit,
) {
    val pagerState = rememberPagerState(
        initialPage = state.selectedAccount,
        pageCount = { state.accounts.size },
    )
    LaunchedEffect(pagerState) {
        snapshotFlow { pagerState.currentPage }
            .distinctUntilChanged()
            .collect(onSelected)
    }
    HorizontalPager(
        state = pagerState,
        contentPadding = androidx.compose.foundation.layout.PaddingValues(
            horizontal = NivvaSpacing.Md,
        ),
        pageSpacing = NivvaSpacing.Sm,
    ) { page ->
        AccountCard(state.accounts[page])
    }
}

@Composable
private fun AccountCard(account: AccountUiModel) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(NivvaComponentSize.AccountCardHeight)
            .background(
                brush = Brush.linearGradient(
                    listOf(NivvaColors.Ink, NivvaColors.VioletAlt, NivvaColors.PrimaryStrong),
                ),
                shape = RoundedCornerShape(NivvaRadius.XLarge),
            )
            .semantics(mergeDescendants = true) {
                contentDescription = "${account.name}, ${account.type}, saldo " +
                    "${account.balance.format()}, final ${account.maskedNumber.takeLast(4)}"
            }
            .padding(NivvaSpacing.Lg),
    ) {
        Column {
            Text(
                account.name,
                style = MaterialTheme.typography.titleMedium,
                color = Color.White,
            )
            Text(
                account.type,
                style = MaterialTheme.typography.bodySmall,
                color = Color.White.copy(alpha = 0.7f),
            )
            Spacer(Modifier.weight(1f))
            NivvaAmount(account.balance, size = AmountSize.Large, color = Color.White)
            Text(
                account.maskedNumber,
                style = MaterialTheme.typography.bodySmall,
                color = Color.White.copy(alpha = 0.72f),
            )
        }
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(44.dp)
                .background(Color.White.copy(alpha = 0.14f), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Rounded.AccountBalance, contentDescription = null, tint = Color.White)
        }
    }
}

@Composable
private fun PageIndicator(
    count: Int,
    selected: Int,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .semantics {
                contentDescription = "Conta ${selected + 1} de $count"
            },
        horizontalArrangement = Arrangement.Center,
    ) {
        repeat(count) { index ->
            Box(
                Modifier
                    .padding(horizontal = 3.dp)
                    .size(if (index == selected) 7.dp else 5.dp)
                    .background(
                        if (index == selected) NivvaColors.Primary else NivvaColors.TextMuted,
                        CircleShape,
                    ),
            )
        }
    }
}

@Composable
private fun QuickActions(
    onAction: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    NivvaCard(modifier.fillMaxWidth()) {
        Row(horizontalArrangement = Arrangement.spacedBy(NivvaSpacing.Xxs)) {
            NivvaQuickAction(
                "Adicionar\ngasto",
                Icons.Rounded.Add,
                { onAction("Adicionar gasto") },
                Modifier.weight(1f),
            )
            NivvaQuickAction(
                "Transferir",
                Icons.Rounded.SwapHoriz,
                { onAction("Transferir") },
                Modifier.weight(1f),
                tint = NivvaColors.Aqua,
            )
            NivvaQuickAction(
                "Pagar\ncom QR",
                Icons.Rounded.QrCodeScanner,
                { onAction("Pagar com QR") },
                Modifier.weight(1f),
            )
            NivvaQuickAction(
                "Mais",
                Icons.Rounded.MoreHoriz,
                { onAction("Mais") },
                Modifier.weight(1f),
                tint = NivvaColors.TextSecondary,
            )
        }
    }
}

@Preview(name = "Carteira 393dp", widthDp = 393, heightDp = 852, showBackground = true)
@Composable
private fun WalletPreview() {
    NivvaTheme(darkTheme = false) {
        WalletScreen(NivvaMockData.wallet, onEvent = {})
    }
}
