export interface RecoveryIssue {
  kind: 'camera' | 'model'
  title: string
  message: string
  action: 'retry-camera' | 'refresh-cameras' | 'default-camera' | 'retry-model'
  actionLabel: string
  secondaryAction?: 'retry-camera' | 'refresh-cameras' | 'default-camera'
  secondaryActionLabel?: string
  detail?: string
}

function getErrorName(error: unknown): string {
  return error instanceof Error ? error.name : ''
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return ''
}

export function classifyCameraError(error: unknown): RecoveryIssue {
  const name = getErrorName(error)
  const message = getErrorMessage(error)
  const detail = [name, message].filter(Boolean).join(': ')

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return {
      kind: 'camera',
      title: 'Camera permission is blocked',
      message: "Allow camera access for Don't Touch, then try starting monitoring again.",
      action: 'retry-camera',
      actionLabel: 'Try again',
      secondaryAction: 'refresh-cameras',
      secondaryActionLabel: 'Refresh cameras',
      detail,
    }
  }

  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return {
      kind: 'camera',
      title: 'No camera was found',
      message: 'Connect a camera or choose another device in Setup.',
      action: 'refresh-cameras',
      actionLabel: 'Refresh cameras',
      secondaryAction: 'default-camera',
      secondaryActionLabel: 'Try default camera',
      detail,
    }
  }

  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return {
      kind: 'camera',
      title: 'Camera is busy',
      message: 'Close other apps using the camera, then try again.',
      action: 'retry-camera',
      actionLabel: 'Try again',
      secondaryAction: 'refresh-cameras',
      secondaryActionLabel: 'Refresh cameras',
      detail,
    }
  }

  if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
    return {
      kind: 'camera',
      title: 'Selected camera is unavailable',
      message: 'The saved camera may be unplugged. Try the default camera or choose a different device.',
      action: 'default-camera',
      actionLabel: 'Try default camera',
      secondaryAction: 'refresh-cameras',
      secondaryActionLabel: 'Refresh cameras',
      detail,
    }
  }

  return {
    kind: 'camera',
    title: 'Camera could not start',
    message: 'Check that your camera is connected and not blocked, then try again.',
    action: 'retry-camera',
    actionLabel: 'Try again',
    secondaryAction: 'refresh-cameras',
    secondaryActionLabel: 'Refresh cameras',
    detail: detail || 'Unknown camera error',
  }
}

export function classifyModelError(error: unknown): RecoveryIssue {
  const message = getErrorMessage(error)
  const detail = [getErrorName(error), message].filter(Boolean).join(': ')

  return {
    kind: 'model',
    title: 'Detection model could not start',
    message: 'The camera stays private, but hand and face detection needs to load before monitoring can begin.',
    action: 'retry-model',
    actionLabel: 'Retry model',
    secondaryActionLabel: 'View details',
    detail: detail || 'Unknown model loading error',
  }
}
