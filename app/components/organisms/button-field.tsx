import { Button } from 'app/components/catalyst/button'
import { Text } from 'app/components/catalyst/text'

export function ButtonField({ prompt, unit, value, optional, topButton, callback }: { prompt: string, unit: string, value: number, optional: boolean, topButton?:number, callback: (value: number) => void }) {
  return (
    <div className='flex-col w-fit'>
      <Text className='text-sm  font-bold text-gray-500'>{prompt}: {value} {unit}</Text>
      {optional && <Text className='text-sm text-gray-500 italic'>Optional</Text>}
      {!optional && <Text className='text-sm text-gray-500'>&nbsp;</Text>}
      <div className='flex-col space-y-2 border-2 border-slate-200 p-4 rounded-xl w-full'>
        <div className='flex-row space-x-2 w-full'>
          {(!topButton || topButton >= 1) && <Button className="w-10" onClick={() => { callback(value + 1) }}>+1</Button>}
          {(!topButton || topButton >= 5) && <Button className="w-10" onClick={() => { callback(value + 5) }}>+5</Button>}
          {(!topButton || topButton >=10) && <Button className="w-10" onClick={() => { callback(value + 10) }}>+10</Button>}
        </div>
        <div className='flex-row space-x-2 w-full'>
          {(!topButton || topButton >= 1) && <Button className="w-10" onClick={() => { callback(value - 1) }}>-1</Button>}
          {(!topButton || topButton >= 5) && <Button className="w-10" onClick={() => { callback(value - 5) }}>-5</Button>}
          {(!topButton || topButton >= 10) && <Button className="w-10" onClick={() => { callback(value - 10) }}>-10</Button>}
        </div>
      </div>
    </div>
  )
}