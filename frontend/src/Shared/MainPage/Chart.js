import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import Title from '../Title';


export default function Chart(props) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState([])

  React.useEffect(
    () => {
      setLoading(false);
      fetch(`/records/recordsByIndicatorId/${props.indicatorId}`, {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then(response => response.json())
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            props.setRecords(responseJson.registros)
            setData(responseJson.registros.map(r => {
              let d = new Date(r.fecha)
              let dtf = new Intl.DateTimeFormat('sp', { year: 'numeric', month: 'numeric', day: '2-digit' })
              let [{ value: da }, , { value: mo }, , { value: ye }] = dtf.formatToParts(d)
              return {
                time: `${da}-${mo}-${ye}`,
                amount: r.valor
              }
            })
            )
          }
        })
    }, []
  )
  return (
    <React.Fragment>
      <Title>Histórico</Title>
      {
        loading ?
          <div className="loader"></div> :
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
              <Line type="monotone" dataKey="amount" stroke={theme.palette.primary.main} dot={false} />
            </LineChart>
          </ResponsiveContainer>
      }
    </React.Fragment>
  );
}