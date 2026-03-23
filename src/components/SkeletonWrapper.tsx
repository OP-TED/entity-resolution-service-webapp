import Skeleton, { type SkeletonProps } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import type { PropsWithChildren } from 'react'

type Props = { isLoading: boolean } & SkeletonProps & PropsWithChildren

export const SkeletonWrapper = ({ isLoading, children, ...props }: Props) => {
  return <>{isLoading ? <Skeleton {...props} /> : children}</>
}
