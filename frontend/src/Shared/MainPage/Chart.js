import React, { PureComponent } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import Title from '../Title';
import Dropdown from '../Dropdown';
import { Grid } from '@material-ui/core';

class CustomizedAxisTick extends PureComponent {
  render() {
    const {
      x, y, stroke, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">{payload.value}</text>
      </g>
    );
  }
}

export default function Chart(props) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [buffer, setBuffer] = React.useState([]);
  const [records, setRecords] = React.useState(0);
  const [years, setYears] = React.useState(new Set());
  const [selectedYear, setSelectedYear] = React.useState("");
  const [data, setData] = React.useState([
   { month: "Enero"},
   { month: "Febrero"},
   { month: "Marzo"},
   { month: "Abril"},
   { month: "Mayo"},
   { month: "Junio"},
   { month: "Julio"},
   { month: "Agosto"},
   { month: "Sept."},
   { month: "Octubre"},
   { month: "Nov."},
   { month: "Diciembre"}
  ]);

  const letters = '0123456789ABCDEF';

  React.useEffect(
    () => {
      setLoading(false);
      fetch(`/records/recordsByIndicatorId/${props.indicator.idIndicador}`, {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then(response => response.json())
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            setRecords(responseJson.registros.length);
            setBuffer(responseJson.registros.map(r => {
              let d = new Date(r.fecha)
              let dtf = new Intl.DateTimeFormat('sp', { year: 'numeric', month: 'numeric', day: '2-digit' })
              let [{ value: da }, , { value: mo }, , { value: ye }] = dtf.formatToParts(d);
              years.add(ye);
              setYears(years);
              const monthIndex = parseInt(mo) - 1;
              const register = data[monthIndex];
              register[ye] = r.valor;
              setData(data);
            }));
          }
        })
    }, [props.indicator]
  );

  const handleChange = (year) => {
    setSelectedYear(year);
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <React.Fragment>
      <Title>Histórico {props.indicator.nombre}</Title>
      <Grid container spacing={3}>
        <Grid item xs>
          {records > 0 ? <Dropdown options={Array.from(years.values())} type="Filtrar por año" handleDropdownChange={handleChange} /> : <span></span>}
        </Grid>
      </Grid>
      {
        loading ?
          <div className="loader"></div> :
          records === 0 ?
          <div>No hay registros para este indicador todavía</div> :
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{
                top: 16,
                right: 16,
                bottom: 10,
                left: 24,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={theme.palette.text.secondary} padding={{ left: 30, right: 30 }} height={60} tick={<CustomizedAxisTick/>}/>
              <YAxis stroke={theme.palette.text.secondary} domain={['auto', 'auto']}>
                <Label
                  angle={270}
                  position="left"
                  style={{ textAnchor: 'middle', fill: theme.palette.text.primary }}
                >
                  Valor del indicador
                </Label>
              </YAxis>
              <Tooltip />
              <Legend />
              <ReferenceLine y={props.indicator.meta} label="Meta" stroke="red" />
              {!selectedYear ? Array.from(years.values()).map((y,i) => 
                <Line key={`line-${y}-${i}`} type="monotone" dataKey={y} stroke={`#${letters[Math.floor(Math.random() * 16)]}${y}${letters[Math.floor(Math.random() * 16)]}`} connectNulls/>) :
                <Line type="monotone" dataKey={selectedYear} stroke={theme.palette.primary.main} connectNulls />
              }
            </LineChart>
          </ResponsiveContainer>
      }
    </React.Fragment>
  );
}