'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn, formatNumberToReadableString } from '@/lib/utils'
import { Separator } from './ui/separator'
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts'

const formSchema = z.object({
  amount: z.coerce
    .number()
    .min(0, { message: 'Please enter an initial amount' }),
  monthly: z.coerce.number().min(0).optional(),
  years: z.coerce.number().min(1, { message: 'Enter at least 1 year' }),
  rate: z.coerce.number().min(0, { message: 'Enter a positive interest rate' }),
})

type ChartPoint = {
  year: string
  value: number
  deposits: number
}

export function Investment() {
  const [result, setResult] = useState<number | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      monthly: undefined,
      years: undefined,
      rate: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const P = values.amount ?? 0
    const PMT = values.monthly ?? 0
    const years = values.years ?? 0
    const annualRate = values.rate ?? 0

    const r = annualRate / 100 / 12
    const n = years * 12

    const data = []

    data.push({
      year: 'Now',
      yearNum: 0,
      value: P,
      deposits: P,
    })

    for (let month = 1; month <= n; month++) {
      const t = month / 12
      const deposits = P + PMT * month
      let value = 0

      if (r === 0) {
        value = deposits
      } else {
        value =
          P * Math.pow(1 + r, month) + PMT * ((Math.pow(1 + r, month) - 1) / r)
      }

      if (month % 12 === 0) {
        data.push({
          year: `Year ${t}`,
          yearNum: t,
          value: Math.round(value),
          deposits: deposits,
        })
      }

      if (month === n) setResult(value)
    }

    setChartData(data)
  }

  const renderField = (
    name: keyof z.infer<typeof formSchema>,
    label: string,
    description: string,
    unit?: string,
    formatted = false
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <div>
          <FormItem className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex flex-col items-center lg:items-start">
              <FormLabel className="text-xl">{label}</FormLabel>
              <FormDescription>{description}</FormDescription>
            </div>

            <FormControl>
              {formatted ? (
                <div className="flex rounded-md shadow-xs max-w-56">
                  <Input
                    type="text"
                    inputMode="numeric"
                    className="-me-px rounded-e-none shadow-none h-10"
                    placeholder={label}
                    value={
                      field.value === undefined || field.value === null
                        ? ''
                        : field.value
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\s/g, '')

                      if (/^\d*$/.test(raw)) {
                        const num = raw === '' ? undefined : parseInt(raw, 10)
                        field.onChange(num)
                      }
                    }}
                  />

                  {unit && (
                    <span className="border-input inline-flex items-center rounded-e-md border px-3 text-sm">
                      {unit}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex rounded-md shadow-xs max-w-48">
                  <Input
                    className="-me-px rounded-e-none shadow-none h-10"
                    placeholder={label}
                    type="number"
                    {...field}
                    value={(field.value as string) ?? ''}
                  />
                  {unit && (
                    <span className="border-input inline-flex items-center rounded-e-md border px-3 text-sm">
                      {unit}
                    </span>
                  )}
                </div>
              )}
            </FormControl>
          </FormItem>
          <FormMessage className="text-center mt-2 lg:mt-0 lg:text-left" />
        </div>
      )}
    />
  )

  const rawInitialDeposit = form.getValues('amount')
  const initialDeposit =
    typeof rawInitialDeposit === 'number' ? rawInitialDeposit : 0

  const maxValue = Math.max(...chartData.map((d) => d.value), initialDeposit)

  const minTicks = 5

  const range = maxValue - initialDeposit

  const baseStep = Math.pow(10, Math.floor(Math.log10(range / minTicks)))
  const minStep = initialDeposit * 0.2
  const step = Math.max(baseStep * 5, minStep)

  const yMax = Math.ceil(maxValue / step) * step

  const ticks: number[] = []
  ticks.push(initialDeposit)
  for (let i = initialDeposit + step; i <= yMax; i += step) {
    ticks.push(i)
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardHeader>
            <h2 className="text-xl font-bold">Investment Growth Calculator</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {renderField(
                'amount',
                'Initial Amount',
                'Initial investment amount',
                'CZK',
                true
              )}
              {renderField(
                'monthly',
                'Monthly Contribution',
                'Optional monthly deposit',
                'CZK',
                true
              )}
              {renderField(
                'years',
                'Years',
                'Investment duration in years',
                'Y'
              )}
              {renderField(
                'rate',
                'Annual Interest',
                'Expected yearly return',
                '%'
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full">
              <p>
                Result:{' '}
                <span
                  className={cn(
                    'font-semibold',
                    result !== null && 'text-emerald-600'
                  )}
                >
                  {result !== null
                    ? result.toLocaleString('cs-CZ', {
                        style: 'currency',
                        currency: 'CZK',
                        minimumFractionDigits: 2,
                      })
                    : '-'}
                </span>
              </p>
              <Button
                type="submit"
                className="bg-emerald-600 cursor-pointer hover:bg-emerald-600/90 focus:bg-emerald-600/90 px-6"
              >
                Calculate
              </Button>
            </div>

            {result && (
              <>
                <Separator />
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="4 4" />
                    <XAxis
                      dataKey="year"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      domain={[initialDeposit, 'dataMax']}
                      ticks={ticks}
                      interval={0}
                      tickFormatter={(value) =>
                        formatNumberToReadableString(value)
                      }
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toLocaleString('cs-CZ')} CZK`,
                        name === 'value' ? 'Value' : 'Deposits',
                      ]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#50C878"
                      fill="#50C878"
                      fillOpacity={0.2}
                      dot={{ r: 4 }}
                    />
                    {form.getValues('monthly') !== undefined && (
                      <Area
                        type="monotone"
                        dataKey="deposits"
                        stroke="#4169E1"
                        fill="#4169E1"
                        strokeWidth={2}
                        fillOpacity={0.2}
                        dot={{ r: 4 }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
