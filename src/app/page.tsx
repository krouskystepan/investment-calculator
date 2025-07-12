'use client'

import { useState } from 'react'
import { OneTimeInvestment } from '@/components/sections/OneTimeInvestment'
// import { RegularInvestment } from '@/components/sections/RegularInvestment'
// import { Withdrawals } from '@/components/sections/Withdrawals'
// import { GoalInvestment } from '@/components/sections/GoalInvestment'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Home() {
  const [selected, setSelected] = useState<string>('oneTime')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Typ výpočtu</h1>
        <Select onValueChange={setSelected} defaultValue="oneTime">
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Vyber výpočet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oneTime">Jednorázová investice</SelectItem>
            <SelectItem value="regular">Pravidelná investice</SelectItem>
            <SelectItem value="withdrawals">Výběry z investice</SelectItem>
            <SelectItem value="goal">Cílová částka</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selected === 'oneTime' && <OneTimeInvestment />}
      {/* {selected === 'regular' && <RegularInvestment />}
      {selected === 'withdrawals' && <Withdrawals />}
      {selected === 'goal' && <GoalInvestment />} */}
    </div>
  )
}
