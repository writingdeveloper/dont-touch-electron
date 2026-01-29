import { useLanguage } from '../i18n/LanguageContext'

interface AboutModalProps {
  onClose: () => void
}

const GITHUB_URL = 'https://github.com/writingdeveloper/dont-touch-electron'

export function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  const openExternal = (url: string) => {
    window.ipcRenderer?.invoke('open-external', url)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="about-header">
          <span className="about-icon">🛡️</span>
          <h2>{t.appTitle}</h2>
          <span className="version">v1.0.0</span>
        </div>

        <div className="about-content">
          <p className="about-desc">
            {t.aboutDescription || 'AI-powered face touch detection app to help overcome habits like trichotillomania and skin picking.'}
          </p>

          <div className="about-section">
            <h4>{t.aboutFeatures || 'Features'}</h4>
            <ul>
              <li>{t.aboutFeature1 || 'Real-time face & hand detection'}</li>
              <li>{t.aboutFeature2 || 'Customizable detection zones'}</li>
              <li>{t.aboutFeature3 || 'Daily statistics & streak tracking'}</li>
              <li>{t.aboutFeature4 || 'Guided meditation'}</li>
            </ul>
          </div>

          <div className="about-section">
            <h4>{t.aboutTech || 'Technology'}</h4>
            <div className="tech-badges">
              <span className="tech-badge">Electron</span>
              <span className="tech-badge">React</span>
              <span className="tech-badge">MediaPipe</span>
              <span className="tech-badge">TypeScript</span>
            </div>
          </div>

          <div className="about-section privacy-section">
            <h4>{t.aboutPrivacy || 'Privacy & Data Protection'}</h4>
            <p className="privacy-text">
              {t.aboutPrivacyText || 'All video processing occurs locally on your device. No images, videos, or personal data are collected, stored, or transmitted to external servers.'}
            </p>
            <div className="privacy-badges">
              <span className="privacy-badge">🔒 {t.aboutLocalOnly || 'Local Processing'}</span>
              <span className="privacy-badge">🛡️ {t.aboutNoData || 'No Data Collection'}</span>
            </div>
            <p className="compliance-text">
              {t.aboutCompliance || 'Compliant with GDPR (EU), CCPA (California), PIPEDA (Canada), and international privacy regulations.'}
            </p>
          </div>

          <div className="about-section opensource-section">
            <h4>{t.aboutOpenSource || 'Open Source'}</h4>
            <p className="opensource-text">
              {t.aboutOpenSourceText || 'This project is open source. View the source code, report issues, or contribute on GitHub.'}
            </p>
          </div>

          <div className="about-footer">
            <p className="copyright">© {currentYear} Don't Touch</p>
            <a
              href={GITHUB_URL}
              className="github-link"
              onClick={(e) => {
                e.preventDefault()
                openExternal(GITHUB_URL)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(8px);
          }

          .about-modal {
            background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(0, 255, 255, 0.15);
            border-radius: 16px;
            width: 400px;
            max-height: 85vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
          }

          .close-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            background: none;
            border: none;
            color: #666;
            font-size: 24px;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
          }

          .about-header {
            text-align: center;
            padding: 28px 24px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .about-icon {
            font-size: 52px;
            display: block;
            margin-bottom: 10px;
          }

          .about-header h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            background: linear-gradient(90deg, #00ffff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .version {
            display: inline-block;
            margin-top: 10px;
            padding: 5px 14px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.25);
            border-radius: 14px;
            font-size: 12px;
            font-weight: 500;
            color: #00ffff;
          }

          .about-content {
            padding: 20px 24px 24px;
          }

          .about-desc {
            font-size: 13px;
            color: #b0b0b0;
            line-height: 1.6;
            margin: 0 0 20px;
            text-align: center;
          }

          .about-section {
            margin-bottom: 18px;
          }

          .about-section h4 {
            margin: 0 0 10px;
            font-size: 11px;
            font-weight: 600;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1.2px;
          }

          .about-section ul {
            margin: 0;
            padding: 0 0 0 18px;
            font-size: 12px;
            color: #ccc;
            line-height: 1.7;
          }

          .about-section li {
            margin-bottom: 4px;
          }

          .tech-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .tech-badge {
            padding: 5px 12px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            color: #aaa;
          }

          .privacy-section {
            background: rgba(0, 255, 136, 0.05);
            border: 1px solid rgba(0, 255, 136, 0.15);
            border-radius: 10px;
            padding: 14px;
          }

          .privacy-section h4 {
            color: #00ff88;
            margin-bottom: 8px;
          }

          .privacy-text {
            font-size: 11px;
            color: #a0a0a0;
            line-height: 1.6;
            margin: 0 0 10px;
          }

          .privacy-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 10px;
          }

          .privacy-badge {
            padding: 4px 10px;
            background: rgba(0, 255, 136, 0.1);
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
            color: #00ff88;
          }

          .compliance-text {
            font-size: 10px;
            color: #777;
            line-height: 1.5;
            margin: 0;
            font-style: italic;
          }

          .opensource-section {
            background: rgba(100, 100, 255, 0.05);
            border: 1px solid rgba(100, 100, 255, 0.15);
            border-radius: 10px;
            padding: 14px;
          }

          .opensource-section h4 {
            color: #8888ff;
          }

          .opensource-text {
            font-size: 11px;
            color: #a0a0a0;
            line-height: 1.6;
            margin: 0;
          }

          .about-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }

          .copyright {
            margin: 0;
            font-size: 11px;
            color: #555;
          }

          .github-link {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #888;
            text-decoration: none;
            font-size: 12px;
            padding: 6px 12px;
            border-radius: 6px;
            transition: all 0.2s;
          }

          .github-link:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
          }
        `}</style>
      </div>
    </div>
  )
}
