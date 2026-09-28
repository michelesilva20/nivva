package com.nivva.app.core.designsystem

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountBalanceWallet
import androidx.compose.material.icons.rounded.ArrowDownward
import androidx.compose.material.icons.rounded.ArrowForward
import androidx.compose.material.icons.rounded.ArrowUpward
import androidx.compose.material.icons.rounded.DirectionsBus
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.LocalDining
import androidx.compose.material.icons.rounded.NotificationsNone
import androidx.compose.material.icons.rounded.Paid
import androidx.compose.material.icons.rounded.Payments
import androidx.compose.material.icons.rounded.SportsEsports
import androidx.compose.material.icons.rounded.Storefront
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.nivva.app.mock.CategoryType
import com.nivva.app.mock.ExpenseCategoryUiModel
import com.nivva.app.mock.MetricType
import com.nivva.app.mock.MetricUiModel
import com.nivva.app.mock.Money
import com.nivva.app.mock.TransactionKind
import com.nivva.app.mock.TransactionUiModel

@Composable
fun NivvaWordmark(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.semantics(mergeDescendants = true) {
            contentDescription = "nivva"
        },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = "ni",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground,
        )
        Text(
            text = "v",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = NivvaColors.Primary,
        )
        Text(
            text = "v",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = NivvaColors.Cyan,
        )
        Text(
            text = "a",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground,
        )
    }
}

@Composable
fun NivvaHomeTopBar(
    onNotificationsClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = NivvaComponentSize.TouchTarget),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        NivvaWordmark()
        Spacer(Modifier.weight(1f))
        IconButton(
            onClick = onNotificationsClick,
            modifier = Modifier.size(NivvaComponentSize.TouchTarget),
        ) {
            Icon(
                Icons.Rounded.NotificationsNone,
                contentDescription = "Notificações",
                tint = MaterialTheme.colorScheme.onBackground,
            )
        }
        Spacer(Modifier.width(NivvaSpacing.Xs))
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(NivvaColors.PrimarySoft)
                .semantics { contentDescription = "Abrir perfil" },
            contentAlignment = Alignment.Center,
        ) {
            Text(
                "MS",
                color = NivvaColors.PrimaryStrong,
                style = MaterialTheme.typography.labelLarge,
            )
        }
    }
}

@Composable
fun NivvaScreenHeader(
    title: String,
    actionIcon: ImageVector? = null,
    actionDescription: String? = null,
    onAction: () -> Unit = {},
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = NivvaComponentSize.TouchTarget),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground,
        )
        Spacer(Modifier.weight(1f))
        if (actionIcon != null) {
            IconButton(
                onClick = onAction,
                modifier = Modifier.size(NivvaComponentSize.TouchTarget),
            ) {
                Icon(actionIcon, contentDescription = actionDescription)
            }
        }
    }
}

@Composable
fun NivvaCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(NivvaRadius.Large),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = NivvaElevation.Card,
    ) {
        Column(
            modifier = Modifier.padding(NivvaSpacing.Md),
            content = content,
        )
    }
}

@Composable
fun NivvaSectionHeader(
    title: String,
    action: String? = null,
    onAction: () -> Unit = {},
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(48.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onBackground,
        )
        Spacer(Modifier.weight(1f))
        if (action != null) {
            Text(
                text = action,
                modifier = Modifier
                    .clip(RoundedCornerShape(NivvaRadius.Small))
                    .clickable(onClick = onAction)
                    .heightIn(min = NivvaComponentSize.TouchTarget)
                    .padding(horizontal = NivvaSpacing.Sm, vertical = NivvaSpacing.Xs),
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.primary,
            )
        }
    }
}

@Composable
fun NivvaAmount(
    amount: Money,
    modifier: Modifier = Modifier,
    size: AmountSize = AmountSize.Medium,
    color: Color = MaterialTheme.colorScheme.onSurface,
    showSign: Boolean = false,
) {
    Text(
        text = amount.format(showSign),
        modifier = modifier,
        style = when (size) {
            AmountSize.Large -> MaterialTheme.nivvaTypography.moneyLarge
            AmountSize.Medium -> MaterialTheme.nivvaTypography.moneyMedium
            AmountSize.Small -> MaterialTheme.nivvaTypography.moneySmall
        },
        color = color,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis,
    )
}

enum class AmountSize { Large, Medium, Small }

@Composable
fun NivvaSegmentedControl(
    items: List<String>,
    selectedIndex: Int,
    onSelected: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .height(NivvaComponentSize.SegmentedHeight),
        shape = RoundedCornerShape(NivvaRadius.Medium),
        color = MaterialTheme.colorScheme.surfaceVariant,
    ) {
        Row(Modifier.padding(NivvaSpacing.Xxs)) {
            items.forEachIndexed { index, item ->
                val selected = index == selectedIndex
                val background by animateColorAsState(
                    targetValue = if (selected) MaterialTheme.colorScheme.surface else Color.Transparent,
                    animationSpec = tween(NivvaMotion.Fast),
                    label = "segmentBackground",
                )
                val contentColor by animateColorAsState(
                    targetValue = if (selected) {
                        MaterialTheme.colorScheme.primary
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    },
                    animationSpec = tween(NivvaMotion.Fast),
                    label = "segmentContent",
                )
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(NivvaRadius.Small))
                        .background(background)
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                            role = Role.Tab,
                            onClick = { onSelected(index) },
                        )
                        .semantics {
                            this.selected = selected
                            role = Role.Tab
                        }
                        .padding(vertical = NivvaSpacing.Xs),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = item,
                        style = MaterialTheme.typography.labelMedium,
                        color = contentColor,
                        maxLines = 1,
                    )
                }
            }
        }
    }
}

