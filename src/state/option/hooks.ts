import { useCreateOptionsData, useOptionIntentions } from 'hooks/useOptionData'
import { useMemo } from 'react'
import { OptionType } from 'state/data/generated'
import { Currency } from '@uniswap/sdk-core'
import { Pool, FeeAmount } from '@uniswap/v3-sdk'
import { useActiveWeb3React } from 'hooks/web3'
import { Field } from 'state/mint/v3/actions'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { Maturity } from 'constants/maturity'

export function usePutOptionIntentions() {
  const { isLoading, isUninitialized, isError, error, options } = useOptionIntentions(OptionType.Put)

  return useMemo(() => {
    return {
      isLoading,
      isUninitialized,
      isError,
      error,
      formattedData: !isLoading && !isUninitialized ? options : undefined,
    }
  }, [isLoading, isUninitialized, isError, error, options])
}

export function useCallOptionIntentions() {
  const { isLoading, isUninitialized, isError, error, options } = useOptionIntentions(OptionType.Call)

  return useMemo(() => {
    return {
      isLoading,
      isUninitialized,
      isError,
      error,
      formattedData: !isLoading && !isUninitialized ? options : undefined,
    }
  }, [isLoading, isUninitialized, isError, error, options])
}

export function useCreateOptions(
  currencyA: Currency,
  currencyB: Currency,
  feeAmount: FeeAmount,
  baseCurrency: Currency,
  optionType: OptionType,
  strike: number,
  currencyAAmount: number,
  currencyBAmount: number,
  maturity: number,
  price: number
) {
  const { account } = useActiveWeb3React()
  // currencies
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA,
      [Field.CURRENCY_B]: currencyB,
    }),
    [currencyA, currencyB]
  )

  // formatted with tokens
  const [tokenA, tokenB, baseToken] = useMemo(
    () => [currencyA?.wrapped, currencyB?.wrapped, baseCurrency?.wrapped],
    [currencyA, currencyB, baseCurrency]
  )

  const [token0, token1] = useMemo(
    () =>
      tokenA && tokenB ? (tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]) : [undefined, undefined],
    [tokenA, tokenB]
  )

  const isCall = optionType == OptionType.Call
  const tokenIn = isCall ? token0 : token1
  const notional = tokenIn == currencyA.wrapped ? currencyAAmount : currencyBAmount
  //IERC20 tokenIn = IERC20(isCall ? token0 : token1);

  // const maturity = (await currentBlock).timestamp + 10; // 10 seconds
  const blockTimestamp = useCurrentBlockTimestamp()
  let maturityTimestamp
  if (maturity == Maturity.ONE_DAY) maturityTimestamp = blockTimestamp?.add(24 * 60 * 60)
  if (maturity == Maturity.SEVEN_DAYS) maturityTimestamp = blockTimestamp?.add(7 * 24 * 60 * 60)
  if (maturity == Maturity.ONE_MONTH) maturityTimestamp = blockTimestamp?.add(30 * 24 * 60 * 60)
  if (maturity == Maturity.THREE_MONTHS) maturityTimestamp = blockTimestamp?.add(90 * 24 * 60 * 60)

  useCreateOptionsData(
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B],
    feeAmount,
    optionType,
    strike,
    notional,
    maturityTimestamp,
    account,
    price
  )
}
