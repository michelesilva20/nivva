package com.nivva.app.mock

import org.junit.Assert.assertEquals
import org.junit.Test

class MoneyTest {
    @Test
    fun formatsBrazilianRealFromCents() {
        assertEquals("R$ 1.234,56", Money.cents(123_456).format())
    }

    @Test
    fun formatsExpenseWithSemanticSign() {
        assertEquals("- R$ 129,90", Money.cents(-12_990).format(showSign = true))
    }
}
