import { Button } from 'app/components/catalyst/button'
import { Text } from 'app/components/catalyst/text'

export function ButtonField({prompt, unit, value, optional, callback}: {prompt: string, unit:string , value: number, optional: boolean, callback: (value: number) => void}) {
  return (
    <div className='flex-col space-x-1'>
      <Text className='text-sm  font-bold text-gray-500'>{prompt}: {value} {unit}</Text>
      {optional && <Text className='text-sm text-gray-500 italic'>Optional</Text>}
      {!optional && <Text className='text-sm text-gray-500'>&nbsp;</Text>}
      <div className='flex-row space-x-1'>
        <Button className="w-10" onClick={() => { callback(value + 1) }}>+1</Button>
        <Button className="w-10" onClick={() => { callback(value + 5) }}>+5</Button>
        <Button className="w-10" onClick={() => { callback(value + 10) }}>+10</Button>
      </div>
      <div className='flex-row space-x-1'>
        <Button className="w-10" onClick={() => { callback(value - 1) }}>-1</Button>
        <Button className="w-10" onClick={() => { callback(value - 5) }}>-5</Button>
        <Button className="w-10" onClick={() => { callback(value - 10) }}>-10</Button>
      </div>
    </div>
  )
}