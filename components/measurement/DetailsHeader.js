import React from 'react'
import PropTypes from 'prop-types'
import prettyMs from 'pretty-ms'
import { Flex, Box, Link } from 'ooni-components'
// FIXME: Include 'fontWeight' to ooni-components/atoms/Text
// Using Text from rebass directly for now
import { Text } from 'rebass'
import { FormattedMessage } from 'react-intl'
import { MdOpenInNew } from 'react-icons/lib/md'

import { getTestMetadata } from '../utils'
import Badge from '../Badge'

const TestGroupBadge = ({icon, name, color}) => (
  <Badge bg={color} color='white'>
    <Flex alignItems='center'>
      <Box>
        {React.cloneElement(icon, {size: 32})}
      </Box>
      <Box>
        {name}
      </Box>
    </Flex>
  </Badge>
)

TestGroupBadge.propTypes = {
  icon: PropTypes.element,
  name: PropTypes.string,
  color: PropTypes.string
}

const DetailsHeader = ({testName, runtime, notice}) => {
  const metadata = getTestMetadata(testName)

  return (
    <Flex py={4} alignItems={['flex-end', 'center']} flexDirection={['column', 'row']}>
      <Flex mb={[3, 0]} alignItems='center'>
        <Box>
          <TestGroupBadge
            icon={metadata.icon}
            name={<Text fontSize={20} is='span'>{metadata.groupName}</Text>}
            color={metadata.color}
          />
        </Box>
        <Box ml={2}>
          <Link color='blue7' href={metadata.info}>
            <Text fontSize={20}>
              {metadata.name}
              &nbsp;
              <small><MdOpenInNew /></small>
            </Text>
          </Link>
        </Box>
      </Flex>
      <Box mx='auto'>
        {notice}
      </Box>
      <Box>
        {runtime &&
          <Text fontSize={20}>
            <FormattedMessage id='Measurement.DetailsHeader.Runtime' />: <Text is='span' fontWeight='bold'>{prettyMs(runtime * 1000)}</Text>
          </Text>
        }
      </Box>
    </Flex>
  )
}

DetailsHeader.propTypes = {
  testName: PropTypes.string.isRequired,
  runtime: PropTypes.number.isRequired,
  notice: PropTypes.any
}

export default DetailsHeader
