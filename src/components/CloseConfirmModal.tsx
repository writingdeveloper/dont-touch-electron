import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

interface CloseConfirmModalProps {
  onClose: (action: 'quit' | 'tray', remember: boolean) => void
  onCancel: () => void
}

export function CloseConfirmModal({ onClose, onCancel }: CloseConfirmModalProps) {
  const { t } = useLanguage()
  const [remember, setRemember] = useState(false)

  return (
    <div className="close-modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="close-modal-title">
      <div className="close-modal" onClick={(e) => e.stopPropagation()}>
        <h3 id="close-modal-title">{t.closeModalTitle || 'Close Application'}</h3>

        <div className="close-modal-buttons">
          <button className="close-modal-btn quit" onClick={() => onClose('quit', remember)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18.36 6.64a9 9 0 11-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
            <span>{t.closeModalQuit || 'Quit'}</span>
          </button>

          <button className="close-modal-btn tray" onClick={() => onClose('tray', remember)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            <span>{t.closeModalTray || 'Minimize to Tray'}</span>
          </button>
        </div>

        <label className="remember-checkbox">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>{t.closeModalRemember || 'Remember my choice'}</span>
        </label>

        <button className="close-modal-cancel" onClick={onCancel}>
          {t.closeModalCancel || 'Cancel'}
        </button>
      </div>

      <style>{`
        .close-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }

        .close-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          min-width: 320px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .close-modal h3 {
          margin: 0 0 20px 0;
          text-align: center;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .close-modal-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .close-modal-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #ccc;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
        }

        .close-modal-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .close-modal-btn.quit:hover {
          background: rgba(255, 68, 68, 0.2);
          border-color: rgba(255, 68, 68, 0.4);
          color: #ff6b6b;
        }

        .close-modal-btn.quit:hover svg {
          stroke: #ff6b6b;
        }

        .close-modal-btn.tray:hover {
          background: rgba(0, 255, 136, 0.15);
          border-color: rgba(0, 255, 136, 0.4);
          color: #00ff88;
        }

        .close-modal-btn.tray:hover svg {
          stroke: #00ff88;
        }

        .remember-checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
          cursor: pointer;
          font-size: 12px;
          color: #888;
        }

        .remember-checkbox input {
          width: 16px;
          height: 16px;
          accent-color: #00ffff;
          cursor: pointer;
        }

        .remember-checkbox:hover {
          color: #aaa;
        }

        .close-modal-cancel {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #888;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-modal-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ccc;
        }
      `}</style>
    </div>
  )
}
