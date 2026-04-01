import { LineChart,Line,XAxis,YAxis,Tooltip } from "recharts"

const data=[

{day:1,value:2},
{day:2,value:5},
{day:3,value:6},
{day:4,value:3},
{day:5,value:7},

]

export default function ProgressChart(){

return(

<div className="bg-gray-900 p-4 rounded">

<h2 className="text-white mb-3">
Monthly Progress
</h2>

<LineChart width={600} height={250} data={data}>

<XAxis dataKey="day"/>
<YAxis/>
<Tooltip/>

<Line
type="monotone"
dataKey="value"
stroke="#22c55e"
/>

</LineChart>

</div>

)

}