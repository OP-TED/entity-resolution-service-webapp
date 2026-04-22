import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons'
import {
  listUsersApiV1UsersGetOptions,
  listUsersApiV1UsersGetQueryKey,
  patchUserApiV1UsersUserIdPatchMutation
} from '@api/@tanstack/react-query.gen'
import { Header, UserFormModal } from '@components'
import { useQueryUpdate } from '@hooks/useQueryUpdate'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { defaultFilters, showApiErrors } from '@utils'
import { App, Button, Flex, Input, Modal, Table, Tag, Typography } from 'antd'
import { useState } from 'react'

import { useStyles } from './styles'

import type { UserResponse } from '@api/types.gen'
import type { ColumnsType } from 'antd/es/table'

export const AdminPage = () => {
  const { notification } = App.useApp()
  const queryClient = useQueryClient()
  const { params, updateQuery } = useQueryUpdate()

  const { styles } = useStyles()
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    user?: UserResponse
  }>({
    isOpen: false
  })

  const { data, isLoading } = useQuery(
    listUsersApiV1UsersGetOptions({
      query: {
        ...defaultFilters,
        ...params
      }
    })
  )

  const { mutateAsync: deactivateMutation } = useMutation({
    ...patchUserApiV1UsersUserIdPatchMutation(),
    onSuccess: () => {
      notification.success({ message: 'User deactivated successfully' })
      queryClient.invalidateQueries({
        queryKey: listUsersApiV1UsersGetQueryKey()
      })
    },
    onError: (error) => {
      showApiErrors(error, (message) => notification.error({ message }))
    }
  })

  const onToggleModal = () =>
    setModalState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      user: undefined
    }))

  const onDeactivate = (user: UserResponse) => {
    Modal.confirm({
      title: 'Deactivate User',
      content: `Are you sure you want to deactivate ${user.email}?`,
      okText: 'Deactivate',
      okButtonProps: { danger: true },
      onOk: () =>
        deactivateMutation({
          body: { is_active: false },
          path: { user_id: user?.id }
        })
    })
  }

  const columns: ColumnsType<UserResponse> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (_, { is_active }) => (
        <Tag color={is_active ? 'green' : 'orange'}>
          {is_active ? 'Yes' : 'No'}
        </Tag>
      )
    },
    {
      title: 'Superuser',
      dataIndex: 'is_superuser',
      key: 'is_superuser',
      width: 110,
      render: (_, { is_superuser }) => (
        <Tag color={is_superuser ? 'green' : 'orange'}>
          {is_superuser ? 'Yes' : 'No'}
        </Tag>
      )
    },
    {
      title: 'Verified',
      dataIndex: 'is_verified',
      key: 'is_verified',
      width: 100,
      render: (_, { is_verified }) => (
        <Tag color={is_verified ? 'green' : 'orange'}>
          {is_verified ? 'Yes' : 'No'}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (_, { created_at }) => new Date(created_at).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Flex gap={8}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => setModalState({ isOpen: true, user: record })}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDeactivate(record)}
            disabled={!record.is_active}
          />
        </Flex>
      )
    }
  ]

  return (
    <Flex vertical className="h-100vh overflow-hidden">
      <Header />

      <Flex vertical gap={16} className={styles.adminPage}>
        <Flex justify="space-between" align="center">
          <Typography.Text className={styles.heading} strong>
            User Management
          </Typography.Text>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onToggleModal}
          >
            Add User
          </Button>
        </Flex>

        <Input
          placeholder="Search by email"
          prefix={<SearchOutlined />}
          value={typeof params.email === 'string' ? params.email : ''}
          onChange={(e) => {
            updateQuery({ ...params, email: e.target.value, page: 1 })
          }}
          allowClear
          className="input-min-width"
        />

        <Table
          bordered
          columns={columns}
          dataSource={data?.results}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: Number(params.page) || defaultFilters.page,
            pageSize: Number(params.per_page) || defaultFilters.per_page,
            hideOnSinglePage: true,
            total: data?.count,
            showSizeChanger: true,
            showTotal: (total) => `${total} users`,
            onChange: (page: number, pageSize: number) =>
              updateQuery({
                ...params,
                page,
                per_page: pageSize
              })
          }}
          scroll={{
            x: 'max-content'
          }}
        />
      </Flex>

      {modalState?.isOpen && (
        <UserFormModal data={modalState?.user} onCancel={onToggleModal} />
      )}
    </Flex>
  )
}
