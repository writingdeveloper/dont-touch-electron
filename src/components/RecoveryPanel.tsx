import type { RecoveryIssue } from '../utils/recovery'

interface RecoveryPanelProps {
  issues: RecoveryIssue[]
  onRetryCamera: (useDefaultCamera?: boolean) => void
  onRefreshCameras: () => void
  onRetryModel: () => void
}

export function RecoveryPanel({
  issues,
  onRetryCamera,
  onRefreshCameras,
  onRetryModel,
}: RecoveryPanelProps) {
  if (issues.length === 0) return null

  return (
    <section className="recovery-panel" role="alert" aria-live="polite">
      <div className="recovery-panel-copy">
        <span className="recovery-kicker">Needs attention</span>
        <h2>Monitoring is paused</h2>
        <p>Fix the item below, then start monitoring again.</p>
      </div>

      <div className="recovery-issues">
        {issues.map((issue) => {
          const isCamera = issue.kind === 'camera'
          const runCameraAction = (action: RecoveryIssue['action'] | NonNullable<RecoveryIssue['secondaryAction']>) => {
            if (action === 'default-camera') {
              onRetryCamera(true)
            } else if (action === 'refresh-cameras') {
              onRefreshCameras()
            } else {
              onRetryCamera()
            }
          }

          return (
            <article className="recovery-issue" key={`${issue.kind}-${issue.title}`}>
              <div className="recovery-issue-main">
                <h3>{issue.title}</h3>
                <p>{issue.message}</p>
              </div>
              <div className="recovery-actions">
                <button
                  type="button"
                  className="recovery-primary"
                  onClick={() => {
                    if (issue.kind === 'model') {
                      onRetryModel()
                    } else {
                      runCameraAction(issue.action)
                    }
                  }}
                >
                  {issue.actionLabel}
                </button>
                {isCamera && issue.secondaryActionLabel && (
                  <button
                    type="button"
                    className="recovery-secondary"
                    onClick={() => runCameraAction(issue.secondaryAction || 'refresh-cameras')}
                  >
                    {issue.secondaryActionLabel}
                  </button>
                )}
              </div>
              {issue.detail && (
                <details className="recovery-details">
                  <summary>Technical details</summary>
                  <code>{issue.detail}</code>
                </details>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
