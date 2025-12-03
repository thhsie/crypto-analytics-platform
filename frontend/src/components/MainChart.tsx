import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import type { PricePoint } from '../mocks/analytics';

export const MainChart = ({ data }: { data: PricePoint[] }) => {
  const options: Highcharts.Options = {
    chart: { height: 450, backgroundColor: 'transparent', style: { fontFamily: 'Inter' } },
    title: { text: undefined },
    xAxis: { type: 'datetime', lineColor: '#e2e8f0', tickColor: '#e2e8f0', labels: { style: { color: '#64748b' } } },
    yAxis: [
      { title: { text: 'Price' }, height: '60%', gridLineColor: '#f1f5f9', labels: { style: { color: '#64748b' } } },
      { title: { text: 'Volume' }, top: '65%', height: '35%', offset: 0, gridLineColor: '#f1f5f9', labels: { style: { color: '#64748b' } } }
    ],
    series: [
      { type: 'area', name: 'Price', data: data.map(d => [d.timestamp, d.price]), color: '#14b8a6', fillOpacity: 0.1, threshold: null, lineWidth: 2 },
      { type: 'column', name: 'Volume', data: data.map(d => [d.timestamp, d.volume]), yAxis: 1, color: '#cbd5e1', borderRadius: 2 }
    ],
    tooltip: { shared: true, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 8, shadow: true, borderWidth: 0 },
    credits: { enabled: false }, legend: { enabled: false }
  };
  return <HighchartsReact highcharts={Highcharts} options={options} />;
};