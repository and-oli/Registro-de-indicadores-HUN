import React, { PureComponent } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import Title from '../Title';
import Dropdown from '../Dropdown';
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
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
  const [years, setYears] = React.useState([]);
  const [selectedYear, setSelectedYear] = React.useState("");
  const [data, setData] = React.useState([]);
  const [dataByYear, setDataByYear] = React.useState({});

  const letters = '0123456789ABCDEF';
  let currentData = [
    { month: "Enero" },
    { month: "Febrero" },
    { month: "Marzo" },
    { month: "Abril" },
    { month: "Mayo" },
    { month: "Junio" },
    { month: "Julio" },
    { month: "Agosto" },
    { month: "Sept." },
    { month: "Octubre" },
    { month: "Nov." },
    { month: "Diciembre" }
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
            setBuffer(responseJson.registros.map(r => {
              let d = new Date(r.fecha)
              let dtf = new Intl.DateTimeFormat('sp', { year: 'numeric', month: 'numeric', day: '2-digit' })
              let [{ value: da }, , { value: mo }, , { value: ye }] = dtf.formatToParts(d);
              currentYears.add(ye);
              currentDataByYear[ye] = currentDataByYear[ye] || []
              currentDataByYear[ye].push({
                analysis: r.analisisCualitativo,
                value: r.valor,
                improvement: r.accionMejora,
                month: mo,
              })
              const monthIndex = parseInt(mo) - 1;
              currentData[monthIndex][ye] = r.valor;
            }));
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
    for (let d in dataByYear) {
      csvFile += (d + "\n")
      let orderedRecords = [...dataByYear[d]]
      orderedRecords.sort((or1, or2) => or1.month - or2.month)
      for (let record of orderedRecords) {
        console.log(record)
        csvFile += `${currentData[record.month - 1].month};${record[field]}\n`
      }
    }
    var csvContent = "...csv content...";
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    var blob = new Blob([csvFile], { type: "data:text/csv;charset=utf-8,\uFEFF" + encodedUri });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
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
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} padding={{ left: 30, right: 30 }} height={60} tick={<CustomizedAxisTick />} />
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