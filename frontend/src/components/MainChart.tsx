import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import type { PricePoint } from '../mocks/analytics';
import { formatCompact, formatCurrency } from '../utils/format';

export const MainChart = ({ data }: { data: PricePoint[] }) => {
  const options: Highcharts.Options = {
    chart: { 
        height: 450, 
        backgroundColor: 'transparent', 
        style: { 
            fontFamily: 'var(--font-sans)'
        } 
    },
    title: { text: undefined },
    xAxis: { 
        type: 'datetime', 
        lineColor: '#334155',
        tickColor: '#334155', 
        labels: { style: { color: '#94a3b8' } } 
    },
    yAxis: [
      { 
        title: { text: 'Price' }, 
        height: '60%', 
        gridLineColor: '#1e293b',
        labels: { style: { color: '#94a3b8' } } 
      },
      { 
        title: { text: 'Volume' }, 
        top: '65%', 
        height: '35%', 
        offset: 0, 
        gridLineColor: '#1e293b', 
        labels: { style: { color: '#94a3b8' } } 
      }
    ],
    series: [
      { type: 'area', name: 'Price', data: data.map(d => [d.timestamp, d.price]), color: '#14b8a6', fillOpacity: 0.1, threshold: null, lineWidth: 2 },
      { type: 'column', name: 'Volume', data: data.map(d => [d.timestamp, d.volume]), yAxis: 1, color: '#cbd5e1', borderRadius: 2 }
    ],
    tooltip: {
        shared: true,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        style: { color: '#fff' },
        borderWidth: 0,
        formatter: function() {
            const date = new Date(this.x as number).toLocaleString();
            let s = `<span style="font-size: 10px; color: #94a3b8">${date}</span><br/>`;
            this.points?.forEach(p => {
                const val = p.series.name === 'Price' 
                    ? `$${formatCurrency(p.y as number)}`
                    : `${formatCompact(p.y as number)}`;
                s += `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${val}</b><br/>`;
            });
            return s;
        }
    },

    credits: { enabled: false }, legend: { enabled: false }
  };
  return <HighchartsReact highcharts={Highcharts} options={options} />;
};