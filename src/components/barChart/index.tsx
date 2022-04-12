import BarChartCanvas from './components/BarChartCanvas'
interface BarChartProps {
    data: number[];
}

const BarChart = (props: BarChartProps) => {

    
    return (
        <div>
            <BarChartCanvas
            charData = {props.data} />
        </div>

    )
}

export default BarChart