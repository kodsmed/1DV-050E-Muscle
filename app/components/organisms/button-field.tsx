import { Button } from 'app/components/catalyst/button'
import { Text } from 'app/components/catalyst/text'

export function ButtonField({ prompt, unit, unitsFactor, value, optional, buttonValues, callback }: { prompt: string, unit: string | string[], unitsFactor?:number, value: number, optional: boolean, buttonValues:number[], callback: (value: number) => void }) {
  if (!buttonValues || buttonValues.length < 1) {
    return (<div></div>)
  }

  if (unitsFactor) {
    if (unit.length < 2) {
      return (<div></div>)
    }
  } else {
    unitsFactor = 1
  }

  function getFeedbackString({prompt, value, unit, unitsFactor}:{prompt:string, value:number, unit: string|string[], unitsFactor:number}) {
    if (unitsFactor && unit.length === 2 && unitsFactor > 1) {
      const valueMinor = value % unitsFactor
      const valueMajor = Math.floor(value / unitsFactor)
      let string = `${prompt}: `
      if (valueMajor > 0) {
        string += `${valueMajor}${unit[1]}, `
      }
      string += `${valueMinor}${unit[0]}`
      return string
    }
    return `${prompt}: ${value} ${unit}`
  }

  const feedbackString = getFeedbackString({prompt, value, unit, unitsFactor})

  return (
    <div className='flex-col w-fit'>
      <Text className='text-sm  font-bold text-gray-500'>{ feedbackString }</Text>
      {optional && <Text className='text-sm text-gray-500 italic'>Optional</Text>}
      {!optional && <Text className='text-sm text-gray-500'>&nbsp;</Text>}
      <div className='flex-col space-y-2 border-2 border-slate-200 p-4 rounded-xl w-full'>
        <div className='flex-row space-x-2 w-full'>
          {buttonValues.map((buttonValue, index) => {
            return <Button key={index} className="w-10" onClick={() => { callback(value + buttonValue) }}>+{buttonValue}</Button>
          })}
        </div>
        <div className='flex-row space-x-2 w-full'>
          {buttonValues.map((buttonValue, index) => {
            return <Button key={index} className="w-10" onClick={() => { callback(value - buttonValue) }}>-{buttonValue}</Button>
          })}
        </div>
      </div>
    </div>
  )
}