import {
  type AccountAccessReason,
  AccountAccessError,
  accountAccessMessage
} from '@context/authErrors'
import { useAuth } from '@context/useAuth'
import { showApiErrors } from '@utils'
import { Alert, App, Button, Card, Flex, Form, Input, Typography } from 'antd'
import { useState } from 'react'

type FormValues = {
  email: string
  password: string
}

export const LoginPage = () => {
  const { login } = useAuth()
  const { notification } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [accessReason, setAccessReason] = useState<AccountAccessReason | null>(
    null
  )

  const onFinish = async ({ email, password }: FormValues) => {
    setLoading(true)
    setAccessReason(null)
    try {
      await login(email, password)
    } catch (e) {
      // Inactive/unverified accounts are shown inline; everything else as a toast.
      if (e instanceof AccountAccessError) {
        setAccessReason(e.reason)
      } else {
        showApiErrors(e, (message) => notification.error({ message }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex
      justify="center"
      align="center"
      style={{ minHeight: '100vh', background: '#f5f5f5' }}
    >
      <Card style={{ width: 400 }}>
        <Flex vertical gap={24}>
          <Flex vertical gap={4}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Sign in
            </Typography.Title>
            <Typography.Text type="secondary">
              Resolution Decision Review
            </Typography.Text>
          </Flex>

          {accessReason && (
            <Alert
              type="warning"
              showIcon
              title={accountAccessMessage(accessReason)}
              data-testid={`login-access-alert-${accessReason}`}
            />
          )}

          <Form
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email' }
              ]}
            >
              <Input placeholder="you@example.com" autoComplete="email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Password is required' }]}
            >
              <Input.Password
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>
        </Flex>
      </Card>
    </Flex>
  )
}
