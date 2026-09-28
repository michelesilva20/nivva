package com.nivva.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.nivva.app.core.designsystem.NivvaTheme
import com.nivva.app.navigation.NivvaApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            NivvaTheme {
                NivvaApp()
            }
        }
    }
}
