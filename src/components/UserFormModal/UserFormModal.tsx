import {
  createUserApiV1UsersPostMutation,
  listUsersApiV1UsersGetQueryKey,
  patchUserApiV1UsersUserIdPatchMutation
} from '@api/@tanstack/react-query.gen'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { showApiErrors } from '@utils'
import { type ModalProps, App, Form, Input, Modal, Switch } from 'antd'
import { useEffect } from 'react'

import type { UserResponse } from '@api/types.gen'

type Props = {
  onCancel: () => void
  data?: UserResponse
} & ModalProps

export const UserFormModal = ({ data, onCancel }: Props) => {
  const [form] = Form.useForm()
  const { notification } = App.useApp()
  const queryClient = useQueryClient()

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    ...createUserApiV1UsersPostMutation(),
    onSuccess: () => {
      notification.success({ message: 'User created successfully' })
      queryClient.invalidateQueries({
        queryKey: listUsersApiV1UsersGetQueryKey()
      })
      onCancel()
    },
    onError: (error) => {
      showApiErrors(error, (message) => notification.error({ message }))
    }
  })

  const { mutate: patchMutation, isPending: isPatching } = useMutation({
    ...patchUserApiV1UsersUserIdPatchMutation(),
    onSuccess: () => {
      notification.success({ message: 'User updated successfully' })
      queryClient.invalidateQueries({
        queryKey: listUsersApiV1UsersGetQueryKey()
      })
      onCancel()
    },
    onError: (error) => {
      showApiErrors(error, (message) => notification.error({ message }))
    }
  })

  const isLoading = isCreating || isPatching

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        is_active: data?.is_active,
        is_superuser: data?.is_superuser,
        is_verified: data?.is_verified
      })
    } else {
      form.resetFields()
    }
  }, [data, form])

  const onSubmit = async () => {
    const values = await form.validateFields()

    if (data) {
      patchMutation({
        path: {
          user_id: data?.id
        },
        body: values
      })
    } else {
      createMutation({
        body: values
      })
    }
  }

  return (
    <Modal
      title={data ? `Edit User — ${data?.email}` : 'Add User'}
      open
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={isLoading}
      destroyOnHidden
    >
      <Form
        form={form}
        onFinish={onSubmit}
        layout="vertical"
        initialValues={{
          is_active: true,
          is_superuser: false,
          is_verified: true
        }}
      >
        {!data && (
          <>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email' }
              ]}
            >
              <Input placeholder="user@example.com" autoComplete="off" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Password is required' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Form.Item>
          </>
        )}

        <Form.Item label="Active" name="is_active" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          label="Superuser"
          name="is_superuser"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item label="Verified" name="is_verified" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}
