export default function ProgressCircle({percent}){

return(

<div className="bg-gray-900 p-6 rounded text-white">

<h3>Completion</h3>

<div className="text-3xl mt-3">

{percent}%

</div>

</div>

)

}