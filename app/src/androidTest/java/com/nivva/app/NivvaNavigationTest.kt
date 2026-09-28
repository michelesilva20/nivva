package com.nivva.app

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsSelected
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.nivva.app.core.designsystem.NivvaTheme
import com.nivva.app.navigation.NivvaApp
import org.junit.Rule
import org.junit.Test

class NivvaNavigationTest {
    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun bottomNavigationOpensAllPrimaryDestinations() {
        composeRule.setContent {
            NivvaTheme(darkTheme = false) {
                NivvaApp()
            }
        }

        composeRule.onNodeWithTag("home_screen").assertIsDisplayed()
        composeRule.onNodeWithTag("bottom_analytics").performClick()
        composeRule.onNodeWithTag("analytics_screen").assertIsDisplayed()
        composeRule.onNodeWithTag("bottom_wallet").performClick()
        composeRule.onNodeWithTag("wallet_screen").assertIsDisplayed()
        composeRule.onNodeWithTag("bottom_goals").performClick()
        composeRule.onNodeWithText("Estamos preparando este espaço para seus objetivos.")
            .assertIsDisplayed()
        composeRule.onNodeWithTag("bottom_profile").performClick()
        composeRule.onNodeWithText("Suas preferências e dados pessoais ficarão organizados aqui.")
            .assertIsDisplayed()
    }

    @Test
    fun analyticsPeriodSelectionUpdatesSelectedState() {
        composeRule.setContent {
            NivvaTheme(darkTheme = false) {
                NivvaApp()
            }
        }

        composeRule.onNodeWithTag("bottom_analytics").performClick()
        composeRule.onNodeWithText("Mês").assertIsSelected()
        composeRule.onNodeWithText("Ano").performClick().assertIsSelected()
    }
}
