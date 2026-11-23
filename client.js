window.__ModuleLoader__.load({
  id: 'dsh-kimi-coding-models',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'settings.kimi-coding-models'
    const ENTRY = 'kimi-coding-models'
    const DEFAULTS = {
      endpoint: 'https://api.kimi.com/coding/v1/models',
      baseURL: 'https://api.kimi.com/coding/v1',
      usageEndpoint: 'https://api.kimi.com/coding/v1/usages',
      apiKeyEnv: 'KIMI_CODING_API_KEY',
      defaultMaxTokens: 32768,
      syncOnStart: false,
    }

    const en = {
      nav: 'Kimi Coding',
      title: 'Kimi Coding models',
      description: 'Check the live Kimi Coding catalog and add newly published models to this profile.',
      check: 'Check for updates',
      checking: 'Checking…',
      sync: 'Sync models now',
      confirmSync: 'Confirm full sync',
      syncWarning: 'Sync replaces the route model list with the live catalog. Models no longer published will be removed.',
      removalWarning: 'This sync will also remove the models listed below. Select Confirm full sync to proceed.',
      syncing: 'Syncing…',
      checkFirst: 'Check the live catalog to see which models this profile is missing. Nothing is written until you sync.',
      upToDate: 'This profile already serves every published model.',
      updateAvailable: 'The live catalog differs from this profile. Review the changes before syncing.',
      synced: 'Model catalog synchronized. The new models are now selectable.',
      models: 'Published models',
      available: 'Available',
      missing: 'Not served',
      added: 'Added',
      removed: 'No longer published',
      checkedAt: 'Checked',
      quota: 'Subscription quota',
      quotaHint: 'Read the current 5-hour rolling window and 7-day subscription quota.',
      refreshQuota: 'Refresh quota',
      refreshingQuota: 'Reading quota…',
      quotaFirst: 'Select Refresh quota to read the latest subscription usage.',
      rollingQuota: '5-hour rolling window',
      weeklyQuota: '7-day quota',
      used: 'used',
      remaining: 'remaining',
      resetsAt: 'Resets',
      membership: 'Membership',
      usageEndpoint: 'Quota endpoint',
      usageEndpointHint: 'HTTP(S) URL returning Kimi Coding subscription usage.',
      settings: 'Synchronization settings',
      settingsHint: 'Changes are saved to this DSH profile.',
      endpoint: 'Catalog endpoint',
      endpointHint: 'HTTP(S) URL returning the OpenAI-compatible model list.',
      baseURL: 'Route base URL',
      baseURLHint: 'Used only when the kimi-coding route does not already declare one.',
      apiKeyEnv: 'Credential reference',
      apiKeyEnvHint: 'Environment-variable name only. Never paste the API key here.',
      defaultMaxTokens: 'Default output tokens',
      defaultMaxTokensHint: 'Used for a newly discovered model whose listing has no output cap.',
      syncOnStart: 'Sync when DSH starts',
      syncOnStartHint: 'Runs once in the background on the next plugin activation.',
      save: 'Save settings',
      saving: 'Saving…',
      discard: 'Discard changes',
      saved: 'Settings saved.',
      saveRejected: 'The profile refused this change. Reload the page and try again.',
      saveConflict: 'Settings changed elsewhere. Review your draft, then save again to overwrite these fields, or discard it.',
      staleResult: 'The previous result is retained and may be out of date.',
      loading: 'Loading settings…',
      unavailable: 'Settings are unavailable in this profile.',
      readOnly: 'This profile is read-only; settings cannot be changed here.',
      overridden: 'Customized',
      invalidUrl: 'Enter a valid HTTP or HTTPS URL.',
      invalidCredentialRef: 'Use an environment-variable name such as KIMI_CODING_API_KEY.',
      invalidTokens: 'Enter a positive whole number.',
      operationFailed: 'The operation failed',
    }
    const zh = {
      nav: 'Kimi Coding',
      title: 'Kimi Coding 模型',
      description: '检查 Kimi Coding 在线目录，把新发布的模型加入当前 profile。',
      check: '检查更新',
      checking: '正在检查…',
      sync: '立即同步模型',
      confirmSync: '确认完整同步',
      syncWarning: '同步会用线上目录替换路由模型列表，线上已下架的模型将被移除。',
      removalWarning: '本次同步还会移除下列模型。确认后继续，请点击“确认完整同步”。',
      syncing: '正在同步…',
      checkFirst: '点击“检查更新”查看当前缺少哪些模型。只有点击同步后才会写入配置。',
      upToDate: '当前 profile 已提供全部线上模型。',
      updateAvailable: '线上目录与当前 profile 存在差异，请检查后再同步。',
      synced: '模型目录已同步，新模型现在可以选择。',
      models: '线上模型',
      available: '已提供',
      missing: '未提供',
      added: '本次新增',
      removed: '线上已下架',
      checkedAt: '检查时间',
      quota: '订阅额度',
      quotaHint: '读取当前 5 小时滚动窗口和 7 天订阅额度。',
      refreshQuota: '刷新额度',
      refreshingQuota: '正在读取额度…',
      quotaFirst: '点击“刷新额度”读取最新订阅用量。',
      rollingQuota: '5 小时滚动窗口',
      weeklyQuota: '7 天额度',
      used: '已用',
      remaining: '剩余',
      resetsAt: '重置时间',
      membership: '会员等级',
      usageEndpoint: '额度接口地址',
      usageEndpointHint: '返回 Kimi Coding 订阅用量的 HTTP(S) 地址。',
      settings: '同步设置',
      settingsHint: '修改会保存到当前 DSH profile。',
      endpoint: '模型目录地址',
      endpointHint: '返回 OpenAI 兼容模型列表的 HTTP(S) 地址。',
      baseURL: '路由 Base URL',
      baseURLHint: '仅在 kimi-coding 路由尚未声明 Base URL 时写入。',
      apiKeyEnv: '凭据变量名',
      apiKeyEnvHint: '只填写环境变量名称，不要在这里粘贴 API Key。',
      defaultMaxTokens: '默认输出 Token 上限',
      defaultMaxTokensHint: '线上目录没有给出输出上限时，用于新发现的模型。',
      syncOnStart: 'DSH 启动时同步',
      syncOnStartHint: '下次插件激活时在后台执行一次同步。',
      save: '保存设置',
      saving: '正在保存…',
      discard: '放弃修改',
      saved: '设置已保存。',
      saveRejected: 'profile 拒绝了这次修改，请刷新后重试。',
      saveConflict: '设置已在其他位置更新。请检查草稿；再次保存将覆盖这些字段，也可以选择放弃修改。',
      staleResult: '下面保留的是上一次结果，可能已经过期。',
      loading: '正在读取设置…',
      unavailable: '当前 profile 无法使用设置服务。',
      readOnly: '当前 profile 为只读，不能在这里修改设置。',
      overridden: '已自定义',
      invalidUrl: '请输入有效的 HTTP 或 HTTPS URL。',
      invalidCredentialRef: '请输入环境变量名称，例如 KIMI_CODING_API_KEY。',
      invalidTokens: '请输入正整数。',
      operationFailed: '操作失败',
    }

    function stringList(value, field) {
      if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
        throw new Error(`Invalid Kimi Coding sync result: ${field}`)
      }
      return [...value]
    }
    function parseSyncResult(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid Kimi Coding sync result')
      }
      if (typeof value.provider !== 'string' || typeof value.endpoint !== 'string'
        || typeof value.checkedAt !== 'string' || !Number.isFinite(Date.parse(value.checkedAt))
        || typeof value.applied !== 'boolean' || typeof value.changed !== 'boolean') {
        throw new Error('Invalid Kimi Coding sync result metadata')
      }
      if (!Array.isArray(value.live)) throw new Error('Invalid Kimi Coding live model list')
      const live = value.live.map((model) => {
        if (model === null || typeof model !== 'object' || Array.isArray(model)
          || typeof model.id !== 'string' || typeof model.name !== 'string') {
          throw new Error('Invalid Kimi Coding live model')
        }
        return { id: model.id, name: model.name }
      })
      return {
        provider: value.provider,
        endpoint: value.endpoint,
        checkedAt: value.checkedAt,
        live,
        served: stringList(value.served, 'served'),
        added: stringList(value.added, 'added'),
        kept: stringList(value.kept, 'kept'),
        removed: stringList(value.removed, 'removed'),
        applied: value.applied,
        changed: value.changed,
      }
    }
    function parseQuotaWindow(value, field) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Invalid Kimi Coding quota ${field}`)
      }
      const result = {}
      for (const key of ['limit', 'used', 'remaining', 'usedPercent']) {
        if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < 0) {
          throw new Error(`Invalid Kimi Coding quota ${field}.${key}`)
        }
        result[key] = value[key]
      }
      if (typeof value.resetAt !== 'string' || !Number.isFinite(Date.parse(value.resetAt))) {
        throw new Error(`Invalid Kimi Coding quota ${field}.resetAt`)
      }
      result.resetAt = value.resetAt
      if (value.durationMinutes !== undefined) {
        if (!Number.isInteger(value.durationMinutes) || value.durationMinutes <= 0) {
          throw new Error(`Invalid Kimi Coding quota ${field}.durationMinutes`)
        }
        result.durationMinutes = value.durationMinutes
      }
      return result
    }
    function parseUsageResult(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)
        || typeof value.checkedAt !== 'string' || !Number.isFinite(Date.parse(value.checkedAt))) {
        throw new Error('Invalid Kimi Coding quota result')
      }
      return {
        checkedAt: value.checkedAt,
        rolling: parseQuotaWindow(value.rolling, 'rolling'),
        weekly: parseQuotaWindow(value.weekly, 'weekly'),
        ...typeof value.membership === 'string' ? { membership: value.membership } : {},
      }
    }
    const usageCodec = {
      mode: 'strict', typeSymbol: 'dsh-kimi-coding-models#UsageResult',
      schema: { parse: parseUsageResult }, create: () => ({ parse: parseUsageResult }),
    }
    const resultCodec = {
      mode: 'strict',
      typeSymbol: 'dsh-kimi-coding-models#SyncResult',
      schema: { parse: parseSyncResult },
      create: () => ({ parse: parseSyncResult }),
    }
    const parseApply = (value) => {
      if (typeof value !== 'boolean') throw new Error('apply must be a boolean')
      return value
    }
    const applyCodec = {
      mode: 'strict',
      typeSymbol: 'dsh-kimi-coding-models#Apply',
      schema: { parse: parseApply },
      create: () => ({ parse: parseApply }),
    }
    const REMOTE = {
      package: 'dsh-kimi-coding-models',
      descriptors: [
        {
          id: 'dsh-kimi-coding-models#kimiCodingModels/read',
          service: 'kimiCodingModels', namespace: 'kimiCodingModels', method: 'read',
          invocation: { kind: 'direct' }, parameters: [],
          cancellation: { parameter: 'signal' }, result: resultCodec,
        },
        {
          id: 'dsh-kimi-coding-models#kimiCodingModels/usage',
          service: 'kimiCodingModels', namespace: 'kimiCodingModels', method: 'usage',
          invocation: { kind: 'direct' }, parameters: [],
          cancellation: { parameter: 'signal' }, result: usageCodec,
        },
        {
          id: 'dsh-kimi-coding-models#kimiCodingModels/sync',
          service: 'kimiCodingModels', namespace: 'kimiCodingModels', method: 'sync',
          invocation: { kind: 'direct' },
          parameters: [{ name: 'apply', wire: 'apply', source: 'json', codec: applyCodec }],
          cancellation: { parameter: 'signal' }, result: resultCodec,
        },
      ],
    }

    const styles = {
      page: { display: 'grid', gap: 20, color: 'var(--dsw-alias-label-primary)', maxWidth: 780 },
      card: {
        display: 'grid', gap: 14, padding: 18, borderRadius: 12,
        border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-card-fill)',
      },
      heading: { margin: 0, fontSize: 16, lineHeight: 1.4, fontWeight: 600 },
      description: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: 13, lineHeight: 1.6 },
      hint: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: 12, lineHeight: 1.55 },
      actions: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
      button: {
        appearance: 'none', border: '1px solid var(--dsw-alias-border-l3)', borderRadius: 8,
        background: 'var(--dsw-alias-button-elevated-fill)', color: 'var(--dsw-alias-label-primary)',
        padding: '8px 13px', font: 'inherit', fontSize: 13, cursor: 'pointer',
      },
      primaryButton: {
        appearance: 'none', border: '1px solid var(--dsw-alias-button-primary-fill)', borderRadius: 8,
        background: 'var(--dsw-alias-button-primary-fill)', color: 'var(--dsw-alias-label-primary-foreground)',
        padding: '8px 13px', font: 'inherit', fontSize: 13, cursor: 'pointer',
      },
      status: { margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--dsw-alias-label-secondary)' },
      error: {
        margin: 0, padding: 10, borderRadius: 8, fontSize: 12, lineHeight: 1.55,
        color: 'var(--dsw-alias-state-error-primary)', background: 'var(--dsw-alias-interactive-bg-hover-danger)',
      },
      modelList: { display: 'grid', borderTop: '1px solid var(--dsw-alias-border-l2)' },
      modelRow: {
        display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', borderBottom: '1px solid var(--dsw-alias-border-l1)', minWidth: 0,
      },
      modelName: { fontSize: 13, fontWeight: 500, overflowWrap: 'anywhere' },
      modelId: { color: 'var(--dsw-alias-label-tertiary)', fontSize: 11, fontFamily: 'monospace', overflowWrap: 'anywhere' },
      badge: {
        flex: 'none', padding: '2px 7px', borderRadius: 6, fontSize: 11,
        color: 'var(--dsw-alias-label-secondary)', background: 'var(--dsw-alias-interactive-bg-hover)',
      },
      quotaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 },
      quotaCard: { display: 'grid', gap: 8, padding: 12, borderRadius: 9, background: 'var(--dsw-alias-interactive-bg-hover)' },
      quotaHead: { display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, fontWeight: 500 },
      progress: { height: 6, borderRadius: 99, overflow: 'hidden', background: 'var(--dsw-alias-bg-skeleton)' },
      progressFill: { height: '100%', borderRadius: 99, background: 'var(--dsw-alias-state-business-primary)' },
      fieldGrid: { display: 'grid', gap: 16 },
      field: { display: 'grid', gap: 6 },
      label: { fontSize: 13, fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' },
      input: {
        boxSizing: 'border-box', width: '100%', border: '1px solid var(--dsw-alias-border-l3)',
        borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)',
        padding: '9px 11px', font: 'inherit', fontSize: 13,
      },
      checkboxRow: { display: 'flex', gap: 10, alignItems: 'flex-start' },
      checkbox: { width: 16, height: 16, margin: '2px 0 0', flex: 'none' },
      footer: { color: 'var(--dsw-alias-label-tertiary)', fontSize: 11 },
    }

    function Button({ primary = false, disabled = false, ...props }) {
      const style = { ...(primary ? styles.primaryButton : styles.button), ...(disabled ? { opacity: 0.5, cursor: 'default' } : {}) }
      return h('button', { ...props, disabled, style })
    }

    function SectionIcon(props) {
      const size = props.size || 18
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
        h('circle', { cx: 12, cy: 12, r: 4, stroke: 'currentColor', strokeWidth: 1.7 }))
    }

    function SyncPanel(props) {
      const { t } = props
      const [state, setState] = React.useState({ busy: null, result: null, error: null, stale: false })
      const [confirmRemoval, setConfirmRemoval] = React.useState(false)
      const mounted = React.useRef(true)
      React.useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false }
      }, [])
      const run = async (kind) => {
        setConfirmRemoval(false)
        setState(previous => ({ ...previous, busy: kind, error: null, stale: false }))
        try {
          const result = kind === 'sync' ? await props.sync() : await props.check()
          if (mounted.current) setState({ busy: null, result, error: null, stale: false })
        } catch (error) {
          if (mounted.current) setState(previous => ({
            ...previous, busy: null, stale: previous.result !== null,
            error: error instanceof Error ? error.message : String(error),
          }))
        }
      }
      const result = state.result
      const busy = state.busy !== null
      const needsConfirmation = result !== null && !result.applied && result.removed.length > 0
      const requestSync = () => {
        if (needsConfirmation && !confirmRemoval) {
          setConfirmRemoval(true)
          return
        }
        void run('sync')
      }
      let summary = t('checkFirst')
      if (result?.applied) summary = t('synced')
      else if (result?.changed) summary = t('updateAvailable')
      else if (result) summary = t('upToDate')
      return h('section', { style: styles.card, 'aria-labelledby': 'kimi-coding-models-title' },
        h('h2', { id: 'kimi-coding-models-title', style: styles.heading }, t('title')),
        h('p', { style: styles.description }, t('description')),
        h('p', { style: styles.hint }, t('syncWarning')),
        h('div', { style: styles.actions },
          h(Button, { type: 'button', disabled: busy, onClick: () => { void run('check') } },
            t(state.busy === 'check' ? 'checking' : 'check')),
          h(Button, {
            type: 'button', primary: true,
            disabled: busy || !result || result.applied || !result.changed, onClick: requestSync,
          }, t(state.busy === 'sync' ? 'syncing' : confirmRemoval ? 'confirmSync' : 'sync'))),
        h('div', { 'aria-live': 'polite' }, h('p', { style: styles.status }, summary)),
        confirmRemoval ? h('p', { role: 'alert', style: styles.error }, t('removalWarning')) : null,
        state.error ? h('p', { role: 'alert', style: styles.error }, `${t('operationFailed')}: ${state.error}`) : null,
        state.stale ? h('p', { style: styles.hint }, t('staleResult')) : null,
        result ? h(React.Fragment, null,
          h('div', { style: styles.footer }, `${t('checkedAt')}: ${new Date(result.checkedAt).toLocaleString(props.getLocale?.())}`),
          result.removed.length > 0 ? h('p', { style: styles.status }, `${t('removed')}: ${result.removed.join(', ')}`) : null,
          h('div', null,
            h('h3', { style: { ...styles.heading, fontSize: 13, marginBottom: 8 } }, `${t('models')} (${result.live.length})`),
            h('div', { style: styles.modelList }, result.live.map((model) => {
              const served = result.served.includes(model.id)
              const added = result.added.includes(model.id)
              const label = added && result.applied ? t('added') : served ? t('available') : t('missing')
              return h('div', { key: model.id, style: styles.modelRow },
                h('div', { style: { minWidth: 0 } },
                  h('div', { style: styles.modelName }, model.name),
                  h('div', { style: styles.modelId }, model.id)),
                h('span', { style: styles.badge }, label))
            })))) : null)
    }

    function QuotaWindow({ t, label, value, getLocale }) {
      const percent = Math.max(0, Math.min(100, value.usedPercent))
      const number = value => Number.isInteger(value) ? String(value) : value.toFixed(1)
      return h('div', { style: styles.quotaCard },
        h('div', { style: styles.quotaHead },
          h('span', null, label),
          h('span', null, `${percent.toFixed(1)}% ${t('used')}`)),
        h('div', {
          style: styles.progress, role: 'progressbar', 'aria-label': label,
          'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(percent * 10) / 10,
        }, h('div', { style: { ...styles.progressFill, width: `${percent}%` } })),
        h('p', { style: styles.status }, `${t('remaining')}: ${number(value.remaining)} / ${number(value.limit)}`),
        h('p', { style: styles.hint }, `${t('resetsAt')}: ${new Date(value.resetAt).toLocaleString(getLocale?.())}`))
    }

    function QuotaPanel(props) {
      const { t } = props
      const [state, setState] = React.useState({ busy: false, result: null, error: null, stale: false })
      const mounted = React.useRef(true)
      React.useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false }
      }, [])
      const refresh = async () => {
        setState(previous => ({ ...previous, busy: true, error: null, stale: false }))
        try {
          const result = await props.usage()
          if (mounted.current) setState({ busy: false, result, error: null, stale: false })
        } catch (error) {
          if (mounted.current) setState(previous => ({
            ...previous, busy: false, stale: previous.result !== null, error: error instanceof Error ? error.message : String(error),
          }))
        }
      }
      const result = state.result
      return h('section', { style: styles.card, 'aria-labelledby': 'kimi-coding-quota-title' },
        h('h2', { id: 'kimi-coding-quota-title', style: styles.heading }, t('quota')),
        h('p', { style: styles.description }, t('quotaHint')),
        h('div', { style: styles.actions }, h(Button, {
          type: 'button', disabled: state.busy, onClick: () => { void refresh() },
        }, t(state.busy ? 'refreshingQuota' : 'refreshQuota'))),
        !result && !state.error ? h('p', { style: styles.status }, t('quotaFirst')) : null,
        state.error ? h('p', { role: 'alert', style: styles.error }, `${t('operationFailed')}: ${state.error}`) : null,
        state.stale ? h('p', { style: styles.hint }, t('staleResult')) : null,
        result ? h(React.Fragment, null,
          h('div', { style: styles.quotaGrid },
            h(QuotaWindow, { t, label: t('rollingQuota'), value: result.rolling, getLocale: props.getLocale }),
            h(QuotaWindow, { t, label: t('weeklyQuota'), value: result.weekly, getLocale: props.getLocale })),
          result.membership ? h('p', { style: styles.status }, `${t('membership')}: ${result.membership}`) : null,
          h('div', { style: styles.footer }, `${t('checkedAt')}: ${new Date(result.checkedAt).toLocaleString(props.getLocale?.())}`)) : null)
    }

    function validUrl(value) {
      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    }

    function SettingsPanel(props) {
      const { form, t } = props
      const snapshot = React.useSyncExternalStore(
        listener => form.subscribe(listener),
        () => form.getSnapshot(),
        () => form.getSnapshot(),
      )
      const [draft, setDraft] = React.useState({})
      const [saveState, setSaveState] = React.useState({ busy: false, error: null, saved: false, field: null })
      const editRevision = React.useRef(null)
      const values = { ...DEFAULTS, ...(snapshot.value ?? {}), ...draft }
      const dirty = Object.keys(draft).length > 0
      const disabled = !snapshot.writable || saveState.busy
      const edit = (field, value) => {
        if (!dirty) editRevision.current = snapshot.revision
        setDraft(previous => ({ ...previous, [field]: value }))
        setSaveState({ busy: false, error: null, saved: false, field: null })
      }
      const save = async () => {
        const next = { ...values }
        for (const field of ['endpoint', 'baseURL', 'usageEndpoint']) next[field] = String(next[field]).trim()
        next.apiKeyEnv = String(next.apiKeyEnv).trim()
        next.defaultMaxTokens = Number(next.defaultMaxTokens)
        let error = null
        let invalidField = null
        if (!validUrl(next.endpoint)) { error = t('invalidUrl'); invalidField = 'endpoint' }
        else if (!validUrl(next.baseURL)) { error = t('invalidUrl'); invalidField = 'baseURL' }
        else if (!validUrl(next.usageEndpoint)) { error = t('invalidUrl'); invalidField = 'usageEndpoint' }
        else if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(next.apiKeyEnv)) { error = t('invalidCredentialRef'); invalidField = 'apiKeyEnv' }
        else if (!Number.isInteger(next.defaultMaxTokens) || next.defaultMaxTokens <= 0) { error = t('invalidTokens'); invalidField = 'defaultMaxTokens' }
        if (error) {
          setSaveState({ busy: false, error, saved: false, field: invalidField })
          return
        }
        setSaveState({ busy: true, error: null, saved: false, field: null })
        try {
          const expectedRevision = editRevision.current ?? snapshot.revision
          const accepted = await form.mutate(Object.keys(draft).map(field => ({
            op: 'set', path: [field], value: next[field],
          })), expectedRevision)
          if (!accepted) {
            // The next click is an explicit overwrite after the conflict notice.
            editRevision.current = form.getSnapshot().revision
            setSaveState({ busy: false, error: t('saveConflict'), saved: false, field: null })
            return
          }
          editRevision.current = null
          setDraft({})
          setSaveState({ busy: false, error: null, saved: true, field: null })
        } catch (cause) {
          setSaveState({ busy: false, error: cause instanceof Error ? cause.message : String(cause), saved: false, field: null })
        }
      }
      const textField = (field) => h('div', { style: styles.field },
        h('label', { style: styles.label, htmlFor: `kimi-coding-${field}` },
          t(field),
          snapshot.user && Object.hasOwn(snapshot.user, field) ? h('span', { style: styles.badge }, t('overridden')) : null),
        h('input', {
          id: `kimi-coding-${field}`, style: styles.input, value: String(values[field]),
          type: field === 'defaultMaxTokens' ? 'number' : 'text', min: field === 'defaultMaxTokens' ? 1 : undefined,
          step: field === 'defaultMaxTokens' ? 1 : undefined, spellCheck: false, disabled,
          'aria-describedby': `kimi-coding-${field}-hint${saveState.field === field ? ' kimi-coding-settings-error' : ''}`,
          'aria-invalid': saveState.field === field || undefined,
          onChange: event => edit(field, event.target.value),
        }),
        h('p', { id: `kimi-coding-${field}-hint`, style: styles.hint }, t(`${field}Hint`)))
      return h('section', { style: styles.card, 'aria-labelledby': 'kimi-coding-settings-title' },
        h('h2', { id: 'kimi-coding-settings-title', style: styles.heading }, t('settings')),
        h('p', { style: styles.description }, t('settingsHint')),
        snapshot.status !== 'ready' ? h('p', { style: styles.status }, t(snapshot.status === 'loading' ? 'loading' : 'unavailable')) : h(React.Fragment, null,
          !snapshot.writable ? h('p', { style: styles.hint }, t('readOnly')) : null,
          h('div', { style: styles.fieldGrid },
            textField('endpoint'), textField('baseURL'), textField('usageEndpoint'), textField('apiKeyEnv'), textField('defaultMaxTokens'),
            h('div', { style: styles.checkboxRow },
              h('input', {
                id: 'kimi-coding-syncOnStart', type: 'checkbox', style: styles.checkbox,
                checked: values.syncOnStart === true, disabled,
                'aria-describedby': 'kimi-coding-syncOnStart-hint',
                onChange: event => edit('syncOnStart', event.target.checked),
              }),
              h('div', null,
                h('label', { htmlFor: 'kimi-coding-syncOnStart', style: styles.label }, t('syncOnStart')),
                h('p', { id: 'kimi-coding-syncOnStart-hint', style: styles.hint }, t('syncOnStartHint'))))),
          h('div', { style: styles.actions },
            h(Button, { type: 'button', primary: true, disabled: disabled || !dirty, onClick: () => { void save() } },
              t(saveState.busy ? 'saving' : 'save')),
            h(Button, {
              type: 'button', disabled: saveState.busy || !dirty,
              onClick: () => { editRevision.current = null; setDraft({}); setSaveState({ busy: false, error: null, saved: false, field: null }) },
            }, t('discard'))),
          h('div', { 'aria-live': 'polite' },
            saveState.error ? h('p', { id: 'kimi-coding-settings-error', role: 'alert', style: styles.error }, saveState.error) : null,
            saveState.saved ? h('p', { style: styles.status }, t('saved')) : null)))
    }

    function KimiCodingSettings(props) {
      return h('div', { style: styles.page },
        h(SyncPanel, props),
        h(QuotaPanel, props),
        h(SettingsPanel, props))
    }

    return {
      inject: ['slots', 'locale', 'remote', 'configForms'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'kimi-coding-models: dictionaries')
        const ready = ctx.remote.$mount(REMOTE)
        ctx.effect(async () => { await ready }, 'kimi-coding-models: remote')
        // A custom Remote namespace must be injected on a child Context after
        // $mount; reading it through this parent ctx throws "without inject".
        ctx.inject(['configForms', 'remote.kimiCodingModels'], (remoteCtx) => {
          const form = remoteCtx.configForms.get(ENTRY)
          const call = async (method, ...args) => {
            await ready
            const result = await remoteCtx.remote.kimiCodingModels[method](...args)
            if (!result.ok) throw result.error
            return result.value
          }
          const injected = () => ({
            form,
            t: remoteCtx.locale.bind(NS),
            getLocale: () => remoteCtx.locale.getLocale().active,
            check: () => call('read'),
            sync: () => call('sync', true),
            usage: () => call('usage'),
          })
          remoteCtx.effect(() => remoteCtx.configForms.whileServed([ENTRY], () => remoteCtx.slots.inject('settings.section', () => remoteCtx.slots.register({
            name: 'settings.section', id: ENTRY, order: 65, locale: NS,
            label: () => remoteCtx.locale.bind(NS)('nav'), inject: injected,
          }, KimiCodingSettings))), 'kimi-coding-models: settings section')
          remoteCtx.effect(() => remoteCtx.configForms.whileServed([ENTRY], () => remoteCtx.slots.inject('settings.section.icon', () => remoteCtx.slots.register({
            name: 'settings.section.icon', id: ENTRY, order: 65, locale: NS,
          }, SectionIcon))), 'kimi-coding-models: settings icon')
        })
      },
    }
  },
})
