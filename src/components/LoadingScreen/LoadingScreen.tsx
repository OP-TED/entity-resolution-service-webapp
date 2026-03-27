import { Flex, Spin } from 'antd'

import { useStyles } from './styles'

export const LoadingScreen = () => {
  const { styles } = useStyles()

  return (
    <Flex className={styles.container} align="center" justify="center">
      <Spin size="large" />
    </Flex>
  )
}
