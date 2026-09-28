package com.nivva.app.feature.placeholder

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.nivva.app.core.designsystem.NivvaColors
import com.nivva.app.core.designsystem.NivvaScreenHeader
import com.nivva.app.core.designsystem.NivvaSpacing

@Composable
fun GoalsScreen(modifier: Modifier = Modifier) {
    PlaceholderScreen(
        title = "Metas",
        message = "Estamos preparando este espaço para seus objetivos.",
        icon = Icons.Rounded.Flag,
        modifier = modifier,
    )
}

@Composable
fun ProfileScreen(modifier: Modifier = Modifier) {
    PlaceholderScreen(
        title = "Perfil",
        message = "Suas preferências e dados pessoais ficarão organizados aqui.",
        icon = Icons.Rounded.Person,
        modifier = modifier,
    )
}

@Composable
private fun PlaceholderScreen(
    title: String,
    message: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = NivvaSpacing.Md),
    ) {
        NivvaScreenHeader(title)
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = NivvaSpacing.Xl),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .background(NivvaColors.PrimarySoft, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = NivvaColors.Primary,
                    modifier = Modifier.size(34.dp),
                )
            }
            Spacer(Modifier.size(NivvaSpacing.Lg))
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground,
            )
            Spacer(Modifier.size(NivvaSpacing.Xs))
            Text(
                text = message,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
            )
        }
    }
}
