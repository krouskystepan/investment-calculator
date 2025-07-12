'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

const formSchema = z.object({
  amount: z.coerce.number().min(0, { message: 'Zadej počáteční hodnotu' }),
  rate: z.coerce.number().min(0, { message: 'Zadej kladný výnos' }),
  years: z.coerce.number().min(1, { message: 'Zadej alespoň 1 rok' }),
})

type FormValues = z.infer<typeof formSchema>

export function OneTimeInvestment() {
  const [result, setResult] = useState<number | null>(null)
  const [chartData, setChartData] = useState<{ year: number; value: number }[]>(
    []
  )

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      amount: 0,
      rate: 0,
      years: 1,
    },
  })

  function onSubmit(values: FormValues) {
    const final = values.amount * Math.pow(1 + values.rate / 100, values.years)
    setResult(parseFloat(final.toFixed(2)))

    const data = []
    for (let year = 0; year <= values.years; year++) {
      const value = values.amount * Math.pow(1 + values.rate / 100, year)
      data.push({ year, value: parseFloat(value.toFixed(2)) })
    }
    setChartData(data)
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Jednorázová investice</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Počáteční částka (Kč)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roční výnos (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doba investice (roky)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Spočítat</Button>
          </form>
        </Form>

        {result !== null && (
          <>
            <p className="font-medium">
              Výsledná částka: {result.toLocaleString('cs-CZ')} Kč
            </p>

            <InvestmentChart data={chartData} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function InvestmentChart({
  data,
}: {
  data: { year: number; value: number }[]
}) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            label={{ value: 'Rok', position: 'insideBottom', offset: -10 }}
          />
          <YAxis label={{ angle: -90, offset: -20, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value: number) => value.toLocaleString('cs-CZ') + ' Kč'}
            cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length > 0) {
                return (
                  <div className="bg-white border rounded-md p-2 shadow text-center">
                    <p className="font-semibold text-sm">Rok {label}</p>
                    <p className="text-sm">
                      Hodnota: {payload[0].value?.toLocaleString('cs-CZ')} Kč
                    </p>
                  </div>
                )
              }
              return null
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              padding: '8px 12px',
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            fill="#c7d2fe"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ stroke: '#6366f1', strokeWidth: 2, fill: '#fff', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