@Composable
fun NivvaMetricCard(
    metric: MetricUiModel,
    modifier: Modifier = Modifier,
) {
    val (icon, tint) = when (metric.type) {
        MetricType.Income -> Icons.Rounded.ArrowDownward to NivvaColors.Success
        MetricType.Expense -> Icons.Rounded.ArrowUpward to NivvaColors.Expense
        MetricType.Available -> Icons.Rounded.Paid to NivvaColors.Primary
    }
    NivvaCard(
        modifier = modifier.semantics(mergeDescendants = true) {
            contentDescription = "${metric.label}: ${metric.amount.format()}"
        },
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(tint.copy(alpha = 0.12f))
                .clearAndSetSemantics {},
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(18.dp))
        }
        Spacer(Modifier.height(NivvaSpacing.Xs))
        Text(
            metric.label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 2,
        )
        Spacer(Modifier.height(NivvaSpacing.Xxs))
        NivvaAmount(metric.amount, size = AmountSize.Small)
    }
}

@Composable
fun NivvaInsightCard(
    message: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(NivvaRadius.Large),
        color = MaterialTheme.colorScheme.surface,
    ) {
        Row(
            modifier = Modifier.padding(NivvaSpacing.Md),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(NivvaColors.PrimarySoft),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    Icons.Rounded.Lightbulb,
                    contentDescription = null,
                    tint = NivvaColors.PrimaryStrong,
                )
            }
            Spacer(Modifier.width(NivvaSpacing.Sm))
            Column(Modifier.weight(1f)) {
                Text(
                    message,
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Text(
                    "Confira a análise",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Icon(
                Icons.Rounded.ArrowForward,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(NivvaIconSize.Medium),
            )
        }
    }
}

@Composable
fun NivvaTransactionItem(
    transaction: TransactionUiModel,
    modifier: Modifier = Modifier,
) {
    val icon = when (transaction.title) {
        "Salário" -> Icons.Rounded.Payments
        "Mercado" -> Icons.Rounded.Storefront
        "Transporte" -> Icons.Rounded.DirectionsBus
        "Moradia" -> Icons.Rounded.Home
        else -> Icons.Rounded.AccountBalanceWallet
    }
    val tint = if (transaction.kind == TransactionKind.Income) {
        NivvaColors.Success
    } else {
        NivvaColors.Primary
    }
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 64.dp)
            .padding(vertical = NivvaSpacing.Xs)
            .semantics(mergeDescendants = true) {
                contentDescription = "${transaction.title}, ${transaction.supportingText}, " +
                    transaction.amount.format(showSign = true)
            },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(NivvaRadius.Small))
                .background(tint.copy(alpha = 0.11f))
                .clearAndSetSemantics {},
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(21.dp))
        }
        Spacer(Modifier.width(NivvaSpacing.Sm))
        Column(Modifier.weight(1f)) {
            Text(
                transaction.title,
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Text(
                transaction.supportingText,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        NivvaAmount(
            transaction.amount,
            size = AmountSize.Small,
            showSign = true,
            color = if (transaction.kind == TransactionKind.Income) {
                NivvaColors.Success
            } else {
                MaterialTheme.colorScheme.onSurface
            },
        )
    }
}

@Composable
fun NivvaCategoryItem(
    category: ExpenseCategoryUiModel,
    modifier: Modifier = Modifier,
) {
    val (icon, color) = when (category.type) {
        CategoryType.Home -> Icons.Rounded.Home to NivvaColors.Primary
        CategoryType.Food -> Icons.Rounded.LocalDining to NivvaColors.Coral
        CategoryType.Transport -> Icons.Rounded.DirectionsBus to NivvaColors.Aqua
        CategoryType.Leisure -> Icons.Rounded.SportsEsports to NivvaColors.VioletAlt
    }
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 58.dp)
            .padding(vertical = NivvaSpacing.Xs)
            .semantics(mergeDescendants = true) {
                contentDescription = "${category.name}, ${category.percentage}% dos gastos, " +
                    category.amount.format()
            },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(NivvaRadius.Small))
                .background(color.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(NivvaSpacing.Sm))
        Column(Modifier.weight(1f)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text(category.name, style = MaterialTheme.typography.titleSmall)
                Spacer(Modifier.weight(1f))
                Text(
                    "${category.percentage}%",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Spacer(Modifier.height(NivvaSpacing.Xxs))
            Box(
                Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant),
            ) {
                Box(
                    Modifier
                        .fillMaxWidth(category.percentage / 100f)
                        .height(4.dp)
                        .background(color),
                )
            }
        }
        Spacer(Modifier.width(NivvaSpacing.Md))
        NivvaAmount(category.amount, size = AmountSize.Small)
    }
}

@Composable
fun NivvaQuickAction(
    label: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    tint: Color = MaterialTheme.colorScheme.primary,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(NivvaRadius.Medium))
            .clickable(onClick = onClick)
            .padding(vertical = NivvaSpacing.Xs),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(NivvaComponentSize.TouchTarget)
                .clip(CircleShape)
                .background(tint.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = tint)
        }
        Spacer(Modifier.height(NivvaSpacing.Xs))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurface,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}
