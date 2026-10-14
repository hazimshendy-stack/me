import { useState } from 'react';
import type { ActiveProject, AppState, Settings } from '../domain/types';
import { toCSV, toJSON, download, parseImport } from '../utils/export';

export interface SettingsProps {
  open: boolean;
  state: AppState;
  onClose: () => void;
  onSaveSettings: (s: Settings) => void;
  onSaveProject: (p: ActiveProject | null) => void;
  onImport: (s: AppState) => void;
  onNotify: (text: string, kind?: 'info' | 'success' | 'error') => void;
}

export function SettingsPanel(p: SettingsProps): JSX.Element | null {
  const [settings, setSettings] = useState<Settings>(p.state.settings);
  const [project, setProject] = useState<ActiveProject | null>(p.state.project);
  const [importText, setImportText] = useState('');

  if (!p.open) return null;

  function save() {
    p.onSaveSettings(settings);
    p.onSaveProject(project);
    p.onClose();
  }

  function doExportJSON() {
    const now = new Date();
    const stamp =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0');
    download('shendy-life-calendar-' + stamp + '.json', toJSON({ ...p.state, settings, project }));
    p.onNotify('تم تصدير نسخة JSON.', 'success');
  }

  function doExportCSV() {
    download('shendy-life-calendar.csv', toCSV(p.state), 'text/csv');
    p.onNotify('تم تصدير ملف CSV.', 'success');
  }

  function doImport() {
    const res = parseImport(importText);
    if (!res.ok || !res.state) {
      p.onNotify(res.error || 'فشل الاستيراد.', 'error');
      return;
    }
    if (!window.confirm('سيتم استبدال البيانات الحالية بالبيانات المستوردة. المتابعة؟')) return;
    p.onImport(res.state);
    setImportText('');
    p.onNotify('تم الاستيراد بنجاح.', 'success');
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="الإعدادات">
      <div className="modal wide">
        <header className="modal-head">
          <h2>الإعدادات</h2>
          <button className="icon-btn" onClick={p.onClose} aria-label="إغلاق">
            ×
          </button>
        </header>
        <div className="modal-body">
          <section className="settings-section">
            <h3>الأهداف الزمنية</h3>
            <div className="field-row">
              <label className="field">
                <span>الله (ساعة/يوم)</span>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={settings.targets.allahHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targets: { ...settings.targets, allahHours: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="field">
                <span>الصحة + الإدارة (ساعة/يوم)</span>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={settings.targets.healthAdminHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targets: { ...settings.targets, healthAdminHours: Number(e.target.value) },
                    })
                  }
                />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>العلم (ساعة/يوم)</span>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={settings.targets.scienceHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targets: { ...settings.targets, scienceHours: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="field">
                <span>العمل (ساعة/يوم)</span>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={settings.targets.workHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targets: { ...settings.targets, workHours: Number(e.target.value) },
                    })
                  }
                />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Shendy+ (دقيقة/يوم)</span>
                <input
                  type="number"
                  step="5"
                  min={0}
                  value={settings.targets.shendyPlusMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targets: { ...settings.targets, shendyPlusMinutes: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="field">
                <span>Explore (دقيقة/يوم)</span>
                <input
                  type="number"
                  step="5"
                  min={0}
                  value={settings.targets.exploreMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targets: { ...settings.targets, exploreMinutes: Number(e.target.value) },
                    })
                  }
                />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>الكلية (ساعة/يوم — افتراضي)</span>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={settings.targets.collegeHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targets: { ...settings.targets, collegeHours: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="field">
                <span>المشاريع (ساعة/يوم، هدف ممتد)</span>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={settings.targets.projectHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targets: { ...settings.targets, projectHours: Number(e.target.value) },
                    })
                  }
                />
              </label>
            </div>
          </section>

          <section className="settings-section">
            <h3>دورة A/B/C</h3>
            <label className="field">
              <span>أسبوع البداية</span>
              <select
                value={settings.cycleStart}
                onChange={(e) =>
                  setSettings({ ...settings, cycleStart: e.target.value as Settings['cycleStart'] })
                }
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </label>
            <label className="field">
              <span>ربط الإنجليزية بمادة</span>
              <input
                value={settings.englishPairing}
                onChange={(e) => setSettings({ ...settings, englishPairing: e.target.value })}
              />
            </label>
            <label className="field checkbox">
              <input
                type="checkbox"
                checked={settings.showBudgetWarnings}
                onChange={(e) => setSettings({ ...settings, showBudgetWarnings: e.target.checked })}
              />
              <span>إظهار تنبيه ميزانية الوقت</span>
            </label>
          </section>

          <section className="settings-section">
            <h3>المشروع النشط (مشروع واحد فقط)</h3>
            <p className="muted small">
              اتركه فارغًا حتى تحدّد المشروع. لا يتم اختراع اسم افتراضي.
            </p>
            <label className="field">
              <span>اسم المشروع</span>
              <input
                value={project?.name || ''}
                onChange={(e) =>
                  setProject({ ...(project || emptyProject()), name: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>وصف مختصر</span>
              <input
                value={project?.description || ''}
                onChange={(e) =>
                  setProject({ ...(project || emptyProject()), description: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>معيار الإكمال</span>
              <input
                value={project?.completionCriteria || ''}
                onChange={(e) =>
                  setProject({ ...(project || emptyProject()), completionCriteria: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>التسليم الأسبوعي</span>
              <input
                value={project?.weeklyDeliverable || ''}
                onChange={(e) =>
                  setProject({ ...(project || emptyProject()), weeklyDeliverable: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>الخطوة التالية</span>
              <input
                value={project?.nextAction || ''}
                onChange={(e) =>
                  setProject({ ...(project || emptyProject()), nextAction: e.target.value })
                }
              />
            </label>
          </section>

          <section className="settings-section">
            <h3>النسخ الاحتياطي والاستيراد</h3>
            <div className="row-actions">
              <button className="btn" onClick={doExportJSON}>
                تصدير JSON
              </button>
              <button className="btn ghost" onClick={doExportCSV}>
                تصدير CSV
              </button>
            </div>
            <label className="field">
              <span>استيراد JSON</span>
              <textarea
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="ألصق محتوى JSON هنا ثم اضغط استيراد"
              />
            </label>
            <button className="btn" onClick={doImport} disabled={!importText.trim()}>
              استيراد
            </button>
          </section>

          <p className="muted small">
            تنبيه: البيانات محفوظة محليًا في متصفحك (localStorage). مسح بيانات المتصفح قد يمحو
            البيانات. صدّر نسخة احتياطية دوريًا.
          </p>
        </div>
        <footer className="modal-foot">
          <div className="spacer" />
          <button className="btn ghost" onClick={p.onClose}>
            إلغاء
          </button>
          <button className="btn primary" onClick={save}>
            حفظ الإعدادات
          </button>
        </footer>
      </div>
    </div>
  );
}

function emptyProject(): ActiveProject {
  return {
    name: '',
    description: '',
    completionCriteria: '',
    weeklyDeliverable: '',
    nextAction: '',
  };
}
