package com.nivva.app.core.designsystem

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import com.nivva.app.R

object NivvaColors {
    val Primary = Color(0xFF6257FF)
    val PrimaryStrong = Color(0xFF5146F4)
    val PrimarySoft = Color(0xFFEEECFF)
    val Aqua = Color(0xFF25D2C1)
    val Cyan = Color(0xFF39C6F4)
    val GradientMiddle = Color(0xFF3BA7F5)
    val Coral = Color(0xFFFF647C)
    val VioletAlt = Color(0xFF7B68EE)
    val BackgroundLight = Color(0xFFF7F8FC)
    val Surface = Color(0xFFFFFFFF)
    val SurfaceSecondary = Color(0xFFF1F3F8)
    val Ink = Color(0xFF0B1020)
    val TextPrimary = Color(0xFF111827)
    val TextSecondary = Color(0xFF68738A)
    val TextMuted = Color(0xFF94A0B4)
    val Divider = Color(0xFFE7EAF2)
    val Success = Color(0xFF16C79A)
    val Expense = Color(0xFFF2556D)
    val Warning = Color(0xFFF59E5B)
    val DarkSurface = Color(0xFF151B2D)
    val DarkSurfaceSecondary = Color(0xFF20283C)
    val DarkTextSecondary = Color(0xFFB5BED0)
}

object NivvaSpacing {
    val Xxs = 4.dp
    val Xs = 8.dp
    val Sm = 12.dp
    val Md = 16.dp
    val Lg = 20.dp
    val Xl = 24.dp
    val Xxl = 32.dp
    val Xxxl = 40.dp
    val Huge = 48.dp
}

object NivvaRadius {
    val Small = 10.dp
    val Medium = 14.dp
    val Large = 18.dp
    val XLarge = 22.dp
    val Hero = 26.dp
}

object NivvaElevation {
    val None = 0.dp
    val Card = 1.dp
    val Floating = 6.dp
}

object NivvaIconSize {
    val Small = 16.dp
    val Medium = 20.dp
    val Large = 24.dp
    val XLarge = 28.dp
}

object NivvaComponentSize {
    val TouchTarget = 48.dp
    val ButtonHeight = 52.dp
    val BottomBarHeight = 72.dp
    val SegmentedHeight = 48.dp
    val AccountCardHeight = 164.dp
    val ContentMaxWidth = 560.dp
}

object NivvaMotion {
    const val Fast = 150
    const val Standard = 240
    const val Emphasis = 360
}

fun nivvaGradient(): Brush = Brush.linearGradient(
    colors = listOf(NivvaColors.Primary, NivvaColors.GradientMiddle, NivvaColors.Aqua),
)

private val Urbanist = FontFamily(
    Font(R.font.urbanist, FontWeight.Normal),
    Font(R.font.urbanist, FontWeight.Medium),
    Font(R.font.urbanist, FontWeight.SemiBold),
    Font(R.font.urbanist, FontWeight.Bold),
)

private val MaterialTypography = androidx.compose.material3.Typography(
    displayLarge = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.SemiBold,
        fontSize = 40.sp,
        lineHeight = 46.sp,
    ),
    headlineLarge = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.SemiBold,
        fontSize = 30.sp,
        lineHeight = 36.sp,
    ),
    headlineMedium = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.SemiBold,
        fontSize = 25.sp,
        lineHeight = 31.sp,
    ),
    titleLarge = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.SemiBold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
    ),
    titleMedium = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 22.sp,
    ),
    titleSmall = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        lineHeight = 20.sp,
    ),
    bodyLarge = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
    ),
    bodyMedium = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
    ),
    bodySmall = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 17.sp,
    ),
    labelLarge = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        lineHeight = 18.sp,
    ),
    labelMedium = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
    ),
    labelSmall = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 14.sp,
    ),
)

@Immutable
data class NivvaExtendedTypography(
    val moneyLarge: TextStyle,
    val moneyMedium: TextStyle,
    val moneySmall: TextStyle,
)

private val ExtendedTypography = NivvaExtendedTypography(
    moneyLarge = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        lineHeight = 38.sp,
        letterSpacing = (-0.5).sp,
    ),
    moneyMedium = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.SemiBold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
    ),
    moneySmall = TextStyle(
        fontFamily = Urbanist,
        fontWeight = FontWeight.SemiBold,
        fontSize = 15.sp,
        lineHeight = 20.sp,
    ),
)

private val LocalNivvaTypography = staticCompositionLocalOf { ExtendedTypography }

val MaterialTheme.nivvaTypography: NivvaExtendedTypography
    @Composable get() = LocalNivvaTypography.current

private val LightColors = lightColorScheme(
    primary = NivvaColors.Primary,
    onPrimary = Color.White,
    primaryContainer = NivvaColors.PrimarySoft,
    onPrimaryContainer = NivvaColors.PrimaryStrong,
    secondary = NivvaColors.Aqua,
    onSecondary = NivvaColors.Ink,
    tertiary = NivvaColors.Cyan,
    error = NivvaColors.Expense,
    background = NivvaColors.BackgroundLight,
    onBackground = NivvaColors.TextPrimary,
    surface = NivvaColors.Surface,
    onSurface = NivvaColors.TextPrimary,
    surfaceVariant = NivvaColors.SurfaceSecondary,
    onSurfaceVariant = NivvaColors.TextSecondary,
    outline = NivvaColors.Divider,
    outlineVariant = NivvaColors.Divider,
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF9B94FF),
    onPrimary = NivvaColors.Ink,
    primaryContainer = Color(0xFF302A7A),
    onPrimaryContainer = Color(0xFFE4E1FF),
    secondary = NivvaColors.Aqua,
    onSecondary = NivvaColors.Ink,
    tertiary = NivvaColors.Cyan,
    error = Color(0xFFFF8CA0),
    background = NivvaColors.Ink,
    onBackground = Color(0xFFF1F4FA),
    surface = NivvaColors.DarkSurface,
    onSurface = Color(0xFFF1F4FA),
    surfaceVariant = NivvaColors.DarkSurfaceSecondary,
    onSurfaceVariant = NivvaColors.DarkTextSecondary,
    outline = Color(0xFF35405A),
)

@Composable
fun NivvaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColors else LightColors
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = !darkTheme
                isAppearanceLightNavigationBars = !darkTheme
            }
        }
    }
    CompositionLocalProvider(LocalNivvaTypography provides ExtendedTypography) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = MaterialTypography,
            content = content,
        )
    }
}
