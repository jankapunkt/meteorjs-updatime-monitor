import React from 'react';
import { StatusCollection } from '../collections/StatusCollection'
import { MonitorCollection } from '../collections/MonitorCollection'
import { useTracker, useSubscribe, useFind } from 'meteor/react-meteor-data'
import Plot from 'react-plotly.js'

const name = 'meteor'

export const App = () => {
  const statusLoading = useSubscribe('status', { name })
  const monitorLoading = useSubscribe('monitor', { name })
  const [status] = useFind(() => StatusCollection.find())
  const [uptime, duration] = useTracker(() => {
    const docs = MonitorCollection.find({}, {
      sort: { fired: 1 }
    })

    const uptime = {
      x: [],
      y: [],
      type: 'scatter'
    }

    const duration = {
      x: [],
      y: [],
      type: 'scatter'
    }

    docs.forEach((doc, index) => {
      uptime.x.push(doc.fired)
      duration.x.push(doc.fired)

      uptime.y.push(doc.hasTimedOut ? 'down' : 'up')
      duration.y.push(doc.hasTimedOut ? 0 : doc.duration)
    })

    return [uptime, duration]
  }, [])

  return (
    <div>
      <h1>Monitor for {name}</h1>
      <StatusInfo status={status} loading={statusLoading() || monitorLoading()} />
      <Plot data={[uptime]} layout={{ width: 800, height: 400, title: 'Uptime' }} config={{ responsive: true }}/>
      <Plot data={[duration]} layout={{ width: 800, height: 400, title: 'Duration' }} config={{ responsive: true }}/>
    </div>
  );
}

const StatusInfo = ({ status, loading }) => {
  if (loading || !status) return (<div>Status loading...</div>)

  return (
    <div>
      <span>Status: {status.up ? 'up' : 'down'}</span><span> | </span>
      <span>URL: {status.url}</span><span> | </span>
      <span>Method: {status.method}</span><span> | </span>
      <span>Interval: {status.interval / 1000}s</span>
    </div>
  )
}