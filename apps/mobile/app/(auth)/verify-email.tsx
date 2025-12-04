import { VerificationScreen } from "../../features/auth/screens/VerificationScreen"
import type { ComponentProps } from "react"

export default function ActivityTab(props: ComponentProps<typeof VerificationScreen>) {
  return <VerificationScreen {...props} />
}
