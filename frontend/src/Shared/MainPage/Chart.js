import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer, Tooltip } from 'recharts';
import Title from '../Title';


export default function Chart(props) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState([])

  React.useEffect(
    () => {
      setLoading(false);
      fetch(`/records/lastRecordsByIndicatorId/${props.indicatorId}`, {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then(response => response.json())
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            setData(responseJson.registros.map(r => {
              let d = new Date(r.fecha)
              let dtf = new Intl.DateTimeFormat('sp', { year: 'numeric', month: 'numeric', day: '2-digit' })
              let [{ value: da }, , { value: mo }, , { value: ye }] = dtf.formatToParts(d)
              return {
                time: `${da}-${mo}-${ye}`,
                valor: r.valor
              }
            })
            )
          }
        })
    }, [props.indicatorId]
  )
  return (
    <React.Fragment>
      <Title>Histórico</Title>
      {
        loading ?
          <div className="loader"></div> :
          data.length === 0 ?
          <div>No hay registros para este indicador todavía</div> :
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{
                top: 16,
                right: 16,
                bottom: 0,
                left: 24,
              }}
            >
              <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary}>
                <Label
                  angle={270}
                  position="left"
                  style={{ textAnchor: 'middle', fill: theme.palette.text.primary }}
                >
                  Valor del indicador
                </Label>
              </YAxis>
              <Line type="monotone" dataKey="valor" stroke={theme.palette.primary.main} />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
      }
    </React.Fragment>
  );
}