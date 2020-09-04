import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { useRouter } from 'next/router'
import countryUtil from 'country-util'
import axios from 'axios'
import { Container, theme } from 'ooni-components'

import Hero from '../components/measurement/Hero'
import CommonSummary from '../components/measurement/CommonSummary'
import DetailsHeader from '../components/measurement/DetailsHeader'
import SummaryText from '../components/measurement/SummaryText'
import CommonDetails from '../components/measurement/CommonDetails'
import MeasurementContainer from '../components/measurement/MeasurementContainer'
import MeasurementNotFound from '../components/measurement/MeasurementNotFound'

import Layout from '../components/Layout'
import NavBar from '../components/NavBar'

const pageColors = {
  default: theme.colors.base,
  anomaly: theme.colors.yellow9,
  reachable: theme.colors.green8,
  error: theme.colors.gray6,
  down: theme.colors.gray6,
  confirmed: theme.colors.red7
}

export async function getServerSideProps({ query }) {
  let initialProps = {}

  let client = axios.create({baseURL: process.env.MEASUREMENTS_URL}) // eslint-disable-line
  let params = {
    report_id: query.report_id,
    full: true
  }
  if (query.input) {
    params['input'] = query.input
  }

  let msmtResult = await client.get('/api/v1/measurement_meta', {
    params
  })

  if (msmtResult?.data) {
    initialProps = Object.assign({}, msmtResult.data)

    if (typeof initialProps['scores'] === 'string') {
      try {
        initialProps['scores'] = JSON.parse(initialProps['scores'])
        initialProps['raw_measurement'] = JSON.parse(initialProps['raw_measurement'])
      } catch (e) {
        console.error(`Failed to parse JSON in scores: ${e.toString()}`)
      }
    }

    const { probe_cc } = msmtResult.data
    const countryObj = countryUtil.countryList.find(country => (
      country.iso3166_alpha2 === probe_cc
    ))

    initialProps['country'] = countryObj?.name || 'Unknown'
  } else {
    // Measurement not found
    initialProps.notFound = true
  }

  return {
    props: initialProps
  }
}

const Measurement = ({
  country,
  confirmed,
  anomaly,
  failure,
  test_name,
  test_start_time,
  probe_cc,
  probe_asn,
  notFound = false,
  input,
  raw_measurement,
  ...rest
}) => {
  const { query } = useRouter()
  const queryString = new URLSearchParams(query);
  const rawMsmtDownloadURL = `${process.env.MEASUREMENTS_URL}/api/v1/raw_measurement?${queryString}`

  return (
    <Layout>
      <Head>
        <title>OONI Explorer</title>
      </Head>
      {notFound ? (
        <MeasurementNotFound />
      ): (
        <MeasurementContainer
          isConfirmed={confirmed}
          isAnomaly={anomaly}
          isFailure={failure}
          testName={test_name}
          country={country}
          measurement={raw_measurement}
          input={input}
          {...rest}

          render={({
            status = 'default',
            statusIcon,
            statusLabel,
            statusInfo,
            legacy = false,
            summaryText,
            details
          }) => (
            <React.Fragment>
              <NavBar color={pageColors[status]} />
              <Hero
                color={pageColors[status]}
                status={status}
                icon={statusIcon}
                label={statusLabel}
                info={statusInfo}
              />
              <CommonSummary
                test_start_time={test_start_time}
                probe_asn={probe_asn}
                probe_cc={probe_cc}
                color={pageColors[status]}
                country={country}
              />

              <Container>
                <DetailsHeader
                  testName={test_name}
                  runtime={raw_measurement?.test_runtime}
                  notice={legacy}
                />
                {summaryText &&
                  <SummaryText
                    testName={test_name}
                    testUrl={input}
                    network={probe_asn}
                    country={country}
                    date={test_start_time}
                    content={summaryText}
                  />
                }
                {details}
                <CommonDetails
                  measurementURL={rawMsmtDownloadURL}
                  measurement={raw_measurement}
                />
              </Container>
            </React.Fragment>
          )} />
      )}
    </Layout>
  )
}

Measurement.propTypes = {
  measurement: PropTypes.object,
  measurementURL: PropTypes.string,
  isAnomaly: PropTypes.bool,
  isFailure: PropTypes.bool,
  isConfirmed: PropTypes.bool,
  country: PropTypes.string
}

export default Measurement
