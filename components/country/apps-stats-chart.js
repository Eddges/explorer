import React from 'react'
import PropTypes from 'prop-types'
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryVoronoiContainer
} from 'victory'
import { theme } from 'ooni-components'

import { inCountry } from './country-context'
import Tooltip from './tooltip'
import SpinLoader from '../vendor/spin-loader'
import createApiRequest from '../../utils/api'

class AppsStatChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: null,
      fetching: true
    }
  }

  componentDidMount() {
    this.fetchAppNetworkStats()
  }

  async fetchAppNetworkStats() {
    const { countryCode, app, asn } = this.props
    const {client, cancelTokenSource } = createApiRequest()
    this.cancelTokenSource = cancelTokenSource
    const result = await client.get('/api/_/im_stats', {
      params: {
        probe_cc: countryCode,
        probe_asn: asn,
        test_name: app
      },
      cancelToken: this.cancelTokenSource.token
    })

    this.setState({
      data: result.data.results,
      fetching: false
    })
  }

  componentWillUnmount() {
    // Cancel the request if it happens to be in progress
    this.cancelTokenSource.cancel('Cancelling request; Component unmounted.')
  }

  render() {
    const { data, fetching } = this.state

    if (fetching) {
      return (<SpinLoader />)
    }

    const yMax = data.reduce((max, item) => (
      (item.total_count > max) ? item.total_count : max
    ), 0)

    return (
      <React.Fragment>
        <VictoryChart
          scale={{x: 'time'}}
          width={900}
          height={150}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension='x'
            />
          }
        >
          <VictoryAxis
            style={{ axis: { stroke: 'none'}}}
            tickFormat={() => {}}
          />
          <VictoryBar
            data={data}
            x='test_day'
            y={() => yMax}
            style={{
              data: {
                fill: theme.colors.gray3,
              }
            }}
          />
          <VictoryBar
            data={data}
            x='test_day'
            y='total_count'
            style={{
              data: {
                fill: theme.colors.green8
              }
            }}
            labels={(d) => {
              let s = `${new Date(d.test_day).toLocaleDateString()}`
              s += `\n${d.total_count} Total`
              return s
            }}
            labelComponent={<Tooltip width={100}/>}
          />
        </VictoryChart>
      </React.Fragment>
    )
  }
}

export default inCountry(AppsStatChart)
