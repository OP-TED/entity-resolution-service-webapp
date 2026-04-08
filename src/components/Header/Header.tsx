import { DownOutlined, UserOutlined } from '@ant-design/icons'
import { getStatisticsApiV1CurationStatsGetOptions } from '@api/@tanstack/react-query.gen'
import { SkeletonWrapper, Text } from '@components'
import { useAuth } from '@context/useAuth'
import { paths } from '@router/paths'
import { useQuery } from '@tanstack/react-query'

import { Avatar, Button, Dropdown, Flex, Typography } from 'antd'
import { NavLink, useNavigate } from 'react-router-dom'

import { useStyles } from './styles'

const { Title } = Typography

export const Header = () => {
  const { data, isLoading } = useQuery(
    getStatisticsApiV1CurationStatsGetOptions()
  )
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { styles } = useStyles()

  const selectedTopCount = data?.curation?.selected_top ?? 0
  const selectedAlternativeCount = data?.curation?.selected_alternative ?? 0
  const rejectedCount = data?.curation?.rejected_all ?? 0
  const totalCount = data?.curation?.total_decisions ?? 0

  const getActiveLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
    fontWeight: isActive ? 700 : 400,
    textDecoration: 'none',
    fontSize: 14
  })

  const onClickAdminPanel = () => {
    navigate(paths.admin)
  }

  const menuItems = [
    ...(user?.is_superuser
      ? [
          {
            key: 'admin-panel',
            label: 'Admin Panel',
            onClick: onClickAdminPanel
          }
        ]
      : []),
    {
      key: 'sign-out',
      label: 'Sign out',
      danger: true,
      onClick: logout
    }
  ]

  return (
    <header className={styles.header}>
      <Flex justify="space-between" align="center" gap={16} wrap="wrap">
        <Flex gap={24} align="center">
          <Title level={1}>Resolution Decision Review</Title>

          <Flex gap={16}>
            <NavLink to={paths.root} end style={getActiveLinkStyle}>
              Decisions
            </NavLink>

            <NavLink to={paths.history} style={getActiveLinkStyle}>
              History
            </NavLink>

          </Flex>
        </Flex>

        <SkeletonWrapper
          isLoading={isLoading}
          count={1}
          height={20}
          width="350px"
        >
          <Flex gap={4} align="center">
            <Text color="colorWhite" weight={600}>
              Progress:
            </Text>

            <Text color="colorWhite">
              {selectedTopCount} Selected Top | {selectedAlternativeCount}{' '}
              Selected Alternative, {rejectedCount} Rejected
            </Text>

            <Text weight={600} color="colorWhite">
              Total:
            </Text>

            <Text color="colorWhite">{totalCount} decisions</Text>
          </Flex>
        </SkeletonWrapper>

        <Flex gap={8} align="center">
          <Dropdown
            trigger={['click']}
            menu={{ items: menuItems }}
            placement="bottomRight"
          >
            <Button type="text" className={styles.userMenuTrigger}>
              <Flex gap={8} align="center">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                />
                <Text color="colorWhite" size={13}>
                  {user?.email ?? 'User'}
                </Text>
                <DownOutlined />
              </Flex>
            </Button>
          </Dropdown>
        </Flex>
      </Flex>
    </header>
  )
}
