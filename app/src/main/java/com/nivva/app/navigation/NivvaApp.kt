package com.nivva.app.navigation

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.core.tween
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountBalanceWallet
import androidx.compose.material.icons.rounded.Analytics
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.nivva.app.core.designsystem.NivvaColors
import com.nivva.app.core.designsystem.NivvaMotion
import com.nivva.app.feature.analytics.AnalyticsScreen
import com.nivva.app.feature.analytics.AnalyticsUiEvent
import com.nivva.app.feature.home.HomeScreen
import com.nivva.app.feature.placeholder.GoalsScreen
import com.nivva.app.feature.placeholder.ProfileScreen
import com.nivva.app.feature.wallet.WalletScreen
import com.nivva.app.feature.wallet.WalletUiEvent
import com.nivva.app.mock.NivvaMockData

private enum class MainDestination(
    val route: String,
    val label: String,
    val icon: ImageVector,
) {
    Home("home", "Início", Icons.Rounded.Home),
    Analytics("analytics", "Análises", Icons.Rounded.Analytics),
    Wallet("wallet", "Carteira", Icons.Rounded.AccountBalanceWallet),
    Goals("goals", "Metas", Icons.Rounded.Flag),
    Profile("profile", "Perfil", Icons.Rounded.Person),
}

@Composable
fun NivvaApp(modifier: Modifier = Modifier) {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route ?: MainDestination.Home.route
    var analyticsPeriod by rememberSaveable { mutableIntStateOf(NivvaMockData.analytics.selectedPeriod) }
    var walletSegment by rememberSaveable { mutableIntStateOf(NivvaMockData.wallet.selectedSegment) }
    var selectedAccount by rememberSaveable { mutableIntStateOf(NivvaMockData.wallet.selectedAccount) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        contentWindowInsets = WindowInsets.safeDrawing,
        bottomBar = {
            NivvaBottomBar(
                currentRoute = currentRoute,
                onDestinationSelected = { destination ->
                    navController.navigate(destination.route) {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
            )
        },
    ) { contentPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(contentPadding),
            contentAlignment = Alignment.TopCenter,
        ) {
            NavHost(
                navController = navController,
                startDestination = MainDestination.Home.route,
                modifier = Modifier
                    .fillMaxSize()
                    .widthIn(max = 600.dp),
                enterTransition = {
                    fadeIn(tween(NivvaMotion.Standard)) +
                        slideInHorizontally(tween(NivvaMotion.Standard)) { it / 16 }
                },
                exitTransition = {
                    fadeOut(tween(NivvaMotion.Fast)) +
                        slideOutHorizontally(tween(NivvaMotion.Fast)) { -it / 24 }
                },
                popEnterTransition = { fadeIn(tween(NivvaMotion.Standard)) },
                popExitTransition = { fadeOut(tween(NivvaMotion.Fast)) },
            ) {
                composable(MainDestination.Home.route) {
                    HomeScreen(
                        state = NivvaMockData.home,
                        onEvent = {},
                    )
                }
                composable(MainDestination.Analytics.route) {
                    AnalyticsScreen(
                        state = NivvaMockData.analytics.copy(selectedPeriod = analyticsPeriod),
                        onEvent = { event ->
                            if (event is AnalyticsUiEvent.PeriodSelected) {
                                analyticsPeriod = event.index
                            }
                        },
                    )
                }
                composable(MainDestination.Wallet.route) {
                    WalletScreen(
                        state = NivvaMockData.wallet.copy(
                            selectedSegment = walletSegment,
                            selectedAccount = selectedAccount,
                        ),
                        onEvent = { event ->
                            when (event) {
                                is WalletUiEvent.SegmentSelected -> walletSegment = event.index
                                is WalletUiEvent.AccountSelected -> selectedAccount = event.index
                                else -> Unit
                            }
                        },
                    )
                }
                composable(MainDestination.Goals.route) { GoalsScreen() }
                composable(MainDestination.Profile.route) { ProfileScreen() }
            }
        }
    }
}

@Composable
private fun NivvaBottomBar(
    currentRoute: String,
    onDestinationSelected: (MainDestination) -> Unit,
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 0.dp,
    ) {
        MainDestination.entries.forEach { destination ->
            val selected = currentRoute == destination.route
            NavigationBarItem(
                selected = selected,
                onClick = { onDestinationSelected(destination) },
                modifier = Modifier.testTag("bottom_${destination.route}"),
                icon = {
                    Icon(
                        destination.icon,
                        contentDescription = null,
                    )
                },
                label = {
                    Text(
                        destination.label,
                        style = MaterialTheme.typography.labelSmall,
                    )
                },
                alwaysShowLabel = true,
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = NivvaColors.Primary,
                    selectedTextColor = NivvaColors.Primary,
                    indicatorColor = NivvaColors.PrimarySoft,
                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                ),
            )
        }
    }
}
