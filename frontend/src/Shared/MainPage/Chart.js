import React, { PureComponent } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import Title from '../Title';
import Dropdown from '../Dropdown';
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import periodsOrder from '../../PeriodsOrder';

class CustomizedAxisTick extends PureComponent {
  render() {
    const {
      x, y, payload,
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
  const [records, setRecords] = React.useState(0);
  const [years, setYears] = React.useState([]);
  const [selectedYear, setSelectedYear] = React.useState("");
  const [data, setData] = React.useState([]);
  const [dataByYear, setDataByYear] = React.useState({});

  const letters = '0123456789ABCDEF';
  let currentData = [
  ]
  React.useEffect(
    () => {
      setLoading(false);
      fetch(`/records/lastRecordsByIndicatorId/${props.indicator.idIndicador}`, {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then(response => response.json())
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            let currentYears = new Set()

            let currentDataByYear = {}
            setRecords(responseJson.registros.length);
            responseJson.registros.forEach(r => {
              let ano = r.ano
              currentYears.add(ano);
              currentDataByYear[ano] = currentDataByYear[ano] || []
              currentDataByYear[ano].push({
                analysis: r.analisisCualitativo,
                value: r.valor,
                improvement: r.accionMejora,
                period: r.nombrePeriodo,
              })
              let previousData = currentData.find(data => data.period === r.nombrePeriodo)
              if (previousData) {
                previousData[ano] = r.valor
              }
              else {
                currentData.push({ period: r.nombrePeriodo, [ano]: r.valor })
              }
            });
            let periods = Object.keys(periodsOrder[props.indicator.periodicidad])
            periods.forEach(p => {
              if (currentData.findIndex(cd => cd.period === p) < 0) {
                currentData.push({ period: p })
              }
            })
            currentData.sort((a, b) => periodsOrder[props.indicator.periodicidad][a.period] - periodsOrder[props.indicator.periodicidad][b.period])
            setYears(currentYears);
            setData(currentData);
            setDataByYear(currentDataByYear);
          }
        })
    }, [props.indicator]
  );

  const handleChange = (year) => {
    setSelectedYear(year);
  }

  const downloadConsolidate = () => {
    let options = [
      { filename: "MEJORAMIENTO.csv", field: "improvement" },
      { filename: "DATO_MES.csv", field: "value" },
      { filename: "ANALISIS.csv", field: "analysis" },
    ]
    for (let option of options) {
      createFile(option.filename, option.field)
    }
  }
  const createFile = (filename, field) => {
    let csvFile = "";
    let years = Object.keys(dataByYear)
    years.sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
    for (let d of years) {
      csvFile += (d + "\n")
      let orderedRecords = [...dataByYear[d]]
      orderedRecords.sort((or1, or2) =>
        periodsOrder[props.indicator.periodicidad][or2.period] -
        periodsOrder[props.indicator.periodicidad][or1.period]
      )
      for (let record of orderedRecords) {
        csvFile += `${record.period};${record[field]}\n`
      }
    }
    let csvContent = "...csv content...";
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    let blob = new Blob([csvFile], { type: "data:text/csv;charset=utf-8,\uFEFF" + encodedUri });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      link = document.createElement("a");
      if (link.download !== undefined) {
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        return true
      }
    }
  }

  return (
    <React.Fragment>
      <Title>Histórico {props.indicator.nombre}</Title>
      <Grid container spacing={3}>
        <Grid item xs>
          {records > 0 ? <Dropdown options={Array.from(years.values())} type="Filtrar por año" handleDropdownChange={handleChange} /> : <span></span>}
        </Grid>
        {
          records > 0 &&
          <Grid item xs>
            <Button
              variant="contained"
              color="primary"
              onClick={downloadConsolidate}
            > Descargar consolidado </Button>
          </Grid>
        }

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
                <XAxis dataKey="period" stroke={theme.palette.text.secondary} padding={{ left: 30, right: 30 }} height={60} tick={<CustomizedAxisTick />} />
                <YAxis stroke={theme.palette.text.secondary} domain={[dataMin => (dataMin < 0 ? Math.floor(dataMin * 1.1) : 0), dataMax => (dataMax > props.indicator.meta ? Math.ceil(dataMax * 1.1) : Math.ceil(props.indicator.meta * 1.1))]}>
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
                {!selectedYear ? Array.from(years.values()).map((y, i) =>
                  <Line key={`line-${y}-${i}`} type="monotone" dataKey={y} stroke={`#${letters[Math.floor(Math.random() * 16)]}${y}${letters[Math.floor(Math.random() * 16)]}`} connectNulls />) :
                  <Line type="monotone" dataKey={selectedYear} stroke={theme.palette.primary.main} connectNulls />
                }
              </LineChart>
            </ResponsiveContainer>
      }
    </React.Fragment>
  );
}